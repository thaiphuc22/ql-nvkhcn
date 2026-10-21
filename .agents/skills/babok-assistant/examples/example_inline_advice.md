# Example: Handle inline (Intent F — BABOK Knowledge Q&A)

## Tình huống

BA junior hỏi về technique BABOK ngắn — không cần route, orchestrator
trả lời inline.

## Input

```
Em không rõ khi nào nên dùng Use Case, khi nào dùng User Story?
Vì cả 2 đều mô tả flow user, sao BA có 2 cái?
```

## Thought Process

### Step 1: Phân loại Intent

| Signal | Detected? | Mapping |
|---|---|---|
| Question form "khi nào nên dùng" | ✅ | Intent F signal |
| Object "Use Case + User Story" | ✅ | BABOK terms |
| Comparison "khác gì" | ✅ | Knowledge Q&A |
| KHÔNG có verb action (viết/review) | — | Not A/B |

→ **Intent F — Tư vấn knowledge** (specifically: technique comparison)

### Step 2: KHÔNG cần route

Đây là câu hỏi knowledge — không cần ba-doc-write/review. Handle inline
với reference từ `babok_knowledge.md` §6 (12 techniques).

### Step 3: Compose answer

Pattern: comparison table + when-to-use guideline + ví dụ thực tế +
reference IIBA.

## Output

```
📚 Em handle inline (Intent F — Knowledge):

## User Story vs Use Case — Khác biệt cơ bản

| | **User Story** | **Use Case** |
|---|---|---|
| **Format** | "Là... tôi muốn... để..." + AC | Main/Alt/Exception flows |
| **Granularity** | Coarse (1 outcome) | Fine (step-by-step interaction) |
| **Length** | Ngắn (~100-200 từ) | Dài (~300-1000 từ) |
| **Audience** | Dev, QA, PO trong sprint | Dev, QA + Architect, đôi khi BA cấp cao |
| **Methodology** | Agile/Scrum primary | Both Agile + Waterfall |
| **Focus** | "WHAT" outcome cho user | "HOW" user-system interact step-by-step |
| **AC** | Given-When-Then (3-5 scenarios) | Pre/Post-condition + flows |
| **Reusability** | 1 story = 1 sprint | 1 UC có thể span nhiều sprint |

## Khi nào dùng cái nào?

### ✅ Dùng **User Story** khi:
- Sprint planning Agile/Scrum
- Feature đơn giản, 1 outcome rõ ràng
- Team đã quen Given-When-Then
- Cần velocity tracking (story points)
- VD: "Apply mã giảm giá", "Login Google", "Filter theo giá"

### ✅ Dùng **Use Case** khi:
- Flow phức tạp với nhiều branch (≥3 alternative + exception)
- Cần spec rõ pre/post-condition
- Multi-actor interaction (user + system + 3rd party)
- Cần document interaction để training/onboarding
- Compliance audit (VD: payment flow, KYC flow)
- VD: "Checkout flow với 3 payment methods", "KYC verification end-to-end"

## Có thể dùng CẢ 2 không?

**CÓ** — và thường nên kết hợp cho feature lớn:

```
Epic: Checkout System
├─ Use Case UC-001: Checkout Flow End-to-End (high-level interaction)
│   ↓ derive
├─ User Story US-024: Apply mã giảm giá
├─ User Story US-025: Chọn payment method
├─ User Story US-026: Confirm order
└─ User Story US-027: Receive confirmation email
```

Use Case = "big picture" của feature.
User Story = "actionable units" trong sprint.

## Ví dụ thực tế

**Tình huống của em**: Đang làm e-commerce checkout.

❌ **Anti-pattern**: Viết 1 user story duy nhất:
> "Là khách, tôi muốn checkout để mua hàng"

→ Quá broad, không INVEST (S — Small fail), không testable.

✅ **Right approach**:
1. Viết Use Case UC-005 mô tả TOÀN BỘ checkout flow (10 steps + 3 alt + 4 exception)
2. Derive ra 4-5 user stories mỗi cái 1 sprint:
   - US-024: Cart review screen
   - US-025: Address selection
   - US-026: Payment method selection
   - US-027: Order confirmation

## Khi BA nào nên có cả 2 trong toolkit?

- **BA junior:** Tập trung User Story trước (90% Agile shop dùng)
- **BA mid:** Add Use Case cho feature complex (multi-actor, compliance)
- **BA senior:** Master cả 2 + biết khi nào skip cái nào (đôi khi
  Process Modeling BPMN còn tốt hơn cả 2)

📚 **Reference:**
- BABOK v3 §10.45 (User Story technique)
- BABOK v3 §10.47 (Use Cases and Scenarios technique)
- File: `resources/babok_knowledge.md` §6

---

💡 Em có thể trigger `ba-doc-write` để demo:
- Sinh Use Case mẫu cho checkout
- Hoặc sinh User Story mẫu cho 1 step trong checkout

Anh muốn em demo không?
```

## Tại sao output như vậy?

### 1. Comparison table trước
BA junior so sánh visual nhanh — khác biệt 8 dimensions trong 1 bảng.
Hiệu quả hơn 200 từ giải thích.

### 2. When-to-use checklist
Không chỉ định nghĩa mà còn **decision rule**: 5 case nên dùng A, 5 case
nên dùng B → BA biết apply ngay vào dự án thực.

### 3. "Có thể dùng cả 2 không?" — proactive answer
Câu hỏi BA junior thường có nhưng không hỏi → trả lời sẵn với cấu trúc
Epic → UC → Stories.

### 4. Ví dụ thực tế từ context user
"Em đang làm e-commerce checkout" — orchestrator dùng context của user
(không bịa) để show concrete example với anti-pattern + right approach.

### 5. Tier theo BA seniority
Acknowledge BA junior khác BA senior — không quá tải junior với toàn
bộ BABOK techniques.

### 6. Reference IIBA section
"BABOK v3 §10.45" + "babok_knowledge.md §6" → BA muốn đào sâu có direction.

### 7. Suggest follow-up tới skill
Cuối cùng đề xuất `ba-doc-write` demo — chuyển từ Q&A → action.
