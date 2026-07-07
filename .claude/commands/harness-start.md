---
name: harness-start
description: Interactive onboarding — set up the harness for a new project in one guided pass (profile, foundations, state files, relevant skills).
argument-hint: "<optional: one line about what you're building>"
outputs:
  - Chosen profile (lite or full)
  - Filled state files (STATE.md or DELIVERY_STATE.md + active-task.md)
  - Project Overview + Tech Stack in CLAUDE.md
  - A shortlist of skills relevant to the first goal
  - The single next action
---

# /harness-start

The fast on-ramp for someone new to this kit. Instead of asking the human to read ~770 lines
of docs first, Claude does the setup **with** them in one guided pass. Run this once per new
project.

## Invocation

```text
/harness-start a small internal tool to track team OKRs, Next.js + Postgres
```

The argument is optional — if omitted, Claude asks.

## Workflow (Claude follows these steps)

> Ask questions one batch at a time with `AskUserQuestion`. Keep it to a few minutes. Do not
> dump the whole mental model — link [`.harness/GUIDE.md`](../../.harness/GUIDE.md) for "why"
> and move on.

1. **Check if already set up.** Read `.harness/state/STATE.md` and
   `.harness/state/DELIVERY_STATE.md`. If either is filled (not the template), don't re-onboard
   — summarize the current state, point to the active task, and stop. Onboarding is for fresh
   projects only.

2. **Run the F0 readiness pre-flight.** Report the SessionStart readiness signals for this repo:
   - Primary instruction file present and lean (`CLAUDE.md` < ~600 lines)
   - Repo on a **local** path (warn if under OneDrive/Dropbox/iCloud — it corrupts state)
   - Hooks active (`.claude/settings.json`), skills present
   Fix or flag anything red before continuing. (This is Foundation 0 in
   [`workflows/foundations.md`](../../.harness/workflows/foundations.md).)

3. **Pick a profile.** Ask lite vs full with a recommendation:
   - **Lite** (default for solo / MVP / prototype): 1 state file, 3 phases (Plan → Build →
     Verify). Recommend this unless the project needs teams, compliance, or many interdependent
     features.
   - **Full**: 3 state files, 7 phases, 8 agent roles, per-phase approval gates.

4. **Learn the project.** From the argument or by asking: (a) one-to-two sentence description,
   (b) tech stack, (c) the first concrete goal. Keep it short.

5. **Propose foundations.** Derive a foundation list from the stack (scaffold → data model →
   access/auth → core domain logic). Always keep **F0: Workspace & Agent Readiness** first.
   Show the proposed list and let the human edit before writing.

6. **Write state.** Fill the files for the chosen profile:
   - Lite → `.harness/state/STATE.md` (project line, foundations, first task).
   - Full → `.harness/state/DELIVERY_STATE.md` (foundations), `active-task.md` (first task),
     and note any decisions to lock in `decisions.md`.
   Also fill **Project Overview** and **Tech Stack** in [`CLAUDE.md`](../../CLAUDE.md).

7. **Point to the right skills.** Based on the first goal, name the **3–5** relevant skills (or
   the slash command that chains them) from [`.claude/skills/README.md`](../skills/README.md) —
   not the whole list. E.g. fuzzy problem → `/discover`; ready to spec → `/write-prd`.

8. **State the single next action** and stop. One sentence: what to do next and which file/skill.

## Checkpoints

- Never start feature/source work during onboarding — this only sets up state. The
  `harness-guard` hook still applies.
- Let the human approve the foundation list before writing it.
- If readiness (step 2) has a hard red (cloud-sync path), resolve it before writing state.

## Next Steps

- Resume normally: the SessionStart hook injects the state digest each session.
- Lost? Re-read [`.harness/GUIDE.md`](../../.harness/GUIDE.md) for the full mental model.
- Browse capabilities: [`.claude/skills/README.md`](../skills/README.md).
