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
| `UI-ubck/` | Vendored `@khcn-core/{common,theme,ui,echarts}` — the shipped subsystem UI library, wired into `frontend-angular` via `file:` deps (D23). Read `*/package/types/*.d.ts` for what it exports before hand-writing any HR Tools component |

---

## Project Overview

**QTKHCN** (Quản lý Nhiệm vụ Khoa học Công nghệ) is the workflow/dossier management system
for Viettel High Tech (VHT), digitizing the multi-level approval flow for R&D missions
(RD01–RD10: chủ trương → xét duyệt → thực hiện → điều chỉnh → nghiệm thu → quyết toán).

Scope splits into **2 phân hệ**: (1) *Phân hệ Quản lý Quy trình* — the Camunda 8 workflow
engine, shared infrastructure for all RD flows; (2) *Phân hệ Quản lý Nhiệm vụ KHCN* — the
business subsystem consuming that engine. Phase 1 (2026) targets RD01, RD02, RD05, RD06,
RD08, RD10, RD03.6; RD03/RD04 are Phase 2. See `docs/req/scope-2-phanhe.md`.

Current state (verified 2026-08-26 against the tree, not from memory): **the backend exists
and runs** — Spring Boot + Flyway through `V39`, plus two extracted services. Real Camunda
integration is in place for RD01.01 / RD02.02. Treat any older claim of "no backend yet" as
stale. Read `.harness/state/DELIVERY_STATE.md` for exact foundation status before feature work.

**Two frontends coexist on purpose** (D17 strangler migration, do not "clean up" either one):

| Path | What it is | Status |
|---|---|---|
| `frontend-angular/` | Angular 21 — ng-zorro-antd 21, plus PrimeNG + `@khcn-core/*` for HR Tools (D23) | **Active development target** — the real client of the backend services |
| `webapp/` | React 18 + Vite + Ant Design v5 | Legacy mock; still the one CI builds and deploys to GitHub Pages (`.github/workflows/deploy-pages.yml`) |

## Tech Stack

- **Frontend (active)**: Angular 21, standalone components + signals, Vietnamese locale.
  Tests: **vitest** (`npm run test`), not Karma. **Two component libraries coexist on purpose
  (D23)** — do not "unify" them:

| Phân hệ | Thư viện | Ghi chú |
|---|---|---|
| `qlnvkhcn`, `quytrinh`, `he-thong` | **ng-zorro-antd 21** (D17) | Styling: `src/theme.less` (ng-zorro Less overrides — the only place theme colors are set) |
| **`hrtools`** (`/hr/**`) | **PrimeNG 21 + `@khcn-core/*`** (D23) | Packages vendored in `UI-ubck/`, wired via `file:` deps. Theme from `@khcn-core/theme` |

  `src/styles/tokens.scss` (`--vht-*` custom properties) is shared by both.
- **Design system**: `docs/design-system/README.md` is the **official source** for every colour,
  type size, spacing, radius and shadow — extracted from the customer's Figma on 2026-08-26 and
  kept in-repo because the Figma access token was revoked afterwards. Read it before writing any
  UI. Three traps documented there: the Figma file's *written* semantic colour labels are stale
  (they say orange `#F95E00`; the real brand is red `#EE0033` — trust the rendered values); the
  Brand and Danger ramps are deliberately identical, so destructive actions must never be
  distinguished by colour alone; and the pagination text says the current page is a *red-outlined*
  cell while `components/pagination.png` (and the shipped subsystem) show a **grey `#F2F2F2` filled**
  cell — the image wins. **When the design system disagrees with the already-shipped Danh mục dùng
  chung subsystem (`vht-ecat-dev.viettelsoftware.com/common-catalog`), the shipped build wins** (D23).
  Six measured differences: font **Roboto** not Inter · buttons/inputs **40px** not 36 · table header
  **40px** · table cell **56px** · nav pill radius **12** not 8 · card radius **16** not 12.
  `docs/design_sample/design-system.md` is the superseded Google-Stitch-derived predecessor — kept
  only to explain leftover values, not to build from.
- **Frontend (legacy mock)**: React 18 + TypeScript, Vite, Ant Design v5, React Router v6.
- **BPMN/Forms** (both frontends): `bpmn-js` + `bpmn-js-properties-panel` + `zeebe-bpmn-moddle`;
  `@bpmn-io/form-js` (Camunda Forms rendered in custom UI, not default Tasklist).
- **Backend**: Java 21 + Spring Boot 4.0.7 + Camunda 8.9.12 (`camunda-spring-boot-starter`),
  PostgreSQL + Flyway, Maven. Three modules, each with its own schema and migrations:

| Module | Port | Migrations |
|---|---|---|
| `backend/` (qtkhcn-backend — process/action/eForm admin) | 8090 | `V1`–`V39` |
| `services/ho-so-service/` (dossiers, hội đồng, my-tasks) | 8093 | 13 |
| `services/identity-service/` (org, users, roles, permissions) | 8095 | 7 |

- **Workflow engine**: Camunda 8 (Zeebe/Operate/Tasklist/Identity/Optimize) — orchestration
  only; holds correlation/control variables (`maHoSo`, `cap`, ...), never business data.

## Development Commands

```bash
# Angular frontend (active)
cd frontend-angular
npm install
npm start             # ng serve + proxy.conf.json → :4200
npm run build         # production build
npm run test          # vitest
npx tsc -b --noEmit   # typecheck only

# React legacy mock (what GitHub Pages deploys)
cd webapp && npm install && npm run dev   # Vite, :5173

# Backend (each module separately; Docker/Camunda must be up first)
cd backend               && mvn spring-boot:run   # :8090
cd services/ho-so-service && mvn spring-boot:run  # :8093
cd services/identity-service && mvn spring-boot:run # :8095
mvn -o test              # offline test run, used in CI (backend-ci.yml, JDK 21)
```

**Local stack gotchas** (these bite every time): start order is Docker → 8090 → 8093 → 4200;
`frontend-angular/proxy.conf.json` must route every new `/api/...` prefix explicitly or the
call 404s silently; the 8090↔8093 hop needs matching internal service tokens or you get a bare
401; and `ng serve` must be restarted after editing the proxy config.

## Architecture

- **Core domain split**: `NhiemVu` (Mission — one master record per đề tài, whole lifecycle)
  and `HoSo` (Dossier — one row per document package per RD stage) are separate entities in
  a 1–N relationship, never merged. See `docs/req/data-model-NV-vs-HoSo.md` (decision D8 in
  `.harness/state/decisions.md`). Authoritative shapes now live in
  `services/ho-so-service/src/main/java/vn/vht/qtkhcn/hoso/domain/{NhiemVu,HoSo}.java`;
  `frontend-angular/src/app/core/models/{nhiem-vu,ho-so}.ts` are the client-side mirrors, and
  `webapp/src/data/*.ts` is the legacy mock copy — when the three disagree, the backend wins.
- **RBAC**: role codes double as Camunda `candidateGroup`s (see
  `frontend-angular/src/app/core/models/roles.ts`, with assignments served by
  `services/identity-service`); a user may act on a dossier step only if they hold one of that
  step's `vaiTroCodes` — fail-closed (empty list = admin-only). See decision D9. Note the
  permission catalog in identity-service **gates real backend actions**, not just UI visibility:
  deactivating a permission code cuts the actual right.
- **Camunda boundary**: business data always lives in the app's own domain DB; Camunda
  process variables are correlation/control only (decision D3). Never add business fields to
  Camunda variables to "save a lookup."
- **Full research/architecture notes**: `docs/research/` (brainstorm-level, see
  `docs/research/SUMMARY.md`), `docs/arch/` (Camunda design, more concrete), `docs/req/`
  (requirements, RTM, backlog — the source of truth for what's actually committed).
- **HR Tools business source**: `docs/hr_tool/` — the customer's own BRD, screen spec and BM0–BM5
  form templates for the **Quản lý chi phí nhân công** subsystem, delivered 2026-08-26. The originals
  are binary Office files; read `docs/hr_tool/trich-xuat/` instead (markdown, regenerate with
  `trich-xuat.py`). This folder **outranks the Figma design** on every business point — data model,
  CPNC formula, statuses, permission matrix, alert thresholds — while `docs/design-system/` still
  outranks it on everything visual. Start at `docs/hr_tool/README.md`.
