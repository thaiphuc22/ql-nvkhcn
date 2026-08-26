# HR Tools — Quản lý chi phí nhân công, đề tài/dự án (đợt 1: khung + Đề tài + Nhân sự)

> 📌 **HỒ SƠ AS-BUILT — không phải kế hoạch đang hiệu lực.** Kế hoạch thi công hiện hành là
> [`hr-tools-ke-hoach-thi-cong-2026-08-26.md`](hr-tools-ke-hoach-thi-cong-2026-08-26.md).
> File này ghi lại **đợt 1 đã code như thế nào và vì sao** (lý do chọn shell riêng, danh sách component,
> dữ liệu Design System đã trích xuất từ Figma). Phần **hình thức** vẫn đúng; phần **nghiệp vụ**
> (mô hình dữ liệu, trạng thái, ngưỡng) đã bị thay thế — xem §3 của bản hợp nhất để biết phải sửa gì.

> Lập 2026-08-26 khi còn là kế hoạch. Trạng thái thực tế: **ĐÃ CODE XONG**, có nợ hiệu chỉnh nghiệp vụ.
> Nguồn dữ liệu thiết kế: 2 file Figma của VHT, kéo qua REST API ngày 2026-08-26.

## 1. Bối cảnh

Khách hàng (VHT) yêu cầu làm tiếp **HR Tools** — đã xác nhận đây chính là phân hệ **Quản lý chi phí
nhân công cho đề tài / dự án**, gồm 7 nhóm chức năng: danh mục đề tài, khai báo đề tài, nhân sự,
bảng công, bảng lương, báo cáo CPNC/PBNC, thông báo.

Vì bản chất là *chi phí nhân công*, ba trục dữ liệu của phân hệ là **đề tài/dự án** (nơi tiêu tiền),
**nhân sự** (ai tham gia, tỷ lệ phân bổ) và **thời gian/tiền** (bảng công → bảng lương → CPNC).
Đợt 1 làm hai trục đầu; trục thứ ba là điều kiện để báo cáo CPNC/PBNC ở đợt sau có số mà tính.

Khảo sát trước khi lập kế hoạch: **chưa có gì tên HR Tools** trong repo (cả 7 worktree, `docs/`,
`frontend-angular/`, `backend/`). "Làm tiếp" ở đây = dựng mới từ đầu.

### Điều kiện đã chốt với người dùng

| Hạng mục | Quyết định |
|---|---|
| Sản phẩm đợt này | Màn hình Angular, **mock data**, không backend |
| Vị trí | Phân hệ mới ngay trong repo `ql-nvkhcn` |
| Phạm vi đợt 1 | Lát cắt dọc: khung phân hệ + **Đề tài** (danh mục + khai báo) + **Nhân sự** |
| Luồng nghiệp vụ | `Đề tài → Nhiệm vụ → Hồ sơ` ⇒ **Đề tài là thực thể CHA mới**, nằm *trên* `NhiemVu` hiện có |
| Khuôn màn | Đề tài theo khuôn DMDC (*Danh sách + Popup 520px*); Nhân sự theo khuôn Hội đồng (*trang đầy đủ + bảng thành viên + Pop-up chọn nhân sự có cây đơn vị*) |
| Phạm vi áp Design System | Token áp **toàn app**; chrome (topbar/sider) dựng **riêng cho HR Tools** |

Kết quả mong đợi: demo được một phân hệ HR Tools chạy thật, **trông đúng như bản thiết kế Figma**,
đủ để chốt nghiệp vụ với khách trước khi đụng backend.

---

## 2. Dữ liệu Design System đã trích xuất

> **Đã nâng lên thành tài liệu chính thức:** toàn bộ nội dung mục này (và nhiều hơn — đặc tả
> component, ảnh render, JSON gốc) nay nằm ở [`docs/design-system/`](../design-system/README.md).
> Khi hai bên lệch nhau, **`docs/design-system/` thắng**; phần dưới đây giữ lại làm hồ sơ của
> đợt 1.

Nguồn:

| File | fileKey | Dùng để |
|---|---|---|
| `VHT design system` | `OZKhYr4HsliEVd9ggj1xhJ` | Token màu, chữ, spacing, radius, elevation (38 page) |
| `VHT UI DESIGN` | `OEJIdripupJIAC1LFCbMYi` | Màn thiết kế thật, page *UI Design Done* (`324:88659`) |

Node đã dùng để trích xuất (ghi lại để lần sau khỏi dò lại):

- Color — Primitive `3444:1812`, Semantic `3444:13292` (page Color `2354:2`)
- Typography `2354:3` → bảng tham chiếu `3434:13209`
- Grid & Spacing `2458:571` · Elevation System `58102:5861`
- Màn mẫu: Danh sách DMDC `645:72662` · Popup thêm mới `645:77284` · Danh sách hội đồng `3161:107586`
  · Thêm mới hội đồng `3161:107728` · Pop-up chọn nhân sự `3161:108022` · Tìm kiếm nâng cao `4111:56699`

### ⚠ Bẫy đã phát hiện — phần chữ trong file DS bị lệch, KHÔNG dùng

Bảng semantic ghi `interactive/primary #F95E00` (cam) `→ brand/60`, nhưng ramp `brand/60` render ra
**#FF3B4A** và `brand/50` = **#EE0033**; toàn bộ màn thiết kế thật đều dùng đỏ. Kết luận: text nhãn
là dấu vết template cũ ⇒ **lấy theo giá trị render + màn thiết kế**, bỏ qua chữ. Ai đọc file DS sau
này mà tin phần chữ sẽ ra một app màu cam.

### Token

| Nhóm | Giá trị |
|---|---|
| Brand ramp | 10 `#3C0006` · 20 `#61000E` · 30 `#890019` · 40 `#B30024` · **50 `#EE0033`** · 60 `#FF3B4A` · 70 `#FF7F7E` · 80 `#FFAEAB` · 90 `#FFD8D6` · 95 `#FFECEA` · 99 `#FFFBFA` |
| Danger ramp | **trùng hoàn toàn brand ramp** — nút chính và nút xoá cùng đỏ (đúng ý đồ thiết kế) |
| Coolgray | 10 `#1A1C1E` · 20 `#2F3033` · 30 `#45474A` · 40 `#5D5E61` · 50 `#76777A` · 60 `#909094` · 70 `#AAABAE` · 80 `#C6C6C9` · 90 `#E2E2E5` · 95 `#F1F0F4` · 99 `#FCFCFF` |
| Success / Warning / Info (mức 50) | `#008E50` / `#996F00` / `#5573C7` — mức 95: `#CEFFD9` / `#FFEED6` / `#EEF0FF` |
| Typography (Inter) | display 28/120%/-0.5/600 · heading 22/125%/-0.25/600 · title 18/130%/0/600 · subtitle 16/135%/0/500 · body 14/150%/0/400 · body-emphasis 14/150%/0/500 · label 13/140%/+0.1/500 · caption 12/140%/+0.2/400 |
| Spacing | thang 4pt và 8pt: 4·8·12·16·20·24·32·40·48·56·64·72·80·88·96 |
| Radius | 4·8·12·16·20·24·32 |
| Elevation | 6 mức `--shadow-none / sm / md / lg / xl / 2xl` (Light + Dark) |

### Chrome của bản thiết kế (đọc từ ảnh render 6 màn)

- Topbar **tối full-width**: logo VHT đỏ + "QTKHCN / Quản trị KHCN" trái; chuông có badge + avatar phải.
- Sider **trắng**, đầu sider là **thẻ chọn phân hệ** (icon màu + tên phân hệ), nút thu gọn `«` nổi ở
  mép. Mục đang chọn = **pill đỏ đặc bo 8px, chữ trắng**; nhóm cha có chevron.
- Vùng nội dung nền xám nhạt; tiêu đề trang cỡ `display`/`heading` bên trái; **nút chính đỏ góc phải**
  (`+ Thêm mới`). Trang form thì góc phải là cặp `Huỷ` (viền) + nút chính đỏ, kèm nút back `←` bên
  trái tiêu đề.
- Toàn bộ nội dung nằm trong **card trắng bo ~12px, shadow nhẹ**.
- Hàng lọc **căn phải** trong card (select + ô tìm kiếm có icon kính lúp); biến thể *Tìm kiếm nâng cao*
  là khối riêng bên trên bảng, lưới 3 cột, cặp nút `Làm mới` + `Tìm kiếm` căn phải.
- Bảng: header nền xám nhạt; cột **STT · Thao tác** (icon bút + thùng rác đỏ) rồi mới tới dữ liệu;
  trạng thái là toggle đỏ hoặc tag chấm tròn (`● Hoàn thành` nền xanh nhạt); mã là **link đỏ gạch chân**.
- Footer bảng: trái `Hiển thị bản ghi/trang: [25 ▾]`, phải `Tổng số bản ghi: 1000` + pager
  `« ‹ 1 2 3 4 … 99 › »`.
- Footer sider: `v1.0 - © 2026`.

---

## 3. Vì sao chọn "token toàn app + shell riêng cho HR Tools"

Hạ tầng theme **đã có sẵn**: `src/theme.less` đang để `@primary-color: #ee0033` (đúng bằng `brand/50`
của DS), font Inter, radius 8px; `src/styles/tokens.scss` đã có bộ biến `--vht-*`. Chỉnh token là sửa
**2 file, chỉ đổi giá trị**, cả app tự hưởng, rủi ro thấp.

Ngược lại, chrome của thiết kế (topbar tối full-width + sider trắng) **ngược cấu trúc** shell hiện tại
(sider tối + header sáng). Sửa shell chung sẽ đổi giao diện mọi màn đang demo — đó mới là phần đắt và
dễ vỡ.

⇒ HR Tools dùng **shell riêng** dựng đúng DS; các màn cũ giữ shell cũ, chỉ đổi màu/chữ theo token.
Shell mới viết sao cho **không phụ thuộc gì vào HR Tools**, để sau này muốn chuyển cả app sang thiết
kế mới thì chỉ đổi component shell ở `app.routes.ts` — một dòng.

---

## 4. Việc cần làm

### 4.1 Token — áp DS toàn app

- `frontend-angular/src/styles/tokens.scss`: thay bộ `--vht-*` bằng ramp DS đầy đủ
  (`--vht-brand-10…99`, `--vht-gray-10…99`, success/warning/info + biến thể `-subtle`), thêm thang
  `--vht-space-*`, `--vht-radius-*`, `--vht-shadow-*`, và 8 lớp typography
  (`--vht-font-display/heading/title/subtitle/body/body-emphasis/label/caption`).
  **Giữ nguyên tên biến cũ đang được dùng** (`--vht-red`, `--vht-ink`, `--vht-surface`…) dưới dạng
  alias trỏ vào ramp mới — đổi tên là mọi `.scss` của trang cũ hỏng im lặng.
- `frontend-angular/src/theme.less`: sửa 3 giá trị đang lệch DS — `@success-color` `#006e0d`→`#008E50`,
  `@warning-color` `#daa520`→`#996F00`, `@error-color` `#ba1a1a`→`#EE0033`; thêm `@info-color: #5573C7`
  và `@heading-color`/`@text-color`/`@text-color-secondary`/`@border-color-base` theo thang coolgray.

### 4.2 Khung phân hệ

| File | Thay đổi |
|---|---|
| `core/auth/app-registry.ts` | Thêm `'hrtools'` vào `AppCode` + entry (label **"Quản lý chi phí nhân công"**, mô tả "Đề tài/dự án, nhân sự, bảng công, bảng lương và chi phí nhân công nghiên cứu", icon `team`, `defaultRoute: '/hr/de-tai'`) |
| `core/auth/demo-users.ts` | Cấp `'hrtools'` cho `admin@` và `tp-ns@` |
| `layout/nav-items.ts` | 2 nhóm `app: 'hrtools'`: **Quản lý đề tài** (Danh mục đề tài, Khai báo đề tài) + **Quản lý nhân sự**; bổ sung `SECTION_TITLE_BY_ROUTE` |
| `app.routes.ts` | 6 route lazy dưới `/hr/...`, `data: { title, app: 'hrtools' }`, bọc bởi `HrShell` |

**Hai spec sẽ đỏ nếu quên** — bẫy có sẵn trong repo: `app.routes.spec.ts:8` khẳng định mọi route thuộc
đúng **3** app; `nav-items.spec.ts` khẳng định `navItemsForApp()` trả đúng danh sách key. Phải cập
nhật cả hai cùng lúc.

| Route | Trang | Chức năng |
|---|---|---|
| `/hr/de-tai` | `hr-de-tai-list` | Danh sách + lọc + xoá + popup thêm/sửa + duyệt bản khai |
| `/hr/de-tai/:ma` | `hr-de-tai-detail` | Chi tiết: thông tin chung + tab Nhân sự / Nhiệm vụ / Lịch sử |
| `/hr/khai-bao-de-tai` | `hr-khai-bao-list` | Bản khai của tôi/đơn vị + trình duyệt |
| `/hr/nhan-su` | `hr-nhan-su-list` | Danh sách + lọc + import + sửa + xoá + duyệt + xuất Excel + in |
| `/hr/nhan-su/moi`, `/hr/nhan-su/:id/sua` | `hr-nhan-su-form` | Trang đầy đủ theo khuôn "Thêm mới hội đồng" |

### 4.3 Shell + component dùng chung theo DS

- `layout/hr-shell/` — topbar tối full-width (logo + chuông + avatar), sider trắng có thẻ phân hệ ở
  đầu, pill đỏ cho mục đang chọn, nút thu gọn nổi ở mép, footer `v1.0 - © {{year}}`. Đọc
  `navItemsForApp('hrtools')` — **không hardcode menu**.
- `shared/hr/page-card/` — khung card trắng + tiêu đề trang + slot nút hành động góc phải.
- `shared/hr/table-footer/` — `Hiển thị bản ghi/trang` + `Tổng số bản ghi` + pager, thay footer mặc
  định của `nz-table` (`[nzFrontPagination]="false"`), vì thiết kế khác hẳn pager Ant mặc định.
- `shared/hr/advanced-search/` — khối *Tìm kiếm nâng cao* thu gọn được, lưới 3 cột, `Làm mới`/`Tìm kiếm`.
- `shared/hr/nhan-su-picker/` — Pop-up chọn nhân sự: cây đơn vị trái + bảng có radio/checkbox phải +
  ô tìm kiếm + footer `Huỷ` / `Chọn (n)`. Dùng cho cả bảng thành viên đề tài lẫn màn nhân sự.
- `core/utils/export-bieu-mau.ts` — xuất `.xls` (bảng HTML qua `Blob` + `URL.createObjectURL`, đúng
  cách `pages/bpmn-editor/bpmn-editor.ts:108` đang kết xuất file). **Không thêm dependency**; nếu khách
  bắt buộc `.xlsx` chuẩn thì mới cân nhắc SheetJS — quyết định riêng, không tự thêm.
- `shared/hr/bieu-mau-print/` — view in theo biểu mẫu + `@media print` ẩn chrome; gọi `window.print()`.

### 4.4 Model + mock store

`core/models/hr/de-tai.ts`, `core/models/hr/nhan-su.ts` — kiểu + seed + nhãn tiếng Việt, theo cách
`core/models/service-task.ts` tổ chức seed.

- `DeTai`: `maDeTai`, `tenDeTai`, `linhVuc`, `donViChuTri`, `chuNhiem`, `nguonKinhPhi`, `tongKinhPhi`,
  `namBatDau`/`namKetThuc`, `trangThai` (`NHAP|CHO_DUYET|HIEU_LUC|TAM_DUNG|DONG|TU_CHOI`), `moTa`,
  `nguoiKhaiBao`, `ngayKhaiBao`, `lichSu[]`.
- `NhanSuDeTai`: `maNhanVien`, `hoTen`, `email`, `donVi`, `chucDanh`, `deTaiId`, `vaiTroTrongDeTai`,
  `tyLePhanBo` (% PBNC), `tuNgay`/`denNgay`, `trangThaiDuyet`, `ghiChu`, `lichSu[]`.

Seed nhân sự **tái dùng `ORG_USERS`** (`core/models/org-users.ts`, 14 người đã có `donVi`/`chucDanh`/
`email`) thay vì bịa danh sách mới — giữ dữ liệu demo nhất quán với các màn đang có.

Service: `core/services/hr/de-tai.service.ts`, `nhan-su.service.ts` — signal store in-memory, **không
`HttpClient`**, đúng khuôn `core/services/service-task.service.ts`. Phơi
`list/get/create/update/remove/submit/approve/reject/importRows`.

### 4.5 Điểm nghiệp vụ không được làm hời hợt

- **Import nhân sự**: tải template → chọn file → parse client-side → **preview validate từng dòng**
  (thiếu mã NV, sai email, trùng, đề tài không tồn tại, tổng `tyLePhanBo` > 100%) → chỉ nhập dòng hợp
  lệ. Không im lặng bỏ dòng lỗi. Upload dùng `nzBeforeUpload` chặn upload thật + `FileReader`, theo
  `pages/process-catalog/process-catalog.ts:318`.
- **Cảnh báo vượt phân bổ**: một người có tổng `tyLePhanBo` > 100% trong cùng kỳ phải hiện cảnh báo đỏ
  — đây là ràng buộc PBNC có nghĩa thật, không chỉ là bảng CRUD.
- **Phê duyệt**: chọn nhiều dòng → Trình duyệt → Duyệt/Từ chối kèm lý do, ghi `lichSu`. Không chạy
  Camunda ở đợt này.

### 4.6 Cập nhật harness state (bắt buộc theo `CLAUDE.md`)

Foundations mới 1/6 và `active-task.md` đang là RD02.02 v3 ⇒ ghi rõ trong
`.harness/state/DELIVERY_STATE.md` rằng đợt này chuyển hướng **theo chỉ đạo trực tiếp của người dùng**
(đúng tiền lệ entry 2026-07-30), cập nhật `active-task.md` sang HR Tools đợt 1, và ghi vào
`decisions.md` **2 mục đề xuất, chưa khoá**:

- (a) **Đề tài là thực thể cha trên `NhiemVu`** — đứng cạnh D8 (`NhiemVu` vs `HoSo`), không được để ngầm.
- (b) **DS VHT là nguồn token chính thức**, kèm ghi chú bẫy "text nhãn trong file DS bị lệch".

---

## 5. Kiểm chứng

1. `cd frontend-angular && npx tsc -b --noEmit` — sạch.
2. `npm run test` — `app.routes.spec.ts` + `nav-items.spec.ts` xanh. Baseline hiện có **10 test fail
   sẵn** ở `nav-items.spec.ts` và `ho-so-detail.spec.ts` (ghi trong `DELIVERY_STATE.md` 2026-08-25);
   chỉ cần không phát sinh fail mới.
3. `npm run build` — production build GREEN.
4. **So bằng mắt với Figma**: chạy `npm start`, chụp `/hr/de-tai` và `/hr/nhan-su/moi`, đặt cạnh ảnh
   render các node `645:72662` / `3161:107728`. Đối chiếu 6 điểm: topbar tối, pill đỏ ở sider, card bo
   góc, hàng lọc căn phải, cột STT·Thao tác, footer phân trang.
5. Luồng thật: `admin@example.com` / `123456` → `/chon-ung-dung` hiện **4 tile** → HR Tools → khai báo
   1 đề tài → trình duyệt → sang Danh mục duyệt → mở chi tiết → sang Nhân sự → import file mẫu (cố ý có
   2 dòng lỗi) → duyệt hàng loạt → xuất Excel (mở được bằng Excel) → in.
6. Fail-closed: đăng nhập `pm@example.com` (không có `hrtools`) → vào thẳng `/hr/de-tai` phải bị
   `appChildGuard` đẩy về `/chon-ung-dung`.
7. Hồi quy màu: mở `/ho-so`, `/nhiem-vu`, `/ma-tran-phe-duyet` xác nhận đổi token không vỡ layout cũ.

---

## 6. Ngoài phạm vi đợt này

Bảng công, bảng lương, báo cáo thống kê CPNC/PBNC, thông báo; trình ký VOffice; backend + migration;
nối `maDeTai` vào `nhiem_vu` thật; RBAC thật cho HR Tools (đợt này dùng entitlement demo phía client);
chuyển các màn cũ sang shell mới.

Kế hoạch cho những phần trên: [`hr-tools-chi-phi-nhan-cong-dot-2-den-6-2026-08-26.md`](hr-tools-chi-phi-nhan-cong-dot-2-den-6-2026-08-26.md).

**Một điểm ở đợt 2 có thể quay lại sửa đợt 1:** nếu khách chốt công thức CPNC theo *phương án A*
(tính từ công thực tế — xem mục 1 của tài liệu đợt 2→6), thì `tyLePhanBo` trong `NhanSuDeTai` mang
nghĩa **hạn mức kế hoạch** để đối chiếu, chứ không phải đầu vào tính tiền. Điều đó không đổi cấu trúc
dữ liệu đợt 1, chỉ đổi nhãn và câu chữ trên UI.

## 7. Việc cần làm ngoài code

**Thu hồi Figma personal access token** đã dùng để kéo dữ liệu (Figma → Settings → Security → Revoke).
Token đã bị dán dạng chữ thường trong hội thoại nên phải coi là đã lộ.
