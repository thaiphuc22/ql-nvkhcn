-- Mỗi chức năng thuộc đúng một ứng dụng mà người dùng nhìn thấy trên UI.
-- `apps` là ranh giới sản phẩm/giao diện, không phải microservice triển khai.
alter table features add column app_code varchar(32);

update features set app_code = 'qlnvkhcn'
where code in ('DASHBOARD','WORKLIST','MISSION','DOSSIER','REPORT');

update features set app_code = 'quytrinh'
where code in ('PROCESS','FORM','ACTION_CONFIG');

update features set app_code = 'he-thong'
where code in ('USER_ADMIN','ORG_ADMIN','RBAC_ADMIN','AUDIT','GENERAL');

alter table features alter column app_code set not null;
alter table features
  add constraint fk_features_app foreign key (app_code) references apps(code);
create index ix_features_app_code on features(app_code);
