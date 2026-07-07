# Workflow: E2E Test Design

Use this workflow when designing new Playwright test coverage for a feature or filling gaps in existing coverage.

---

## Step 1 — Gather Inputs

QA Agent collects:
- Acceptance criteria from the feature plan
- E2E scenario candidates identified by Product Analyst
- API contracts from Solution Architect
- Interaction notes from Frontend Developer (timing, async behavior, selector availability)

Do not begin designing tests until you have the acceptance criteria. Tests without acceptance criteria are testing the wrong thing.

---

## Step 2 — Write the Test Plan

Using `templates/e2e-test-plan.md`, document:

1. **Scope**: which user workflows are covered by this test plan
2. **Out of scope**: what is explicitly not tested here and why
3. **Scenarios**: for each scenario, document:
   - Actor (which role)
   - Precondition (what state the system must be in)
   - Steps (user actions)
   - Expected outcome (observable, assertable result)
   - Test type (happy path / failure path / permission)
   - Data requirements
4. **Selector requirements**: which elements need `data-testid` added by Frontend Developer
5. **Seed requirements**: what database state Backend Developer needs to create

---

## Step 3 — Review the Test Plan

- **Product Analyst** confirms: do the scenarios cover the acceptance criteria?
- **Tech Lead Reviewer** confirms: are failure paths included? RBAC tested? Is this deep enough?

The test plan must be approved before tests are written.

---

## Step 4 — Implement Tests

QA Agent implements Playwright tests:

1. Create Page Object Models in `apps/e2e/pages/` for new screens.
2. Write test files in the appropriate `apps/e2e/tests/` subfolder.
3. Use API calls in `beforeAll`/`beforeEach` to set up test data — not UI navigation.
4. Use storage state for auth (see auth strategy in `agents/qa-e2e-tester.md`).
5. Follow selector strategy (see `rules/e2e-testing-policy.md`).
6. Every test cleans up after itself or uses isolated data.

---

## Step 5 — Run and Validate

```bash
pnpm e2e                          # all tests
pnpm e2e -- --grep "checkout"     # just this area
pnpm e2e:ui                       # Playwright UI for interactive debugging
```

1. All new tests pass locally.
2. All existing tests still pass (no regressions).
3. Run with `--trace on` for any test that needed debugging.

---

## Step 6 — Coverage Review

Tech Lead Reviewer checks:
- Happy path covered
- At least one failure path covered per critical operation
- RBAC scenario covered (unauthorized user cannot perform the action)
- Test data is isolated (test works on a clean database)
- No `waitForTimeout`, no fragile selectors

Issue approval once coverage is satisfactory.

---

## Identifying Gaps in Existing Coverage

When reviewing existing E2E tests, flag a gap when:
- An acceptance criterion has no corresponding test assertion
- A failure path exists in the implementation but has no E2E test
- A new RBAC role was added but existing tests only cover one role
- A new API error code was added but no test exercises it

File gap reports as issues. Address gaps within the sprint they are found.
