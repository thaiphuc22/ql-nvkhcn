# Example — Auto-split: Oversized Story → 3 Small Stories

## Tình huống

Composite skill `ba-doc-write` parse user input và pass structured
requirement vào atomic skill. Skill detect estimated story points >8 →
trigger auto_fix `split_story` (per VALIDATOR-INVEST.auto_fix_strategy).

## Input

```yaml
business_requirements:
  - id: BR-001
    description: "Authentication system with email/password, lockout policy after failures, and forgot password flow"
    source_kpi: "Reduce signup friction (track: account creation rate)"

stakeholder_requirements:
  - persona: "registered_customer"
  - features_in_scope:
      - login_with_email_password
      - lockout_after_5_failures
      - forgot_password_email_flow

context:
  domain: "e-commerce"
  sprint: 12
```

## Reasoning Pipeline — Detect Oversized

### 2.1-2.3: Identify actor/goal/value
✅ All extractable. But...

### 2.4 split_large_requirements (TRIGGER)

Estimated points by composite skill: **13** (3 functional areas × 4-5pt each).

```python
if estimate_story_points(input) > 8:
    apply_validator("VALIDATOR-INVEST")
    # → severity.oversized_story = medium
    # → auto_fix_strategy.oversized_story = ["split_story"]
    return apply_auto_fix("split_story", input)
```

**Split strategy:** Per stakeholder journey + per AC scope.

- **US-005a: Email/password login** (5pt) — core happy path + sai password
- **US-005b: Lockout policy** (3pt) — sau 5 fail attempts
- **US-005c: Forgot password** (5pt) — reset flow via email link

## Output (auto_split_applied status)

```json
{
  "skill": "SKILL-USER-STORY-GENERATOR",
  "version": "1.0.0",
  "status": "auto_split_applied",
  "confidence": 0.88,
  "original_input_estimate": 13,
  "validator_finding": {
    "validator": "VALIDATOR-INVEST",
    "criterion_failed": "small",
    "severity": "medium",
    "auto_fix": "split_story"
  },
  "split_artifacts": [
    {
      "story_id": "US-005a",
      "title": "Đăng nhập email/password",
      "actor": "Khách hàng đã đăng ký account",
      "goal": "đăng nhập bằng email + password",
      "business_value": "Truy cập tính năng cá nhân hoá. KPI: account creation rate measurable.",
      "story_points": 5,
      "acceptance_criteria_count": 3,
      "depends_on": null,
      "blocks": ["US-005b", "US-005c"]
    },
    {
      "story_id": "US-005b",
      "title": "Lockout policy after 5 failures",
      "actor": "System (anti-brute-force)",
      "goal": "lock account 15min sau 5 failed attempts",
      "business_value": "Bảo vệ account khỏi brute force.",
      "story_points": 3,
      "acceptance_criteria_count": 3,
      "depends_on": ["US-005a"],
      "blocks": []
    },
    {
      "story_id": "US-005c",
      "title": "Forgot password via email",
      "actor": "Khách hàng quên mật khẩu",
      "goal": "reset password qua email link",
      "business_value": "Recovery flow tránh bị lock vĩnh viễn.",
      "story_points": 5,
      "acceptance_criteria_count": 3,
      "depends_on": ["US-005a"],
      "blocks": []
    }
  ],
  "split_rationale": "Original estimate 13pt > 8pt threshold (VALIDATOR-INVEST.severity.oversized_story=medium, auto_fix=split_story). Split per stakeholder journey: core auth + security + recovery. Each ≤5pt = INVEST Small ✅. Dependencies declared (US-005b/c block on US-005a being merged first).",
  "validators_passed_per_artifact": {
    "US-005a": ["VALIDATOR-INVEST (6/6)", "VALIDATOR-ACTOR-DEFINITION", "VALIDATOR-TESTABILITY"],
    "US-005b": ["VALIDATOR-INVEST (6/6)", "VALIDATOR-ACTOR-DEFINITION", "VALIDATOR-TESTABILITY"],
    "US-005c": ["VALIDATOR-INVEST (6/6)", "VALIDATOR-ACTOR-DEFINITION", "VALIDATOR-TESTABILITY"]
  },
  "followup_skills_recommended": [
    "SKILL-AC-GENERATOR (deepen AC for each split story)",
    "SKILL-TRACEABILITY-BUILDER (link 3 stories ↔ BR-001 ↔ tests)"
  ],
  "human_review_areas": [
    "split_decision (PO confirm 3 stories OR keep merged?)",
    "sprint_assignment (US-005a sprint 12, b/c sprint 13?)"
  ]
}
```

## Composite Skill Handling

`ba-doc-write` receives this output → renders 3 separate User Story
markdown sections + flags `human_review_areas` to user:

```
⚠️ Story estimate gốc 13pt vượt INVEST Small threshold (≤8pt).
Em đã auto-split thành 3 stories nhỏ hơn:
  - US-005a (5pt) — Email/password login
  - US-005b (3pt) — Lockout policy
  - US-005c (5pt) — Forgot password

Anh confirm split này OK với PO trước khi commit nhé?
[Y] Split confirmed → render 3 stories
[N] Keep merged → manual override (em sẽ note INVEST violation)
```

## Why this design?

1. **Atomic skill autonomous decisions** — split là technical decision,
   không cần human ngay. Atomic skill apply auto-fix theo VALIDATOR rule.

2. **Flag `human_review_areas`** — split_decision vẫn cần PO confirm
   (theo `ART-USER-STORY.human_review_areas.delivery_scope`).

3. **Composite renders for human** — atomic returns JSON, composite
   render markdown + interactive prompt.

4. **Dependencies preserved** — `depends_on`/`blocks` để traceability
   builder downstream link đúng.
