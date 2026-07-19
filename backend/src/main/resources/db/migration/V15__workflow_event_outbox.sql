-- Slice 5 / step 1: lifecycle events observed from Camunda and delivered durably.

CREATE TABLE workflow_event_outbox (
    event_id UUID PRIMARY KEY,
    source_key VARCHAR(160) NOT NULL UNIQUE,
    event_type VARCHAR(32) NOT NULL CHECK (event_type IN (
        'TASK_CREATED', 'TASK_COMPLETED', 'PROCESS_COMPLETED',
        'PROCESS_CANCELLED', 'INCIDENT_CREATED')),
    correlation_id VARCHAR(128) NOT NULL,
    ho_so_id VARCHAR(128) NOT NULL,
    process_instance_id VARCHAR(32) NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payload_json TEXT NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    last_error VARCHAR(512)
);
CREATE INDEX idx_workflow_event_dispatch
    ON workflow_event_outbox(status, next_attempt_at, created_at);
CREATE INDEX idx_workflow_event_process
    ON workflow_event_outbox(process_instance_id, occurred_at, event_id);
