# Kế hoạch nâng cấp theme màn `/danh-sach-phan-he`

Ngày ghi nhận: 2026-07-09
Trạng thái: **Slice A ĐÃ TRIỂN KHAI (2026-07-09, build xanh).** A1 recolor (`tokens.css` — palette
Đỏ Tác Chiến + cả các màu gold/navy inline trong `SubsystemList.tsx` và nền standalone trong
`App.tsx:591`); A2 constellation SVG động (`ConstellationLines` trong `SubsystemList.tsx`,
one-shot stroke-dashoffset + stagger, tôn trọng `prefers-reduced-motion` — đồng thời tắt beam
quét + ping-dot cho user reduced-motion); A3 IBM Plex Mono (`index.html` + `.qtkhcn-mono`, áp cho
giá trị BentoStatCard + pill trạng thái card). Slice B/C vẫn ở Backlog.

## Bối cảnh

Tiếp nối `docs/research/ux-review-danh-sach-phan-he-2026-07-09.md` (review UI/UX ban đầu) — hầu hết
khuyến nghị ưu tiên cao/trung của review đó đã được code (route thật, lọc theo quyền, search không
dấu, breadcrumb, section Ghim/Gần đây, a11y cơ bản). Nhưng bản nâng cấp phát sinh vấn đề mới: theme
nền "blueprint quân sự" (`Navy/Gold/Olive`, xem `webapp/src/branding/tokens.css:97-224`,
class `.qtkhcn-standalone-bg`) áp riêng cho trang này lệch hẳn khỏi bộ nhận diện "VHT Military Red"
(đỏ/trắng/đen) dùng ở toàn bộ phần còn lại của app (kể cả `SubsystemSwitcher.tsx` — popover chọn
phân hệ trên header, vẫn nền trắng + đỏ).

Trao đổi với user đã chốt 3 quyết định (không đổi ý trong phiên này):

1. **Giữ theme nền tối "blueprint quân sự"** — không quay về nền sáng. Lý do: tránh màn hình đơn điệu.
2. **Giữ điều hướng `window.open` (mở tab mới)** cho mọi phân hệ/module — không đổi sang
   `navigate()` nội bộ SPA.
3. **Đổi bảng màu nền từ Navy/Gold sang "Đỏ Tác Chiến"** — dùng đúng `--vht-red`/`--vht-red-chrome`
   đã có trong `tokens.css`, thay vì màu vàng đồng/xanh navy không thuộc bộ nhận diện VHT.

**Phạm vi đợt này: CHỈ Slice A (theme — recolor + 2 hiệu ứng còn thiếu).** Slice B (đồng bộ theme
sang trang chi tiết phân hệ) và Slice C (sửa luồng điều hướng PH1/CTA-Modules) đã được đề xuất
nhưng user chọn **để lại cho đợt sau** — xem mục Backlog.

## Yêu cầu hiệu ứng gốc của user (giữ nguyên tinh thần)

> "Background animation phong cách Blueprint quân đội kết hợp sơ đồ tư duy học thuật. Đường nét
> vector thanh mảnh, màu vàng đồng trên nền đen. Animation: Các đường nối giữa các nút kiến thức tự
> động vẽ ra, hiệu ứng ánh sáng quét (scanning light) chạy ngang màn hình định kỳ."

| Yếu tố | Yêu cầu | Đã có trong code? |
|---|---|---|
| Palette | Dark Slate Gray / Olive Drab / Gold Foil / Deep Navy | ✅ có nhưng **sai tông brand** — đợt này đổi sang Đỏ Tác Chiến |
| Texture | Giấy da cũ, kim loại nhám, lưới tọa độ | ✅ đã có (`::after` SVG feTurbulence noise + `L3a/L3b` grid 80px) |
| Tempo | Chậm, vững chãi, trang nghiêm | ✅ đã có (`qtkhcn-scan` 10s ease-in-out) — giữ nguyên |
| Font | Sans-serif hiện đại hoặc monospace đi kèm | ⚠️ **chưa có** — toàn bộ đang là Inter, chưa có điểm nhấn monospace |
| Scanning light quét ngang định kỳ | Có | ✅ đã có (`.qtkhcn-standalone-bg::before`) — giữ nguyên, chỉ đổi màu |
| **Đường nối giữa các nút "tự động vẽ ra"** | Có | ⚠️ **chưa có** — hiện là gradient tĩnh, không phải animation "vẽ dần" |

## Palette đã chốt: "Đỏ Tác Chiến"

Thay thế toàn bộ giá trị màu trong `.qtkhcn-standalone-bg` và các class liên quan
(`.qtkhcn-glass-header`, `.qtkhcn-ping-dot` nếu cần) theo bảng dưới. Giữ nguyên **layer thẻ trắng
bán trong suốt** (`.qtkhcn-glass-card`, `rgba(255,255,255,0.64)`) — không đổi, vì trắng đã là màu
brand.

| Layer (biến CSS) | Giá trị cũ (Navy/Gold) | Giá trị mới (Đỏ Tác Chiến) | Ghi chú |
|---|---|---|---|
| `--blueprint-navy` (nền gốc) | `#0a1628` | `#17090b` | Đen ánh đỏ, phái sinh từ `--vht-ink` (#1b1c1c) nhưng tối + ấm hơn |
| `--blueprint-slate` | `#152238` | `#241012` | Tối hơn 1 chút so với nền gốc, dùng cho glass-header nếu cần lớp phụ |
| `--blueprint-gold-line` (lưới tọa độ) | `rgba(180, 150, 55, 0.10)` | `rgba(238, 0, 51, 0.07)` | Đỏ `--vht-red`, độ mờ giảm nhẹ (0.10→0.07) vì đỏ "nặng mắt" hơn vàng ở cùng alpha |
| `--blueprint-gold-bright` (dùng ở scanning beam) | `rgba(200, 168, 60, 0.16)` | `rgba(238, 0, 51, 0.55)` core / `rgba(238, 0, 51, 0.16)` glow ngoài | Dải quét sáng = đúng đỏ CTA — điểm nhấn thương hiệu rõ nhất trên màn |
| `--blueprint-node` (glow quanh hub mind-map) | `rgba(212, 175, 55, 0.14)` | `rgba(191, 0, 39, 0.14)` | Dùng `--vht-red-chrome` (#bf0027), không dùng `--vht-red` để tránh quá chói khi lặp nhiều node |
| `--blueprint-olive` (glow hữu cơ nền) | `rgba(85, 107, 47, 0.12)` | `rgba(191, 0, 39, 0.08)` | Giảm alpha vì layer này phủ diện tích lớn (ellipse 70%×35%) |
| `.qtkhcn-glass-header` border | `rgba(200, 168, 60, 0.16)` | `rgba(238, 0, 51, 0.16)` | Đồng bộ viền header với palette mới |
| `::before` scanning beam `box-shadow` (glow đổ bóng) | `rgba(212, 175, 55, ...)` x3 | `rgba(238, 0, 51, ...)` x3 (giữ nguyên alpha 0.35/0.14/0.06) | Chỉ đổi hue, giữ nguyên độ mờ |
| `::after` noise texture | không đổi màu (grayscale SVG) | **không đổi** | Texture trung tính, không mang màu — brand-agnostic sẵn |
| `.qtkhcn-ping-dot` (chấm "Hệ thống đang hoạt động") | giữ `#52c41a`/`#389e0d` (xanh lá) | **không đổi** | Đây là màu semantic "active", không thuộc palette nền — giữ nguyên theo AntD status convention |

**Lưu ý khi code**: các biến `--blueprint-*` đang khai báo cục bộ trong `.qtkhcn-standalone-bg`
(`tokens.css:97-107`) — chỉ cần sửa giá trị tại đây, không cần đổi tên biến (giảm diff, dễ review).

## Slice A — việc cần làm

### A1. Recolor palette (theo bảng trên)
File: `webapp/src/branding/tokens.css`, class `.qtkhcn-standalone-bg` (dòng 97–224),
`.qtkhcn-glass-header` (dòng 226–233).

### A2. Hiệu ứng "đường nối tự động vẽ ra"
Hiện tại constellation lines (`L5`, dòng 112–131) là 3 lớp `linear-gradient` tĩnh — về bản chất
không thể animate "vẽ dần" bằng `background-image` gradient. Cần đổi cách tiếp cận:

- **Khuyến nghị**: chuyển layer L5 (constellation) + L4a/L4b (mind-map spokes) từ CSS
  background-gradient sang **SVG inline** (đặt trong `SubsystemList.tsx`, absolute-position phủ
  nền, `pointer-events: none`, `z-index` giữa base và nội dung) với các `<line>`/`<path>` thật, dùng
  `stroke-dasharray` = độ dài path và animate `stroke-dashoffset` từ full → 0 bằng CSS `@keyframes`
  hoặc Web Animations API.
- **Tempo**: chạy **1 lần khi trang mount** (không lặp vô hạn — giữ đúng yêu cầu "trang nghiêm,
  không dồn dập"; lặp liên tục sẽ gây rối mắt cho màn dùng hàng ngày). Có thể có 1 lần "chớp nhẹ"
  (re-draw) mỗi khi user quay lại tab sau thời gian dài, nhưng KHÔNG bắt buộc — mặc định one-shot là đủ.
  Thời lượng gợi ý: 1.5–2.5s, easing `ease-out`, có thể stagger từng đường 100–150ms để tạo cảm giác
  "vẽ nối tiếp" giữa các nút.
  - **Bắt buộc**: tôn trọng `prefers-reduced-motion: reduce` — khi user bật, render các đường ở
    trạng thái đã vẽ xong ngay lập tức (bỏ animation), tương tự cách xử lý chuẩn cho motion-sensitive
    users.
- **Giữ nguyên** layer lưới tọa độ (`L3a/L3b`), 2 lớp glow hub tĩnh (`L4a/L4b` có thể giữ dạng
  conic-gradient tĩnh làm nền, chỉ riêng các "đường nối" L5 cần là SVG động) và radial-gradient glow
  (`L2a/L2b`) — không cần chuyển hết sang SVG, chỉ phần thực sự cần animate "vẽ ra" (các đường nối).

### A3. Font monospace điểm nhấn
- Thêm 1 family monospace vào Google Fonts link đã có sẵn ở `webapp/index.html:12` (cùng cơ chế với
  Inter — chỉ thêm `family=...` vào URL hiện có hoặc thêm 1 `<link>` riêng).
- **Đề xuất font**: `IBM Plex Mono` hoặc `JetBrains Mono` — cả hai hỗ trợ tốt dấu tiếng Việt (cần
  test trực quan trước khi chốt, một số font monospace hiển thị dấu kết hợp xấu).
- **Phạm vi áp dụng** (chỉ chi tiết "dữ liệu/kỹ thuật", KHÔNG áp cho tiêu đề/mô tả tiếng Việt — tránh
  hại khả năng đọc):
  - Mã phân hệ (`PH1`, `PH2`...) — hiện render bằng `Tag` trong `PhanHePage.tsx:128` (trang chi
    tiết, ngoài phạm vi Slice A) và có thể thêm vào card `SubsystemList.tsx` nếu muốn hiển thị mã.
  - Số liệu trong `BentoStatCard` (`SubsystemList.tsx:357-413`) — giá trị số (`value`), không phải
    `label`.
  - Nhãn trạng thái pill trên card (`meta.label` tại `SubsystemList.tsx:227-241`) — cân nhắc, không
    bắt buộc.
- Thêm 1 CSS class tiện ích (vd `.qtkhcn-mono`) trong `tokens.css` thay vì set `fontFamily` inline
  rải rác, để dễ tái sử dụng.

## Backlog — chưa làm đợt này (Slice A only)

- **Slice B** — đồng bộ theme dark/đỏ sang `webapp/src/pages/PhanHePage.tsx` (trang chi tiết phân
  hệ) — hiện vẫn là card sáng bo góc kiểu cũ, sẽ "nhảy" giao diện khi vào từ danh sách đã đổi màu.
- **Slice C** — sửa luồng điều hướng: PH1 (chỉ 1 module) bấm card đi thẳng `/tong-quan` thay vì qua
  trang chi tiết trung gian; hợp nhất đích của nút "Truy cập" và dropdown "Modules" trên card (hiện
  2 nút trỏ 2 nơi khác nhau — `handleClick`/`onNavigate(ph.route)` vs `moduleMenu` items trỏ thẳng
  route module, xem `SubsystemList.tsx:123-150`).
- **D** — nối `pendingTasks` (`data/phanHe.ts:43`, hiện luôn 0) với dữ liệu mock thật.
- **E** — refactor style inline + `onMouseEnter/onMouseLeave` thủ công (rải khắp
  `SubsystemList.tsx`) sang CSS class dùng chung token — nợ kỹ thuật, không đổi UX.
- **F** — user profile/avatar + thông báo tổng hợp trên portal (đề xuất trong
  `docs/research/userflow-sso-app-portal-phan-he-2026-07-09.md` §1, chưa có).

## File liên quan

- `webapp/src/branding/tokens.css` — nơi sửa chính (A1, A3 class tiện ích)
- `webapp/src/pages/SubsystemList.tsx` — nơi thêm SVG đường nối động (A2), áp class monospace (A3)
- `webapp/index.html` — thêm font monospace (A3)
- Tham khảo review gốc: `docs/research/ux-review-danh-sach-phan-he-2026-07-09.md`
- Tham khảo userflow gốc: `docs/research/userflow-sso-app-portal-phan-he-2026-07-09.md`
- Bộ token màu brand hiện có (KHÔNG đổi, chỉ tham chiếu): `--vht-red`, `--vht-red-chrome`,
  `--vht-red-100`, `--vht-ink` — khai báo tại `tokens.css:9-13, 21`
