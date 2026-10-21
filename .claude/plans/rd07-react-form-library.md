# RD07 — Thư viện biểu mẫu (React `webapp`)

## Bối cảnh

Trước đó tôi đã làm tính năng RD07 (filter Nhóm RD + seed 4 form mẫu + banner cảnh báo) cho **Angular frontend** ở `frontend-angular/`. Tuy nhiên user xác nhận đang chạy **React frontend** ở `http://localhost:5173/ql-nvkhcn/#/phan-he/PH3/bieu-mau` (file [`webapp/src/pages/FormLibrary.tsx`](webapp/src/pages/FormLibrary.tsx)) — React app CHƯA có những thay đổi này. Tính năng cần được port sang React.

## Quyết định đã chốt (qua hỏi user)

| Câu hỏi | Trả lời |
|---|---|
| Seed RD07 tự động hay qua nút bấm? | **Qua nút bấm thủ công** — header có nút "Nạp biểu mẫu mẫu RD07" |
| Có nút "Xoá hết biểu mẫu mẫu" không? | **Có** — chỉ hiển thị khi đang ở chế độ seed (tất cả form đều là seed), cho phép reset về list rỗng để demo lặp lại |

## Phạm vi thay đổi

### File mới (2)

1. **`webapp/src/eform-nhom-rd.ts`** — constants + helpers:
   - `NHOM_RD` map RD01..RD10 (label tiếng Việt) — đối chiếu với [`frontend-angular/src/app/core/models/eform-nhom-rd.ts`](frontend-angular/src/app/core/models/eform-nhom-rd.ts)
   - `NhomRD` type = `keyof typeof NHOM_RD`
   - `NHOM_RD_ORDER: NhomRD[]`
   - `nhomRDLabel(code)` → `'RD07 — Quản lý Danh mục DV, SP NC'`
   - `NHOM_RD_PILL_COLOR: Record<NhomRD, string>` — màu pill cho từng nhóm

2. **`webapp/src/eform-rd07-seed.ts`** — 4 `FormMeta` mẫu (Bước 1, 2, 6, 7 của RD07):
   - `bm-07-01-cnhap-dm-spdv-dau-nam` — Cập nhật DM SPDV đầu năm (Soạn thảo)
   - `bm-07-02-yeu-cau-cap-nhat` — Yêu cầu cập nhật DM SPDV (Soạn thảo)
   - `bm-07-03-tong-hop-thong-tin` — Tổng hợp thông tin cập nhật DM (Thẩm định)
   - `bm-07-04-xac-nhan-cap-nhat` — Xác nhận cập nhật DM SPDV quý N (Phê duyệt)
   - Mỗi form có `nhomRD: 'RD07'`, schema form-js tối thiểu (header text + 2-3 trường nhập liệu + 1 checkbox)
   - Export `RD07_FORM_SEEDS: FormMeta[]`

### File sửa (3)

3. **`webapp/src/forms/index.ts`** — thêm field `nhomRD?: NhomRD` vào interface `FormMeta`:
   ```typescript
   export interface FormMeta {
     key: string
     ten: string
     moTa: string
     loai?: 'Soạn thảo' | 'Góp ý' | 'Nhận xét' | 'Thẩm định' | 'Phê duyệt'
     nhomRD?: NhomRD   // ← MỚI — đối chiếu với Angular (D9 trong decisions.md)
     schema: unknown
   }
   ```
   KHÔNG sửa `seedForms` gốc (giữ nguyên — seed gốc dùng cho các RD khác).

4. **`webapp/src/store/FormContext.tsx`** — mở rộng context API:
   - Thêm `nhomRD?: NhomRD` vào input của `addForm` (user chọn nhóm khi tạo biểu mẫu mới).
   - Thêm `seedRD07(): { added: number; skipped: string[] }` — nạp `RD07_FORM_SEEDS` vào `list`, bỏ qua các key đã tồn tại.
   - Thêm `clearRD07Seed(): number` — xoá tất cả form có key bắt đầu `'bm-07-'`, trả về số lượng đã xoá.
   - `addForm` không tự động gắn nhóm — user phải chọn rõ.

5. **`webapp/src/pages/FormLibrary.tsx`** — UI updates (giữ nguyên phần lớn, chỉ thêm):
   - **State mới**: `nhomRDFilter: NhomRD | null` + `searchQuery: string` (đã có sẵn 1 phần).
   - **Filter logic**: list filtered = `list.filter(f => (!nhomRDFilter || f.nhomRD === nhomRDFilter))`. Nếu `nhomRDFilter = null` → hiển thị tất cả.
   - **Banner cảnh báo** (chỉ hiện khi list rỗng HOẶC tất cả form là seed) — kiểu `Alert` của antd, màu warning, icon:
     > "Đang hiển thị biểu mẫu mẫu RD07 — bấm 'Xoá hết biểu mẫu mẫu' nếu muốn bắt đầu lại."
   - **Nút "Nạp biểu mẫu mẫu RD07"** — header `PageHeader.extra`. Bấm → gọi `seedRD07()` → `message.success` hoặc `message.warning` (nếu đã có sẵn). Bị disable khi tất cả form đã có sẵn (`added === 0 && skipped.length > 0`).
   - **Nút "Xoá hết biểu mẫu mẫu"** — header, có `Popconfirm`. Chỉ hiển thị khi `list.some(f => f.key.startsWith('bm-07-'))`. Bấm → `clearRD07Seed()`.
   - **Cột "Nhóm RD"** trong `EntityTable` (thêm vào `columns`):
     - Hiển thị `Tag` với `backgroundColor = NHOM_RD_PILL_COLOR[f.nhomRD]` (chỉ render khi có `nhomRD`), text trắng, label = code (RD07).
     - Nếu không có `nhomRD` → hiển thị `—` màu xám.
   - **Dropdown filter "Nhóm RD"** — header, cạnh nút "Tạo biểu mẫu". Options: `RD01..RD10` với label đầy đủ (`nhomRDLabel`) + count `(N)` cho mỗi nhóm. Có `allowClear`.
   - **Modal "Tạo biểu mẫu"** — thêm Form.Item `Nhóm RD` (Select với options RD01..RD10, `allowClear`). Submit kèm `nhomRD`.

### Không sửa

- `webapp/src/pages/FormDesigner*.tsx` — designer không thay đổi.
- `webapp/src/store/ProcessContext.tsx` — `usage` map đếm form key vẫn hoạt động bình thường.
- Không có file test (webapp không có test runner trong `package.json`).

## Rủi ro & giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| User Forms đã có (`seedForms`) bị gắn nhầm `nhomRD` | Để `nhomRD?: optional`. Seed gốc KHÔNG gắn. Filter `nhomRD` chỉ match các form có field đó. |
| `seedRD07()` bị gọi nhiều lần → tạo duplicate | Dùng `key.startsWith('bm-07-')` để skip + trả về `{ added, skipped }` để hiển thị message đúng. |
| Banner che hết table khi không muốn | Banner collapse khi user xoá hết form seed (chỉ hiện khi có ít nhất 1 form seed). |
| Type `nhomRD` không tương thích với `loai` enum | 2 field độc lập — không coupling. Filter riêng. |
| `EntityTable` không render được Tag màu custom | Tag của antd hỗ trợ `style={{ backgroundColor, color: '#fff' }}` — dùng style inline. |

## Verification

1. `cd webapp && npx tsc -b --noEmit` → clean.
2. `cd webapp && npx vite build` → GREEN (chỉ cảnh báo budget nếu có).
3. `cd webapp && npm run dev` → mở `http://localhost:5173/ql-nvkhcn/#/phan-he/PH3/bieu-mau`:
   - [ ] Trang load với list mặc định (10 form seed gốc + 4 form seed RD07 hiện có trong `forms/index.ts`? — kiểm tra: KHÔNG có, vì `RD07_FORM_SEEDS` chỉ được inject qua nút).
   - [ ] Bấm "Nạp biểu mẫu mẫu RD07" → list thêm 4 form, banner xuất hiện.
   - [ ] Filter `RD07` → chỉ hiển thị 4 form seed.
   - [ ] Filter `RD01` → không có form nào (vì seed gốc không gắn nhóm) → hiển thị empty.
   - [ ] Clear filter → hiển thị tất cả.
   - [ ] Bấm "Xoá hết biểu mẫu mẫu" → 4 form RD07 biến mất, banner biến mất.
   - [ ] Bấm "Tạo biểu mẫu" → modal có thêm dropdown "Nhóm RD" → chọn RD07 → form mới có badge RD07.

## Files touched (tổng cộng 5)

- **Mới**: `webapp/src/eform-nhom-rd.ts`, `webapp/src/eform-rd07-seed.ts`
- **Sửa**: `webapp/src/forms/index.ts`, `webapp/src/store/FormContext.tsx`, `webapp/src/pages/FormLibrary.tsx`
