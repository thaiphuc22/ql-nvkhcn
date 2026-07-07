# Example — Happy Path: Wishlist Story Generation

## Input (structured — assumed processed by composite or upstream skill)

```yaml
business_requirements:
  - id: BR-019
    description: "Reduce checkout abandonment by enabling save-for-later capability"
    source_kpi: "7-day conversion rate"

stakeholder_requirements:
  - persona: "registered_customer"
  - persona_specifics:
      requires_login: true
      account_age_avg_days: 90
  - pain_point: "30% users add to cart but abandon"
  - desired_outcome: "tăng 7-day conversion 25% → 35%"

business_rules:
  - rule_id: rule_001
    description: "Wishlist requires authenticated session"
  - rule_id: rule_002
    description: "Max 100 items per wishlist (DB constraint)"

context:
  domain: "e-commerce"
  sprint: 16
  epic: "EP-008-Personalization"
```

## Reasoning Pipeline Execution

### 2.1 identify_actor
- Source: `stakeholder_requirements.persona = registered_customer`
- Specifics: `requires_login = true`
- → Actor: **"Khách hàng đã đăng ký và đăng nhập"**
- Confidence: HIGH (explicit)

### 2.2 identify_goal
- Source: `business_requirements[0].description` + outcome
- Action verb: "lưu" (save)
- Object: "sản phẩm vào Wishlist"
- → Goal: **"lưu sản phẩm vào danh sách Wishlist"**

### 2.3 identify_business_value
- Source: pain_point + desired_outcome
- KPI baseline: 25% conversion → KPI target: 35%
- → Value: **"Không quên khi muốn mua lại sau (giảm friction). KPI: 7-day conversion 25% → 35%."**

### 2.4 split_large_requirements
- Estimate: 3 points (simple CRUD with auth check)
- 3 ≤ 8 → no split needed
- ✅ Skip auto-split

### 2.5 derive_acceptance_criteria
- Generate ≥3 AC per `ART-USER-STORY.mandatory_sections`:
  - AC1 Happy: Logged-in user adds item
  - AC2 Alternative: User removes saved item
  - AC3 Negative: Guest user attempts to save
- All Given-When-Then format

### 2.6 validate_INVEST
- I ✅ Independent (standalone CRUD)
- N ✅ Negotiable (UX/UI tweakable)
- V ✅ Valuable (KPI 25% → 35%)
- E ✅ Estimable (3pt — common pattern)
- S ✅ Small (1 sprint)
- T ✅ Testable (3 AC G-W-T)
- **Score: 6/6**

## Validators Applied

```json
[
  {"validator": "VALIDATOR-INVEST", "passed": true, "score": 6, "max": 6},
  {"validator": "VALIDATOR-ACTOR-DEFINITION", "passed": true, "score": 1, "max": 1, "note": "actor specific, not 'user'"},
  {"validator": "VALIDATOR-TESTABILITY", "passed": true, "score": 3, "max": 3, "note": "all 3 AC have G-W-T + measurable"}
]
```

## Output (JSON — atomic skill format)

```json
{
  "skill": "SKILL-USER-STORY-GENERATOR",
  "version": "1.0.0",
  "status": "success",
  "confidence": 0.95,
  "artifact_type": "ART-USER-STORY",
  "artifact": {
    "story_id": "US-031",
    "title": "Lưu sản phẩm vào Wishlist",
    "actor": "Khách hàng đã đăng ký và đăng nhập",
    "goal": "lưu sản phẩm vào danh sách Wishlist",
    "business_value": "Không quên khi muốn mua lại sau (giảm friction quay lại tìm sản phẩm). KPI: 7-day conversion 25% → 35% (track Mixpanel/GA4 cohort).",
    "story_points": 3,
    "priority_moscow": "S",
    "acceptance_criteria": [
      {
        "id": "AC1",
        "type": "happy_path",
        "given": "user đã đăng nhập + đang xem product detail page",
        "when": "click icon ❤️ 'Add to Wishlist' trên product card",
        "then": "sản phẩm được save vào Wishlist (DB), icon đổi state 'saved', badge counter +1, event GA4 wishlist_add fire trong ≤500ms"
      },
      {
        "id": "AC2",
        "type": "alternative",
        "given": "user đã có ≥1 sản phẩm trong Wishlist",
        "when": "click icon ❤️ filled trên item đã saved",
        "then": "sản phẩm bị xoá khỏi Wishlist, icon đổi 'unsaved', badge -1, event wishlist_remove fire"
      },
      {
        "id": "AC3",
        "type": "negative",
        "given": "user chưa đăng nhập (guest)",
        "when": "click icon ❤️ 'Add to Wishlist'",
        "then": "modal 'Đăng nhập để lưu' hiển thị với CTA Đăng nhập + Đăng ký, sau login auto-add + close modal"
      }
    ],
    "metadata": {
      "source_br": "BR-019",
      "epic": "EP-008-Personalization",
      "sprint": 16,
      "compliance_with_rules": ["rule_001", "rule_002"],
      "domain": "e-commerce"
    }
  },
  "validators_passed": [
    "VALIDATOR-INVEST (6/6)",
    "VALIDATOR-ACTOR-DEFINITION",
    "VALIDATOR-TESTABILITY"
  ],
  "followup_skills_recommended": [
    "SKILL-AC-GENERATOR (deeper edge cases)",
    "SKILL-TRACEABILITY-BUILDER (link BR-019 ↔ US-031 ↔ test cases)"
  ],
  "human_review_areas": [
    "business_priority (MoSCoW S confirmed?)",
    "delivery_scope (sprint 16 ok or move?)"
  ]
}
```

## Why this output structure?

1. **JSON not Markdown** — atomic skill returns machine-readable. Composite
   skill (`ba-doc-write`) consumes JSON and renders Markdown for user.

2. **`followup_skills_recommended`** — atomic skill suggests next step, not
   forces. Orchestrator decides whether to invoke.

3. **`metadata.compliance_with_rules`** — traces back to business rules,
   enabling traceability matrix downstream.

4. **`human_review_areas`** — flags decisions that automation can't make
   (per ART-USER-STORY.human_review_areas).

5. **`validators_passed`** — explicit validator chain documented for audit.
