# Workflow: Feature Delivery

Use this workflow for any new feature from idea to production-ready.

The **Delivery Manager** registers the feature at Phase 1 and tracks it through every phase. Any phase that stalls without a signal is surfaced by the Delivery Manager before it becomes a blocker.

---

## Phase 1 — Requirements

**Owner**: Product Analyst  
**Notified**: Delivery Manager (registers feature in delivery view)  
**Gate**: Human approval required before Phase 2

1. Product Analyst writes requirement note, user stories, and acceptance criteria using `templates/feature-plan.md`.
2. Product Analyst identifies E2E scenario candidates.
3. Tech Lead Reviewer reviews requirements for ambiguity and testability.
4. **Human approves requirements** before implementation begins.
5. Delivery Manager registers the feature: name, target date (if known), dependencies on other features.

Blockers that stop Phase 1:
- Acceptance criteria are not testable
- Regulatory/compliance constraints are unclear
- Scope is too large (split the feature)

---

## Phase 2 — Architecture

**Owner**: Solution Architect  
**Notified**: Delivery Manager (updates status; flags if design reveals cross-feature dependency)  
**Gate**: Tech Lead Reviewer approval before Phase 3

1. Architect reviews existing module structure.
2. Architect produces architecture note, API contracts, and schema changes using `templates/implementation-plan.md`.
3. Architect communicates E2E coverage requirements to QA Agent.
4. Tech Lead Reviewer reviews architecture note.
5. **Human approval required** for: new external integrations, schema changes to core tables (the central business entities and the audit log), or changes to the tenant isolation mechanism.

---

## Phase 3 — E2E Test Plan

**Owner**: QA Agent  
**Gate**: Approved plan before Phase 4

This phase runs **before** implementation, not after. The test plan defines what "done" looks like.

1. QA Agent writes E2E test plan using `templates/e2e-test-plan.md`.
2. QA Agent identifies test data requirements and communicates to Backend Developer.
3. Product Analyst reviews test plan against acceptance criteria.
4. Tech Lead Reviewer reviews test plan for depth.

---

## Phase 4 — Implementation

**Owners**: Backend Developer + Frontend Developer (parallel)  
**Notified**: Delivery Manager (monitors for stalled handoffs; surfaces contract change conflicts)

**Backend tasks**:
1. Implement database migrations.
2. Implement domain service logic with unit tests.
3. Implement API routes with integration tests.
4. Implement seed scripts and test data factories for E2E tests.

**Frontend tasks**:
1. Implement UI components with loading/error/empty states.
2. Add stable selectors per Frontend Developer agent rules.
3. Implement frontend unit/component tests.
4. Document interaction timing for QA Agent (especially async operations).

**Sync point**: When API contracts are stable, Frontend Developer can begin integration. If a contract must change, notify Tech Lead Reviewer.

---

## Phase 5 — E2E Tests

**Owner**: QA Agent

1. QA Agent implements Playwright tests per the approved test plan.
2. QA Agent runs tests against the running application (not mocks).
3. If behavior does not match acceptance criteria, QA Agent files a bug — implementation must be fixed before proceeding.
4. All tests pass before Phase 6.

---

## Phase 6 — Review

**Owner**: Tech Lead Reviewer

1. Reviewer runs the full review checklist from `agents/tech-lead-reviewer.md`.
2. Issues findings as **Approved**, **Changes Required**, or **Rejected**.
3. Developers address findings.
4. **Human approval required** for: any security finding, any change to billing enforcement, any change to the audit log schema.
5. Final approval is issued only after all findings are resolved and E2E tests pass in CI.

---

## Phase 7 — Done

The feature is done when:
- [ ] Requirements met (Product Analyst confirms)
- [ ] All tests pass in CI (unit, integration, E2E)
- [ ] Tech Lead Reviewer has approved
- [ ] Human has approved any escalated decisions
- [ ] Documentation is updated if the feature changes an external API contract
- [ ] Delivery Manager updates the delivery status view to mark the feature complete and checks whether it unblocks any dependent features
