-- Seed AI Agent thẩm định hồ sơ và binding vào RD02.02.
-- Connector runtime thực thi job type io.camunda.agenticai:aiagent:1; registry dùng CALL_API
-- vì đây là một outbound connector gọi mô hình OpenAI-compatible.

INSERT INTO service_task_definition
    (id, code, name, description, type_code, status, owner_module,
     latest_version, active_version, created_by, created_at, updated_by, updated_at)
VALUES (
    'a13d2be6-8e33-4bea-9339-9d6f23bb7c01',
    'AI_THAM_DINH_HO_SO_NV_KHCN',
    'AI thẩm định hồ sơ NV KHCN',
    'Tóm tắt tình trạng hồ sơ RD02.02, đề xuất APPROVED, REJECTED hoặc NEEDS_REVISION và giải thích căn cứ nghiệp vụ.',
    'CALL_API', 'ACTIVE', 'RD02',
    1, 1, 'system-seed', now(), 'system-seed', now()
);

INSERT INTO service_task_definition_tag (definition_id, tag) VALUES
    ('a13d2be6-8e33-4bea-9339-9d6f23bb7c01', 'rd02'),
    ('a13d2be6-8e33-4bea-9339-9d6f23bb7c01', 'ai-agent'),
    ('a13d2be6-8e33-4bea-9339-9d6f23bb7c01', 'tham-dinh-ho-so');

INSERT INTO service_task_config_version
    (id, definition_id, version, config_json, input_mapping, output_mapping, error_policy,
     status, change_note, created_by, created_at)
VALUES (
    '49b251e8-f3d9-4a26-9331-2f74ea4d5812',
    'a13d2be6-8e33-4bea-9339-9d6f23bb7c01',
    1,
    jsonb_build_object(
        'typeCode', 'CALL_API',
        'connectorKey', 'camunda-ai-agent',
        'endpointAction', 'chat-completions',
        'method', 'POST',
        'modelProvider', 'OpenAICompatible',
        'apiEndpoint', '{{secrets.CAMUNDA_PROVIDED_LLM_API_ENDPOINT}}',
        'apiKey', '{{secrets.CAMUNDA_PROVIDED_LLM_API_KEY}}',
        'model', 'amazon.nova-pro-v1',
        'systemPrompt', 'Bạn là trợ lý thẩm định hồ sơ NV KHCN, trả lời bằng tiếng Việt với văn phong nghiệp vụ, ngắn gọn và rõ ràng.',
        'userPrompt', E'Bạn là trợ lý thẩm định hồ sơ NV KHCN.\n\nDựa trên các biến trạng thái của process (các bản dự thảo, chữ ký, kết quả hội đồng, tình trạng hoàn thiện hồ sơ, báo cáo thẩm định và quyết định cuối cùng), hãy thực hiện:\n\n1) Tóm tắt ngắn gọn tình trạng hồ sơ hiện tại theo góc nhìn chuyên viên thẩm định.\n2) Xác định hồ sơ nên được xử lý theo một trong ba trường hợp:\n- Được phê duyệt tiếp (APPROVED),\n- Bị từ chối (REJECTED),\n- Cần hoàn thiện thêm (NEEDS_REVISION hoặc tương đương).\n3) Giải thích rõ lý do cho đề xuất của bạn, tham chiếu tới các bước/biến quan trọng (ví dụ: kết quả hội đồng, mức độ hoàn thiện hồ sơ, trạng thái ký duyệt).\n\nHãy trả lời bằng tiếng Việt, văn phong nghiệp vụ, ngắn gọn và rõ ràng.',
        'agentContext', '=agent1.context',
        'memoryStorageType', 'in-process',
        'contextWindowSize', 20,
        'responseFormat', 'text',
        'resultVariable', 'agent1'
    ),
    '[]'::jsonb,
    '[{"id":"out-ai-assessment-1","sourcePath":"$.responseText","target":"variables","targetPath":"aiThamDinhHoSo"}]'::jsonb,
    '{"timeoutMs":180000,"maxRetry":3,"retryDelayMs":30000,"retryBackoff":"exponential","retryableErrorCodes":["FAILED_MODEL_CALL","TIMEOUT"],"onFailure":"CREATE_INCIDENT","notifyRoles":["ADMIN","CQ_KHCN_TD"]}'::jsonb,
    'ACTIVE',
    'Seed AI Agent thẩm định hồ sơ và gắn vào RD02.02.',
    'system-seed', now()
);

INSERT INTO service_task_binding
    (id, bpmn_process_id, element_id, job_type, definition_id, binding_status,
     process_code, task_name, effective_from, created_by, updated_at)
VALUES (
    'ca21dd60-da0a-46bc-a779-2b42b080a841',
    'RD02_02', 'AI_ThamDinhHoSo', 'io.camunda.agenticai:aiagent:1',
    'a13d2be6-8e33-4bea-9339-9d6f23bb7c01', 'ACTIVE',
    'RD02.02', 'AI — Thẩm định hồ sơ NV KHCN',
    CURRENT_DATE, 'system-seed', now()
);
