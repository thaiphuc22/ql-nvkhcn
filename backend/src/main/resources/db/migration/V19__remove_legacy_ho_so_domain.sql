-- D18 final cutover: Service Quan tri quy trinh no longer owns or stores NV KHCN/Ho So aggregates.
-- Workflow correlation/inbox/outbox tables deliberately remain in this database.
DROP TABLE IF EXISTS dossier_step_code;
DROP TABLE IF EXISTS ho_so_tai_lieu;
DROP TABLE IF EXISTS dossier_step;
DROP TABLE IF EXISTS ho_so;
DROP TABLE IF EXISTS nhiem_vu;
