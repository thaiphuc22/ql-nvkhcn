param(
    [string]$SourcePath = 'C:\Users\phuctd7\Downloads\wbs_khcn_platform_v1.0.md',
    [string]$OutputPath = 'C:\Users\phuctd7\ql-nvkhcn\outputs\wbs_xlsx_20260717\wbs_khcn_platform_v1.0.xlsx',
    [string]$PreviewDir = 'C:\Users\phuctd7\ql-nvkhcn\outputs\wbs_xlsx_20260717\previews'
)

$ErrorActionPreference = 'Stop'
$culture = [System.Globalization.CultureInfo]::InvariantCulture
$text = [System.IO.File]::ReadAllText($SourcePath, [System.Text.Encoding]::UTF8)
$lines = $text -split "`r?`n"

function Clean-MarkdownCell([string]$value) {
    if ($null -eq $value) { return '' }
    $v = $value.Trim()
    $v = $v -replace '`', ''
    $v = $v -replace '\*\*', ''
    $v = $v -replace '<br\s*/?>', "`n"
    return $v.Trim()
}

function Split-MarkdownRow([string]$line) {
    $trimmed = $line.Trim().Trim('|')
    return @($trimmed.Split('|') | ForEach-Object { Clean-MarkdownCell $_ })
}

function Get-SectionTable([string]$headingPattern, [string]$headerFirstCell) {
    $start = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $headingPattern) { $start = $i; break }
    }
    if ($start -lt 0) { return @() }

    $headerIndex = -1
    for ($i = $start + 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^##' -and $i -gt ($start + 1)) { break }
        if ($lines[$i] -match '^\|' -and (Split-MarkdownRow $lines[$i])[0] -eq $headerFirstCell) {
            $headerIndex = $i
            break
        }
    }
    if ($headerIndex -lt 0) { return @() }

    $headers = Split-MarkdownRow $lines[$headerIndex]
    $result = @()
    for ($i = $headerIndex + 2; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -notmatch '^\|') { break }
        $cells = Split-MarkdownRow $lines[$i]
        $obj = [ordered]@{}
        for ($c = 0; $c -lt $headers.Count; $c++) {
            $obj[$headers[$c]] = if ($c -lt $cells.Count) { $cells[$c] } else { '' }
        }
        $result += [pscustomobject]$obj
    }
    return @($result)
}

# Parse all WBS dictionary tables.
$wbsItems = @()
$currentGroup = ''
$currentGroupName = ''
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^### 3\.\d+ WBS (\d+\.0) — (.+)$') {
        $currentGroup = $Matches[1]
        $currentGroupName = Clean-MarkdownCell $Matches[2]
        continue
    }
    if ($currentGroup -and $lines[$i] -match '^\| WBS ID \|') {
        $headers = Split-MarkdownRow $lines[$i]
        $i += 2
        while ($i -lt $lines.Count -and $lines[$i] -match '^\|') {
            $cells = Split-MarkdownRow $lines[$i]
            $row = @{}
            for ($c = 0; $c -lt $headers.Count; $c++) {
                $row[$headers[$c]] = if ($c -lt $cells.Count) { $cells[$c] } else { '' }
            }
            $defaultScope = switch ($currentGroup) {
                '8.0' { 'P2' }
                '9.0' { 'OPT-AI' }
                '1.0' { 'ALL' }
                '2.0' { 'ALL' }
                default { 'P1' }
            }
            $scopeValue = if ($row.ContainsKey('Scope') -and $row['Scope']) { $row['Scope'] } else { $defaultScope }
            $traceValue = if ($row.ContainsKey('Truy vết')) { $row['Truy vết'] } elseif ($row.ContainsKey('Truy vết nghiệp vụ')) { $row['Truy vết nghiệp vụ'] } else { '' }
            $wbsItems += [pscustomobject]@{
                WbsId = $row['WBS ID']
                Level1 = $currentGroup
                GroupName = $currentGroupName
                WorkPackage = $row['Work package']
                Deliverable = $row['Đầu ra bàn giao']
                Scope = $scopeValue
                Traceability = $traceValue
                Dependency = $row['Phụ thuộc']
                Done = $row['Điều kiện hoàn thành']
            }
            $i++
        }
    }
}

$milestones = Get-SectionTable '^## 4\. Milestone' 'Milestone'
$traceRows = Get-SectionTable '^## 5\. Ma trận' 'BR'
$dependencyRows = Get-SectionTable '^## 6\. Dependency' 'Dependency'
$gateRows = Get-SectionTable '^### 1\.2 Điều kiện' 'Gate'

if ($wbsItems.Count -ne 88) { throw "Expected 88 WBS items, found $($wbsItems.Count)." }
if ($traceRows.Count -ne 21) { throw "Expected 21 traceability rows, found $($traceRows.Count)." }

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputPath), $PreviewDir | Out-Null

Add-Type -AssemblyName System.Drawing

function OleColor([string]$hex) {
    $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
    return [System.Drawing.ColorTranslator]::ToOle($color)
}

$primary = OleColor '#17365D'
$secondary = OleColor '#2F75B5'
$accent = OleColor '#5B9BD5'
$lightBlue = OleColor '#D9EAF7'
$softBlue = OleColor '#EAF2F8'
$lightGray = OleColor '#F3F6F8'
$midGray = OleColor '#D9E1F2'
$darkText = OleColor '#243447'
$white = OleColor '#FFFFFF'
$green = OleColor '#E2F0D9'
$amber = OleColor '#FFF2CC'
$red = OleColor '#FCE4D6'

$excel = $null
$workbook = $null
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.ScreenUpdating = $false
    $workbook = $excel.Workbooks.Add()

    while ($workbook.Worksheets.Count -lt 7) { $null = $workbook.Worksheets.Add() }
    $sheetNames = @('Dashboard','WBS','Milestones','BR Traceability','Dependencies','Gates & Decisions','Lists')
    for ($s = 1; $s -le 7; $s++) { $workbook.Worksheets.Item($s).Name = $sheetNames[$s-1] }

    $dashboard = $workbook.Worksheets.Item('Dashboard')
    $wbsSheet = $workbook.Worksheets.Item('WBS')
    $milestoneSheet = $workbook.Worksheets.Item('Milestones')
    $traceSheet = $workbook.Worksheets.Item('BR Traceability')
    $dependencySheet = $workbook.Worksheets.Item('Dependencies')
    $gateSheet = $workbook.Worksheets.Item('Gates & Decisions')
    $listsSheet = $workbook.Worksheets.Item('Lists')

    foreach ($ws in @($dashboard,$wbsSheet,$milestoneSheet,$traceSheet,$dependencySheet,$gateSheet,$listsSheet)) {
        $ws.Activate() | Out-Null
        $excel.ActiveWindow.DisplayGridlines = $false
        $ws.Cells.Font.Name = 'Aptos'
        $ws.Cells.Font.Size = 10
    }

    # Supporting validation lists.
    $listsSheet.Range('A1:D1').Value2 = @('Status','Scope','Gate Status','Roles')
    $statuses = @('Not Started','In Progress','Blocked','Done','Deferred')
    $scopes = @('ALL','P1','P1 mức B','P2','OPT-AI')
    $gateStatuses = @('Open','In Review','Approved','Rejected','Not Applicable')
    $roles = @('Project Manager','Business Analyst','Product Owner','Solution Architect','Tech Lead','QA Lead','Security','DevOps','Data Owner','Integration Owner')
    for ($i=0; $i -lt $statuses.Count; $i++) { $listsSheet.Cells.Item($i+2,1).Value2 = $statuses[$i] }
    for ($i=0; $i -lt $scopes.Count; $i++) { $listsSheet.Cells.Item($i+2,2).Value2 = $scopes[$i] }
    for ($i=0; $i -lt $gateStatuses.Count; $i++) { $listsSheet.Cells.Item($i+2,3).Value2 = $gateStatuses[$i] }
    for ($i=0; $i -lt $roles.Count; $i++) { $listsSheet.Cells.Item($i+2,4).Value2 = $roles[$i] }
    $listsSheet.Range('A1:D1').Interior.Color = $primary
    $listsSheet.Range('A1:D1').Font.Color = $white
    $listsSheet.Range('A1:D1').Font.Bold = $true
    $listsSheet.Columns('A:D').ColumnWidth = 22

    # WBS sheet.
    $wbsSheet.Range('A1:P1').Merge()
    $wbsSheet.Range('A1').Value2 = 'WORK BREAKDOWN STRUCTURE — PM QLKHCN'
    $wbsSheet.Range('A1:P1').Interior.Color = $primary
    $wbsSheet.Range('A1:P1').Font.Color = $white
    $wbsSheet.Range('A1:P1').Font.Bold = $true
    $wbsSheet.Range('A1:P1').Font.Size = 16
    $wbsSheet.Range('A1:P1').HorizontalAlignment = -4108
    $wbsSheet.Range('A2:P2').Merge()
    $wbsSheet.Range('A2').Value2 = 'Các cột Owner, Effort, Duration, Start, Status, % Complete và Notes có thể cập nhật để lập kế hoạch.'
    $wbsSheet.Range('A2:P2').Interior.Color = $softBlue
    $wbsSheet.Range('A2:P2').Font.Color = $darkText

    $headers = @('WBS ID','Nhóm WBS','Work Package','Đầu ra bàn giao','Scope','Truy vết BR/CAP/RD','Phụ thuộc','Điều kiện hoàn thành','Owner','Effort (person-day)','Duration (workday)','Planned Start','Planned Finish','Status','% Complete','Notes / Evidence')
    for ($c=0; $c -lt $headers.Count; $c++) { $wbsSheet.Cells.Item(4,$c+1).Value2 = $headers[$c] }
    $wbsSheet.Range('A4:P4').Interior.Color = $secondary
    $wbsSheet.Range('A4:P4').Font.Color = $white
    $wbsSheet.Range('A4:P4').Font.Bold = $true
    $wbsSheet.Range('A4:P4').WrapText = $true
    $wbsSheet.Range('A4:P4').RowHeight = 32

    $rowNum = 5
    foreach ($item in $wbsItems) {
        $wbsSheet.Cells.Item($rowNum,1).Value2 = $item.WbsId
        $wbsSheet.Cells.Item($rowNum,2).Value2 = "$($item.Level1) — $($item.GroupName)"
        $wbsSheet.Cells.Item($rowNum,3).Value2 = $item.WorkPackage
        $wbsSheet.Cells.Item($rowNum,4).Value2 = $item.Deliverable
        $wbsSheet.Cells.Item($rowNum,5).Value2 = $item.Scope
        $wbsSheet.Cells.Item($rowNum,6).Value2 = $item.Traceability
        $wbsSheet.Cells.Item($rowNum,7).Value2 = $item.Dependency
        $wbsSheet.Cells.Item($rowNum,8).Value2 = $item.Done
        $wbsSheet.Cells.Item($rowNum,14).Value2 = 'Not Started'
        $wbsSheet.Cells.Item($rowNum,15).Value2 = 0
        $wbsSheet.Cells.Item($rowNum,13).Formula = ('=IF(OR(L{0}="",K{0}=""),"",WORKDAY(L{0},K{0}-1))' -f $rowNum)
        $rowNum++
    }
    $lastWbsRow = $rowNum - 1
    $wbsRange = $wbsSheet.Range("A4:P$lastWbsRow")
    $wbsTable = $wbsSheet.ListObjects.Add(1, $wbsRange, $null, 1)
    $wbsTable.Name = 'tblWBS'
    $wbsTable.TableStyle = 'TableStyleMedium2'
    $wbsSheet.Range("A5:P$lastWbsRow").VerticalAlignment = -4160
    $wbsSheet.Range("B5:H$lastWbsRow").WrapText = $true
    $wbsSheet.Range("P5:P$lastWbsRow").WrapText = $true
    $wbsSheet.Range("J5:K$lastWbsRow").NumberFormat = '0.0'
    $wbsSheet.Range("L5:M$lastWbsRow").NumberFormat = 'yyyy-mm-dd'
    $wbsSheet.Range("O5:O$lastWbsRow").NumberFormat = '0%'
    $wbsSheet.Range("E5:E$lastWbsRow").Validation.Add(3,1,1,'=Lists!$B$2:$B$6')
    $wbsSheet.Range("N5:N$lastWbsRow").Validation.Add(3,1,1,'=Lists!$A$2:$A$6')
    $wbsSheet.Range("O5:O$lastWbsRow").Validation.Add(2,1,1,'0','1')
    $wbsSheet.Range("N5:N$lastWbsRow").FormatConditions.Add(1,3,'="Done"') | Out-Null
    $wbsSheet.Range("N5:N$lastWbsRow").FormatConditions.Item(1).Interior.Color = $green
    $wbsSheet.Range("N5:N$lastWbsRow").FormatConditions.Add(1,3,'="Blocked"') | Out-Null
    $wbsSheet.Range("N5:N$lastWbsRow").FormatConditions.Item(2).Interior.Color = $red
    $wbsSheet.Range("N5:N$lastWbsRow").FormatConditions.Add(1,3,'="In Progress"') | Out-Null
    $wbsSheet.Range("N5:N$lastWbsRow").FormatConditions.Item(3).Interior.Color = $amber
    $wbsSheet.Columns('A').ColumnWidth = 9
    $wbsSheet.Columns('B').ColumnWidth = 26
    $wbsSheet.Columns('C').ColumnWidth = 28
    $wbsSheet.Columns('D').ColumnWidth = 38
    $wbsSheet.Columns('E').ColumnWidth = 12
    $wbsSheet.Columns('F').ColumnWidth = 22
    $wbsSheet.Columns('G').ColumnWidth = 20
    $wbsSheet.Columns('H').ColumnWidth = 38
    $wbsSheet.Columns('I').ColumnWidth = 20
    $wbsSheet.Columns('J:K').ColumnWidth = 15
    $wbsSheet.Columns('L:M').ColumnWidth = 14
    $wbsSheet.Columns('N').ColumnWidth = 14
    $wbsSheet.Columns('O').ColumnWidth = 12
    $wbsSheet.Columns('P').ColumnWidth = 28
    $wbsSheet.Activate() | Out-Null
    $excel.ActiveWindow.SplitRow = 4
    $excel.ActiveWindow.SplitColumn = 2
    $excel.ActiveWindow.FreezePanes = $true

    # Generic styled table writer.
    function Write-DataSheet($sheet, [string]$title, [array]$headers, [array]$rows, [string]$tableName, [array]$widths) {
        $colCount = $headers.Count
        $lastColLetter = $excel.Cells.Item(1,$colCount).Address($false,$false) -replace '\d',''
        $sheet.Range("A1:${lastColLetter}1").Merge()
        $sheet.Range('A1').Value2 = $title
        $sheet.Range("A1:${lastColLetter}1").Interior.Color = $primary
        $sheet.Range("A1:${lastColLetter}1").Font.Color = $white
        $sheet.Range("A1:${lastColLetter}1").Font.Bold = $true
        $sheet.Range("A1:${lastColLetter}1").Font.Size = 15
        $sheet.Range("A1:${lastColLetter}1").HorizontalAlignment = -4108
        for ($c=0; $c -lt $colCount; $c++) { $sheet.Cells.Item(3,$c+1).Value2 = $headers[$c] }
        $sheet.Range("A3:${lastColLetter}3").Interior.Color = $secondary
        $sheet.Range("A3:${lastColLetter}3").Font.Color = $white
        $sheet.Range("A3:${lastColLetter}3").Font.Bold = $true
        $r = 4
        foreach ($row in $rows) {
            for ($c=0; $c -lt $colCount; $c++) { $sheet.Cells.Item($r,$c+1).Value2 = $row[$c] }
            $r++
        }
        $lastRow = [Math]::Max(4,$r-1)
        $range = $sheet.Range("A3:${lastColLetter}$lastRow")
        $table = $sheet.ListObjects.Add(1,$range,$null,1)
        $table.Name = $tableName
        $table.TableStyle = 'TableStyleMedium2'
        $sheet.Range("A4:${lastColLetter}$lastRow").WrapText = $true
        $sheet.Range("A4:${lastColLetter}$lastRow").VerticalAlignment = -4160
        for ($c=0; $c -lt $widths.Count; $c++) { $sheet.Columns.Item($c+1).ColumnWidth = $widths[$c] }
        $sheet.Activate() | Out-Null
        $excel.ActiveWindow.SplitRow = 3
        $excel.ActiveWindow.FreezePanes = $true
        return $lastRow
    }

    $milestoneData = @()
    foreach ($m in $milestones) { $milestoneData += ,@($m.Milestone,$m.'Kết quả',$m.'Work package bắt buộc hoàn thành','', '', 'Not Started', '', '') }
    $lastMilestone = Write-DataSheet $milestoneSheet 'MILESTONES & QUALITY GATES' @('Milestone','Kết quả','Work package bắt buộc','Owner','Planned Date','Status','Actual Date','Evidence') $milestoneData 'tblMilestones' @(20,32,30,20,14,14,14,30)
    $milestoneSheet.Range("E4:E$lastMilestone").NumberFormat = 'yyyy-mm-dd'
    $milestoneSheet.Range("G4:G$lastMilestone").NumberFormat = 'yyyy-mm-dd'
    $milestoneSheet.Range("F4:F$lastMilestone").Validation.Add(3,1,1,'=Lists!$A$2:$A$6')

    $traceData = @()
    foreach ($t in $traceRows) { $traceData += ,@($t.BR,$t.CAP,$t.'WBS chịu trách nhiệm chính',$t.'Ghi chú','', 'Not Started','') }
    $lastTrace = Write-DataSheet $traceSheet 'BRD → WBS TRACEABILITY' @('BR','CAP','WBS chịu trách nhiệm chính','Ghi chú','Owner','Status','Evidence') $traceData 'tblTraceability' @(12,12,34,30,20,14,30)
    $traceSheet.Range("F4:F$lastTrace").Validation.Add(3,1,1,'=Lists!$A$2:$A$6')

    $dependencyData = @()
    foreach ($d in $dependencyRows) { $dependencyData += ,@($d.Dependency,$d.'Chuỗi ảnh hưởng',$d.'Biện pháp quản trị','', 'Open','') }
    $lastDependency = Write-DataSheet $dependencySheet 'DEPENDENCIES & BLOCKERS' @('Dependency','Chuỗi ảnh hưởng','Biện pháp quản trị','Owner','Status','Evidence / Decision') $dependencyData 'tblDependencies' @(28,34,44,20,14,30)
    $dependencySheet.Range("E4:E$lastDependency").Validation.Add(3,1,1,'=Lists!$C$2:$C$6')

    $gateData = @()
    foreach ($g in $gateRows) { $gateData += ,@($g.Gate,$g.'Nội dung phải chốt',$g.'Quyết định nguồn',$g.'Tác động nếu chưa chốt','', 'Open', '', '') }
    $lastGate = Write-DataSheet $gateSheet 'GATES & OPEN DECISIONS' @('Gate','Nội dung phải chốt','Quyết định nguồn','Tác động nếu chưa chốt','Owner','Status','Due Date','Decision / Evidence') $gateData 'tblGates' @(16,40,22,38,20,16,14,32)
    $gateSheet.Range("F4:F$lastGate").Validation.Add(3,1,1,'=Lists!$C$2:$C$6')
    $gateSheet.Range("G4:G$lastGate").NumberFormat = 'yyyy-mm-dd'

    # Dashboard and formulas.
    $dashboard.Range('A1:J2').Merge()
    $dashboard.Range('A1').Value2 = 'WBS DASHBOARD — PM QLKHCN'
    $dashboard.Range('A1:J2').Interior.Color = $primary
    $dashboard.Range('A1:J2').Font.Color = $white
    $dashboard.Range('A1:J2').Font.Bold = $true
    $dashboard.Range('A1:J2').Font.Size = 20
    $dashboard.Range('A1:J2').HorizontalAlignment = -4108
    $dashboard.Range('A3:J3').Merge()
    $dashboard.Range('A3').Value2 = 'Nguồn: wbs_khcn_platform_v1.0.md | Cập nhật các cột editable tại sheet WBS để dashboard tự tính.'
    $dashboard.Range('A3:J3').Interior.Color = $softBlue
    $dashboard.Range('A3:J3').HorizontalAlignment = -4108

    $cards = @(
        @{Label='Tổng work package'; Cell='A5:C5'; ValueCell='A6:C7'; Formula="=COUNTA(WBS!A5:A$lastWbsRow)"},
        @{Label='Hoàn thành'; Cell='D5:F5'; ValueCell='D6:F7'; Formula=('=COUNTIF(WBS!N5:N{0},"Done")' -f $lastWbsRow)},
        @{Label='Tiến độ trung bình'; Cell='G5:I5'; ValueCell='G6:I7'; Formula="=IFERROR(AVERAGE(WBS!O5:O$lastWbsRow),0)"}
    )
    foreach ($card in $cards) {
        $dashboard.Range($card.Cell).Merge()
        $dashboard.Range($card.Cell.Split(':')[0]).Value2 = $card.Label
        $dashboard.Range($card.Cell).Interior.Color = $secondary
        $dashboard.Range($card.Cell).Font.Color = $white
        $dashboard.Range($card.Cell).Font.Bold = $true
        $dashboard.Range($card.Cell).HorizontalAlignment = -4108
        $dashboard.Range($card.ValueCell).Merge()
        $anchor = $card.ValueCell.Split(':')[0]
        $dashboard.Range($anchor).Formula = $card.Formula
        $dashboard.Range($card.ValueCell).Interior.Color = $lightBlue
        $dashboard.Range($card.ValueCell).Font.Bold = $true
        $dashboard.Range($card.ValueCell).Font.Size = 20
        $dashboard.Range($card.ValueCell).HorizontalAlignment = -4108
    }
    $dashboard.Range('G6').NumberFormat = '0%'

    $dashboard.Range('A10:B10').Value2 = @('Nhóm WBS','Số work package')
    $dashboard.Range('A10:B10').Interior.Color = $secondary
    $dashboard.Range('A10:B10').Font.Color = $white
    $dashboard.Range('A10:B10').Font.Bold = $true
    $groupLabels = @('1.0','2.0','3.0','4.0','5.0','6.0','7.0','8.0','9.0')
    for ($i=0; $i -lt $groupLabels.Count; $i++) {
        $r = 11 + $i
        $dashboard.Cells.Item($r,1).Value2 = $groupLabels[$i]
        $dashboard.Cells.Item($r,2).Formula = ('=COUNTIF(WBS!B5:B{0},A{1}&"*")' -f $lastWbsRow,$r)
    }
    $dashboard.Range('D10:E10').Value2 = @('Trạng thái','Số lượng')
    $dashboard.Range('D10:E10').Interior.Color = $secondary
    $dashboard.Range('D10:E10').Font.Color = $white
    $dashboard.Range('D10:E10').Font.Bold = $true
    for ($i=0; $i -lt $statuses.Count; $i++) {
        $r = 11 + $i
        $dashboard.Cells.Item($r,4).Value2 = $statuses[$i]
        $dashboard.Cells.Item($r,5).Formula = "=COUNTIF(WBS!N5:N$lastWbsRow,D$r)"
    }
    $dashboard.Range('D17:E17').Value2 = @('Tổng effort (PD)', '')
    $dashboard.Range('E17').Formula = "=SUM(WBS!J5:J$lastWbsRow)"
    $dashboard.Range('D18:E18').Value2 = @('Gate đang mở', '')
    $dashboard.Range('E18').Formula = ('=COUNTIF(''Gates & Decisions''!F4:F{0},"Open")' -f $lastGate)
    $dashboard.Range('D17:D18').Font.Bold = $true
    $dashboard.Range('D17:E18').Interior.Color = $lightGray

    $dashboard.Columns('A').ColumnWidth = 20
    $dashboard.Columns('B:C').ColumnWidth = 12
    $dashboard.Columns('D').ColumnWidth = 22
    $dashboard.Columns('E:F').ColumnWidth = 12
    $dashboard.Columns('G:J').ColumnWidth = 14
    $dashboard.Rows('1:3').RowHeight = 24
    $dashboard.Activate() | Out-Null
    $excel.ActiveWindow.Zoom = 90

    # Workbook metadata and calculation.
    try { $workbook.BuiltinDocumentProperties.Item('Title').Value = 'WBS PM QLKHCN v1.0' } catch {}
    try { $workbook.BuiltinDocumentProperties.Item('Subject').Value = 'Work Breakdown Structure' } catch {}
    try { $workbook.BuiltinDocumentProperties.Item('Comments').Value = 'Generated from wbs_khcn_platform_v1.0.md; source files unchanged.' } catch {}
    $listsSheet.Visible = 0
    $excel.CalculateFull()

    # Checkpoint save before adding the optional dashboard drawing.
    $workbook.SaveAs($OutputPath, 51)
    Write-Output 'Checkpoint workbook saved.'

    $chartLeft = $dashboard.Range('G10').Left
    $chartTop = $dashboard.Range('G10').Top
    $chartObject = $dashboard.ChartObjects().Add($chartLeft,$chartTop,480,280)
    $chart = $chartObject.Chart
    $chart.ChartType = 51
    while ($chart.SeriesCollection().Count -gt 0) { $chart.SeriesCollection(1).Delete() }
    $series = $chart.SeriesCollection().NewSeries()
    $series.Name = 'Work packages'
    $series.XValues = $dashboard.Range('A11:A19')
    $series.Values = $dashboard.Range('B11:B19')
    $chart.HasTitle = $true
    $chart.ChartTitle.Text = 'Phân bổ work package theo nhóm WBS'
    $chart.HasLegend = $false
    $chart.Axes(2).HasTitle = $true
    $chart.Axes(2).AxisTitle.Text = 'Số work package'
    $chart.Axes(2).MinimumScale = 0
    $workbook.Save()
    Write-Output 'Dashboard chart added and workbook saved.'

    # Validation summary written beside the workbook.
    $formulaErrors = @()
    foreach ($ws in @($dashboard,$wbsSheet,$milestoneSheet,$traceSheet,$dependencySheet,$gateSheet)) {
        $values = $ws.UsedRange.Value2
        if ($values -is [System.Array]) {
            foreach ($v in $values) {
                if ($v -is [string] -and $v -match '^#(REF!|DIV/0!|VALUE!|NAME\?|N/A)') { $formulaErrors += "$($ws.Name):$v" }
            }
        }
    }
    $summary = [ordered]@{
        output = $OutputPath
        sheets = @($dashboard.Name,$wbsSheet.Name,$milestoneSheet.Name,$traceSheet.Name,$dependencySheet.Name,$gateSheet.Name)
        wbsItems = $wbsItems.Count
        milestones = $milestones.Count
        traceabilityRows = $traceRows.Count
        dependencyRows = $dependencyRows.Count
        gateRows = $gateRows.Count
        formulaErrors = @($formulaErrors)
    }
    [System.IO.File]::WriteAllText((Join-Path (Split-Path $OutputPath -Parent) 'validation.json'), ($summary | ConvertTo-Json -Depth 5), [System.Text.Encoding]::UTF8)
}
finally {
    if ($workbook) { try { $workbook.Close($true) } catch {} }
    if ($excel) { try { $excel.Quit() } catch {} }
    foreach ($obj in @($listsSheet,$gateSheet,$dependencySheet,$traceSheet,$milestoneSheet,$wbsSheet,$dashboard,$workbook,$excel)) {
        if ($null -ne $obj) { try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($obj) | Out-Null } catch {} }
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
