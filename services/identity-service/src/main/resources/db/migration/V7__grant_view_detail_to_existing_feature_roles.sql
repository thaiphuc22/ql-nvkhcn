-- V6 thu gọn catalog quyền hiển thị nhưng vô tình lấy mất quyền thao tác thật: 2 gate backend
-- (WorkflowTaskActionService.authorizeFeatureAccess, DossierActionService.authorize) check cứng
-- permission code cũ 'VIEW' trên feature DOSSIER — mã này đã bị V6 deactivate nên biến mất khỏi
-- effective-permissions của MỌI role không phải ADMIN, khiến không ai (kể cả PM) còn thấy được
-- action nào trên hồ sơ. 2 gate đó vừa được đổi sang check 'VIEW_DETAIL' (mã mới của V6), nhưng
-- V6 chỉ tạo mã quyền, không cấp cho role nào — nếu không có migration này thì đổi tên gate cũng
-- vô nghĩa, vẫn chặn hết.
--
-- Quy tắc cấp: role nào đang có BẤT KỲ quyền nào (kể cả mã cũ đã deactivate, vì FK role_feature_
-- permissions vẫn còn nguyên) trên một feature thì được cấp thêm VIEW_DETAIL cho đúng feature đó
-- — "đã thao tác được thì phải xem chi tiết được". Không cấp quyền mới nào khác ngoài VIEW_DETAIL.

insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, rfp.feature_id, p.id, true
from role_feature_permissions rfp
cross join (select id from permissions where code = 'VIEW_DETAIL') p
where rfp.feature_id != (select id from features where code = 'GENERAL')
on conflict do nothing;
