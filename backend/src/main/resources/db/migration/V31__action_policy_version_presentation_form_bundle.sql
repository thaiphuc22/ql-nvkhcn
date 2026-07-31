ALTER TABLE action_availability_policy
    ADD COLUMN process_version INTEGER,
    ADD COLUMN display_label VARCHAR(255),
    ADD COLUMN display_icon VARCHAR(64),
    ADD COLUMN ui_group VARCHAR(16),
    ADD COLUMN tone VARCHAR(16),
    ADD COLUMN help_text VARCHAR(1000),
    ADD COLUMN bundle_display_mode VARCHAR(16),
    ADD COLUMN bundle_allow_draft BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN bundle_completion_policy VARCHAR(32),
    ADD COLUMN bundle_version BIGINT;

CREATE TABLE action_form_bundle_item (
    policy_id VARCHAR(128) NOT NULL REFERENCES action_availability_policy(id) ON DELETE CASCADE,
    form_key VARCHAR(128) NOT NULL REFERENCES eform(form_key),
    form_version BIGINT,
    display_order INTEGER NOT NULL,
    display_title VARCHAR(255),
    required_item BOOLEAN NOT NULL,
    form_mode VARCHAR(8) NOT NULL,
    skippable BOOLEAN NOT NULL,
    condition_expression VARCHAR(1000),
    output_namespace VARCHAR(128) NOT NULL,
    CONSTRAINT uq_action_bundle_order UNIQUE (policy_id, display_order),
    CONSTRAINT uq_action_bundle_namespace UNIQUE (policy_id, output_namespace),
    CONSTRAINT ck_action_bundle_mode CHECK (form_mode IN ('VIEW', 'EDIT'))
);

INSERT INTO action_form_bundle_item(policy_id, form_key, form_version, display_order, display_title,
        required_item, form_mode, skippable, output_namespace)
SELECT id, form_key, NULL, 0, NULL, TRUE, 'EDIT', FALSE, 'form'
FROM action_availability_policy WHERE form_key IS NOT NULL;

UPDATE action_availability_policy
SET bundle_display_mode='STEPPER', bundle_completion_policy='ALL_REQUIRED_VALID', bundle_version=1
WHERE form_key IS NOT NULL;
