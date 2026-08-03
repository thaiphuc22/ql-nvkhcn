CREATE TABLE eform_version (
    revision_key VARCHAR(180) PRIMARY KEY,
    form_key VARCHAR(128) NOT NULL,
    version BIGINT NOT NULL,
    ten VARCHAR(255) NOT NULL,
    mo_ta VARCHAR(1000) NOT NULL,
    loai VARCHAR(32),
    schema_json TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_eform_version UNIQUE (form_key, version)
);

CREATE INDEX idx_eform_version_form_key ON eform_version (form_key, version DESC);

INSERT INTO eform_version (
    revision_key, form_key, version, ten, mo_ta, loai, schema_json, created_by, created_at
)
SELECT
    form_key || ':' || version,
    form_key,
    version,
    ten,
    mo_ta,
    loai,
    schema_json,
    updated_by,
    updated_at
FROM eform
ON CONFLICT (form_key, version) DO NOTHING;
