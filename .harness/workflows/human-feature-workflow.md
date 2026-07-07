# Workflow: Human Role in Feature Implementation

This document describes exactly what the human needs to do — and when — when starting and delivering a feature. Everything not listed here is delegated to agents.

The **Delivery Manager** is your primary status contact throughout delivery. If you want to know where a feature is, ask the Delivery Manager — not individual agents. If something is blocked or at risk, the Delivery Manager surfaces it to you before it becomes a problem.

---

## Step 1 — Describe the Idea (Your Input)

Give the **Product Analyst** a rough description:

- What problem it solves
- Which user is affected
- Any regulatory constraint (e.g., "this is triggered by a new compliance mandate")

You do not need to write user stories or acceptance criteria yourself — that is the Product Analyst's job.

---

## Step 2 — Review and Approve Requirements (Your Decision)

The Product Analyst produces a filled `templates/feature-plan.md` containing:

- User stories
- Acceptance criteria
- E2E scenario candidates
- Open questions requiring your answer

**You review it and explicitly approve before any implementation starts.** This is the most important gate — it prevents building the wrong thing.

If the open questions include ambiguities (scope, regulatory interpretation, pricing implications), you answer them here.

---

## Step 3 — Approve Architecture if Escalated

The Solution Architect produces the technical design. **You only need to approve if** the design involves:

- A new external service (e.g., adding a bank API integration)
- Changes to the tenant isolation mechanism
- Destructive database schema changes
- A change to an externally-governed export schema version (e.g. a regulator-controlled format)

For a standard feature (new UI screen, new API endpoint, new domain logic within existing modules) — no human approval is needed at this step.

---

## Step 4 — Watch for Escalations During Implementation

Agents run Phases 3–5 (E2E test plan, implementation, Playwright tests) autonomously. You may receive escalated questions if:

- An API contract needs to change mid-implementation
- A new library is proposed
- The feature scope needs to be cut

Answer these as they come. Otherwise, no action is needed.

---

## Step 5 — Approve Before Merge if Escalated

The Tech Lead Reviewer handles code review. **You only approve before merge if** the review uncovered:

- A security finding that required a design change
- A tenant isolation bug fix
- A change to logic where the product must never silently auto-resolve conflicting data (flag vs auto-resolve)

For clean PRs with no escalations — Tech Lead Reviewer approval is sufficient.

---

## Step 6 — Final Sign-Off Before Production

Before any deployment, you confirm:

- The feature works as described (Product Analyst confirms acceptance criteria)
- E2E tests are green in CI
- Any regulatory implications are understood

---

## Summary Table

| Phase | Human action | Who coordinates | Required? |
|---|---|---|---|
| Describe the feature | Write a brief | — | Always |
| Approve requirements | Read and sign off on feature plan | Product Analyst | Always |
| Approve architecture | Only if new integration or core schema change | Delivery Manager escalates | Conditional |
| Answer escalations during implementation | As they arise | Delivery Manager escalates | Conditional |
| Approve before merge | Only if security or isolation finding | Delivery Manager escalates | Conditional |
| Review go/no-go recommendation | Read Delivery Manager's recommendation | Delivery Manager | Always |
| Sign off before production | Final confirmation | Delivery Manager coordinates | Always |

The typical lightweight feature requires only **two mandatory human moments**: approving requirements and signing off before release. The Delivery Manager handles everything in between and surfaces the rare escalations that genuinely need you.
