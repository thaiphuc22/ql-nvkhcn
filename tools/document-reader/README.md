# Document reader

Tiện ích local dùng PyMuPDF4LLM để trích nội dung PDF và ảnh thành Markdown, JSON hoặc TXT.
Dữ liệu không được gửi lên cloud. Kết quả mặc định nằm trong `extracted/` và không được Git theo dõi.

## Cài đặt (PowerShell)

Chạy từ thư mục gốc repo:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r tools\document-reader\requirements.txt
```

Để OCR tiếng Việt, cài Tesseract và đặt `vie.traineddata`, `eng.traineddata` trong
`tools\document-reader\.tessdata\`. Thư mục model này không được Git theo dõi.

## Sử dụng

Đọc một PDF:

```powershell
.\.venv\Scripts\python.exe tools\document-reader\extract.py "FROM VTS\Huong dan cai dat_DMS.pdf"
```

Đọc một ảnh và bắt buộc OCR:

```powershell
.\.venv\Scripts\python.exe tools\document-reader\extract.py "path\to\image.png" --force-ocr
```

Đọc đệ quy toàn bộ PDF/ảnh trong thư mục:

```powershell
.\.venv\Scripts\python.exe tools\document-reader\extract.py "BA\DS Blueprint VTS gửi" --recursive
```

Xuất JSON hoặc văn bản thuần:

```powershell
.\.venv\Scripts\python.exe tools\document-reader\extract.py "document.pdf" --format json
.\.venv\Scripts\python.exe tools\document-reader\extract.py "document.pdf" --format text
```

OCR mặc định dùng `vie+eng`. Có thể đổi bằng `--language eng`. Không nên dùng `--force-ocr`
với PDF đã có lớp text vì sẽ chậm hơn và có thể làm giảm chất lượng kết quả.

> Lưu ý: OCR chạy local bằng Tesseract, không dùng dịch vụ cloud. Chất lượng nhận dạng tiếng Việt
> phụ thuộc font, cỡ chữ và độ nét của ảnh nguồn.
