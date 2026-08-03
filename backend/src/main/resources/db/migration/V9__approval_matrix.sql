CREATE TABLE approval_slot (
    code VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    process_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(16) NOT NULL CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE approval_rule (
    id VARCHAR(64) PRIMARY KEY,
    domain_code VARCHAR(32) NOT NULL DEFAULT 'KHCN',
    name VARCHAR(255) NOT NULL,
    slot_code VARCHAR(128) NOT NULL REFERENCES approval_slot(code),
    conditions JSONB NOT NULL,
    assignment JSONB NOT NULL,
    priority INTEGER NOT NULL CHECK (priority >= 0),
    enabled BOOLEAN NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_approval_rule_slot_priority
    ON approval_rule(slot_code, enabled, priority, id);

CREATE TABLE approval_rule_version (
    id UUID PRIMARY KEY,
    rule_id VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL CHECK (version > 0),
    snapshot JSONB NOT NULL,
    change_note VARCHAR(1000) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_approval_rule_version UNIQUE (rule_id, version)
);

CREATE TABLE approval_rule_audit (
    id UUID PRIMARY KEY,
    rule_id VARCHAR(64) NOT NULL,
    action VARCHAR(16) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'TOGGLE')),
    version INTEGER NOT NULL,
    actor VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    detail VARCHAR(1000) NOT NULL
);

CREATE INDEX idx_approval_rule_audit_rule_time
    ON approval_rule_audit(rule_id, timestamp DESC);

INSERT INTO approval_slot(code, name, description, process_groups, status, sort_order, updated_by, updated_at) VALUES
('THAM_DINH', 'Thẩm định hồ sơ (Cơ quan nghiệp vụ)', NULL, '["RD01","RD02","RD05"]', 'active', 10, 'system-seed', '2026-07-16T00:00:00Z'),
('HOI_DONG', 'Phê duyệt Hội đồng KHCN', NULL, '["RD01","RD02","RD05"]', 'active', 20, 'system-seed', '2026-07-16T00:00:00Z'),
('PHE_DUYET', 'Phê duyệt / Ký duyệt (Ban TGĐ)', NULL, '["RD01","RD02","RD05"]', 'active', 30, 'system-seed', '2026-07-16T00:00:00Z'),
('TAI_CHINH_RASOAT', 'Rà soát tài chính', NULL, '[]', 'active', 40, 'system-seed', '2026-07-16T00:00:00Z'),
('PHAP_CHE_RASOAT', 'Rà soát pháp chế', NULL, '[]', 'active', 50, 'system-seed', '2026-07-16T00:00:00Z');

INSERT INTO approval_rule(id, domain_code, name, slot_code, conditions, assignment, priority, enabled,
        version, created_by, created_at, updated_by, updated_at) VALUES
('AM-01', 'KHCN', 'Thẩm định — cấp Cơ sở', 'THAM_DINH',
 '{"kind":"group","logic":"AND","items":[{"kind":"condition","field":"capNhiemVu","operator":"eq","value":"CS"}]}',
 '{"mode":"ANY_ONE","targets":[{"type":"GROUP","roleCodes":["CQ_KHCN"]}]}', 10, true, 1,
 'system-seed', '2026-07-16T00:00:00Z', 'system-seed', '2026-07-16T00:00:00Z'),
('AM-02', 'KHCN', 'Thẩm định — cấp Tập đoàn', 'THAM_DINH',
 '{"kind":"group","logic":"AND","items":[{"kind":"condition","field":"capNhiemVu","operator":"eq","value":"TD"}]}',
 '{"mode":"ANY_ONE","targets":[{"type":"GROUP","roleCodes":["CQ_KHCN_TD"]}]}', 10, true, 1,
 'system-seed', '2026-07-16T00:00:00Z', 'system-seed', '2026-07-16T00:00:00Z'),
('AM-03', 'KHCN', 'Hội đồng — Cơ sở', 'HOI_DONG',
 '{"kind":"group","logic":"AND","items":[{"kind":"condition","field":"loaiHoiDong","operator":"eq","value":"HD_CS"}]}',
 '{"mode":"ALL","targets":[{"type":"GROUP","roleCodes":["HDKHCN"]}]}', 20, true, 1,
 'system-seed', '2026-07-16T00:00:00Z', 'system-seed', '2026-07-16T00:00:00Z'),
('AM-04', 'KHCN', 'Hội đồng — Tập đoàn', 'HOI_DONG',
 '{"kind":"group","logic":"AND","items":[{"kind":"condition","field":"loaiHoiDong","operator":"eq","value":"HD_KHCN_TD"}]}',
 '{"mode":"ALL","targets":[{"type":"GROUP","roleCodes":["HDKHCN_TD"]}]}', 20, true, 1,
 'system-seed', '2026-07-16T00:00:00Z', 'system-seed', '2026-07-16T00:00:00Z'),
('AM-05', 'KHCN', 'Phê duyệt — Tập đoàn, ngân sách > 5 tỷ', 'PHE_DUYET',
 '{"kind":"group","logic":"AND","items":[{"kind":"condition","field":"capNhiemVu","operator":"eq","value":"TD"},{"kind":"condition","field":"tongDuToan","operator":"gte","value":5000000000}]}',
 '{"mode":"ANY_ONE","targets":[{"type":"GROUP","roleCodes":["BTGD_TD"]}]}', 25, true, 1,
 'system-seed', '2026-07-16T00:00:00Z', 'system-seed', '2026-07-16T00:00:00Z'),
('AM-06', 'KHCN', 'Phê duyệt — cấp Cơ sở', 'PHE_DUYET',
 '{"kind":"group","logic":"AND","items":[{"kind":"condition","field":"capNhiemVu","operator":"eq","value":"CS"}]}',
 '{"mode":"ANY_ONE","targets":[{"type":"GROUP","roleCodes":["TGD_VHT"]}]}', 30, true, 1,
 'system-seed', '2026-07-16T00:00:00Z', 'system-seed', '2026-07-16T00:00:00Z'),
('AM-07', 'KHCN', 'Phê duyệt — Tập đoàn (mặc định)', 'PHE_DUYET',
 '{"kind":"group","logic":"AND","items":[{"kind":"condition","field":"capNhiemVu","operator":"eq","value":"TD"}]}',
 '{"mode":"ANY_ONE","targets":[{"type":"GROUP","roleCodes":["CQNV_TD"]}]}', 40, true, 1,
 'system-seed', '2026-07-16T00:00:00Z', 'system-seed', '2026-07-16T00:00:00Z');

INSERT INTO approval_rule_version(id, rule_id, version, snapshot, change_note, created_by, created_at)
SELECT md5('approval-version-' || id)::uuid, id, version,
       jsonb_build_object('id', id, 'domainCode', domain_code, 'ten', name, 'slot', slot_code,
         'conditions', conditions, 'assignment', assignment, 'priority', priority,
         'enabled', enabled, 'version', version, 'updatedAt', updated_at, 'updatedBy', updated_by),
       'Phiên bản khởi tạo.', created_by, created_at
FROM approval_rule;

INSERT INTO approval_rule_audit(id, rule_id, action, version, actor, timestamp, detail)
SELECT md5('approval-audit-' || id)::uuid, id, 'CREATE', version, created_by, created_at,
       'Khởi tạo luật từ dữ liệu seed.'
FROM approval_rule;
