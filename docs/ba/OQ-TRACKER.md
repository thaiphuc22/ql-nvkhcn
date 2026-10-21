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
| `OQ-QTKHCN-010` | Xét duyệt RD02 | Cơ chế tích hợp Voffice / chữ ký số khi BGĐ ký Quyết định dự thảo | Trung bình | Mở | | `SRS-RD02-01`, `SRS-INT-01` | 2026-08-06 |
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
| `OQ-QTKHCN-025` | Tích hợp V-Office | Giới hạn độ dài tối đa của docTitle theo cấu hình thực tế của V-Office là bao nhiêu? URD đề xuất 250 ký tự phía QTKHCN. | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-026` | Tích hợp V-Office | Danh mục mã hình thức văn bản (hinhthucVanban) áp dụng cho dự án gồm những giá trị nào? | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-027` | Tích hợp V-Office | V-Office có hỗ trợ nâng cấp kênh truyền HTTPS/TLS cho Web Service trình ký hay không? | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-028` | Tích hợp V-Office | Timeout khuyến nghị chính thức khi gọi Web Service trình ký là bao nhiêu giây? Nguồn đề xuất 15–30 giây; SRS tạm khóa 30 giây. | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-029` | Tích hợp V-Office | V-Office có cung cấp API để chủ động tra cứu ngược trạng thái theo transCode trong tương lai không? | Thấp | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-030` | Tích hợp V-Office | Ngưỡng thời gian chính thức cho cơ chế đối soát định kỳ (ví dụ 48 giờ) đã phù hợp với SLA nghiệp vụ chưa? Chu kỳ job nguồn đề xuất 1–4 giờ; SRS tạm khóa 4 giờ và 48 giờ làm việc. | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-031` | Tích hợp V-Office | Cơ chế whitelist IP hai chiều giữa hệ thống QTKHCN và hạ tầng V-Office được thực hiện như thế nào? | Cao | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-032` | Tích hợp V-Office | Có cần hỗ trợ callback dạng batch (returnMultiSignReult) hay V-Office chỉ gọi lẻ từng văn bản? | Thấp | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-033` | Tích hợp V-Office | Khóa idempotent là (transCode, signResult) theo US-VOFFICE-02 hay (transCode, signResult, actionDate) theo phương án còn mở ở URD §6.7? SRS tạm khóa cặp (transCode, signResult). | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-034` | Tích hợp V-Office | Khi signStatus và signResult khác nhau, hệ thống lấy trường nào? Mẫu URD ghi hai trường thường cùng giá trị. SRS tạm lấy signResult. | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-035` | Tích hợp V-Office | Bốn mã quyền đề xuất VOFFICE_SIGN.CREATE, VIEW, VIEW_HISTORY, ADMIN ánh xạ vào mã catalog quyền hiện có của QTKHCN như thế nào? | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-036` | Tích hợp V-Office | Thông báo cho người tạo văn bản dùng kênh nào? URD ghi in-app/email tùy thiết kế. SRS tạm khóa thông báo trong ứng dụng. | Trung bình | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-037` | Tích hợp V-Office | ResultObj mẫu không có trường file kết quả. File văn bản đã ban hành được trả bằng trường nào hoặc bằng API nào? | Cao | Mở | | `SRS-INT-01` | 2026-09-23 |
| `OQ-QTKHCN-038` | RD10 Kho tài liệu | Production dùng storage/API nào (hotroit hay hệ thống khác)? Path `rootPath` và upload binary chốt thế nào? | Cao | Mở | | `SRS-RD10-01` | 2026-09-28 |
| `OQ-QTKHCN-039` | RD10 Kho tài liệu | ACL runtime theo thư mục (view/update) áp dụng và đồng bộ từ user đề xuất trên PYC thế nào? | Cao | Mở | | `SRS-RD10-01` | 2026-09-28 |
| `OQ-QTKHCN-040` | RD10 Kho tài liệu | Mã quyền catalog chính thức cho `/kho-tai-lieu` và từng hành động (xem mẫu, CRUD PYC, duyệt, upload)? Hiện tạm `NV01`. | Cao | Mở | | `SRS-RD10-01` | 2026-09-28 |
| `OQ-QTKHCN-041` | RD10 Kho tài liệu | Chu kỳ audit P.ĐBCL và retention metadata/file? | Trung bình | Mở | | `SRS-RD10-01` | 2026-09-28 |
| `OQ-QTKHCN-042` | RD10 Kho tài liệu | Có cần editor đầy đủ thêm/xóa/đổi tên node cây mẫu ngoài khôi phục seed không? | Thấp | Mở | | `SRS-RD10-01` | 2026-09-28 |
| `OQ-QTKHCN-043` | RD06 Quyết toán | Xác nhận bảng tác nhân tạm khóa (BA-Khao-sat-tac-nhan-RD06-RD08): PM→BGĐ→CQ→TCKT→CQNV→BTGĐ/TGĐ (+ tuyến TĐ). Có thêm KT nội bộ / đơn vị quỹ? | Cao | Mở | | `BA-Khao-sat-tac-nhan-RD06-RD08-v0.1` | 2026-09-29 |
| `OQ-QTKHCN-044` | RD08 SHTT | Xác nhận tác nhân: PM/tác giả → BGĐ → CQ KHCN → Pháp chế? → BTGĐ. Ai nộp Cục SHTT / nhận văn bằng? | Cao | Mở | | `BA-Khao-sat-tac-nhan-RD06-RD08-v0.1` | 2026-09-29 |

## Ghi chú

- Không đánh dấu `Đã trả lời` khi cột Phản hồi còn trống.
- Khi trả lời, cập nhật SRS tương ứng rồi đổi trạng thái.
