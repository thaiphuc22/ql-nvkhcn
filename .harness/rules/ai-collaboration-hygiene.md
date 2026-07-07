# AI Collaboration Hygiene

How to work *well* with an AI coding agent. The other rules in `.harness/rules/`
govern the **code** and the **process**; this one governs the **collaboration** —
prompt quality, session discipline, tool use, and context management.

These are not blocking gates. They are habits the agent (and the human driving it)
should hold each other to. The Tech Lead Reviewer may cite them when a change shows
signs of rushed or low-context AI work.

> **Provenance.** The taxonomy below is distilled from the 45 anti-patterns in
> [microsoft/AI-Engineering-Coach](https://github.com/microsoft/AI-Engineering-Coach)
> (`src/core/rules/`, MIT License), rewritten as prose guidance rather than runtime
> detectors. Their five practice groups are kept as the section structure.

---

## 1. Prompt quality

- **No lazy prompts.** A one-line "fix the bug" forces the agent to guess. State the
  intent, the constraints, and the expected output shape. If a prompt is under ~30
  characters and isn't a follow-up, it's probably under-specified.
- **Don't re-send the same prompt.** If a prompt didn't work, *rephrase or add
  context* — retrying the identical message near-verbatim 3+ times burns quota and
  rarely produces a different result. Each retry should change something.
- **Compress verbose prompts.** A wall of pasted text with no structure is as bad as
  too little. Lead with the ask, then the relevant context, then constraints.
- **Spell out constraints.** Name the files, the framework version, the patterns to
  follow or avoid. Low-constraint prompts produce plausible-but-wrong code.

## 2. Session hygiene

- **Keep sessions scoped.** One mega-session that drifts across many unrelated tasks
  loses coherence and bloats context. Start a fresh session when the topic changes.
- **Don't abandon mid-task.** A session left with a half-applied change and no
  resolution is a landmine for the next session. Finish, revert, or record the state
  in `.harness/state/active-task.md` before stopping. (See [session-continuity.md](session-continuity.md).)
- **Watch for runaway agent loops.** If the agent is iterating without converging
  (repeated near-identical tool calls, no new information), stop and re-frame the task
  rather than letting it spin.
- **Mind frustration signals.** Repeated cancellations, terse angry retries, or
  profanity are a tell that the approach is wrong — step back and change strategy, not
  just the wording.

## 3. Code review

- **No copy-paste blindness.** Read generated diffs before accepting. Speed-accepting
  large changes without review is how subtle bugs and security holes land.
- **Don't auto-approve everything.** Blanket "yes to all" / YOLO mode on terminal and
  file edits removes the one checkpoint that catches destructive actions. Keep approval
  for irreversible or outward-facing steps. (See [approval-policy.md](approval-policy.md).)
- **Verify, don't assume.** "It compiled" ≠ "it works". Run it; check the behavior the
  change was supposed to produce.

## 4. Tool mastery

- **Use plan mode for non-trivial work.** Jumping straight to edits on a multi-step
  task skips the cheapest place to catch a wrong approach. Plan first.
- **Use skills and slash commands.** Repeated manual workflows that a skill already
  covers waste effort. If you do the same multi-step thing 3+ times, promote it to a
  skill (see the `skill-authoring-workflow` skill).
- **Right-size the model and reasoning effort.** Don't spend a premium / high-reasoning
  model on a lookup question a cheaper path answers. Don't under-power a genuinely hard
  task either.
- **Avoid MCP tool bloat.** Dozens of half-used MCP tools dilute the agent's tool
  selection. Enable what the project actually needs.

## 5. Context management

- **Keep instruction files lean.** An oversized `CLAUDE.md` / instructions file crowds
  out task-specific context in every prompt. Put durable rules in `.harness/rules/`,
  not one giant file. (The SessionStart hook warns when the primary file exceeds ~600 lines.)
- **Don't over-stuff file context.** Attaching the whole repo to every request raises
  cost and lowers signal. Include the files that matter for *this* task.
- **Mind context saturation.** When a session approaches its context window, quality
  degrades and compaction storms begin. Split the work or summarize state into
  `.harness/state/` before continuing.
- **Keep the project off cloud-sync folders.** A repo under OneDrive/Dropbox/iCloud
  corrupts agent state files via sync conflicts. Use a local path. (The SessionStart
  hook flags this.)

---

## How this is surfaced

- The **SessionStart hook** ([`.claude/hooks/session-start.js`](../../.claude/hooks/session-start.js))
  reports an *agentic-readiness* line and warns on the two mechanical footguns above
  (cloud-sync location, oversized instruction file).
- The remaining items are judgment calls for the human and the reviewer — there is no
  hook that can detect a lazy prompt or an unreviewed accept. Treat this file as the
  shared standard both sides point to.
