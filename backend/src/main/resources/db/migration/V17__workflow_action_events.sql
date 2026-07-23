-- D20 event types emitted by task-centric runtime actions.

ALTER TABLE workflow_event_outbox
    DROP CONSTRAINT IF EXISTS workflow_event_outbox_event_type_check;
ALTER TABLE workflow_event_outbox
    ADD CONSTRAINT workflow_event_outbox_event_type_check CHECK (event_type IN (
        'TASK_CREATED', 'TASK_COMPLETED', 'TASK_ACTION_APPLIED',
        'PROCESS_COMPLETED', 'PROCESS_REJECTED', 'PROCESS_CANCELLED', 'INCIDENT_CREATED'));
