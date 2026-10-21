# 🚦 Routing Logic — Decision Tree chi tiết

> Cách phân loại intent của user và route tới skill phù hợp.

---

## 1. 8 Intent Categories

| Code | Intent | Verb keywords | Object keywords | Skill |
|---|---|---|---|---|
| **A** | Sinh tài liệu | viết, tạo, sinh, draft, đặc tả, ghi nhận | BRD, FRD, SRS, user story, use case, requirement | `ba-doc-write` ✅ |
| **B** | Review tài liệu | review, audit, kiểm tra, soát, check, phân tích | (như Intent A) + "có vấn đề gì", "OK chưa" | `ba-doc-review` ✅ |
| **C** | Phỏng vấn / Elicit | phỏng vấn, interview, elicit, khai thác, khám phá | stakeholder, user, requirement, need | ⚠️ `ba-elicit` (roadmap) |
| **D** | Phân tích chiến lược | SWOT, gap analysis, current state, future state | business case, strategy, transformation | ⚠️ `ba-strategy` (roadmap) |
| **E** | Đánh giá giải pháp | đánh giá, evaluate, post-launch, retrospective | KPI, ROI, solution, outcome | ⚠️ `ba-solution-eval` (roadmap) |
| **F** | Tư vấn knowledge | hỏi, là gì, dùng sao, khác gì, giải thích | BACCM, MoSCoW, INVEST, technique | Inline |
| **G** | Workflow lớn | dự án mới, mới nhận, từ đầu, hướng dẫn, làm gì đầu tiên | (broad scope) | Coach + sequence |
| **H** | Không rõ | (mơ hồ) | — | Hỏi clarifying |

---

## 2. Decision Tree (Pseudocode)

```
function classify_intent(user_input):
    text = lowercase(user_input)
    
    # Intent A: Generate doc
    if has_verb(text, ["viết", "tạo", "sinh", "draft", "đặc tả"]):
        if has_doc_type(text, ["brd", "frd", "srs", "user story", "use case"]):
            return "A"
    
    # Intent B: Review doc
    if has_verb(text, ["review", "audit", "kiểm tra", "soát", "check"]):
        if has_doc_type(text) or has_phrase(text, ["có vấn đề", "ok chưa"]):
            return "B"
    
    # Intent C: Elicitation
    if has_keyword(text, ["phỏng vấn", "interview", "elicit", "khai thác"]):
        return "C"
    
    # Intent D: Strategy
    if has_keyword(text, ["swot", "gap analysis", "current state", "future state",
                          "business case", "strategy", "chiến lược"]):
        return "D"
    
    # Intent E: Solution Evaluation
    if has_keyword(text, ["post-launch", "đánh giá kpi", "retrospective",
                          "solution evaluation", "outcome"]):
        return "E"
    
    # Intent F: Knowledge / Advice
    if has_question_form(text) and has_babok_term(text):
        return "F"
    
    # Intent G: Workflow / Coach
    if has_phrase(text, ["dự án mới", "mới được giao", "từ đầu", 
                         "hướng dẫn", "làm gì đầu tiên", "bắt đầu thế nào"]):
        return "G"
    
    return "H"  # Unknown — ask clarifying
```

---

## 3. Disambiguation Rules

### Khi câu user có thể fall vào ≥2 intents

#### Rule 1: Verb dominance
Verb chính quyết định intent.

> "Anh review xong rồi viết lại" → 2 verbs nhưng "viết" là action chính → **A**

#### Rule 2: Object specificity
Doc type cụ thể > advice chung.

> "Em hỏi về INVEST trong user story này" — có "trong user story này"
> (specific) → **B** (review story đó với INVEST lens)
>
> "INVEST là gì?" — chỉ định nghĩa → **F**

#### Rule 3: Scope size
Task ≥3 phase → **G** dù có verb của A/B.

> "Em mới nhận dự án, cần viết BRD đầu tiên" — task lớn, BRD là phase 1 → **G**

#### Rule 4: Question form
"Là gì?" / "Khác gì?" / "Khi nào dùng?" → luôn **F** (không phải task action).

---

## 4. Confidence Scoring

Trước khi route, tự tính confidence:

```
confidence = (matches_strong_keywords × 0.5) + 
             (matches_object_type × 0.3) +
             (context_completeness × 0.2)

if confidence >= 0.7:
    proceed to route
else:
    ask clarifying question
```

### Examples

| Input | Confidence | Action |
|---|---|---|
| "Viết BRD payment, sponsor COO, KPI -60% call" | 0.95 | ✅ Route A immediately |
| "Em cần làm gì với doc này" | 0.30 | ❌ Ask: "Anh muốn em viết mới, review, hay sửa lại?" |
| "BRD" | 0.20 | ❌ Ask: "Em làm gì với BRD ạ? Viết / Review / Hỏi cách viết?" |
| "MoSCoW" | 0.40 | ⚠️ Intent F nhưng vague → "Anh hỏi định nghĩa hay áp dụng cho doc cụ thể?" |

---

## 5. Multi-Intent Handling

Khi user 1 câu có ≥2 intents:

### Pattern: Sequential

> "Anh viết xong story này, em check giúp"

→ Route A first → after done → Route B

```
Step 1: Route ba-doc-write (Intent A) với input
Step 2: After ba-doc-write complete → suggest:
        "Em đã viết xong. Em chạy ba-doc-review tiếp nhé?"
Step 3: User confirm → Route ba-doc-review (Intent B)
```

### Pattern: Compound

> "Em vừa được giao dự án mới — viết BRD payment, deadline Q4"

→ Đây là **Intent G** (workflow lớn) chứ không phải A
→ Coach workflow + estimate phases + start với Phase 1

---

## 6. Skill Capability Matrix

Để route đúng, cần biết skill nào làm được gì:

### `ba-doc-write` ✅
- ✅ Sinh BRD/FRD/SRS đầy đủ section IIBA
- ✅ Sinh User Story chuẩn INVEST + AC Given-When-Then
- ✅ Sinh Use Case Main/Alternative/Exception flows
- ✅ BACCM detection (auto-stop khi thiếu Stakeholder/Value)
- ❌ KHÔNG review doc hiện có
- ❌ KHÔNG phỏng vấn user

### `ba-doc-review` ✅
- ✅ Review BRD/FRD/SRS/User Story/Use Case
- ✅ 7-dimension scoring (S/A/B/C/D/F)
- ✅ Ambiguity detection (60+ từ Vietnamese + English)
- ✅ INVEST validation
- ✅ Compliance gap detection
- ✅ Rewritten Reference auto khi Grade ≤ B (v1.1.0)
- ❌ KHÔNG sinh doc mới
- ❌ KHÔNG phỏng vấn

### `ba-elicit` ⚠️ (roadmap — chưa build)
- Sẽ làm: Phỏng vấn stakeholder, build requirements catalog
- Workaround inline: question template + matrix template

### `ba-strategy` ⚠️ (roadmap)
- Sẽ làm: SWOT, current/future state, gap analysis, business case
- Workaround inline: SWOT template + gap matrix

### `ba-solution-eval` ⚠️ (roadmap)
- Sẽ làm: Post-launch evaluation, KPI tracking, retrospective
- Workaround inline: KPI dashboard template + retro framework

---

## 7. Route Format

Khi route, output theo format:

```
✅ Intent: <Code> — <Description>
🎯 Routing to: `<skill-name>`
📋 Context: <1-2 sentence summary>
🚀 Triggering...

[Then skill takes over]
```

Khi inline (không route):

```
📚 Em handle inline (Intent <F/G> hoặc skill chưa có):

<Content>

📌 Reference: <BABOK section / file>
```

---

## 8. Edge Cases

### EC1. User mention skill name explicitly

> "Em chạy ba-doc-review giúp anh"

→ Skip intent classification, route luôn tới skill được mention.

### EC2. User context từ session trước

> Vừa xong: ba-doc-write tạo BRD
> User: "Review luôn đi"

→ Pronoun "luôn" reference BRD vừa tạo → Route ba-doc-review với context.

### EC3. User reject route suggestion

> AI: "Em route sang ba-doc-write nhé"
> User: "Không, anh chỉ muốn em tư vấn thôi"

→ Switch to inline (Intent F mode), không force route.

### EC4. Workflow ngầm

> "Em xem giúp anh task này tốt chưa rồi gửi sếp"

→ "xem giúp" + "tốt chưa" = Intent B (review) → route.
→ "rồi gửi sếp" là post-action, ignore (không phải task của BA skill).

---

## 9. Anti-Patterns (KHÔNG làm)

❌ **Auto-route mà không nói rõ intent** — user mất context.
❌ **Route tới skill kia mà tự duplicate logic** — gây inconsistent.
❌ **Pretend skill chưa có đã sẵn sàng** — user dùng → fail → mất trust.
❌ **Quá conservative ask clarifying** — câu rõ rồi vẫn hỏi → annoying.
❌ **Skip workflow coach cho task lớn** — user tự navigate → fragmented.
