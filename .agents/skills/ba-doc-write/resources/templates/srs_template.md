# Software Requirements Specification — `<Tên Hệ Thống>`

> Template chuẩn IEEE 830 + IIBA. SRS = BRD + FRD + NFR — đầy đủ nhất.
> Dùng khi cần spec gửi vendor/SI hoặc audit compliance.

---

## Document Control

| Field | Value |
|---|---|
| Document ID | SRS-`<YYYY>`-`<###>` |
| Version | 1.0 |
| Status | Draft / Review / Approved / Baseline |
| Owner | `<Tên BA>` |
| Created | `<YYYY-MM-DD>` |
| Last Updated | `<YYYY-MM-DD>` |

---

## 1. Introduction

### 1.1 Purpose
`<SRS này đặc tả đầy đủ requirement cho hệ thống X.>`

### 1.2 Document Conventions
- **PHẢI** (MUST) — bắt buộc; thiếu = fail.
- **NÊN** (SHOULD) — khuyến nghị; có lý do mới skip.
- **CÓ THỂ** (MAY) — tùy chọn.

### 1.3 Intended Audience
- BA, PO, Tech Lead, QA Lead, SI/Vendor, Compliance

### 1.4 Product Scope
`<1-2 đoạn về sản phẩm: làm gì, cho ai, value.>`

### 1.5 References
- BRD-XXX
- Existing system docs
- Compliance standards

---

## 2. Overall Description

### 2.1 Product Perspective
`<Standalone? Module của hệ thống lớn? Replace legacy?>`

### 2.2 Product Functions (high-level)
- Function 1: `<...>`
- Function 2: `<...>`

### 2.3 User Classes & Characteristics

| Class | Description | Tech Skill | Frequency |
|---|---|---|---|
| Admin | Quản trị hệ thống | High | Daily |
| Power User | Sử dụng nâng cao | Med | Daily |
| Regular User | Người dùng cuối | Low | Weekly |

### 2.4 Operating Environment
- OS: `<Windows 10+, macOS 11+, Linux Ubuntu 20+>`
- Browser: `<Chrome ≥90, Safari ≥14, Edge ≥90>`
- Device: `<Desktop, tablet, mobile (iOS 14+, Android 10+)>`

### 2.5 Design & Implementation Constraints
- Tech stack: `<React + Node.js + PostgreSQL>`
- Compliance: `<Nghị định 13/2023, ISO 27001>`
- Budget: ≤ `<X>` VNĐ

### 2.6 Assumptions & Dependencies
- `<Assumption 1>`
- `<Dependency 1: API X có vào Q1>`

---

## 3. System Features (Functional Requirements)

> Như FRD — copy section 2-8 từ `frd_template.md`.

### 3.1 Feature: `<Feature Name>`

#### 3.1.1 Description & Priority
`<1 paragraph mô tả>` — Priority: `<M/S/C/W>`

#### 3.1.2 Functional Requirements

| ID | FR | Source BR | AC |
|---|---|---|---|
| FR-001 | `<Hệ thống PHẢI...>` | BR-001 | §3.1.3 |

#### 3.1.3 Acceptance Criteria
`<Given-When-Then cho từng FR>`

#### 3.1.4 Business Rules
`<Rule ID + description>`

---

## 4. Non-Functional Requirements (NFR)

> Mọi NFR phải đo lường được — số + đơn vị.

### 4.1 Performance Requirements

| ID | Requirement | Metric | Target |
|---|---|---|---|
| NFR-P01 | Response time API | p95 latency | ≤ 500ms |
| NFR-P02 | Page load time | First Contentful Paint | ≤ 2s |
| NFR-P03 | Throughput | Concurrent users | ≥ 1000 |
| NFR-P04 | Database query | Slow query | ≤ 100ms |

### 4.2 Reliability & Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-R01 | Uptime SLA | ≥ 99.9% (≤ 8.76h downtime/year) |
| NFR-R02 | RPO (Recovery Point Objective) | ≤ 1 hour |
| NFR-R03 | RTO (Recovery Time Objective) | ≤ 4 hours |
| NFR-R04 | MTBF | ≥ 30 ngày |

### 4.3 Security Requirements

| ID | Requirement | Standard |
|---|---|---|
| NFR-S01 | Mã hoá dữ liệu rest | AES-256 |
| NFR-S02 | Mã hoá dữ liệu transit | TLS 1.3 |
| NFR-S03 | Authentication | OAuth 2.0 + MFA |
| NFR-S04 | Authorization | RBAC (Role-Based Access Control) |
| NFR-S05 | Audit log | Mọi action critical, retain ≥ 1 năm |
| NFR-S06 | Rate limiting | 100 req/min/user |
| NFR-S07 | OWASP Top 10 | Mitigate 100% |

### 4.4 Usability

| ID | Requirement | Target |
|---|---|---|
| NFR-U01 | Onboarding completion | ≥ 85% users hoàn thành ≤ 5 phút |
| NFR-U02 | Task success rate | ≥ 90% |
| NFR-U03 | NPS score | ≥ 8/10 |
| NFR-U04 | Accessibility | WCAG 2.1 AA |
| NFR-U05 | Localization | Vietnamese + English |

### 4.5 Maintainability

| ID | Requirement | Target |
|---|---|---|
| NFR-M01 | Code coverage | ≥ 80% |
| NFR-M02 | Cyclomatic complexity | ≤ 10/function |
| NFR-M03 | Documentation | API docs auto-generated, ADR đầy đủ |
| NFR-M04 | Build time | ≤ 5 phút |

### 4.6 Compatibility

| ID | Requirement |
|---|---|
| NFR-C01 | Browser: Chrome ≥90, Safari ≥14, Firefox ≥88, Edge ≥90 |
| NFR-C02 | Mobile: iOS ≥14, Android ≥10 |
| NFR-C03 | Resolution: 1280×720 → 4K |
| NFR-C04 | Backward compat API: support v(N-1) trong 6 tháng |

### 4.7 Portability & Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-PS01 | Horizontal scaling | Auto-scale 1-50 instances |
| NFR-PS02 | Cloud-agnostic | Deploy được AWS + GCP |
| NFR-PS03 | Database scaling | Read replica + sharding ready |

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Web app responsive
- Mobile app native (iOS + Android)
- Admin dashboard

### 5.2 Hardware Interfaces
`<Nếu có — POS device, scanner, IoT...>`

### 5.3 Software Interfaces

| System | Purpose | Protocol | Auth |
|---|---|---|---|
| Payment Gateway | Thu tiền | REST | API Key + HMAC |
| SMS Provider | Notification | REST | API Key |
| Identity Provider | SSO | OAuth 2.0 / SAML | Client ID + Secret |

### 5.4 Communication Interfaces
- HTTPS REST cho client-server
- WebSocket cho real-time
- SMTP cho email
- gRPC cho internal services

---

## 6. Data Requirements

### 6.1 Data Model
`<ERD — Entity Relationship Diagram>`

### 6.2 Data Retention

| Data Type | Retention | Disposal |
|---|---|---|
| User PII | Active + 5 năm sau cancellation | Anonymize |
| Transaction logs | 7 năm (compliance) | Archive cold storage |
| Audit logs | 1 năm online + 5 năm archive | Permanent delete |

### 6.3 Data Backup

- Full backup: hàng tuần
- Incremental backup: hàng ngày
- Off-site backup: hàng tuần
- Restore drill: hàng quý

---

## 7. Compliance & Legal

| Standard | Applicable | Notes |
|---|---|---|
| Nghị định 13/2023 (Bảo vệ dữ liệu cá nhân) | ✅ | Consent, retention, right to delete |
| GDPR (nếu có user EU) | `<✅/❌>` | DPO, DPIA |
| PCI-DSS (nếu lưu card) | `<✅/❌>` | Level tuỳ scope |
| ISO 27001 | `<✅/❌>` | ISMS framework |

---

## 8. Traceability Matrix

| BR-ID | FR-ID(s) | NFR-ID(s) | Test Case(s) | Status |
|---|---|---|---|---|
| BR-001 | FR-001, FR-002 | NFR-P01, NFR-S01 | TC-001, TC-002 | Todo |
| BR-002 | FR-010 | NFR-R01 | TC-010 | Todo |

---

## 9. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Sponsor | | | |
| BA | | | |
| Tech Lead | | | |
| QA Lead | | | |
| Compliance Officer | | | |

---

## Appendices

- A. Glossary
- B. Process maps (current state vs future state)
- C. Reference architecture diagram
- D. Compliance checklist
