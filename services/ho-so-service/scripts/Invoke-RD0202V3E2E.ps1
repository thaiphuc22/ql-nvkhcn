[CmdletBinding()]
param(
    [string]$HoSoBaseUrl = 'http://127.0.0.1:8093',
    [string]$WorkflowBaseUrl = 'http://127.0.0.1:8090',
    [string]$WorkflowDevApiKey = $(if ($env:QTKHCN_DEV_API_KEY) { $env:QTKHCN_DEV_API_KEY } else { 'dev-local-only' }),
    [string]$HoSoServiceToken = $env:QTKHCN_HO_SO_SERVICE_TOKEN,
    [int]$PollTimeoutSeconds = 90,
    [int]$PollIntervalMs = 1000,
    [switch]$KeepData
)

# Real-stack full E2E for RD02.02 v3:
# create TD mission/dossier -> submit -> T01/T02 -> Check/GCheck -> four parallel T03 tasks
# -> T04/T05/T06 -> Generate_HDXD -> all remaining local/enterprise review and approval steps
# -> T33 -> APPROVED. It asserts every user-task definition in the deployed v3 was exercised.
# The script deletes its test mission after process completion unless
# -KeepData is supplied. It never starts/stops services and never touches non-test records.

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($HoSoServiceToken)) {
    throw 'HoSoServiceToken is required (or set QTKHCN_HO_SO_SERVICE_TOKEN).'
}

$runId = [DateTimeOffset]::UtcNow.ToString('yyyyMMddHHmmssfff')
$actor = "rd0202-v3-e2e-$runId"
$hoSoHeaders = @{ Authorization = "Bearer $HoSoServiceToken" }
$mutateHeaders = @{ Authorization = "Bearer $HoSoServiceToken"; 'X-QTKHCN-Actor' = $actor }
$workflowHeaders = @{ 'X-QTKHCN-Dev-Key' = $WorkflowDevApiKey }
$missionId = $null
$dossierId = $null
$instanceClosed = $false
$encounteredTaskKeys = [System.Collections.Generic.HashSet[string]]::new()

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw "ASSERT FAILED: $Message" }
}

function Invoke-Json([string]$Method, [string]$Uri, $Body, [hashtable]$Headers) {
    Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -ContentType 'application/json' `
        -Body ($Body | ConvertTo-Json -Depth 30)
}

function Invoke-FileUpload([string]$Uri, [string]$FilePath, [hashtable]$Headers) {
    # Windows PowerShell 5.1's Invoke-RestMethod has no -Form parameter (PS7+ only), so build the
    # multipart/form-data body by hand.
    $boundary = [guid]::NewGuid().ToString()
    $fileName = [System.IO.Path]::GetFileName($FilePath)
    $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
    $encoding = [System.Text.Encoding]::GetEncoding('ISO-8859-1')
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
        "Content-Type: text/plain",
        "",
        $encoding.GetString($fileBytes),
        "--$boundary--",
        ""
    ) -join "`r`n"
    Invoke-RestMethod -Method Post -Uri $Uri -Headers $Headers `
        -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
}

function Get-Dossier([string]$Id) {
    Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/api/ho-so/$Id" -Headers $hoSoHeaders
}

function Get-DossierTasks([string]$UserId, [string]$Id) {
    $headers = @{ Authorization = "Bearer $HoSoServiceToken"; 'X-QTKHCN-User-Id' = $UserId }
    $all = Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/api/my-tasks" -Headers $headers
    @($all | Where-Object { $_.maHoSo -eq $Id })
}

function Wait-Dossier([scriptblock]$Predicate, [string]$Description) {
    $deadline = (Get-Date).AddSeconds($PollTimeoutSeconds)
    do {
        $current = Get-Dossier $dossierId
        if ($current.trangThai -eq 'START_FAILED') {
            throw "Dossier $dossierId reached START_FAILED."
        }
        if (& $Predicate $current) { return $current }
        Start-Sleep -Milliseconds $PollIntervalMs
    } while ((Get-Date) -lt $deadline)
    throw "Dossier $dossierId did not reach $Description within ${PollTimeoutSeconds}s."
}

function Wait-Tasks([string]$UserId, [string[]]$DefinitionKeys) {
    $deadline = (Get-Date).AddSeconds($PollTimeoutSeconds)
    do {
        $tasks = @(Get-DossierTasks $UserId $dossierId | Where-Object {
            $_.taskDefinitionKey -in $DefinitionKeys
        })
        $actual = @($tasks.taskDefinitionKey | Sort-Object -Unique)
        $expected = @($DefinitionKeys | Sort-Object -Unique)
        if ($tasks.Count -eq $DefinitionKeys.Count -and
                (Compare-Object $expected $actual).Count -eq 0) {
            return $tasks
        }
        Start-Sleep -Milliseconds $PollIntervalMs
    } while ((Get-Date) -lt $deadline)
    throw "Expected tasks [$($DefinitionKeys -join ',')] for $UserId were not all active within ${PollTimeoutSeconds}s."
}

function Invoke-TaskAction(
    $Task,
    [string]$UserId,
    [string]$ActionCode = 'APPROVE_STEP',
    [hashtable]$FormData = @{}
) {
    $headers = @{
        'X-QTKHCN-Dev-Key' = $WorkflowDevApiKey
        'X-QTKHCN-User-Id' = $UserId
    }
    $available = Invoke-RestMethod -Method Get `
        -Uri "$WorkflowBaseUrl/api/tasks/$($Task.taskKey)/available-actions" -Headers $headers
    Assert-True (@($available.actions | Where-Object { $_.actionCode -eq $ActionCode }).Count -eq 1) `
        "Action $ActionCode is unavailable at $($Task.taskDefinitionKey) for $UserId."

    $requestId = [guid]::NewGuid().ToString()
    $result = Invoke-Json 'Post' "$WorkflowBaseUrl/api/tasks/$($Task.taskKey)/actions" @{
        requestId         = $requestId
        taskKey           = [string]$Task.taskKey
        actionCode        = $ActionCode
        comment           = "RD02.02 v3 E2E $ActionCode $($Task.taskDefinitionKey)"
        formData          = $FormData
        expectedTaskState = 'ACTIVE'
    } $headers
    Assert-True ($result.status -eq 'ACCEPTED') `
        "Task action status was $($result.status), expected ACCEPTED."
    [void]$encounteredTaskKeys.Add([string]$Task.taskDefinitionKey)
    Write-Host "PASS action=$ActionCode task=$($Task.taskDefinitionKey) user=$UserId"
}

function Complete-One([string]$DefinitionKey, [string]$UserId, [hashtable]$FormData = @{}) {
    $task = (Wait-Tasks $UserId @($DefinitionKey))[0]
    Invoke-TaskAction $task $UserId 'APPROVE_STEP' $FormData
}

function Complete-Parallel([string[]]$DefinitionKeys, [string]$UserId) {
    $tasks = @(Wait-Tasks $UserId $DefinitionKeys)
    Assert-True ($tasks.Count -eq $DefinitionKeys.Count) `
        "Expected $($DefinitionKeys.Count) parallel tasks, got $($tasks.Count)."
    foreach ($task in $tasks) { Invoke-TaskAction $task $UserId }
}

try {
    Write-Host "RD02.02 v3 E2E run=$runId"

    $health = Invoke-RestMethod -Method Get -Uri "$HoSoBaseUrl/actuator/health/readiness" -TimeoutSec 10
    Assert-True ($health.status -eq 'UP') "ho-so-service readiness is $($health.status)."
    Invoke-RestMethod -Method Get -Uri "$WorkflowBaseUrl/api/process-definitions" `
        -Headers $workflowHeaders -TimeoutSec 10 | Out-Null
    Write-Host 'PASS services ready'

    $mission = Invoke-Json 'Post' "$HoSoBaseUrl/api/nhiem-vu" @{
        ten                = "RD02.02 v3 E2E $runId"
        cap                = 'TD'
        chuNhiemHoTen      = 'Nguyen Van E2E'
        chuNhiemMaNhanVien = "NV-E2E-$runId"
        donViChuTri        = 'Trung tam E2E'
        thoiGianThucHien   = '24 thang'
        duToan             = '15000000000'
    } $mutateHeaders
    $missionId = $mission.ma
    Assert-True (-not [string]::IsNullOrWhiteSpace($missionId)) 'Mission creation returned no ma.'
    Write-Host "PASS create mission ma=$missionId cap=TD"

    $dossier = Invoke-Json 'Post' "$HoSoBaseUrl/api/ho-so" @{
        maNV         = $missionId
        loai         = 'XET_DUYET'
        nguoiKhoiTao = $actor
        ngayTao      = (Get-Date -Format 'yyyy-MM-dd')
    } $mutateHeaders
    $dossierId = $dossier.id
    Assert-True ($dossier.trangThai -eq 'DRAFT') "New dossier status is $($dossier.trangThai), expected DRAFT."
    Write-Host "PASS create dossier id=$dossierId loai=XET_DUYET"

    # Rd0202DefaultConditionService requires at least one evidence document with real stored content
    # (contentType/storageKey/sizeBytes>0) — the dossier's default documents are metadata-only, so
    # Check would otherwise (correctly) fail this dossier back to T02.
    $evidencePath = Join-Path ([System.IO.Path]::GetTempPath()) "rd0202-v3-e2e-$runId.txt"
    Set-Content -Path $evidencePath -Value "HSXD evidence for RD02.02 v3 E2E run $runId" -Encoding ascii
    try {
        Invoke-FileUpload "$HoSoBaseUrl/api/ho-so/$dossierId/documents" $evidencePath $mutateHeaders | Out-Null
    } finally {
        Remove-Item $evidencePath -ErrorAction SilentlyContinue
    }
    Write-Host "PASS upload evidence document for dossier $dossierId"

    $submitted = Invoke-Json 'Post' "$HoSoBaseUrl/api/ho-so/$dossierId/submit" @{
        quyTrinh    = 'RD02.02'
        quyTrinhTen = 'Xet duyet NV KHCN cap Tap doan'
    } $mutateHeaders
    Assert-True ($submitted.trangThai -in @('START_PENDING', 'PROCESSING')) `
        "Submit status is $($submitted.trangThai)."

    $processing = Wait-Dossier { param($value)
        $value.trangThai -eq 'PROCESSING' -and $null -ne $value.zeebeProcessInstanceKey
    } 'PROCESSING with a process instance key'
    $processInstanceKey = [string]$processing.zeebeProcessInstanceKey
    Write-Host "PASS submit processInstanceKey=$processInstanceKey"

    $t01 = (Wait-Tasks 'pm@example.com' @('T01'))[0]
    Invoke-TaskAction $t01 'pm@example.com'
    $t02 = (Wait-Tasks 'pm@example.com' @('T02'))[0]
    Invoke-TaskAction $t02 'pm@example.com'

    # Reaching all four tasks proves the hotfixed Check worker completed, GCheck chose the true branch,
    # and the parallel split was projected back into ho-so-service.
    $t03Keys = @('T03_CQ_KHCN', 'T03_CQ_MS', 'T03_CQ_TCKT', 'T03_CQ_NS')
    $t03Tasks = @(Wait-Tasks 'cqnv@example.com' $t03Keys)
    Assert-True ($t03Tasks.Count -eq 4) "Expected four T03 tasks, got $($t03Tasks.Count)."
    Write-Host "PASS Check/GCheck produced four T03 branches: $($t03Tasks.taskDefinitionKey -join ',')"
    foreach ($task in $t03Tasks) { Invoke-TaskAction $task 'cqnv@example.com' }

    # The currently deployed v3 contains a PM consolidation task after the four specialist branches.
    # Keep this explicit so the smoke follows the engine's deployed contract, not only the working-copy XML.
    $t03Pm = (Wait-Tasks 'pm@example.com' @('T03_PM'))[0]
    Invoke-TaskAction $t03Pm 'pm@example.com'

    $t04 = (Wait-Tasks 'tgd@example.com' @('T04'))[0]
    Invoke-TaskAction $t04 'tgd@example.com'

    $t05 = (Wait-Tasks 'cqnv@example.com' @('T05'))[0]
    $councilForm = @{
        canCuPhapLy = "Quyet dinh E2E $runId"
        danhSachThanhVien = @(
            @{ hoTen = 'Nguyen Van Chu Tich'; vaiTroTrongHoiDong = 'Chu tich' },
            @{ hoTen = 'Tran Thi Phan Bien'; vaiTroTrongHoiDong = 'Phan bien' },
            @{ hoTen = 'Le Van Thu Ky'; vaiTroTrongHoiDong = 'Thu ky' }
        )
    }
    Invoke-TaskAction $t05 'cqnv@example.com' 'APPROVE_STEP' $councilForm

    $t06 = (Wait-Tasks 'tgd@example.com' @('T06'))[0]
    Invoke-TaskAction $t06 'tgd@example.com'

    # T07 can only become active after Generate_HDXD completes successfully.
    $t07 = (Wait-Tasks 'hdkhcn@example.com' @('T07'))[0]
    $generated = Wait-Dossier { param($value)
        @($value.hoiDongXetDuyet).Count -eq 1 -and
        @($value.taiLieu | Where-Object { $_.ten -eq 'QD-thanh-lap-HDXD-co-so.html' }).Count -eq 1
    } 'one generated council and decision document'

    $council = @($generated.hoiDongXetDuyet)[0]
    Assert-True ($council.cap -eq 'CO_SO') "Generated council cap is $($council.cap)."
    Assert-True ($council.sourceTaskDefinitionKey -eq 'T05') `
        "Generated council source is $($council.sourceTaskDefinitionKey)."
    Assert-True (@($council.thanhVien).Count -eq 3) `
        "Generated council has $(@($council.thanhVien).Count) members, expected 3."
    $document = @($generated.taiLieu | Where-Object { $_.ten -eq 'QD-thanh-lap-HDXD-co-so.html' })[0]
    Assert-True ($document.hasContent -eq $true) 'Generated decision document has no stored content.'
    Assert-True ($document.contentType -like 'text/html*') `
        "Generated decision contentType is $($document.contentType)."
    Write-Host "PASS Generate_HDXD councilId=$($council.id) members=3 documentId=$($document.id)"

    Invoke-TaskAction $t07 'hdkhcn@example.com'
    Complete-One 'T08' 'pm@example.com'
    Complete-Parallel @('T09_CQ_KHCN', 'T09_CQ_MS', 'T09_CQ_TCKT', 'T09_CQ_NS') 'cqnv@example.com'
    Complete-One 'T10' 'hdkhcn@example.com'
    Complete-One 'T11' 'pm@example.com'
    Complete-Parallel @('T12_CQ_KHCN', 'T12_CQ_MS', 'T12_CQ_TCKT', 'T12_CQ_NS') 'cqnv@example.com'
    Complete-One 'T13' 'tgd@example.com'

    # The demo identity catalog has no non-admin accounts for GD_TTMS, TP_NS or TP_TCKT.
    # Admin is deliberately limited to those uncovered branches; TP_CLKHCN still uses cqnv.
    $t14Tasks = @(Wait-Tasks 'admin@example.com' @(
        'T14_TP_CLKHCN', 'T14_GD_TTMS', 'T14_TP_NS', 'T14_TP_TCKT'))
    foreach ($task in $t14Tasks) {
        $taskActor = if ($task.taskDefinitionKey -eq 'T14_TP_CLKHCN') { 'cqnv@example.com' } else { 'admin@example.com' }
        Invoke-TaskAction $task $taskActor
    }
    Complete-One 'T15' 'tgd@example.com'
    Complete-One 'T16' 'pm@example.com'
    Complete-One 'T17' 'cqkhcn-td@example.com'
    Complete-Parallel @('T18A', 'T18B') 'cqkhcn-td@example.com'
    Complete-One 'T19' 'cqkhcn-td@example.com'
    Complete-One 'T20' 'btgd-td@example.com'
    Complete-One 'T21' 'hdxd-td@example.com'
    Complete-One 'T22' 'pm@example.com'
    Complete-Parallel @('T23_CQ_KHCN', 'T23_CQ_MS', 'T23_CQ_TCKT', 'T23_CQ_NS') 'cqnv@example.com'
    Complete-One 'T24' 'hdxd-td@example.com'
    Complete-One 'T25' 'pm@example.com'
    Complete-Parallel @('T26_CQ_KHCN', 'T26_CQ_MS', 'T26_CQ_TCKT', 'T26_CQ_NS') 'cqnv@example.com'
    Complete-One 'T27' 'tgd@example.com'

    $t28Tasks = @(Wait-Tasks 'admin@example.com' @(
        'T28_TP_CLKHCN', 'T28_GD_TTMS', 'T28_TP_NS', 'T28_TP_TCKT'))
    foreach ($task in $t28Tasks) {
        $taskActor = if ($task.taskDefinitionKey -eq 'T28_TP_CLKHCN') { 'cqnv@example.com' } else { 'admin@example.com' }
        Invoke-TaskAction $task $taskActor
    }
    Complete-One 'T29' 'tgd@example.com'
    Complete-One 'T30' 'cqkhcn-td@example.com'
    Complete-One 'T31' 'hdkhcn-td@example.com'
    Complete-One 'T32' 'cqkhcn-td@example.com'
    Complete-One 'T33' 'btgd-td@example.com'

    $approved = Wait-Dossier { param($value) $value.trangThai -eq 'APPROVED' } 'APPROVED'
    $instanceClosed = $true
    Assert-True (@(Get-DossierTasks 'admin@example.com' $dossierId).Count -eq 0) `
        'Active tasks remain after completing T33.'

    $expectedTaskKeys = @(
        'T01', 'T02',
        'T03_CQ_KHCN', 'T03_CQ_MS', 'T03_CQ_TCKT', 'T03_CQ_NS', 'T03_PM',
        'T04', 'T05', 'T06', 'T07', 'T08',
        'T09_CQ_KHCN', 'T09_CQ_MS', 'T09_CQ_TCKT', 'T09_CQ_NS',
        'T10', 'T11',
        'T12_CQ_KHCN', 'T12_CQ_MS', 'T12_CQ_TCKT', 'T12_CQ_NS',
        'T13', 'T14_TP_CLKHCN', 'T14_GD_TTMS', 'T14_TP_NS', 'T14_TP_TCKT',
        'T15', 'T16', 'T17', 'T18A', 'T18B', 'T19', 'T20', 'T21', 'T22',
        'T23_CQ_KHCN', 'T23_CQ_MS', 'T23_CQ_TCKT', 'T23_CQ_NS',
        'T24', 'T25',
        'T26_CQ_KHCN', 'T26_CQ_MS', 'T26_CQ_TCKT', 'T26_CQ_NS',
        'T27', 'T28_TP_CLKHCN', 'T28_GD_TTMS', 'T28_TP_NS', 'T28_TP_TCKT',
        'T29', 'T30', 'T31', 'T32', 'T33'
    )
    $missingTaskKeys = @($expectedTaskKeys | Where-Object { -not $encounteredTaskKeys.Contains($_) })
    $unexpectedTaskKeys = @($encounteredTaskKeys | Where-Object { $_ -notin $expectedTaskKeys })
    Assert-True ($missingTaskKeys.Count -eq 0) "Missing exercised tasks: $($missingTaskKeys -join ',')."
    Assert-True ($unexpectedTaskKeys.Count -eq 0) "Unexpected exercised tasks: $($unexpectedTaskKeys -join ',')."
    Assert-True ($encounteredTaskKeys.Count -eq 56) `
        "Expected 56 unique deployed user tasks, exercised $($encounteredTaskKeys.Count)."
    Assert-True ($approved.buocHienTai -ge 56) `
        "Approved dossier buocHienTai=$($approved.buocHienTai), expected at least 56."

    Write-Host ("RD02.02 V3 FULL E2E PASS run=$runId maNV=$missionId dossier=$dossierId " +
        "processInstanceKey=$processInstanceKey finalStatus=APPROVED uniqueTasks=56")
} finally {
    if (-not $KeepData -and $missionId -and $instanceClosed) {
        Invoke-RestMethod -Method Delete -Uri "$HoSoBaseUrl/api/nhiem-vu/$missionId" `
            -Headers $mutateHeaders | Out-Null
        Write-Host "CLEANUP PASS deleted test mission=$missionId (cascade dossier=$dossierId)"
    } elseif (-not $KeepData -and $missionId -and -not $instanceClosed) {
        Write-Warning "Test data was kept because the workflow instance was not closed: mission=$missionId dossier=$dossierId"
    } elseif ($KeepData -and $missionId) {
        Write-Host "KEEP DATA mission=$missionId dossier=$dossierId"
    }
}
