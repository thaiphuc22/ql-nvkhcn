create table features (
  id uuid primary key,
  code varchar(64) not null unique,
  name varchar(255) not null,
  feature_group varchar(64) not null,
  description varchar(1000),
  active boolean not null default true,
  legacy boolean not null default false
);

insert into features(id, code, name, feature_group, description, legacy) values
 (gen_random_uuid(),'DASHBOARD','Tổng quan','Workspace','Trang tổng quan hệ thống.',false),
 (gen_random_uuid(),'WORKLIST','Việc của tôi','Workspace','Danh sách task cần xử lý.',false),
 (gen_random_uuid(),'MISSION','Nhiệm vụ KHCN','Core','Quản lý master Nhiệm vụ KHCN.',false),
 (gen_random_uuid(),'DOSSIER','Hồ sơ KHCN','Core','Quản lý hồ sơ và vòng đời xử lý.',false),
 (gen_random_uuid(),'PROCESS','Quy trình','Configuration','Danh mục và phiên bản quy trình BPMN.',false),
 (gen_random_uuid(),'FORM','Biểu mẫu','Configuration','Thư viện biểu mẫu gắn vào task.',false),
 (gen_random_uuid(),'ACTION_CONFIG','Ma trận Hành động','Configuration','Action Registry và policy hiển thị action.',false),
 (gen_random_uuid(),'USER_ADMIN','Người dùng','Administration','Quản trị tài khoản người dùng.',false),
 (gen_random_uuid(),'ORG_ADMIN','Cơ cấu tổ chức','Administration','Quản trị đơn vị và phân bổ người dùng.',false),
 (gen_random_uuid(),'RBAC_ADMIN','Phân quyền','Administration','Role, permission, policy và data scope.',false),
 (gen_random_uuid(),'REPORT','Báo cáo','Operation','Báo cáo và xuất dữ liệu tổng hợp.',false),
 (gen_random_uuid(),'AUDIT','Nhật ký/Audit','Operation','Nhật ký hệ thống, sự kiện và audit.',false),
 (gen_random_uuid(),'GENERAL','Quyền chưa phân loại','Compatibility','Quyền được bảo toàn từ mô hình phẳng trước migration.',true);

create table role_feature_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  feature_id uuid not null references features(id),
  permission_id uuid not null references permissions(id),
  enabled boolean not null default true,
  primary key (role_id, feature_id, permission_id)
);
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select rp.role_id, f.id, rp.permission_id, true
from role_permissions rp cross join features f where f.code='GENERAL';
drop table role_permissions;

create table data_scope_types (
  code varchar(32) primary key,
  name varchar(255) not null,
  description varchar(1000),
  rank integer not null unique,
  active boolean not null default true
);
insert into data_scope_types(code,name,description,rank) values
 ('OWN_MISSION','Nhiệm vụ của tôi','Chỉ dữ liệu user tham gia/phụ trách.',1),
 ('OWN_DEPARTMENT','Đơn vị của tôi','Dữ liệu trong đơn vị của user.',2),
 ('OWN_CENTER','Trung tâm/Khối của tôi','Dữ liệu trong trung tâm hoặc khối.',3),
 ('ALL','Toàn hệ thống','Không giới hạn phạm vi dữ liệu.',4);
alter table user_role_assignments
  add constraint fk_assignment_data_scope foreign key (data_scope) references data_scope_types(code);

create table apps (
  code varchar(32) primary key,
  name varchar(255) not null,
  description varchar(1000),
  active boolean not null default true
);
insert into apps(code,name,description) values
 ('qlnvkhcn','Quản lý NV KHCN & Hồ sơ','Quản lý nhiệm vụ, hồ sơ và công việc cần xử lý.'),
 ('quytrinh','Quản trị quy trình','Thiết kế, cấu hình và giám sát quy trình.'),
 ('he-thong','Quản trị hệ thống','Quản trị tổ chức, người dùng và phân quyền.');
create table user_apps (
  user_id uuid not null references users(id) on delete cascade,
  app_code varchar(32) not null references apps(code),
  granted_at timestamptz not null default now(),
  primary key (user_id, app_code)
);
insert into user_apps(user_id,app_code)
select id,'qlnvkhcn' from users;
insert into user_apps(user_id,app_code)
select id,'quytrinh' from users where email in ('admin@example.com','cqnv@example.com');
insert into user_apps(user_id,app_code)
select id,'he-thong' from users where email='admin@example.com';
