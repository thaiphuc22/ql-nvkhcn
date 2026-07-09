// Action Availability Model (docs/research/action-availability-model.md mục 4-8) — mock/prototype.
// Một hàm thuần duy nhất thay cho các điều kiện JSX rời rạc trong UI: UI chỉ render theo kết quả này.

import {
  ACTION_PRESENTATIONS,
  getActionPresentation,
  type ActionPresentation,
  type ActionSurface,
  type ActionTone,
  type ActionUiGroup,
} from "./actionPresentation";
import { ACTION_REGISTRY, EXCEPTION_ACTION_CODE } from "./actionRegistry";
import type { RouteOutcome } from "./stepRouting";
import {
  ACTION_AVAILABILITY_POLICIES,
  resolveActionAvailability,
  type ActionAvailabilityPolicy,
} from "./actionAvailabilityPolicy";
import type { DossierStatus } from "./dossiers";
import type { ExceptionType } from "./exceptions";
import {
  EXCEPTION_POLICIES,
  exceptionConditionExpression,
  resolveExceptionPolicy,
  type ExceptionActionPolicy,
} from "./exceptionPolicy";
import type { Cap } from "./nhiemVu";

export interface AvailableAction {
  actionCode: string;
  label: string;
  tooltip?: string;
  icon: string;
  uiGroup: ActionUiGroup;
  tone: ActionTone;
  displayOrder: number;
  type: "STANDARD" | "SUPPORT" | "EXCEPTION";
  enabled: boolean;
  disabledReason?: string;
  requiresReason?: boolean;
  requiresEvidence?: boolean;
  requiresConfirm?: boolean;
  /** (D10) Nhãn kết quả của action — đích đến vẫn do resolveRouting quyết, không nằm ở đây. */
  outcome?: RouteOutcome;
  /** (D10) eForm mà UI mở khi bấm action này — tham chiếu Thư viện biểu mẫu (1 eForm : n Action). */
  formKey?: string | null;
  /** Minh hoạ policy thật sẽ kiểm tra gì — chưa evaluate conditionExpression. */
  conditionExpression?: string;
  matchedPolicyId?: string;
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
  const def = ACTION_REGISTRY[actionCode];
  const presentation = getActionPresentation(presentations, actionCode);
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
  };
}

export interface AvailableActionsInput {
  policies?: ActionAvailabilityPolicy[];
  exceptionPolicies?: ExceptionActionPolicy[];
  presentations?: ActionPresentation[];
  surface: ActionSurface;
  processCode: string;
  dossierStatus: DossierStatus;
  taskDefinitionKey?: string;
  userRoleCodes: string[];
  userPermissions: string[];
  isAdmin: boolean;
  /** Yêu cầu Chi tiết đang mở (pending hoặc approved-chờ-áp-dụng), nếu có. */
  activeExc?: unknown;
  hasExceptionTargets: boolean;
  canRequestExceptionOnCurrentStep: boolean;
  cap: Cap;
  /** Số yêu cầu Chi tiết chưa bị từ chối theo từng loại. */
  exceptionCountByType: Partial<Record<ExceptionType, number>>;
}

export function getAvailableActions(
  input: AvailableActionsInput,
): AvailableAction[] {
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
  } = input;

  const actionCodes = [...new Set(policies.map((p) => p.actionCode))];
  const tier1 = actionCodes
    .map((actionCode) => ({ actionCode, def: ACTION_REGISTRY[actionCode] }))
    .filter(({ def }) => def && def.active && def.actionType !== "EXCEPTION")
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
        decision.reasons.join(" "),
        decision.matched?.conditionExpression,
        decision.matched?.displayOrder,
        decision.matched?.id,
        decision.matched?.formKey,
      ),
    );

  if (dossierStatus !== "processing") {
    return tier1.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const gateBaseEnabled =
    !activeExc && hasExceptionTargets && canRequestExceptionOnCurrentStep;
  const gateBaseReason = activeExc
    ? "Đang có yêu cầu Chi tiết khác chờ duyệt/áp dụng cho hồ sơ này."
    : !hasExceptionTargets
      ? "Không còn bước phía sau để chuyển thẳng tới."
      : "Chỉ người xử lý bước hiện tại mới được xin Chi tiết.";

  const exceptionActions: AvailableAction[] = [];
  for (const [exceptionType, actionCode] of Object.entries(
    EXCEPTION_ACTION_CODE,
  ) as [ExceptionType, string][]) {
    const def = ACTION_REGISTRY[actionCode];
    if (!def?.active) continue;

    const policy = resolveExceptionPolicy(exceptionPolicies, {
      exceptionType,
      cap,
      processCode,
      taskDefinitionKey,
      objectType: "DOSSIER",
      objectStatus: dossierStatus,
    });
    const count = exceptionCountByType[exceptionType] ?? 0;

    const availabilityExists = policies.some(
      (p) => p.actionCode === actionCode,
    );
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
      : null;

    let enabled = gateBaseEnabled;
    let reason = gateBaseReason;
    if (enabled && !policy) {
      enabled = false;
      reason = `Chính sách không cho phép loại Chi tiết này ở cấp ${cap}.`;
    } else if (enabled && policy && count >= policy.maxTimesPerDossier) {
      enabled = false;
      reason = `Đã đạt số lần tối đa cho loại này trên hồ sơ (${policy.maxTimesPerDossier}).`;
    }

    if (enabled && availability && !availability.enabled) {
      enabled = false;
      reason = availability.reasons.join(" ");
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
    );
    if (policy) {
      action.requiresReason = policy.requireReason;
      action.requiresEvidence = policy.requireEvidence;
    }
    exceptionActions.push(action);
  }

  return [...tier1, ...exceptionActions].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Debug mode: trả về TẤT CẢ action kể cả bị loại, kèm lý do chi tiết.
// Dùng cho tab Mô phỏng (Action Studio) — Đợt 3.
// ════════════════════════════════════════════════════════════════════════════

export interface DebugAction extends AvailableAction {
  /** false = action bị loại khỏi kết quả hiển thị (không visible). */
  visible: boolean;
  /** Lý do bị ẩn, nếu !visible. */
  hideReasons: string[];
  /** Thông tin kiểm tra vai trò. */
  roleCheck?: { required: string[]; held: string[]; match: boolean };
  /** Thông tin kiểm tra quyền. */
  permissionCheck?: {
    required: string[];
    held: string[];
    missing: string[];
    match: boolean;
  };
}

export function getDebugActions(input: AvailableActionsInput): DebugAction[] {
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
  } = input;

  // STANDARD + SUPPORT: include ALL (even hidden)
  const actionCodes = [...new Set(policies.map((p) => p.actionCode))];
  const tier1: DebugAction[] = actionCodes
    .map((actionCode) => ({ actionCode, def: ACTION_REGISTRY[actionCode] }))
    .filter(({ def }) => def && def.active && def.actionType !== "EXCEPTION")
    .map(({ actionCode }) => {
      const decision = resolveActionAvailability(policies, {
        actionCode,
        surface,
        processCode,
        dossierStatus,
        taskDefinitionKey,
        userRoleCodes,
        userPermissions,
        isAdmin,
      });

      const base = toAvailableAction(
        actionCode,
        decision.enabled,
        presentations,
        decision.reasons.join(" "),
        decision.matched?.conditionExpression,
        decision.matched?.displayOrder,
        decision.matched?.id,
        decision.matched?.formKey,
      );

      const roleCheck = decision.matched
        ? {
            required: decision.matched.allowedRoleCodes,
            held: userRoleCodes,
            match:
              decision.matched.allowedRoleCodes.length === 0 ||
              decision.matched.allowedRoleCodes.some((c) =>
                userRoleCodes.includes(c),
              ),
          }
        : undefined;

      const permissionCheck = decision.matched
        ? {
            required: decision.matched.requiredPermissions,
            held: userPermissions,
            missing: decision.matched.requiredPermissions.filter(
              (p) => !userPermissions.includes(p),
            ),
            match: decision.matched.requiredPermissions.every((p) =>
              userPermissions.includes(p),
            ),
          }
        : undefined;

      return {
        ...base,
        visible: decision.visible,
        hideReasons: decision.visible ? [] : decision.reasons,
        roleCheck,
        permissionCheck,
      };
    });

  // EXCEPTION actions
  const gateBaseEnabled =
    !activeExc && hasExceptionTargets && canRequestExceptionOnCurrentStep;
  const gateBaseReason = activeExc
    ? "Đang có yêu cầu Chi tiết khác chờ duyệt/áp dụng cho hồ sơ này."
    : !hasExceptionTargets
      ? "Không còn bước phía sau để chuyển thẳng tới."
      : "Chỉ người xử lý bước hiện tại mới được xin Chi tiết.";

  const exceptionActions: DebugAction[] = [];

  for (const [exceptionType, actionCode] of Object.entries(
    EXCEPTION_ACTION_CODE,
  ) as [ExceptionType, string][]) {
    const def = ACTION_REGISTRY[actionCode];
    if (!def?.active) continue;

    const policy = resolveExceptionPolicy(exceptionPolicies, {
      exceptionType,
      cap,
      processCode,
      taskDefinitionKey,
      objectType: "DOSSIER",
      objectStatus: dossierStatus,
    });
    const count = exceptionCountByType[exceptionType] ?? 0;

    const availabilityExists = policies.some(
      (p) => p.actionCode === actionCode,
    );
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
      : null;

    let enabled = gateBaseEnabled;
    let reason = gateBaseReason;
    if (enabled && !policy) {
      enabled = false;
      reason = `Chính sách không cho phép loại Chi tiết này ở cấp ${cap}.`;
    } else if (enabled && policy && count >= policy.maxTimesPerDossier) {
      enabled = false;
      reason = `Đã đạt số lần tối đa cho loại này trên hồ sơ (${policy.maxTimesPerDossier}).`;
    }

    if (enabled && availability && !availability.enabled) {
      enabled = false;
      reason = availability.reasons.join(" ");
    }

    const base = toAvailableAction(
      actionCode,
      enabled,
      presentations,
      reason,
      policy ? exceptionConditionExpression(policy) : undefined,
      availability?.matched?.displayOrder,
      policy?.id,
      availability?.matched?.formKey,
    );
    if (policy) {
      base.requiresReason = policy.requireReason;
      base.requiresEvidence = policy.requireEvidence;
    }

    const roleCheck = availability?.matched
      ? {
          required: availability.matched.allowedRoleCodes,
          held: userRoleCodes,
          match:
            availability.matched.allowedRoleCodes.length === 0 ||
            availability.matched.allowedRoleCodes.some((c) =>
              userRoleCodes.includes(c),
            ),
        }
      : undefined;

    const permissionCheck = availability?.matched
      ? {
          required: availability.matched.requiredPermissions,
          held: userPermissions,
          missing: availability.matched.requiredPermissions.filter(
            (p) => !userPermissions.includes(p),
          ),
          match: availability.matched.requiredPermissions.every((p) =>
            userPermissions.includes(p),
          ),
        }
      : undefined;

    exceptionActions.push({
      ...base,
      visible: true, // exception actions luôn visible nếu có policy
      hideReasons: [],
      roleCheck,
      permissionCheck,
    });
  }

  return [...tier1, ...exceptionActions].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}
