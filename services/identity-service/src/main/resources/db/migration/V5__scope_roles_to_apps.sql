alter table roles add column app_code varchar(32);

update roles set app_code = 'he-thong' where code = 'ADMIN';
update roles set app_code = 'quytrinh' where code = 'OPERATOR';
update roles set app_code = 'qlnvkhcn' where code = 'VIEWER';
update roles set app_code = 'qlnvkhcn' where kind = 'BUSINESS';

alter table roles alter column app_code set not null;
alter table roles add constraint fk_roles_app foreign key (app_code) references apps(code);
create index ix_roles_app_code on roles(app_code);

-- Bảo toàn quyền hiệu lực từ GENERAL legacy bằng cách chuyển sang một Feature thật cùng App.
insert into role_feature_permissions(role_id, feature_id, permission_id, enabled)
select rfp.role_id, target.id, rfp.permission_id, rfp.enabled
from role_feature_permissions rfp
join roles r on r.id = rfp.role_id
join features source on source.id = rfp.feature_id and source.code = 'GENERAL'
join features target on target.code = case r.app_code
  when 'qlnvkhcn' then 'WORKLIST'
  when 'quytrinh' then 'PROCESS'
end
where r.app_code in ('qlnvkhcn','quytrinh')
on conflict do nothing;

-- Chỉ giữ grant trên Feature cùng App với Role.
delete from role_feature_permissions rfp
using roles r, features f
where rfp.role_id = r.id and rfp.feature_id = f.id and r.app_code <> f.app_code;
