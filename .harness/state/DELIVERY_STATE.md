# Delivery State

**Owner**: Delivery Manager
**Last updated**: 2026-07-07 (Exception module: split Approve/Apply + 4 permissions + Exception Policy Engine; Action Registry: SUPPORT actions + More Actions menu; Action Studio admin page mocking all 4 pillars of the Action Availability Model incl. the previously-missing action_availability_policy table; DossierDetail + Action Studio now share ONE availability-policy evaluator — unified)

---

## Your Next Action

> **Status**: FOUNDATIONS IN PROGRESS — F0 complete, F1 blocked on architect decisions
> (backend stack, DB engine, Camunda deployment model). F2/F3/F5 have working prototypes
> in the frontend mock that still need to be formalized server-side. F4 not started.
> **Do not start EPIC work (Configuration Service EPICs or further RD flows) until F1–F5
> are COMPLETE.** See `active-task.md` for the concrete next step.

_This section is updated by the Delivery Manager at the end of every session.
If you are ever unsure what to do, read this section._

---

## Foundations

- [x] F0: Workspace & Agent Readiness — `COMPLETE` (CLAUDE.md 105 lines, hooks active, skills present, repo on local path)
- [ ] F1: Project Scaffold (Frontend done / Backend + Camunda topology) — `BLOCKED`
      — Frontend (React+Vite+AntD+TS, deployed to Vercel) is done. Backend does not exist yet.
      Blocked on: backend language/framework, domain DB engine, Camunda 8 deployment model
      (Self-Managed vs SaaS) — all explicitly left open by the user on 2026-07-07, see
      `decisions.md` → "Open decisions blocking Foundation 1".
- [ ] F2: Core Data Schema (NhiemVu / HoSo / Organization / Role / User) — `PARTIAL`
      — Data model decided (`docs/req/data-model-NV-vs-HoSo.md`) and prototyped as TS mock
      types (`webapp/src/data/nhiemVu.ts`, `dossiers.ts`, `roles.ts`, `users.ts`, `orgUnits.ts`).
      Missing: real DB schema/migrations, PL6 (dự toán) field definition, mã NV/mã hồ sơ
      generation rule.
- [ ] F3: Access Model (RBAC / Camunda candidateGroup mapping) — `PARTIAL`
      — 26 role/candidateGroup codes + fail-closed step-permission logic prototyped in
      `webapp/src/data/permissions.ts` (frontend-only mock). Missing: server-side enforcement,
      SSO/IAM protocol decision (`OQ-021`), RBAC granularity sign-off (`OQ-006`).
- [ ] F4: Core Domain Engine (Dossier/Mission status + SLA-escalation + DMN routing) — `NOT STARTED`
      — `hanXuLy` (SLA due date) exists as a mock field only; no escalation computation yet.
      DMN decision tables for Đạt/Chưa đạt and phân cấp Cơ sở/Tập đoàn routing (D5 in
      `decisions.md`) not yet built.
- [ ] F5: Auth + App Shell — `PARTIAL`
      — Shell (Sider + Header, routing) exists in `webapp/src/App.tsx`. Login is a mock
      (`DEMO_PASSWORD`), not wired to real SSO/Camunda Identity — blocked on the same
      SSO/IAM protocol decision as F3.

---

## Active Feature Workstreams

<!-- No feature/EPIC work starts until F1–F5 above are COMPLETE. -->

- [ ] **RD01/RD02/RD05 dossier flows (EP-05, `docs/req/EPIC-QLNVKHCN-backlog.md`)** — `IN PROGRESS (frontend mock)` — 20 US / 102 pts scoped, ~10 US flagged blocked on OQ-001/002/003/006. Tracked in `docs/req/RTM.md`. Real backend/Camunda wiring waits on F1–F5.
- [ ] **Controlled Exception Handling (`docs/research/controlled-exception-handling.md`)** — `IN PROGRESS (frontend mock, 2026-07-07)` — Full lifecycle now Request → Approve → **Apply** → (or Reject), with approve and apply **split into two separate steps/permissions** (2026-07-07): approving only records authorization (`approved`), a separate Apply action executes the routing (`applied` + `applyExceptionSkip`), so no single person both authorizes and executes. All 4 documented permissions now modeled: `REQUEST_EXCEPTION`/`APPROVE_EXCEPTION`/**`APPLY_EXCEPTION`**/**`VIEW_EXCEPTION_AUDIT`** in `permissions.ts` (last two added 2026-07-07; audit card in `DossierDetail.tsx` is now gated by VIEW_EXCEPTION_AUDIT — only participants/approvers/admin see it). Who-can-approve / require-evidence / max-times-per-dossier moved out of the old static `EXCEPTION_APPROVER_ROLES` table into the Exception Policy Engine (see next bullet). Files: `webapp/src/data/exceptions.ts`, `webapp/src/data/exceptionPolicy.ts`, `webapp/src/store/ExceptionContext.tsx` (`approveException`/`applyException`/`activeFor`), `DossierDetail.tsx`. Taxonomy still 3 of 12 (`BypassCouncil`, `JumpToHigherApprover`, `SkipStep` — reducible to "skip forward"); the rest (AddReviewer/ReplaceApprover/Reopen…) need real F4 mechanisms. Real enforcement/persistence waits on F1–F4.
- [ ] **Action Availability Model (`docs/research/action-availability-model.md`)** — `IN PROGRESS (frontend mock, Phase A, 2026-07-07)` — Standard + Exception action rendering unified behind one evaluator instead of hard-coded per-button JSX: `webapp/src/data/actionRegistry.ts` (Action Registry), `webapp/src/data/actionAvailability.ts` (`getAvailableActions`, mocks the future `GET /dossiers/{id}/available-actions`), `DossierDetail.tsx` refactored to render from it — including filtering the exception-type Select to only policy-enabled types (previously showed all 3 unconditionally). **All 3 action categories now modeled (2026-07-07)**: added the `SUPPORT` type + `SUPPORT_ACTION_CODES` (`ADD_COMMENT`/`DOWNLOAD_DOSSIER`/`VIEW_HISTORY`) to `actionRegistry.ts`; `getAvailableActions` returns support actions in every dossier status (they don't change the main flow) so STANDARD/SUPPORT/EXCEPTION are all rendered. `DossierDetail.tsx` groups support actions into a **"Thao tác khác ▾" dropdown** (doc mục 9's "More Actions"), separate from primary/exception buttons; all 3 work offline in the mock — Comment persists to local state + renders an "Ý kiến trao đổi" card, Xem lịch sử opens a consolidated timeline modal (steps + exceptions + comments), Tải hồ sơ exports a client-side text summary via Blob. Real handlers (persistence, kho tài liệu, audit API) wait on F1. **Exception `conditionExpression` is now evaluated, not just illustrative (2026-07-07)**: new Exception Policy Engine `webapp/src/data/exceptionPolicy.ts` (`EXCEPTION_POLICIES` configurable table keyed by exceptionType × cap + `resolveExceptionPolicy` first-match, mirrors `approvalMatrix.ts`). `getAvailableActions` now resolves policy per exception type to decide allowed (policy exists for this cap), `requireEvidence`, and `maxTimesPerDossier` (blocks a 4th button once the per-dossier cap is hit); the request modal enforces evidence when the resolved policy requires it. Standard-action `conditionExpression` for SUBMIT/PROCESS_STEP remains illustrative. Phase B (real API, DB-backed policy tables, real Camunda task context) waits on F1. **Action Studio admin page (2026-07-07)**: new `webapp/src/pages/ActionStudio.tsx` (routed `/cau-hinh-hanh-dong`, admin-only, under Vận hành & Tích hợp) makes all 4 doc-§10 pillars tangible as a 4-tab mockup — (1) **Action Registry** read-only catalog grouped by STANDARD/SUPPORT/EXCEPTION; (2) **Availability Policy** = the previously-MISSING `action_availability_policy` table (doc §8), now created as `webapp/src/data/actionAvailabilityPolicy.ts` (configurable rule table + `resolveActionAvailability` first-match resolver + `PERMISSIONS` catalog, mirrors approvalMatrix/exceptionPolicy), with full Rule Builder (add/edit/toggle/delete); (3) **Exception Policy** view + inline edit (toggle enabled, requireEvidence, maxTimesPerDossier) over `EXCEPTION_POLICIES`; (4) **API available-actions inspector** — a live simulator that composes the availability-policy resolver (STANDARD/SUPPORT) + exception-policy resolver (EXCEPTION) into the doc-§4 payload, grouped Primary/More/Exception per doc §9, with a raw JSON view; edits in tabs 2/3 flow into it via lifted state. **Evaluators now UNIFIED (2026-07-07)**: `getAvailableActions` (the live DossierDetail path) no longer hard-branches its STANDARD/SUPPORT tier by `dossierStatus`; it runs that tier through the SAME `resolveActionAvailability` + `ACTION_AVAILABILITY_POLICIES` table (doc §8) that the Action Studio inspector uses — so the dossier detail page and the config page share ONE availability-policy model. Bridge: `DossierDetail.tsx` folds its permission booleans (`canCreateHoSo`→SUBMIT_DOSSIER, `canProcessStep`→PROCESS_STEP, support always) into a `userPermissions[]` list + passes `processCode=LOAI_TO_NHOM[d.loai]`, `userRoleCodes`, `isAdmin`; `getAvailableActions` resolves visible/enabled per action from the table and sorts by `displayOrder`. Seed policies reproduce the previous visibility exactly (SUBMIT only in draft, PROCESS_STEP only in processing, support any status), so no behavior regression. The EXCEPTION tier still flows through the Exception Policy Engine (`exceptionPolicy.ts`) unchanged. `getAvailableActions` input dropped `currentStep`/`canCreateHoSo`/`canProcessCurrentStep`, added `policies?`/`processCode`/`userRoleCodes`/`userPermissions`/`isAdmin`. Verified `npm run build` ✓. All still frontend-mock; real DB-backed policy tables + `GET /available-actions` wait on F1.
- [ ] **Configuration Service EPIC01–16 (`docs/research/configuration-service.md`)** — `NOT STARTED` — brainstorm-level only, not yet a committed backlog. EPIC01 (Organization), EPIC02 (User & Identity), EPIC03 (Role & Permission) substantially overlap with Foundations F2/F3 above — implement as part of those foundations rather than as separate EPIC work.
- [ ] **EPIC06 Approval Matrix (`docs/research/configuration-service-EPIC06.md`)** — `IN PROGRESS (frontend mock, 2026-07-07)` — Ma trận phê duyệt prototyped as the "who approves" layer sitting after BPMN ("where") + DMN/EPIC09 ("what level"). `webapp/src/data/approvalMatrix.ts` (rule model + `resolveApprovers` first-match engine + delegation-by-effective-date overlay, mocks the future `POST /approval-matrix/resolve`), `webapp/src/pages/ApprovalMatrix.tsx` (rules table + Rule Builder modal + Simulation panel, mirrors RuleManager UX). Routed at `/ma-tran-phe-duyet` under Vận hành & Tích hợp (admin-only). Reuses existing mock building blocks (roles/users/orgUnits); resolves candidateGroup→users via `ROLE_LABEL_TO_CODES`. Intentionally out of scope: multi-tenant (single VHT org), drag-drop, org-hierarchy acting-manager resolution, real persistence/enforcement — those wait on F1–F4 and a real Approval Matrix Service.
  - **BPMN wiring (Option A, 2026-07-07)**: Approval Matrix now resolves dossier approval steps → concrete people in `webapp/src/pages/DossierDetail.tsx`. Extracted `resolveGroups(codes, ngay)` (org layer: candidateGroup→users + effective-date delegation overlay) shared by the Simulation page and the dossier view; added `DEMO_TODAY='2026-07-07'` so the TGĐ→Phó TGĐ delegation window fires deterministically in the mock. Current approval step shows a "Người nhận việc — Ma trận phê duyệt" card; pending approval steps show resolved "Dự kiến" assignees inline in the timeline (so the delegation swap is visible on downstream TGĐ steps). Deliberately resolves each step's OWN candidateGroups (no coarse slot inference) to avoid fabricating wrong councils; rule-based group selection by cap/budget stays demonstrated on the Ma trận page's Simulation. Real runtime wiring (Zeebe job worker sets `candidateUsers` at task creation) still waits on F1.

---

## Blockers

- **F1 cannot complete** until an architect/stakeholder decides: backend language/framework, domain DB engine, Camunda 8 deployment model (Self-Managed vs SaaS). Owner: Solution Architect. See `decisions.md`.
- **F3/F5 server-side work** blocked on SSO/IAM protocol choice (`OQ-021`) and RBAC granularity sign-off (`OQ-006`). Owner: Solution Architect + client.
- Several RD flows (RD03, RD04, RD06, RD08) remain requirement-only per `RTM.md` — not a foundation blocker, but flagged so Feature work doesn't assume they're ready.
