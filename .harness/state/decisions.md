# Locked Decisions

**Owner**: Solution Architect

Decisions recorded here are **final** and must not be re-litigated by any agent.
Each entry: what was decided, when, and why.

---

<!-- Example entry:

## D1 — <decision title>
**Date**: <YYYY-MM-DD>
**Decision**: <what was decided>
**Rationale**: <why>
**Status**: LOCKED

-->

## D1 — Workflow engine = Camunda 8
**Date**: 2026-07-03
**Decision**: Camunda 8 is the workflow orchestration engine for RD01–RD10. License confirmed by client.
**Rationale**: Provides BPMN execution, multi-level routing, worklist, council/multi-signoff, DMN, SLA/escalation, audit as shared engine capabilities (P1–P10) instead of building a bespoke workflow engine.
**Source**: `docs/req/scope-2-phanhe.md`, `docs/arch/camunda-design.md`
**Status**: LOCKED

## D2 — Custom UI, not default Camunda Tasklist
**Decision**: Build a custom Vietnamese, multi-role UI calling Camunda APIs directly; do not rely on the default Tasklist for the main business flow.
**Rationale**: Tasklist doesn't fit the multi-role, dossier-centric, Vietnamese-language UX needed for RD01–RD10.
**Source**: `docs/arch/camunda-design.md` (D2)
**Status**: LOCKED

## D3 — Camunda holds orchestration state only, not business data
**Decision**: Camunda process variables carry only correlation/control data (`maHoSo`, `cap`, `ketQuaThamDinh`, `ketQuaKyDuyet`, `loaiDieuChinh`, `quorumDat`, etc. — see `webapp/src/data/variableContract.ts`). All business data (hồ sơ, phiếu, dự toán, sản phẩm, quyết định, files) lives in the app's own domain database, not in Camunda.
**Rationale**: Keeps Camunda replaceable/upgradable and avoids coupling business schema to workflow engine internals.
**Source**: `docs/arch/camunda-design.md` (D3)
**Status**: LOCKED

## D4 — One process definition per RD flow + reusable call-activity subprocesses
**Decision**: Each RD flow (RD01, RD02, RD05, ...) is its own BPMN process definition; shared segments are extracted as call-activity subprocesses rather than building one mega-process.
**Source**: `docs/arch/camunda-design.md` (D4)
**Status**: LOCKED

## D5 — DMN for structured decisions
**Decision**: Structured routing/decision logic (Đạt/Chưa đạt, phân cấp Cơ sở/Tập đoàn, etc.) is expressed as DMN decision tables called from Business Rule Tasks, not hardcoded in BPMN gateways or backend if/else.
**Source**: `docs/arch/camunda-design.md` (D5); consistent with `docs/research/configuration-service.md` EPIC09 discussion.
**Status**: LOCKED

## D6 — Camunda Forms (form-js) rendered in custom UI
**Decision**: Dynamic forms use `@bpmn-io/form-js` (Camunda Forms), rendered inside the custom UI — not the default Tasklist forms UI. Already prototyped: `webapp/src/forms/phieuNhanXet.ts`.
**Source**: `docs/arch/camunda-design.md` (D6)
**Status**: LOCKED

## D7 — Frontend stack: React + Vite + TypeScript + Ant Design
**Decision**: Web SPA built with React 18 + TypeScript, Vite (dev/build), Ant Design v5 (+ icons), React Router v6, Vietnamese locale (`antd/locale/vi_VN`). BPMN authoring uses `bpmn-js` + `bpmn-js-properties-panel` + `zeebe-bpmn-moddle`.
**Rationale**: Already implemented and deployed (Vercel); mock-data phase covers RD01/RD02/RD05 dossier flows.
**Source**: `webapp/package.json`, `webapp/README.md`
**Status**: **SUPERSEDED BY D17** (2026-07-15) — kept for history. `webapp/` (React) remains as a
living reference spec for already-approved UX/business rules until each module reaches parity on
the new Angular stack; it is not deleted at D17's lock date.

## D8 — Nhiệm vụ (Mission) and Hồ sơ (Dossier) are separate entities, 1–N
**Decision**: `NhiemVu` (one master record per đề tài, spans full lifecycle) and `HoSo` (one row per document package per business-flow stage: RD01/RD02/RD03.6/RD04/RD05/RD06) are modeled as two normalized tables with a 1–N relationship, joined only in UI view models — not merged into one table.
**Rationale**: A mission goes through multiple dossiers over its life; conflating them would duplicate mission-level fields (Chủ nhiệm, Dự toán, Nhân sự PL1) across every dossier and break lifecycle tracking.
**Source**: `docs/req/data-model-NV-vs-HoSo.md`; already implemented as `webapp/src/data/nhiemVu.ts` + `webapp/src/data/dossiers.ts`.
**Status**: LOCKED

## D9 — Role/permission model: 26 candidateGroup role codes, fail-closed step permission
**Decision**: Roles are represented as `Role.code` values acting as Camunda `candidateGroup`s (e.g. PM, PA, NNC, CQ_KHCN, HDKHCN, TGD_VHT, ...), grouped by "nhóm" (Khởi tạo/Xây dựng, Chuyên quản, Ban Giám đốc, Hội đồng, Cấp Tập đoàn, ...). A user may act on a dossier step only if they hold one of that step's `vaiTroCodes`; an empty `vaiTroCodes` list means admin-only (fail closed, not fail open).
**Rationale**: Mirrors BPMN `zeebe:AssignmentDefinition` candidate groups so the RBAC model maps directly onto Camunda task assignment once the backend is real.
**Source**: `webapp/src/data/roles.ts`, `users.ts`, `permissions.ts` (currently mock/frontend-only — real enforcement must move server-side, see F3).
**Status**: LOCKED (shape) — enforcement layer still open, see Foundation 3.

## D10 — eForm binds to the Action layer (per-outcome actions, form-by-reference on Availability Policy)
**Date**: 2026-07-07
**Decision**: Evolves the form-binding model from D6. Instead of one form bound to each UserTask + one generic `PROCESS_STEP` action, the model becomes:

1. **Per-outcome STANDARD actions.** Replace the single generic `PROCESS_STEP` with a small, fixed, semantic set of outcome actions — `SUBMIT`, `APPROVE_STEP`, `RETURN_STEP`, `REJECT_STEP` — reused across every step via policy. This generalizes per *outcome* (bounded, meaningful), **not** per user task (which would explode the Registry — explicitly rejected). A "Phê duyệt" step thus surfaces 3 buttons (Đồng ý / Từ chối / Yêu cầu điều chỉnh), not one "Xử lý".
2. **eForm binds on `ActionAvailabilityPolicy` via `formKey`**, keyed by (action × `taskDefinitionKey` × `processCode` × `dossierStatus`). All form binding is consolidated into **Action Studio**; the "Biểu mẫu theo bước" screen no longer owns a second binding path. Form Library remains the single form authoring/CRUD source.
3. **Binding is by reference, never embed → `1 eForm : n Action`.** Policy stores a `formKey` pointing into Form Library; many policy rows/actions may reference the same form (Action→Form is n:1, Form→Action is 1:n). Editing a form once propagates to all actions. Granularity is **whole-form-per-outcome** (option a): no base-form + delta composition; if outcomes share fields the schema content is duplicated at authoring time, but a shared form is referenced (not copied) when outcomes are identical.
4. **Actions carry an `outcome` tag only; targets stay in `stepRouting.ts`.** An action tags itself `SUBMIT|APPROVE|RETURN|REJECT`; the destination step is still resolved by `resolveRouting`. Routing table remains the sole owner of "đi đâu", shared by both buttons and `StepRoutingDiagram` — preserves the flow-view single-source-of-truth. Forms drop the `ketLuan` decision field (the button *is* the decision; the form is only supporting data).
5. **BPMN ↔ Action bridge = a pull-based "Đồng bộ/Đối soát từ BPMN" in Action Studio.** Admin-triggered (not an auto push-on-deploy) to avoid orphan churn across Camunda process versions. It scaffolds one policy row per outcome branch of each user task and runs a two-way coverage check: 🔴 user task with no enabled action (fail-closed = stuck step), 🟡 policy present but form/role unfilled, ⚪ policy → `taskDefinitionKey` no longer in BPMN. A "bỏ qua có chủ đích" flag suppresses intentional no-button tasks. Because the system is fail-closed, this coverage guarantee is a **correctness** mechanism, not just convenience.

**Rationale**: Different outcomes genuinely need different eForms (approve = ký/ý kiến, reject = lý do bắt buộc, adjust = sửa gì + trả về đâu). The old single-form + routing-radio approach encoded the outcome twice (form `ketLuan` field *and* routing) and bolted routing UI onto the modal. Splitting removes the double representation and lets availability/tone/form be configured per outcome, while the outcome-tag + `resolveRouting` guardrail keeps buttons and the branch diagram from drifting.
**Source**: Design session 2026-07-07 (BA/PM). Affects `webapp/src/pages/ActionStudio.tsx`, `data/actionRegistry.ts`, `data/actionAvailabilityPolicy.ts`, `components/TaskFormModal.tsx`, `data/stepRouting.ts`. Extends D6; consistent with D2/D3 (custom UI owns rendering; Camunda holds no business data) and the flow-view decision.
**Status**: LOCKED (model shape) — frontend-mock implementation DONE 2026-07-08 (all 5 points): points 1–4 via the UI cut-over (DossierDetail/TaskFormModal/Worklist, 3 outcome buttons, form-by-reference on policy); point 5 via `data/bpmnReconcile.ts` + the "Đồng bộ BPMN" tab in Action Studio (pull-based scaffold + 🔴/🟡/⚪ coverage check). See the D10 bullet in `DELIVERY_STATE.md`. Real DB-backed policy tables + a real BPMN/Camunda parse still wait on F1.

## D11 — Data scope is a per-user overlay (`UserRoleAssignment`), not a field on `RolePermissionPolicy`
**Date**: 2026-07-08
**Decision**: Refactor of the `/phan-quyen` + `/nguoi-dung` RBAC-mock module. Splits the two concerns the old model conflated:

1. **`RolePermissionPolicy` = role + feature + permission + enabled only.** The `dataScope` field is removed from the policy row. A policy now answers "which role may do what on which feature" — nothing about how far a given person can see.
2. **`UserRoleAssignment` = user + role + dataScope + orgUnit + effectiveFrom/To** is the new home for data scope. Two users holding the same role (e.g. `CQ_KHCN`) can now have different scopes — impossible under scope-on-policy. `getEffectiveDataScopes(user, assignments)` reads from assignments, filtered by effective date, not from policies.
3. **Scope-overlay, not full assignment.** Role *membership* still derives from `user.vaiTro` via `ROLE_LABEL_TO_CODES` (D9 unchanged); the assignment only *overlays* scope + org unit onto roles the user already holds. `getUserAssignments` fail-safe-filters to roles present in the principal, so a stale assignment for a removed role grants nothing. Minimal blast radius: `getPrincipal`, `permissions.ts`, `DossierDetail`, and login are untouched.
4. **The "Danh sách Policy" tab becomes a "Chi tiết policy" drawer** opened by clicking a matrix row. The drawer is where raw permissions are shown and the per-policy `enabled` toggle lives — closing the old gap where the matrix had no disable-without-delete control. `/phan-quyen` is now 3 tabs: Danh mục vai trò (CRUD), Ma trận quyền (+ drawer), Mô phỏng (split "Quyền thao tác (Role)" vs "Phạm vi dữ liệu (Assignment)").
5. **`RbacContext` (`store/RbacContext.tsx`) is the single source** for roles/policies/assignments, mounted in `main.tsx`. `/nguoi-dung` gains a per-user "Phân quyền" drawer that writes assignments into the same context, so scope edited there shows up live in the Simulator.

**Rationale**: The old coupling forced every holder of a role into one scope, which is wrong for VHT (same nghiệp-vụ role, different org reach). Scope is inherently a property of the person-in-a-unit, not of the role's capability. Keeping membership on `vaiTro` (scope-overlay) delivers the correct model with almost no change to the enforcement path, which stays mock until F3.
**Source**: `docs/research/recfactor-module-user-role.md` + design session 2026-07-08. Affects `webapp/src/data/rbac.ts`, `data/rbacEngine.ts`, `store/RbacContext.tsx`, `pages/RolePermission.tsx`, `pages/UserManagement.tsx`. Extends D9; consistent with D3 (Camunda holds no business data). Frontend-mock only — real DB-backed RBAC still waits on F3.
**Status**: LOCKED (model shape) — frontend-mock implementation DONE 2026-07-08; `npm run build` green. Server-side enforcement still open (F3).

## D12 — eForm "B-engine": custom AntD runtime renderer over the unchanged form-js schema
**Date**: 2026-07-09
**Decision**: Response to a client complaint that eForms rendered by `@bpmn-io/form-js` "look inconsistent with the AntD app", combined with a business need for **conditional visibility (①) + calculated fields (②) + dynamic tables (③)**. Rather than adopt a new form framework (e.g. Formily) or hand-build a form engine from scratch, the eForm layer evolves as follows:

1. **The form-js JSON schema stays the data contract.** No new schema format. `FormContext` CRUD, `seedForms`, and — critically — the existing drag-drop builder (`FormDesigner` wrapping form-js `FormEditor`) are all **kept unchanged**. The schema already models ①②③ (`conditional.hide`, expression fields, `dynamiclist`).
2. **Only the runtime renderer is replaced.** A new `AntFormRenderer` (replacing `components/FormRenderer.tsx`) maps `component.type` → Ant Design components, preserving the exact `FormRendererHandle` interface (`submit(): { data, errors }`) so `TaskFormModal` and `buildYKien` need no change.
3. **Reuse `feelin` (already a dependency, `^7.0.1`) for the expression engine** — evaluate `conditional.hide` (①) and computed expressions (②) against a controlled `formData` state on every change; strip the leading `=` before eval. Do NOT rewrite FEEL.
4. **`dynamiclist` (③) renders as an AntD editable table** with recursive per-row rendering + per-row validation; submit gathers a nested array.
5. **Binding is untouched.** Form→Task/Action binding stays the `formKey`-by-reference model from D10 (`ActionAvailabilityPolicy`); the renderer swap does not touch it. The renderer still must NOT infer outcome from form data (D10: the button is the decision).
6. **Delivered in 3 slices**: Lát 1 flat fields → Lát 2 feelin conditional/computed → Lát 3 dynamic table. Each slice verified end-to-end on the real Phê duyệt flow.

**Rationale**: Needing ①②③ means needing a form *engine*, not just a skin — but the two most expensive pieces (the FEEL evaluator and a schema that already models ①②③) are reusable, and the project already invested in a custom form-js builder. Adopting Formily would force replacing that builder + migrating the schema + losing Camunda Form compatibility, for a benefit (batteries-included engine) that `feelin` largely neutralizes. Since the project already renders forms in custom UI (not Tasklist, per D2/D6), keeping the form-js schema as the interchange format costs nothing and preserves the builder + binding + storage.
**Source**: `docs/arch/eform-b-engine-architecture.md` (full design + decision trail in Phụ lục A). Design session 2026-07-09 (BA/PM). Extends D6/D10; consistent with D2/D3. Affects only `webapp/src/components/FormRenderer.tsx` (→ `AntFormRenderer`) at implementation time — builder/binding/store/seed unchanged.
**Status**: LOCKED (model shape) — implementation NOT started; frontend-mock work (no F1 dependency). Slice plan in `active-task.md`.

---

## D13 — eForm builder chrome: AntD-native palette + properties panel over the form-js engine (amends D12 §1)
**Date**: 2026-07-09
**Decision**: Client feedback that the **builder** (`FormDesigner`) still "looks non-AntD / ugly" — the visible surfaces (palette, properties panel) are `@bpmn-io/form-js` DOM (Carbon/IBM Plex), which CSS skinning can only *approximate*. D12 §1 kept the builder unchanged; this decision **amends that clause** to allow replacing the builder's **author-facing UI** with hand-written Ant Design, while **keeping form-js as the underlying engine**:

1. **Engine stays form-js, unchanged.** The `FormEditor` canvas (drag-move reorder, context-pad delete, layout, undo/redo), `modeling`/`selection`/`fieldFactory` services, schema import/export, and Vietnamese-ization all remain. The native `PaletteModule` + `PropertiesPanelModule` stay loaded but are **portaled into hidden containers** (editor bundle only exports `ContextPadModule` + `FormEditor`, so a custom `modules` list to remove them is impractical — hiding is the low-risk path).
2. **Palette → AntD, tự viết.** New React component renders field types (VN labels + AntD icons, grouped). **Native drag-drop works for free**: dragula uses functional `isContainer`/`moves`/`copy` on document mousedown, so any AntD palette item carrying the form-js drag classes drops onto the canvas via form-js's own `createNewField`. Required markup: wrapper `fjs-palette-fields fjs-drag-container fjs-no-drop`; each item `fjs-drag-copy` + `data-field-type="<type>"`. Also click-to-add via `modeling.addFormField({type}, target, index)`.
3. **Properties panel → AntD, tự viết.** Listens `selection.changed`; renders an AntD form for the selected field; writes via `modeling.editFormField(field, prop, value)` (nested props like `validate.required` set the whole sub-object, per native panel). Covers: general (key/label/description/id), validation, static text (markdown), options editor (select/radio), FEEL (`expression`, `conditional.hide`) via monospace textarea, delete.
4. **Known trade-off**: loses the native **FEEL popup editor** (variable autocomplete) — replaced by a plain monospace `=...` textarea. Acceptable for now; re-adding autocomplete is a separate task.
5. **Boundary preserved**: does NOT touch the schema contract, `FormContext` store, `formKey` binding, seed forms, or the B-engine `FormRenderer`. Same JSON in/out; only the author-facing chrome changes. Consistent with D10 (button-is-the-decision) and D3.
6. **Delivered in 3 slices**: Lát A palette (drag + click) → Lát B properties panel → Lát C polish/empty-state/undo-sync. Each slice `npm run build` green.

**Rationale**: Skinning form-js DOM (D12-era `bpmnio-skin.css`) can only get *close* to AntD, never identical, because the controls are a different engine. Client wants pixel-consistent chrome. The form-js **services** (modeling/selection/fieldFactory) are a clean, stable API, and dragula's functional container checks mean the most expensive part (drag-drop) needs no reimplementation — so building AntD chrome over the engine is far cheaper than replacing the engine. Amends only D12 §1's "builder kept unchanged"; every other D12 clause (schema-as-contract, B-engine renderer, binding) stands.
**Source**: Session 2026-07-09 (continuation of the D12 eForm work). Affects `webapp/src/components/FormDesigner.tsx` + new palette/panel components under `webapp/src/components/formdesign/`. User explicitly directed going to "mức 2" (self-written AntD palette/panel) after rejecting deeper CSS skinning as insufficient.
**Status**: LOCKED (approach) — implementation **DONE 2026-07-09** (Lát A palette + Lát B panel +
Lát C hoàn thiện; `npm run build` green mỗi lát). Frontend-mock work (no F1 dependency). Chưa
click-through trình duyệt (Playwright chưa cài) — kiểm chứng runtime bằng đọc source + build.

---

## D14 — Backend stack: Java 21 + Spring Boot + Spring Zeebe
**Date**: 2026-07-15
**Decision**: Backend is Java 21 + Spring Boot (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`) with `io.camunda:spring-zeebe-starter` as the Camunda 8 Java SDK for the Zeebe client and job workers.
**Rationale**: Most mature Camunda 8 SDK (already the illustrative example in `docs/arch/camunda-design.md`), largest community/hiring pool. Resolves the "Backend language/framework" item that was previously open and blocking Foundation 1.
**Source**: User decision, session 2026-07-15. Resolves the open item below (kept struck through for history, see superseded note).
**Status**: LOCKED

## D15 — Domain database: PostgreSQL, Flyway-managed, separate from Camunda's own storage
**Date**: 2026-07-15
**Decision**: The application's domain DB (NhiemVu/HoSo/Organization/Role/User etc., per D8/D9) is PostgreSQL, with schema migrations managed by Flyway. This DB is fully separate from whatever storage Camunda's own components (Zeebe/Operate/Identity) use internally — consistent with D3 (Camunda holds no business data).
**Rationale**: Already the assumption in the topology diagram (`camunda-design.md`), open-source, strong JSONB support (useful for eForm schema storage later), no license cost. Resolves the "Domain database engine" item that was previously open and blocking Foundation 1.
**Source**: User decision, session 2026-07-15.
**Status**: LOCKED

## D16 — Camunda 8 dev environment: Self-Managed via local Docker Compose
**Date**: 2026-07-15
**Decision**: The Camunda 8 development/integration environment runs Self-Managed (Zeebe, Operate, Tasklist, Identity, Elasticsearch) via a local Docker Compose stack (`infra/docker-compose.yml`), not Camunda SaaS. Production deployment topology (Kubernetes vs. SaaS) remains open and will be decided after the dev stack is proven.
**Rationale**: Matches the Self-Managed topology already sketched in `docs/arch/camunda-integration-explained.md`; no trial time-box or SaaS data-residency concern for early integration work. Resolves the "Camunda 8 deployment model" (`OQ-CAM-DEPLOY`) item for the *dev* environment specifically — production topology is a separate, still-open decision.
**Source**: User decision, session 2026-07-15.
**Status**: LOCKED (dev environment only) — production topology still open, see remaining open items below.

## D17 — Frontend stack: Angular + ng-zorro-antd (supersedes D7)
**Date**: 2026-07-15
**Decision**: The web SPA is rebuilt in Angular (current LTS at scaffold time) using `ng-zorro-antd` as the component library, with `vi_VN` locale — replacing the React + Ant Design stack locked in D7. Design-system refresh happens at the design-token layer (colors/spacing/typography), starting from `webapp/src/branding/tokens.css` as the baseline rather than a from-scratch visual redesign. `webapp/` (the React app) is kept as a living reference implementation of already-approved UX and business rules until each module reaches parity on Angular; it is retired module-by-module, not deleted upfront.
**Rationale**: User-directed stack change (Solution Architect decision, not an agent-initiated reopening of D7). Reusing the ng-zorro-antd component set preserves most of the already-validated UX/interaction patterns from the React mock, keeping migration cost bounded while still allowing an intentional design-system refresh at the token level.
**Source**: User decision, session 2026-07-15. Migration plan: `C:\Users\phuctd7\.claude\plans\generic-pondering-parnas.md` (Mốc 0–6, strangler-fig per RD flow, RD01.01 first).
**Status**: LOCKED (approach) — implementation not started.

---

## Open decisions blocking Foundation 1 (Project Scaffold)

**RESOLVED 2026-07-15** — backend language/framework (D14), domain database engine (D15), and the Camunda 8 *dev-environment* deployment model (D16) are now locked above. Foundation 1 is unblocked for scaffold work; see `DELIVERY_STATE.md`.

Still open (do not guess — ask again before depending on these):

- **Camunda 8 *production* deployment model** — Self-Managed on internal Kubernetes vs. Camunda SaaS for production is still undecided; D16 only locks the local dev environment. `camunda-design.md` topology diagram assumes Self-Managed (separate `qlnvkhcn`/`camunda`/`iam` namespaces) but this is not confirmed for production.
- **SSO/IAM protocol** (`OQ-021`) — OIDC vs SAML, and which VHT IAM product, undecided. Blocks real F5 (Auth) and the server-side half of F3 (RBAC enforcement). Backend scaffold (D14) uses a temporary JWT stub until this is resolved.
- Related open questions tracked in `docs/req/ENGINE-NFR-requirements.md` and `docs/req/RTM.md`: `OQ-002` (rework flow), `OQ-006` (NFR/RBAC granularity + numeric SLA targets), `OQ-009` (5-system sync model), `OQ-020` (AI-Agent integration scope), `OQ-CAM-COMPONENTS` (which Camunda components are bundled).
