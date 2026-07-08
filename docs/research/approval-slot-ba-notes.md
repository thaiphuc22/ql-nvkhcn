# Ghi chú BA: Slot phê duyệt và Need Role

Ngày ghi chú: 2026-07-08

## 1. Slot phê duyệt là gì?

`Slot phê duyệt` là một **điểm xử lý/phê duyệt trừu tượng trong quy trình**, không phải người phê duyệt cụ thể.

Ví dụ:

- Thẩm định hồ sơ
- Phê duyệt Hội đồng KHCN
- Ký duyệt Ban TGĐ
- Kiểm tra tài chính
- Pháp chế rà soát
- Lãnh đạo đơn vị phê duyệt

Trong BPMN/workflow, User Task chỉ nên biết tại bước đó cần một slot/vai trò xử lý nào. Ma trận phê duyệt sẽ dùng slot này, kết hợp với điều kiện nghiệp vụ, để xác định người hoặc nhóm phê duyệt cụ thể.

## 2. Quan hệ giữa User Task, Need Role và Slot phê duyệt

Khi cấu hình một User Task, BA/Admin có thể khai báo trường `Need Role`.

Về mặt nghiệp vụ, `Need Role` nên được hiểu là **mã tham chiếu tới một Slot phê duyệt trong danh mục dùng chung**.

Ví dụ:

```text
User Task: Thẩm định hồ sơ
Need Role: THAM_DINH

User Task: Hội đồng đánh giá
Need Role: HOI_DONG

User Task: Ký duyệt kết quả
Need Role: PHE_DUYET
```

Sau đó Ma trận phê duyệt sẽ có các rule ánh xạ:

```text
Slot phê duyệt + Điều kiện nghiệp vụ -> Người/Nhóm phê duyệt cụ thể
```

Ví dụ:

```text
Slot = PHE_DUYET
Điều kiện = Cấp nhiệm vụ Tập đoàn và Tổng dự toán >= 5 tỷ
Kết quả = Ban TGĐ Tập đoàn
```

## 3. Có nên tự sinh Slot từ Need Role không?

Không nên hiểu rằng cứ nhập `Need Role = XYZ` thì hệ thống tự do sinh mới một Slot phê duyệt `XYZ`.

Cách đúng hơn:

> Khi cấu hình một User Task, trường `Need Role` phải tham chiếu tới một Slot phê duyệt đã có trong danh mục. Nếu chưa có, người cấu hình có thể tạo mới Slot đó trong danh mục cấu hình, theo cơ chế kiểm soát.

Flow khuyến nghị:

```text
User Task
-> Need Role = XYZ
-> Hệ thống kiểm tra Approval Slot Catalog
-> Nếu XYZ đã tồn tại: dùng slot XYZ
-> Nếu XYZ chưa tồn tại: cảnh báo hoặc cho phép tạo mới có kiểm soát
-> Ma trận phê duyệt dùng XYZ để khai báo rule ánh xạ
```

Lý do không nên tự sinh tự do:

- Tránh trùng mã do nhập khác quy ước: `XYZ`, `xyz`, `XetDuyet`, `XET_DUYET`.
- Tránh phát sinh slot rác không còn được dùng trong quy trình.
- Đảm bảo đồng bộ giữa BPMN, Ma trận phê duyệt và phân quyền xử lý.
- Dễ audit, dễ quản trị thay đổi.

## 4. Nguồn dữ liệu production của danh sách Slot phê duyệt

Trong production, dropdown `Slot phê duyệt` không nên hard-code ở frontend. Danh sách này nên lấy từ **Approval Slot Catalog**.

Approval Slot Catalog là danh mục dùng chung, được quản lý bởi module Cấu hình quy trình / Cấu hình workflow.

Mỗi slot nên có các thông tin:

- Mã slot
- Tên hiển thị
- Mô tả nghiệp vụ
- Nhóm quy trình áp dụng
- Danh sách quy trình/User Task đang tham chiếu
- Trạng thái: đang dùng / ngừng dùng
- Thứ tự hiển thị

Ví dụ:

| Mã slot | Tên hiển thị | Ý nghĩa |
| --- | --- | --- |
| `THAM_DINH` | Thẩm định hồ sơ | Bước cơ quan nghiệp vụ thẩm định hồ sơ |
| `HOI_DONG` | Phê duyệt Hội đồng KHCN | Bước hội đồng xem xét/phê duyệt |
| `PHE_DUYET` | Phê duyệt / Ký duyệt | Bước lãnh đạo ký duyệt cuối |
| `TAI_CHINH_RASOAT` | Tài chính rà soát | Bước rà soát ngân sách/kinh phí |
| `PHAP_CHE_RASOAT` | Pháp chế rà soát | Bước rà soát pháp lý/hồ sơ pháp chế |

## 5. Flow tổng thể

```text
Cấu hình quy trình
-> Cấu hình User Task
-> User Task chọn Need Role từ Approval Slot Catalog
-> BPMN lưu metadata Need Role / Approval Slot
-> Ma trận phê duyệt dùng cùng Slot Catalog
-> Rule ánh xạ Slot + điều kiện nghiệp vụ
-> Resolve ra người/nhóm phê duyệt cụ thể
```

## 6. Phát biểu BA đề xuất

> Slot phê duyệt là danh mục các điểm xử lý/phê duyệt trừu tượng trong quy trình. Khi thiết kế User Task, trường Need Role phải tham chiếu tới một Slot phê duyệt trong danh mục dùng chung. Ma trận phê duyệt sử dụng Slot này làm đầu vào để xác định người hoặc nhóm phê duyệt cụ thể theo các luật ánh xạ và điều kiện nghiệp vụ.

## 7. Ghi chú về mockup hiện tại

Mockup hiện tại đang hard-code danh sách slot trong `APPROVAL_SLOTS` để demo:

```text
THAM_DINH
HOI_DONG
PHE_DUYET
```

Khi chuyển sang production, danh sách này nên được thay bằng API lấy từ Approval Slot Catalog.
