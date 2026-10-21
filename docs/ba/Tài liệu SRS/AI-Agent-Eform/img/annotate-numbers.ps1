# Annotate SRS UI screenshots with numbered callouts (System.Drawing)
Add-Type -AssemblyName System.Drawing

function Add-Callouts {
  param(
    [string]$Src,
    [string]$Dest,
    [hashtable[]]$Marks,  # @{ N=1; X=0.08; Y=0.25 } fractions of W/H
    [int]$Radius = 16
  )
  $img = [System.Drawing.Image]::FromFile($Src)
  $bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.DrawImage($img, 0, 0, $img.Width, $img.Height)

  $fill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 200, 16, 46))
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White, 2.5)
  $font = New-Object System.Drawing.Font 'Arial', 12, ([System.Drawing.FontStyle]::Bold)
  $textBrush = [System.Drawing.Brushes]::White
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

  foreach ($m in $Marks) {
    $cx = [int]($img.Width * $m.X)
    $cy = [int]($img.Height * $m.Y)
    $r = if ($m.R) { $m.R } else { $Radius }
    $rect = New-Object System.Drawing.Rectangle ($cx - $r), ($cy - $r), (2 * $r), (2 * $r)
    $g.FillEllipse($fill, $rect)
    $g.DrawEllipse($pen, $rect)
    $g.DrawString([string]$m.N, $font, $textBrush, $rect, $sf)
  }

  $dir = Split-Path $Dest -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  $fill.Dispose(); $pen.Dispose(); $font.Dispose()
  Write-Host "Wrote $Dest"
}

$imgRoot = 'D:\ql-nvkhcn\docs\ba\Tài liệu SRS\AI-Agent-Eform\img'
$outRoot = Join-Path $imgRoot 'numbered'

# HÌNH 2 — Nhập E-form + Trợ lý A
Add-Callouts -Src (Join-Path $imgRoot 'HINH-002-nhap-eform-Tro-ly-A.png') `
  -Dest (Join-Path $outRoot 'HINH-002-nhap-eform-Tro-ly-A-so.png') -Marks @(
  @{ N=1; X=0.06; Y=0.22 },  # Khối trường thông tin công văn
  @{ N=2; X=0.06; Y=0.72 },  # Nội dung đề nghị
  @{ N=3; X=0.78; Y=0.20 },  # Panel Trợ lý A
  @{ N=4; X=0.78; Y=0.36 },  # Nút Gọi trợ lý AI
  @{ N=5; X=0.78; Y=0.43 },  # Thời gian dự kiến
  @{ N=6; X=0.78; Y=0.55 },  # Disclaimer kiểm soát
  @{ N=7; X=0.72; Y=0.93 }   # Footer Hủy/Lưu nháp/Xác nhận
)

# HÌNH 3 — Modal xác nhận (file gốc HINH-001)
Add-Callouts -Src (Join-Path $imgRoot 'HINH-001-xac-nhan-AI-soan-thay.png') `
  -Dest (Join-Path $outRoot 'HINH-003-xac-nhan-AI-soan-thay-so.png') -Marks @(
  @{ N=1; X=0.78; Y=0.28 },  # Nút AI soạn thay nền
  @{ N=2; X=0.42; Y=0.30 },  # Tiêu đề modal
  @{ N=3; X=0.42; Y=0.45 },  # Nội dung thời gian / cam kết
  @{ N=4; X=0.55; Y=0.58 },  # Hủy
  @{ N=5; X=0.68; Y=0.58 }   # Bắt đầu soạn
)

# HÌNH 4 — Đang tải / soạn
Add-Callouts -Src (Join-Path $imgRoot 'HINH-004-dang-tai-du-lieu-soan-thao.png') `
  -Dest (Join-Path $outRoot 'HINH-004-dang-tai-du-lieu-soan-thao-so.png') -Marks @(
  @{ N=1; X=0.38; Y=0.18 },  # Badge Đang xử lý
  @{ N=2; X=0.38; Y=0.30 },  # Spinner + tiêu đề
  @{ N=3; X=0.38; Y=0.48 },  # Ô thời gian dự kiến
  @{ N=4; X=0.38; Y=0.58 },  # Cảnh báo vàng
  @{ N=5; X=0.38; Y=0.70 },  # Info tự lưu nháp
  @{ N=6; X=0.82; Y=0.35 },  # Sidebar công văn đang soạn
  @{ N=7; X=0.75; Y=0.93 }   # Footer disabled
)

# HÌNH 5 — Kết quả lưu nháp
Add-Callouts -Src (Join-Path $imgRoot 'HINH-003-ket-qua-AI-luu-nhap.png') `
  -Dest (Join-Path $outRoot 'HINH-005-ket-qua-AI-luu-nhap-so.png') -Marks @(
  @{ N=1; X=0.08; Y=0.18 },  # Banner cần rà soát
  @{ N=2; X=0.08; Y=0.35 },  # Trường [Mẫu]
  @{ N=3; X=0.08; Y=0.72 },  # Nội dung đề nghị mẫu
  @{ N=4; X=0.80; Y=0.18 },  # Đã tự động lưu nháp
  @{ N=5; X=0.80; Y=0.35 },  # AI soạn thay + Rà soát
  @{ N=6; X=0.80; Y=0.55 },  # Checklist trước xác nhận
  @{ N=7; X=0.72; Y=0.93 }   # Footer status + actions
)

Get-ChildItem $outRoot | Format-Table Name, Length
