-- bpmn_test_session rows are ephemeral test-run records tied to a draft; they must not block
-- deleting the draft they reference (was a plain FK with no ON DELETE action).
ALTER TABLE bpmn_test_session DROP CONSTRAINT bpmn_test_session_draft_id_fkey;
ALTER TABLE bpmn_test_session ADD CONSTRAINT bpmn_test_session_draft_id_fkey
    FOREIGN KEY (draft_id) REFERENCES process_definition_draft (id) ON DELETE CASCADE;
