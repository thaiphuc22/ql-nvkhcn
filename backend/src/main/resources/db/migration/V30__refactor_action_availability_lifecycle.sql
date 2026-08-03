ALTER TABLE action_availability_policy
    ADD COLUMN lifecycle_status VARCHAR(16);

UPDATE action_availability_policy
SET lifecycle_status = CASE WHEN enabled THEN 'ACTIVE' ELSE 'DISABLED' END;

ALTER TABLE action_availability_policy
    ALTER COLUMN lifecycle_status SET NOT NULL,
    ADD CONSTRAINT chk_action_availability_lifecycle
        CHECK (lifecycle_status IN ('DRAFT', 'ACTIVE', 'DISABLED', 'INVALID')),
    DROP COLUMN enabled;

DROP TABLE action_availability_permission;

-- PostgreSQL tự loại index cũ khi cột enabled bị drop; IF EXISTS giữ migration chạy được
-- nhất quán trên cả database mới và database đã qua các biến thể schema trước đây.
DROP INDEX IF EXISTS idx_action_availability_match;
CREATE INDEX idx_action_availability_match ON action_availability_policy
    (action_code, lifecycle_status, surface, process_code, task_definition_key, dossier_status);
