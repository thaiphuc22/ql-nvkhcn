-- Lat 1 runtime quy trinh dong: phan biet quy trinh deploy QUA APP voi quy trinh deploy THANG len
-- Camunda roi duoc importer hut ve. Can cho UI /quy-trinh ("nguon") va cho chan doan sau nay: ban
-- EXTERNAL khong di qua ProcessDefinitionImportValidator nen khong co warning lint nao.
--
-- Default 'APP' la dung cho toan bo du lieu cu: truoc migration nay chi co duong deploy qua app
-- (import BPMN, deploy draft, startup bundled deploy).

ALTER TABLE process_definition_version
    ADD COLUMN source VARCHAR(16) NOT NULL DEFAULT 'APP';

ALTER TABLE process_definition_version
    ADD CONSTRAINT chk_process_definition_version_source CHECK (source IN ('APP', 'EXTERNAL'));
