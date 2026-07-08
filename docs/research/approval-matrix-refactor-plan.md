# Approval Matrix Refactor Plan

Date: 2026-07-08

Target module: `/ma-tran-phe-duyet` / EPIC06 Approval Matrix.

Status: Planning document only. This plan does not start backend EPIC work; real persistence/runtime enforcement still waits on Foundation 1 decisions.

---

## 1. Problem Statement

The current Approval Matrix mock demonstrates the idea well, but its schema and runtime wiring are too narrow:

- Conditions are hard-coded as `cap`, `loaiHoiDong`, `budgetMin`, `budgetMax`.
- Rule result is mostly `approverRoleCodes`, while real assignment may be group, user, org position, dynamic expression, council, sequential chain, or all-approvers mode.
- Runtime dossier screens use `resolveGroups(currentStep.vaiTroCodes)` instead of full `resolveApprovers(slot + conditions)`.
- The rule table has no conflict/shadow detection.
- The UI cannot scale when more business conditions appear.
- There is no structured audit explanation for "why was this assigned to this person?".

The refactor should turn Approval Matrix into a configurable assignment resolver:

> Input: approval slot + dossier/process context + organization/user state.
> Output: assignment target(s), explanation, warnings, and audit payload.

---

## 2. Desired Boundary

Approval Matrix owns:

- Approval slot catalog.
- Assignment rules.
- Condition matching against a declared variable contract.
- Resolution from rule result to candidate groups/users.
- Delegation/temporary replacement overlay.
- Explanation/audit payload.
- Simulation and admin configuration UI.

Approval Matrix does not own:

- BPMN flow structure.
- DMN/business policy decisions unrelated to assignment.
- RBAC permission enforcement.
- Organization master data.
- Council member lifecycle.
- Form definitions.

---

## 3. Proposed Data Model

### 3.1 Approval Rule

```ts
export interface ApprovalRule {
  id: string
  name: string
  description?: string
  slot: SlotCode
  conditions: ConditionGroup
  assignment: ApprovalAssignment
  priority: number
  enabled: boolean
  effectiveFrom?: string
  effectiveTo?: string
  version?: number
  updatedAt?: string
  updatedBy?: string
}
```

### 3.2 Condition Tree

```ts
export type ConditionNode = ConditionLeaf | ConditionGroup

export interface ConditionGroup {
  kind: "group"
  logic: "AND" | "OR"
  items: ConditionNode[]
}

export interface ConditionLeaf {
  kind: "condition"
  field: string
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "between"
    | "in"
    | "contains"
    | "exists"
    | "notExists"
  value?: unknown
  valueTo?: unknown
}
```

### 3.3 Variable Registry

```ts
export interface ApprovalVariableDef {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "date" | "enum" | "multiEnum"
  source: "dossier" | "mission" | "process" | "dmn" | "organization" | "system"
  operators: ConditionLeaf["operator"][]
  options?: { value: string; label: string }[]
  requiredForSimulation?: boolean
}
```

Seed examples:

- `capNhiemVu`
- `loaiNhiemVu`
- `tongDuToan`
- `donViChuTri`
- `nguonVon`
- `linhVucKhcn`
- `mucDoMat`
- `coMuaSam`
- `coThueNgoai`
- `loaiHoiDong`
- `processCode`
- `taskDefinitionKey`
- `slot`

### 3.4 Assignment Result

```ts
export interface ApprovalAssignment {
  mode: "ANY_ONE" | "ALL" | "SEQUENTIAL"
  targets: ApprovalTarget[]
}

export type ApprovalTarget =
  | { type: "GROUP"; roleCodes: string[] }
  | { type: "USER"; userIds: string[] }
  | { type: "ORG_POSITION"; positionCode: string; orgScope: OrgScope }
  | { type: "COUNCIL"; councilType: string; roleInCouncil?: string }
  | { type: "EXPRESSION"; expression: string }
```

---

## 4. Refactor Slices

### Slice A - Extract Dynamic Condition Engine

Goal: Replace hard-coded matching with generic condition evaluation.

Tasks:

- Add `webapp/src/data/approvalConditions.ts`.
- Define `ConditionNode`, `ConditionGroup`, `ConditionLeaf`.
- Implement `evaluateConditionTree(tree, context, registry)`.
- Implement operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `in`, `contains`, `exists`, `notExists`.
- Implement `describeConditionTree()` for readable Vietnamese preview.
- Add lightweight tests/harness for numeric, enum, boolean, missing field, AND/OR nesting.

Acceptance:

- Existing `cap/budget/loaiHoiDong` seed behavior can be represented by condition trees.
- Missing required values fail closed.
- Condition preview is readable by non-technical users.

### Slice B - Create Approval Variable Registry

Goal: Make available condition fields metadata-driven.

Tasks:

- Add `webapp/src/data/approvalVariableRegistry.ts`.
- Map existing dossier/process/DMN fields into a flat resolve context.
- Provide option lists for enum fields.
- Reuse or align with `variableContract.ts` where possible.

Acceptance:

- Adding a new condition field should not require editing `ApprovalMatrix.tsx`.
- UI can render correct input control from field type.

### Slice C - Migrate Rule Schema

Goal: Move from fixed fields to `conditions` + `assignment`.

Tasks:

- Update `ApprovalRule` in `approvalMatrix.ts`.
- Migrate seed rules:
  - `cap: CS` -> condition `capNhiemVu eq CS`.
  - `budgetMin` -> condition `tongDuToan gte value`.
  - `loaiHoiDong` -> condition `loaiHoiDong eq value`.
- Keep temporary backward compatibility only if needed during migration.
- Update `resolveApprovers()` to use condition engine.

Acceptance:

- Simulation returns the same outputs for current seed scenarios.
- Old hard-coded fields are no longer the primary schema.

### Slice D - Build Condition Builder UI

Goal: Make the admin UI scalable for many conditions.

Tasks:

- Add `components/ConditionBuilder.tsx` or local component inside `ApprovalMatrix.tsx`.
- Support:
  - Add/remove condition.
  - Change field/operator/value.
  - AND/OR groups.
  - Field-specific input controls.
  - Preview text.
- Replace fixed form fields in Approval Matrix modal.

Acceptance:

- Admin can create a rule with nested AND/OR.
- Admin can create budget, enum, boolean, and string conditions.
- UI clearly indicates empty/wildcard condition groups.

### Slice E - Refactor Assignment Builder

Goal: Support result types beyond candidate group.

Tasks:

- Replace "Người / nhóm phê duyệt" with "Kết quả phân công".
- Support at least:
  - GROUP
  - USER
  - ORG_POSITION as planned placeholder
  - COUNCIL as planned placeholder
- Add mode selection:
  - ANY_ONE
  - ALL
  - SEQUENTIAL

Acceptance:

- Current group-based rules still work.
- UI no longer labels group assignment as if it were concrete users.

### Slice F - Rule Conflict and Coverage Analysis

Goal: Prevent silent shadowing and missing assignment.

Tasks:

- Add analyzer that detects:
  - Same slot + same priority.
  - Broad rule before specific rule.
  - Empty assignment.
  - No fallback for common slot/context.
  - Disabled rule that leaves gap.
- Surface warnings in table and modal.

Acceptance:

- User sees warning before saving a rule that can shadow another rule.
- Simulation shows all candidate rules, not only the winning rule.

### Slice G - Runtime Integration with Dossier

Goal: Make dossier screens consume full Approval Matrix resolver, not only group mapping.

Tasks:

- Define a function like `buildApprovalContext(dossier, process, step)`.
- Map step/process to `slot`.
- Call `resolveApprovers(rules, context)` in `DossierDetail` where appropriate.
- Keep `resolveGroups()` as lower-level organization resolution, not the main runtime path.

Acceptance:

- Changing a rule in Approval Matrix can change predicted approver in dossier mock.
- Dossier view can show matched rule and explanation.

Note: Because current rule edits are in-memory per page, cross-page runtime impact may require a shared context/store before it is visible outside the Approval Matrix page.

### Slice H - Audit and Explanation Payload

Goal: Every resolve must explain itself.

Tasks:

- Extend `ResolveResult`:

```ts
interface ResolveResult {
  matchedRule: ApprovalRule | null
  approvers: ResolvedApprover[]
  evaluatedRules: EvaluatedRule[]
  warnings: string[]
  reason: string
  audit: ApprovalResolveAudit
}
```

- Include:
  - input context snapshot
  - matched rule id/version
  - skipped rules and reasons
  - assignment target before org resolution
  - final users after delegation

Acceptance:

- Simulation can show "why this person".
- Process Monitor/Audit can later reuse the same payload.

### Slice I - Persistence Readiness

Goal: Prepare the frontend model for backend service without starting backend implementation.

Tasks:

- Define DTOs for future endpoints:
  - `GET /approval-matrix/rules`
  - `POST /approval-matrix/rules`
  - `PUT /approval-matrix/rules/{id}`
  - `POST /approval-matrix/resolve`
  - `POST /approval-matrix/analyze`
- Keep mock store shape close to DTO.

Acceptance:

- Frontend mock can later swap local state for API client with minimal UI change.

---

## 5. Suggested Implementation Order

1. Slice A - condition engine.
2. Slice B - variable registry.
3. Slice C - migrate rule schema.
4. Slice D - condition builder UI.
5. Slice E - assignment builder UI.
6. Slice F - conflict/coverage warnings.
7. Slice H - explanation/audit payload.
8. Slice G - dossier runtime integration.
9. Slice I - persistence DTO readiness.

Reasoning: build the model and evaluator first, then UI, then runtime wiring. This avoids wiring dossiers to a schema that is about to change.

---

## 6. Files Likely To Change

New:

- `webapp/src/data/approvalConditions.ts`
- `webapp/src/data/approvalVariableRegistry.ts`
- `webapp/src/components/ConditionBuilder.tsx`
- `webapp/src/components/AssignmentBuilder.tsx`
- Optional: `webapp/src/store/ApprovalMatrixContext.tsx`

Existing:

- `webapp/src/data/approvalMatrix.ts`
- `webapp/src/pages/ApprovalMatrix.tsx`
- `webapp/src/pages/DossierDetail.tsx`
- `webapp/src/components/StepRoutingDiagram.tsx`
- `webapp/src/data/variableContract.ts`
- `webapp/src/data/processes.ts`
- `webapp/src/data/dossiers.ts`
- `webapp/src/data/users.ts`
- `webapp/src/data/roles.ts`

---

## 7. UX Direction

The Approval Matrix screen should become a focused operations/configuration tool:

- Top: rule table with status, priority, slot, condition summary, assignment summary, warnings.
- Right or drawer: simulation/debug panel.
- Rule modal/drawer:
  - Basic info.
  - Slot.
  - Condition Builder.
  - Assignment Builder.
  - Effective period.
  - Preview and conflict analysis.

Important UI copy:

- Use "Nhóm phê duyệt" when the target is candidate group.
- Use "Người phê duyệt sau resolve" only after org/user resolution.
- Show "prototype/mock" clearly until backend persistence exists.

---

## 8. Risks And Open Questions

- How to map existing BPMN task steps to approval slots without fabricating wrong slots?
- Should slot live in BPMN extension properties, process task metadata, or a separate mapping table?
- Which variables are official input contract for Approval Matrix?
- Should Business Rule/DMN output be consumed directly or normalized into dossier context first?
- How will org-position resolution work for acting roles, vacant positions, and multiple incumbents?
- What is the approval mode for councils: any one, quorum, all, or chairperson only?
- Should delegation be a separate module with its own lifecycle and audit?

---

## 9. Near-Term Mock Deliverable

A practical next mock slice:

1. Implement generic condition engine and registry.
2. Migrate current seed rules to `conditions`.
3. Replace fixed condition fields in the modal with a simple Condition Builder.
4. Keep assignment as GROUP-only for the first pass.
5. Add simulation explanation showing matched/skipped rules.

This gives immediate responsiveness to "many possible conditions" without waiting for backend decisions.

