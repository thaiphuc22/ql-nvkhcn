-- D20: distinguish business rejection from operational cancellation and retain action audit facts.

ALTER TABLE workflow_event_inbox
    DROP CONSTRAINT IF EXISTS workflow_event_inbox_event_type_check;
ALTER TABLE workflow_event_inbox
    ADD CONSTRAINT workflow_event_inbox_event_type_check CHECK (event_type IN (
        'TASK_CREATED', 'TASK_COMPLETED', 'TASK_ACTION_APPLIED',
        'PROCESS_COMPLETED', 'PROCESS_REJECTED', 'PROCESS_CANCELLED', 'INCIDENT_CREATED'));

ALTER TABLE workflow_process_projection
    DROP CONSTRAINT IF EXISTS workflow_process_projection_state_check;
ALTER TABLE workflow_process_projection
    ADD CONSTRAINT workflow_process_projection_state_check
        CHECK (state IN ('ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED'));
