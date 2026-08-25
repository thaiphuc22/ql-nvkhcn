export type ActionType = 'STANDARD' | 'SUPPORT' | 'EXCEPTION';
export type ActionSurface = 'DOSSIER_DETAIL' | 'WORKLIST' | 'MOBILE' | 'ACTION_STUDIO';
export type ActionUiGroup = 'PRIMARY' | 'MORE' | 'EXCEPTION';
export type ActionTone = 'primary' | 'default' | 'danger' | 'warning';
export type DossierStatus = 'draft' | 'processing' | 'approved' | 'rejected';
export type ActionPolicyStatus = 'DRAFT' | 'ACTIVE' | 'DISABLED' | 'INVALID';

export interface ActionDefinition {
  actionCode: string;
  actionName: string;
  actionType: ActionType;
  /** Nhãn kết quả của nút. Chuỗi tự do: danh mục seed ghi cả 'APPROVE' lẫn 'dong_y_bo_sung'. */
  outcome?: string;
  requiresReason?: boolean;
  requiresEvidence?: boolean;
  requiresConfirm?: boolean;
  active: boolean;
  version?: number;
  /**
   * Các từ khoá outcome trong BPMN mà nút này nhận (`dong_y`, `thong_qua`, ...).
   * CHỈ để nhận diện nhánh nào thuộc nút nào — biến gửi vào Camunda vẫn bốc nguyên văn từ bản vẽ.
   */
  outcomeKeywords?: string[];
}

export interface ActionPresentation {
  actionCode: string;
  label: string;
  icon: string;
  uiGroup: ActionUiGroup;
  tone: ActionTone;
  order: number;
  helpText?: string;
  version?: number;
}

export interface ActionAvailabilityPolicy {
  id: string;
  actionCode: string;
  surface: ActionSurface | null;
  processCode: string | null;
  processVersion?: number | null;
  taskDefinitionKey: string | null;
  dossierStatus: DossierStatus | null;
  allowedRoleCodes: string[];
  formKey?: string | null;
  conditionExpression?: string;
  displayOrder: number;
  lifecycleStatus: ActionPolicyStatus;
  version?: number;
  displayLabel?: string | null;
  displayIcon?: string | null;
  uiGroup?: ActionUiGroup | null;
  tone?: ActionTone | null;
  helpText?: string | null;
  formBundle?: ActionFormBundle | null;
}

export interface ActionFormBundleItem {
  formKey: string; formVersion?: number | null; displayOrder: number; displayTitle?: string | null;
  required: boolean; mode: 'VIEW' | 'EDIT'; skippable: boolean; conditionExpression?: string | null;
  outputNamespace: string;
}
export interface ActionFormBundle {
  displayMode: 'STEPPER' | 'TABS'; allowDraft: boolean; completionPolicy: 'ALL_REQUIRED_VALID';
  version?: number | null; items: ActionFormBundleItem[];
}

export interface ActionStudioCatalogOption {
  value: string;
  label: string;
}

export interface ActionStudioReferenceData {
  surfaces: ActionStudioCatalogOption[];
  statuses: ActionStudioCatalogOption[];
  roles: ActionStudioCatalogOption[];
  permissions: ActionStudioCatalogOption[];
  forms: ActionStudioCatalogOption[];
}

export type ExceptionTargetType = 'STEP' | 'STATUS' | 'COMPLETE';
export interface ExceptionPolicy {
  id: string;
  actionCode: string;
  objectType: 'DOSSIER' | 'MISSION' | 'PROPOSAL';
  processCode: string | null;
  fromStepKey: string | null;
  targetType: ExceptionTargetType;
  targetStepKey: string | null;
  allowedRoleCodes: string[];
  requiredPermissions: string[];
  requiresApproval: boolean;
  requiresReason: boolean;
  requiresEvidence: boolean;
  enabled: boolean;
  version?: number;
}

export interface RouteBranch {
  /** Từ khoá outcome nguyên văn trong conditionExpression của nhánh, ví dụ `dong_y`. */
  outcome: string;
  label: string;
  target: string;
  kind: 'forward' | 'rework' | 'reject' | 'complete';
}

export interface ProcessStep {
  key: string;
  name: string;
  role: string;
  formKey?: string | null;
  branches: RouteBranch[];
}

export interface ProcessRouting {
  code: string;
  name: string;
  steps: ProcessStep[];
  processVersion?: number | null;
}

export interface SimulationContext {
  surface: ActionSurface;
  processCode: string;
  taskDefinitionKey: string;
  dossierStatus: DossierStatus;
  roleCodes: string[];
  permissions: string[];
  isAdmin: boolean;
  processVersion?: number | null;
  businessContext?: Record<string, unknown>;
}

export interface SimulatedAction extends ActionDefinition, ActionPresentation {
  visible: boolean;
  enabled: boolean;
  policyId: string | null;
  reasons: string[];
  formKey: string | null;
  policyVersion: number | null;
  formBundle?: ActionFormBundle | null;
}

export const ACTION_TYPE_LABEL: Record<ActionType, string> = {
  STANDARD: 'Chuẩn', SUPPORT: 'Hỗ trợ', EXCEPTION: 'Chi tiết',
};
export const ACTION_GROUP_LABEL: Record<ActionUiGroup, string> = {
  PRIMARY: 'Hành động chính', MORE: 'Hành động khác', EXCEPTION: 'Hành động Chi tiết',
};
export const ACTION_TONE_LABEL: Record<ActionTone, string> = {
  primary: 'Chính', default: 'Mặc định', danger: 'Nguy hiểm', warning: 'Cảnh báo',
};
export const SURFACE_LABEL: Record<ActionSurface, string> = {
  DOSSIER_DETAIL: 'Chi tiết hồ sơ', WORKLIST: 'Việc của tôi', MOBILE: 'Ứng dụng di động', ACTION_STUDIO: 'Ma trận Hành động',
};
export const STATUS_LABEL: Record<DossierStatus, string> = {
  draft: 'Khởi tạo', processing: 'Đang xử lý', approved: 'Đã duyệt', rejected: 'Từ chối',
};
