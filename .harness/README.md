# Development Harness

This harness defines how the AI agent team plans, implements, reviews, tests, and
ships software. It is **project-agnostic** — adapt the domain-specific parts
(foundations, coding standards, non-negotiable rules) to your project.

> The files under `agents/`, `rules/`, `templates/`, and `workflows/` ship with a
> worked example (a multi-tenant SaaS for accounting) baked into some of the prose.
> Treat that as a reference implementation and **edit it to match your domain**.

---

## Agent Team

| Agent | Primary concern |
|---|---|
| [Delivery Manager](agents/delivery-manager.md) | Cross-feature tracking, release coordination, risk escalation, go/no-go |
| [Product Analyst](agents/product-analyst.md) | Requirements, user stories, acceptance criteria, E2E scenario candidates |
| [Solution Architect](agents/solution-architect.md) | Architecture, module design, integration points, testing strategy |
| [Backend Developer](agents/backend-developer.md) | APIs, domain logic, database, background jobs, backend tests |
| [Frontend Developer](agents/frontend-developer.md) | UI, routing, state, forms, stable selectors, frontend tests |
| [QA / E2E Tester](agents/qa-e2e-tester.md) | E2E tests, test plans, acceptance verification |
| [DevOps / Platform](agents/devops-platform.md) | CI/CD, containers, test artifacts |
| [Tech Lead / Reviewer](agents/tech-lead-reviewer.md) | Code review, architecture review, test review, final approval |

---

## How to Start

> **First time here?** Read [`GUIDE.md`](GUIDE.md) (Tiếng Việt: [`GUIDE.vi.md`](GUIDE.vi.md))
> — a narrative walkthrough of the whole system (two layers, state files, phases, the
> roadmap→state seam) with worked examples. The files below are precise references; the
> guide is the map that ties them together.

**Read these before anything else:**

1. This README
2. [`state/DELIVERY_STATE.md`](state/DELIVERY_STATE.md) — current status of all foundations and workstreams
3. [`state/active-task.md`](state/active-task.md) — what was in progress when the last session ended
4. [`state/decisions.md`](state/decisions.md) — locked decisions that must not be revisited

If `active-task.md` describes work in progress, **resume that task first**.

> A `SessionStart` hook injects a digest of this state automatically each session, and a
> `PreToolUse` guard warns on source edits while foundations are unfinished. See
> [`.claude/hooks/`](../.claude/hooks/) and the root `CLAUDE.md`.

**Lite vs full.** This README describes the **full** harness. Small/solo projects can use
the **lite profile** instead — one state file plus a 3-phase Plan→Build→Verify loop. See
[`lite/README.md`](lite/README.md).

---

## Build Order

**Foundations before features.** No feature work begins until all foundations are complete.
Define your own foundations in `state/DELIVERY_STATE.md` and document each in
[`workflows/foundations.md`](workflows/foundations.md).

---

## Workflows

| Workflow | When to use |
|---|---|
| [Foundations](workflows/foundations.md) | **Start here** — build order before any feature |
| [Feature Delivery](workflows/feature-delivery.md) | Delivering a new feature end-to-end |
| [Bug Fix](workflows/bug-fix.md) | Diagnosing and fixing a defect |
| [E2E Test Design](workflows/e2e-test-design.md) | Designing or extending E2E coverage |
| [Release Readiness](workflows/release-readiness.md) | Pre-release checklist before deploying |
| [Human Role](workflows/human-feature-workflow.md) | What the human does vs what agents handle |

---

## Templates

| Template | Use for |
|---|---|
| [Feature Plan](templates/feature-plan.md) | Structuring a feature before implementation |
| [Implementation Plan](templates/implementation-plan.md) | Breaking implementation into backend/frontend tasks |
| [E2E Test Plan](templates/e2e-test-plan.md) | Designing E2E scenarios for a feature |
| [Code Review](templates/code-review.md) | Structured code review checklist |
| [Test Review](templates/test-review.md) | Reviewing test coverage quality |

---

## Rules

| Rule Set | What it governs |
|---|---|
| [Coding Standards](rules/coding-standards.md) | Language, framework, naming, isolation rules |
| [Review Policy](rules/review-policy.md) | Who reviews what, review depth requirements |
| [E2E Testing Policy](rules/e2e-testing-policy.md) | E2E structure, selectors, data, CI integration |
| [Approval Policy](rules/approval-policy.md) | When human approval is required |
| [Session Continuity](rules/session-continuity.md) | How agents write state and resume after context limit |
| [Harness/Skill Boundary](rules/harness-skill-boundary.md) | When to use the harness vs invoking a skill |
| [AI Collaboration Hygiene](rules/ai-collaboration-hygiene.md) | Prompt quality, session discipline, tool use, context management |

---

## Persistent State

| File | Owner | Purpose |
|---|---|---|
| [`state/DELIVERY_STATE.md`](state/DELIVERY_STATE.md) | Delivery Manager | Overall delivery picture — foundations, workstreams, blockers |
| [`state/active-task.md`](state/active-task.md) | Current agent | Resume point — what was being done, what comes next |
| [`state/decisions.md`](state/decisions.md) | Solution Architect | Locked decisions that must not be re-litigated |

---

## Done Definition

A feature is **not complete** unless all of the following are true:

- [ ] Requirements are written and acceptance criteria are clear
- [ ] Architecture review is done for any new module or integration
- [ ] Backend implementation is done with tests
- [ ] Frontend implementation is done with tests and stable selectors
- [ ] E2E tests are added — or explicitly skipped with a documented reason
- [ ] All existing E2E tests pass
- [ ] Tech Lead Reviewer has approved code and test coverage
- [ ] No open critical/high findings from code review

---

## Non-Negotiable Rules

> Replace these with your project's invariants. Examples of the *kind* of rule that
> belongs here: data isolation guarantees, "never auto-resolve X silently", "store
> confidence/audit data", "AI is a copilot not an autopilot", "E2E failures block
> completion", "never hardcode externally-governed schema versions".

1. <invariant 1>
2. <invariant 2>
3. **E2E failures block completion.** A failing E2E test is a failing feature.
