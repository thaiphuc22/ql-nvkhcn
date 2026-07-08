// Action Availability Model (docs/research/action-availability-model.md mục 4-8) — mock/prototype.
// Một hàm thuần duy nhất thay cho các điều kiện JSX rời rạc trong UI: UI chỉ render theo kết quả này.

import {
  ACTION_PRESENTATIONS,
  getActionPresentation,
  type ActionPresentation,
  type ActionSurface,
  type ActionTone,
  type ActionUiGroup,
} from './actionPresentation'
import { ACTION_REGISTRY, EXCEPTION_ACTION_CODE } from './actionRegistry'
import type { RouteOutcome } from './stepRouting'
import {
  ACTION_AVAILABILITY_POLICIES,
  resolveActionAvailability,
  type ActionAvailabilityPolicy,
} from './actionAvailabilityPolicy'
import type { DossierStatus } from './dossiers'
import type { ExceptionType } from './exceptions'
import {
  EXCEPTION_POLICIES,
  exceptionConditionExpression,
  resolveExceptionPolicy,
  type ExceptionActionPolicy,
} from './exceptionPolicy'
import type { Cap } from './nhiemVu'

export interface AvailableAction {
  actionCode: string
  label: string
  tooltip?: string
  icon: string
  uiGroup: ActionUiGroup
  tone: ActionTone
  displayOrder: number
  type: 'STANDARD' | 'SUPPORT' | 'EXCEPTION'
  enabled: boolean
  disabledReason?: string
  requiresReason?: boolean
  requiresEvidence?: boolean
  requiresConfirm?: boolean
  /** (D10) Nhãn kết quả của action — đích đến vẫn do resolveRouting quyết, không nằm ở đây. */
  outcome?: RouteOutcome
  /** (D10) eForm mà UI mở khi bấm action này — tham chiếu Thư viện biểu mẫu (1 eForm : n Action). */
  formKey?: string | null
  /** Minh hoạ policy thật sẽ kiểm tra gì — chưa evaluate conditionExpression. */
  conditionExpression?: string
  matchedPolicyId?: string
}

function toAvailableAction(
  actionCode: string,
  enabled: boolean,
  presentations: ActionPresentation[],
  disabledReason?: string,
  conditionExpression?: string,
  displayOrder?: number,
  matchedPolicyId?: string,
  formKey?: string | null,
): AvailableAction {
  const def = ACTION_REGISTRY[actionCode]
  const presentation = getActionPresentation(presentations, actionCode)
  return {
    actionCode,
    label: presentation.displayLabel,
    tooltip: presentation.tooltip,
    icon: presentation.icon,
    uiGroup: presentation.uiGroup,
    tone: presentation.tone,
    displayOrder: displayOrder ?? presentation.defaultOrder,
    type: def.actionType,
    enabled,
    disabledReason: enabled ? undefined : disabledReason,
    requiresReason: def.requiresReason,
    requiresEvidence: def.requiresEvidence,
    requiresConfirm: def.requiresConfirm,
    outcome: def.outcome,
    formKey,
    conditionExpression,
    matchedPolicyId,
  }
}

export interface AvailableActionsInput {
  policies?: ActionAvailabilityPolicy[]
  exceptionPolicies?: ExceptionActionPolicy[]
  presentations?: ActionPresentation[]
  surface: ActionSurface
  processCode: string
  dossierStatus: DossierStatus
  taskDefinitionKey?: string
  userRoleCodes: string[]
  userPermissions: string[]
  isAdmin: boolean
  /** Yêu cầu ngoại lệ đang mở (pending hoặc approved-chờ-áp-dụng), nếu có. */
  activeExc?: unknown
  hasExceptionTargets: boolean
  canRequestExceptionOnCurrentStep: boolean
  cap: Cap
  /** Số yêu cầu ngoại lệ chưa bị từ chối theo từng loại. */
  exceptionCountByType: Partial<Record<ExceptionType, number>>
}

export function getAvailableActions(input: AvailableActionsInput): AvailableAction[] {
  const {
    policies = ACTION_AVAILABILITY_POLICIES,
    exceptionPolicies = EXCEPTION_POLICIES,
    presentations = ACTION_PRESENTATIONS,
    surface,
    processCode,
    dossierStatus,
    taskDefinitionKey,
    userRoleCodes,
    userPermissions,
    isAdmin,
    activeExc,
    hasExceptionTargets,
    canRequestExceptionOnCurrentStep,
    cap,
    exceptionCountByType,
  } = input

  const actionCodes = [...new Set(policies.map((p) => p.actionCode))]
  const tier1 = actionCodes
    .map((actionCode) => ({ actionCode, def: ACTION_REGISTRY[actionCode] }))
    .filter(({ def }) => def && def.active && def.actionType !== 'EXCEPTION')
    .map(({ actionCode }) => ({
      actionCode,
      decision: resolveActionAvailability(policies, {
        actionCode,
        surface,
        processCode,
        dossierStatus,
        taskDefinitionKey,
        userRoleCodes,
        userPermissions,
        isAdmin,
      }),
    }))
    .filter(({ decision }) => decision.visible)
    .map(({ actionCode, decision }) =>
      toAvailableAction(
        actionCode,
        decision.enabled,
        presentations,
        decision.reasons.join(' '),
        decision.matched?.conditionExpression,
        decision.matched?.displayOrder,
        decision.matched?.id,
        decision.matched?.formKey,
      ),
    )

  if (dossierStatus !== 'processing') {
    return tier1.sort((a, b) => a.displayOrder - b.displayOrder)
  }

  const gateBaseEnabled =
    !activeExc && hasExceptionTargets && canRequestExceptionOnCurrentStep
  const gateBaseReason = activeExc
    ? 'Đang có yêu cầu ngoại lệ khác chờ duyệt/áp dụng cho hồ sơ này.'
    : !hasExceptionTargets
      ? 'Không còn bước phía sau để chuyển thẳng tới.'
      : 'Chỉ người xử lý bước hiện tại mới được xin ngoại lệ.'

  const exceptionActions: AvailableAction[] = []
  for (const [exceptionType, actionCode] of Object.entries(EXCEPTION_ACTION_CODE) as [
    ExceptionType,
    string,
  ][]) {
    const def = ACTION_REGISTRY[actionCode]
    if (!def?.active) continue

    const policy = resolveExceptionPolicy(exceptionPolicies, {
      exceptionType,
      cap,
      processCode,
      taskDefinitionKey,
      objectType: 'DOSSIER',
      objectStatus: dossierStatus,
    })
    const count = exceptionCountByType[exceptionType] ?? 0

    const availabilityExists = policies.some((p) => p.actionCode === actionCode)
    const availability = availabilityExists
      ? resolveActionAvailability(policies, {
          actionCode,
          surface,
          processCode,
          dossierStatus,
          taskDefinitionKey,
          userRoleCodes,
          userPermissions,
          isAdmin,
        })
      : null

    let enabled = gateBaseEnabled
    let reason = gateBaseReason
    if (enabled && !policy) {
      enabled = false
      reason = `Chính sách không cho phép loại ngoại lệ này ở cấp ${cap}.`
    } else if (enabled && policy && count >= policy.maxTimesPerDossier) {
      enabled = false
      reason = `Đã đạt số lần tối đa cho loại này trên hồ sơ (${policy.maxTimesPerDossier}).`
    }

    if (enabled && availability && !availability.enabled) {
      enabled = false
      reason = availability.reasons.join(' ')
    }

    const action = toAvailableAction(
      actionCode,
      enabled,
      presentations,
      reason,
      policy ? exceptionConditionExpression(policy) : undefined,
      availability?.matched?.displayOrder,
      policy?.id,
      availability?.matched?.formKey,
    )
    if (policy) {
      action.requiresReason = policy.requireReason
      action.requiresEvidence = policy.requireEvidence
    }
    exceptionActions.push(action)
  }

  return [...tier1, ...exceptionActions].sort((a, b) => a.displayOrder - b.displayOrder)
}
