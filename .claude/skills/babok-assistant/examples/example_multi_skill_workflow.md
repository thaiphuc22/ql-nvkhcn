# Example: Multi-Skill Workflow Coordination (Intent G)

## Tình huống

User mô tả task lớn — đòi hỏi orchestrator coach workflow, sequence
nhiều skill, và handle inline khi skill chưa có.

## Input

```
Em vừa được giao làm BA chính cho dự án ChatBot CSKH thay thế callcenter.
Sponsor là COO, target giảm 60% volume call. Anh là BA junior, mới làm
được 6 tháng. Em hướng dẫn anh từ đầu nên làm gì để dự án không fail.
```

## Thought Process

### Step 1: Phân loại Intent

| Signal | Detected? | Mapping |
|---|---|---|
| "vừa được giao" | ✅ | New project signal |
| "BA chính" | ✅ | Lead role responsibility |
| "từ đầu nên làm gì" | ✅ | Workflow guidance ask |
| "không fail" | ✅ | Risk awareness — coach mode |
| Multi-month project scope | ✅ | Task ≥3 phase → Intent G |

→ **Intent G — Workflow lớn** (coach + sequence skills)

### Step 2: Acknowledge BA junior context

User là BA junior 6 tháng → tone phải:
- Coach (không cấp trên)
- Step-by-step (không assume kiến thức)
- Reference IIBA + workaround inline cho skill chưa có

### Step 3: Map task → BABOK KAs → Skills

Reference `ka_summary.md`:

| Phase | KA | Skill | Status |
|---|---|---|---|
| Stakeholder + Elicit | KA1+2 | `ba-elicit` | ⚠️ Roadmap → workaround |
| Strategy + Gap | KA4 | `ba-strategy` | ⚠️ Roadmap → workaround |
| Documentation | KA3+5 | `ba-doc-write` | ✅ Ready |
| Quality | KA3 | `ba-doc-review` | ✅ Ready |
| Solution Eval | KA6 | `ba-solution-eval` | ⚠️ Roadmap → workaround |

### Step 4: Compose workflow

5 phases + estimate timeline + indicate which skill ready vs roadmap.

## Output

```
🎯 Intent: G — Workflow lớn (BA chính cho dự án mới)
📚 Em coach theo BABOK Agile Perspective.

═══════════════════════════════════════════════════════════
TỔNG QUAN — 5 phases × ~3-5 tháng
═══════════════════════════════════════════════════════════

Trước tiên, em muốn anh nắm: BA chính KHÔNG có nghĩa là làm 1 mình.
Anh là **người điều phối + đảm bảo chất lượng requirement**, không phải
người quyết định mọi thứ. Quyết định business → Sponsor (COO).

Roadmap:

```
Phase 1 (2-3 tuần)  → Stakeholder mapping + Elicitation
Phase 2 (2-4 tuần)  → Strategy Analysis + Business Case
Phase 3 (4-6 tuần)  → Requirements Documentation
Phase 4 (1-2 tuần)  → Quality Assurance (review)
Phase 5 (3-12 tháng) → Solution Validation + Post-launch
```

═══════════════════════════════════════════════════════════
PHASE 1: 🎤 Stakeholder & Elicitation (2-3 tuần)
═══════════════════════════════════════════════════════════

**Mục tiêu:** Hiểu BACCM đầy đủ trước khi viết bất cứ doc nào.

**Step 1.1: Stakeholder Matrix (3 ngày)**

⚠️ Skill `ba-elicit` đang trong roadmap. Em hỗ trợ inline với template:

```markdown
| Role | Name | Influence | Interest | Engagement |
|---|---|---|---|---|
| Sponsor | COO (anh/chị X) | High | High | Weekly meeting |
| Product Owner | TBD | High | High | Daily during sprint |
| CSKH Manager | TBD | Med | High | Bi-weekly |
| IT Lead | TBD | High | Med | Sprint review |
| End-user (CSKH agents) | 5-10 reps | Low | High | Workshop tháng 1 |
| Customers (sample) | 20-30 (survey) | Low | High | Survey + 5 interviews |
| Compliance | Legal | Med | Low | Sign-off NĐ13 |
```

📋 **Action of week 1:**
1. Lên ghế họp với COO 30 phút — confirm:
   - Sponsor expectations beyond "60% volume reduction"
   - Budget range
   - Deadline expectation
   - Success criteria (KPI specific)

2. Interview 3-5 CSKH agents (current callcenter) — understand:
   - Top 10 câu hỏi lặp (FAQ candidates cho bot)
   - Pain points hiện tại
   - Kháng cự change (mất việc?)

3. Survey 20-30 customers — hỏi:
   - Có sẵn sàng dùng chatbot thay vì call?
   - Channels nào ưa thích (Zalo? FB? Web?)

**Step 1.2: Elicitation Questions (BACCM-driven)**

Em cung cấp template question đầy đủ trong `babok_knowledge.md` §1
(BACCM 6 concepts).

═══════════════════════════════════════════════════════════
PHASE 2: 📊 Strategy Analysis (2-4 tuần)
═══════════════════════════════════════════════════════════

⚠️ Skill `ba-strategy` đang trong roadmap. Workaround inline:

**Step 2.1: Current State Assessment**

```markdown
## Current State — Callcenter
- Volume: 5000 calls/day, peak 800/giờ
- Avg call duration: 8 phút
- 70% calls = FAQ
- Cost: 3 tỷ/năm
- Wait time avg: 10 phút
- NPS: 5/10 (low)
```

**Step 2.2: Future State Vision**

```markdown
## Future State — ChatBot
- Bot handle ≥70% FAQ → human handoff cho 30% complex
- Volume bot: 3500/ngày, callcenter còn 2000/ngày
- First response time: ≤30s
- Cost projection: 1.5 tỷ/năm (saving 1.5 tỷ)
- NPS target: ≥7/10
```

**Step 2.3: Gap Analysis Matrix**

```markdown
| Dimension | Current | Future | Gap | Action |
|---|---|---|---|---|
| Channel | Phone only | Phone + Zalo + FB + Web | Add 3 channels | Build chatbot |
| Tech | Cisco PBX | + ChatBot AI platform | New stack | Vendor selection |
| People | 25 agents | 12 agents + 1 bot trainer | Reskill 13 agents | Training plan |
| Data | Call recordings | + Conversation logs + ML | Knowledge base | Build FAQ DB |
```

**Step 2.4: SWOT** (template inline)

**Step 2.5: Business Case** (1-page summary)

═══════════════════════════════════════════════════════════
PHASE 3: 📝 Documentation (4-6 tuần)
═══════════════════════════════════════════════════════════

✅ Skill `ba-doc-write` ready — em sẽ trigger từng doc:

**Step 3.1: BRD (1-2 tuần)**
> Em route sang ba-doc-write khi anh ready.
> Output: BRD chuẩn IIBA với BACCM + 10 BR + MoSCoW + Stakeholder Matrix
> + Compliance section (NĐ13 cho PII customer + bot conversation logs).

**Step 3.2: FRD per module (2-3 tuần)**
> Module 1: ChatBot core (NLP + intent classification)
> Module 2: Knowledge base management
> Module 3: Channel integration (Zalo OA, FB Messenger)
> Module 4: Handoff to human agent
> Module 5: Analytics dashboard

**Step 3.3: SRS cho vendor (1 tuần)**
> Combined BRD + FRD + NFR (performance, security, scaling)

**Step 3.4: User Stories cho UAT (1 tuần)**
> ~20-30 stories cho UAT scenarios

═══════════════════════════════════════════════════════════
PHASE 4: 🔍 Quality Assurance (1-2 tuần)
═══════════════════════════════════════════════════════════

✅ Skill `ba-doc-review` ready.

**Step 4.1:** Self-review BRD/FRD/SRS trước stakeholder review
> Em route sang ba-doc-review.
> Expect Score ≥85 (Grade A) trước khi gửi.

**Step 4.2:** Stakeholder review meeting
> COO + Tech Lead + Compliance sign-off

**Step 4.3:** Apply Rewritten Reference (nếu có findings)

═══════════════════════════════════════════════════════════
PHASE 5: 🚀 Solution Validation (3-12 tháng)
═══════════════════════════════════════════════════════════

⚠️ Skill `ba-solution-eval` đang trong roadmap. Workaround inline:

**Step 5.1: UAT Planning**
- Test scenarios từ User Stories
- Acceptance criteria đo lường
- Sign-off PO

**Step 5.2: Pilot (Week 1-2 sau go-live)**
- Limit 10% traffic
- Monitor metrics realtime
- Daily standup with COO

**Step 5.3: KPI Tracking**
- Month 1: Volume reduction trend
- Month 3: NPS, cost saving actual
- Month 6: Comprehensive review
- Month 12: ROI report

**Step 5.4: Continuous Improvement**
- Bot training với conversations log mới
- Add FAQ based on top miss queries
- Quarterly business review

═══════════════════════════════════════════════════════════
🎯 BẮT ĐẦU TỪ ĐÂU?
═══════════════════════════════════════════════════════════

Em đề xuất bắt đầu **Phase 1 — Step 1.1 (Stakeholder Matrix)** ngay
trong 3 ngày tới. Cụ thể:

**Today:**
1. Đặt lịch họp 30 phút với COO trong tuần này
2. Liên hệ HR xin contact 5 CSKH agents
3. Brief nhanh với manager mảng IT

**This week:**
1. COO meeting → confirm 4 thông tin tôi đã list
2. CSKH agents interview (5 sessions × 30 phút)
3. Customer survey design

**Next week:**
1. Tổng hợp findings → present cho COO
2. Get approval to proceed Phase 2

═══════════════════════════════════════════════════════════
💡 LƯU Ý CHO BA JUNIOR
═══════════════════════════════════════════════════════════

1. **KHÔNG SKIP Phase 1-2** dù áp lực deadline. Nếu BACCM thiếu →
   doc viết ra sai → dev build sai → tốn 10× thời gian fix.

2. **Document EVERYTHING** từ tuần 1. Em có thể trigger `ba-doc-write`
   để sinh interview notes template, decision log, meeting minutes.

3. **Báo cáo Sponsor weekly** dù không yêu cầu. Tuần 1: stakeholder
   matrix. Tuần 2: elicitation findings. ...

4. **Khi unsure → ask senior BA hoặc trigger em với câu cụ thể.**
   Em luôn ready route sang skill phù hợp hoặc tư vấn inline.

═══════════════════════════════════════════════════════════

Anh muốn:
- **A)** Bắt đầu Phase 1 → em trigger workaround inline (interview templates)
- **B)** Skip thẳng đến Phase 3 vì anh đã có sẵn BACCM info → em route ba-doc-write
- **C)** Hỏi sâu hơn về 1 phase nào đó trước khi bắt đầu

Anh chọn?
```

## Tại sao output như vậy?

### 1. Acknowledge user context (BA junior 6 tháng)
Tone coach, không cấp trên. Mở đầu bằng "BA chính KHÔNG có nghĩa làm 1
mình" — giảm áp lực + set expectation.

### 2. Visible roadmap upfront
Diagram 5 phases × timeline → user thấy big picture trước khi đi sâu.
BA junior dễ overwhelm nếu không có map.

### 3. Mark rõ skill ready vs roadmap
✅ ready: ba-doc-write, ba-doc-review
⚠️ roadmap: ba-elicit, ba-strategy, ba-solution-eval
+ workaround inline ngay tại điểm cần

→ User biết skill nào sẽ được dùng, không bị surprise.

### 4. Concrete templates inline (không bịa)
Stakeholder Matrix, Gap Analysis, Current/Future State — tất cả là format
chuẩn IIBA. Tham chiếu `ka_summary.md` + `babok_knowledge.md`.

### 5. Realistic timeline estimates
Không over-promise (3-5 tháng cho dự án IT migration là hợp lý). BA
junior cần biết để set expectation với COO.

### 6. "BẮT ĐẦU TỪ ĐÂU?" actionable
Today + This week + Next week. BA junior xuất Outlook calendar được luôn.

### 7. Lưu ý đặc biệt cho junior
4 lưu ý cuối — kinh nghiệm BA senior pass cho junior, không có trong
sách giáo khoa.

### 8. 3 follow-up options
A/B/C cho user chọn next step → orchestrator stay in coach mode hoặc
hand-off sang skill.
