# Requirements Catalog — RD01 & RD02 (Xét duyệt Chủ trương / Xét duyệt NV KHCN)

> **Skill:** SKILL-REQUIREMENT-EXTRACTOR v1.0 · **Nguồn:** `docs/req/1. Quy trinh Phan mem KHCN chi tiet (clean).md` (mục II.1 & II.2)
> **Ngày:** 2026-07-03 · **Phạm vi:** RD01.01, RD01.02, RD02.01, RD02.02 (ưu tiên 2026)
> **Kỷ luật:** mỗi requirement có nguồn trích dẫn (mục tài liệu); không suy diễn ngoài evidence; gap → open_question.
> **overall_confidence: 0.80** — nguồn là quy trình chính thức (ngôn ngữ rõ) nhưng thiếu NFR & luồng rework.

**Phân loại (BABOK v3 §8):** B = Business · SF = Solution-Functional · NF = Solution-Non-Functional · TR = Transition · BR = Business Rule

---

## 1. Business requirements (mục đích / trọng tâm 2026)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-B-001 | B | Số hoá toàn trình luồng xét duyệt chủ trương & xét duyệt NV KHCN, đảm bảo 1 luồng xuyên suốt trên phần mềm | I.1 Mục đích; BC_PRESALE (trọng tâm 2026) | 0.90 |
| REQ-B-002 | B | Hỗ trợ chỉ huy ra quyết định phê duyệt dựa trên dữ liệu số (hồ sơ, báo cáo thẩm định trực tuyến) | I.1 Mục đích | 0.82 |

## 2. RD01.01 — Xét duyệt Chủ trương cấp Cơ sở

**Sự kiện bắt đầu:** Khởi tạo nhiệm vụ · **Kết thúc:** QĐ phê duyệt chủ trương cấp cơ sở (mục 1.1)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0101-SF-001 | SF | Hệ thống PHẢI cho phép PM/PA/NNC khởi tạo hồ sơ chủ trương nhiệm vụ | 1.1.2 (PM) | 0.90 |
| REQ-RD0101-SF-002 | SF | Hệ thống PHẢI cho phép PM/PA/NNC xây dựng & trình ký hồ sơ chủ trương | 1.1.2 (PM) | 0.88 |
| REQ-RD0101-SF-003 | SF | Hệ thống PHẢI định tuyến hồ sơ tới BGĐ TT/BGĐ Khối để ký duyệt | 1.1.2 (BGĐ TT/Khối) | 0.88 |
| REQ-RD0101-SF-004 | SF | Hệ thống PHẢI cho phép Chuyên hướng (CQNV VHT) đọc & góp ý về hồ sơ | 1.1.2 (CQNV VHT) | 0.85 |
| REQ-RD0101-SF-005 | SF | Hệ thống PHẢI cho phép TP CLKHCN/TCKT/NS & GĐ TTMS thẩm định hồ sơ thông qua phiếu nhận xét | 1.1.2 (CQNV VHT) | 0.85 |
| REQ-RD0101-SF-006 | SF | Hệ thống PHẢI cho phép CQ QLKHCN VHT (Chuyên hướng KHCN / TP CLKHCN) lập Báo cáo thẩm định về hồ sơ | 1.1.2 (CQ QLKHCN VHT) | 0.88 |
| REQ-RD0101-SF-007 | SF | Hệ thống PHẢI sinh danh sách Hội đồng KHCN (tự động/thủ công) theo đơn vị/lĩnh vực, dựa trên QĐ thành lập tương ứng | 1.1.2 (HĐKHCN) | 0.72 |
| REQ-RD0101-SF-008 | SF | Hệ thống PHẢI cho phép thành viên HĐKHCN (PTGĐ Chuyên trách phê duyệt; TP CLKHCN/TCKT/NS, GĐ TTMS ký duyệt) phê duyệt/từ chối Báo cáo thẩm định về hồ sơ chủ trương | 1.1.2 (HĐKHCN) | 0.86 |
| REQ-RD0101-SF-009 | SF | Hệ thống PHẢI cho phép TGĐ VHT phê duyệt/từ chối Quyết định phê duyệt Chủ trương đề tài | 1.1.2 (TGĐ VHT) | 0.92 |
| BR-RD0101-001 | BR | Chỉ đề tài **có trong kế hoạch năm được phê duyệt** mới được khởi tạo xét duyệt chủ trương | 1.1 (Điều kiện ràng buộc) | 0.90 |

## 3. RD01.02 — Xét duyệt Chủ trương cấp Tập đoàn

**Kết thúc:** QĐ phê duyệt chủ trương cấp Tập đoàn (mục 1.2). Kế thừa toàn bộ vai trò cấp CS, bổ sung:

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0102-SF-001 | SF | Hệ thống PHẢI cho phép CQ KHCN TĐ (Ban CNCNC Tập đoàn) lập CV đề nghị thẩm định & Báo cáo thông qua chủ trương | 1.2.2 (CQ KHCN TĐ) | 0.85 |
| REQ-RD0102-SF-002 | SF | Hệ thống PHẢI cho phép HĐ KHCN TĐ nhận xét + phê duyệt + hiển thị thông tin | 1.2.2 (HĐ KHCN TĐ) | 0.84 |
| REQ-RD0102-SF-003 | SF | Hệ thống PHẢI cho phép CQNV TĐ (TB TCKT/ĐTXD/CNCNC/TCNL TĐ) nhận xét + phê duyệt | 1.2.2 (CQNV TĐ) | 0.82 |
| REQ-RD0102-SF-004 | SF | Hệ thống PHẢI cho phép TGĐ TĐ/Chủ tịch TĐ (hoặc người được ủy quyền) phê duyệt chủ trương | 1.2.2 (TGĐ TĐ) | 0.86 |
| REQ-XC-SF-001 | SF | **[Cross-cutting]** Hệ thống PHẢI hỗ trợ cơ chế "vai trò thay thế": Chuyên quản CLKHCN/TCKT/MS/NS cập nhật dữ liệu hộ (Nhận xét + CV + BC thẩm định + Phê duyệt) cho các tác nhân cấp Tập đoàn không trực tiếp dùng phần mềm | 1.2.2; I.3.2 (ghi chú Tập đoàn không trực tiếp tham gia) | 0.80 |

## 4. RD02.01 — Xét duyệt NV KHCN cấp Cơ sở

**Bắt đầu:** Khởi tạo xét duyệt NV KHCN cấp CS (thông tin đề tài theo chủ trương đã duyệt) · **Kết thúc:** QĐ phê duyệt NV KHCN cấp cơ sở (mục 2.1)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0201-SF-001 | SF | Hệ thống PHẢI cho phép khởi tạo nghiệp vụ xét duyệt NV KHCN cấp CS, kế thừa thông tin đề tài từ chủ trương đã được duyệt | 2.1 (Sự kiện bắt đầu) | 0.85 |
| REQ-RD0201-SF-002 | SF | Hệ thống PHẢI cho phép Chuyên quản KHCN/MS/NS/TCKT đọc, thẩm định, xây dựng hồ sơ và duyệt qua trạng thái **Đạt/Chưa đạt** | 2.1.2 (CQ KHCN/MS/NS/TCKT) | 0.87 |
| REQ-RD0201-SF-003 | SF | Hệ thống PHẢI cho phép CQ QLKHCN VHT lập & trình Quyết định TLHĐXD và Báo cáo thẩm định | 2.1.2 (CQ QLKHCN VHT) | 0.86 |
| REQ-RD0201-SF-004 | SF | Hệ thống PHẢI hỗ trợ HĐXD cấp CS ký phiếu nhận xét, phiếu đánh giá và Biên bản họp **phiên 1 & phiên 2** | 2.1.2 (HĐXD cấp CS) | 0.80 |
| REQ-RD0201-SF-005 | SF | Hệ thống PHẢI cho phép HĐ KHCN VHT phê duyệt/ký duyệt/từ chối Báo cáo thẩm định về hồ sơ xét duyệt | 2.1.2 (HĐ KHCN VHT) | 0.85 |
| REQ-RD0201-SF-006 | SF | Hệ thống PHẢI cho phép TGĐ VHT phê duyệt QĐ TL HĐXD và phê duyệt/từ chối Quyết định phê duyệt mở mới đề tài | 2.1.2 (TGĐ VHT) | 0.90 |
| BR-RD0201-001 | BR | Chỉ được khởi tạo xét duyệt NV KHCN cấp CS khi **đã có QĐ phê duyệt chủ trương cấp cơ sở** | 2.1 (Điều kiện ràng buộc) | 0.92 |
| TR-RD0201-001 | TR | Dữ liệu đề tài từ RD01 (chủ trương đã duyệt) PHẢI được chuyển/đồng bộ sang hồ sơ xét duyệt NV KHCN | 2.1 (Sự kiện bắt đầu) | 0.75 |

## 5. RD02.02 — Xét duyệt NV KHCN cấp Tập đoàn

**Kết thúc:** QĐ phê duyệt NV KHCN cấp Tập đoàn (mục 2.2). Kế thừa cấp CS, bổ sung:

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0202-SF-001 | SF | Hệ thống PHẢI cho phép CQNV VHT (TP CLKHCN/TCLK/NS, GĐ TTMS) ký duyệt CV đề nghị xét duyệt & HS đề nghị xét duyệt | 2.2.2 (CQNV VHT) | 0.82 |
| REQ-RD0202-SF-002 | SF | Hệ thống PHẢI hỗ trợ HĐXD TĐ theo danh sách QĐ TL HĐXD Tập đoàn (+ vai trò thay thế của Chuyên quản CLKHCN cập nhật PNX/PĐG/BB họp) | 2.2.2 (HĐXD TĐ) | 0.80 |
| REQ-RD0202-SF-003 | SF | Hệ thống PHẢI cho phép HĐ KHCN TĐ nhận xét + phê duyệt hồ sơ xét duyệt | 2.2.2 (HĐ KHCN TĐ) | 0.83 |
| REQ-RD0202-SF-004 | SF | Hệ thống PHẢI cho phép BTGĐ TĐ phê duyệt QĐ TL HĐXD và QĐ mở mới đề tài cấp Tập đoàn | 2.2.2 (BTGĐ TĐ) | 0.85 |
| BR-RD0202-001 | BR | Chỉ được khởi tạo xét duyệt NV KHCN cấp TĐ khi **đã có QĐ phê duyệt chủ trương cấp Tập đoàn** | 2.2 (Điều kiện ràng buộc) | 0.92 |

---

## 6. Assumptions

| ID | Assumption | Nguồn/lý do | Conf |
|---|---|---|---|
| ASSUMP-001 | "Vai trò thay thế" = nhân sự VHT (chuyên quản CLKHCN…) nhập liệu hộ vì tác nhân Tập đoàn không trực tiếp thao tác trên phần mềm | I.3.2 (ghi chú rõ Tập đoàn không trực tiếp tham gia) | 0.85 |
| ASSUMP-002 | Việc phân cấp Cơ sở vs Tập đoàn được quyết theo thẩm quyền/mức dự toán của đề tài (tài liệu không nêu tiêu chí phân cấp cụ thể) | Suy luận từ cặp luồng CS/TĐ song song | 0.55 |
| ASSUMP-003 | Danh mục "kế hoạch năm được phê duyệt" là dữ liệu có sẵn/được tích hợp, hệ thống chỉ kiểm tra ràng buộc | 1.1/2.1 (Điều kiện ràng buộc) | 0.50 |

## 7. Open questions (chặn sinh User Story / thiết kế)

| ID | Câu hỏi | Chặn cho |
|---|---|---|
| OQ-001 | Tiêu chí phân cấp **Cơ sở vs Tập đoàn** là gì (mức dự toán? loại đề tài?) | RD01.02, RD02.02 |
| OQ-002 | Khi tác nhân chọn **"Chưa đạt"** / từ chối, luồng quay lại bước nào (rework loop)? Có giới hạn số vòng? | RD01/RD02 toàn bộ |
| OQ-003 | Điều kiện chuyển từ **phiên 1 → phiên 2** của Hội đồng; có bắt buộc đủ 2 phiên không? | REQ-RD0201-SF-004 |
| OQ-004 | Tiêu chí **"tự động vs thủ công"** khi sinh danh sách Hội đồng | REQ-RD0101-SF-007 |
| OQ-005 | Nguồn dữ liệu "kế hoạch năm được phê duyệt" — tích hợp hệ thống nào để kiểm tra ràng buộc? | BR-RD0101-001 |
| OQ-006 | **NFR chưa có trong tài liệu:** SLA/thời hạn xử lý mỗi bước phê duyệt? Số cấp phê duyệt tối đa? Yêu cầu SSO/IAM, chữ ký số? | Tất cả RD01/RD02 |
| OQ-007 | Dữ liệu đề tài **đang dở dang** (in-flight) tại thời điểm go-live có cần migrate vào luồng số hoá không? | TR-RD0201-001 |

## 8. Ambiguities (từ mơ hồ cần định lượng)

| ID | Cụm mơ hồ | Ngữ cảnh | Đề xuất làm rõ |
|---|---|---|---|
| AMB-001 | "tự động/thủ công sinh" | Danh sách Hội đồng | Định nghĩa rule: khi nào tự sinh theo lĩnh vực, khi nào nhập tay |
| AMB-002 | "Đạt/Chưa đạt" | Trạng thái duyệt của chuyên quản | Định nghĩa hệ quả mỗi trạng thái + luồng kế tiếp |
| AMB-003 | "Danh sách thay đổi theo Quyết định" | Cập nhật thành viên Hội đồng | Cơ chế versioning danh sách HĐ theo QĐ? |

---

## Validators

- ✅ **VALIDATOR-REQUIREMENT-ATOMICITY** — 26/26 requirement atomic (1 capability/req)
- ✅ **VALIDATOR-NO-DUPLICATION** — vai trò lặp giữa CS/TĐ đã tách bằng ID phân cấp, không trùng nội dung
- ⚠️ **VALIDATOR-BUSINESS-VALUE** — SF requirements map về REQ-B-001; riêng nhánh NFR còn trống (xem OQ-006)

## Human review (bắt buộc)

- OQ-001, OQ-002, OQ-006 phải được BA/khách hàng làm rõ **trước khi** chuyển sang `skill-user-story-generator` (rework loop & NFR ảnh hưởng trực tiếp tới AC).
- ASSUMP-002/003 confidence < 0.6 → cần xác nhận.

## Follow-up skills

1. **skill-br-extractor** — chuẩn hoá BR-* + điều kiện Đạt/Chưa đạt thành decision table.
2. **skill-user-story-generator** — REQ-*-SF-* → User Story (sau khi giải quyết OQ-001/002/006).
3. **skill-traceability-builder** — dựng RTM: REQ-B-001 ↔ RD01/RD02 ↔ REQ-*-SF-* ↔ (US sắp có).
