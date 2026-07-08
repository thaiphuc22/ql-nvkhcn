# Approval Slot Catalog Plan

Date: 2026-07-08

Target module: EPIC06 Approval Matrix (`/ma-tran-phe-duyet`) + BPMN Editor properties panel
(`webapp/src/bpmn/khcnAssignmentModule.ts`).

Source: `docs/research/approval-slot-ba-notes.md` (BA notes, 2026-07-08). Answers the open
question already flagged in `docs/research/approval-matrix-refactor-plan.md` §8 ("Source of
`slot` — currently derived from step candidateGroups ... DEMO ASSUMPTION. Real slot should
come from BPMN extension prop / task metadata").

Status: Planning document only. Frontend-mock evolution of already-built modules (same
carve-out category as D10/D11/EPIC06 — does not start backend work, does not touch the
Foundation 1 blocker).

---

## 1. Problem Statement

Approval Matrix already resolves approvers from a `slot` (`THAM_DINH` / `HOI_DONG` /
`PHE_DUYET`), and that part of the model is correct: BPMN should only ever say "which
abstract approval point is this", never "which person/group". But two things are still
wrong underneath that correct idea:

- **`APPROVAL_SLOTS` is a hard-coded const array** (`webapp/src/data/approvalMatrix.ts:39-43`),
  not a managed catalog. No CRUD, no status (active/retired), no usage tracking, no ordering.
- **BPMN User Tasks do not actually carry a slot.** The Properties Panel
  (`khcnAssignmentModule.ts`) only exposes `candidateGroups` / `assignee`
  (`zeebe:AssignmentDefinition`). The mock currently *guesses* the slot from
  `candidateGroups` via `ROLE_TO_SLOT` in `webapp/src/data/approvalSlotMap.ts` — a mapping
  that file itself flags as a demo assumption to be replaced once BPMN carries real metadata.

This means today's flow is `candidateGroups → guessed slot → rule match`, when it should be
`Need Role (authored on the User Task, validated against a catalog) → slot → rule match`.
Without a catalog + validation step, "Need Role" is also at risk of the exact drift the BA
notes call out: free-text entry producing `XYZ` / `xyz` / `XetDuyet` variants that silently
fail to match any rule (fail-closed = stuck step).

---

## 2. Desired Boundary

Approval Slot Catalog owns:

- The list of valid slot codes, labels, description, applicable process group, status
  (active/retired), display order.
- Duplicate/near-duplicate code detection (normalize to `UPPER_SNAKE`, warn on collision).
- Usage lookup: which Approval Matrix rules reference a slot, which BPMN User Tasks
  (once Slice C ships) declare it as their Need Role.

Approval Slot Catalog does not own:

- Assignment rules / conditions (still Approval Matrix's job).
- Who resolves to whom (still `resolveApprovers`).
- BPMN flow structure or task assignment (`candidateGroups`/`assignee` stay in
  `zeebe:AssignmentDefinition`, untouched).

---

## 3. Proposed Data Model

```ts
// data/approvalSlotCatalog.ts
export interface ApprovalSlot {
  code: string            // UPPER_SNAKE, unique
  ten: string
  moTa?: string
  nhomQuyTrinh?: string[] // e.g. ['RD01', 'RD02'] — applicable process group
  trangThai: 'active' | 'inactive'
  thuTu: number
}
```

`SlotCode` stays a derived union type (`(typeof seedSseedApprovalSlots)[number]['code']`
today; once the catalog is store-backed instead of a literal array, `SlotCode` degrades to
`string` and callers that need type safety validate against the live catalog instead —
flagged as a breaking change to check when Slice A lands, see §8).

Seed content: migrate the existing 3 slots (`THAM_DINH`, `HOI_DONG`, `PHE_DUYET`) as
`active`, already referenced by RD01/02/05 rules. The BA notes' example table also lists
`TAI_CHINH_RASOAT` and `PHAP_CHE_RASOAT` — **no current RD01/02/05 mock step uses either**.
Seed them as `active` with an honest "0 quy trình đang tham chiếu" usage count rather than
inventing a fake BPMN step or rule to make them look used.

---

## 4. Slices

**Slice A — Catalog as a real model.** New `data/approvalSlotCatalog.ts` per §3. Move
`APPROVAL_SLOTS` / `SlotCode` / `slotLabel` out of `approvalMatrix.ts` into it;
`approvalMatrix.ts`, `approvalMatrixAnalyzer.ts`, `pages/ApprovalMatrix.tsx` re-import from
the new module (mechanical, no behavior change). Add `usageForSlot(code, rules)` — counts
referencing rules; extended in Slice D to also count BPMN references.

**Slice B — Store.** `store/ApprovalSlotCatalogContext.tsx` (mirrors `RbacContext.tsx`
shape): `create` / `update` / `setStatus`. `create` normalizes the code to `UPPER_SNAKE` and
rejects (with the offending existing code shown) anything that normalizes to a code already
in the catalog — the concrete fix for the BA notes' `XYZ`/`xyz`/`XetDuyet` drift concern.
Mounted in `main.tsx`.

**Slice C — Need Role on the User Task.** New entry in the existing "Phân công (KHCN)"
properties group (`khcnAssignmentModule.ts`), sourced from `ApprovalSlotCatalogContext`
(not hard-coded), written via `zeebe:TaskHeaders` (the standard Camunda 8 mechanism for
arbitrary task metadata — confirm exact moddle shape against the installed
`zeebe-bpmn-moddle` version when implementing; same extension-elements pattern
`assignmentUtil.ts` already uses for `zeebe:AssignmentDefinition`). If the BA picks/types a
code not in the catalog, show inline warning + a "Tạo slot mới" affordance that opens the
Slice B create flow, instead of silently writing an orphan code.

**Slice D — Replace the guess with the real read.** `slotForStep` in `approvalSlotMap.ts`
reads the Need Role header from the BPMN element first; falls back to today's
`ROLE_TO_SLOT` guess only for diagrams not yet re-authored with Slice C (avoids breaking
`DossierDetail`'s existing `resolveApprovers` wiring mid-migration). Extend the "Đồng bộ
BPMN" reconcile tool (`data/bpmnReconcile.ts`, Action Studio, D10 point 5's 🔴/🟡/⚪ coverage
check) to also flag 🟡 when a User Task's Need Role doesn't resolve to any catalog slot.

**Slice E — Catalog admin UI.** A new tab in `pages/ApprovalMatrix.tsx` (natural home —
it already owns the slot dropdown): list of slots with trạng thái / thứ tự / usage count,
create/edit/deactivate. No dedicated "Cấu hình quy trình" screen exists yet, so this rides on
the existing page rather than adding a new top-level route.

---

## 5. Suggested Implementation Order

A → B → C → D → E. A/B are pure data-layer and low-risk (mechanical import changes +
additive store). C is the highest-value slice (closes the actual gap the BA notes describe)
but touches the BPMN properties panel, so should be reviewed carefully against the installed
`zeebe-bpmn-moddle` types. D is the payoff (real data replaces the guess) and should ship
right after C so the two don't drift. E can slip independently — the catalog is usable via
Slice B's store even before an admin UI exists.

---

## 6. Files Likely To Change

- New: `webapp/src/data/approvalSlotCatalog.ts`, `webapp/src/store/ApprovalSlotCatalogContext.tsx`
- `webapp/src/data/approvalMatrix.ts` — remove `APPROVAL_SLOTS`/`SlotCode`/`slotLabel`, import from catalog
- `webapp/src/data/approvalMatrixAnalyzer.ts`, `webapp/src/pages/ApprovalMatrix.tsx` — update import
- `webapp/src/bpmn/khcnAssignmentModule.ts`, `webapp/src/bpmn/assignmentUtil.ts` (or a new `needRoleUtil.ts`) — Need Role entry (Slice C)
- `webapp/src/data/approvalSlotMap.ts` — read real Need Role before falling back to `ROLE_TO_SLOT` (Slice D)
- `webapp/src/data/bpmnReconcile.ts` — extend coverage check (Slice D)
- `webapp/src/main.tsx` — mount new context

---

## 7. Risks And Open Questions

- **`zeebe:TaskHeaders` exact moddle shape** — needs a quick spike against the project's
  installed `zeebe-bpmn-moddle` before Slice C; if headers turn out to be awkward to read/
  write via `bpmn-js` modeling API, a custom `khcn:` extension element (same pattern as
  `zeebe:AssignmentDefinition`) is the fallback.
- **`SlotCode` becoming a store-derived type instead of a literal union** loses some
  compile-time narrowing (e.g. exhaustive `switch` over slots). Acceptable trade-off since the
  catalog is meant to be editable at runtime by design — but call it out explicitly in review
  since 6 files currently import `SlotCode` as a literal union.
- **Two catalog entries (`TAI_CHINH_RASOAT`, `PHAP_CHE_RASOAT`) with zero real usage** — keep
  them visibly "0 references" in the admin UI rather than fabricating demo rules/steps for
  them; real usage arrives whenever RD03/RD04 or a finance/legal review step is actually
  modeled.
- Real BPMN Need Role parsing on the backend (once F1 unblocks) will need to read the same
  `zeebe:TaskHeaders` (or equivalent) from the deployed process definition — this plan's
  Slice C authoring format should be chosen with that eventual backend reader in mind.
