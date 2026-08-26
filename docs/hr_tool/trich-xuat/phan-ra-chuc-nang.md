# Phân rã chức năng và khảo sát nghiệp vụ

> Trích xuất từ `Book1.xlsx` (sheet `Phân rã chức năng`, `Quy trình`),
> `Mo ta phan mem HR_23.06.2025.xlsx` (sheet `MotaCV`) và
> `NS_Câu hỏi khảo sát nghiệp vụ hệ thống.docx`.

## 1. Phân rã chức năng — phạm vi chính thức (`Book1`)

Đây là **bản phạm vi có hiệu lực**, chi tiết hơn BRD §4 và là của khách. 5 module.

### 1.1 Danh mục

Sáu danh mục, **mỗi cái đủ 5 chức năng**: `Màn hình danh sách · Màn hình chi tiết · CRUD · Import ·
Export`.

| Danh mục | Ghi chú |
|---|---|
| Đơn vị | Cây 5 cấp |
| Chức danh | |
| Nhân viên | |
| Nguồn kinh phí | |
| Sản phẩm | Dùng cho nhiệm vụ PAKD |
| **Thư viện công việc** | Nội dung CV mẫu, tái dùng khi lập nhiệm vụ |

BRD §4.6 nhắc thêm các danh mục chưa có trong `Book1`: **loại công (ký hiệu công)** · **loại chi phí
nhân công** · **trạng thái nhiệm vụ** · **đối tác** · **nhiệm vụ mẫu**. Sheet `Quy trình` của
`Book1` còn dùng **Nhóm công việc** làm master data.

### 1.2 Nhiệm vụ

| Tính năng | Biểu mẫu | Chức năng |
|---|---|---|
| Nhiệm vụ | **BM5** | Danh sách · Chi tiết · CRUD · Import · Export |
| DS công việc | — | Danh sách · Chi tiết · CRUD · Import · Export |
| DS nhân sự | **BM1** | Danh sách · Chi tiết · CRUD · Import · Export |

> **[ghi chú]** "DS công việc" ở đây chính là `NoiDungCongViec` — khách liệt kê nó như một tính năng
> CRUD độc lập, ngang hàng với Nhiệm vụ và DS nhân sự.

### 1.3 Phân bổ CPNC

| Tính năng | Biểu mẫu | Chức năng |
|---|---|---|
| Bảng công tháng | BM00 | Danh sách · Chi tiết · CRUD · Import · Export |
| Bảng lương tháng | BM00 | Danh sách · Chi tiết · CRUD · Import · Export |
| Phân bổ công (KHCN) | BM2.1 | Danh sách · Chi tiết · CRUD · Import · Export |
| Phân bổ công (SXKD) | BM2.2 | *(không liệt kê chức năng con — hiểu là giống BM2.1)* |
| Bảng tổng hợp phân bổ | BM3 | Màn hình · Tham số · Tổng hợp dữ liệu · Export · **Trình ký VO** |
| Bảng lương (KHCN) | BM3.1 | Màn hình · Tham số · Tổng hợp dữ liệu · Export · **Trình ký VO** |
| Bảng lương (SXKD) | BM3.2 | Màn hình · Tham số · Tổng hợp dữ liệu · Export · **Trình ký VO** |
| BTH phân bổ CPNC | BM4 | Màn hình · Tham số · Tổng hợp dữ liệu · Export · **Trình ký VO** |

> **[ghi chú]** Bốn tính năng cuối có bộ chức năng khác hẳn: `Màn hình · Tham số · Tổng hợp dữ liệu ·
> Export · Trình ký VO` — **không có CRUD**. Đó là màn *báo cáo tham số hoá*, không phải màn nhập
> liệu. Đây là bằng chứng bảng lương chỉ đọc (khớp giới hạn BRD §6 *"không xử lý lương chi tiết"*).

### 1.4 Dashboard — 5 báo cáo, mỗi cái `Màn hình · Tham số · Tổng hợp dữ liệu · Export`

1. Theo dõi nguồn CPNC của các nhiệm vụ
2. Tỷ lệ PBNC của đơn vị trong năm
3. Tổng hợp phân bổ CPNC của khối
4. Tổng hợp phân bổ CPNC của VHT
5. DS nhiệm vụ sắp hết nguồn

### 1.5 Cấu hình

Trung tâm thông báo · Người dùng · Nhóm người dùng · **Phân quyền chức năng** · **Phân quyền đơn vị**
· Đăng nhập/Đăng xuất · **Tích hợp SSO** · **Tích hợp VO**

> **[ghi chú]** *Phân quyền chức năng* và *phân quyền đơn vị* là hai trục riêng — khớp với
> `data-scope.service.ts` đã có trong repo (giới hạn theo đơn vị) cộng catalog quyền của
> `identity-service` (giới hạn theo hành động).

---

## 2. Map Step → Dữ liệu → Master data (`Book1` sheet `Quy trình`)

Toàn bộ tác nhân là **HR**. Bảng này cho biết mỗi biểu mẫu ăn những master data nào — dùng để biết
danh mục nào phải có trước khi dựng màn nào.

| Step | Dữ liệu | Master data cần có |
|---|---|---|
| Import bảng công | Bảng công tháng | Đơn vị · **Ký hiệu công** · Nhân viên |
| Import bảng lương | Bảng lương tháng | Nhân viên |
| BM1. DS Nhân sự | Biểu mẫu | Nhân viên · Chức danh · **Nội dung công việc** |
| BM2.1 Bảng chấm công (KHCN) | Bảng chấm công theo nội dung CV | Nội dung công việc · **Nhóm công việc** · Nhân viên · Nhiệm vụ |
| BM2.2 Bảng chấm công (SXKD) | Bảng chấm công theo nội dung CV | Nội dung công việc · Nhóm công việc · **Sản phẩm** · Nhân viên · **Nguồn** · Nhiệm vụ |
| BM3. Bảng tổng hợp phân bổ | Tổng hợp phân bổ công, tính lương theo phân bổ | Nhân viên · Đề tài, dự án · Nguồn · Đơn vị · Nội dung công việc |
| BM3.1 Bảng lương (KHCN) | Bảng chi tiết phân bổ CPNC nội bộ | Nhiệm vụ · Nội dung công việc · Nhóm công việc · Nhân viên |
| BM3.2 Bảng lương (SXKD) | Bảng tính CPNC tháng | Nhiệm vụ · Sản phẩm · Nguồn · Nhân viên · Đơn vị |
| BM4. BTH phân bổ CPNC | Bảng tổng hợp phân bổ CPNC nội bộ - Lương tháng | Nhiệm vụ |
| BM5. Danh sách nhiệm vụ | Danh sách nhiệm vụ (Đề tài/Dự án) | **Khối** · Đơn vị · Nhiệm vụ · Nguồn · **Tình trạng** · Nhân viên |

> **[ghi chú]** Bảng này là lý do **danh mục phải làm trước màn chấm công**: BM2.1/2.2 cần *Ký hiệu
> công*, *Nhóm công việc*, *Sản phẩm* — cả ba đều chưa có trong repo.

`Book1` còn có sheet `Sheet1` (264 dòng) — bảng **định mức nỗ lực nội bộ** (mandays theo loại công
việc: `NVJ1-PTM Giải pháp 8 MH`, `CN_WEB_KT Phát triển 48 MH`…). Đây là công cụ ước lượng của đội
làm phần mềm, **không liên quan nghiệp vụ HR Tools**.

---

## 3. `MotaCV` — mô tả công việc + log Q&A với khách (file 23/06)

Từ viết tắt khách dùng: `GĐTT` = Giám đốc Trung tâm · `PM` = Chủ nhiệm đề tài/dự án ·
`PA` = Trợ lý đề tài/dự án · `CPNC` = Chi phí nhân công.

### I. Lập đề tài dự án

| # | Nội dung | Tần suất | Người | Yêu cầu kết quả |
|---|---|---|---|---|
| 1 | Nhập thông tin đề tài dự án | 1 lần khi mở hoặc điều chỉnh | HR/PA | Kèm **upload bản ký đề tài được phê duyệt** |
| 2 | Lập DS nhân sự tham gia và giao nhiệm vụ | 1 lần khi mở hoặc điều chỉnh | PM, PA | DS nhân sự sau khi lập/điều chỉnh **có nút trình ký xác nhận qua VOffice** |
| 3 | Cập nhật bảng lương mục tiêu | Khi có thay đổi kiện toàn mô hình/mức lương | HR | Xuất báo cáo thông tin đề tài, tính CPNC dự kiến, lũy kế CPNC và thời gian tham gia đến hiện tại |

**Câu hỏi khách chưa trả lời** (ghi trong cột *Câu hỏi*):
- *"Phần giao nhiệm vụ ở đây cụ thể các bước giao, quản lý nhiệm vụ như thế nào? Đề tài có 1 checklist
  công việc ⇒ gán mỗi việc cho 1 nhân công hay như thế nào? Có quản lý tiến độ, kết quả của công việc
  không? Thay đổi nhân sự ⇒ điều chỉnh task?"*
- *"Thông tin lương mục tiêu có cần quản lý quá trình lương, thâm niên, các danh mục diện đối tượng,
  diện hợp đồng... không hay thông tin người dùng upload thuần tuý?"*

### II. Phân bổ nhân công đề tài dự án

| # | Nội dung | Tần suất | Người |
|---|---|---|---|
| 1 | Upload bảng chấm công tháng (n-1) | Hàng tháng | HR |
| 2 | Upload bảng lương tháng (n-1) | Hàng tháng | HR |
| 3 | Chấm công tháng (n-1) | Hàng tháng | PA |
| 4 | Tổng hợp CPNC | Hàng tháng | HR |

Yêu cầu kết quả của bước 3 (nguyên văn, rút gọn):

1. *"Trước và sau khi chấm công PA có thể kiểm tra tổng số CPNC đã sử dụng, chưa sử dụng, còn được sử
   dụng là bao nhiêu. Nếu nhân sự đã bị chấm công trùng ở nhiệm vụ khác thì có cảnh báo."*
2. *"Xuất ra báo cáo … ⇒ Yêu cầu kế toán dự án xác nhận số liệu."*
3. *"Sau khi hoàn thành chấm công, PA có thể ấn nút trình ký VOffice … **PA của đơn vị sản phẩm bấm
   trình ký cho toàn bộ các Trung tâm tham gia trong Dự án** để PM và GĐ TT Sản phẩm nhận số liệu và
   chốt đồng ý bằng bút ký VOffice."*

Câu hỏi khách chưa trả lời: *"Chấm công được thực hiện trên công cụ/phần mềm khác, ở đây đơn thuần là
upload, không quan tâm đến ký hiệu công, giải trình công?"*

### III. Đóng đề tài dự án

Lập bảng tổng hợp CPNC theo biểu mẫu — trình ký VOffice **BM.05 (Bảng tổng hợp CPNC theo nội dung
công việc)**, do PA thực hiện.

> **[ghi chú]** Bước III chưa có trong `Book1` lẫn file đặc tả màn hình mới. Đây là một chức năng
> **"đóng nhiệm vụ"** chưa được lập kế hoạch ở đâu — cần hỏi khách có còn trong phạm vi không.

---

## 4. Khảo sát phòng Nhân sự (`NS_Câu hỏi khảo sát nghiệp vụ hệ thống.docx`)

Đơn vị: **Phòng Nhân sự**. Người cung cấp thông tin: **ThuLH**.

### 4.1 Tổ chức

01 Trưởng phòng + 4 bộ phận: quản lý lao động (2) · đào tạo, phát triển nhân lực (1) · tuyển dụng (3)
· tiền lương chính sách (4). Tổng 11 người.

Bốn mảng công việc: Quản lý lao động · Đào tạo, phát triển nhân lực · Tuyển dụng · Tiền lương chính
sách.

### 4.2 Căn cứ pháp lý của phân hệ này

Trong ~30 quy trình/quy định của phòng, **chỉ 2 văn bản** liên quan trực tiếp tới HR Tools — mục
*"Quy trình Quản lý nhân công đề tài dự án"*:

| Số hiệu | Tên |
|---|---|
| **QĐ 9915/QĐ-CNVTQĐ** (22/08/2024) | Quy định Xây dựng dự toán kinh phí thực hiện nhiệm vụ KHCN và dự toán chi cho hoạt động quản lý KHCN |
| **QĐ 3021/QĐ-CNVTQĐ-CNCNC** (28/03/2024) | Quy định quản lý nguyên liệu, vật liệu, bán thành phẩm, sản phẩm và **nhân công** trong quá trình thực hiện nhiệm vụ khoa học và công nghệ |

> **[ghi chú]** Khách trả lời câu "biểu mẫu lấy ở đâu": ***"Biểu mẫu theo QĐ 3021/QĐ-CNVTQĐ-CNCNC"***
> ⇒ mã `BM.03.01`, `BM.04.01`, `BM.04.02`, `BM.05`, `BM.06` là **biểu mẫu pháp lý của quyết định
> 3021**, không phải bố cục do ai đó tự vẽ. Đây là lý do phần kết xuất phải bám đúng file gốc.
> **Hai quyết định này chưa có trong repo** — nên xin bản mềm.

### 4.3 Hiện trạng công cụ

- **SAP**: quản lý quân số, tuyển mới, nghỉ việc, thông tin nhân sự, dữ liệu đào tạo.
- **Excel**: quản trị hệ thống và tính toán — *"Dữ liệu nhân công đề tài dự án lưu trên file excel."*
- Lấy dữ liệu qua SAP, gửi cho bên khác dưới dạng Excel.

### 4.4 Nút thắt — chính là bài toán phân hệ này giải

| Câu hỏi | Trả lời của khách |
|---|---|
| Quy trình mất bao lâu? | *"Thực hiện định kỳ hàng tháng, trung bình hoàn thành trong **1–2 tháng** kể từ kỳ trả lương."* |
| Bước nào tốn thời gian / dễ sai nhất? | ***"Bước chấm công, nhập công của các PA đề tài dự án."*** |
| Vấn đề lớn nhất? | *"Tổng hợp dữ liệu chấm công đề tài dự án **thủ công, từ nhiều đầu mối** nên dễ sai sót, mất thời gian kiểm tra lại."* |
| Rủi ro dữ liệu? | *"Rủi ro dữ liệu **trùng lặp** nếu nhiều đơn vị tham gia cùng đề tài dự án."* |
| Bước nào cần đối soát ngoài? | *"Tại bước tính chi phí lương dự án cần đối soát với các **chuyên quản phòng Tài chính**."* |
| Có công việc phụ thuộc 1 cá nhân? | Không |
| Có việc chồng chéo / ngoài quy trình / lỗi thời? | Không |

> **[ghi chú]** Ba câu đầu xác nhận thứ tự ưu tiên: **màn chấm công + luật chống trùng** là phần tạo
> ra gần như toàn bộ giá trị của phân hệ. Chu kỳ 1–2 tháng hiện tại là chỉ số nghiệm thu tự nhiên.
>
> Dòng "đối soát với chuyên quản phòng Tài chính" giới thiệu một vai trò thứ 5 (**Kế toán**, khớp BRD
> §5) chưa có trong ma trận quyền của sheet `2.Chấm công` — cần hỏi lại.
