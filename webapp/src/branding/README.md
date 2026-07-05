# Lớp thương hiệu cho bpmn.io (form-js & bpmn-js)

Skin thương hiệu VHT cho các bộ công cụ bpmn.io (Camunda), **không sửa nội tại
thư viện**. Tách 3 file:

| File | Vai trò |
|---|---|
| `tokens.css` | **Một nguồn** token brand (`--vht-*`): màu, mực, viền, bo góc. Nạp global ở `main.tsx`. |
| `bpmnio-skin.css` | Map token → biến CSS của form-js (`--cds-*` Carbon, `--color-*`) + ít polish class, scope dưới lớp bọc. |
| `translate-vi.ts` | Module `translate` (didi) Việt hoá nhãn palette/thuộc tính — best-effort. |

## Cách hoạt động

form-js/bpmn-js đọc màu từ **biến CSS** đặt trên phần tử cha. Ta bọc canvas trong
một class rồi gán đè biến trên class đó — cascade xuống toàn bộ `.fjs-*`/`.djs-*`
mà không đụng class nội bộ (an toàn khi nâng cấp minor).

| Lớp bọc | Dùng cho | Prefix nội bộ |
|---|---|---|
| `.vht-designer` | form-js **editor** (FormDesigner) | `.fjs-*`, `.bio-*` |
| `.vht-form` | form-js **viewer** (FormRenderer, preview + runtime) | `.fjs-*` |
| `.vht-diagram` | **bpmn-js** (BPMN editor — CHƯA kích hoạt) | `.djs-*` |

## Khi dựng BPMN editor (Tạo mới quy trình)

1. Bọc canvas bpmn-js trong `<div className="vht-diagram">`.
2. Mở khối `.vht-diagram { ... }` đã chừa sẵn ở cuối `bpmnio-skin.css`.
3. Nạp `TranslateViModule` vào `additionalModules` của `BpmnModeler` (cùng chuẩn
   didi như form-js) để Việt hoá palette/context-pad.
4. Token vẫn lấy từ `--vht-*` — đổi màu brand một chỗ, cả form-js lẫn bpmn-js đổi theo.

## Ràng buộc

- Mọi override gom trong `bpmnio-skin.css`, **scope chặt** dưới lớp bọc.
- Hạn chế `!important` (chỉ dùng cho SVG stroke của bpmn-js khi bắt buộc).
- Pin version `@bpmn-io/form-js` (hiện `1.23.x`) — class nội bộ có thể đổi ở major.

## Checklist Việt hoá 100% (chạy lại sau MỖI lần nâng version bpmn-js / properties-panel)

1. Chạy dev (`npm run dev`), mở trình vẽ BPMN, thao tác đủ: palette, kéo-thả từng loại
   phần tử, context-pad, popup "Đổi loại phần tử" (mọi nhóm), nối flow, chọn từng loại
   element và mở HẾT các nhóm properties panel (cả chế độ Nâng cao), chạy Kiểm tra.
2. Trong DevTools console gõ `__viMissing()` → bảng chuỗi chưa dịch.
3. Bổ sung các chuỗi đó vào `VI_DICT` (translate-vi.ts) — khớp CHÍNH XÁC từng ký tự.
4. Nhãn không đi qua translate (render thẳng) → thêm selector vào `relabel-vi.ts`.
5. Đạt chuẩn khi `__viMissing()` trả về 0 sau một lượt thao tác đầy đủ.

## Theme panel "Thuộc tính phần tử" (Đợt 6 — đồng nhất UI VHT)

Skin ghi đè **biến công khai** của `bio-properties-panel` trong scope
`.vht-designer .bio-properties-panel` (và `.bio-properties-panel-popup` cho FEEL
popup render ngoài dock). Mapping nhóm chính (chi tiết = khối "Đợt 6" trong
`bpmnio-skin.css`):

| Nhóm biến thư viện | Token VHT |
|---|---|
| `--text-base-color` / `--description-*` | `--vht-ink` / `--vht-ink-3` |
| `--link-color`, `--focus-outline-color`, `--input-focus-border-color`, `--dot-color` | `--vht-red` |
| `--group-*`, `--header-*`, `--input-border-color` | `--vht-surface(-2)`, `--vht-border(-strong)` |
| `--feel-active-*`, `--toggle-switch-on-*`, `--add-entry-*`, `--list-badge-*` | `--vht-red` (+ `--vht-red-050/100` cho hover/indicator) |
| `--remove-entry-*`, `--*-error-*`, `--feel-required-color` | `--vht-danger` |
| `--popup-*`, `--tooltip-*` | surface/ink (tooltip giữ nền sáng — gói không có biến màu chữ tooltip riêng) |

Class-level override giữ TỐI THIỂU (radius/height input, group header đậm,
sticky shadow) vì gói không có biến hình học.

**Sau mỗi lần nâng version gói bpmn.io**: chạy `npm run check:panel-vars` —
fail nếu skin đang ghi đè biến đã bị đổi tên/xoá (tránh giao diện "rơi" về
mặc định trong im lặng). Thêm `--verbose` để xem biến mới thư viện vừa thêm.
