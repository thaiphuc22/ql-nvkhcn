# Active Task

**Last updated**: 2026-07-07
**Agent role**: Delivery Manager / Solution Architect

---

## Task

Unblock **Foundation 1 (Project Scaffold)** by getting three architecture decisions from
the solution architect / client, then set up the backend scaffold and lock the Camunda 8
self-managed vs. SaaS topology. F0 is complete; F2/F3/F5 already have working frontend-mock
prototypes that inform (but don't replace) the real implementation.

## Current phase

Foundations phase — F0 done, F1 blocked, F2/F3/F5 partial, F4 not started. No EPIC/feature
work (Configuration Service EPICs, further RD flows) should start until F1–F5 are all
`COMPLETE` per `workflows/foundations.md`.

## Files to read

- `.harness/state/DELIVERY_STATE.md` — current foundation status
- `.harness/state/decisions.md` — locked decisions D1–D9, plus the open-decisions list blocking F1
- `docs/arch/camunda-design.md` — Camunda 8 topology, integration channels, existing D1–D6
- `docs/req/data-model-NV-vs-HoSo.md` — NhiemVu/HoSo schema already agreed
- `webapp/src/data/{nhiemVu,dossiers,roles,users,permissions}.ts` — existing frontend-mock shapes to formalize into a real schema/RBAC layer
- `docs/req/ENGINE-NFR-requirements.md` — NFRs (confidence 0.58, explicitly not design-ready) touching auth/RBAC/perf

## Next concrete action

1. Get the architect/client to decide the three items blocking F1 (recorded in
   `decisions.md` under "Open decisions blocking Foundation 1"):
   - Backend language/framework
   - Domain database engine
   - Camunda 8 deployment model (Self-Managed on internal K8s vs. SaaS)
2. Once decided, lock them as `D10`, `D11`, `D12` in `decisions.md`, then scaffold the
   backend (repo layout, dev command, migration runner, CI) per Foundation 1's done-when
   checklist in `.harness/workflows/foundations.md`.
3. In parallel, F2/F3 can be formalized (real DB schema + server-side RBAC) once F1's
   scaffold exists — reuse the shapes already in `webapp/src/data/*.ts` rather than
   re-designing them.
