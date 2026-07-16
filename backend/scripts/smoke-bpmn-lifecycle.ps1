param(
    [string]$ApiBase = "http://localhost:8090",
    [string]$ProductionCamundaBase = "http://localhost:8080",
    [string]$TestCamundaBase = "http://localhost:8092",
    [string]$DevApiKey = "dev-local-only"
)

$ErrorActionPreference = "Stop"
$backendDir = Split-Path -Parent $PSScriptRoot
$repoDir = Split-Path -Parent $backendDir
$camundaDir = Join-Path $repoDir "infra\camunda"
$jarPath = Join-Path $backendDir "target\qtkhcn-backend.jar"
$java = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME "bin\java.exe" } else {
    (Get-Command java -ErrorAction Stop).Source
}
$apiPort = ([uri]$ApiBase).Port
$processId = "slice_c_lifecycle_smoke"
$runId = [DateTimeOffset]::UtcNow.ToString("yyyyMMddHHmmssfff")
$headers = @{ "X-QTKHCN-Dev-Key" = $DevApiKey; "X-QTKHCN-Actor" = "slice-c-smoke" }
$ownedBackend = $null
$ownedTestEngine = $false
$savedEnvironment = @{}

function Assert-True([bool]$condition, [string]$message) {
    if (-not $condition) { throw $message }
}

function Get-Definitions([string]$baseUrl, [string]$bpmnProcessId) {
    $body = @{ filter = @{ processDefinitionId = $bpmnProcessId }; page = @{ limit = 100 } } |
        ConvertTo-Json -Depth 4
    $response = Invoke-RestMethod -Method Post -Uri "$baseUrl/v2/process-definitions/search" `
        -ContentType "application/json" -Body $body
    return @($response.items | Sort-Object version)
}

function Wait-Url([string]$url, [int]$attempts = 120) {
    for ($attempt = 1; $attempt -le $attempts; $attempt++) {
        try { Invoke-RestMethod -Uri $url | Out-Null; return } catch { Start-Sleep -Milliseconds 500 }
    }
    throw "Endpoint did not become ready: $url"
}

function Wait-Backend {
    for ($attempt = 1; $attempt -le 120; $attempt++) {
        try {
            Invoke-RestMethod -Uri "$ApiBase/api/process-definitions" -Headers $headers | Out-Null
            return
        } catch { Start-Sleep -Milliseconds 500 }
    }
    throw "Backend did not become ready at $ApiBase. Inspect target/smoke-lifecycle-backend.err.log."
}

function Start-OwnedBackend {
    $listener = Get-NetTCPConnection -LocalPort $apiPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Port $apiPort is already in use by PID $($listener.OwningProcess). Stop it before running smoke."
    }
    Remove-Item (Join-Path $backendDir "target\smoke-lifecycle-backend.out.log") -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $backendDir "target\smoke-lifecycle-backend.err.log") -ErrorAction SilentlyContinue
    $script:ownedBackend = Start-Process -FilePath $java -ArgumentList "-jar", $jarPath `
        -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $backendDir "target\smoke-lifecycle-backend.out.log") `
        -RedirectStandardError (Join-Path $backendDir "target\smoke-lifecycle-backend.err.log")
    Wait-Backend
}

function Stop-OwnedBackend {
    if ($script:ownedBackend -and -not $script:ownedBackend.HasExited) {
        Stop-Process -Id $script:ownedBackend.Id
        $script:ownedBackend.WaitForExit(10000) | Out-Null
    }
    $script:ownedBackend = $null
}

function Invoke-Json([string]$method, [string]$uri, $body) {
    return Invoke-RestMethod -Method $method -Uri $uri -Headers $headers -ContentType "application/json" `
        -Body ($body | ConvertTo-Json -Depth 20)
}

function Wait-Session([string]$sessionId, [string]$wanted) {
    for ($attempt = 1; $attempt -le 80; $attempt++) {
        $snapshot = Invoke-RestMethod -Uri "$ApiBase/api/bpmn-tests/$sessionId" -Headers $headers
        if ($wanted -eq "TASK" -and @($snapshot.tasks).Count -gt 0) { return $snapshot }
        if ($snapshot.status -eq $wanted) { return $snapshot }
        if ($snapshot.status -in @("FAILED", "CANCELLED", "TIMED_OUT", "BLOCKED")) {
            throw "Session $sessionId reached $($snapshot.status) while waiting for $wanted."
        }
        Start-Sleep -Milliseconds 500
    }
    throw "Session $sessionId did not reach $wanted in time."
}

function Wait-DefinitionCount([string]$baseUrl, [int]$minimumCount) {
    for ($attempt = 1; $attempt -le 80; $attempt++) {
        $definitions = @(Get-Definitions $baseUrl $processId)
        if ($definitions.Count -ge $minimumCount) { return $definitions }
        Start-Sleep -Milliseconds 500
    }
    throw "Camunda search did not index $minimumCount definition(s) for $processId in time."
}

try {
    Assert-True (Test-Path $jarPath) "Missing $jarPath. Run mvn clean verify first."
    Assert-True (Test-Path $java) "JDK 21 java.exe not found at $java."
    Assert-True (Test-Path (Join-Path $camundaDir "docker-compose.bpmn-test.yml")) `
        "Missing dedicated test-engine compose file under $camundaDir."

    foreach ($container in @("orchestration", "qtkhcn-postgres")) {
        $running = docker inspect -f "{{.State.Running}}" $container 2>$null
        Assert-True ($LASTEXITCODE -eq 0 -and $running -eq "true") `
            "Docker prerequisite '$container' is not running. Start infra/camunda first."
    }
    Wait-Url "http://localhost:9600/actuator/health/status"

    $testRunning = docker inspect -f "{{.State.Running}}" bpmn-test-orchestration 2>$null
    if ($LASTEXITCODE -ne 0 -or $testRunning -ne "true") {
        Push-Location $camundaDir
        try {
            docker compose -f docker-compose.yaml -f docker-compose.override.yml `
                -f docker-compose.bpmn-test.yml up -d bpmn-test-orchestration
            Assert-True ($LASTEXITCODE -eq 0) "Could not start dedicated BPMN test engine."
        } finally { Pop-Location }
        $ownedTestEngine = $true
    }
    Wait-Url "http://localhost:9610/actuator/health/status"

    $beforeProduction = @(Get-Definitions $ProductionCamundaBase $processId)
    $rdBefore = @(Get-Definitions $ProductionCamundaBase "RD01_01")
    $rdLatestBefore = if ($rdBefore.Count) { ($rdBefore | Measure-Object version -Maximum).Maximum } else { 0 }

    foreach ($name in @("QTKHCN_BPMN_TEST_ENABLED", "QTKHCN_BPMN_TEST_GRPC_ADDRESS",
            "QTKHCN_BPMN_TEST_REST_ADDRESS", "SERVER_PORT")) {
        $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, "Process")
    }
    $env:QTKHCN_BPMN_TEST_ENABLED = "true"
    $env:QTKHCN_BPMN_TEST_GRPC_ADDRESS = "http://localhost:26510"
    $env:QTKHCN_BPMN_TEST_REST_ADDRESS = $TestCamundaBase
    $env:SERVER_PORT = [string]$apiPort
    Start-OwnedBackend

    $unauthorized = & curl.exe -sS -o NUL -w "%{http_code}" "$ApiBase/api/bpmn-tests/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    Assert-True ($unauthorized -eq "401") "Missing API key did not return 401 (got $unauthorized)."
    $preflight = @(& curl.exe -sS -i -X OPTIONS "$ApiBase/api/bpmn-tests" `
        -H "Origin: http://localhost:4200" -H "Access-Control-Request-Method: POST" `
        -H "Access-Control-Request-Headers: Content-Type, X-QTKHCN-Dev-Key") -join "`n"
    Assert-True ($preflight -match "HTTP/\S+ 200") "Angular CORS preflight did not return 200."
    Assert-True ($preflight -match "(?i)Access-Control-Allow-Origin: http://localhost:4200") `
        "Angular CORS preflight is missing the allowed-origin header."

    try {
        Invoke-RestMethod -Method Post -Uri "$ApiBase/api/bpmn-tests" -Headers $headers `
            -ContentType "application/json" -Body `
            '{"draftId":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","revision":1,"variables":[1]}' | Out-Null
        throw "Non-object variables unexpectedly succeeded."
    } catch {
        $invalidStatus = [int]$_.Exception.Response.StatusCode
        Assert-True ($invalidStatus -eq 400) "Non-object variables did not return HTTP 400 (got $invalidStatus)."
    }

    $bpmnXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
 xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" targetNamespace="qtkhcn-smoke">
  <!-- repeatable smoke run $runId -->
  <process id="$processId" name="Slice C lifecycle smoke $runId" isExecutable="true">
    <startEvent id="start"/><sequenceFlow id="f1" sourceRef="start" targetRef="review"/>
    <userTask id="review" name="Review smoke"><extensionElements><zeebe:userTask/></extensionElements></userTask>
    <sequenceFlow id="f2" sourceRef="review" targetRef="end"/><endEvent id="end"/>
  </process>
</definitions>
"@
    $draft = Invoke-Json "Post" "$ApiBase/api/process-definition-drafts" @{
        resourceName = "$processId-$runId.bpmn"; bpmnProcessId = $processId
        name = "Slice C lifecycle smoke $runId"; bpmnXml = $bpmnXml
    }
    $validated = Invoke-Json "Post" "$ApiBase/api/process-definition-drafts/$($draft.id)/validate" `
        @{ expectedRevision = $draft.revision }
    Assert-True ($validated.valid -eq $true) "Draft validation failed: $($validated.errors -join '; ')"

    $session = Invoke-Json "Post" "$ApiBase/api/bpmn-tests" @{
        draftId = $draft.id; revision = $validated.revision
        variables = @{ smokeRunId = $runId }; ttlSeconds = 180
    }
    $atTask = Wait-Session ([string]$session.id) "TASK"
    Assert-True ($atTask.correlationId -match '^bpmn-test-') "Test session has no forced correlation id."
    Assert-True ($atTask.variables.smokeRunId -eq $runId) "Initial test variable is missing."
    Assert-True (@(Get-Definitions $ProductionCamundaBase $processId).Count -eq $beforeProduction.Count) `
        "Test session leaked its definition into the production engine."
    Assert-True (@(Get-Definitions $TestCamundaBase $processId).Count -gt 0) `
        "Test definition is missing from the dedicated engine."

    $taskKey = [string]$atTask.tasks[0].key
    Invoke-Json "Post" "$ApiBase/api/bpmn-tests/$($session.id)/tasks/$taskKey/complete" `
        @{ variables = @{ decision = "approve" } } | Out-Null
    $completed = Wait-Session ([string]$session.id) "COMPLETED"
    Assert-True ($completed.status -eq "COMPLETED") "Test session did not complete."

    $published = Invoke-Json "Post" "$ApiBase/api/process-definition-drafts/$($draft.id)/deploy" `
        @{ expectedRevision = $validated.revision }
    $afterDeploy = @(Wait-DefinitionCount $ProductionCamundaBase ($beforeProduction.Count + 1))
    Assert-True ($afterDeploy.Count -eq ($beforeProduction.Count + 1)) `
        "Draft deploy did not add exactly one production definition version."
    Assert-True ([long]$published.camundaProcessDefinitionKey -eq [long]$afterDeploy[-1].processDefinitionKey) `
        "Published definition key does not match the production engine."
    $rdAfterDeploy = @(Get-Definitions $ProductionCamundaBase "RD01_01")
    $rdLatestAfter = if ($rdAfterDeploy.Count) { ($rdAfterDeploy | Measure-Object version -Maximum).Maximum } else { 0 }
    Assert-True ($rdLatestAfter -eq $rdLatestBefore) "Smoke unexpectedly changed production RD01_01."

    Stop-OwnedBackend
    Start-OwnedBackend
    $afterRestart = @(Get-Definitions $ProductionCamundaBase $processId)
    Assert-True ($afterRestart.Count -eq $afterDeploy.Count) "Backend restart created another engine version."
    $draftAfterRestart = Invoke-RestMethod -Uri "$ApiBase/api/process-definition-drafts/$($draft.id)" -Headers $headers
    Assert-True ($draftAfterRestart.status -eq "DEPLOYED") "Draft lost DEPLOYED state after restart."
    Assert-True ($draftAfterRestart.deployedVersionId -eq $published.versionId) `
        "Draft/version correlation changed after restart."

    Write-Host "SMOKE PASS: draft=$($draft.id) revision=$($validated.revision) -> isolated session=$($session.id) COMPLETED -> production version=$($published.version) -> restart unchanged; run=$runId"
} finally {
    Stop-OwnedBackend
    foreach ($name in $savedEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], "Process")
    }
    if ($ownedTestEngine) {
        Push-Location $camundaDir
        try {
            docker compose -f docker-compose.yaml -f docker-compose.override.yml `
                -f docker-compose.bpmn-test.yml stop bpmn-test-orchestration | Out-Null
        } finally { Pop-Location }
    }
}
