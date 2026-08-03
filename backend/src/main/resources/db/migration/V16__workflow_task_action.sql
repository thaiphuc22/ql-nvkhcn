-- D20: idempotent, task-centric runtime actions owned by the workflow service.

CREATE TABLE workflow_action_inbox (
    request_id UUID PRIMARY KEY,
    payload_hash VARCHAR(64) NOT NULL,
    payload_json TEXT NOT NULL,
    task_key VARCHAR(32) NOT NULL,
    task_definition_key VARCHAR(128),
    process_instance_id VARCHAR(32),
    ho_so_id VARCHAR(128),
    action_code VARCHAR(64) NOT NULL,
    actor_id VARCHAR(128) NOT NULL,
    comment_text TEXT,
    form_data_json TEXT NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('RECEIVED', 'UNKNOWN', 'COMPLETED', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    error_code VARCHAR(64),
    error_message VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflow_action_task_status
    ON workflow_action_inbox(task_key, status, created_at);
CREATE INDEX idx_workflow_action_process
    ON workflow_action_inbox(process_instance_id, action_code, status);
