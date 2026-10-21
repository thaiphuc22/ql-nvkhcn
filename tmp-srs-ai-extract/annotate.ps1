Add-Type -AssemblyName System.Drawing

$work = 'D:\ql-nvkhcn\tmp-srs-ai-extract\img-annotate'
$h2 = Get-ChildItem 'D:\ql-nvkhcn\docs\ba' -Recurse -Filter 'HINH-002-nhap-eform-Tro-ly-A.png' |
  Where-Object { $_.FullName -notmatch 'numbered' -and $_.FullName -notmatch 'TÃ' } |
  Select-Object -First 1
if (-not $h2) { throw 'HINH-002 not found' }
$imgRoot = $h2.Directory.FullName
$outRoot = Join-Path $imgRoot 'numbered'
Write-Host "imgRoot=$imgRoot"

if (Test-Path $work) { Remove-Item $work -Recurse -Force }
New-Item -ItemType Directory -Force -Path $work, $outRoot | Out-Null

Copy-Item (Join-Path $imgRoot 'HINH-002-nhap-eform-Tro-ly-A.png') (Join-Path $work 'h2.png') -Force
Copy-Item (Join-Path $imgRoot 'HINH-001-xac-nhan-AI-soan-thay.png') (Join-Path $work 'h3.png') -Force
Copy-Item (Join-Path $imgRoot 'HINH-004-dang-tai-du-lieu-soan-thao.png') (Join-Path $work 'h4.png') -Force
Copy-Item (Join-Path $imgRoot 'HINH-003-ket-qua-AI-luu-nhap.png') (Join-Path $work 'h5.png') -Force

function Add-Callouts {
  param([string]$Src, [string]$Dest, [object[]]$Marks)
  $fs = [System.IO.File]::OpenRead((Resolve-Path $Src))
  $img = [System.Drawing.Image]::FromStream($fs)
  $bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
  $fs.Close(); $fs.Dispose()

  $fill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 200, 16, 46))
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White, 3)
  $font = New-Object System.Drawing.Font 'Arial', 14, ([System.Drawing.FontStyle]::Bold)
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

  foreach ($m in $Marks) {
    $n = [int]$m[0]; $xf = [double]$m[1]; $yf = [double]$m[2]
    $r = 18
    $cx = [int]($img.Width * $xf)
    $cy = [int]($img.Height * $yf)
    $rect = New-Object System.Drawing.Rectangle (($cx - $r), ($cy - $r), (2 * $r), (2 * $r))
    $g.FillEllipse($fill, $rect)
    $g.DrawEllipse($pen, $rect)
    $g.DrawString("$n", $font, $textBrush, [System.Drawing.RectangleF]$rect, $sf)
  }

  $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "OK $($img.Width)x$($img.Height) -> $(Split-Path $Dest -Leaf)"
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  $fill.Dispose(); $pen.Dispose(); $font.Dispose(); $textBrush.Dispose()
}

Add-Callouts (Join-Path $work 'h2.png') (Join-Path $outRoot 'HINH-002-nhap-eform-Tro-ly-A-so.png') @(
  @(1, 0.05, 0.26), @(2, 0.05, 0.72), @(3, 0.78, 0.20), @(4, 0.78, 0.33),
  @(5, 0.78, 0.39), @(6, 0.78, 0.50), @(7, 0.82, 0.93)
)
Add-Callouts (Join-Path $work 'h3.png') (Join-Path $outRoot 'HINH-003-xac-nhan-AI-soan-thay-so.png') @(
  @(1, 0.78, 0.30), @(2, 0.38, 0.32), @(3, 0.38, 0.46), @(4, 0.55, 0.58), @(5, 0.70, 0.58)
)
Add-Callouts (Join-Path $work 'h4.png') (Join-Path $outRoot 'HINH-004-dang-tai-du-lieu-soan-thao-so.png') @(
  @(1, 0.36, 0.20), @(2, 0.36, 0.32), @(3, 0.36, 0.48), @(4, 0.36, 0.58),
  @(5, 0.36, 0.70), @(6, 0.84, 0.32), @(7, 0.78, 0.93)
)
Add-Callouts (Join-Path $work 'h5.png') (Join-Path $outRoot 'HINH-005-ket-qua-AI-luu-nhap-so.png') @(
  @(1, 0.06, 0.20), @(2, 0.06, 0.36), @(3, 0.06, 0.74), @(4, 0.82, 0.18),
  @(5, 0.82, 0.36), @(6, 0.82, 0.58), @(7, 0.78, 0.93)
)

# Also copy to ASCII work for docx export
$exportImg = 'D:\ql-nvkhcn\tmp-srs-ai-extract\img-numbered'
if (Test-Path $exportImg) { Remove-Item $exportImg -Recurse -Force }
New-Item -ItemType Directory -Force -Path $exportImg | Out-Null
Copy-Item (Join-Path $outRoot '*.png') $exportImg -Force
Get-ChildItem $exportImg | Format-Table Name, Length
