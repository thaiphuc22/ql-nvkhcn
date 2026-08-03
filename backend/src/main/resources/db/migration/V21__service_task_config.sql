-- Cấu hình tác vụ hệ thống (Service Task) — nền cho seam "config điều khiển job worker".
--
-- Trước migration này, module "Cấu hình tác vụ hệ thống" chỉ tồn tại ở frontend dưới dạng seed
-- in-memory (frontend-angular/src/app/core/models/service-task.ts) và KHÔNG chi phối runtime:
-- job worker hard-code hành vi trong Java. Ba bảng dưới đây là contract thật để worker tra cứu
-- lúc chạy.
--
-- ⚠️ KHÁC BIỆT KEY SO VỚI FRONTEND — có chủ ý:
--   Frontend ghim binding theo processCode + processVersion + taskDefinitionKey ('RD02.02','1.0').
--   Đó là khái niệm của registry mock, runtime KHÔNG có. Thứ `ActivatedJob` thật đưa cho worker là
--   bpmn_process_id + element_id + job_type. Bảng binding vì vậy ghim theo bộ đó; process_code chỉ
--   giữ để hiển thị/đối soát, KHÔNG dùng để resolve.
--
-- Mỗi service_task_config_version là artifact bất biến; activate chỉ trỏ definition sang 1 version.
-- (Cùng khuôn dmn_rule / dmn_rule_version ở V6.)

CREATE TABLE service_task_definition (
    id              UUID PRIMARY KEY,
    code            VARCHAR(128) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     VARCHAR(1000) NOT NULL,
    type_code       VARCHAR(32) NOT NULL
        CHECK (type_code IN ('SEND_NOTIFICATION', 'CALL_API', 'UPDATE_DOSSIER',
                             'GENERATE_DOCUMENT', 'EVALUATE_DECISION')),
    status          VARCHAR(16) NOT NULL
        CHECK (status IN ('DRAFT', 'READY', 'ACTIVE', 'DEPRECATED', 'ERROR')),
    owner_module    VARCHAR(128) NOT NULL,
    latest_version  INTEGER NOT NULL DEFAULT 0 CHECK (latest_version >= 0),
    active_version  INTEGER,
    created_by      VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by      VARCHAR(255) NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CHECK (active_version IS NULL OR (active_version > 0 AND active_version <= latest_version))
);

CREATE TABLE service_task_definition_tag (
    definition_id   UUID NOT NULL REFERENCES service_task_definition (id) ON DELETE CASCADE,
    tag             VARCHAR(64) NOT NULL,
    PRIMARY KEY (definition_id, tag)
);

CREATE TABLE service_task_config_version (
    id              UUID PRIMARY KEY,
    definition_id   UUID NOT NULL REFERENCES service_task_definition (id) ON DELETE CASCADE,
    version         INTEGER NOT NULL CHECK (version > 0),
    config_json     JSONB NOT NULL,
    input_mapping   JSONB NOT NULL DEFAULT '[]'::jsonb,
    output_mapping  JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_policy    JSONB NOT NULL,
    status          VARCHAR(16) NOT NULL
        CHECK (status IN ('DRAFT', 'READY', 'ACTIVE', 'ARCHIVED', 'ERROR')),
    change_note     VARCHAR(500) NOT NULL,
    created_by      VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (definition_id, version)
);

CREATE TABLE service_task_binding (
    id                  UUID PRIMARY KEY,
    bpmn_process_id     VARCHAR(255) NOT NULL,
    element_id          VARCHAR(255),
    job_type            VARCHAR(255) NOT NULL,
    definition_id       UUID NOT NULL REFERENCES service_task_definition (id),
    binding_status      VARCHAR(16) NOT NULL
        CHECK (binding_status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    process_code        VARCHAR(64) NOT NULL,
    task_name           VARCHAR(255) NOT NULL,
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    created_by          VARCHAR(255) NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Fail-closed: mỗi (process, element) chỉ được có TỐI ĐA 1 binding ACTIVE tại một thời điểm.
-- Nếu không có ràng buộc này, resolver sẽ phải "chọn đại" khi có 2 binding cùng khớp.
CREATE UNIQUE INDEX uq_service_task_binding_active_element
    ON service_task_binding (bpmn_process_id, element_id)
    WHERE binding_status = 'ACTIVE' AND element_id IS NOT NULL;

-- Binding rộng theo job_type (element_id NULL) — dùng khi 1 cấu hình phục vụ nhiều element.
CREATE UNIQUE INDEX uq_service_task_binding_active_job_type
    ON service_task_binding (job_type)
    WHERE binding_status = 'ACTIVE' AND element_id IS NULL;

CREATE INDEX idx_service_task_binding_lookup
    ON service_task_binding (bpmn_process_id, element_id) WHERE binding_status = 'ACTIVE';
CREATE INDEX idx_service_task_config_version_definition
    ON service_task_config_version (definition_id, version DESC);

-- ─────────────────────────── Seed: Check_ChuTruongTD (RD02.02) ───────────────────────────
-- Đây là service task duy nhất hiện có worker thật (SystemCheckJobWorker.checkChuTruongTapDoan).
-- Seed để seam có dữ liệu thật ngay, không cần màn CRUD mới dùng được.
INSERT INTO service_task_definition
    (id, code, name, description, type_code, status, owner_module,
     latest_version, active_version, created_by, created_at, updated_by, updated_at)
VALUES (
    '0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30',
    'CHECK_CHU_TRUONG_TD',
    'Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
    'Kiểm tra tiền điều kiện BR-RD0202-001 (đã có QĐ phê duyệt chủ trương cấp Tập đoàn từ RD01.02) rồi trả biến điều khiển cho gateway Gateway_BR.',
    'EVALUATE_DECISION', 'ACTIVE', 'RD02',
    1, 1, 'system-seed', now(), 'system-seed', now()
);

INSERT INTO service_task_definition_tag (definition_id, tag) VALUES
    ('0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30', 'rd02'),
    ('0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30', 'precondition'),
    ('0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30', 'br-rd0202-001');

-- stubResult: CHƯA có DMN thật cho tiền điều kiện này (nguồn dữ liệu là RD01.02, mà RD01.02 chưa
-- có BPMN). Giá trị hard-code `true` vốn nằm trong Java nay chuyển ra đây để nhìn thấy được và sửa
-- được mà không build lại. PHẢI bỏ field này khi decisionCode trỏ được vào DMN thật.
INSERT INTO service_task_config_version
    (id, definition_id, version, config_json, input_mapping, output_mapping, error_policy,
     status, change_note, created_by, created_at)
VALUES (
    '7c2f9a41-8d63-4e05-b1a7-3f6e8c0d2b54',
    '0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30',
    1,
    '{"typeCode":"EVALUATE_DECISION","decisionCode":"rd0202-check-chu-truong-td","resultVariable":"dieuKienMacDinhDat","stubResult":true}'::jsonb,
    -- chr(36) = '$'. Dấu đô-la đi liền ngoặc nhọn là cú pháp placeholder của Flyway; gặp là nó fail
    -- lúc parse ("No value provided for placeholder"). Kể cả trong comment cũng bị thay thế, nên cả
    -- file này không được chứa cặp ký tự đó. Nối chuỗi để JSON sinh ra vẫn y hệt.
    ('[{"id":"in-ctrtd-1","target":"maHoSo","expression":"' || chr(36)
        || '{variables.maHoSo}","source":"variables","required":true}]')::jsonb,
    '[{"id":"out-ctrtd-1","sourcePath":"$.decision","target":"variables","targetPath":"dieuKienMacDinhDat"}]'::jsonb,
    '{"timeoutMs":30000,"maxRetry":3,"retryDelayMs":60000,"retryBackoff":"exponential","retryableErrorCodes":["TIMEOUT"],"onFailure":"CREATE_INCIDENT","notifyRoles":["ADMIN","CQ_KHCN_TD"]}'::jsonb,
    'ACTIVE',
    'Seed ban đầu — chuyển hard-code trong SystemCheckJobWorker ra cấu hình.',
    'system-seed', now()
);

INSERT INTO service_task_binding
    (id, bpmn_process_id, element_id, job_type, definition_id, binding_status,
     process_code, task_name, effective_from, created_by, updated_at)
VALUES (
    'b5a83e97-1f42-4c68-8d09-6e5b7a2c4f18',
    'RD02_02', 'Check_ChuTruongTD', 'khcn.rd0202.check-chu-truong-td',
    '0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30', 'ACTIVE',
    'RD02.02', 'Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
    CURRENT_DATE, 'system-seed', now()
);
