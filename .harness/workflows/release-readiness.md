# Workflow: Release Readiness

**Owner**: Delivery Manager — runs this checklist, tracks each item, and produces the go/no-go recommendation for the human.

Use this checklist before deploying any release to a production or staging environment.

---

## Pre-Release Gate Checklist

### Code Quality

- [ ] All PRs in this release are approved by Tech Lead Reviewer
- [ ] No open critical or high findings from code review
- [ ] TypeScript: zero errors (`pnpm type-check`)
- [ ] Lint: zero errors (`pnpm lint`)

### Test Results (must be green in CI)

- [ ] Unit tests: all pass
- [ ] Integration tests: all pass
- [ ] Playwright E2E: all pass (zero failures after retries)
- [ ] No tests skipped without documented reason
- [ ] E2E HTML report reviewed — no unexpected warnings

### Database

- [ ] All migrations are applied and tested on staging
- [ ] Migrations are reversible OR a rollback plan is documented
- [ ] No destructive schema changes without data migration plan
- [ ] RLS policies verified on staging database

### Security

- [ ] No new hardcoded credentials
- [ ] Environment variables are set correctly in target environment
- [ ] Secrets rotated if any were accidentally committed
- [ ] File upload validation is in place for any new upload endpoints

### Regulatory / Compliance

- [ ] If an externally-governed export schema changed: the schema version config is updated and verified
- [ ] If regulatory changes affect business logic: rule engine updated and tested
- [ ] Audit log writes are confirmed working for all new mutations
- [ ] Data retention policies unchanged or explicitly reviewed

### Feature Completeness

- [ ] All features in this release have passing E2E tests
- [ ] All acceptance criteria are confirmed by Product Analyst
- [ ] Empty states, error states, and loading states are tested

---

## Staging Verification

After deploying to staging:

1. Run the full Playwright E2E suite against staging: `E2E_BASE_URL=https://staging.example.com pnpm e2e`
2. Manually verify the core user loop: Login → select context → create/ingest a record → process it → review → export

   > **Example (accounting SaaS):** Login → Client select → Upload invoice → Wait for OCR → Reconcile → Export XML
3. Verify audit log entries are created for each step
4. Verify tenant isolation: log in as tenant B, confirm tenant A's data is not visible

---

## Rollback Criteria

Initiate rollback if any of the following occur after deployment:

- E2E tests fail against production/staging
- Tenant isolation breach detected
- Audit log writes are failing
- Export produces output that fails the target schema validation
- Extraction confidence scores are not being stored

Document rollback decisions in an incident report.

---

## Go/No-Go Recommendation

Before requesting human sign-off, the Delivery Manager produces a go/no-go recommendation (see format in `agents/delivery-manager.md`). This recommendation summarises:

- Which features are ready and verified
- Which features are not ready and why
- The recommended decision (GO / NO-GO / DELAY with reason)
- Any open risks that remain after the checklist

The recommendation is a structured input to the human — not the final decision.

---

## Human Sign-Off Required Before Production

- [ ] Delivery Manager has produced a go/no-go recommendation
- [ ] Tech Lead Reviewer has reviewed the release notes
- [ ] Product Analyst has confirmed feature completeness
- [ ] Human stakeholder has approved release timing
- [ ] Rollback plan is understood by the team
