# Active Task

**Last updated**: 2026-07-08
**Agent role**: Delivery Manager / Frontend implementer

---

## Task

**EPIC06 Approval Matrix refactor — Đợt 1 + Đợt 2 — DONE 2026-07-08 (Slices A–I, all sliced work).**
Plan of record: `docs/research/approval-matrix-refactor-plan.md` (+ review notes
`docs/research/approval-matrix-conversation-2026-07-08.md`). Frontend-mock refactor of the
already-built EPIC06 module (`/ma-tran-phe-duyet`), same category as D10/D11 — evolves existing
mock, does **not** start backend/persistence and does **not** touch the F1 blocker.

**Đợt 2 shipped 2026-07-08 (Slices E, F, G, H, I + shared store):**
- **Shared store** `store/ApprovalMatrixContext.tsx` (new, mounted in `main.tsx`) — single source
  for rules+delegations; `/ma-tran-phe-duyet` now edits through it so changes reach runtime.
- **Slice E — assignment model** (`data/approvalMatrix.ts`): `ApprovalAssignment { mode, targets }`
  replaces `approverRoleCodes`; targets `GROUP|USER|ORG_POSITION|COUNCIL|EXPRESSION`, modes
  `ANY_ONE|ALL|SEQUENTIAL`. `resolveAssignment` resolves GROUP/USER for real (+ delegation);
  ORG_POSITION/COUNCIL/EXPRESSION are placeholders (locked user + warning). New
  `components/AssignmentBuilder.tsx` (GROUP/USER editable; other 3 = disabled "sắp có" options).
  Seed AM-01…AM-07 migrated (HĐ rules got mode `ALL`). **Parity gate still passes — 216 contexts,
  matched-rule + approver-set identical, 0 mismatch.**
- **Slice H — audit payload**: `ResolveResult.audit: ApprovalResolveAudit` (input snapshot,
  matched rule id+version, mode, targets-before-org, final user ids, delegations applied, skipped
  rules) + `warnings` + `mode`. Simulation panel shows mode + warnings.
- **Slice F — analyzer** `data/approvalMatrixAnalyzer.ts` (new): detects empty-assignment (error),
  duplicate-priority, broad-before-specific shadow, disabled-fallback (warning), no-fallback
  coverage (info). Surfaced as a banner above the table + per-row ⚠ tooltip. **Harness-verified.**
- **Slice G — runtime wiring**: `data/approvalSlotMap.ts` (new) maps step candidateGroups → slot
  (⚠ DEMO ASSUMPTION per plan §8 — real slot should come from BPMN metadata) + `buildApprovalContext`.
  `DossierDetail` now resolves the current approval step via `resolveApprovers(store rules, ctx)`
  when a slot is derivable (else falls back to `resolveGroups`), and shows "Khớp luật: …" —
  so editing a rule on the Matrix page changes the predicted approver in the dossier.
- **Slice I — DTOs** `data/approvalMatrixDto.ts` (new): request/response shapes for the 5 future
  endpoints (rules CRUD, resolve, analyze), shaped ≈ mock for a minimal-change API swap.

**Verification**: full `npm run build` GREEN (tsc + vite, 12.2s). Three esbuild+node harnesses
green — engine 35/35, parity 216-ctx/0-mismatch (now incl. approver-set), analyzer all-detections.
No in-browser click-through (Playwright not installed).

**Mojibake encoding repair — DONE 2026-07-08 (follow-up, user-reported "many screens broken").**
Pre-existing corruption (double-encoded UTF-8, **CP1252**-based) from a prior session's editor,
NOT caused by this task (first Read this session showed it before any edit; `ApprovalMatrix.tsx`
stayed clean through heavy edits). Scanned all 119 `src/**/*.{ts,tsx,css}` — exactly **5 files**
were double-encoded: `data/actionAvailability.ts`, `data/actionAvailabilityPolicy.ts`,
`data/bpmnReconcile.ts`, `data/exceptionPolicy.ts`, `pages/DossierDetail.tsx` (the 4 data files
feed action/exception labels across many screens → "nhiều màn hình"). Fixed with a Node
CP1252-aware un-double-encoder (per-run `cp1252 bytes → utf-8`, incl. the 0x80–0x9F special chars
`— " " …` and undefined-byte passthrough for `ề`=E1 BB 81). **Safety guards**: only rewrite a file
if it net-reduces high-byte count, and reject any run whose decode yields a combining mark /
control char (avoids false positives — verified it correctly SKIPS `RuleGridBuilder.tsx` where
proper `THÌ…` would otherwise mangle). Also fixed 2 latent `TS2367` compile bugs in DossierDetail
(`d.cap`/`d.loai` comparisons that were always-false at runtime). **Verified**: full build green,
`0/119` files still double-encoded, spot-checked readable Vietnamese in all 5 (incl. `↔ — §` and
DossierDetail's mixed proper/mojibake regions). Backups kept in scratchpad. Note: Python is not
available in this env (Store stub, exit 49) — use Node for scripting.

**Also fixed to unblock the build (enabling cleanup, flagged)**: removed unused `StatCard` import +
`stats` useMemo in `RolePermission.tsx` (pre-existing D11 WIP leftovers that failed `tsc`).

---

### Đợt 1 (earlier 2026-07-08) — DONE (Slices A–D + audit-min)

**What shipped this đợt:**
- **Slice A — condition engine** `webapp/src/data/approvalConditions.ts` (new): `ConditionNode`/
  `ConditionGroup`/`ConditionLeaf` + `evaluateConditionTree` + 11 operators
  (`eq/neq/gt/gte/lt/lte/between/in/contains/exists/notExists`) + `describeConditionTree`
  (Vietnamese preview) + builder helpers (`group`/`leaf`/`anyCondition`). Fail-closed on missing
  values; empty group = wildcard. **Verified via esbuild+node harness — 35/35 asserts**
  (numeric/enum/bool/missing/AND-OR nesting/describe).
- **Slice B — variable registry** `webapp/src/data/approvalVariableRegistry.ts` (new): 11 seed
  vars (plan §3.3), enum options aligned to `variableContract.ts` for the overlapping ones
  (capNhiemVu↔cap, loaiHoiDong); 3 core vars `simulated:true`, rest authorable-only for now.
  Provides `describeHelpers` (field/value labels) + operator-by-type sets driving the builder.
- **Slice C — schema migration + PARITY GATE (passed).** `ApprovalRule` moved from fixed
  `cap/loaiHoiDong/budgetMin/budgetMax` to `conditions: ConditionGroup`; seed AM-01…AM-07
  migrated (`cap`→`capNhiemVu eq`, `budgetMin`→`tongDuToan gte`, `loaiHoiDong`→`eq`); `slot`
  still matched separately; `ruleMatches`/`resolveApprovers` use the engine via `toEvalContext`.
  **Parity harness: 216 contexts (slot×cap×loaiHoiDong×budget incl. Simulation default
  PHE_DUYET/TD/12 tỷ + budget boundaries), matched-rule identical old-vs-new, 0 mismatch.**
- **Slice D — Condition Builder UI** `webapp/src/components/ConditionBuilder.tsx` (new):
  recursive AND/OR group editor, field/operator/value controls rendered by registry type
  (enum→Select, number→InputNumber w/ VND format + between range, boolean→Có/Không, string→Input,
  `in`→multi-select), add/remove condition + nested group, live Vietnamese preview. Wired into
  the ApprovalMatrix rule modal (replaced the 4 fixed fields); table "Điều kiện" column now shows
  the readable summary; column relabeled "Nhóm phê duyệt" (plan §7 copy).
- **Audit-minimum** (`ResolveResult.evaluatedRules` + Simulation panel): shows all same-slot
  rules evaluated with why (chosen / matched-but-lower-priority / disabled / điều kiện không khớp).
- **Assignment stayed GROUP-only** (Slice E deferred as planned).

**Verification**: the 5 refactor files are **type-clean** (`tsc` reports 0 errors in them) +
engine/parity harnesses green. **Caveat — full `npm run build` is currently RED due to
PRE-EXISTING uncommitted WIP unrelated to this task**: `TroGiup.tsx` (untracked, missing antd
icon imports `AppstoreOutlined`/`SafetyCertificateOutlined`/`SyncOutlined`) and
`RolePermission.tsx` (modified, unused `StatCard`/`stats`). Both were dirty at session start
(git: `?? TroGiup.tsx`, `M RolePermission.tsx`) and are owned by other workstreams — left
untouched. No in-browser click-through (Playwright not installed); harnesses cover runtime logic.

**Đợt 2 is now DONE (see the Đợt 2 block above).** Open questions still to confirm with an
architect (chosen sensibly in the mock, flagged as assumptions — revisit when backend starts):
- Source of `slot` — currently derived from step candidateGroups in `data/approvalSlotMap.ts`
  (DEMO ASSUMPTION per plan §8). Real slot should come from BPMN extension prop / task metadata.
- Official Approval Matrix input variable contract — Registry seeded from plan §3.3; not yet
  ratified. `loaiHoiDong` at runtime is currently derived from `cap` (demo) pending real DMN.
- Approval mode semantics for councils (any-one / quorum / all / chair-only) — `ALL` used for
  the seed HĐ rules as a placeholder.

**Recently completed (context — full detail in `DELIVERY_STATE.md`):**
- **D11 (RBAC scope-overlay refactor) — DONE 2026-07-08.** `dataScope` split out of
  `RolePermissionPolicy` into per-user `UserRoleAssignment`; new `store/RbacContext.tsx`;
  `/phan-quyen` reworked to 3 tabs; `/nguoi-dung` per-user "Phân quyền" drawer. Build green.
- **D10 (eForm binds to Action layer) — DONE end-to-end 2026-07-08** (UI cut-over to 3 outcome
  buttons + point 5 BPMN reconcile tool). `npm run build` fully green.
- **Foundation 1 unblock** — still the real blocker for leaving frontend-mock; owner is the
  Solution Architect/client, not resolvable by this agent. All mock work above (and this
  Approval Matrix refactor) deliberately avoids F1's blocker.

## Current phase

Foundations phase — F0 done, F1 blocked, F2/F3/F5 partial, F4 not started. No NEW EPIC/backend
work starts until F1–F5 are `COMPLETE` per `workflows/foundations.md`. This task is a
frontend-mock refactor of an already-built module (same allowance under which D10/D11 shipped),
not new EPIC/backend work.

## Files to read

- `docs/research/approval-matrix-refactor-plan.md` — plan of record (slices A–I, §9 near-term)
- `docs/research/approval-matrix-conversation-2026-07-08.md` — review notes / rationale
- `webapp/src/data/approvalMatrix.ts` — current model + `resolveApprovers`/`resolveGroups`
  (the thing being refactored); `webapp/src/pages/ApprovalMatrix.tsx` — the rule modal UI
- `webapp/src/data/variableContract.ts` — align the variable registry (Slice B) with this
- `.harness/state/DELIVERY_STATE.md` — EPIC06 bullet in Active Feature Workstreams
- `.harness/state/decisions.md` — D3/D9 (Camunda boundary + RBAC), open F1 decisions

## Next concrete action

**Đợt 1 + Đợt 2 are DONE (Slices A–I).** Candidate next steps (pick per instruction):
1. **In-browser click-through** of `/ma-tran-phe-duyet` + a dossier (Playwright not installed
   this session): confirm the Condition Builder + Assignment Builder render, analyzer warnings
   show, and that editing a rule changes the predicted approver in `DossierDetail`.
2. **Re-scan for mojibake after future edits** if any tool re-introduces it: Node script at
   `scratchpad/fixmojibake.mjs` (CP1252-aware, guarded) — dry-run lists affected files, `--write`
   fixes. (The 5 known-corrupted files are already fixed.)
3. **Lock the Approval Matrix model shape** as a new decision in `decisions.md` (D10/D11 pattern:
   "LOCKED (model shape) — implementation DONE"; next free D-number, leaving D12/D13/D14 earmarked
   for the F1 backend trio). Confirm the 3 open questions above with an architect first.
4. **Backend readiness** when F1 unblocks: implement the 5 endpoints in `data/approvalMatrixDto.ts`
   and swap `ApprovalMatrixContext` local state for an API client.

**If asked to unblock the project instead:** Foundation 1 is the real blocker — get the
architect/client to decide backend language/framework, domain DB engine, and Camunda 8
deployment model, then lock them (D12/D13/D14 earmarked) in `decisions.md` and scaffold the
backend per `.harness/workflows/foundations.md`.
