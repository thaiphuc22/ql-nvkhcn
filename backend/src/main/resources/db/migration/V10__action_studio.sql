-- Ma trận Hành động (D10): business configuration lives in the domain DB, never Camunda variables.

CREATE TABLE action_studio_action (
    action_code VARCHAR(64) PRIMARY KEY,
    action_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(16) NOT NULL CHECK (action_type IN ('STANDARD', 'SUPPORT', 'EXCEPTION')),
    outcome VARCHAR(16),
    requires_reason BOOLEAN NOT NULL DEFAULT FALSE,
    requires_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    requires_confirm BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    label VARCHAR(255) NOT NULL,
    icon VARCHAR(64) NOT NULL,
    ui_group VARCHAR(16) NOT NULL CHECK (ui_group IN ('PRIMARY', 'MORE', 'EXCEPTION')),
    tone VARCHAR(16) NOT NULL CHECK (tone IN ('primary', 'default', 'danger', 'warning')),
    display_order INTEGER NOT NULL,
    help_text VARCHAR(1000),
    version BIGINT NOT NULL DEFAULT 1,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE action_availability_policy (
    id VARCHAR(128) PRIMARY KEY,
    action_code VARCHAR(64) NOT NULL REFERENCES action_studio_action(action_code),
    surface VARCHAR(32),
    process_code VARCHAR(64),
    task_definition_key VARCHAR(128),
    dossier_status VARCHAR(32),
    form_key VARCHAR(128),
    condition_expression VARCHAR(1000),
    display_order INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 1,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CHECK (task_definition_key IS NULL OR process_code IS NOT NULL)
);
CREATE INDEX idx_action_availability_match ON action_availability_policy
    (action_code, enabled, surface, process_code, task_definition_key, dossier_status);

CREATE TABLE action_availability_role (
    policy_id VARCHAR(128) NOT NULL REFERENCES action_availability_policy(id) ON DELETE CASCADE,
    role_code VARCHAR(64) NOT NULL,
    PRIMARY KEY (policy_id, role_code)
);
CREATE TABLE action_availability_permission (
    policy_id VARCHAR(128) NOT NULL REFERENCES action_availability_policy(id) ON DELETE CASCADE,
    permission_code VARCHAR(64) NOT NULL,
    PRIMARY KEY (policy_id, permission_code)
);

CREATE TABLE action_exception_policy (
    id VARCHAR(128) PRIMARY KEY,
    action_code VARCHAR(64) NOT NULL REFERENCES action_studio_action(action_code),
    object_type VARCHAR(32) NOT NULL CHECK (object_type IN ('DOSSIER', 'MISSION', 'PROPOSAL')),
    process_code VARCHAR(64),
    from_step_key VARCHAR(128),
    target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('STEP', 'STATUS', 'COMPLETE')),
    target_step_key VARCHAR(128),
    requires_approval BOOLEAN NOT NULL,
    requires_reason BOOLEAN NOT NULL,
    requires_evidence BOOLEAN NOT NULL,
    enabled BOOLEAN NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CHECK (target_type <> 'STEP' OR target_step_key IS NOT NULL)
);
CREATE TABLE action_exception_role (
    policy_id VARCHAR(128) NOT NULL REFERENCES action_exception_policy(id) ON DELETE CASCADE,
    role_code VARCHAR(64) NOT NULL,
    PRIMARY KEY (policy_id, role_code)
);
CREATE TABLE action_exception_permission (
    policy_id VARCHAR(128) NOT NULL REFERENCES action_exception_policy(id) ON DELETE CASCADE,
    permission_code VARCHAR(64) NOT NULL,
    PRIMARY KEY (policy_id, permission_code)
);

CREATE TABLE action_studio_audit (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    action VARCHAR(32) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    event_at TIMESTAMPTZ NOT NULL,
    detail VARCHAR(1000) NOT NULL
);
CREATE INDEX idx_action_studio_audit_entity ON action_studio_audit(entity_type, entity_id, event_at DESC);

INSERT INTO action_studio_action
    (action_code, action_name, action_type, outcome, requires_reason, requires_evidence,
     requires_confirm, active, label, icon, ui_group, tone, display_order, help_text, version, updated_by, updated_at)
VALUES
('SUBMIT', 'Gửi duyệt', 'STANDARD', 'SUBMIT', FALSE, FALSE, FALSE, TRUE, 'Gửi duyệt', 'thunderbolt', 'PRIMARY', 'primary', 10, NULL, 1, 'system-seed', NOW()),
('APPROVE_STEP', 'Đồng ý duyệt', 'STANDARD', 'APPROVE', FALSE, FALSE, TRUE, TRUE, 'Đồng ý duyệt', 'thunderbolt', 'PRIMARY', 'primary', 11, NULL, 1, 'system-seed', NOW()),
('RETURN_STEP', 'Yêu cầu điều chỉnh', 'STANDARD', 'RETURN', TRUE, FALSE, FALSE, TRUE, 'Yêu cầu điều chỉnh', 'thunderbolt', 'PRIMARY', 'default', 12, NULL, 1, 'system-seed', NOW()),
('REJECT_STEP', 'Từ chối duyệt', 'STANDARD', 'REJECT', TRUE, FALSE, TRUE, TRUE, 'Từ chối duyệt', 'thunderbolt', 'PRIMARY', 'danger', 13, NULL, 1, 'system-seed', NOW()),
('ADD_COMMENT', 'Bổ sung ý kiến', 'SUPPORT', NULL, TRUE, FALSE, FALSE, TRUE, 'Bổ sung ý kiến', 'appstore', 'MORE', 'default', 54, NULL, 1, 'system-seed', NOW()),
('DOWNLOAD_DOSSIER', 'Tải hồ sơ', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE, 'Tải hồ sơ', 'appstore', 'MORE', 'default', 55, NULL, 1, 'system-seed', NOW()),
('VIEW_HISTORY', 'Xem lịch sử', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE, 'Xem lịch sử', 'appstore', 'MORE', 'default', 56, NULL, 1, 'system-seed', NOW()),
('UPLOAD_ATTACHMENT', 'Tải lên tài liệu', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE, 'Tải lên tài liệu', 'appstore', 'MORE', 'default', 57, NULL, 1, 'system-seed', NOW()),
('VIEW_DOCUMENTS', 'Xem tài liệu', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE, 'Xem tài liệu', 'appstore', 'MORE', 'default', 58, NULL, 1, 'system-seed', NOW()),
('EXPORT_PDF', 'Xuất PDF', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE, 'Xuất PDF', 'appstore', 'MORE', 'default', 59, NULL, 1, 'system-seed', NOW()),
('PRINT_DOSSIER', 'In hồ sơ', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE, 'In hồ sơ', 'appstore', 'MORE', 'default', 60, NULL, 1, 'system-seed', NOW()),
('VIEW_AUDIT', 'Xem audit chi tiết', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE, 'Xem audit chi tiết', 'appstore', 'MORE', 'default', 61, NULL, 1, 'system-seed', NOW()),
('REQUEST_BYPASS_COUNCIL', 'Xin bỏ qua hội đồng', 'EXCEPTION', NULL, TRUE, FALSE, TRUE, TRUE, 'Xin bỏ qua hội đồng', 'safety', 'EXCEPTION', 'warning', 112, 'Hành động Chi tiết cần được kiểm soát và phê duyệt riêng.', 1, 'system-seed', NOW()),
('REQUEST_JUMP_TO_HIGHER_APPROVER', 'Xin chuyển cấp phê duyệt cao hơn', 'EXCEPTION', NULL, TRUE, FALSE, TRUE, TRUE, 'Xin chuyển cấp phê duyệt cao hơn', 'safety', 'EXCEPTION', 'warning', 113, 'Hành động Chi tiết cần được kiểm soát và phê duyệt riêng.', 1, 'system-seed', NOW()),
('REQUEST_SKIP_STEP', 'Xin bỏ qua bước xử lý', 'EXCEPTION', NULL, TRUE, FALSE, TRUE, TRUE, 'Xin bỏ qua bước xử lý', 'safety', 'EXCEPTION', 'warning', 114, 'Hành động Chi tiết cần được kiểm soát và phê duyệt riêng.', 1, 'system-seed', NOW()),
('REQUEST_REOPEN_STEP', 'Yêu cầu mở lại bước đã xử lý', 'EXCEPTION', NULL, TRUE, TRUE, TRUE, TRUE, 'Yêu cầu mở lại bước đã xử lý', 'safety', 'EXCEPTION', 'warning', 115, 'Hành động Chi tiết cần được kiểm soát và phê duyệt riêng.', 1, 'system-seed', NOW()),
('REQUEST_EMERGENCY_APPROVAL', 'Yêu cầu phê duyệt khẩn', 'EXCEPTION', NULL, TRUE, FALSE, TRUE, TRUE, 'Yêu cầu phê duyệt khẩn', 'safety', 'EXCEPTION', 'warning', 116, 'Hành động Chi tiết cần được kiểm soát và phê duyệt riêng.', 1, 'system-seed', NOW());

INSERT INTO action_availability_policy
    (id, action_code, surface, process_code, task_definition_key, dossier_status, form_key,
     condition_expression, display_order, enabled, version, updated_by, updated_at)
VALUES
('AP-01', 'SUBMIT', 'DOSSIER_DETAIL', NULL, NULL, 'draft', 'phieu-chu-truong', 'dossier.docsComplete = true', 10, TRUE, 1, 'system-seed', NOW()),
('AP-06', 'APPROVE_STEP', 'DOSSIER_DETAIL', NULL, NULL, 'processing', 'phieu-phe-duyet', 'user in currentStep.candidateGroups', 21, TRUE, 1, 'system-seed', NOW()),
('AP-07', 'RETURN_STEP', 'DOSSIER_DETAIL', NULL, NULL, 'processing', 'phieu-y-kien', 'user in currentStep.candidateGroups', 22, TRUE, 1, 'system-seed', NOW()),
('AP-08', 'REJECT_STEP', 'DOSSIER_DETAIL', NULL, NULL, 'processing', 'phieu-y-kien', 'user in currentStep.candidateGroups', 23, TRUE, 1, 'system-seed', NOW()),
('AP-03', 'ADD_COMMENT', 'DOSSIER_DETAIL', NULL, NULL, NULL, 'phieu-y-kien', NULL, 60, TRUE, 1, 'system-seed', NOW()),
('AP-04', 'DOWNLOAD_DOSSIER', 'DOSSIER_DETAIL', NULL, NULL, NULL, NULL, NULL, 61, TRUE, 1, 'system-seed', NOW()),
('AP-05', 'VIEW_HISTORY', 'DOSSIER_DETAIL', NULL, NULL, NULL, NULL, NULL, 62, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01.01-t1-SUBMIT', 'SUBMIT', 'DOSSIER_DETAIL', 'RD01.01', 't1', 'draft', 'phieu-chu-truong', NULL, 5, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01.01-t2-APPROVE', 'APPROVE_STEP', 'DOSSIER_DETAIL', 'RD01.01', 't2', 'processing', 'phieu-phe-duyet', NULL, 11, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01.01-t2-RETURN', 'RETURN_STEP', 'DOSSIER_DETAIL', 'RD01.01', 't2', 'processing', 'phieu-y-kien', NULL, 12, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01.01-t2-REJECT', 'REJECT_STEP', 'DOSSIER_DETAIL', 'RD01.01', 't2', 'processing', 'phieu-y-kien', NULL, 13, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01.01-t3-APPROVE', 'APPROVE_STEP', 'DOSSIER_DETAIL', 'RD01.01', 't3', 'processing', NULL, NULL, 11, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01.01-t9-ORPHAN', 'APPROVE_STEP', 'DOSSIER_DETAIL', 'RD01.01', 't9', 'processing', 'phieu-phe-duyet', NULL, 11, TRUE, 1, 'system-seed', NOW());

INSERT INTO action_availability_role(policy_id, role_code) VALUES
('AP-01', 'PM'), ('AP-01', 'PA'), ('AP-01', 'NNC');
INSERT INTO action_availability_permission(policy_id, permission_code) VALUES
('AP-01', 'SUBMIT_DOSSIER'), ('AP-06', 'PROCESS_STEP'), ('AP-07', 'PROCESS_STEP'),
('AP-08', 'PROCESS_STEP'), ('AP-03', 'ADD_COMMENT'), ('AP-04', 'DOWNLOAD_DOCUMENT'),
('AP-05', 'VIEW_AUDIT'), ('AP-BPMN-RD01.01-t1-SUBMIT', 'SUBMIT_DOSSIER'),
('AP-BPMN-RD01.01-t2-APPROVE', 'PROCESS_STEP'), ('AP-BPMN-RD01.01-t2-RETURN', 'PROCESS_STEP'),
('AP-BPMN-RD01.01-t2-REJECT', 'PROCESS_STEP'), ('AP-BPMN-RD01.01-t3-APPROVE', 'PROCESS_STEP'),
('AP-BPMN-RD01.01-t9-ORPHAN', 'PROCESS_STEP');

INSERT INTO action_exception_policy
    (id, action_code, object_type, process_code, from_step_key, target_type, target_step_key,
     requires_approval, requires_reason, requires_evidence, enabled, version, updated_by, updated_at)
VALUES
('EP-01', 'REQUEST_BYPASS_COUNCIL', 'DOSSIER', 'RD01.01', 't2', 'STEP', 't4', TRUE, TRUE, TRUE, TRUE, 1, 'system-seed', NOW()),
('EP-02', 'REQUEST_JUMP_TO_HIGHER_APPROVER', 'DOSSIER', NULL, NULL, 'STEP', 't4', TRUE, TRUE, FALSE, TRUE, 1, 'system-seed', NOW()),
('EP-03', 'REQUEST_SKIP_STEP', 'DOSSIER', 'RD02.01', 't2', 'COMPLETE', NULL, TRUE, TRUE, TRUE, TRUE, 1, 'system-seed', NOW());
INSERT INTO action_exception_role(policy_id, role_code) VALUES
('EP-01', 'TD'), ('EP-02', 'TD'), ('EP-02', 'TCKT'), ('EP-03', 'LD');
INSERT INTO action_exception_permission(policy_id, permission_code) VALUES
('EP-01', 'REQUEST_EXCEPTION'), ('EP-02', 'REQUEST_EXCEPTION'), ('EP-03', 'REQUEST_EXCEPTION');
