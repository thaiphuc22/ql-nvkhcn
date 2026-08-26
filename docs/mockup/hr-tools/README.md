# HR Tools — bộ mockup HTML/CSS tĩnh để kết xuất sang Figma

**61 artboard** phủ **toàn bộ** phân hệ Quản lý chi phí nhân công — cả màn **đã code** (đợt 1) lẫn
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

Mở [`dist/index.html`](dist/index.html) bằng trình duyệt. Trang mục lục liệt kê 61 artboard theo đợt.

## Dựng lại sau khi sửa

```bash
cd docs/mockup/hr-tools
node build.js         # src/pages/*.page.js  →  dist/*.html
node check.js         # soi luật CSS, thẻ lệch, icon-font sót, biến chưa thay
node check-layout.js  # soi bảng lệch cột, bảng tràn khung, artboard lồng nhau
```

Không cần `npm install` — chỉ dùng thư viện chuẩn của Node.

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

### Bước 3 — Import các màn còn lại theo nhóm

Đặt mỗi đợt vào một Page trong Figma, theo đúng thứ tự mã: `1A–1J` Màn đã code → `1x` Danh mục →
`2x` Kỳ & Chấm công → `3x` Biểu mẫu → `4x` Báo cáo → `5x` Thông báo.

### Hai chế độ import của html.to.design

| Chế độ | Cách làm | Lưu ý |
|---|---|---|
| **Paste code** | Mở file `dist/*.html`, copy toàn bộ, dán vào plugin | Chạy được vì CSS đã **nhúng thẳng** trong `<style>`. Font Roboto sẽ lấy từ Figma (URL font trong file không tới được) |
| **Import by URL** | Chạy `npx serve dist` rồi dán `http://localhost:3000/...` | Cần extension trình duyệt của plugin để đọc localhost. Font hiển thị đúng ngay |

Cả hai đều ra kết quả như nhau về cấu trúc layer.

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
├── build.js              sinh dist/ từ src/
├── check.js              soi luật CSS / thẻ / icon-font
├── check-layout.js       soi bố cục: bảng lệch cột, tràn khung, artboard lồng nhau
├── src/
│   ├── assets/
│   │   ├── tokens.css    token màu/chữ/số đo + @font-face Roboto
│   │   ├── app.css       component (shell, card, bảng, dialog, lớp phủ, toast, ma trận chấm công…)
│   │   └── fonts/roboto/ 8 file woff2 self-host (latin + vietnamese × 4 weight)
│   ├── lib/ui.js         icon SVG, cây menu, khung artboard, dialog, toast, hàm dựng bảng
│   └── pages/*.page.js   nội dung từng artboard
└── dist/                 KẾT QUẢ — HTML tĩnh tự chứa, đây là thứ import vào Figma
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
| 13 | Danh mục Nguồn kinh phí | Bảo hành không lập dự toán |
| 14 | Danh mục Sản phẩm | Chỉ dùng cho PAKD |
| 15 | Danh mục Thư viện công việc | |
| 16 | Danh mục Ký hiệu công | Cột "khoá ô chấm công" |
| 17 | Danh mục Nhóm công việc | |
| 18 | Dialog thêm/sửa | Form 520px **nổi trên màn 12** |
| 18B | Toast kết quả thao tác | Toast success + warn ở góc phải trên |
| 19 | Dialog import + preview lỗi | Lỗi chặn vs cảnh báo · 900px |

### 2 · Kỳ, bảng công và chấm công

| Mã | Màn | Ghi chú |
|---|---|---|
| 20 | Kỳ chấm công | + nhật ký mở/khoá |
| 21 | Dialog mở lại kỳ đã khoá | Lý do bắt buộc |
| 21B | Xác nhận **đè cả kỳ** khi import lại | Hộp 400px + ô tích xác nhận · **khổ rộng** |
| 21C | Đang nhập dữ liệu + toast thất bại | Lớp phủ tiến trình · **khổ rộng** |
| 22 | Bảng công tháng BM0 | Chỉ đọc · **khổ rộng** |
| 23 | Bảng lương — vai trò HR | 13 khoản mục · **khổ rộng** |
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
| 37 | **BM5** Danh sách nhiệm vụ | Bản in — **cột động theo tháng** · **khổ rộng** |

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

- **35 artboard khổ 1440. 26 artboard "khổ rộng"** — bề rộng do nội dung quyết định, tới **~3500px**
  (BM3, 51 cột). Những màn này có bảng rộng hơn vùng nội dung thật; trong app bảng **cuộn ngang**
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
| Q7 | Tỷ lệ PBNC lấy mẫu số là quỹ lương **toàn** đơn vị cấp 5 hay chỉ nhân sự có tham gia? | 42 |
