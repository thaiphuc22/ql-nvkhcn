# Example: Review User Story fail INVEST + AC issues

## Tình huống

BA junior gửi user story cho BA senior review trước daily standup.
Story đã commit vào sprint planning, nhưng senior thấy có nhiều issues.

## Input

```
US-005: Đăng nhập

Là user, tôi muốn đăng nhập để dùng app.

AC:
- User nhập username password
- System cho login
- Nếu sai → báo lỗi

Priority: Cao
Points: 13
```

## Thought Process

**Step 1: Phân loại** — Format "Là... tôi muốn... để..." → User Story

**Step 2: Chạy 7 nhóm check theo `review_checklists.md` §E**

### Universal checks
- ❌ A1 — Không có Story ID format chuẩn (`US-005` là OK), thiếu Sprint, Owner
- ❌ A3 — Ambiguity scan: KHÔNG có từ trong dictionary (story quá ngắn)

### E1. Format
- ✅ Format đúng "Là... tôi muốn... để..."
- ❌ Persona "user" — generic → **Minor (F005)**
- ❌ Value "để dùng app" — không đo được → **Major (F002)**

### E2. INVEST (BẮT BUỘC 6/6)
- ✅ I — Independent (không depend story khác)
- ✅ N — Negotiable
- ❌ **V — Valuable**: "để dùng app" mơ hồ, không có KPI → **Major (F002)**
- ✅ E — Estimable (có 13 points)
- ❌ **S — Small**: 13 points > 8 → quá lớn → **Major (F003)**
- ❌ **T — Testable**: AC bullet rời rạc, không Given-When-Then → **Major (F004)**

INVEST: 3/6 fail → Critical risk story không deliver được

### E3. Acceptance Criteria
- ❌ 0/3 AC theo Given-When-Then → **Critical (F001)**
- ❌ AC không cover negative case (chỉ "báo lỗi" mơ hồ)
- ❌ AC không có metric (timeout? lockout policy?)

### E4. Metadata
- ✅ Story ID
- ❌ Thiếu Sprint
- ✅ Story Points
- ❌ Priority "Cao" — không phải MoSCoW format → **Minor (F006)**
- ❌ Thiếu Owner
- ❌ Thiếu Status

### E5. DoR/DoD
- ❌ Không có DoR
- ❌ Không có DoD → **Major (F007)**

### E6. Dependencies
- ⚠️ Không khai báo (có thể OK nếu thật sự không có)

### E7. Tasks
- ❌ Không có task breakdown → **Minor (F008)**

**Step 3: Score**
- Critical: 1 (F001)
- Major: 4 (F002, F003, F004, F007)
- Minor: 3 (F005, F006, F008)

```
Score = 100 - 1×20 - 4×5 - 3×1 = 57 → Grade C (Refactor lớn)
```

**Step 4: Verify**
- ✅ Mọi finding có vị trí
- ✅ Mọi finding có suggested fix
- ✅ Severity đúng rubric
- ✅ Score đúng formula

## Output (Format A — Markdown Report)

```markdown
# Review Report — US-005

**Reviewed:** 2026-05-09
**Reviewer:** ba-doc-review v1.0
**Doc type:** User Story
**Total Score:** 57/100 — Grade 🟠 C (Refactor lớn)

## Summary
- 🔴 Critical: 1
- 🟠 Major: 4
- 🟡 Minor: 3
- ℹ️ Info: 0

⚠️ **Khuyến nghị mạnh:** Story này KHÔNG nên đưa vào sprint planning
trước khi fix Critical (F001) và split (F003).

## Findings

### 🔴 CRITICAL

#### F001 — Acceptance Criteria không theo Given-When-Then
- **Section:** AC list
- **Severity:** 🔴 Critical
- **Issue:** 3 AC viết bullet rời rạc, không phải scenario format. Dev/QA
  không biết test cái gì cụ thể: "system cho login" — login thành công
  thế nào? Redirect đi đâu? Timeout bao lâu? Lockout policy?
- **Why critical:** Story KHÔNG testable = vô nghĩa cho sprint.
  Vi phạm INVEST tiêu chí T (Testable) — fail Definition of Ready.
- **Suggested fix:**
  ```
  AC1 — Đăng nhập đúng credentials (Happy):
  - Given user đã có account active,
  - When nhập đúng email + password và click "Đăng nhập",
  - Then redirect về dashboard trong ≤2 giây,
  - And session cookie được set với expiry 7 ngày.

  AC2 — Sai mật khẩu (Negative):
  - Given user nhập email tồn tại trong DB,
  - When nhập sai password 1-4 lần,
  - Then hiển thị "Email hoặc mật khẩu không đúng",
  - And không tiết lộ "email không tồn tại" (security best practice).

  AC3 — Lock account sau 5 lần fail:
  - Given user đã sai password 4 lần liên tiếp,
  - When sai lần thứ 5,
  - Then lock account 15 phút,
  - And gửi email cảnh báo có IP login,
  - And user sẽ unlock tự động hoặc click link "Reset password".
  ```
- **Reference:** review_checklists.md §E3, babok_knowledge.md §5

### 🟠 MAJOR

#### F002 — INVEST: Valuable mơ hồ
- **Section:** "để dùng app"
- **Severity:** 🟠 Major
- **Issue:** "để dùng app" không phải value đo được. Mọi user story đều
  "để dùng app" — vô nghĩa.
- **Why Major:** Story không gắn KPI = không track được ROI sau go-live.
- **Suggested fix:**
  > "...để truy cập tính năng cá nhân hoá (saved cart, order history,
  > recommendations) và mua hàng nhanh hơn."
  >
  > KPI gắn với story: tăng 7-day retention từ baseline 30% → ≥45%
  > sau go-live (track Mixpanel/GA4 cohort).
- **Reference:** review_checklists.md §E1, babok_knowledge.md §5 (BACCM Value)

#### F003 — INVEST: Small fail (13 points cho 1 sprint)
- **Section:** "Points: 13"
- **Severity:** 🟠 Major
- **Issue:** 13 story points = ≥1 sprint full-time của 1 dev senior.
  Risk: không done trong sprint, carry over, ảnh hưởng velocity.
- **Why Major:** Vi phạm INVEST "Small" — story quá lớn = rủi ro cao
  + khó estimate chính xác.
- **Suggested fix:** Split story:
  - **US-005a** (5pt): Đăng nhập email/password — chỉ AC1 + AC2
  - **US-005b** (3pt): Lockout policy — AC3
  - **US-005c** (5pt): Forgot password flow (đã có wireframe)
  Tổng 13pt nhưng deliver theo từng story → giảm risk + dễ track.
- **Reference:** review_checklists.md §E2

#### F004 — INVEST: Testable fail
- **Section:** AC list
- **Severity:** 🟠 Major
- **Issue:** AC quá vague để viết test case (ref F001).
- **Suggested fix:** Apply F001 fix → AC sẽ testable.
- **Reference:** Connected with F001

#### F007 — Thiếu Definition of Done
- **Section:** Toàn story
- **Severity:** 🟠 Major
- **Issue:** Không có DoD → team không biết khi nào story "Done".
- **Why Major:** Story không có DoD = handoff dev/QA dễ tranh cãi.
- **Suggested fix:** Thêm DoD checklist:
  ```markdown
  ## Definition of Done
  - [ ] Code merged + reviewed (≥1 reviewer)
  - [ ] Unit test pass + coverage ≥80% trong file mới
  - [ ] E2E test pass cho 3 AC (Cypress)
  - [ ] No new SonarQube/lint issues
  - [ ] Deployed staging
  - [ ] PO approve trên staging
  - [ ] Tracking events configured (login_success, login_failed, lockout)
  ```
- **Reference:** review_checklists.md §E5

### 🟡 MINOR

#### F005 — Persona generic ("user")
- **Section:** "Là user"
- **Severity:** 🟡 Minor
- **Issue:** "user" generic, không cụ thể persona.
- **Suggested fix:** "Là khách hàng đã đăng ký account trên website".
  Persona cụ thể giúp dev/QA test với mindset đúng (VD: khách VIP có flow
  khác guest user).
- **Reference:** review_checklists.md §E1

#### F006 — Priority format không chuẩn MoSCoW
- **Section:** "Priority: Cao"
- **Severity:** 🟡 Minor
- **Issue:** "Cao" thay vì M/S/C/W. Không nhất quán với team convention.
- **Suggested fix:** Đổi thành "Must (M)" — login là core feature,
  không có = không launch được = đúng Must.
- **Reference:** babok_knowledge.md §3 MoSCoW

#### F008 — Thiếu task breakdown
- **Section:** Toàn story
- **Severity:** 🟡 Minor
- **Issue:** Không có high-level tasks (FE/BE/QA).
- **Why Minor:** Tasks có thể fill ở sprint planning, nhưng có sẵn
  giúp PO estimate effort tốt hơn.
- **Suggested fix:** Thêm:
  ```markdown
  ## Tasks
  - [ ] BE: API POST /auth/login (email + password)
  - [ ] BE: Add rate limiting (5 attempts/15min)
  - [ ] BE: Lockout logic + email notification
  - [ ] FE: Login form UI + validation
  - [ ] FE: Error states (4 cases)
  - [ ] FE: Redirect after success
  - [ ] QA: E2E test 3 AC
  - [ ] QA: Security test (brute force)
  - [ ] DevOps: Configure analytics events
  ```

## Strengths
*(Liệt kê khi user yêu cầu — skip ở review default)*

## 🛠 Rewritten Reference (Grade C → auto-include)

> **Đây là REFERENCE để BA tham chiếu khi sửa.** KHÔNG phải fix tự động.
> Em đã apply mọi suggested fix từ findings + áp template chuẩn IIBA.
> BA cần verify các phần `[ASSUME]` với PO trước khi commit.

### Diff với original

| Field | Original | Rewritten | Finding |
|---|---|---|---|
| Story ID | "US-005: Đăng nhập" | "US-005a: Đăng nhập email/password" (split) | F003 |
| Persona | "user" | "khách hàng đã đăng ký account" | F005 |
| Value | "để dùng app" | "...truy cập tính năng cá nhân hoá... [KPI:retention]" | F002 |
| AC format | 3 bullet rời rạc | 3 AC theo Given-When-Then | F001 |
| Priority | "Cao" | "Must (M)" | F006 |
| Points | 13 | 5 (split thành US-005a/b/c) | F003 |
| DoD | (missing) | DoD checklist 7 items | F007 |
| Tasks | (missing) | FE/BE/QA breakdown | F008 |

### Full Rewritten Story (US-005a — sau split)

```markdown
## US-005a: Đăng nhập email/password

| Field | Value |
|---|---|
| Story ID | US-005a |
| Epic | EP-001 — Authentication |
| Sprint | <TBD> |
| Priority | Must (M) |
| Story Points | 5 |
| Owner | <TBD> |
| Status | Todo |

### User Story
**Là** khách hàng đã đăng ký account,
**tôi muốn** đăng nhập bằng email + password,
**để** truy cập tính năng cá nhân hoá (saved cart, order history, recommendations)
   và mua hàng nhanh hơn.

### Context
[ASSUME: Cần verify với PO]
- Hiện tại login flow chưa có hoặc đang lỗi
- Expected KPI: tăng 7-day retention từ baseline [ASSUME: 30%] → ≥45%
- Track event: `login_success` qua GA4 hoặc Mixpanel

**Source BR:** [ASSUME: BR-001 — User Authentication]

### Acceptance Criteria

#### AC1 — Đăng nhập đúng credentials (Happy)
- **Given** user đã có account active trong DB,
- **When** nhập đúng email + password và click "Đăng nhập",
- **Then** redirect về dashboard trong ≤2 giây,
- **And** session cookie được set với expiry 7 ngày,
- **And** event `login_success` fire với `method=email`.

#### AC2 — Sai mật khẩu (Negative — < 5 lần)
- **Given** user nhập email tồn tại trong DB,
- **When** nhập sai password 1-4 lần liên tiếp,
- **Then** hiển thị message: "Email hoặc mật khẩu không đúng",
- **And** KHÔNG tiết lộ "email không tồn tại" (security best practice — OWASP),
- **And** counter sai password tăng +1 cho session đó.

#### AC3 — Email không tồn tại (Negative)
- **Given** user nhập email chưa từng đăng ký,
- **When** click "Đăng nhập",
- **Then** hiển thị message GIỐNG AC2 ("Email hoặc mật khẩu không đúng"),
- **And** KHÔNG return error riêng "email không tồn tại" (anti-enumeration).

### INVEST Check
- ✅ I — Independent (split khỏi US-005, tách lockout policy)
- ✅ N — Negotiable
- ✅ V — Valuable (KPI retention measurable)
- ✅ E — Estimable (5 points, pattern phổ biến)
- ✅ S — Small (1 sprint)
- ✅ T — Testable (3 AC clear Given-When-Then)

### Definition of Ready
- [x] INVEST 6/6 pass
- [ ] AC viết đầy đủ (3) — DONE in this rewrite
- [ ] UI mockup ready (Figma link cần PO bổ sung)
- [ ] API contract xác định (POST /auth/login)
- [ ] Story points estimated (5)
- [ ] PO approve

### Definition of Done
- [ ] Code merged + reviewed (≥1 reviewer)
- [ ] Unit test pass + coverage ≥80%
- [ ] Integration test (auth service)
- [ ] E2E test pass cho 3 AC (Cypress)
- [ ] No new SonarQube/lint issues
- [ ] Deployed staging
- [ ] PO approve trên staging
- [ ] Tracking events configured (`login_success`, `login_failed`)

### Tasks
- [ ] BE: API POST /auth/login (email + password validation)
- [ ] BE: Anti-enumeration response logic (AC2 + AC3 same message)
- [ ] BE: Unit tests (5 edge cases)
- [ ] FE: Login form UI + client-side validation
- [ ] FE: Error states (3 negative cases)
- [ ] FE: Redirect logic after success
- [ ] QA: E2E test 3 AC (Cypress)
- [ ] QA: Security test (anti-enumeration verification)
- [ ] DevOps: Configure GA4 events

### Dependencies
- [ASSUME] **External:** Auth service (existing JWT or new) — verify với Tech Lead
- **Blocks:** US-005b (Lockout policy), US-005c (Forgot password)
```

### Plus 2 stories sau split (skeleton — BA tự fill):

#### US-005b: Lockout policy after 5 failed attempts (3pt)
> Cover AC4 trong story gốc. Independent từ US-005a vì có thể release sau.

#### US-005c: Forgot password flow (5pt)
> Email reset link, secure token, expiry 1h. Cần wireframe từ design.

### Manual customization needed

Sau khi copy reference, BA cần:
- [ ] Verify `[ASSUME: 30%]` baseline retention với data team
- [ ] Confirm Source BR ID với product backlog
- [ ] Replace `<TBD>` Sprint number + Owner
- [ ] Verify auth service (existing/new) với Tech Lead
- [ ] Get Figma mockup link từ design team
- [ ] Confirm anti-enumeration policy với security team

## Next Steps

1. **🔴 Fix Critical (F001)** TRƯỚC tiên — rewrite 3 AC theo Given-When-Then.
   Đây là blocker cho sprint planning.

2. **🟠 Split story (F003)** — chia US-005 thành 3 stories nhỏ hơn:
   - US-005a (5pt): Email/password login
   - US-005b (3pt): Lockout
   - US-005c (5pt): Forgot password

3. **🟠 Bổ sung Value KPI (F002)** + DoD (F007)

4. **🟡 Polish Minor** (F005, F006, F008) — có thể fix song song với #1-3

5. **Re-run** `ba-doc-review` sau khi fix → expect Score ≥85 (Grade A)

💡 Sau khi fix Critical + Major, có thể gọi `ba-doc-write` để rewrite
   từng story theo template chuẩn — nhanh hơn fix manual.
```

## Output (Format B — Inline Annotated)

Nếu user yêu cầu:
```bash
python scripts/doc_tool.py annotate us-005.md findings.json -o us-005.annotated.md
```

Sinh file `us-005.annotated.md`:

```markdown
<!-- Annotated by ba-doc-review v1.0
     Score: 57/100 — Grade C
     🔴 Critical: 1 | 🟠 Major: 4 | 🟡 Minor: 3 | ℹ️ Info: 0
-->

US-005: Đăng nhập

Là user, tôi muốn đăng nhập để dùng app.
<!-- 🟡 MINOR F005: Persona generic
     SUGGESTED FIX: "Là khách hàng đã đăng ký account" -->
<!-- 🟠 MAJOR F002: Value mơ hồ
     SUGGESTED FIX: "...để truy cập tính năng cá nhân hoá..." + KPI -->

AC:
- User nhập username password
- System cho login
- Nếu sai → báo lỗi
<!-- 🔴 CRITICAL F001: AC không theo Given-When-Then
     SUGGESTED FIX: Rewrite theo format Given-When-Then với 3 scenarios -->

Priority: Cao
<!-- 🟡 MINOR F006: Priority format không chuẩn MoSCoW
     SUGGESTED FIX: Đổi thành "Must (M)" -->

Points: 13
<!-- 🟠 MAJOR F003: 13 points quá lớn cho 1 sprint
     SUGGESTED FIX: Split thành US-005a/b/c (5+3+5) -->
```

## Tại sao output như vậy?

1. **Critical đứng đầu, Minor cuối** — BA reviewer có 5 phút thì xem
   Critical trước. Rank theo severity giúp scan nhanh.

2. **Mọi finding có concrete suggested fix** — không "cần xem lại" mơ hồ.
   BA junior copy-paste vào fix luôn được.

3. **F003 split story rất chi tiết** — không chỉ "split" mà nêu rõ 3
   stories với points. BA junior hiểu logic split (theo functionality).

4. **F002 nêu cả KPI cụ thể** — không chỉ chê "value mơ hồ" mà cho example
   "tăng 7-day retention 30% → 45%" — thực tế và đo được.

5. **F005 (Minor) vẫn có rationale** — giải thích tại sao persona cụ thể
   matter (test mindset) → review value education, không chỉ checklist tick.

6. **Next Steps có thứ tự** — Critical → Split → Major → Minor → Re-run.
   BA biết roadmap fix.

7. **Đề xuất `ba-doc-write`** — cross-skill suggestion → ecosystem chứ
   không tự cô lập.
