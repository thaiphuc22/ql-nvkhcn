CREATE TABLE bpmn_test_session (
    id UUID PRIMARY KEY,
    draft_id UUID NOT NULL REFERENCES process_definition_draft (id),
    draft_revision BIGINT NOT NULL,
    correlation_id VARCHAR(255) NOT NULL UNIQUE,
    actor VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN
        ('STARTING', 'RUNNING', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'TIMED_OUT', 'FAILED')),
    process_definition_key BIGINT,
    process_instance_key BIGINT,
    initial_variables JSONB NOT NULL,
    failure_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bpmn_test_session_expiry
    ON bpmn_test_session (expires_at) WHERE ended_at IS NULL;
