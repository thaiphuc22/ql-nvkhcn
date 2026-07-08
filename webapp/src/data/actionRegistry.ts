// Action Registry (docs/research/action-availability-model.md mục 3.1) — mock/prototype.
// Danh mục tĩnh các action mà UI hồ sơ có thể render; KHÔNG tự phát sinh action logic
// mới ở tầng UI — mọi hành vi (điều kiện hiển thị) nằm ở data/actionAvailability.ts.
// Phân loại 3 nhóm theo doc mục 6/8: STANDARD (đi theo BPMN) · SUPPORT (không đổi luồng
// chính: Comment/Tải/Xem lịch sử) · EXCEPTION (đổi đường đi chuẩn, cần duyệt riêng).

import { EXCEPTION_TYPE_LABEL, type ExceptionType } from './exceptions'
import type { RouteOutcome } from './stepRouting'

export type ActionType = 'STANDARD' | 'SUPPORT' | 'EXCEPTION'

export interface ActionDefinition {
  actionCode: string
  actionName: string
  actionType: ActionType
  /**
   * (D10) Với STANDARD action theo outcome: nhãn kết quả mà action này đại diện.
   * Đích đến KHÔNG nằm ở đây — vẫn resolve qua `resolveRouting` (một nguồn sự thật
   * chung với sơ đồ nhánh). Action chỉ "khai báo" mình là APPROVE/RETURN/REJECT/SUBMIT.
   */
  outcome?: RouteOutcome
  requiresReason?: boolean
  requiresEvidence?: boolean
  requiresConfirm?: boolean
  active: boolean
}

export const STANDARD_ACTION_CODES = {
  SUBMIT: 'SUBMIT',
} as const

/**
 * (D10) Mỗi hướng xử lý của một bước phê duyệt là MỘT action STANDARD độc lập —
 * thay cho một "PROCESS_STEP" gộp. Tập hữu hạn theo outcome (không nổ theo user task).
 * Form của từng action gắn trên Availability Policy (1 eForm : n Action).
 */
export const OUTCOME_ACTION_CODES = {
  APPROVE_STEP: 'APPROVE_STEP',
  RETURN_STEP: 'RETURN_STEP',
  REJECT_STEP: 'REJECT_STEP',
} as const

/** Support actions (doc mục 6 loại 2) — không đổi workflow chính; nguồn hiển thị = Permission + Dossier Status. */
export const SUPPORT_ACTION_CODES = {
  ADD_COMMENT: 'ADD_COMMENT',
  DOWNLOAD_DOSSIER: 'DOWNLOAD_DOSSIER',
  VIEW_HISTORY: 'VIEW_HISTORY',
} as const

/**
 * (docs/research/action-registry-list.md — "Đề xuất Support Actions", Phase 2) Seed-only:
 * có mặt trong Action Registry/"Danh mục nút" để admin thấy và cấu hình dần, nhưng KHÔNG có
 * `ActionAvailabilityPolicy` nào tham chiếu các mã này — nên chưa xuất hiện trên hồ sơ/worklist
 * thật cho tới khi ai đó tạo policy cho từng bước.
 */
export const PROPOSED_SUPPORT_ACTION_CODES = {
  UPLOAD_ATTACHMENT: 'UPLOAD_ATTACHMENT',
  VIEW_DOCUMENTS: 'VIEW_DOCUMENTS',
  EXPORT_PDF: 'EXPORT_PDF',
  PRINT_DOSSIER: 'PRINT_DOSSIER',
  VIEW_AUDIT: 'VIEW_AUDIT',
} as const

/** actionCode EXCEPTION ↔ ExceptionType (exceptions.ts) — 1-1, không phát minh taxonomy mới. */
export const EXCEPTION_ACTION_CODE: Record<ExceptionType, string> = {
  BypassCouncil: 'REQUEST_BYPASS_COUNCIL',
  JumpToHigherApprover: 'REQUEST_JUMP_TO_HIGHER_APPROVER',
  SkipStep: 'REQUEST_SKIP_STEP',
}

/**
 * (docs/research/action-registry-list.md — "Đề xuất Exception Actions", Phase 3) Seed-only,
 * cùng lý do như PROPOSED_SUPPORT_ACTION_CODES. Khác với `EXCEPTION_ACTION_CODE` ở trên, các
 * mã này CHƯA có `ExceptionType` tương ứng trong `exceptions.ts` nên chưa đi qua được
 * `getAvailableActions`/`getDebugActions` (chỉ lặp qua `EXCEPTION_ACTION_CODE`) — chỉ hiển
 * thị ở tab "Danh mục nút" (Action Studio) cho tới khi có ExceptionType + Exception Policy
 * riêng cho từng mã.
 */
export const PROPOSED_EXCEPTION_ACTION_CODES = {
  REQUEST_ADD_REVIEWER: 'REQUEST_ADD_REVIEWER',
  REQUEST_REPLACE_APPROVER: 'REQUEST_REPLACE_APPROVER',
  REQUEST_REOPEN_STEP: 'REQUEST_REOPEN_STEP',
  REQUEST_MANUAL_COMPLETION: 'REQUEST_MANUAL_COMPLETION',
  REQUEST_EMERGENCY_APPROVAL: 'REQUEST_EMERGENCY_APPROVAL',
} as const

const standardActions: ActionDefinition[] = [
  {
    actionCode: STANDARD_ACTION_CODES.SUBMIT,
    actionName: 'Gửi duyệt',
    actionType: 'STANDARD',
    outcome: 'SUBMIT',
    requiresConfirm: false,
    active: true,
  },
  // (D10) 3 outcome action — nút "chính là quyết định"; form riêng lấy qua policy.
  {
    actionCode: OUTCOME_ACTION_CODES.APPROVE_STEP,
    actionName: 'Đồng ý duyệt',
    actionType: 'STANDARD',
    outcome: 'APPROVE',
    requiresConfirm: true,
    active: true,
  },
  {
    actionCode: OUTCOME_ACTION_CODES.RETURN_STEP,
    actionName: 'Yêu cầu điều chỉnh',
    actionType: 'STANDARD',
    outcome: 'RETURN',
    requiresReason: true,
    active: true,
  },
  {
    actionCode: OUTCOME_ACTION_CODES.REJECT_STEP,
    actionName: 'Từ chối duyệt',
    actionType: 'STANDARD',
    outcome: 'REJECT',
    requiresReason: true,
    requiresConfirm: true,
    active: true,
  },
]

const supportActions: ActionDefinition[] = [
  {
    actionCode: SUPPORT_ACTION_CODES.ADD_COMMENT,
    actionName: 'Bổ sung ý kiến',
    actionType: 'SUPPORT',
    requiresReason: true,
    requiresConfirm: false,
    active: true,
  },
  {
    actionCode: SUPPORT_ACTION_CODES.DOWNLOAD_DOSSIER,
    actionName: 'Tải hồ sơ',
    actionType: 'SUPPORT',
    requiresConfirm: false,
    active: true,
  },
  {
    actionCode: SUPPORT_ACTION_CODES.VIEW_HISTORY,
    actionName: 'Xem lịch sử',
    actionType: 'SUPPORT',
    requiresConfirm: false,
    active: true,
  },
]

/** Seed Phase 2 — xem PROPOSED_SUPPORT_ACTION_CODES. */
const proposedSupportActions: ActionDefinition[] = [
  {
    actionCode: PROPOSED_SUPPORT_ACTION_CODES.UPLOAD_ATTACHMENT,
    actionName: 'Tải lên tài liệu',
    actionType: 'SUPPORT',
    requiresConfirm: false,
    active: true,
  },
  {
    actionCode: PROPOSED_SUPPORT_ACTION_CODES.VIEW_DOCUMENTS,
    actionName: 'Xem tài liệu',
    actionType: 'SUPPORT',
    requiresConfirm: false,
    active: true,
  },
  {
    actionCode: PROPOSED_SUPPORT_ACTION_CODES.EXPORT_PDF,
    actionName: 'Xuất PDF',
    actionType: 'SUPPORT',
    requiresConfirm: false,
    active: true,
  },
  {
    actionCode: PROPOSED_SUPPORT_ACTION_CODES.PRINT_DOSSIER,
    actionName: 'In hồ sơ',
    actionType: 'SUPPORT',
    requiresConfirm: false,
    active: true,
  },
  {
    actionCode: PROPOSED_SUPPORT_ACTION_CODES.VIEW_AUDIT,
    actionName: 'Xem audit chi tiết',
    actionType: 'SUPPORT',
    requiresConfirm: false,
    active: true,
  },
]

const exceptionActions: ActionDefinition[] = (
  Object.entries(EXCEPTION_ACTION_CODE) as [ExceptionType, string][]
).map(([exceptionType, actionCode]) => ({
  actionCode,
  actionName: EXCEPTION_TYPE_LABEL[exceptionType],
  actionType: 'EXCEPTION',
  requiresReason: true,
  requiresEvidence: false,
  requiresConfirm: true,
  active: true,
}))

/** Seed Phase 3 — xem PROPOSED_EXCEPTION_ACTION_CODES. */
const proposedExceptionActions: ActionDefinition[] = [
  {
    actionCode: PROPOSED_EXCEPTION_ACTION_CODES.REQUEST_ADD_REVIEWER,
    actionName: 'Yêu cầu bổ sung người thẩm định',
    actionType: 'EXCEPTION',
    requiresReason: true,
    requiresEvidence: false,
    requiresConfirm: true,
    active: true,
  },
  {
    actionCode: PROPOSED_EXCEPTION_ACTION_CODES.REQUEST_REPLACE_APPROVER,
    actionName: 'Yêu cầu thay người xử lý/phê duyệt',
    actionType: 'EXCEPTION',
    requiresReason: true,
    requiresEvidence: false,
    requiresConfirm: true,
    active: true,
  },
  {
    actionCode: PROPOSED_EXCEPTION_ACTION_CODES.REQUEST_REOPEN_STEP,
    actionName: 'Yêu cầu mở lại bước đã xử lý',
    actionType: 'EXCEPTION',
    requiresReason: true,
    requiresEvidence: true,
    requiresConfirm: true,
    active: true,
  },
  {
    actionCode: PROPOSED_EXCEPTION_ACTION_CODES.REQUEST_MANUAL_COMPLETION,
    actionName: 'Yêu cầu hoàn tất thủ công',
    actionType: 'EXCEPTION',
    requiresReason: true,
    requiresEvidence: true,
    requiresConfirm: true,
    active: true,
  },
  {
    actionCode: PROPOSED_EXCEPTION_ACTION_CODES.REQUEST_EMERGENCY_APPROVAL,
    actionName: 'Yêu cầu phê duyệt khẩn',
    actionType: 'EXCEPTION',
    requiresReason: true,
    requiresEvidence: false,
    requiresConfirm: true,
    active: true,
  },
]

export const ACTION_REGISTRY: Record<string, ActionDefinition> = Object.fromEntries(
  [
    ...standardActions,
    ...supportActions,
    ...proposedSupportActions,
    ...exceptionActions,
    ...proposedExceptionActions,
  ].map((a) => [a.actionCode, a]),
)
