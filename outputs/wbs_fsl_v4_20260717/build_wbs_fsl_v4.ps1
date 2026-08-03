param(
    [string]$FslPath = 'C:\Users\phuctd7\ql-nvkhcn\outputs\functional-scope-list\VHT_Functional_Scope_List_v4.xlsx',
    [string]$OutputPath = 'C:\Users\phuctd7\ql-nvkhcn\outputs\wbs_fsl_v4_20260717\wbs_khcn_fsl_v4_v1.0.xlsx'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputPath) | Out-Null

function OleColor([string]$hex) {
    return [System.Drawing.ColorTranslator]::ToOle([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function SafeText($value) {
    if ($null -eq $value) { return '' }
    return ([string]$value).Trim()
}

function ColumnLetter([int]$column) {
    $result = ''
    while ($column -gt 0) {
        $column--
        $result = [char](65 + ($column % 26)) + $result
        $column = [Math]::Floor($column / 26)
    }
    return $result
}

$primary = OleColor '#17365D'
$secondary = OleColor '#2F75B5'
$lightBlue = OleColor '#D9EAF7'
$softBlue = OleColor '#EAF2F8'
$lightGray = OleColor '#F3F6F8'
$white = OleColor '#FFFFFF'
$darkText = OleColor '#243447'
$green = OleColor '#E2F0D9'
$amber = OleColor '#FFF2CC'
$red = OleColor '#FCE4D6'

$excel = $null
$sourceBook = $null
$workbook = $null
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.ScreenUpdating = $false

    # Read Functional Scope List v4 without modifying it.
    $sourceBook = $excel.Workbooks.Open($FslPath, 0, $true)
    $scopeSheetSource = $sourceBook.Worksheets.Item('01_Functional_Scope')
    $scopeValues = $scopeSheetSource.Range('A5:Q457').Value2
    $scopeHeaders = $scopeSheetSource.Range('A4:Q4').Value2
    $questionSheetSource = $sourceBook.Worksheets.Item('05_Cau_hoi_mo')
    $questionValues = $questionSheetSource.Range('A4:F30').Value2

    $items = @()
    $subsystemOrder = New-Object System.Collections.ArrayList
    $subsystemMap = @{}
    $moduleOrder = New-Object System.Collections.ArrayList
    $moduleMap = @{}
    $featureSeq = @{}

    for ($r = 1; $r -le $scopeValues.GetLength(0); $r++) {
        $featureId = SafeText $scopeValues[$r,2]
        if ([string]::IsNullOrWhiteSpace($featureId)) { continue }
        $subsystem = SafeText $scopeValues[$r,3]
        $module = SafeText $scopeValues[$r,4]
        if (-not $subsystem) { $subsystem = '(Chưa phân hệ)' }
        if (-not $module) { $module = '(Chưa phân module)' }

        if (-not $subsystemMap.ContainsKey($subsystem)) {
            $subsystemIndex = $subsystemMap.Count + 1
            $subsystemMap[$subsystem] = $subsystemIndex
            [void]$subsystemOrder.Add($subsystem)
        }
        $subIndex = [int]$subsystemMap[$subsystem]
        $moduleKey = "$subsystem`u001F$module"
        if (-not $moduleMap.ContainsKey($moduleKey)) {
            $moduleIndex = @($moduleOrder | Where-Object { $_.Subsystem -eq $subsystem }).Count + 1
            $parentId = ('1.{0:D2}.{1:D2}' -f $subIndex,$moduleIndex)
            $moduleMap[$moduleKey] = [pscustomobject]@{ Subsystem=$subsystem; Module=$module; SubIndex=$subIndex; ModuleIndex=$moduleIndex; ParentId=$parentId }
            [void]$moduleOrder.Add($moduleMap[$moduleKey])
            $featureSeq[$moduleKey] = 0
        }
        $featureSeq[$moduleKey] = [int]$featureSeq[$moduleKey] + 1
        $moduleInfo = $moduleMap[$moduleKey]
        $wbsId = ('{0}.{1:D3}' -f $moduleInfo.ParentId,$featureSeq[$moduleKey])

        $items += [pscustomobject]@{
            WbsId = $wbsId
            ParentId = $moduleInfo.ParentId
            STT = SafeText $scopeValues[$r,1]
            FeatureId = $featureId
            Subsystem = $subsystem
            Module = $module
            FunctionGroup = SafeText $scopeValues[$r,5]
            FunctionName = SafeText $scopeValues[$r,6]
            Description = SafeText $scopeValues[$r,7]
            Role = SafeText $scopeValues[$r,8]
            Type = SafeText $scopeValues[$r,9]
            RD = SafeText $scopeValues[$r,10]
            CAP = SafeText $scopeValues[$r,11]
            Priority = SafeText $scopeValues[$r,12]
            Release = SafeText $scopeValues[$r,13]
            ScopeStatus = SafeText $scopeValues[$r,14]
            SourceChange = SafeText $scopeValues[$r,15]
            Acceptance = SafeText $scopeValues[$r,16]
            Requirement = SafeText $scopeValues[$r,17]
        }
    }

    $questions = @()
    for ($r=1; $r -le $questionValues.GetLength(0); $r++) {
        if (-not (SafeText $questionValues[$r,2])) { continue }
        $questions += [pscustomobject]@{
            Group = SafeText $questionValues[$r,1]
            Code = SafeText $questionValues[$r,2]
            Question = SafeText $questionValues[$r,3]
            Proposal = SafeText $questionValues[$r,4]
            Impact = SafeText $questionValues[$r,5]
            SourceStatus = SafeText $questionValues[$r,6]
        }
    }

    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($questionSheetSource) | Out-Null

    if ($items.Count -ne 453) { throw "Expected 453 FSL items, found $($items.Count)." }
    $uniqueIds = @($items.FeatureId | Sort-Object -Unique)
    if ($uniqueIds.Count -ne 453) { throw "Feature ID is not unique: $($uniqueIds.Count)/453." }
    if ($subsystemOrder.Count -ne 19) { throw "Expected 19 subsystems, found $($subsystemOrder.Count)." }

    # Create workbook and sheets in final visible order.
    $workbook = $excel.Workbooks.Add()
    $excel.Calculation = -4135
    while ($workbook.Worksheets.Count -lt 9) { [void]$workbook.Worksheets.Add() }
    $sheetNames = @('Dashboard','WBS','Work Packages','Milestones','CAP Coverage','Dependencies','Gates & Decisions','FSL Source','Lists')
    for ($s=1; $s -le $sheetNames.Count; $s++) { $workbook.Worksheets.Item($s).Name = $sheetNames[$s-1] }

    $dashboard = $workbook.Worksheets.Item('Dashboard')
    $wbsSheet = $workbook.Worksheets.Item('WBS')
    $packageSheet = $workbook.Worksheets.Item('Work Packages')
    $milestoneSheet = $workbook.Worksheets.Item('Milestones')
    $capSheet = $workbook.Worksheets.Item('CAP Coverage')
    $dependencySheet = $workbook.Worksheets.Item('Dependencies')
    $gateSheet = $workbook.Worksheets.Item('Gates & Decisions')
    $listsSheet = $workbook.Worksheets.Item('Lists')

    $placeholderFsl = $workbook.Worksheets.Item('FSL Source')
    $placeholderFsl.Delete()
    $scopeSheetSource.Copy($listsSheet)
    $fslSheet = $workbook.Worksheets.Item($listsSheet.Index - 1)
    $fslSheet.Name = 'FSL Source'
    $fslUsedRange = $fslSheet.UsedRange
    $fslUsedRange.Copy() | Out-Null
    $fslUsedRange.PasteSpecial(-4163) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($fslUsedRange) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($placeholderFsl) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($scopeSheetSource) | Out-Null
    $sourceBook.Close($false)
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($sourceBook) | Out-Null
    $sourceBook = $null

    foreach ($ws in @($dashboard,$wbsSheet,$packageSheet,$milestoneSheet,$capSheet,$dependencySheet,$gateSheet,$fslSheet,$listsSheet)) {
        $ws.Cells.Font.Name = 'Aptos'
        $ws.Cells.Font.Size = 10
        $ws.Activate() | Out-Null
        $excel.ActiveWindow.DisplayGridlines = $false
    }

    function Set-Title($sheet, [string]$rangeAddress, [string]$title, [string]$subtitle='') {
        $sheet.Range($rangeAddress).Merge()
        $anchor = $rangeAddress.Split(':')[0]
        $sheet.Range($anchor).Value2 = $title
        $sheet.Range($rangeAddress).Interior.Color = $primary
        $sheet.Range($rangeAddress).Font.Color = $white
        $sheet.Range($rangeAddress).Font.Bold = $true
        $sheet.Range($rangeAddress).Font.Size = 16
        $sheet.Range($rangeAddress).HorizontalAlignment = -4108
        if ($subtitle) {
            $startCol = ($rangeAddress.Split(':')[0] -replace '\d','')
            $endCol = ($rangeAddress.Split(':')[1] -replace '\d','')
            $sheet.Range("${startCol}2:${endCol}2").Merge()
            $sheet.Range("${startCol}2").Value2 = $subtitle
            $sheet.Range("${startCol}2:${endCol}2").Interior.Color = $softBlue
            $sheet.Range("${startCol}2:${endCol}2").Font.Color = $darkText
            $sheet.Range("${startCol}2:${endCol}2").HorizontalAlignment = -4108
        }
    }

    function Style-Header($range) {
        $range.Interior.Color = $secondary
        $range.Font.Color = $white
        $range.Font.Bold = $true
        $range.WrapText = $true
        $range.HorizontalAlignment = -4108
        $range.VerticalAlignment = -4108
        $range.RowHeight = 34
    }

    # Lists and validation vocabularies.
    $statuses = @('Not Started','In Progress','Blocked','Done','Deferred')
    $priorities = @('Must','Should','Could')
    $releases = @('Pha 1','Pha 2','Pha 3')
    $scopeStatuses = @('Đề xuất trong phạm vi','Cần xác nhận')
    $gateStatuses = @('Open','In Review','Approved','Rejected','Not Applicable')
    $roles = @('Project Manager','Business Analyst','Product Owner','Solution Architect','Tech Lead','Developer','QA Lead','Security','DevOps','Data Owner','Integration Owner')
    $listHeaders = @('Status','Priority','Release','Scope Status','Gate Status','Owner Role')
    for($c=0;$c -lt $listHeaders.Count;$c++){$listsSheet.Cells.Item(1,$c+1).Value2=$listHeaders[$c]}
    $listSets=@($statuses,$priorities,$releases,$scopeStatuses,$gateStatuses,$roles)
    for($c=0;$c -lt $listSets.Count;$c++){for($r=0;$r -lt $listSets[$c].Count;$r++){$listsSheet.Cells.Item($r+2,$c+1).Value2=$listSets[$c][$r]}}
    Style-Header $listsSheet.Range('A1:F1')
    $listsSheet.Columns('A:F').ColumnWidth=24

    # Main WBS leaf work items: one FSL feature = one traceable work item.
    Set-Title $wbsSheet 'A1:AA1' 'WORK BREAKDOWN STRUCTURE — FUNCTIONAL SCOPE LIST V4' '453 leaf work item ánh xạ 1:1 với Feature ID; các cột S–AA là vùng lập kế hoạch có thể cập nhật.'
    $wbsHeaders = @('WBS ID','Parent WBS','Feature ID','Phân hệ','Module','Nhóm chức năng','Work Item','Mô tả / Đầu ra','Vai trò chính','Loại','Quy trình/RD','Capability ID','Priority','Release','Trạng thái phạm vi','Nguồn/Thay đổi','Acceptance / Ghi chú FSL','Requirement/NFR ID','Dependencies','Owner','Effort (person-day)','Duration (workday)','Planned Start','Planned Finish','Status','% Complete','Notes / Evidence')
    for($c=0;$c -lt $wbsHeaders.Count;$c++){$wbsSheet.Cells.Item(4,$c+1).Value2=$wbsHeaders[$c]}
    Style-Header $wbsSheet.Range('A4:AA4')
    $lastWbsRow=4+$items.Count
    $wbsSheet.Range('A5').Formula='=B5&"."&TEXT(COUNTIF($B$5:B5,B5),"000")'
    $wbsSheet.Range('A5:A457').FillDown()
    $wbsSheet.Range('B5').Formula='=IFERROR(INDEX(''Work Packages''!$A$5:$A$200,MATCH(D5&"|"&E5,''Work Packages''!$P$5:$P$200,0)),"")'
    $wbsSheet.Range('B5:B457').FillDown()
    for($destCol=3;$destCol -le 18;$destCol++){
        $sourceCol=ColumnLetter($destCol-1)
        $destLetter=ColumnLetter($destCol)
        $wbsSheet.Range("${destLetter}5").Formula="='FSL Source'!${sourceCol}5"
        $wbsSheet.Range("${destLetter}5:${destLetter}457").FillDown()
    }
    $wbsSheet.Range("Y5:Y$lastWbsRow").Value2='Not Started'
    $wbsSheet.Range("Z5:Z$lastWbsRow").Value2=0
    $wbsSheet.Range("X5:X$lastWbsRow").FormulaR1C1='=IF(OR(RC[-1]="",RC[-2]=""),"",WORKDAY(RC[-1],RC[-2]-1))'
    $wbsSheet.Range("U5:V$lastWbsRow").NumberFormat='0.0'
    $wbsSheet.Range("W5:X$lastWbsRow").NumberFormat='yyyy-mm-dd'
    $wbsSheet.Range("Z5:Z$lastWbsRow").NumberFormat='0%'
    $wbsSheet.Range("A5:AA$lastWbsRow").VerticalAlignment=-4160
    $wbsSheet.Range("F5:H$lastWbsRow").WrapText=$true
    $wbsSheet.Range("P5:R$lastWbsRow").WrapText=$true
    $wbsSheet.Range("AA5:AA$lastWbsRow").WrapText=$true
    $wbsTable=$wbsSheet.ListObjects.Add(1,$wbsSheet.Range("A4:AA$lastWbsRow"),$null,1)
    $wbsTable.Name='tblWBSFSLv4';$wbsTable.TableStyle='TableStyleMedium2'
    $wbsSheet.Range("M5:M$lastWbsRow").Validation.Add(3,1,1,'=Lists!$B$2:$B$4')
    $wbsSheet.Range("N5:N$lastWbsRow").Validation.Add(3,1,1,'=Lists!$C$2:$C$4')
    $wbsSheet.Range("O5:O$lastWbsRow").Validation.Add(3,1,1,'=Lists!$D$2:$D$3')
    $wbsSheet.Range("T5:T$lastWbsRow").Validation.Add(3,1,1,'=Lists!$F$2:$F$12')
    $wbsSheet.Range("Y5:Y$lastWbsRow").Validation.Add(3,1,1,'=Lists!$A$2:$A$6')
    $wbsSheet.Range("Z5:Z$lastWbsRow").Validation.Add(2,1,1,'0','1')
    $wbsSheet.Range("Y5:Y$lastWbsRow").FormatConditions.Add(1,3,'="Done"')|Out-Null
    $wbsSheet.Range("Y5:Y$lastWbsRow").FormatConditions.Item(1).Interior.Color=$green
    $wbsSheet.Range("Y5:Y$lastWbsRow").FormatConditions.Add(1,3,'="Blocked"')|Out-Null
    $wbsSheet.Range("Y5:Y$lastWbsRow").FormatConditions.Item(2).Interior.Color=$red
    $wbsSheet.Range("Y5:Y$lastWbsRow").FormatConditions.Add(1,3,'="In Progress"')|Out-Null
    $wbsSheet.Range("Y5:Y$lastWbsRow").FormatConditions.Item(3).Interior.Color=$amber
    $widths=@(15,12,18,28,24,23,34,45,24,14,20,18,11,11,20,24,42,22,22,20,16,16,14,14,14,12,30)
    for($c=0;$c -lt $widths.Count;$c++){$wbsSheet.Columns.Item($c+1).ColumnWidth=$widths[$c]}
    $wbsSheet.Activate()|Out-Null;$excel.ActiveWindow.SplitRow=4;$excel.ActiveWindow.SplitColumn=3;$excel.ActiveWindow.FreezePanes=$true

    # Aggregated work packages by subsystem + module, formulas driven from editable WBS sheet.
    Set-Title $packageSheet 'A1:P1' 'WORK PACKAGES — TỔNG HỢP THEO PHÂN HỆ VÀ MODULE' 'Các số lượng, effort, trạng thái và tiến độ được tính trực tiếp từ sheet WBS.'
    $pkgHeaders=@('Parent WBS','Phân hệ','Module','Tổng work item','Must','Should','Could','Pha 1','Pha 2','Pha 3','Cần xác nhận','Owner','Effort (PD)','Status','% Complete','Lookup Key')
    for($c=0;$c -lt $pkgHeaders.Count;$c++){$packageSheet.Cells.Item(4,$c+1).Value2=$pkgHeaders[$c]}
    Style-Header $packageSheet.Range('A4:P4')
    $pkgRow=5
    foreach($pkg in $moduleOrder){
        $packageSheet.Cells.Item($pkgRow,1).Value2=$pkg.ParentId
        $packageSheet.Cells.Item($pkgRow,2).Value2=$pkg.Subsystem
        $packageSheet.Cells.Item($pkgRow,3).Value2=$pkg.Module
        $packageSheet.Cells.Item($pkgRow,4).Formula=('=COUNTIFS(WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1})' -f $lastWbsRow,$pkgRow)
        $packageSheet.Cells.Item($pkgRow,5).Formula=('=COUNTIFS(WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1},WBS!$M$5:$M${0},"Must")' -f $lastWbsRow,$pkgRow)
        $packageSheet.Cells.Item($pkgRow,6).Formula=('=COUNTIFS(WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1},WBS!$M$5:$M${0},"Should")' -f $lastWbsRow,$pkgRow)
        $packageSheet.Cells.Item($pkgRow,7).Formula=('=COUNTIFS(WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1},WBS!$M$5:$M${0},"Could")' -f $lastWbsRow,$pkgRow)
        for($rel=1;$rel -le 3;$rel++){$packageSheet.Cells.Item($pkgRow,7+$rel).Formula=('=COUNTIFS(WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1},WBS!$N$5:$N${0},"Pha {2}")' -f $lastWbsRow,$pkgRow,$rel)}
        $packageSheet.Cells.Item($pkgRow,11).Formula=('=COUNTIFS(WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1},WBS!$O$5:$O${0},"Cần xác nhận")' -f $lastWbsRow,$pkgRow)
        $packageSheet.Cells.Item($pkgRow,13).Formula=('=SUMIFS(WBS!$U$5:$U${0},WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1})' -f $lastWbsRow,$pkgRow)
        $packageSheet.Cells.Item($pkgRow,14).Formula=('=IF(O{0}=1,"Done",IF(COUNTIFS(WBS!$D$5:$D${1},B{0},WBS!$E$5:$E${1},C{0},WBS!$Y$5:$Y${1},"Blocked")>0,"Blocked",IF(COUNTIFS(WBS!$D$5:$D${1},B{0},WBS!$E$5:$E${1},C{0},WBS!$Y$5:$Y${1},"In Progress")>0,"In Progress","Not Started")))' -f $pkgRow,$lastWbsRow)
        $packageSheet.Cells.Item($pkgRow,15).Formula=('=IFERROR(AVERAGEIFS(WBS!$Z$5:$Z${0},WBS!$D$5:$D${0},B{1},WBS!$E$5:$E${0},C{1}),0)' -f $lastWbsRow,$pkgRow)
        $packageSheet.Cells.Item($pkgRow,16).Formula=('=B{0}&"|"&C{0}' -f $pkgRow)
        $pkgRow++
    }
    $lastPkgRow=$pkgRow-1
    $pkgTable=$packageSheet.ListObjects.Add(1,$packageSheet.Range("A4:P$lastPkgRow"),$null,1);$pkgTable.Name='tblWorkPackages';$pkgTable.TableStyle='TableStyleMedium2'
    $packageSheet.Range("B5:C$lastPkgRow").WrapText=$true;$packageSheet.Range("M5:M$lastPkgRow").NumberFormat='0.0';$packageSheet.Range("O5:O$lastPkgRow").NumberFormat='0%'
    $packageSheet.Range("L5:L$lastPkgRow").Validation.Add(3,1,1,'=Lists!$F$2:$F$12')
    $pkgWidths=@(13,30,28,14,10,10,10,10,10,10,15,20,14,14,12);for($c=0;$c -lt $pkgWidths.Count;$c++){$packageSheet.Columns.Item($c+1).ColumnWidth=$pkgWidths[$c]};$packageSheet.Columns('P').Hidden=$true
    $packageSheet.Activate()|Out-Null;$excel.ActiveWindow.SplitRow=4;$excel.ActiveWindow.SplitColumn=3;$excel.ActiveWindow.FreezePanes=$true

    # Milestones follow the previous WBS form but align with FSL releases.
    Set-Title $milestoneSheet 'A1:H1' 'MILESTONES & QUALITY GATES'
    $milestoneHeaders=@('Milestone','Kết quả','Phạm vi work item','Owner','Planned Date','Status','Actual Date','Evidence')
    for($c=0;$c -lt 8;$c++){$milestoneSheet.Cells.Item(3,$c+1).Value2=$milestoneHeaders[$c]};Style-Header $milestoneSheet.Range('A3:H3')
    $milestones=@(
        @('M0 — FSL v4 Baseline','453 Feature ID được xác nhận và đóng các câu hỏi chặn','Toàn bộ FSL v4','','','Not Started','',''),
        @('M1 — Pha 1 Design Ready','Thiết kế và acceptance criteria Pha 1 được duyệt','Release = Pha 1','','','Not Started','',''),
        @('M2 — Pha 1 Feature Complete','Toàn bộ work item Pha 1 hoàn thành phát triển','Release = Pha 1','','','Not Started','',''),
        @('M3 — Pha 1 SIT Accepted','SIT, security và regression đạt','Release = Pha 1','','','Not Started','',''),
        @('M4 — Pha 1 UAT Accepted','Người dùng nghiệp vụ ký nghiệm thu Pha 1','Release = Pha 1','','','Not Started','',''),
        @('M5 — Pha 1 Go-live','Production release và smoke test đạt','Release = Pha 1','','','Not Started','',''),
        @('M6 — Pha 2 Accepted','Work item Pha 2 và tích hợp nghiệm thu','Release = Pha 2','','','Not Started','',''),
        @('M7 — Pha 3 Accepted','Work item Pha 3 nghiệm thu','Release = Pha 3','','','Not Started','','')
    )
    for($r=0;$r -lt $milestones.Count;$r++){for($c=0;$c -lt 8;$c++){$milestoneSheet.Cells.Item($r+4,$c+1).Value2=$milestones[$r][$c]}}
    $lastMilestoneRow=3+$milestones.Count
    $milestoneTable=$milestoneSheet.ListObjects.Add(1,$milestoneSheet.Range("A3:H$lastMilestoneRow"),$null,1);$milestoneTable.Name='tblMilestones';$milestoneTable.TableStyle='TableStyleMedium2'
    $milestoneSheet.Range("E4:E$lastMilestoneRow").NumberFormat='yyyy-mm-dd';$milestoneSheet.Range("G4:G$lastMilestoneRow").NumberFormat='yyyy-mm-dd';$milestoneSheet.Range("F4:F$lastMilestoneRow").Validation.Add(3,1,1,'=Lists!$A$2:$A$6')
    $mw=@(25,38,25,20,14,14,14,30);for($c=0;$c -lt $mw.Count;$c++){$milestoneSheet.Columns.Item($c+1).ColumnWidth=$mw[$c]};$milestoneSheet.Range("A4:H$lastMilestoneRow").WrapText=$true

    # CAP coverage, formula-driven from WBS.
    Set-Title $capSheet 'A1:K1' 'CAPABILITY COVERAGE — FSL V4' 'Đếm theo chuỗi Capability ID; một feature có thể đóng góp cho nhiều CAP.'
    $capHeaders=@('CAP','BR','Tổng feature','Must','Should','Could','Pha 1','Pha 2','Pha 3','Cần xác nhận','% Complete')
    for($c=0;$c -lt $capHeaders.Count;$c++){$capSheet.Cells.Item(4,$c+1).Value2=$capHeaders[$c]};Style-Header $capSheet.Range('A4:K4')
    for($n=1;$n -le 21;$n++){
        $row=4+$n;$cap=('CAP-{0:D2}' -f $n);$br=('BR-{0:D3}' -f $n)
        $capSheet.Cells.Item($row,1).Value2=$cap;$capSheet.Cells.Item($row,2).Value2=$br
        $capSheet.Cells.Item($row,3).Formula=('=COUNTIF(WBS!$L$5:$L${0},"*"&A{1}&"*")' -f $lastWbsRow,$row)
        $capSheet.Cells.Item($row,4).Formula=('=COUNTIFS(WBS!$L$5:$L${0},"*"&A{1}&"*",WBS!$M$5:$M${0},"Must")' -f $lastWbsRow,$row)
        $capSheet.Cells.Item($row,5).Formula=('=COUNTIFS(WBS!$L$5:$L${0},"*"&A{1}&"*",WBS!$M$5:$M${0},"Should")' -f $lastWbsRow,$row)
        $capSheet.Cells.Item($row,6).Formula=('=COUNTIFS(WBS!$L$5:$L${0},"*"&A{1}&"*",WBS!$M$5:$M${0},"Could")' -f $lastWbsRow,$row)
        for($rel=1;$rel -le 3;$rel++){$capSheet.Cells.Item($row,6+$rel).Formula=('=COUNTIFS(WBS!$L$5:$L${0},"*"&A{1}&"*",WBS!$N$5:$N${0},"Pha {2}")' -f $lastWbsRow,$row,$rel)}
        $capSheet.Cells.Item($row,10).Formula=('=COUNTIFS(WBS!$L$5:$L${0},"*"&A{1}&"*",WBS!$O$5:$O${0},"Cần xác nhận")' -f $lastWbsRow,$row)
        $capSheet.Cells.Item($row,11).Formula=('=IFERROR(SUMPRODUCT((ISNUMBER(SEARCH(A{0},WBS!$L$5:$L${1})))*WBS!$Z$5:$Z${1})/C{0},0)' -f $row,$lastWbsRow)
    }
    $lastCapRow=25;$capTable=$capSheet.ListObjects.Add(1,$capSheet.Range("A4:K$lastCapRow"),$null,1);$capTable.Name='tblCAPCoverage';$capTable.TableStyle='TableStyleMedium2';$capSheet.Range("K5:K$lastCapRow").NumberFormat='0%';$capSheet.Columns('A:B').ColumnWidth=14;$capSheet.Columns('C:K').ColumnWidth=14

    # Dependencies and blockers retained from the accepted WBS form.
    Set-Title $dependencySheet 'A1:F1' 'DEPENDENCIES & BLOCKERS'
    $depHeaders=@('Dependency','Chuỗi ảnh hưởng','Biện pháp quản trị','Owner','Status','Evidence / Decision');for($c=0;$c -lt 6;$c++){$dependencySheet.Cells.Item(3,$c+1).Value2=$depHeaders[$c]};Style-Header $dependencySheet.Range('A3:F3')
    $dependencies=@(
        @('Quyết định A1 về mức tự cấu hình','A1 → Workflow/Admin work item','Chốt trước estimate; nếu chọn T2 phải bổ sung phân hệ Admin và tái baseline WBS','','Open',''),
        @('Quyết định A2 về ký số','A2 → eForm/Ký duyệt/Tích hợp','Xác định hình thức ký và môi trường test trước thiết kế chi tiết','','Open',''),
        @('Thiếu chi tiết RD08, RD10','A4/A5 → work item RD08/RD10','Workshop riêng; không cam kết effort trước sign-off','','Open',''),
        @('Nguồn dữ liệu RD03.06','A3 → Báo cáo/Thực hiện nhiệm vụ','Chốt nhập tay, kéo tích hợp lên Pha 1 hoặc điều chỉnh phạm vi','','Open',''),
        @('Hệ thống đối tác','INT work item → Pha 2','Có owner, contract, sandbox và mock server','','Open',''),
        @('NFR chưa có ngưỡng','C1–C5 → Test/Production readiness','Chốt trước capacity planning và NFR test','','Open',''),
        @('AI on-premise','A7 → CAP-21/REQ-064–068','Tách release/budget; AI không làm chặn quy trình lõi','','Open','')
    )
    for($r=0;$r -lt $dependencies.Count;$r++){for($c=0;$c -lt 6;$c++){$dependencySheet.Cells.Item($r+4,$c+1).Value2=$dependencies[$r][$c]}}
    $lastDepRow=3+$dependencies.Count;$depTable=$dependencySheet.ListObjects.Add(1,$dependencySheet.Range("A3:F$lastDepRow"),$null,1);$depTable.Name='tblDependencies';$depTable.TableStyle='TableStyleMedium2';$dependencySheet.Range("E4:E$lastDepRow").Validation.Add(3,1,1,'=Lists!$E$2:$E$6');$dependencySheet.Range("A4:F$lastDepRow").WrapText=$true
    $dw=@(30,30,48,20,16,32);for($c=0;$c -lt $dw.Count;$c++){$dependencySheet.Columns.Item($c+1).ColumnWidth=$dw[$c]}

    # Open questions copied from FSL v4.
    Set-Title $gateSheet 'A1:J1' 'GATES & OPEN DECISIONS — FSL V4' 'Nguồn: sheet 05_Cau_hoi_mo; cột Disposition Status/Owner/Due Date/Evidence dùng để quản lý xử lý.'
    $gateHeaders=@('Nhóm','Mã','Nội dung cần xác nhận','Phương án/Đề xuất hiện tại','Ảnh hưởng','Trạng thái nguồn','Owner','Disposition Status','Due Date','Decision / Evidence')
    for($c=0;$c -lt 10;$c++){$gateSheet.Cells.Item(4,$c+1).Value2=$gateHeaders[$c]};Style-Header $gateSheet.Range('A4:J4')
    for($i=0;$i -lt $questions.Count;$i++){$q=$questions[$i];$vals=@($q.Group,$q.Code,$q.Question,$q.Proposal,$q.Impact,$q.SourceStatus,'','Open','','');for($c=0;$c -lt 10;$c++){$gateSheet.Cells.Item($i+5,$c+1).Value2=$vals[$c]}}
    $lastGateRow=4+$questions.Count;$gateTable=$gateSheet.ListObjects.Add(1,$gateSheet.Range("A4:J$lastGateRow"),$null,1);$gateTable.Name='tblOpenQuestions';$gateTable.TableStyle='TableStyleMedium2';$gateSheet.Range("G5:G$lastGateRow").Validation.Add(3,1,1,'=Lists!$F$2:$F$12');$gateSheet.Range("H5:H$lastGateRow").Validation.Add(3,1,1,'=Lists!$E$2:$E$6');$gateSheet.Range("I5:I$lastGateRow").NumberFormat='yyyy-mm-dd';$gateSheet.Range("A5:J$lastGateRow").WrapText=$true
    $gw=@(20,10,42,48,12,16,20,18,14,32);for($c=0;$c -lt $gw.Count;$c++){$gateSheet.Columns.Item($c+1).ColumnWidth=$gw[$c]};$gateSheet.Activate()|Out-Null;$excel.ActiveWindow.SplitRow=4;$excel.ActiveWindow.SplitColumn=2;$excel.ActiveWindow.FreezePanes=$true

    # Exact source sheet was copied from FSL v4 for auditability.
    $fslSheet.Activate()|Out-Null;$excel.ActiveWindow.SplitRow=4;$excel.ActiveWindow.SplitColumn=2;$excel.ActiveWindow.FreezePanes=$true

    # Dashboard with formula-driven KPIs and native charts.
    $dashboard.Range('A1:M2').Merge();$dashboard.Range('A1').Value2='WBS DASHBOARD — FUNCTIONAL SCOPE LIST V4';$dashboard.Range('A1:M2').Interior.Color=$primary;$dashboard.Range('A1:M2').Font.Color=$white;$dashboard.Range('A1:M2').Font.Bold=$true;$dashboard.Range('A1:M2').Font.Size=20;$dashboard.Range('A1:M2').HorizontalAlignment=-4108
    $dashboard.Range('A3:M3').Merge();$dashboard.Range('A3').Value2='Nguồn: VHT_Functional_Scope_List_v4.xlsx | 453 Feature ID | 19 phân hệ | Work item leaf truy vết 1:1.';$dashboard.Range('A3:M3').Interior.Color=$softBlue;$dashboard.Range('A3:M3').HorizontalAlignment=-4108
    $cardDefs=@(
        @('A5:B5','A6:B7','Tổng work item',('=COUNTA(WBS!$C$5:$C${0})' -f $lastWbsRow),'0'),
        @('C5:D5','C6:D7','Priority Must',('=COUNTIF(WBS!$M$5:$M${0},"Must")' -f $lastWbsRow),'0'),
        @('E5:F5','E6:F7','Release Pha 1',('=COUNTIF(WBS!$N$5:$N${0},"Pha 1")' -f $lastWbsRow),'0'),
        @('G5:H5','G6:H7','Cần xác nhận',('=COUNTIF(WBS!$O$5:$O${0},"Cần xác nhận")' -f $lastWbsRow),'0'),
        @('I5:J5','I6:J7','Hoàn thành',('=COUNTIF(WBS!$Y$5:$Y${0},"Done")' -f $lastWbsRow),'0'),
        @('K5:M5','K6:M7','Tiến độ trung bình',('=IFERROR(AVERAGE(WBS!$Z$5:$Z${0}),0)' -f $lastWbsRow),'0%')
    )
    foreach($card in $cardDefs){$dashboard.Range($card[0]).Merge();$dashboard.Range($card[0].Split(':')[0]).Value2=$card[2];$dashboard.Range($card[0]).Interior.Color=$secondary;$dashboard.Range($card[0]).Font.Color=$white;$dashboard.Range($card[0]).Font.Bold=$true;$dashboard.Range($card[0]).HorizontalAlignment=-4108;$dashboard.Range($card[1]).Merge();$dashboard.Range($card[1].Split(':')[0]).Formula=$card[3];$dashboard.Range($card[1]).Interior.Color=$lightBlue;$dashboard.Range($card[1]).Font.Bold=$true;$dashboard.Range($card[1]).Font.Size=18;$dashboard.Range($card[1]).HorizontalAlignment=-4108;$dashboard.Range($card[1].Split(':')[0]).NumberFormat=$card[4]}

    $dashboard.Range('A10:B10').Value2=@('Phân hệ','Số work item');Style-Header $dashboard.Range('A10:B10')
    for($i=0;$i -lt $subsystemOrder.Count;$i++){$row=11+$i;$dashboard.Cells.Item($row,1).Value2=$subsystemOrder[$i];$dashboard.Cells.Item($row,2).Formula=('=COUNTIF(WBS!$D$5:$D${0},A{1})' -f $lastWbsRow,$row)}
    $dashboard.Range('D10:E10').Value2=@('Release','Số work item');Style-Header $dashboard.Range('D10:E10')
    for($i=1;$i -le 3;$i++){$row=10+$i;$dashboard.Cells.Item($row,4).Value2="Pha $i";$dashboard.Cells.Item($row,5).Formula=('=COUNTIF(WBS!$N$5:$N${0},D{1})' -f $lastWbsRow,$row)}
    $dashboard.Range('D15:E15').Value2=@('Priority','Số work item');Style-Header $dashboard.Range('D15:E15')
    for($i=0;$i -lt $priorities.Count;$i++){$row=16+$i;$dashboard.Cells.Item($row,4).Value2=$priorities[$i];$dashboard.Cells.Item($row,5).Formula=('=COUNTIF(WBS!$M$5:$M${0},D{1})' -f $lastWbsRow,$row)}
    $dashboard.Columns('A').ColumnWidth=36;$dashboard.Columns('B').ColumnWidth=14;$dashboard.Columns('C').ColumnWidth=3;$dashboard.Columns('D').ColumnWidth=18;$dashboard.Columns('E').ColumnWidth=14;$dashboard.Columns('F:M').ColumnWidth=13

    $dashboard.Activate()|Out-Null;$excel.ActiveWindow.Zoom=85

    $listsSheet.Visible=0
    $workbook.SaveAs($OutputPath,51)
    Write-Output 'Checkpoint workbook saved.'

    $excel.Calculation=-4105
    $excel.CalculateFull()
    $workbook.Save()
    Write-Output 'Workbook formulas calculated.'

    $subChartObject=$dashboard.ChartObjects().Add($dashboard.Range('G10').Left,$dashboard.Range('G10').Top,620,400);$subChart=$subChartObject.Chart;$subChart.ChartType=57;while($subChart.SeriesCollection().Count -gt 0){$subChart.SeriesCollection(1).Delete()};$subSeries=$subChart.SeriesCollection().NewSeries();$subSeries.Name='Work items';$subSeries.XValues=$dashboard.Range('A11:A29');$subSeries.Values=$dashboard.Range('B11:B29');$subChart.HasTitle=$true;$subChart.ChartTitle.Text='Phân bổ work item theo phân hệ';$subChart.HasLegend=$false;$subChart.Axes(1).ReversePlotOrder=$true
    $releaseChartObject=$dashboard.ChartObjects().Add($dashboard.Range('D21').Left,$dashboard.Range('D21').Top,360,230);$releaseChart=$releaseChartObject.Chart;$releaseChart.ChartType=51;while($releaseChart.SeriesCollection().Count -gt 0){$releaseChart.SeriesCollection(1).Delete()};$relSeries=$releaseChart.SeriesCollection().NewSeries();$relSeries.Name='Work items';$relSeries.XValues=$dashboard.Range('D11:D13');$relSeries.Values=$dashboard.Range('E11:E13');$releaseChart.HasTitle=$true;$releaseChart.ChartTitle.Text='Phân bổ theo release';$releaseChart.HasLegend=$false
    $workbook.Save()
    Write-Output 'Dashboard charts added.'

    try{$workbook.Names.Item('FSL_Priority').RefersTo='=Lists!$B$2:$B$4'}catch{}
    try{$workbook.Names.Item('FSL_Release').RefersTo='=Lists!$C$2:$C$4'}catch{}
    try{$workbook.Names.Item('FSL_ScopeStatus').RefersTo='=Lists!$D$2:$D$3'}catch{}
    $externalLinks=$workbook.LinkSources(1)
    if($null-ne$externalLinks){foreach($externalLink in @($externalLinks)){$workbook.BreakLink($externalLink,1)}}
    $workbook.Save()

    # Compact validation report.
    $formulaErrors=@()
    foreach($ws in @($dashboard,$wbsSheet,$packageSheet,$milestoneSheet,$capSheet,$dependencySheet,$gateSheet,$fslSheet)){
        $used=$ws.UsedRange;$vals=$used.Value2
        if($vals -is [Array]){foreach($v in $vals){if($v -is [string] -and $v -match '^#(REF!|DIV/0!|VALUE!|NAME\?|N/A)'){$formulaErrors+="$($ws.Name):$v"}}}
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($used)|Out-Null
    }
    $validation=[ordered]@{output=$OutputPath;source=$FslPath;sourceFeatureCount=$items.Count;uniqueFeatureIds=$uniqueIds.Count;subsystems=$subsystemOrder.Count;moduleWorkPackages=$moduleOrder.Count;openQuestions=$questions.Count;formulaErrors=@($formulaErrors)}
    [System.IO.File]::WriteAllText((Join-Path (Split-Path $OutputPath -Parent) 'validation.json'),($validation|ConvertTo-Json -Depth 5),[System.Text.Encoding]::UTF8)
}
finally {
    if($sourceBook){try{$sourceBook.Close($false)}catch{}}
    if($workbook){try{$workbook.Close($true)}catch{}}
    if($excel){try{$excel.Quit()}catch{}}
    foreach($obj in @($listsSheet,$fslSheet,$gateSheet,$dependencySheet,$capSheet,$milestoneSheet,$packageSheet,$wbsSheet,$dashboard,$workbook,$sourceBook,$excel)){if($null-ne$obj){try{[System.Runtime.InteropServices.Marshal]::ReleaseComObject($obj)|Out-Null}catch{}}}
    [GC]::Collect();[GC]::WaitForPendingFinalizers()
}
