# Harness Guide — Read This First

> 🌐 Bản tiếng Việt: [`GUIDE.vi.md`](GUIDE.vi.md)

New to this kit? Start here. This guide explains **how the whole thing works and where
to begin** — the mental model, not the file-by-file reference. Once it clicks, the other
docs (which are precise but assume you already understand the system) will make sense.

> **This guide narrates; it does not legislate.** Where a rule is authoritative elsewhere,
> this guide links to it instead of restating it. If this guide and a linked file ever
> disagree, the linked file wins.

Examples below are **generic and illustrative** (`F-01 Item CRUD`, `Export`, …) so they
fit any domain. Swap in your own product's features.

---

## 1. The mental model in one picture

The kit runs in **two layers**, with a foundations stage between them:

```
┌─ LAYER 1: PM / PO — "WHAT do we build?"  (upstream, before the harness) ──┐
│   strategy → discovery → prioritization → roadmap → PRD                    │
│   Output: a prioritized feature backlog + PRDs                             │
└───────────────────────────────┬───────────────────────────────────────────┘
                                 │ feeds
                                 ▼
        FOUNDATIONS — the shared base every feature depends on
        (F0 workspace/agent readiness → scaffold → schema → access model
         → core domain engine → auth/shell)
                                 │ once COMPLETE, unlocks
                                 ▼
┌─ LAYER 2: DELIVERY — "HOW do we build it?"  (the 7-phase loop, per feature)┐
│   Requirements → Architecture → Test Plan → Build → E2E → Review → Done    │
└────────────────────────────────────────────────────────────────────────────┘
```

Three things to internalize:

1. **PM/PO is not a harness phase — it's the on-ramp.** Deciding *what* to build happens
   in Layer 1 and produces the input to Layer 2's Phase 1. See the "Upstream vs in-loop"
   section of [`rules/harness-skill-boundary.md`](rules/harness-skill-boundary.md).
2. **Foundations come before any feature.** No Layer-2 work starts until every foundation
   is COMPLETE. This is the one rule the kit never relaxes (even in Lite mode). Full spec:
   [`workflows/foundations.md`](workflows/foundations.md).
3. **State is the memory between sessions.** Everything the agent needs to resume lives in
   three small files under [`state/`](state/) — described next.

### Who does what

| You (human) | Claude (the agent team) |
|---|---|
| Product owner + **approver** at gates | Analyze, design, build, test, review |
| Decide *what* to build and *whether* to accept | Decide *how* to build it |
| Answer the human-approval gates | Read/write the state files, follow the phases |

You mostly talk in plain language and approve at the right moments. The harness mechanics
(state, phases) are Claude's job.

---

## 2. How the three state files live

The state files are Claude's **external brain** — written to disk so nothing is lost when a
session ends. Each answers exactly one question:

| File | Answers | Written by | Like a… |
|---|---|---|---|
| [`state/DELIVERY_STATE.md`](state/DELIVERY_STATE.md) | "Big picture: what's done, next, blocked?" | Delivery Manager | wall planner |
| [`state/active-task.md`](state/active-task.md) | "What exactly is in flight right now?" | Current agent | sticky note |
| [`state/decisions.md`](state/decisions.md) | "What is locked and must not be reopened?" | Solution Architect | signed minutes |

The split is deliberate — three rates of change: big-picture (slow), active task (fast),
decisions (near-permanent). Mixing them creates noise.

### The read → do → write cycle

```
SESSION START          WHILE WORKING            SESSION END
─────────────          ─────────────            ───────────
Read DELIVERY_STATE    Follow active-task       Update active-task
Read active-task    →  Respect decisions     →  Update DELIVERY_STATE
Read decisions         Do ONE task              Append decisions (if any new)
```

Two hard rules from [`../CLAUDE.md`](../CLAUDE.md): **don't write code before reading all
three**, and **update state before ending a session**. A `SessionStart` hook injects a
digest of these files automatically each session, and a `PreToolUse` guard warns if you
edit source while foundations are unfinished — see [`../.claude/hooks/`](../.claude/hooks/).
The hooks are reminders with teeth; they don't replace reading the files.

---

## 3. How the 3 files mesh with the 7 phases

The 7 delivery phases live in [`workflows/feature-delivery.md`](workflows/feature-delivery.md).
Here's how each file is touched as one feature moves through them:

| Phase | Lead | `DELIVERY_STATE` | `active-task` | `decisions` |
|---|---|---|---|---|
| **1. Requirements** | Product Analyst | ✍️ register feature | ✍️ task = write reqs, phase=Requirements | 👁️ read |
| **2. Architecture** | Solution Architect | 🔄 update phase | 🔄 phase=Architecture | ✍️ **record locked decisions** |
| **3. Test Plan** | QA | 🔄 update phase | 🔄 phase=Test Plan | 👁️ read |
| **4. Build** | Backend + Frontend | 🔄 + log blockers | 🔄 phase=Build | 👁️ obey |
| **5. E2E Tests** | QA | 🔄 update phase | 🔄 phase=E2E | 👁️ read |
| **6. Review** | Tech Lead | 🔄 + escalate | 🔄 phase=Review | ✍️ if escalation locks something |
| **7. Done** | — | ✅ mark done, unlock dependents | 🧹 clear / set next task | 👁️ keep |

👁️ read · ✍️ write new · 🔄 update · ✅ close · 🧹 clear

Patterns worth noticing:

- **`active-task` is a cursor** that moves across the 7 phases — always says "where am I".
- **`decisions` only grows.** Phase 2 creates entries; later phases obey them; nobody
  deletes. This is what keeps choices consistent across many sessions.
- **`DELIVERY_STATE` is the management layer.** A feature is *registered* at Phase 1 and
  *closed + dependents unlocked* at Phase 7. It turns scattered features into an ordered flow.
- **Human approval gates** sit at specific phases (e.g. requirements sign-off, core-schema
  changes, security findings). The authoritative list is in
  [`rules/approval-policy.md`](rules/approval-policy.md). At a gate, Claude stops and asks you.

---

## 4. The seam: how a roadmap backlog "pours" into DELIVERY_STATE

This is the join between Layer 1 and Layer 2 — and it is **not automatic**. A role (the
Delivery Manager) serializes the upstream output into harness state. The governing rule:

> **`DELIVERY_STATE` is a thin tracking layer, not a copy of the roadmap.** Full detail
> (PRDs, stories, ACs) stays in `docs/`. State holds only what tracking needs: name, order,
> dependencies, status. Documents reference state; they never duplicate it. (This is the
> "Trace Seam" in [`rules/harness-skill-boundary.md`](rules/harness-skill-boundary.md).)

What travels, and what stays behind:

| Roadmap / PRD produces | Into DELIVERY_STATE? | Stays in docs? |
|---|---|---|
| Feature name | ✅ one line | |
| Priority / release order | ✅ grouped + ordered | |
| Dependencies between features | ✅ noted | |
| Target date (if any) | ✅ | |
| Detailed description, stories, AC | ❌ | ✅ `docs/requirements/` |
| Priority rationale / WSJF score | a summarized number | ✅ full in PRD |

### Worked example (generic)

**Roadmap output** (raw, from a roadmap/prioritization step):

```
Release 1 (MVP):
  - Item CRUD            [base, no deps]
  - Search & filter      [needs: Item CRUD]
Release 2:
  - Bulk import          [needs: Item CRUD]
  - Export               [needs: Item CRUD, Search]
```

**Delivery Manager serializes it into `DELIVERY_STATE.md`:**

```markdown
## Active Feature Workstreams

### Release 1 — MVP
- [ ] F-01 Item CRUD — `NOT STARTED`
      PRD: docs/requirements/PRD-item-crud.md
- [ ] F-02 Search & filter — `NOT STARTED` · depends: F-01

### Release 2
- [ ] F-03 Bulk import — `NOT STARTED` · depends: F-01
- [ ] F-04 Export — `NOT STARTED` · depends: F-01, F-02
```

The many-line roadmap collapses to **name + status + dependencies + a link to the PRD**.
As work proceeds, only the **status** on a line changes:

```markdown
- [ ] F-02 Search & filter — `PHASE 4 (Build)` · depends: F-01 ✅
...
- [x] F-01 Item CRUD — `DONE` ✅      ← unlocks F-02, F-03
```

The `depends` column is the most valuable part: it turns a flat list into a **build order**
and links features back to foundations.

> The `product-owner` skill (a "Tracker") can compute WSJF/priority numbers, but by the
> boundary rules it only *returns numbers to the Delivery Manager* — the Delivery Manager
> writes the file. A skill never writes state itself.

---

## 5. A feature end-to-end (the whole loop in one read)

Following `F-04 Export` from idea to done:

1. **Upstream (Layer 1)** already decided Export is worth building and wrote a PRD. Its line
   sits in `DELIVERY_STATE` as `NOT STARTED · depends: F-01, F-02`.
2. **Gate check:** all foundations COMPLETE? F-01 and F-02 done? If yes, Export can start.
3. **Phase 1 — Requirements:** Product Analyst turns the PRD into stories + acceptance
   criteria. `active-task` = "write Export reqs". **You approve.**
4. **Phase 2 — Architecture:** Architect decides the approach and **locks a decision** in
   `decisions.md` (e.g. "export runs server-side, streamed"). Schema-touching choices →
   **you approve**.
5. **Phase 3 — Test Plan:** QA defines what "done" looks like *before* code exists.
6. **Phase 4 — Build:** Backend + Frontend implement with tests, obeying the locked
   decision. A blocker (e.g. missing API contract) is logged in `DELIVERY_STATE`.
7. **Phase 5 — E2E:** QA runs real tests. Mismatch with acceptance criteria → bug → back to
   Phase 4.
8. **Phase 6 — Review:** Tech Lead approves / requests changes. Security findings →
   **you approve**.
9. **Phase 7 — Done:** `DELIVERY_STATE` marks F-04 ✅ and checks what it unlocks;
   `active-task` is cleared and pointed at the next thing.

Throughout, you did three things: **described** what you wanted, **approved** at gates, and
let Claude handle state + phases. That is the entire interaction model.

---

## 6. Full vs Lite — pick your weight

| | Full harness | Lite profile |
|---|---|---|
| State files | 3 (`DELIVERY_STATE` + `active-task` + `decisions`) | 1 (`state/STATE.md`) |
| Phases | 7 | 3 (Plan → Build → Verify) |
| Roles / approval gates | 8 roles, per-phase gates | none — you run it |
| Foundations-before-features | ✅ | ✅ (kept) |
| Best for | teams, compliance, interdependent features | MVP, prototype, solo build |

The hooks auto-detect the mode: if `state/STATE.md` exists it's Lite, otherwise Full.
Switch instructions and the 3-phase workflow are in [`lite/README.md`](lite/README.md) and
[`lite/workflow.md`](lite/workflow.md).

---

## Where to go next

- **Set up a project:** root [`../README.md`](../README.md) → "Use in a new project".
- **The protocol you must follow each session:** [`../CLAUDE.md`](../CLAUDE.md).
- **Build order before features:** [`workflows/foundations.md`](workflows/foundations.md).
- **Delivering one feature:** [`workflows/feature-delivery.md`](workflows/feature-delivery.md).
- **Who reviews / approves what:** [`rules/`](rules/) (review, approval, e2e, coding standards).
- **How skills relate to the harness:** [`rules/harness-skill-boundary.md`](rules/harness-skill-boundary.md).
