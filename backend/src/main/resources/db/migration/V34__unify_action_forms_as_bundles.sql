INSERT INTO action_form_bundle_item(policy_id, form_key, form_version, display_order, display_title,
        required_item, form_mode, skippable, condition_expression, output_namespace)
SELECT p.id, p.form_key, e.version, 1, NULL, TRUE, 'EDIT', FALSE, NULL, 'form'
FROM action_availability_policy p
JOIN eform e ON e.form_key = p.form_key
WHERE p.form_key IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM action_form_bundle_item i WHERE i.policy_id = p.id);

UPDATE action_form_bundle_item i
SET form_version = e.version
FROM eform e
WHERE i.form_key = e.form_key AND i.form_version IS NULL;

UPDATE action_availability_policy p
SET bundle_display_mode = COALESCE(bundle_display_mode, 'STEPPER'),
    bundle_completion_policy = COALESCE(bundle_completion_policy, 'ALL_REQUIRED_VALID'),
    bundle_version = COALESCE(bundle_version, 1),
    form_key = NULL
WHERE p.form_key IS NOT NULL;
