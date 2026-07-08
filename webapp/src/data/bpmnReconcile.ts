// (D10 điểm 5) Cầu nối BPMN ↔ Action — công cụ "Đồng bộ / Đối soát từ BPMN".
//
// MOCK của một chức năng PULL-BASED (admin bấm, KHÔNG auto push-on-deploy) để tránh
// orphan churn giữa các phiên bản process của Camunda. Nó làm 2 việc (decisions.md D10.5):
//   1. Scaffold: từ mỗi USER TASK trong BPMN, sinh MỘT dòng Availability Policy cho MỖI
//      nhánh outcome của bước đó (SUBMIT/APPROVE/RETURN/REJECT).
//   2. Đối soát 2 chiều (coverage check) — vì hệ fail-closed nên đây là cơ chế ĐÚNG-SAI,
//      không chỉ tiện lợi:
//        🔴 user task không có action enabled nào  → bước bị kẹt (không nút để bấm)
//        🟡 có policy nhưng chưa gán form / mới phủ bằng luật chung (chưa ghim theo bước)
//        ⚪ policy trỏ tới taskDefinitionKey không còn trong BPMN → orphan
//      Cờ "bỏ qua có chủ đích" cho phép nén 🔴/🟡 với các bước cố ý không có nút.
//
// Nguồn "user task của BPMN" trong mock = `proc.taskSteps` (mỗi bước ~ 1 user task / 1 làn);
// nguồn "nhánh outcome của mỗi user task" = `ROUTING_TABLES` (mock của thứ Camunda suy ra
// từ gateway + conditionExpression). Xem processes.ts & stepRouting.ts.

import type { ActionSurface } from './actionPresentation'
import type { DossierStatus } from './dossiers'
import { PERMISSIONS, type ActionAvailabilityPolicy } from './actionAvailabilityPolicy'
import type { ProcessDef, TaskStep } from './processes'
import { ROUTING_TABLES, type RouteOutcome } from './stepRouting'
import { OUTCOME_ACTION_CODES, STANDARD_ACTION_CODES } from './actionRegistry'
import { APPROVAL_SLOTS } from './approvalSlotCatalog'

const SURFACE: ActionSurface = 'DOSSIER_DETAIL'
/** Nhánh trả lại / từ chối dùng phiếu ý kiến (khớp AP-07/08 — 1 eForm : n Action). */
const RETURN_REJECT_FORM = 'phieu-y-kien'

/** Outcome (nhánh gateway) → actionCode STANDARD tương ứng trong Registry. */
export const OUTCOME_TO_ACTION: Record<RouteOutcome, string> = {
  SUBMIT: STANDARD_ACTION_CODES.SUBMIT,
  APPROVE: OUTCOME_ACTION_CODES.APPROVE_STEP,
  RETURN: OUTCOME_ACTION_CODES.RETURN_STEP,
  REJECT: OUTCOME_ACTION_CODES.REJECT_STEP,
}

/** Bước Khởi tạo (SUBMIT) sống ở trạng thái draft; các bước phê duyệt ở processing. */
export function statusForOutcome(o: RouteOutcome): DossierStatus {
  return o === 'SUBMIT' ? 'draft' : 'processing'
}

/** Quyền tối thiểu cho action theo outcome. */
function permForOutcome(o: RouteOutcome): string {
  return o === 'SUBMIT' ? PERMISSIONS.SUBMIT_DOSSIER : PERMISSIONS.PROCESS_STEP
}

/** eForm gợi ý khi scaffold: RETURN/REJECT → phiếu ý kiến; còn lại lấy form của bước. */
function formForOutcome(o: RouteOutcome, ts: TaskStep): string | null {
  if (o === 'RETURN' || o === 'REJECT') return RETURN_REJECT_FORM
  return ts.formKey ?? null
}

// Thứ tự hiển thị của dòng scaffold PHẢI thấp hơn các luật chung (wildcard) seed sẵn
// (SUBMIT=10, APPROVE=21, RETURN=22, REJECT=23) để dòng ghim-theo-bước THẮNG first-match.
// Các bước khác nhau cùng outcome không tranh nhau (khác taskDefinitionKey), nên trùng số vô hại.
const SCAFFOLD_ORDER: Record<RouteOutcome, number> = {
  SUBMIT: 5,
  APPROVE: 11,
  RETURN: 12,
  REJECT: 13,
}

/** Id tất định để re-sync là UPSERT (không đẻ trùng) — cốt lõi của "pull-based reconcile". */
export function scaffoldPolicyId(processCode: string, stepKey: string, outcome: RouteOutcome): string {
  return `AP-BPMN-${processCode}-${stepKey}-${outcome}`
}

export type ReconcileStatus = 'ok' | 'generic' | 'unfilled' | 'missing' | 'skipped'

/** Độ phủ của MỘT nhánh outcome trên một user task. */
export interface OutcomeCoverage {
  outcome: RouteOutcome
  actionCode: string
  branchLabel: string
  dossierStatus: DossierStatus
  /** Luật enabled khớp nhất (first-match theo displayOrder); null = không có → 🔴. */
  matched: ActionAvailabilityPolicy | null
  /** matched có ghim đúng taskDefinitionKey của bước này không (vs. luật chung wildcard). */
  taskSpecific: boolean
  /** matched đã gán formKey chưa (mọi outcome action đều cần eForm theo D10). */
  formFilled: boolean
}

export interface TaskReconcile {
  stepKey: string
  ten: string
  vaiTroCodes: string[]
  outcomes: OutcomeCoverage[]
  status: ReconcileStatus
  reason: string
  /** Need Role của bước (nếu đã re-author qua Properties Panel — Slice C). */
  needRole?: string
  /**
   * 🟡 khi có needRole nhưng KHÔNG khớp mã nào trong Danh mục Slot đang active
   * (Slice D, docs/research/approval-slot-catalog-plan.md §4.D) — vd gõ nhầm mã,
   * hoặc slot đã bị vô hiệu hoá trong catalog. Null = không có needRole (chưa
   * re-author — không phải lỗi) hoặc needRole hợp lệ.
   */
  needRoleWarning: string | null
}

export interface OrphanPolicy {
  policy: ActionAvailabilityPolicy
  reason: string
}

export interface ProcessReconcile {
  procMa: string
  /** processCode dùng cho policy = nhóm RD (proc.nhom), vd 'RD01'. */
  processCode: string
  hasRouting: boolean
  tasks: TaskReconcile[]
  orphans: OrphanPolicy[]
  /** Đếm nhanh cho phần tóm tắt. */
  counts: Record<ReconcileStatus, number>
}

export interface ReconcileHealthSummary {
  processCount: number
  missingStepCount: number
  genericCoverageCount: number
  unfilledStepCount: number
  orphanPolicyCount: number
  okStepCount: number
  /** Số bước có needRole nhưng không khớp slot active nào trong catalog (Slice D). */
  needRoleWarningCount: number
}

/** 🟡 nếu bước có needRole nhưng không khớp mã slot active nào trong catalog; null nếu ổn. */
function needRoleWarningFor(ts: TaskStep): string | null {
  if (!ts.needRole) return null
  const known = APPROVAL_SLOTS.some((s) => s.code === ts.needRole && s.trangThai === 'active')
  return known ? null : `Need Role "${ts.needRole}" không khớp loại phê duyệt active nào trong Danh mục Loại phê duyệt.`
}

/** Các quy trình đối soát được = có taskSteps + bảng routing (nguồn outcome). */
export function reconcilableProcesses(): string[] {
  return Object.keys(ROUTING_TABLES)
}

/** Khớp policy theo cùng ngữ nghĩa như resolveActionAvailability (first-match theo displayOrder). */
function matchPolicy(
  policies: ActionAvailabilityPolicy[],
  actionCode: string,
  processCode: string,
  dossierStatus: DossierStatus,
  taskKey: string,
): ActionAvailabilityPolicy | null {
  return (
    policies
      .filter(
        (p) =>
          p.enabled &&
          p.actionCode === actionCode &&
          (p.surface == null || p.surface === SURFACE) &&
          (p.processCode == null || p.processCode === processCode) &&
          (p.dossierStatus == null || p.dossierStatus === dossierStatus) &&
          (p.taskDefinitionKey == null || p.taskDefinitionKey === taskKey),
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)[0] ?? null
  )
}

/** Rollup trạng thái một bước từ độ phủ từng nhánh (ưu tiên: missing > unfilled > generic > ok). */
function rollup(outcomes: OutcomeCoverage[]): { status: ReconcileStatus; reason: string } {
  if (outcomes.some((o) => o.matched == null)) {
    const gaps = outcomes.filter((o) => o.matched == null).map((o) => o.outcome)
    return { status: 'missing', reason: `Chưa có luật enabled cho nhánh: ${gaps.join(', ')} → bước bị kẹt (fail-closed).` }
  }
  if (outcomes.some((o) => !o.formFilled)) {
    const gaps = outcomes.filter((o) => !o.formFilled).map((o) => o.outcome)
    return { status: 'unfilled', reason: `Có luật nhưng CHƯA gán biểu mẫu cho nhánh: ${gaps.join(', ')}.` }
  }
  if (outcomes.some((o) => !o.taskSpecific)) {
    return { status: 'generic', reason: 'Mới phủ bằng luật chung (wildcard) — nên ghim theo bước để gán đúng biểu mẫu.' }
  }
  return { status: 'ok', reason: 'Mọi nhánh đã có luật ghim theo bước + biểu mẫu đầy đủ.' }
}

/**
 * Đối soát một quy trình: so BPMN (taskSteps × routing) ↔ tập Availability Policy hiện hành.
 * `skipped` = set các stepKey bị "bỏ qua có chủ đích".
 */
export function reconcileProcess(
  proc: ProcessDef,
  policies: ActionAvailabilityPolicy[],
  skipped: Set<string>,
): ProcessReconcile {
  const processCode = proc.ma
  const routing = ROUTING_TABLES[proc.ma]
  const taskSteps = proc.taskSteps ?? []
  const knownKeys = new Set(taskSteps.map((t) => t.key))

  const tasks: TaskReconcile[] = taskSteps
    .map((ts) => {
      const branches = routing?.find((r) => r.stepKey === ts.key)?.branches ?? []
      const outcomes: OutcomeCoverage[] = branches.map((b) => {
        const actionCode = OUTCOME_TO_ACTION[b.outcome]
        const dossierStatus = statusForOutcome(b.outcome)
        const matched = matchPolicy(policies, actionCode, processCode, dossierStatus, ts.key)
        return {
          outcome: b.outcome,
          actionCode,
          branchLabel: b.label,
          dossierStatus,
          matched,
          taskSpecific: matched?.taskDefinitionKey === ts.key && ts.key != null,
          formFilled: !!matched?.formKey,
        }
      })
      const base = skipped.has(ts.key)
        ? { status: 'skipped' as ReconcileStatus, reason: 'Bỏ qua có chủ đích — bước này cố ý không cần nút.' }
        : rollup(outcomes)
      return {
        stepKey: ts.key,
        ten: ts.ten,
        vaiTroCodes: ts.vaiTroCodes ?? [],
        outcomes,
        status: base.status,
        reason: base.reason,
        needRole: ts.needRole,
        needRoleWarning: needRoleWarningFor(ts),
      }
    })
    // Chỉ giữ các bước thực sự có nhánh outcome (bỏ bước không nằm trong bảng routing).
    .filter((t) => t.outcomes.length > 0)

  // ⚪ Orphan: policy ghim taskDefinitionKey thuộc quy trình này nhưng key đã biến mất khỏi BPMN.
  const orphans: OrphanPolicy[] = policies
    .filter(
      (p) =>
        p.taskDefinitionKey != null &&
        // Chỉ soi policy đã ghim đúng nhóm quy trình này để tránh báo nhầm bước của quy trình khác.
        p.processCode === processCode &&
        !knownKeys.has(p.taskDefinitionKey),
    )
    .map((p) => ({
      policy: p,
      reason: `taskDefinitionKey "${p.taskDefinitionKey}" không còn trong BPMN của ${proc.ma}.`,
    }))

  const counts: Record<ReconcileStatus, number> = { ok: 0, generic: 0, unfilled: 0, missing: 0, skipped: 0 }
  tasks.forEach((t) => (counts[t.status] += 1))

  return { procMa: proc.ma, processCode, hasRouting: !!routing, tasks, orphans, counts }
}

export function summarizeReconcileHealth(
  processes: ProcessDef[],
  policies: ActionAvailabilityPolicy[],
  skippedForProcess: (proc: ProcessDef) => Set<string> = () => new Set(),
): ReconcileHealthSummary {
  const processCodes = new Set(reconcilableProcesses())
  return processes
    .filter((proc) => processCodes.has(proc.ma))
    .map((proc) => reconcileProcess(proc, policies, skippedForProcess(proc)))
    .reduce<ReconcileHealthSummary>(
      (summary, recon) => {
        summary.processCount += 1
        summary.missingStepCount += recon.counts.missing
        summary.unfilledStepCount += recon.counts.unfilled
        summary.okStepCount += recon.counts.ok
        summary.orphanPolicyCount += recon.orphans.length
        summary.genericCoverageCount += recon.tasks.reduce(
          (count, task) => count + task.outcomes.filter((outcome) => outcome.matched && !outcome.taskSpecific).length,
          0,
        )
        summary.needRoleWarningCount += recon.tasks.filter((task) => task.needRoleWarning).length
        return summary
      },
      {
        processCount: 0,
        missingStepCount: 0,
        genericCoverageCount: 0,
        unfilledStepCount: 0,
        orphanPolicyCount: 0,
        okStepCount: 0,
        needRoleWarningCount: 0,
      },
    )
}
export interface ScaffoldResult {
  next: ActionAvailabilityPolicy[]
  added: number
  updated: number
}

/**
 * Sinh (upsert) các dòng policy ghim-theo-bước từ BPMN cho một quy trình.
 * Mỗi (user task × nhánh outcome) → 1 dòng, trừ các bước bị "bỏ qua có chủ đích".
 * Id tất định ⇒ chạy lại = cập nhật, không tạo bản trùng (pull-based reconcile).
 */
export function scaffoldPoliciesFromBpmn(
  proc: ProcessDef,
  policies: ActionAvailabilityPolicy[],
  skipped: Set<string>,
): ScaffoldResult {
  const processCode = proc.ma
  const routing = ROUTING_TABLES[proc.ma]
  const taskSteps = proc.taskSteps ?? []
  const byId = new Map(policies.map((p) => [p.id, p] as const))
  let added = 0
  let updated = 0

  for (const ts of taskSteps) {
    if (skipped.has(ts.key)) continue
    const branches = routing?.find((r) => r.stepKey === ts.key)?.branches ?? []
    for (const b of branches) {
      const id = scaffoldPolicyId(processCode, ts.key, b.outcome)
      const row: ActionAvailabilityPolicy = {
        id,
        actionCode: OUTCOME_TO_ACTION[b.outcome],
        surface: SURFACE,
        processCode,
        taskDefinitionKey: ts.key,
        dossierStatus: statusForOutcome(b.outcome),
        allowedRoleCodes: [], // để trống = theo candidateGroups của bước (quy ước D10)
        requiredPermissions: [permForOutcome(b.outcome)],
        formKey: formForOutcome(b.outcome, ts),
        conditionExpression:
          b.outcome === 'SUBMIT' ? 'dossier.docsComplete = true' : 'user in currentStep.candidateGroups',
        displayOrder: SCAFFOLD_ORDER[b.outcome],
        enabled: true,
      }
      if (byId.has(id)) updated += 1
      else added += 1
      byId.set(id, row)
    }
  }

  return { next: Array.from(byId.values()), added, updated }
}

