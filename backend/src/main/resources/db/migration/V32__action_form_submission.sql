CREATE TABLE action_form_submission (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL,
    dossier_id VARCHAR(128) NOT NULL,
    task_key VARCHAR(128) NOT NULL,
    task_definition_key VARCHAR(128) NOT NULL,
    policy_id VARCHAR(128) NOT NULL,
    bundle_version BIGINT NOT NULL,
    form_key VARCHAR(128) NOT NULL,
    form_version BIGINT,
    output_namespace VARCHAR(128) NOT NULL,
    action_code VARCHAR(64) NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    data_json TEXT NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_action_form_submission_request_namespace UNIQUE (request_id, output_namespace)
);

CREATE INDEX idx_action_form_submission_dossier_task
    ON action_form_submission (dossier_id, task_definition_key, created_at);
