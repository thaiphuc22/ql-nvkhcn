# Workflow: Bug Fix

Use this workflow for diagnosing and fixing defects in production or pre-production.

---

## Step 1 — Triage

**Owner**: Tech Lead Reviewer (or whoever discovers the bug)

1. Reproduce the bug with a minimal reproduction case.
2. Classify severity:
   - **Critical**: data loss, tenant isolation breach, regulatory compliance failure, production down
   - **High**: a core user workflow broken (such as data ingestion, processing, or export)
   - **Medium**: secondary feature broken, workaround exists
   - **Low**: visual/UX issue, edge case
3. For **Critical** severity: immediately notify human stakeholders. Do not wait for the workflow.

---

## Step 2 — Root Cause Analysis

**Owner**: Backend or Frontend Developer (whichever layer is affected)

1. Identify the failing code path.
2. Write a failing test that reproduces the bug — preferably a Playwright E2E test if the bug is in a user workflow, or a unit/integration test if the bug is in business logic.
3. The failing test is committed before the fix. This proves the bug exists and the fix addresses it.

---

## Step 3 — Fix

**Owner**: Developer

1. Implement the fix.
2. Verify the previously failing test now passes.
3. Verify no existing tests regress (run the full test suite).

---

## Step 4 — Review

**Owner**: Tech Lead Reviewer

1. Review the fix against the bug report.
2. Verify a regression test is included.
3. For Critical/High bugs: verify root cause is addressed, not just the symptom.
4. Issue approval or changes required.

---

## Step 5 — Regression Check

**Owner**: QA Agent

1. Run the full Playwright E2E suite.
2. Confirm the new regression test is in place.
3. Sign off that the fix does not break the core user loop.

---

## Tenant Isolation Breach (Special Case)

If the bug involves one tenant accessing another tenant's data:

1. **Immediate**: escalate to human — this may require incident management.
2. **Audit**: run audit log query to determine scope of data exposure.
3. **Patch**: fix tenant isolation first; all other work pauses.
4. **Notify**: affected tenants must be notified per data protection requirements.
5. **Post-mortem**: required before resuming normal feature work.
