# Code Review Template

Use this when reviewing a PR. Fill each section. Issue a clear decision at the end.

---

## PR Reference

- **PR**: #
- **Feature**: 
- **Reviewer**: Tech Lead Reviewer
- **Date**:

---

## What This PR Does

<!-- One-paragraph summary of the change. Confirm this matches what the PR description says. -->

---

## Checklist

### Tenant Isolation

- [ ] All queries that read SME data filter by `tenant_id` AND `client_id`
- [ ] `tenant_id` is never accepted from user-supplied request parameters — extracted from session only
- [ ] `client_id` is validated against the tenant before use

### Auth / Permissions

- [ ] Protected routes require authenticated session
- [ ] RBAC checks are enforced before mutations
- [ ] Unauthorized access returns 403, not 404 (to avoid leaking existence of resources)

### Audit

- [ ] All mutations write to the audit log
- [ ] Audit entries include: who, what entity, what action, timestamp, before/after values
- [ ] No update or delete operations on audit rows

### Data Integrity

- [ ] Confidence scores from extraction/ingestion are stored alongside parsed fields
- [ ] Conflicting data from multiple sources is flagged, not silently auto-resolved
- [ ] Externally-governed schema versions are referenced from config, not hardcoded

### Error Handling

- [ ] API errors return structured error bodies (not raw exceptions)
- [ ] Error status codes are correct (400 bad input, 403 forbidden, 404 not found, 422 validation, 500 unexpected)
- [ ] Async failures (OCR job failures) update the record status and notify appropriately

### TypeScript

- [ ] No `any` without documented justification
- [ ] No `// @ts-ignore` without documented justification
- [ ] Zod schemas match API contract

### Code Quality

- [ ] No `console.log` in production paths
- [ ] No hardcoded credentials, tokens, or magic strings
- [ ] No unnecessary duplication
- [ ] Complex logic has a brief comment explaining the WHY (not the what)

### Tests

- [ ] Unit tests cover new domain logic
- [ ] Integration tests cover new API endpoints (valid, invalid, wrong-tenant cases)
- [ ] E2E tests are added or explicitly skipped with reason
- [ ] All tests pass in CI

### Frontend (if applicable)

- [ ] Loading, error, and empty states are implemented
- [ ] Stable selectors are added for all interactive elements
- [ ] No CSS class selectors used for test targeting
- [ ] Accessibility: interactive elements are keyboard-reachable, have labels

---

## Findings

### Critical (must fix before merge)

1.

### High (must fix before merge)

1.

### Medium (should fix; may self-review)

1.

### Low (optional; note for future)

1.

---

## Decision

- [ ] **Approved** — all findings addressed; PR may merge
- [ ] **Changes Required** — see findings above; re-review required for critical/high items
- [ ] **Rejected** — fundamental issue requires redesign

**Notes**:
