-- QTKHCN domain DB — core schema (D8: NhiemVu/HoSo tách biệt, 1-N).
-- Port trực tiếp từ shape đã duyệt qua mock: webapp/src/data/nhiemVu.ts, dossiers.ts.
-- Chạy trên PostgreSQL domain DB riêng (D15) — KHÔNG chung schema với storage nội bộ của Camunda.

CREATE TABLE nhiem_vu (
    ma                          VARCHAR(32) PRIMARY KEY,
    ten                         VARCHAR(512) NOT NULL,
    cap                         VARCHAR(8) NOT NULL CHECK (cap IN ('CS', 'TD')),
    chu_nhiem_ho_ten            VARCHAR(255) NOT NULL,
    chu_nhiem_hoc_ham_hoc_vi    VARCHAR(32),
    chu_nhiem_ma_nhan_vien      VARCHAR(32),
    chu_nhiem_email             VARCHAR(255),
    chu_nhiem_sdt               VARCHAR(32),
    chu_nhiem_don_vi_cong_tac   VARCHAR(255),
    don_vi_chu_tri              VARCHAR(255) NOT NULL,
    thoi_gian_thuc_hien         VARCHAR(64),
    du_toan                     VARCHAR(64),
    giai_doan                   VARCHAR(16) NOT NULL
        CHECK (giai_doan IN ('CHU_TRUONG', 'XET_DUYET', 'THUC_HIEN', 'DIEU_CHINH', 'NGHIEM_THU', 'QUYET_TOAN'))
);

CREATE TABLE ho_so (
    id                            VARCHAR(32) PRIMARY KEY,
    ma_nv                         VARCHAR(32) NOT NULL REFERENCES nhiem_vu (ma),
    loai                          VARCHAR(16) NOT NULL
        CHECK (loai IN ('CHU_TRUONG', 'XET_DUYET', 'BAO_CAO', 'DIEU_CHINH', 'NGHIEM_THU', 'QUYET_TOAN')),
    quy_trinh                     VARCHAR(32),
    quy_trinh_ten                 VARCHAR(255),
    nguoi_khoi_tao                VARCHAR(255) NOT NULL,
    ngay_tao                      DATE NOT NULL,
    trang_thai                    VARCHAR(16) NOT NULL DEFAULT 'DRAFT'
        CHECK (trang_thai IN ('DRAFT', 'PROCESSING', 'APPROVED', 'REJECTED')),
    buoc_hien_tai                 INTEGER NOT NULL DEFAULT 0,
    zeebe_process_instance_key    BIGINT
);

CREATE INDEX idx_ho_so_ma_nv ON ho_so (ma_nv);
CREATE INDEX idx_ho_so_trang_thai ON ho_so (trang_thai);

CREATE TABLE dossier_step (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ho_so_id              VARCHAR(32) NOT NULL REFERENCES ho_so (id) ON DELETE CASCADE,
    buoc_index            INTEGER NOT NULL,
    task_definition_key   VARCHAR(64),
    ten                   VARCHAR(255) NOT NULL,
    vai_tro               VARCHAR(255),
    nguoi                 VARCHAR(255),
    trang_thai            VARCHAR(16) NOT NULL
        CHECK (trang_thai IN ('DONE', 'CURRENT', 'PENDING', 'REJECTED')),
    thoi_diem             VARCHAR(32),
    y_kien                TEXT,
    han_xu_ly             VARCHAR(32),
    form_key              VARCHAR(64)
);

CREATE INDEX idx_dossier_step_ho_so_id ON dossier_step (ho_so_id);

-- vaiTroCodes: string[] (D9 — fail-closed, rỗng = chỉ admin xử lý được).
CREATE TABLE dossier_step_code (
    dossier_step_id   BIGINT NOT NULL REFERENCES dossier_step (id) ON DELETE CASCADE,
    code              VARCHAR(32) NOT NULL
);

CREATE INDEX idx_dossier_step_code_step_id ON dossier_step_code (dossier_step_id);

-- taiLieu: { ten, loai }[] embeddable.
CREATE TABLE ho_so_tai_lieu (
    ho_so_id   VARCHAR(32) NOT NULL REFERENCES ho_so (id) ON DELETE CASCADE,
    ten        VARCHAR(255) NOT NULL,
    loai       VARCHAR(32) NOT NULL
);

CREATE INDEX idx_ho_so_tai_lieu_ho_so_id ON ho_so_tai_lieu (ho_so_id);
