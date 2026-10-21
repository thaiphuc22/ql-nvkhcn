# ART-BUSINESS-RULE — Reference Summary

> Source: `babok-knowledge/artifacts/ART-BUSINESS-RULE.yaml`

## Mandatory Sections (output BẮT BUỘC)

```yaml
mandatory_sections:
  - rule_id      # BR-XXX-XXX
  - rule_name    # Short descriptor
  - condition    # When/IF clause (boolean)
  - action       # Then clause (verb + object)
  - source       # Trace to policy section/document
  - priority     # MoSCoW or business_critical/etc
```

## Validation Rules

```yaml
validation_rules:
  - condition_defined        # Không action without condition
  - action_defined           # Không condition without action
  - no_conflicting_rules     # Apply VALIDATOR-NO-CONFLICT
  - rule_source_traceable    # source field required
```

## Quality Criteria

```yaml
quality_criteria:
  - atomic_rule         # 1 rule = 1 condition→action pair
  - deterministic       # No "có thể", "tuỳ"
  - non_ambiguous       # Boolean clear
```

## Traceability Rules

```yaml
traceability_rules:
  - linked_to_requirement  # FR/BR upstream
  - linked_to_process      # BPMN if applicable
  - linked_to_test_case    # Test downstream
```

## Common Failure Patterns (DETECT)

```yaml
common_failure_patterns:
  - hidden_conditions      # Action without explicit condition
  - duplicated_logic       # 2 rules same condition+action
  - contradictory_actions  # 2 rules same condition different actions
```

## Recommended AI Skills (chain)

```yaml
recommended_ai_skills:
  - SKILL-BR-EXTRACTOR              # this skill
  - SKILL-RULE-CONFLICT-DETECTOR    # roadmap
  - SKILL-RULE-NORMALIZER           # roadmap
```
