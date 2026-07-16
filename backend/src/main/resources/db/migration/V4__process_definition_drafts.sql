-- Mutable BPMN drafts are deliberately separate from immutable deployed versions.
CREATE TABLE process_definition_draft (
    id                  UUID PRIMARY KEY,
    resource_name       VARCHAR(255) NOT NULL,
    bpmn_process_id     VARCHAR(255) NOT NULL,
    name                VARCHAR(512) NOT NULL,
    bpmn_xml            TEXT NOT NULL,
    checksum_sha256     VARCHAR(64) NOT NULL,
    status              VARCHAR(32) NOT NULL CHECK (status IN ('DRAFT', 'VALID', 'INVALID', 'DEPLOYED')),
    revision            BIGINT NOT NULL,
    created_by          VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by          VARCHAR(255) NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    validated_at        TIMESTAMP WITH TIME ZONE,
    deployed_version_id UUID REFERENCES process_definition_version (id)
);

CREATE TABLE process_definition_draft_revision (
    id              UUID PRIMARY KEY,
    draft_id        UUID NOT NULL REFERENCES process_definition_draft (id) ON DELETE CASCADE,
    revision        BIGINT NOT NULL,
    resource_name   VARCHAR(255) NOT NULL,
    bpmn_process_id VARCHAR(255) NOT NULL,
    name            VARCHAR(512) NOT NULL,
    bpmn_xml        TEXT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    status          VARCHAR(32) NOT NULL CHECK (status IN ('DRAFT', 'VALID', 'INVALID', 'DEPLOYED')),
    actor           VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (draft_id, revision)
);

CREATE INDEX idx_process_definition_draft_revision
    ON process_definition_draft_revision (draft_id, revision DESC);
