Màn /phan-quyen hiện đang trộn 3 lớp khác nhau: danh mục Role, cấu hình quyền theo Role, và phạm vi dữ liệu theo User. Nên tách rõ hơn.
Nhận xét chính
Danh mục Role nên có CRUD
Hiện RoleCatalogTab chỉ là danh sách đọc từ RBAC_ROLES tại [RolePermission.tsx (line 97)](C:/Users/phuctd7/ql-nvkhcn/webapp/src/pages/RolePermission.tsx:97). Với màn “Danh mục Role”, người quản trị sẽ kỳ vọng có:
Thêm role nghiệp vụ mới.
Sửa tên, nhóm, mô tả, trạng thái active/inactive.
Khoá/ngưng dùng role.
Kiểm tra role đang được dùng ở policy/user/BPMN trước khi xoá.
Lưu ý: System Role như ADMIN, OPERATOR, VIEWER nên là role hệ thống, chỉ cho xem hoặc sửa mô tả/trạng thái rất hạn chế. CRUD chủ yếu áp dụng cho Business Role.

Tab “Danh sách Policy” có vẻ thừa với người dùng cuối
Đồng ý. Tab này hiện chỉ là một biểu diễn dạng bảng/form của cùng dữ liệu mà tab “Ma trận phân quyền” đã chỉnh được. Nó nằm ở [RolePermission.tsx (line 860)](C:/Users/phuctd7/ql-nvkhcn/webapp/src/pages/RolePermission.tsx:860).
Với admin nghiệp vụ, “Ma trận phân quyền” dễ hiểu hơn: Role × Chức năng × Quyền. “Danh sách Policy” chỉ nên giữ nếu phục vụ debug/kỹ thuật/audit, hoặc đổi thành drawer “Chi tiết policy” khi click một dòng trong matrix.
Đề xuất: bỏ tab riêng “Danh sách Policy”, hoặc chuyển thành chế độ “Nâng cao” ẩn sau nút.

Data scope không nên nằm trong RolePermissionPolicy
Đây là điểm quan trọng nhất. Model hiện tại đặt dataScope trong RolePermissionPolicy tại [rbac.ts (line 64)](C:/Users/phuctd7/ql-nvkhcn/webapp/src/data/rbac.ts:64), rồi engine lấy scope từ policy tại [rbacEngine.ts (line 75)](C:/Users/phuctd7/ql-nvkhcn/webapp/src/data/rbacEngine.ts:75). Cách này khiến “role có quyền gì” bị dính với “user được xem dữ liệu đến đâu”.
Ví dụ cùng role CQ_KHCN, người A có thể chỉ xem đơn vị mình, người B có thể xem toàn trung tâm do được phân công rộng hơn. Nếu scope nằm ở policy theo role, cả hai sẽ bị cùng một phạm vi, không đúng nghiệp vụ.
Mô hình nên là:
RolePermissionPolicy: role + feature + permission + enabled.
UserRoleAssignment: user + role + dataScope + orgUnit/center/mission + effectiveFrom/effectiveTo.
Khi check quyền: lấy permission từ role policy, lấy data scope từ assignment của user.
Coding plan cũng đã gợi ý hướng này ở Phase 5: nâng cấp UserManagement để gán system role, business role, data scope tại [configuration-service-EPIC03-coding-plan.md (line 62)](C:/Users/phuctd7/ql-nvkhcn/docs/research/configuration-service-EPIC03-coding-plan.md:62).

1. Đề xuất thiết kế lại màn /phan-quyen
Tab 1: Danh mục Role
CRUD role, phân biệt system/business, active/inactive, kiểm tra đang sử dụng.

Tab 2: Ma trận quyền theo Role
Chỉ cấu hình role nào được làm gì trên chức năng nào. Bỏ cột “Phạm vi dữ liệu” khỏi matrix.

Tab 3: Mô phỏng
Giữ lại, nhưng simulator nên hiển thị tách bạch:
Role cấp quyền thao tác và Assignment cấp phạm vi dữ liệu.

2. Đề xuất thiết kế lại màn /nguoi-dung
Bổ sung chức năng CRUD Phân chức năng (Gán Role) và Phân quyền dữ liệu
Chọn user, gán nhiều role, mỗi role có data scope, đơn vị/phạm vi áp dụng.

3. Kết luận
 Policy tab hiện hơi kỹ thuật và trùng với matrix; còn dataScope nên chuyển khỏi policy sang lúc gán role cho user. Như vậy mô hình sẽ sạch hơn: Role định nghĩa năng lực, UserRoleAssignment định nghĩa phạm vi áp dụng.