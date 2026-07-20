-- RD02.02 form-creation actions shown in Action Studio / "Danh mục nút".
-- Availability policies are configured separately for the relevant BPMN tasks.

INSERT INTO action_studio_action
    (action_code, action_name, action_type, outcome, requires_reason, requires_evidence,
     requires_confirm, active, label, icon, ui_group, tone, display_order, help_text,
     version, updated_by, updated_at)
VALUES
('BM.02.01.DKI', 'Tạo BM.02.01.DKI', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE,
 'Tạo BM.02.01.DKI', 'appstore', 'MORE', 'default', 62,
 'Tạo biểu mẫu đăng ký nhiệm vụ khoa học và công nghệ.', 1, 'system-seed', NOW()),
('BM.02.02.DTO', 'Tạo BM.02.02.DTO', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE,
 'Tạo BM.02.02.DTO', 'appstore', 'MORE', 'default', 63,
 'Tạo biểu mẫu đề cương tổng quan nhiệm vụ.', 1, 'system-seed', NOW()),
('BM.02.03.TMI.DT', 'Tạo BM.02.03.TMI.DT', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE,
 'Tạo BM.02.03.TMI.DT', 'appstore', 'MORE', 'default', 64,
 'Tạo biểu mẫu thuyết minh đề tài.', 1, 'system-seed', NOW()),
('BM.02.06.LLK', 'Tạo BM.02.06.LLK', 'SUPPORT', NULL, FALSE, FALSE, FALSE, TRUE,
 'Tạo BM.02.06.LLK', 'appstore', 'MORE', 'default', 65,
 'Tạo biểu mẫu lý lịch khoa học.', 1, 'system-seed', NOW())
ON CONFLICT (action_code) DO NOTHING;
