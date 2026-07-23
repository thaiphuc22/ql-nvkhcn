-- Replace only demo routing rows. User-created policies are intentionally preserved.
DELETE FROM action_availability_policy
WHERE process_code IS NOT NULL AND updated_by = 'system-seed';
DELETE FROM action_exception_policy
WHERE process_code IS NOT NULL AND updated_by = 'system-seed';

INSERT INTO action_studio_action
    (action_code, action_name, action_type, outcome, requires_reason, requires_evidence,
     requires_confirm, active, label, icon, ui_group, tone, display_order, help_text, version, updated_by, updated_at)
VALUES ('APPROVE_WITH_SUPPLEMENT', 'Đồng ý, yêu cầu bổ sung', 'STANDARD', 'dong_y_bo_sung',
        TRUE, FALSE, TRUE, TRUE, 'Đồng ý, yêu cầu bổ sung', 'thunderbolt', 'PRIMARY', 'warning', 12,
        'Outcome riêng của BPMN; cho phép tiếp tục và yêu cầu hoàn thiện hồ sơ.', 1, 'system-seed', NOW())
ON CONFLICT (action_code) DO NOTHING;

INSERT INTO action_availability_policy
    (id, action_code, surface, process_code, task_definition_key, dossier_status, form_key,
     condition_expression, display_order, enabled, version, updated_by, updated_at)
VALUES
('AP-BPMN-RD01_01-Task_2-SUBMIT', 'SUBMIT', 'DOSSIER_DETAIL', 'RD01_01', 'Task_2', 'draft',
 'phieu-chu-truong', 'dossier.docsComplete = true', 5, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01_01-Task_6-APPROVE', 'APPROVE_STEP', 'DOSSIER_DETAIL', 'RD01_01', 'Task_6', 'processing',
 'phieu-nhan-xet', 'user in currentStep.candidateGroups', 11, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01_01-Task_6-SUPPLEMENT', 'APPROVE_WITH_SUPPLEMENT', 'DOSSIER_DETAIL', 'RD01_01', 'Task_6', 'processing',
 'phieu-nhan-xet', 'user in currentStep.candidateGroups', 12, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01_01-Task_6-RETURN', 'RETURN_STEP', 'DOSSIER_DETAIL', 'RD01_01', 'Task_6', 'processing',
 NULL, 'user in currentStep.candidateGroups', 13, TRUE, 1, 'system-seed', NOW()),
('AP-BPMN-RD01_01-Task_99-ORPHAN', 'APPROVE_STEP', 'DOSSIER_DETAIL', 'RD01_01', 'Task_99', 'processing',
 'phieu-phe-duyet', NULL, 99, TRUE, 1, 'system-seed', NOW());

INSERT INTO action_availability_permission(policy_id, permission_code)
SELECT id, CASE WHEN action_code = 'SUBMIT' THEN 'SUBMIT_DOSSIER' ELSE 'PROCESS_STEP' END
FROM action_availability_policy WHERE id LIKE 'AP-BPMN-RD01_01-%';

INSERT INTO action_exception_policy
    (id, action_code, object_type, process_code, from_step_key, target_type, target_step_key,
     requires_approval, requires_reason, requires_evidence, enabled, version, updated_by, updated_at)
VALUES ('EP-01', 'REQUEST_BYPASS_COUNCIL', 'DOSSIER', 'RD01_01', 'Task_6', 'STEP', 'Task_8',
        TRUE, TRUE, TRUE, TRUE, 1, 'system-seed', NOW()),
       ('EP-03', 'REQUEST_SKIP_STEP', 'DOSSIER', 'RD02_02', 'Task_3', 'COMPLETE', NULL,
        TRUE, TRUE, TRUE, TRUE, 1, 'system-seed', NOW());
INSERT INTO action_exception_role(policy_id, role_code) VALUES ('EP-01', 'HDKHCN'), ('EP-03', 'HDXD_TD');
INSERT INTO action_exception_permission(policy_id, permission_code) VALUES
('EP-01', 'REQUEST_EXCEPTION'), ('EP-03', 'REQUEST_EXCEPTION');
