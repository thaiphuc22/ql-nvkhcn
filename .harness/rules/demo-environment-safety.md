# Demo Environment Safety

## Status (updated 2026-07-16): release isolation is now implemented

**A public demo is live at `https://drab-quail.runlocal.eu/` and real users are actively using it.**
This is not hypothetical — check current status before assuming otherwise (the URL rotates on
tunnel restart).

The release/workspace separation designed in `docs/plan_deploy/standard-deploy-workflow.md` is now
built and was used for a live cutover on 2026-07-16 (see the dated `DELIVERY_STATE.md` entry). As of
that cutover:

- The live backend on port 8090 runs from `C:\Users\phuctd7\qtkhcn-demo\releases\<release-id>\`, a
  separate `git worktree` checked out from a committed SHA — **not** from this dev workspace.
- Caddy (`infra/demo-tunnel/Start-DemoProxy.ps1`, default `-ReleaseRoot`) serves static files from
  `C:\Users\phuctd7\qtkhcn-demo\current\frontend-angular\dist\...`, where `current` is a directory
  junction repointed atomically by each release cutover.
- Editing/rebuilding files in `backend/`, `frontend-angular/`, or `infra/demo-tunnel/` in this dev
  workspace **no longer reaches the live demo** until someone deliberately runs
  `New-DemoRelease.ps1` + `Switch-DemoRelease.ps1`.

**This meaningfully lowers routine risk**, but does not eliminate it — the release/switch scripts
themselves still exist in this repo, and running them (or manually touching the release directory,
the `current` junction, Caddy, or Runlocal) still affects live users.

---

## Hard rules

1. **Never run `New-DemoRelease.ps1` or, especially, `Switch-DemoRelease.ps1` without the human's
   go-ahead on timing.** `Switch-DemoRelease.ps1` is the only script allowed to stop/restart the
   live backend on port 8090 — it causes a real (few-second) interruption for live users. Confirm
   the deploy window first, per the "hard-to-reverse / affects shared state" guidance in top-level
   `CLAUDE.md`.
2. **`New-DemoRelease.ps1` itself is safe to run any time** — it builds and health-checks in an
   isolated worktree + temp port (`8091` by default) and never touches port 8090, Caddy, or
   Runlocal. Use it freely to prepare a release; the risky step is only the switch.
3. **Never manually edit files inside `C:\Users\phuctd7\qtkhcn-demo\releases\<id>\` or the `current`
   junction target** — those are build outputs of a specific commit, not a place to hand-patch. Fix
   the source in this dev workspace, commit, then cut a new release.
4. **Do not restart the Runlocal tunnel** unless necessary — the free-tier URL changes on every
   restart, breaking the link already shared with users (see `standard-deploy-workflow.md` §1, §6).
   Routine releases never need to touch it (only backend + the `current` junction change).
5. **Do not restart/reload Caddy for routine releases.** Caddy already serves from the `current`
   junction; `Switch-DemoRelease.ps1` only repoints the junction and restarts the backend. A Caddy
   reload is only needed if `infra/demo-tunnel/Caddyfile` itself changes (routing, auth) — that is
   its own confirm-with-human moment, separate from a routine release.
6. **The agent should not read or transmit the real Basic Auth password.** Verifying a real end-user
   login on the public URL is the human's job; the agent can and should verify `401`
   on missing/wrong auth, and reuse the existing `QTKHCN_DEV_API_KEY`/`DEMO_BASIC_AUTH_HASH` values
   from `infra/demo-tunnel/.env.local` programmatically (load into env vars, never print them) when
   scripting a cutover.

See `docs/plan_deploy/v1.md` and `docs/plan_deploy/standard-deploy-workflow.md` for the full design
and the Go/No-Go checklist to run before sharing a URL after any change to routing or auth.
