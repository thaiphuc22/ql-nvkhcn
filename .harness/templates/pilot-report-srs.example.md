# Gói review pilot — SRS-TTCB-01 (Khu vực địa lý, v0.1)

**Mục đích**: Pilot F5 — kiểm chứng luồng F2→F3→F4 (D6/D7/D8) chạy được trong thực tế.
**Bước đã hoàn tất**: Bước 1 (Tự chấm DoD) theo D7.
**Bước tiếp theo cần người**: Bước 2 (Review nội bộ) — cần 1 BA khác chéo module + BA Lead ký
vào khung "Trang ký" có sẵn trong file `.docx`.

---

## Kết quả tự chấm DoD (`srs-definition-of-done.md`)

| Mục | Kết quả |
| --- | --- |
| Đối chiếu blueprint gốc (v1.2) | ✅ Khớp — 2 chức năng + 1 quy trình, không thiếu |
| Tiêu đề tài liệu | ✅ Đúng tên phân hệ |
| Khung 6 mục cấp 1 | ✅ Đủ 6/6. Mục 5 (quản trị dữ liệu) chỉ viết 4 đoạn văn không đánh số con, thiếu 2/6 chủ đề (5.3 Kiến trúc & tích hợp dữ liệu, 5.6 Lưu trữ vận hành) — v0.1 grandfathered theo D6, không bắt sửa |
| Mỗi chức năng đủ `.1–.4`, không nhảy số | ✅ Cả 2 chức năng đủ `.1–.5`, đánh số liên tục |
| Bảng field-level `.3` | ⚠️ Dùng 6 cột (STT/Tên/Kiểu dữ liệu/In-Out/**Giá trị khởi tạo**/Mô tả) — lệch nhiều hơn giả định ở D6 (không phải "8 cột trừ Bắt buộc/Mapping API"; có cột "Giá trị khởi tạo" ngoài chuẩn, Mapping DB gộp vào Mô tả). Grandfathered, không bắt sửa |
| Tag `[CẦN XÁC NHẬN]` ↔ mã OQ | ⚠️ 2 tag: 1 đã có mã (OQ-001) nhưng SRS + trạng thái OQ chưa cập nhật theo phản hồi VTS đã có; 1 chưa có mã → đã tạo **OQ-098** (xem dưới) |
| Ô trống mơ hồ | ✅ Không thấy "tuỳ chọn"/"linh hoạt" mơ hồ |

## Phát hiện cần người quyết định (đã hỏi, đã xử lý theo lựa chọn của bạn)

1. **OQ-001** (Cao, đã có phản hồi VTS "Nạp file thủ công") — trạng thái tracker vẫn "Mở",
   nội dung SRS (mục 2.2, 3.1.0) vẫn giữ `[CẦN XÁC NHẬN]` chưa phản ánh câu trả lời.
   **Quyết định**: không sửa file ở bước pilot này — chỉ ghi nhận ở đây, chờ bạn/BA xác minh
   lại với VTS trước khi cập nhật.
2. **Tag thứ 2** (xác nhận template thông báo dùng chung, mục 4.2) chưa có mã OQ.
   **Quyết định**: đã tạo **OQ-098** (Thấp) trong `BA/SRS-Open-Question-VTIT.xlsx`, nhóm
   "A. SRS-TTCB-01".

## Phát hiện về chính quy trình — ĐÃ KHOÁ VÀO D9 (2026-08-03)

- ~~DoD (D6) chưa có chỗ cho "Quy tắc nghiệp vụ riêng của từng chức năng"~~ → **Đã sửa**:
  `srs-definition-of-done.md` mục 2, `.5` nay cho phép cả "Bảng hành động theo trạng thái"
  lẫn "Quy tắc nghiệp vụ" (D9 mục 3).
- ~~Bước tự chấm D7 chưa nói rõ phải đối chiếu OQ đã có phản hồi VTS chưa~~ → **Đã sửa**: D9
  mục 2 bổ sung vào D7 bước 1 — nếu OQ đã có Phản hồi VTS, cập nhật ngược SRS + đổi Trạng thái.
- **Bảng field-level thực tế lệch xa hơn D6 mô tả** — khi viết SRS mới, đối chiếu trực tiếp
  với `SRS_Master_Skill.md` §2.3 thay vì suy ra từ 4 file cũ. (Ghi nhận, không cần khoá quyết
  định riêng — đã đúng hướng theo D6.)
- **Bổ sung mới (không có trong lần rà đầu)**: bước tự chấm nay có thêm **bước 1b — chạy
  `ba-doc-review`** (thu hẹp phạm vi: Ambiguity scan, Traceability vs blueprint, Compliance
  gap, Message template completeness) theo D9 mục 1. Áp thử lên chính file này: Ambiguity
  scan sạch (0 hit thật, đã loại các false-positive kiểu "nhiều khối địa bàn"); Message
  template completeness bắt được đúng gap đã nêu ở luồng Xóa địa bàn (thiếu mẫu câu dialog cụ
  thể khi có khách hàng bị ảnh hưởng — xem BR-KV-12, luồng c mục 3.1.2.4).

---

## Dành cho người xem xét (bước 2 — 2 ngày làm việc theo D7)

Vui lòng xem lại bảng trên + nội dung file `SRS-TTCB-01-Khu-vuc-dia-ly-v0.1.docx`, sau đó ký
vào khung "Trang ký" (2 ô "Người xem xét") trong chính file `.docx`. Ghi lại ở đây ngày bắt
đầu chờ review để đo SLA thực tế:

- **Ngày gửi review**: 2026-08-03
- **Người xem xét 1 (chéo module)**: _chưa gán_
- **Người xem xét 2 (BA Lead)**: _chưa gán_
- **Ngày phản hồi thực tế**: _chưa có_
