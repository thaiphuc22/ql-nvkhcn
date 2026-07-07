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
**Status**: LOCKED

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

---

## Open decisions blocking Foundation 1 (Project Scaffold)

These were surfaced while setting up the harness (2026-07-07) and explicitly left open by the user pending architect input. **Do not guess these — ask again before starting F1 implementation.**

- **Backend language/framework** — not chosen. `docs/arch/camunda-design.md` shows Java/Spring Zeebe as an *illustrative* example only (most mature Camunda 8 SDK), not a locked choice. Alternatives on the table: Node.js/TypeScript (`@camunda8/sdk`), .NET (`zeebe-client-csharp`).
- **Camunda 8 deployment model** (`OQ-CAM-DEPLOY`) — Self-Managed on internal Kubernetes vs. Camunda SaaS. `camunda-design.md` topology diagram assumes Self-Managed (separate `qlnvkhcn`/`camunda`/`iam` namespaces) but this is not confirmed.
- **Domain database engine** — PostgreSQL appears in the topology diagram but is not in the formal D1–D6 decision table. Oracle/SQL Server remain on the table if VHT/Viettel infra standardizes on one of those.
- **SSO/IAM protocol** (`OQ-021`) — OIDC vs SAML, and which VHT IAM product, undecided. Blocks real F5 (Auth) and the server-side half of F3 (RBAC enforcement).
- Related open questions tracked in `docs/req/ENGINE-NFR-requirements.md` and `docs/req/RTM.md`: `OQ-002` (rework flow), `OQ-006` (NFR/RBAC granularity + numeric SLA targets), `OQ-009` (5-system sync model), `OQ-020` (AI-Agent integration scope), `OQ-CAM-COMPONENTS` (which Camunda components are bundled).
