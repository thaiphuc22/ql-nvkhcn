-- Cho phép quản trị viên tạo/sửa/xóa Hội đồng xét duyệt thủ công qua UI (`GET/POST/PUT/DELETE
-- /api/hoi-dong`), ngoài luồng tự sinh từ workflow (service task "Generate_HDXD").
--
-- source_task_definition_key trước đây NOT NULL vì chỉ có 2 nguồn sinh tự động (T05/T18B); nới
-- lỏng thành nullable để hội đồng tạo thủ công (nguồn = NULL, không có task nào sinh ra nó) không
-- phải giả một task key không tồn tại. Postgres coi nhiều dòng NULL trong unique index là phân
-- biệt nhau, nên uk_hoi_dong_xet_duyet_ho_so_cap_task vẫn giữ nguyên tác dụng chống trùng lặp cho
-- 2 luồng tự sinh (mỗi luồng chỉ có 1 dòng non-NULL cho mỗi (ho_so_id, cap)).
ALTER TABLE hoi_dong_xet_duyet ALTER COLUMN source_task_definition_key DROP NOT NULL;

-- Optimistic locking cho sửa qua UI (header If-Match), cùng mẫu version ở ho_so/nhiem_vu.
ALTER TABLE hoi_dong_xet_duyet ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
