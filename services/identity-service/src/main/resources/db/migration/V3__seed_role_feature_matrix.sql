-- Seed baseline ma trận Role × Feature × Permission cho 8 vai trò chính.
--
-- Vì sao cần: V2 di trú mô hình phẳng `role_permissions` sang `role_feature_permissions` bằng
-- cách nhét TẤT CẢ vào feature 'GENERAL' (legacy). Hệ quả: mở ma trận theo 12 chức năng thật
-- thì mọi ô đều trống — ADMIN có 18 quyền nhưng chỉ ở GENERAL, còn mọi role BUSINESS chỉ có
-- đúng 1 quyền PROCESS_STEP ở GENERAL. Màn ma trận Role×Permission mới sẽ vô dụng nếu không có
-- baseline này.
--
-- Nguồn baseline: `webapp/src/data/rbac.ts` → ROLE_PERMISSION_POLICIES (thiết kế RBAC đã có của
-- bản mock React), bê nguyên sang đây để 2 frontend không lệch nhau về ý niệm quyền.
--
-- CẢNH BÁO — đây là NỚI RỘNG quyền có chủ ý: IdentityService.effective() hợp mọi feature thành
-- một tập `permissions` phẳng, nên 7 vai trò ngoài ADMIN có thêm quyền so với trước migration
-- này (ví dụ PM: chỉ PROCESS_STEP → thêm VIEW/CREATE/EDIT/COMMENT/EXPORT). Không vai trò nào
-- bị MẤT quyền: các dòng GENERAL được giữ nguyên, không xoá gì.
--
-- Ghi chú kỹ thuật: PK là (role_id, feature_id, permission_id) nên `on conflict do nothing` xử
-- lý được cả trường hợp admin đã tự tick trước khi migration này chạy.

-- ADMIN: toàn quyền trên mọi chức năng (trừ GENERAL legacy — đã có sẵn từ V2).
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select r.id, f.id, p.id, true
from roles r cross join features f cross join permissions p
where r.code = 'ADMIN' and f.legacy = false and f.active = true
  and p.code in ('VIEW','CREATE','EDIT','APPROVE','REJECT','RETURN','EXPORT','COMMENT','SIGN','CONFIGURE','AUDIT')
on conflict do nothing;

-- 7 vai trò còn lại: bảng (role, feature) × tập quyền tương ứng.
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select r.id, f.id, p.id, true
from (values
  -- OPERATOR — vận hành: xem/sửa/xuất/audit trên các chức năng vận hành.
  ('OPERATOR','DASHBOARD','VIEW,EDIT,EXPORT,AUDIT'),
  ('OPERATOR','WORKLIST','VIEW,EDIT,EXPORT,AUDIT'),
  ('OPERATOR','MISSION','VIEW,EDIT,EXPORT,AUDIT'),
  ('OPERATOR','DOSSIER','VIEW,EDIT,EXPORT,AUDIT'),
  ('OPERATOR','PROCESS','VIEW,EDIT,EXPORT,AUDIT'),
  ('OPERATOR','FORM','VIEW,EDIT,EXPORT,AUDIT'),
  ('OPERATOR','AUDIT','VIEW,EDIT,EXPORT,AUDIT'),
  -- VIEWER — quyền xem mặc định.
  ('VIEWER','DASHBOARD','VIEW'),
  ('VIEWER','WORKLIST','VIEW'),
  -- PM — chủ nhiệm đề tài: khởi tạo và biên tập nhiệm vụ/hồ sơ của mình, không phê duyệt.
  ('PM','MISSION','VIEW,CREATE,EDIT,COMMENT,EXPORT'),
  ('PM','DOSSIER','VIEW,CREATE,EDIT,COMMENT,EXPORT'),
  -- CQ_KHCN — chuyên quản KHCN: thẩm định hồ sơ cấp cơ sở.
  ('CQ_KHCN','DOSSIER','VIEW,EDIT,APPROVE,REJECT,RETURN,COMMENT,EXPORT'),
  -- CQ_QLKHCN — cơ quan quản lý KHCN: như trên, thêm xem audit.
  ('CQ_QLKHCN','DOSSIER','VIEW,EDIT,APPROVE,REJECT,RETURN,COMMENT,EXPORT,AUDIT'),
  -- HDKHCN — hội đồng KHCN: phê duyệt và ký, không biên tập hồ sơ.
  ('HDKHCN','DOSSIER','VIEW,APPROVE,REJECT,COMMENT,SIGN'),
  -- TGD_VHT — Tổng Giám đốc: quyết định cuối và ký.
  ('TGD_VHT','DOSSIER','VIEW,APPROVE,REJECT,SIGN,AUDIT')
) as seed(role_code, feature_code, permission_csv)
join roles r on r.code = seed.role_code
join features f on f.code = seed.feature_code and f.active = true
join permissions p on p.code = any (string_to_array(seed.permission_csv, ','))
on conflict do nothing;
