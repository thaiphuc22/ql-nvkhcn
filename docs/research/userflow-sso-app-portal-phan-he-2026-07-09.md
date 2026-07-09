# Userflow SSO, App Portal và phân rã chức năng các phân hệ

Ngày ghi nhận: 2026-07-09

## Bối cảnh trao đổi

Người dùng muốn thiết kế userflow ban đầu:

1. Đăng nhập SSO.
2. Truy cập màn hình danh sách các App.
3. Chọn App để vào.

Sau đó người dùng đưa danh sách các phân hệ dự kiến:

1. Cổng truy cập tập trung.
2. Phân hệ phân quyền và xác thực tập trung.
3. Phân hệ danh mục dùng chung.
4. Phân hệ thiết kế, giám sát và điều phối Quy trình NV KHCN.
5. Phân hệ mua sắm.
6. Phân hệ Quản lý chi phí nhân công, đề tài dự án.
7. Phân hệ Quản lý hàng hóa đề tài dự án.

Người dùng cũng nêu định hướng:

- Chuyển module Phân quyền về Phân hệ 2.
- Chuyển các phần như eForm về Phân hệ danh mục dùng chung.

## Tư vấn userflow tổng thể

Flow 3 bước là hợp lý, nhưng nên bổ sung các nhánh phụ để hệ thống dùng tốt trong thực tế.

Flow đề xuất:

```text
User mở hệ thống
→ Chưa login?
  → Redirect SSO
  → SSO callback
  → Load profile + permissions
  → Có deep link hợp lệ?
    → Vào app theo deep link
    → Không có quyền: Access denied
  → Không có deep link?
    → Có 1 app: auto vào app
    → Có nhiều app: hiển thị App Portal
→ Đã login?
  → Kiểm tra session
  → Vào App Portal hoặc app gần nhất
```

Các điểm nên có:

- SSO là cổng đăng nhập duy nhất.
- Sau login cần lấy `userId`, `email`, `name`, `roles`, `org/unit`, danh sách quyền app.
- Nếu người dùng không có quyền app nào, hiển thị màn hình "Chưa được cấp quyền".
- Màn hình danh sách App nên là App Portal hoặc Workspace.
- Chỉ hiển thị các app mà người dùng được cấp quyền.
- Có tìm kiếm, nhóm app theo nghiệp vụ, trạng thái app nếu cần.
- Nếu chỉ có một app, có thể tự động điều hướng vào app đó.
- Khi chọn app, backend vẫn cần kiểm tra quyền lại.
- Hỗ trợ deep link: nếu người dùng truy cập thẳng một app/module, sau SSO nên quay lại đúng app/module đó.
- Ghi audit log cho đăng nhập, chọn app, truy cập chức năng.

## Định hướng phân rã hệ thống

Nguyên tắc phân rã đề xuất:

```text
Phân hệ 1: Cổng vào
Phân hệ 2: Danh tính, xác thực, phân quyền
Phân hệ 3: Dữ liệu nền, danh mục, eForm, cấu hình dùng chung
Phân hệ 4: Workflow/BPM, điều phối, giám sát quy trình
Phân hệ 5-7: Nghiệp vụ chuyên ngành
```

Mô hình tổng thể:

```text
Cổng truy cập tập trung
  ↓
Phân quyền & xác thực tập trung
  ↓
Danh mục/eForm dùng chung + Workflow dùng chung
  ↓
Các phân hệ nghiệp vụ:
- Mua sắm
- Chi phí nhân công, đề tài dự án
- Hàng hóa đề tài dự án
```

## 1. Cổng truy cập tập trung

Vai trò: Là điểm vào hệ thống sau SSO, hiển thị các phân hệ/app mà người dùng được phép truy cập.

Chức năng đề xuất:

- Trang đăng nhập hoặc điều hướng SSO.
- Màn hình danh sách các phân hệ/app được cấp quyền.
- Tìm kiếm phân hệ.
- Ghim phân hệ thường dùng.
- Hiển thị thông báo hệ thống, thông báo nghiệp vụ tổng hợp.
- Điều hướng vào từng phân hệ theo quyền.
- Nhớ phân hệ gần nhất.
- Trang "không có quyền truy cập".
- Hồ sơ người dùng cơ bản: thông tin cá nhân, đơn vị, vai trò hiện tại.
- Dashboard tổng quan cá nhân: việc cần xử lý, hồ sơ đang chờ, thông báo mới.

Lưu ý: Phân hệ này không nên chứa logic phân quyền chi tiết. Nó chỉ hiển thị những gì Phân hệ 2 cho phép.

## 2. Phân hệ phân quyền và xác thực tập trung

Vai trò: Quản lý danh tính, xác thực, phân quyền, phạm vi dữ liệu và audit truy cập.

Đề xuất: Chuyển toàn bộ module Phân quyền về phân hệ này.

Chức năng đề xuất:

- Tích hợp SSO.
- Quản lý người dùng.
- Quản lý đơn vị/phòng ban.
- Quản lý vai trò.
- Quản lý nhóm quyền.
- Quản lý quyền theo phân hệ.
- Quản lý quyền theo chức năng: xem, thêm, sửa, xóa, duyệt, xuất dữ liệu, cấu hình.
- Quản lý quyền theo dữ liệu: theo đơn vị, theo dự án, theo vai trò trong đề tài.
- Gán quyền người dùng.
- Gán quyền theo nhóm/ngạch/chức danh.
- Ma trận phân quyền.
- Ủy quyền xử lý công việc.
- Cấu hình người thay thế khi vắng mặt.
- Nhật ký đăng nhập.
- Nhật ký truy cập chức năng.
- Nhật ký thay đổi quyền.
- Chính sách phiên đăng nhập, timeout, refresh token nếu có.
- Kiểm tra quyền API/backend, không chỉ frontend.

Nên tách rõ các lớp khái niệm:

```text
Authentication: Anh là ai?
Authorization: Anh được làm gì?
Data Scope: Anh được nhìn dữ liệu nào?
Delegation: Anh được xử lý thay ai?
Audit: Anh đã làm gì?
```

## 3. Phân hệ danh mục dùng chung

Vai trò: Quản lý dữ liệu nền, danh mục, biểu mẫu động và các cấu hình dùng chung cho toàn hệ thống.

Đề xuất: Chuyển eForm về phân hệ này nếu eForm là engine/công cụ tạo biểu mẫu dùng lại nhiều nơi.

Chức năng đề xuất:

- Danh mục đơn vị.
- Danh mục chức danh.
- Danh mục cán bộ/nhân sự đồng bộ.
- Danh mục lĩnh vực khoa học công nghệ.
- Danh mục loại đề tài/dự án.
- Danh mục nguồn kinh phí.
- Danh mục loại chi phí.
- Danh mục hàng hóa/vật tư/thiết bị.
- Danh mục nhà cung cấp.
- Danh mục trạng thái hồ sơ.
- Danh mục loại văn bản/tài liệu.
- Danh mục biểu mẫu.
- Quản lý eForm.
- Thiết kế form động.
- Thiết kế trường dữ liệu: text, number, date, file, select, multi-select, table.
- Cấu hình validate dữ liệu.
- Cấu hình danh mục tham chiếu cho form.
- Version biểu mẫu.
- Áp dụng biểu mẫu cho từng loại quy trình/nghiệp vụ.
- Import/export danh mục.
- Đồng bộ danh mục từ hệ thống khác.
- API danh mục dùng chung cho các phân hệ.

Lưu ý phân ranh:

- eForm engine thuộc Phân hệ 3.
- Form nghiệp vụ cụ thể như "Phiếu đề xuất mua sắm", "Bảng kê chi phí nhân công" vẫn thuộc phân hệ nghiệp vụ tương ứng.
- Các form nghiệp vụ có thể được dựng bằng eForm engine.

## 4. Phân hệ thiết kế, giám sát và điều phối Quy trình NV KHCN

Vai trò: Là workflow/BPM trung tâm cho nghiệp vụ KHCN.

Chức năng đề xuất:

- Thiết kế quy trình nghiệp vụ.
- BPMN/process designer.
- Cấu hình bước xử lý.
- Cấu hình vai trò xử lý theo bước.
- Cấu hình điều kiện rẽ nhánh.
- Cấu hình SLA/thời hạn xử lý.
- Cấu hình hành động tại mỗi bước: duyệt, trả lại, yêu cầu bổ sung, hủy, chuyển xử lý.
- Gắn eForm vào từng bước quy trình.
- Gắn tài liệu/hồ sơ vào quy trình.
- Theo dõi trạng thái hồ sơ.
- Dashboard giám sát quy trình.
- Danh sách công việc cần xử lý.
- Lịch sử luân chuyển.
- Nhật ký xử lý.
- Cảnh báo trễ hạn.
- Báo cáo hiệu suất xử lý.
- Cấu hình mẫu thông báo.
- Điều phối công việc giữa các phòng ban.
- Tạm dừng/khôi phục/hủy quy trình.
- Quản lý phiên bản quy trình.
- Mô phỏng/kiểm thử quy trình trước khi áp dụng.

Lưu ý: Phân hệ này nên là xương sống cho các phân hệ nghiệp vụ. Mua sắm, chi phí, hàng hóa đều có thể gọi workflow này để chạy quy trình phê duyệt.

## 5. Phân hệ mua sắm

Vai trò: Quản lý nhu cầu, kế hoạch, phê duyệt và thực hiện mua sắm.

Chức năng đề xuất:

- Lập đề xuất mua sắm.
- Gắn đề xuất mua sắm với đề tài/dự án.
- Khai báo danh sách hàng hóa/dịch vụ cần mua.
- Dự toán chi phí mua sắm.
- Kiểm tra nguồn kinh phí.
- Trình duyệt đề xuất mua sắm.
- Tổng hợp nhu cầu mua sắm.
- Lập kế hoạch mua sắm.
- Quản lý báo giá.
- So sánh báo giá.
- Quản lý nhà cung cấp.
- Quản lý hồ sơ thầu/chào hàng nếu có.
- Phê duyệt kết quả lựa chọn nhà cung cấp.
- Quản lý hợp đồng mua sắm.
- Theo dõi tiến độ thực hiện hợp đồng.
- Nghiệm thu hàng hóa/dịch vụ.
- Bàn giao cho đơn vị sử dụng.
- Liên kết sang phân hệ hàng hóa để nhập kho/ghi nhận tài sản.
- Liên kết sang phân hệ chi phí để ghi nhận thanh toán.
- Báo cáo mua sắm theo đề tài, dự án, nguồn kinh phí, nhà cung cấp.

## 6. Phân hệ Quản lý chi phí nhân công, đề tài dự án

Vai trò: Quản lý đề tài/dự án, ngân sách, dự toán, chi phí nhân công và thanh toán/quyết toán.

Chức năng đề xuất:

- Quản lý danh sách đề tài/dự án.
- Quản lý thông tin chủ nhiệm, thành viên, đơn vị chủ trì.
- Quản lý nguồn kinh phí.
- Quản lý dự toán tổng thể.
- Quản lý dự toán theo hạng mục.
- Quản lý chi phí nhân công.
- Bảng phân bổ nhân công theo đề tài/dự án.
- Bảng chấm công hoặc xác nhận khối lượng tham gia.
- Tính toán chi phí nhân công theo quy định.
- Quản lý tạm ứng.
- Quản lý thanh toán.
- Quản lý quyết toán.
- Kiểm tra vượt dự toán.
- Theo dõi số đã chi, còn lại, chờ duyệt.
- Gắn chứng từ, hóa đơn, tài liệu thanh toán.
- Quy trình duyệt chi phí.
- Báo cáo chi phí theo đề tài/dự án.
- Báo cáo chi phí theo loại chi phí.
- Báo cáo chi phí theo đơn vị/cá nhân.
- Đối soát với mua sắm và hàng hóa.

Nên cân nhắc tách nhóm chức năng:

```text
Quản lý đề tài/dự án
Quản lý ngân sách/dự toán
Quản lý chi phí nhân công
Quản lý thanh toán/quyết toán
```

Nếu phạm vi lớn, sau này có thể tách "Quản lý đề tài/dự án" thành một phân hệ riêng.

## 7. Phân hệ Quản lý hàng hóa đề tài dự án

Vai trò: Quản lý vòng đời hàng hóa/vật tư/thiết bị hình thành từ mua sắm hoặc cấp phát cho đề tài/dự án.

Chức năng đề xuất:

- Quản lý danh mục hàng hóa/vật tư/thiết bị.
- Ghi nhận hàng hóa từ kết quả mua sắm.
- Nhập kho.
- Xuất kho.
- Cấp phát cho đề tài/dự án.
- Điều chuyển hàng hóa giữa đơn vị/dự án.
- Thu hồi hàng hóa.
- Kiểm kê.
- Theo dõi tình trạng hàng hóa: mới, đang sử dụng, hỏng, mất, thanh lý.
- Quản lý người/đơn vị đang sử dụng.
- Quản lý vị trí lưu giữ.
- Gắn mã tài sản/mã hàng hóa/QR code nếu cần.
- Theo dõi bảo hành, bảo trì.
- Ghi nhận hao mòn/khấu hao nếu là tài sản.
- Thanh lý hàng hóa.
- Báo cáo tồn kho.
- Báo cáo hàng hóa theo đề tài/dự án.
- Báo cáo hàng hóa theo nguồn kinh phí.
- Đối chiếu với mua sắm và chi phí.

## Kết luận đề xuất

Các điều chỉnh người dùng đang nghĩ là hợp lý:

- Module Phân quyền nên chuyển về Phân hệ 2.
- eForm nên chuyển về Phân hệ 3 nếu là công cụ biểu mẫu dùng chung.
- Quy trình phê duyệt không nên nằm rải rác trong từng phân hệ nghiệp vụ, mà nên cấu hình/chạy qua Phân hệ 4.
- Các phân hệ nghiệp vụ như mua sắm, chi phí, hàng hóa chỉ nên giữ logic nghiệp vụ riêng, đồng thời gọi quyền từ Phân hệ 2, danh mục/eForm từ Phân hệ 3 và workflow từ Phân hệ 4.

Nên bổ sung thêm một lớp Quản trị hệ thống nằm trong hoặc cạnh Phân hệ 2/3, bao gồm:

- Cấu hình tham số hệ thống.
- Cấu hình thông báo.
- Nhật ký hệ thống.
- Quản lý tích hợp API.
- Đồng bộ dữ liệu với hệ thống ngoài.

Nếu không tách rõ từ đầu, các chức năng quản trị này dễ bị rải rác vào các phân hệ nghiệp vụ.
