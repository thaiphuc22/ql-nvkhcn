# ✅ Quality Checklist — Tài liệu nghiệp vụ chuẩn IIBA

> Chạy checklist này TRƯỚC KHI giao tài liệu cho stakeholder/dev.
> Mọi mục FAIL → tự sửa rồi check lại. KHÔNG giao doc fail check.

---

## 🌐 Universal — Áp dụng cho MỌI loại doc

- [ ] **Document control header**: version, owner, ngày, change log
- [ ] **Mọi requirement có ID** (BR-XXX / FR-XXX / NFR-XXX / US-XXX / UC-XXX)
- [ ] **Mọi requirement có Priority** (MoSCoW: M/S/C/W)
- [ ] **Không có từ mơ hồ**: "nhanh", "dễ dùng", "phù hợp", "tối ưu", "tốt", "đẹp", "ổn"
  → thay bằng số đo cụ thể (≤2s, ≥99%, ≥8 điểm NPS, ≤3 click)
- [ ] **Không có giả định ngầm** — mọi assumption viết tường minh
- [ ] **Tiếng Việt chuẩn** — không sai chính tả, ngữ pháp
- [ ] **Tên kỹ thuật giữ tiếng Anh** ("User Story", "Stakeholder", không Việt hoá)

---

## 📘 BRD (Business Requirements Document)

### Section bắt buộc

- [ ] Executive Summary (≤1 trang)
- [ ] Business Objectives (gắn KPI cụ thể)
- [ ] Stakeholders Matrix (Sponsor, BA, PO, Dev, QA, End-user)
- [ ] Scope (In-scope + Out-of-scope rõ ràng)
- [ ] Business Requirements (BR-XXX, có Priority, có Rationale)
- [ ] Constraints & Assumptions
- [ ] Risks & Mitigations
- [ ] Success Criteria (đo lường được)

### BACCM Coverage

- [ ] **Change** — viết rõ thay đổi gì
- [ ] **Need** — pain point/opportunity nào
- [ ] **Solution** — high-level (chi tiết để FRD)
- [ ] **Stakeholder** — đầy đủ trong matrix
- [ ] **Value** — KPI cụ thể (số + đơn vị + deadline)
- [ ] **Context** — constraint, compliance, budget

---

## 📗 FRD (Functional Requirements Document)

- [ ] Mỗi FR có dạng: "Hệ thống PHẢI [verb] [object] [condition]"
- [ ] FR trace được về BR (cột "Source BR" trong table)
- [ ] Mỗi FR có Acceptance Criteria (Given-When-Then hoặc rule list)
- [ ] Có sơ đồ flow cho FR phức tạp (BPMN/sequence)
- [ ] Có data model nếu FR liên quan persistence
- [ ] Có UI mockup/wireframe nếu FR có UX cụ thể

---

## 📕 SRS (Software Requirements Specification)

Bao gồm BRD + FRD + thêm:

- [ ] **Non-Functional Requirements (NFR)** — đầy đủ 7 nhóm ISO 25010
  - Performance, Reliability, Security, Usability, Maintainability,
    Compatibility, Portability
- [ ] Mỗi NFR đo lường được (số + đơn vị)
- [ ] System Architecture (high-level)
- [ ] External Interfaces (API, file format, protocol)
- [ ] Data Requirements (schema, retention, backup)
- [ ] Compliance & Legal (GDPR, PCI-DSS, ...)

---

## 📙 User Story (Agile/Scrum)

### Format check

- [ ] Format đúng: `Là <persona>, tôi muốn <action> để <value>`
- [ ] Persona CỤ THỂ ("khách hàng VIP" — không "user")
- [ ] Value đo lường được (không chỉ "để thuận tiện")

### INVEST check (BẮT BUỘC 6/6)

- [ ] **I**ndependent — không block bởi story khác
- [ ] **N**egotiable — chi tiết có thể bàn
- [ ] **V**aluable — có giá trị business
- [ ] **E**stimable — đo được effort
- [ ] **S**mall — vừa 1 sprint (≤8 points)
- [ ] **T**estable — có AC rõ ràng

### Acceptance Criteria

- [ ] ≥3 AC/story (1 happy + 1 alternative + 1 negative)
- [ ] Mỗi AC theo Given-When-Then
- [ ] Mỗi AC độc lập (không trộn 2 scenarios)
- [ ] AC viết WHAT, không viết HOW

### Metadata

- [ ] Story ID (US-XXX)
- [ ] Sprint number
- [ ] Story Points (Fibonacci: 1, 2, 3, 5, 8, 13)
- [ ] Priority (MoSCoW)
- [ ] Owner / Assignee
- [ ] Definition of Done

---

## 📒 Use Case

- [ ] Use Case ID (UC-XXX) + Tên ngắn gọn
- [ ] **Actor(s)** — primary + secondary (nếu có)
- [ ] **Goal** — 1 câu, đo lường được
- [ ] **Trigger** — sự kiện kích hoạt
- [ ] **Pre-condition** — state trước khi UC chạy
- [ ] **Post-condition (Success)** — state sau khi UC hoàn thành
- [ ] **Main Flow** — đánh số bước (1, 2, 3...), mỗi bước 1 câu
- [ ] **Alternative Flows** (A1, A2...) — nhánh phụ thành công
- [ ] **Exception Flows** (E1, E2...) — flow khi lỗi
- [ ] **Business Rules** — rule nào áp dụng cho UC này

---

## 🔗 Traceability Matrix (cho BRD/FRD/SRS)

- [ ] Có bảng matrix ở cuối doc
- [ ] Mọi BR map được tới ≥1 FR
- [ ] Mọi FR map được về 1 BR (orphan FR = scope creep)
- [ ] Có cột Test Case (kể cả "TBD" cho phase chưa test)
- [ ] Có cột Status (Todo/Doing/Done)

---

## 🚨 Red Flags — Tự động FAIL nếu phát hiện

1. **Bịa requirement** — viết requirement user chưa nói
2. **Mâu thuẫn** — 2 requirement xung đột logic
3. **Duplication** — 2 requirement nói cùng 1 việc
4. **Untestable** — không thể viết test case
5. **HOW thay vì WHAT** — viết implementation thay vì spec
6. **Missing context** — đọc xong không hiểu để làm gì
7. **No measurable success** — không đo được "Done"

---

## 📊 Self-Score

Sau khi check xong, tự chấm:

| Range | Grade | Action |
|---|---|---|
| 100% pass | 🟢 S | Giao ngay |
| 90-99% pass | 🟢 A | Giao + note các điểm chưa pass |
| 70-89% pass | 🟡 B | Sửa 1-2 round → recheck |
| 50-69% pass | 🟠 C | Refactor lớn — gặp user clarify |
| <50% pass | 🔴 D | Vứt làm lại — interview lại user |
