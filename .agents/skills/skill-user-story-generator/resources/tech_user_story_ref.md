# TECH-USER-STORY — Reference Summary

> **Source of truth:** `babok-knowledge/technique/TECH-USER-STORY.yaml`

---

## Identity
- **ID:** TECH-USER-STORY
- **Category:** agile_requirement_definition

## Problem Types Suitable

```yaml
problem_types:
  - agile_requirements
  - feature_definition
  - backlog_management
```

## Best Used For

```yaml
best_used_for:
  - agile_projects
  - iterative_delivery
  - feature_splitting
```

## NOT Recommended For (skip technique)

```yaml
not_recommended_for:
  - enterprise_governance_heavy_projects   # → use Use Case + BRD instead
  - deeply_regulated_systems                # → need formal SRS
```

→ Khi domain context match `not_recommended_for`, skill should warn:
"User Story technique không phù hợp domain này. Suggest: TECH-USE-CASE
hoặc formal BRD."

## Reasoning Patterns (mapped → SKILL.md reasoning_pipeline)

```yaml
reasoning_patterns:
  - identify_actor       # → step 2.1
  - identify_goal        # → step 2.2
  - identify_business_value  # → step 2.3
```

## Validation Rules

```yaml
validation_rules:
  - follows_template
  - satisfies_INVEST
  - acceptance_criteria_present
```

→ Same as ART-USER-STORY validation_rules.

## Automation Potential

```yaml
automation_potential:
  story_generation: very_high
  story_splitting: high
  duplicate_detection: medium
```
