---
name: skill-requirement-extractor
description: |
  Atomic skill chuyên extract structured requirements từ unstructured
  stakeholder communication: meeting transcripts, interview notes,
  workshop output, email threads. Output: classified requirements
  (functional/non-functional/business/transition) + assumptions +
  open_questions + ambiguities. Áp dụng reasoning pipeline 7 bước
  (identify business statements → user needs → constraints → classify →
  detect assumptions → detect ambiguities → normalize). Validators:
  VALIDATOR-REQUIREMENT-ATOMICITY + VALIDATOR-NO-DUPLICATION + VALIDATOR-BUSINESS-VALUE.
  Dùng khi user nói "extract requirements từ transcript", "phân tích
  meeting notes", "tìm requirement trong workshop output", "structured
  requirements từ email", "elicit từ recording". KHÔNG dùng để
  generate documents (đó là composite skills).
---

# Goal

Transform unstructured stakeholder communication thành structured
requirements catalog với confidence scores + flags cho ambiguity, trong
≤2 phút thay vì 1-2 giờ manual analysis.

# Card Reference

📋 [`card.yaml`](./card.yaml) — đây là card đầy đủ nhất (đã có
`prompt_strategy`, `confidence_scoring`, `memory_interactions`,
`tool_dependencies`, `domain_specialization`).

# Domain References (Tier 1)

📚 **Authoritative sources:**
- **Knowledge Area:** `babok-knowledge/knowledge_areas/KA-ELICITATION.yaml`
- **Task:** `babok-knowledge/task/TASK-ELICIT-001.yaml`

⚠️ **Tier 1 gaps detected** (per `card.yaml.supported_techniques` + `supported_artifacts`):
- `TECH-INTERVIEW.yaml` — KHÔNG tồn tại trong `babok-knowledge/technique/`
- `TECH-WORKSHOP.yaml` — KHÔNG tồn tại
- `ART-INITIAL-REQUIREMENTS.yaml` — KHÔNG tồn tại trong `babok-knowledge/artifacts/`
- `ART-ELICITATION-NOTES.yaml` — KHÔNG tồn tại

📋 **Local fallback:** [`resources/elicitation_patterns.md`](./resources/elicitation_patterns.md) — patterns chuẩn IIBA

> **Action item cho babok-knowledge maintainer:** Tạo 4 files trên để
> complete Tier 1 KA-ELICITATION coverage.

---

# Mindset

Bạn là **elicitation analyst** — đọc transcript/notes, extract
requirements WITHOUT hallucination. Khi unsure → flag ambiguity, không
fill in gaps.

**3 kỷ luật:**

1. **NO HALLUCINATION** — chỉ extract requirements có evidence trong source
2. **CLASSIFY EXPLICITLY** — functional / non-functional / business / transition
3. **CONFIDENCE PER REQUIREMENT** — không treat tất cả equal

---

# Instructions

## Bước 1: Validate input

Per `card.yaml.inputs`:
- `transcript` (text) — meeting/interview/workshop output
- `notes` — supplementary
- `stakeholder_context` — who said what (role + influence)

**Insufficient → return:**
```json
{"error": "INSUFFICIENT_CONTEXT", "needed": "transcript or substantive notes"}
```

## Bước 2: Reasoning Pipeline (7 bước theo card.yaml)

### 2.1 `identify_business_statements`
Patterns:
- "Hệ thống phải/cần" → functional requirement
- "Quy trình hiện tại là..." → as-is statement
- "Mục tiêu là..." → business objective

### 2.2 `detect_user_needs`
- "User muốn" / "Khách cần" → user requirement
- "Pain point" / "Khó khăn" → need statement
- "Mong đợi" → expectation

### 2.3 `identify_constraints`
- "Không được" → constraint negative
- "Phải tuân thủ" → compliance constraint
- "Trong giới hạn..." → resource constraint

### 2.4 `classify_requirements`
Apply BABOK classification (per BABOK v3 §8):

| Type | Pattern | Example |
|---|---|---|
| **Business** | Why level — strategic | "Tăng conversion 30%" |
| **Stakeholder** | Stakeholder-specific need | "Nhân viên CSKH cần..." |
| **Solution-Functional** | What system does | "Hệ thống phải cho phép..." |
| **Solution-Non-Functional** | Quality attribute | "Response ≤2s" |
| **Transition** | One-time during change | "Migration data X..." |

### 2.5 `detect_assumptions`
- "Giả định rằng..." / "Nếu mà..." → explicit assumption
- Implicit assumptions (skill detect) → flag với confidence medium

### 2.6 `detect_ambiguities`
Apply ambiguity dictionary (cross-ref `ba-doc-review/resources/ambiguity_dictionary.md`):
- Vague words → flag
- Conflicting statements → flag
- Missing context → open_question

### 2.7 `normalize_requirements`
Format chuẩn: `[Type] [Verb] [Object] [Condition/Metric]`

Example: `[Functional] System SHALL allow user to filter products by price WHEN cart is empty`

## Bước 3: Apply Validators

| Validator | Check |
|---|---|
| VALIDATOR-REQUIREMENT-ATOMICITY | 1 requirement = 1 capability |
| VALIDATOR-NO-DUPLICATION | Không 2 requirements cùng nội dung |
| VALIDATOR-BUSINESS-VALUE | Mỗi req map về business goal |

## Bước 4: Confidence Scoring (per card.yaml)

```yaml
high_confidence (≥0.8):
  - explicit_business_language    # "PHẢI", "BẮT BUỘC"
  - clear_actor_defined           # Persona named explicitly

low_confidence (<0.5):
  - vague_language                # "có thể", "tốt"
  - conflicting_statements        # 2 stakeholder mâu thuẫn
```

→ Skill output mỗi requirement với `confidence` field.

## Bước 5: Output (structured JSON)

```json
{
  "skill": "SKILL-REQUIREMENT-EXTRACTOR",
  "version": "1.0.0",
  "status": "success",
  "overall_confidence": 0.82,
  "artifact_type": "ART-INITIAL-REQUIREMENTS",
  "artifact": {
    "requirements_count": 12,
    "requirements": [
      {
        "id": "REQ-EXTRACT-001",
        "type": "Functional",
        "statement": "...",
        "source": "Transcript line 45-47, speaker: PO",
        "confidence": 0.92,
        "rationale": "Explicit 'PHẢI' language"
      }
    ],
    "assumptions": [...],
    "open_questions": [...],
    "ambiguities": [...]
  },
  "validators_passed": [...],
  "human_review_rules": {
    "mandatory_when": ["confidence_below_0_8", "conflict_detected"]
  },
  "followup_skills_recommended": [
    "SKILL-USER-STORY-GENERATOR (Functional reqs → stories)",
    "SKILL-BR-EXTRACTOR (extract business rules từ Non-Functional)"
  ]
}
```

## Bước 6: Failure Handling (per card.yaml)

| Pattern | Detection | Action |
|---|---|---|
| `hallucinated_requirements` | Req without source citation | REJECT |
| `merged_multiple_requirements` | 1 statement → 2 capabilities | Auto-split + flag |
| `missing_constraints` | Functional without NFR | Add to open_questions |

## Bước 7: Memory Interactions (per card.yaml)

```yaml
reads:
  - stakeholder_history    # ba-agent/memory/stakeholder_memory
  - domain_ontology        # babok-knowledge cross-ref

# Implementation note:
# Khi runtime có memory layer, skill query stakeholder_memory để biết:
# - Speaker reliability (sponsor confidence high vs random user low)
# - Past contradictions (flag if statement conflicts with prior)
```

---

# Examples

## Ví dụ 1: Extract from PO meeting transcript

**Input:**
```text
Transcript — PO meeting 2026-05-09:

PO Tuấn: "Bên anh muốn add chức năng wishlist cho khách. Đợt vừa rồi
data team cho thấy 30% users add cart rồi bỏ. Anh muốn giảm xuống 20%
trong Q3."

PO Tuấn: "Wishlist chỉ cho khách đã đăng ký, không cho guest. Mỗi
khách max 100 items. Khi xoá thì xoá luôn, không archive."

BA Linh: "Anh có cần feature share wishlist với bạn bè không?"

PO Tuấn: "Phase 2 thôi. Phase 1 chỉ basic save/remove."

BA Linh: "Performance ok chứ ạ? Trang detail product hiện đang 2s load."

PO Tuấn: "Ừm, đừng làm nó chậm hơn. Mà có thể nhanh hơn được không?"
```

**Reasoning:**
- 5 statements identified
- Classification: 2 Functional + 1 Non-Functional + 2 Constraint
- 1 assumption (Phase 2 share)
- 1 ambiguity ("nhanh hơn" — measurable?)
- 1 open question (current 2s benchmark — improve or keep?)

**Output:**
```json
{
  "skill": "SKILL-REQUIREMENT-EXTRACTOR",
  "status": "success",
  "overall_confidence": 0.84,
  "artifact": {
    "requirements_count": 5,
    "requirements": [
      {
        "id": "REQ-EXTRACT-001",
        "type": "Business",
        "statement": "Reduce cart abandonment rate from 30% to 20% by Q3",
        "source": "PO Tuấn — line 1-3",
        "confidence": 0.95,
        "rationale": "Explicit baseline + target + timeline"
      },
      {
        "id": "REQ-EXTRACT-002",
        "type": "Solution-Functional",
        "statement": "System SHALL allow registered customer to add/remove products to/from wishlist",
        "source": "PO Tuấn — line 4",
        "confidence": 0.92,
        "rationale": "Clear capability"
      },
      {
        "id": "REQ-EXTRACT-003",
        "type": "Solution-Functional",
        "statement": "System SHALL restrict wishlist to authenticated users (no guest access)",
        "source": "PO Tuấn — line 4",
        "confidence": 0.95,
        "rationale": "Explicit constraint"
      },
      {
        "id": "REQ-EXTRACT-004",
        "type": "Solution-Functional",
        "statement": "System SHALL limit wishlist to max 100 items per customer",
        "source": "PO Tuấn — line 4",
        "confidence": 0.95,
        "rationale": "Explicit numeric"
      },
      {
        "id": "REQ-EXTRACT-005",
        "type": "Solution-Functional",
        "statement": "System SHALL hard-delete removed items (no archive)",
        "source": "PO Tuấn — line 4",
        "confidence": 0.88,
        "rationale": "Explicit no-archive policy"
      }
    ],
    "assumptions": [
      {
        "id": "ASSUMP-001",
        "statement": "Wishlist sharing is Phase 2 (out of scope this release)",
        "source": "PO Tuấn — line 7",
        "confidence": 0.90
      }
    ],
    "open_questions": [
      {
        "id": "OQ-001",
        "question": "Performance target cho product detail page — keep 2s or improve below 2s?",
        "source": "PO Tuấn — line 9 'có thể nhanh hơn'",
        "blocking_for": "REQ-EXTRACT-002 (need NFR threshold)"
      }
    ],
    "ambiguities": [
      {
        "id": "AMB-001",
        "term": "nhanh hơn",
        "context": "Performance product detail page",
        "source": "PO Tuấn — line 9",
        "suggested_clarification": "Specify metric: ≤1.5s? ≤1s? Or ≤2s threshold maintained?"
      }
    ],
    "metadata": {
      "speaker_breakdown": {"PO Tuấn": 4, "BA Linh": 1},
      "classification_breakdown": {"Business": 1, "Solution-Functional": 4, "Solution-Non-Functional": 0}
    }
  },
  "validators_passed": [
    "VALIDATOR-REQUIREMENT-ATOMICITY (5/5 atomic)",
    "VALIDATOR-NO-DUPLICATION (no dups)",
    "VALIDATOR-BUSINESS-VALUE (REQ-001 → REQ-002-005 traceable)"
  ],
  "human_review_areas": [
    "OQ-001 perf NFR — needs PO clarification before SKILL-USER-STORY-GENERATOR can use",
    "AMB-001 'nhanh hơn' — replace with metric"
  ],
  "followup_skills_recommended": [
    "SKILL-USER-STORY-GENERATOR (REQ-002-005 → stories)",
    "SKILL-BR-EXTRACTOR (verify business rules from constraints)"
  ]
}
```

## Ví dụ 2: Hallucination prevention

**Input:** Transcript chỉ nói "build wishlist", không có detail.

**Output:**
```json
{
  "skill": "SKILL-REQUIREMENT-EXTRACTOR",
  "status": "minimal_extraction",
  "overall_confidence": 0.40,
  "artifact": {
    "requirements_count": 1,
    "requirements": [
      {
        "id": "REQ-EXTRACT-001",
        "type": "Solution-Functional",
        "statement": "System SHALL provide wishlist feature (scope undefined)",
        "source": "Transcript line 1",
        "confidence": 0.45,
        "rationale": "Vague — no acceptance criteria, no constraints, no actor defined"
      }
    ],
    "open_questions": [
      "Persona? (registered/guest/all?)",
      "Scope? (save/remove/share/notification?)",
      "Constraints? (item limit, retention, etc.)",
      "Performance target?",
      "Compliance considerations?"
    ]
  },
  "human_review_areas": ["confidence_below_0_8 — escalate to BA for re-elicitation"],
  "fallback_strategy": ["request_clarification", "escalate_to_human"]
}
```

→ Skill KHÔNG bịa requirements. Flag insufficient + suggest re-interview.

📚 More: `examples/example_req_extraction.md`

---

# Constraints

- 🚫 KHÔNG hallucinate requirements (mỗi req PHẢI có source citation)
- 🚫 KHÔNG fill in gaps mà không evidence
- 🚫 KHÔNG merge multiple requirements vào 1 statement
- ✅ LUÔN classify (Business/Stakeholder/Solution-F/Solution-NF/Transition)
- ✅ LUÔN confidence score per requirement
- ✅ LUÔN flag ambiguities + open_questions
- ✅ LUÔN cite source (line number / speaker)

<!-- Generated by Skill Creator Ultra v1.0 — Phase 2 -->
