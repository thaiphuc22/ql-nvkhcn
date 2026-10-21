# User Story Template — Agile/Scrum (BABOK Agile Perspective)

> Format chuẩn: INVEST + Given-When-Then Acceptance Criteria.

---

## US-`<XXX>`: `<Tiêu đề ngắn gọn — verb + object>`

### Metadata

| Field | Value |
|---|---|
| Story ID | US-`<XXX>` |
| Epic | `<Tên Epic / EP-XXX>` |
| Feature | `<Tên Feature / FE-XXX>` |
| Sprint | `<#>` |
| Priority | `<M / S / C / W>` (MoSCoW) |
| Story Points | `<1, 2, 3, 5, 8, 13>` (Fibonacci) |
| Owner / Assignee | @`<dev-name>` |
| Status | Todo / Doing / Review / Done |
| Created by | `<BA name>` |
| Created date | `<YYYY-MM-DD>` |

---

### User Story

**Là** `<persona cụ thể, không "user">`,
**tôi muốn** `<action user thực hiện>`,
**để** `<value/lợi ích đo lường được>`.

---

### Context (Why this story?)

`<2-3 câu giải thích bối cảnh + value business — gắn với BR/Epic.>`

**Source BR:** BR-`<XXX>`
**Linked KPI:** `<KPI tracker>`

---

### Acceptance Criteria

> Tối thiểu 3 AC: 1 happy path + 1 alternative + 1 negative.
> Format: Given-When-Then. Mỗi AC độc lập.

#### AC1 — `<Tên scenario: Happy path>`
- **Given** `<điều kiện ban đầu / context>`,
- **When** `<hành động xảy ra>`,
- **Then** `<kết quả mong đợi đo lường được>`,
- **And** `<kết quả phụ nếu có>`.

#### AC2 — `<Tên scenario: Alternative flow>`
- **Given** `<...>`,
- **When** `<...>`,
- **Then** `<...>`.

#### AC3 — `<Tên scenario: Negative / Error case>`
- **Given** `<...>`,
- **When** `<user thực hiện hành động không hợp lệ>`,
- **Then** `<hệ thống hiển thị error message rõ ràng>`,
- **And** `<không lưu data sai>`.

---

### INVEST Check

> BẮT BUỘC pass 6/6 trước khi đưa vào sprint.

| Tiêu chí | Pass? | Notes |
|---|---|---|
| **I**ndependent | ✅ / ❌ | `<Story này có phụ thuộc story khác không?>` |
| **N**egotiable | ✅ / ❌ | `<Chi tiết có thể bàn với PO/dev?>` |
| **V**aluable | ✅ / ❌ | `<KPI nào tracking value?>` |
| **E**stimable | ✅ / ❌ | `<Team đã estimate được points?>` |
| **S**mall | ✅ / ❌ | `<Vừa 1 sprint? ≤8 points?>` |
| **T**estable | ✅ / ❌ | `<AC đã viết rõ ràng?>` |

❗ Nếu FAIL ≥1 → split story hoặc rewrite.

---

### Definition of Ready (DoR) — Trước khi vào sprint

- [ ] INVEST 6/6 pass
- [ ] AC viết đầy đủ (≥3)
- [ ] UI mockup/wireframe ready (nếu có UI)
- [ ] API contract xác định (nếu có integration)
- [ ] Dependencies xác định
- [ ] Story points estimated
- [ ] PO approve

---

### Definition of Done (DoD) — Trước khi claim Done

- [ ] Code merged + reviewed (≥1 reviewer)
- [ ] Unit test pass + coverage ≥80% trong file mới
- [ ] Integration test pass
- [ ] E2E test pass cho mọi AC
- [ ] No new SonarQube/lint issues
- [ ] Deployed staging
- [ ] PO approve trên staging
- [ ] Tracking events configured (analytics)
- [ ] Documentation updated (API docs, user guide nếu cần)

---

### Tasks (Subtasks)

> BA viết high-level. Dev breakdown chi tiết khi planning.

- [ ] FE: Implement UI form
- [ ] FE: Add validation logic
- [ ] BE: Create API endpoint
- [ ] BE: Add unit tests
- [ ] BE: Update DB schema (nếu cần)
- [ ] QA: Write E2E test
- [ ] QA: UAT với PO

---

### Dependencies

- **Blocked by:** `<US-XXX nếu có>`
- **Blocks:** `<US-XXX nếu có>`
- **External:** `<Vendor API X cần ready>`

---

### Notes / Open Questions

- ❓ `<Câu hỏi cho PO>`
- 💡 `<Ý tưởng / consideration>`
- ⚠️ `<Risk / concern>`

---

### Mockups / Attachments

- `<Link Figma>`
- `<Link API spec>`
- `<Reference image>`
