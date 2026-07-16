param(
    [string]$ApiBase = "http://localhost:8090",
    [string]$CamundaBase = "http://localhost:8080",
    [string]$DevApiKey = "dev-local-only"
)

$ErrorActionPreference = "Stop"
$backendDir = Split-Path -Parent $PSScriptRoot
$jarPath = Join-Path $backendDir "target\qtkhcn-backend.jar"
$bpmnPath = Join-Path $backendDir "src\main\resources\processes\rd0101.bpmn"
$java = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME "bin\java.exe" } else {
    (Get-Command java -ErrorAction Stop).Source
}
$apiPort = ([uri]$ApiBase).Port
$processId = "RD01_01"
$headers = @{ "X-QTKHCN-Dev-Key" = $DevApiKey }
$ownedProcess = $null

function Assert-True([bool]$condition, [string]$message) {
    if (-not $condition) { throw $message }
}

function Get-EngineDefinitions {
    $body = @{ filter = @{ processDefinitionId = $processId }; page = @{ limit = 100 } } |
        ConvertTo-Json -Depth 4
    $response = Invoke-RestMethod -Method Post -Uri "$CamundaBase/v2/process-definitions/search" `
        -ContentType "application/json" -Body $body
    return @($response.items | Sort-Object version)
}

function Wait-Backend {
    for ($attempt = 1; $attempt -le 90; $attempt++) {
        try {
            Invoke-RestMethod -Uri "$ApiBase/api/process-definitions" -Headers $headers | Out-Null
            return
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    throw "Backend did not become ready at $ApiBase. Inspect target/smoke-backend.err.log."
}

function Start-OwnedBackend {
    $listener = Get-NetTCPConnection -LocalPort $apiPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Port $apiPort is already in use by PID $($listener.OwningProcess). Stop it before running smoke."
    }
    Remove-Item (Join-Path $backendDir "target\smoke-backend.out.log") -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $backendDir "target\smoke-backend.err.log") -ErrorAction SilentlyContinue
    $script:ownedProcess = Start-Process -FilePath $java -ArgumentList "-jar", $jarPath `
        -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $backendDir "target\smoke-backend.out.log") `
        -RedirectStandardError (Join-Path $backendDir "target\smoke-backend.err.log")
    Wait-Backend
}

function Stop-OwnedBackend {
    if ($script:ownedProcess -and -not $script:ownedProcess.HasExited) {
        Stop-Process -Id $script:ownedProcess.Id
        $script:ownedProcess.WaitForExit(10000) | Out-Null
    }
    $script:ownedProcess = $null
}

try {
    Assert-True (Test-Path $jarPath) "Missing $jarPath. Run mvn verify first."
    Assert-True (Test-Path $bpmnPath) "Missing bundled BPMN at $bpmnPath."
    Assert-True (Test-Path $java) "JDK 21 java.exe not found at $java."

    $requiredContainers = @("orchestration", "qtkhcn-postgres")
    foreach ($container in $requiredContainers) {
        $running = docker inspect -f "{{.State.Running}}" $container 2>$null
        Assert-True ($LASTEXITCODE -eq 0 -and $running -eq "true") `
            "Docker prerequisite '$container' is not running. Start infra/camunda first."
    }
    Invoke-RestMethod -Uri "http://localhost:9600/actuator/health/status" | Out-Null

    $before = @(Get-EngineDefinitions)
    Assert-True ($before.Count -gt 0) `
        "This repeat-run smoke expects bundled $processId to exist; first-boot empty-engine behavior is covered by automated tests."
    $beforeLatest = ($before | Measure-Object version -Maximum).Maximum

    Start-OwnedBackend
    $afterStartup = @(Get-EngineDefinitions)
    Assert-True ($afterStartup.Count -eq $before.Count) "Startup unexpectedly created an engine version."
    Assert-True ((($afterStartup | Measure-Object version -Maximum).Maximum) -eq $beforeLatest) `
        "Startup changed latest engine version."

    $curlOutput = @(& curl.exe -sS -w "`n%{http_code}" -X POST "$ApiBase/api/process-definitions/import" `
        -H "X-QTKHCN-Dev-Key: $DevApiKey" -H "X-QTKHCN-Actor: backend-smoke" `
        -F "file=@$bpmnPath;type=application/xml")
    Assert-True ($LASTEXITCODE -eq 0) "curl import command failed."
    $httpStatus = $curlOutput[-1]
    $json = ($curlOutput[0..($curlOutput.Count - 2)] -join "`n")
    Assert-True ($httpStatus -eq "201") "Import returned HTTP ${httpStatus}: $json"
    $imported = $json | ConvertFrom-Json

    $afterImport = @(Get-EngineDefinitions)
    Assert-True ($afterImport.Count -eq ($before.Count + 1)) "Import did not create exactly one engine version."
    Assert-True ($imported.version -eq ($beforeLatest + 1)) "Import response version is not the next engine version."
    Assert-True ($imported.bpmnProcessId -eq $processId) "Import response has unexpected BPMN process id."

    $sql = "select count(*) from process_definition_version where id='$($imported.versionId)'::uuid and camunda_version=$($imported.version) and camunda_deployment_key=$($imported.camundaDeploymentKey) and camunda_process_definition_key=$($imported.camundaProcessDefinitionKey) and length(bpmn_xml)>0;"
    $dbCount = docker exec qtkhcn-postgres psql -U qtkhcn -d qtkhcn -Atc $sql
    Assert-True ($LASTEXITCODE -eq 0 -and $dbCount.Trim() -eq "1") `
        "PostgreSQL does not contain the correlated imported version/XML."

    $startBody = @{ processDefinitionKey = [string]$imported.camundaProcessDefinitionKey; variables = @{} } |
        ConvertTo-Json -Depth 3
    $instance = Invoke-RestMethod -Method Post -Uri "$CamundaBase/v2/process-instances" `
        -ContentType "application/json" -Body $startBody
    Assert-True ([long]$instance.processDefinitionKey -eq [long]$imported.camundaProcessDefinitionKey) `
        "Camunda process instance did not use the imported definition key."

    Stop-OwnedBackend
    Start-OwnedBackend
    $afterRestart = @(Get-EngineDefinitions)
    Assert-True ($afterRestart.Count -eq $afterImport.Count) "Backend restart created another engine version."
    Assert-True ((($afterRestart | Measure-Object version -Maximum).Maximum) -eq $imported.version) `
        "Latest engine version changed after restart."

    $detail = Invoke-RestMethod -Uri "$ApiBase/api/process-definitions/$($imported.id)" -Headers $headers
    Assert-True ($detail.latestVersion.id -eq $imported.versionId) "Catalog latest version changed after restart."
    Assert-True (-not [string]::IsNullOrWhiteSpace($detail.latestVersion.bpmnXml)) `
        "Persisted BPMN XML is missing after restart."

    Write-Host "SMOKE PASS: startup $beforeLatest -> import $($imported.version) -> restart unchanged; catalog=$($imported.id), definitionKey=$($imported.camundaProcessDefinitionKey), instanceKey=$($instance.processInstanceKey)"
} finally {
    Stop-OwnedBackend
}
