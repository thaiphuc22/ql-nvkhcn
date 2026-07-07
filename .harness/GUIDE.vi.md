# Hướng dẫn Harness — Đọc đầu tiên

> 🌐 English version: [`GUIDE.md`](GUIDE.md)

Mới biết tới kit này? Bắt đầu ở đây. Tài liệu này giải thích **toàn bộ hệ thống vận hành
ra sao và nên bắt đầu từ đâu** — là mô hình tư duy, không phải tài liệu tra cứu từng file.
Khi đã "thông", các tài liệu khác (chính xác nhưng giả định bạn đã hiểu hệ thống) sẽ trở
nên dễ đọc.

> **Tài liệu này kể chuyện, không đặt luật.** Chỗ nào có luật chính thức ở file khác, tài
> liệu này *liên kết* tới đó thay vì chép lại. Nếu hướng dẫn này và file được liên kết mâu
> thuẫn, **file được liên kết thắng**.

Các ví dụ bên dưới là **trung lập và mang tính minh hoạ** (`F-01 Item CRUD`, `Export`, …) để
hợp với mọi lĩnh vực. Hãy thay bằng tính năng sản phẩm của bạn.

---

## 1. Mô hình tư duy trong một hình

Kit chạy theo **hai tầng**, với một giai đoạn nền móng ở giữa:

```
┌─ TẦNG 1: PM / PO — "XÂY CÁI GÌ?"  (thượng nguồn, trước harness) ──────────┐
│   strategy → discovery → prioritization → roadmap → PRD                    │
│   Kết quả: backlog tính năng đã xếp ưu tiên + các PRD                       │
└───────────────────────────────┬───────────────────────────────────────────┘
                                 │ nuôi
                                 ▼
        FOUNDATIONS — nền móng chung mà mọi tính năng phụ thuộc
        (F0 sẵn-sàng workspace/agent → scaffold → schema → phân quyền
         → engine nghiệp vụ lõi → auth/vỏ app)
                                 │ khi COMPLETE, mở khóa
                                 ▼
┌─ TẦNG 2: DELIVERY — "XÂY NHƯ THẾ NÀO?"  (vòng 7 phase, mỗi tính năng) ─────┐
│   Requirements → Architecture → Test Plan → Build → E2E → Review → Done    │
└────────────────────────────────────────────────────────────────────────────┘
```

Ba điều cần khắc cốt:

1. **PM/PO không phải một phase của harness — nó là cửa vào.** Quyết định *xây gì* diễn ra ở
   Tầng 1 và tạo ra đầu vào cho Phase 1 của Tầng 2. Xem mục "Upstream vs in-loop" trong
   [`rules/harness-skill-boundary.md`](rules/harness-skill-boundary.md).
2. **Foundations đứng trước mọi tính năng.** Không công việc Tầng 2 nào bắt đầu cho tới khi
   mọi foundation COMPLETE. Đây là luật kit không bao giờ nới (kể cả ở chế độ Lite). Đặc tả
   đầy đủ: [`workflows/foundations.md`](workflows/foundations.md).
3. **State là trí nhớ giữa các session.** Mọi thứ agent cần để làm tiếp nằm trong ba file nhỏ
   dưới [`state/`](state/) — phần kế tiếp mô tả.

### Ai làm gì

| Bạn (con người) | Claude (đội agent ảo) |
|---|---|
| Chủ sản phẩm + **người phê duyệt** ở các cổng | Phân tích, thiết kế, code, test, review |
| Quyết định *xây gì* và *có chấp nhận không* | Quyết định *xây như thế nào* |
| Trả lời các cổng phê duyệt | Đọc/ghi file state, theo các phase |

Bạn chủ yếu nói chuyện bằng ngôn ngữ tự nhiên và phê duyệt đúng thời điểm. Phần cơ khí
(state, phase) là việc của Claude.

---

## 2. Ba file trạng thái "sống" thế nào

Các file state là **bộ não ngoài** của Claude — ghi xuống đĩa để không mất gì khi session kết
thúc. Mỗi file trả lời đúng một câu hỏi:

| File | Trả lời | Ai ghi | Ví như… |
|---|---|---|---|
| [`state/DELIVERY_STATE.md`](state/DELIVERY_STATE.md) | "Toàn cảnh: xong gì, tiếp gì, kẹt gì?" | Delivery Manager | bảng kế hoạch treo tường |
| [`state/active-task.md`](state/active-task.md) | "Ngay lúc này đang làm chính xác việc gì?" | Agent đang làm | tờ giấy nhớ dán màn hình |
| [`state/decisions.md`](state/decisions.md) | "Điều gì đã khóa, cấm mở lại?" | Solution Architect | biên bản đóng dấu |

Cách tách là có chủ đích — ba nhịp đổi khác nhau: toàn cảnh (chậm), việc đang làm (nhanh),
quyết định (gần như bất biến). Trộn chung sẽ rối.

### Vòng đọc → làm → ghi

```
ĐẦU SESSION            TRONG KHI LÀM            CUỐI SESSION
─────────────          ─────────────            ─────────────
Đọc DELIVERY_STATE     Theo active-task         Cập nhật active-task
Đọc active-task     →  Tôn trọng decisions   →  Cập nhật DELIVERY_STATE
Đọc decisions          Làm ĐÚNG MỘT việc        Ghi thêm decisions (nếu có chốt mới)
```

Hai quy tắc sắt trong [`../CLAUDE.md`](../CLAUDE.md): **không viết code trước khi đọc cả ba**,
và **cập nhật state trước khi kết thúc session**. Một hook `SessionStart` tự bơm digest của
các file này vào mỗi session, và một guard `PreToolUse` cảnh báo nếu bạn sửa code nguồn lúc
foundations chưa xong — xem [`../.claude/hooks/`](../.claude/hooks/). Hooks là lời nhắc *có
răng*; chúng không thay thế việc đọc file.

---

## 3. Ba file ăn khớp với 7 phase ra sao

7 phase giao hàng nằm ở [`workflows/feature-delivery.md`](workflows/feature-delivery.md). Đây
là cách mỗi file được "động vào" khi một tính năng đi qua chúng:

| Phase | Chủ trì | `DELIVERY_STATE` | `active-task` | `decisions` |
|---|---|---|---|---|
| **1. Requirements** | Product Analyst | ✍️ đăng ký feature | ✍️ task = viết yêu cầu, phase=Requirements | 👁️ đọc |
| **2. Architecture** | Solution Architect | 🔄 cập nhật phase | 🔄 phase=Architecture | ✍️ **ghi quyết định khóa** |
| **3. Test Plan** | QA | 🔄 cập nhật phase | 🔄 phase=Test Plan | 👁️ đọc |
| **4. Build** | Backend + Frontend | 🔄 + ghi blocker | 🔄 phase=Build | 👁️ tuân theo |
| **5. E2E Tests** | QA | 🔄 cập nhật phase | 🔄 phase=E2E | 👁️ đọc |
| **6. Review** | Tech Lead | 🔄 + escalate | 🔄 phase=Review | ✍️ nếu escalation chốt điều gì |
| **7. Done** | — | ✅ đánh dấu xong, mở khóa phụ thuộc | 🧹 dọn / đặt task tiếp | 👁️ giữ nguyên |

👁️ đọc · ✍️ ghi mới · 🔄 cập nhật · ✅ đóng · 🧹 dọn

Các pattern đáng để ý:

- **`active-task` là con trỏ** di chuyển qua 7 phase — luôn cho biết "tôi đang ở đâu".
- **`decisions` chỉ phình to.** Phase 2 sinh ra các mục; các phase sau tuân theo; không ai
  xóa. Đây là thứ giữ cho các quyết định nhất quán xuyên nhiều session.
- **`DELIVERY_STATE` là tầng quản lý.** Một feature được *đăng ký* ở Phase 1 và *đóng + mở
  khóa phụ thuộc* ở Phase 7. Nó biến các feature rời rạc thành một dòng chảy có thứ tự.
- **Các cổng phê duyệt của con người** nằm ở những phase cụ thể (vd duyệt yêu cầu, đổi schema
  lõi, phát hiện bảo mật). Danh sách chính thức ở [`rules/approval-policy.md`](rules/approval-policy.md).
  Tại một cổng, Claude dừng lại và hỏi bạn.

---

## 4. Cái "seam": backlog từ roadmap "đổ" vào DELIVERY_STATE thế nào

Đây là mối nối giữa Tầng 1 và Tầng 2 — và nó **không tự động**. Một vai trò (Delivery Manager)
serialize đầu ra thượng nguồn vào state của harness. Quy tắc nền tảng:

> **`DELIVERY_STATE` là một lớp theo dõi mỏng, không phải bản sao của roadmap.** Chi tiết đầy
> đủ (PRD, story, AC) nằm ở `docs/`. State chỉ giữ thứ cần để theo dõi: tên, thứ tự, phụ
> thuộc, trạng thái. Tài liệu tham chiếu state; không bao giờ nhân đôi nó. (Đây là "Trace
> Seam" trong [`rules/harness-skill-boundary.md`](rules/harness-skill-boundary.md).)

Cái gì đi theo, cái gì để lại:

| Roadmap / PRD sinh ra | Vào DELIVERY_STATE? | Để lại docs? |
|---|---|---|
| Tên feature | ✅ một dòng | |
| Ưu tiên / thứ tự release | ✅ nhóm + thứ tự | |
| Phụ thuộc giữa các feature | ✅ ghi rõ | |
| Ngày mục tiêu (nếu có) | ✅ | |
| Mô tả chi tiết, story, AC | ❌ | ✅ `docs/requirements/` |
| Lý do ưu tiên / điểm WSJF | tóm tắt (một số) | ✅ đầy đủ trong PRD |

### Ví dụ cụ thể (trung lập)

**Roadmap output** (thô, từ bước roadmap/ưu tiên):

```
Release 1 (MVP):
  - Item CRUD            [nền, không phụ thuộc]
  - Search & filter      [cần: Item CRUD]
Release 2:
  - Bulk import          [cần: Item CRUD]
  - Export               [cần: Item CRUD, Search]
```

**Delivery Manager serialize vào `DELIVERY_STATE.md`:**

```markdown
## Active Feature Workstreams

### Release 1 — MVP
- [ ] F-01 Item CRUD — `NOT STARTED`
      PRD: docs/requirements/PRD-item-crud.md
- [ ] F-02 Search & filter — `NOT STARTED` · depends: F-01

### Release 2
- [ ] F-03 Bulk import — `NOT STARTED` · depends: F-01
- [ ] F-04 Export — `NOT STARTED` · depends: F-01, F-02
```

Roadmap nhiều dòng co lại còn **tên + trạng thái + phụ thuộc + link tới PRD**. Khi tiến hành,
chỉ **trạng thái** trên một dòng đổi:

```markdown
- [ ] F-02 Search & filter — `PHASE 4 (Build)` · depends: F-01 ✅
...
- [x] F-01 Item CRUD — `DONE` ✅      ← mở khóa F-02, F-03
```

Cột `depends` là phần quý nhất: nó biến danh sách phẳng thành **thứ tự thi công** và nối các
feature ngược về foundations.

> Skill `product-owner` (loại "Tracker") có thể tính điểm WSJF/ưu tiên, nhưng theo luật
> boundary nó chỉ *trả số cho Delivery Manager* — Delivery Manager mới ghi file. Một skill
> không bao giờ tự ghi state.

---

## 5. Một tính năng đi trọn (cả vòng trong một lần đọc)

Theo `F-04 Export` từ ý tưởng tới done:

1. **Thượng nguồn (Tầng 1)** đã quyết Export đáng làm và viết PRD. Dòng của nó nằm trong
   `DELIVERY_STATE` ở trạng thái `NOT STARTED · depends: F-01, F-02`.
2. **Kiểm tra cổng:** mọi foundation đã COMPLETE? F-01 và F-02 đã xong? Nếu có, Export khởi động.
3. **Phase 1 — Requirements:** Product Analyst biến PRD thành story + acceptance criteria.
   `active-task` = "viết yêu cầu Export". **Bạn duyệt.**
4. **Phase 2 — Architecture:** Kiến trúc sư chốt cách làm và **khóa quyết định** trong
   `decisions.md` (vd "export chạy server-side, dạng stream"). Lựa chọn đụng schema → **bạn duyệt**.
5. **Phase 3 — Test Plan:** QA định nghĩa "done" trông thế nào *trước khi* có code.
6. **Phase 4 — Build:** Backend + Frontend hiện thực kèm test, tuân theo quyết định đã khóa.
   Kẹt (vd thiếu API contract) được ghi vào `DELIVERY_STATE`.
7. **Phase 5 — E2E:** QA chạy test thật. Lệch acceptance criteria → bug → quay lại Phase 4.
8. **Phase 6 — Review:** Tech Lead duyệt / yêu cầu sửa. Phát hiện bảo mật → **bạn duyệt**.
9. **Phase 7 — Done:** `DELIVERY_STATE` đánh dấu F-04 ✅ và kiểm tra nó mở khóa cái gì;
   `active-task` được dọn và trỏ sang việc tiếp theo.

Xuyên suốt, bạn chỉ làm ba việc: **mô tả** điều mình muốn, **duyệt** ở các cổng, và để Claude
lo state + phase. Đó là toàn bộ mô hình tương tác.

---

## 6. Full vs Lite — chọn độ nặng

| | Full harness | Lite profile |
|---|---|---|
| File state | 3 (`DELIVERY_STATE` + `active-task` + `decisions`) | 1 (`state/STATE.md`) |
| Phase | 7 | 3 (Plan → Build → Verify) |
| Vai trò / cổng duyệt | 8 vai trò, cổng theo phase | không — bạn tự chạy |
| Foundations-trước-features | ✅ | ✅ (giữ) |
| Hợp cho | đội nhóm, tuân thủ, feature phụ thuộc lẫn nhau | MVP, prototype, làm một mình |

Hooks tự nhận diện chế độ: nếu `state/STATE.md` tồn tại thì là Lite, ngược lại là Full. Hướng
dẫn chuyển đổi và workflow 3 phase nằm ở [`lite/README.md`](lite/README.md) và
[`lite/workflow.md`](lite/workflow.md).

---

## Đi tiếp đâu

- **Khởi tạo một dự án:** [`../README.md`](../README.md) gốc → "Use in a new project".
- **Giao thức phải theo mỗi session:** [`../CLAUDE.md`](../CLAUDE.md).
- **Thứ tự xây trước khi làm feature:** [`workflows/foundations.md`](workflows/foundations.md).
- **Giao một tính năng:** [`workflows/feature-delivery.md`](workflows/feature-delivery.md).
- **Ai review / duyệt cái gì:** [`rules/`](rules/) (review, approval, e2e, coding standards).
- **Skill liên hệ với harness ra sao:** [`rules/harness-skill-boundary.md`](rules/harness-skill-boundary.md).
