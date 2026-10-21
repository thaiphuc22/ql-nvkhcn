# RD07 — Lọc theo Nhóm RD + Seed biểu mẫu mẫu (client-side)

**Bối cảnh:** User yêu cầu bổ sung tính năng trên trang Thư viện biểu mẫu
(`/phan-he/PH3/bieu-mau`) dựa trên luồng nghiệp vụ **RD07. QUẢN LÝ DANH MỤC
DỊCH VỤ, SẢN PHẨM NGHIÊN CỨU** (4 tuyến: Đơn vị QLDM SPDV / TT Đo VHT /
TT NCSP / PT-CKT VHT · 7 bước).

**Quyết định chốt với user qua 2 lượt AskUserQuestion:**
- Phạm vi: **Cả hai** — seed biểu mẫu + bộ lọc theo Nhóm RD.
- Mức seed: **Seed tạm thời qua dev/mock data**, client-side fallback
  (khi backend `/api/eform` trả rỗng thì Angular tự nạp seed vào cache,
  KHÔNG qua POST API; không cần Flyway migration; không cần rebuild
  backend).

**Ràng buộc từ state:** repo đang ở worktree có rất nhiều code chưa commit
của các phiên song song (theo `git status` đầu phiên), một số file build
bị chặn bởi lỗi pre-existing không liên quan (`nav-items.spec.ts`,
`ho-so-detail.ts` duplicate member). Phải tránh đụng vùng đó.

---

## Phạm vi thay đổi

### File mới (2)
1. `frontend-angular/src/app/core/models/eform-nhom-rd.ts`
   - Định nghĩa const `NHOM_RD` (RD01..RD10) + map nhãn hiển thị tiếng Việt.
   - Type `NhomRD = keyof typeof NHOM_RD` (literal string union).
   - Helper `nhomRDSorted()` trả danh sách đã sắp xếp cho dropdown.

2. `frontend-angular/src/app/core/data/eform-rd07-seed.ts`
   - Export `RD07_FORM_SEEDS: FormMeta[]` — 4 biểu mẫu mẫu cho RD07, đặt
     tên theo từng bước trong sơ đồ BPMN:
     - `bm-07-01-cnhap-dm-spdv-dau-nam` — "Cập nhật DM SPDV đầu năm"
       (Bước 1, Đơn vị QLDM SPDV).
     - `bm-07-02-yeu-cau-cap-nhat` — "Yêu cầu cập nhật DM SPDV"
       (Bước 2, Đơn vị QLDM SPDV, ngày 20 tháng cuối quý).
     - `bm-07-03-tong-hop-thong-tin` — "Tổng hợp thông tin cập nhật DM"
       (Bước 6, là gateway kiểm tra dữ liệu cũ / mới).
     - `bm-07-04-xac-nhan-cap-nhat` — "Xác nhận cập nhật DM SPDV quý N"
       (Bước 7, end).
   - Mỗi form có `schema` tối thiểu form-js hợp lệ (1 tiêu đề + 2-3 trường
     minh hoạ) để user có thể bấm "Thiết kế" vào designer mà không lỗi
     trắng — đúng pattern đã có ở `emptySchema(key, ten)`.
   - Mỗi form có field `nhomRD: 'RD07'`, `loai: 'Soạn thảo'|'Phê duyệt'`
     tuỳ ngữ nghĩa, `version: 1`, `keyTaken`-safe.

### File sửa (3)

3. `frontend-angular/src/app/core/models/eform.ts`
   - Thêm field optional `nhomRD?: NhomRD` vào `FormMeta`.
   - Không thêm `key`/`version` thay đổi.

4. `frontend-angular/src/app/core/services/eform.service.ts`
   - Sửa `load()`: nếu backend trả mảng rỗng → fallback inject
     `RD07_FORM_SEEDS` vào cache (chỉ khi rỗng; backend có data thì
     backend thắng, không trộn lẫn — tránh "lệch pha" giữa thật/giả).
   - Sửa `addForm()`: tự động thêm `nhomRD` nếu người dùng truyền vào.
   - KHÔNG đụng endpoint HTTP (giữ nguyên DTO request/response — backend
     chưa biết `nhomRD`, OK).

5. `frontend-angular/src/app/pages/form-library/form-library.ts`
   - Thêm signal `nhomRDFilter = signal<NhomRD | null>(null)`.
   - Cập nhật `filteredList` computed thêm nhánh lọc theo `nhomRD` (AND
     với search/type filter hiện có).
   - Thêm const `nhomRDOptions = NHOM_RD` cho template dropdown.
   - Truyền `nhomRD` qua `addForm()` khi người dùng mở modal tạo — mặc
     định rỗng (chọn "Khác"), backend không nhận field này nhưng
     FormMeta cache có.

6. `frontend-angular/src/app/pages/form-library/form-library.html`
   - Thêm `nz-select` "Nhóm RD" trong `.fl-filter-bar` (cạnh ô tìm kiếm
     + dropdown Loại hiện có).
   - Thêm cột "Nhóm RD" trong `<nz-table>`, render badge màu nhạt theo
     `nhomRD` (CSS thêm vào scss).

7. `frontend-angular/src/app/pages/form-library/form-library.scss`
   - Style `.fl-nhom-filter` (width 140px), `.fl-nhom-badge` (pill nhỏ
     theo nhomRD — RD01 đỏ, RD02 cam, ... — lấy cảm hứng từ `swimlane`
     trong `ProcessMapView` đã có ở `tranngdt` branch).
   - Style `.fl-seed-banner` (banner nhỏ phía trên bảng khi danh sách
     đến từ seed, text "Đang hiển thị biểu mẫu mẫu RD07 (chưa có dữ
     liệu thật từ backend)").

8. `frontend-angular/src/app/pages/form-library/form-library.spec.ts`
   - Thêm 2 case mới:
     - "hiển thị biểu mẫu seed khi backend trả rỗng" — assert
       `list().length > 0` sau khi flush `[]`.
     - "lọc theo Nhóm RD chỉ giữ form đúng nhóm" — flush 2 form
       (RD07 + RD01), set `nhomRDFilter('RD07')`, assert
       `filteredList().length === 1`.
   - Cập nhật `response()` helper nếu cần để gắn `nhomRD`.

---

## Điểm chú ý / rủi ro

- **Không đụng backend** (D14, D15, D21 đều đã khoá; đụng sẽ là "reopen
  decisions"). Mọi thay đổi thuộc Angular frontend only. Nếu sau này
  user muốn lưu `nhomRD` thật sẽ tạo task mới với Flyway migration + DTO
  backend.
- **`fromSeed` không lưu vào FormMeta** — chỉ là đặc tính runtime của
  cache client, không persist. Khi reload trang, `load()` chạy lại,
  nếu backend rỗng lại nạp seed. Đúng tinh thần "seed tạm thời".
- **Banner "đang dùng seed"** cảnh báo user dữ liệu chưa thật — tránh
  hiểu nhầm biểu mẫu RD07 mẫu là biểu mẫu đã được duyệt.
- **4 form mẫu RD07** chỉ mang tính chất minh hoạ cấu trúc BPMN, không
  thay thế BA — schema sẽ rỗng / placeholder, user có thể vào designer
  sửa tiếp hoặc xoá đi.
- **Tránh đụng vùng song song**: chỉ sửa 3 file trong scope, không mở
  rộng ra `eform.service.spec.ts` hay `eform-import.ts` (xem git status
  — không file nào khác liên quan eform đang sửa dở).

---

## Verify

- `npx tsc -b --noEmit` sạch.
- `ng test --include='**/form-library.spec.ts'` PASS (cũ + mới).
- `ng build --configuration production` GREEN.
- Click-through tay (không có Playwright trong scope này):
  - Mở `/phan-he/PH3/bieu-mau` khi backend rỗng → thấy 4 form RD07
    mẫu + banner "đang dùng seed".
  - Chọn dropdown "Nhóm RD = RD07" → chỉ còn 4 form đó.
  - Chọn "RD01" → 0 form.
  - Tạo form mới với `ten="Phiếu test"`, mở modal — không cần đổi gì ở
    modal cũ (chưa gắn Nhóm RD trong modal Tạo mới, giữ scope gọn).

---

## Chưa làm (giành cho task sau)

- Seed thật qua Flyway migration (cần quyết định D mới).
- Modal "Tạo biểu mẫu" cho phép chọn Nhóm RD ngay khi tạo.
- Lọc kết hợp search + type + Nhóm RD trên service thật
  (`GET /api/eform?nhomRD=RD07`) thay vì client-side.
- Biểu mẫu RD07 schema thật do BA cung cấp (`docs/ba/`).
