# Example — Multi-stakeholder workshop output extraction

## Input

```text
Workshop output — 2026-05-09, ChatBot CSKH project:

Speakers:
- COO Hương (Sponsor)
- HR Manager Tuấn (CSKH Manager)
- IT Lead Khoa
- 2 senior CSKH agents (Mai, Hoa)

Transcript snippet:

[14:00] COO Hương: "Mục tiêu là giảm 60% volume call tới callcenter,
từ 5000 xuống 2000/ngày. Trong vòng 6 tháng go-live."

[14:05] HR Manager Tuấn: "Em nghĩ bot phải xử lý được tối thiểu 70% câu
hỏi FAQ. Còn lại handoff sang human agent."

[14:10] IT Lead Khoa: "Phải tích hợp với Zalo OA và FB Messenger. CRM
hiện tại có API REST chuẩn, nên integration ok."

[14:12] CSKH agent Mai: "Tụi em sợ bot trả lời sai làm khách phàn nàn.
Phải có cách để khách báo lại nếu bot trả lời không đúng."

[14:15] CSKH agent Hoa: "Bot nên 'thông minh' để hiểu context, không
phải FAQ cứng. Nhưng đừng làm chậm hơn callcenter."

[14:20] COO Hương: "Compliance — phải tuân thủ Nghị định 13. Conversation
logs lưu thế nào để audit?"

[14:25] BA: "Có thể migrate lịch sử conversation từ callcenter qua bot
training data?"

[14:26] IT Lead Khoa: "Ừm, có thể nhưng tốn effort. Phase 2 chắc tốt hơn."
```

## Reasoning Pipeline Trace

### 2.1 identify_business_statements
- COO statement → Business goal (KPI 60%)
- COO compliance → Solution-NF (regulatory)

### 2.2 detect_user_needs
- CSKH agent Mai → Need: feedback mechanism khi bot sai
- CSKH agent Hoa → Need: context-aware (not just FAQ)

### 2.3 identify_constraints
- Tích hợp Zalo + FB Messenger (channel constraint)
- Nghị định 13 (compliance)
- Performance ≥ callcenter ("đừng chậm hơn")

### 2.4 classify_requirements
- 1 Business
- 1 Stakeholder (CSKH agents)
- 4 Solution-Functional
- 2 Solution-Non-Functional
- 1 Transition (migration)

### 2.5 detect_assumptions
- "CRM API REST chuẩn" — IT Lead claim, need verify
- "Phase 2 migration" — BA-IT discussion, not finalized

### 2.6 detect_ambiguities
- "thông minh" (Hoa) — vague NLU/AI capability
- "đừng chậm hơn callcenter" — current callcenter latency unknown
- "tối thiểu 70%" — measure cụ thể bot resolution rate?

### 2.7 normalize_requirements
Format: `[Type] [System/Actor] [verb] [object] [condition]`

## Output

```json
{
  "skill": "SKILL-REQUIREMENT-EXTRACTOR",
  "version": "1.0.0",
  "status": "success",
  "overall_confidence": 0.81,
  "artifact_type": "ART-INITIAL-REQUIREMENTS",
  "artifact": {
    "requirements_count": 8,
    "requirements": [
      {
        "id": "REQ-001",
        "type": "Business",
        "statement": "Reduce callcenter call volume from 5000/day to ≤2000/day (-60%) within 6 months post go-live",
        "source": "COO Hương 14:00",
        "confidence": 0.95,
        "rationale": "Sponsor explicit + baseline + target + timeline"
      },
      {
        "id": "REQ-002",
        "type": "Solution-Functional",
        "statement": "ChatBot SHALL automatically resolve ≥70% of FAQ-type queries without human intervention",
        "source": "HR Manager Tuấn 14:05",
        "confidence": 0.85,
        "rationale": "Explicit resolution target by domain expert"
      },
      {
        "id": "REQ-003",
        "type": "Solution-Functional",
        "statement": "ChatBot SHALL handoff conversation to human agent when not resolved by bot",
        "source": "HR Manager Tuấn 14:05",
        "confidence": 0.92,
        "rationale": "Explicit functional capability"
      },
      {
        "id": "REQ-004",
        "type": "Solution-Functional",
        "statement": "System SHALL integrate with Zalo Official Account messaging API",
        "source": "IT Lead Khoa 14:10",
        "confidence": 0.95,
        "rationale": "Explicit channel"
      },
      {
        "id": "REQ-005",
        "type": "Solution-Functional",
        "statement": "System SHALL integrate with Facebook Messenger Platform",
        "source": "IT Lead Khoa 14:10",
        "confidence": 0.95,
        "rationale": "Explicit channel"
      },
      {
        "id": "REQ-006",
        "type": "Stakeholder",
        "statement": "CSKH agents SHALL have ability to flag/correct incorrect bot responses (feedback loop)",
        "source": "CSKH agent Mai 14:12",
        "confidence": 0.78,
        "rationale": "Pain point implied need; not explicit 'PHẢI'"
      },
      {
        "id": "REQ-007",
        "type": "Solution-Non-Functional",
        "statement": "ChatBot response latency SHALL not exceed current callcenter avg latency (TBD: measure baseline)",
        "source": "CSKH agent Hoa 14:15",
        "confidence": 0.55,
        "rationale": "Comparative target without absolute metric — needs baseline measurement"
      },
      {
        "id": "REQ-008",
        "type": "Solution-Non-Functional",
        "statement": "System SHALL comply with Nghị định 13/2023 — conversation logs retention + audit trail",
        "source": "COO Hương 14:20",
        "confidence": 0.92,
        "rationale": "Regulatory mandate explicit"
      }
    ],
    "assumptions": [
      {
        "id": "ASSUMP-001",
        "statement": "CRM API REST is standard and fit for ChatBot integration",
        "source": "IT Lead Khoa 14:10",
        "confidence": 0.70,
        "verification_needed": "Tech audit of CRM API capabilities + rate limits"
      },
      {
        "id": "ASSUMP-002",
        "statement": "Migration of historical conversation data is Phase 2 (out of MVP scope)",
        "source": "BA-IT discussion 14:25-26",
        "confidence": 0.65,
        "verification_needed": "Sponsor confirmation"
      }
    ],
    "open_questions": [
      {
        "id": "OQ-001",
        "question": "Current callcenter latency baseline (avg, p95)?",
        "blocking_for": "REQ-007 (need absolute target)",
        "owner": "IT Lead + CSKH Manager (capture from existing analytics)"
      },
      {
        "id": "OQ-002",
        "question": "Nghị định 13 retention period for conversation logs?",
        "blocking_for": "REQ-008 implementation",
        "owner": "Legal/Compliance team"
      },
      {
        "id": "OQ-003",
        "question": "Bot 'context awareness' — NLU capability level expected? (FAQ keyword match vs intent classification vs LLM-based)",
        "blocking_for": "Architecture decision",
        "owner": "PO + IT Lead"
      }
    ],
    "ambiguities": [
      {
        "id": "AMB-001",
        "term": "thông minh",
        "context": "Bot capability (Hoa)",
        "source": "14:15",
        "suggested_clarification": "Specify: keyword match / intent classification / LLM-based / hybrid?"
      },
      {
        "id": "AMB-002",
        "term": "đừng chậm hơn callcenter",
        "context": "Performance NFR (Hoa)",
        "source": "14:15",
        "suggested_clarification": "Need absolute metric: ≤Xs response time"
      }
    ],
    "metadata": {
      "speaker_breakdown": {
        "COO Hương (Sponsor)": 2,
        "HR Manager Tuấn": 2,
        "IT Lead Khoa": 3,
        "CSKH agents": 2,
        "BA": 1
      },
      "classification_breakdown": {
        "Business": 1,
        "Stakeholder": 1,
        "Solution-Functional": 4,
        "Solution-Non-Functional": 2,
        "Transition": 0
      },
      "speaker_reliability_applied": true
    }
  },
  "validators_passed": [
    "VALIDATOR-REQUIREMENT-ATOMICITY (8/8 atomic)",
    "VALIDATOR-NO-DUPLICATION",
    "VALIDATOR-BUSINESS-VALUE (REQ-001 ↔ REQ-002-008 traceable)"
  ],
  "human_review_areas": [
    "REQ-007 confidence 0.55 < 0.8 threshold → mandatory review",
    "ASSUMP-001 needs CRM tech audit",
    "OQ-001-003 blocking — must resolve before architecture work"
  ],
  "followup_skills_recommended": [
    "SKILL-USER-STORY-GENERATOR (REQ-002, 003, 006 → stories)",
    "SKILL-BR-EXTRACTOR (extract Business Rules từ REQ-008 compliance)",
    "SKILL-CONFLICT-DETECTOR (verify REQ-002 70% threshold không conflict với REQ-007 latency) [roadmap]"
  ]
}
```

## Why this output

1. **8 requirements** — extract đủ từ 26 phút workshop, không miss
2. **Speaker reliability applied** — Sponsor confidence cao hơn agents
3. **REQ-007 confidence 0.55** — flagged → mandatory human review (per
   `card.yaml.human_review_rules.confidence_below_0_8`)
4. **REQ-006 stakeholder type** — CSKH agent's need không phải sponsor
   mandate, classified accurately
5. **Open questions explicit** — 3 OQ block downstream work
6. **No hallucination** — Phase 2 migration ghi đúng "out of MVP scope"
   không tự sinh requirement chi tiết
7. **Domain ambiguity flag** — "thông minh" vague AI capability, không
   tự assume LLM/RAG/etc.
