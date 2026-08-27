# `docs/hr_tool/` — Bộ tài liệu nghiệp vụ HR Tools do khách gửi

**Đây là nguồn nghiệp vụ chính thức của phân hệ Quản lý chi phí nhân công (HR Tools)** — ngang hàng
với `docs/req/` của phân hệ KHCN. Khách (VHT) gửi 2026-08-26.

Khi tài liệu ở đây lệch với thiết kế Figma / `docs/design-system/`:

| Chủ đề | Nguồn thắng |
|---|---|
| Nghiệp vụ — mô hình dữ liệu, công thức, trạng thái, quyền, ngưỡng cảnh báo, biểu mẫu | **Thư mục này** |
| Hình thức — token màu/chữ, spacing, khuôn màn, shell, component | [`docs/design-system/`](../design-system/README.md) |

Kế hoạch thi công dựng từ bộ này:
[`docs/plan/hr-tools-ke-hoach-thi-cong-2026-08-26.md`](../plan/hr-tools-ke-hoach-thi-cong-2026-08-26.md).

---

## Đọc gì trước

File gốc là `.xlsx`/`.docx` nhị phân — **không grep được, không diff được, không review được**. Nội
dung đã trích xuất sang markdown trong [`trich-xuat/`](trich-xuat/). Đọc bản trích xuất; mở file gốc
chỉ khi cần số liệu thô hoặc định dạng biểu mẫu.

| Đọc file này | Khi cần biết |
|---|---|
| [`trich-xuat/brd-phan-bo-nhan-cong.md`](trich-xuat/brd-phan-bo-nhan-cong.md) | Bài toán là gì, quy trình 8 bước, phạm vi, giới hạn |
| [`trich-xuat/dac-ta-man-hinh.md`](trich-xuat/dac-ta-man-hinh.md) | Màn hình nào có gì, vòng đời trạng thái, **ma trận quyền**, **ngưỡng cảnh báo**, cây đơn vị |
| [`trich-xuat/bieu-mau-bm0-bm5.md`](trich-xuat/bieu-mau-bm0-bm5.md) | **Công thức CPNC**, cấu trúc 10 biểu mẫu, quy tắc công thừa |
| [`trich-xuat/phan-ra-chuc-nang.md`](trich-xuat/phan-ra-chuc-nang.md) | Phạm vi chức năng chính thức, master data cần trước, hiện trạng và nút thắt của khách |

## File gốc

| File | Nội dung | Ghi chú |
|---|---|---|
| `2025.08.01_HR_tool_Khach hang gui.xlsx` | 16 sheet hiện: đặc tả 4 tab + **sơ đồ quy trình tháng** (ảnh nhúng trong `0.QuyTrinh`) + BM0→BM5 **kèm số liệu thật tháng 4–6/2025**. Còn 2 sheet **ẩn** — khách ẩn nghĩa là ngoài phạm vi, không đọc | **Quan trọng nhất.** Giữ nguyên file — là bộ dữ liệu kiểm chứng công thức |
| `VHT_Phan tich bai toan Phan Bo Nhan Cong.docx` | BRD, mã dự án `GPDN.VHT.HRM` | |
| `Phan Bo Nhan Cong Brd.docx` | **Trùng byte-for-byte** với file trên | Không đọc — không có gì mới |
| `Book1.xlsx` | Phân rã chức năng 5 module + map Step→Master data | Sheet `Sheet1` là bảng định mức nội bộ, không liên quan |
| `Mo ta phan mem HR_23.06.2025.xlsx` | Bản mô tả cũ hơn + **log Q&A với khách** | Giải thích *vì sao* chốt như vậy; có sheet `12.BM05` không có ở file mới |
| `NS_Câu hỏi khảo sát nghiệp vụ hệ thống.docx` | Khảo sát phòng Nhân sự (ThuLH) | Hiện trạng SAP + Excel; căn cứ pháp lý của biểu mẫu |

## Năm điều dễ hiểu sai nhất

1. **"Gốc quản trị là nhiệm vụ"** (BRD §2) — nhiệm vụ chia thành *nội dung công việc*, không có tầng
   cha nào. Mâu thuẫn với `P1` trong `.harness/state/decisions.md`; là câu hỏi chặn chưa chốt.
2. **Chấm công gán ngày → nội dung công việc**, không phải ngày → đề tài. Mỗi ngày đúng **1** nội
   dung CV.
3. **CPNC không phải một con số** mà là vector **14 khoản mục lương**, chia pro-rata theo
   `congPhanBo / congTinhLuong` *của chính người đó*. Chi tiết + kiểm chứng bằng số thật:
   [`bieu-mau-bm0-bm5.md §6`](trich-xuat/bieu-mau-bm0-bm5.md).
4. **Bảng lương chỉ import và chỉ đọc** — BRD §6 giới hạn rõ *"không xử lý lương chi tiết"*. Không
   dựng module CRUD lương.
5. **Biểu mẫu là văn bản pháp lý**, theo QĐ 3021/QĐ-CNVTQĐ-CNCNC — mã `BM.03.01`, `BM.04.01`,
   `BM.04.02`, `BM.05`, `BM.06`. Phần kết xuất Excel/in phải bám đúng file gốc, không tự bịa bố cục.

## Trích xuất lại

Khi khách gửi bản cập nhật, chạy lại để đối chiếu:

```bash
cd docs/hr_tool/trich-xuat
PYTHONUTF8=1 python trich-xuat.py            # in toàn bộ nội dung
PYTHONUTF8=1 python trich-xuat.py --sheets   # chỉ liệt kê tên sheet
```

⚠ `PYTHONUTF8=1` là **bắt buộc trên Windows** — thiếu nó thì `print()` chết ngay dòng tiếng Việt đầu
tiên với `UnicodeEncodeError` (cp1252). Phụ thuộc: `openpyxl`, `python-docx` — đã có sẵn trong Python
của máy dev, không thêm vào repo.

Script chỉ in ra text; các file `.md` là kết quả biên tập tay từ output đó (có thêm ghi chú của đội
phát triển, luôn gắn nhãn **[ghi chú]** để phân biệt với lời của khách).

⚠ **Script không đọc ảnh nhúng.** Sơ đồ quy trình tháng của khách nằm trong `0.QuyTrinh` dưới dạng
PNG (`xl/media/image1.png`) — chạy script bao nhiêu lần cũng không ra. Đã chép tay vào
[`dac-ta-man-hinh.md §0.1`](trich-xuat/dac-ta-man-hinh.md). Khi khách gửi bản mới, **mở file bằng
Excel xem có ảnh/sơ đồ nào không**, đừng tin mỗi output của script:

```bash
python -c "import zipfile;print([n for n in zipfile.ZipFile('<file>.xlsx').namelist() if 'media' in n])"
```

## Còn thiếu — nên xin khách

- **QĐ 9915/QĐ-CNVTQĐ** (22/08/2024) và **QĐ 3021/QĐ-CNVTQĐ-CNCNC** (28/03/2024) — hai văn bản gốc
  quy định biểu mẫu và cách lập dự toán CPNC.
- Danh mục **ký hiệu công** đầy đủ (file mẫu chỉ lộ `X`, `P`, `DL`).
- **Ba câu hỏi QT1–QT3** ở [`dac-ta-man-hinh.md §6`](trich-xuat/dac-ta-man-hinh.md) — bước "HR thẩm
  định" có nút không, "feedback" có phải đường trả lại không, PAKD xuất BM2.1 hay BM2.2.
- Tài liệu API **VOffice**.
