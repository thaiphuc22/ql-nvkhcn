---
name: skill-traceability-builder
description: |
  Atomic skill chuyên build và maintain Requirements Traceability Matrix
  (RTM) — link giữa business goals, requirements, user stories, test
  cases. Detect orphan requirements + missing dependencies + stale links.
  Output: structured RTM với coverage report. Áp dụng reasoning pipeline
  4 bước (identify relations → map dependencies → detect orphans →
  generate links). Validators: VALIDATOR-END-TO-END-COVERAGE +
  VALIDATOR-NO-ORPHANS. Dùng khi user nói "build traceability matrix",
  "RTM", "trace requirements", "link BR FR test", "tìm orphan requirement",
  "impact analysis matrix", kể cả khi nói tắt "traceability" hoặc "RTM build".
---

# Goal

Build authoritative Requirements Traceability Matrix linking business
goals → BR → FR → User Stories → Test Cases → Implementation, với orphan
detection và coverage gaps flagged, trong ≤1 phút thay vì 1-2 giờ manual.

# Card Reference

📋 [`card.yaml`](./card.yaml)

# Domain References (Tier 1)

📚 **Authoritative sources:**
- **Artifact:** `babok-knowledge/artifacts/ART-RTM.yaml`
- **Knowledge Area:** `KA-LIFECYCLE`
- **Task:** `babok-knowledge/task/TASK-LIFECYCLE-001.yaml`

📋 **Local extracted:** [`resources/art_rtm_ref.md`](./resources/art_rtm_ref.md)

---

# Mindset

Bạn là **traceability librarian** — KHÔNG sinh requirements/stories/tests.
Chỉ LINK chúng lại với nhau và detect missing/broken links.

**3 kỷ luật:**

1. **NO LINKS WITHOUT EVIDENCE** — chỉ link khi explicit reference (ID match)
   hoặc semantic similarity ≥0.85
2. **DETECT ORPHANS** — requirement không link upstream (orphan BR) hoặc
   downstream (orphan implementation) đều flag
3. **VERSION-AWARE** — track stale links khi requirement đã update

---

# Instructions

## Bước 1: Validate input

Per `card.yaml.supported_artifacts: ART-RTM`:
- `business_requirements[]` — list with ID
- `functional_requirements[]` — list with ID + source_br
- `user_stories[]` — list with ID + source_br
- `test_cases[]` — list with ID + tested_story_ids
- `implementation_refs[]` — code commits, PRs, deployments (optional)

**Insufficient → return:**
```json
{"error": "INSUFFICIENT_CONTEXT", "needed": "At least 2 requirement levels for traceability"}
```

## Bước 2: Reasoning Pipeline (4 bước theo card.yaml)

### 2.1 `identify_requirement_relations`
Build relation graph:
- BR-X → FR-Y (FR references BR)
- FR-Y → US-Z (story implements FR)
- US-Z → TC-W (test verifies story)

Methods:
1. **Explicit ID match** — if FR.source_br == "BR-001" → link
2. **Semantic similarity** — NLP embedding match for ambiguous cases
3. **Manual annotations** — preserve user-supplied links

### 2.2 `map_dependencies`
For each requirement:
- `upstream`: parents (e.g., FR upstream = BR)
- `downstream`: children (e.g., FR downstream = US, TC)
- `lateral`: peers depending on same upstream

### 2.3 `detect_orphans`
Apply VALIDATOR-NO-ORPHANS:

| Orphan type | Detection | Severity |
|---|---|---|
| **Orphan BR** | BR has no FR/US implementing | High — scope creep ngược |
| **Orphan FR** | FR has no parent BR | High — feature creep |
| **Orphan US** | US has no parent FR | Medium — verify intent |
| **Orphan TC** | TC has no story tested | Medium — test waste |
| **Stale link** | Linked artifact has been updated/version bumped | Low — refresh needed |

### 2.4 `generate_traceability_links`
Output structured RTM (per `ART-RTM.mandatory_sections`):

```
| business_requirement | functional_requirement | user_story | test_case | implementation_ref | status |
|----------------------|------------------------|------------|-----------|--------------------|---------|
| BR-001               | FR-012, FR-013         | US-031     | TC-101    | PR#234             | Done   |
| BR-002 ⚠️ orphan     | -                      | -          | -         | -                  | Issue  |
```

## Bước 3: Apply Validators

| Validator | Check |
|---|---|
| VALIDATOR-END-TO-END-COVERAGE | Mọi BR có chain đến TC |
| VALIDATOR-NO-ORPHANS | Không có orphan ở any tier |

## Bước 4: Output (structured JSON)

```json
{
  "skill": "SKILL-TRACEABILITY-BUILDER",
  "version": "1.0.0",
  "status": "success",
  "confidence": 0.93,
  "artifact_type": "ART-RTM",
  "artifact": {
    "rtm_summary": {
      "total_brs": 10,
      "total_frs": 25,
      "total_stories": 45,
      "total_test_cases": 78,
      "coverage_percentage": 87.5,
      "orphans_count": 3
    },
    "rtm_rows": [...],
    "orphans_detected": [...],
    "coverage_gaps": [...],
    "stale_links": [...]
  },
  "validators_passed": [...],
  "followup_skills_recommended": ["SKILL-IMPACT-ANALYZER (roadmap)"]
}
```

## Bước 5: Failure Patterns (per card.yaml)

| Pattern | Detection | Action |
|---|---|---|
| `missing_links` | Reference to non-existent ID | Flag broken_link |
| `stale_traceability` | Linked artifact version older | Flag stale + suggest refresh |
| `hidden_dependencies` | Implicit dependency not in metadata | Detect via NLP, suggest explicit |

---

# Examples

## Ví dụ 1: Wishlist project RTM

**Input:**
```yaml
business_requirements:
  - id: BR-019
    description: "Reduce checkout abandonment"
    target_kpi: "7-day conversion 25% → 35%"

functional_requirements:
  - id: FR-024
    description: "System SHALL allow registered customer to add/remove products to/from wishlist"
    source_br: BR-019

  - id: FR-025
    description: "System SHALL persist wishlist across sessions"
    source_br: BR-019

user_stories:
  - id: US-031
    title: "Lưu sản phẩm vào Wishlist"
    source_br: BR-019
    implements_fr: [FR-024]

  - id: US-032
    title: "Wishlist persistence after logout/login"
    source_br: BR-019
    implements_fr: [FR-025]

  - id: US-040
    title: "Email notification on wishlist price drop"
    source_br: null   # ⚠️ ORPHAN — no source BR

test_cases:
  - id: TC-101
    tests_story: US-031
    description: "E2E happy path add to wishlist"

  - id: TC-102
    tests_story: US-031
    description: "Edge case: max 100 items"

  - id: TC-103
    tests_story: US-032
    description: "Persistence after relogin"

  # US-040 has no test case yet
```

**Reasoning:**
- 1 BR → 2 FR (good)
- 2 FR → 2 stories (good)
- US-040 orphan (no source BR) — Major
- US-040 missing TC — Medium
- Coverage: BR-019 → 2 FR → 2 US → 3 TC ✅
- US-040 → ? → ? — broken chain

**Output:**
```json
{
  "skill": "SKILL-TRACEABILITY-BUILDER",
  "version": "1.0.0",
  "status": "success",
  "confidence": 0.91,
  "artifact_type": "ART-RTM",
  "artifact": {
    "rtm_summary": {
      "total_brs": 1,
      "total_frs": 2,
      "total_stories": 3,
      "total_test_cases": 3,
      "coverage_br_to_test": "100% for BR-019 (full chain)",
      "orphans_count": 1,
      "missing_tests": 1
    },
    "rtm_rows": [
      {
        "business_requirement": "BR-019",
        "functional_requirement": "FR-024",
        "user_story": "US-031",
        "test_case": "TC-101, TC-102",
        "implementation_ref": null,
        "status": "ready_for_dev"
      },
      {
        "business_requirement": "BR-019",
        "functional_requirement": "FR-025",
        "user_story": "US-032",
        "test_case": "TC-103",
        "implementation_ref": null,
        "status": "ready_for_dev"
      },
      {
        "business_requirement": "⚠️ ORPHAN",
        "functional_requirement": "-",
        "user_story": "US-040",
        "test_case": "❌ MISSING",
        "implementation_ref": null,
        "status": "blocked"
      }
    ],
    "orphans_detected": [
      {
        "orphan_id": "US-040",
        "orphan_type": "orphan_story",
        "severity": "high",
        "issue": "User story has no source_br — appears to be feature creep",
        "rationale": "Email notification on price drop is Phase 2 (per BACCM context). Should be linked to BR-019 explicitly OR moved to backlog as new BR.",
        "suggested_fix": "Either: (a) add source_br field linking to BR-019 (or new BR), OR (b) move US-040 to Phase 2 backlog"
      }
    ],
    "coverage_gaps": [
      {
        "gap_id": "GAP-001",
        "issue": "US-040 has no test cases yet",
        "severity": "medium",
        "suggested_fix": "Add ≥1 TC for US-040 before sprint commitment"
      }
    ],
    "stale_links": [],
    "metadata": {
      "version_check_performed": true,
      "all_referenced_ids_valid": true
    }
  },
  "validators_passed": [
    "VALIDATOR-END-TO-END-COVERAGE (BR-019 chain complete)",
    "VALIDATOR-NO-ORPHANS [PARTIAL — 1 orphan flagged]"
  ],
  "followup_skills_recommended": [
    "SKILL-IMPACT-ANALYZER (roadmap — analyze impact if BR-019 changes)"
  ],
  "human_review_areas": [
    "US-040 source — confirm with PO before sprint planning",
    "Implementation refs (PR/commit) — populate after dev work starts"
  ]
}
```

## Ví dụ 2: Stale link detection

**Input scenario:**
- BR-001 v1.0 referenced by FR-010
- BR-001 updated to v1.1 (KPI target changed) but FR-010 not updated

**Output:**
```json
{
  "skill": "SKILL-TRACEABILITY-BUILDER",
  "status": "success_with_warnings",
  "stale_links": [
    {
      "stale_id": "FR-010",
      "stale_type": "stale_traceability",
      "severity": "low",
      "issue": "FR-010 references BR-001 v1.0, but BR-001 has been updated to v1.1 (KPI changed from 25% → 30% conversion target)",
      "version_drift": {
        "referenced_version": "v1.0",
        "current_version": "v1.1",
        "diff_summary": "KPI target updated"
      },
      "suggested_fix": "Review FR-010 — does new KPI target affect FR scope? Update reference to v1.1 + verify FR coverage still adequate."
    }
  ]
}
```

📚 More: examples/example_rtm_build.md

---

# Constraints

- 🚫 KHÔNG sinh requirements/stories/tests — only link them
- 🚫 KHÔNG silent skip orphans — luôn flag
- 🚫 KHÔNG infer link không có evidence (ID match hoặc similarity ≥0.85)
- ✅ LUÔN return RTM dạng matrix structure
- ✅ LUÔN flag orphans + coverage_gaps + stale_links
- ✅ LUÔN check version drift (stale_traceability)

<!-- Generated by Skill Creator Ultra v1.0 — Phase 2 -->
