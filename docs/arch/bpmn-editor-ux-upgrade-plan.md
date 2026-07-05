# Kế hoạch nâng cấp UX trình vẽ BPMN — hướng "BA lowcode tự vẽ"

> **Trạng thái**: ✅ ĐÃ THỰC THI Đợt 1–5 (2026-07-04, cùng ngày lập kế hoạch) —
> `tsc` + `vite build` xanh; **chưa click-test trình duyệt** (xem mục 3 để test tay).
> Ghi chú lệch kế hoạch: (a) empty-state 5.2 rút thành hint-card "Bắt đầu nhanh"
> hiện 1 lần (starter diagram không bao giờ trống); (b) Việt hóa 2.2 phủ ~200 chuỗi
> phổ biến + bẫy dev `__viMissing()` để vét phần còn lại theo checklist branding/README.md.
> Ngày lập: 2026-07-04
> **Mục tiêu khách hàng**: người dùng lowcode (BA nghiệp vụ) tự vẽ được quy trình trên
> giao diện thân thiện, đẹp, Việt hóa 100%.
> **Bối cảnh**: sau phiên review Codex (`docs/req/section-04072026.md`) và đợt sửa 4 blocker
> (contract biến, default flow, lint gate, lane role) — phần AN TOÀN đã ổn, phần THÂN THIỆN
> là khoảng trống chính còn lại. Đánh giá hiện tại: demo OK, BA tự vẽ = CHƯA (~65%).

---

## 1. Review — đối chiếu 6 nhận xét với code

### 1.1 ✅ Việt hóa chưa hoàn toàn (xác nhận, đúng)

Hiện có 2 cơ chế: service `translate` chuẩn (`branding/translate-vi.ts`, từ điển `VI_DICT`
khớp chuỗi **chính xác**) + vá DOM (`relabel-vi.ts`, MutationObserver) cho những nhãn
render thẳng. Lỗ hổng:

- `VI_DICT` mới ~60 chuỗi BPMN — **thiếu toàn bộ popup/replace menu** ("Change element"
  mở ra là danh sách User Task/Service Task/Sub Process/… tiếng Anh), thiếu nhiều mục
  context-pad, thiếu placeholder ô tìm kiếm popup.
- Properties panel Zeebe: nhóm ("Condition", "Multi-instance", "Called element",
  "Execution listeners"…), label field ("Target", "Propagate all child variables",
  "Retries"…), tooltip/link tài liệu — phần lớn chưa có trong từ điển.
- Khớp chính xác từng chuỗi → **nâng version thư viện là lộ chuỗi mới tiếng Anh**,
  không có cách phát hiện chủ động.

### 1.2 ✅ Nhiều element, không tìm kiếm được (xác nhận, đúng — nặng nhất)

- `khcnTemplatesModule` bơm **15 mẫu KHCN** (`data/elementTemplates.ts`) vào palette
  dọc mặc định; mẫu cùng BPMN type dùng **chung icon**, tên chỉ hiện qua tooltip →
  BA phải rê chuột từng nút để phân biệt "Ký duyệt" với "Thẩm định".
- Palette gốc bpmn-js vẫn đầy đủ mọi loại BPMN (data object, data store, group,
  sub-process…) mà nghiệp vụ KHCN không dùng → nhiễu.
- Không có tìm kiếm ở palette; popup "append" của bpmn-js có search nhưng tiếng Anh
  và liệt kê cả từ vựng BPMN không dùng.

### 1.3 ✅ Thuộc tính dư thừa (xác nhận, đúng)

Panel đang nạp `BpmnPropertiesProviderModule` + `ZeebePropertiesProviderModule` **đầy đủ**:
User Task hiện cả Execution listeners, Extension properties, Headers, Input/Output
mappings, Version tag… — những nhóm chỉ dev cần. Các nhóm custom KHCN (Biểu mẫu, Phân
công, Vai trò lane, Điều kiện) đã tốt nhưng **nằm lẫn** giữa các nhóm kỹ thuật.

### 1.4 ✅ Font chưa customize (xác nhận, đúng)

App dùng Inter/system-ui (`branding/tokens.css:46`), nhưng **label SVG trên canvas vẫn là
Arial mặc định của bpmn-js** — nhìn lệch tông với phần còn lại. Lưu ý kỹ thuật: đổi font
canvas phải qua **config `textRenderer`** của bpmn-js (để engine đo/wrap text theo font
mới), không CSS đè đơn thuần (CSS đè → chữ tràn khung vì đo bằng font cũ).

### 1.5 ✅ Canvas chưa thân thiện (xác nhận + bổ sung)

Nhận xét thêm từ review code:

- **Không có nút Undo/Redo** — chỉ ai biết Ctrl+Z mới dùng được; BA lowcode cần nút bấm.
- **Không hiển thị mức zoom** (%), không có nút "100%".
- **Canvas trống trơn khi tạo mới** — không có empty-state hướng dẫn "kéo phần tử từ
  đâu, bắt đầu thế nào".
- **Kết quả lint chỉ nằm trong modal** — chưa có đánh dấu lỗi ngay trên canvas
  (overlay đỏ tại element lỗi) và badge số lỗi trên nút Kiểm tra.
- **Nhánh mặc định (default flow) khó nhận biết** — ký hiệu gạch chéo BPMN chuẩn quá
  "kín" với BA; nhóm "Điều kiện (KHCN)" cũng chưa có control đặt/bỏ default ngay tại chỗ
  (phải mò sang nhóm Zeebe gốc).
- **Rời trang khi chưa lưu không cảnh báo** (isDirty đã có, chưa gắn beforeunload/router
  guard).
- Context-pad/replace-menu đầy từ vựng BPMN lạ (đã nêu ở 1.2) — với BA chỉ cần ~10 loại.

### 1.6 ✅ Chưa có on/off lưới (xác nhận, đúng)

bpmn-js có **grid snapping** (hít theo lưới, đã bật ngầm định) nhưng **không vẽ lưới
nhìn thấy**. Cần thêm package `diagram-js-grid` (lưới chấm) + nút toggle trên
`DiagramToolbar` (ẩn/hiện layer lưới), nhớ trạng thái vào localStorage.

---

## 2. Kế hoạch nâng cấp — 5 đợt

> Nguyên tắc chung giữ nguyên: KHÔNG sửa nội tại thư viện, mọi thứ qua additionalModules
> / config / CSS scope `.vht-*` (như `branding/README.md`). Mỗi đợt kết thúc bằng
> `tsc --noEmit` + `vite build` + click-test tay theo checklist.

### Đợt 1 — Quick wins nền tảng (ước ~1–2 ngày)

| # | Việc | Cách làm | Chạm file |
|---|---|---|---|
| 1.1 | **Font canvas theo brand** | Config `textRenderer.defaultStyle/externalStyle` (fontFamily = token Inter, fontSize 12–13) khi khởi tạo Modeler + Viewer; đồng bộ font panel qua CSS `.vht-designer` | `BpmnEditor.tsx`, `BpmnViewer.tsx`, `bpmnio-skin.css` |
| 1.2 | **Lưới on/off** | Thêm `diagram-js-grid`; nút toggle ở `DiagramToolbar` (canvas hide/show layer); lưu localStorage | `BpmnEditor.tsx`, `DiagramToolbar.tsx`, package.json |
| 1.3 | **Undo/Redo + zoom %** | Nút Undo/Redo (commandStack.undo/redo, disable theo canUndo/canRedo) + hiển thị % zoom, click = về 100% | `DiagramToolbar.tsx`, `BpmnEditor.tsx` |
| 1.4 | **Cảnh báo rời trang chưa lưu** | beforeunload + router blocker khi isDirty | `BpmnEditor.tsx`, `ProcessDetail.tsx`, `ProcessCreate.tsx` |

### Đợt 2 — Việt hóa 100% có kiểm soát (ước ~2–3 ngày)

| # | Việc | Cách làm |
|---|---|---|
| 2.1 | **Bẫy chuỗi thiếu** | Dev-mode: `translateVi` ghi lại mọi chuỗi không có trong từ điển (Set + console.table) → vẽ đủ mọi thao tác 1 lượt là có danh sách đầy đủ |
| 2.2 | **Bổ sung `VI_DICT` trọn bộ** | Popup/replace menu (mọi biến thể element), context-pad, palette gốc, properties panel Zeebe (nhóm + field + placeholder + tooltip), thông báo lỗi panel. Tham chiếu bộ key chuẩn từ repo `bpmn-io/bpmn-js-i18n` để không sót |
| 2.3 | **Mở rộng selector relabel** | Rà các nhãn panel render thẳng chưa nằm trong `TEXT_SELECTORS` (collapsible entries, tooltip title) |
| 2.4 | **Chốt quy trình chống thoái hóa** | Checklist "màn nào — thao tác nào — kỳ vọng tiếng Việt" vào docs; khi nâng version bpmn-js/panel bắt buộc chạy lại bẫy 2.1 |

### Đợt 3 — Palette nghiệp vụ + rút gọn từ vựng BPMN (ước ~3–4 ngày, ĐINH của kế hoạch)

| # | Việc | Cách làm |
|---|---|---|
| 3.1 | **Drawer "Mẫu nghiệp vụ KHCN"** | Panel React (AntD) dock trái thay cho 15 nút palette: nhóm theo `nhom` (Phê duyệt/Thẩm định/Soạn thảo/Hội đồng/Hẹn giờ/Tích hợp), mỗi mẫu có **tên + mô tả + icon riêng**, ô **tìm kiếm**; click/kéo → gọi `create.start()` như module hiện tại (qua ref modeler) |
| 3.2 | **Thu gọn palette gốc** | PaletteProvider lọc còn: công cụ (hand/lasso/space/connect) + Start/End + Task + Gateway + ghi chú; bỏ data object/store, group… khỏi tầm mắt BA |
| 3.3 | **Rút gọn replace/append menu** | PopupMenuProvider lọc theo "bộ từ vựng KHCN": User/Service Task, Call Activity, Exclusive/Parallel Gateway, Start/End, Timer, Sub-process. (Chế độ nâng cao hiện đủ — xem 4.1) |

### Đợt 4 — Properties panel 2 chế độ (ước ~2–3 ngày)

| # | Việc | Cách làm |
|---|---|---|
| 4.1 | **Chế độ Đơn giản (mặc định) / Nâng cao** | Provider priority thấp lọc groups theo **whitelist theo loại element** — UserTask: Chung · Biểu mẫu KHCN · Phân công KHCN · (Thời hạn); SequenceFlow từ gateway: Điều kiện KHCN; ServiceTask: Chung · Job type; CallActivity: Chung · Process đích; Lane: Vai trò. Toggle "Nâng cao" (header panel) hiện đầy đủ Zeebe |
| 4.2 | **Default flow tại chỗ** | Trong nhóm "Điều kiện (KHCN)": checkbox "Đặt làm nhánh mặc định (đi khi không nhánh nào khớp)" + badge "Mặc định" trên option; đồng bộ 2 chiều với thuộc tính `default` của gateway |
| 4.3 | **Job type dropdown** | ServiceTask: thay ô text bằng dropdown 5 hệ tích hợp (QLNS/MS/SAP/QLTS/PLM — nguồn từ `camundaOps`/contract), cho phép "(tuỳ chỉnh)" |

### Đợt 5 — Trợ giúp chủ động trên canvas (ước ~2–3 ngày)

| # | Việc | Cách làm |
|---|---|---|
| 5.1 | **Live-lint overlay** | Chạy `lintDiagram` debounced sau mỗi thay đổi; element lỗi gắn overlay chấm đỏ/vàng (bpmn-js overlays), hover hiện thông báo; badge số lỗi trên nút "Kiểm tra" |
| 5.2 | **Empty-state hướng dẫn** | Sơ đồ trống → overlay giữa canvas: 3 bước "Chọn mẫu → Kéo vào → Nối lại", nút "Bắt đầu từ mẫu RD01.01" |
| 5.3 | **Tô màu element** | Menu màu nhỏ ở context-pad (modeling.setColor, bảng màu VHT định sẵn) — khớp seed RD01.01 đang dùng bioc |

**Backlog nghiên cứu (không cam kết đợt này)**: auto-layout sơ đồ ("sắp xếp lại" 1 nút —
`bpmn-auto-layout` còn non); template hoàn chỉnh hơn (boundary timer SLA, input/output
mapping Call Activity — đang treo OQ-002/003/006); tour onboarding từng bước.

---

### Đợt 6 — Skin panel "Thuộc tính phần tử" đồng nhất UI VHT (ước ~2–3 ngày) — ✅ ĐÃ THỰC THI

> **Trạng thái**: ✅ ĐÃ THỰC THI 6.1–6.5 (2026-07-04, cùng ngày duyệt) — 77 biến map về token VHT
> (khối "Đợt 6" trong `bpmnio-skin.css`), class-level 5 rule (dưới trần 10), script
> `npm run check:panel-vars` xanh + bảng mapping trong `branding/README.md`.
> Chưa click-test trình duyệt — nghiệm thu mục 1–3 cần xem bằng mắt.
> Đề xuất 2026-07-04, sau khi đã đồng bộ font (Inter).
> **Hiện trạng**: panel vẫn mang phong cách IBM Carbon mặc định của `bio-properties-panel`
> (accent xanh dương, input vuông, group header xám, FEEL toggle xanh, dot "đã chỉnh" xanh) —
> đặt cạnh form AntD của app là nhận ra ngay "đồ ngoại lai". Skin hiện mới chạm: viền trái đỏ
> group header, focus đỏ input, font Inter.
> **Bề mặt customize**: gói expose ~85 biến CSS công khai (đã kiểm kê từ
> `@bpmn-io/properties-panel/dist/assets/properties-panel.css`) — ghi đè BIẾN trong scope
> `.vht-designer .bio-properties-panel` + `.bio-properties-panel-popup`, đúng chiến lược
> `branding/README.md` (không sửa nội tại thư viện, hạn chế override class-level).

| Bước | Nội dung | Biến/kỹ thuật chính | Ước |
|---|---|---|---|
| 6.1 **Token màu cốt lõi** | Chữ, nền, viền, accent về token VHT | `--text-base-color→--vht-ink`, `--description-color→--vht-ink-3`, `--link-color`/`--focus-outline-color`/`--input-focus-border-color→--vht-red`, `--dot-color` (chỉ báo "đã chỉnh")`→--vht-red`, `--group-background-color`/`--sticky-group-background-color→--vht-surface`, `--header-background-color→--vht-surface-2`, `--group-bottom-border-color`/`--input-border-color→--vht-border`; trạng thái error giữ đỏ semantic | 0.5 ngày |
| 6.2 **Thành phần tương tác** | FEEL toggle, toggle switch, nút thêm/xoá entry, mũi tên nhóm, dropdown | `--feel-active-background-color→--vht-red` (+ hover `--vht-red-050`), `--toggle-switch-on-background-color→--vht-red`, `--add-entry-*`/`--remove-entry-*` đỏ VHT (đối chiếu phần đã làm cho form-js — panel dùng chung họ biến), `--arrow-fill-color→--vht-ink-2` + `--arrow-hover-background-color→--vht-surface-2`, `--dropdown-item-hover-background-color→--vht-red-050`, `--list-badge-*` đỏ nhạt | 0.5 ngày |
| 6.3 **Hình khối & mật độ theo AntD** (class-level, scope chặt) | Input/select/textarea bo góc `--vht-radius-sm` (6px), cao ~32px, padding ngang 11px (khớp AntD size middle); group header nền `--vht-surface-2` + chữ 600 (giữ viền trái đỏ), sticky header đổ bóng nhẹ; nới padding dọc entry cho thoáng như Form AntD | `.bio-properties-panel-input`, `.bio-properties-panel-group-header` — override class-level TỐI THIỂU vì gói không có biến radius/height | 0.5–1 ngày |
| 6.4 **Popup FEEL + tooltip** | Đồng tông popup editor biểu thức và tooltip với AntD | `--popup-background-color`/`--popup-header-background-color`/`--popup-title-color` theo surface/ink, `--feel-popup-close-background-color→--vht-red`, `--tooltip-background-color` nền ink đậm chữ trắng (như AntD Tooltip), bo góc 8px | 0.5 ngày |
| 6.5 **Kiểm chứng & chống thoái hóa** | (a) Click-test side-by-side: panel cạnh form AntD, checklist trạng thái normal/hover/focus/disabled/error/edited-dot/toggle/dropdown/FEEL popup; (b) ghi bảng mapping biến→token vào `branding/README.md`; (c) script node nhỏ grep danh sách biến trong CSS gói so với danh sách đã map — nâng version mà biến đổi tên/mất là BÁO ĐỘNG ngay thay vì vỡ im lặng | | 0.5 ngày |

**Tiêu chí nghiệm thu Đợt 6**
1. Đặt panel cạnh một form AntD bất kỳ của app: không còn nhận ra khác hệ thiết kế
   (accent, radius, nền, viền, chữ đồng bộ).
2. Không còn màu xanh Carbon ở bất kỳ trạng thái nào (focus, FEEL active, toggle on,
   dot "đã chỉnh", link).
3. Popup FEEL editor + tooltip cùng tông VHT.
4. Toàn bộ override nằm trong `bpmnio-skin.css` scope `.vht-designer` /
   `.bio-properties-panel-popup`; class-level override ≤ ~10 rule.
5. Script kiểm biến chạy xanh; quy trình nâng version panel có bước chạy lại script.

**Rủi ro**: một số style hardcode không qua biến (đã gặp: font IBM Plex của popup) →
chấp nhận vài override class-level scope chặt; app chưa có dark mode nên bỏ qua biến dark.

---

## 3. Tiêu chí nghiệm thu (theo mục tiêu "BA tự vẽ")

1. BA mở trình vẽ, **không thấy bất kỳ chữ tiếng Anh nào** trong thao tác chuẩn
   (palette, kéo thả, nối, đổi loại, panel, lint, lưu).
2. Tìm mẫu "Ký duyệt" bằng ô tìm kiếm trong ≤ 5 giây, phân biệt được các mẫu **không
   cần rê chuột**.
3. User Task ở chế độ Đơn giản hiện **≤ 5 nhóm thuộc tính**, tất cả tiếng Việt.
4. Font canvas = font hệ thống app (Inter), chữ không tràn khung.
5. Bật/tắt lưới bằng 1 nút; trạng thái giữ qua phiên.
6. Vẽ thiếu điều kiện → thấy chấm đỏ ngay trên canvas, click là tới nơi sửa; lưu bị
   chặn kèm hướng dẫn (đã có từ đợt lint gate).

## 4. Rủi ro & lưu ý

- **Relabel DOM observer** vốn mong manh với nâng version panel → đợt 2 ưu tiên đưa
  tối đa chuỗi về cơ chế `translate` chuẩn, relabel chỉ là lưới vét.
- **Đổi font phải qua textRenderer** (đo text đúng) — không CSS đè trực tiếp label SVG.
- **Lọc palette/popup menu** dùng API provider chuẩn (không patch) để sống sót qua
  upgrade; chế độ Nâng cao là lối thoát khi thiếu tính năng.
- Thứ tự đợt cố ý: Việt hóa (đợt 2) trước palette mới (đợt 3) để drawer mới sinh ra đã
  tiếng Việt; panel 2 chế độ (đợt 4) sau khi từ vựng đã rút gọn.
