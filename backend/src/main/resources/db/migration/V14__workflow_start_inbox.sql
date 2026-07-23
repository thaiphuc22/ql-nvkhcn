-- Slice 4: idempotent start-process inbox and durable process mapping.

CREATE TABLE workflow_start_inbox (
    request_id UUID PRIMARY KEY,
    payload_hash VARCHAR(64) NOT NULL,
    payload_json TEXT NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('RECEIVED', 'UNKNOWN', 'STARTED', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    process_instance_id VARCHAR(32),
    process_definition_id VARCHAR(255),
    process_version INTEGER,
    error_code VARCHAR(64),
    error_message VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_process_mapping (
    request_id UUID PRIMARY KEY REFERENCES workflow_start_inbox(request_id),
    business_key VARCHAR(255) NOT NULL,
    ho_so_id VARCHAR(128) NOT NULL,
    nhiem_vu_id VARCHAR(128) NOT NULL,
    process_instance_id VARCHAR(32) NOT NULL UNIQUE,
    process_definition_id VARCHAR(255) NOT NULL,
    process_version INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workflow_mapping_ho_so ON workflow_process_mapping(ho_so_id);
