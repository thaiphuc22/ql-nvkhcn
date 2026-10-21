# Elicitation Patterns — Reference

> Tier 1 fallback: vì `babok-knowledge/technique/TECH-INTERVIEW.yaml`,
> `TECH-WORKSHOP.yaml` chưa tồn tại. File này extract patterns chuẩn
> IIBA BABOK v3 §10 cho elicitation techniques.

---

## 1. Interview Patterns

### Trigger phrases để identify business statement
- "Hệ thống PHẢI...", "PHẢI có khả năng..."
- "Cần có chức năng..."
- "Tính năng X giúp..."
- "Mục tiêu là tăng/giảm Y..."

### Trigger phrases để identify need
- "Khách hàng/User đang khó khăn..."
- "Pain point hiện tại..."
- "Mong muốn cải thiện..."
- "Hiện tại đang phải..."

### Trigger phrases để identify constraint
- "Không được...", "Tuyệt đối không..."
- "Chỉ áp dụng khi..."
- "Phải tuân thủ [regulation]..."
- "Trong giới hạn budget/time..."

### Trigger phrases để identify assumption
- "Giả định rằng...", "Nếu mà..."
- "Dự kiến..."
- "Kỳ vọng..."

### Speaker reliability heuristics
| Role | Default reliability | Notes |
|---|---|---|
| Sponsor / Executive | High | Authoritative cho strategic decisions |
| Product Owner | High | Authoritative cho product scope |
| End-user (frontline) | Medium-High | Authoritative cho pain points, less for solution |
| Stakeholder (cross-functional) | Medium | Domain-specific reliability |
| Anonymous survey response | Low-Medium | Need aggregation |

## 2. Workshop Patterns

### Workshop output có 3 forms:
1. **Decision board** — affinity diagrams, dot voting → business priorities
2. **Process map** — sticky notes on whiteboard → process flow (transition reqs)
3. **User journey** — persona + steps → user/stakeholder reqs

### Common workshop deliverables
- **Brainstorming list** — raw ideas, need filtering for actual reqs
- **Voting result** — priority signal (MoSCoW input)
- **Conflict matrix** — competing stakeholder needs (manual conflict flagging)

### Workshop-specific ambiguities
- **Group think** — 1 dominant voice → flag if 90%+ statements from 1 speaker
- **Compromise wording** — "có thể xem xét..." → flag as low-confidence
- **Action items vs requirements** — "Cần meeting tuần sau" KHÔNG phải requirement

## 3. Document Analysis Patterns

### Source documents thường dùng
- SOPs / process manuals → Business + Functional reqs
- Existing system docs → Transition reqs
- Email threads → User needs + assumptions
- Survey reports → Stakeholder reqs (with confidence based on N)

### Anti-patterns trong document analysis
- ❌ Treat every "should" as requirement → check intent
- ❌ Ignore document version → outdated docs ≠ current reqs
- ❌ Skip metadata (author, date) → loses traceability

## 4. Classification Decision Tree

```
Statement detected
  │
  ├─ "Tăng/giảm KPI..." (strategic outcome) → Business
  │
  ├─ "[Specific persona] cần..." → Stakeholder
  │
  ├─ "Hệ thống phải [verb] [object]..." → Solution-Functional
  │
  ├─ "Quality attribute (≤Xs, ≥Y%, etc.)" → Solution-Non-Functional
  │
  └─ "Migration / one-time / cutover..." → Transition
```

## 5. Confidence Adjustment Rules

```python
base_confidence = nlp_extraction_confidence

# Boost
if speaker_role in ['Sponsor', 'PO']: confidence += 0.10
if statement has explicit_metric: confidence += 0.10
if statement has explicit_actor: confidence += 0.05

# Reduce
if statement has vague_language: confidence -= 0.20
if speaker contradicts prior_statement: confidence -= 0.15
if statement is implied (not direct quote): confidence -= 0.10

# Cap
confidence = min(0.95, max(0.20, confidence))
```

## 6. Memory Integration (when ba-agent runtime available)

```yaml
read_from_memory:
  stakeholder_history:
    - prior_statements_by_speaker  # detect contradictions
    - reliability_score             # adjust confidence
  
  domain_ontology:
    - canonical_terms               # normalize synonyms
    - known_business_rules          # cross-reference
```

## 7. Common Failure Patterns

| Pattern | Detection | Mitigation |
|---|---|---|
| `hallucinated_requirements` | No source in transcript | Hard reject |
| `merged_requirements` | "PHẢI A và B" → 1 req | Auto-split |
| `missing_constraints` | Functional reqs but no NFR mention | Add open_question |
| `political_statements` | "We discussed already" → not actual req | Filter out |
| `solution_disguised_as_req` | "Cần dùng React" → tech bias | Flag for re-frame |
