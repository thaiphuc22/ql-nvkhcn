# ART-RTM — Reference Summary

> Source: `babok-knowledge/artifacts/ART-RTM.yaml`

## Identity
- **ID:** ART-RTM (Requirement Traceability Matrix)
- **Category:** governance

## Mandatory Sections (output BẮT BUỘC)

```yaml
mandatory_sections:
  - business_requirement     # BR-XXX (root level)
  - functional_requirement   # FR-XXX (derives from BR)
  - user_story               # US-XXX (implements FR)
  - test_case                # TC-XXX (verifies story)
  - implementation_reference # PR/commit/deploy ref
```

## Validation Rules

```yaml
validation_rules:
  - no_orphan_requirements    # apply VALIDATOR-NO-ORPHANS
  - every_story_has_test_case # coverage check
  - all_links_valid           # no broken refs (non-existent IDs)
```

## Quality Criteria

```yaml
quality_criteria:
  - full_coverage          # BR → ... → TC chain unbroken
  - updated_status         # status field current (Todo/Doing/Done)
  - impact_visibility      # change BR → see all affected children
```

## Automation Potential (per babok-knowledge)

```yaml
automation_potential:
  linkage_generation: very_high   # this skill primary purpose
  orphan_detection: high           # auto-detect via graph analysis
  impact_analysis: high            # change propagation simulation
```

## Recommended AI Skills

```yaml
recommended_ai_skills:
  - SKILL-TRACEABILITY-BUILDER    # this skill (primary)
  - SKILL-IMPACT-ANALYZER         # roadmap — change propagation
```

## RTM Structure (output format)

### Standard matrix view

```
| BR  | FR  | US  | TC  | Impl | Status |
|-----|-----|-----|-----|------|--------|
| 001 | 010 | 020 | 050 | PR#1 | Done   |
| 001 | 010 | 020 | 051 | PR#1 | Done   |
| 001 | 011 | 022 | 053 | PR#2 | Doing  |
| 002 | 020 | 030 | 060 | -    | Todo   |
```

### Hierarchical view

```
BR-001
├── FR-010
│   ├── US-020
│   │   ├── TC-050 ✅
│   │   └── TC-051 ✅
│   └── US-021 ⚠️ no test
└── FR-011
    └── US-022
        └── TC-053
```

## Orphan Categories

| Type | Definition | Severity |
|---|---|---|
| Orphan BR | BR has no FR child | High (scope creep ngược) |
| Orphan FR | FR has no parent BR | High (feature creep) |
| Orphan US | US has no parent FR | Medium |
| Orphan TC | TC has no story tested | Medium |
| Stale link | Linked artifact version older | Low |

## Coverage Metric

```python
coverage_percentage = (
    count(BRs with full chain to TC) / total_BRs * 100
)
```

→ Target ≥95% for production-ready BRD.
