# ART-USER-STORY — Reference Summary

> **Source of truth:** `babok-knowledge/artifacts/ART-USER-STORY.yaml`
> 
> Đây là extracted summary cho SKILL.md đọc nhanh. Khi sửa, sửa Source
> trước rồi sync lại file này.

---

## Identity
- **ID:** ART-USER-STORY
- **Name:** User Story
- **Category:** agile_requirement
- **Knowledge Areas:** KA-RADD, KA-LIFECYCLE
- **Compatible Tasks:** TASK-RADD-001, TASK-LIFECYCLE-001
- **Compatible Techniques:** TECH-USER-STORY

---

## Mandatory Sections (BẮT BUỘC trong output artifact)

```yaml
mandatory_sections:
  - story_id        # US-XXX format
  - title           # Verb + object
  - actor           # Persona cụ thể
  - goal            # Action user muốn
  - business_value  # Lý do + KPI
  - acceptance_criteria  # ≥1 AC
```

## Optional Sections

```yaml
optional_sections:
  - assumptions
  - dependencies
  - notes
  - ui_reference
```

## Required Fields (typed)

```yaml
story_id: string
actor: string
goal: string
business_value: string
```

---

## Validation Rules (apply tất cả 5)

```yaml
validation_rules:
  - follows_user_story_template     # "Là... tôi muốn... để..."
  - actor_defined                   # actor cụ thể, không "user"
  - business_value_present          # có lý do + measurable
  - acceptance_criteria_present     # ≥1 AC
  - satisfies_INVEST                # apply VALIDATOR-INVEST
```

## Quality Criteria

```yaml
quality_criteria:
  - atomic         # 1 story = 1 outcome
  - testable       # AC viết được test case
  - unambiguous    # không vague language
  - independent    # không depend on other story (INVEST I)
```

## Traceability Rules (apply trong output metadata)

```yaml
traceability_rules:
  - linked_to_business_requirement  # source_br field
  - linked_to_epic                  # epic field
  - linked_to_test_cases            # test_case_ids field
```

---

## Generation Patterns (theo SKILL.md Bước 2)

```yaml
generation_patterns:
  - identify_actor          # → reasoning_pipeline step 1
  - identify_goal           # → reasoning_pipeline step 2
  - identify_business_value # → reasoning_pipeline step 3
  - derive_acceptance_criteria  # → reasoning_pipeline step 5
```

## Common Failure Patterns (DETECT + AVOID)

```yaml
common_failure_patterns:
  - technical_task_disguised_as_story  # "Implement OAuth" — không phải story
  - missing_business_value             # "để dùng app" mơ hồ
  - oversized_story                    # >8 points → split
  - vague_acceptance_criteria          # AC không G-W-T hoặc không measurable
```

## Automation Potential

```yaml
automation_potential:
  story_generation: very_high     # → atomic skill OK
  duplicate_detection: high       # → cần future SKILL-DUPLICATE-DETECTOR
  INVEST_validation: high         # → VALIDATOR-INVEST handles
```

## Human Review Areas (orchestrator escalate)

```yaml
human_review_areas:
  - business_priority        # MoSCoW assignment
  - delivery_scope           # split decision
  - stakeholder_alignment    # alignment với PO
```

---

## Recommended AI Skills (downstream chain)

```yaml
recommended_ai_skills:
  - SKILL-USER-STORY-GENERATOR  # this skill (primary)
  - SKILL-INVEST-VALIDATOR       # validator role (atomized)
  - SKILL-STORY-SPLITTER         # for oversized stories (roadmap)
```

→ `card.yaml.recommended_followup_skills` should mention these.

---

## Storage & Approval Workflow

```yaml
storage_strategy:
  primary_store: relational_db
  indexing: [actor, module, sprint]

approval_workflow:
  - draft → ba_review → po_approval → ready_for_dev
```

## Domain Specialization

```yaml
domain_specialization:
  erp:
    additional_fields:
      - approval_matrix    # ERP requires multi-level approval
```

→ Khi context = ERP, output PHẢI thêm field `approval_matrix`.

---

## Metrics (track output quality)

```yaml
metrics:
  - story_rejection_rate  # %story bị PO reject
  - ambiguity_score        # NLP-based score
  - story_completion_rate  # % done in sprint
```

→ `card.yaml.performance_metrics` should align with these.
