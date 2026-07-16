-- Catalog quy trinh va lich su deploy Camunda. BPMN XML duoc luu trong PostgreSQL o lat dev nay
-- de co the xem lai sau restart; production object storage nam ngoai pham vi.

CREATE TABLE process_definition_catalog (
    id                  UUID PRIMARY KEY,
    bpmn_process_id     VARCHAR(255) NOT NULL UNIQUE,
    name                VARCHAR(512) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE process_definition_version (
    id                          UUID PRIMARY KEY,
    catalog_id                  UUID NOT NULL REFERENCES process_definition_catalog (id) ON DELETE CASCADE,
    camunda_version             INTEGER NOT NULL,
    resource_name               VARCHAR(255) NOT NULL,
    checksum_sha256             CHAR(64) NOT NULL,
    camunda_deployment_key      BIGINT NOT NULL,
    camunda_process_definition_key BIGINT NOT NULL UNIQUE,
    status                      VARCHAR(32) NOT NULL CHECK (status IN ('DEPLOYED')),
    imported_by                 VARCHAR(255) NOT NULL,
    imported_at                 TIMESTAMP WITH TIME ZONE NOT NULL,
    bpmn_xml                    TEXT NOT NULL,
    UNIQUE (catalog_id, camunda_version)
);

CREATE INDEX idx_process_definition_version_catalog
    ON process_definition_version (catalog_id, camunda_version DESC);

CREATE TABLE process_definition_warning (
    version_id  UUID NOT NULL REFERENCES process_definition_version (id) ON DELETE CASCADE,
    warning     TEXT NOT NULL,
    PRIMARY KEY (version_id, warning)
);
