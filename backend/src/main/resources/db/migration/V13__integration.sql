-- Backend cho màn Tích hợp (`/tich-hop`, Angular): đăng ký hệ tích hợp ngoài (Seam B, xem
-- data/camundaOps.ts gốc), job run gần đây (đọc-chỉ, phục vụ drawer chi tiết) và cấu hình
-- mapping dữ liệu QTKHCN <-> hệ ngoài (data/integrationMapping.ts gốc).
--
-- api_key không lưu plaintext: chỉ lưu SHA-256 hash (api_key_hash) + 4 ký tự cuối hiển thị
-- (api_key_tail) — khớp UI React "Key được mã hoá khi lưu; màn hình chỉ hiển thị 4 ký tự
-- cuối" và không cần giải mã lại (không có luồng nào hiển thị lại full key).

CREATE TABLE integration_system (
    system_key VARCHAR(32) PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    mo_ta VARCHAR(1000) NOT NULL,
    giao_thuc VARCHAR(64) NOT NULL,
    kieu VARCHAR(32) NOT NULL CHECK (kieu IN ('connector', 'job-worker', 'idp')),
    sync_mode VARCHAR(16) NOT NULL CHECK (sync_mode IN ('realtime', 'batch')),
    trang_thai VARCHAR(16) NOT NULL CHECK (trang_thai IN ('healthy', 'degraded', 'down')),
    lan_dong_bo_cuoi VARCHAR(32),
    ban_ghi_24h INT NOT NULL DEFAULT 0,
    loi_24h INT NOT NULL DEFAULT 0,
    do_tre_ms INT NOT NULL DEFAULT 0,
    hang_doi INT NOT NULL DEFAULT 0,
    endpoint VARCHAR(500) NOT NULL,
    api_key_hash VARCHAR(128),
    api_key_tail VARCHAR(8),
    ref VARCHAR(255) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE integration_job_run (
    id VARCHAR(32) PRIMARY KEY,
    job_type VARCHAR(128) NOT NULL,
    system_key VARCHAR(32) NOT NULL REFERENCES integration_system (system_key),
    ma_ho_so VARCHAR(32) NOT NULL,
    thoi_diem VARCHAR(32) NOT NULL,
    ket_qua VARCHAR(16) NOT NULL CHECK (ket_qua IN ('success', 'retry', 'failed')),
    retries INT NOT NULL DEFAULT 0,
    thong_diep VARCHAR(500) NOT NULL
);

CREATE INDEX idx_integration_job_run_system_key ON integration_job_run (system_key);

CREATE TABLE integration_mapping (
    id VARCHAR(64) PRIMARY KEY,
    system_key VARCHAR(32) NOT NULL REFERENCES integration_system (system_key),
    doi_tuong VARCHAR(32) NOT NULL CHECK (doi_tuong IN ('HoSo', 'NhiemVu', 'DuToan', 'NhanSu', 'TaiSan')),
    chieu VARCHAR(8) NOT NULL CHECK (chieu IN ('out', 'in')),
    trang_thai VARCHAR(16) NOT NULL CHECK (trang_thai IN ('draft', 'ready', 'active', 'deprecated', 'error')),
    cap_nhat_luc VARCHAR(32) NOT NULL,
    cap_nhat_boi VARCHAR(255) NOT NULL,
    fields_json TEXT NOT NULL,
    job_type VARCHAR(128),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_integration_mapping_system_key ON integration_mapping (system_key);

-- Seed đúng theo webapp/src/data/camundaOps.ts::seedIntegrations (6 hệ) — chưa hệ nào có
-- api_key thật nên api_key_hash/tail để NULL, trừ các hệ React seed sẵn apiKeyTail hiển thị
-- (không có hash gốc để tái tạo — coi như đã "kết nối trước đó", tail giữ nguyên cho UI khớp
-- mock cũ, hash để NULL vì không có giá trị gốc để hash).
INSERT INTO integration_system
    (system_key, ten, mo_ta, giao_thuc, kieu, sync_mode, trang_thai, lan_dong_bo_cuoi,
     ban_ghi_24h, loi_24h, do_tre_ms, hang_doi, endpoint, api_key_hash, api_key_tail, ref,
     version, updated_by, updated_at, created_at)
VALUES
    ('QLNS', 'Quản lý Nhân sự (QLNS)', 'Đồng bộ danh sách nhân sự & chi phí lương (PL1).',
     'REST/JSON', 'connector', 'realtime', 'healthy', '03/07/2026 08:15',
     1284, 0, 210, 0, 'https://qlns.vht.vn/api/v1', NULL, 'NS81', 'RD03.01 · NFR-INT-001',
     0, 'system', '2026-07-03T08:15:00+07:00', '2026-07-03T08:15:00+07:00'),
    ('MS', 'Mua sắm (MS)', 'Cấu trúc sản phẩm, tờ trình/gói thầu/hợp đồng (PL2–PL5).',
     'REST/JSON', 'connector', 'realtime', 'healthy', '03/07/2026 08:02',
     356, 2, 340, 1, 'https://ms.vht.vn/api/v1', NULL, 'MS27', 'RD03.02 · NFR-INT-001',
     0, 'system', '2026-07-03T08:02:00+07:00', '2026-07-03T08:02:00+07:00'),
    ('SAP', 'SAP (Tài chính – chi phí)', 'Kinh phí thực hiện/quyết toán theo PL1–PL6.',
     'SOAP/OData', 'job-worker', 'batch', 'down', '02/07/2026 14:05',
     0, 18, 0, 7, 'https://sap-gw.vht.vn/odata/v2', NULL, NULL, 'RD03.03 · NFR-INT-001',
     0, 'system', '2026-07-02T14:05:00+07:00', '2026-07-02T14:05:00+07:00'),
    ('QLTS', 'Quản lý Tài sản (QLTS)', 'Tài sản hình thành từ đề tài, bàn giao sau nghiệm thu.',
     'REST/JSON', 'job-worker', 'batch', 'healthy', '03/07/2026 06:00',
     92, 0, 180, 0, 'https://qlts.vht.vn/api/v1', NULL, 'TS40', 'RD06 · NFR-INT-001',
     0, 'system', '2026-07-03T06:00:00+07:00', '2026-07-03T06:00:00+07:00'),
    ('PLM', 'PLM (Quản lý vòng đời sản phẩm)', 'Cấu trúc sản phẩm/tài liệu kỹ thuật của đề tài.',
     'REST/JSON', 'connector', 'realtime', 'degraded', '03/07/2026 07:48',
     214, 6, 1250, 3, 'https://plm.vht.vn/api/v2', NULL, 'PL9C', 'RD03 · NFR-INT-001',
     0, 'system', '2026-07-03T07:48:00+07:00', '2026-07-03T07:48:00+07:00'),
    ('IAM', 'SSO/IAM (Định danh tập trung)', 'Ánh xạ user/nhóm ↔ Camunda Identity; đăng nhập một lần.',
     'OIDC', 'idp', 'realtime', 'healthy', '03/07/2026 08:20',
     640, 0, 95, 0, 'https://sso.vht.vn/oidc', NULL, 'IA55', 'OQ-021 · REQ-ENG-004',
     0, 'system', '2026-07-03T08:20:00+07:00', '2026-07-03T08:20:00+07:00');

-- Seed đúng theo webapp/src/data/camundaOps.ts::seedJobRuns.
INSERT INTO integration_job_run (id, job_type, system_key, ma_ho_so, thoi_diem, ket_qua, retries, thong_diep)
VALUES
    ('j-9001', 'sap:sync-budget', 'SAP', 'HS-2026-033', '02/07/2026 14:06', 'failed', 0, 'HTTP 504 timeout — tạo incident'),
    ('j-9002', 'plm:pull-structure', 'PLM', 'HS-2026-030', '03/07/2026 07:48', 'retry', 2, 'Độ trễ cao 1.25s, thử lại lần 2'),
    ('j-9003', 'qlns:sync-staff', 'QLNS', 'HS-2026-018', '03/07/2026 08:15', 'success', 3, 'Đồng bộ 12 nhân sự (PL1)'),
    ('j-9004', 'ms:pull-contract', 'MS', 'HS-2026-025', '03/07/2026 08:02', 'success', 3, 'Lấy 1 hợp đồng (PL4)'),
    ('j-9005', 'iam:resolve-group', 'IAM', 'HS-2026-035', '03/07/2026 08:20', 'success', 3, 'Giải nhóm HĐ Nghiệm thu (5 thành viên)'),
    ('j-9006', 'ms:pull-contract', 'MS', 'HS-2026-027', '02/07/2026 22:14', 'retry', 1, 'Lỗi mạng tạm thời, thử lại');

-- Seed đúng theo webapp/src/data/integrationMapping.ts::seedMappingConfigs (3 mapping mẫu).
INSERT INTO integration_mapping (id, system_key, doi_tuong, chieu, trang_thai, cap_nhat_luc, cap_nhat_boi, fields_json, job_type, version, created_at)
VALUES
    ('map-sap-dutoan', 'SAP', 'DuToan', 'out', 'active', '2026-07-08 09:10', 'admin',
     '[{"id":"f-sap-1","truongQTKHCN":"ma","kieuDuLieu":"string","truongHeNgoai":"taskCode","batBuoc":true,"khoaDinhDanh":true},{"id":"f-sap-2","truongQTKHCN":"duToan","kieuDuLieu":"string","truongHeNgoai":"budgetAmount","batBuoc":true},{"id":"f-sap-3","truongQTKHCN":"giaiDoan","kieuDuLieu":"enum","truongHeNgoai":"syncStage","batBuoc":true,"transform":"enum-map","valueMappings":[{"qtkhcn":"chu_truong","heNgoai":"PLANNING"},{"qtkhcn":"xet_duyet","heNgoai":"REVIEW"},{"qtkhcn":"thuc_hien","heNgoai":"EXECUTION"},{"qtkhcn":"dieu_chinh","heNgoai":"ADJUST"},{"qtkhcn":"nghiem_thu","heNgoai":"ACCEPTANCE"},{"qtkhcn":"quyet_toan","heNgoai":"SETTLEMENT"}]}]',
     'sap:sync-budget', 0, '2026-07-08T09:10:00+07:00'),
    ('map-qlns-nhansu', 'QLNS', 'NhanSu', 'out', 'active', '2026-07-08 08:05', 'admin',
     '[{"id":"f-ns-1","truongQTKHCN":"maNhanVien","kieuDuLieu":"string","truongHeNgoai":"employeeId","batBuoc":true,"khoaDinhDanh":true},{"id":"f-ns-2","truongQTKHCN":"hoTen","kieuDuLieu":"string","truongHeNgoai":"fullName","batBuoc":true},{"id":"f-ns-3","truongQTKHCN":"email","kieuDuLieu":"string","truongHeNgoai":"email","batBuoc":false,"transform":"default-value","giaTriMacDinh":"(chưa có email)"},{"id":"f-ns-4","truongQTKHCN":"donViCongTac","kieuDuLieu":"string","truongHeNgoai":"orgUnit","batBuoc":false}]',
     'qlns:sync-staff', 0, '2026-07-08T08:05:00+07:00'),
    ('map-ms-hoso-draft', 'MS', 'HoSo', 'out', 'draft', '2026-07-08 07:40', 'admin',
     '[{"id":"f-hs-1","truongQTKHCN":"id","kieuDuLieu":"string","truongHeNgoai":"dossierCode","batBuoc":true,"khoaDinhDanh":true},{"id":"f-hs-2","truongQTKHCN":"trangThai","kieuDuLieu":"enum","truongHeNgoai":"","batBuoc":true,"transform":"enum-map","valueMappings":[{"qtkhcn":"draft","heNgoai":"DRAFT"},{"qtkhcn":"processing","heNgoai":"IN_REVIEW"},{"qtkhcn":"approved","heNgoai":"DA_DUYET"},{"qtkhcn":"rejected","heNgoai":"TU_CHOI"}]}]',
     NULL, 0, '2026-07-08T07:40:00+07:00');
