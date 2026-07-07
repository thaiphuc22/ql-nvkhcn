# Business Requirements Document — `<Tên Dự Án>`

> Template chuẩn IIBA BABOK v3 — Agile Perspective.
> Thay thế mọi `<placeholder>` bằng nội dung thực tế.

---

## Document Control

| Field | Value |
|---|---|
| Document ID | BRD-`<YYYY>`-`<###>` |
| Version | 1.0 |
| Status | Draft / Review / Approved |
| Owner | `<Tên BA>` |
| Sponsor | `<Tên Sponsor>` |
| Created | `<YYYY-MM-DD>` |
| Last Updated | `<YYYY-MM-DD>` |

### Change Log

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | YYYY-MM-DD | `<BA>` | Initial draft |
| 1.0 | YYYY-MM-DD | `<BA>` | Approved baseline |

---

## 1. Executive Summary

`<3-5 câu mô tả ngắn: dự án làm gì, cho ai, value mong đợi, deadline.>`

---

## 2. Background & Context (BACCM)

### 2.1 Change
`<Đang thay đổi gì? Quy trình mới? Sản phẩm mới? Migration?>`

### 2.2 Need
`<Pain point/cơ hội nào dẫn tới dự án? Số liệu chứng minh nếu có.>`

### 2.3 Context
`<Môi trường hiện tại: tech stack, quy mô, compliance, văn hoá tổ chức.>`

---

## 3. Business Objectives

`<Mục tiêu business — gắn KPI cụ thể, đo lường được.>`

| # | Objective | KPI / Success Metric | Deadline |
|---|---|---|---|
| O1 | `<Tăng X>` | `<+30% conversion>` | `<Q3 2026>` |
| O2 | `<Giảm Y>` | `<-50% manual hours/week>` | `<Q4 2026>` |
| O3 | `<Tiết kiệm Z>` | `<-200M VNĐ/năm>` | `<Q2 2026>` |

---

## 4. Stakeholders Matrix

| Role | Name | Responsibility | Influence | Interest |
|---|---|---|---|---|
| Sponsor | `<Tên>` | Funding + final approval | High | High |
| Product Owner | `<Tên>` | Backlog priority | High | High |
| Business Analyst | `<Tên>` | Requirements | Med | High |
| Tech Lead | `<Tên>` | Technical feasibility | High | Med |
| QA Lead | `<Tên>` | Test strategy | Med | Med |
| End-user | `<Persona>` | Validation, UAT | Low | High |
| Compliance | `<Tên>` | Regulatory check | Med | Low |

> Phân tích Influence vs Interest theo ma trận Mendelow.

---

## 5. Scope

### 5.1 In-Scope
- ✅ `<Feature/process trong scope 1>`
- ✅ `<Feature/process trong scope 2>`

### 5.2 Out-of-Scope
- ❌ `<Feature out 1 — lý do: phase 2>`
- ❌ `<Feature out 2 — lý do: không feasible>`

### 5.3 Boundaries / Interfaces
- `<System A ↔ System B qua REST API>`
- `<Data flow từ source → warehouse>`

---

## 6. Business Requirements

> Mỗi requirement có: ID, Description, Priority (MoSCoW), Rationale, Source.

| ID | Description | Priority | Rationale | Source |
|---|---|---|---|---|
| BR-001 | `<Hệ thống PHẢI cho phép X>` | M | `<Tại sao Must — gắn business obj>` | O1 |
| BR-002 | `<Hệ thống NÊN hỗ trợ Y>` | S | `<Pain point...>` | O2 |
| BR-003 | `<Hệ thống CÓ THỂ tích hợp Z>` | C | `<Nice-to-have...>` | O3 |
| BR-004 | `<Phase 2: ABC>` | W | `<Out of scope iteration này>` | — |

### MoSCoW Distribution

| Priority | Count | % |
|---|---|---|
| Must | `<5>` | 50% |
| Should | `<3>` | 30% |
| Could | `<2>` | 20% |
| **Total in-scope** | **10** | **100%** |

---

## 7. Constraints & Assumptions

### 7.1 Constraints
- 💰 **Budget**: ≤ `<X>` VNĐ
- ⏰ **Timeline**: Go-live trước `<DD/MM/YYYY>`
- 🔒 **Compliance**: Tuân thủ `<GDPR / PCI-DSS / Nghị định 13>`
- 🛠 **Technology**: Phải dùng `<existing stack>`

### 7.2 Assumptions
- `<Assumption 1: nguồn dữ liệu A có sẵn vào Q1>`
- `<Assumption 2: team có 3 dev fulltime>`

---

## 8. Risks & Mitigations

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | `<Vendor delay API>` | Med | High | `<Build mock + parallel dev>` |
| R2 | `<User adoption thấp>` | Low | High | `<Training + roadshow>` |
| R3 | `<Compliance change>` | Low | Med | `<Monthly review legal team>` |

---

## 9. Success Criteria

`<Tiêu chí để claim "dự án thành công" — phải đo lường được.>`

- ✅ Tất cả BR Must (M) được implement và pass UAT
- ✅ KPI O1 đạt ≥80% target sau 3 tháng go-live
- ✅ Ít nhất `<X>` users hoạt động sau 1 tháng
- ✅ Zero critical bug trong 30 ngày đầu

---

## 10. Traceability Matrix

| BR-ID | FR-ID(s) | NFR-ID(s) | Test Case(s) | Status |
|---|---|---|---|---|
| BR-001 | FR-012, FR-013 | NFR-03 | TC-045, TC-046 | Todo |
| BR-002 | FR-020 | NFR-05 | TC-050 | Todo |

> Cập nhật khi FRD/SRS được sinh.

---

## 11. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Sponsor | `<Tên>` | | |
| Product Owner | `<Tên>` | | |
| BA | `<Tên>` | | |

---

## 12. Glossary

| Term | Definition |
|---|---|
| `<Term 1>` | `<Định nghĩa>` |
| `<Term 2>` | `<Định nghĩa>` |

---

## Appendix

- A. Stakeholder interviews log
- B. Process maps (current state)
- C. Reference documents
