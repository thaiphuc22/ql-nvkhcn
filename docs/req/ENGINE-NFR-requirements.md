# Requirements Catalog — Engine Quy trình (Camunda) & NFR toàn hệ thống

> **Skill:** SKILL-REQUIREMENT-EXTRACTOR v1.0 · **Ngày:** 2026-07-03
> **Mục đích:** lấp orphan capability của **Phân hệ Quản lý Quy trình** (P1/P3/P6/P8/P9) + bộ NFR (mở OQ-006) — phát hiện trong `RTM.md`.
> **Nguồn:** `BC_PRESALE_VTCN_VHT_CDS.md` (Camunda 8, SSO/IAM, AI-Agent, truy cập trong suốt), `scope-2-phanhe.md` (P1–P10), pattern quy trình từ `…(clean).md`, các open question OQ-002/003/006/008/009/016.
>
> ⚠️ **CẢNH BÁO NGUỒN:** khác các catalog RD (bóc từ spec quy trình chi tiết), đợt này **phần lớn là SUY DẪN** từ khoảng trống năng lực + presale mỏng. Nhiều mục là **"đề xuất yêu cầu engine để khách xác nhận"**, không phải trích dẫn nguyên văn. **overall_confidence: 0.58.** Không dùng làm cơ sở thiết kế khi chưa qua khách/kiến trúc sư (F2).

**Phân loại:** SF-ENG = Solution-Functional (engine) · NF = Non-Functional · các cờ: `⚠️OQ-xxx` (phụ thuộc câu hỏi mở) · `[derived]` (suy dẫn, chưa có evidence trực tiếp).

---

## A. Engine quy trình — Solution-Functional (REQ-ENG-*)

### A.1 P1 — Định nghĩa & vận hành quy trình (BPMN)

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-001 | Hệ thống PHẢI cho phép định nghĩa/nạp (deploy) & kích hoạt quy trình BPMN để cấu hình luồng phê duyệt **không cần đổi code** | Presale (chuyển quy trình cứng → Camunda động) | 0.75 |
| REQ-ENG-002 | Hệ thống PHẢI khởi tạo một **process instance** cho mỗi hồ sơ nghiệp vụ (chủ trương, xét duyệt, nghiệm thu…) và gắn dữ liệu đề tài vào instance | Suy từ mô hình RD01–RD06 `[derived]` | 0.68 |
| REQ-ENG-003 | Hệ thống PHẢI hỗ trợ **versioning process definition**: deploy phiên bản mới trong khi instance đang chạy giữ nguyên phiên bản cũ (P10) | Presale + AMB-003 `[derived]` | 0.62 |

### A.2 P3 — Gán việc & hàng đợi công việc (worklist)

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-004 | Hệ thống PHẢI gán **user task** theo vai trò/nhóm ứng viên (candidate group) dựa trên ma trận tác nhân của từng luồng | Bảng tác nhân toàn tài liệu | 0.78 |
| REQ-ENG-005 | Hệ thống PHẢI cung cấp **hàng đợi công việc cá nhân** ("việc của tôi") với claim/nhận việc | Suy từ nhu cầu vận hành `[derived]` | 0.65 |
| REQ-ENG-006 | Hệ thống PHẢI hỗ trợ **ủy quyền/giao lại task** (delegate) — ví dụ TGĐ ủy quyền phê duyệt; ghi vết người ủy quyền | AC ủy quyền (US-RD01-07/US-RD02-05) | 0.66 |

### A.3 P2 — Định tuyến động

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-007 | Hệ thống PHẢI định tuyến động theo biến nghiệp vụ: **cấp Cơ sở/Tập đoàn**, **loại điều chỉnh** (RD04) qua gateway/quy tắc | RD01–RD06, BR-RD04-001…005 | 0.76 |

### A.4 P4 — Hội đồng & phiên họp

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-008 | Hệ thống PHẢI hỗ trợ **phê duyệt nhiều người** (multi-instance): nhiều thành viên hội đồng ký cùng một bước và **tổng hợp kết quả** (đủ chữ ký/quorum) | RD02/RD05 (HĐXD, HĐNT) | 0.72 |
| REQ-ENG-009 | Hệ thống PHẢI mô hình hoá **phiên họp 1 & 2** như các stage tuần tự với điều kiện chuyển phiên | REQ-RD0201-SF-004 · ⚠️OQ-003 | 0.58 |

### A.5 P5 — Quy tắc quyết định (DMN)

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-010 | Hệ thống PHẢI dùng **bảng quyết định (DMN)** cho: (a) định tuyến điều chỉnh RD04, (b) sinh danh sách hội đồng tự động/thủ công, (c) suy trạng thái **Đạt/Chưa đạt** | BR-RD04-*, REQ-RD0101-SF-007, REQ-RD0201-SF-002 · ⚠️OQ-008 | 0.70 |

### A.6 P6 — Rework (quay lại khi từ chối/Chưa đạt)

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-011 | Hệ thống PHẢI hỗ trợ **quay lại (rework)**: khi từ chối/Chưa đạt, trả instance về đúng bước trước kèm lý do | OQ-002 `[derived]` · ⚠️**OQ-002 chặn** | 0.45 |

### A.7 P7 — Vai trò thay thế (act-on-behalf)

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-012 | Hệ thống PHẢI hỗ trợ **thao tác hộ (act-on-behalf)**: chuyên quản thực hiện bước của tác nhân Tập đoàn, ghi vết **người thực hiện + người đại diện** | REQ-XC-SF-001 | 0.78 |

### A.8 P8 — SLA & nhắc việc

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-013 | Hệ thống PHẢI đặt **SLA/thời hạn** cho từng task + **timer** + **escalation/nhắc việc** khi quá hạn | OQ-006 `[derived]` · ⚠️OQ-006 (số cụ thể) | 0.50 |

### A.9 P9 — Audit & chữ ký số

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-ENG-014 | Hệ thống PHẢI ghi **audit trail** đầy đủ mỗi instance: ai, khi nào, hành động, trạng thái trước/sau | Nhu cầu kiểm soát toàn tài liệu | 0.80 |
| REQ-ENG-015 | Hệ thống PHẢI tích hợp **chữ ký số** cho phiếu/QĐ/biên bản; **khóa sửa sau khi ký/ban hành** | Process doc ("ký duyệt") + OQ-006 | 0.66 |

---

## B. Non-Functional Requirements (NFR-*) — mở OQ-006

> Đây là **khung NFR** đề xuất; **hầu hết chưa có ngưỡng số** vì OQ-006 chưa được khách trả lời. Ô "Ngưỡng" ghi ⚠️ = cần khách/kiến trúc sư chốt ở F2.

### B.1 Bảo mật & xác thực

| ID | Requirement | Ngưỡng | Nguồn | Conf |
|---|---|---|---|---|
| NFR-SEC-001 | **SSO/IAM tập trung** — đăng nhập 1 lần, truy cập trong suốt nhiều phân hệ, hạn chế nhiều tài khoản | (chuẩn IAM của VHT) | Presale ("truy cập trong suốt"; SSO/IAM) | 0.82 |
| NFR-SEC-002 | **RBAC** theo ma trận vai trò × phân hệ; kiểm soát quyền "act-on-behalf" | ⚠️OQ-006 | Bảng tác nhân + REQ-ENG-012 | 0.70 |
| NFR-SEC-003 | **Chữ ký số** hợp chuẩn cho văn bản phê duyệt | ⚠️(chuẩn CA) | REQ-ENG-015 | 0.60 |
| NFR-SEC-004 | **Audit log bất biến**, đủ vết phục vụ thanh/kiểm tra | ⚠️(thời hạn lưu) | REQ-ENG-014 | 0.68 |

### B.2 Hiệu năng & quy mô

| ID | Requirement | Ngưỡng | Nguồn | Conf |
|---|---|---|---|---|
| NFR-PERF-001 | Thời gian phản hồi thao tác thông thường | ⚠️≤ N giây (chưa chốt) | OQ-006 `[derived]` | 0.45 |
| NFR-PERF-002 | Độ trễ dữ liệu Dashboard "thời gian thực" | ⚠️≤ Y (chưa chốt) | REQ-RD09-NF-001 · OQ-016 | 0.50 |
| NFR-SCAL-001 | Quy mô: số đề tài/instance & user đồng thời | ⚠️(chưa có số) | `[derived]` | 0.40 |

### B.3 Khả dụng & vận hành

| ID | Requirement | Ngưỡng | Nguồn | Conf |
|---|---|---|---|---|
| NFR-AVL-001 | Mức khả dụng (uptime) hệ thống | ⚠️(SLA vận hành chưa chốt) | `[derived]` | 0.40 |

### B.4 Tích hợp & dữ liệu

| ID | Requirement | Ngưỡng | Nguồn | Conf |
|---|---|---|---|---|
| NFR-INT-001 | Tích hợp API/đồng bộ với QLNS, MS, SAP, QLTS, PLM, CRM, Storage | (theo RD03/RD07) | RD03 (12 IR), RD07 | 0.75 |
| NFR-INT-002 | Xác định mô hình đồng bộ (real-time/batch) & **master-of-record** mỗi trường dữ liệu | ⚠️OQ-009 | RD03 · OQ-009 | 0.55 |

### B.5 Tuân thủ & bản địa hoá

| ID | Requirement | Ngưỡng | Nguồn | Conf |
|---|---|---|---|---|
| NFR-COMP-001 | Tuân thủ biểu mẫu/quy trình ban hành (RD10); lưu trữ hồ sơ pháp lý KHCN | (theo RD10) | RD10 | 0.65 |
| NFR-LOC-001 | Giao diện & dữ liệu **tiếng Việt** | — | Bối cảnh VHT | 0.85 |

### B.6 AI (phạm vi cần làm rõ)

| ID | Requirement | Nguồn | Conf |
|---|---|---|---|
| REQ-AI-001 | Tích hợp **AI-Agent** (phân hệ #10 presale) — hỗ trợ nghiệp vụ; **phạm vi/kịch bản chưa xác định** | Presale (bổ sung AI-Agent) · ⚠️OQ-mới | 0.40 |

---

## C. Assumptions

| ID | Assumption | Conf |
|---|---|---|
| ASSUMP-010 | Engine = Camunda 8 (theo presale) là quyết định kiến trúc mặc định của các REQ-ENG-* | 0.70 |
| ASSUMP-011 | SSO/IAM dùng hạ tầng xác thực sẵn có của VHT/Viettel (không tự xây) | 0.55 |
| ASSUMP-012 | Chữ ký số dùng CA/HSM sẵn có của tổ chức | 0.45 |

## D. Open questions (mới + kế thừa)

| ID | Câu hỏi | Chặn cho |
|---|---|---|
| OQ-006 | Bộ NFR định lượng: SLA phản hồi, uptime, quy mô đồng thời; chuẩn RBAC/chữ ký số | Toàn bộ NFR-* + REQ-ENG-013/015 |
| OQ-019 | Rework: đích quay lại từng luồng + có giới hạn số vòng? | REQ-ENG-011 |
| OQ-020 | AI-Agent: kịch bản nghiệp vụ cụ thể (gợi ý duyệt? trích xuất hồ sơ? chatbot?) | REQ-AI-001 |
| OQ-021 | SSO/IAM: sản phẩm cụ thể của VHT + giao thức (OIDC/SAML)? | NFR-SEC-001 |
| OQ-009 | Đồng bộ 5 hệ thống: real-time/batch + master-of-record | NFR-INT-002 |
| OQ-003 | Điều kiện chuyển phiên 1→2, có bắt buộc 2 phiên? | REQ-ENG-009 |
| OQ-008 | Ngưỡng định tuyến RD04 (vào DMN) | REQ-ENG-010 |

## Validators

- ✅ **VALIDATOR-REQUIREMENT-ATOMICITY** — 27/27 atomic.
- ✅ **VALIDATOR-NO-DUPLICATION** — engine tách theo năng lực P1–P10; không trùng RD requirements.
- ⚠️ **VALIDATOR-BUSINESS-VALUE** — engine requirements map về REQ-B-001 (nền của mọi luồng); nhưng **8/27 mục confidence < 0.5** (suy dẫn/chờ OQ) → **không đủ chín để thiết kế** khi chưa qua khách.

## Human review (bắt buộc)

- **Đây là đợt suy dẫn** — toàn bộ REQ-ENG-* và NFR-* phải qua **khách + kiến trúc sư (F2)** trước khi dùng. Ưu tiên chốt: OQ-006 (NFR số), OQ-021 (SSO), OQ-020 (AI), OQ-019 (rework).
- License Camunda 8 (blocker presale) là tiền đề của ASSUMP-010.

## Follow-up

- Cập nhật **RTM.md**: các orphan P1/P3/P6/P8/P9 nay đã có REQ-ENG-* (chuyển 🔴→🟠). NFR orphan → có khung NFR-*.
- Sau khi khách chốt OQ-006 → điền ngưỡng NFR, nâng confidence.
- `skill-user-story-generator` cho REQ-ENG-* (khi F2 chốt kiến trúc) → backlog phân hệ QL Quy trình.
