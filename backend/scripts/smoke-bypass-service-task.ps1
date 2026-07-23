param(
    [string]$ApiBase = "http://localhost:8091",
    [string]$DevApiKey = "dev-local-only"
)

# Real-stack smoke for "Bypass Service Task tam thoi" (Test BPMN). Reproduces the real Service Task
# from the user's imported draft Process_RD0202 (RD02.02) that has no production worker yet: B04
# "Kiem tra dieu kien & thanh phan Bo HSXD du thao 1" (zeebe:taskDefinition type=rd0202-check-draft1),
# followed by gateway B05 branching on variable draft1Valid -- same ids/name/type/condition as the
# real draft, minus the ~70 unrelated lanes/parallel branches so the smoke stays deterministic. Proves
# a session that reaches B04 gets BLOCKED (no worker), then the new bypass endpoint completes the job
# manually with a supplied output variable and the instance continues past the gateway. Does not
# touch production Camunda; runs the app via `mvn spring-boot:run` (not the packaged jar) so it never
# collides with the developer's already-running backend on port 8090 (which owns target/qtkhcn-backend.jar).

$ErrorActionPreference = "Stop"
$backendDir = Split-Path -Parent $PSScriptRoot
$apiPort = ([uri]$ApiBase).Port
$processId = "smoke_bypass_service_task"
$runId = [DateTimeOffset]::UtcNow.ToString("yyyyMMddHHmmssfff")
$headers = @{ "X-QTKHCN-Dev-Key" = $DevApiKey; "X-QTKHCN-Actor" = "bypass-service-task-smoke" }
$ownedBackend = $null
$savedEnvironment = @{}

function Assert-True([bool]$condition, [string]$message) {
    if (-not $condition) { throw $message }
}

function Wait-Backend {
    for ($attempt = 1; $attempt -le 180; $attempt++) {
        try {
            Invoke-RestMethod -Uri "$ApiBase/api/process-definition-drafts" -Headers $headers | Out-Null
            return
        } catch { Start-Sleep -Milliseconds 1000 }
    }
    throw "Backend did not become ready at $ApiBase. Inspect target/smoke-bypass-backend.out.log / .err.log."
}

function Start-OwnedBackend {
    $listener = Get-NetTCPConnection -LocalPort $apiPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Port $apiPort is already in use by PID $($listener.OwningProcess). Stop it before running smoke."
    }
    Remove-Item (Join-Path $backendDir "target\smoke-bypass-backend.out.log") -ErrorAction SilentlyContinue
    Remove-Item (Join-Path $backendDir "target\smoke-bypass-backend.err.log") -ErrorAction SilentlyContinue
    # Uses `mvn spring-boot:run` (forked JVM from target/classes), NOT target/qtkhcn-backend.jar --
    # that jar file is locked by the developer's own already-running backend on port 8090.
    $mvnCmd = (Get-Command mvn.cmd -ErrorAction SilentlyContinue)
    if (-not $mvnCmd) { $mvnCmd = (Get-Command mvn -ErrorAction SilentlyContinue) }
    $mvnPath = if ($mvnCmd) { $mvnCmd.Source } else {
        $fallback = "$env:USERPROFILE\apache-maven-3.9.16\bin\mvn.cmd"
        if (Test-Path $fallback) { $fallback } else { throw "mvn not found on PATH and fallback $fallback missing." }
    }
    $script:ownedBackend = Start-Process -FilePath $mvnPath `
        -ArgumentList "-o", "spring-boot:run", "-q" `
        -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $backendDir "target\smoke-bypass-backend.out.log") `
        -RedirectStandardError (Join-Path $backendDir "target\smoke-bypass-backend.err.log")
    Wait-Backend
}

function Stop-OwnedBackend {
    if ($script:ownedBackend -and -not $script:ownedBackend.HasExited) {
        # mvn.cmd forks a child java process; kill the whole tree so the app JVM doesn't linger.
        Start-Process -FilePath "taskkill.exe" -ArgumentList "/PID", $script:ownedBackend.Id, "/T", "/F" `
            -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        $script:ownedBackend.WaitForExit(10000) | Out-Null
    }
    $script:ownedBackend = $null
}

function Invoke-Json([string]$method, [string]$uri, $body) {
    return Invoke-RestMethod -Method $method -Uri $uri -Headers $headers -ContentType "application/json" `
        -Body ($body | ConvertTo-Json -Depth 20)
}

function Wait-Task([string]$sessionId, [string]$elementId) {
    for ($attempt = 1; $attempt -le 80; $attempt++) {
        $snapshot = Invoke-RestMethod -Uri "$ApiBase/api/bpmn-tests/$sessionId" -Headers $headers
        $task = @($snapshot.tasks) | Where-Object { $_.elementId -eq $elementId }
        if ($task) { return $task[0] }
        if ($snapshot.status -in @("FAILED", "CANCELLED", "TIMED_OUT")) {
            throw "Session $sessionId reached $($snapshot.status) before task $elementId appeared."
        }
        Start-Sleep -Milliseconds 500
    }
    throw "Session $sessionId did not reach task $elementId in time."
}

function Wait-BlockedJob([string]$sessionId, [string]$elementId) {
    for ($attempt = 1; $attempt -le 80; $attempt++) {
        $snapshot = Invoke-RestMethod -Uri "$ApiBase/api/bpmn-tests/$sessionId" -Headers $headers
        $job = @($snapshot.blockedJobs) | Where-Object { $_.elementId -eq $elementId }
        if ($job) { return $job[0] }
        if ($snapshot.status -in @("FAILED", "CANCELLED", "TIMED_OUT")) {
            throw "Session $sessionId reached $($snapshot.status) before job $elementId was blocked."
        }
        Start-Sleep -Milliseconds 500
    }
    throw "Session $sessionId did not report job $elementId as blocked in time."
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
    foreach ($container in @("orchestration", "qtkhcn-postgres", "bpmn-test-orchestration")) {
        $running = docker inspect -f "{{.State.Running}}" $container 2>$null
        Assert-True ($LASTEXITCODE -eq 0 -and $running -eq "true") `
            "Docker prerequisite '$container' is not running. Start infra/camunda (incl. docker-compose.bpmn-test.yml) first."
    }

    foreach ($name in @("SERVER_PORT")) { $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, "Process") }
    $env:SERVER_PORT = [string]$apiPort
    Start-OwnedBackend

    # Reproduces the real Process_RD0202 (RD02.02) shape around the un-worked Service Task: B02 (user
    # task) -> Gateway_133yb7i (condition hopLeKhoiTao) -> B03 (user task) -> B04 (service task,
    # zeebe:taskDefinition type=rd0202-check-draft1, same id/name/type as the real draft) -> B05
    # (gateway on draft1Valid, same variable name as the real draft's Flow_006/Flow_007).
    $bpmnXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" targetNamespace="qtkhcn-smoke">
  <!-- repeatable smoke run $runId -->
  <process id="$processId" name="Bypass service task smoke $runId" isExecutable="true">
    <startEvent id="B01"/>
    <sequenceFlow id="Flow_001" sourceRef="B01" targetRef="B02"/>
    <userTask id="B02" name="Khoi tao ho so"><extensionElements><zeebe:userTask/></extensionElements></userTask>
    <sequenceFlow id="Flow_1hpaqyy" sourceRef="B02" targetRef="Gateway_133yb7i"/>
    <exclusiveGateway id="Gateway_133yb7i"/>
    <sequenceFlow id="Flow_003" name="Dat" sourceRef="Gateway_133yb7i" targetRef="B03">
      <conditionExpression xsi:type="tFormalExpression">=hopLeKhoiTao = true</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="Flow_02pwsis" name="Khong dat" sourceRef="Gateway_133yb7i" targetRef="end-invalid">
      <conditionExpression xsi:type="tFormalExpression">=hopLeKhoiTao = false</conditionExpression>
    </sequenceFlow>
    <endEvent id="end-invalid"/>
    <userTask id="B03" name="Xay dung Bo HSXD du thao 1"><extensionElements><zeebe:userTask/></extensionElements></userTask>
    <sequenceFlow id="Flow_004" sourceRef="B03" targetRef="B04"/>
    <serviceTask id="B04" name="Kiem tra dieu kien and thanh phan Bo HSXD du thao 1">
      <extensionElements><zeebe:taskDefinition type="rd0202-check-draft1" retries="3"/></extensionElements>
    </serviceTask>
    <sequenceFlow id="Flow_005" sourceRef="B04" targetRef="B05"/>
    <exclusiveGateway id="B05" default="Flow_007"/>
    <sequenceFlow id="Flow_006" name="Dat" sourceRef="B05" targetRef="end-approved">
      <conditionExpression xsi:type="tFormalExpression">=draft1Valid = true</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="Flow_007" name="Khong dat (Default)" sourceRef="B05" targetRef="B03"/>
    <endEvent id="end-approved"/>
  </process>
</definitions>
"@
    $draft = Invoke-Json "Post" "$ApiBase/api/process-definition-drafts" @{
        resourceName = "$processId-$runId.bpmn"; bpmnProcessId = $processId
        name = "Bypass service task smoke $runId"; bpmnXml = $bpmnXml
    }

    $session = Invoke-Json "Post" "$ApiBase/api/bpmn-tests" @{
        draftId = $draft.id; revision = $draft.revision
        variables = @{ hopLeKhoiTao = $true; smokeRunId = $runId }; ttlSeconds = 180
    }
    $originalInstanceKey = $session.processInstanceKey
    Assert-True ($originalInstanceKey -gt 0) "Test session did not start a process instance."

    $b02 = Wait-Task ([string]$session.id) "B02"
    Invoke-Json "Post" "$ApiBase/api/bpmn-tests/$($session.id)/tasks/$($b02.key)/complete" @{ variables = @{} } | Out-Null

    $b03 = Wait-Task ([string]$session.id) "B03"
    Invoke-Json "Post" "$ApiBase/api/bpmn-tests/$($session.id)/tasks/$($b03.key)/complete" @{ variables = @{} } | Out-Null

    # B04 has zeebe:taskDefinition type=rd0202-check-draft1 -- no worker anywhere in the app for this
    # type, so it must show up as a blocked job (the exact real-world defect being fixed) instead of
    # silently completing.
    $blocked = Wait-BlockedJob ([string]$session.id) "B04"
    Assert-True ($blocked.type -eq "rd0202-check-draft1") "Expected blocked job type rd0202-check-draft1, got $($blocked.type)."
    $blockedSnapshot = Invoke-RestMethod -Uri "$ApiBase/api/bpmn-tests/$($session.id)" -Headers $headers
    Assert-True ($blockedSnapshot.status -eq "BLOCKED") "Session should be BLOCKED while B04 has no worker, was $($blockedSnapshot.status)."
    Assert-True ($blockedSnapshot.processInstanceKey -eq $originalInstanceKey) "processInstanceKey changed while blocked."

    # New endpoint: bypass the blocked job manually with the output the real worker would have
    # produced, same instance throughout. Zeebe's job/element search index is eventually consistent,
    # so don't assert on blockedJobs from this immediate response -- poll status instead (below).
    $bypassed = Invoke-Json "Post" "$ApiBase/api/bpmn-tests/$($session.id)/jobs/$($blocked.key)/bypass" `
        @{ variables = @{ draft1Valid = $true } }
    Assert-True ($bypassed.processInstanceKey -eq $originalInstanceKey) `
        "bypass created/changed the process instance instead of continuing the same one."

    $completed = Wait-Status ([string]$session.id) "COMPLETED"
    Assert-True ($completed.processInstanceKey -eq $originalInstanceKey) `
        "Session completed on a different process instance than the one that was blocked."
    Assert-True ($completed.variables.draft1Valid -eq $true) "Bypassed variable did not persist to completion."

    Write-Host "SMOKE PASS: draft=$($draft.id) session=$($session.id) instance=$originalInstanceKey blocked-job=$($blocked.key) (B04 rd0202-check-draft1, mirrors real Process_RD0202) -> bypass with draft1Valid=true -> COMPLETED via Flow_006, same instance throughout; run=$runId"
} finally {
    Stop-OwnedBackend
    foreach ($name in $savedEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], "Process")
    }
}
