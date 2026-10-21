# Example: Route to ba-doc-write

## Tình huống

User mới bắt đầu session với Claude — chưa rõ có biết về các skill BA hay không.
User hỏi 1 câu task generation.

## Input

```
Anh cần viết 5 user story cho Epic "Onboarding mới" trong sprint 15
sắp tới. Persona là khách hàng mới đăng ký lần đầu (chưa có purchase
history). Em hỗ trợ giúp anh với.
```

## Thought Process

### Step 1: Phân loại Intent

| Signal | Detected? | Mapping |
|---|---|---|
| Verb "viết" | ✅ | Intent A or G |
| Object "user story" | ✅ | Intent A confirmed |
| Quantity "5 stories" | ✅ | Multi-item but same skill |
| Persona cụ thể | ✅ | Context đầy đủ |
| Sprint number | ✅ | Context đầy đủ |
| Epic context | ✅ | Group context |

→ **Intent A — Sinh tài liệu** (cụ thể: User Story batch)

### Step 2: Confidence Score

```
matches_strong_keywords (viết + user story) × 0.5 = 0.50
matches_object_type (user story) × 0.3 = 0.30
context_completeness (persona + sprint + epic) × 0.2 = 0.20

Confidence = 1.00 → ✅ Route immediately
```

### Step 3: Skill Capability Check

`ba-doc-write` capabilities (từ `routing_logic.md` §6):
- ✅ Sinh User Story chuẩn INVEST + AC
- ✅ Persona cụ thể
- ✅ Multi-story session OK

→ Match. Route.

## Output

```
✅ Intent: A — Sinh tài liệu (User Story batch × 5)
🎯 Routing to: `ba-doc-write`
📋 Context:
   - Epic: Onboarding mới
   - Sprint: 15
   - Persona: Khách hàng mới đăng ký lần đầu (chưa có purchase history)
   - Quantity: 5 user stories
🚀 Triggering ba-doc-write...

[ba-doc-write takes over]

---

📝 Em sẽ tạo 5 user story cho Epic "Onboarding mới" Sprint 15.

Trước khi sinh, em cần clarify vài điểm để đảm bảo BACCM coverage:

1. **5 stories cụ thể nào em nên focus?** Em đề xuất breakdown
   theo onboarding journey:
   - US-1: Welcome screen + intro tour
   - US-2: Profile setup (name, preferences)
   - US-3: Recommendation engine first-time
   - US-4: First purchase incentive (voucher 10% chẳng hạn)
   - US-5: Push notification opt-in

   Anh OK với breakdown này, hay có scope khác?

2. **KPI/Value của Epic?** VD: tăng 1st-purchase rate từ X% → Y%?

Sau khi confirm, em sinh đầy đủ 5 stories với INVEST + 3 AC mỗi story
+ DoR/DoD + Tasks breakdown.
```

## Tại sao output như vậy?

### 1. KHÔNG tự làm việc của ba-doc-write
Orchestrator chỉ pass context + trigger. Phần "📝 Em sẽ tạo 5 user story..."
là `ba-doc-write` đang chạy, không phải orchestrator viết stories.

### 2. Pass đầy đủ context
4 thông tin (Epic, Sprint, Persona, Quantity) → ba-doc-write không cần
hỏi user lại từ đầu → tránh fragmentation.

### 3. Confidence cao → route ngay
Không hỏi clarifying khi context đã đủ. Hỏi clarifying ở step ba-doc-write
là về detail xa hơn (5 stories cụ thể nào?), không phải basic info.

### 4. Visible routing logic
User thấy "Intent: A" + "Routing to: ba-doc-write" → hiểu logic. Không
phải "magic" route.

### 5. Suggest skill follow-up sẵn
Nếu sau khi viết xong, orchestrator có thể suggest ba-doc-review:
> "Em đã viết xong 5 stories. Em chạy `ba-doc-review` self-check
> trước khi gửi PO không?"

(Đây là multi-skill coordination từ Bước 5 trong SKILL.md.)
