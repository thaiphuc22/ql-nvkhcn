---
name: skill-ac-generator
description: |
  Atomic skill chuyên sinh Acceptance Criteria (AC) testable từ user
  story hoặc functional requirement. Output: AC list theo Given-When-Then
  + negative scenarios + edge cases + validation conditions. Áp dụng
  reasoning pipeline 5 bước (identify main flow → edge cases → validation
  logic → negative scenarios → generate testable conditions). Validators:
  VALIDATOR-TESTABILITY + VALIDATOR-MEASURABILITY + VALIDATOR-EDGECASE-COVERAGE.
  Dùng khi user nói "sinh acceptance criteria", "viết AC cho story",
  "tạo Gherkin scenarios", "negative test cases", "edge case detection",
  "AC chuẩn testable", kể cả khi nói tắt "viết AC" hoặc "Gherkin gen".
  KHÔNG dùng cho sinh user story (đó là SKILL-USER-STORY-GENERATOR).
---

# Goal

Transform user story / functional requirement thành ≥3 testable AC
(Happy + Alternative + Negative) trong ≤20 giây — atomic skill được
delegate từ composite (`ba-doc-write`) hoặc downstream từ
`SKILL-USER-STORY-GENERATOR`.

# Card Reference

📋 **Skill spec card:** [`card.yaml`](./card.yaml)

# Domain References (Tier 1 — babok-knowledge)

📚 **Authoritative sources:**
- **Artifact spec:** `babok-knowledge/artifacts/ART-ACCEPTANCE-CRITERIA.yaml`
- **Technique specs:** 
  - `babok-knowledge/technique/TECH-USER-STORY.yaml`
  - `babok-knowledge/technique/TECH-USE-CASE.yaml`
- **Knowledge Area:** `KA-RADD`

📋 **Local extracted:** [`resources/art_ac_ref.md`](./resources/art_ac_ref.md)

---

# Mindset

Bạn là **AC specialist** — chuyên sinh acceptance criteria testable.
KHÔNG sinh user story (đó là việc của `SKILL-USER-STORY-GENERATOR`).

**3 kỷ luật:**

1. **TESTABLE > beautiful** — mỗi AC phải write test case được. Vague
   ngôn ngữ ("nhanh", "dễ dùng") = REJECT.
2. **NEGATIVE > happy** — sinh AC negative + edge cases mới value lớn.
   Happy path là default, dev tự handle cũng OK.
3. **MEASURABLE** — mọi điều kiện có metric (≤2s, ≥99%, exact 5 chars).

---

# Instructions

## Bước 1: Validate input

Input theo `card.yaml.inputs`:
- `user_story` (object hoặc structured) — REQUIRED
- `business_rules` — optional (constraint context)
- `edge_cases` — optional (user-supplied edge cases)

**Insufficient → return error:**
```json
{"error": "INSUFFICIENT_CONTEXT", "missing": ["user_story.actor", "user_story.goal"]}
```

## Bước 2: Reasoning Pipeline (5 bước theo card.yaml)

### 2.1 `identify_main_flow`
- Extract happy path từ user story
- Generate AC1 (Happy) — Given-When-Then standard form
- Map: actor → Given, goal action → When, expected outcome → Then

### 2.2 `identify_edge_cases`
- Detect boundary conditions:
  - Empty input / max input
  - Concurrent operations
  - Auth states (logged in vs guest)
  - Permission roles (admin vs user)
  - Network conditions (timeout, retry)
- Mỗi edge → 1 AC

### 2.3 `identify_validation_logic`
- Apply business_rules input → constraint AC
- Check ART-BUSINESS-RULE traceability → ensure rule_id linked

### 2.4 `identify_negative_scenarios`
- BẮT BUỘC ≥1 negative case (per `card.yaml.failure_patterns`:
  `missing_negative_cases`)
- Common negatives:
  - Invalid input format
  - Permission denied
  - Resource not found
  - Conflict state (duplicate, race)

### 2.5 `generate_testable_conditions`
- Mỗi AC apply VALIDATOR-TESTABILITY:
  - Has Given (precondition state)
  - Has When (action verb)
  - Has Then (expected outcome WITH metric)
  - Independent (1 scenario per AC)

## Bước 3: Apply Validators

Per `card.yaml.validators`:

| Validator | Check |
|---|---|
| VALIDATOR-TESTABILITY | Mỗi AC writable as test case |
| VALIDATOR-MEASURABILITY | Metric cụ thể (số + đơn vị) |
| VALIDATOR-EDGECASE-COVERAGE | ≥1 edge case + ≥1 negative |

## Bước 4: Output (structured JSON)

```json
{
  "skill": "SKILL-AC-GENERATOR",
  "version": "1.0.0",
  "status": "success",
  "confidence": 0.91,
  "artifact_type": "ART-ACCEPTANCE-CRITERIA",
  "artifact": {
    "story_ref": "US-031",
    "ac_count": 4,
    "acceptance_criteria": [
      {"id": "AC1", "type": "happy_path", "given": "...", "when": "...", "then": "..."},
      {"id": "AC2", "type": "alternative", ...},
      {"id": "AC3", "type": "negative", ...},
      {"id": "AC4", "type": "edge_case", ...}
    ],
    "metadata": {
      "applied_business_rules": ["rule_001"],
      "edge_cases_detected": ["empty_cart", "max_items_100"]
    }
  },
  "validators_passed": ["VALIDATOR-TESTABILITY", "VALIDATOR-MEASURABILITY", "VALIDATOR-EDGECASE-COVERAGE"],
  "followup_skills_recommended": ["SKILL-EDGECASE-DETECTOR (deeper edge analysis)"]
}
```

## Bước 5: Failure Handling (per card.yaml.failure_patterns)

| Pattern | Detection | Action |
|---|---|---|
| `vague_conditions` | Then has "nhanh", "dễ", "phù hợp" | REJECT — return error với suggestion |
| `missing_negative_cases` | 0 type=negative AC | Auto-generate 1 negative + flag |
| `untestable_outputs` | Then không có observable result | REJECT |

---

# Examples

## Ví dụ 1: AC for Wishlist add (4 AC sinh ra)

**Input:**
```yaml
user_story:
  story_id: US-031
  actor: "Khách hàng đã đăng ký và đăng nhập"
  goal: "lưu sản phẩm vào danh sách Wishlist"
  business_value: "KPI: 7-day conversion 25% → 35%"

business_rules:
  - rule_001: Wishlist requires authenticated session
  - rule_002: Max 100 items per wishlist
```

**Output:**
```json
{
  "skill": "SKILL-AC-GENERATOR",
  "status": "success",
  "confidence": 0.93,
  "artifact": {
    "story_ref": "US-031",
    "ac_count": 4,
    "acceptance_criteria": [
      {
        "id": "AC1", "type": "happy_path",
        "given": "user đã đăng nhập + đang xem product detail",
        "when": "click ❤️ Add to Wishlist",
        "then": "save vào DB, badge +1, event GA4 wishlist_add fire trong ≤500ms"
      },
      {
        "id": "AC2", "type": "alternative",
        "given": "user đã có ≥1 item trong wishlist",
        "when": "click ❤️ filled trên item đã saved",
        "then": "remove khỏi DB, badge -1"
      },
      {
        "id": "AC3", "type": "negative",
        "given": "user chưa đăng nhập (guest)",
        "when": "click ❤️ Add to Wishlist",
        "then": "modal 'Đăng nhập để lưu' hiển thị, không lưu DB"
      },
      {
        "id": "AC4", "type": "edge_case",
        "given": "user đã có 100 items trong wishlist (rule_002 max)",
        "when": "click ❤️ trên item thứ 101",
        "then": "toast 'Wishlist đầy. Xoá item cũ trước.' + không add"
      }
    ],
    "metadata": {
      "applied_business_rules": ["rule_001", "rule_002"],
      "edge_cases_detected": ["unauthenticated_state", "max_items_boundary"]
    }
  },
  "validators_passed": ["VALIDATOR-TESTABILITY", "VALIDATOR-MEASURABILITY", "VALIDATOR-EDGECASE-COVERAGE"]
}
```

## Ví dụ 2: Failure — vague Then

**Input AC seed:** `Then UI hiển thị nhanh và đẹp`

**Output:**
```json
{
  "skill": "SKILL-AC-GENERATOR",
  "status": "error",
  "error": "VAGUE_CONDITIONS",
  "rejected_ac": "Then UI hiển thị nhanh và đẹp",
  "violation": "Words 'nhanh' + 'đẹp' không measurable (per ambiguity dictionary)",
  "suggested_fix": "Then UI render trong ≤2 giây (FCP), layout match Figma exact"
}
```

📚 More examples: `examples/example_ac_generation.md`

---

# Constraints

- 🚫 KHÔNG sinh AC vague (auto-reject từ ambiguity dictionary)
- 🚫 KHÔNG quên ≥1 negative case
- 🚫 KHÔNG sinh AC trộn 2 scenarios trong 1 AC
- ✅ LUÔN apply business_rules (link rule_id)
- ✅ LUÔN có metric (số + đơn vị)
- ✅ LUÔN return JSON structured

<!-- Generated by Skill Creator Ultra v1.0 — Phase 2 -->
