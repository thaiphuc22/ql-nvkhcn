# Active Task

**Last updated**: 2026-07-08
**Agent role**: Delivery Manager / Frontend implementer

---

## Side task (2026-07-08) — Action Registry catalog seed — DONE

Reviewed `docs/research/action-registry-list.md`, found it stale vs. code (still described
`PROCESS_STEP` as current; D10 already replaced it with `APPROVE_STEP`/`RETURN_STEP`/
`REJECT_STEP`). User asked to seed the doc's Phase 2 (Support Actions) and Phase 3 (Exception
Actions) proposals into the Action Registry ("Danh mục nút" tab, Action Studio). Confirmed with
user this was a deliberate short detour from the Integration screen Đợt 3 active task below.

**What shipped**: `webapp/src/data/actionRegistry.ts` — added `PROPOSED_SUPPORT_ACTION_CODES`
(`UPLOAD_ATTACHMENT`/`VIEW_DOCUMENTS`/`EXPORT_PDF`/`PRINT_DOSSIER`/`VIEW_AUDIT`) and
`PROPOSED_EXCEPTION_ACTION_CODES` (`REQUEST_ADD_REVIEWER`/`REQUEST_REPLACE_APPROVER`/
`REQUEST_REOPEN_STEP`/`REQUEST_MANUAL_COMPLETION`/`REQUEST_EMERGENCY_APPROVAL`), both merged
into `ACTION_REGISTRY` with `active: true`. Icons added to `data/actionPresentation.ts`
`ICON_BY_ACTION`. These now render in Action Studio's "Danh mục nút" tab (reads
`Object.values(ACTION_REGISTRY)` directly) but are **catalog-only, not wired**:
- Support actions have no `ActionAvailabilityPolicy` row → won't appear on real dossier/worklist
  screens (`getAvailableActions`'s tier1 only includes actionCodes present in `policies`).
- Exception actions have no `ExceptionType` in `exceptions.ts` → `EXCEPTION_ACTION_CODE` (which
  `getAvailableActions`/`getDebugActions` iterate) doesn't include them yet.

`docs/research/action-registry-list.md` updated to match: marked Phase 1 done (D10), Phase 2/3
marked "seed xong, chưa wiring", added follow-up questions (ExceptionType + policy per new
exception action). **Build verified green** (`npm run build`, 32.5s, no errors).

**Not done / explicit follow-up**: wiring these into real availability (Support) or exception
policy (Exception) — that needs per-step/per-process policy authoring decisions, likely a BA
call, not assumed here.

---

## Task

**Integration screen (`/tich-hop`) upgrade — Đợt 1 (Slice A–C) — DONE 2026-07-08.**
Plan of record: `docs/research/integration-screen-upgrade-notes.md`. Frontend-mock evolution
of the already-built `IntegrationStatus.tsx` module (same carve-out category as D10/D11/
EPIC06 — not new EPIC/backend work, does not touch the F1 blocker). Đợt 1 scope was
deliberately capped to the lowest-risk slices; user chose "A-C only" over also starting the
Mapping Studio (D-F) this round.

**What shipped:**
- **Slice A — tab split**: `IntegrationStatus.tsx` now wraps content in `Tabs` — "Tổng quan"
  (fully wired, existing KPI + card grid) plus 4 disabled placeholder tabs ("Mapping dữ liệu
  (sắp có)", "Job & lỗi (sắp có)", "Cấu hình kết nối (sắp có)", "Kiểm thử (sắp có)") previewing
  the doc's 5-tab roadmap without building dead screens — same "disabled + sắp có" pattern
  `AssignmentBuilder.tsx` used for ORG_POSITION/COUNCIL/EXPRESSION.
- **Slice B — richer cards**: `SystemCard` metric row now shows Độ trễ TB (`s.doTreMs`,
  existing field), Tỷ lệ thành công 24h (new `integrationSuccessRate()` helper, derived from
  existing `banGhi24h`/`loi24h` — no new seed fields), Hàng đợi (existing), Lỗi mở (new
  `openIncidentCount()` helper, derived from existing `seedJobRuns`).
- **Slice C — drawer chi tiết**: new `SystemDetailDrawer` (opened via new "Xem chi tiết" button
  on every card) shows connection info, 24h metrics, lỗi gần nhất (new `lastErrorAt()` helper),
  and the last 5 job runs for that system via new `jobRunsForSystem()` helper — **reuses
  `seedJobRuns`/`seedEvents` already surfaced on `/nhat-ky` (`ProcessEventLog.tsx`) instead of
  duplicating a job-log table**, consistent with the "một nguồn sự thật" pattern from the
  BPMN↔routing work. Drawer explicitly notes mapping/version/quy-trình-linkage are not yet
  built (Slice D+), so it doesn't imply capability that doesn't exist.
- **New pure helpers in `data/camundaOps.ts`** (no new seed data, no schema change):
  `integrationSuccessRate(s)`, `jobRunsForSystem(he)`, `openIncidentCount(he)`, `lastErrorAt(he)`.

**Deferred to Đợt 3** (see below — now done in Đợt 2 except version/rollback + audit/permissions):
version/rollback (Slice H — should reuse the `RuleContext` save-bump-version pattern), audit log +
granular permissions (Slice I — should hang off the existing `RbacContext`/`actionAvailabilityPolicy`,
not a bespoke permission table), retry-policy config (doc's "Cấu hình kết nối" tab, still disabled
placeholder), the "Kiểm thử" tab (test-connection, separate from mapping preview).

**Verification**: `npm run build` GREEN (tsc + vite, ~32s), full output clean. No in-browser
click-through — Playwright not installed this session (consistent with prior sessions); a
throwaway dev server was started, curl-verified serving HTTP 200, then stopped after the check.

---

## Integration screen (`/tich-hop`) upgrade — Đợt 2 (Slice D–G) — DONE 2026-07-08

Continuation of Đợt 1 above, same session. Scope = the doc's own roadmap steps 3–4 ("Mapping
dữ liệu" tab with real field/value mapping + preview JSON + validate trạng thái). Slices H
(version/rollback) and I (audit + granular permissions) intentionally left for Đợt 3.

**What shipped:**
- **Slice D — mapping data model**: new `webapp/src/data/integrationMapping.ts`. `MappingConfig`
  (he/doiTuong/chieu/trạng thái Draft-Ready-Active-Deprecated-Error/version/fields) +
  `FieldMapping` (truongQTKHCN/kieuDuLieu/truongHeNgoai/batBuoc/khoaDinhDanh/transform/
  giaTriMacDinh/valueMappings) + `ValueMapping`. **Transform list is a closed enum**
  (`format-date`/`to-string`/`concat`/`split`/`enum-map`/`default-value`) — no free-text script,
  per the doc's "Transform có kiểm soát" section. 3 seed configs grounded in real mock data (not
  fabricated): SAP·Dự toán (enum-map on `giaiDoan`), QLNS·Nhân sự (default-value on missing
  email), MS·Hồ sơ (the doc's own `trangThai`→`status` value-mapping example, deliberately left
  with an empty `truongHeNgoai` on one field to demonstrate the Slice G validate gate).
  `validateMappingConfig()` implements the doc's 5 pre-Active checks (empty fields / missing
  external field / duplicate external field / enum without value mapping / no identifier key).
  `previewMapping()` applies field+value mapping to a source record → payload + missing/invalid
  list. `sampleRecordsFor(doiTuong)` pulls real records from `data/nhiemVu.ts`/`dossiers.ts` —
  returns `[]` for `TaiSan` (QLTS has no seed data in this mock) rather than inventing one.
- **New store** `store/IntegrationMappingContext.tsx` (mounted in `main.tsx`, same
  `RuleContext`-style pattern): `create`/`saveFields`/`setStatus`/`remove`. **`setStatus(..,
  'active', ..)` re-runs `validateMappingConfig` inside the context itself** (not just the UI) —
  fail-closed defense in depth; on failure it flips the config to `error` status and returns the
  error list instead of silently no-op'ing.
- **Slice E — Mapping Studio UI**: `webapp/src/components/MappingFieldEditor.tsx` (row-based
  field editor + nested value-mapping mini-editor, shown only when `kieuDuLieu==='enum'` or
  `transform==='enum-map'`) + `webapp/src/components/MappingStudio.tsx` (list/filter/create/edit-
  drawer/delete, wired into the previously-disabled "Mapping dữ liệu" tab in
  `IntegrationStatus.tsx`). `SystemDetailDrawer` (Đợt 1, Slice C) updated to list real active
  mappings for that system instead of the old "chưa triển khai" placeholder note.
- **Slice F — preview payload**: `PreviewModal` in `MappingStudio.tsx` — pick a sample record,
  show JSON gốc / JSON sau mapping (`<pre>` block styled like `ActionStudio.tsx`'s existing JSON
  viewer) / missing-or-invalid field list.
- **Slice G — validate-before-active fail-closed gate**: the "Kích hoạt" button calls
  `setStatus(id,'active',actor)`; on failure shows `Modal.error` with the full validation error
  list and does **not** flip to Active (fail-closed, consistent with D9's fail-closed RBAC
  principle). The seed MS·Hồ sơ config is deliberately invalid so this is exercisable immediately
  without needing to hand-craft a broken config first.

**Verification**: `npm run build` GREEN (tsc + vite, confirmed on a clean re-run with explicit
exit-code + error-grep check). Dev-server module transform smoke-test (no Playwright available
this session): fetched `IntegrationStatus.tsx` and `MappingStudio.tsx` through Vite's dev
transform pipeline, confirmed no parse/transform errors, then stopped the throwaway server.

---

### Earlier 2026-07-08 — EPIC06 Approval Matrix refactor — Đợt 1 + Đợt 2 — DONE (Slices A–I, all sliced work).
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
frontend-mock refactor of an already-built module (same allowance under which D10/D11/EPIC06
shipped), not new EPIC/backend work.

## Files to read

- `docs/research/integration-screen-upgrade-notes.md` — plan of record for the current task
  (Đợt 1 = Slice A-C DONE, Đợt 2 = Slice D-G DONE; Slice H-I = Đợt 3, not started)
- `webapp/src/pages/IntegrationStatus.tsx` — the module being upgraded (`/tich-hop`)
- `webapp/src/data/integrationMapping.ts` — mapping model, `validateMappingConfig`,
  `previewMapping`, `sampleRecordsFor` (Slice D)
- `webapp/src/store/IntegrationMappingContext.tsx` — mapping CRUD + fail-closed `setStatus`
  (mounted in `main.tsx`)
- `webapp/src/components/MappingFieldEditor.tsx` + `webapp/src/components/MappingStudio.tsx` —
  Mapping Studio UI (Slice E-G), wired into `IntegrationStatus.tsx`'s "Mapping dữ liệu" tab
- `webapp/src/data/camundaOps.ts` — seed data + helpers (`integrationSuccessRate`,
  `jobRunsForSystem`, `openIncidentCount`, `lastErrorAt`); also owns `seedJobRuns`/`seedEvents`
  already consumed by `webapp/src/pages/ProcessEventLog.tsx` (`/nhat-ky`) — reuse, don't duplicate
- Reuse precedent for the remaining slices: `webapp/src/store/RuleContext.tsx` (`saveXml`
  bump-version pattern → mapping version/rollback, Slice H), `webapp/src/store/RbacContext.tsx` +
  `data/actionAvailabilityPolicy.ts` (→ Slice I permissions, don't build a bespoke permission table)
- Older context (EPIC06/D10/D11, superseded as the active task but still relevant background):
  `docs/research/approval-matrix-refactor-plan.md`, `.harness/state/decisions.md` (D3/D9/D10/D11)

## Next concrete action

**Đợt 1 (Slice A-C) and Đợt 2 (Slice D-G) are DONE.** Candidate next steps (pick per instruction):
1. **Slice H — version/rollback**: extend `IntegrationMappingContext` with a version history
   list per `MappingConfig` (mirror `RuleContext.saveXml`'s bump-version, but keep prior versions
   instead of discarding) + a "Xem lịch sử / Khôi phục" action in `MappingStudio.tsx`.
2. **Slice I — audit log + granular permissions**: gate Mapping Studio actions (sửa/kích hoạt/
   xoá) through `RbacContext`/`actionAvailabilityPolicy` instead of leaving them open to any
   logged-in user; add an audit trail (who changed/activated/deactivated which mapping) — mirror
   the audit-minimum pattern already used in `ApprovalMatrixContext`'s `ResolveResult.audit`.
3. **In-browser click-through** of `/tich-hop` (Playwright not installed this session): confirm
   the Mapping Studio create/edit/preview/activate flow end-to-end, including the deliberately-
   invalid seed config (`map-ms-hoso-draft`) correctly blocking Activate with the validation
   errors shown.
4. Resume the parked EPIC06 next-steps (still valid, not started this session): lock the
   Approval Matrix model shape as D12 in `decisions.md`; backend readiness for
   `data/approvalMatrixDto.ts` when F1 unblocks.

**If asked to unblock the project instead:** Foundation 1 is the real blocker — get the
architect/client to decide backend language/framework, domain DB engine, and Camunda 8
deployment model, then lock them (D12/D13/D14 earmarked) in `decisions.md` and scaffold the
backend per `.harness/workflows/foundations.md`.
