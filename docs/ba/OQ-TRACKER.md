# OQ Tracker — QTKHCN (SRS)

> Mọi `[CẦN XÁC NHẬN]` / `[GIẢ ĐỊNH]` trong SRS phải có mã ở đây (D24).

## Quy ước mã

`OQ-QTKHCN-<NNN>` — tăng dần. Cột trạng thái: `Mở` | `Đã trả lời` | `Huỷ`.

## Sổ đăng ký

| Mã | Phân hệ/Module | Mô tả ngắn | Mức | Trạng thái | Phản hồi | SRS liên quan | Ngày tạo |
|---|---|---|---|---|---|---|---|
| `OQ-QTKHCN-001` | Quản trị quy trình | Scope/Permission chính xác cho Service Account Camunda 8 Identity | Trung bình | Mở | Môi trường Dev không bật OIDC Auth; Staging/Prod dùng scope `READ:PROCESS_DEFINITION`. | `SRS-BPM-01`, `SRS-PH4-01` | 2026-08-05 |
| `OQ-QTKHCN-002` | Quản trị quy trình | Phân trang cursor `hasMoreTotalItems` khi số lượng quy trình vượt `MAX_SCAN = 500` | Thấp | Mở | v0.1 dùng warning notification cố định; v0.2 sẽ hỗ trợ auto cursor pagination. | `SRS-BPM-01`, `SRS-PH4-01` | 2026-08-05 |
| `OQ-QTKHCN-003` | Phân quyền PH2 | Quy tắc kết hợp Data Scope khi 1 user có 2 vai trò có Scope khác nhau (`ORG` vs `OWN_MISSION`) | Trung bình | Mở | Ưu tiên lấy Scope rộng hơn (`ALL` > `ORG` > `OWN_MISSION` > `OWN`). | `SRS-PH2-01` | 2026-08-05 |
| `OQ-QTKHCN-004` | Phân quyền PH2 | Phương án Migrate 30+ vai trò mặc định sang Ma trận 2 chiều Feature x Action mới | Trung bình | Mở | Gán tạm các pair cũ vào Feature `GENERAL` và cung cấp UI rà soát ma trận. | `SRS-PH2-01` | 2026-08-05 |
| `OQ-QTKHCN-005` | Quản trị quy trình PH4 | Quy định cơ chế tự động mở Incident / Retry khi Zeebe Worker bị Timeout với hệ thống ngoài | Trung bình | Mở | Tự động Retry 3 lần trước khi đánh dấu trạng thái `INCIDENT` trên Process Monitor. | `SRS-PH4-01` | 2026-08-05 |
| `OQ-QTKHCN-006` | Xét duyệt Chủ trương RD01 | Cấu hình tỷ lệ phê duyệt tối thiểu của HĐ KHCN đối với Báo cáo thẩm định chủ trương | Thấp | Mở | Đồng ý tối thiểu 2/3 tổng số thành viên Hội đồng có mặt. | `SRS-RD01-01` | 2026-08-05 |
| `OQ-QTKHCN-007` | Quyết toán RD06 | Tần suất đồng bộ tự động số liệu chi phí thực tế từ hệ thống SAP ERP | Trung bình | Mở | Hỗ trợ nút đồng bộ thủ công + Job đồng bộ định kỳ lúc 00:00 hằng ngày. | `SRS-RD06-01` | 2026-08-05 |
| `OQ-QTKHCN-008` | Xét duyệt RD02 | Mockup ghi RD02.02 cấp Tập đoàn nhưng tài liệu viết cho cấp Cơ sở (CS) | Cao | Mở | | `SRS-RD02-01` | 2026-08-06 |
| `OQ-QTKHCN-009` | Xét duyệt RD02 | Thiếu mockup chi tiết cho Hội đồng xét duyệt Phiên 1, Phiên 2, phiếu đánh giá và Biên bản | Cao | Mở | | `SRS-RD02-01` | 2026-08-06 |
| `OQ-QTKHCN-010` | Xét duyệt RD02 | Cơ chế tích hợp Voffice / chữ ký số khi BGĐ ký Quyết định dự thảo | Trung bình | Mở | | `SRS-RD02-01` | 2026-08-06 |
| `OQ-QTKHCN-011` | Xét duyệt RD02 | Điều kiện đủ để chuyển tiếp từ bước Chuyên quản thẩm định song song sang bước lập HĐ | Trung bình | Mở | | `SRS-RD02-01` | 2026-08-06 |
| `OQ-QTKHCN-012` | Xét duyệt RD02 | Quy trình rework và đích trả về của hồ sơ khi Chuyên quản đánh giá Chưa đạt | Trung bình | Mở | | `SRS-RD02-01` | 2026-08-06 |
| `OQ-QTKHCN-013` | Danh mục SPDV RD07 | Mã role / candidateGroup chính thức cho 4 tuyến (QLDM SPDV, TT KD VHT, TTNCSP, P.TCKT VHT) | Cao | Mở | | `SRS-RD07-01` | 2026-08-07 |
| `OQ-QTKHCN-014` | Danh mục SPDV RD07 | RD07 thuộc Pha 1 hay Pha 2 triển khai Camunda? (lifecycle hiện phase: 2) | Trung bình | Mở | | `SRS-RD07-01` | 2026-08-07 |
| `OQ-QTKHCN-019` | Hồ sơ xét duyệt RD02 | Tab Kết quả BA ghi “đồng bộ danh sách quy trình từ Camunda” — giả định lỗi dán từ QT03; tab = QĐ giao NV + eForm | Cao | Mở | | `Catalog-Quyen-Man-Hinh-Vong-Doi-KHCN.md` | 2026-09-17 |
| `OQ-QTKHCN-020` | Hội đồng | Jobworker tạo Hội đồng KHCN không cấp mã quyền màn hình (worker hệ thống) | Thấp | Mở | | `Catalog-Quyen-Man-Hinh-Vong-Doi-KHCN.md` | 2026-09-17 |
| `OQ-QTKHCN-021` | Hội đồng | Hai dòng “Phiếu đánh giá”: tách PDG01 (cấu hình mẫu) và PDG02 (lập/ký PĐG) | Trung bình | Mở | | `Catalog-Quyen-Man-Hinh-Vong-Doi-KHCN.md` | 2026-09-17 |
| `OQ-QTKHCN-022` | Hồ sơ (mọi loại) | Nhãn “Xóa sử dụng Hồ sơ …” coi là quyền Xóa (`*05`) | Thấp | Mở | | `Catalog-Quyen-Man-Hinh-Vong-Doi-KHCN.md` | 2026-09-17 |
| `OQ-QTKHCN-023` | Hồ sơ RD04/05/06 | BA không liệt kê đính kèm cho ĐC/NT/QT — không seed `*08`; generic HS05 vẫn cover `/ho-so/:id` | Trung bình | Mở | | `Catalog-Quyen-Man-Hinh-Vong-Doi-KHCN.md` | 2026-09-17 |
| `OQ-QTKHCN-024` | Hồ sơ RD01/RD02 | Không tách mã quyền theo cấp CS/TĐ; một Feature CT/XD, phân cấp bằng data-scope / biến `cap` | Trung bình | Mở | | `Catalog-Quyen-Man-Hinh-Vong-Doi-KHCN.md` | 2026-09-17 |

## Ghi chú

- Không đánh dấu `Đã trả lời` khi cột Phản hồi còn trống.
- Khi trả lời, cập nhật SRS tương ứng rồi đổi trạng thái.
