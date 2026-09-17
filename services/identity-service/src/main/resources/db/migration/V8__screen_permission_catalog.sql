-- Catalog quyền theo màn hình (BA 2026-09-12). Mỗi mã (NV01, HS01, …) thuộc đúng một
-- Feature; cột `requires` = ràng buộc cha (tick con thì phải có cha); `screen_children`
-- = quyền con theo màn hình (DB01 → widget NV03/QT02) — không tự cấp khi gán cha.
--
-- Không xoá mã generic VIEW_LIST/VIEW_DETAIL/CREATE/EDIT: vẫn dùng cho Feature chưa có
-- catalog riêng (FORM, USER_ADMIN, ORG_ADMIN, RBAC_ADMIN, AUDIT, REPORT, GENERAL).
-- Màn BA (MISSION/DOSSIER/…) chỉ hiện mã riêng; generic không còn gắn được vào đó.

alter table permissions
  add column feature_id uuid references features(id),
  add column sort_order integer not null default 0,
  add column requires varchar(255),
  add column screen_children varchar(255);
create index ix_permissions_feature_id on permissions(feature_id);

alter table features
  add column sort_order integer not null default 100;

-- Dashboard sống ở App quytrinh (/tong-quan) — chuyển Feature cho khớp màn hình thật.
update features set app_code = 'quytrinh', sort_order = 10, name = 'Dashboard'
where code = 'DASHBOARD';
delete from role_feature_permissions rfp
using roles r, features f
where rfp.role_id = r.id and rfp.feature_id = f.id
  and f.code = 'DASHBOARD' and r.app_code <> 'quytrinh';

update features set sort_order = 10, name = 'Việc của tôi' where code = 'WORKLIST';
update features set sort_order = 20, name = 'Quản lý Nhiệm vụ KHCN' where code = 'MISSION';
update features set sort_order = 30, name = 'Quản lý Hồ sơ KHCN' where code = 'DOSSIER';
update features set sort_order = 20, name = 'Quản lý quy trình' where code = 'PROCESS';
update features set sort_order = 30, name = 'Ma trận hành động' where code = 'ACTION_CONFIG';
update features set sort_order = 60 where code = 'FORM';
update features set sort_order = 90 where code = 'REPORT';
update features set sort_order = 40 where code = 'ORG_ADMIN';
update features set sort_order = 50 where code = 'USER_ADMIN';
update features set sort_order = 60 where code = 'RBAC_ADMIN';
update features set sort_order = 70 where code = 'AUDIT';
update features set sort_order = 99 where code = 'GENERAL';

insert into features(id, code, name, feature_group, app_code, description, active, legacy, sort_order) values
 (gen_random_uuid(),'COUNCIL','Quản lý Hội đồng','Core','qlnvkhcn','Danh sách và thành lập Hội đồng.',true,false,40),
 (gen_random_uuid(),'PROCESS_MONITOR','Giám sát tiến trình','Operation','quytrinh','Giám sát process instance Camunda.',true,false,40),
 (gen_random_uuid(),'INTEGRATION','Tích hợp','Operation','quytrinh','Cấu hình tích hợp hệ thống.',true,false,50),
 (gen_random_uuid(),'RESEARCH_PRODUCT','Quản lý Sản phẩm nghiên cứu','Output','qlnvkhcn','Dịch vụ, sản phẩm nghiên cứu — chưa có màn hình.',true,false,50),
 (gen_random_uuid(),'INTELLECTUAL_PROPERTY','Sở hữu trí tuệ','Output','qlnvkhcn','Hồ sơ SHTT — chưa có màn hình.',true,false,60),
 (gen_random_uuid(),'PUBLICATION','Công bố khoa học','Output','qlnvkhcn','Bài báo, sáng chế — chưa có màn hình.',true,false,70),
 (gen_random_uuid(),'CORE_TECH','Công nghệ lõi','Output','qlnvkhcn','Danh mục công nghệ lõi — chưa có màn hình.',true,false,80),
 (gen_random_uuid(),'NOTIF_TEMPLATE','Mẫu thông báo','Notification','he-thong','Mẫu thông báo — chưa có màn hình.',true,false,10),
 (gen_random_uuid(),'NOTIF_CONFIG','Cấu hình thông báo','Notification','he-thong','Cấu hình Email/SMS/Web/App — chưa có màn hình.',true,false,20),
 (gen_random_uuid(),'NOTIFICATION','Danh sách thông báo','Notification','he-thong','Nhật ký gửi thông báo — chưa có màn hình.',true,false,30);

insert into permissions(id, code, name, description, feature_id, sort_order, requires, screen_children, active)
select gen_random_uuid(), x.code, x.name, x.description, f.id, x.sort_order,
       nullif(x.requires, ''), nullif(x.screen_children, ''), true
from (values
  -- Dashboard
  ('DASHBOARD','DB01','Xem tổng quan chung','Xem tab Tổng quan Dashboard',1,'','NV03,QT02'),
  ('DASHBOARD','DB02','Xem báo cáo Optimize','Xem báo cáo Optimize trên Dashboard',2,'DB01',''),
  ('DASHBOARD','DB03','Xem báo cáo DMN outcome','Xem báo cáo DMN outcome trên Dashboard',3,'DB01',''),
  -- Việc của tôi
  ('WORKLIST','TASK01','Xem danh sách việc được giao','Xem worklist task được giao',1,'',''),
  ('WORKLIST','TASK02','Xem chi tiết task','Mở chi tiết một task',2,'TASK01',''),
  ('WORKLIST','TASK03','Thực hiện action trên task','Phê duyệt / trả lại / từ chối task',3,'TASK02',''),
  -- Nhiệm vụ
  ('MISSION','NV01','Xem danh sách nhiệm vụ','Danh sách Nhiệm vụ KHCN',1,'',''),
  ('MISSION','NV02','Tạo nhiệm vụ KHCN','Tạo mới Nhiệm vụ KHCN',2,'NV01',''),
  ('MISSION','NV03','Xem chi tiết nhiệm vụ','Xem chi tiết một nhiệm vụ',3,'NV01',''),
  ('MISSION','NV04','Chỉnh sửa thông tin nhiệm vụ','Sửa thông tin nhiệm vụ',4,'NV03',''),
  ('MISSION','NV05','Upload/Download/Xóa tài liệu đính kèm theo Nhiệm vụ','Tài liệu đính kèm nhiệm vụ',5,'NV01,NV03',''),
  ('MISSION','NV06','Xóa nhiệm vụ','Xóa nhiệm vụ KHCN',6,'NV01',''),
  -- Hồ sơ
  ('DOSSIER','HS01','Xem danh sách hồ sơ','Danh sách Hồ sơ KHCN',1,'',''),
  ('DOSSIER','HS02','Tạo hồ sơ','Tạo mới hồ sơ',2,'HS01',''),
  ('DOSSIER','HS03','Xem chi tiết hồ sơ','Xem chi tiết một hồ sơ',3,'HS01',''),
  ('DOSSIER','HS04','Cập nhật hồ sơ/biểu mẫu','Sửa hồ sơ và biểu mẫu',4,'HS03',''),
  ('DOSSIER','HS05','Upload/Download/Xóa tài liệu đính kèm theo hồ sơ','Tài liệu đính kèm hồ sơ',5,'HS04',''),
  ('DOSSIER','HS06','Gửi duyệt hồ sơ','Gửi hồ sơ vào luồng phê duyệt',6,'HS04',''),
  ('DOSSIER','HS07','Xóa hồ sơ','Xóa hồ sơ',7,'HS03',''),
  ('DOSSIER','HS08','Xem lịch sử hồ sơ','Lịch sử xử lý hồ sơ',8,'HS03',''),
  -- Hội đồng (HD06 = mã thiếu trên file BA cho "Tạo file Quyết định…")
  ('COUNCIL','HD01','Xem danh sách Hội đồng','Danh sách Hội đồng',1,'',''),
  ('COUNCIL','HD02','Xem chi tiết Hội đồng','Xem chi tiết một Hội đồng',2,'HD01',''),
  ('COUNCIL','HD03','Lập danh sách Hội đồng','Tạo mới Hội đồng',3,'HD01',''),
  ('COUNCIL','HD04','Chỉnh sửa danh sách Hội đồng','Sửa thành viên / thông tin Hội đồng',4,'HD03',''),
  ('COUNCIL','HD06','Tạo file Quyết định thành lập Hội đồng và trình ký','Sinh file QĐ thành lập và trình ký',5,'HD03',''),
  ('COUNCIL','HD05','Xóa Hội đồng','Xóa Hội đồng',6,'HD01',''),
  -- Quy trình (không seed jobworker — không phải màn hình)
  ('PROCESS','QT01','Xem danh sách quy trình','Danh mục quy trình BPMN',1,'',''),
  ('PROCESS','QT02','Xem chi tiết BPMN/phiên bản','Xem BPMN và phiên bản quy trình',2,'QT01',''),
  ('PROCESS','QT03','Đồng bộ quy trình từ Camunda','Kéo quy trình đã deploy từ Camunda',3,'',''),
  ('PROCESS','QT05','Xem lịch sử phiên bản','Lịch sử phiên bản quy trình',4,'QT02',''),
  -- Ma trận hành động (DTO03 ràng buộc DTO01 — sửa typo DSO01 trên file BA)
  ('ACTION_CONFIG','HTN01','Xem danh sách luật hiển thị hành động','Tab Luật hiển thị hành động',1,'',''),
  ('ACTION_CONFIG','HTN02','Tạo luật hành động','Tạo luật hiển thị hành động',2,'HTN01',''),
  ('ACTION_CONFIG','HTN03','Sửa luật hành động','Sửa luật hiển thị hành động',3,'HTN02',''),
  ('ACTION_CONFIG','HTN04','Xem chi tiết luật hành động','Xem chi tiết một luật',4,'HTN01',''),
  ('ACTION_CONFIG','HTN05','Xóa luật hành động','Xóa luật hiển thị hành động',5,'HTN01',''),
  ('ACTION_CONFIG','DTO01','Xem danh sách đối soát luật hành động với BPMN','Tab Đối soát BPMN',6,'HTN01',''),
  ('ACTION_CONFIG','DTO02','Chạy đối soát BPMN','Chạy đối soát / scaffold luật từ BPMN',7,'',''),
  ('ACTION_CONFIG','DTO03','Xem chi tiết đối soát luật','Xem chi tiết một lần đối soát',8,'DTO01',''),
  ('ACTION_CONFIG','DMHD01','Xem danh mục hành động','Tab Danh mục hành động',9,'HTN01',''),
  ('ACTION_CONFIG','DMHD02','Xem chi tiết danh mục hành động','Xem chi tiết một hành động',10,'DMHD01',''),
  -- Giám sát / Tích hợp
  ('PROCESS_MONITOR','GS01','Xem danh sách giám sát tiến trình','Danh sách process instance',1,'',''),
  ('PROCESS_MONITOR','GS02','Xem chi tiết giám sát tiến trình','Chi tiết process instance',2,'GS01',''),
  ('INTEGRATION','INT01','Xem danh sách tích hợp','Danh sách cấu hình tích hợp',1,'',''),
  ('INTEGRATION','INT02','Xem chi tiết cấu hình tích hợp','Chi tiết một cấu hình tích hợp',2,'INT01',''),
  ('INTEGRATION','INT03','Sửa chi tiết cấu hình tích hợp','Sửa cấu hình tích hợp',3,'INT02',''),
  -- Module chưa có màn — seed catalog để gán trên ma trận
  ('RESEARCH_PRODUCT','SP01','Xem danh sách dịch vụ, sản phẩm nghiên cứu','Danh sách SP nghiên cứu',1,'',''),
  ('RESEARCH_PRODUCT','SP02','Xem chi tiết dịch vụ, sản phẩm nghiên cứu','Chi tiết SP nghiên cứu',2,'SP01',''),
  ('RESEARCH_PRODUCT','SP03','Thêm mới dịch vụ, sản phẩm nghiên cứu','Tạo SP nghiên cứu',3,'SP01',''),
  ('RESEARCH_PRODUCT','SP04','Chỉnh sửa dịch vụ, sản phẩm nghiên cứu','Sửa SP nghiên cứu',4,'SP03',''),
  ('RESEARCH_PRODUCT','SP05','Xóa dịch vụ, sản phẩm nghiên cứu','Xóa SP nghiên cứu',5,'SP01',''),
  ('RESEARCH_PRODUCT','SP06','Xem thông tin doanh thu, chi phí, lợi nhuận của dịch vụ, sản phẩm nghiên cứu','Xem P&L SP nghiên cứu',6,'SP01',''),
  ('INTELLECTUAL_PROPERTY','SHTT01','Xem danh sách','Danh sách sở hữu trí tuệ',1,'',''),
  ('INTELLECTUAL_PROPERTY','SHTT02','Xem chi tiết','Chi tiết SHTT',2,'SHTT01',''),
  ('INTELLECTUAL_PROPERTY','SHTT03','Thêm mới','Tạo hồ sơ SHTT',3,'',''),
  ('INTELLECTUAL_PROPERTY','SHTT04','Chỉnh sửa','Sửa hồ sơ SHTT',4,'SHTT03',''),
  ('INTELLECTUAL_PROPERTY','SHTT05','Xóa','Xóa hồ sơ SHTT',5,'SHTT01',''),
  ('PUBLICATION','CBKH01','Xem danh sách bài báo, sáng chế, giải pháp hữu ích','Danh sách công bố khoa học',1,'',''),
  ('PUBLICATION','CBKH02','Xem chi tiết','Chi tiết công bố khoa học',2,'CBKH01',''),
  ('PUBLICATION','CBKH03','Thêm mới','Tạo công bố khoa học',3,'CBKH01',''),
  ('PUBLICATION','CBKH04','Chỉnh sửa','Sửa công bố khoa học',4,'CBKH01',''),
  ('PUBLICATION','CBKH05','Xóa','Xóa công bố khoa học',5,'CBKH01',''),
  ('CORE_TECH','CNL01','Xem danh sách công nghệ lõi','Danh sách công nghệ lõi',1,'',''),
  ('CORE_TECH','CNL02','Xem chi tiết','Chi tiết công nghệ lõi',2,'CNL01',''),
  ('CORE_TECH','CNL03','Thêm mới','Tạo công nghệ lõi',3,'CNL01',''),
  ('CORE_TECH','CNL04','Chỉnh sửa','Sửa công nghệ lõi',4,'CNL01',''),
  ('CORE_TECH','CNL05','Xóa','Xóa công nghệ lõi',5,'CNL01',''),
  ('NOTIF_TEMPLATE','MTB01','Xem danh sách thông báo','Danh sách mẫu thông báo',1,'',''),
  ('NOTIF_TEMPLATE','MTB02','Tạo mới Mẫu thông báo','Tạo mẫu thông báo',2,'MTB01',''),
  ('NOTIF_TEMPLATE','MTB03','Xem chi tiết Mẫu thông báo','Chi tiết mẫu thông báo',3,'MTB01',''),
  ('NOTIF_TEMPLATE','MTB04','Chỉnh sửa Mẫu thông báo','Sửa mẫu thông báo',4,'MTB03',''),
  ('NOTIF_TEMPLATE','MTB05','Xóa Mẫu thông báo','Xóa mẫu thông báo',5,'MTB01',''),
  ('NOTIF_CONFIG','CHTB01','Cấu hình Email/SMS/Web/App','Cấu hình kênh gửi thông báo',1,'',''),
  ('NOTIFICATION','TB01','Xem danh sách thông báo','Danh sách thông báo đã gửi',1,'',''),
  ('NOTIFICATION','TB02','Xem chi tiết thông báo','Chi tiết một thông báo',2,'TB01',''),
  ('NOTIFICATION','TB03','Gửi lại thông báo','Gửi lại một thông báo',3,'TB01','')
) as x(feature_code, code, name, description, sort_order, requires, screen_children)
join features f on f.code = x.feature_code;

-- Map grant generic/cũ → mã màn hình. Kể cả mã đã deactivate (VIEW, PROCESS_STEP, …)
-- vì FK role_feature_permissions vẫn còn.
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, fnew.id, pnew.id, true
from role_feature_permissions rfp
join features fold on fold.id = rfp.feature_id
join permissions pold on pold.id = rfp.permission_id
join (
  values
    ('DASHBOARD','VIEW','DB01'),
    ('DASHBOARD','VIEW_LIST','DB01'),
    ('DASHBOARD','VIEW_DETAIL','DB01'),
    ('DASHBOARD','EDIT','DB01'),
    ('WORKLIST','VIEW','TASK01'),
    ('WORKLIST','VIEW_LIST','TASK01'),
    ('WORKLIST','VIEW_DETAIL','TASK02'),
    ('WORKLIST','EDIT','TASK03'),
    ('WORKLIST','PROCESS_STEP','TASK03'),
    ('MISSION','VIEW','NV01'),
    ('MISSION','VIEW_LIST','NV01'),
    ('MISSION','CREATE','NV02'),
    ('MISSION','VIEW_DETAIL','NV03'),
    ('MISSION','EDIT','NV04'),
    ('MISSION','DELETE','NV06'),
    ('DOSSIER','VIEW','HS01'),
    ('DOSSIER','VIEW_LIST','HS01'),
    ('DOSSIER','CREATE','HS02'),
    ('DOSSIER','VIEW_DETAIL','HS03'),
    ('DOSSIER','EDIT','HS04'),
    ('DOSSIER','DELETE','HS07'),
    ('PROCESS','VIEW','QT01'),
    ('PROCESS','VIEW_LIST','QT01'),
    ('PROCESS','VIEW_DETAIL','QT02'),
    ('PROCESS','EDIT','QT02'),
    ('PROCESS','CREATE','QT03'),
    ('PROCESS','CONFIGURE','QT03'),
    ('ACTION_CONFIG','VIEW','HTN01'),
    ('ACTION_CONFIG','VIEW_LIST','HTN01'),
    ('ACTION_CONFIG','CREATE','HTN02'),
    ('ACTION_CONFIG','EDIT','HTN03'),
    ('ACTION_CONFIG','VIEW_DETAIL','HTN04'),
    ('ACTION_CONFIG','DELETE','HTN05')
) as map(old_feature, old_perm, new_perm)
  on fold.code = map.old_feature and pold.code = map.old_perm
join permissions pnew on pnew.code = map.new_perm
join features fnew on fnew.id = pnew.feature_id
join roles r on r.id = rfp.role_id and r.app_code = fnew.app_code
on conflict do nothing;

-- Ai từng duyệt/sửa hồ sơ hoặc có PROCESS_STEP thì được TASK* — giữ demo action trên worklist.
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, worklist.id, p.id, true
from role_feature_permissions rfp
join features f on f.id = rfp.feature_id and f.code in ('DOSSIER','WORKLIST')
join permissions oldp on oldp.id = rfp.permission_id
join features worklist on worklist.code = 'WORKLIST'
join permissions p on p.code in ('TASK01','TASK02','TASK03')
join roles r on r.id = rfp.role_id and r.app_code = 'qlnvkhcn'
where oldp.code in ('APPROVE','PROCESS_STEP','EDIT','VIEW_DETAIL')
on conflict do nothing;

-- Ai sửa được hồ sơ thì gửi duyệt + tài liệu đính kèm (giữ demo Gửi duyệt của PM).
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, f.id, extra.id, true
from role_feature_permissions rfp
join permissions hs04 on hs04.id = rfp.permission_id and hs04.code = 'HS04'
join features f on f.id = rfp.feature_id
join permissions extra on extra.code in ('HS05','HS06')
on conflict do nothing;

-- Tab đối soát / danh mục đi kèm khi đã có luật hiển thị.
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, f.id, extra.id, true
from role_feature_permissions rfp
join permissions htn on htn.id = rfp.permission_id and htn.code = 'HTN01'
join features f on f.id = rfp.feature_id
join permissions extra on extra.code in ('DTO01','DMHD01')
on conflict do nothing;

insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, f.id, extra.id, true
from role_feature_permissions rfp
join permissions htn on htn.id = rfp.permission_id and htn.code = 'HTN04'
join features f on f.id = rfp.feature_id
join permissions extra on extra.code in ('DTO03','DMHD02')
on conflict do nothing;

-- Đóng bao ràng buộc cha: nếu có con thì cấp luôn parent (cùng hoặc khác feature).
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, parent.feature_id, parent.id, true
from role_feature_permissions rfp
join permissions child on child.id = rfp.permission_id
join permissions parent on parent.code = any (string_to_array(coalesce(child.requires, ''), ','))
where parent.feature_id is not null
on conflict do nothing;

insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select distinct rfp.role_id, parent.feature_id, parent.id, true
from role_feature_permissions rfp
join permissions child on child.id = rfp.permission_id
join permissions parent on parent.code = any (string_to_array(coalesce(child.requires, ''), ','))
where parent.feature_id is not null
on conflict do nothing;

-- Hội đồng: map từ vai trò nghiệp vụ liên quan (Feature mới, chưa có grant).
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select r.id, f.id, p.id, true
from roles r
join features f on f.code = 'COUNCIL'
join permissions p on p.feature_id = f.id
where r.code in ('HDKHCN','HDXD','HDXD_DC','HDNT','HD_DGHT') and p.code in ('HD01','HD02')
on conflict do nothing;

insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select r.id, f.id, p.id, true
from roles r
join features f on f.code = 'COUNCIL'
join permissions p on p.feature_id = f.id
where r.code in ('CQ_KHCN','CQ_QLKHCN') and p.code in ('HD01','HD02','HD03','HD04','HD06')
on conflict do nothing;

-- OPERATOR (App quytrinh): đủ quyền vận hành các màn đang có.
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select r.id, p.feature_id, p.id, true
from roles r
join permissions p on p.code in (
  'DB01','DB02','DB03',
  'QT01','QT02','QT03','QT05',
  'HTN01','HTN02','HTN03','HTN04','HTN05','DTO01','DTO02','DTO03','DMHD01','DMHD02',
  'GS01','GS02','INT01','INT02','INT03'
)
where r.code = 'OPERATOR' and p.feature_id is not null
on conflict do nothing;

insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select r.id, f.id, p.id, true
from roles r
cross join features f
join permissions p on p.code in ('VIEW_LIST','VIEW_DETAIL','CREATE','EDIT') and p.feature_id is null
where r.code = 'OPERATOR' and f.code = 'FORM'
on conflict do nothing;

-- cqnv demo được entitlement App quytrinh nhưng mọi role đang thuộc qlnvkhcn —
-- gán thêm OPERATOR để ma trận quytrinh có nguồn grant thật.
insert into user_role_assignments(id, user_id, role_id, data_scope, organization_id)
select gen_random_uuid(), u.id, r.id, 'ALL', u.organization_id
from users u
join roles r on r.code = 'OPERATOR'
where u.email = 'cqnv@example.com'
  and not exists (
    select 1 from user_role_assignments a where a.user_id = u.id and a.role_id = r.id
  );
