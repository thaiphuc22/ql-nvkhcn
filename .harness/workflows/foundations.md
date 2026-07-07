# Workflow: Enterprise Foundations

Enterprise teams do not start by writing features. They build the foundations that all
features depend on. Getting a foundation wrong means every feature built on top of it is
wrong too.

This workflow runs **before** any feature from `workflows/feature-delivery.md` begins. No
feature work starts until all required foundations are complete and human-approved.

**Delivery Manager** tracks each foundation as a separate workstream. **Human approval is
required** before each foundation's implementation begins.

> **Adapt this to your project.** Foundation 0 is workspace **pre-flight** — mechanical,
> machine-verifiable, no human approval; it is the same for every project. Foundations 1–5
> are the product substrate: a proven *shape* (scaffold → data model → access model → core
> domain engine → auth + shell). Rename and re-scope **1–5** to your domain. The `> Example:`
> callouts show how one project (a multi-tenant SaaS) filled them in — replace those specifics
> with yours.

---

## How to Think About This

When an agent sees a UI screenshot or feature request, the first question is not "how do I
code this?" It is:

> "What foundational systems must exist before this is even buildable?"

Most product roadmaps list features, not foundations. But without the foundations, every
feature is either impossible or built on sand. Identify them first.

---

## Foundation 0 — Workspace & Agent Readiness

**Owner**: DevOps/Platform Agent (or whoever sets up the repo)
**Blocks**: Everything — this is the pre-flight before an agent can reliably work in the repo
**Human approval**: Not required — the done-when checklist is mechanical and the SessionStart
hook self-verifies most of it

### Why This Is a Foundation, Not Just Setup

Before an agent builds anything, the repo must be set up *for an agent to work in safely*. This
is workspace hygiene, not product substrate — but get it wrong and every later foundation is
built by an agent that is flying blind (no instructions), corrupting its own state (repo on a
cloud-sync folder), or drowning in a bloated instruction file. It is the one foundation the
harness can attest by itself.

This foundation operationalizes [`rules/ai-collaboration-hygiene.md`](../rules/ai-collaboration-hygiene.md)
— the collaboration standard — and is reported each session by
[`.claude/hooks/session-start.js`](../../.claude/hooks/session-start.js).

### What to Wire

- A primary instruction file (`CLAUDE.md` or `AGENTS.md`), kept **lean** (< ~600 lines). Durable
  rules belong in `.harness/rules/`, not one giant file.
- Harness state **initialized** (`DELIVERY_STATE.md` / `STATE.md` filled in, not the template).
- Hooks **active** (`.claude/settings.json`: SessionStart digest + foundations guard).
- Any skills the project needs available under `.claude/skills/`.
- The repo on a **local path** — never under OneDrive / Dropbox / iCloud (sync corrupts agent
  state files via conflict copies).
- Custom instructions for the AI assistant in use (`.github/copilot-instructions.md` or
  equivalent), if applicable.

### Done When

The SessionStart hook's `Agentic readiness:` line reports ✓ for these, and no ⚠ warnings remain:

- [ ] Primary instruction file present and under the size limit (no bloat warning)
- [ ] Harness state initialized — not the unfilled template
- [ ] Hooks active (`.claude/settings.json` present)
- [ ] Skills directory present and non-empty (if the project uses skills)
- [ ] Repo is on a local path, not a cloud-sync folder (no cloud warning)

> Unlike F1–F5, this foundation needs **no human approval** — the hook attests it. Tick it once
> the readiness line is green.

---

## Foundation 1 — Project Scaffold

**Owner**: DevOps/Platform Agent
**Blocks**: Everything below it
**Human approval**: Required on monorepo and tooling decisions before setup begins

### What It Is

The skeleton every other agent works inside. Not a feature — plumbing.

### Decisions to Lock (human approves)

List the stack-level choices that everything else depends on, and lock them in
`state/decisions.md`. Typical categories: monorepo tooling, ORM/data access, auth library,
migration runner, styling, component library, test runner.

> **Example (multi-tenant SaaS):** pnpm workspaces + Turborepo · Drizzle ORM · NextAuth v5
> · Drizzle Kit migrations · Tailwind · shadcn/ui.

### Structure

Define the repository layout once. A typical monorepo shape:

```
<project>/
  apps/
    web/                    # application
    e2e/                    # E2E test suite
  packages/
    db/                     # schema + migrations + seed scripts
    shared/                 # types/validation shared across apps
    ui/                     # shared component layer (optional)
  docker-compose.yml        # dev + test datastores
  .github/workflows/ci.yml  # type-check → lint → test → e2e gate
```

### Done When

- [ ] `dev` command starts the app with a connected database
- [ ] `db:migrate` applies migrations cleanly
- [ ] `type-check` passes with zero errors
- [ ] `lint` passes with zero errors
- [ ] E2E runner runs (even with zero tests) and produces a report
- [ ] CI pipeline is green on an empty commit

---

## Foundation 2 — Core Data Schema

**Owner**: Solution Architect + Backend Developer
**Blocks**: All feature modules
**Human approval**: Required on final schema before any migration is written

### Why This Is a Foundation, Not a Feature

Every entity in the product references the core schema. Getting the central entities wrong
means refactoring migrations, cascading schema changes, and broken features. Design it once,
carefully.

### Core Entities (non-negotiable)

Model the central entities and their relationships before writing any migration. Capture, for
each entity: identity, ownership/scoping keys, status enums, and audit fields.

> **Example (multi-tenant SaaS):** `Tenant`, `User` (with a role enum), the primary business
> entity scoped by `tenant_id`, a profile/config entity, period/obligation rows, transactional
> records (with source + confidence metadata when data is ingested rather than entered), and an
> append-only `AuditLog`. Data ingested from low-trust sources stored raw alongside a parsed
> form plus a per-field confidence score; rows below a confidence threshold flagged for review.

### Key Design Decisions (architect documents rationale for each)

For each non-obvious modeling choice, record the rationale in `state/decisions.md`. Watch for:
pre-computed vs. on-the-fly derived rows, how derived dates/values are stored, granularity of
metadata (a single aggregate vs. per-field), and redaction of sensitive values in audit logs.

### Done When

- [ ] Schema reviewed and approved by human
- [ ] Schema files written in the data package
- [ ] Initial migration generated and tested on a clean database
- [ ] Seed script creates representative data across the main entities and states
- [ ] All foreign key constraints and indexes are in place
- [ ] Tech Lead Reviewer has approved the schema

---

## Foundation 3 — Access Model (RBAC)

**Owner**: Solution Architect
**Blocks**: Auth module, every API route, every UI component
**Human approval**: Required on the role/permission matrix before implementation

### Why This Is a Foundation, Not a Feature

Access control that is bolted on after features are built has gaps. Define the full permission
matrix now, implement it once in middleware and the API layer, and every future feature
inherits it for free.

### Role Definitions & Permission Matrix

Define every role, its scope, and a resource × role matrix of R / R-W / — entries. Keep it in
one document so new features map onto existing rules instead of inventing new ones.

> **Example (multi-tenant SaaS):** platform-admin, tenant-admin, senior operator (all
> resources in tenant), operator (assigned resources only), read-only viewer (own data). Matrix
> rows: settings, user management, primary-entity CRUD, profile edit, record upload, approval
> actions, export, audit-log view, billing.

### Implementation Contract

The architect must specify, for each rule in the matrix:
- Where it is enforced (middleware / API route / query filter / UI hide)
- **Primary enforcement layer is always the API/query** — UI hiding is defense-in-depth only

> **Example enforcement:** an operator may only read/write records for assigned resources →
> every query includes `WHERE tenant_id = session.tenantId AND resource_id IN (assigned set)`;
> the UI switcher only shows assigned resources; **never enforced by UI alone.**

### Done When

- [ ] Full permission matrix documented and human-approved
- [ ] Enforcement strategy specified per resource
- [ ] Shared module exports role types and permission-check utilities
- [ ] Middleware skeleton applies role check to all protected routes
- [ ] Tech Lead Reviewer has approved

---

## Foundation 4 — Core Domain Engine

**Owner**: Backend Developer
**Blocks**: Dashboard, alerts, status indicators — anything driven by domain logic
**Human approval**: Required on the domain rules (business/legal interpretation)

### Why This Is a Foundation, Not a Feature

Many products have one piece of non-trivial domain logic that drives the most valuable views
("which items are at risk right now?"). It often has no UI of its own — it's a background
service — but without it the dashboards are blank screens. Build and test it in isolation
before any UI depends on it.

### What It Computes

Specify the inputs, the rules (including edge cases and externally-governed rules like holidays
or schema versions that must live in config, never hardcoded), the output states, and how/when
they transition (daily job vs. computed-on-query — architect decides).

> **Example (tax deadline engine):** computes filing due dates per obligation type with a
> business-day adjustment rule and a config-driven public-holiday table; status machine
> `UPCOMING → DUE_SOON (≤7d) → OVERDUE → LATE_FILED`, or `FILED`. Dashboards query the
> pre-computed rows for at-risk counters and alert banners.

### Done When

- [ ] Human has approved the domain calculation rules (especially edge cases)
- [ ] Rows/outputs are generated correctly for representative inputs
- [ ] Transitions are correct for all edge cases (boundaries, holidays, year rollover, leap year)
- [ ] Unit tests cover the normal path plus every documented edge case
- [ ] Seed script includes data in every output state
- [ ] Tech Lead Reviewer has approved

---

## Foundation 5 — Auth + App Shell

**Owner**: Backend Developer + Frontend Developer (parallel)
**Blocks**: All UI feature work
**Depends on**: Foundations 2 and 3 complete
**Human approval**: Not required (standard pattern), but Tech Lead Reviewer must approve before feature work begins

### What It Is

The skeleton every user interacts with before they reach any feature:
- Login / logout / session
- Tenant/account context loaded into the session token
- Route protection middleware (role-based)
- The application shell: sidebar, header, and any primary context switcher
- Context switching without a full page reload

### The Context Switcher (Critical UX, if applicable)

If your app scopes content to an active entity (client, workspace, project), the switcher that
sets that scope is a core interaction every feature depends on — it must work correctly first.

> **Example:** `Session → tenantId (always present)`; `URL/context → activeResourceId (changes
> on switch)`; all data queries scoped to both.

### Done When

- [ ] Login and logout work with session persistence
- [ ] Account/tenant context is in the session token and verified on every request
- [ ] Middleware blocks unauthenticated and unauthorized routes
- [ ] The shell renders: navigation, header, and context switcher (if any)
- [ ] Switching context updates scope without a full reload
- [ ] E2E tests: login, logout, route protection, context switch
- [ ] Tech Lead Reviewer has approved

---

## Feature Module Order (after all foundations complete)

Sequence features so each builds on a stable predecessor. Guiding principles:

1. Build the central entity's CRUD first — everything references it.
2. Get data into the system (manual) before automating how it arrives.
3. Validate core logic manually before layering on automation/AI.
4. Treat ingestion enhancements (OCR, integrations) as additive, not prerequisites.
5. Outputs/exports come after the data they depend on is correct.
6. Scale and bulk operations come after the single-item flow works.

---

## Foundation Completion Gate

No feature from `workflows/feature-delivery.md` begins until every foundation is complete:

- [ ] F0: Workspace & agent readiness — SessionStart readiness line green, no ⚠ warnings (no human approval needed)
- [ ] F1: Project scaffold — dev command works, CI is green
- [ ] F2: Core data schema — human-approved, migrations tested, seed data ready
- [ ] F3: Access model — human-approved, enforcement strategy documented
- [ ] F4: Core domain engine — unit tested, seed data covers all states
- [ ] F5: Auth + shell — E2E login/logout/route-protection tests pass

**Delivery Manager maintains this checklist in `.harness/state/DELIVERY_STATE.md` and reports status to the human on request.**
