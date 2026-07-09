// Action Availability Policy (action-availability-model.md §8 `action_availability_policy`)
// MOCK: bảng luật trả lời action nào được phép xuất hiện ở surface/quy trình/bước/trạng thái nào,
// cho vai trò và quyền nào. STANDARD/SUPPORT dùng bảng này; EXCEPTION dùng exceptionPolicy.ts.

import type { ActionSurface } from './actionPresentation'
import type { DossierStatus } from './dossiers'

/** Danh mục quyền (mock) — `required_permissions` trong doc. Thực tế do IAM/RBAC cấp. */
export const PERMISSIONS = {
  SUBMIT_DOSSIER: 'SUBMIT_DOSSIER',
  PROCESS_STEP: 'PROCESS_STEP',
  REQUEST_EXCEPTION: 'REQUEST_EXCEPTION',
  ADD_COMMENT: 'ADD_COMMENT',
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT',
  VIEW_AUDIT: 'VIEW_AUDIT',
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const PERMISSION_LABEL: Record<string, string> = {
  SUBMIT_DOSSIER: 'Gửi duyệt hồ sơ',
  PROCESS_STEP: 'Xử lý bước',
  REQUEST_EXCEPTION: 'Xin ngoại lệ',
  ADD_COMMENT: 'Bổ sung ý kiến',
  DOWNLOAD_DOCUMENT: 'Tải tài liệu',
  VIEW_AUDIT: 'Xem lịch sử/audit',
}

/** Quy trình có thể gắn điều kiện policy (khớp NHOM trong data/processes.ts). */
export const PROCESS_CODES = ['RD01.01', 'RD01.02', 'RD02.01', 'RD05.01'] as const

export const DOSSIER_STATUS_LABEL: Record<DossierStatus, string> = {
  draft: 'Khởi tạo',
  processing: 'Đang xử lý',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
}

/**
 * Một dòng chính sách hiển thị action. Điều kiện `null` nghĩa là wildcard.
 * Có rule khớp = action được phép render; không rule khớp = không hiện (fail-closed).
 */
export interface ActionAvailabilityPolicy {
  id: string
  /** FK → ACTION_REGISTRY.actionCode. */
  actionCode: string
  /** Business surface nơi action xuất hiện; null = mọi surface. */
  surface?: ActionSurface | null
  processCode?: string | null
  taskDefinitionKey?: string | null
  dossierStatus?: DossierStatus | null
  /** Rỗng = mọi vai trò; quyền bấm vẫn do requiredPermissions quyết định. */
  allowedRoleCodes: string[]
  requiredPermissions: string[]
  /**
   * (D10) eForm gắn với action Ở NGỮ CẢNH NÀY — tham chiếu (formKey) vào Thư viện
   * biểu mẫu (forms/index.ts + FormContext), KHÔNG nhúng schema. Nhờ vậy một eForm
   * có thể được nhiều dòng policy/action dùng chung: 1 eForm : n Action. null = action
   * không mở form (vd Tải hồ sơ / Xem lịch sử).
   */
  formKey?: string | null
  /** Minh hoạ điều kiện nghiệp vụ thật — mock chưa evaluate phần này. */
  conditionExpression?: string
  /** Thứ tự hiển thị khi rule này khớp; số nhỏ = trước. */
  displayOrder: number
  enabled: boolean
}

export const ACTION_AVAILABILITY_POLICIES: ActionAvailabilityPolicy[] = [
  {
    id: 'AP-01',
    actionCode: 'SUBMIT',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: 'draft',
    allowedRoleCodes: ['PM', 'PA', 'NNC'],
    requiredPermissions: [PERMISSIONS.SUBMIT_DOSSIER],
    formKey: 'phieu-chu-truong',
    conditionExpression: 'dossier.docsComplete = true',
    displayOrder: 10,
    enabled: true,
  },
  // ── (D10) 3 outcome action cho bước phê duyệt — mỗi hướng một eForm riêng ──────────
  // 1 eForm : n Action: RETURN & REJECT cùng trỏ 'phieu-y-kien' (tái dùng, không copy).
  {
    id: 'AP-06',
    actionCode: 'APPROVE_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-phe-duyet',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 21,
    enabled: true,
  },
  {
    id: 'AP-07',
    actionCode: 'RETURN_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-y-kien',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 22,
    enabled: true,
  },
  {
    id: 'AP-08',
    actionCode: 'REJECT_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-y-kien',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 23,
    enabled: true,
  },
  // ── Mock demo tab "Đối soát BPMN" ──────────────────────────────────────────────
  // Các dòng AP-BPMN-* mô phỏng kết quả admin từng bấm "Đồng bộ / Đối soát từ BPMN".
  // Chúng giúp màn demo có đủ trạng thái: đã ghim đúng bước, còn phủ bằng luật chung,
  // thiếu biểu mẫu, và policy orphan do taskDefinitionKey cũ không còn trong BPMN.
  {
    id: 'AP-BPMN-RD01.01-t1-SUBMIT',
    actionCode: 'SUBMIT',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD01.01',
    taskDefinitionKey: 't1',
    dossierStatus: 'draft',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.SUBMIT_DOSSIER],
    formKey: 'phieu-chu-truong',
    conditionExpression: 'dossier.docsComplete = true',
    displayOrder: 5,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD01.01-t2-APPROVE',
    actionCode: 'APPROVE_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD01.01',
    taskDefinitionKey: 't2',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-phe-duyet',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 11,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD01.01-t2-RETURN',
    actionCode: 'RETURN_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD01.01',
    taskDefinitionKey: 't2',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-y-kien',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 12,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD01.01-t2-REJECT',
    actionCode: 'REJECT_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD01.01',
    taskDefinitionKey: 't2',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-y-kien',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 13,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD01.01-t3-APPROVE',
    actionCode: 'APPROVE_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD01.01',
    taskDefinitionKey: 't3',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: null,
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 11,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD02.01-t1-SUBMIT',
    actionCode: 'SUBMIT',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD02.01',
    taskDefinitionKey: 't1',
    dossierStatus: 'draft',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.SUBMIT_DOSSIER],
    formKey: 'phieu-chu-truong',
    conditionExpression: 'dossier.docsComplete = true',
    displayOrder: 5,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD02.01-t2-APPROVE',
    actionCode: 'APPROVE_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD02.01',
    taskDefinitionKey: 't2',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-dat-chua-dat',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 11,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD02.01-t2-RETURN',
    actionCode: 'RETURN_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD02.01',
    taskDefinitionKey: 't2',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-y-kien',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 12,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD05.01-t3-APPROVE',
    actionCode: 'APPROVE_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD05.01',
    taskDefinitionKey: 't3',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: null,
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 11,
    enabled: true,
  },
  {
    id: 'AP-BPMN-RD01.01-t9-APPROVE-ORPHAN',
    actionCode: 'APPROVE_STEP',
    surface: 'DOSSIER_DETAIL',
    processCode: 'RD01.01',
    taskDefinitionKey: 't9',
    dossierStatus: 'processing',
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.PROCESS_STEP],
    formKey: 'phieu-phe-duyet',
    conditionExpression: 'user in currentStep.candidateGroups',
    displayOrder: 11,
    enabled: true,
  },
  {
    id: 'AP-03',
    actionCode: 'ADD_COMMENT',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: null,
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.ADD_COMMENT],
    formKey: 'phieu-y-kien',
    displayOrder: 60,
    enabled: true,
  },
  {
    id: 'AP-04',
    actionCode: 'DOWNLOAD_DOSSIER',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: null,
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.DOWNLOAD_DOCUMENT],
    formKey: null,
    displayOrder: 61,
    enabled: true,
  },
  {
    id: 'AP-05',
    actionCode: 'VIEW_HISTORY',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: null,
    allowedRoleCodes: [],
    requiredPermissions: [PERMISSIONS.VIEW_AUDIT],
    formKey: null,
    displayOrder: 62,
    enabled: true,
  },
]

export interface AvailabilityContext {
  actionCode: string
  surface: ActionSurface
  processCode: string
  dossierStatus: DossierStatus
  taskDefinitionKey?: string
  userRoleCodes: string[]
  userPermissions: string[]
  /** Admin bỏ qua kiểm tra vai trò/quyền, nhưng vẫn cần rule tồn tại để hiển thị. */
  isAdmin?: boolean
}

export interface AvailabilityDecision {
  matched: ActionAvailabilityPolicy | null
  visible: boolean
  enabled: boolean
  reasons: string[]
}

export function resolveActionAvailability(
  policies: ActionAvailabilityPolicy[],
  ctx: AvailabilityContext,
): AvailabilityDecision {
  const matched =
    policies
      .filter(
        (p) =>
          p.enabled &&
          p.actionCode === ctx.actionCode &&
          (p.surface == null || p.surface === ctx.surface) &&
          (p.processCode == null || p.processCode === ctx.processCode) &&
          (p.dossierStatus == null || p.dossierStatus === ctx.dossierStatus) &&
          (p.taskDefinitionKey == null || p.taskDefinitionKey === ctx.taskDefinitionKey),
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)[0] ?? null

  if (!matched) {
    return {
      matched: null,
      visible: false,
      enabled: false,
      reasons: ['Không có luật cho phép action này ở surface/quy trình/trạng thái hiện tại.'],
    }
  }

  const reasons: string[] = []
  if (ctx.isAdmin) {
    return { matched, visible: true, enabled: true, reasons: ['Admin — bỏ qua kiểm tra vai trò/quyền.'] }
  }

  const roleOk =
    matched.allowedRoleCodes.length === 0 ||
    matched.allowedRoleCodes.some((c) => ctx.userRoleCodes.includes(c))
  if (!roleOk) reasons.push('User không thuộc vai trò được phép của luật.')

  const missingPerms = matched.requiredPermissions.filter(
    (p) => !ctx.userPermissions.includes(p),
  )
  if (missingPerms.length) {
    reasons.push(
      `Thiếu quyền: ${missingPerms.map((p) => PERMISSION_LABEL[p] ?? p).join(', ')}.`,
    )
  }

  const enabled = roleOk && missingPerms.length === 0
  if (enabled) reasons.push('Đủ điều kiện — nút hiển thị & bật.')
  return { matched, visible: true, enabled, reasons }
}

export function availabilityConditionText(p: ActionAvailabilityPolicy): string {
  const parts = [
    `surface = ${p.surface ?? 'any'}`,
    `process = ${p.processCode ?? 'any'}`,
    `status = ${p.dossierStatus ?? 'any'}`,
    p.taskDefinitionKey ? `task = ${p.taskDefinitionKey}` : 'task = any',
    p.allowedRoleCodes.length ? `role in [${p.allowedRoleCodes.join(', ')}]` : 'role = any',
  ]
  if (p.conditionExpression) parts.push(p.conditionExpression)
  return parts.join(' AND ')
}

// ── Version History & Audit ──

export type AvailAuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE'

export interface ActionAvailabilityVersion {
  id: string
  policyId: string
  version: number
  actionCode: string
  surface?: string | null
  processCode?: string | null
  taskDefinitionKey?: string | null
  dossierStatus?: string | null
  allowedRoleCodes: string[]
  requiredPermissions: string[]
  formKey?: string | null
  conditionExpression?: string
  displayOrder: number
  enabled: boolean
  capNhat: string
  nguoiCapNhat: string
  changeNote: string
}

export interface ActionAvailabilityAuditEntry {
  id: string
  policyId: string
  action: AvailAuditAction
  version: number
  actor: string
  timestamp: string
  detail: string
}

export const AVAIL_AUDIT_ACTION_LABEL: Record<AvailAuditAction, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xoá',
  TOGGLE: 'Bật/Tắt',
}

export const AVAIL_AUDIT_ACTION_COLOR: Record<AvailAuditAction, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  TOGGLE: 'orange',
}

export const SEED_AVAIL_VERSIONS: ActionAvailabilityVersion[] = [
  {
    id: 'avv-ap01-v1',
    policyId: 'AP-01',
    version: 1,
    actionCode: 'SUBMIT',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: 'draft',
    allowedRoleCodes: ['PM', 'PA'],
    requiredPermissions: ['SUBMIT_DOSSIER'],
    formKey: 'phieu-chu-truong',
    conditionExpression: 'dossier.docsComplete = true',
    displayOrder: 10,
    enabled: true,
    capNhat: '2026-06-01',
    nguoiCapNhat: 'Quản trị hệ thống',
    changeNote: 'Phiên bản đầu — vai trò PM, PA.',
  },
  {
    id: 'avv-ap01-v2',
    policyId: 'AP-01',
    version: 2,
    actionCode: 'SUBMIT',
    surface: 'DOSSIER_DETAIL',
    processCode: null,
    taskDefinitionKey: null,
    dossierStatus: 'draft',
    allowedRoleCodes: ['PM', 'PA', 'NNC'],
    requiredPermissions: ['SUBMIT_DOSSIER'],
    formKey: 'phieu-chu-truong',
    conditionExpression: 'dossier.docsComplete = true',
    displayOrder: 10,
    enabled: true,
    capNhat: '2026-07-01',
    nguoiCapNhat: 'Chuyên viên nghiệp vụ',
    changeNote: 'Thêm vai trò NNC (Người nộp chính).',
  },
]

export const SEED_AVAIL_AUDIT: ActionAvailabilityAuditEntry[] = [
  { id: 'ava-ap01-1', policyId: 'AP-01', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-01 09:00', detail: 'Tạo luật hiển thị nút SUBMIT cho hồ sơ draft.' },
  { id: 'ava-ap01-2', policyId: 'AP-01', action: 'UPDATE', version: 2, actor: 'Chuyên viên nghiệp vụ', timestamp: '2026-07-01 10:00', detail: 'Thêm vai trò NNC vào danh sách được phép.' },
  { id: 'ava-ap03-1', policyId: 'AP-03', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-05 11:00', detail: 'Tạo luật ADD_COMMENT (mọi trạng thái).' },
  { id: 'ava-ap04-1', policyId: 'AP-04', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-05 11:30', detail: 'Tạo luật DOWNLOAD_DOSSIER.' },
  { id: 'ava-ap05-1', policyId: 'AP-05', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-05 12:00', detail: 'Tạo luật VIEW_HISTORY.' },
]
