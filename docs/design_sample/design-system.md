# QTKHCN Design System — "VHT Military Red" (tham chiếu từ Google Stitch)

> Nguồn: Google Stitch project `4924415709161706342` ("Military Process Management Dashboard
> Redesign"), 4 màn "Simplified Process Catalog Redesign" → đã xuất HTML:
> - **Tổng quan Hệ thống Thiết kế** (design tokens gốc) — screen `0a950d5e…`
> - **Thành phần Nhập liệu & Lựa chọn** — screen `cf4e63c6…`
> - **Thành phần Phản hồi & Hiển thị Dữ liệu** — screen `ccb37ae0…`
> - **Thư viện Thành phần & Danh mục Quy trình** — screen `6dcd199d…`
>
> Nền tảng: **Material 3 tokens + Tailwind CSS (CDN, plugins `forms`, `container-queries`)**,
> font **Inter**, icon **Material Symbols Outlined**. Đây là bản trích để tham chiếu khi build UI;
> stack build chính thức vẫn chờ chốt ở foundation **F2**.

---

## 1. Design Tokens (bản `tailwind.config` nguyên gốc — dùng lại được ngay)

```js
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ---- Primary (đỏ quân đội) ----
        "primary": "#bf0027",                       // đỏ chủ đạo (nút, nhấn mạnh)
        "on-primary": "#ffffff",
        "primary-container": "#ee0033",             // "Military Primary" — đỏ tươi (swatch, logo block)
        "on-primary-container": "#150001",
        "primary-fixed": "#ffdad8",
        "primary-fixed-dim": "#ffb3b0",
        "on-primary-fixed": "#410007",
        "on-primary-fixed-variant": "#92001b",      // dùng làm nền sidebar ở dark mode
        "inverse-primary": "#ffb3b0",
        "surface-tint": "#bf0027",
        // ---- Secondary (xám trung tính) ----
        "secondary": "#5f5e5e",
        "on-secondary": "#ffffff",
        "secondary-container": "#e2dfde",
        "on-secondary-container": "#636262",
        "secondary-fixed": "#e5e2e1",
        "secondary-fixed-dim": "#c8c6c5",
        "on-secondary-fixed": "#1b1b1b",
        "on-secondary-fixed-variant": "#474746",
        // ---- Tertiary (xanh lá = success) ----
        "tertiary": "#006e0d",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#238923",
        "on-tertiary-container": "#000700",
        "tertiary-fixed": "#94fa85",
        "tertiary-fixed-dim": "#79dd6c",
        "on-tertiary-fixed": "#002201",
        "on-tertiary-fixed-variant": "#005307",
        // ---- Error / Danger ----
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        // ---- Surface / Background ----
        "background": "#fbf9f9",
        "on-background": "#1b1c1c",
        "surface": "#fbf9f9",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#5e3f3e",
        "surface-variant": "#e3e2e2",
        "surface-dim": "#dbdad9",
        "surface-bright": "#fbf9f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f3",
        "surface-container": "#efeded",
        "surface-container-high": "#e9e8e7",
        "surface-container-highest": "#e3e2e2",
        "inverse-surface": "#303031",
        "inverse-on-surface": "#f2f0f0",
        // ---- Outline ----
        "outline": "#936e6c",
        "outline-variant": "#e8bcba",
      },
      borderRadius: {
        DEFAULT: "0.125rem",  // 2px
        lg: "0.25rem",        // 4px
        xl: "0.5rem",         // 8px
        full: "0.75rem",      // 12px (⚠ KHÔNG phải bo tròn hẳn — full = 12px)
      },
      spacing: {
        base: "4px",
        xs: "0.5rem",   // 8px
        sm: "1rem",     // 16px
        md: "1.5rem",   // 24px
        lg: "2rem",     // 32px
        xl: "3rem",     // 48px
        gutter: "1rem",
        "sidebar-width": "240px",
      },
      fontFamily: {
        // tất cả map về Inter
        "headline-xl": ["Inter"], "headline-lg": ["Inter"], "headline-lg-mobile": ["Inter"],
        "headline-md": ["Inter"], "body-lg": ["Inter"], "body-md": ["Inter"],
        "label-md": ["Inter"], "small": ["Inter"],
      },
      fontSize: {
        "headline-xl":        ["48px", { lineHeight: "60px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg":        ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "headline-md":        ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg":            ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md":            ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md":           ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "small":              ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
    },
  },
}
```

### Quy ước màu ngữ nghĩa (semantic)

| Vai trò | Token | Hex | Ghi chú |
|---|---|---|---|
| Chủ đạo / hành động chính | `primary` | `#bf0027` | Nút Primary, viền focus, text nhấn |
| Đỏ tươi thương hiệu | `primary-container` | `#ee0033` | Logo block, swatch "Military Primary" |
| Thành công / OK | `tertiary` | `#006e0d` / hiển thị `#228822` | Toast success, tag "Draft"→xanh, badge OPERATIONAL |
| Cảnh báo | `amber-500` | `#DAA520` | **Không có token riêng** — dùng `bg-amber-500` của Tailwind |
| Nguy hiểm / lỗi | `error` | `#ba1a1a` (hiển thị `#DC143C`) | Input lỗi, toast critical |
| Nền trang | `background` | `#fbf9f9` | |
| Chữ chính | `on-surface` | `#1b1c1c` | |
| Chữ phụ / label | `on-surface-variant` | `#5e3f3e` | |
| Viền | `outline` / `outline-variant` | `#936e6c` / `#e8bcba` | |

> ⚠️ **Lưu ý màu**: một số swatch trong màn Tổng quan hiển thị hex "marketing" (`#228822`, `#DAA520`,
> `#DC143C`) khác với giá trị token thật (`tertiary=#006e0d`, `error=#ba1a1a`). Khi build, **ưu tiên
> token trong `tailwind.config`**; hex trên swatch chỉ là nhãn minh hoạ. Warning chưa có token —
> cần bổ sung nếu muốn chuẩn hoá.

---

## 2. Layout khung (app shell)

- **SideNavBar**: cố định trái, rộng `240px` (`sidebar-width`), nền `bg-primary`
  (dark: `bg-on-primary-fixed-variant`), chữ `on-primary`. Mục active: `bg-on-primary-container/20`
  + `font-bold` + `rounded-lg`. Logo "VHT / Military Systems" trên cùng, nút "Add New Task" đáy.
  Icon menu: `home, assignment, construction, grid_view (Process Catalog), hub (Integration), settings`.
- **TopAppBar**: cố định trên, cao `h-16` (64px), nền `surface`, viền đáy `outline-variant`,
  tiêu đề màu `primary`; ô search + chuông thông báo (chấm đỏ) + avatar "System Administrator".
- **Main canvas**: `ml-[240px] pt-16 p-lg`, nội dung `max-w-[1400px] mx-auto`, khoảng cách dọc `space-y-lg`.
- Bố cục nội dung: **Bento grid** 12 cột (`grid grid-cols-12 gap-gutter`).

---

## 3. Thư viện Component (class Tailwind tham chiếu)

### Buttons
```html
<!-- Primary -->
<button class="bg-primary text-on-primary font-bold py-sm px-md rounded transition-all active:scale-95 shadow-sm">Primary</button>
<!-- Secondary (outline) -->
<button class="bg-white border border-primary text-primary font-bold py-sm px-md rounded hover:bg-primary/5 active:scale-95">Secondary</button>
<!-- Ghost -->
<button class="bg-transparent text-primary font-bold py-sm px-md rounded hover:bg-primary/10">Ghost</button>
```
Chuẩn tương tác: `active:scale-95` (hoặc `active:scale-[0.98]`), `transition-all`.

### Input / Select / Textarea
```html
<input class="w-full border border-outline p-sm rounded focus:outline-none focus:ring-1 focus:ring-primary text-body-md" />
<!-- Focus -->  class="border-2 border-primary bg-primary/5 outline-none"
<!-- Error -->  class="border border-error bg-error/5"  + <p class="text-error text-small">Error message</p>
```
- Textarea focus dùng CSS riêng: `box-shadow: 0 0 0 4px rgba(191,0,39,0.15)`.
- Select: `appearance-none` + icon `keyboard_arrow_down` tuyệt đối bên phải.

### Radio / Checkbox
- Kích thước `w-6 h-6`, `text-primary focus:ring-primary`; khi checked nền = `#bf0027`.
- Bọc trong `<label class="flex items-center gap-sm cursor-pointer group">`, text hover → `text-primary`.

### Status Tags / Badges
```html
<span class="bg-primary text-on-primary text-xs font-bold px-sm py-xs rounded">Active</span>
<span class="bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold px-sm py-xs rounded">Draft</span>
<span class="bg-secondary text-on-secondary text-xs font-bold px-sm py-xs rounded">Archived</span>
<!-- Badge pill trong bảng -->
<span class="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">WARNING</span>
```

### Notification Toasts (success / warning / critical)
- Bố cục: icon tròn `w-10 h-10` bên trái + tiêu đề đậm + mô tả `text-on-surface-variant` + nút action.
- Success: viền `tertiary/20`, nền `tertiary-fixed/10`, icon `check_circle` (FILL 1) nền `tertiary`.
- Warning: nền `surface-container-high`, icon `warning` nền `primary-fixed-dim/40`.
- Critical: viền `primary/20`, nền `primary-fixed/30`, icon `error` nền `primary`.

### Stepper & Progress (dùng cho luồng phê duyệt)
- Stepper ngang: đường nền `bg-secondary-container`, phần đã qua `bg-primary` (vd `w-[66%]`).
  Bước đã xong = vòng tròn `bg-primary` + icon `check`; bước hiện tại = `ring-4 ring-primary/20 scale-110`;
  bước chưa tới = `bg-secondary-container text-secondary`. Nhãn: Initiate → Review → Approve → Deploy.
- Progress bar: track `h-3 bg-secondary-container rounded-full`, fill `bg-primary`, `%` màu `primary` đậm.

### Modal (xác nhận hành động)
- Card `bg-surface-container-lowest border border-outline rounded-xl shadow-2xl` + viền trên nhấn
  `border-t-4 border-t-primary`. Icon tròn tiêu đề `bg-primary-fixed text-primary`.
- 2 nút: Cancel (`border border-outline`) + Confirm (`bg-primary text-on-primary`). Overlay: `backdrop-blur-[2px]`.

### Empty State
- Card căn giữa, SVG line-art `text-primary opacity-20`, tiêu đề `headline-md`, mô tả `on-surface-variant`,
  nút primary "Add Your First Task".

### Metric / KPI Cards
```html
<div class="bg-surface-container-lowest border border-outline-variant p-md rounded-lg hover:border-primary transition-colors group">
  <p class="text-on-surface-variant text-label-md uppercase font-bold">Active Assets</p>
  <p class="text-headline-lg font-black text-primary group-hover:scale-105 transition-transform">1,284</p>
</div>
```
Biến thể "focus" (card active): `border-2 border-primary` + hiệu ứng dải chéo `-skew-x-12`.

### Data Table (Process Deployment Registry)
- Header: `bg-surface-container-high`, cột `label-md uppercase tracking-tighter text-on-surface-variant`.
- Zebra: hàng chẵn `bg-surface-container-lowest`; hover `bg-surface-container-low`.
- Cột ID: `font-bold text-primary`; version: `font-mono`.
- Status trong bảng: `ACTIVE` = `bg-primary text-on-primary`; `DRAFT` = `bg-secondary text-on-primary`.
- Pagination: nút trang hiện tại `bg-primary text-on-primary`, chọn rows-per-page qua `<select>`.

### FAB (Floating Action Button)
```html
<button class="fixed bottom-lg right-lg w-16 h-16 bg-primary text-on-primary rounded-full
  shadow-[0_8px_25px_rgba(191,0,39,0.3)] hover:scale-110 active:scale-95 transition-all">
  <span class="material-symbols-outlined text-[32px]" style="font-variation-settings:'FILL' 1;">emergency</span>
</button>
```

---

## 4. Map nghiệp vụ QTKHCN (đã có sẵn trong màn Danh mục Quy trình)

Bảng "Process Deployment Registry" đã dùng đúng domain của dự án — cấu trúc cột gợi ý cho màn
**Danh mục Quy trình / Quản lý quy trình Camunda 8**:

| Cột | Ví dụ trong mẫu | Ghi chú |
|---|---|---|
| ID | `RD01.01`, `RD03.09` | Mã quy trình theo nhóm RD |
| Process Name | "Xét duyệt Chủ trương cấp Cơ sở" | Tên nghiệp vụ tiếng Việt |
| Group | `RD01`, `RD02` | Nhóm nhiệm vụ KHCN (RD01–RD10) |
| Phase | Pha 1 / Pha 2 / Pha 3 / Deploy | Giai đoạn trong vòng đời |
| Version | `v1.2`, `v0.9-beta` | Phiên bản BPMN |
| Status | ACTIVE / DRAFT | Trạng thái publish quy trình |
| Instances | 7, 12, 0 | Số instance đang chạy (Camunda) |
| Updated | 2026-06-28 | Ngày cập nhật |

Menu điều hướng khớp scope 2026: **Overview, My Tasks, System Admin, Process Catalog, Integration, Settings**.

---

## 5. Cần lưu ý khi đưa vào build (F2 trở đi)

1. **Tailwind qua CDN** (`cdn.tailwindcss.com`) chỉ hợp prototype — bản production nên chuyển sang
   Tailwind build-time + đưa `tailwind.config` ở trên vào repo.
2. **Thiếu token Warning** — bổ sung `warning`/`on-warning` thay cho `bg-amber-500` rời rạc.
3. **Chênh hex swatch vs token** (mục 1) — chốt 1 nguồn sự thật, ưu tiên token.
4. **Dark mode** khai báo `darkMode: "class"` nhưng các màn mẫu mới phủ light — cần bổ sung bảng token dark.
5. Font Inter + Material Symbols đang tải từ Google Fonts CDN — cân nhắc self-host cho mạng nội bộ VHT.
