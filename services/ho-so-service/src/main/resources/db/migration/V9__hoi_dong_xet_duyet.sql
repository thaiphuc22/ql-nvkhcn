-- Hội đồng xét duyệt (HĐXD) sinh tự động ngay sau khi QĐ thành lập được ký, đọc từ formData
-- đã lưu ở dossier_step (V8). Ràng buộc duy nhất theo (ho_so_id, cap, source_task_definition_key)
-- để service task "Generate_HDXD" idempotent khi Zeebe retry job.

CREATE TABLE hoi_dong_xet_duyet (
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ho_so_id                    VARCHAR(32) NOT NULL REFERENCES ho_so (id) ON DELETE CASCADE,
    cap                         VARCHAR(16) NOT NULL CHECK (cap IN ('CO_SO', 'TAP_DOAN')),
    source_task_definition_key  VARCHAR(64) NOT NULL,
    can_cu_phap_ly              TEXT,
    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX uk_hoi_dong_xet_duyet_ho_so_cap_task
    ON hoi_dong_xet_duyet (ho_so_id, cap, source_task_definition_key);

CREATE TABLE hoi_dong_thanh_vien (
    id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hoi_dong_id            BIGINT NOT NULL REFERENCES hoi_dong_xet_duyet (id) ON DELETE CASCADE,
    ho_ten                 VARCHAR(255) NOT NULL,
    vai_tro_trong_hoi_dong VARCHAR(255)
);

CREATE INDEX idx_hoi_dong_thanh_vien_hoi_dong_id ON hoi_dong_thanh_vien (hoi_dong_id);
