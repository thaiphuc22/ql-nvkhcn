# Example: Review BRD có gaps + compliance miss

## Tình huống

CTO yêu cầu BA review BRD Payment Gateway (do BA junior viết) trước khi
gửi cho vendor SI quote. Doc 20 trang, có vấn đề nghiêm trọng về compliance.

## Input

User: *"Review giúp em BRD payment gateway này, xem có gì thiếu không."*

File: `brd_payment_v0.3.docx` (path provided)

## Thought Process

**Step 1: Phân loại** — Run parser:
```bash
python scripts/doc_tool.py parse brd_payment_v0.3.docx -o parsed.json
```
- Headings detected: "Business Requirements Document", "Business Objectives",
  "Stakeholders" → loại = **BRD**

**Step 2: Format input** — `.docx` → JSON parsed thành công.

**Step 3: Run 7 nhóm check theo `review_checklists.md` §B**

### Universal (A1-A4)
- ✅ A1 — Có Document Control header
- ⚠️ A2 — Numbering OK
- 🚨 A3 — Ambiguity scan: tìm thấy:
  - "thanh toán nhanh" (§3, line 23) → **F008 Major**
  - "xử lý hiệu quả" (§3, line 31) → **F009 Major**
  - "UI dễ dùng" (§5, line 67) → **F010 Major**

### B1. BACCM Coverage
- ✅ Change ✅ Need ✅ Solution
- ⚠️ Stakeholder — có Sponsor + PO + BA, thiếu Compliance Officer (cho payment)
- ✅ Value — có KPI cụ thể (-30% transaction fail)
- ⚠️ Context — KHÔNG mention PCI-DSS!

### B5. BR Format
- ✅ Mọi BR có ID (BR-001 đến BR-020)
- ✅ Mọi BR có Priority

### B6. MoSCoW Balance — 🚨 IMBALANCE
- Đếm: Must=17, Should=2, Could=1, Won't=0
- → 17/20 = **85% Must** → **F003 Major** (over-prioritized)

### B7. Risks
- ✅ 5 risks listed
- ⚠️ Không có "Compliance audit fail" risk — gap

### B9. Compliance — 🚨 CRITICAL GAP
- BRD về **payment gateway** (xử lý card data)
- KHÔNG mention PCI-DSS bất cứ đâu
- KHÔNG mention Nghị định 13 (PII)
- KHÔNG có DPIA / consent flow
- → **F001 Critical** (compliance violation)

### B10. Traceability Matrix
- 🚨 KHÔNG có matrix → **F002 Critical**

**Step 4: Score**
```
Critical: 2 (F001, F002)
Major: 4 (F003, F008, F009, F010)
Minor: 2 (compliance officer missing in matrix; risk register gap)

Score = 100 - 2×20 - 4×5 - 2×1 = 38

Compliance-heavy weight (review_rubric.md §4.1):
- F001 (compliance critical) ×2 weight
- → Score = 100 - 1×40 - 1×20 - 4×5 - 2×1 = 18

Final: 18/100 → Grade F (Vứt làm lại)
```

⚠️ Đặc biệt: F001 áp dụng compliance-heavy weight (×2) vì doc về payment.

**Step 5: Verify** — Re-check rubric, format, severity → OK.

## Output (Format A — Markdown Report)

```markdown
# Review Report — BRD Payment Gateway v0.3

**Reviewed:** 2026-05-09
**Reviewer:** ba-doc-review v1.0
**Doc type:** BRD (Compliance-heavy: payment processing)
**Total Score:** 18/100 — Grade 🔴 F (Vứt làm lại)

## Summary
- 🔴 Critical: 2 (1 áp compliance ×2 weight)
- 🟠 Major: 4
- 🟡 Minor: 2
- ℹ️ Info: 0

🚨 **CẢNH BÁO NGHIÊM TRỌNG:** BRD này **KHÔNG ĐƯỢC GỬI** cho vendor/SI
trước khi fix Critical findings. Risk: vi phạm PCI-DSS → phạt nặng + mất
license merchant + mất uy tín với bank.

## Findings

### 🔴 CRITICAL (Compliance-heavy ×2 weight)

#### F001 — Thiếu hoàn toàn compliance section (PCI-DSS, Nghị định 13)
- **Section:** §7 Constraints (không có compliance subsection)
- **Severity:** 🔴 Critical (compliance ×2 = 40 điểm trừ)
- **Issue:** BRD về **payment gateway** xử lý card data nhưng KHÔNG
  mention PCI-DSS bất cứ đâu trong doc. Không có Nghị định 13 cho PII
  của khách hàng. Không có DPIA. Không có consent flow.
- **Why critical:** Vi phạm pháp luật:
  - **PCI-DSS:** Lưu/xử lý card không tuân thủ → phạt 5-10K USD/tháng,
    mất merchant license, banks reject.
  - **Nghị định 13/2023:** Phạt đến 5% doanh thu năm + dừng hoạt động.
  - Vendor SI nhìn doc này → quote giá thấp hơn thật (chưa tính compliance) →
    deliver xong fail audit → kiện tụng.
- **Suggested fix:** Thêm section §7.X mới:

  ```markdown
  ## 7.3 Compliance & Regulatory Constraints

  ### 7.3.1 PCI-DSS (Payment Card Industry Data Security Standard)
  - **Level required:** Level 1 (xử lý >6M transactions/năm)
  - **Scope:** KHÔNG lưu card number ngoài tokenized form. Sử dụng
    tokenization service (Stripe/Adyen) — KHÔNG tự lưu PAN.
  - **Audit:** QSA assessment hằng năm, ASV scan hàng quý.
  - **Penalty:** Vi phạm = 5-10K USD/tháng, mất merchant license.

  ### 7.3.2 Nghị định 13/2023 — Bảo vệ Dữ liệu Cá nhân
  - **Scope:** Mọi PII của khách hàng (email, phone, address)
  - **Consent:** Phải có UI consent rõ ràng + log
  - **Retention:** Card token retain ≤7 năm (theo luật kế toán);
    PII active + 5 năm sau hủy account
  - **Right to delete:** API/UI cho user delete account
  - **Penalty:** Phạt đến 5% doanh thu + đình chỉ hoạt động

  ### 7.3.3 Required Roles
  - **DPO** (Data Protection Officer) — appoint trước go-live
  - **PCI-DSS QSA** — engage vendor (Trustwave, NCC Group)

  ### 7.3.4 DPIA (Data Protection Impact Assessment)
  - Phải hoàn thành DPIA trước go-live (legal team + DPO)
  - Update khi có thay đổi flow PII
  ```

- **Reference:** ND 13/2023 Việt Nam, PCI-DSS v4.0

#### F002 — Thiếu Traceability Matrix
- **Section:** §10 (không có)
- **Severity:** 🔴 Critical
- **Issue:** Không có matrix BR → FR → Test. Không trace được khi
  requirement thay đổi → impact analysis không làm được.
- **Why critical:** Audit (PCI-DSS yêu cầu) → cần chứng minh mọi
  requirement đã test. Không có matrix = audit fail.
- **Suggested fix:** Thêm section §10 với template từ
  `ba-doc-write/resources/templates/brd_template.md` §10. Khi FRD ra
  thì populate FR-IDs.

### 🟠 MAJOR

#### F003 — MoSCoW Imbalance (85% Must)
- **Section:** §6 Business Requirements
- **Severity:** 🟠 Major
- **Issue:** 17/20 BR là Must (85%) → mất ý nghĩa prioritization.
  Khi mọi thứ Must = không có gì Must thật sự. Vendor sẽ scope creep.
- **Why Major:** Project sẽ over-budget hoặc miss deadline. Theo quy tắc
  60/40 (babok_knowledge.md §3), Must phải ≤60% capacity.
- **Suggested fix:** Re-evaluate, downgrade một số:
  - **BR-008 "Hỗ trợ thẻ JCB":** chỉ 2% market VN → Should
  - **BR-012 "Lịch sử giao dịch xuất Excel":** UX nice → Could
  - **BR-014 "Đa ngôn ngữ EN":** Phase 2 → Won't (this iteration)
  - **BR-016 "Voucher/Coupon system":** Không phải core payment → Could
  - **BR-018 "Chatbot CSKH":** Out of scope payment → Won't
  Sau review: Must ~12/20 (60%), Should 4, Could 3, Won't 1 → balanced.

#### F008 — Ambiguity: "thanh toán nhanh"
- **Section:** §3 line 23
- **Severity:** 🟠 Major
- **Issue:** "Hệ thống thanh toán nhanh" — "nhanh" là gì? 1s? 5s?
  PCI mandate ≤30s từ click → confirm.
- **Suggested fix:** "Hệ thống PHẢI hoàn tất giao dịch trong ≤5 giây
  (p95) từ click 'Thanh toán' đến confirmation page."
- **Reference:** ambiguity_dictionary.md §1

#### F009 — Ambiguity: "xử lý hiệu quả"
- **Section:** §3 line 31
- **Severity:** 🟠 Major
- **Issue:** "xử lý hiệu quả" — đo bằng gì? Throughput? Cost? Success rate?
- **Suggested fix:** "Hệ thống PHẢI đạt success rate ≥98% (excluding
  user-side errors như sai thẻ, không đủ tiền) và throughput ≥500 TPS
  trong peak hour."
- **Reference:** ambiguity_dictionary.md §3

#### F010 — Ambiguity: "UI dễ dùng"
- **Section:** §5 line 67
- **Severity:** 🟠 Major
- **Issue:** "dễ dùng" không đo được.
- **Suggested fix:** "UI phải đạt: completion rate ≥90% (test 50 users),
  task time ≤45 giây (từ chọn sản phẩm → confirm), NPS ≥8/10. WCAG 2.1 AA."
- **Reference:** ambiguity_dictionary.md §2

### 🟡 MINOR

#### F011 — Stakeholder Matrix thiếu Compliance Officer
- **Section:** §4 Stakeholders Matrix
- **Severity:** 🟡 Minor (có thể nâng Major nếu doc về compliance heavy như PCI)
- **Issue:** Doc về payment nhưng matrix thiếu Compliance Officer / DPO.
- **Suggested fix:** Thêm row:
  ```
  | Compliance Officer | <Tên> | PCI-DSS + ND13 audit | Med | High |
  | DPO | <Tên>/TBD | Data protection compliance | Med | High |
  ```

#### F012 — Risk register thiếu compliance risk
- **Section:** §8 Risks
- **Severity:** 🟡 Minor
- **Issue:** 5 risks listed nhưng KHÔNG có "Compliance audit fail".
- **Suggested fix:**
  ```
  | R6 | Compliance audit fail (PCI/ND13) | Low | Critical |
       | Hire QSA + DPO consult, DPIA xong tháng 8, monthly internal audit |
  ```

## Strengths
*(Liệt kê khi user yêu cầu)*

## Next Steps

🚨 **PRIORITY 0 (NGAY):**
1. **DỪNG gửi BRD cho vendor SI** — fix F001 + F002 trước
2. Engage Legal team + Compliance Officer (đề xuất hire DPO consultant)

📋 **PRIORITY 1 (Tuần này):**
3. Add §7.3 Compliance section (F001) — copy template ở suggested fix
4. Add §10 Traceability Matrix (F002)
5. Re-balance MoSCoW (F003) — meeting với PO + Sponsor

🛠 **PRIORITY 2 (Tuần sau):**
6. Fix ambiguity (F008, F009, F010) — gắn metrics
7. Update stakeholder matrix (F011) + risk register (F012)

🔁 **Re-run** `ba-doc-review` sau fix → expect Score ≥85 (Grade A).

💡 **Gợi ý:** Sau khi fix, gọi `ba-doc-write` để rewrite §7.3 chuẩn theo
   IIBA template — sẽ nhanh hơn fix manual và đảm bảo format consistent.

📞 **Cần help?** Liên hệ:
- PCI-DSS QSA: Trustwave / NCC Group / KPMG
- DPO consultant: theo recommend của Legal team

## 🛠 Rewritten Reference (Section-level — BRD quá dài để full rewrite)

> BRD 20 trang → KHÔNG full rewrite (risk bịa data). Em chỉ rewrite các
> section FAIL Critical/Major. BA copy-paste vào doc gốc + customize.

### Sections rewritten

#### §7.3 Compliance & Regulatory (NEW — addresses F001)

[Đã copy ở Suggested fix của F001 — chi tiết PCI-DSS Level 1 + Nghị định 13
+ DPIA + roles. Copy-paste trực tiếp vào BRD §7.3.]

#### §10 Traceability Matrix (NEW — addresses F002)

```markdown
## 10. Traceability Matrix

| BR-ID | FR-ID(s) | NFR-ID(s) | Test Case(s) | Compliance | Status |
|---|---|---|---|---|---|
| BR-001 | TBD | TBD | TBD | PCI-DSS 3.4 | Todo |
| BR-002 | TBD | TBD | TBD | PCI-DSS 3.4 | Todo |
| BR-003 | TBD | TBD | TBD | ND13/2023 §16 | Todo |
[... map all 20 BRs]
```

> Cập nhật FR/NFR/TC IDs khi FRD ra. Compliance column riêng cho audit trail.

#### §6 Business Requirements (re-balanced MoSCoW — addresses F003)

[ASSUME: cần PO meeting confirm priorities trước khi commit changes]

```markdown
| ID | Description | Priority | Rationale |
|---|---|---|---|
| BR-008 | Hỗ trợ thẻ JCB | Should (S) ⚠️changed from M | Chỉ 2% market VN, không block launch |
| BR-012 | Lịch sử giao dịch xuất Excel | Could (C) ⚠️changed from M | Nice-to-have, không block payment core |
| BR-014 | Đa ngôn ngữ EN | Won't (W) ⚠️changed from M | Phase 2 — focus VN trước |
| BR-016 | Voucher/Coupon system | Could (C) ⚠️changed from M | Out of scope payment core |
| BR-018 | Chatbot CSKH | Won't (W) ⚠️changed from M | Out of scope payment dự án |
[... 15 BR khác giữ Must]
```

Result: Must 12/20 (60%), Should 4 (20%), Could 3 (15%), Won't 1 (5%) → balanced.

### Manual customization needed (BA verify trước khi commit BRD update)

- [ ] **F001 PCI-DSS Level**: Verify với Finance team số transactions/năm
  để xác định đúng Level (1/2/3/4)
- [ ] **F001 Vendor**: Confirm với Legal team chọn QSA + DPO consultant nào
- [ ] **F003 MoSCoW changes**: Meeting với PO + Sponsor + CFO confirm
  ⚠️changed items — KHÔNG commit nếu chưa approve
- [ ] **§10 Traceability**: Chỉ TBD — cập nhật khi FRD sinh
- [ ] **F011 Stakeholder Matrix**: Hire/assign DPO + Compliance Officer

### Sections KHÔNG rewrite (BA tự fix theo suggested fix)

- F008-F010 (Ambiguity): trivial, BA replace từ ngữ trực tiếp theo suggested fix
- F011 (Stakeholder): thêm 2 row vào matrix có sẵn
- F012 (Risk register): thêm 1 row R6 — đã ghi rõ ở finding
```

## Output (Format B — Inline Annotated)

User có thể gọi:
```bash
python scripts/doc_tool.py annotate brd_payment.md findings.json -o brd_payment.annotated.md
```

Sinh file annotated với HTML comments tại từng vị trí lỗi. Hữu ích cho:
- BA junior xem từng dòng có comment gì
- Track changes trong Git diff
- In ra paper review (markdown → PDF)

## Tại sao output như vậy?

1. **Cảnh báo "DỪNG gửi vendor"** ở đầu report — không vòng vo. Reviewer
   senior sẽ đánh giá ngay severity và biết priority.

2. **Suggested fix cho F001 cực kỳ chi tiết** — copy-paste được luôn vào
   doc. BA junior không cần Google "PCI-DSS Level 1 là gì?".

3. **F003 không chỉ chê imbalance mà nêu cụ thể 5 BR cần downgrade** với
   lý do (market share JCB 2%, Phase 2, ...). Coaching, không criticism.

4. **Score áp compliance-heavy weight (×2)** theo rubric §4.1 vì doc payment.
   Reflect đúng severity thực tế (vi phạm pháp luật ≠ vi phạm style).

5. **Next Steps có Priority 0/1/2 + timeline** — không chỉ list mà có
   roadmap fix (3 priority levels = 3 tuần work).

6. **Cuối cùng đề xuất hire DPO consultant + QSA vendor** — actionable
   beyond just doc fix. BA chuyên nghiệp hiểu rằng compliance không thể
   tự BA fix một mình.
