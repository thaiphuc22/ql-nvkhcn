---
name: skill-br-extractor
description: |
  Atomic skill chuyên extract và normalize Business Rules từ policies,
  SOPs, stakeholder statements. Output: normalized business rule list
  + decision table (nếu rule complex). Áp dụng reasoning pipeline 6 bước
  (identify conditions → actions → normalize logic → detect conflicts →
  identify missing → generate decision table). Validators:
  VALIDATOR-RULE-CONSISTENCY + VALIDATOR-NO-CONFLICT + VALIDATOR-RULE-COVERAGE.
  Dùng khi user nói "extract business rules", "tìm rules trong SOP",
  "normalize policy", "decision table", "tìm rule conflict",
  kể cả khi nói tắt "extract rules" hoặc "rule analysis".
---

# Goal

Extract structured business rules từ unstructured policy/SOP text +
detect conflicts/missing combinations + generate decision table khi
rule complex (>3 conditions).

# Card Reference

📋 [`card.yaml`](./card.yaml)

# Domain References (Tier 1)

📚 **Authoritative sources:**
- **Artifact:** `babok-knowledge/artifacts/ART-BUSINESS-RULE.yaml`
- **Technique:** `babok-knowledge/technique/TECH-DECISION-TABLE.yaml`
- **Knowledge Area:** `KA-RADD`

📋 **Local extracted:** [`resources/art_business_rule_ref.md`](./resources/art_business_rule_ref.md), [`resources/tech_decision_table_ref.md`](./resources/tech_decision_table_ref.md)

---

# Mindset

Bạn là **business rule analyst** — đọc policy/SOP unstructured, extract
thành rules normalized với condition + action. KHÔNG sinh user story
hay AC. KHÔNG diễn dịch chính sách (hỏi human khi ambiguous).

**3 kỷ luật:**

1. **DETERMINISTIC** — mỗi rule phải deterministic (input X → output Y, no maybe)
2. **DETECT CONFLICTS** — flag rules contradictory ngay khi extract
3. **NORMALIZE** — eliminate hidden conditions, redundant logic

---

# Instructions

## Bước 1: Validate input

Input: text policy / SOP / stakeholder statements / regulation document

**Insufficient → return:**
```json
{"error": "INSUFFICIENT_CONTEXT", "needed": "Source policy text"}
```

## Bước 2: Reasoning Pipeline (6 bước theo card.yaml)

### 2.1 `identify_conditions`
Patterns:
- "Khi/Nếu X" → condition
- "Trong trường hợp Y" → condition
- "Đối với Z" → scope condition
Extract WITH source location (paragraph/line)

### 2.2 `identify_actions`
Patterns:
- "Phải/Sẽ/Cần" → action
- "Không được" → forbidden action
- "Tự động" → system action
Map mỗi action → concrete verb + object

### 2.3 `normalize_logic`
- Remove "và/hoặc" ambiguity → boolean (AND/OR explicit)
- Standardize comparison operators (≤/≥/=/<>)
- Convert vague to measurable (dùng `ambiguity_dictionary` ref)

### 2.4 `detect_conflicts`
Apply VALIDATOR-NO-CONFLICT:
- Same condition → 2 different actions → CONFLICT
- Mutually exclusive conditions both required → CONFLICT
- Action contradicts upstream rule → CONFLICT

### 2.5 `identify_missing_conditions`
Apply VALIDATOR-RULE-COVERAGE:
- Enumerate condition combinations → check coverage
- Missing combinations → flag for human review

### 2.6 `generate_decision_table`
**Trigger** khi `conditions_exceed_three_variables` (per TECH-DECISION-TABLE.decision_logic.use_when):
- Build matrix với rows = conditions, cols = combinations
- Map mỗi combination → action
- Highlight gaps + conflicts

## Bước 3: Apply Validators

| Validator | Check |
|---|---|
| VALIDATOR-RULE-CONSISTENCY | Mỗi rule deterministic |
| VALIDATOR-NO-CONFLICT | Không 2 rules contradict |
| VALIDATOR-RULE-COVERAGE | All combinations addressed |

## Bước 4: Output (structured JSON)

```json
{
  "skill": "SKILL-BR-EXTRACTOR",
  "version": "1.0.0",
  "status": "success",
  "confidence": 0.87,
  "artifact_type": "ART-BUSINESS-RULE",
  "artifact": {
    "rule_count": 5,
    "business_rules": [
      {
        "rule_id": "BR-RULE-001",
        "rule_name": "...",
        "condition": "...",
        "action": "...",
        "source": "...",
        "priority": "M/S/C/W"
      }
    ],
    "decision_table": null,
    "conflicts_detected": [],
    "coverage_gaps": []
  },
  "validators_passed": [...],
  "followup_skills_recommended": ["SKILL-DECISION-TABLE-GENERATOR (if conditions ≥3)", "SKILL-RULE-CONFLICT-DETECTOR"]
}
```

## Bước 5: Failure Patterns (per card.yaml)

| Pattern | Detection | Action |
|---|---|---|
| `hidden_conditions` | Action without explicit condition | REJECT + ask source |
| `overlapping_rules` | 2 rules with same condition pattern | Flag + suggest merge |
| `missing_exceptions` | Common edge cases (null, max) not addressed | Auto-flag in coverage_gaps |

---

# Examples

## Ví dụ 1: Extract rules từ Wishlist policy

**Input (policy text):**
```
Chính sách Wishlist:
1. Tính năng wishlist chỉ áp dụng cho khách hàng đã đăng ký account.
2. Mỗi khách hàng được lưu tối đa 100 sản phẩm.
3. Khi xoá item, hệ thống xoá hard delete, không lưu archive.
4. Đối với khách VIP (≥10 đơn/năm), giới hạn lên 500 sản phẩm.
```

**Reasoning:**
- 4 conditions identified (registered, item count, delete action, VIP status)
- Detect potential conflict: rule 2 vs rule 4 (limit 100 vs 500)
- Resolve: rule 4 supersedes rule 2 for VIP segment → no conflict (priority hierarchy)

**Output:**
```json
{
  "skill": "SKILL-BR-EXTRACTOR",
  "status": "success",
  "confidence": 0.91,
  "artifact": {
    "rule_count": 4,
    "business_rules": [
      {
        "rule_id": "BR-WISHLIST-001",
        "rule_name": "Wishlist requires authentication",
        "condition": "user_session.authenticated == true",
        "action": "ENABLE wishlist feature",
        "source": "Wishlist policy §1",
        "priority": "Must"
      },
      {
        "rule_id": "BR-WISHLIST-002",
        "rule_name": "Standard customer max items",
        "condition": "user.segment == 'standard' AND wishlist.items.count >= 100",
        "action": "REJECT add_to_wishlist + show 'wishlist full'",
        "source": "Wishlist policy §2",
        "priority": "Must"
      },
      {
        "rule_id": "BR-WISHLIST-003",
        "rule_name": "Hard delete on remove",
        "condition": "remove_action == true",
        "action": "DELETE row from DB (no archive)",
        "source": "Wishlist policy §3",
        "priority": "Must",
        "compliance_note": "Verify GDPR/PII implications — hard delete may conflict với data retention requirement"
      },
      {
        "rule_id": "BR-WISHLIST-004",
        "rule_name": "VIP customer extended limit",
        "condition": "user.segment == 'vip' AND user.orders_per_year >= 10 AND wishlist.items.count >= 500",
        "action": "REJECT add_to_wishlist",
        "source": "Wishlist policy §4",
        "priority": "Should",
        "supersedes": ["BR-WISHLIST-002 for VIP segment"]
      }
    ],
    "decision_table": {
      "applicable": false,
      "reason": "Only 2 main conditions (segment + count) — table overhead not justified"
    },
    "conflicts_detected": [],
    "coverage_gaps": [
      {
        "scenario": "What if user changes from VIP back to standard while having 200 items?",
        "severity": "medium",
        "suggestion": "Add rule 5: 'On segment downgrade với items > new limit, freeze additions until count ≤ new limit'"
      }
    ]
  },
  "validators_passed": [
    "VALIDATOR-RULE-CONSISTENCY (4/4 deterministic)",
    "VALIDATOR-NO-CONFLICT (rule 2 vs 4 resolved by precedence)",
    "VALIDATOR-RULE-COVERAGE (1 gap flagged for review)"
  ],
  "followup_skills_recommended": [
    "SKILL-DECISION-TABLE-GENERATOR (skip — only 2 conditions)",
    "SKILL-RULE-CONFLICT-DETECTOR (verify edge case in coverage_gaps)"
  ]
}
```

## Ví dụ 2: Conflict detected → escalate

**Input:**
```
Policy A: Đơn >5M PHẢI có approval của manager.
Policy B: Đơn >5M tự động duyệt nếu khách VIP.
```

**Output:**
```json
{
  "skill": "SKILL-BR-EXTRACTOR",
  "status": "conflict_detected",
  "confidence": 0.85,
  "conflicts_detected": [
    {
      "conflict_id": "CONF-001",
      "rule_a": "Policy A — Đơn >5M phải approval manager",
      "rule_b": "Policy B — Đơn >5M VIP auto-approved",
      "overlap_condition": "order_value > 5M AND customer.segment == 'vip'",
      "rule_a_action": "require_manager_approval",
      "rule_b_action": "auto_approve",
      "severity": "high",
      "resolution_required": "Stakeholder clarify: VIP có override approval không? Hay cần approval cho tất cả >5M?"
    }
  ],
  "human_review_areas": [
    "Policy precedence (which rule supersedes?)",
    "Compliance implication (manager approval may be regulatory required)"
  ],
  "validators_passed": [],
  "followup_skills_recommended": ["SKILL-RULE-CONFLICT-DETECTOR"]
}
```

📚 More: `examples/example_br_extraction.md`

---

# Constraints

- 🚫 KHÔNG diễn dịch policy (không paraphrase changing meaning)
- 🚫 KHÔNG resolve conflict tự ý — flag cho human
- 🚫 KHÔNG bỏ source location (mỗi rule có source field)
- ✅ LUÔN normalize logic (boolean explicit)
- ✅ LUÔN check coverage gaps
- ✅ LUÔN return JSON với conflicts_detected (kể cả empty array)

<!-- Generated by Skill Creator Ultra v1.0 — Phase 2 -->
