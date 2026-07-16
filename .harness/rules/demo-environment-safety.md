# Demo Environment Safety

## ⚠️ Live status

**A public demo is live at `https://drab-quail.runlocal.eu/` and real users are actively using it.**
This is not a hypothetical future risk — check current status before assuming otherwise (the URL
rotates on tunnel restart; if unsure whether it's still live, ask the human before touching anything
in the paths below).

See `docs/plan_deploy/v1.md` (deploy design) and `docs/plan_deploy/standard-deploy-workflow.md`
(intended coding/release workflow) for the full plan. **That plan describes a release/workspace
separation (`C:\Users\phuctd7\qtkhcn-demo\releases\<release-id>`) that has NOT been implemented.**
As of 2026-07-16, verified on-disk:

- Caddy (`infra/demo-tunnel/Start-DemoProxy.ps1`) serves static files directly from
  `frontend-angular/dist/frontend-angular/browser` **inside this dev workspace** — not a separate
  release checkout.
- The running backend JAR (`backend/target/qtkhcn-backend.jar`) is built **inside this dev
  workspace** — not a separate release checkout.
- No `qtkhcn-demo/releases/` directory exists anywhere on the machine.

**Practical consequence: this dev workspace IS the demo's live deployment root.** There is currently
no isolation between "coding" and "serving the live demo." Editing, rebuilding, or restarting
anything under `backend/`, `frontend-angular/`, or `infra/demo-tunnel/` can immediately affect real
users on the live URL.

---

## Hard rules while this gap exists

1. **Before rebuilding or restarting the backend or frontend-angular**, check whether the demo is
   currently live and in use (ask the human if unsure) — do not assume it's safe just because it's
   "just a dev change."
2. **Never run destructive or interrupting commands** against the live backend process, the
   `frontend-angular/dist` output, PostgreSQL, or Camunda without explicit human confirmation:
   `taskkill` on the live backend PID, `docker compose down`, deleting/overwriting
   `frontend-angular/dist`, database migrations, `docker volume` operations.
3. **Prefer isolated verification over touching the live processes.** This project's existing
   pattern — used repeatedly in `active-task.md` smoke tests — is to run a *second* backend instance
   on a temporary port (e.g. `8091`) against the isolated test-engine stack, verify there, then stop
   it cleanly. Do not `mvn -o package` + restart port `8090` (the live port) just to test something
   that can be verified on a temp port first.
4. **If a change legitimately needs to ship to the live demo** (bug fix, requested feature), that is
   a deploy action with real-user impact — flag it to the human explicitly before restarting the live
   port 8090 backend or rebuilding `frontend-angular/dist` in place, per the "hard-to-reverse /
   affects shared state" guidance in top-level `CLAUDE.md`. State what will be interrupted and for how
   long.
5. **Do not restart the Runlocal tunnel** unless necessary — the free-tier URL changes on every
   restart, breaking the link already shared with users (see `standard-deploy-workflow.md` §1, §6).

---

## Longer-term fix

The actual fix is implementing the release/workspace separation already designed in
`docs/plan_deploy/standard-deploy-workflow.md` (separate release directory, blue-green port
switchover, Caddy reload instead of full restart). Until that exists, treat every edit to
`backend/`, `frontend-angular/`, and `infra/demo-tunnel/` as potentially live-user-facing, not as
ordinary local dev work.

This rule should be removed or rewritten once the release-separation described above is actually
implemented and verified — at that point, dev-workspace changes will no longer be able to reach the
live demo directly, and rule 1–3 above no longer apply.
