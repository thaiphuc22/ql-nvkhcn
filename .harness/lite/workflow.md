# Lite Workflow — Plan → Build → Verify

The full harness has 7 phases, 8 agent roles, and per-phase human gates. That is the
right weight for team / compliance-heavy delivery. For an MVP, a side-project, or a
solo build, use this 3-phase loop instead. It keeps the two things that actually
matter — **persistent state** and **foundations before features** — and drops the
ceremony.

You run all three phases yourself (no role hand-offs). One task at a time. Update
[`STATE.md`](STATE.md) at the end of every phase.

---

## The gate that stays: foundations before features

No feature work until every box under **Foundations** in `STATE.md` is checked. This is
the one rule lite mode does not relax — building features on an unstable scaffold or
schema is the most expensive mistake to undo. The `harness-guard` hook warns you if you
edit source code while foundations are unfinished.

---

## Phase 1 — PLAN

Before writing code:

1. State the task in one sentence in `STATE.md` → **Active task**.
2. List the files to read first and read them.
3. Decide the approach. If it's a choice you won't want to revisit, record it under
   **Locked decisions** with a one-line rationale.
4. Define "done": what observable behavior or test proves it works.

Stop and think if: the task touches a foundation, needs a schema change, or is too big
for one sitting (split it).

## Phase 2 — BUILD

1. Implement the smallest slice that reaches "done".
2. Write at least one test that encodes the "done" behavior.
3. Keep the change scoped to the active task — don't drift.
4. Update **Now** in `STATE.md` as you go so a resumed session knows where you stopped.

## Phase 3 — VERIFY

1. Run the test(s) and the app — confirm the observable behavior from PLAN.
2. Run lint / type-check / the existing suite; nothing previously green goes red.
3. If it doesn't match "done", go back to BUILD — do not mark complete.
4. When it passes: tick the box (foundation or task), set **Now** to the next thing,
   clear the **Active task** fields, bump **Last updated**.

---

## Scaling back up

If the project grows (a team joins, compliance enters, features start colliding),
switch to the full harness — see [lite/README.md](README.md) for the one-step switch.
Nothing is lost: the lite `STATE.md` content maps directly onto the full
`DELIVERY_STATE.md` / `active-task.md` / `decisions.md`.
