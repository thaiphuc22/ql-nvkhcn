# RTM — Requirements Traceability Matrix (2 phân hệ trọng tâm)

> **Skill:** SKILL-TRACEABILITY-BUILDER v1.0 · **Ngày:** 2026-07-03
> **Phạm vi:** (1) Phân hệ Quản lý Quy trình (Camunda) · (2) Phân hệ Quản lý Nhiệm vụ KHCN
> **Chain:** Business Goal → Phân hệ → RD/Capability → Requirement (REQ/BR) → User Story → AC
> **Nguồn:** `RD01-RD02 / RD03-RD06 / RD07-RD10-requirements.md`, `EPIC-QLNVKHCN-backlog.md`, `EPIC-QLNVKHCN-AC.md`, `scope-2-phanhe.md`
> **Kỷ luật:** chỉ link khi có ID match; orphan/gap luôn được flag; không sinh mới artifact.

**Chú thích trạng thái:** ✅ chain đầy đủ tới AC · 🟡 tới US (chưa đủ AC) · 🟠 chỉ có Requirement · 🔴 gap/chưa có Requirement

> **Cập nhật 2026-07-03 (sau khi bóc engine):** các orphan năng lực **P1/P3/P6/P8/P9 nay đã có
> Requirement** trong `ENGINE-NFR-requirements.md` (REQ-ENG-001…015) + khung **NFR-*** → chuyển
> 🔴→🟠. Lưu ý: đợt engine là **suy dẫn (confidence 0.58)**, cần khách/kiến trúc sư (F2) xác nhận;
> bảng mục 2 & 4 dưới đây phản ánh trạng thái *trước* đợt engine — xem file engine để biết trạng thái mới.

---

## 0. Business Goals (gốc truy vết)

| Goal ID | Nội dung | Phân hệ phục vụ |
|---|---|---|
| REQ-B-001 | Số hoá toàn trình luồng xét duyệt & quản lý NV KHCN, 1 luồng xuyên suốt | Cả 2 |
| REQ-B-002 | Ra quyết định phê duyệt dựa trên dữ liệu số | QL NV KHCN |
| REQ-RD03-B-001 | Quản lý thực hiện NV với dữ liệu đồng bộ từ hệ thống hiện hữu | QL NV KHCN (RD03) |
| REQ-RD09-B-001 | Bức tranh tổng thể thời gian thực | QL NV KHCN (RD09) |

---

## 1. RTM — Phân hệ Quản lý Nhiệm vụ KHCN

| Goal | RD | Requirement (đại diện) | User Story | AC | Trạng thái |
|---|---|---|---|---|---|
| B-001/002 | **RD01** Chủ trương | REQ-RD0101-SF-001…009, REQ-RD0102-SF-001…004, BR-RD0101-001 | US-RD01-01…09 | 29 AC (US-01,02,03,04,07) | ✅/🟡 (AC cho 5/9 US) |
| B-001/002 | **RD02** Xét duyệt NV | REQ-RD0201-SF-001…006, REQ-RD0202-SF-001…004, BR-RD0201/0202-001, TR-RD0201-001 | US-RD02-01…06 | 11 AC (US-01,05) | 🟡 (AC cho 2/6 US) |
| B-001/002 | **RD05** Nghiệm thu | REQ-RD0501-SF-001…004, REQ-RD0502-SF-001…003, BR-RD0501-001 | US-RD05-01…05 | 15 AC (US-01,02,04) | 🟡 (AC cho 3/5 US) |
| RD03-B-001 | **RD03** Thực hiện | REQ-RD0301…0306 (18, gồm 12 IR) | — | — | 🟠 REQ only (no US) |
| B-001 | **RD04** Điều chỉnh | BR-RD04-001…005, REQ-RD0401…0405-SF | — | — | 🟠 REQ only → cần decision table |
| B-002 | **RD06** Quyết toán | REQ-RD06-SF-001, IR-001, BR-RD06-001, TR-RD06-001 | — | — | 🔴 gap tác nhân (OQ-010) |
| — | **RD07** Danh mục SPDV | REQ-RD07-SF-001/002, IR-001, B-001 | — | — | 🟠 REQ only (Pha 2) |
| — | **RD08** SHTT | REQ-RD08-SF-001/002, IR-001, BR-001 | — | — | 🔴 gap luồng/tác nhân (OQ-014) |
| RD09-B-001 | **RD09** Dashboard | REQ-RD09-SF-001/002, IR-001, NF-001 | — | — | 🟠 REQ only (thiếu chỉ số) |
| — | **RD10** Lưu trữ/biểu mẫu | REQ-RD10-SF-001…003, BR-001 | — | — | 🟠 REQ only |

**Ví dụ chain đầy đủ (mẫu):**
`REQ-B-001 → RD01 → REQ-RD0101-SF-001 → US-RD01-01 → AC1–AC6` ✅ end-to-end.

---

## 2. RTM — Phân hệ Quản lý Quy trình (Camunda) — theo năng lực P1–P10

> ⚠️ **Phát hiện chính:** phân hệ này là *engine xuyên suốt*, nhưng catalog yêu cầu đang bóc theo **luồng nghiệp vụ (RD)**, chưa bóc theo **năng lực engine**. Nhiều năng lực chỉ tồn tại **ngầm định** → orphan capability (chưa có Requirement riêng).

| Năng lực | Requirement hiện realize | US/AC | Trạng thái |
|---|---|---|---|
| P1 Định nghĩa/vận hành BPMN | *(ngầm — mọi luồng RD)* | — | 🔴 **orphan** — chưa có REQ engine |
| P2 Định tuyến đa cấp/đa loại | BR-RD04-001…005, BR-RD0101/0201/0202-001 (phân cấp) | qua US phân cấp | 🟠 REQ nghiệp vụ có; logic engine chưa tách |
| P3 Worklist / gán vai trò | *(ngầm — bảng tác nhân)* | — | 🔴 **orphan** — chưa có REQ |
| P4 Hội đồng, phiên 1&2 | REQ-RD0201-SF-004, REQ-RD0501-SF-003, REQ-RD0502-SF-002 | US-RD02-03, US-RD05-03/05 | 🟡 có US, AC một phần |
| P5 DMN/decision table | BR-RD04-001…005, REQ-RD0201-SF-002 (Đạt/Chưa đạt), REQ-RD0101-SF-007 (sinh DS HĐ) | — | 🟠 REQ có, chưa dựng decision table |
| P6 Rework khi từ chối | *(không có REQ)* — OQ-002 | 12 AC treo OQ-002 | 🔴 **gap** — mở qua OQ-002 |
| P7 Vai trò thay thế (proxy) | REQ-XC-SF-001 | US-RD01-09 | 🟡 có US, **chưa có AC** |
| P8 SLA/nhắc việc | *(không có REQ)* — OQ-006 | — | 🔴 **gap** — mở qua OQ-006 |
| P9 Audit log / chữ ký số | *(không có NF-REQ)* — OQ-006 | ~18 AC tham chiếu (treo OQ-006) | 🔴 **gap** — thiếu NF requirement |
| P10 Versioning quy trình/HĐ | REQ-RD0101-SF-007 (một phần) — AMB-003 | AC US-RD05-02#AC5 | 🟠 một phần |

---

## 3. Coverage report

### Theo phân hệ

| Phân hệ | RD/Năng lực có Requirement | Có US | Có AC (đầy đủ) | Đánh giá |
|---|---|---|---|---|
| **QL NV KHCN** | 10/10 RD | 3/10 RD (RD01,02,05) | 3/10 RD (một phần US) | Lõi 2026 (RD01/02/05) đã sâu; RD03/04/06/08 còn nông |
| **QL Quy trình** | 4/10 năng lực (P2,P4,P5,P7,P10 một phần) | 2/10 (P4,P7) | ~1/10 | **Under-specified** — engine chủ yếu ngầm định |

### End-to-end (REQ → AC)

- **RD01/RD02/RD05** (thuộc QL NV KHCN): có chain đầy đủ tới AC cho **10/20 User Story** (55 AC).
- **~69/79 requirements** còn lại: dừng ở mức Requirement hoặc US, **chưa** tới AC.
- **Ước tính coverage end-to-end toàn 2 phân hệ ≈ 25–30%** (đúng kỳ vọng: mới làm sâu vùng US-ready Pha 1).

---

## 4. Orphans detected (VALIDATOR-NO-ORPHANS)

| ID | Loại | Mức | Vấn đề | Đề xuất |
|---|---|---|---|---|
| P1 (BPMN engine) | orphan capability | **High** | Năng lực nền nhưng không có Requirement riêng | Bóc **REQ engine** cho Camunda (định nghĩa/deploy/version quy trình) |
| P3 (Worklist) | orphan capability | **High** | Gán việc/hàng đợi chỉ ngầm trong bảng tác nhân | Viết REQ worklist + phân công task |
| P6 (Rework) | orphan (open question) | **High** | OQ-002 chưa thành Requirement; 12 AC đang treo | Khách trả lời OQ-002 → sinh REQ rework |
| P8 (SLA) / P9 (Audit, chữ ký số) | orphan NFR | **High** | Không có Non-Functional Requirement; chỉ ghi chú OQ-006 | Lập **bộ NFR** (SLA, RBAC, chữ ký số, audit) từ OQ-006 |
| US-RD01-09 (proxy) | orphan downstream | Medium | Có US nhưng **chưa có AC** | Chạy skill-ac-generator cho US-RD01-09 |
| RD06 tác nhân | broken chain | **High** | Requirement có, nhưng luồng/tác nhân trống (OQ-010) | Khảo sát bổ sung RD06 |
| RD08 luồng | broken chain | Medium | SF có, nhưng không có tác nhân/luồng phê duyệt (OQ-014) | Khảo sát RD08 |

---

## 5. Coverage gaps (thiếu tầng downstream)

| Gap | Mức | Mô tả |
|---|---|---|
| GAP-01 | High | **RD03, RD04, RD06** chưa có User Story (RD04 cần decision table trước) |
| GAP-02 | High | **NFR toàn hệ thống** chưa có (chỉ REQ-RD09-NF-001) — chặn AC "chốt số" |
| GAP-03 | Medium | **RD07–RD10** chưa có US/AC (phần lớn Pha 2) |
| GAP-04 | Medium | 10/20 US (các US có cờ blocker) **chưa được đào sâu AC** |
| GAP-05 | Medium | Năng lực engine P1/P3/P8/P9 chưa có Requirement (mục 4) |

---

## 6. Stale links / ghi chú phiên bản

- Chưa có version drift — toàn bộ artifact cùng mốc **2026-07-03**.
- **Liên kết cần theo dõi:** `TR-RD0201-001` (RD02 kế thừa dữ liệu RD01) và `TR-RD06-001` (RD06 phụ thuộc QĐ nghiệm thu RD05) — nếu RD01/RD05 đổi, phải refresh RD02/RD06.
- **Rủi ro stale tương lai:** khi khách trả lời OQ-002/OQ-006, **12 AC (OQ-002)** + **~18 AC (OQ-006)** sẽ phải cập nhật đồng loạt — đánh dấu để refresh.

---

## Validators

- ⚠️ **VALIDATOR-END-TO-END-COVERAGE** — PARTIAL: chỉ RD01/RD02/RD05 có chain BR→…→AC; phần còn lại đứt ở US hoặc AC.
- ⚠️ **VALIDATOR-NO-ORPHANS** — 7 orphan/broken-chain được flag (mục 4) — chủ yếu ở **phân hệ QL Quy trình** (engine chưa có Requirement) và **RD06/RD08**.

## Kết luận cho khách (đọc nhanh)

1. **Vùng đã vững:** RD01/RD02/RD05 (QL NV KHCN) — truy vết đầy đủ tới AC, sẵn sàng review chi tiết.
2. **Phân hệ QL Quy trình bị "thiếu yêu cầu"** — vì ta bóc theo luồng nghiệp vụ, chưa bóc theo năng lực engine. **Cần một đợt bóc requirement riêng cho engine** (P1/P3/P6/P8/P9), phần lớn gắn với OQ-006.
3. **RD06 (Quyết toán) & RD08 (SHTT)** là 2 điểm đứt chain do tài liệu gốc thiếu — cần khảo sát.

## Follow-up

- **skill-requirement-extractor** (đợt engine): bóc REQ cho năng lực Camunda P1/P3/P6/P8/P9 + bộ NFR từ OQ-006.
- **skill-br-extractor**: decision table RD04 + Đạt/Chưa đạt (mở P5).
- **skill-ac-generator**: US-RD01-09 (proxy) + 10 US còn treo sau khi giải OQ.
- Cập nhật RTM này sau mỗi đợt để coverage tiến dần.
