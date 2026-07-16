ALTER TABLE dmn_rule_version
    ADD COLUMN deploy_status VARCHAR(16) NOT NULL DEFAULT 'NOT_DEPLOYED'
        CHECK (deploy_status IN ('NOT_DEPLOYED', 'DEPLOYED', 'FAILED')),
    ADD COLUMN camunda_deployment_key BIGINT,
    ADD COLUMN camunda_decision_key BIGINT,
    ADD COLUMN camunda_decision_id VARCHAR(255),
    ADD COLUMN camunda_decision_version INTEGER,
    ADD COLUMN deployed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN deploy_error TEXT;

ALTER TABLE dmn_rule_version ADD CONSTRAINT chk_dmn_deployment_metadata CHECK (
    (deploy_status = 'DEPLOYED'
        AND camunda_deployment_key IS NOT NULL
        AND camunda_decision_key IS NOT NULL
        AND camunda_decision_id IS NOT NULL
        AND camunda_decision_version IS NOT NULL
        AND deployed_at IS NOT NULL
        AND deploy_error IS NULL)
    OR
    (deploy_status <> 'DEPLOYED'
        AND camunda_deployment_key IS NULL
        AND camunda_decision_key IS NULL
        AND camunda_decision_id IS NULL
        AND camunda_decision_version IS NULL
        AND deployed_at IS NULL)
);
