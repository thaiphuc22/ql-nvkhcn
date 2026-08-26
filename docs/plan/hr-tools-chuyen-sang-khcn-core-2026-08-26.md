# HR Tools — chuyển sang `@khcn-core` + PrimeNG để khớp phân hệ đã build

> Kế hoạch thi công, lập 2026-08-26. Trạng thái: **ĐÃ THI CÔNG XONG cả 6 giai đoạn (2026-08-26); §10.4
> · §10.5 · §10.6 · §10.7 đã chạy thật ngày 2026-08-27 — xem "Kết quả kiểm chứng" ở §10.**
>
> ⚠ Kiểm chứng ngày 2026-08-27 tìm ra **7 lỗi chặn**, trong đó 4 lỗi làm màn hình không dùng được mà
> build vẫn xanh và console vẫn sạch. Toàn bộ đã sửa; chi tiết ở §10.
>
> ⚠ **Bốn chỗ kế hoạch này giả định sai về `@khcn-core`, đã kiểm chứng khi làm** — đọc
> `.harness/state/active-task.md` §"Bốn chỗ thư viện KHÔNG dùng được như kế hoạch giả định" trước khi
> dùng lại bản kế hoạch này làm chuẩn: (1) `CommonLayoutComponent` **không phải shell**, chỉ là khung
> chia vùng, không có topbar/menu; (2) `CmmDatepickerComponent` **không được export**;
> (3) `UbckImport` là luồng **do máy chủ xử lý**, cần `httpService` + `uploadEndpoint`;
> (4) thư viện gọi 26 CSS custom property mà **không package nào định nghĩa**, và cần từ điển
> `@ngx-translate`. Ngoài ra `CardWrapperComponent` bo 12px trong khi bản đã build bo 16px.
>
> **Còn nợ**: §10.4, §10.5 và §10.7 (soi bằng mắt, chạy luồng đầu-cuối, hồi quy 3 phân hệ ng-zorro)
> **chưa chạy** — build xanh không thay được ba bước đó.
>
> Kế hoạch này thay thế §4.3 (shell + component tự dựng) của
> [`hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md`](hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md).

## 1. Bối cảnh

HR Tools đợt 1 (5 màn, mock data) đã chạy được ngày 2026-08-26 trên **ng-zorro + Inter + icon Ant
Design**, theo [D17](../../.harness/state/decisions.md). Sau đó phát hiện hai chuyện làm việc đó
thành sai đích:

1. **Phân hệ Danh mục dùng chung đã build thật** (`vht-ecat-dev.viettelsoftware.com/common-catalog`)
   chạy trên **PrimeNG + Roboto + bộ icon SVG riêng**. Đo trực tiếp bằng Playwright: cùng token màu
   (`#EE0033`, `#1A1C1E`) nhưng khác thư viện component, khác font, khác nhịp kích thước (40/48/56
   thay vì 32/38/39 mặc định ng-zorro) ⇒ nhìn như hai sản phẩm khác nhau dù "chung design system".
2. **`UI-ubck/` trong repo chính là thư viện UI của bản đó** — 4 package `@khcn-core/*` v0.0.1-v21,
   **đã được git track** (24 file, vào từ commit `efe9413`), peer `primeng ^21.1.7`, Angular 21.2.5.
   Nó có sẵn `CommonLayoutComponent`, `UbckTable`, `UBCKPaginator`, 6 icon component,
   `DialogImportFile`, `ValidationModule` — tức phần lớn `shared/hr/*` viết tay hôm 26/08 là **làm
   lại thứ đã có**.

Người dùng chốt ngày 2026-08-26: **khi DS Figma và bản đã build lệch nhau thì bản đã build thắng**,
và dùng `@khcn-core`.

Kết quả mong đợi: HR Tools trông và hành xử **không phân biệt được** với phân hệ Danh mục dùng
chung, dùng chung thư viện component; logic nghiệp vụ đã viết giữ nguyên.

### Số đo đã đối chiếu — nguồn của mọi con số trong plan này

| | DS Figma (`docs/design-system/`) | Bản ecat đã build | HR Tools hiện tại |
|---|---|---|---|
| Thư viện | — | **PrimeNG + `@khcn-core`** | ng-zorro |
| Font | Inter | **Roboto** (self-host TTF) | Inter |
| Topbar | 60px | 60px | 56px |
| Sider | 256px | 256px | 230px |
| Mục nav | 224×48, bo 12 | 224×48, bo 12 | ~38, bo 8 |
| Pill đang chọn | bo **8** | bo **12** | bo 8 |
| Ô dữ liệu bảng | 56px | 56px | mặc định (~39) |
| Header bảng | 36px | **40px** | mặc định |
| Nút / ô nhập | 36px | **40px** | 32px |
| Card | bo 12 | bo **16** | bo 12 |
| Pager trang hiện tại | *tài liệu ghi "viền đỏ"* — **sai**, xem §2.3 | nền xám `#F2F2F2` | **nền đỏ đặc (sai cả hai)** |
| Bản ghi/trang mặc định | 25 | 10 | 25 |

## 2. Điều đã chốt, điều còn mở, và một lỗi tài liệu

### 2.1 Đã chốt

| Hạng mục | Quyết định |
|---|---|
| Thư viện component cho HR Tools | **PrimeNG + `@khcn-core`** |
| Trọng tài khi DS ≠ bản đã build | **Bản đã build thắng** |
| 3 phân hệ cũ (`qlnvkhcn`, `quytrinh`, `he-thong`) | **Không đụng** — vẫn ng-zorro |

### 2.2 Còn mở

**Nguồn package.** Plan này dùng `file:../UI-ubck/...` làm mặc định: chạy được ngay, không cần
credential, và `UI-ubck/` đã git track nên CI cũng chạy được. Nếu VTIT có npm registry nội bộ thì
đổi sau chỉ là sửa `package.json` + thêm `.npmrc` — không ảnh hưởng bất kỳ dòng code nào.

### 2.3 Một lỗi trong `docs/design-system/` cần sửa nhân tiện

`README.md` §5 và `components.md` §Phân trang đều ghi *"trang hiện tại là ô **viền đỏ**"*. Nhưng
`components/pagination.png` cho thấy trang hiện tại là **ô nền xám nhạt bo tròn**, số thường không
viền, chỉ mũi tên mới có khung — và bản đã build cũng đúng như vậy. Chính tài liệu đã dặn *"khi hai
thứ lệch nhau, mở ảnh trong `components/` để đối chiếu"*, nên đây là **tài liệu sai, ảnh đúng**.

---

## 3. Giai đoạn 0 — Sửa tài liệu TRƯỚC khi sửa code

Bỏ qua bước này là bảo đảm phiên sau sẽ "sửa ngược" lại công của phiên này, vì `CLAUDE.md` đang ghi
`docs/design-system/` là nguồn chính thức còn plan đợt 1 ghi "khi lệch thì `docs/design-system/`
thắng" — cả hai mâu thuẫn với quyết định vừa chốt.

- **`.harness/state/decisions.md`** — thêm **D23: HR Tools dùng PrimeNG + `@khcn-core`, thay thế
  D17 trong phạm vi HR Tools**. Ghi rõ: nguồn là quyết định trực tiếp của người dùng (đúng tiền lệ
  D17 thay D7); **D17 vẫn hiệu lực** cho 3 phân hệ cũ; hai thư viện cùng tồn tại là có chủ ý, không
  phải nợ kỹ thuật bỏ quên.
- **`CLAUDE.md`** (mục Design system, ~dòng 102) — giữ `docs/design-system/` là nguồn token, **bổ
  sung**: khi DS lệch với phân hệ đã build thì bản đã build thắng, kèm bảng 6 điểm lệch ở §1 để
  người sau không phải đo lại.
- **`docs/design-system/README.md` §5** và **`components.md` §Phân trang** — sửa mô tả pager theo
  §2.3.
- **`docs/plan/hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md`** — đánh dấu §4.3 đã bị thay thế,
  trỏ sang file này.

## 4. Giai đoạn 1 — Cài đặt & dựng khung (**CỔNG CHẶN**)

Làm trước tiên và **dừng lại báo cáo nếu vỡ** — cả plan phụ thuộc vào việc này chạy được.

Thêm vào `frontend-angular/package.json`:

```jsonc
"@khcn-core/common": "file:../UI-ubck/common-0.0.1-v21/package",
"@khcn-core/theme":  "file:../UI-ubck/theme-0.0.1-v21/package",
"@khcn-core/ui":     "file:../UI-ubck/ui-0.0.1-v21/package",
"primeng": "^21.1.7",
"@angular/cdk": "^21.2.0",        // @khcn-core/ui import @angular/cdk/scrolling
"@ngx-translate/core": "17.0.0",  // peer bắt buộc
"ngx-lottie": "^21.2.0",
"lottie-web": "^5.13.0"
```

`@khcn-core/echarts` **không cài** — đợt này không có biểu đồ.

Đăng ký theme: `providePrimeNG({ theme: THEMES })` từ `@khcn-core/theme` trong `app.config.ts`.

### Ba rủi ro phải xử lý ngay tại cổng này

1. **Xung đột peer version.** `@khcn-core/*` khai peer `@angular/core: "21.2.5"` — **đúng một bản,
   không phải dải** — trong khi repo đang chạy **21.2.18**. `npm install` nhiều khả năng ERESOLVE.
   Xử lý bằng `.npmrc` cấp project (`legacy-peer-deps=true`). **Không** sửa `package.json` của
   package vendor.
2. **PrimeNG và ng-zorro cùng tồn tại.** PrimeNG 21 tiêm style qua `@primeuix/styles`, ng-zorro
   dùng CSS biên dịch sẵn. Phải mở `/nhiem-vu`, `/ma-tran-phe-duyet`, `/phan-he/PH2/nguoi-dung`
   xác nhận không vỡ. **Nếu vỡ thì dừng và báo, đừng vá bằng `!important`.**
3. **Bundle.** Initial hiện **đã vượt ngưỡng sẵn 43 kB** (2,54 MB / 2,50 MB — baseline trước khi
   làm HR Tools đã vượt 28 kB). `@khcn-core/ui` là file 2,1 MB nhưng khai `sideEffects: false` và
   route `/hr` đã lazy, nên phần lớn phải rơi vào lazy chunk. **Đo lại ngay sau bước này**; nếu
   initial phình thì kiểm tra preset theme có bị nạp eager không, trước khi viết bất kỳ màn nào.

**Tiêu chí qua cổng**: `npm install` sạch · `ng build` GREEN · 3 màn cũ không vỡ · có con số bundle mới.

## 5. Giai đoạn 2 — Token

`frontend-angular/src/styles/tokens.scss` — giữ nguyên toàn bộ ramp màu (đã khớp DS), sửa 3 nhóm:

- **6 shadow bản Light + 6 bản Dark** lấy đúng `docs/design-system/README.md` §4. Đặc biệt
  `--vht-shadow-none` **phải là `0 0 0 1px rgba(0,0,0,.08)`** — nó là viền 1px vẽ bằng shadow; để
  `none` là mọi card mất đường bao. Giá trị đang có trong code là **tự đặt, không có nguồn**.
- Thêm `--vht-focus-ring` (`#1677FF` ở 50%) và đủ 10 bậc của success/warning/info.
- Thêm nhóm **`--vht-built-*`** cho 6 chỗ bản đã build lệch DS (font Roboto, control 40, header
  bảng 40, pill bo 12, card bo 16, pager active `#F2F2F2`), khai tường minh kèm ghi chú lý do —
  để sau này muốn quay về DS thì sửa một chỗ, không phải đi dò khắp file.

Font Roboto: **self-host** như bản đã build (`Roboto-{Regular,Medium,Bold,Light}`), không lấy từ
Google Fonts.

## 6. Giai đoạn 3 — Shell

Xoá `layout/hr-shell/` (3 file, 556 dòng). Thay bằng `CommonLayoutComponent` — selector
`app-common-layout`, input `props: ScreenProps`, slot `[header]` / `[left]` / `[right], [content]`.

- Menu **vẫn đọc `navItemsForApp('hrtools')`** — giữ nguyên nguyên tắc "không hardcode menu". Cần
  đọc kiểu `ScreenProps` trong `UI-ubck/ui-0.0.1-v21/package/types/khcn-core-ui.d.ts` để ánh xạ
  `NavItem` sang đúng shape.
- `app.routes.ts`: route `hr` đổi `loadComponent` sang shell mới. **Giữ nguyên thứ tự route** —
  route `hr` phải nằm **trước** route `''`, nếu không parent `''` khớp trước rồi không tìm được con.

## 7. Giai đoạn 4 — 5 màn

Viết lại template bằng `@khcn-core/ui`; **TS giữ gần như nguyên** (signal store, computed, hàm
validate đều không phụ thuộc UI).

| Màn | Thay bằng | Sửa luôn sai lệch so với thiết kế |
|---|---|---|
| `hr-de-tai-list` | `UbckTable` + `UBCKPaginator` | pager active **nền xám** (đang tô đỏ đặc — sai cả DS lẫn bản build) |
| `hr-khai-bao-list` | như trên | khối *Tìm kiếm nâng cao* phải nằm **trong cùng card với bảng**, có nút `Ẩn tìm kiếm nâng cao` ở góc phải trên — hiện đang là card riêng phía trên (xem `screens/06`) |
| `hr-de-tai-detail` | `CmmTabs` + `CmmTimeline` | — |
| `hr-nhan-su-list` | `UbckTable` + `DialogImportFile` / `UbckImport` / `ImportFileService` | thay modal import tự viết |
| `hr-nhan-su-form` | `CmmSelect` / `CmmDatepicker` / `ValidationModule` | tách thành **2 card** ("Thông tin chung" + bảng con), hiện gộp 1 card (xem `screens/04`) |

Component tự viết được thay và **xoá**:

| Xoá | Dùng thay |
|---|---|
| `shared/hr/page-card/` | `CardWrapperComponent` |
| `shared/hr/table-footer/` | `UBCKPaginator` |
| `shared/hr/trang-thai-tag/` | `CmmTagComponent` |
| `shared/hr/nhan-su-picker/` | dựng lại bằng `CmmTreeComponent` + `UbckTable` |

**`nhan-su-picker` phải làm lại đúng nghĩa, không chỉ đổi thư viện.** `screens/05` cho thấy nó khác
hẳn bản đã làm: rộng **1360px** (đang để 880), cây đơn vị **có cấp bậc + chevron** (đang làm danh
sách phẳng), bảng có **avatar + email + số điện thoại + phân trang riêng**, dòng đang chọn nền đỏ
nhạt, nút xác nhận hiện **giá trị đã chọn** chứ không phải số đếm.

**Giữ nguyên** (không có bản thay thế trong thư viện): `shared/hr/bieu-mau-print/`,
`core/utils/export-bieu-mau.ts`, `core/utils/upload-file.ts`.

**Giữ nguyên tuyệt đối** (không phụ thuộc UI): `core/models/hr/`, `core/services/hr/` — gồm ràng
buộc PBNC (`tinhTongPhanBo`) và toàn bộ logic soát lỗi import.

## 8. Giai đoạn 5 — Icon

**Hai ràng buộc đã kiểm chứng, không phải phỏng đoán:**

- `docs/design-system/figma-raw/` **không có dữ liệu vector** — quét cả 8 file, `fillGeometry` và
  `strokeGeometry` đều bằng 0. Bộ DS chỉ có **ảnh PNG** của icon, không dựng ra SVG dùng được.
- `@khcn-core/ui` chỉ có **6 icon component**: `EditIconComponent`, `DeleteIconComponent`,
  `DeletePopupIconComponent`, `EyeIconComponent`, `HistoryIconComponent`, `UndoIconComponent`.
  `@khcn-core/common` không có icon nào.

Cách làm:

1. Dùng ngay 6 icon đó — chúng đúng là bộ lộ nhiều nhất (cột Thao tác của mọi bảng).
2. Phần còn lại (plus, search, bell, filter, upload, download, printer, check, stop, warning,
   chevron, save, send, arrow-left…) dùng **PrimeIcons** (đi kèm PrimeNG, cùng phong cách nét) và
   **ghi thành nợ tường minh** trong `DELIVERY_STATE.md` — không im lặng coi như xong.
3. Đường lấy icon thật, ghi lại để làm sau: sau **2026-08-31** (Figma mở khoá `files/nodes`) export
   bằng `/v1/images?format=svg` — quota ảnh là quota **riêng**, không bị khoá; hoặc xin thẳng bộ
   `/icons/` từ đội làm ecat.

## 9. Giai đoạn 6 — Dọn & spec

- Gỡ `HR_TOOLS_ICONS` khỏi `core/icons-provider.ts` và `app.ts` nếu HR không còn dùng `nz-icon`.
- `app.routes.spec.ts` giữ nguyên (đã dùng `ALL_APP_CODES`, không phụ thuộc thư viện UI).
- `core/services/hr/nhan-su.service.spec.ts` (8 test) **phải vẫn xanh mà không phải sửa** — nếu
  buộc phải sửa thì tức là đã lỡ tay đụng vào logic nghiệp vụ; dừng lại xem lại.
- Cập nhật `.harness/state/DELIVERY_STATE.md` + `active-task.md`.

---

## 10. Kiểm chứng

1. `npx tsc -b --noEmit` sạch.
2. `npx ng test --watch=false` — **đúng 10 fail có sẵn** ở `nav-items.spec.ts` (2) và
   `ho-so-detail.spec.ts` (8); 8 test HR vẫn xanh; không phát sinh fail mới.
3. `npx ng build` GREEN; **ghi lại con số initial bundle** để so với 2,54 MB hiện tại.
4. **So bằng mắt với bản đã build** — chạy `ng serve`, mở `/hr/de-tai` đặt cạnh
   `vht-ecat-dev.viettelsoftware.com/common-catalog/execution-role`, đối chiếu 8 điểm ở bảng §1:
   topbar 60 · sider 256 · nav 224×48 · ô bảng 56 · header bảng 40 · nút 40 · card bo 16 · pager
   active nền xám. Và so với `docs/design-system/screens/01,04,05,06`.
5. **Luồng thật** (bản ng-zorro đã chạy được, phải chạy lại y hệt): đăng nhập `admin@example.com` →
   `/chon-ung-dung` hiện 4 tile → khai báo đề tài → trình duyệt → duyệt → mở chi tiết → sang Nhân
   sự → import file 5 dòng (2 hợp lệ / 3 lỗi, mỗi lỗi nêu đúng nguyên nhân) → nhập 2 dòng hợp lệ →
   thêm nhân sự qua pop-up cây đơn vị → xuất `.xls` (mở được, có BOM, tiếng Việt nguyên vẹn) → in.
6. **Fail-closed**: `pm@example.com` (không có `hrtools`) vào thẳng `/hr/de-tai` phải bị
   `appChildGuard` đẩy về `/chon-ung-dung`.
7. **Hồi quy hai thư viện cùng tồn tại**: mở `/nhiem-vu`, `/ho-so`, `/ma-tran-phe-duyet`,
   `/phan-he/PH2/nguoi-dung` xác nhận PrimeNG không làm vỡ trang ng-zorro.

### Kết quả kiểm chứng — chạy thật 2026-08-27

Chạy trên `ng serve` + Chrome (Playwright), tài khoản `admin@example.com`, backend **không** bật (mọi
lỗi `500 /api/...` dưới đây là do đó, không liên quan giao diện).

**§10.4 — 8 số đo, sau khi sửa: ĐẠT cả 8.** Không đặt cạnh bản ecat được: `vht-ecat-dev.viettelsoftware.com`
**không truy cập được** từ máy này (curl trả `000`, nghi cần VPN nội bộ), nên mốc so sánh là bảng số đo
ở §1 (đã đo từ bản ecat trước đó) + `docs/design-system/screens/`. Đo bằng `getComputedStyle` /
`getBoundingClientRect`, không ước lượng bằng mắt:

| Điểm | Trước khi sửa | Sau khi sửa |
|---|---|---|
| Topbar 60 | 60 ✓ | 60 ✓ |
| Sider 256 | 256 ✓ | 256 ✓ |
| Mục nav 224×48 | **223**×48 | 224×48 ✓ |
| Header bảng 40 | 40 ✓ | 40 ✓ |
| Ô dữ liệu 56 | 56 ✓ | 56 ✓ |
| Nút 40 | 40 ✓ | 40 ✓ |
| Card bo 16 | **12** | 16 ✓ |
| Pager trang hiện tại nền `#F2F2F2` | ✓ | ✓ |
| (kèm) chữ Roboto | **Inter ở 17 chỗ** | Roboto ✓ |

**§10.5 — luồng đầu-cuối: ĐẠT** (đăng nhập → 4 tile → khai báo `NV-2026-008` → trình duyệt → duyệt →
chi tiết → nhân sự → nhập file 5 dòng *(2 hợp lệ / 3 lỗi, mỗi lỗi nêu đúng nguyên nhân: thiếu mã +
email sai · nhiệm vụ không tồn tại · sai định dạng ngày)* → nhập 2 dòng → thêm nhân sự qua pop-up cây
đơn vị *(nút xác nhận hiện "Chọn Phạm Thu Hà")* → xuất `.xls` *(file bắt đầu bằng `EF BB BF`, tiếng
Việt nguyên vẹn)* → in *(BM.06, chrome ẩn, có khối ký)*). Hộp xoá nêu rõ tên bản ghi, thông báo
"Đã xoá phân công của Phạm Thu Hà." hiện đúng.

**§10.6 — fail-closed: ĐẠT.** `pm@example.com` vào thẳng `/hr/nhiem-vu` bị đẩy về `/chon-ung-dung`.

**§10.7 — hồi quy ng-zorro: ĐẠT.** `/nhiem-vu`, `/ho-so`, `/ma-tran-phe-duyet`,
`/phan-he/PH2/nguoi-dung`: layout nguyên vẹn, sider 230px, chữ Inter, **0 phần tử `.p-component`**
(PrimeNG không rò sang), không tràn ngang, không lỗi console ngoài lỗi gọi backend.

### Bảy lỗi chặn tìm ra khi kiểm chứng (đã sửa hết)

Bốn lỗi đầu **không** hiện ra ở `tsc`, `ng build` hay console — đó là lý do build xanh mà màn hình vẫn
sai. Ghi lại để không ai "sửa ngược".

| # | Triệu chứng | Nguyên nhân | Chỗ sửa |
|---|---|---|---|
| 1 | `ng serve` chết ngay khi vào `/hr/**` | `@khcn-core/ui` `import("quill")` mà **không package nào khai `quill`** (kể cả peerDependency) | `angular.json` → `externalDependencies: ["quill"]` |
| 2 | Tab treo cứng (đo được **4386 giây CPU**), không một dòng lỗi | `[ngModel]="ngayDate(...)"` trả `new Date()` mỗi lần gọi ⇒ `<p-datepicker>` thấy input đổi mỗi vòng CD ⇒ lặp vô hạn | `core/utils/hr-date.ts` — bộ nhớ đệm ISO → `Date` |
| 3 | Bảng có 14 tiêu đề, đúng số dòng, **mọi ô trống** | `computedColumn` của thư viện lọc `filter(item => item?.index)`, mà `index` khai là **tuỳ chọn** | `shared/hr/table-columns.ts` (`hrColumns`), dùng ở cả 5 bảng |
| 4 | Nút không có nền, ô nhập mất khung, thẻ mất màu | `providePrimeNG()` gói cấu hình trong `provideAppInitializer` ⇒ **không chạy** ở provider của route nạp lười ⇒ không có biến `--p-*` | `hr.routes.ts` → `provideEnvironmentInitializer(() => inject(PrimeNG).setThemeConfig(...))` |
| 5 | Nút chính **xanh lá** thay vì đỏ VHT | preset trong `UI-ubck/theme-*` là ảnh chụp chưa nhuộm màu (`#0F5A43`); biến `--p-*` do PrimeNG chèn vào `<head>` lúc chạy nên khai ở `:root` thường thua | `khcn-core-compat.scss` PHẦN 3 — `:root:has(app-hr-layout)`, ánh xạ ramp sang `--vht-brand-*` |
| 6 | Lưu xong: dữ liệu đã đổi nhưng **popup không đóng** | `ToastService` là `providedIn: 'root'` nên tra `MessageService` ở injector **gốc**; provider cấp route không với tới ⇒ `NG0201` | `app.config.ts` — `MessageService` lên gốc |
| 7 | Tab **Lịch sử trắng** + `TypeError ... reading 'hanhDong'` mỗi vòng CD; pop-up chọn nhân sự **không chọn được ai** | `cmm-timeline` dựng `#content` với ngữ cảnh rỗng (host không vào DOM); `UbckTable` **không bind `(onClickRow)`** nên `(onClickRecord)` là output chết | tự dựng `.hr-timeline`; `nhan-su-picker` tự gắn `(click)` ở ô tích + tên |

⇒ Danh sách "**chỗ thư viện KHÔNG dùng được như kế hoạch giả định**" tăng từ 4 lên **7**: thêm (5)
`ColumnDefinition.index` bắt buộc trên thực tế, (6) `cmm-timeline` không dùng được, (7) `onClickRecord`
của `UbckTable` không bao giờ bắn.

## 11. Ngoài phạm vi đợt này

Chuyển 3 phân hệ cũ sang `@khcn-core`; backend; nối `maDeTai` vào `nhiem_vu` thật; bảng công, bảng
lương, báo cáo CPNC/PBNC, thông báo; thay PrimeIcons bằng icon SVG thật của DS.

## 12. Việc cần làm ngoài code

**Thu hồi Figma personal access token** đã dùng ngày 2026-08-26 (Figma → Settings → Security →
Revoke). Token đã bị dán trong hội thoại nên phải coi là đã lộ.
