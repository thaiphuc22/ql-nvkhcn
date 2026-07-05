# Requirements Catalog — RD03–RD06 (Thực hiện / Điều chỉnh / Nghiệm thu / Quyết toán)

> **Skill:** SKILL-REQUIREMENT-EXTRACTOR v1.0 · **Nguồn:** `docs/req/1. Quy trinh Phan mem KHCN chi tiet (clean).md` (mục II.3–II.6)
> **Ngày:** 2026-07-03 · **Phạm vi:** RD03 (3.1–3.6), RD04 (4.1–4.10), RD05 (5.1–5.2), RD06 (6.1–6.2)
> **Nối tiếp:** `docs/req/RD01-RD02-requirements.md`
> **overall_confidence: 0.76** — RD03 rõ (bảng dữ liệu chi tiết); RD04 rõ về luật nhưng thiếu ngưỡng định lượng; **RD06 bản gốc bỏ trống bảng tác nhân → gap lớn**.

**Phân loại:** B = Business · SF = Solution-Functional · **IR = Interface/Integration** (nhánh của SF) · NF = Non-Functional · TR = Transition · BR = Business Rule

---

## A. RD03 — Thực hiện NV KHCN (tích hợp 5 hệ thống ngoài)

**Bắt đầu:** Khởi tạo nghiệp vụ thực hiện (đề tài, nhân sự, kế hoạch, nội dung) · **Kết thúc:** Nội dung đề tài hoàn thành (mục 3).

### A.0 Tổng quan tích hợp (interface map)

| Luồng | Đối tác | Chiều dữ liệu chính | Nguồn |
|---|---|---|---|
| 3.1 Nhân sự | PM QLNS | ⇄ DS nhân sự, chi phí lương phân bổ (PL1) | 3.1 |
| 3.2 Mua sắm | PM MS | ⇄ cấu trúc SP, tờ trình/gói thầu/hợp đồng (PL2–PL5) | 3.2 |
| 3.3 Chi phí | PM SAP | ⇄ kinh phí thực hiện/quyết toán (PL1–PL6) | 3.3 |
| 3.4 Tài sản | PM QLTS | ⇄ VTLK, CCDC/TS, phiếu NXK | 3.4 |
| 3.5 Nội dung | PM PLM + Storage | ⇄ cấu trúc SP, MileStone, tiến độ/kết quả | 3.5 |

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD03-B-001 | B | Số hoá quản lý thực hiện NV KHCN với dữ liệu nhân sự/mua sắm/chi phí/tài sản/tiến độ đồng bộ trong suốt từ các hệ thống hiện hữu | 3 (tổng quan); BC_PRESALE | 0.82 |
| REQ-RD03-IR-000 | IR | Hệ thống PHẢI khởi tạo thông tin chung NV KHCN (Tên, Mã NV, thông tin PM, ĐV chủ trì, thời gian, dự toán) và đồng bộ tới cả 5 hệ thống ngoài | 3.1–3.5 (hàng "Khởi tạo") | 0.85 |

### A.1 Luồng 3.1 — Quản lý nhân sự (⇄ QLNS)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0301-SF-001 | SF | Hệ thống PHẢI cho phép gán/cập nhật danh sách nhân sự thực hiện NV KHCN và gửi sang PM NS (DS nhân sự, MNV, tổng số công dự kiến) | 3.1 (Gán/cập nhật DS) | 0.86 |
| REQ-RD0301-IR-001 | IR | PM NS PHẢI trả về: trạng thái nhân sự (đang làm/nghỉ), ĐV công tác, học hàm/học vị/chức danh, chi phí lương phân bổ theo từng nhân sự | 3.1 (Dữ liệu cung cấp) | 0.85 |
| REQ-RD0301-SF-002 | SF | Hệ thống PHẢI cho phép yêu cầu xuất DS nhân sự & chi phí nhân công (định kỳ hoặc đột xuất) | 3.1 (Yêu cầu cập nhật/xuất) | 0.80 |
| BR-RD0301-001 | BR | Chi phí thực hiện đề tài quản lý theo từng nhân sự, gắn với PL1 – Dự toán | 3.1 (mô tả) | 0.82 |

### A.2 Luồng 3.2 — Cấu hình & trạng thái mua sắm (⇄ MS)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0302-SF-001 | SF | Hệ thống PHẢI cho phép khai báo cấu trúc sản phẩm chi tiết: System → Subsystem → Module → SubModule → VTLK (gắn PL2) | 3.2 (mô tả + Khai báo cấu trúc) | 0.85 |
| REQ-RD0302-IR-001 | IR | PM MS PHẢI đồng bộ trả về theo cấu trúc SP: (1) thông tin tờ trình mua sắm, (2) gói thầu, (3) hợp đồng — kèm chi phí theo từng hạng mục | 3.2 (Dữ liệu cung cấp 1/2/3) | 0.84 |
| REQ-RD0302-SF-002 | SF | Hệ thống PHẢI cho phép yêu cầu xuất tiến độ TTr mua sắm / gói thầu / hợp đồng (định kỳ hoặc đột xuất) | 3.2 (Yêu cầu cập nhật/xuất) | 0.80 |
| BR-RD0302-001 | BR | Chi phí mua sắm quản lý theo cấu hình sản phẩm (PL2) và các hạng mục khác (PL3, PL4, PL5) | 3.2 (mô tả) | 0.80 |

### A.3 Luồng 3.3 — Chi phí đề tài (⇄ SAP)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0303-IR-001 | IR | PM SAP PHẢI cập nhật kinh phí đã thực hiện theo cấu trúc SP, theo PL1–PL6 của dự toán NV KHCN | 3.3 (Khai báo cấu trúc) | 0.85 |
| REQ-RD0303-IR-002 | IR | PM SAP PHẢI cung cấp: kinh phí tổng thể (đã thực hiện, đã quyết toán PL1–PL6) + kinh phí phát sinh theo cấu trúc SP | 3.3 (Dữ liệu cung cấp) | 0.85 |
| REQ-RD0303-SF-001 | SF | Hệ thống PHẢI cho phép yêu cầu xuất thông tin kinh phí thực hiện (định kỳ hoặc đột xuất) | 3.3 (Yêu cầu cập nhật/xuất) | 0.80 |

### A.4 Luồng 3.4 — Tài sản đề tài (⇄ QLTS)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0304-IR-001 | IR | PM QLTS PHẢI đồng bộ trả về: danh mục VTLK, CCDC/TS đã bàn giao theo cấu trúc SP | 3.4 (Khai báo cấu trúc/Dữ liệu) | 0.84 |
| REQ-RD0304-IR-002 | IR | PM QLTS PHẢI cung cấp danh sách tài sản với: số lượng, đơn giá, thành tiền, cá nhân/đơn vị nhận, số & ngày Phiếu NXK | 3.4 (Yêu cầu cập nhật/xuất) | 0.84 |

### A.5 Luồng 3.5 — Nội dung thực hiện đề tài (⇄ PLM + Storage)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0305-SF-001 | SF | Hệ thống PHẢI cho phép khai báo cấu trúc SP, MileStone, kế hoạch thực hiện và DS sản phẩm của NV KHCN | 3.5 (Khai báo cấu trúc/MileStone) | 0.84 |
| REQ-RD0305-IR-001 | IR | PM PLM PHẢI cập nhật tiến độ/kết quả theo kế hoạch và theo sơ đồ khối sản phẩm | 3.5 (Dữ liệu cung cấp) | 0.83 |
| REQ-RD0305-IR-002 | IR | Hệ thống PHẢI đồng bộ tài liệu với kho lưu trữ (Storage) | 3.5 (Điều kiện ràng buộc) | 0.78 |

### A.6 Luồng 3.6 — Báo cáo tiến độ thực hiện (⇄ PLM, QLNS)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0306-SF-001 | SF | Hệ thống PHẢI cho phép PM/PA/NNC khởi tạo, cập nhật tiến độ, xuất dữ liệu và trình ký Báo cáo tiến độ | 3.6 (PM) | 0.86 |
| REQ-RD0306-SF-002 | SF | Hệ thống PHẢI cho phép CQ KHCN/MS/TCKT/NS đọc, nhận xét và ký/từ chối hồ sơ báo cáo | 3.6 (CQ) | 0.84 |
| REQ-RD0306-SF-003 | SF | Hệ thống PHẢI cho phép BGĐ TT/Khối ký duyệt, CQNV VHT (TP CLKHCN/TCKT) ký duyệt, và BTGĐ VHT (Phó TGĐ phụ trách) phê duyệt/từ chối Báo cáo | 3.6 (BGĐ/CQNV/BTGĐ) | 0.85 |
| REQ-RD0306-SF-004 | SF | Hệ thống PHẢI cho phép xuất báo cáo theo form mẫu | 3.6 (mô tả) | 0.80 |

---

## B. RD04 — Điều chỉnh NV KHCN (10 luồng)

**Giá trị cốt lõi: bộ luật định tuyến** loại điều chỉnh → hội đồng/cấp thẩm quyền. Đề nghị chuyển toàn bộ BR-RD04-* sang `skill-br-extractor` để dựng decision table.

### B.1 Bộ luật định tuyến điều chỉnh (Business Rules)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| BR-RD04-001 | BR | Điều chỉnh **Chủ nhiệm đề tài (CNĐT)** → xử lý qua **CQ KHCN** (cấp CS: 4.1 / cấp TĐ: 4.6) | 4.1, 4.6 | 0.86 |
| BR-RD04-002 | BR | Điều chỉnh **nội dung/thời gian/dự toán KHÔNG tăng tổng dự toán** → qua **HĐ KHCN** (CS: 4.2 / TĐ: 4.7) | 4.2, 4.7 | 0.86 |
| BR-RD04-003 | BR | Điều chỉnh **mục tiêu / tăng dự toán nhưng KHÔNG vượt chủ trương** → qua **HĐXD điều chỉnh** (CS: 4.3 / TĐ: 4.8) | 4.3, 4.8 | 0.86 |
| BR-RD04-004 | BR | **Tạm dừng** NV KHCN → luồng riêng (CS: 4.4 / TĐ: 4.9) | 4.4, 4.9 | 0.80 |
| BR-RD04-005 | BR | **Dừng** NV KHCN → qua **HĐ Đánh giá hoàn thành (ĐGHT)** (CS: 4.5 / TĐ: 4.10) | 4.5, 4.10 | 0.82 |

### B.2 Functional theo loại điều chỉnh

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0401-SF-001 | SF | Hệ thống PHẢI hỗ trợ điều chỉnh CNĐT: PM cũ khởi tạo → PM mới ký duyệt → CQ KHCN thẩm định (tích chọn điều kiện trực tiếp) → BTGĐ phê duyệt QĐ điều chỉnh CNĐT | 4.1.2 | 0.85 |
| REQ-RD0402-SF-001 | SF | Hệ thống PHẢI hỗ trợ điều chỉnh nội dung/dự toán qua HĐ KHCN: lập Báo cáo thông qua HS điều chỉnh → HĐ thẩm định (ý kiến trực tiếp) → ký/phê duyệt → BTGĐ phê duyệt QĐ điều chỉnh | 4.2.2 | 0.84 |
| REQ-RD0403-SF-001 | SF | Hệ thống PHẢI hỗ trợ điều chỉnh qua HĐXD ĐC: lập QĐ TLHĐ xét duyệt ĐC → phiếu nhận xét/đánh giá → BB họp phiên 1 & 2 → TGĐ phê duyệt QĐ điều chỉnh NV KHCN | 4.3.2 | 0.84 |
| REQ-RD0404-SF-001 | SF | Hệ thống PHẢI hỗ trợ Tạm dừng NV KHCN (khởi tạo, thẩm định, phê duyệt QĐ Tạm dừng) | 4.4 | 0.65 |
| REQ-RD0405-SF-001 | SF | Hệ thống PHẢI hỗ trợ Dừng NV KHCN qua HĐ ĐGHT: lập QĐ TLHĐ ĐGHT → báo cáo thẩm định → HĐ KHCN phê duyệt → TGĐ phê duyệt QĐ Dừng thực hiện | 4.5.2 | 0.84 |
| REQ-RD04TĐ-SF-001 | SF | Với các luồng cấp Tập đoàn (4.6–4.10), hệ thống PHẢI bổ sung: CQ KHCN TĐ (Ban CNCNC), HĐXD/HĐ KHCN/HĐ ĐGHT TĐ, BTGĐ TĐ, và cơ chế "vai trò thay thế" (Chuyên quản CLKHCN cập nhật dữ liệu hộ) | 4.6.2–4.10.2 | 0.82 |
| TR-RD0401-001 | TR | Điều chỉnh CNĐT PHẢI chuyển quyền/dữ liệu hồ sơ từ PM cũ sang PM mới | 4.1.2 (PM cũ/PM mới) | 0.78 |

---

## C. RD05 — Nghiệm thu NV KHCN

**Ràng buộc chung:** Nội dung thực hiện đề tài (nhiệm vụ, đầu tư, tài chính, nhân sự) đã hoàn thành — tức RD03 xong (mục 5.1, 5.2).

### C.1 RD05.01 — Nghiệm thu cấp Cơ sở

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0501-SF-001 | SF | Hệ thống PHẢI cho phép PM/PA/NNC khởi tạo, xây dựng, trình ký hồ sơ nghiệm thu | 5.1.2 (PM) | 0.87 |
| REQ-RD0501-SF-002 | SF | Hệ thống PHẢI cho phép CQ QLKHCN VHT lập & trình QĐ TLHĐNT và QĐ Công nhận KQ | 5.1.2 (CQ QLKHCN) | 0.85 |
| REQ-RD0501-SF-003 | SF | Hệ thống PHẢI hỗ trợ HĐNT cấp CS ký phiếu nhận xét, phiếu đánh giá và BB họp phiên 1 & 2 | 5.1.2 (HĐNT cấp CS) | 0.83 |
| REQ-RD0501-SF-004 | SF | Hệ thống PHẢI cho phép TGĐ VHT phê duyệt QĐ TL HĐNT và phê duyệt/từ chối Quyết định công nhận kết quả NV KHCN | 5.1.2 (TGĐ VHT) | 0.90 |
| BR-RD0501-001 | BR | Chỉ được khởi tạo nghiệm thu khi các nội dung thực hiện đề tài (RD03) đã hoàn thành | 5.1 (Điều kiện ràng buộc) | 0.88 |

### C.2 RD05.02 — Nghiệm thu cấp Tập đoàn (bổ sung)

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD0502-SF-001 | SF | Hệ thống PHẢI cho phép CQ QLKHCN VHT lập & ký CV đề nghị nghiệm thu cấp TĐ; TGĐ VHT phê duyệt/từ chối CV này | 5.2.2 (CQ QLKHCN, TGĐ VHT) | 0.84 |
| REQ-RD0502-SF-002 | SF | Hệ thống PHẢI hỗ trợ HĐNT TĐ gồm cả **Tổ KT** (ký phiếu nhận xét + BB họp Tổ KT) bên cạnh thành viên HĐ | 5.2.2 (HĐNT TĐ, Tổ KT) | 0.82 |
| REQ-RD0502-SF-003 | SF | Hệ thống PHẢI cho phép BTGĐ TĐ phê duyệt QĐ TL HĐNT và QĐ công nhận KQ cấp Tập đoàn | 5.2.2 (BTGĐ TĐ) | 0.85 |

---

## D. RD06 — Quyết toán NV KHCN

**Bắt đầu:** QĐ công nhận kết quả NV KHCN · **Kết thúc:** phê duyệt Báo cáo quyết toán chi phí (mục 6.1, 6.2).
⚠️ **Bản gốc bỏ trống bảng tác nhân (6.1.2 & 6.2.2)** — chỉ có sơ đồ. Requirements dưới đây suy từ sự kiện + ràng buộc; **chi tiết vai trò là GAP cần khảo sát.**

| ID | Type | Requirement | Nguồn | Conf |
|---|---|---|---|---|
| REQ-RD06-SF-001 | SF | Hệ thống PHẢI cho phép lập, trình ký và phê duyệt Báo cáo quyết toán chi phí thực hiện NV KHCN (cấp CS & TĐ) | 6.1, 6.2 (Sự kiện kết thúc) | 0.72 |
| REQ-RD06-IR-001 | IR | Hệ thống PHẢI lấy số liệu kinh phí đã thực hiện/đã quyết toán từ SAP (PL1–PL6) để lập Báo cáo quyết toán | Suy từ 3.3 + 6.1 | 0.62 |
| BR-RD06-001 | BR | Chỉ được quyết toán khi NV KHCN **đã có Quyết định nghiệm thu** | 6.1, 6.2 (Điều kiện ràng buộc) | 0.90 |
| TR-RD06-001 | TR | Sự kiện bắt đầu quyết toán = QĐ công nhận kết quả NV KHCN (đầu ra RD05) | 6.1 (Sự kiện bắt đầu) | 0.85 |

---

## E. Assumptions

| ID | Assumption | Nguồn/lý do | Conf |
|---|---|---|---|
| ASSUMP-004 | Đồng bộ với 5 hệ thống ngoài (RD03) theo mô hình 2 chiều, có cả định kỳ và đột xuất (on-demand) | 3.1–3.5 ("định kỳ hoặc đột xuất") | 0.70 |
| ASSUMP-005 | RD06 dùng lại đúng khung tác nhân/phê duyệt như RD05 (vì bản gốc bỏ trống) | Suy luận — CẦN xác nhận | 0.45 |
| ASSUMP-006 | "Vai trò thay thế" ở RD04–RD05 mang cùng ngữ nghĩa như RD01/RD02 (nhân sự VHT nhập hộ Tập đoàn) | Nhất quán toàn tài liệu | 0.80 |

## F. Open questions

| ID | Câu hỏi | Chặn cho |
|---|---|---|
| OQ-008 | Ngưỡng định lượng "tăng tổng dự toán" / "vượt chủ trương" để định tuyến 4.2 vs 4.3 (và TĐ) là gì? | BR-RD04-002/003 (decision table) |
| OQ-009 | Đồng bộ với 5 hệ thống ngoài là **real-time hay batch**? Giao thức (REST/message queue)? Hệ thống nào là master của mỗi trường dữ liệu? | Toàn bộ RD03 (IR) |
| OQ-010 | **RD06 (Quyết toán) — toàn bộ tác nhân/vai trò/luồng chi tiết bị bỏ trống** trong tài liệu. Cần khảo sát bổ sung. | RD06 (gap) |
| OQ-011 | Luồng **4.4 Tạm dừng cấp CS** bản gốc không có bảng tác nhân riêng — dùng chung với luồng nào? | REQ-RD0404-SF-001 |
| OQ-012 | Nghi ngờ **lỗi tài liệu ở mục 3.5**: hàng "Yêu cầu cập nhật" ghi "xuất thông tin về **kinh phí**" trong khi luồng 3.5 là **nội dung/tiến độ** (PLM). Cần xác nhận đúng là tiến độ/kết quả. | REQ-RD0305-* |
| OQ-013 | "Milestone NV KHCN" (3.5) quản lý ở QLKHCN hay PLM là master? | REQ-RD0305-SF-001 |

## G. Ambiguities

| ID | Cụm mơ hồ | Ngữ cảnh | Đề xuất làm rõ |
|---|---|---|---|
| AMB-004 | "định kỳ hoặc đột xuất" | Yêu cầu xuất thông tin (RD03) | Định nghĩa chu kỳ định kỳ + cơ chế trigger đột xuất |
| AMB-005 | "Dự toán full" | Dữ liệu khởi tạo gửi SAP/MS | Liệt kê trường cụ thể của "full" (PL1–PL6?) |
| AMB-006 | "cho phép chi tiết hơn so với cấu trúc đã xây dựng theo Dự toán" | Khai báo cấu trúc SP (3.2–3.5) | Quy tắc: mức chi tiết tối đa? ràng buộc khớp dự toán? |

---

## Validators

- ✅ **VALIDATOR-REQUIREMENT-ATOMICITY** — các requirement tách theo capability; luồng lặp CS/TĐ gộp có chủ đích ở RD04 (nêu rõ) để tránh 40+ dòng gần trùng.
- ✅ **VALIDATOR-NO-DUPLICATION** — IR tách theo từng hệ thống; không trùng nội dung.
- ⚠️ **VALIDATOR-BUSINESS-VALUE** — RD06 map yếu do gap tác nhân (OQ-010); nhánh NFR vẫn trống (kế thừa OQ-006 từ catalog RD01/RD02).

## Human review (bắt buộc)

- **OQ-010 (RD06 gap)** và **OQ-008 (ngưỡng định tuyến RD04)** là chặn cứng — phải khảo sát/khách xác nhận trước khi thiết kế.
- **OQ-012** — nghi lỗi tài liệu gốc mục 3.5; đối chiếu lại PDF/khách trước khi chốt REQ-RD0305-*.
- ASSUMP-005 (conf 0.45) — không được dùng làm cơ sở thiết kế RD06 khi chưa xác nhận.

## Follow-up skills

1. **skill-br-extractor** — ưu tiên: BR-RD04-001..005 → decision table định tuyến điều chỉnh (kèm ngưỡng từ OQ-008).
2. **skill-user-story-generator** — RD03 (IR) → stories tích hợp; RD05 → stories nghiệm thu.
3. **skill-traceability-builder** — gộp RTM RD01–RD06, đánh dấu RD06 là "coverage thấp / cần khảo sát".
