# Requirements Catalog — RD07–RD10 (Danh mục SPDV / SHTT / Dashboard / Lưu trữ)

> **Skill:** SKILL-REQUIREMENT-EXTRACTOR v1.0 · **Nguồn:** `docs/req/1. Quy trinh Phan mem KHCN chi tiet (clean).md` (mục II.7–II.10)
> **Ngày:** 2026-07-03 · **Phạm vi:** RD07 (7.1–7.2), RD08, RD09, RD10
> **Nối tiếp:** `RD01-RD02-requirements.md`, `RD03-RD06-requirements.md`
> **overall_confidence: 0.62** — RD07 có bảng tác nhân; **RD08/RD09/RD10 chỉ là gạch đầu dòng mô tả, không có luồng/tác nhân → coverage thấp, nhiều gap.**

**Phân loại:** B = Business · SF = Solution-Functional · IR = Interface/Integration · NF = Non-Functional · TR = Transition · BR = Business Rule

---

## A. RD07 — Quản lý Danh mục dịch vụ, sản phẩm nghiên cứu (Pha 2)

**Ràng buộc:** Đồng bộ với CRM – quản lý kinh doanh (mục 7).

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD07-B-001 | B | Quản lý **vòng đời** từng sản phẩm/dịch vụ nghiên cứu: Nghiên cứu (thời gian hoàn thành) → Nghiệm thu → Kinh doanh (gồm doanh thu) → Cải tiến | 7 (mô tả) | 0.78 |
| REQ-RD07-SF-001 | SF | Hệ thống PHẢI cho phép Đơn vị Quản lý Danh mục SPDV khởi tạo hồ sơ danh mục và xuất/cập nhật dữ liệu | 7.2 (Đơn vị QL Danh mục SPDV) | 0.82 |
| REQ-RD07-SF-002 | SF | Hệ thống PHẢI cho phép TT KD VHT, TT NCSP, P.TCKT VHT xây dựng, đọc và cập nhật hồ sơ danh mục SPDV | 7.2 (TT KD / TT NCSP / P.TCKT) | 0.80 |
| REQ-RD07-IR-001 | IR | Hệ thống PHẢI đồng bộ với CRM để quản lý thông tin kinh doanh/doanh thu của sản phẩm | 7 (Điều kiện ràng buộc) | 0.75 |
| BR-RD07-001 | BR | Thông tin vòng đời sản phẩm kế thừa từ kết quả nghiệm thu (RD05) và danh sách sản phẩm NV KHCN (RD03.5/PLM) | Suy từ 7 + 3.5 + 5 | 0.55 |

## B. RD08 — Quản lý sở hữu trí tuệ (Pha 1)

**Ràng buộc:** Gắn nghiệp vụ quản lý thực hiện đề tài (RD03); đồng bộ với kho lưu trữ (Storage). ⚠️ *Không có bảng tác nhân/luồng trong tài liệu.*

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD08-SF-001 | SF | Hệ thống PHẢI cho phép quản lý nghiệp vụ đăng ký sở hữu trí tuệ (Bài báo, sáng chế) | 8 (mô tả) | 0.75 |
| REQ-RD08-SF-002 | SF | Hệ thống PHẢI cho phép quản lý công nghệ lõi hình thành từ NV KHCN | 8 (mô tả) | 0.72 |
| REQ-RD08-IR-001 | IR | Hệ thống PHẢI đồng bộ dữ liệu SHTT với kho lưu trữ tài liệu (Storage) | 8 (Điều kiện ràng buộc) | 0.72 |
| BR-RD08-001 | BR | Tài sản SHTT gắn với NV KHCN tương ứng (nghiệp vụ quản lý thực hiện đề tài) | 8 (Điều kiện ràng buộc) | 0.72 |

## C. RD09 — Quản lý, tổng hợp thông tin / Dashboard (Pha 2)

⚠️ *Chỉ mô tả mục tiêu, không có chỉ số/biểu đồ cụ thể.*

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD09-B-001 | B | Cung cấp bức tranh tổng thể tình hình thực hiện NV KHCN theo **thời gian thực** (từng đề tài và tất cả đề tài) | 9 (mô tả) | 0.80 |
| REQ-RD09-SF-001 | SF | Hệ thống PHẢI cung cấp dashboard tổng hợp: danh mục đề tài, chi phí đề tài, nhân sự, tài sản trí tuệ | 9 (mô tả) | 0.80 |
| REQ-RD09-SF-002 | SF | Hệ thống PHẢI hỗ trợ xem theo phạm vi: một đề tài cụ thể và toàn bộ đề tài | 9 (mô tả) | 0.78 |
| REQ-RD09-IR-001 | IR | Dashboard PHẢI tổng hợp dữ liệu xuyên các phân hệ RD01–RD08 (chi phí từ SAP, nhân sự từ QLNS, tài sản/SHTT…) | Suy từ 9 + RD03/RD08 | 0.60 |
| REQ-RD09-NF-001 | NF | Dữ liệu dashboard PHẢI phản ánh "thời gian thực" — cần định nghĩa độ trễ tối đa chấp nhận được | 9 ("theo thời gian thực") | 0.55 |

## D. RD10 — Quản lý, lưu trữ Hồ sơ, tài liệu, văn bản pháp lý KHCN (Pha 1)

Nền tảng biểu mẫu/tài liệu dùng chung cho toàn bộ RD01–RD06.

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD10-SF-001 | SF | Hệ thống PHẢI quản lý form mẫu hồ sơ đề tài | 10 (mô tả) | 0.80 |
| REQ-RD10-SF-002 | SF | Hệ thống PHẢI quản lý form mẫu báo cáo | 10 (mô tả) | 0.80 |
| REQ-RD10-SF-003 | SF | Hệ thống PHẢI quản lý danh sách quy trình/quy định KHCN | 10 (mô tả) | 0.78 |
| BR-RD10-001 | BR | Mọi hồ sơ trong RD01–RD06 sử dụng form mẫu do RD10 quản lý (nguồn biểu mẫu dùng chung) | Suy từ 10 + toàn tài liệu | 0.60 |

---

## E. Assumptions

| ID | Assumption | Nguồn/lý do | Conf |
|---|---|---|---|
| ASSUMP-007 | RD10 đóng vai trò master data biểu mẫu/quy trình dùng chung cho toàn hệ thống (không chỉ lưu trữ thụ động) | Suy từ vai trò biểu mẫu trong RD01–RD06 | 0.55 |
| ASSUMP-008 | RD09 (Dashboard) là tầng đọc/tổng hợp, không phát sinh dữ liệu gốc | Bản chất dashboard | 0.75 |
| ASSUMP-009 | "Sản phẩm" trong RD07 chính là danh sách sản phẩm NV KHCN quản lý ở RD03.5 (PLM) | Nhất quán thuật ngữ | 0.55 |

## F. Open questions

| ID | Câu hỏi | Chặn cho |
|---|---|---|
| OQ-014 | **RD08 (SHTT)** — không có tác nhân/luồng: quy trình đăng ký SHTT nội bộ và với cơ quan ngoài (Cục SHTT) như thế nào? Ai phê duyệt? | RD08 (gap) |
| OQ-015 | **RD09 (Dashboard)** — danh sách chỉ số/biểu đồ/bộ lọc cụ thể? Phân quyền xem theo vai trò (BTGĐ vs PM)? | REQ-RD09-SF-001/002 |
| OQ-016 | RD09 "thời gian thực" — độ trễ tối đa chấp nhận (real-time thật sự hay near-real-time/batch)? | REQ-RD09-NF-001 |
| OQ-017 | **RD10** — cơ chế versioning biểu mẫu/quy trình? Khi biểu mẫu đổi, hồ sơ cũ giữ bản nào? | REQ-RD10-* |
| OQ-018 | RD07 quan hệ với RD05 (nghiệm thu) và CRM: điểm nào tạo bản ghi SPDV, đồng bộ doanh thu 1 chiều hay 2 chiều? | REQ-RD07-IR-001 |

## G. Ambiguities

| ID | Cụm mơ hồ | Ngữ cảnh | Đề xuất làm rõ |
|---|---|---|---|
| AMB-007 | "thời gian thực" | Dashboard RD09 | Định lượng độ trễ (real-time / ≤5 phút / ≤1 giờ / cuối ngày) |
| AMB-008 | "công nghệ lõi" | RD08 | Định nghĩa đối tượng "công nghệ lõi" + trường dữ liệu quản lý |
| AMB-009 | "cải tiến" | Vòng đời SPDV RD07 | Cải tiến là trạng thái vòng đời hay 1 loại NV KHCN mới? |

## Validators

- ✅ **VALIDATOR-REQUIREMENT-ATOMICITY** — 18/18 atomic.
- ✅ **VALIDATOR-NO-DUPLICATION** — không trùng.
- ⚠️ **VALIDATOR-BUSINESS-VALUE** — RD08/RD09/RD10 coverage thấp do nguồn chỉ là mô tả gạch đầu dòng; nhiều BR/actor là suy luận (conf < 0.6).

---

# 📊 Tổng hợp toàn catalog — RD01 → RD10

| Phân hệ | Pha | File | Requirements | Điểm chú ý |
|---|---|---|---|---|
| RD01 Xét duyệt Chủ trương | 1 | RD01-RD02 | (chung 26) | đầy đủ |
| RD02 Xét duyệt NV KHCN | 1 | RD01-RD02 | ↑ | đầy đủ |
| RD03 Thực hiện NV KHCN | 2 | RD03-RD06 | 18 | 12 interface (5 hệ thống) |
| RD04 Điều chỉnh NV KHCN | 2 | RD03-RD06 | 13 | 5 BR định tuyến, thiếu ngưỡng |
| RD05 Nghiệm thu | 1 | RD03-RD06 | 8 | đầy đủ |
| RD06 Quyết toán | 1 | RD03-RD06 | 4 | ⚠️ gap tác nhân |
| RD07 Danh mục SPDV | 2 | RD07-RD10 | 5 | có tác nhân, cần CRM |
| RD08 Sở hữu trí tuệ | 1 | RD07-RD10 | 4 | ⚠️ gap luồng/tác nhân |
| RD09 Dashboard | 2 | RD07-RD10 | 5 | thiếu chỉ số cụ thể |
| RD10 Lưu trữ/biểu mẫu | 1 | RD07-RD10 | 4 | master data biểu mẫu |
| **Tổng** | | 3 file | **~79 requirements** | 18 open questions · 9 assumptions |

## 🚩 Blockers cứng cần xử lý trước khi thiết kế (xếp theo mức độ)

1. **OQ-006 — NFR trống toàn hệ thống** (SLA phê duyệt, SSO/IAM, chữ ký số) → nối F2.
2. **OQ-010 — RD06 Quyết toán bỏ trống tác nhân/luồng** → cần khảo sát bổ sung.
3. **OQ-008 — RD04 thiếu ngưỡng định tuyến** (tăng dự toán/vượt chủ trương) → chặn decision table.
4. **OQ-002 — Luồng "Chưa đạt"/từ chối (rework)** chưa mô tả ở tất cả luồng phê duyệt.
5. **OQ-014/015 — RD08/RD09 thiếu luồng & chỉ số** → phần lớn Pha 2, có thể để sau.
6. **OQ-012 — nghi lỗi tài liệu gốc mục 3.5** → đối chiếu PDF/khách.

## Follow-up skills (cho toàn catalog)

1. **skill-br-extractor** — decision table: BR-RD04-* (định tuyến điều chỉnh) + trạng thái Đạt/Chưa đạt + điều kiện phân cấp CS/TĐ.
2. **skill-user-story-generator** — bắt đầu từ RD01/RD02 & RD05 (functional rõ, ít gap) → stories + AC.
3. **skill-traceability-builder** — RTM toàn trình RD01–RD10 ↔ requirements ↔ (user stories), đánh dấu RD06/RD08 coverage thấp.
