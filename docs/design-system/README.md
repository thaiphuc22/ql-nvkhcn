# VHT Design System — nguồn chính thức

> **Đây là design system chính thức của dự án QTKHCN.** Mọi màu, cỡ chữ, khoảng cách, bo góc và
> đổ bóng dùng trong sản phẩm phải lấy từ tài liệu này.
>
> Trích xuất ngày **2026-08-26** từ Figma qua REST API. Quyền truy cập lúc trích: `viewer`.
> **Tài liệu này là bản chép chính thức** — token dùng để kéo đã hết vai trò và sẽ bị thu hồi, nên
> khi cần đối chiếu hãy đọc ở đây trước, chỉ mở Figma khi tài liệu không trả lời được.
>
> ⚠ **Nếu sau này cần kéo thêm từ API**: endpoint `files/nodes` đã bị Figma khoá tới khoảng
> **2026-08-31** (`Retry-After: 394680` giây) vì lần kéo đầu lấy full-depth một page nặng 20 MB.
> Lần sau **luôn dùng tham số `depth`** (5–7 là đủ cho spec) và nghỉ vài giây giữa các lần gọi.
> Quota render ảnh (`/v1/images`) là quota riêng, không bị ảnh hưởng.

| Nguồn | fileKey | Nội dung |
|---|---|---|
| `VHT design system` | `OZKhYr4HsliEVd9ggj1xhJ` | 38 page: token nền + thư viện component |
| `VHT UI DESIGN` | `OEJIdripupJIAC1LFCbMYi` | Màn thiết kế thật, page *UI Design Done* (`324:88659`) |

Nội dung thư mục:

| Đường dẫn | Là gì | Dung lượng |
|---|---|---|
| `README.md` (file này) | Token màu/chữ/spacing/shadow + quy tắc dùng. **Đọc cái này trước** | — |
| `components.md` | Số đo chrome chính xác + đặc tả component, rút từ hơn 700 instance thật | — |
| `components/*.png` | **28 page component** đã render: button, input, table, dialog, tag, upload… | 7,2 MB |
| `screens/*.png` | 6 màn thiết kế hoàn chỉnh (danh sách, form, popup chọn, tìm kiếm nâng cao) | 756 KB |
| `figma-raw/*.json` | JSON gốc các page nền + lát cắt layout làm bằng chứng cho số đo chrome | 1,6 MB |

**Ảnh trong `components/` và `screens/` là bản duy nhất còn lại** nếu mất quyền truy cập Figma —
chúng được render trước khi thu hồi token, và không dựng lại được từ tài liệu chữ.

---

## ⚠ Đọc trước khi dùng: một cái bẫy trong file Figma

Trang *Color Guide — Semantic* của file DS ghi bằng chữ rằng `interactive/primary` là **`#F95E00`**
(cam) và trỏ `→ brand/60`. **Con số đó sai.** Ramp `brand/60` render ra `#FF3B4A`, `brand/50` là
`#EE0033`, và toàn bộ màn thiết kế thật đều dùng đỏ.

Phần chữ đó là dấu vết còn lại của một template khác. **Luôn lấy theo giá trị render** (đã chép vào
tài liệu này), đừng đọc nhãn chữ trong file Figma. Ai tin phần chữ sẽ dựng ra một sản phẩm màu cam.

---

## 1. Màu

### 1.1 Ramp gốc (primitive)

**Brand** — đỏ Viettel, dùng cho CTA, mục menu đang chọn, link, nhấn mạnh thương hiệu.

| 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#3C0006` | `#61000E` | `#890019` | `#B30024` | **`#EE0033`** | `#FF3B4A` | `#FF7F7E` | `#FFAEAB` | `#FFD8D6` | `#FFECEA` | `#FFFBFA` |

**Danger** — **trùng hoàn toàn ramp Brand** (10→95 y hệt). Đây không phải lỗi chép: thiết kế cố ý
để nút chính và nút xoá cùng màu đỏ. Hệ quả thực tế: **không được phân biệt hành động phá huỷ bằng
màu** — phải phân biệt bằng chữ, icon và bước xác nhận. Trong code nên khai
`--vht-danger-50: var(--vht-brand-50)` thay vì chép lại số, để nếu sau này thiết kế tách hai ramp thì
chỉ sửa một chỗ.

**Coolgray** — nền, chữ, viền, chrome. Là xương sống của giao diện.

| 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 99 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#1A1C1E` | `#2F3033` | `#45474A` | `#5D5E61` | `#76777A` | `#909094` | `#AAABAE` | `#C6C6C9` | `#E2E2E5` | `#F1F0F4` | `#FCFCFF` |

**Success / Warning / Info**

| Ramp | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 95 |
|---|---|---|---|---|---|---|---|---|---|---|
| Success | `#00230F` | `#003B1E` | `#00552E` | `#00713F` | **`#008E50`** | `#0EAC63` | `#3EC87C` | `#5FE495` | `#8BFFB4` | `#CEFFD9` |
| Warning | `#261900` | `#412D00` | `#5D4200` | `#7A5800` | **`#996F00`** | `#BA8700` | `#DBA000` | `#FEBA00` | `#FFDEA3` | `#FFEED6` |
| Info | `#00174A` | `#002976` | `#1E4193` | `#3A59AD` | **`#5573C7`** | `#6F8DE3` | `#8BA7FF` | `#B3C4FF` | `#DBE1FF` | `#EEF0FF` |

### 1.2 Token ngữ nghĩa (cách dùng đúng)

Đây là bảng nên dùng khi viết UI — **đừng gọi thẳng ramp gốc trong component**.

| Token | Giá trị | Dùng cho |
|---|---|---|
| `background/default` | `coolgray/99` `#FCFCFF` | Nền trang |
| `background/container` | `coolgray/95` `#F1F0F4` | Nền vùng nội dung sau card |
| `background/container-hover` | `coolgray/90` `#E2E2E5` | Hover của hàng, ô |
| `text/primary` | `coolgray/10` `#1A1C1E` | Chữ chính |
| `text/secondary` | `coolgray/40` `#5D5E61` | Chữ phụ, mô tả |
| `text/disabled` | `coolgray/70` `#AAABAE` | Chữ bị vô hiệu |
| `border/subtle` | `coolgray/80` `#C6C6C9` | Viền ô, đường chia |
| `border/strong` | `coolgray/60` `#909094` | Viền cần rõ |
| `border/interactive` | `brand/50` `#EE0033` | Viền ô đang focus |
| `interactive/primary` | `brand/50` `#EE0033` | Nút chính, link, pill menu |
| `interactive/primary-hover` | `brand/40` `#B30024` | Hover nút chính |
| `interactive/primary-active` | `brand/30` `#890019` | Đang nhấn |
| `interactive/secondary` | `coolgray/10` `#1A1C1E` | Nút phụ nền tối |
| `support/error` … `-subtle` | `#EE0033` / `#FFECEA` | Báo lỗi |
| `support/success` … `-subtle` | `#008E50` / `#CEFFD9` | Báo thành công |
| `support/warning` … `-subtle` | `#996F00` / `#FFEED6` | Cảnh báo |
| `support/info` … `-subtle` | `#5573C7` / `#EEF0FF` | Thông tin |
| `focus/ring` | `#1677FF` ở 50% | Vòng focus bàn phím |

> Nhắc lại bẫy ở trên: bảng semantic trong Figma ghi các giá trị cam (`#F95E00`, `#DF3058`,
> `#346EF6`…). Bảng ngay trên đây đã sửa theo giá trị render thật.

---

## 2. Chữ

Font nền: **Inter**. (Page *Typography* có dùng Saira cho vài tiêu đề trang trí của chính tài liệu
Figma — **không phải** font của sản phẩm.)

| Token | Cỡ | Line-height | Letter-spacing | Weight | Dùng cho |
|---|---|---|---|---|---|
| `typography/display` | 28px | 120% | -0.5px | 600 Semi Bold | Hero, tiêu đề lớn nhất |
| `typography/heading` | 22px | 125% | -0.25px | 600 Semi Bold | **Tiêu đề trang**, header card |
| `typography/title` | 18px | 130% | 0 | 600 Semi Bold | Tiêu đề card, dialog |
| `typography/subtitle` | 16px | 135% | 0 | 500 Medium | Đoạn dẫn |
| `typography/body` | 14px | 150% | 0 | 400 Regular | **Chữ mặc định**, nội dung bảng |
| `typography/body-emphasis` | 14px | 150% | 0 | 500 Medium | Nhấn trong đoạn |
| `typography/label` | 13px | 140% | +0.1px | 500 Medium | **Nhãn form**, nút, mục menu |
| `typography/caption` | 12px | 140% | +0.2px | 400 Regular | Helper text, mốc thời gian |

---

## 3. Khoảng cách & bo góc

Hệ 4pt và 8pt song song. Trong sản phẩm nội bộ dày đặc dữ liệu như QTKHCN, **thang 4pt là mặc định**;
thang 8pt dùng cho khoảng cách giữa các khối lớn.

- **Spacing**: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 72 · 80 · 88 · 96 (px)
- **Radius**: 4 · 8 · 12 · 16 · 20 · 24 · 32 (px)

Giá trị bo góc thực đo (xem [`components.md`](components.md) để có số đầy đủ):

| Thành phần | Bo |
|---|---|
| Nút, ô nhập `Text Field`, card, dialog, mục nav | **12px** |
| Pill mục nav **đang chọn**, khối logo, nút icon vuông | **8px** |
| Checkbox | **4px** |
| Tag, badge, switch | tròn hẳn |

Lưu ý một điểm dễ nhầm: mục nav bo 12px nhưng **pill đỏ bên trong nó bo 8px** — hai giá trị khác
nhau, không phải một.

---

## 4. Đổ bóng (elevation)

6 mức, có sẵn cả hai chế độ. Giá trị CSS lấy nguyên từ Figma:

| Token | Mức | Light | Dark |
|---|---|---|---|
| `--shadow-none` | 0 — None (Border) | `0 0 0 1px rgba(0,0,0,.08)` | `0 0 0 1px rgba(255,255,255,.06)` |
| `--shadow-sm` | 1 — Raised | `0 1px 2px rgba(0,0,0,.06), 0 1px 3px -1px rgba(0,0,0,.04)` | `0 1px 2px rgba(0,0,0,.40), 0 0 0 1px rgba(255,255,255,.04)` |
| `--shadow-md` | 2 — Hover | `0 2px 4px rgba(0,0,0,.08), 0 4px 8px -2px rgba(0,0,0,.06)` | `0 2px 4px rgba(0,0,0,.50)` |
| `--shadow-lg` | 3 — Floating | `0 4px 8px rgba(0,0,0,.10), 0 8px 16px -4px rgba(0,0,0,.08)` | `0 4px 8px rgba(0,0,0,.56)` |
| `--shadow-xl` | 4 — Overlay | `0 8px 16px rgba(0,0,0,.12), 0 16px 32px -8px rgba(0,0,0,.10)` | `0 8px 16px rgba(0,0,0,.64), 0 0 0 1px rgba(255,255,255,.07)` |
| `--shadow-2xl` | 5 — Top Overlay | `0 12px 24px rgba(0,0,0,.14), 0 20px 40px -10px rgba(0,0,0,.12)` | `0 12px 24px rgba(0,0,0,.70), 0 0 0 1px rgba(255,255,255,.08)` |

Mức 0 **không phải là "không có bóng"** — nó là viền 1px vẽ bằng shadow. Thay nó bằng `box-shadow:
none` sẽ làm mọi card mất đường bao.

---

## 5. Bố cục màn (chrome)

Đọc từ 6 ảnh trong `screens/`. Khung màn chuẩn rộng **1440×1024**.

**Topbar** — tối, chạy hết chiều ngang, nằm **trên cả sider**. Trái: khối logo VHT đỏ + hai dòng
`QTKHCN` / tên phân hệ. Phải: chuông có badge số + avatar tròn.

**Sider** — **nền trắng** (không phải nền tối). Trên cùng là **thẻ chọn phân hệ**: icon vuông bo góc
có màu riêng theo phân hệ + tên phân hệ, dưới có đường kẻ. Nút thu gọn `«` nổi ở mép phải sider.
Mục đang chọn là **pill đỏ đặc `#EE0033`, chữ trắng, bo 8px**; nhóm có con thì có chevron; mục con
thụt vào. Đáy sider: `v1.0 - © 2026`.

**Vùng nội dung** — nền `background/container`. Tiêu đề trang cỡ `heading` bên trái; nút chính đỏ ở
**góc phải trên cùng** (`+ Thêm mới`). Màn form thì góc phải là cặp `Huỷ` (nút viền) + nút chính đỏ,
và bên trái tiêu đề có nút back `←` hình tròn viền.

**Card** — mọi nội dung nằm trong card trắng bo 12px, bóng nhẹ.

**Hàng lọc** — **căn phải** trong card: select + ô tìm kiếm có icon kính lúp. Biến thể *Tìm kiếm nâng
cao* là một khối riêng phía trên bảng, lưới 3 cột, nút `Làm mới` + `Tìm kiếm` căn phải, kèm nút
`Ẩn tìm kiếm nâng cao` ở trên.

**Bảng** — header nền xám nhạt. Thứ tự cột cố định: **STT · Thao tác · (Trạng thái) · …dữ liệu**.
Cột Thao tác là icon bút chì + thùng rác đỏ, ngăn nhau bằng gạch đứng. Trạng thái hiển thị bằng
toggle đỏ (bật/tắt) hoặc tag có chấm tròn (`● Hoàn thành` nền xanh nhạt). Mã định danh là **link đỏ
gạch chân**. Hàng đang chọn có nền đỏ rất nhạt.

**Footer bảng** — trái: `Hiển thị bản ghi/trang: [25 ▾]`. Phải: `Tổng số bản ghi: 1000` rồi tới pager
`« ‹ 1 2 3 4 … 99 › »`, trang hiện tại là ô viền đỏ.

**Dialog** — rộng 520px cho form thêm/sửa, 400px cho hộp xác nhận, 1360px cho pop-up chọn dữ liệu có
bảng. Tiêu đề trái + nút `✕` phải, đường kẻ dưới tiêu đề, nút `Huỷ` (viền) + nút chính đỏ ở góc phải
đáy. Nhãn trường có dấu `*` đỏ khi bắt buộc.

Ảnh tham chiếu:

| Ảnh | Màn |
|---|---|
| `screens/01-danhsach-vaitro.png` | Danh sách chuẩn: sider, card, lọc, bảng, phân trang |
| `screens/02-popup-themmoi.png` | Dialog thêm mới 520px |
| `screens/03-danhsach-hoidong.png` | Danh sách có cột link + cuộn ngang |
| `screens/04-themmoi-hoidong.png` | Trang form đầy đủ + bảng con nhập liệu |
| `screens/05-popup-chon-nhansu.png` | Pop-up chọn dữ liệu: cây đơn vị + bảng + footer chọn |
| `screens/06-tim-kiem-nang-cao.png` | Khối tìm kiếm nâng cao + tag trạng thái |

---

## 6. Áp vào code ở đâu

| Nơi | Vai trò |
|---|---|
| `frontend-angular/src/styles/tokens.scss` | Biến `--vht-*` cho UI tự viết. **Nơi duy nhất** khai giá trị token |
| `frontend-angular/src/theme.less` | Ghi đè biến Less của ng-zorro (`@primary-color`, `@font-family`, `@border-radius-base`…). ng-zorro v21 chỉ publish CSS đã biên dịch nên **không override được bằng CSS custom property** — bắt buộc qua Less |

Quy tắc: component tự viết đọc `--vht-*`; component ng-zorro lấy màu qua `theme.less`. Không hardcode
mã hex trong file `.scss` của trang.

---

## 7. Quan hệ với tài liệu cũ

`docs/design_sample/design-system.md` là bản **đã bị thay thế** — nguồn của nó là Google Stitch
(Material 3 + Tailwind), không phải Figma của khách. Giữ lại vì nó giải thích xuất xứ của mấy giá trị
cũ còn sót trong code (`--vht-red-chrome: #bf0027`, `--vht-success: #006e0d`, `--vht-warning: #daa520`,
`--vht-danger: #ba1a1a`). **Những giá trị đó không thuộc design system chính thức**; gặp ở đâu thì
thay bằng bảng ở mục 1.
