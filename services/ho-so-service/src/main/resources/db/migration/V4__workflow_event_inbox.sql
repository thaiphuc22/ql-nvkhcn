-- Slice 5 / step 1: durable, idempotent receipt of workflow lifecycle events.

CREATE TABLE workflow_event_inbox (
    event_id UUID PRIMARY KEY,
    event_type VARCHAR(32) NOT NULL CHECK (event_type IN (
        'TASK_CREATED', 'TASK_COMPLETED', 'PROCESS_COMPLETED',
        'PROCESS_CANCELLED', 'INCIDENT_CREATED')),
    payload_hash VARCHAR(64) NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    ho_so_id VARCHAR(128) NOT NULL,
    process_instance_id VARCHAR(32) NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payload_json TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workflow_event_inbox_ho_so
    ON workflow_event_inbox(ho_so_id, occurred_at, event_id);
CREATE INDEX idx_workflow_event_inbox_process
    ON workflow_event_inbox(process_instance_id, occurred_at, event_id);
