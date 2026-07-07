# Example — RTM Build for ChatBot CSKH project

## Input

```yaml
business_requirements:
  - id: BR-001
    description: "Reduce callcenter call volume from 5000/day to ≤2000/day"
    target_kpi: "60% volume reduction"
    version: "1.0"
  
  - id: BR-002
    description: "Compliance with Nghị định 13/2023"
    version: "1.0"

functional_requirements:
  - id: FR-001
    description: "ChatBot SHALL resolve ≥70% FAQ"
    source_br: BR-001
    version: "1.0"
  
  - id: FR-002
    description: "ChatBot SHALL handoff to human agent"
    source_br: BR-001
    version: "1.0"
  
  - id: FR-003
    description: "Conversation logs SHALL be encrypted at rest"
    source_br: BR-002
    version: "1.0"
  
  - id: FR-004
    description: "Response language detection (VI/EN auto)"
    source_br: null   # ⚠️ ORPHAN

user_stories:
  - id: US-001
    title: "FAQ resolution flow"
    implements_fr: [FR-001]
    version: "1.0"
  
  - id: US-002
    title: "Human handoff trigger"
    implements_fr: [FR-002]
    version: "1.0"
  
  - id: US-003
    title: "Encryption setup"
    implements_fr: [FR-003]
    version: "1.0"
  
  # Note: FR-001 referenced by US-001 but US-001 says FR-001 v1.0
  #       and we'll simulate FR-001 was bumped to v1.1

test_cases:
  - id: TC-001
    tests_story: US-001
    description: "FAQ accuracy benchmark"
  
  - id: TC-002
    tests_story: US-002
    description: "Handoff trigger threshold"
  
  - id: TC-003
    tests_story: US-003
    description: "Encryption verification audit"
  
  # US-001 has only 1 TC — coverage thin

implementation_refs: []  # Pre-development

# Simulate version drift
fr_001_current_version: "1.1"   # FR-001 has been bumped
us_001_referenced_version: "1.0"
```

## Reasoning

### 2.1 identify_requirement_relations
- BR-001 → FR-001, FR-002 ✅
- BR-002 → FR-003 ✅
- FR-004 → ? (orphan — no source_br)
- FR-001 → US-001 ✅
- FR-002 → US-002 ✅
- FR-003 → US-003 ✅
- US-001 → TC-001 ✅
- US-002 → TC-002 ✅
- US-003 → TC-003 ✅

### 2.2 map_dependencies
Built dependency graph 4 levels deep.

### 2.3 detect_orphans
- ✅ FR-004 = orphan_fr (no source_br) — High severity
- ⚠️ US-001 → FR-001 — version drift (US references v1.0, FR is v1.1) — Low severity
- ✅ Others no orphans

### 2.4 generate_links
Build matrix output.

## Output

```json
{
  "skill": "SKILL-TRACEABILITY-BUILDER",
  "version": "1.0.0",
  "status": "success_with_warnings",
  "confidence": 0.92,
  "artifact_type": "ART-RTM",
  "artifact": {
    "rtm_summary": {
      "total_brs": 2,
      "total_frs": 4,
      "total_stories": 3,
      "total_test_cases": 3,
      "total_impl_refs": 0,
      "coverage_percentage": 75.0,
      "coverage_breakdown": {
        "BR-001 → TC chain": "complete (2/2 FRs traced to TC)",
        "BR-002 → TC chain": "complete (1/1 FR traced to TC)",
        "FR-004 chain": "❌ broken (orphan, no upstream BR)"
      },
      "orphans_count": 1,
      "stale_links_count": 1,
      "missing_tests_count": 0
    },
    "rtm_rows": [
      {
        "business_requirement": "BR-001 v1.0",
        "functional_requirement": "FR-001 v1.1 ⚠️",
        "user_story": "US-001 v1.0 [stale ref]",
        "test_case": "TC-001",
        "implementation_ref": "TBD",
        "status": "ready_for_dev",
        "warnings": ["stale_link"]
      },
      {
        "business_requirement": "BR-001 v1.0",
        "functional_requirement": "FR-002 v1.0",
        "user_story": "US-002 v1.0",
        "test_case": "TC-002",
        "implementation_ref": "TBD",
        "status": "ready_for_dev"
      },
      {
        "business_requirement": "BR-002 v1.0",
        "functional_requirement": "FR-003 v1.0",
        "user_story": "US-003 v1.0",
        "test_case": "TC-003",
        "implementation_ref": "TBD",
        "status": "ready_for_dev"
      },
      {
        "business_requirement": "❌ ORPHAN",
        "functional_requirement": "FR-004 v1.0",
        "user_story": "-",
        "test_case": "-",
        "implementation_ref": "-",
        "status": "blocked",
        "issue": "orphan_fr"
      }
    ],
    "orphans_detected": [
      {
        "orphan_id": "FR-004",
        "orphan_type": "orphan_fr",
        "severity": "high",
        "description": "Functional Requirement 'Response language detection' has no source_br",
        "rationale": "Either feature creep (out of scope) OR missing BR — likely should link to BR-002 (compliance — user accessibility)",
        "suggested_fix": "PO/BA decision: (a) Add source_br=BR-002, OR (b) Create new BR-003 for accessibility/i18n, OR (c) Move to backlog Phase 2"
      }
    ],
    "stale_links": [
      {
        "stale_id": "US-001 → FR-001 reference",
        "stale_type": "stale_traceability",
        "severity": "low",
        "issue": "US-001 references FR-001 v1.0, but FR-001 has been bumped to v1.1",
        "version_drift": {
          "referenced_version": "1.0",
          "current_version": "1.1"
        },
        "suggested_fix": "Review FR-001 v1.1 changelog. If changes affect US-001 scope, update US-001 + AC. Else, just bump US-001 reference to v1.1."
      }
    ],
    "coverage_gaps": [
      {
        "gap_id": "GAP-001",
        "issue": "US-001 (FAQ resolution) has only 1 test case — should have ≥3 (happy + alternative + negative per BABOK)",
        "severity": "medium",
        "suggested_fix": "Add TC for: (a) FAQ partial match (alternative), (b) FAQ unrecognized → handoff (negative), (c) FAQ in different language (edge)"
      }
    ],
    "metadata": {
      "version_check_performed": true,
      "all_referenced_ids_valid": true,
      "broken_links_count": 0,
      "rtm_format": "matrix_with_warnings"
    }
  },
  "validators_passed": [
    "VALIDATOR-END-TO-END-COVERAGE [PARTIAL — 75% (FR-004 broken)]",
    "VALIDATOR-NO-ORPHANS [FAILED — 1 orphan FR detected]"
  ],
  "human_review_areas": [
    "FR-004 orphan resolution — decide source_br (high priority, blocks production)",
    "US-001 stale link — verify v1.1 changes",
    "Coverage gap — US-001 needs more test cases"
  ],
  "followup_skills_recommended": [
    "SKILL-IMPACT-ANALYZER (roadmap) — analyze if BR-001 changed, what's affected",
    "SKILL-AC-GENERATOR (deepen US-001 with edge cases for new TCs)"
  ]
}
```

## Why this output

1. **75% coverage** — quantitative metric BA can report to PM/Sponsor
2. **Orphan detected** — FR-004 không có source — flagged Major với 3 fix options
3. **Stale link warning** — version drift example (US-001 → FR-001) — Low severity nhưng caught
4. **Coverage gap** — US-001 chỉ có 1 TC, BABOK norm khuyến nghị ≥3 (happy/alt/negative)
5. **Suggested followup** — recommend SKILL-AC-GENERATOR cho TC expansion
6. **Status field per row** — Todo/Doing/Done/Blocked → BA dashboard usable
