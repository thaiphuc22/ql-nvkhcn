# TECH-DECISION-TABLE — Reference Summary

> Source: `babok-knowledge/technique/TECH-DECISION-TABLE.yaml`

## When To Use (per `decision_logic.use_when`)

```yaml
use_when:
  - conditions_exceed_three_variables  # ≥3 boolean conditions
  - policy_logic_complex                # Combinations matter
  - rule_consistency_required           # Audit/compliance
```

## When To Avoid (per `decision_logic.avoid_when`)

```yaml
avoid_when:
  - workflow_is_linear        # Use BPMN instead
  - logic_is_trivial          # Simple if/else suffices
```

## Problem Types Suitable

```yaml
problem_types:
  - eligibility_rules
  - pricing_logic
  - validation_logic
  - approval_rules
  - routing_logic
```

## Execution Steps (mapped → SKILL.md Bước 2)

```yaml
execution_steps:
  - extract_conditions          # Bước 2.1
  - identify_possible_values    # Bước 2.3
  - enumerate_combinations      # Bước 2.5
  - map_actions                 # Bước 2.2
  - detect_conflicts            # Bước 2.4
  - validate_coverage           # Bước 2.5
```

## Validation Rules

```yaml
validation_rules:
  - no_duplicate_rules
  - no_conflicting_actions
  - all_combinations_accounted_for
```

## Strengths / Limitations

```yaml
strengths:
  - strong_rule_consistency
  - excellent_for_validation_logic
  - easy_gap_detection

limitations:
  - difficult_for_large_condition_sets   # >7 conditions = overhead
  - weak_visual_workflow_representation
```

## Domain Importance

```yaml
domain_specialization:
  erp: very_high
  oms: very_high
  insurance: very_high
```

→ Khi context = ERP/OMS/Insurance, threshold trigger thấp hơn (chỉ 2-3 conditions đã trigger).

## Trigger trong SKILL-BR-EXTRACTOR

```python
if conditions_count > 3 OR domain in [erp, oms, insurance]:
    apply_decision_table_generation()  # Bước 2.6
```
