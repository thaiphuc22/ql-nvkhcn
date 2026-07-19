[CmdletBinding()]
param(
    [string]$HoSoBaseUrl = 'http://127.0.0.1:8093',
    [string]$WorkflowBaseUrl = 'http://127.0.0.1:8090',
    [string]$WorkflowDevApiKey = $(if ($env:QTKHCN_DEV_API_KEY) { $env:QTKHCN_DEV_API_KEY } else { 'dev-local-only' }),
    [string]$HoSoServiceToken = $env:QTKHCN_HO_SO_SERVICE_TOKEN,
    [string]$PmUserId = 'pm@example.com',
    [int]$PollTimeoutSeconds = 60,
    [int]$PollIntervalMs = 1000
)

# Real-stack smoke for the complete RD01.01 task-action cutover: create -> submit -> approve Task_1..4
# -> return Task_5 -> verify a new Task_4 -> reject -> dossier REJECTED with no active task. Assumes
# ho-so-service (8093)
# and the workflow backend (8090, Camunda) are ALREADY RUNNING and cut over to talk to each other with
# a shared QTKHCN_WORKFLOW_SERVICE_TOKEN -- this script only calls ho-so-service; it does not start or
# stop any process, matching the read-only-of-topology convention used by Compare-HoSoReadContracts.ps1
# in this same directory. It does not assert against a Camunda-native instance-count endpoint because
# neither service exposes one; "exactly one instance" is asserted indirectly via HoSo.zeebeProcessInstanceKey
# staying stable across polls and matching the processInstanceKey on the single /api/my-tasks task found
# for this dossier.

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($HoSoServiceToken)) {
    throw 'HoSoServiceToken is required (or set QTKHCN_HO_SO_SERVICE_TOKEN). Must match the token ' +
        'ho-so-service was started with (qtkhcn.internal.service-token / QTKHCN_HO_SO_SERVICE_TOKEN).'
}

$runId = [DateTimeOffset]::UtcNow.ToString('yyyyMMddHHmmssfff')
$actor = "e2e-smoke-$runId"
$mutateHeaders = @{ Authorization = "Bearer $HoSoServiceToken"; 'X-QTKHCN-Actor' = $actor }
$readHeaders = @{ Authorization = "Bearer $HoSoServiceToken" }
$myTasksHeaders = @{ Authorization = "Bearer $HoSoServiceToken"; 'X-QTKHCN-User-Id' = $PmUserId }

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw "ASSERT FAILED: $Message" }
}

function Invoke-Json([string]$Method, [string]$Uri, $Body, [hashtable]$Headers) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -ContentType 'application/json' `
        -Body ($Body | ConvertTo-Json -Depth 20)
}

function Wait-Ready([string]$BaseUrl) {
    try {
        Invoke-RestMethod -Method Get -Uri ($BaseUrl.TrimEnd('/') + '/actuator/health') -TimeoutSec 5 | Out-Null
    } catch {
        throw "ho-so-service is not reachable at $BaseUrl (expected it already running on 8093). $_"
    }
}

function Wait-WorkflowReady([string]$BaseUrl) {
    try {
        # This app does not expose an actuator health endpoint. A cheap authenticated catalog read proves
        # that the HTTP filter, Spring context and database-backed API are all ready.
        Invoke-RestMethod -Method Get -Uri ($BaseUrl.TrimEnd('/') + '/api/process-definitions') `
            -Headers @{ 'X-QTKHCN-Dev-Key' = $WorkflowDevApiKey } -TimeoutSec 5 | Out-Null
    } catch {
        throw "workflow backend is not reachable at $BaseUrl (expected it already running on 8090). $_"
    }
}

function Get-DossierTasks([string]$UserId, [string]$DossierId) {
    $headers = @{
        Authorization = "Bearer $HoSoServiceToken"
        'X-QTKHCN-User-Id' = $UserId
    }
    $all = Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/api/my-tasks" -Headers $headers
    return @($all | Where-Object { $_.maHoSo -eq $DossierId })
}

function Wait-Task(
    [string]$UserId,
    [string]$DossierId,
    [string]$TaskDefinitionKey,
    [string]$PreviousTaskKey = ''
) {
    $deadline = (Get-Date).AddSeconds($PollTimeoutSeconds)
    do {
        $matches = @(Get-DossierTasks $UserId $DossierId | Where-Object {
            $_.taskDefinitionKey -eq $TaskDefinitionKey -and
            ([string]::IsNullOrWhiteSpace($PreviousTaskKey) -or $_.taskKey -ne $PreviousTaskKey)
        })
        if ($matches.Count -eq 1) { return $matches[0] }
        if ($matches.Count -gt 1) {
            throw "Expected at most one active $TaskDefinitionKey for HoSo $DossierId, found $($matches.Count)."
        }
        Start-Sleep -Milliseconds $PollIntervalMs
    } while ((Get-Date) -lt $deadline)
    throw "Task $TaskDefinitionKey for HoSo $DossierId and user $UserId did not appear within ${PollTimeoutSeconds}s."
}

function Invoke-WorkflowTaskAction($Task, [string]$UserId, [string]$ActionCode, [string]$Comment) {
    $headers = @{
        'X-QTKHCN-Dev-Key' = $WorkflowDevApiKey
        'X-QTKHCN-User-Id' = $UserId
    }
    $available = Invoke-RestMethod -Method Get `
        -Uri "$WorkflowBaseUrl/api/tasks/$($Task.taskKey)/available-actions" -Headers $headers
    Assert-True ($available.taskKey -eq $Task.taskKey) `
        "Available-actions wrapper returned taskKey=$($available.taskKey), expected $($Task.taskKey)."
    Assert-True (@($available.actions | Where-Object { $_.actionCode -eq $ActionCode }).Count -eq 1) (
        "Action $ActionCode is not available for $($Task.taskDefinitionKey) as $UserId. " +
        "Available: $(@($available.actions).actionCode -join ',').")

    $requestId = [guid]::NewGuid().ToString()
    $result = Invoke-Json 'Post' "$WorkflowBaseUrl/api/tasks/$($Task.taskKey)/actions" @{
        requestId        = $requestId
        taskKey          = [string]$Task.taskKey
        actionCode       = $ActionCode
        comment          = $Comment
        formData         = @{}
        expectedTaskState = 'ACTIVE'
    } $headers
    Assert-True ($result.requestId -eq $requestId) `
        "Action response requestId=$($result.requestId), expected $requestId."
    Assert-True ($result.taskKey -eq $Task.taskKey) `
        "Action response taskKey=$($result.taskKey), expected $($Task.taskKey)."
    Assert-True ($result.status -eq 'ACCEPTED') `
        "Action response status=$($result.status), expected ACCEPTED."
    Write-Host "PASS action=$ActionCode task=$($Task.taskDefinitionKey) taskKey=$($Task.taskKey) user=$UserId"
}

try {
    Write-Host "E2E smoke run=$runId base=$HoSoBaseUrl pmUserId=$PmUserId"
    Wait-Ready $HoSoBaseUrl
    Wait-WorkflowReady $WorkflowBaseUrl

    # 1) Create NhiemVu (mission). cap=CS satisfies RD01.01's cap-in-{CS,TD} start gate
    # (IdempotentProcessStartService), and matches the process name "cap Co so".
    $nhiemVu = Invoke-Json 'Post' "$HoSoBaseUrl/api/nhiem-vu" @{
        ten           = "E2E smoke $runId"
        cap           = 'CS'
        chuNhiemHoTen = 'Nguyen Van Smoke'
        donViChuTri   = 'Trung tam Smoke Test'
    } $mutateHeaders
    Assert-True (-not [string]::IsNullOrWhiteSpace($nhiemVu.ma)) 'NhiemVu creation did not return ma.'
    Write-Host "PASS create NhiemVu ma=$($nhiemVu.ma) cap=$($nhiemVu.cap)"

    # 2) Create HoSo (dossier) draft under that NhiemVu. loai=CHU_TRUONG matches RD01.01's stage.
    $hoSo = Invoke-Json 'Post' "$HoSoBaseUrl/api/ho-so" @{
        maNV         = $nhiemVu.ma
        loai         = 'CHU_TRUONG'
        nguoiKhoiTao = $actor
        ngayTao      = (Get-Date -Format 'yyyy-MM-dd')
    } $mutateHeaders
    $hoSoId = $hoSo.id
    Assert-True (-not [string]::IsNullOrWhiteSpace($hoSoId)) 'HoSo creation did not return id.'
    Assert-True ($hoSo.trangThai -eq 'DRAFT') "Expected new HoSo trangThai=DRAFT, got $($hoSo.trangThai)."
    Write-Host "PASS create HoSo id=$hoSoId trangThai=$($hoSo.trangThai)"

    # 3) Submit for approval -- RD01.01, first user task Task_1 has candidateGroups=PM in the BPMN.
    $submitted = Invoke-Json 'Post' "$HoSoBaseUrl/api/ho-so/$hoSoId/submit" @{
        quyTrinh    = 'RD01.01'
        quyTrinhTen = 'Xet duyet Chu truong cap Co so'
    } $mutateHeaders
    Assert-True ($submitted.trangThai -in @('START_PENDING', 'PROCESSING')) `
        "Expected trangThai START_PENDING or PROCESSING right after submit, got $($submitted.trangThai)."
    Write-Host "PASS submit HoSo id=$hoSoId trangThai=$($submitted.trangThai)"

    # 4) Poll until the outbox dispatcher has pushed the start request to the workflow backend and the
    # workflow-events/inbox/projection path has reflected PROCESSING with a Zeebe process instance key.
    $deadline = (Get-Date).AddSeconds($PollTimeoutSeconds)
    $final = $null
    do {
        $current = Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/api/ho-so/$hoSoId" -Headers $readHeaders
        if ($current.trangThai -eq 'PROCESSING' -and $current.zeebeProcessInstanceKey) { $final = $current; break }
        if ($current.trangThai -eq 'START_FAILED') {
            throw "HoSo $hoSoId reached START_FAILED while polling: $($current | ConvertTo-Json -Depth 10)"
        }
        Start-Sleep -Milliseconds $PollIntervalMs
    } while ((Get-Date) -lt $deadline)
    Assert-True ($null -ne $final) (
        "HoSo $hoSoId did not reach PROCESSING with a zeebeProcessInstanceKey within ${PollTimeoutSeconds}s. " +
        "Check that the workflow backend (8090) is running and that both services share the same " +
        "QTKHCN_WORKFLOW_SERVICE_TOKEN, and inspect ho-so-service's outbox/inbox " +
        "(GET /api/internal-integration/status).")
    $instanceKey = [string]$final.zeebeProcessInstanceKey
    Write-Host "PASS poll HoSo id=$hoSoId trangThai=PROCESSING zeebeProcessInstanceKey=$instanceKey"

    # 5) Re-check the instance key is stable -- guards against a second/duplicate instance racing in.
    Start-Sleep -Milliseconds 500
    $recheck = Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/api/ho-so/$hoSoId" -Headers $readHeaders
    Assert-True ([string]$recheck.zeebeProcessInstanceKey -eq $instanceKey) (
        "zeebeProcessInstanceKey changed between polls ($instanceKey -> $($recheck.zeebeProcessInstanceKey)); " +
        "more than one instance may have started for HoSo $hoSoId.")

    # 6) GET /api/my-tasks as the PM demo identity; assert exactly one active task for this dossier, it
    # is Task_1 (RD01.01's first step), candidate group PM, and its instance matches step 4/5.
    $tasks = @()
    $deadline = (Get-Date).AddSeconds($PollTimeoutSeconds)
    do {
        $all = Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/api/my-tasks" -Headers $myTasksHeaders
        $tasks = @($all | Where-Object { $_.maHoSo -eq $hoSoId })
        if ($tasks.Count -gt 0) { break }
        Start-Sleep -Milliseconds $PollIntervalMs
    } while ((Get-Date) -lt $deadline)

    Assert-True ($tasks.Count -eq 1) (
        "Expected exactly 1 active task for HoSo $hoSoId in /api/my-tasks for $PmUserId, found $($tasks.Count).")
    $task = $tasks[0]
    Assert-True ($task.taskDefinitionKey -eq 'Task_1') `
        "Expected taskDefinitionKey=Task_1 (RD01.01 first step), got $($task.taskDefinitionKey)."
    Assert-True ($task.processInstanceKey -eq $instanceKey) (
        "Task processInstanceKey ($($task.processInstanceKey)) does not match HoSo zeebeProcessInstanceKey " +
        "($instanceKey) -- possible duplicate/mismatched instance.")
    Assert-True (@($task.candidateGroups) -contains 'PM') `
        "Expected candidateGroups to contain PM, got $($task.candidateGroups -join ',')."
    Write-Host ("PASS /api/my-tasks user=$PmUserId maHoSo=$hoSoId taskDefinitionKey=Task_1 " +
        "processInstanceKey=$instanceKey candidateGroups=$($task.candidateGroups -join ',')")

    # 7) Exercise the task-centric API. Tasks 1,2,4 belong to PM; Task_3 belongs to CQ_KHCN;
    # Task_5 belongs to BGD_TT/BGD_KHOI. Each next task is observed only through the 8093 projection.
    Invoke-WorkflowTaskAction $task $PmUserId 'APPROVE_STEP' 'E2E approve Task_1'

    $task2 = Wait-Task $PmUserId $hoSoId 'Task_2'
    Invoke-WorkflowTaskAction $task2 $PmUserId 'APPROVE_STEP' 'E2E approve Task_2'

    $task3 = Wait-Task 'cqnv@example.com' $hoSoId 'Task_3'
    Invoke-WorkflowTaskAction $task3 'cqnv@example.com' 'APPROVE_STEP' 'E2E approve Task_3'

    $task4 = Wait-Task $PmUserId $hoSoId 'Task_4'
    Invoke-WorkflowTaskAction $task4 $PmUserId 'APPROVE_STEP' 'E2E approve Task_4'

    $task5 = Wait-Task 'tgd@example.com' $hoSoId 'Task_5'
    Invoke-WorkflowTaskAction $task5 'tgd@example.com' 'RETURN_STEP' 'E2E return to Task_4'

    # RETURN must create a different runtime task key for the reopened Task_4.
    $reopenedTask4 = Wait-Task $PmUserId $hoSoId 'Task_4' ([string]$task4.taskKey)
    Assert-True ($reopenedTask4.taskKey -ne $task4.taskKey) `
        "RETURN reused old Task_4 key $($task4.taskKey) instead of creating a new task."
    Write-Host "PASS return reopened Task_4 oldKey=$($task4.taskKey) newKey=$($reopenedTask4.taskKey)"
    Invoke-WorkflowTaskAction $reopenedTask4 $PmUserId 'REJECT_STEP' 'E2E reject after return'

    # 8) Final business outcome must be REJECTED (not CANCELLED), and even admin must see no active task.
    $deadline = (Get-Date).AddSeconds($PollTimeoutSeconds)
    $rejected = $null
    do {
        $current = Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/api/ho-so/$hoSoId" -Headers $readHeaders
        $adminTasks = @(Get-DossierTasks 'admin@example.com' $hoSoId)
        if ($current.trangThai -eq 'REJECTED' -and $adminTasks.Count -eq 0) {
            $rejected = $current
            break
        }
        Start-Sleep -Milliseconds $PollIntervalMs
    } while ((Get-Date) -lt $deadline)
    Assert-True ($null -ne $rejected) (
        "HoSo $hoSoId did not reach REJECTED with zero active tasks within ${PollTimeoutSeconds}s.")

    Write-Host ("SMOKE PASS FULL run=$runId maNV=$($nhiemVu.ma) maHoSo=$hoSoId " +
        "processInstanceKey=$instanceKey finalStatus=REJECTED activeTasks=0")
} catch {
    Write-Host "SMOKE FAIL: $($_.Exception.Message)"
    throw
}
