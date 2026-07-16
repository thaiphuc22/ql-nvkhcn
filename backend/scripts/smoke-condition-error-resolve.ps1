param(
    [string]$ApiBase = "http://localhost:8091",
    [string]$TestCamundaBase = "http://localhost:8092",
    [string]$DevApiKey = "dev-local-only"
)

# Real-stack smoke for the "Test BPMN UX upgrade" plan (slices 2+3+4): create a draft with a gateway
# missing a default flow, confirm "Kiem tra BPMN" raises the early non-blocking warning (slice 4),
# start a test session that deliberately triggers a CONDITION_ERROR incident, call the new
# resolve-incident API (slice 2: setVariables + resolveIncident) to fix the variable and continue on
# the SAME instance/session (not restarted from scratch), then confirm it completes down the intended
# branch. Does not touch production Camunda (isolated test engine on port 8092/26510 only).

$ErrorActionPreference = "Stop"
$backendDir = Split-Path -Parent $PSScriptRoot
$repoDir = Split-Path -Parent $backendDir
$camundaDir = Join-Path $repoDir "infra\camunda"
$jarPath = Join-Path $backendDir "target\qtkhcn-backend.jar"
$java = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME "bin\java.exe" } else {
    (Get-Command java -ErrorAction Stop).Source
}
$apiPort = ([uri]$ApiBase).Port
$processId = "smoke_condition_error_resolve"
$runId = [DateTimeOffset]::UtcNow.ToString("yyyyMMddHHmmssfff")
$headers = @{ "X-QTKHCN-Dev-Key" = $DevApiKey; "X-QTKHCN-Actor" = "condition-error-resolve-smoke" }
$ownedBackend = $null
$ownedTestEngine = $false
$savedEnvironment = @{}

function Assert-True([bool]$condition, [string]$message) {
    if (-not $condition) { throw $message }
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
            Invoke-RestMethod -Uri "$ApiBase/api/process-definition-drafts" -Headers $headers | Out-Null
            return
        } catch { Start-Sleep -Milliseconds 500 }
    }
    throw "Backend did not become ready at $ApiBase. Inspect target/smoke-condition-error-backend.err.log."
}

function Start-OwnedBackend {
    $listener = Get-NetTCPConnection -LocalPort $apiPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Port $apiPort is already in use by PID $($listener.OwningProcess). Stop it before running smoke."
    }
    Remove-Item (Join-Path $backendDir "target\smoke-condition-error-backend.out.log") -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $backendDir "target\smoke-condition-error-backend.err.log") -ErrorAction SilentlyContinue
    $script:ownedBackend = Start-Process -FilePath $java -ArgumentList "-jar", $jarPath `
        -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $backendDir "target\smoke-condition-error-backend.out.log") `
        -RedirectStandardError (Join-Path $backendDir "target\smoke-condition-error-backend.err.log")
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

function Wait-Incident([string]$sessionId) {
    for ($attempt = 1; $attempt -le 80; $attempt++) {
        $snapshot = Invoke-RestMethod -Uri "$ApiBase/api/bpmn-tests/$sessionId" -Headers $headers
        if (@($snapshot.incidents).Count -gt 0) { return $snapshot }
        if ($snapshot.status -in @("FAILED", "CANCELLED", "TIMED_OUT")) {
            throw "Session $sessionId reached $($snapshot.status) before an incident appeared."
        }
        Start-Sleep -Milliseconds 500
    }
    throw "Session $sessionId did not raise an incident in time."
}

function Wait-Status([string]$sessionId, [string]$wanted) {
    for ($attempt = 1; $attempt -le 80; $attempt++) {
        $snapshot = Invoke-RestMethod -Uri "$ApiBase/api/bpmn-tests/$sessionId" -Headers $headers
        if ($snapshot.status -eq $wanted) { return $snapshot }
        if ($snapshot.status -in @("FAILED", "CANCELLED", "TIMED_OUT")) {
            throw "Session $sessionId reached $($snapshot.status) while waiting for $wanted."
        }
        Start-Sleep -Milliseconds 500
    }
    throw "Session $sessionId did not reach $wanted in time."
}

try {
    Assert-True (Test-Path $jarPath) "Missing $jarPath. Run mvn -o -DskipTests package first."
    Assert-True (Test-Path $java) "JDK 21 java.exe not found at $java."

    foreach ($container in @("orchestration", "qtkhcn-postgres")) {
        $running = docker inspect -f "{{.State.Running}}" $container 2>$null
        Assert-True ($LASTEXITCODE -eq 0 -and $running -eq "true") `
            "Docker prerequisite '$container' is not running. Start infra/camunda first."
    }

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

    foreach ($name in @("QTKHCN_BPMN_TEST_ENABLED", "QTKHCN_BPMN_TEST_GRPC_ADDRESS",
            "QTKHCN_BPMN_TEST_REST_ADDRESS", "SERVER_PORT")) {
        $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, "Process")
    }
    $env:QTKHCN_BPMN_TEST_ENABLED = "true"
    $env:QTKHCN_BPMN_TEST_GRPC_ADDRESS = "http://localhost:26510"
    $env:QTKHCN_BPMN_TEST_REST_ADDRESS = $TestCamundaBase
    $env:SERVER_PORT = [string]$apiPort
    Start-OwnedBackend

    # Gateway_133yb7i deliberately has NO default flow -- reproduces the user's real example
    # (Process_RD0202 r1) to prove slice 4's early warning + slices 2/3's fix-in-place both work.
    $bpmnXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" targetNamespace="qtkhcn-smoke">
  <!-- repeatable smoke run $runId -->
  <process id="$processId" name="Condition error resolve smoke $runId" isExecutable="true">
    <startEvent id="start"/>
    <sequenceFlow id="f1" sourceRef="start" targetRef="Gateway_133yb7i"/>
    <exclusiveGateway id="Gateway_133yb7i" name="Kiem tra ket qua"/>
    <sequenceFlow id="flow-approve" sourceRef="Gateway_133yb7i" targetRef="end-approve">
      <conditionExpression xsi:type="tFormalExpression">=decision = "approve"</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow-reject" sourceRef="Gateway_133yb7i" targetRef="end-reject">
      <conditionExpression xsi:type="tFormalExpression">=decision = "reject"</conditionExpression>
    </sequenceFlow>
    <endEvent id="end-approve"/>
    <endEvent id="end-reject"/>
  </process>
</definitions>
"@
    $draft = Invoke-Json "Post" "$ApiBase/api/process-definition-drafts" @{
        resourceName = "$processId-$runId.bpmn"; bpmnProcessId = $processId
        name = "Condition error resolve smoke $runId"; bpmnXml = $bpmnXml
    }

    # Slice 4: "Kiem tra BPMN" must warn early (non-blocking) because the gateway has 2 outgoing
    # flows but no default flow.
    $validated = Invoke-Json "Post" "$ApiBase/api/process-definition-drafts/$($draft.id)/validate" `
        @{ expectedRevision = $draft.revision }
    Assert-True ($validated.valid -eq $true) "Draft validation unexpectedly failed: $($validated.errors -join '; ')"
    $defaultFlowWarning = @($validated.warnings) | Where-Object { $_ -match "default flow" -and $_ -match "CONDITION_ERROR" }
    Assert-True ($defaultFlowWarning.Count -eq 1) `
        "Expected exactly one missing-default-flow warning, got: $($validated.warnings -join ' | ')"

    # Deliberately do NOT set "decision" when creating the session -> no gateway flow condition
    # matches -> CONDITION_ERROR.
    $session = Invoke-Json "Post" "$ApiBase/api/bpmn-tests" @{
        draftId = $draft.id; revision = $validated.revision
        variables = @{ smokeRunId = $runId }; ttlSeconds = 180
    }
    $originalInstanceKey = $session.processInstanceKey
    Assert-True ($originalInstanceKey -gt 0) "Test session did not start a process instance."

    $withIncident = Wait-Incident ([string]$session.id)
    Assert-True ($withIncident.processInstanceKey -eq $originalInstanceKey) `
        "processInstanceKey changed before resolve -- session was not stable."
    $incident = $withIncident.incidents[0]
    Assert-True ($incident.type -eq "CONDITION_ERROR") "Expected CONDITION_ERROR incident, got $($incident.type)."
    Assert-True ($incident.elementId -eq "Gateway_133yb7i") "Incident is not on the expected gateway."

    # Slices 2/3: fix the variable "in place" via the new resolve-incident API, continuing on the
    # SAME instance (not creating a new one).
    $resolved = Invoke-Json "Post" "$ApiBase/api/bpmn-tests/$($session.id)/incidents/$($incident.key)/resolve" `
        @{ variables = @{ decision = "approve" } }
    Assert-True ($resolved.processInstanceKey -eq $originalInstanceKey) `
        "resolve-incident created/changed the process instance instead of continuing the same one."

    $completed = Wait-Status ([string]$session.id) "COMPLETED"
    Assert-True ($completed.processInstanceKey -eq $originalInstanceKey) `
        "Session completed on a different process instance than the one that raised the incident."
    Assert-True (@($completed.incidents).Count -eq 0) "Incident is still open after resolve+complete."
    Assert-True ($completed.variables.decision -eq "approve") "Resolved variable did not persist to completion."

    Write-Host "SMOKE PASS: draft=$($draft.id) session=$($session.id) instance=$originalInstanceKey incident=$($incident.key) (Gateway_133yb7i CONDITION_ERROR) -> resolve-incident with decision=approve -> COMPLETED via flow-approve, same instance throughout; default-flow warning confirmed at validate time; run=$runId"
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
