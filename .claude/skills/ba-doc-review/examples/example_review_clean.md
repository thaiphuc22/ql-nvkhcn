# Example: Review doc CLEAN — Grade S

## Tình huống

BA senior đã viết user story cẩn thận cho feature checkout (đã chạy qua
`ba-doc-write`). Trước khi gửi PO approve, BA muốn self-review để đảm bảo
chất lượng.

## Input

```markdown
## US-024: Apply mã giảm giá tại checkout

| Field | Value |
|---|---|
| Story ID | US-024 |
| Epic | EP-005 — Promotion System |
| Sprint | 18 |
| Priority | Should (S) |
| Story Points | 5 |
| Owner | @dev-an |
| Status | Todo |
| Created by | BA Linh |
| Created date | 2026-05-08 |

### User Story
**Là** khách hàng mua hàng có mã giảm giá từ campaign,
**tôi muốn** apply mã trên trang checkout,
**để** giảm giá đơn hàng và mua được nhiều sản phẩm hơn trong budget.

### Context
Campaign Tết 2026 sinh ra 50K coupons phân phối qua email + Facebook ads.
Hiện chưa có UI để user apply mã → dropoff ở checkout 25%.
Story này expect giảm dropoff xuống ≤15% (track GA4 event).

**Source BR:** BR-031 — Promotion-driven sales
**Linked KPI:** Checkout conversion rate ≥85% (baseline 75%)

### Acceptance Criteria

#### AC1 — Apply mã hợp lệ thành công (Happy)
- **Given** user đang ở trang checkout với giỏ hàng ≥100K VNĐ,
  và có mã `TET2026` còn hạn,
- **When** nhập mã vào ô "Mã giảm giá" và click "Áp dụng",
- **Then** hệ thống validate mã và hiển thị giá mới trong ≤1 giây,
- **And** dòng "Giảm giá: -X%" xuất hiện trong tổng cộng,
- **And** event GA4 `coupon_applied` fire với coupon_code property.

#### AC2 — Mã hết hạn (Negative)
- **Given** user nhập mã `OLD2025` đã hết hạn 2025-12-31,
- **When** click "Áp dụng",
- **Then** hiển thị message inline: "Mã này đã hết hạn. Vui lòng dùng
  mã khác hoặc xem khuyến mãi hiện tại tại /promotions.",
- **And** giá đơn hàng KHÔNG thay đổi.

#### AC3 — Đơn không đủ điều kiện min order (Alternative)
- **Given** user có mã `BIGORDER` yêu cầu min order 500K VNĐ,
  và giỏ hàng đang 300K,
- **When** click "Áp dụng",
- **Then** hiển thị: "Mã này yêu cầu đơn tối thiểu 500K. Thêm 200K nữa
  để đủ điều kiện.",
- **And** suggest cross-sell sản phẩm liên quan ở dưới message.

### INVEST Check
- ✅ I — Independent (có thể release riêng)
- ✅ N — Negotiable (UX có thể bàn)
- ✅ V — Valuable (KPI: dropoff 25% → 15%)
- ✅ E — Estimable (5 points, pattern đã có ở US-018)
- ✅ S — Small (1 sprint)
- ✅ T — Testable (3 AC clear)

### Definition of Ready
- [x] INVEST 6/6 pass
- [x] AC viết đầy đủ (3)
- [x] UI mockup ready (Figma link)
- [x] API contract xác định (POST /coupons/validate)
- [x] Story points estimated (5)
- [x] PO approve

### Definition of Done
- [ ] Code merged + reviewed (≥1 reviewer)
- [ ] Unit test pass + coverage ≥80%
- [ ] Integration test (coupon service)
- [ ] E2E test cho 3 AC (Cypress)
- [ ] No new SonarQube issues
- [ ] Deployed staging
- [ ] PO approve trên staging
- [ ] Tracking GA4 events configured

### Tasks
- [ ] BE: API POST /coupons/validate (input: code, cart_total)
- [ ] BE: Coupon expiry + min_order validation logic
- [ ] BE: Unit test edge cases (whitespace, case-sensitive)
- [ ] FE: Coupon input UI ở checkout step
- [ ] FE: Inline error states
- [ ] FE: Cross-sell suggestion (AC3)
- [ ] QA: E2E test 3 AC + 2 edge cases
- [ ] DevOps: GA4 event setup
```

## Thought Process

**Step 1: Phân loại** — Format "Là... tôi muốn... để..." → User Story

**Step 2: Run 7 nhóm check theo `review_checklists.md` §E**

### Universal
- ✅ A1 — Document Control: Story ID, Sprint, Owner, Date, Status
- ✅ A2 — Structure rõ
- ✅ A3 — Ambiguity scan: KHÔNG có từ trong dictionary

### E1. Format
- ✅ Format đúng "Là... tôi muốn... để..."
- ✅ Persona cụ thể: "khách hàng mua hàng có mã giảm giá từ campaign"
- ✅ Value đo được: "giảm dropoff 25% → 15%"

### E2. INVEST 6/6
- ✅ I, N, V, E, S, T — all pass với rationale rõ

### E3. Acceptance Criteria
- ✅ 3 AC (Happy + Negative + Alternative) — đủ
- ✅ Mọi AC theo Given-When-Then
- ✅ AC độc lập, không trộn scenarios
- ✅ Có metric (≤1 giây)
- ✅ Viết WHAT, không HOW

### E4. Metadata
- ✅ Story ID, Epic, Sprint, Priority (MoSCoW), Points, Owner, Status

### E5. DoR/DoD
- ✅ DoR 6 items, all checked
- ✅ DoD 8 items detailed

### E6. Dependencies
- Không khai báo — OK vì story Independent

### E7. Tasks
- ✅ Task breakdown FE/BE/QA/DevOps đầy đủ

**Step 3: Score**
```
Critical: 0
Major: 0
Minor: 0
Info: 0

Score = 100 - 0 - 0 - 0 = 100 → Grade S (Production ready)
```

**Step 4: Verify** — Re-check rubric. Mọi check pass.

## Output

```markdown
# Review Report — US-024

**Reviewed:** 2026-05-09
**Reviewer:** ba-doc-review v1.0
**Doc type:** User Story
**Total Score:** 100/100 — Grade 🟢 S (Production ready)

## Summary
- 🔴 Critical: 0
- 🟠 Major: 0
- 🟡 Minor: 0
- ℹ️ Info: 0 (1 minor suggestion below)

🎉 **Story đạt chuẩn IIBA — sẵn sàng vào sprint planning.**

## Findings
*(Không có Critical/Major/Minor findings)*

### ℹ️ Info (Optional improvements)

#### I001 — Cross-reference với US-018
- **Section:** Comment "(pattern đã có ở US-018)"
- **Severity:** ℹ️ Info
- **Issue:** Estimate ref tới US-018 nhưng không link.
- **Suggested fix:** Thêm explicit link để dev tham khảo:
  > "5 points (pattern đã có ở [US-018: Apply gift card](link))"
- **Why Info:** Polish, không phải bug.

## Strengths

> *Section này thường skip, nhưng story này deserves recognition.*

### ✨ Điểm mạnh đáng học hỏi

1. **Persona cực kỳ cụ thể** — không chỉ "khách hàng" mà "khách hàng có
   mã từ campaign". Giúp QA test với mindset đúng (user đến từ FB ads
   → mobile-first, time-sensitive).

2. **Value gắn KPI baseline + target** — "giảm dropoff 25% → 15%". Có
   baseline → tracking ROI sau go-live khả thi.

3. **AC3 đặc biệt tốt** — không chỉ block user khi không đủ điều kiện
   mà còn cross-sell. Đây là UX design tốt + business value.

4. **DoD bao gồm GA4 events** — tracking instrumentation thường bị quên,
   ở đây explicit. Sau go-live measure được KPI ngay.

5. **Tasks breakdown FE/BE/QA/DevOps** — sprint planning sẽ smooth, dev
   không cần break down lại từ đầu.

## Next Steps

✅ **Story sẵn sàng vào sprint 18 planning.**

💡 Optional improvements (không block):
- Apply I001 (link US-018)
- Sau go-live, tracking KPI 2 tuần → adjust nếu cần

📊 **Pattern này có thể dùng làm template** cho các story coupon/promotion
khác trong Epic EP-005.
```

## Tại sao output như vậy?

1. **Score = 100, Grade S** — không tự kiềm chế xuống "vì có thể tốt hơn".
   Story đạt chuẩn = score đúng. Reviewer không tự ý hạ điểm.

2. **Findings rỗng** — không cố tìm vấn đề khi không có. KHÔNG bịa
   finding để "có gì đó để nói" — đây là anti-pattern review.

3. **Có 1 Info suggestion** — vẫn cho actionable feedback dù pass.
   Polish, không trừ điểm, đặt cuối.

4. **Strengths section ON** — exception cho doc Grade S, để công nhận
   chất lượng. Bình thường skip Strengths để không waste review value.

5. **Strengths cụ thể từng điểm với rationale** — không chung chung
   "story tốt". Mỗi điểm nêu rõ TẠI SAO tốt → giúp BA junior khác học.

6. **Next Steps đề xuất "pattern dùng làm template"** — thinking beyond
   review: leverage doc tốt cho team-wide benefit.

7. **Tone tích cực nhưng không nịnh** — "🎉 sẵn sàng" + "đáng học hỏi"
   khác với "tuyệt vời, hoàn hảo, không có gì sửa". Professional,
   evidence-based.
