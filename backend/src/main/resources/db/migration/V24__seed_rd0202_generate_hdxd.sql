-- Seed cấu hình "Tác vụ hệ thống" cho service task Generate_HDXD (RD02.02) và binding tương ứng.
--
-- Worker thật (GenerateHdxdDocumentJobWorker, job type khcn.rd0202.generate-hdxd-decision) đã chạy
-- từ trước migration này — hành vi hard-code trong Java, KHÔNG đọc config_json ở đây (khác
-- CHECK_CHU_TRUONG_TD, nơi resolver đọc stubResult thật). Mục đích của migration này chỉ là đóng
-- gap hiển thị: task này bị "vô hình" trên màn /cau-hinh-tac-vu vì service_task_binding chưa từng
-- được ghi — registry đó chỉ có seed qua migration, chưa có API tạo binding.

INSERT INTO service_task_definition
    (id, code, name, description, type_code, status, owner_module,
     latest_version, active_version, created_by, created_at, updated_by, updated_at)
VALUES (
    'ce220bcb-7bbe-4a43-8f22-584ee79c3e57',
    'GENERATE_HDXD_DECISION',
    'Hệ thống sinh Hội đồng xét duyệt cấp Cơ sở',
    'Gọi sang ho-so-service để sinh Hội đồng xét duyệt cấp Cơ sở (HoiDongXetDuyet/ThanhVienHoiDong) và văn bản QĐ (HTML) từ formData đã lưu ở bước T05 (bm-02-08-qdh-nv); idempotent theo (ho_so_id, cap, source_task_definition_key), lỗi thì để Zeebe tự retry.',
    'GENERATE_DOCUMENT', 'ACTIVE', 'RD02',
    1, 1, 'system-seed', now(), 'system-seed', now()
);

INSERT INTO service_task_definition_tag (definition_id, tag) VALUES
    ('ce220bcb-7bbe-4a43-8f22-584ee79c3e57', 'rd02'),
    ('ce220bcb-7bbe-4a43-8f22-584ee79c3e57', 'hoi-dong-xet-duyet'),
    ('ce220bcb-7bbe-4a43-8f22-584ee79c3e57', 'generate-document');

-- config_json ghi lại đúng những gì worker đang làm hard-code, để màn hình không nói dối; KHÔNG
-- phải nguồn điều khiển runtime (xem ghi chú ở trên).
INSERT INTO service_task_config_version
    (id, definition_id, version, config_json, input_mapping, output_mapping, error_policy,
     status, change_note, created_by, created_at)
VALUES (
    '35efc237-54c9-45fe-9181-c902499ba680',
    'ce220bcb-7bbe-4a43-8f22-584ee79c3e57',
    1,
    '{"typeCode":"GENERATE_DOCUMENT","targetService":"ho-so-service","endpoint":"/internal/v1/ho-so/{hoSoId}/hoi-dong-xet-duyet","method":"POST","note":"hoSoId resolve qua WorkflowProcessMapping theo processInstanceKey, không qua biến process"}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"timeoutMs":30000,"maxRetry":3,"retryDelayMs":60000,"retryBackoff":"exponential","retryableErrorCodes":["TIMEOUT","SERVICE_UNAVAILABLE"],"onFailure":"CREATE_INCIDENT","notifyRoles":["ADMIN"]}'::jsonb,
    'ACTIVE',
    'Seed ban đầu — ghi lại hành vi hard-code của GenerateHdxdDocumentJobWorker để hiển thị trên registry.',
    'system-seed', now()
);

INSERT INTO service_task_binding
    (id, bpmn_process_id, element_id, job_type, definition_id, binding_status,
     process_code, task_name, effective_from, created_by, updated_at)
VALUES (
    '4a146706-fa75-4cab-99e8-077e0a6eb059',
    'RD02_02', 'Generate_HDXD', 'khcn.rd0202.generate-hdxd-decision',
    'ce220bcb-7bbe-4a43-8f22-584ee79c3e57', 'ACTIVE',
    'RD02.02', 'Hệ thống sinh Hội đồng xét duyệt cấp Cơ sở',
    CURRENT_DATE, 'system-seed', now()
);
