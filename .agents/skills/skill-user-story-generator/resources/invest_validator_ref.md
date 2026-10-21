# VALIDATOR-INVEST — Reference

> **Source of truth:** `ba-agent/validators/VALIDATOR-INVEST.yaml`

---

## Validation Logic — 6 INVEST Criteria

```yaml
validation_logic:
  - independent   # Story không depend on other story
  - negotiable    # Chi tiết có thể bàn (không cứng nhắc implementation)
  - valuable      # Có business value đo được (KPI)
  - estimable     # Team đo được effort (Story Points)
  - small         # Vừa 1 sprint (≤8 points)
  - testable      # Có ≥1 AC clear → write test case được
```

## Severity Levels

```yaml
severity:
  non_testable: critical    # Story không testable = blocker
  oversized_story: medium   # >8 points = warning, có thể auto-fix
```

## Auto-Fix Strategies

```yaml
auto_fix_strategy:
  oversized_story:
    - split_story          # Triggered by SKILL-USER-STORY-GENERATOR
                          # reasoning_pipeline.split_large_requirements
```

→ Khi VALIDATOR-INVEST detect oversized_story:
- `SKILL-USER-STORY-GENERATOR` apply auto_fix → split into ≤8pt stories
- Output `status: auto_split_applied` thay vì `success`

## Invocation in Skill Pipeline

```python
# Pseudo-code
def validate_invest(story):
    failures = []
    if not check_independent(story): failures.append("I")
    if not check_negotiable(story): failures.append("N")
    if not check_valuable(story): failures.append("V")
    if not check_estimable(story): failures.append("E")
    if not check_small(story): 
        failures.append("S")
        if can_split(story):
            return apply_auto_fix("oversized_story", story)
    if not check_testable(story): 
        failures.append("T")
        return error("non_testable", severity="critical")
    
    return ValidationResult(
        passed=(len(failures) == 0),
        score=6 - len(failures),
        failures=failures
    )
```

## Integration với SKILL.md

- Bước 2.6 `validate_INVEST` calls VALIDATOR-INVEST
- Bước 3 "Apply Validators" lists VALIDATOR-INVEST first
- Bước 6 "Failure Handling" maps `oversized_scope` → auto_fix
