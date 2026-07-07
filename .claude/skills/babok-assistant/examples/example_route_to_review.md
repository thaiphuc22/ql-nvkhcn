# Example: Route to ba-doc-review (with disambiguation)

## Tình huống

User input có thể fall vào ≥2 intents — cần disambiguation rules.

## Input

```
Anh đang xem lại BRD payment gateway, em xem giúp có bị thiếu gì không
trước khi gửi vendor.
```

## Thought Process

### Step 1: Phân loại Intent — có ambiguity

| Signal | Detected? | Mapping |
|---|---|---|
| "xem lại BRD" | ✅ | Có thể A (rewrite) hoặc B (review) |
| "xem giúp" | ✅ | Lean towards B (review) |
| "có bị thiếu gì không" | ✅ | Strong B signal — gap detection |
| "trước khi gửi vendor" | ✅ | Pre-delivery check → review intent |

### Step 2: Disambiguation Rules

Apply Rule 1 (Verb dominance) từ `routing_logic.md` §3:

| Verb | Action |
|---|---|
| "xem lại" | Soft — could be either |
| "xem giúp" | Polite ask for help — review |
| "có bị thiếu gì không" | **Definitive review intent** |

→ Verb chính là **review** (gap detection). Intent **B**.

### Step 3: Confidence Score

```
matches_strong_keywords (xem giúp + có thiếu gì không) × 0.5 = 0.50
matches_object_type (BRD) × 0.3 = 0.30
context_completeness (BRD payment + pre-vendor) × 0.2 = 0.18

Confidence = 0.98 → ✅ Route immediately
```

### Step 4: Skill Capability Check

`ba-doc-review`:
- ✅ Review BRD
- ✅ Gap detection (Critical findings)
- ✅ Compliance gap (đặc biệt cho payment doc → ×2 weight)
- ✅ Rewritten Reference khi Grade ≤ B

→ Perfect match. Route.

## Output

```
✅ Intent: B — Review tài liệu (BRD pre-vendor delivery)
🎯 Routing to: `ba-doc-review`
📋 Context:
   - Doc type: BRD payment gateway
   - Trigger: Pre-vendor delivery check (high-stakes — vendor sẽ
     base quote vào doc này)
   - Focus area: Gap detection + compliance (payment domain)
   - Note: Apply compliance-heavy weight (×2) cho Critical findings
     vì doc là payment gateway
🚀 Triggering ba-doc-review...

[ba-doc-review takes over]

---

🔍 Em đã nhận BRD payment gateway. Em cần file path hoặc text paste:

A) **Paste text vào chat** — em đọc trực tiếp
B) **Đường dẫn file** — em sẽ đọc:
   - `.md` → đọc trực tiếp
   - `.docx` → chạy `scripts/doc_tool.py parse <path>`
C) **Em đã có doc trong context (từ session trước)** — confirm

Anh paste/cung cấp path nhé.

⚠️ Lưu ý đặc biệt cho doc payment:
- Em sẽ apply compliance-heavy weight (Critical = -40 thay vì -20)
- Em sẽ đặc biệt check PCI-DSS + Nghị định 13/2023
- Nếu thiếu compliance section → score sẽ thấp + warning DỪNG gửi vendor
```

## Tại sao output như vậy?

### 1. Disambiguation visible
User thấy được logic "verb dominance" → intent B. Nếu đoán nhầm,
user có thể correct ngay ("không, anh muốn rewrite chứ không review").

### 2. Compliance flag proactive
Orchestrator thấy "BRD payment" → biết domain risk → flag compliance-heavy
trước khi ba-doc-review chạy. User aware ngay từ đầu.

### 3. Pass nuanced context
Không chỉ pass "BRD payment" mà cả "pre-vendor delivery" — context này
quan trọng vì raise stakes (vendor sẽ quote dựa vào doc → quote sai =
financial loss).

### 4. Input format flexibility
Hỏi user 3 cách input (text/path/context) thay vì assume → giảm friction.

### 5. Educational note
"Apply compliance-heavy weight" — giải thích logic scoring trước khi run.
User hiểu tại sao Score có thể thấp hơn expectation cho doc payment.
