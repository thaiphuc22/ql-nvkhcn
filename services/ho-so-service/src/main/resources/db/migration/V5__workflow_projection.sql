-- Slice 5 / step 2: rebuildable task/process projections owned by Ho So service.

ALTER TABLE workflow_event_inbox
    ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN processing_error VARCHAR(512);

CREATE INDEX idx_workflow_event_inbox_unprocessed
    ON workflow_event_inbox(received_at, event_id)
    WHERE processed_at IS NULL;

CREATE TABLE workflow_process_projection (
    process_instance_id VARCHAR(32) PRIMARY KEY,
    ho_so_id VARCHAR(32) NOT NULL REFERENCES ho_so(id),
    state VARCHAR(16) NOT NULL CHECK (state IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    last_event_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_incident_key VARCHAR(32),
    last_incident_message VARCHAR(512),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX uq_workflow_process_projection_ho_so
    ON workflow_process_projection(ho_so_id);

CREATE TABLE workflow_task_projection (
    task_key VARCHAR(32) PRIMARY KEY,
    ho_so_id VARCHAR(32) NOT NULL REFERENCES ho_so(id),
    process_instance_id VARCHAR(32) NOT NULL,
    task_definition_key VARCHAR(128) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    state VARCHAR(16) NOT NULL CHECK (state IN ('ACTIVE', 'COMPLETED')),
    assignee VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_at TIMESTAMP WITH TIME ZONE,
    form_key VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_workflow_task_projection_ho_so
    ON workflow_task_projection(ho_so_id, state, created_at);
CREATE INDEX idx_workflow_task_projection_process
    ON workflow_task_projection(process_instance_id, state);

CREATE TABLE workflow_task_candidate_user (
    task_key VARCHAR(32) NOT NULL REFERENCES workflow_task_projection(task_key) ON DELETE CASCADE,
    code VARCHAR(128) NOT NULL,
    PRIMARY KEY (task_key, code)
);
CREATE INDEX idx_workflow_task_candidate_user_code
    ON workflow_task_candidate_user(code, task_key);

CREATE TABLE workflow_task_candidate_group (
    task_key VARCHAR(32) NOT NULL REFERENCES workflow_task_projection(task_key) ON DELETE CASCADE,
    code VARCHAR(128) NOT NULL,
    PRIMARY KEY (task_key, code)
);
CREATE INDEX idx_workflow_task_candidate_group_code
    ON workflow_task_candidate_group(code, task_key);
