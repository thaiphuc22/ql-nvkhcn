# Example — AC Generation cho Wishlist story

## Input

```yaml
user_story:
  story_id: US-031
  actor: "Khách hàng đã đăng ký và đăng nhập"
  goal: "lưu sản phẩm vào danh sách Wishlist"
  business_value: "KPI: 7-day conversion 25% → 35%"

business_rules:
  - rule_001: Wishlist requires authenticated session
  - rule_002: Max 100 items per wishlist
  - rule_003: Removed items không archived (hard delete)

edge_cases: []   # User-supplied empty → skill auto-detect
```

## Reasoning Pipeline

### 2.1 identify_main_flow
Source: actor + goal + business_value
- Given: user logged in, viewing product
- When: click ❤️ Add to Wishlist
- Then: saved + UI feedback (badge, icon state) + analytics

### 2.2 identify_edge_cases (auto-detect)
Patterns checked:
- ✅ Auth state boundary → guest user (rule_001 violation)
- ✅ Max items boundary → rule_002 (100 items max)
- ✅ Concurrent operations → 2 tabs adding same item
- ⚠️ Skip: very large wishlist render perf (UI concern, not AC)

### 2.3 identify_validation_logic
- rule_001 → AC for unauthenticated state (negative)
- rule_002 → AC for max items boundary (edge)
- rule_003 → AC for remove confirm (no soft delete fallback)

### 2.4 identify_negative_scenarios
- Guest tries → modal login (AC3)
- Item already in wishlist → idempotent (alternative AC)
- Server timeout → retry policy (could add AC5)

### 2.5 generate_testable_conditions
Each AC has:
- Given: state
- When: action verb
- Then: observable outcome WITH metric (≤500ms, badge ±1, etc.)

## Output

```json
{
  "skill": "SKILL-AC-GENERATOR",
  "version": "1.0.0",
  "status": "success",
  "confidence": 0.93,
  "artifact_type": "ART-ACCEPTANCE-CRITERIA",
  "artifact": {
    "story_ref": "US-031",
    "ac_count": 5,
    "acceptance_criteria": [
      {
        "id": "AC1",
        "type": "happy_path",
        "given": "user đã đăng nhập + đang xem product detail page",
        "when": "click icon ❤️ 'Add to Wishlist' trên product card",
        "then": "sản phẩm được persist vào wishlist (rule_001 satisfied), icon đổi state 'saved' (filled), badge counter 'Wishlist (N)' tăng +1, event GA4 wishlist_add fire trong ≤500ms với product_id property",
        "applies_rules": ["rule_001"]
      },
      {
        "id": "AC2",
        "type": "alternative",
        "given": "user đã có ≥1 item trong wishlist",
        "when": "click ❤️ filled trên item đã saved",
        "then": "item bị xoá HARD khỏi DB (rule_003 — không archive), icon đổi 'unsaved', badge -1, event wishlist_remove fire",
        "applies_rules": ["rule_003"]
      },
      {
        "id": "AC3",
        "type": "negative",
        "given": "user chưa đăng nhập (guest session)",
        "when": "click icon ❤️ 'Add to Wishlist'",
        "then": "modal 'Đăng nhập để lưu' hiển thị với 2 CTA (Login + Sign up), KHÔNG persist vào DB (rule_001 enforced), sau login thành công auto-add + close modal",
        "applies_rules": ["rule_001"]
      },
      {
        "id": "AC4",
        "type": "edge_case",
        "given": "user đã có 100 items trong wishlist (rule_002 max boundary)",
        "when": "click ❤️ trên item thứ 101",
        "then": "toast error 'Wishlist đã đầy (100/100). Vui lòng xoá item cũ trước khi thêm mới.' + KHÔNG add, badge counter giữ nguyên 100",
        "applies_rules": ["rule_002"]
      },
      {
        "id": "AC5",
        "type": "edge_case",
        "given": "user mở 2 tabs cùng một product",
        "when": "tab 1 add wishlist thành công, tab 2 click add (chưa refresh)",
        "then": "tab 2 nhận 409 Conflict response, hiển thị message 'Đã có trong wishlist của bạn', icon update sang 'saved' state (idempotent)",
        "applies_rules": ["rule_001"]
      }
    ],
    "metadata": {
      "applied_business_rules": ["rule_001", "rule_002", "rule_003"],
      "edge_cases_detected": ["unauthenticated_state", "max_items_boundary", "concurrent_tabs"],
      "negative_count": 1,
      "edge_count": 2
    }
  },
  "validators_passed": [
    "VALIDATOR-TESTABILITY (5/5 AC writable)",
    "VALIDATOR-MEASURABILITY (all metrics specific)",
    "VALIDATOR-EDGECASE-COVERAGE (≥1 negative, ≥1 edge)"
  ],
  "followup_skills_recommended": [
    "SKILL-EDGECASE-DETECTOR (roadmap — deeper analysis: race conditions, data consistency)"
  ]
}
```

## Why this output?

1. **5 AC thay vì 3 minimum** — skill auto-detected 2 edge cases từ business rules. Better coverage.
2. **`applies_rules` field** — traceability từng AC ↔ business_rule. SKILL-TRACEABILITY-BUILDER consume.
3. **AC5 concurrency** — không có trong rules nhưng skill detect được qua pattern matching ("authenticated session" implies session conflict possible).
4. **rule_003 in AC2** — flagged hard delete (no archive) — important for compliance/audit context.
