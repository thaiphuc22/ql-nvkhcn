param(
    [string]$WorkbookPath = 'C:\Users\phuctd7\ql-nvkhcn\outputs\wbs_fsl_v4_20260717\wbs_khcn_fsl_v4_v1.0.xlsx'
)

$ErrorActionPreference='Stop'
$excel=$null
$book=$null
try{
    $excel=New-Object -ComObject Excel.Application
    $excel.Visible=$false
    $excel.DisplayAlerts=$false
    $book=$excel.Workbooks.Open($WorkbookPath)
    $wbs=$book.Worksheets.Item('WBS')
    $fsl=$book.Worksheets.Item('FSL Source')

    $fslUsed=$fsl.UsedRange
    $fslUsed.Copy()|Out-Null
    $fslUsed.PasteSpecial(-4163)|Out-Null

    $wbs.Range('B5').Formula='=IFERROR(INDEX(''Work Packages''!$A$5:$A$200,MATCH(D5&"|"&E5,''Work Packages''!$P$5:$P$200,0)),"")'
    $wbs.Range('B5:B457').FillDown()|Out-Null
    $wbs.Range('A5').Formula='=B5&"."&TEXT(COUNTIF($B$5:B5,B5),"000")'
    $wbs.Range('A5:A457').FillDown()|Out-Null

    try{$book.Names.Item('FSL_Priority').RefersTo='=Lists!$B$2:$B$4'}catch{}
    try{$book.Names.Item('FSL_Release').RefersTo='=Lists!$C$2:$C$4'}catch{}
    try{$book.Names.Item('FSL_ScopeStatus').RefersTo='=Lists!$D$2:$D$3'}catch{}
    $links=$book.LinkSources(1)
    if($null-ne$links){foreach($link in @($links)){$book.BreakLink($link,1)}}
    $excel.CalculateFull()
    $book.Save()
}
finally{
    if($book){try{$book.Close($true)}catch{}}
    if($excel){try{$excel.Quit()}catch{}}
    foreach($obj in @($fslUsed,$fsl,$wbs,$book,$excel)){if($null-ne$obj){try{[Runtime.InteropServices.Marshal]::ReleaseComObject($obj)|Out-Null}catch{}}}
    [GC]::Collect();[GC]::WaitForPendingFinalizers()
}
