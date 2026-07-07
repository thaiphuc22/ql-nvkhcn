# Test Review Template

Use this to review the quality of E2E and unit/integration tests in a PR. Fill each section. Issue a decision.

---

## PR Reference

- **PR**: #
- **Feature**:
- **Reviewer**: Tech Lead Reviewer
- **Date**:

---

## Acceptance Criteria Coverage

Map each acceptance criterion to a test. Flag any criterion with no corresponding test.

| Acceptance Criterion | Test File | Test Name | Covered? |
|---|---|---|---|
| AC-1 | | | Yes / No |
| AC-2 | | | Yes / No |

---

## E2E Test Quality Checklist

### Structure and Organization

- [ ] Tests are in the correct `tests/` subfolder
- [ ] Page Object Models are used for complex screens
- [ ] Test file name reflects what is being tested

### Selectors

- [ ] Uses `getByRole`, `getByLabel`, `getByText` where possible
- [ ] `data-testid` used only when semantic selectors are insufficient
- [ ] No CSS class selectors
- [ ] No nth-child or index-based selectors

### Waiting

- [ ] No `page.waitForTimeout()` calls
- [ ] Async operations use `waitFor` with appropriate timeout
- [ ] Timeout values are documented where non-default values are used

### Test Data

- [ ] Test data is created via API or seed scripts (not UI navigation)
- [ ] Test data is isolated (unique per run or per tenant)
- [ ] Cleanup is in place (afterEach/afterAll or transaction rollback)
- [ ] Tests do not depend on manually created local data

### Auth

- [ ] Auth uses storage state reuse for non-login tests
- [ ] Correct role is used for each test scenario
- [ ] Unauthorized access is tested for critical operations

### Coverage Depth

- [ ] Happy path tested
- [ ] At least one failure path tested per critical workflow
- [ ] At least one permission/RBAC scenario tested
- [ ] Empty states tested where relevant
- [ ] Loading and error states tested where relevant

---

## Unit / Integration Test Quality Checklist

- [ ] Domain logic is tested independently of HTTP
- [ ] Integration tests use a real PostgreSQL database (not mocks)
- [ ] Both valid and invalid inputs are tested
- [ ] Wrong-tenant access is tested for all data access functions
- [ ] Error paths return the correct status codes and error shapes

---

## Findings

### Missing Coverage (must add before merge)

1.

### Quality Issues (must fix before merge)

1.

### Suggestions (optional)

1.

---

## Decision

- [ ] **Approved** — test coverage is sufficient; tests are reliable
- [ ] **Changes Required** — see findings; re-review required
- [ ] **Rejected** — coverage is fundamentally insufficient; feature should not ship

**Notes**:
