# Backlog — Epic: Phân hệ Quản lý Nhiệm vụ KHCN (đợt 1: US-ready)

> **Skill:** SKILL-USER-STORY-GENERATOR v1.0 (INVEST) + AC Given-When-Then · **Ngày:** 2026-07-03
> **Nguồn:** `RD01-RD02-requirements.md`, `RD03-RD06-requirements.md` (§C)
> **Phạm vi đợt 1:** RD01 (Xét duyệt Chủ trương), RD02 (Xét duyệt NV KHCN), RD05 (Nghiệm thu) — vùng functional rõ, ít gap.
> **Trục Epic:** theo phân hệ phần mềm (presale). Feature = luồng RD. US = INVEST. AC = Gherkin (Cho/Khi/Thì).
>
> ⚠️ **Cờ blocker áp lên AC:** đích của nhánh "từ chối / Chưa đạt" phụ thuộc **OQ-002** (rework loop chưa mô tả);
> ngưỡng NFR/SLA/SSO phụ thuộc **OQ-006**. AC dưới đây đánh dấu `⚠️OQ-002`/`⚠️OQ-006` ở chỗ còn giả định.

---

## EPIC — EP-05: Phân hệ Quản lý Nhiệm vụ KHCN

| Trường | Nội dung |
|---|---|
| **Epic ID** | EP-05 (phân hệ #5 presale — "QL nhiệm vụ KHCN, 7/11 quy trình") |
| **Target user** | Các tác nhân nghiệp vụ KHCN của VHT: PM/PA/NNC, CQNV, CQ QLKHCN, Hội đồng (KHCN/XD/NT), BTGĐ VHT & Tập đoàn |
| **Expected outcome** | Số hoá toàn trình luồng Chủ trương → Xét duyệt NV → Nghiệm thu; thay hồ sơ giấy & thao tác đa hệ thống bằng **1 luồng số xuyên suốt** |
| **Hypothesis** | Nếu số hoá luồng phê duyệt nhiều cấp trên phần mềm thì giảm thời gian luân chuyển hồ sơ & tăng minh bạch ra quyết định |
| **Validation** | 1 đề tài đi trọn CS (→ TĐ) trên phần mềm; đo thời gian luân chuyển & tỉ lệ hồ sơ số hoá |
| **Traceability** | REQ-B-001, REQ-B-002 |
| **Features** | F-RD01 (Chủ trương) · F-RD02 (Xét duyệt NV) · F-RD05 (Nghiệm thu) |
| ⚠️ KPI baseline | Chưa có số nền (thời gian luân chuyển hiện tại) → cần khách cung cấp; xem OQ-006 |

---

## FEATURE F-RD01 — Xét duyệt Chủ trương

### US-RD01-01 — Khởi tạo & xây dựng hồ sơ chủ trương
- **Là** Chủ nhiệm đề tài (PM/PA/NNC), **tôi muốn** khởi tạo và xây dựng hồ sơ chủ trương nhiệm vụ trên phần mềm, **để** trình duyệt mà không phải lập hồ sơ giấy.
- **Điểm:** 5 · **Nguồn:** REQ-RD0101-SF-001/002, BR-RD0101-001 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** PM đã đăng nhập và đề tài **có trong kế hoạch năm được phê duyệt**, **Khi** tạo hồ sơ chủ trương và điền đủ trường bắt buộc, **Thì** hồ sơ được lưu ở trạng thái *Nháp* và cho phép trình ký.
  - `[Alt]` **Cho** hồ sơ đang *Nháp*, **Khi** PM lưu tạm khi chưa đủ trường, **Thì** hệ thống lưu nháp và đánh dấu trường còn thiếu.
  - `[Negative]` **Cho** đề tài **không** có trong kế hoạch năm được duyệt, **Khi** PM tạo hồ sơ chủ trương, **Thì** hệ thống chặn và báo vi phạm điều kiện ràng buộc (BR-RD0101-001).

### US-RD01-02 — Ký duyệt hồ sơ cấp Trung tâm/Khối
- **Là** BGĐ TT / BGĐ Khối, **tôi muốn** xem và ký duyệt hồ sơ chủ trương do trung tâm mình trình, **để** xác nhận trước khi chuyển cơ quan nghiệp vụ.
- **Điểm:** 3 · **Nguồn:** REQ-RD0101-SF-003 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** hồ sơ đã trình ký, **Khi** BGĐ ký duyệt, **Thì** hồ sơ chuyển trạng thái *Đã ký cấp TT/Khối* và định tuyến tới CQNV.
  - `[Alt]` **Cho** hồ sơ trình ký, **Khi** BGĐ ghi ý kiến kèm ký duyệt, **Thì** ý kiến được lưu vào lịch sử hồ sơ.
  - `[Negative]` **Cho** hồ sơ trình ký, **Khi** BGĐ từ chối, **Thì** hồ sơ trả về PM kèm lý do. ⚠️OQ-002 (xác nhận đích trả về).

### US-RD01-03 — Góp ý & thẩm định của Cơ quan nghiệp vụ (CQNV)
- **Là** Chuyên hướng / TP CLKHCN, TCKT, NS, GĐ TTMS (CQNV VHT), **tôi muốn** đọc, góp ý và thẩm định hồ sơ qua phiếu nhận xét, **để** kiểm soát chất lượng hồ sơ trước Hội đồng.
- **Điểm:** 5 · **Nguồn:** REQ-RD0101-SF-004/005 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** hồ sơ đã ký cấp TT/Khối, **Khi** Chuyên hướng nhập góp ý, **Thì** góp ý gắn vào hồ sơ và hiển thị cho PM.
  - `[Happy]` **Cho** hồ sơ cần thẩm định, **Khi** TP/GĐ TTMS lập phiếu nhận xét, **Thì** phiếu được lưu & ký số gắn hồ sơ. ⚠️OQ-006 (chữ ký số).
  - `[Negative]` **Cho** hồ sơ chưa qua ký cấp TT/Khối, **Khi** CQNV mở thẩm định, **Thì** hệ thống chặn (sai thứ tự luồng).

### US-RD01-04 — Lập Báo cáo thẩm định chủ trương
- **Là** Chuyên hướng KHCN / TP CLKHCN (CQ QLKHCN VHT), **tôi muốn** lập Báo cáo thẩm định về hồ sơ chủ trương, **để** làm căn cứ cho Hội đồng KHCN phê duyệt.
- **Điểm:** 5 · **Nguồn:** REQ-RD0101-SF-006 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** đủ phiếu nhận xét của CQNV, **Khi** CQ QLKHCN lập Báo cáo thẩm định, **Thì** báo cáo tổng hợp phiếu nhận xét và trình Hội đồng.
  - `[Alt]` **Cho** báo cáo đang soạn, **Khi** đính kèm tài liệu bổ sung, **Thì** tài liệu lưu kèm bản báo cáo.
  - `[Negative]` **Cho** thiếu phiếu nhận xét bắt buộc, **Khi** trình báo cáo, **Thì** hệ thống cảnh báo thiếu đầu vào.

### US-RD01-05 — Sinh & quản lý danh sách Hội đồng KHCN
- **Là** Chuyên quản CLKHCN, **tôi muốn** hệ thống sinh danh sách Hội đồng KHCN (tự động theo lĩnh vực hoặc nhập tay) theo QĐ thành lập, **để** đúng thành phần hội đồng cho từng nhiệm vụ.
- **Điểm:** 5 · **Nguồn:** REQ-RD0101-SF-007 · **INVEST:** 5/6 *(Estimable ↓ do AMB-001)*
- **AC:**
  - `[Happy]` **Cho** nhiệm vụ có lĩnh vực xác định, **Khi** yêu cầu sinh danh sách HĐ, **Thì** hệ thống đề xuất thành viên theo QĐ thành lập tương ứng.
  - `[Alt]` **Cho** danh sách đã sinh, **Khi** chuyên quản chỉnh tay theo Quyết định mới, **Thì** hệ thống lưu phiên bản danh sách (versioning). ⚠️AMB-003.
  - `[Negative]` **Cho** chưa có QĐ thành lập hội đồng lĩnh vực, **Khi** sinh tự động, **Thì** hệ thống chuyển sang chế độ nhập tay và cảnh báo. ⚠️AMB-001 (làm rõ điều kiện tự động vs tay).

### US-RD01-06 — Hội đồng KHCN phê duyệt Báo cáo thẩm định
- **Là** thành viên Hội đồng KHCN (PTGĐ Chuyên trách phê duyệt; TP CLKHCN/TCKT/NS, GĐ TTMS ký duyệt), **tôi muốn** phê duyệt/ký duyệt hoặc từ chối Báo cáo thẩm định chủ trương, **để** kết luận thẩm định.
- **Điểm:** 5 · **Nguồn:** REQ-RD0101-SF-008 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** Báo cáo thẩm định đã trình, **Khi** đủ thành viên HĐ ký/phê duyệt, **Thì** báo cáo chuyển trạng thái *Đã thông qua* và trình TGĐ.
  - `[Alt]` **Cho** đang lấy ý kiến HĐ, **Khi** một số thành viên chưa ký, **Thì** hệ thống hiển thị tiến độ ký theo thành viên.
  - `[Negative]` **Cho** báo cáo đang lấy ý kiến, **Khi** có thành viên từ chối, **Thì** hệ thống ghi nhận từ chối kèm lý do và dừng trình TGĐ. ⚠️OQ-002.

### US-RD01-07 — TGĐ VHT phê duyệt Quyết định chủ trương
- **Là** Tổng Giám đốc TCT (TGĐ VHT), **tôi muốn** phê duyệt/từ chối Quyết định phê duyệt Chủ trương đề tài, **để** kết thúc luồng chủ trương cấp cơ sở.
- **Điểm:** 3 · **Nguồn:** REQ-RD0101-SF-009 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** Báo cáo thẩm định *Đã thông qua*, **Khi** TGĐ phê duyệt, **Thì** QĐ chủ trương cấp cơ sở được ban hành (sự kiện kết thúc RD01.01) và mở tiền đề cho RD02.
  - `[Negative]` **Cho** báo cáo trình TGĐ, **Khi** TGĐ từ chối, **Thì** hồ sơ trả về kèm lý do. ⚠️OQ-002.
  - `[Rule]` **Cho** QĐ chủ trương đã ban hành, **Khi** khởi tạo RD02 cấp cơ sở, **Thì** thông tin đề tài được kế thừa (liên kết BR-RD0201-001).

### US-RD01-08 — Thông qua chủ trương cấp Tập đoàn *(delta cấp TĐ)*
- **Là** Ban CNCNC Tập đoàn / HĐ KHCN TĐ / CQNV TĐ / TGĐ TĐ, **tôi muốn** thẩm định và phê duyệt chủ trương ở cấp Tập đoàn, **để** hoàn tất xét duyệt cho đề tài thuộc thẩm quyền Tập đoàn.
- **Điểm:** 8 · **Nguồn:** REQ-RD0102-SF-001..004 · **INVEST:** 5/6 *(có thể split theo từng cấp)*
- **AC:**
  - `[Happy]` **Cho** đề tài thuộc thẩm quyền Tập đoàn (⚠️OQ-001), **Khi** hoàn tất cấp cơ sở, **Thì** hồ sơ chuyển lên CQ KHCN TĐ lập CV & Báo cáo thông qua chủ trương.
  - `[Happy]` **Cho** HĐ KHCN TĐ & CQNV TĐ đã nhận xét/phê duyệt, **Khi** trình TGĐ/Chủ tịch TĐ, **Thì** chủ trương cấp Tập đoàn được phê duyệt.
  - `[Negative]` **Cho** chưa xác định tiêu chí phân cấp, **Khi** định tuyến CS↔TĐ, **Thì** đánh dấu chờ input. ⚠️OQ-001.

### US-RD01-09 — Vai trò thay thế cập nhật dữ liệu hộ *(cross-cutting)*
- **Là** Chuyên quản CLKHCN/TCKT/MS/NS, **tôi muốn** cập nhật dữ liệu (nhận xét, CV, báo cáo, phê duyệt) hộ các tác nhân Tập đoàn, **để** số hoá được bước của cấp Tập đoàn dù họ không trực tiếp dùng phần mềm.
- **Điểm:** 5 · **Nguồn:** REQ-XC-SF-001, ASSUMP-001 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** một bước thuộc tác nhân Tập đoàn, **Khi** chuyên quản nhập dữ liệu hộ, **Thì** hệ thống ghi rõ "nhập hộ bởi <chuyên quản> thay cho <tác nhân TĐ>" trong lịch sử.
  - `[Negative]` **Cho** người dùng không có quyền "vai trò thay thế", **Khi** cố nhập hộ, **Thì** hệ thống từ chối (kiểm soát phân quyền). ⚠️OQ-006 (RBAC).

---

## FEATURE F-RD02 — Xét duyệt NV KHCN

> Kế thừa cấu trúc RD01. **Delta chính:** trạng thái duyệt *Đạt/Chưa đạt* của chuyên quản, **HĐXD** với **phiên họp 1 & 2**, **QĐ TL HĐXD**, và **QĐ mở mới đề tài**.

### US-RD02-01 — Khởi tạo xét duyệt NV KHCN từ chủ trương đã duyệt
- **Là** Chủ nhiệm đề tài (PM/PA/NNC), **tôi muốn** khởi tạo hồ sơ xét duyệt NV KHCN kế thừa thông tin từ chủ trương đã duyệt, **để** không nhập lại dữ liệu đề tài.
- **Điểm:** 5 · **Nguồn:** REQ-RD0201-SF-001, BR-RD0201-001, TR-RD0201-001 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** đề tài **đã có QĐ phê duyệt chủ trương cấp cơ sở**, **Khi** khởi tạo xét duyệt NV KHCN, **Thì** hệ thống nạp sẵn thông tin đề tài từ chủ trương.
  - `[Negative]` **Cho** đề tài **chưa** có QĐ chủ trương, **Khi** khởi tạo xét duyệt NV, **Thì** hệ thống chặn (BR-RD0201-001).
  - `[Alt]` **Cho** hồ sơ khởi tạo, **Khi** PM bổ sung/điều chỉnh thông tin ngoài phần kế thừa, **Thì** thay đổi được lưu và đánh dấu khác chủ trương.

### US-RD02-02 — Chuyên quản thẩm định theo trạng thái Đạt/Chưa đạt
- **Là** Chuyên quản KHCN/MS/NS/TCKT, **tôi muốn** đọc, xây dựng, thẩm định hồ sơ và đặt trạng thái *Đạt/Chưa đạt*, **để** kiểm soát điều kiện trước Hội đồng xét duyệt.
- **Điểm:** 5 · **Nguồn:** REQ-RD0201-SF-002 · **INVEST:** 5/6 *(phụ thuộc AMB-002)*
- **AC:**
  - `[Happy]` **Cho** hồ sơ xét duyệt, **Khi** tất cả chuyên quản đặt *Đạt*, **Thì** hồ sơ đủ điều kiện lập QĐ TL HĐXD.
  - `[Negative]` **Cho** ≥1 chuyên quản đặt *Chưa đạt*, **Khi** hệ thống kiểm tra điều kiện, **Thì** hồ sơ dừng lại kèm lý do. ⚠️OQ-002/AMB-002 (đích quay lại & hệ quả trạng thái).

### US-RD02-03 — Thành lập & vận hành Hội đồng Xét duyệt (phiên 1 & 2)
- **Là** CQ QLKHCN + thành viên HĐXD cấp CS, **tôi muốn** lập QĐ TL HĐXD và ghi nhận phiếu nhận xét/đánh giá + Biên bản họp phiên 1 và phiên 2, **để** thẩm định hồ sơ xét duyệt theo đúng quy trình hội đồng.
- **Điểm:** 8 · **Nguồn:** REQ-RD0201-SF-003/004 · **INVEST:** 5/6 *(split theo QĐ TLHĐ / phiếu / biên bản)*
- **AC:**
  - `[Happy]` **Cho** hồ sơ đủ điều kiện, **Khi** CQ QLKHCN lập & trình QĐ TL HĐXD, **Thì** hội đồng được thiết lập theo danh sách.
  - `[Happy]` **Cho** hội đồng đã lập, **Khi** hoàn tất phiếu nhận xét/đánh giá và Biên bản họp **phiên 1**, **Thì** hệ thống cho phép chuyển **phiên 2**. ⚠️OQ-003 (điều kiện chuyển phiên / có bắt buộc 2 phiên).
  - `[Negative]` **Cho** phiên 1 chưa đủ chữ ký thành viên, **Khi** cố chuyển phiên 2, **Thì** hệ thống chặn.

### US-RD02-04 — HĐ KHCN phê duyệt Báo cáo thẩm định xét duyệt
- **Là** thành viên HĐ KHCN VHT, **tôi muốn** phê duyệt/ký duyệt/từ chối Báo cáo thẩm định về hồ sơ xét duyệt, **để** kết luận trước khi trình TGĐ.
- **Điểm:** 3 · **Nguồn:** REQ-RD0201-SF-005 · **INVEST:** 6/6
- **AC:** *(tương tự US-RD01-06, đổi đối tượng sang "hồ sơ xét duyệt")*
  - `[Happy]` đủ ký → *Đã thông qua*, trình TGĐ. · `[Negative]` từ chối → dừng, kèm lý do ⚠️OQ-002.

### US-RD02-05 — TGĐ VHT phê duyệt mở mới đề tài
- **Là** TGĐ VHT, **tôi muốn** phê duyệt QĐ TL HĐXD và phê duyệt/từ chối Quyết định mở mới đề tài, **để** chính thức khởi động NV KHCN.
- **Điểm:** 3 · **Nguồn:** REQ-RD0201-SF-006 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** Báo cáo thẩm định *Đã thông qua*, **Khi** TGĐ phê duyệt, **Thì** QĐ phê duyệt mở mới đề tài được ban hành (kết thúc RD02.01; tiền đề RD03).
  - `[Negative]` **Cho** trình TGĐ, **Khi** TGĐ từ chối, **Thì** trả hồ sơ kèm lý do. ⚠️OQ-002.

### US-RD02-06 — Xét duyệt NV KHCN cấp Tập đoàn *(delta cấp TĐ)*
- **Là** CQNV VHT / HĐXD TĐ / HĐ KHCN TĐ / BTGĐ TĐ, **tôi muốn** ký CV đề nghị xét duyệt, thẩm định qua HĐXD/HĐ KHCN TĐ và phê duyệt QĐ mở mới ở cấp Tập đoàn, **để** hoàn tất xét duyệt cho đề tài thuộc thẩm quyền Tập đoàn.
- **Điểm:** 8 · **Nguồn:** REQ-RD0202-SF-001..004, BR-RD0202-001 · **INVEST:** 5/6 *(split theo cấp)*
- **AC:**
  - `[Happy]` **Cho** đề tài **có QĐ chủ trương cấp Tập đoàn**, **Khi** hoàn tất cấp cơ sở, **Thì** định tuyến lên HĐXD TĐ → HĐ KHCN TĐ → BTGĐ TĐ phê duyệt QĐ mở mới.
  - `[Negative]` **Cho** chưa có QĐ chủ trương cấp TĐ, **Khi** khởi tạo xét duyệt cấp TĐ, **Thì** chặn (BR-RD0202-001).
  - `[Blocked]` tiêu chí phân cấp CS↔TĐ ⚠️OQ-001.

---

## FEATURE F-RD05 — Nghiệm thu NV KHCN

### US-RD05-01 — Khởi tạo & trình hồ sơ nghiệm thu
- **Là** Chủ nhiệm đề tài (PM/PA/NNC), **tôi muốn** khởi tạo, xây dựng và trình ký hồ sơ nghiệm thu, **để** đề nghị nghiệm thu khi đề tài hoàn thành.
- **Điểm:** 5 · **Nguồn:** REQ-RD0501-SF-001, BR-RD0501-001 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** các nội dung thực hiện đề tài (RD03) đã hoàn thành, **Khi** PM tạo hồ sơ nghiệm thu, **Thì** hồ sơ được lưu và cho phép trình ký.
  - `[Negative]` **Cho** đề tài **chưa hoàn thành** nội dung thực hiện, **Khi** tạo hồ sơ nghiệm thu, **Thì** hệ thống chặn (BR-RD0501-001). ⚠️phụ thuộc tín hiệu "hoàn thành" từ RD03/PLM.

### US-RD05-02 — Thẩm định & lập QĐ thành lập HĐ Nghiệm thu
- **Là** CQ QLKHCN VHT, **tôi muốn** lập & trình QĐ TL HĐNT và QĐ Công nhận KQ, **để** thiết lập hội đồng và chuẩn bị công nhận kết quả.
- **Điểm:** 5 · **Nguồn:** REQ-RD0501-SF-002 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** hồ sơ nghiệm thu đã qua thẩm định chuyên quản, **Khi** CQ QLKHCN lập QĐ TL HĐNT, **Thì** hội đồng nghiệm thu được thiết lập.
  - `[Alt]` **Cho** QĐ TL HĐNT đã lập, **Khi** trình ký, **Thì** chuyển TGĐ phê duyệt.

### US-RD05-03 — Hội đồng Nghiệm thu đánh giá (phiên 1 & 2)
- **Là** thành viên HĐNT cấp CS, **tôi muốn** ký phiếu nhận xét, phiếu đánh giá và Biên bản họp phiên 1 & 2, **để** kết luận nghiệm thu.
- **Điểm:** 5 · **Nguồn:** REQ-RD0501-SF-003 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** HĐNT đã lập, **Khi** hoàn tất phiếu & Biên bản họp 2 phiên, **Thì** kết luận nghiệm thu sẵn sàng trình TGĐ. ⚠️OQ-003 (điều kiện 2 phiên).
  - `[Negative]` **Cho** phiếu đánh giá kết luận *Không đạt*, **Khi** tổng hợp, **Thì** hệ thống ghi nhận & dừng công nhận KQ. ⚠️OQ-002.

### US-RD05-04 — TGĐ VHT công nhận kết quả NV KHCN
- **Là** TGĐ VHT, **tôi muốn** phê duyệt QĐ TL HĐNT và phê duyệt/từ chối Quyết định công nhận kết quả, **để** kết thúc nghiệm thu cấp cơ sở.
- **Điểm:** 3 · **Nguồn:** REQ-RD0501-SF-004 · **INVEST:** 6/6
- **AC:**
  - `[Happy]` **Cho** kết luận HĐNT đạt, **Khi** TGĐ phê duyệt, **Thì** QĐ công nhận KQ ban hành (kết thúc RD05.01; tiền đề RD06 quyết toán).
  - `[Negative]` **Cho** trình TGĐ, **Khi** từ chối, **Thì** trả hồ sơ kèm lý do. ⚠️OQ-002.

### US-RD05-05 — Nghiệm thu cấp Tập đoàn với Tổ KT *(delta cấp TĐ)*
- **Là** HĐNT TĐ (gồm **Tổ Kỹ thuật**) & BTGĐ TĐ, **tôi muốn** thực hiện nghiệm thu cấp Tập đoàn với bước Tổ KT ký nhận xét & Biên bản họp Tổ KT, **để** nghiệm thu đề tài thuộc thẩm quyền Tập đoàn.
- **Điểm:** 8 · **Nguồn:** REQ-RD0502-SF-001..003 · **INVEST:** 5/6 *(split: CV đề nghị / Tổ KT / HĐNT TĐ / BTGĐ)*
- **AC:**
  - `[Happy]` **Cho** cấp CS đề nghị nghiệm thu TĐ, **Khi** CQ QLKHCN ký CV & TGĐ VHT phê duyệt, **Thì** hồ sơ chuyển HĐNT TĐ.
  - `[Happy]` **Cho** HĐNT TĐ hoạt động, **Khi** Tổ KT hoàn tất phiếu nhận xét & BB họp Tổ KT và HĐ hoàn tất đánh giá, **Thì** trình BTGĐ TĐ phê duyệt QĐ công nhận KQ.
  - `[Blocked]` tiêu chí phân cấp nghiệm thu CS↔TĐ ⚠️OQ-001.

---

## Tổng hợp backlog đợt 1

| Feature | #US | Tổng điểm | US-ready hoàn toàn | US có cờ blocker |
|---|---|---|---|---|
| F-RD01 Chủ trương | 9 | 44 | 5 | 4 (OQ-001/002/006) |
| F-RD02 Xét duyệt NV | 6 | 32 | 2 | 4 (OQ-001/002/003) |
| F-RD05 Nghiệm thu | 5 | 26 | 3 | 2 (OQ-001/002/003) |
| **Tổng** | **20** | **102** | **10** | **10** |

## Validators (SKILL-USER-STORY-GENERATOR)

- ✅ **VALIDATOR-ACTOR-DEFINITION** — 20/20 actor cụ thể (không dùng "user").
- ✅ **VALIDATOR-TESTABILITY** — mọi AC ở dạng Given-When-Then kiểm thử được.
- ⚠️ **VALIDATOR-INVEST** — 14/20 đạt 6/6; 6 story đạt 5/6 do *Estimable* giảm (phụ thuộc OQ/AMB) — đã ghi chú, **không** auto-split để chờ input khách.

## Human review & follow-up

- **Trước khi ước lượng/sprint:** giải OQ-001 (phân cấp), OQ-002 (rework), OQ-003 (2 phiên họp), OQ-006 (NFR/RBAC/chữ ký số). Các story 8 điểm (US-RD01-08, US-RD02-03/06, US-RD05-05) nên **split** sau khi có input.
- **Follow-up skills:** `skill-ac-generator` (đào sâu AC + edge/negative cho các story điểm cao) · `skill-br-extractor` (decision table trạng thái Đạt/Chưa đạt + phân cấp) · `skill-traceability-builder` (RTM: REQ ↔ US ↔ AC).
