# VHT Design System — Đặc tả component

> Phụ lục của [`README.md`](README.md). Số liệu ở đây rút ra từ **layout thật** trong Figma
> (page *UI Common* của file design system + các màn đã duyệt của `VHT UI DESIGN`), bằng cách gom
> hơn 700 instance component và lấy giá trị xuất hiện nhiều nhất cho từng thuộc tính.
>
> Cách làm này chính xác hơn đọc bằng mắt từ ảnh, nhưng có một giới hạn phải nói rõ: nó phản ánh
> **cách component đang được dùng trong bản thiết kế**, không phải định nghĩa gốc của component
> trong thư viện. Khi hai thứ lệch nhau, mở ảnh trong `components/` để đối chiếu.

## Vì sao không có bảng variant đầy đủ của từng component

Endpoint `files/nodes` của Figma đã **khoá tài khoản 4,5 ngày** (`Retry-After: 394680`) sau khi kéo
page *UI Common* — page này một mình nặng 20 MB và đốt hết hạn mức. 27 page component còn lại không
kéo được JSON.

Bù lại, **quota render ảnh là quota riêng và vẫn chạy**, nên **cả 28 page component đã được render
và lưu trong `components/`** — phần hình không mất gì. Muốn bổ sung bảng variant dạng số thì đợi
sau 2026-08-31 và kéo lại **có giới hạn `depth`**, đừng kéo full-depth như lần đầu.

---

## 1. Chrome — số đo chính xác

Đo từ layout khổ 1920 trong page *UI Common*.

### Topbar
| Thuộc tính | Giá trị |
|---|---|
| Chiều cao | **60px** cố định |
| Nền | `#1A1C1E` (coolgray/10) |
| Padding | 12px trên/dưới · 16px trái/phải |
| Khối logo | 36×36, **bo 8px**, nền `#EE0033` |
| Nhóm icon phải | icon 24×24, cách nhau 16px, có gạch đứng ngăn trước khối profile |
| Khối profile | 84×36, bo 8px, padding 8px, gap 4px |
| Badge trên chuông | bo **tròn hẳn** (r=999), nền `#FF3B4A`, padding 2/5, chữ 12px trắng |

### Sider
| Thuộc tính | Giá trị |
|---|---|
| Bề rộng | **256px** |
| Nền | `#FFFFFF` — **trắng, không phải nền tối** |
| Padding dọc | 20px trên/dưới; nhóm nav padding ngang 16px |
| Khoảng cách giữa các mục | 4px |
| Khối thương hiệu/phân hệ đầu sider | cao 61px, padding 12/16, gap 12; có icon `sidebar-left` 20×20 để thu gọn |
| **Mục nav** | **224×48**, bo 12px, padding 12px, gap 8px |
| **Mục đang chọn** | pill **bo 8px, nền `#EE0033`**, chữ trắng |
| Icon trong mục | 24×24; nhóm có con thì có `chevron-down` 24×24 |
| Footer sider | cao 24px, padding trên 12px |

### Vùng nội dung
| Thuộc tính | Giá trị |
|---|---|
| Padding | **24px** cả bốn phía |
| Khoảng cách giữa các khối | 20px |
| Dải tiêu đề trang | cao 42px |
| Tiêu đề mục trong trang | chữ 18px/600, màu `#0F1110` |

---

## 2. Component hay dùng nhất

Xếp theo số lần xuất hiện thực tế trong thiết kế — đây cũng là thứ tự nên ưu tiên khi dựng.

### Bảng (718 ô + 39 header)
| Phần | Cao | Nền | Viền | Padding | Chữ |
|---|---|---|---|---|---|
| Ô dữ liệu | **56px** | `#FFFFFF` | `#E2E2E5` | 8/12 | 14px/400, `#1A1C1E` |
| Ô header | **36px** | `#F0F1F2` | `#E2E2E5` | 8/10 | 14px/500, `#0C111D` |

Hàng cao 56px là con số đáng nhớ: nó gấp đôi header, và quyết định số dòng thấy được trên một màn
1024px (khoảng 12 dòng, khớp đúng các ảnh mẫu).

### Nút
| Loại | Kích thước | Bo | Nền | Padding | Gap | Chữ |
|---|---|---|---|---|---|---|
| Nút chữ | 126×**36** | **12px** | `#EE0033` | 8/16 | 6 | 14px/600 |
| Nút icon | 20×20 vùng icon | tròn | `#EE0033` khi là nút chính | ~8 | 6 | — |

⚠ Nút bo **12px** trong khi ô nhập cũng 12px nhưng `Textinput` lại 8px — thư viện không nhất quán
tuyệt đối, xem mục 4.

### Ô nhập
| Loại | Cao | Bo | Nền | Viền | Padding | Chữ |
|---|---|---|---|---|---|---|
| `Text Field` | **36px** | 12px | `#FFFFFF` | `#D1D3D8` | 8/10 | 14px |
| `Textinput` | 36px | 8px | — | — | — | 13px/500 |
| `Label input` (nhãn + ô) | 60px cả cụm | — | — | — | gap 4 | nhãn 14px/600, `#2D3036` |

Chiều cao 36px thống nhất cho cả nút và ô nhập ⇒ đặt cạnh nhau trên hàng lọc là thẳng hàng.

### Tag / Badge
| Loại | Cao | Bo | Nền | Viền | Padding | Chữ |
|---|---|---|---|---|---|---|
| Tag trung tính | 27px | **tròn hẳn** | `#E2E2E5` | `#C6C6C9` | 4/10 | 13px/500, `#5D5E61` |
| Tag màu | 21px | tròn hẳn | theo ngữ nghĩa (vd `#346EF6`) | đậm hơn nền | 4/8 | 12px/500, trắng |
| Chấm trong tag | 8×8 | tròn | theo trạng thái | — | — |
| Badge số | 20×21 | tròn | `#FF3B4A` | — | 2/5 | 12px, trắng |

### Chọn / bật tắt
| Component | Kích thước | Bo | Ghi chú |
|---|---|---|---|
| Checkbox | 20×20 | 4px | viền `#E2E2E5`, nền trắng |
| Switch | 36×20 | tròn | bật là đỏ brand |

### Dialog
| Loại | Kích thước | Bo | Padding | Gap |
|---|---|---|---|---|
| Hộp xác nhận (`Modal`) | **400×258** | 12px | 24px | 32px |
| Form thêm/sửa (`Popup`) | rộng **520px**, header cao 60px | — | 16px | 16px |
| Tiêu đề dialog | — | — | — | 18px/600, `#2D3036` |

### Phân trang
Ô số trang **33×33**, bo ~12px, nền trắng, viền `#E6E6E6`, chữ 14px `#666666`; trang hiện tại đổi
sang **nền xám `#F2F2F2`, chữ đậm — không phải viền đỏ** (sửa 2026-08-26: bản cũ ghi "viền đỏ", trái
với `components/pagination.png` và với phân hệ đã build; ảnh thắng chữ — xem D23).

---

## 3. Ảnh tham chiếu từng component

Toàn bộ 28 page component đã render trong `components/`. Đây là **bản duy nhất còn lại** nếu mất
quyền truy cập Figma.

| Nền tảng | Nhập liệu | Hiển thị | Điều hướng | Phản hồi |
|---|---|---|---|---|
| `ui-common.png` | `input-field.png` | `table.png` | `navigation.png` | `alert-toast.png` |
| `icon.png` | `dropdown.png` | `card.png` · `card-2.png` | `breadcrumbs.png` | `dialogs-popup.png` |
| `utilities.png` | `checkbox-switch-radio.png` | `tag-badge-chips.png` | `tabs.png` | `tooltip.png` |
| `divider.png` | `datepicker.png` | `avatar.png` | `pagination.png` | `loading-progress.png` |
| | `search.png` | `chart.png` | `accordion.png` | `empty-state.png` |
| | `slider.png` · `file-upload.png` | | | `button.png` |

---

## 4. ⚠ Thư viện component không hoàn toàn khớp token

Khi gom số liệu, một số giá trị **không nằm trong bảng token** ở `README.md`:

| Gặp trong component | Token gần nhất | Chênh |
|---|---|---|
| Viền ô nhập `#D1D3D8` | `border/subtle` `#C6C6C9` | Sáng hơn một chút |
| Nền header bảng `#F0F1F2` | `background/container` `#F1F0F4` | Lệch nhẹ |
| Chữ header bảng `#0C111D` | `text/primary` `#1A1C1E` | Tối hơn, ngả xanh |
| Viền phân trang `#E6E6E6`, chữ `#666666` | `#E2E2E5` / `#5D5E61` | Xám trung tính thay vì coolgray |
| Bo góc `12.2456`, padding `4.08189` | 12 / 4 | Là instance bị **co tỷ lệ** trong Figma, không phải giá trị thiết kế |

**Cách xử lý khi code: dùng token trong `README.md`, đừng chép mấy giá trị lẻ này.** Chênh lệch nhỏ
tới mức không ai nhìn ra, nhưng chép nguyên thì sản phẩm sẽ có 5 sắc xám khác nhau cho cùng một vai
trò, và về sau không đổi theme được nữa. Các số thập phân lẻ thì chắc chắn là do co tỷ lệ — luôn làm
tròn về thang 4pt.


---

## 5. Phụ lục — bảng tự sinh

Gom máy móc từ các instance thật, chưa biên tập (đã lược các icon thuần). Giữ lại để tra nhanh và để
kiểm chứng các con số ở mục 2. Cột *Lần xuất hiện* cho biết mức độ tin cậy: càng nhiều, giá trị càng chắc.

| Component | Số đo hay gặp | Radius | Nền | Viền | Padding | Gap | Font | Màu chữ | Lần xuất hiện |
|---|---|---|---|---|---|---|---|---|---|
| Table cell | 895x56 |  | #FFFFFF | #E2E2E5 | 8/12/8/12 | 8.0 | 14.0/400 | #1A1C1E | 718 |
| Tag | 64x27 | 9999.0 | #E2E2E5 | #C6C6C9 | 4/10/4/10 | 6.0 | 13.0/500 | #5D5E61 | 603 |
| Button Icon | 20x20 | 9899.0 | #EE0033 | #909094 | 8.00528/8.00528/8.00528/8.00528 | 6.0 |  |  | 184 |
| Checkbox | 20x20 | 4.0 | #FFFFFF | #E2E2E5 |  |  |  |  | 84 |
| Button | 126x36 | 12.0 | #EE0033 | #EE0033 | 8/16/8/16 | 6.0 | 14.0/600 | #EE0033 | 81 |
| Topbar | 1440x60 |  | #1A1C1E |  | 12/16/12/16 |  | 12.0/400 | #FFFFFF | 65 |
| pagination-base | 33x33 | 12.245670318603516 | #FFFFFF | #E6E6E6 | 4.08189/8.16378/4.08189/8.16378 | 2.040945053100586 | 14.286615371704102/400 | #666666 | 50 |
| Table Header | 252x36 |  | #F0F1F2 | #E2E2E5 | 8/10/8/10 | 4.0 | 14.0/500 | #0C111D | 39 |
| Check box | 20x20 |  |  |  |  | 8.0 | 14.0/400 | #000000 | 36 |
| Popup | 520x60 |  | #FFFFFF | #D1D3D8 | 16/16/16/16 | 16.0 | 18.0/600 | #2D3036 | 33 |
| Menu Cha chứa active con (bản thân cha KHÔNG | 224x48 | 12.0 |  |  | 12/12/12/12 | 4.0 | 14.0/400 | #000000 | 32 |
| Tags | 46x21 | 60.039581298828125 | #346EF6 | #0077DB | 4.00264/8.00528/4.00264/8.00528 | 8.005277633666992 | 12.007916450500488/500 | #FFFFFF | 29 |
| Textinput | 363x36 | 8.0 |  |  |  |  | 13.0/500 | #1A1C1E | 28 |
| Switch | 36x20 |  |  |  |  | 10.0 | 14.0/400 | #1A1C1E | 25 |
| Label input | 252x60 |  |  |  |  | 4.0 | 14.0/600 | #2D3036 | 24 |
| Text Field | 528x36 | 12.0 | #FFFFFF | #D1D3D8 | 8/10/8/10 | 8.0 | 14.0/600 | #2D3036 | 24 |
| Modal | 400x258 | 12.0 | #FFFFFF |  | 24/24/24/24 | 32.0 |  |  | 23 |
| _Item | 226x36 | 8.0 | #FFFFFF |  | 8/12/8/12 | 16.0 | 14.0/500 | #000000 | 20 |
| _Nav / Selection | 226x40 | 8.0 |  |  | 0/10/0/10 | 10.0 |  |  | 20 |
| .checkbox-input | 20x20 | 12.0 |  |  |  |  |  |  | 18 |
| Section title | 1072x36 |  |  |  |  | 16.010555267333984 | 18.01187515258789/600 | #0F1110 | 14 |
| Badge | 20x21 | 999.0 | #FF3B4A |  | 2/5/2/5 |  | 12.0/400 | #FFFFFF | 12 |
| Texfield | 55x41 | 8.163780212402344 |  |  |  | 6.122835159301758 | 16.327560424804688/600 | #1A1A1A | 10 |
| Icon Button | 33x33 | 8.163780212402344 | #FFFFFF |  |  |  |  |  | 10 |
| Card/Stat | 295x114 | 16.0 | #FFFFFF | #E2E2E5 | 20/20/20/20 | 16.0 | 14.0/400 | #76777A | 10 |
| Icon | 14x14 |  |  |  |  |  |  |  | 10 |
| plus | 20x20 |  |  |  |  |  |  |  | 9 |
| sidebar-left | 20x20 |  |  |  |  |  |  |  | 8 |
| Badges | 26x24 | 12.0 | #F0F1F2 | #D1D3D8 | 2/8/2/8 | 4.0 | 14.0/400 | #3B3F46 | 7 |
| Input dropdown menu item | 304x44 |  |  |  | 10/16/10/16 | 8.0 |  |  | 7 |
| Chart | 758x32 | 8.0 |  |  | 0/6/8/124 |  | 16.0/500 | #2C2F32 | 6 |
| Label chart | 628x24 |  |  |  |  |  | 16.0/500 | #2C2F32 | 6 |
| File type icon/24px | 24x24 |  |  |  |  |  | 6.0/700 | #FFFFFF | 6 |
| Prefix icon | 24x24 |  |  |  |  |  |  |  | 6 |
| Suffix icon | 20x20 |  |  |  |  |  |  |  | 6 |
| Dropdown list | 62x140 | 8.0 | #FFFFFF | #E2E2E5 |  |  |  |  | 6 |
| Pagination | 1568x63 |  |  |  | 12.2457/16.3276/12.2457/16.3276 | 283.6913757324219 | 12.245670318603516/400 | #1A1A1A | 5 |
| Tab group | 851x32 | 6.003958225250244 | #F1F0F4 |  | 4/4/4/4 | 4.002638816833496 | 16.0/600 | #FFFFFF | 5 |
| Component 2 | 75x32 | 8.0 | #FF3B4A |  | 2.00132/12.0079/2.00132/12.0079 | 6.0 | 16.0/600 | #FFFFFF | 5 |
| Component 3 | 92x32 | 8.005277633666992 | #FFFFFF |  | 2.00132/12.0079/2.00132/12.0079 | 6.0 | 16.0/400 | #45474A | 5 |
| Component 4 | 165x32 | 8.005277633666992 | #FFFFFF |  | 2.00132/12.0079/2.00132/12.0079 | 6.0 | 14.009235382080078/400 | #45474A | 5 |
| Component 5 | 165x32 | 8.005277633666992 | #FFFFFF |  | 2.00132/12.0079/2.00132/12.0079 | 6.0 | 14.009235382080078/400 | #45474A | 5 |
