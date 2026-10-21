# Example: Edge Case — Thiếu thông tin BACCM

## Tình huống

User yêu cầu sinh BRD nhưng cung cấp quá ít thông tin. Đây là edge case
phổ biến — BA mới hay bịa thay vì hỏi lại.

## Input

```
Viết BRD cho dự án mới bên anh.
```

## Thought Process

**Step 1: Phân loại loại doc** ✅ — User nói "BRD" → loại = BRD.

**Step 2: BACCM check** — đây là điểm quyết định:

| Concept | Có? | Notes |
|---|---|---|
| Change | ❌ | Không biết dự án thay đổi gì |
| Need | ❌ | Không biết pain point |
| Solution | ❌ | Không biết hình dung gì |
| Stakeholder | ❌ | Không biết ai liên quan |
| Value | ❌ | Không biết KPI |
| Context | ❌ | Không biết constraint |

→ **0/6 BACCM concepts** → KHÔNG sinh BRD. Apply Constraint:
> "🚫 KHÔNG ĐƯỢC bịa requirement mà user chưa cung cấp"

**Step 3: Quyết định** — DỪNG, hỏi user theo BACCM framework.

**Pattern dùng**: Yes/No Narrowing + Concrete Example (từ
`resources/interview_questions.md`) — biến câu hỏi mở "anh có thông tin gì?"
thành câu hỏi cấu trúc theo 6 BACCM, dễ trả lời hơn.

## Output

```
⚠️ Em cần thêm thông tin trước khi sinh BRD chuẩn IIBA.

Theo nguyên tắc BACCM (BABOK Core Concept Model), BRD đầy đủ phải có
6 mảng thông tin. Em hỏi anh từng mảng nhé:

═══════════════════════════════════════════════════════════
📌 1. CHANGE — Dự án thay đổi gì?
═══════════════════════════════════════════════════════════
- ◯ Quy trình hiện tại đang đổi (VD: chấm công giấy → app)
- ◯ Sản phẩm mới (chưa từng có)
- ◯ Migration (đổi tech: SAP → Salesforce)
- ◯ Tích hợp (kết nối 2 hệ thống đang có)
→ Loại nào ạ?

═══════════════════════════════════════════════════════════
📌 2. NEED — Vấn đề/cơ hội nào driving dự án?
═══════════════════════════════════════════════════════════
Pain point hiện tại có thể đo lường? VD:
- "HR tốn 40h/tháng tổng hợp lương"
- "Conversion rate đang chỉ 2%, đối thủ 5%"
- "Khách hàng phàn nàn 50 ticket/tuần"
→ Pain point cụ thể là gì?

═══════════════════════════════════════════════════════════
📌 3. STAKEHOLDER — Ai liên quan?
═══════════════════════════════════════════════════════════
Em cần ít nhất:
- Sponsor (ai funding + duyệt cuối)?
- Product Owner (ai prioritize backlog)?
- End-user (ai dùng cuối — persona cụ thể)?
- Tech Lead (ai chịu trách nhiệm technical)?

═══════════════════════════════════════════════════════════
📌 4. VALUE — KPI mong đợi?
═══════════════════════════════════════════════════════════
KPI phải đo lường được, có deadline. VD:
- Tăng conversion từ 2% → 5% trong Q4 2026
- Giảm chi phí hosting 30% trong 6 tháng
- Tăng NPS từ 6 → 8 trong 1 năm
→ KPI cụ thể của anh?

═══════════════════════════════════════════════════════════
📌 5. CONTEXT — Constraint?
═══════════════════════════════════════════════════════════
- 💰 Budget: ≤ bao nhiêu?
- ⏰ Deadline: cần go-live khi nào?
- 🔒 Compliance: có quy định nào (GDPR, Nghị định 13)?
- 🛠 Tech: phải dùng/tránh stack nào?

═══════════════════════════════════════════════════════════
📌 6. SOLUTION — Hình dung giải pháp (high-level)?
═══════════════════════════════════════════════════════════
Anh có thể bỏ qua mảng này — BRD focus vào WHY, không phải HOW.
Em sẽ tự đề xuất sau khi nắm rõ 5 mảng trên.

═══════════════════════════════════════════════════════════

💡 Gợi ý: Nếu anh không quen với cấu trúc này, anh chỉ cần kể
em nghe "câu chuyện dự án" — em sẽ tự trích xuất 6 mảng. Ví dụ:

> "Bên anh có 500 nhân viên, hiện chấm công bằng máy vân tay, HR
> tốn ~40h/tháng tổng hợp data, lỗi ~5%. CFO muốn giảm xuống 8h
> và <0.5% lỗi trước Q4 2026, budget 800M, phải tích hợp SAP HR
> hiện có và tuân thủ Nghị định 13."

→ Câu trên đủ 6/6 BACCM, em sinh BRD chuẩn ngay.

Anh chia sẻ giúp em theo cách nào tiện nhất?
```

## Tại sao output như vậy?

### 1. KHÔNG bịa requirement
Đây là constraint hard. BA mới thường mắc lỗi: thấy user mơ hồ là tự
"đoán" requirement → kết quả là BRD viễn vông, stakeholder reject hoặc
tệ hơn — dev build sai sản phẩm.

### 2. Hỏi theo cấu trúc BACCM
Thay vì hỏi mở "anh kể em nghe" (user dễ lạc đề), hỏi theo 6 buckets có
sẵn → user dễ trả lời, BA đảm bảo không miss thông tin.

### 3. Có ví dụ cụ thể trong câu hỏi
Mỗi BACCM concept có ví dụ → user hiểu format mong đợi:
- Change: liệt kê 4 loại (multiple choice dễ chọn)
- Need: ví dụ data có số
- Value: ví dụ KPI có deadline

### 4. Cho user lối thoát "kể chuyện"
Cuối output có ví dụ "câu chuyện dự án" — nếu user không quen framework,
chỉ cần kể tự nhiên. BA sẽ tự extract.

→ Áp dụng kỹ thuật **Show & Tell** từ Phase 1 interview.

### 5. KHÔNG bỏ cuộc
Output là interactive — kết thúc bằng câu hỏi để user trả lời tiếp.
KHÔNG phải lỗi "thiếu data, không làm được" mà là collaboration step.

### 6. Tone chuyên nghiệp nhưng thân thiện
Dùng "Em" — phong cách tiếng Việt văn phòng, không quá formal.

---

## Khi nào dùng pattern này?

Áp dụng khi user input thiếu **≥3/6 BACCM concepts**:

| Concepts có | Action |
|---|---|
| 6/6 | Sinh BRD ngay |
| 4-5/6 | Hỏi clarification cho mảng thiếu (1 message ngắn) |
| 1-3/6 | DỪNG — interview đầy đủ như example này |
| 0/6 | DỪNG — interview như example này |

Loại doc khác (User Story, Use Case) có rule riêng — xem
`resources/quality_checklist.md`.
