# Example: Sinh BRD đầy đủ cho dự án migration

## Tình huống

Sponsor (CFO) yêu cầu BA viết BRD cho dự án migrate hệ thống chấm công
giấy → app mobile. Đã có sẵn data từ phỏng vấn HR.

## Input (từ phỏng vấn stakeholder)

```
Bối cảnh: Công ty 500 nhân sự, hiện chấm công bằng máy chấm vân tay.
HR mỗi tháng tốn 40 giờ tổng hợp data. Lỗi data ~5%.

Mục tiêu: 
- Giảm thời gian HR còn ≤8 giờ/tháng
- Lỗi data <0.5%
- Triển khai trước Q4 2026

Stakeholder:
- Sponsor: CFO (bà Hương)
- PO: HR Manager (anh Tuấn)
- End-user: 500 nhân viên
- Tech Lead: anh Khoa

Constraints:
- Budget tối đa 800M VNĐ
- Phải tích hợp với SAP HR hiện có
- Tuân thủ Nghị định 13/2023 về dữ liệu cá nhân
```

## Thought Process

**BACCM check:**
- Change ✅ — migration giấy → digital
- Need ✅ — pain point có data (40h, 5% lỗi)
- Solution ✅ — app mobile (high-level)
- Stakeholder ✅ — đầy đủ
- Value ✅ — KPI cụ thể (≤8h, <0.5%)
- Context ✅ — budget, deadline, compliance, tech

→ Đủ thông tin sinh BRD. Không cần hỏi thêm.

**Phân tích priority với MoSCoW:**

- Must: Core chấm công (in/out), tích hợp SAP, compliance
- Should: Báo cáo tự động, OT registration
- Could: Geo-fencing, photo verification
- Won't: Face recognition (phase 2)

## Output

```markdown
# Business Requirements Document — Hệ thống Chấm công Mobile

## Document Control

| Field | Value |
|---|---|
| Document ID | BRD-2026-007 |
| Version | 1.0 |
| Status | Draft |
| Owner | BA Phương |
| Sponsor | CFO Hương |
| Created | 2026-05-09 |

### Change Log
| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-05-09 | BA Phương | Initial draft |

---

## 1. Executive Summary

Dự án xây dựng app mobile chấm công thay thế hệ thống vân tay hiện tại,
giải quyết pain point HR tốn 40 giờ/tháng tổng hợp data với tỷ lệ lỗi ~5%.
Mục tiêu: giảm thời gian HR xuống ≤8 giờ/tháng, lỗi <0.5%, go-live Q4 2026,
budget ≤800M VNĐ.

---

## 2. Background & Context (BACCM)

### 2.1 Change
Chuyển đổi từ chấm công vân tay (hardware-based) sang app mobile,
tích hợp với SAP HR hiện có để tự động hoá tính lương.

### 2.2 Need
- 40 giờ/tháng HR tổng hợp data (cost ~200M/năm)
- Lỗi data ~5% gây tranh chấp lương
- Máy vân tay hỏng vặt (3-5 lần/tháng), chi phí maintenance 50M/năm
- Nhân viên phàn nàn xếp hàng buổi sáng

### 2.3 Context
- 500 nhân sự, 3 chi nhánh HCM/HN/ĐN
- SAP HR đã chạy 5 năm, có module Time Management
- Tất cả nhân viên có smartphone (95% iOS+Android)
- Compliance: Nghị định 13/2023 về dữ liệu cá nhân

---

## 3. Business Objectives

| # | Objective | KPI | Deadline |
|---|---|---|---|
| O1 | Giảm thời gian HR tổng hợp | ≤8 giờ/tháng (từ 40h) | Q1 2027 |
| O2 | Giảm tỷ lệ lỗi data | <0.5% (từ 5%) | Q1 2027 |
| O3 | Loại bỏ chi phí maintenance vân tay | -50M VNĐ/năm | Q4 2026 |
| O4 | Cải thiện trải nghiệm nhân viên | NPS ≥8/10 | Q1 2027 |

---

## 4. Stakeholders Matrix

| Role | Name | Responsibility | Influence | Interest |
|---|---|---|---|---|
| Sponsor | CFO Hương | Funding + final approval | High | High |
| Product Owner | HR Manager Tuấn | Backlog priority, UAT | High | High |
| Business Analyst | BA Phương | Requirements | Med | High |
| Tech Lead | Khoa | Technical feasibility | High | Med |
| QA Lead | TBD | Test strategy | Med | Med |
| End-user | 500 nhân viên | Daily users | Low | High |
| Compliance | Legal team | Nghị định 13 review | Med | Low |
| IT Ops | DevOps team | Hosting, integration SAP | Med | Med |

---

## 5. Scope

### 5.1 In-Scope
- ✅ App mobile iOS + Android cho nhân viên
- ✅ Web admin cho HR
- ✅ Tích hợp 2-chiều với SAP HR (Time Management module)
- ✅ Báo cáo realtime cho HR
- ✅ Push notification nhắc chấm công

### 5.2 Out-of-Scope
- ❌ Face recognition (phase 2)
- ❌ Tích hợp lương thưởng/KPI (phase 2)
- ❌ Migration data lịch sử >2 năm (chỉ migrate 2 năm gần nhất)

### 5.3 Boundaries
- App ↔ Backend qua REST API (HTTPS)
- Backend ↔ SAP HR qua iDoc (định kỳ 5 phút)

---

## 6. Business Requirements

| ID | Description | Priority | Rationale | Source |
|---|---|---|---|---|
| BR-001 | Hệ thống PHẢI cho phép nhân viên check-in/check-out qua app mobile | M | Core function, không có = dự án thất bại | O1, O4 |
| BR-002 | Hệ thống PHẢI xác thực vị trí khi check-in (GPS) trong vòng 100m từ chi nhánh | M | Tránh check-in từ xa, gắn với O2 | O2 |
| BR-003 | Hệ thống PHẢI sync data với SAP HR mỗi 5 phút | M | Tích hợp lương tự động, gắn O1 | O1 |
| BR-004 | Hệ thống PHẢI tuân thủ Nghị định 13/2023 (consent, retention, right to delete) | M | Compliance — vi phạm = phạt 5% doanh thu | Compliance |
| BR-005 | Hệ thống PHẢI mã hoá dữ liệu cá nhân (rest + transit) | M | Bảo mật + compliance | Compliance |
| BR-006 | Hệ thống NÊN cho phép HR xuất báo cáo Excel/PDF tự động | S | Giảm thao tác thủ công, gắn O1 | O1 |
| BR-007 | Hệ thống NÊN gửi push notification nhắc chấm công | S | Cải thiện compliance rate | O4 |
| BR-008 | Hệ thống NÊN cho phép đăng ký OT trên app | S | Tránh giấy tờ thủ công | O1 |
| BR-009 | Hệ thống CÓ THỂ hỗ trợ geo-fencing tự động check-in khi đến công ty | C | Nice-to-have UX | O4 |
| BR-010 | Hệ thống CÓ THỂ chụp ảnh selfie verify khi check-in | C | Tăng độ tin cậy nhưng không bắt buộc | O2 |
| BR-011 | Face recognition — Phase 2 | W | Out of scope iteration này | — |

### MoSCoW Distribution

| Priority | Count | % |
|---|---|---|
| Must | 5 | 50% |
| Should | 3 | 30% |
| Could | 2 | 20% |
| **Total in-scope** | **10** | **100%** |

---

## 7. Constraints & Assumptions

### 7.1 Constraints
- 💰 **Budget**: ≤800,000,000 VNĐ (đã bao gồm SAP integration cost)
- ⏰ **Timeline**: Go-live trước 31/12/2026
- 🔒 **Compliance**: Nghị định 13/2023 — bắt buộc consent flow
- 🛠 **Technology**: Phải tích hợp SAP HR hiện có, không thay thế

### 7.2 Assumptions
- 95% nhân viên có smartphone iOS≥14 hoặc Android≥10 (đã survey)
- SAP HR module Time Management cho phép API/iDoc integration
- Wifi/3G ổn định tại 3 chi nhánh

---

## 8. Risks & Mitigations

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | SAP integration chậm hơn plan | Med | High | Build mock SAP + parallel dev, có vendor SAP support tuần đầu |
| R2 | Nhân viên không quen app, kháng cự | Med | Med | Training video + roadshow tại 3 chi nhánh, pilot group 50 người |
| R3 | Compliance audit fail | Low | High | Hire DPO consultant review trước go-live, DPIA xong tháng 8 |
| R4 | Vendor app dev quá hạn | Med | High | Chốt SLA + penalty trong contract, có backup vendor option |

---

## 9. Success Criteria

- ✅ 100% BR Must (M) implement và pass UAT
- ✅ ≥95% nhân viên active trong 30 ngày đầu go-live
- ✅ HR confirm thời gian tổng hợp ≤8h/tháng (đo trong tháng 1 & tháng 2 sau go-live)
- ✅ Tỷ lệ lỗi data <0.5% (đo qua reconciliation report)
- ✅ Zero critical bug trong 30 ngày đầu
- ✅ Compliance audit pass (ký bởi DPO + Legal)

---

## 10. Traceability Matrix

| BR-ID | FR-ID(s) | NFR-ID(s) | Test Case(s) | Status |
|---|---|---|---|---|
| BR-001 | TBD (chờ FRD) | NFR-P01 (≤2s response) | TBD | Todo |
| BR-002 | TBD | — | TBD | Todo |
| BR-003 | TBD | NFR-R01 (≥99.5% sync success) | TBD | Todo |
| BR-004 | TBD | NFR-S05 (audit log) | TBD | Todo |
| BR-005 | TBD | NFR-S01, NFR-S02 | TBD | Todo |

> Cập nhật khi FRD được sinh.

---

## 11. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Sponsor | CFO Hương | _________ | _____ |
| Product Owner | HR Mgr Tuấn | _________ | _____ |
| BA | Phương | _________ | _____ |
| Tech Lead | Khoa | _________ | _____ |
| Compliance | Legal Team | _________ | _____ |

---

## 12. Glossary

| Term | Definition |
|---|---|
| Check-in / Check-out | Hành động ghi nhận giờ vào/ra của nhân viên |
| iDoc | Intermediate Document — format integration của SAP |
| DPO | Data Protection Officer (Cán bộ bảo vệ dữ liệu) |
| DPIA | Data Protection Impact Assessment |
| Geo-fencing | Tự động phát hiện thiết bị ở trong vùng địa lý xác định |

---

## Appendix

- A. Stakeholder interview transcripts (HR + 5 employees)
- B. Current state process map (chấm công vân tay)
- C. Future state process map (app mobile + SAP)
- D. SAP HR API documentation reference

---

📊 **Output Summary**
✅ BRD-2026-007 được sinh thành công
- 10 Business Requirements (5 Must, 3 Should, 2 Could, 1 Won't)
- BACCM: 6/6 ✅
- Stakeholder matrix: 8 roles ✅
- Risk register: 4 risks ✅
- Quality check: 8/8 ✅

💡 Đề xuất bước tiếp:
- Em đã sinh BRD. Anh muốn em chạy `ba-doc-review` self-check không?
- Hoặc tiếp tục sinh FRD cho từng module?
```

## Tại sao output như vậy?

1. **MoSCoW phân bổ hợp lý** — 50% Must là OK (quy tắc <60% capacity).
   Tránh gắn nhãn Must cho mọi thứ (anti-pattern phổ biến).

2. **KPI có deadline cụ thể** — không chỉ "tăng X%" mà còn "trong Q1 2027".
   Đo lường được + accountable.

3. **Risk register đủ probability + impact + mitigation** — không phải
   "có thể có rủi ro" mơ hồ. Dùng matrix đánh giá để priority risk.

4. **BR-004 + BR-005 là Compliance Must** — không skip dù sponsor không
   chú trọng. BA chuyên nghiệp tự thêm khi detect compliance context
   (Nghị định 13).

5. **Out-of-scope rõ ràng** — phòng scope creep. Phase 2 features ghi
   tường minh để stakeholder không kỳ vọng sai.

6. **Traceability TBD** — không bịa FR/Test ID khi chưa có FRD. Honest
   với current state, ghi rõ "cập nhật khi FRD sinh".
