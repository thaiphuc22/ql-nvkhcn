export type ActionType = 'STANDARD' | 'SUPPORT' | 'EXCEPTION';
export type ActionSurface = 'DOSSIER_DETAIL' | 'WORKLIST' | 'MOBILE' | 'ACTION_STUDIO';
export type ActionUiGroup = 'PRIMARY' | 'MORE' | 'EXCEPTION';
export type ActionTone = 'primary' | 'default' | 'danger' | 'warning';
export type DossierStatus = 'draft' | 'processing' | 'approved' | 'rejected';
export type RouteOutcome = 'SUBMIT' | 'APPROVE' | 'RETURN' | 'REJECT';

export interface ActionDefinition {
  actionCode: string;
  actionName: string;
  actionType: ActionType;
  outcome?: RouteOutcome;
  requiresReason?: boolean;
  requiresEvidence?: boolean;
  requiresConfirm?: boolean;
  active: boolean;
  version?: number;
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
  taskDefinitionKey: string | null;
  dossierStatus: DossierStatus | null;
  allowedRoleCodes: string[];
  requiredPermissions: string[];
  formKey: string | null;
  conditionExpression?: string;
  displayOrder: number;
  enabled: boolean;
  version?: number;
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
  outcome: RouteOutcome;
  label: string;
  target: string;
  kind: 'forward' | 'rework' | 'reject' | 'complete';
}

export interface ProcessStep {
  key: string;
  name: string;
  role: string;
  branches: RouteBranch[];
}

export interface ProcessRouting {
  code: string;
  name: string;
  steps: ProcessStep[];
}

export interface SimulationContext {
  surface: ActionSurface;
  processCode: string;
  taskDefinitionKey: string;
  dossierStatus: DossierStatus;
  roleCodes: string[];
  permissions: string[];
  isAdmin: boolean;
}

export interface SimulatedAction extends ActionDefinition, ActionPresentation {
  visible: boolean;
  enabled: boolean;
  policyId: string | null;
  reasons: string[];
  formKey: string | null;
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
export const PERMISSION_LABEL: Record<string, string> = {
  SUBMIT_DOSSIER: 'Gửi duyệt hồ sơ', PROCESS_STEP: 'Xử lý bước', REQUEST_EXCEPTION: 'Xin Chi tiết',
  ADD_COMMENT: 'Bổ sung ý kiến', DOWNLOAD_DOCUMENT: 'Tải tài liệu', VIEW_AUDIT: 'Xem lịch sử/audit',
};
export const ROLE_LABEL: Record<string, string> = {
  PM: 'Chủ nhiệm nhiệm vụ', PA: 'Trợ lý đề tài', NNC: 'Nhà nghiên cứu',
  TD: 'Phòng Thẩm định', TCKT: 'Phòng Tài chính - Kế toán', LD: 'Lãnh đạo', ADMIN: 'Quản trị hệ thống',
};
export const FORM_OPTIONS = [
  { value: 'phieu-chu-truong', label: 'Phiếu chủ trương' },
  { value: 'phieu-phe-duyet', label: 'Phiếu phê duyệt' },
  { value: 'phieu-y-kien', label: 'Phiếu ý kiến' },
  { value: 'phieu-dat-chua-dat', label: 'Phiếu Đạt / Chưa đạt' },
];

const action = (actionCode: string, actionName: string, actionType: ActionType, extra: Partial<ActionDefinition> = {}): ActionDefinition =>
  ({ actionCode, actionName, actionType, active: true, ...extra });

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  action('SUBMIT', 'Gửi duyệt', 'STANDARD', { outcome: 'SUBMIT' }),
  action('APPROVE_STEP', 'Đồng ý duyệt', 'STANDARD', { outcome: 'APPROVE', requiresConfirm: true }),
  action('RETURN_STEP', 'Yêu cầu điều chỉnh', 'STANDARD', { outcome: 'RETURN', requiresReason: true }),
  action('REJECT_STEP', 'Từ chối duyệt', 'STANDARD', { outcome: 'REJECT', requiresReason: true, requiresConfirm: true }),
  action('ADD_COMMENT', 'Bổ sung ý kiến', 'SUPPORT', { requiresReason: true }),
  action('DOWNLOAD_DOSSIER', 'Tải hồ sơ', 'SUPPORT'),
  action('VIEW_HISTORY', 'Xem lịch sử', 'SUPPORT'),
  action('UPLOAD_ATTACHMENT', 'Tải lên tài liệu', 'SUPPORT'),
  action('VIEW_DOCUMENTS', 'Xem tài liệu', 'SUPPORT'),
  action('EXPORT_PDF', 'Xuất PDF', 'SUPPORT'),
  action('PRINT_DOSSIER', 'In hồ sơ', 'SUPPORT'),
  action('VIEW_AUDIT', 'Xem audit chi tiết', 'SUPPORT'),
  action('REQUEST_BYPASS_COUNCIL', 'Xin bỏ qua hội đồng', 'EXCEPTION', { requiresReason: true, requiresConfirm: true }),
  action('REQUEST_JUMP_TO_HIGHER_APPROVER', 'Xin chuyển cấp phê duyệt cao hơn', 'EXCEPTION', { requiresReason: true, requiresConfirm: true }),
  action('REQUEST_SKIP_STEP', 'Xin bỏ qua bước xử lý', 'EXCEPTION', { requiresReason: true, requiresConfirm: true }),
  action('REQUEST_REOPEN_STEP', 'Yêu cầu mở lại bước đã xử lý', 'EXCEPTION', { requiresReason: true, requiresEvidence: true, requiresConfirm: true }),
  action('REQUEST_EMERGENCY_APPROVAL', 'Yêu cầu phê duyệt khẩn', 'EXCEPTION', { requiresReason: true, requiresConfirm: true }),
];

export const ACTION_PRESENTATIONS: ActionPresentation[] = ACTION_DEFINITIONS.map((a, index) => ({
  actionCode: a.actionCode,
  label: a.actionName,
  icon: a.actionType === 'EXCEPTION' ? 'safety' : a.actionType === 'SUPPORT' ? 'appstore' : 'thunderbolt',
  uiGroup: a.actionType === 'EXCEPTION' ? 'EXCEPTION' : a.actionType === 'SUPPORT' ? 'MORE' : 'PRIMARY',
  tone: a.actionCode === 'REJECT_STEP' ? 'danger' : a.actionType === 'EXCEPTION' ? 'warning' : a.actionCode === 'APPROVE_STEP' || a.actionCode === 'SUBMIT' ? 'primary' : 'default',
  order: a.actionType === 'STANDARD' ? 10 + index : a.actionType === 'SUPPORT' ? 50 + index : 100 + index,
  helpText: a.actionType === 'EXCEPTION' ? 'Hành động Chi tiết cần được kiểm soát và phê duyệt riêng.' : undefined,
}));

const policy = (id: string, actionCode: string, status: DossierStatus | null, permission: string, order: number, extra: Partial<ActionAvailabilityPolicy> = {}): ActionAvailabilityPolicy => ({
  id, actionCode, surface: 'DOSSIER_DETAIL', processCode: null, taskDefinitionKey: null, dossierStatus: status,
  allowedRoleCodes: [], requiredPermissions: [permission], formKey: null, displayOrder: order, enabled: true, ...extra,
});

export const AVAILABILITY_POLICIES: ActionAvailabilityPolicy[] = [
  policy('AP-01', 'SUBMIT', 'draft', 'SUBMIT_DOSSIER', 10, { allowedRoleCodes: ['PM', 'PA', 'NNC'], formKey: 'phieu-chu-truong', conditionExpression: 'dossier.docsComplete = true' }),
  policy('AP-06', 'APPROVE_STEP', 'processing', 'PROCESS_STEP', 21, { formKey: 'phieu-phe-duyet', conditionExpression: 'user in currentStep.candidateGroups' }),
  policy('AP-07', 'RETURN_STEP', 'processing', 'PROCESS_STEP', 22, { formKey: 'phieu-y-kien', conditionExpression: 'user in currentStep.candidateGroups' }),
  policy('AP-08', 'REJECT_STEP', 'processing', 'PROCESS_STEP', 23, { formKey: 'phieu-y-kien', conditionExpression: 'user in currentStep.candidateGroups' }),
  policy('AP-03', 'ADD_COMMENT', null, 'ADD_COMMENT', 60, { formKey: 'phieu-y-kien' }),
  policy('AP-04', 'DOWNLOAD_DOSSIER', null, 'DOWNLOAD_DOCUMENT', 61),
  policy('AP-05', 'VIEW_HISTORY', null, 'VIEW_AUDIT', 62),
  policy('AP-BPMN-RD01.01-t1-SUBMIT', 'SUBMIT', 'draft', 'SUBMIT_DOSSIER', 5, { processCode: 'RD01.01', taskDefinitionKey: 't1', formKey: 'phieu-chu-truong' }),
  policy('AP-BPMN-RD01.01-t2-APPROVE', 'APPROVE_STEP', 'processing', 'PROCESS_STEP', 11, { processCode: 'RD01.01', taskDefinitionKey: 't2', formKey: 'phieu-phe-duyet' }),
  policy('AP-BPMN-RD01.01-t2-RETURN', 'RETURN_STEP', 'processing', 'PROCESS_STEP', 12, { processCode: 'RD01.01', taskDefinitionKey: 't2', formKey: 'phieu-y-kien' }),
  policy('AP-BPMN-RD01.01-t2-REJECT', 'REJECT_STEP', 'processing', 'PROCESS_STEP', 13, { processCode: 'RD01.01', taskDefinitionKey: 't2', formKey: 'phieu-y-kien' }),
  policy('AP-BPMN-RD01.01-t3-APPROVE', 'APPROVE_STEP', 'processing', 'PROCESS_STEP', 11, { processCode: 'RD01.01', taskDefinitionKey: 't3' }),
  policy('AP-BPMN-RD01.01-t9-ORPHAN', 'APPROVE_STEP', 'processing', 'PROCESS_STEP', 11, { processCode: 'RD01.01', taskDefinitionKey: 't9', formKey: 'phieu-phe-duyet' }),
];

export const EXCEPTION_POLICIES: ExceptionPolicy[] = [
  { id: 'EP-01', actionCode: 'REQUEST_BYPASS_COUNCIL', objectType: 'DOSSIER', processCode: 'RD01.01', fromStepKey: 't2', targetType: 'STEP', targetStepKey: 't4', allowedRoleCodes: ['TD'], requiredPermissions: ['REQUEST_EXCEPTION'], requiresApproval: true, requiresReason: true, requiresEvidence: true, enabled: true },
  { id: 'EP-02', actionCode: 'REQUEST_JUMP_TO_HIGHER_APPROVER', objectType: 'DOSSIER', processCode: null, fromStepKey: null, targetType: 'STEP', targetStepKey: 't4', allowedRoleCodes: ['TD', 'TCKT'], requiredPermissions: ['REQUEST_EXCEPTION'], requiresApproval: true, requiresReason: true, requiresEvidence: false, enabled: true },
  { id: 'EP-03', actionCode: 'REQUEST_SKIP_STEP', objectType: 'DOSSIER', processCode: 'RD02.01', fromStepKey: 't2', targetType: 'COMPLETE', targetStepKey: null, allowedRoleCodes: ['LD'], requiredPermissions: ['REQUEST_EXCEPTION'], requiresApproval: true, requiresReason: true, requiresEvidence: true, enabled: true },
];

export const PROCESS_ROUTINGS: ProcessRouting[] = [
  { code: 'RD01.01', name: 'Xét duyệt nhiệm vụ KHCN', steps: [
    { key: 't1', name: 'Lập và gửi hồ sơ', role: 'PM', branches: [{ outcome: 'SUBMIT', label: 'Gửi duyệt', target: 'Thẩm định hồ sơ', kind: 'forward' }] },
    { key: 't2', name: 'Thẩm định hồ sơ', role: 'TD', branches: [
      { outcome: 'APPROVE', label: 'Đồng ý', target: 'Thẩm định tài chính', kind: 'forward' }, { outcome: 'RETURN', label: 'Yêu cầu điều chỉnh', target: 'Lập và gửi hồ sơ', kind: 'rework' }, { outcome: 'REJECT', label: 'Từ chối', target: 'Kết thúc — từ chối', kind: 'reject' },
    ] },
    { key: 't3', name: 'Thẩm định tài chính', role: 'TCKT', branches: [{ outcome: 'APPROVE', label: 'Đồng ý', target: 'Lãnh đạo phê duyệt', kind: 'forward' }, { outcome: 'RETURN', label: 'Trả lại', target: 'Thẩm định hồ sơ', kind: 'rework' }] },
    { key: 't4', name: 'Lãnh đạo phê duyệt', role: 'LD', branches: [{ outcome: 'APPROVE', label: 'Phê duyệt', target: 'Hoàn thành', kind: 'complete' }, { outcome: 'REJECT', label: 'Từ chối', target: 'Kết thúc — từ chối', kind: 'reject' }] },
  ] },
  { code: 'RD02.01', name: 'Nghiệm thu nhiệm vụ', steps: [
    { key: 't1', name: 'Nộp hồ sơ nghiệm thu', role: 'PM', branches: [{ outcome: 'SUBMIT', label: 'Gửi duyệt', target: 'Hội đồng đánh giá', kind: 'forward' }] },
    { key: 't2', name: 'Hội đồng đánh giá', role: 'TD', branches: [{ outcome: 'APPROVE', label: 'Đạt', target: 'Lãnh đạo phê duyệt', kind: 'forward' }, { outcome: 'RETURN', label: 'Chưa đạt', target: 'Nộp hồ sơ nghiệm thu', kind: 'rework' }, { outcome: 'REJECT', label: 'Từ chối', target: 'Kết thúc', kind: 'reject' }] },
    { key: 't3', name: 'Lãnh đạo phê duyệt', role: 'LD', branches: [{ outcome: 'APPROVE', label: 'Phê duyệt', target: 'Hoàn thành', kind: 'complete' }] },
  ] },
  { code: 'RD05.01', name: 'Thanh quyết toán', steps: [
    { key: 't1', name: 'Lập hồ sơ quyết toán', role: 'PM', branches: [{ outcome: 'SUBMIT', label: 'Gửi', target: 'Kiểm soát tài chính', kind: 'forward' }] },
    { key: 't2', name: 'Kiểm soát tài chính', role: 'TCKT', branches: [{ outcome: 'APPROVE', label: 'Đồng ý', target: 'Phê duyệt quyết toán', kind: 'forward' }, { outcome: 'RETURN', label: 'Bổ sung', target: 'Lập hồ sơ quyết toán', kind: 'rework' }] },
    { key: 't3', name: 'Phê duyệt quyết toán', role: 'LD', branches: [{ outcome: 'APPROVE', label: 'Phê duyệt', target: 'Hoàn thành', kind: 'complete' }] },
  ] },
];

export function outcomeAction(outcome: RouteOutcome): string {
  return ({ SUBMIT: 'SUBMIT', APPROVE: 'APPROVE_STEP', RETURN: 'RETURN_STEP', REJECT: 'REJECT_STEP' })[outcome];
}
