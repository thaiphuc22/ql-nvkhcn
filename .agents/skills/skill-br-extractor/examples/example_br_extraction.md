# Example — Business Rule Extraction with Decision Table

## Input (complex eligibility policy — 4 conditions)

```text
Chính sách Discount Code Apply:

- Discount code 'NEWUSER10' chỉ apply được khi user là first-time
  buyer (chưa có order) VÀ giá trị giỏ hàng ≥ 200,000 VNĐ.
  
- Discount code 'VIP20' chỉ apply được khi user là VIP customer
  (≥10 orders/năm) VÀ trong khung giờ campaign (8:00-22:00 daily).
  
- Discount code 'SALE15' apply cho mọi customer khi giá trị giỏ hàng
  ≥ 500,000 VNĐ NHƯNG không apply nếu khách hàng đang dùng VIP20.
  
- Tất cả discount codes có giới hạn 1 lần / customer / tháng.
```

## Reasoning

### Conditions identified (4 main):
1. `customer_type` (first_time / standard / vip)
2. `cart_value` (<200K / ≥200K / ≥500K)
3. `time_window` (campaign_hours / off-hours)
4. `monthly_usage_count` (<1 / =1)

### Decision_logic check:
- 4 conditions ≥3 → trigger decision table generation
- Domain context: e-commerce — moderate complexity

## Output (with Decision Table)

```json
{
  "skill": "SKILL-BR-EXTRACTOR",
  "version": "1.0.0",
  "status": "success",
  "confidence": 0.89,
  "artifact_type": "ART-BUSINESS-RULE",
  "artifact": {
    "rule_count": 5,
    "business_rules": [
      {
        "rule_id": "BR-DISCOUNT-001",
        "rule_name": "NEWUSER10 eligibility",
        "condition": "customer.orders_count == 0 AND cart.value >= 200000 AND monthly_usage[customer_id, 'NEWUSER10'] < 1",
        "action": "APPLY discount 10% with code 'NEWUSER10'",
        "source": "Policy §1",
        "priority": "Must"
      },
      {
        "rule_id": "BR-DISCOUNT-002",
        "rule_name": "VIP20 eligibility",
        "condition": "customer.orders_per_year >= 10 AND time.local_hour IN [8..22] AND monthly_usage[customer_id, 'VIP20'] < 1",
        "action": "APPLY discount 20% with code 'VIP20'",
        "source": "Policy §2",
        "priority": "Must"
      },
      {
        "rule_id": "BR-DISCOUNT-003",
        "rule_name": "SALE15 eligibility",
        "condition": "cart.value >= 500000 AND active_discount != 'VIP20' AND monthly_usage[customer_id, 'SALE15'] < 1",
        "action": "APPLY discount 15% with code 'SALE15'",
        "source": "Policy §3",
        "priority": "Should"
      },
      {
        "rule_id": "BR-DISCOUNT-004",
        "rule_name": "Mutual exclusion VIP20 vs SALE15",
        "condition": "active_discount IN ['VIP20', 'SALE15']",
        "action": "BLOCK applying the other code",
        "source": "Policy §3 derived",
        "priority": "Must"
      },
      {
        "rule_id": "BR-DISCOUNT-005",
        "rule_name": "Monthly usage limit",
        "condition": "monthly_usage[customer_id, code] >= 1",
        "action": "REJECT apply with message 'Đã dùng code này tháng này'",
        "source": "Policy §4 (universal)",
        "priority": "Must"
      }
    ],
    "decision_table": {
      "applicable": true,
      "header": ["customer_type", "cart_≥200K", "cart_≥500K", "campaign_hour", "monthly_usage", "→ apply"],
      "rows": [
        ["first_time", "Y", "N", "any", "<1", "NEWUSER10 ✅"],
        ["first_time", "N", "N", "any", "any", "❌ no eligible code"],
        ["vip", "Y", "any", "Y (8-22)", "<1", "VIP20 (priority over SALE15)"],
        ["vip", "Y", "Y", "N (off-hours)", "<1", "SALE15 ✅"],
        ["standard", "Y", "Y", "any", "<1", "SALE15 ✅"],
        ["standard", "Y", "N", "any", "any", "❌ no eligible code"],
        ["any", "any", "any", "any", "≥1", "❌ monthly limit"]
      ],
      "format": "condition_action_matrix"
    },
    "conflicts_detected": [],
    "coverage_gaps": [
      {
        "scenario": "First-time + VIP segment overlap (vừa first-time vừa được tag VIP)",
        "severity": "low",
        "suggestion": "Stakeholder clarify: VIP first-time apply NEWUSER10 hay VIP20? (current policy ngầm định first-time wins by code specificity)"
      }
    ],
    "metadata": {
      "decision_table_triggered_by": "conditions_count=4 ≥ 3 threshold",
      "domain": "e-commerce"
    }
  },
  "validators_passed": [
    "VALIDATOR-RULE-CONSISTENCY (5/5 deterministic)",
    "VALIDATOR-NO-CONFLICT (BR-004 explicitly resolves VIP20 vs SALE15)",
    "VALIDATOR-RULE-COVERAGE (1 minor gap flagged)"
  ],
  "human_review_areas": [
    "VIP first-time precedence (coverage_gap)",
    "Compliance: monthly limit reset day (policy không nói rõ — ngày 1 hay rolling 30 ngày?)"
  ],
  "followup_skills_recommended": [
    "SKILL-DECISION-TABLE-GENERATOR (roadmap — render visual table)",
    "SKILL-RULE-CONFLICT-DETECTOR (roadmap — verify edge cases)"
  ]
}
```

## Why this output

1. **5 rules thay vì 3 explicit** — skill detected derived rules:
   - BR-DISCOUNT-004 (mutual exclusion) — implicit từ Policy §3
   - BR-DISCOUNT-005 (monthly limit) — universal scope

2. **Decision table generated** — 4 conditions ≥ threshold. Show 7 rows
   covering main combinations + edge cases (no eligible).

3. **Coverage gap flagged** — VIP first-time edge case không cover trong
   policy → human review needed.

4. **Compliance question** — monthly reset semantics ambiguous → flag for stakeholder.
