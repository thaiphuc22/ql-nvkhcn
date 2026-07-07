import { ACTION_REGISTRY, type ActionType } from './actionRegistry'

export type ActionSurface =
  | 'DOSSIER_DETAIL'
  | 'DOSSIER_LIST'
  | 'WORKLIST'
  | 'PROCESS_DETAIL'
  | 'EXCEPTION_REVIEW'
  | 'ACTION_STUDIO'

export const ACTION_SURFACE_LABEL: Record<ActionSurface, string> = {
  DOSSIER_DETAIL: 'Chi tiết hồ sơ',
  DOSSIER_LIST: 'Danh sách hồ sơ',
  WORKLIST: 'Việc của tôi',
  PROCESS_DETAIL: 'Chi tiết quy trình',
  EXCEPTION_REVIEW: 'Duyệt ngoại lệ',
  ACTION_STUDIO: 'Cấu hình hành động',
}

export const ACTION_SURFACES = Object.keys(ACTION_SURFACE_LABEL) as ActionSurface[]

export type ActionUiGroup = 'PRIMARY' | 'MORE' | 'EXCEPTION'

export const ACTION_UI_GROUP_LABEL: Record<ActionUiGroup, string> = {
  PRIMARY: 'Primary Actions',
  MORE: 'More Actions',
  EXCEPTION: 'Exception Actions',
}

export type ActionTone = 'primary' | 'default' | 'danger' | 'warning'

export const ACTION_TONE_LABEL: Record<ActionTone, string> = {
  primary: 'Primary',
  default: 'Default',
  danger: 'Danger',
  warning: 'Warning',
}

export interface ActionPresentation {
  actionCode: string
  displayLabel: string
  tooltip?: string
  icon: string
  uiGroup: ActionUiGroup
  tone: ActionTone
  defaultOrder: number
  locale: 'vi-VN'
}

const ICON_BY_ACTION: Record<string, string> = {
  SUBMIT: 'send',
  PROCESS_STEP: 'form',
  ADD_COMMENT: 'comment',
  DOWNLOAD_DOSSIER: 'download',
  VIEW_HISTORY: 'history',
  REQUEST_BYPASS_COUNCIL: 'warning',
  REQUEST_JUMP_TO_HIGHER_APPROVER: 'swap',
  REQUEST_SKIP_STEP: 'forward',
}

function groupForType(type: ActionType): ActionUiGroup {
  if (type === 'STANDARD') return 'PRIMARY'
  if (type === 'EXCEPTION') return 'EXCEPTION'
  return 'MORE'
}

function toneForType(type: ActionType): ActionTone {
  if (type === 'EXCEPTION') return 'danger'
  if (type === 'STANDARD') return 'primary'
  return 'default'
}

function orderForType(type: ActionType, index: number): number {
  if (type === 'STANDARD') return 10 + index
  if (type === 'SUPPORT') return 60 + index
  return 90 + index
}

export const ACTION_PRESENTATIONS: ActionPresentation[] = Object.values(ACTION_REGISTRY).map(
  (def, index) => ({
    actionCode: def.actionCode,
    displayLabel: def.actionName,
    tooltip:
      def.actionType === 'EXCEPTION'
        ? 'Hành động ngoại lệ cần kiểm soát và phê duyệt riêng.'
        : undefined,
    icon: ICON_BY_ACTION[def.actionCode] ?? 'control',
    uiGroup: groupForType(def.actionType),
    tone: toneForType(def.actionType),
    defaultOrder: orderForType(def.actionType, index),
    locale: 'vi-VN',
  }),
)

export function getActionPresentation(
  presentations: ActionPresentation[],
  actionCode: string,
): ActionPresentation {
  const custom = presentations.find((p) => p.actionCode === actionCode)
  if (custom) return custom
  const def = ACTION_REGISTRY[actionCode]
  return {
    actionCode,
    displayLabel: def?.actionName ?? actionCode,
    icon: ICON_BY_ACTION[actionCode] ?? 'control',
    uiGroup: def ? groupForType(def.actionType) : 'MORE',
    tone: def ? toneForType(def.actionType) : 'default',
    defaultOrder: 999,
    locale: 'vi-VN',
  }
}