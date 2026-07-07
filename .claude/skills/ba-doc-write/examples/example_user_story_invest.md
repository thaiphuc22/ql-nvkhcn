# Example: Sinh User Story chuẩn INVEST (Happy Path)

## Tình huống

PM gửi yêu cầu cho BA — cần story cho feature "Đăng nhập bằng Google" của
ứng dụng e-commerce, Sprint 12.

## Input

```
Em viết user story cho feature đăng nhập Google nhé.
App e-commerce bên anh, persona là khách hàng mua hàng online,
Sprint 12. Mục tiêu giảm friction đăng ký - hiện tại 40% user bỏ
giữa chừng vì lười tạo password.
```

## Thought Process

**Step 1: Phân loại loại doc**
- Keywords: "user story" → loại = User Story
- Template: `resources/templates/user_story_template.md`

**Step 2: BACCM check**

| Concept | Có? | Value |
|---|---|---|
| Change | ✅ | Thêm OAuth Google flow |
| Need | ✅ | 40% user drop ở step register (data có sẵn) |
| Solution | ✅ | OAuth Google integration |
| Stakeholder | ✅ | Khách hàng mua hàng online |
| Value | ✅ | Giảm friction → tăng conversion (ngầm: +30% conversion là realistic) |
| Context | ⚠️ | Chưa nói tech stack — giả định web app, để dev quyết |

→ Đủ thông tin core. KHÔNG bịa Solution chi tiết — để Acceptance Criteria.

**Step 3: Sinh story theo template**

**Step 4: INVEST check**

| Tiêu chí | Pass | Lý do |
|---|---|---|
| I | ✅ | Không phụ thuộc story khác |
| N | ✅ | UI/UX có thể bàn |
| V | ✅ | KPI rõ — giảm drop rate |
| E | ✅ | OAuth integration là pattern phổ biến → dev estimate được |
| S | ✅ | 5 points → vừa sprint |
| T | ✅ | 3 AC rõ Given-When-Then |

**Step 5: Verify quality checklist**
- ✅ Format đúng "Là... tôi muốn... để..."
- ✅ Persona cụ thể ("khách hàng mua hàng online")
- ✅ ≥3 AC (1 happy + 1 alternative + 1 negative)
- ✅ Mọi AC có Given-When-Then
- ✅ Có metric đo lường (≤2s)
- ✅ Có DoD

## Output

```markdown
# US-012: Đăng nhập bằng Google OAuth

## Metadata

| Field | Value |
|---|---|
| Story ID | US-012 |
| Epic | EP-003 — Frictionless Onboarding |
| Sprint | 12 |
| Priority | Must (M) |
| Story Points | 5 |
| Owner | TBD |
| Status | Todo |
| Created by | BA |
| Created date | 2026-05-09 |

## User Story

**Là** khách hàng mua hàng online,
**tôi muốn** đăng nhập website bằng tài khoản Google,
**để** không phải nhớ thêm mật khẩu mới và mua hàng nhanh hơn.

## Context

Hiện tại 40% user bỏ giữa chừng ở step "Đăng ký" do phải tạo password mới.
Story này giảm friction bằng cách cho phép đăng nhập 1-click qua Google
OAuth — kỳ vọng tăng conversion ở funnel đăng ký lên ≥70% (từ 60%).

**Source BR:** BR-007 — Reduce signup friction
**Linked KPI:** Signup completion rate (track GA4 event `signup_complete`)

## Acceptance Criteria

### AC1 — Đăng nhập lần đầu thành công (Happy path)

- **Given** khách chưa từng đăng nhập website,
- **When** click nút "Đăng nhập với Google" và authorize trên trang Google,
- **Then** hệ thống tạo account mới với email + tên từ Google profile,
- **And** redirect về trang chủ với trạng thái đăng nhập trong ≤2 giây,
- **And** fire event GA4 `signup_complete` với property `method=google`.

### AC2 — Đăng nhập lần sau (Alternative)

- **Given** khách đã đăng nhập Google trước đó (account đã tồn tại),
- **When** click "Đăng nhập với Google",
- **Then** hệ thống nhận diện account cũ qua email và đăng nhập ngay,
- **And** KHÔNG tạo account mới (idempotent).

### AC3 — User từ chối quyền truy cập (Negative)

- **Given** khách click "Đăng nhập với Google",
- **When** từ chối quyền (deny consent) trên trang Google,
- **Then** hiển thị message: "Bạn đã hủy đăng nhập. Vui lòng thử lại hoặc đăng nhập bằng email.",
- **And** không tạo account,
- **And** không redirect (stay tại trang đăng nhập).

## INVEST Check

| Tiêu chí | Pass? | Notes |
|---|---|---|
| **I**ndependent | ✅ | Standalone feature |
| **N**egotiable | ✅ | Wording, UX có thể điều chỉnh |
| **V**aluable | ✅ | KPI: tăng conversion ≥10pp |
| **E**stimable | ✅ | 5 points (OAuth có precedent với Facebook trước đó) |
| **S**mall | ✅ | 1 sprint, ≤8 points |
| **T**estable | ✅ | 3 AC đo lường được |

## Definition of Ready

- [x] INVEST 6/6 pass
- [x] AC viết đầy đủ (3)
- [ ] UI mockup (chờ design — không block estimate)
- [ ] Google OAuth credentials configured (DevOps)
- [x] Story points estimated (5)

## Definition of Done

- [ ] Code merged + reviewed
- [ ] Unit test pass + coverage ≥80%
- [ ] E2E test pass cho 3 AC (Cypress)
- [ ] No new SonarQube issues
- [ ] Deployed staging + PO approve
- [ ] Tracking GA4 `signup_complete` configured + verified
- [ ] User docs updated (Help Center)

## Tasks

- [ ] BE: Setup Google OAuth client (credentials)
- [ ] BE: API endpoint POST /auth/google
- [ ] BE: Map Google profile → User entity (handle existing email)
- [ ] FE: Add "Đăng nhập với Google" button
- [ ] FE: Handle OAuth redirect flow
- [ ] FE: Error handling cho AC3
- [ ] QA: E2E test 3 AC
- [ ] DevOps: Configure GA4 event

## Dependencies

- **External:** Google Cloud Console — OAuth credentials (DevOps task)
- **Blocks:** US-013 (Login with Facebook — sẽ reuse pattern)

## Open Questions

- ❓ Email từ Google đã verified — có cần verify thêm không?
- ❓ Nếu user có account email + password rồi, sau đó login Google
  cùng email → merge account hay tách?

## Mockups

- TBD — design team đang làm

---

📊 **Output Summary**
✅ Story US-012 được sinh thành công
- Format: Là... tôi muốn... để... ✅
- 3 Acceptance Criteria (Given-When-Then) ✅
- INVEST: 6/6 ✅
- Quality check: 7/7 ✅

💡 Đề xuất bước tiếp:
- Em đã sinh US-012. Anh muốn em chạy `ba-doc-review` self-check không?
- Hoặc em viết tiếp US-013 (Login with Facebook) — reuse pattern?
```

## Tại sao output như vậy?

1. **Persona cụ thể** — không viết "user" chung chung mà ghi rõ "khách
   hàng mua hàng online" → giúp dev/QA test với mindset đúng.

2. **Value đo lường được** — gắn với KPI cụ thể (tăng conversion ≥10pp)
   thay vì "thuận tiện hơn" mơ hồ.

3. **3 AC đủ phổ** — happy + alternative (lần sau) + negative (deny) →
   cover 80% cases mà QA gặp.

4. **Metric trong AC** — "≤2 giây" là measurable, dev biết phải optimize.

5. **Open Questions** không phải failure — là dấu hiệu BA chuyên nghiệp,
   nêu rõ những gì chưa quyết để PO refine sau.

6. **DoR có item chưa pass** (mockup) — không block estimate, ghi rõ là
   transparency. Chỉ block khi vào sprint planning.
