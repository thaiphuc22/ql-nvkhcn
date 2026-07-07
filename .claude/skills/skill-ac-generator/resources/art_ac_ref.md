# ART-ACCEPTANCE-CRITERIA — Reference Summary

> Source: `babok-knowledge/artifacts/ART-ACCEPTANCE-CRITERIA.yaml`

## Identity
- **ID:** ART-ACCEPTANCE-CRITERIA
- **Category:** validation_specification

## Mandatory Sections (output BẮT BUỘC)

```yaml
mandatory_sections:
  - ac_id                  # AC1, AC2, ... (per story)
  - related_requirement    # Link tới user story / FR
  - scenario               # Given-When-Then format
  - expected_result        # Measurable outcome
```

## Validation Rules

```yaml
validation_rules:
  - testable               # Write test case được
  - measurable             # Có metric (số + đơn vị)
  - linked_to_requirement  # Trace ngược về source
```

## Quality Criteria

```yaml
quality_criteria:
  - edge_cases_defined     # ≥1 edge case
  - validation_explicit    # Rule check tường minh
  - deterministic_outcome  # Không ambiguous "có thể"
```

## Common Failure Patterns (DETECT + REJECT)

```yaml
common_failure_patterns:
  - vague_expectation       # "nhanh", "đẹp", "phù hợp" → REJECT
  - missing_negative_cases  # 0 negative AC → auto-add 1 + warn
  - untestable_condition    # Then không observable → REJECT
```

## Automation Potential

```yaml
automation_potential:
  ac_generation: very_high       # → atomic skill OK
  edge_case_detection: high      # → trigger SKILL-EDGECASE-DETECTOR
  scenario_generation: high
```

## Recommended AI Skills (chain)

```yaml
recommended_ai_skills:
  - SKILL-AC-GENERATOR          # this skill
  - SKILL-EDGECASE-DETECTOR     # roadmap — deeper edge analysis
```
