select 'create database qtkhcn_ho_so owner qtkhcn' where not exists (select from pg_database where datname='qtkhcn_ho_so')\gexec
select 'create database qtkhcn_identity owner qtkhcn' where not exists (select from pg_database where datname='qtkhcn_identity')\gexec
