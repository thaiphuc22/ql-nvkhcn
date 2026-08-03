param(
    [string]$WorkbookPath='C:\Users\phuctd7\ql-nvkhcn\outputs\wbs_fsl_v4_20260717\wbs_khcn_fsl_v4_v1.0.xlsx',
    [string]$PreviewDir='C:\Users\phuctd7\ql-nvkhcn\outputs\wbs_fsl_v4_20260717\previews'
)

$ErrorActionPreference='Stop'
New-Item -ItemType Directory -Force -Path $PreviewDir|Out-Null
$excel=$null
$book=$null
try{
    $excel=New-Object -ComObject Excel.Application
    $excel.Visible=$false
    $excel.DisplayAlerts=$false
    $book=$excel.Workbooks.Open($WorkbookPath,0,$true)
    $targets=@(
        @{Name='Dashboard';Range='$A$1:$M$37'},
        @{Name='WBS';Range='$A$1:$AA$15'},
        @{Name='Work Packages';Range='$A$1:$O$25'},
        @{Name='Milestones';Range='$A$1:$H$11'},
        @{Name='CAP Coverage';Range='$A$1:$K$25'},
        @{Name='Dependencies';Range='$A$1:$F$10'},
        @{Name='Gates & Decisions';Range='$A$1:$J$15'},
        @{Name='FSL Source';Range='$A$1:$Q$15'}
    )
    foreach($target in $targets){
        $sheet=$book.Worksheets.Item($target.Name)
        $sheet.PageSetup.PrintArea=$target.Range
        $sheet.PageSetup.Orientation=2
        $sheet.PageSetup.Zoom=$false
        $sheet.PageSetup.FitToPagesWide=1
        $sheet.PageSetup.FitToPagesTall=1
        $sheet.PageSetup.LeftMargin=$excel.InchesToPoints(0.2)
        $sheet.PageSetup.RightMargin=$excel.InchesToPoints(0.2)
        $sheet.PageSetup.TopMargin=$excel.InchesToPoints(0.3)
        $sheet.PageSetup.BottomMargin=$excel.InchesToPoints(0.3)
        $safe=($target.Name-replace'[^A-Za-z0-9]+','_').Trim('_')
        $sheet.ExportAsFixedFormat(0,(Join-Path $PreviewDir ($safe+'.pdf')),0,$true,$false)
        [Runtime.InteropServices.Marshal]::ReleaseComObject($sheet)|Out-Null
    }
}
finally{
    if($book){try{$book.Close($false)}catch{}}
    if($excel){try{$excel.Quit()}catch{}}
    foreach($obj in @($book,$excel)){if($null-ne$obj){try{[Runtime.InteropServices.Marshal]::ReleaseComObject($obj)|Out-Null}catch{}}}
    [GC]::Collect();[GC]::WaitForPendingFinalizers()
}
