create table organizations (
  id uuid primary key, code varchar(64) not null unique, name varchar(255) not null,
  parent_id uuid references organizations(id), active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table roles (
  id uuid primary key, code varchar(64) not null unique, name varchar(255) not null,
  kind varchar(32) not null default 'BUSINESS', active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table permissions (
  id uuid primary key, code varchar(64) not null unique, name varchar(255) not null,
  description varchar(1000), active boolean not null default true
);
create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
create table users (
  id uuid primary key, email varchar(255) not null unique, employee_code varchar(64) unique,
  full_name varchar(255) not null, job_title varchar(255), organization_id uuid references organizations(id),
  status varchar(32) not null default 'ACTIVE', administrator boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table user_role_assignments (
  id uuid primary key, user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id), data_scope varchar(32) not null,
  organization_id uuid references organizations(id), effective_from date, effective_to date,
  created_at timestamptz not null default now(),
  constraint ck_assignment_dates check (effective_to is null or effective_from is null or effective_to >= effective_from)
);
create index ix_assignment_user on user_role_assignments(user_id);
create table audit_log (
  id uuid primary key, event_type varchar(64) not null, actor_id varchar(255),
  entity_type varchar(64), entity_id varchar(255), details text, occurred_at timestamptz not null default now()
);

insert into organizations(id, code, name) values ('00000000-0000-0000-0000-000000000001','VHT','Viettel High Tech');
insert into permissions(id, code, name, description) values
 (gen_random_uuid(),'VIEW','Xem','Xem dữ liệu/chức năng'),(gen_random_uuid(),'CREATE','Tạo mới','Tạo bản ghi'),
 (gen_random_uuid(),'EDIT','Chỉnh sửa','Cập nhật dữ liệu'),(gen_random_uuid(),'DELETE','Xóa','Xóa bản ghi'),
 (gen_random_uuid(),'APPROVE','Phê duyệt','Phê duyệt task/hồ sơ'),(gen_random_uuid(),'REJECT','Từ chối','Từ chối task/hồ sơ'),
 (gen_random_uuid(),'RETURN','Trả lại','Trả hồ sơ'),(gen_random_uuid(),'EXPORT','Xuất dữ liệu','Xuất file/báo cáo'),
 (gen_random_uuid(),'COMMENT','Bình luận','Thêm ý kiến'),(gen_random_uuid(),'SIGN','Ký duyệt','Ký duyệt'),
 (gen_random_uuid(),'CONFIGURE','Cấu hình','Cấu hình hệ thống'),(gen_random_uuid(),'AUDIT','Xem audit','Xem nhật ký'),
 (gen_random_uuid(),'PROCESS_STEP','Xử lý bước','Thực hiện thao tác workflow'),(gen_random_uuid(),'ASSIGN_ROLE','Gán vai trò','Quản lý assignment'),
 (gen_random_uuid(),'MANAGE_USER','Quản lý người dùng','CRUD người dùng'),(gen_random_uuid(),'MANAGE_ROLE','Quản lý vai trò','CRUD vai trò'),
 (gen_random_uuid(),'MANAGE_ORG','Quản lý tổ chức','CRUD tổ chức'),(gen_random_uuid(),'VIEW_REPORT','Xem báo cáo','Xem báo cáo tổng hợp');

insert into roles(id,code,name,kind) values
 (gen_random_uuid(),'ADMIN','Quản trị hệ thống','SYSTEM'),(gen_random_uuid(),'OPERATOR','Vận hành','SYSTEM'),(gen_random_uuid(),'VIEWER','Người xem','SYSTEM'),
 (gen_random_uuid(),'PM','Chủ nhiệm đề tài','BUSINESS'),(gen_random_uuid(),'PA','Trợ lý đề tài','BUSINESS'),(gen_random_uuid(),'NNC','Người nghiên cứu','BUSINESS'),
 (gen_random_uuid(),'TD','Phòng Thẩm định','BUSINESS'),(gen_random_uuid(),'TCKT','Phòng Tài chính - Kế toán','BUSINESS'),(gen_random_uuid(),'LD','Lãnh đạo','BUSINESS'),
 (gen_random_uuid(),'CQ_KHCN','Chuyên quản KHCN','BUSINESS'),(gen_random_uuid(),'CQ_MS','Chuyên quản Mua sắm','BUSINESS'),(gen_random_uuid(),'CQ_NS','Chuyên quản Nhân sự','BUSINESS'),
 (gen_random_uuid(),'CQ_TCKT','Chuyên quản TCKT','BUSINESS'),(gen_random_uuid(),'TP_CLKHCN','Trưởng phòng CLKHCN','BUSINESS'),(gen_random_uuid(),'TP_TCKT','Trưởng phòng TCKT','BUSINESS'),
 (gen_random_uuid(),'TP_NS','Trưởng phòng Nhân sự','BUSINESS'),(gen_random_uuid(),'GD_TTMS','Giám đốc TT Mua sắm','BUSINESS'),(gen_random_uuid(),'BGD_TT','BGĐ Trung tâm','BUSINESS'),
 (gen_random_uuid(),'BGD_KHOI','BGĐ Khối','BUSINESS'),(gen_random_uuid(),'CQ_QLKHCN','Cơ quan QLKHCN','BUSINESS'),(gen_random_uuid(),'HDKHCN','Hội đồng KHCN VHT','BUSINESS'),
 (gen_random_uuid(),'HDXD','Hội đồng Xét duyệt','BUSINESS'),(gen_random_uuid(),'HDXD_DC','Hội đồng Xét duyệt điều chỉnh','BUSINESS'),(gen_random_uuid(),'HDNT','Hội đồng Nghiệm thu','BUSINESS'),
 (gen_random_uuid(),'HD_DGHT','Hội đồng Đánh giá hoàn thành','BUSINESS'),(gen_random_uuid(),'PTGD_CT','Phó TGĐ Chuyên trách','BUSINESS'),(gen_random_uuid(),'TGD_VHT','Tổng Giám đốc VHT','BUSINESS'),
 (gen_random_uuid(),'CQ_KHCN_TD','Cơ quan KHCN Tập đoàn','BUSINESS'),(gen_random_uuid(),'CQ_TCKT_TD','Cơ quan TCKT Tập đoàn','BUSINESS'),(gen_random_uuid(),'CQ_DTXD_TD','Cơ quan ĐTXD Tập đoàn','BUSINESS'),
 (gen_random_uuid(),'CQ_TCNL_TD','Cơ quan TCNL Tập đoàn','BUSINESS'),(gen_random_uuid(),'CQNV_TD','Cơ quan nghiệp vụ Tập đoàn','BUSINESS'),(gen_random_uuid(),'HDKHCN_TD','Hội đồng KHCN Tập đoàn','BUSINESS'),
 (gen_random_uuid(),'HDXD_TD','Hội đồng Xét duyệt Tập đoàn','BUSINESS'),(gen_random_uuid(),'HDNT_TD','Hội đồng Nghiệm thu Tập đoàn','BUSINESS'),(gen_random_uuid(),'BTGD_TD','Ban TGĐ Tập đoàn','BUSINESS');
insert into role_permissions select r.id,p.id from roles r cross join permissions p where r.code='ADMIN';
insert into role_permissions select r.id,p.id from roles r join permissions p on p.code='PROCESS_STEP' where r.kind='BUSINESS';

insert into users(id,email,full_name,status,administrator,organization_id) values
 ('10000000-0000-0000-0000-000000000001','admin@example.com','Quản trị demo','ACTIVE',true,'00000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002','pm@example.com','Chủ nhiệm demo','ACTIVE',false,'00000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000003','cqnv@example.com','Chuyên quản demo','ACTIVE',false,'00000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000004','tgd@example.com','Lãnh đạo demo','ACTIVE',false,'00000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000005','hdkhcn@example.com','Hội đồng demo','ACTIVE',false,'00000000-0000-0000-0000-000000000001');
insert into users(id,email,full_name,status,administrator,organization_id)
select gen_random_uuid(),email,full_name,'ACTIVE',false,'00000000-0000-0000-0000-000000000001'::uuid from (values
 ('gd-ttms@example.com','Giám đốc TTMS'),('tp-ns@example.com','Trưởng phòng Nhân sự'),('tp-tckt@example.com','Trưởng phòng TCKT'),
 ('cqkhcn-td@example.com','Cơ quan KHCN Tập đoàn'),('cqtckt-td@example.com','Cơ quan TCKT Tập đoàn'),
 ('cqdtxd-td@example.com','Cơ quan ĐTXD Tập đoàn'),('cqtcnl-td@example.com','Cơ quan TCNL Tập đoàn'),
 ('hdxd-td@example.com','Hội đồng Xét duyệt Tập đoàn'),('hdkhcn-td@example.com','Hội đồng KHCN Tập đoàn'),
 ('btgd-td@example.com','Ban TGĐ Tập đoàn')) x(email,full_name);
insert into user_role_assignments(id,user_id,role_id,data_scope,organization_id)
select gen_random_uuid(),u.id,r.id,case when r.code='ADMIN' then 'ALL' else 'OWN_CENTER' end,u.organization_id
from (values ('admin@example.com','ADMIN'),('pm@example.com','PM'),('pm@example.com','PA'),('pm@example.com','NNC'),
 ('cqnv@example.com','CQ_KHCN'),('cqnv@example.com','CQ_MS'),('cqnv@example.com','CQ_NS'),('cqnv@example.com','CQ_TCKT'),('cqnv@example.com','CQ_QLKHCN'),('cqnv@example.com','TP_CLKHCN'),
 ('tgd@example.com','TGD_VHT'),('tgd@example.com','BGD_TT'),('tgd@example.com','BGD_KHOI'),('tgd@example.com','PTGD_CT'),
 ('hdkhcn@example.com','HDKHCN'),('hdkhcn@example.com','HDXD'),('hdkhcn@example.com','HDXD_DC'),('hdkhcn@example.com','HDNT'),('hdkhcn@example.com','HD_DGHT')) x(email,role_code)
join users u on u.email=x.email join roles r on r.code=x.role_code;
insert into user_role_assignments(id,user_id,role_id,data_scope,organization_id)
select gen_random_uuid(),u.id,r.id,'ALL',u.organization_id from (values
 ('gd-ttms@example.com','GD_TTMS'),('tp-ns@example.com','TP_NS'),('tp-tckt@example.com','TP_TCKT'),
 ('cqkhcn-td@example.com','CQ_KHCN_TD'),('cqtckt-td@example.com','CQ_TCKT_TD'),('cqdtxd-td@example.com','CQ_DTXD_TD'),
 ('cqtcnl-td@example.com','CQ_TCNL_TD'),('hdxd-td@example.com','HDXD_TD'),('hdkhcn-td@example.com','HDKHCN_TD'),
 ('btgd-td@example.com','BTGD_TD')) x(email,role_code) join users u on u.email=x.email join roles r on r.code=x.role_code;
