# Biểu mẫu BM0 → BM5 — cấu trúc và công thức

> Trích xuất từ `2025.08.01_HR_tool_Khach hang gui.xlsx` (sheet `BM0.*` → `BM5.*`) và
> `Mo ta phan mem HR_23.06.2025.xlsx` (các sheet đối chiếu).
>
> **Đây là tài liệu quan trọng nhất trong thư mục.** Các sheet BM chứa **số liệu thật của tháng
> 4–6/2025**, và chính chúng cho ra công thức CPNC — thứ không viết ở đâu khác trong bộ tài liệu.
> File `.xlsx` gốc phải giữ lại: nó là bộ dữ liệu để kiểm chứng phép tính (xem §6).

## 0. Bản đồ mã biểu mẫu

| Mã trong app | Mã biểu mẫu chính thức | Tên | Sheet gốc | Ai ký |
|---|---|---|---|---|
| BM0 | — | Bảng lương tháng (import) | `BM0.Bang luong thang import` | — |
| BM0 | — | Bảng công tháng (import) | `BM0.Bang cong thang import` | — |
| BM1 | **BM.06** | Danh sách nhân sự tham gia nhiệm vụ KHCN | `BM1.DSNhanSu` | — |
| BM2.1 | **BM.03.01** | Bảng chấm công theo nội dung công việc (KHCN) | `BM2.1.Bang cham cong_KHCN` | Người lập biểu |
| BM2.2 | **BM.03.01** | Bảng chấm công theo nội dung công việc (SXKD) | `BM2.2.Bang cham cong_SXKD` | Người lập biểu |
| BM3 | — | Bảng tổng hợp phân bổ | `BM3.Bang TH phan bo` | — |
| BM3.1 | **BM.04.01** | Bảng chi tiết phân bổ CPNC nội bộ | `BM3.1.Bang luong_KHCN` | Chủ nhiệm nhiệm vụ |
| BM3.2 | — | Bảng tính chi phí nhân công tháng (SXKD) | `BM3.2.Bang luong_SXKD` | — |
| BM4 | **BM.04.02** | Bảng tổng hợp phân bổ CPNC nội bộ | `BM4. BTH phan bo CPNC` | Phòng Tổ chức lao động |
| BM5 | — | Danh sách nhiệm vụ | `BM5.DS Nhiem vu` | — |

> ⚠ **Bẫy đặt tên:** file cũ `Mo ta phan mem HR_23.06.2025.xlsx` có sheet `12.BM05` = **BM.05 — Bảng
> tổng hợp chi phí nhân công theo nội dung công việc** (dùng ở bước *đóng đề tài*). Đây **không phải**
> `BM5.DS Nhiem vu` của file mới. Hai thứ khác nhau hoàn toàn dù cùng đọc là "BM5".

Mọi biểu mẫu có mã `BM.xx` đều mang quốc hiệu, tiêu ngữ, dòng *"Hà Nội, ngày … tháng … năm 20.."* và
vùng ký ⇒ phần kết xuất Excel/in phải dựng theo đúng file gốc, không tự bịa bố cục.

---

## 1. BM0 — Bảng công tháng (import từ HRM)

1.179 dòng dữ liệu thật. Cấu trúc:

| Cột | Nội dung |
|---|---|
| `04. Đơn vị cấp 4` | `"Khối 1 - TCT CNC - 9013948"` — tên **kèm mã** ở cuối |
| `05. Đơn vị cấp 5 (F)` | `"Ban Giám đốc Khối - 9014043"` |
| `ID cá nhân` | `087233` — **chuỗi có số 0 đầu**, không phải số |
| `Tên đầy đủ` | |
| `01` … `31` | Ô công từng ngày, dạng `<ký hiệu>:<số giờ>` |
| `Ngày công chế độ` | |
| `Ngày công thực tế` | |
| `Công nghỉ phép` | |
| `Công nghỉ việc riêng có hưởng lương` | |
| **`Công tính lương`** | **Mẫu số của công thức CPNC — xem §6** |

**Ký hiệu công** quan sát được: `X` (đi làm) · `P` (nghỉ phép) · `DL` (?). Danh mục đầy đủ chưa có ⇒
`KyHieuCong` phải là danh mục mở, ký hiệu lạ thì cảnh báo cho qua chứ không chặn.

> ⚠ Hai bẫy parse: (a) mã đơn vị nằm **sau dấu `-` cuối cùng**, mà tên đơn vị lại chứa dấu `-`
> (`"Trung tâm Công nghệ Cơ khí - Tự động hóa - 9033xxx"`) ⇒ tách từ phải sang; (b) `ID cá nhân` giữ
> số 0 đầu ⇒ đọc là chuỗi, ép sang số là mất dữ liệu. Dòng 1 của sheet có ghi chú của khách:
> *"=> Chuyển thành số để import"* — **không làm theo**, đó là mẹo Excel của người lập file.

Cây đơn vị 5 cấp đầy đủ (đọc từ sheet `3.LuongMucTieu` của file cũ):

```
Cấp 1  Tập đoàn Công nghiệp - Viễn thông Quân đội                     148842
Cấp 2  Công ty mẹ - Tập đoàn Công nghiệp - Viễn thông Quân đội        9001803
Cấp 3  Tổng công ty Công nghiệp Công nghệ cao Viettel                 9013878
Cấp 4  Khối 3 - TCT CNC                                              9013950
Cấp 5  Trung tâm Camera                                              9033832
```

---

## 2. BM0 — Bảng lương tháng (import từ HRM)

2.503 dòng dữ liệu thật. Header 3 tầng merge. Các nhóm cột:

| Nhóm | Cột con |
|---|---|
| Định danh | `Stt` · `Mã nhân viên` · `Họ và tên` · `Đối tượng` |
| Thông tin công | `Công tiêu chuẩn` · `Công tính lương` |
| Lương | `Lương tháng (trừ làm thêm, lương phép)` · `Lương tháng (trừ BH cá nhân)` · `Truy thu/truy lĩnh (lương tháng lần 2)` · `Lương SXKD (nếu có)` · `Lương thử việc, tập nghề` · `Lương kinh doanh thử việc, tập nghề` |
| Bảo hiểm, KPCĐ | `BHXH` (Cá nhân/Đơn vị) · `BHYT` (Cá nhân/Đơn vị) · `BHTN` (Cá nhân/Đơn vị) · `KPCĐ` |
| Khác | `Các khoản ăn ca, điện thoại, chi phí, phụ cấp` |
| Đơn vị | `Đơn vị` · `Đơn vị cấp 5` · `Đơn vị cấp 4` · `GT/TT` |

Tổng quỹ lương tháng của file mẫu: **47.093.365.550 đ**. Đây là **mẫu số của báo cáo tỷ lệ PBNC toàn
VHT** (sheet `3.Báo cáo` dòng 51: *"Quỹ lương tháng của VHT tính theo tổng của bảng lương tháng đã
import"*).

Ngoài ra file cũ có sheet `3.LuongMucTieu` — hồ sơ lương mục tiêu 28 cột (bảng lương, vùng, bậc,
bước, ngày hiệu lực, chức danh, diện đối tượng, loại hợp đồng, thâm niên phép…). Q&A trong `MotaCV`
cho thấy khách **chưa chốt** có quản lý quá trình lương hay chỉ upload thuần tuý ⇒ ngoài phạm vi
hiện tại.

---

## 3. BM1 (BM.06) — Danh sách nhân sự tham gia nhiệm vụ KHCN

Chỉ 7 cột — đơn giản nhất trong bộ:

`TT · MÃ NV · Họ và tên · Chức danh · Nội dung công việc tham gia nhiệm vụ KHCN · Thời gian tham gia ·
Ghi chú`

Ví dụ dòng thật: `1 | 123204 | Nguyễn Văn X1 | Phó giám đốc | Thiết kế phần cứng | từ ngày … đến khi
kết thúc đề tài`.

Header: `Tên nhiệm vụ KHCN: ………` / `Mã số: …………`.

> **[ghi chú]** Biểu mẫu này **không có cột tỷ lệ phân bổ %**. "Thời gian tham gia" là văn bản tự do
> kiểu *"từ ngày … đến khi kết thúc đề tài"*, không phải con số để tính tiền. Đây là bằng chứng chính
> cho việc `tyLePhanBo` trong code đợt 1 là khái niệm không có trong nghiệp vụ của khách.

---

## 4. BM2.1 / BM2.2 (BM.03.01) — Bảng chấm công theo nội dung công việc

47 cột (KHCN) / 39 cột (SXKD). Header 3 tầng:

```
STT | Nội dung | Nhân sự tham gia          | Tháng 5 / 2025                        | Ghi chú
                | Mã nhân viên | Họ và tên | 01 … 31 | Tổng thời gian thực hiện
                |              |           | T5 T6 T7 CN … | Số ngày | Số man-month
```

**Cấu trúc thân bảng — chia mục La Mã:**

- `I - Nhân sự quản lý đề tài` → Chủ nhiệm đề tài, Thư ký đề tài
- `II - Nhân sự nghiên cứu trực tiếp` → các nội dung CV (Kiểm thử, Nghiên cứu giải pháp, Thiết kế cơ
  khí…)
- `TỔNG CỘNG`
- Vùng ký: `NGƯỜI LẬP BIỂU`

BM2.2 (SXKD) khác hai chỗ: mục I là `Nhân sự quản lý dự án`, và có thêm dòng header
`Nguồn: CHỌN NGUỒN (SXKD/Bán hàng/Bảo hành/Đầu tư phát triển)`.

Hai đơn vị đo song song: **Số ngày** và **Số man-month**.

> **[ghi chú]** Note của khách ngay trong sheet: *"Không chia mục I, II nữa"* và *"Các nội dung mà có
> nhiều nhân sự bị tách thành nhiều dòng thì thêm dòng group (như mẫu BM3.1)"* ⇒ bản hệ thống dùng
> **gom nhóm theo nội dung CV** kiểu BM3.1, bỏ hai mục La Mã.

---

## 5. BM3 — Bảng tổng hợp phân bổ (51 cột) — nguồn của công thức

Đây là sheet cho ra công thức CPNC. Cấu trúc:

**Khối định danh:** `STT · MNV · Họ và tên · Tên đề tài · Mã đề tài, dự án · Nội dung công việc ·
Phân nguồn (KHCN, QL, Bán hàng, Bảo hành, SXKD) · Đơn vị trong DS · Đơn vị phân bổ · Khối`

**Khối công:** `Công chế độ · Công tính lương · Công phân bổ`

**Khối kỹ thuật Excel** (bỏ khi lên hệ thống): `Mã (ghép MNV và ngày công)` · `Số lần xuất hiện mã` ·
`Số lần xuất hiện mã đến dòng hiện tại` — đây là mẹo dò trùng bằng công thức, thay bằng ràng buộc
khoá duy nhất `(maNhanVien, ngay)`.

**Khối `CHI PHÍ NHÂN CÔNG THÁNG (làm căn cứ phân bổ)`** — 14 cột + `CỘNG`
**Khối `CHI PHÍ NHÂN CÔNG PHÂN BỔ`** — 14 cột + `CỘNG` (cùng danh sách khoản mục)

14 khoản mục, đúng thứ tự trong file:

1. Lương tháng
2. Lương tháng (trừ BH cá nhân)
3. Truy thu/truy lĩnh (lương tháng lần 2)
4. Lương SXKD (nếu có)
5. Lương thử việc, tập nghề
6. Lương kinh doanh thử việc, tập nghề
7. BHXH — Cá nhân
8. BHXH — Đơn vị
9. BHYT — Cá nhân
10. BHYT — Đơn vị
11. BHTN — Cá nhân
12. BHTN — Đơn vị
13. KPCĐ
14. Các khoản ăn ca, điện thoại, chi phí phụ cấp

→ `CỘNG`

---

## 6. Công thức CPNC — suy ra từ số liệu thật của BM3

```
tyLe = congPhanBo / congTinhLuong           ← mẫu số là công tính lương CỦA CHÍNH NGƯỜI ĐÓ
CPNC_phanBo[i] = CPNC_thang[i] × tyLe       ← áp cho TỪNG khoản mục i, không phải cho tổng
```

**Kiểm chứng** — BM3 dòng 5, `121262 Lê Trần Sự`, `Công tính lương = 21`, `Công phân bổ = 6`:

| Khoản mục | CPNC tháng | Kỳ vọng ×6/21 | BM3 ghi |
|---|---:|---:|---:|
| Lương tháng | 113.316.438 | 32.376.125 | **32.376.125** ✓ |
| BHXH cá nhân | 1.503.216 | 429.490 | **429.490** ✓ |
| BHXH đơn vị | 3.288.285 | 939.510 | **939.510** ✓ |
| KPCĐ | 375.804 | 107.373 | **107.373** ✓ |
| Ăn ca, điện thoại | 1.730.000 | 494.286 | **494.286** ✓ |

Cùng người, dòng 9 (`Nhiệm vụ khác`, `Công phân bổ = 15`): `113.316.438 × 15/21 = 80.940.313` — khớp.
`6 + 15 = 21 = Công tính lương` ⇒ **tổng phân bổ của một người luôn bằng 100% chi phí tháng của họ.**

⇒ Pro-rata tuyến tính, làm tròn tới **đồng**. Không có hệ số nào khác.

### 6.1 Quy tắc công thừa — ghi ở BM3 dòng 13

> *"Số ngày công của nhân sự đã được phân bổ ở một số nhiệm vụ nhưng chưa full công tính lương thì sẽ
> chuyển hết vào Nội dung nhiệm vụ khác và thuộc nguồn Chi phí quản lý."*

⇒ Hệ thống **tự sinh** dòng bù sau khi PA/PM chấm xong:
`nhiemVu = "Nhiệm vụ khác"`, `phanNguon = Quản lý`,
`congPhanBo = congTinhLuong − Σ congDaPhanBo`.

Đây là lý do tổng CPNC phân bổ luôn khớp 100% quỹ lương — chính là con số mẫu của báo cáo *tỷ lệ
PBNC*. Bỏ quy tắc này thì tỷ lệ PBNC luôn < 100% một cách vô nghĩa.

### 6.2 Biến thể PAKD — sheet `8.PhanBoCPNC` của file cũ

Cùng cấu trúc BM3 nhưng thêm cột **`Mã sản phẩm`** (`PO-92127-03-02-01`) ⇒ với nhiệm vụ PAKD, CPNC
phân bổ tới **cấp sản phẩm**, không dừng ở nhiệm vụ.

---

## 7. BM3.1 (BM.04.01) — Bảng chi tiết phân bổ CPNC nội bộ

Header: `BẢNG CHI TIẾT PHÂN BỔ CHI PHÍ NHÂN CÔNG NỘI BỘ - Tháng 04/2025`, `Tên nhiệm vụ KHCN: …`,
`Mã số: 003-24-VHT-RDP-DS`.

Cột: `STT · Nội dung · MNV · Họ và tên · Giá trị dự toán phê duyệt · Số tháng dự toán phê duyệt ·
[CĂN CỨ PHÂN BỔ: Công chế độ, Công tính lương, Lương tháng, BHXH, BHYT, BHTN, KPCĐ, Các khoản hỗ trợ]
· [SỐ PHÂN BỔ: Thời gian tham gia trong tháng, Lương tháng, BHXH, BHYT, BHTN, KPCĐ, Các khoản hỗ
trợ, TỔNG] · Tổng thời gian tham gia trong tháng (man-month) · Lũy kế chi phí nhân công đến hết
tháng hiện tại · Lũy kế thời gian nhân công thực hiện đến hết tháng hiện tại`

**Thân bảng gom nhóm theo nội dung công việc**, mỗi nhóm có dòng `<tên nội dung> Total` đứng **trước**
các dòng nhân sự. Ví dụ thật:

```
  Quản lý đề tài Total
1 Quản lý đề tài                                       176856  Nguyễn Đức Thành
2 Quản lý đề tài                                       185613  Nguyễn Thị Phương Anh
  Phát triển ứng dụng dẫn xuất và triển khai thử nghiệm Total
4 Phát triển ứng dụng dẫn xuất …                       064461  Lương Nhật Quang
…
II. Nhân công gián tiếp
   TỔNG
```

**Khối báo cáo cuối biểu mẫu** (`Báo cáo tình hình thực hiện nhân công dự toán nhiệm vụ`) — 5 dòng
A→E, phải tính chứ không phải chỗ trống:

| | Nội dung |
|---|---|
| A | Tổng chi phí nhân công theo dự toán và Chi phí quản lý nhiệm vụ KHCN được sử dụng |
| B | Chi phí nhân công đã phân bổ lũy kế đến tháng hiện tại |
| C | Chi phí nhân công phân bổ tháng |
| D | Chi phí nhân công đã phân bổ lũy kế đến hết tháng hiện tại |
| E | Chi phí nhân công còn được phân bổ |

Kèm ghi chú in trên biểu mẫu: *"Khi tổng chi phí nhân công có khả năng/đã vượt dự toán, cơ quan Tổ
chức lao động có trách nhiệm thông báo chủ nhiệm đề tài/dự án báo cáo xin bổ sung kinh phí."*

Vùng ký: `CHỦ NHIỆM NHIỆM VỤ`.

---

## 8. BM3.2 — Bảng tính chi phí nhân công tháng (SXKD)

Header: `BẢNG TÍNH CHI PHÍ NHÂN CÔNG THÁNG 06/2025` · **`Kỳ lương: 06/2025 - Kỳ trả: 07/2025`** ·
`Dự án: …` · `Sản phẩm: …` · `Nguồn kinh phí: SXKD`.

> **[ghi chú]** Dòng `Kỳ lương ≠ Kỳ trả` là bằng chứng phải mô hình hoá **hai mốc thời gian** cho
> thực thể `Ky`, không phải một.

Cột: `STT · MNV · Họ và tên · Đơn vị phân bổ · [Chi phí nhân công tháng làm căn cứ phân bổ: 18 cột] ·
[Chi phí nhân công phân bổ trong tháng: …]`. Thân bảng chia mục
`I. CHI PHÍ NHÂN CÔNG TRỰC TIẾP TẠI ĐƠN VỊ` (và mục gián tiếp tương ứng).

---

## 9. BM4 (BM.04.02) — Bảng tổng hợp phân bổ CPNC nội bộ

Tiêu đề: `BẢNG TỔNG HỢP PHÂN BỔ CHI PHÍ NHÂN CÔNG NỘI BỘ - LƯƠNG THÁNG / 6 THÁNG / NĂM … NĂM 20…`

Cột: `STT · Tên nhiệm vụ KHCN · Mã số · Dự toán phê duyệt · Lương tháng · Lương 6 tháng · Lương năm ·
Phụ cấp lương · [Các khoản trích theo lương: BHXH, BHYT, BHTN, KPCĐ] · Các khoản hỗ trợ · TỔNG ·
Lũy kế chi phí nhân công`

Thân bảng 3 khối:

| | |
|---|---|
| **A** | Tổng chi phí nhân công theo bảng lương |
| **B** | Phân bổ chi phí nhân công nội bộ nhiệm vụ KHCN (liệt kê từng nhiệm vụ 1, 2, …) |
| **C** | **Chênh lệch** |

Vùng ký: `PHÒNG TỔ CHỨC LAO ĐỘNG`.

> **[ghi chú]** `C = A − B` chính là phần công không gán được vào nhiệm vụ nào — liên hệ trực tiếp
> với quy tắc công thừa §6.1. Nếu quy tắc đó được cài đúng thì `C` bằng đúng tổng của "Nhiệm vụ khác
> / Chi phí quản lý".

---

## 10. BM5 — Danh sách nhiệm vụ

26 cột, có **dữ liệu thật của Khối 1 / Trung tâm Chỉ huy điều khiển**.

`TT · KHỐI · ĐV Chủ trì · ĐV Phân bổ · TÊN ĐỀ TÀI/DỰ ÁN · NGUỒN · PHÂN LOẠI · TÌNH TRẠNG PHÂN BỔ ·
TỔNG DỰ TOÁN · CP NHÂN CÔNG THEO DỰ TOÁN · BẮT ĐẦU · KẾT THÚC · PM · PA · MÃ ĐỀ TÀI · Chi phí còn
lại chưa phân bổ · Lũy kế 2025 đã phân bổ · [cột động: 12/2024, 01/2025 … 06/2025] · Tạm tính lương
6 tháng 2025 · Tạm tính lương Năm 2025`

**Cấu trúc phân cấp nằm ở cột `PHÂN LOẠI`:**

| `PHÂN LOẠI` | Ý nghĩa |
|---|---|
| `Chính` | Dòng **nhiệm vụ** — có đủ tổng dự toán, CPNC, PM, PA, mã đề tài |
| `Thành phần` | Dòng **nội dung công việc** — chỉ có ĐV phân bổ riêng + số tiền theo tháng |

Ví dụ thật:

```
Chính       Khối 1 | CHĐK | CHĐK   | Nghiên cứu, xây dựng nền tảng tự động hoá chỉ huy … | KHCN
                     tổng dự toán 64.780.261.308 · CPNC 23.043.245.371 · mã 011-24-TĐ-RDP-QS
                     PM tiemnm@viettel.com.vn · PA halt73@viettel.com.vn
Thành phần  Khối 1 | CHĐK | CHĐK   | Nội dung CV 1
Thành phần  Khối 1 | CHĐK | KD ĐH  | Nội dung CV 2      ← ĐV phân bổ KHÁC ĐV chủ trì
Thành phần  Khối 1 | CHĐK | ĐBCL   | Nội dung CV 3
```

Nhiệm vụ SXKD `PO-92166` cho thấy **một nhiệm vụ có nhiều dòng theo nguồn**: `SXKD` (Chính + 2 Thành
phần), `Bán hàng`, `Bảo hành`.

> **[ghi chú]** Ba điều rút ra, đều quan trọng:
> 1. Đây là bằng chứng cho `NoiDungCongViec` là thực thể riêng, con của nhiệm vụ.
> 2. `ĐV Phân bổ` khác `ĐV Chủ trì` **ở cấp nội dung công việc** — đây chính là thứ sinh ra bước
>    "PA/PM chủ trì xác nhận".
> 3. `PM`/`PA` lưu bằng **email** trong file khách, không phải mã nhân viên.
>
> Nhiệm vụ `Bảo hành` có `CP nhân công theo dự toán` trống ⇒ khớp luật "nguồn Bảo hành chỉ theo dõi
> số đã phân bổ".

---

## 11. `1.NhapDeTai` (file cũ) — form khai nhiệm vụ

Gần trùng BM5, khác ở chỗ có cột **`Tên sản phẩm thuộc Đề tài/dự án`** và các danh sách chọn:

- `NGUỒN`: `KHCN` · `SXKD` · `QPAN` · `DADT` · `Bán hàng` · `Bảo hành`
- `PHÂN LOẠI` (ở đây mang nghĩa *tình trạng*): `Đang trình phê duyệt` · `Đang phân bổ` · `Đã hết hạn`
- Công thức ghi trên file: `Chi phí còn lại chưa phân bổ = (2) − (3)`, trong đó `(2) = CP nhân công
  theo dự toán`, `(3) = Lũy kế đã phân bổ = tổng các tháng đã phân bổ`

> **[ghi chú]** Cột `NGUỒN` ở đây có `DADT` còn BM5 ghi `ĐTPT` — cùng một thứ, đặt tên khác nhau
> giữa hai file. Chuẩn hoá về `ĐTPT`.

---

## 12. Kiểm chứng bắt buộc khi cài công thức

Bộ dữ liệu thật trong file đủ để chạy một bài test end-to-end. Đây là **bài kiểm tra duy nhất chứng
minh công thức đúng** — không có nó thì mọi báo cáo chỉ là số đẹp:

1. Import `BM0.Bang cong thang import` + `BM0.Bang luong thang import`.
2. Chấm lại đúng phân bổ của BM3 dòng 5–9 (2 người, 4 nhiệm vụ).
3. So từng khoản mục với cột `CHI PHÍ NHÂN CÔNG PHÂN BỔ` của BM3 — phải khớp **đến từng đồng**.
4. Kiểm tra quy tắc công thừa: người có `congTinhLuong = 21` chấm 6 ngày ⇒ hệ thống tự sinh 15 ngày
   vào `Nhiệm vụ khác / Chi phí quản lý`, tổng CPNC phân bổ = 100% CPNC tháng.
