// Action Registry (docs/research/action-availability-model.md mục 3.1) — mock/prototype.
// Danh mục tĩnh các action mà UI hồ sơ có thể render; KHÔNG tự phát sinh action logic
// mới ở tầng UI — mọi hành vi (điều kiện hiển thị) nằm ở data/actionAvailability.ts.
// Phân loại 3 nhóm theo doc mục 6/8: STANDARD (đi theo BPMN) · SUPPORT (không đổi luồng
// chính: Comment/Tải/Xem lịch sử) · EXCEPTION (đổi đường đi chuẩn, cần duyệt riêng).

import { EXCEPTION_TYPE_LABEL, type ExceptionType } from './exceptions'

export type ActionType = 'STANDARD' | 'SUPPORT' | 'EXCEPTION'

export interface ActionDefinition {
  actionCode: string
  actionName: string
  actionType: ActionType
  requiresReason?: boolean
  requiresEvidence?: boolean
  requiresConfirm?: boolean
  active: boolean
}

export const STANDARD_ACTION_CODES = {
  SUBMIT: 'SUBMIT',
  PROCESS_STEP: 'PROCESS_STEP',
} as const

/** Support actions (doc mục 6 loại 2) — không đổi workflow chính; nguồn hiển thị = Permission + Dossier Status. */
export const SUPPORT_ACTION_CODES = {
  ADD_COMMENT: 'ADD_COMMENT',
  DOWNLOAD_DOSSIER: 'DOWNLOAD_DOSSIER',
  VIEW_HISTORY: 'VIEW_HISTORY',
} as const

/** actionCode EXCEPTION ↔ ExceptionType (exceptions.ts) — 1-1, không phát minh taxonomy mới. */
export const EXCEPTION_ACTION_CODE: Record<ExceptionType, string> = {
  BypassCouncil: 'REQUEST_BYPASS_COUNCIL',
  JumpToHigherApprover: 'REQUEST_JUMP_TO_HIGHER_APPROVER',
  SkipStep: 'REQUEST_SKIP_STEP',
}

const standardActions: ActionDefinition[] = [
  {
    actionCode: STANDARD_ACTION_CODES.SUBMIT,
    actionName: 'Gửi duyệt',
    actionType: 'STANDARD',
    requiresConfirm: false,
    active: true,
  },
  {
    actionCode: STANDARD_ACTION_CODES.PROCESS_STEP,
    actionName: 'Xử lý',
    actionType: 'STANDARD',
    requiresConfirm: false,
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

export const ACTION_REGISTRY: Record<string, ActionDefinition> = Object.fromEntries(
  [...standardActions, ...supportActions, ...exceptionActions].map((a) => [a.actionCode, a]),
)
