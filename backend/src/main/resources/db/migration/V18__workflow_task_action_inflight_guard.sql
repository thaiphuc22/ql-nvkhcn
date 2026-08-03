-- Only one independently keyed command may be in flight for a Camunda user task.
-- Idempotent retries of that command reuse request_id and do not insert a second row.
CREATE UNIQUE INDEX uq_workflow_action_task_inflight
    ON workflow_action_inbox(task_key)
    WHERE status IN ('RECEIVED', 'UNKNOWN');
