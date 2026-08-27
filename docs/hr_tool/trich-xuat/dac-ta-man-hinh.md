# Đặc tả màn hình — bản khách gửi 2025-08-01

> Trích xuất từ `2025.08.01_HR_tool_Khach hang gui.xlsx`, các sheet `0.QuyTrinh`, `1.DS Nhân sự`,
> `2.Chấm công`, `3.Báo cáo`, `4. Trình ký`, `List`, cộng **ảnh sơ đồ quy trình nhúng trong
> `0.QuyTrinh`** (`xl/media/image1.png`).
> Đây là **bản đặc tả có hiệu lực cao nhất** về màn hình, trạng thái, quyền và ngưỡng cảnh báo —
> cao hơn cả BRD (BRD tóm tắt, sheet này cụ thể) và cao hơn Figma ở mọi điểm nghiệp vụ.
>
> Biểu mẫu BM0–BM5 tách sang [`bieu-mau-bm0-bm5.md`](bieu-mau-bm0-bm5.md).

> **Phạm vi đã đọc.** File có **18 sheet**: 16 sheet hiện + 2 sheet **ẩn** (`Estimate HR KH`,
> `Sheet1`). Khách đã ẩn hai sheet đó ⇒ **ngoài phạm vi, không đọc, không dựng theo**. Nếu về sau
> có ai mở ra thấy nội dung lệch tài liệu này thì đó là lý do — đừng coi là mâu thuẫn cần xử lý.

## 0. Quy trình tháng và bố cục chung

### 0.1 Quy trình tháng — sơ đồ khách vẽ trong sheet `0.QuyTrinh`

Sơ đồ là **ảnh nhúng**, không phải ô — `trich-xuat.py` chỉ đọc ô nên bản trích xuất trước bỏ sót.
Chép lại nguyên văn nhãn từng khối:

| # | Khối | Ai làm | Màn tương ứng |
|---|---|---|---|
| — | Bắt đầu | | |
| 1 | HR **Import** bảng công, bảng lương | HR | Tab 4 nhóm `IMPORT` (§4) |
| 2 | PA **nhập danh sách nhân sự và chấm công** | PA | Tab 1 (§1.1) + Tab 2 (§2) |
| 3 | **Phần mềm tự động tính lương**, hiển thị tạm tính | hệ thống | `CPNC tạm tính` trên thanh công cụ tab 2 (§2.5) |
| 4 | **PA/PM chủ trì xác nhận** | PA/PM đơn vị chủ trì | §2.7 — hai nhánh TH1 / TH2 |
| 5 | **HR Thẩm định, feedback** | HR | *chưa có màn nào trong đặc tả 4 tab* |
| 6 | HR **xuất Bảng tổng hợp công, lương theo BM** | HR | Tab 4 nhóm `XUẤT EXCEL` (§4) |
| 7 | HR **Trình ký VO** Bảng lương, công, DS nhân sự **từng nhiệm vụ** | HR | Tab 4 nhóm `TRÌNH KÝ VO THEO NHIỆM VỤ` (§4) |
| — | Kết thúc | | |

Ba điều sơ đồ này quyết định mà nơi khác không nói rõ:

1. **Đây là luồng THÁNG, không phải vòng đời nhiệm vụ.** Nó bắt đầu thẳng từ bước import và bỏ hẳn
   hai bước đầu của [BRD §3](brd-phan-bo-nhan-cong.md) (*khởi tạo nhiệm vụ*, *thiết lập ngân sách và
   phân rã nội dung công việc*). Hai luồng chạy ở hai nhịp khác nhau — **đừng gộp thành một quy
   trình duy nhất**, và đừng dựng workflow engine cho luồng tháng.
2. **Xuất biểu mẫu là một bước riêng, đứng trước trình ký.** HR xuất ra đối soát rồi mới đẩy sang
   VOffice; không phải trình ký kéo theo xuất file.
3. **Bước 5 có chữ "feedback"** ⇒ hàm ý đường quay lui về PA. Nhưng máy trạng thái ở §1.2 chỉ có 4
   trạng thái tiến một chiều, không có "HR trả lại", và §2.7 nói thẩm định diễn ra *"qua trao đổi
   tương tác ngoài"*. **Mâu thuẫn chưa có lời giải trong tài liệu** — xem câu hỏi mở cuối file.

### 0.2 Bố cục chung

Ứng dụng có **4 tab ở cột trái**:

1. Danh sách nhân sự
2. Chấm công
3. Báo cáo
4. Trình ký

Header cố định trên mọi màn: **Đơn vị** (và **Khối** ở màn Báo cáo / Trình ký).

---

## 1. Tab 1 — Danh sách nhân sự

Có **hai biến thể theo tài khoản**.

### 1.1 Màn hình tài khoản PA/PM

- Hiện toàn bộ danh sách nhân sự của **đơn vị phân bổ (đơn vị cấp 5)**.
- Chọn thời gian **Tháng/Năm** — mặc định tháng hiện tại cần phân bổ; các tháng trước hiện thông tin
  đã duyệt.
- Hiển thị **tỷ lệ chi phí nhân công đã phân bổ của đơn vị cấp 5** theo tháng đã chọn
  = `CPNC phân bổ / quỹ lương tháng đó`.
- Bảng: `TT · MÃ NV · Họ và tên · Chức danh · [thông tin công tháng: cột 1…31, kèm thứ T2–CN]`.
- **Chú thích màu theo nhiệm vụ**: mỗi nhiệm vụ một màu (Dự án A, Dự án B, Đề tài C, Đề tài B…),
  cộng hai màu đặc biệt: `T7/CN/Nghỉ phép` và `Chưa chấm công`.

### 1.2 Màn hình tài khoản HR

- Chọn thời gian Tháng/Năm như trên.
- Bảng: `Đơn vị cấp 4 · Đơn vị cấp 5 · Trạng thái · Tỷ lệ CPNC đã phân bổ`.
- **Trạng thái tự động cập nhật 1 trong 4 giá trị** — đây là vòng đời chính thức của việc chấm công:

  | # | Trạng thái |
  |---|---|
  | 1 | Chưa chấm công |
  | 2 | PA đã submit chấm công |
  | 3 | PA/PM chủ trì đã xác nhận |
  | 4 | HR hoàn thành trình ký |

- Hiển thị theo thứ tự, gom các đơn vị cấp 5 cùng đơn vị cấp 4.
- Click vào dòng để xem tab chấm công của đơn vị đó.

### 1.3 Ghi chú nghiệp vụ của khách (sheet `1.DS Nhân sự` dòng 35–43)

- Khi PA/PM chọn tháng ⇒ **nhìn luôn toàn bộ nhân sự của mình tham gia vào những nhiệm vụ nào.**
- PM/PA quản lý nhân sự **thông qua đơn vị**. Mô hình đơn vị giống mô hình của Tập đoàn.
- **PA ở phòng Tổng hợp chấm công cho đơn vị khác** ⇒ *"Đổi thành cho chọn chủ động, không mặc định
  hiển thị theo đơn vị trực thuộc cấp 5 nữa, mỗi lần chọn 1 đơn vị."*
- **1 nhiệm vụ có 1 PM và 1 PA đơn vị chủ trì. Mỗi đơn vị phân bổ có 1 PA.**
- ⇒ *"Quản lý danh sách vai trò PA, PM của nhiệm vụ (khác với chức danh / vị trí của HRM)."*

> **[ghi chú]** Hai gạch đầu dòng cuối là yêu cầu một thực thể `VaiTroNhiemVu` riêng — không dùng
> lại chức danh HRM, cũng không dùng vai trò hệ thống của `core/models/roles.ts`.

---

## 2. Tab 2 — Chấm công

Màn quan trọng nhất của phân hệ.

### 2.1 Khối thông tin nhiệm vụ (chung cho mọi phân loại)

Ô tìm: *"Gõ tên nhiệm vụ / mã nhiệm vụ để ra nhiệm vụ đã có thông tin; nếu chưa có thì ấn nút tạo
mới / import."* Nút: `+ SỬA`, `+ TẠO MỚI`, `+ IMPORT` (import theo BM5).

7 trường:

| # | Trường | Kiểu |
|---|---|---|
| 1 | Mã nhiệm vụ | text |
| 2 | Đơn vị chủ trì | Đơn vị cấp 5 + Đơn vị cấp 4 (xem sheet `List`) |
| 3 | Chủ nhiệm đề tài/dự án · Trợ lý đề tài/dự án | = PM · PA |
| 4 | Thời gian bắt đầu · kết thúc | `mm/yyyy` |
| 5 | **Phân loại** | `Đề tài KHCN` / `Phương án kinh doanh` / `Dự án ĐTPT` / `Nhiệm vụ QPAN` |
| 6 | Tổng dự toán được phê duyệt | VNĐ |
| 7 | **Chi phí nhân công được phê duyệt** | VNĐ — **khác** trường 6 |

**Trường 5 quyết định layout phần dưới.** Ba biến thể:

### 2.2 Biến thể A — phân loại = Đề tài KHCN

Bảng nội dung công việc:

| Nội dung CV | CPNC được phê duyệt | CPNC đã phân bổ đến tháng N-1 | Dự phòng | CPNC còn lại | Tạm tính lương 6 tháng | Tạm tính lương năm |
|---|---|---|---|---|---|---|

Bảng chấm công: `TT · MÃ NV · Họ và tên · Chức danh · Nội dung công việc tham gia nhiệm vụ ·
[1…31 kèm thứ] · Ghi chú`, mỗi dòng có `+ SỬA` `+ XOÁ`, cuối bảng `+ THÊM MỚI`.

Cột *Nội dung công việc tham gia* — **chọn theo danh sách nhiệm vụ được phê duyệt**, không nhập tự do.

### 2.3 Biến thể B — phân loại = PAKD (Phương án kinh doanh)

Bảng nguồn/sản phẩm:

| Phân nguồn | Sản phẩm | Thời gian bắt đầu | Thời gian kết thúc | CPNC được phê duyệt | CPNC đã phân bổ đến N-1 | Dự phòng | CPNC còn lại | Tạm tính 6 tháng | Tạm tính năm |
|---|---|---|---|---|---|---|---|---|---|
| SXKD | A, B | | | | | | | | |
| Bán hàng | A, B | | | | | | | | |
| **Bảo hành** | — | | | | | | | | |

> **Nguồn Bảo hành chỉ cần theo dõi số tiền đã phân bổ** — không lập dự toán, không có "còn lại".

Bảng chấm công: **`CHỌN NGUỒN` là bắt buộc**; bảng có thêm **dòng nhóm theo sản phẩm** (`A - SẢN PHẨM
A`, `B - SẢN PHẨM B`) rồi mới tới các dòng nhân sự.

### 2.4 Biến thể C — phân loại = ĐTPT / QPAN

Không có bảng nội dung công việc, chỉ một dòng tổng:
`CPNC được phê duyệt · đã phân bổ đến N-1 · Dự phòng · còn lại · Tạm tính 6 tháng · Tạm tính năm`.

Bảng chấm công như biến thể A.

### 2.5 Thanh công cụ (giống nhau ở cả 3 biến thể)

- **Thời gian**: chọn theo Tháng/Năm.
- **CPNC tạm tính**: VNĐ — *"phần mềm tính theo bảng lương import"*, hiện ngay trên màn.
- Ba nút xuất: `Xuất DS Nhân sự excel` (BM1) · `XUẤT BẢNG CÔNG excel` (BM2.1) ·
  `XUẤT BẢNG LƯƠNG excel` (BM3.1 với KHCN, BM3.2 với các loại còn lại).
  **Cả ba nút có mặt ở cả ba biến thể** — và theo ma trận quyền §2.6, nút thứ ba **chỉ HR** bấm được.
- Cuối bảng: `SUBMIT` và `PA/PM chủ trì xác nhận`.

> **⚠ Bẫy BM2.1 / BM2.2.** Ô của khách ghi `BM 2.1` cho **cả ba** biến thể (dòng 30, 65, 103) — kể
> cả biến thể PAKD. Nhưng tên sheet biểu mẫu là `BM2.1.Bang cham cong_KHCN` và
> `BM2.2.Bang cham cong_SXKD`, tức PAKD/SXKD phải ra **BM2.2**. Nhiều khả năng khách copy dòng.
> Bộ mockup đang dựng theo BM2.2 cho biến thể B — **cần khách xác nhận**, xem câu hỏi mở cuối file.

### 2.6 Ghi chú và ma trận quyền (dòng 124–138) — bản có hiệu lực

Năm luật:

1. Khi chọn tháng mới thì **tự động hiện danh sách nhân sự gợi ý như tháng gần nhất**.
2. Muốn thêm mới thì **gõ mã NV ⇒ tự động hiện ra tên / chức danh**.
3. **Tự động khoá không chấm công được** các ngày: nghỉ phép · ngày T7, CN · đã submit chấm công ở
   nhiệm vụ khác trong cùng tháng · nhiệm vụ chưa bắt đầu hoặc đã hết hạn.
4. **Chỉ ấn submit được khi điền đủ nội dung CV và Nguồn.**
5. Phân quyền:

| Hành động | PA ĐV chủ trì | PA ĐV khác | PM | HR |
|---|:---:|:---:|:---:|:---:|
| Chấm công | ✓ | ✓ | ✓ | ✓ |
| Thêm mới | ✓ | ✓ | ✓ | ✓ |
| Xoá | ✓ | ✓ | ✓ | ✓ |
| Sửa | ✓ | ✓ | ✓ | ✓ |
| Submit | ✓ | ✓ | ✓ | ✓ |
| PA/PM chủ trì xác nhận | ✓ | — | ✓ | — |
| Xuất DS nhân sự excel | ✓ | — | ✓ | ✓ |
| Xuất bảng công excel | ✓ | — | ✓ | ✓ |
| **Xuất bảng lương excel** | — | — | — | **✓** |

> **[ghi chú]** Dòng cuối trả lời câu hỏi "ai được xem cột tiền": **chỉ HR**. Luật 3 là phần logic
> nặng nhất của cả phân hệ — chi tiết cách cài ở
> [kế hoạch thi công §5.3](../../plan/hr-tools-ke-hoach-thi-cong-2026-08-26.md).

### 2.7 Xác nhận (sheet `0.QuyTrinh` dòng 19–22)

- **Xác nhận** = xác nhận thông tin công PA đã chấm.
  - **TH1**: PA đơn vị chấm công không phải đơn vị chủ trì ⇒ PA/PM của đơn vị chủ trì xác nhận.
  - **TH2**: PA đơn vị chấm công = đơn vị chủ trì ⇒ **vừa submit vừa xác nhận**.
- **Thẩm định**: HR nhận thông tin ⇒ thẩm định qua trao đổi tương tác ngoài.

---

## 3. Tab 3 — Báo cáo

### 3.1 Tài khoản PA/PM đơn vị chủ trì

**Báo cáo "Theo dõi nguồn CPNC của các nhiệm vụ"** — ĐVT: triệu đồng, có nút *Xuất báo cáo excel*
(xuất BM5, **riêng nhiệm vụ của đơn vị chủ trì**).

| Nhiệm vụ của ĐV chủ trì | Phân nguồn | Nguồn đã được lập dự toán | Nguồn đã phân bổ | Nguồn cần để phân bổ 6 tháng/năm | Nguồn còn lại |
|---|---|---|---|---|---|
| Nhiệm vụ 1 (KHCN) | KHCN | 10.000 | 11.000 | 1.000 | **−2.000** |
| Nhiệm vụ 2 (SXKD) | SXKD | 20.000 | 8.000 | 1.500 | 10.500 |
| Nhiệm vụ 2 (Bán hàng) | Bán hàng | 3.000 | 1.000 | 200 | 1.800 |
| Nhiệm vụ 3 (ĐTPT) | ĐTPT | 30.000 | 22.000 | 3.000 | 5.000 |
| **Tổng** | | 63.000 | 42.000 | 5.700 | 15.300 |

- `Nguồn đã được lập dự toán` = **CPNC được phê duyệt + Dự phòng (nếu có)**.
- **Cột "Nguồn còn lại" có thể âm** — mẫu của khách ghi `−2000`. Đừng clamp về 0.

**Báo cáo "Tỷ lệ PBNC của đơn vị trong năm"** — biểu đồ 12 tháng,
= `tổng CPNC được phân bổ mỗi tháng / quỹ lương tháng của đơn vị cấp 5`.
Số mẫu trong file: 58,0% · 64,0% · 66,8% · 70,0% · 75,3% (T1–T5/2025).

### 3.2 Cấu hình mail cảnh báo (dòng 36–39) — bản có hiệu lực

| # | Nội dung gửi mail cảnh báo | PA/PM | GĐTT | BGĐ Khối | HR | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | **Nhiệm vụ sắp hết nguồn** | Cảnh báo nếu tháng N+1 **và** N+2 CPNC phân bổ = tháng N thì cảnh báo không đủ nguồn | Cảnh báo nếu tháng N+1 CPNC phân bổ = tháng N thì không đủ nguồn | — | Như PA/PM (N+1 và N+2) | |
| 2 | **Tỷ lệ PBNC của đơn vị hàng tháng** | — | Hàng tháng | — | Hàng tháng | Nếu **< 70%** có nội dung cảnh báo trong mail |
| 3 | **Tỷ lệ PBNC của Khối hàng quý** | — | — | Hàng quý | Hàng quý | Nếu **< 70%** có nội dung cảnh báo trong mail |

> **[ghi chú]** Luật 1 là **phép ngoại suy tuyến tính** (giả định 2 tháng tới tiêu bằng tháng này),
> không phải ngưỡng phần trăm còn lại. Hai vai trò `GĐTT` (Giám đốc Trung tâm) và `BGĐ Khối` chưa có
> trong `core/models/roles.ts`.

### 3.3 Tài khoản HR

- **Tỷ lệ PBNC của 3 KHỐI** = `tổng CPNC phân bổ mỗi tháng / quỹ lương tháng của tổng 3 khối`.
- **Tỷ lệ PBNC của VHT** = `… / quỹ lương tháng của cả VHT`, trong đó *"quỹ lương tháng của VHT tính
  theo tổng của bảng lương tháng đã import"*.
- **Danh sách nhiệm vụ sắp hết nguồn** — *"nguồn còn lại dự kiến không đủ phân bổ cho 2 tháng tiếp
  theo"*. Cột: `Nhiệm vụ · ĐV chủ trì · Phân nguồn · Nguồn đã lập dự toán · Dự phòng · Nguồn đã phân
  bổ · Nguồn cần để phân bổ 6 tháng/năm · Nguồn còn lại`. Xuất kèm BM5 **tất cả nhiệm vụ của VHT**.

---

## 4. Tab 4 — Trình ký

**Chỉ hiện với tài khoản HR.** Chọn thời gian theo Tháng/Năm. Bốn nhóm nút:

| Nút | Bao gồm | Tần suất |
|---|---|---|
| `IMPORT` | 0. Bảng lương tháng · 0. Bảng công tháng | Nhập hàng tháng |
| | 5. Danh sách nhiệm vụ | Nhập khi có nhiệm vụ mới |
| `XUẤT EXCEL` | 3. Bảng TH phân bổ · 4. Bảng TH phân bổ CPNC | |
| `TRÌNH KÝ VO THEO NHIỆM VỤ` | 1. Danh sách nhân sự · 2.1 & 2.2 Bảng công · 3.1 & 3.2 Bảng lương | |
| `TRÌNH KÝ VO BẢNG TỔNG HỢP` | 4. Bảng TH phân bổ CPNC | |

---

## 5. Cây đơn vị (sheet `List`)

**Đơn vị cấp 4 (Khối)** — 5 giá trị: `Khối 1 - TCT CNC` · `Khối 2 - TCT CNC` · `Khối 3 - TCT CNC` ·
`Trung tâm Kinh doanh - TCT CNC` · `Trung tâm QLCL - TCT CNC`.

**Đơn vị cấp 5**, gom theo khối:

| Khối 1 | Khối 2 | Khối 3 |
|---|---|---|
| Ban Giám đốc Khối | Ban Giám đốc Khối | Ban Giám đốc Khối |
| Phòng Kinh doanh | Phòng Kinh doanh | Phòng Kinh doanh |
| Phòng Kiểu dáng và đồ hoạ | Phòng Quản lý sản xuất | Phòng Quản lý chất lượng |
| Phòng Tổng hợp | Phòng Tổng hợp | Phòng Tổng hợp |
| Trung tâm Chỉ huy điều khiển | Trung tâm dịch vụ sau bán hàng | Trung tâm Camera |
| Trung tâm Công nghệ Cơ khí - Tự động hoá | Trung tâm Kỹ thuật công nghệ - TCT CNC | Trung tâm Nền tảng IOT |
| Trung tâm Đảm bảo chất lượng | Trung tâm Nghiên cứu Công nghệ chuyển mạch | |
| Trung tâm dịch vụ sau bán hàng | Trung tâm Nghiên cứu công nghệ Đa phương tiện | |
| Trung tâm Khí cụ bay | Trung tâm Nghiên cứu Công nghệ truyền dẫn | |
| Trung tâm Mô hình mô phỏng | Trung tâm Nghiên cứu thiết bị vô tuyến băng rộng | |
| Trung tâm Nghiên cứu giải pháp tích hợp công nghệ cao | Trung tâm Phát triển nền tảng thanh toán | |
| Trung tâm Quang điện tử | | |
| Trung tâm Rada | | |
| Trung tâm sản xuất | | |
| Trung tâm Tác chiến điện tử | | |
| Trung tâm Thông tin Quân sự | | |

Hai khối còn lại (`Trung tâm Kinh doanh`, `Trung tâm QLCL`) không có đơn vị cấp 5 con trong file.

Cây đầy đủ 5 cấp đọc từ cột `Đơn vị cấp 1..5 (F)` của BM0 — xem
[`bieu-mau-bm0-bm5.md §1`](bieu-mau-bm0-bm5.md).

---

## 6. Câu hỏi mở phát sinh khi đọc sơ đồ quy trình (2026-08-27)

| # | Câu hỏi | Vì sao chặn |
|---|---|---|
| **QT1** | Bước 5 **"HR Thẩm định, feedback"** có nút trên hệ thống không, hay HR chỉ xem rồi đi thẳng sang xuất/trình ký? | [BRD §3](brd-phan-bo-nhan-cong.md) bước 6 ghi HR *"xác nhận trên hệ thống"*, nhưng §1.2 của chính khách chỉ liệt kê 4 trạng thái và **không có** trạng thái "HR đã thẩm định". Không chốt thì không biết có cần cột trạng thái thứ 5 hay không. |
| **QT2** | Chữ **"feedback"** ở bước 5 có nghĩa là HR **trả lại** bản chấm về PA sửa không? Nếu có thì bản đang ở trạng thái *"PA/PM chủ trì đã xác nhận"* được mở lại kiểu gì, ai được mở? | §2.7 nói thẩm định *"qua trao đổi tương tác ngoài"* ⇒ đọc theo nghĩa đen thì không có nút trả lại, PA tự sửa. Nhưng nếu kỳ đã khoá thì không sửa được. Đây là **lỗ hổng luồng**, không phải chi tiết giao diện. |
| **QT3** | Biến thể PAKD xuất bảng công là **BM2.1 hay BM2.2**? | Xem ô cảnh báo ở §2.5. |
