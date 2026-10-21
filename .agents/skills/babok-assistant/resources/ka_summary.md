# 🗂 BABOK 6 Knowledge Areas — Summary cho Routing

> Tóm tắt 6 Knowledge Areas trong BABOK v3 → map sang skill hiện có /
> roadmap để orchestrator biết route đâu.

---

## Overview

BABOK v3 có 6 Knowledge Areas (KA). Mỗi KA chứa các tasks BA thực hiện.

```
┌─────────────────────────────────────────────────┐
│  KA1: Business Analysis Planning & Monitoring   │ → orchestrator inline
│  KA2: Elicitation & Collaboration               │ → ba-elicit (roadmap)
│  KA3: Requirements Life Cycle Management        │ → ba-doc-write/review
│  KA4: Strategy Analysis                         │ → ba-strategy (roadmap)
│  KA5: Requirements Analysis & Design Definition │ → ba-doc-write
│  KA6: Solution Evaluation                       │ → ba-solution-eval (roadmap)
└─────────────────────────────────────────────────┘
```

---

## KA1: Business Analysis Planning & Monitoring

### Tasks
- 1.1 Plan Business Analysis Approach (Agile/Waterfall/Hybrid)
- 1.2 Plan Stakeholder Engagement
- 1.3 Plan Business Analysis Governance
- 1.4 Plan Business Analysis Information Management
- 1.5 Identify Business Analysis Performance Improvements

### Routing
→ **Inline** (không cần skill riêng — meta-level work của BA)
→ Orchestrator handle khi user hỏi:
  - "Em chọn approach Agile hay Waterfall cho dự án này?"
  - "Stakeholder engagement plan thế nào?"
  - "Cách track performance của BA?"

### Quick advice (inline)

**Approach selection:**
| Tình huống | Approach |
|---|---|
| Requirements rõ, ít đổi, regulated industry | Waterfall |
| Requirements evolve, fast feedback, digital product | Agile/Scrum |
| Mix (large-scale, vài part rõ, vài part evolve) | Hybrid (SAFe) |

---

## KA2: Elicitation & Collaboration ⚠️ (skill roadmap)

### Tasks
- 2.1 Prepare for Elicitation
- 2.2 Conduct Elicitation
- 2.3 Confirm Elicitation Results
- 2.4 Communicate Business Analysis Information
- 2.5 Manage Stakeholder Collaboration

### Future skill: `ba-elicit`
**Sẽ làm:**
- Generate interview question template (BACCM-driven)
- Stakeholder matrix builder
- Workshop facilitation guide
- Requirements catalog management

### Workaround inline (đến khi `ba-elicit` ra)

#### Interview question template (BACCM-driven)
```
1. CHANGE: "Anh thấy quy trình hiện tại đang thay đổi gì?"
2. NEED:   "Pain point lớn nhất gây nên need là gì?"
3. SOLUTION: "Anh hình dung giải pháp ra sao?"
4. STAKEHOLDER: "Ai bị ảnh hưởng / hưởng lợi nhiều nhất?"
5. VALUE:  "KPI nào sẽ measure thành công?"
6. CONTEXT: "Có constraint nào em cần biết?"
```

#### Stakeholder Matrix template (Mendelow grid)
```
                Influence
                Low    High
Interest  High  Keep   Manage
                Inform closely
          Low   Monitor Keep
                       Satisfied
```

---

## KA3: Requirements Life Cycle Management ✅

### Tasks
- 3.1 Trace Requirements
- 3.2 Maintain Requirements
- 3.3 Prioritize Requirements (MoSCoW, value/effort)
- 3.4 Assess Requirements Changes
- 3.5 Approve Requirements

### Routing
→ **`ba-doc-write`** for traceability matrix + prioritization
→ **`ba-doc-review`** for change assessment (impact analysis, gap detection)

---

## KA4: Strategy Analysis ⚠️ (skill roadmap)

### Tasks
- 4.1 Analyze Current State
- 4.2 Define Future State
- 4.3 Assess Risks
- 4.4 Define Change Strategy

### Future skill: `ba-strategy`
**Sẽ làm:**
- Current state assessment template
- Future state vision builder
- Gap analysis matrix
- SWOT generator
- Business case writer
- Risk register

### Workaround inline (đến khi `ba-strategy` ra)

#### SWOT Template
```
        Internal           External
Pos.    Strengths          Opportunities
        - <strength 1>     - <opp 1>
        - <strength 2>     - <opp 2>

Neg.    Weaknesses         Threats
        - <weakness 1>     - <threat 1>
        - <weakness 2>     - <threat 2>
```

#### Gap Analysis Matrix
| Dimension | Current State | Future State | Gap | Action |
|---|---|---|---|---|
| Process | Manual | Automated | Automation tool | Implement Y |
| Tech | SAP | Oracle | Migration | Vendor SI |
| People | 5 BA | 3 BA + tools | Training | Upskill |
| Data | Excel | DW | ETL pipeline | Build X |

---

## KA5: Requirements Analysis & Design Definition (RADD) ✅

### Tasks
- 5.1 Specify and Model Requirements
- 5.2 Verify Requirements
- 5.3 Validate Requirements
- 5.4 Define Requirements Architecture
- 5.5 Define Design Options
- 5.6 Analyze Potential Value and Recommend Solution

### Routing
→ **`ba-doc-write`** for specification (BRD/FRD/SRS/User Story/Use Case)
→ **`ba-doc-review`** for verify + validate

---

## KA6: Solution Evaluation ⚠️ (skill roadmap)

### Tasks
- 6.1 Measure Solution Performance
- 6.2 Analyze Performance Measures
- 6.3 Assess Solution Limitations
- 6.4 Assess Enterprise Limitations
- 6.5 Recommend Actions to Increase Solution Value

### Future skill: `ba-solution-eval`
**Sẽ làm:**
- KPI dashboard template
- Post-launch evaluation framework
- Retrospective format
- Improvement recommendation generator

### Workaround inline (đến khi `ba-solution-eval` ra)

#### Post-Launch Evaluation Framework

```
1. KPI Tracking (1 tháng / 3 tháng / 6 tháng / 12 tháng)
   - So sánh actual vs target từ BRD §9 Success Criteria
   - Track via: GA4, Mixpanel, internal dashboard

2. Stakeholder Feedback
   - Interview top 3-5 power users
   - Survey end-users (NPS)
   - Sponsor satisfaction interview

3. Solution Limitations Assessment
   - Performance bottleneck (slow query, scale issue)
   - UX friction (drop-off points)
   - Compliance/security incidents

4. Enterprise Limitations
   - Process change adoption rate
   - Team capability gap
   - Tool/integration issues

5. Recommendations
   - Quick wins (≤1 sprint to fix)
   - Roadmap items (≥1 sprint)
   - Out-of-scope (escalate)
```

---

## 7. Cross-Reference: BABOK Perspectives

BABOK v3 có 5 **Perspectives** modify cách áp dụng:

| Perspective | Khi nào dùng |
|---|---|
| **Agile** | Software dev, fast feedback, evolve scope |
| **Business Intelligence** | Data, analytics, reporting projects |
| **Information Technology** | Infrastructure, IT operations |
| **Business Architecture** | Enterprise-level, multi-domain |
| **Business Process Management** | Process improvement, operational excellence |

**Default cho skills hiện tại:** Agile Perspective (focus user story + INVEST).

Nếu user đề cập domain khác:
- BPM → workaround: dùng BPMN modeling guidance trong `babok_knowledge.md`
- IT → workaround: SRS template trong `ba-doc-write` đã cover NFR
- BI → workaround: requirement format adapt cho data flow

---

## 8. Quick Skill Selector

```
User task → Skill?

Sinh tài liệu spec → ba-doc-write
Review tài liệu → ba-doc-review
Phỏng vấn stakeholder → ba-elicit (roadmap) → workaround inline
Phân tích chiến lược → ba-strategy (roadmap) → workaround inline
Đánh giá giải pháp → ba-solution-eval (roadmap) → workaround inline
Hỏi BABOK knowledge → orchestrator inline
Workflow nhiều bước → orchestrator coach + sequence skills
```
