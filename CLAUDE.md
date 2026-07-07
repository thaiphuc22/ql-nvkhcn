# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.
It is the **project-agnostic harness template**. When you start a real project,
fill in the `## Project Overview` and `## Tech Stack` sections and adapt the
harness contents under `.harness/` to your domain.

> **New to this kit?** Read [`.harness/GUIDE.md`](.harness/GUIDE.md) first (Tiếng Việt:
> [`.harness/GUIDE.vi.md`](.harness/GUIDE.vi.md)) — it explains the whole mental model (the
> two layers, the state files, the phases, the seam) with examples. This file is the protocol
> to follow; the guide is how to understand it.

## Harness Protocol — MANDATORY, read before anything else

This project uses a delivery harness under `.harness/`. **You must follow it strictly.**
Do not write code, plan features, or suggest next steps without first consulting the
harness state.

### Session start checklist (run every session, no exceptions)

> A `SessionStart` hook ([`.claude/hooks/session-start.js`](.claude/hooks/session-start.js))
> auto-injects a digest of the current state at the top of each session. That digest is a
> pointer, not a substitute — still read the files below in full before acting.

1. Read `.harness/state/DELIVERY_STATE.md` — what is complete, what is next, what is blocked.
2. Read `.harness/state/active-task.md` — the current task, phase, files to read, next action.
3. Read `.harness/state/decisions.md` — locked decisions you must not re-open.
4. Only after reading all three: proceed with the work described in `active-task.md`.

**Lite profile:** small/solo projects may use the single-file lite profile instead — then
read `.harness/state/STATE.md` (one file) and follow `.harness/lite/workflow.md` (Plan →
Build → Verify). See [`.harness/lite/README.md`](.harness/lite/README.md).

### Hard rules

- **Never start work outside the active task.** If the delivery state says a given task
  is next, do not begin something else.
- **Never skip a foundation.** No feature work begins until all foundations are marked
  COMPLETE in `DELIVERY_STATE.md`.
- **Never re-open locked decisions.** Approved tech stack, schema, and patterns in
  `decisions.md` are final.
- **Update harness state after every task.** When a task completes, update
  `DELIVERY_STATE.md` and `active-task.md` before ending the session.
- **Human approval gates are real.** If a foundation requires human approval before
  implementation (see `.harness/workflows/foundations.md`), stop and ask.

### Enforcement hooks (not just prose)

Two committed hooks in [`.claude/settings.json`](.claude/settings.json) give the rules above teeth:

- **`SessionStart`** → injects the current delivery-state digest every session (full or lite).
- **`PreToolUse` (Edit/Write)** → `harness-guard.js` warns when you edit source code while the
  harness state is uninitialized or has 0 foundations complete. It ignores edits to
  `.harness/`, `.claude/`, and `docs/`. Soft by default; set `HARNESS_GUARD_STRICT=1` (env) to
  turn the warning into a hard block.

### Where to find things

| File | Purpose |
|---|---|
| `.harness/state/DELIVERY_STATE.md` | Current completion status of all foundations and features |
| `.harness/state/active-task.md` | The single task currently in flight |
| `.harness/state/decisions.md` | Locked architectural and tooling decisions |
| `.harness/state/STATE.md` | Lite profile: single-file state (replaces the three above) |
| `.harness/lite/` | Lite profile: 1-file state + 3-phase workflow for small projects |
| `.harness/workflows/foundations.md` | Full spec for foundations including done-when checklists |
| `.harness/workflows/feature-delivery.md` | Feature module delivery workflow |
| `.harness/rules/` | Coding standards, review policy, e2e testing policy, approval policy |
| `.claude/hooks/` | Enforcement hooks (SessionStart digest, foundations guard) |

---

## Project Overview

**QTKHCN** (Quản lý Nhiệm vụ Khoa học Công nghệ) is the workflow/dossier management system
for Viettel High Tech (VHT), digitizing the multi-level approval flow for R&D missions
(RD01–RD10: chủ trương → xét duyệt → thực hiện → điều chỉnh → nghiệm thu → quyết toán).

Scope splits into **2 phân hệ**: (1) *Phân hệ Quản lý Quy trình* — the Camunda 8 workflow
engine, shared infrastructure for all RD flows; (2) *Phân hệ Quản lý Nhiệm vụ KHCN* — the
business subsystem consuming that engine. Phase 1 (2026) targets RD01, RD02, RD05, RD06,
RD08, RD10, RD03.6; RD03/RD04 are Phase 2. See `docs/req/scope-2-phanhe.md`.

Current state: frontend mock (mock data, no backend) covering RD01/RD02/RD05 dossier flows
is built and deployed. Backend + real Camunda integration have not started — see
`.harness/state/DELIVERY_STATE.md` for exact foundation status before doing any feature work.

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Ant Design v5, React Router v6, Vietnamese
  locale (`antd/locale/vi_VN`). BPMN authoring: `bpmn-js` + `bpmn-js-properties-panel` +
  `zeebe-bpmn-moddle`. Forms: `@bpmn-io/form-js` (Camunda Forms rendered in custom UI, not
  default Tasklist).
- **Workflow engine**: Camunda 8 (Zeebe/Operate/Tasklist/Identity/Optimize) — orchestration
  only; holds correlation/control variables (`maHoSo`, `cap`, ...), never business data.
- **Backend / DB / Camunda deployment model**: **not yet decided** — see
  `.harness/state/decisions.md` → "Open decisions blocking Foundation 1". Do not assume a
  stack; ask before writing backend code.

## Development Commands

```bash
cd webapp
npm install
npm run dev          # Vite dev server, http://localhost:5173
npm run build         # tsc -b && vite build
npm run typecheck     # tsc -b --noEmit
```

Backend commands: none yet (Foundation 1 not started).

## Architecture

- **Core domain split**: `NhiemVu` (Mission — one master record per đề tài, whole lifecycle)
  and `HoSo` (Dossier — one row per document package per RD stage) are separate entities in
  a 1–N relationship, never merged. See `docs/req/data-model-NV-vs-HoSo.md` (decision D8 in
  `.harness/state/decisions.md`) and the existing shapes in `webapp/src/data/nhiemVu.ts` /
  `dossiers.ts`.
- **RBAC**: role codes double as Camunda `candidateGroup`s (see `webapp/src/data/roles.ts`);
  a user may act on a dossier step only if they hold one of that step's `vaiTroCodes` —
  fail-closed (empty list = admin-only). See decision D9.
- **Camunda boundary**: business data always lives in the app's own domain DB; Camunda
  process variables are correlation/control only (decision D3). Never add business fields to
  Camunda variables to "save a lookup."
- **Full research/architecture notes**: `docs/research/` (brainstorm-level, see
  `docs/research/SUMMARY.md`), `docs/arch/` (Camunda design, more concrete), `docs/req/`
  (requirements, RTM, backlog — the source of truth for what's actually committed).
