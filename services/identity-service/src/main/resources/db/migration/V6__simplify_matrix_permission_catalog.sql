-- Thu gọn catalog quyền hiển thị trên lưới card "Ma trận phân quyền" (refactor theo ảnh mẫu,
-- xem docs/plan/refactor-ma-tran-phan-quyen.md) về đúng 4 mục chuẩn: Xem danh sách / Xem chi
-- tiết / Thêm mới / Sửa. BA sẽ định nghĩa bộ quyền chi tiết theo từng chức năng ở lần sau; lần
-- này chỉ cần catalog không cản trở việc đó.
--
-- Không xoá permission nào — chỉ deactivate — để giữ nguyên vẹn FK của
-- role_feature_permissions (seed V3) và audit_log trỏ tới các mã cũ.

insert into permissions(id, code, name, description) values
  (gen_random_uuid(), 'VIEW_LIST', 'Xem danh sách', 'Xem danh sách bản ghi'),
  (gen_random_uuid(), 'VIEW_DETAIL', 'Xem chi tiết', 'Xem chi tiết một bản ghi');

update permissions set name = 'Thêm mới' where code = 'CREATE';
update permissions set name = 'Sửa' where code = 'EDIT';

update permissions set active = false where code not in ('VIEW_LIST', 'VIEW_DETAIL', 'CREATE', 'EDIT');
