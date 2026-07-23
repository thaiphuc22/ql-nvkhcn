-- Slice 4: atomic submit intent + durable HTTP outbox.

ALTER TABLE ho_so DROP CONSTRAINT ho_so_trang_thai_check;
ALTER TABLE ho_so ADD CONSTRAINT ho_so_trang_thai_check CHECK (
    trang_thai IN ('DRAFT', 'START_PENDING', 'START_FAILED', 'PROCESSING',
                    'APPROVED', 'REJECTED', 'CANCELLED'));
ALTER TABLE ho_so ADD COLUMN start_request_id UUID;
ALTER TABLE ho_so ADD COLUMN start_failure VARCHAR(512);
CREATE UNIQUE INDEX uq_ho_so_start_request_id ON ho_so(start_request_id) WHERE start_request_id IS NOT NULL;

CREATE TABLE outbox_event (
    id UUID PRIMARY KEY,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload_json TEXT NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    last_error VARCHAR(512),
    CONSTRAINT fk_outbox_ho_so FOREIGN KEY (aggregate_id) REFERENCES ho_so(id)
);
CREATE INDEX idx_outbox_dispatch ON outbox_event(status, next_attempt_at, created_at);
