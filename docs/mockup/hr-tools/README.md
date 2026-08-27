# HR Tools — bộ mockup HTML/CSS tĩnh để kết xuất sang Figma

**77 artboard** phủ **toàn bộ** phân hệ Quản lý chi phí nhân công — cả màn **đã code** (đợt 1) lẫn
màn **chưa code** (đợt 1.5 → 5 trong
[kế hoạch thi công](../../plan/hr-tools-ke-hoach-thi-cong-2026-08-26.md)) — dựng bằng HTML/CSS tĩnh
thuần, không JavaScript, không phụ thuộc mạng, để nhập thẳng vào Figma bằng **html.to.design**.

> **Đây là bản vẽ, không phải sản phẩm.** Nó không thay thế màn Angular; nó là thứ mang đi duyệt
> với khách và là đầu vào để dựng file Figma.
>
> Với nhóm **1x — màn đã code**, chiều ưu tiên ngược lại: khi artboard lệch bản Angular đang chạy
> thì **bản Angular đúng**, sửa artboard chứ đừng sửa code theo artboard.

---

## Xem ngay

Thư mục `dist/` **không nằm trong git** — chạy `node build.js` một lần rồi mở
[`dist/index.html`](dist/index.html) bằng trình duyệt. Trang mục lục liệt kê 77 artboard theo đợt.
Không cần `npm install`, không cần mạng: CSS nhúng thẳng trong từng file, font Roboto self-host.

## Dựng lại sau khi sửa

```bash
cd docs/mockup/hr-tools
node build.js         # src/pages/*.page.js  →  dist/*.html
node check.js         # soi luật CSS, thẻ lệch, icon-font sót, biến chưa thay
node check-layout.js  # soi bảng lệch cột, bảng tràn khung, artboard lồng nhau
```

Không cần `npm install` — chỉ dùng thư viện chuẩn của Node.

---

## Rà soát so với tài liệu khách — 2026-08-27

Đối chiếu lại toàn bộ bộ artboard với ba nguồn của khách
([`phan-ra-chuc-nang.md`](../../hr_tool/trich-xuat/phan-ra-chuc-nang.md) — phạm vi chính thức,
[`dac-ta-man-hinh.md`](../../hr_tool/trich-xuat/dac-ta-man-hinh.md) — bốn tab,
[`bieu-mau-bm0-bm5.md`](../../hr_tool/trich-xuat/bieu-mau-bm0-bm5.md) — bản đồ mã biểu mẫu).
Bản dựng 2026-08-26 có **61 artboard** và thiếu 9 chỗ; bản này **77 artboard**, đã bù hết.

### Đã bù

| Thiếu gì | Nguồn yêu cầu | Artboard mới |
|---|---|---|
| Cả **tab Trình ký** — bộ cũ chỉ có modal VOffice nổi trên màn chấm công | Đặc tả §4 | **60** |
| **Tab 1 biến thể PA/PM** — ma trận tô màu theo *nhiệm vụ* | Đặc tả §1.1 | **2E** |
| **DS công việc** như tính năng CRUD độc lập | Book1 §1.2 | **1L** |
| **Hồ sơ đính kèm** — bản ký đề tài được phê duyệt | MotaCV §I.1 | **1K** |
| **Trình ký DS nhân sự** qua VOffice, theo vòng đời nhiệm vụ | MotaCV §I.2 | **61** |
| **Bảng lương mục tiêu** | MotaCV §I.3 | **1P** |
| **Đóng nhiệm vụ** + biểu mẫu **BM.05** | MotaCV §III | **62 · 63** |
| Bốn danh mục BRD §4.6: loại CPNC · đối tác · nhiệm vụ mẫu · trạng thái nhiệm vụ | BRD §4.6 | **13B · 14B · 15B · 17B** |
| **Màn chi tiết** của danh mục (khách yêu cầu đủ 5 chức năng, bộ cũ chỉ có dialog) | Book1 §1.1 | **12B** |
| **Dialog import BM5** — bộ luật validate thứ ba | Đặc tả §2.1 | **2H** |
| **Phân quyền đơn vị** — trục quyền dữ liệu | Book1 §1.5 | **2G** |
| Bản in **BM.03.01 biến thể SXKD** (BM2.2) | Bản đồ mã biểu mẫu | **38** |

### Đã sửa

- **Artboard 37 đóng nhầm dấu `BM.05` lên BM5.** `BM5.DS Nhiem vu` là biểu mẫu quản trị nội bộ,
  **không mang mã BM.xx** và không thuộc QĐ 3021; `BM.05` là văn bản khác hẳn — *Bảng tổng hợp CPNC
  theo nội dung công việc* dùng ở bước đóng nhiệm vụ, nay dựng ở artboard **63**. Bản trích xuất có
  hẳn ô cảnh báo *"⚠ Bẫy đặt tên"* cho đúng chỗ này. `dauVanBan`/`tieuDe` giờ nhận `null` để biểu
  mẫu nội bộ không bị đóng dấu mã pháp lý.
- **"13 khoản mục" → "14 khoản mục"** ở artboard 23, 25, 30 và bảng dưới đây. Mảng `KHOAN` vốn đã
  có đủ 14 dòng đúng tài liệu; chỉ nhãn và chú thích ghi sai.
- **Bẫy lịch tháng, ghi lại cho mọi màn ma trận về sau.** `days31` dựng lịch 05/2025 với T7/CN rơi
  vào **3 · 9 · 10 · 16 · 17 · 23 · 24 · 30 · 31** (1 và 2 là nghỉ lễ) ⇒ ngày làm việc chỉ còn
  **4–8 · 11–15 · 18–22 · 25–29**. Xếp dữ liệu vào ngày cuối tuần thì luật cuối tuần thắng, ô bị
  nuốt, bảng **trông vẫn đẹp nhưng tổng công sai** — không checker nào bắt được. Bản nháp đầu của
  artboard 2E dính đúng lỗi này.
- **Bốn hàm dựng biểu mẫu giấy** (`dauVanBan`, `tieuDe`, `vungKy`, `giayIn`) chuyển từ
  `35-bieu-mau-khach.page.js` lên [`src/lib/ui.js`](src/lib/ui.js) vì file 55 cũng cần — chép sang
  là có hai đầu văn bản sống song song.

### Cố ý KHÔNG dựng — module Cấu hình

`Book1` §1.5 liệt kê 8 mục. Bộ này chỉ dựng **một** (phân quyền đơn vị, artboard 2G). Bảy mục còn
lại — *người dùng · nhóm người dùng · phân quyền chức năng · đăng nhập/đăng xuất · SSO · trung tâm
thông báo · tích hợp VO* — là hạ tầng dùng chung, đã có ở phân hệ Hệ thống (`identity-service`) và
phân hệ Quy trình. Dựng lại trong HR Tools là tạo **nguồn cấu hình thứ hai**, đúng loại lỗi kế hoạch
§6.8 đã chốt tránh với VOffice.

Phân quyền đơn vị thì khác: nó không phải *"ai được bấm nút nào"* mà là *"dữ liệu của đơn vị nào hiện
ra"* — luật nghiệp vụ riêng của phân hệ này, và là điều kiện cần để ô chọn đơn vị ở màn chấm công có
dữ liệu. **Đây là điểm cần khách xác nhận**, không phải điều đã chốt.

---

## Rà soát lần 2 — theo sơ đồ quy trình tháng (2026-08-27, chiều)

Sơ đồ quy trình của khách nằm trong sheet `0.QuyTrinh` dưới dạng **ảnh nhúng**, nên
`trich-xuat.py` (chỉ đọc ô) bỏ sót và hai lần rà trước đều dựng mà chưa từng đọc nó. Nay đã chép
vào [`dac-ta-man-hinh.md §0.1`](../../hr_tool/trich-xuat/dac-ta-man-hinh.md). Đối chiếu **từng
bước** với bộ artboard:

| # | Bước khách vẽ | Artboard phủ | |
|---|---|---|---|
| 1 | HR **Import** bảng công, bảng lương | 60 (nhóm `IMPORT`) · 19 · 21B · 21C · 22 · 23 | ✅ |
| 2 | PA nhập **DS nhân sự và chấm công** | 2E · 1H · 1I · 1J · 25 · 26 · 27 · 28 · 29 · 2C · 2D | ✅ |
| 3 | Phần mềm **tự động tính lương**, hiện tạm tính | 2D · 25/26/27 (ô *CPNC tạm tính*) | ✅ |
| 4 | **PA/PM chủ trì xác nhận** | 25/26/27 (nút) · 2A | ⚠️ **đã sửa** — xem dưới |
| 5 | **HR Thẩm định, feedback** | 2A (nút *Thẩm định*) | ⚠️ **đã bù một nửa** — nhánh trả lại còn treo |
| 6 | HR **xuất Bảng tổng hợp** công, lương theo BM | 60 (nhóm `XUẤT EXCEL`) · 30 · 31 · 32 | ✅ |
| 7 | HR **Trình ký VO** theo từng nhiệm vụ | 60 · 61 · 2B · 2B2 | ✅ |

### Ba chỗ đã sửa

- **Thanh công cụ chấm công thiếu 2/3 nút xuất.** Đặc tả §2.5 liệt kê đủ **ba** nút ở **cả ba**
  biến thể — `Xuất DS nhân sự (BM1)` · `Xuất bảng công (BM2.x)` · `Xuất bảng lương (BM3.x)`;
  artboard 25/26/27 chỉ có một. Nay đủ ba, dựng bằng `banXuat()` dùng chung. Nút thứ ba để
  **disabled kèm chữ "chỉ HR"** theo ma trận quyền §2.6 dòng cuối — cố ý *hiện mà không bấm được*
  thay vì ẩn: khách phải nhìn thấy nút mới soát được phân quyền. (Fail-closed thật vẫn là ẩn, đã vẽ
  ở artboard 24 cho cột tiền.)
- **Thiếu nút `PA/PM chủ trì xác nhận` ở cuối bảng.** §2.5 ghi rõ đó là **hai** nút cạnh nhau,
  không phải một. Thêm `banLenh(giaiDoan)`: biến thể A ở *chưa chấm* (Submit mở, Xác nhận khoá),
  B ở *đã submit* (Xác nhận mở), C ở *đã xác nhận* (cả hai khoá) — ba artboard nay đọc được như ba
  chặng liên tiếp của bước 4 thay vì ba ảnh rời. Biến thể B và C trước đây **không có hàng lệnh
  nào** ở cuối bảng.
- **Bước 5 không có chỗ bấm.** Artboard 2A trước chỉ cho HR *Xem bảng chấm*. Nay dòng nào đã ở
  trạng thái *PA/PM chủ trì đã xác nhận* thì có thêm nút **Thẩm định**.

### Hai chỗ cố ý dừng lại, chờ khách

- **Nhánh "feedback" của bước 5 — không dựng.** Sơ đồ ghi *"HR Thẩm định, feedback"*, nhưng §1.2
  chỉ có 4 trạng thái chạy một chiều và §2.7 nói thẩm định diễn ra *"qua trao đổi tương tác ngoài"*.
  Vẽ một nút "Trả lại" bây giờ là **bịa ra một trạng thái thứ 5** cho khách duyệt. Đã đánh dấu
  thành **QT1 · QT2** ngay trên dải chú thích của artboard 2A.
- **Biến thể PAKD xuất BM2.1 hay BM2.2.** Ô của khách ghi `BM 2.1` ở cả ba biến thể (dòng 30, 65,
  103), trong khi tên sheet có hẳn `BM2.2.Bang cham cong_SXKD`. Nhiều khả năng khách copy dòng. Bộ
  này giữ **BM2.2** cho biến thể B vì khớp tên biểu mẫu — **QT3**, cần khách xác nhận.

### Một điều đọc sơ đồ mới thấy rõ, ghi lại để không ai gộp nhầm

Sơ đồ này là **luồng tháng**: nó bắt đầu thẳng từ import và **không có** hai bước đầu của BRD §3
(*khởi tạo nhiệm vụ*, *thiết lập ngân sách + phân rã nội dung công việc*). Hai luồng chạy ở hai
nhịp khác nhau — luồng nhiệm vụ theo vòng đời đề tài (artboard 1A–1L, 61, 62), luồng tháng theo kỳ
chấm công. Trong bộ artboard chúng đã nằm ở hai nhóm riêng; **đừng gộp thành một quy trình duy
nhất**, và cũng đừng dựng workflow engine cho luồng tháng.

---

## Nhập vào Figma — làm đúng thứ tự này

### Bước 1 — Import `00-sticker-sheet.html` TRƯỚC TIÊN

Từ artboard này, tạo trong Figma:

| Từ mục | Tạo |
|---|---|
| 1 · Màu | **Color Styles** (brand 10→99, coolgray 10→99, success/warning/info) |
| 2 · Chữ | **Text Styles** (display · heading · title · subtitle · body · body-emphasis · label · caption) |
| 3 · Đổ bóng | **Effect Styles** (none → 2xl) |
| 4–9 | **Components**: nút, ô nhập, tag, ô bảng, pager, dialog |

Bỏ bước này thì mỗi màn sau import về một bộ style riêng, và file Figma sẽ có 61 sắc đỏ "khác nhau"
cùng là `#EE0033`.

### Bước 2 — Import `01` rồi `02`

- **`01-bo-trang-thai-dung-chung.html`** — sáu trạng thái (rỗng · lọc rỗng · đang tải · lỗi · không
  quyền cột · không quyền màn) lặp ở mọi màn danh sách.
- **`02-lop-phu-hop-thoai-va-toast.html`** — nền mờ, **bốn cỡ hộp thoại** (400 · 520 · 900 · 1360),
  **bốn mức toast**, lớp phủ "đang xử lý", và giải phẫu hộp xác nhận phá huỷ.

Component hoá hai artboard này một lần rồi thay text. Các artboard hộp thoại trong bộ là **ví dụ
dùng thật** của chúng, đặt đúng trên màn nền của mình — không phải bản vẽ rời.

### Bước 3 — Import các màn còn lại theo NHÓM, mỗi nhóm một lần

`node bundle.js` gộp 77 artboard thành **10 file theo nhóm** trong `dist/bundles/` — mỗi file là
một trang chứa nhiều `.artboard` xếp dọc, nên **một lần import ra nguyên một Page Figma đủ nhóm**.
Import 10 lần thay vì 77.

| # | File `dist/bundles/` | Artboard | Kích thước |
|---|---|---:|---:|
| 1 | `01-0-nen-tang.html` | 3 | 140KB |
| 2 | `02-1-man-da-code-dot-1.html` | 10 | 258KB |
| 3 | `03-1-5-danh-muc.html` | 16 | 389KB |
| 4 | `04-1-6-nhiem-vu-phan-chua-code.html` | 3 | 115KB |
| 5 | `05-2-ky-bang-cong.html` | 7 | 231KB |
| 6 | `06-2-cham-cong.html` | 13 | 457KB |
| 7 | `07-3-bieu-mau-cpnc.html` | 9 | 181KB |
| 8 | `08-4-bao-cao.html` | 6 | 146KB |
| 9 | `09-5-canh-bao-thong-bao.html` | 6 | 147KB |
| 10 | `10-6-trinh-ky-dong-nhiem-vu.html` | 4 | 119KB |

Số thứ tự file **chính là thứ tự import** — nhóm 1 (nền tảng) trước tiên, đúng như Bước 1 và 2.

Mỗi artboard trong bản gộp có một **nhãn đen** phía trên (`00 Sticker sheet`…) để nhận diện frame
trong Figma. **Xoá layer `.bundle__label` sau khi import**, giống dải `.note` — nó là ghi chú cho
người dựng, không thuộc thiết kế.

`node bundle.js "cham cong"` chỉ gộp một nhóm (so khớp chuỗi con, không dấu). Muốn quay lại từng
artboard rời thì `dist/*.html` vẫn còn nguyên — hai bản song song, không loại trừ nhau.

### Ba chế độ import của html.to.design

| Chế độ | Cách làm | Lưu ý |
|---|---|---|
| **Extension trình duyệt** ✅ | `node serve.js` rồi mở `http://localhost:4173/bundles/...` bằng add-on html.to.design | **Đường đã dùng thật, chạy tốt.** Font hiển thị đúng ngay vì đọc được woff2 self-host |
| **Paste code** | Mở file, copy toàn bộ, dán vào tab *Paste code* của plugin | Dự phòng khi không cài được extension. Chạy được vì CSS đã **nhúng thẳng** trong `<style>`; font lấy từ thư viện Roboto của Figma |
| **Import by URL** ❌ | Dán URL thẳng vào plugin | **Không dùng được với localhost** — plugin báo *"Local pages can't be imported via URL"* vì nó tải trang từ server của họ, không phải từ máy bạn |

Extension và paste code ra kết quả như nhau về cấu trúc layer.

**Máy chủ tĩnh:** `node serve.js [cổng]` (mặc định 4173) — không phụ thuộc gói ngoài, không cần
mạng. `npx serve dist` cũng được nếu máy có sẵn.

---

## Sáu luật đã áp khi viết CSS — và vì sao

Đích đến là trình import, không phải trình duyệt. Chi tiết ở đầu [`src/assets/app.css`](src/assets/app.css):

1. **Chỉ flexbox**, không `display: grid` — plugin map grid thành layer tự do, mất Auto Layout.
2. **Không ra khỏi luồng bố cục** — trừ đúng hai lớp phủ `.stack__dim` (nền mờ) và `.toaster`
   (toast). Hai lớp này bắt buộc phải chồng lên màn nền thì mới duyệt được trạng thái; trong Figma
   chúng thành layer "absolute position" bên trong Auto Layout, đúng cách Figma mô tả overlay.
3. **Không `::before` / `::after`** có `content` — chúng không được import, icon vẽ bằng chúng biến mất.
4. **Không `transform`** — plugin đọc hộp bố cục, không đọc ma trận biến đổi.
5. **Không cắt dữ liệu bằng `overflow: hidden`** — mockup vẽ đủ số dòng cần duyệt.
6. **Bảng dựng bằng div + flex**, không `<table>` — mỗi hàng ra một Auto Layout ngang, mỗi ô là một frame.

`node check.js` bắt vi phạm cả sáu luật (kể cả `absolute` lọt ra ngoài danh sách trắng), cộng thẻ
lệch, icon-font còn sót và biến template chưa thay.
`node check-layout.js` bắt lỗi bố cục mà trình duyệt **không báo gì**: bảng lệch cột giữa hàng tiêu
đề và hàng dữ liệu, bảng rộng hơn khung chứa, và artboard lồng artboard.

---

## Nguồn chuẩn của bộ này

| Chủ đề | Nguồn | Ghi chú |
|---|---|---|
| **Hình thức** — màu, chữ, số đo, shell | **`@khcn-core` + `--vht-built-*`** | [D23](../../../.harness/state/decisions.md): khi DS Figma lệch bản đã build thì **bản đã build thắng** |
| **Nghiệp vụ** — dữ liệu, công thức, trạng thái, quyền | [`docs/hr_tool/trich-xuat/`](../../hr_tool/) | Tài liệu khách gửi 2026-08-26 |
| **Khuôn màn** | [`docs/design-system/screens/*.png`](../../design-system/) | 6 màn thiết kế đã duyệt |
| **Nhóm 1x — màn đã code** | `frontend-angular/src/app/pages/hr-*` | Số cột, nhãn nút, thứ tự trường chép từ chính `columns()` và template (đọc 2026-08-27) |

Giá trị token chép từ code thật đang chạy, không chép lại từ tài liệu:
[`tokens.scss`](../../../frontend-angular/src/styles/tokens.scss) ·
[`khcn-core-compat.scss`](../../../frontend-angular/src/styles/khcn-core-compat.scss) ·
[`hr-layout.scss`](../../../frontend-angular/src/app/layout/hr-layout/hr-layout.scss).

**Sáu chỗ bản đã build lệch DS Figma** — bộ mockup theo bản đã build:

| | DS Figma | **Bản đã build (dùng cái này)** |
|---|---|---|
| Font | Inter | **Roboto** |
| Nút / ô nhập | 36px | **40px** |
| Header bảng | 36px | **40px** |
| Pill nav đang chọn | bo 8 | **bo 12** |
| Card | bo 12 | **bo 16** |
| Pager trang hiện tại | *tài liệu ghi "viền đỏ" — sai* | **nền xám `#F2F2F2`** |

Ô dữ liệu bảng **56px**, topbar **60px**, sider **256px** — hai nguồn khớp nhau.

---

## Cấu trúc thư mục

```
docs/mockup/hr-tools/
├── build.js              sinh dist/*.html — MỘT artboard một file
├── bundle.js             sinh dist/bundles/*.html — gộp theo nhóm, một file nhiều artboard
├── serve.js              máy chủ tĩnh cho dist/ (extension html.to.design đọc localhost)
├── check.js              soi luật CSS / thẻ / icon-font — nhận tham số thư mục: `node check.js dist/bundles`
├── check-layout.js       soi bố cục: bảng lệch cột, tràn khung, artboard lồng nhau (chỉ chạy trên dist/, không chạy trên bundles/)
├── src/
│   ├── assets/
│   │   ├── tokens.css    token màu/chữ/số đo + @font-face Roboto
│   │   ├── app.css       component (shell, card, bảng, dialog, lớp phủ, toast, ma trận chấm công…)
│   │   └── fonts/roboto/ 8 file woff2 self-host (latin + vietnamese × 4 weight)
│   ├── lib/ui.js         icon SVG, cây menu, khung artboard, dialog, toast, hàm dựng bảng
│   └── pages/*.page.js   nội dung từng artboard
└── dist/                 KẾT QUẢ — HTML tĩnh tự chứa, đây là thứ import vào Figma
    ├── *.html            77 artboard rời + index.html (mục lục, KHÔNG import)
    └── bundles/*.html    10 file gộp theo nhóm — đường import chính
```

**Sửa nhanh một chữ:** sửa thẳng trong `dist/*.html`, nhưng lần `node build.js` sau sẽ ghi đè.
**Sửa lâu dài:** sửa `src/` rồi build lại.

Vì sao trang nguồn là `.page.js` chứ không phải `.html` viết tay: bảng chấm công là ma trận
người × 31 ngày — viết tay một artboard đã là ~1.500 thẻ, mà có 9 artboard như vậy. Kết quả build
vẫn là HTML/CSS tĩnh thuần; JS chỉ tồn tại ở khâu sinh file.

---

## Danh sách artboard

### 0 · Nền tảng — import trước tiên

| Mã | Màn | Ghi chú |
|---|---|---|
| **00** | Sticker sheet | Màu · chữ · nút · ô nhập · bảng · chrome |
| **01** | Bộ trạng thái dùng chung | Rỗng · lọc rỗng · đang tải · lỗi · không quyền |
| **02** | Lớp phủ, hộp thoại và toast | Nền mờ · 4 cỡ dialog · 4 mức toast · lớp phủ đang xử lý |

### 1 · Màn ĐÃ CODE (đợt 1) — dựng lại từ bản Angular đang chạy

| Mã | Màn | Ghi chú |
|---|---|---|
| 1A | Danh mục nhiệm vụ | `/hr/nhiem-vu` · 14 cột · **khổ rộng** |
| 1B | Dialog xoá nhiệm vụ | Hộp xác nhận 400px **nổi trên màn 1A** |
| 1C | Dialog từ chối bản khai | Form 520px, lý do bắt buộc |
| 1D | Khai báo nhiệm vụ | `/hr/khai-bao-nhiem-vu` · tìm kiếm nâng cao + chọn nhiều · **khổ rộng** |
| 1E | Chi tiết nhiệm vụ | `/hr/nhiem-vu/:ma` · tab Nội dung công việc · **khổ rộng** |
| 1F | Chi tiết — ba tab còn lại | Vai trò PM/PA · Nhân sự tham gia · Lịch sử (timeline) |
| 1G | Dialog thêm nội dung công việc | Form 520px nổi trên màn 1E |
| 1H | Danh sách nhân sự | `/hr/nhan-su` · thanh thao tác hàng loạt · **khổ rộng** |
| 1I | Thêm nhân sự vào nhiệm vụ | `/hr/nhan-su/moi` · lưới nhập liệu · **khổ rộng** |
| 1J | Pop-up chọn nhân sự | Dialog 1360px có bảng và phân trang · **khổ rộng** |

### 1.5 · Danh mục

| Mã | Màn | Ghi chú |
|---|---|---|
| 10 | Danh mục Đơn vị | Cây 5 cấp + chi tiết |
| 11 | Danh mục Chức danh | |
| 12 | Danh mục Nhân viên | Có tìm kiếm nâng cao 3 cột |
| **12B** | **Chi tiết danh mục** | Khuôn chi tiết dùng chung cho cả 12 danh mục |
| 13 | Danh mục Nguồn kinh phí | Bảo hành không lập dự toán |
| **13B** | **Loại chi phí nhân công** | 14 khoản mục của BM3, giữ nguyên thứ tự |
| 14 | Danh mục Sản phẩm | Chỉ dùng cho PAKD |
| **14B** | **Danh mục Đối tác** | Nhân công thuê ngoài — không đi qua BM0 |
| 15 | Danh mục Thư viện công việc | |
| **15B** | **Danh mục Nhiệm vụ mẫu** | Cả BỘ nội dung CV, khác thư viện (từng cái rời) |
| 16 | Danh mục Ký hiệu công | Cột "khoá ô chấm công" |
| 17 | Danh mục Nhóm công việc | |
| **17B** | **Trạng thái nhiệm vụ** | Hai cột điều khiển luật khoá ô và nút Đóng nhiệm vụ |
| 18 | Dialog thêm/sửa | Form 520px **nổi trên màn 12** |
| 18B | Toast kết quả thao tác | Toast success + warn ở góc phải trên |
| 19 | Dialog import + preview lỗi | Lỗi chặn vs cảnh báo · 900px |

### 1.6 · Nhiệm vụ — phần chưa code

| Mã | Màn | Ghi chú |
|---|---|---|
| **1K** | Hồ sơ đính kèm nhiệm vụ | Bản ký được phê duyệt · có dòng **thiếu bản ký** |
| **1L** | Danh sách nội dung công việc | Tính năng CRUD độc lập · có dòng CPNC **âm** |
| **1P** | Bảng lương mục tiêu | CPNC dự kiến cả vòng đời · kèm **câu hỏi Q8** |

### 2 · Kỳ, bảng công và chấm công

| Mã | Màn | Ghi chú |
|---|---|---|
| 20 | Kỳ chấm công | + nhật ký mở/khoá |
| 21 | Dialog mở lại kỳ đã khoá | Lý do bắt buộc |
| 21B | Xác nhận **đè cả kỳ** khi import lại | Hộp 400px + ô tích xác nhận · **khổ rộng** |
| 21C | Đang nhập dữ liệu + toast thất bại | Lớp phủ tiến trình · **khổ rộng** |
| 22 | Bảng công tháng BM0 | Chỉ đọc · **khổ rộng** |
| 23 | Bảng lương — vai trò HR | 14 khoản mục · **khổ rộng** |
| 24 | Bảng lương — vai trò PA | **Fail-closed**: cột tiền không render |
| 25 | Chấm công biến thể A — KHCN | **khổ rộng** |
| 26 | Chấm công biến thể B — PAKD | Bảo hành để trống · **khổ rộng** |
| 27 | Chấm công biến thể C — ĐTPT/QPAN | CPNC còn lại âm · **khổ rộng** |
| 28 | Luật khoá ô | 4 luật + tooltip nêu tên nhiệm vụ |
| 29 | Submit không hợp lệ | Liệt kê từng ô thiếu · **khổ rộng** |
| 2A | Chấm công theo đơn vị | Màn HR, 4 trạng thái |
| 2B | Trình ký VOffice | Modal nổi trên màn chấm công · **khổ rộng** |
| 2B2 | Kết quả trình ký VOffice | Hai nhánh thành công / thất bại + toast |
| 2C | Gợi ý nhân sự từ tháng gần nhất | Tiện ích bắt buộc §6.5 · dialog 900px · **khổ rộng** |
| 2D | Tiện ích nhập liệu bắt buộc | Autocomplete mã NV + CPNC tạm tính |
| **2E** | **Nhân sự theo tháng (PA/PM)** | Tab 1 của khách — màu là **nhiệm vụ** · **khổ rộng** |
| **2G** | **Phân quyền đơn vị** | Trục quyền dữ liệu · có dòng chưa cấp đơn vị nào |
| **2H** | **Dialog nhập nhiệm vụ từ BM5** | Bộ luật import thứ ba — upsert, **không đè kỳ** · **khổ rộng** |

### 3 · Biểu mẫu CPNC — đủ sáu biểu mẫu cứng của khách

| Mã | Màn | Ghi chú |
|---|---|---|
| 30 | BM3 Bảng tổng hợp phân bổ | + dòng công thừa tự sinh · 51 cột · **khổ rộng** |
| 31 | BM3.1 Bảng lương KHCN | **khổ rộng** |
| 32 | BM3.2 Bảng lương SXKD | Kỳ lương ≠ kỳ trả · **khổ rộng** |
| 33 | Khuôn in biểu mẫu | Quy cách chung: quốc hiệu, tiêu ngữ, vùng ký |
| 34 | **BM.06** Danh sách nhân sự tham gia | Bản in BM1 — **không có cột tỷ lệ** |
| 35 | **BM.03.01** Bảng chấm công theo nội dung CV | Bản in BM2.1 — 47 cột, **header 3 tầng** · **khổ rộng** |
| 36 | **BM.04.02** Bảng tổng hợp phân bổ CPNC | Bản in BM4 — có số âm và ô để trống |
| 37 | **BM5** Danh sách nhiệm vụ | Bản in — **cột động theo tháng**, **KHÔNG mang mã BM.xx** · **khổ rộng** |
| **38** | **BM.03.01** biến thể SXKD | Bản in BM2.2 — thêm Phân nguồn + Sản phẩm, gom theo sản phẩm · **khổ rộng** |

### 4 · Báo cáo — đúng 5 dashboard khách liệt kê

| Mã | Màn | Ghi chú |
|---|---|---|
| 40 | Dashboard tổng quan | |
| 41 | Theo dõi nguồn CPNC nhiệm vụ | Nguồn còn lại **có thể âm** · **khổ rộng** |
| 42 | Tỷ lệ PBNC của đơn vị | Biểu đồ 12 tháng |
| 43 | Tổng hợp PBNC theo Khối | Ngưỡng quý · **khổ rộng** |
| 44 | Tổng hợp PBNC toàn VHT | |
| 45 | Nhiệm vụ sắp hết nguồn | Ngoại suy 2 tháng |

### 5 · Cảnh báo và thông báo

| Mã | Màn | Ghi chú |
|---|---|---|
| 50 | Kho mẫu thông báo | |
| 51 | Soạn mẫu thông báo | Placeholder + xem trước |
| 52 | Cấu hình ngưỡng cảnh báo | 3 luật, người nhận khác nhau |
| 53 | Cấu hình kênh gửi | 4 kênh model, bật 3 |
| 54 | Thông báo đã gửi | Có cột lý do lỗi |
| 55 | Trung tâm thông báo | Panel chuông |

### 6 · Trình ký và đóng nhiệm vụ

| Mã | Màn | Ghi chú |
|---|---|---|
| **60** | Tab Trình ký | Tab 4 của khách — **bốn nhóm nút**, chỉ tài khoản HR |
| **61** | Trình ký danh sách nhân sự | Gói ký theo **vòng đời nhiệm vụ** + lịch sử ký |
| **62** | Đóng nhiệm vụ | Checklist 6 điều kiện · 2 dòng chặn · nút disabled |
| **63** | **BM.05** Bảng tổng hợp CPNC theo nội dung CV | Bản in — **khác hẳn BM5** ở artboard 37 |

---

## Trạng thái đã phủ

Ngoài trạng thái mặc định của từng màn, bộ này vẽ riêng:

| Nhóm trạng thái | Artboard |
|---|---|
| Rỗng · lọc rỗng · đang tải (skeleton) · lỗi có mã · không quyền cột · không quyền màn | 01 |
| Nền mờ + hộp thoại **nổi trên màn thật** | 18 · 19 · 21 · 21B · 2B · 2C · 1B · 1C · 1G · 1J |
| Toast success · info · warn · error — đơn lẻ và xếp chồng | 02 · 18B · 21C · 2B2 |
| Lớp phủ "đang xử lý" có thanh tiến trình | 02 · 21C |
| Xác nhận phá huỷ (xoá · đè cả kỳ · mở lại kỳ đã khoá) | 02 · 1B · 21 · 21B |
| Nhánh thất bại của tích hợp ngoài (VOffice 502) | 2B2 · 21C |
| Submit không hợp lệ, liệt kê từng ô thiếu | 29 |
| Ô bị khoá (4 luật) + tooltip nêu lý do | 28 |
| Panel gợi ý đang mở (autocomplete) | 2D |

---

## Giới hạn — nói trước để không ai hiểu nhầm

- **48 artboard khổ 1440. 29 artboard "khổ rộng"** — bề rộng do nội dung quyết định. Đo thật trên
  trình duyệt: phần lớn nằm quanh **2000–3500px** (BM3, 51 cột: 3498px), nhưng **`1E` và `1G` tới
  6778px** — rộng nhất bộ, cần biết trước khi dựng Page Figma. Những màn này có bảng rộng hơn vùng nội dung thật; trong app bảng **cuộn ngang**
  trong khung 1440, còn ở mockup vẽ đủ chiều ngang để duyệt được toàn bộ dữ liệu. **Đừng đọc
  3500px là khổ màn hình.** Khi dựng Figma: hoặc giữ khổ rộng để khách soi số, hoặc cắt về 1440 và
  thêm chỉ dấu cuộn — tuỳ mục đích buổi duyệt.
- **Dải chú thích nền đen** dưới một số artboard là ghi chú nghiệp vụ cho người dựng, **không thuộc
  thiết kế**. Import xong thì xoá layer `.note`, hoặc giữ lại làm annotation.
- **Không có trạng thái tương tác** — không hover thật, không mở dropdown bằng chuột, không chuyển
  tab. Những trạng thái quan trọng đã vẽ thành artboard hoặc khối riêng (bảng trên).
- **html.to.design không tự tạo Component/Variant.** Nó cho ra frame + Auto Layout + text/màu đúng;
  việc componentize vẫn làm tay. Sticker sheet 00 và 02 là cách rút ngắn việc đó nhất.
- **Dữ liệu là số liệu thật của khách** (mã `011-24-TĐ-RDP-QS`, ký hiệu `X`/`P`/`DL`, tên đơn vị
  cấp 4/5) nhưng **các con số tiền đã dựng lại cho khớp nhau giữa các artboard**, không phải trích
  nguyên từ file BM0/BM3. Đừng dùng bộ này để đối chiếu công thức — bài kiểm chứng công thức là
  §14 mục 8 của kế hoạch thi công, chạy trên file thật.
- **Không dựng màn cấu hình tích hợp VOffice riêng.** Kế hoạch §6.8 chốt: VOffice đăng ký như một
  `IntegrationSystem` ở **màn Tích hợp chung** của phân hệ Quy trình, HR Tools chỉ gọi adapter.
  Dựng thêm màn ở đây là tạo nguồn cấu hình thứ hai — đúng loại lỗi harness đã phải dọn nhiều lần.

## Câu hỏi khách còn mở, đã đánh dấu ngay trên artboard

| # | Câu hỏi | Artboard |
|---|---|---|
| Q2 | Ai được mở lại kỳ đã khoá, lý do có bắt buộc không? | 20, 21 |
| Q3 | VOffice đã có tài liệu API thật chưa hay tiếp tục mock? | 2B, 2B2 |
| Q4 | `tyLePhanBo` — khách có thật sự cần chỉ tiêu kế hoạch theo %, hay bỏ hẳn? | 34, 1F, 1I |
| Q6 | "Chi phí quản lý" là một nhiệm vụ ảo dùng chung toàn VHT hay mỗi đơn vị một cái? | 36 |
| Q7 | Tỷ lệ PBNC lấy mẫu số là quỹ lương **toàn** đơn vị cấp 5 hay chỉ nhân sự có tham gia? | 42 · 2E |
| **Q8** | Lương mục tiêu là **upload thuần tuý** hay cần quản lý quá trình lương / thâm niên / diện hợp đồng? | 1P |
| **Q9** | Bước **đóng nhiệm vụ** (BM.05) còn trong phạm vi không? Vượt dự toán thì *cảnh báo* hay *chặn*? Ai được bấm? | 62 · 63 |
| **Q10** | Bảy mục còn lại của module Cấu hình dùng lại phân hệ Hệ thống — khách có đồng ý không? | — |

| **QT1** | Bước **"HR Thẩm định"** có nút trên hệ thống không, hay HR chỉ xem rồi đi thẳng sang xuất/trình ký? Nếu có thì cần trạng thái thứ 5? | 2A |
| **QT2** | Chữ **"feedback"** ở bước 5 có phải là **trả lại** bản chấm cho PA sửa không? Nếu có: mở lại kiểu gì khi kỳ đã khoá, ai được mở? | 2A · 21 |
| **QT3** | Biến thể **PAKD** xuất bảng công là **BM2.1 hay BM2.2**? | 26 · 38 |

> Q8–Q10 phát sinh từ đợt rà soát 2026-08-27 (sáng). Q9 là câu quan trọng nhất: cả artboard 62 và
> 63 dựng trên một dòng duy nhất trong `MotaCV` §III, không có nguồn nào khác xác nhận phạm vi.
>
> **QT1–QT3 phát sinh chiều 2026-08-27** khi đọc sơ đồ quy trình trong ảnh nhúng — thứ ba lần rà
> trước đều bỏ sót vì script trích xuất chỉ đọc ô. QT2 là câu nặng nhất: nó quyết định máy trạng
> thái có một chiều hay không, tức đụng cả tầng dữ liệu chứ không riêng giao diện.
