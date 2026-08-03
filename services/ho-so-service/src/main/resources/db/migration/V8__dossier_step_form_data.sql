-- Persist the eForm submission data captured when a workflow task action completes, so
-- downstream automation (e.g. sinh Hội đồng xét duyệt sau khi ký QĐ thành lập) has a real
-- business-data source instead of relying on transient Camunda variables (D3).
ALTER TABLE dossier_step ADD COLUMN form_data_json TEXT;
