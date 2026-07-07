# 📚 BABOK Knowledge Base

> Tham chiếu nhanh BABOK v3 — BACCM, Agile Perspective, MoSCoW, INVEST,
> 12 techniques quan trọng nhất cho việc sinh tài liệu nghiệp vụ.

---

## 1. BACCM — Business Analysis Core Concept Model

6 core concept của BABOK v3 — mọi requirement phải nằm trong context này.

| # | Concept | Định nghĩa | Câu hỏi để extract |
|---|---|---|---|
| 1 | **Change** | Hành động chuyển đổi để đáp ứng need | "Đang thay đổi GÌ và TẠI SAO bây giờ?" |
| 2 | **Need** | Vấn đề/cơ hội cần giải quyết | "Vấn đề/cơ hội nào driving this change?" |
| 3 | **Solution** | Cách thoả mãn need | "Hình dung giải pháp ra sao?" |
| 4 | **Stakeholder** | Bên liên quan đến change/solution | "Ai sponsor? Ai duyệt? Ai dùng cuối? Ai bị ảnh hưởng?" |
| 5 | **Value** | Giá trị mang lại | "KPI mong đợi? Tăng X%? Giảm Y giờ?" |
| 6 | **Context** | Môi trường, ràng buộc | "Budget, deadline, compliance, tech stack?" |

**Quy tắc vàng:** BRD KHÔNG ĐỦ NẾU thiếu Stakeholder hoặc Value.

---

## 2. Agile Perspective (BABOK v3)

BA trong môi trường Agile khác BA Waterfall:

| Khía cạnh | Waterfall | Agile (BABOK Agile Perspective) |
|---|---|---|
| **Scope** | Lock đầu dự án | Evolve qua sprint, refine liên tục |
| **Documentation** | Comprehensive trước code | Just enough, just in time |
| **Format** | BRD/FRD đầy đủ | User Stories + AC + spike |
| **Roles** | BA, PM, Dev tách biệt | BA = Product Owner / Proxy PO |
| **Granularity** | Big requirements upfront | Epic → Feature → Story (3 cấp) |

### 3 cấp granularity Agile

```
Epic       (3-6 sprint)         → "Tính năng đăng nhập đa kênh"
  └─ Feature   (1-3 sprint)     → "Đăng nhập OAuth"
       └─ Story    (≤1 sprint)  → "Đăng nhập bằng Google"
```

### Backlog Refinement (BA's job mỗi sprint)

1. **Discover** — phát hiện need mới (khai thác stakeholder)
2. **Define** — viết story + AC
3. **Refine** — split story to fit sprint
4. **Prioritize** — MoSCoW + value/effort
5. **Validate** — INVEST check trước khi đưa vào sprint backlog

---

## 3. MoSCoW Prioritization

| Code | Mức | Ý nghĩa | Test |
|---|---|---|---|
| **M** | Must have | Không có = dự án thất bại | "Có thể launch không nếu thiếu cái này?" Không → M |
| **S** | Should have | Quan trọng, có thể trì hoãn | "Pain point lớn nếu thiếu, nhưng workaround được" |
| **C** | Could have | Nice-to-have | "Tăng UX, không bắt buộc" |
| **W** | Won't have (this time) | Out of scope iteration | "Sẽ làm sau, không phải bây giờ" |

**Quy tắc 60/40:** Tổng effort của Must ≤60% capacity sprint/release —
để dành 40% cho rủi ro + Should/Could.

---

## 4. INVEST — Tiêu chí User Story tốt

| Chữ | Tiêu chí | Câu hỏi tự kiểm |
|---|---|---|
| **I** | Independent | Story này có chạy độc lập? Không block bởi story khác? |
| **N** | Negotiable | Chi tiết có thể bàn với PO/dev? Không cứng nhắc? |
| **V** | Valuable | Có giá trị business cụ thể (đo được)? |
| **E** | Estimable | Team đo được effort (story points)? |
| **S** | Small | Vừa 1 sprint? (≤8 points an toàn) |
| **T** | Testable | Có acceptance criteria rõ → viết được test? |

**Story FAIL ≥1 tiêu chí → split hoặc rewrite.**

---

## 5. Given-When-Then (Acceptance Criteria)

Format chuẩn cho AC trong user story:

```
Given <điều kiện ban đầu / context>
When <hành động xảy ra>
Then <kết quả mong đợi>
[And <kết quả phụ>]
```

### Quy tắc viết AC tốt

- **Mỗi AC = 1 scenario** (không trộn 2 cases trong 1 AC)
- **≥3 AC/story** thường: 1 happy path + 1 alternative + 1 negative
- **Specific, measurable** — "trong ≤2 giây", "≥99% uptime", không "nhanh"
- **Independent of implementation** — viết WHAT, không viết HOW

### Ví dụ tốt vs xấu

❌ **Xấu:**
> Hệ thống đăng nhập nhanh và an toàn.

✅ **Tốt:**
> **Given** user đã đăng ký account,
> **When** nhập đúng email + password và click "Đăng nhập",
> **Then** hệ thống xác thực trong ≤2 giây và redirect về dashboard.

---

## 6. 12 Techniques BABOK quan trọng nhất (Agile-friendly)

| # | Technique | Khi nào dùng | KA |
|---|---|---|---|
| 1 | **Stakeholder Analysis** | Đầu dự án — xác định ai liên quan | Planning |
| 2 | **Brainstorming** | Phát hiện need/option | Elicitation |
| 3 | **Interview** | Khai thác requirement chi tiết | Elicitation |
| 4 | **Observation** | Hiểu workflow hiện tại | Elicitation |
| 5 | **Workshop / Focus Group** | Đồng thuận giữa nhiều stakeholder | Elicitation |
| 6 | **User Story** | Spec requirement Agile | RADD |
| 7 | **Use Case** | Spec interaction user-system | RADD |
| 8 | **Process Modeling (BPMN)** | Visualize quy trình | RADD |
| 9 | **Prototyping** | Validate UX/UI trước build | RADD |
| 10 | **MoSCoW** | Prioritize requirement | Lifecycle |
| 11 | **SWOT Analysis** | Phân tích chiến lược | Strategy |
| 12 | **Acceptance Criteria** | Định nghĩa "Done" | RADD |

---

## 7. Non-Functional Requirements (NFR) — Cho SRS

NFR là requirement về **chất lượng** hệ thống — KHÔNG phải tính năng.
Phân loại theo ISO/IEC 25010:

| Category | Ví dụ |
|---|---|
| **Performance** | Response time ≤2s, throughput ≥1000 req/s |
| **Reliability** | Uptime ≥99.9%, MTBF ≥30 ngày |
| **Security** | Mã hoá AES-256, rate limit 100req/min/user |
| **Usability** | NPS ≥8, completion rate ≥85% |
| **Maintainability** | Code coverage ≥80%, lint pass 100% |
| **Compatibility** | Hỗ trợ Chrome ≥90, iOS ≥14, Android ≥10 |
| **Portability** | Deploy được cả AWS + GCP |

**Quy tắc:** Mọi NFR phải đo lường được (có số + đơn vị).

---

## 8. Traceability Matrix

Bảng map giữa các cấp requirement → giúp impact analysis khi thay đổi.

```
| BR-ID  | FR-ID  | NFR-ID | Test Case      | Status |
|--------|--------|--------|----------------|--------|
| BR-001 | FR-012 | NFR-03 | TC-045, TC-046 | Done   |
| BR-001 | FR-013 | -      | TC-047         | Doing  |
| BR-002 | FR-020 | NFR-05 | TC-050         | Todo   |
```

**Vai trò:**
- BR thay đổi → biết FR/Test nào cần update
- Test fail → trace ngược lên BR để báo stakeholder
- Audit/compliance — chứng minh requirement đã được test

---

## 9. Definition of Ready (DoR) vs Definition of Done (DoD)

| Khái niệm | Khi nào áp dụng | Tiêu chí mẫu |
|---|---|---|
| **DoR** | Trước khi story vào sprint | INVEST 6/6, AC viết xong, dependencies xác định, points estimate xong |
| **DoD** | Trước khi story claim "Done" | Code merged, test pass, deployed staging, PO approved |

BA viết DoR → dev dùng. Cả team thống nhất DoD.

---

## 10. Quick Reference — Document Type Decision Tree

```
User cần gì?
│
├─ "WHY làm dự án" / Cấp cao / Sponsor xem
│   └─→ BRD (Business Requirements Document)
│
├─ "WHAT hệ thống làm" / Cấp giữa / Dev đọc để biết phải build gì
│   └─→ FRD (Functional Requirements Document)
│
├─ "Đầy đủ BRD + FRD + NFR" / SI/Vendor cần spec
│   └─→ SRS (Software Requirements Specification)
│
├─ Sprint planning / Agile team / Scrum
│   └─→ User Story + AC
│
└─ Detail interaction / Complex flow / Có nhiều branch
    └─→ Use Case
```

---

## Tham khảo thêm

- IIBA. *BABOK Guide v3*. International Institute of Business Analysis, 2015.
- *Agile Extension to BABOK Guide v2*. IIBA + Agile Alliance, 2017.
- Cohn, M. *User Stories Applied*. Addison-Wesley, 2004.
- ISO/IEC 25010:2011 — Systems and software Quality Requirements and Evaluation.
