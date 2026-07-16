-- DMN management is application data (D3/D5), separate from Camunda deployment state.
-- Each dmn_rule_version row is an immutable artifact; activation only points the rule at one version.
CREATE TABLE dmn_rule (
    id                  UUID PRIMARY KEY,
    code                VARCHAR(128) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         VARCHAR(1000) NOT NULL,
    category            VARCHAR(32) NOT NULL
        CHECK (category IN ('ROUTING', 'CLASSIFICATION', 'THRESHOLD', 'OTHER')),
    status              VARCHAR(16) NOT NULL
        CHECK (status IN ('DRAFT', 'ACTIVE', 'DISABLED')),
    latest_version      INTEGER NOT NULL DEFAULT 0 CHECK (latest_version >= 0),
    active_version      INTEGER,
    created_by          VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by          VARCHAR(255) NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    CHECK (active_version IS NULL OR (active_version > 0 AND active_version <= latest_version))
);

CREATE TABLE dmn_rule_applied_process (
    rule_id             UUID NOT NULL REFERENCES dmn_rule (id) ON DELETE CASCADE,
    bpmn_process_id     VARCHAR(255) NOT NULL,
    PRIMARY KEY (rule_id, bpmn_process_id)
);

CREATE TABLE dmn_rule_version (
    id                  UUID PRIMARY KEY,
    rule_id             UUID NOT NULL REFERENCES dmn_rule (id) ON DELETE CASCADE,
    version             INTEGER NOT NULL CHECK (version > 0),
    dmn_xml             TEXT NOT NULL,
    checksum_sha256     VARCHAR(64) NOT NULL,
    change_note         VARCHAR(500) NOT NULL,
    created_by          VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (rule_id, version)
);

CREATE INDEX idx_dmn_rule_updated_at ON dmn_rule (updated_at DESC);
CREATE INDEX idx_dmn_rule_version_rule ON dmn_rule_version (rule_id, version DESC);

