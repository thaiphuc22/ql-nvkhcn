# Lite Profile

A lightweight alternative to the full harness for **small / fast / solo** projects.

| | Full harness | Lite profile |
|---|---|---|
| State files | 3 (`DELIVERY_STATE.md`, `active-task.md`, `decisions.md`) | 1 (`STATE.md`) |
| Phases | 7 (Requirements → … → Done) | 3 (Plan → Build → Verify) |
| Agent roles | 8 distinct roles + hand-offs | none — you run all phases |
| Human approval gates | per-phase | none (you decide) |
| Foundations-before-features | ✅ enforced | ✅ enforced (the one rule kept) |
| Persistent state across sessions | ✅ | ✅ |

**Use lite when:** MVP, prototype, side-project, or a solo build where the full
process costs more than it returns.

**Use full when:** a team is involved, there are compliance/regulatory constraints,
features start depending on each other, or you need explicit approval gates.

---

## Switch to lite mode

From the project root:

1. Copy the lite state template into the live state dir:
   - `.harness/lite/STATE.md` → `.harness/state/STATE.md`
2. Remove the three full-harness state files so there's a single source of truth:
   - delete `.harness/state/DELIVERY_STATE.md`, `active-task.md`, `decisions.md`
3. Fill in `.harness/state/STATE.md` (foundations + first task).
4. In `CLAUDE.md`, follow [`lite/workflow.md`](workflow.md) instead of the full
   `workflows/feature-delivery.md`.

The `SessionStart` and `harness-guard` hooks detect the mode automatically: if
`.harness/state/STATE.md` exists they treat the project as lite; otherwise they read
the full `DELIVERY_STATE.md`. No hook changes needed.

## Switch back to full mode

1. Re-create the three files from the templates in `.harness/state/` (see git history
   or the original kit), moving each section of `STATE.md` to its home:
   - **Foundations / Now / Blockers** → `DELIVERY_STATE.md`
   - **Active task** → `active-task.md`
   - **Locked decisions** → `decisions.md`
2. Delete `.harness/state/STATE.md`.

Because lite `STATE.md` uses the same section names, the move is mechanical.
