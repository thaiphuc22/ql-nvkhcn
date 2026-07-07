# Session Continuity Rules

AI agent sessions have a context window limit. When a session ends — whether by context limit, user interruption, or a planned stop — the next session must be able to resume without losing work, repeating decisions, or contradicting earlier choices.

This rule set defines how agents write state before stopping and how they resume from that state.

---

## The Core Principle

**The harness files are the persistent memory.** An agent's context window is temporary. The files in `.harness/state/` and the harness itself are permanent. Every decision, every progress update, and every blocking question must be written to a file before the session ends — not kept only in context.

A new session that reads the state files should be able to answer:
- What is currently being built?
- What phase is it in?
- What was the last action taken?
- What is the next concrete action?
- What decisions were made that must not be reversed?

---

## State Files

```
.harness/state/
  DELIVERY_STATE.md     # Delivery Manager owns — overall delivery picture
  active-task.md        # Current agent owns — written before each session ends
  decisions.md          # Architect owns — locked decisions that must not be revisited
```

---

## DELIVERY_STATE.md

**Owner**: Delivery Manager  
**Updated**: After every phase completion, after every blocker, after every human approval

This is the top-level view any session reads first to understand where the project is.

**The `Your Next Action` section is the most important section for the human.** It must always reflect the single most important thing the human needs to do right now. Update it at the end of every session — it is the answer to "what's next?" when the human returns.

Format:
```markdown
# Delivery State
Last updated: YYYY-MM-DD HH:MM

## Your Next Action

> **Status**: WAITING_FOR_YOU | AGENTS_WORKING | BLOCKED

**Say**: `"<exact phrase>"` to [trigger the next step].

[1–2 sentences: what happens next and why it needs the human.]

| What | Why your input is needed |
|---|---|
| [upcoming item] | [reason human must act] |

_This section is updated by the Delivery Manager at the end of every session._

---

## Foundations
- [ ] F0: Workspace & Agent Readiness — [status: NOT_STARTED | IN_PROGRESS | COMPLETE | BLOCKED]
- [ ] F1: Project Scaffold — [status: NOT_STARTED | IN_PROGRESS | COMPLETE | BLOCKED]
...

## Active Feature Workstreams
| Feature | Phase | Owner | Blocker | Target |
|---|---|---|---|---|

## Pending Human Approvals
- [ ] [what needs approval] — sent on [date]

## Active Blockers
- [blocker description] — owned by [agent] — since [date]

## Locked Decisions
See decisions.md
```

### Status values for Your Next Action

| Status | Meaning |
|---|---|
| `WAITING_FOR_YOU` | Human must act before agents can continue |
| `AGENTS_WORKING` | Agents are running autonomously; human monitors for escalations |
| `BLOCKED` | Work is blocked on something outside both human and agents (e.g., external API, legal review) |

---

## active-task.md

**Owner**: The agent currently doing work  
**Written**: Before every session ends (context approaching limit OR planned stop)  
**Read**: First thing at the start of any new session

This file captures exactly what a new session needs to resume without starting over.

Format:
```markdown
# Active Task
Last updated: YYYY-MM-DD HH:MM
Agent role: [e.g., Backend Developer]

## Task
[One sentence: what is being built]

## Current phase
[e.g., Foundation 2 — Core Data Schema, implementation step 3 of 5]

## What was done this session
- [specific action taken]
- [specific file created or modified, with path]
- [decision made]

## State of in-progress work
[Describe any partially complete work — e.g., "Migration file written at packages/db/migrations/001_core_schema.sql but not yet tested"]

## Locked decisions made this session
[Any decision that must not be reversed in the next session]
- [decision + reason]

## Next concrete action
[Exactly what the next session should do first — specific enough that it requires no re-analysis]

## Blockers for next session
[Anything that prevents the next action — e.g., "waiting for human approval on the core schema"]

## Files touched this session
- [path] — [what changed]
- [path] — [what changed]

## Context the next session needs
[Anything not in the files that a fresh session must know — e.g., "The Drizzle schema uses integer timestamps not DateTime — this was intentional for timezone reasons"]
```

---

## decisions.md

**Owner**: Solution Architect (writes), Tech Lead Reviewer (approves entries)  
**Updated**: When any significant technical decision is made that would be expensive to reverse

This prevents agents in future sessions from re-litigating resolved decisions.

Format:
```markdown
# Locked Decisions
These decisions are final. Do not revisit without explicit human approval.

## [Decision name]
**Date**: YYYY-MM-DD
**Made by**: [agent role]
**Approved by**: [Tech Lead Reviewer / Human]

**Decision**: [what was decided]
**Rationale**: [why this option over alternatives]
**Alternatives rejected**: [what was considered and why it was ruled out]
**Reversal cost**: [what it would take to change this — high/medium/low]
```

---

## How to Start a Session

Every agent, at the start of every session, reads in this order:

1. **`CLAUDE.md`** — project overview, tech stack, domain context
2. **`.harness/README.md`** — agent roles, workflows, rules index
3. **`.harness/state/DELIVERY_STATE.md`** — where is everything right now?
4. **`.harness/state/active-task.md`** — what was being done when the last session ended?
5. **`.harness/state/decisions.md`** — what decisions must not be reversed?
6. **Own agent definition** — own responsibilities and rules

Only after reading all five does the agent take any action.

If `active-task.md` describes a task in progress, **resume that task**. Do not start something new.  
If `active-task.md` is empty or the task is complete, read `DELIVERY_STATE.md` to determine what comes next.

---

## How to End a Session

When context is approaching its limit (or work is stopping for any reason):

1. **Finish the current atomic unit of work** — do not stop mid-migration, mid-test, or mid-function. Reach a stable point.
2. **Write `active-task.md`** — fill every section. This is not optional.
3. **Update `DELIVERY_STATE.md`** — update the foundation/feature status AND rewrite the `Your Next Action` section to reflect what the human needs to do right now.
4. **If a new decision was made**, add it to `decisions.md`.
5. **Commit or stage any file changes** so they are not lost.

The `Your Next Action` section is the human's entry point. If it is stale, the human wastes time re-reading the full file to figure out what to do. This update is not optional.

The test: a completely new session reading only the harness files should be able to continue the work without asking clarifying questions.

---

## Monitoring Context Usage

Agents should self-monitor context usage. When context is at approximately 60–65% full:

- Begin wrapping up the current unit of work
- Do not start a new subtask that cannot be completed in the remaining context
- Prepare to write the session state

When context is at approximately 75–80% full:

- Stop new work
- Write `active-task.md` and update `DELIVERY_STATE.md`
- Signal to the human that the session is ending and the next session can resume

---

## Resuming After a Context Limit

When a session ends due to context limit (not a planned stop), the work may be partially complete. The next session must:

1. Read all state files (see How to Start a Session)
2. Check `active-task.md` section "State of in-progress work" for partially complete items
3. Verify the partially complete files are in a valid state before continuing
4. Do not assume the previous session's last action was successful — verify it

Example: if `active-task.md` says "migration file written but not tested," the new session runs `pnpm db:migrate` before doing anything else.

---

## Delivery Manager's Role in Session Continuity

The Delivery Manager is responsible for `DELIVERY_STATE.md`. When any other agent completes a phase or hits a blocker:

- That agent writes `active-task.md` with the status
- The Delivery Manager updates `DELIVERY_STATE.md` to reflect the new state
- In the next session, the Delivery Manager reads both files and reports to the human if anything requires action

If the Delivery Manager's own session ends, it writes `active-task.md` with the current delivery state snapshot so a new Delivery Manager session can take over cleanly.

---

## Anti-Patterns to Avoid

| Anti-pattern | Why it breaks continuity |
|---|---|
| Keeping decisions only in context | Lost when session ends; next session re-debates the same question |
| Writing `active-task.md` only when context is already full | Not enough remaining context to write it properly |
| Starting new work at the beginning of a session without reading state files | Risks duplicating work or contradicting locked decisions |
| Vague "next action" in `active-task.md` | Next session spends time re-analyzing instead of acting |
| Assuming previous session's partial work succeeded | Silent corruption of migrations, test data, or config |
| Not updating `DELIVERY_STATE.md` after a phase completes | Delivery Manager reports stale state to human |
