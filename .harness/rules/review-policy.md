# Review Policy

Defines who reviews what, the depth of review required, and the review process.

---

## Review Required For

| Change Type | Reviewer Required | Human Approval |
|---|---|---|
| New feature (any size) | Tech Lead Reviewer | Yes — requirements phase |
| Bug fix (low/medium severity) | Tech Lead Reviewer | No |
| Bug fix (critical — data/security) | Tech Lead Reviewer | Yes |
| New module | Tech Lead Reviewer + Architect | Yes |
| New external integration | Tech Lead Reviewer + Architect | Yes |
| Database schema change (additive) | Tech Lead Reviewer | No |
| Database schema change (destructive) | Tech Lead Reviewer | Yes |
| Tenant isolation mechanism change | Tech Lead Reviewer | Yes |
| Externally-governed export schema version update (regulator-controlled) | Tech Lead Reviewer | Yes |
| Auth or session handling change | Tech Lead Reviewer | Yes |
| Billing enforcement change | Tech Lead Reviewer | Yes |
| Audit log change | Tech Lead Reviewer | Yes |
| E2E test addition (no code change) | Tech Lead Reviewer (test review) | No |
| Dependency version update (minor/patch) | Tech Lead Reviewer | No |
| Dependency addition | Tech Lead Reviewer | No (justify in PR) |

---

## Review Depth

### Standard Review

For most PRs:
- Read the diff completely
- Check the tenant isolation rules
- Check that tests are present
- Use `templates/code-review.md`
- Issue Approved / Changes Required / Rejected

### Architecture Review

For new modules, new integrations, schema changes:
- Review design doc in addition to code
- Check module dependency rules
- Escalate to human if design impacts core data model

### Security Review

For auth, session, file upload, billing, or tenant isolation changes:
- Apply full security checklist from `agents/tech-lead-reviewer.md`
- Check for injection vectors in any untrusted/externally-sourced input handling
- Check for injection (SQL, XML, command) in generated export artifacts
- Escalate to human for any unresolved finding

---

## PR Requirements

Before a PR is submitted for review:

- [ ] PR description explains what changed and why
- [ ] All tests pass in CI (link the CI run)
- [ ] Self-review is done: author has checked their own diff
- [ ] If this PR changes an API contract: the contract doc is updated
- [ ] If this PR adds a new E2E test: test review is included

---

## Review Turnaround

- All PRs must receive a review response within 1 business day.
- Critical bug fixes must receive a review response within 4 hours.
- If the reviewer needs more information, they comment and the PR is put in "waiting" state.

---

## Disagreement Resolution

If agents disagree on a technical decision:

1. The disagreeing agents document their positions.
2. Tech Lead Reviewer makes a ruling.
3. If the ruling involves a significant trade-off (correctness vs speed, security vs usability), escalate to human.
4. The human decision is final and must be documented in the PR.
