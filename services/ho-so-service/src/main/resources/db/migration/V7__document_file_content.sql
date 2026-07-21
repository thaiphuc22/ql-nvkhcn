-- Store file metadata in PostgreSQL; binary content is kept in the configured document store.
ALTER TABLE ho_so_tai_lieu ADD COLUMN content_type VARCHAR(255);
ALTER TABLE ho_so_tai_lieu ADD COLUMN size_bytes BIGINT;
ALTER TABLE ho_so_tai_lieu ADD COLUMN storage_key VARCHAR(64);
ALTER TABLE ho_so_tai_lieu ADD COLUMN uploaded_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE ho_so_tai_lieu
    ADD CONSTRAINT ck_ho_so_tai_lieu_size_non_negative
        CHECK (size_bytes IS NULL OR size_bytes >= 0);

CREATE UNIQUE INDEX uk_ho_so_tai_lieu_storage_key
    ON ho_so_tai_lieu (storage_key)
    WHERE storage_key IS NOT NULL;
