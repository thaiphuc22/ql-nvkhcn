CREATE TABLE action_form_bundle_snapshot (
    id VARCHAR(255) PRIMARY KEY,
    policy_id VARCHAR(128) NOT NULL,
    bundle_version BIGINT NOT NULL,
    config_json TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_action_form_bundle_snapshot UNIQUE (policy_id, bundle_version)
);
