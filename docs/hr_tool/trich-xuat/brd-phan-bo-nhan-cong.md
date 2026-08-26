# BRD — Quản lý phân bổ chi phí nhân công theo nhiệm vụ

> Trích xuất từ `VHT_Phan tich bai toan Phan Bo Nhan Cong.docx` (2026-08-26).
> `Phan Bo Nhan Cong Brd.docx` **trùng byte-for-byte** với file này — chỉ khác tên file, không có
> nội dung nào riêng. Đừng đọc cả hai.
>
> Đây là bản chép lại gần nguyên văn, giữ số mục của tài liệu gốc để trích dẫn được (`BRD §4.5`…).
> Ghi chú của đội phát triển đặt trong khối `>` và luôn có nhãn **[ghi chú]**.

| | |
|---|---|
| Tên hệ thống | Quản lý phân bổ chi phí nhân công theo nhiệm vụ |
| Mã dự án | `GPDN.VHT.HRM` |
| Khách hàng | Tổng Công ty Công nghiệp Công nghệ cao Viettel (VHT) |
| Tư vấn giải pháp | Vũ Thị Lan Anh (`anhvtl10`) |

---

## 1. Mục đích dự án

Hệ thống giúp khách hàng quản lý và phân bổ chi phí nhân công theo nhiệm vụ (gồm nhiệm vụ KHCN và
SXKD), đảm bảo chi phí nhân công thực tế không vượt quá nguồn kinh phí đã được phê duyệt.

## 2. Bối cảnh và yêu cầu nghiệp vụ

- **Gốc quản trị là nhiệm vụ.**
- Mỗi nhiệm vụ chia thành nhiều **nội dung công việc**.
- Mỗi nội dung giao cho 1 hoặc nhiều nhân sự.
- Mỗi nhân sự được giao nhiều nội dung / nhiệm vụ.
- Hàng tháng, HR xuất bảng lương và bảng công từ HRM ra để import vào hệ thống này.
- Sau đó, PA/PM dự án thực hiện phân bổ công từng ngày cho từng nhiệm vụ.
- **Mỗi ngày chỉ được phân cho duy nhất 1 nội dung công việc.**
- Tổng hợp và đối chiếu chi phí phân bổ với kinh phí được duyệt.
- Cảnh báo khi vượt ngưỡng chấm công hoặc vượt ngưỡng chi phí.

> **[ghi chú]** Dòng đầu — *"Gốc quản trị là nhiệm vụ"* — mâu thuẫn với `P1` trong
> [`decisions.md`](../../../.harness/state/decisions.md) (`DeTai` là cha của `NhiemVu`). Đây là câu
> hỏi chặn Q1 của [kế hoạch thi công](../../plan/hr-tools-ke-hoach-thi-cong-2026-08-26.md).

## 3. Quy trình nghiệp vụ tổng quan

| Bước | Tên | Mô tả | Đối tượng |
|---|---|---|---|
| 1 | Khởi tạo nhiệm vụ | Khởi tạo nhiệm vụ, phân loại nhiệm vụ, xác định đơn vị chủ trì, chủ nhiệm dự án và các thông tin chung khác | HR |
| 2 | Thiết lập nhiệm vụ | **Thiết lập ngân sách**: xác định nguồn kinh phí, dự toán nhân công. **Phân rã công việc**: chia nhỏ mỗi nhiệm vụ thành các nội dung công việc cụ thể. **Gán nhân sự**: giao các nội dung công việc này cho một hoặc nhiều nhân sự phụ trách. Có thể import hoặc khai báo thủ công | HR |
| 3 | Import bảng công, bảng lương tháng | Hàng tháng, HR thực hiện import file bảng công và bảng lương từ hệ thống HRM vào phần mềm | HR |
| 4 | Chấm công chi tiết theo nhiệm vụ | **Giao công chi tiết**: phân bổ công từng ngày cho từng nhân sự theo nội dung công việc đã thiết lập. **Kiểm soát quy tắc**: hệ thống tự động rà soát để đảm bảo mỗi ngày một nhân sự chỉ được phân cho duy nhất 1 nội dung công việc. **Đặc thù**: mỗi loại nhiệm vụ có thể có thông tin hiển thị để PA/PM xem trước khi chấm công là khác nhau | PA/PM chấm công |
| 5 | Đơn vị chủ trì xác nhận công | **TH1**: nếu đơn vị chấm công không phải đơn vị chủ trì, PA/PM của đơn vị chủ trì phải thực hiện xác nhận thông tin. **TH2**: PA đơn vị chấm công = đơn vị chủ trì ⇒ vừa submit vừa xác nhận | PA/PM chủ trì |
| 6 | HR xác nhận công | HR nhận thông tin, trao đổi tương tác ngoài (nếu có) trước khi xác nhận trên hệ thống | HR |
| 7 | Tính toán chi phí nhân công dự án | **Tính toán tự động**: quy đổi ngày công đã phân bổ thành chi phí nhân công tương ứng. **Tổng hợp lũy kế**: theo tháng, lũy kế 6 tháng và theo năm. **Kiểm soát ngưỡng**: so sánh chi phí thực tế với dự toán đã phê duyệt ban đầu. **Cảnh báo**: nếu vượt hoặc dưới ngưỡng thiết lập, gửi thông báo qua Email, SMS hoặc thông báo nội bộ | HR |
| 8 | Trình ký VO | **Tổng hợp biểu mẫu**: xuất BM1→BM5 phục vụ so sánh dự toán và trực quan hoá qua Dashboard. **Trình ký điện tử**: tích hợp VOffice để trình ký BM1, BM2, BM3, BM4. **Theo dõi trạng thái**: cập nhật phản hồi và trạng thái ký từ VOffice về lại hệ thống | — |

> **[ghi chú]** Bước 6 là **một nút xác nhận**, không phải một luồng phê duyệt trong hệ thống —
> *"trao đổi tương tác ngoài"* nghĩa là việc thẩm định xảy ra ngoài phần mềm. Đừng dựng workflow
> Camunda cho bước này.

## 4. Phạm vi chức năng chính

### 4.1 Quản lý nhiệm vụ
- Tạo mới / cập nhật nhiệm vụ
- Gán loại nhiệm vụ: KHCN hoặc SXKD
- Xác định nguồn kinh phí, dự toán nhân công, đơn vị chủ trì
- Thiết lập danh sách nội dung công việc

### 4.2 Import dữ liệu tháng
- Import bảng công tháng (BM0)
- Import bảng lương tháng (BM0)

### 4.3 Phân bổ công theo nhiệm vụ
- Giao công từng ngày theo nhân sự – nội dung công việc
- Hỗ trợ import hoặc thủ công
- Rà soát trùng, sai quy định (1 ngày nhiều nhiệm vụ…)

### 4.4 Tính chi phí nhân công theo nhiệm vụ
- Tự động tính chi phí nhân công phân bổ theo công
- Tính chi phí tháng, **lũy kế 6 tháng, 1 năm**
- Cảnh báo vượt hoặc dưới ngưỡng nguồn kinh phí

### 4.5 Báo cáo, tổng hợp
- BM1 → BM5: tổng hợp phân bổ, chi phí nhân công, so sánh dự toán
- Dashboard: trực quan hoá phân bổ theo thời gian, theo khối, theo nhiệm vụ
- Báo cáo theo nhiệm vụ, nhân sự, đơn vị

### 4.6 Danh mục dùng chung
- Đơn vị, phòng ban, khối, chức danh, nhân viên, người dùng
- Nhiệm vụ mẫu, nguồn kinh phí, sản phẩm
- Loại công, loại chi phí nhân công, trạng thái nhiệm vụ
- Đối tác

### 4.7 Cấu hình hệ thống
- Cấu hình **kỳ kế toán, kỳ lương**
- Cấu hình mức cảnh báo vượt/thiếu chi phí
- Cấu hình quy tắc phân bổ công/lương (tự động / thủ công)

> **[ghi chú]** *"quy tắc phân bổ tự động"* không được định nghĩa ở đâu trong bộ tài liệu — là câu
> hỏi mở Q8 của plan hiệu chỉnh.

### 4.8 Tích hợp trình ký (VOffice Viettel)
- Trình ký điện tử qua hệ thống VOffice
- Biểu mẫu trình ký: **BM1, BM2, BM3, BM4**
- Theo dõi trạng thái trình ký và phản hồi về hệ thống

### 4.9 Cảnh báo và thông báo
- Cảnh báo vượt hoặc dưới ngưỡng chi phí
- Gửi qua: **Email, SMS, thông báo trong hệ thống**
- Cấu hình ngưỡng cảnh báo và tần suất gửi

> **[ghi chú]** Ba kênh, **không có Zalo** — khác với `SendNotificationConfig` của phân hệ Quy trình
> (4 kênh, có `zalo`).

## 5. Phân quyền

- **HR**: import dữ liệu, xem toàn cục
- **PM**: xem / phân bổ công cho nhân sự thuộc dự án
- **Kế toán**: xem / tính chi phí / tổng hợp

> **[ghi chú]** Đây là bản tóm tắt. Ma trận quyền **chi tiết và có hiệu lực** nằm ở
> [`dac-ta-man-hinh.md §2.6`](dac-ta-man-hinh.md) (PA chủ trì / PA khác / PM / HR × 8 hành động) —
> dùng bản đó khi code, không dùng 3 dòng này.

## 6. Giới hạn

- Hệ thống này **không thay thế HRM**.
- **Dữ liệu nhập từ HRM qua file.**
- Chỉ xử lý chi phí nhân công theo nhiệm vụ, **không xử lý lương chi tiết**.

> **[ghi chú]** Dòng giữa loại bỏ hạng mục "tích hợp API với SAP/HRM" khỏi phạm vi. Dòng cuối là lý
> do bảng lương trong hệ thống chỉ **import và chỉ đọc**, không phải module CRUD.
