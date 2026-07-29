import { ROLES } from './roles'
import { users, ROLE_LABEL_TO_CODES, ADMIN_ROLE_LABEL } from './users'

export type SystemRoleCode = 'ADMIN' | 'OPERATOR' | 'VIEWER'
export type RoleKind = 'SYSTEM' | 'BUSINESS'

export type PermissionCode =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'APPROVE'
  | 'REJECT'
  | 'RETURN'
  | 'EXPORT'
  | 'COMMENT'
  | 'SIGN'
  | 'CONFIGURE'
  | 'AUDIT'

export type FeatureCode =
  | 'DASHBOARD'
  | 'WORKLIST'
  | 'MISSION'
  | 'DOSSIER'
  | 'PROCESS'
  | 'FORM'
  | 'ACTION_CONFIG'
  | 'USER_ADMIN'
  | 'ORG_ADMIN'
  | 'RBAC_ADMIN'
  | 'REPORT'
  | 'AUDIT'

export type DataScopeCode = 'OWN_MISSION' | 'OWN_DEPARTMENT' | 'OWN_CENTER' | 'ALL'

export interface RbacRole {
  code: string
  name: string
  kind: RoleKind
  group: string
  description: string
  active: boolean
}

export interface PermissionDefinition {
  code: PermissionCode
  name: string
  description: string
}

export interface FeatureDefinition {
  code: FeatureCode
  name: string
  group: string
  description: string
}

export interface DataScopeDefinition {
  code: DataScopeCode
  name: string
  description: string
  rank: number
}

/**
 * Mã domain nghiệp vụ sở hữu policy/assignment này — chuẩn bị cho việc Configuration Service
 * (RBAC/Action/Approval/Exception engine) mở rộng đa domain sau này (xem
 * docs/research/quan-tri-quy-trinh-bpm-platform-danh-gia-2026-07-10.md mục 3.3). Hiện chỉ có
 * 1 domain thật (KHCN); mọi seed + resolver mặc định lọc theo domainCode='KHCN' nên hành vi
 * không đổi so với trước khi thêm field này.
 */
export type DomainCode = 'KHCN'
export const DEFAULT_DOMAIN_CODE: DomainCode = 'KHCN'

export interface RolePermissionPolicy {
  id: string
  domainCode: DomainCode
  roleCode: string
  featureCode: FeatureCode
  permissionCodes: PermissionCode[]
  enabled: boolean
}

/**
 * Phạm vi dữ liệu gán theo user (scope-overlay), tách khỏi RolePermissionPolicy.
 * Role định nghĩa "được làm gì"; assignment định nghĩa "trên phạm vi dữ liệu nào".
 * Hai user cùng role vẫn có thể có scope khác nhau — điều policy-theo-role không làm được.
 * Membership role vẫn suy từ `user.vaiTro`; assignment chỉ phủ thêm scope + đơn vị.
 */
export interface UserRoleAssignment {
  id: string
  domainCode: DomainCode
  userId: string
  roleCode: string
  dataScope: DataScopeCode
  /** Đơn vị/phạm vi áp dụng (mock: nhãn donVi của user). */
  orgUnitId?: string
  /** Hiệu lực (ISO date) — bỏ trống = vô thời hạn. */
  effectiveFrom?: string
  effectiveTo?: string
}

export const SYSTEM_ROLES: RbacRole[] = [
  {
    code: 'ADMIN',
    name: 'Quản trị hệ thống',
    kind: 'SYSTEM',
    group: 'System Role',
    description: 'Toàn quyền cấu hình, vận hành và quản trị hệ thống.',
    active: true,
  },
  {
    code: 'OPERATOR',
    name: 'Vận hành',
    kind: 'SYSTEM',
    group: 'System Role',
    description: 'Vận hành quy trình, theo dõi tích hợp, xử lý sự cố nghiệp vụ.',
    active: true,
  },
  {
    code: 'VIEWER',
    name: 'Người xem',
    kind: 'SYSTEM',
    group: 'System Role',
    description: 'Quyền xem mặc định cho user đang hoạt động.',
    active: true,
  },
]

export const BUSINESS_ROLES: RbacRole[] = ROLES.map((role) => ({
  code: role.code,
  name: role.ten,
  kind: 'BUSINESS',
  group: role.nhom,
  description: `Business role tu candidateGroup BPMN: ${role.code}.`,
  active: true,
}))

export const RBAC_ROLES: RbacRole[] = [...SYSTEM_ROLES, ...BUSINESS_ROLES]

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { code: 'VIEW', name: 'Xem', description: 'Được xem dữ liệu/chức năng.' },
  { code: 'CREATE', name: 'Tạo mới', description: 'Được tạo bản ghi hoặc khởi tạo hồ sơ.' },
  { code: 'EDIT', name: 'Chỉnh sửa', description: 'Được cập nhật dữ liệu trong phạm vi cho phép.' },
  { code: 'APPROVE', name: 'Phê duyệt', description: 'Được phê duyệt task hoặc hồ sơ.' },
  { code: 'REJECT', name: 'Từ chối', description: 'Được từ chối hồ sơ/task và ghi lý do.' },
  { code: 'RETURN', name: 'Trả lại', description: 'Được trả hồ sơ về bước trước hoặc yêu cầu sửa.' },
  { code: 'EXPORT', name: 'Xuất dữ liệu', description: 'Được tải/xuất file, PDF, báo cáo.' },
  { code: 'COMMENT', name: 'Bình luận', description: 'Được thêm ý kiến trao đổi.' },
  { code: 'SIGN', name: 'Ký duyệt', description: 'Được thực hiện hành động ký duyệt.' },
  { code: 'CONFIGURE', name: 'Cấu hình', description: 'Được thay đổi cấu hình hệ thống.' },
  { code: 'AUDIT', name: 'Xem audit', description: 'Được xem nhật ký/audit chi tiết.' },
]

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  { code: 'DASHBOARD', name: 'Tổng quan', group: 'Workspace', description: 'Trang tổng quan hệ thống. Sub-views: DASHBOARD_EXECUTIVE_VIEW, DASHBOARD_PORTFOLIO_VIEW, DASHBOARD_MISSION_VIEW, DASHBOARD_PROCESS_VIEW, DASHBOARD_WORKLOAD_VIEW, DASHBOARD_COUNCIL_VIEW, DASHBOARD_FINANCE_VIEW, DASHBOARD_RESOURCE_VIEW, DASHBOARD_RISK_VIEW, DASHBOARD_INTEGRATION_VIEW, DASHBOARD_ADOPTION_VIEW, DASHBOARD_EXPORT (mock gate: features/dashboard/shared/dashboardPermissions.ts).' },
  { code: 'WORKLIST', name: 'Việc của tôi', group: 'Workspace', description: 'Danh sách task cần xử lý.' },
  { code: 'MISSION', name: 'Nhiệm vụ KHCN', group: 'Core', description: 'Quản lý master Nhiệm vụ KHCN. Mở rộng: Sản phẩm nghiên cứu, SHTT, Công bố khoa học, Công nghệ lõi (xem data/sanPhamKhcn.ts → SAN_PHAM_KHCN_PERMISSIONS).' },
  { code: 'DOSSIER', name: 'Hồ sơ KHCN', group: 'Core', description: 'Quản lý hồ sơ và vòng đời xử lý.' },
  { code: 'PROCESS', name: 'Quy trình', group: 'Configuration', description: 'Danh mục và phiên bản quy trình BPMN.' },
  { code: 'FORM', name: 'Biểu mẫu', group: 'Configuration', description: 'Thư viện biểu mẫu gắn vào task.' },
  { code: 'ACTION_CONFIG', name: 'Ma trận Hành động', group: 'Configuration', description: 'Action Registry và policy hiển thị action.' },
  { code: 'USER_ADMIN', name: 'Người dùng', group: 'Administration', description: 'Quản trị tài khoản người dùng.' },
  { code: 'ORG_ADMIN', name: 'Cơ cấu tổ chức', group: 'Administration', description: 'Quản trị đơn vị và phân bổ người dùng.' },
  { code: 'RBAC_ADMIN', name: 'Phân quyền', group: 'Administration', description: 'Role, permission, policy và data scope.' },
  { code: 'REPORT', name: 'Báo cáo', group: 'Operation', description: 'Báo cáo và xuất dữ liệu tổng hợp.' },
  { code: 'AUDIT', name: 'Nhật ký/Audit', group: 'Operation', description: 'Nhật ký hệ thống, sự kiện và audit.' },
]

export const DATA_SCOPE_DEFINITIONS: DataScopeDefinition[] = [
  { code: 'OWN_MISSION', name: 'Nhiệm vụ của tôi', description: 'Chỉ dữ liệu user tham gia/phụ trách.', rank: 1 },
  { code: 'OWN_DEPARTMENT', name: 'Đơn vị của tôi', description: 'Dữ liệu trong đơn vị của user.', rank: 2 },
  { code: 'OWN_CENTER', name: 'Trung tâm/Khối của tôi', description: 'Dữ liệu trong trung tâm hoặc khối.', rank: 3 },
  { code: 'ALL', name: 'Toàn hệ thống', description: 'Không giới hạn phạm vi dữ liệu.', rank: 4 },
]

const ADMIN_PERMISSIONS: PermissionCode[] = [
  'VIEW',
  'CREATE',
  'EDIT',
  'APPROVE',
  'REJECT',
  'RETURN',
  'EXPORT',
  'COMMENT',
  'SIGN',
  'CONFIGURE',
  'AUDIT',
]

const OPERATOR_FEATURES: FeatureCode[] = ['DASHBOARD', 'WORKLIST', 'MISSION', 'DOSSIER', 'PROCESS', 'FORM', 'AUDIT']

export const ROLE_PERMISSION_POLICIES: RolePermissionPolicy[] = [
  ...FEATURE_DEFINITIONS.map((feature, index) => ({
    id: `RP-ADMIN-${String(index + 1).padStart(2, '0')}`,
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'ADMIN',
    featureCode: feature.code,
    permissionCodes: ADMIN_PERMISSIONS,
    enabled: true,
  })),
  ...OPERATOR_FEATURES.map((feature, index) => ({
    id: `RP-OPER-${String(index + 1).padStart(2, '0')}`,
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'OPERATOR',
    featureCode: feature,
    permissionCodes: ['VIEW', 'EDIT', 'EXPORT', 'AUDIT'] as PermissionCode[],
    enabled: true,
  })),
  {
    id: 'RP-VIEWER-01',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'VIEWER',
    featureCode: 'DASHBOARD',
    permissionCodes: ['VIEW'],
    enabled: true,
  },
  {
    id: 'RP-VIEWER-02',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'VIEWER',
    featureCode: 'WORKLIST',
    permissionCodes: ['VIEW'],
    enabled: true,
  },
  {
    id: 'RP-PM-01',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'PM',
    featureCode: 'MISSION',
    permissionCodes: ['VIEW', 'CREATE', 'EDIT', 'COMMENT', 'EXPORT'],
    enabled: true,
  },
  {
    id: 'RP-PM-02',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'PM',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'CREATE', 'EDIT', 'COMMENT', 'EXPORT'],
    enabled: true,
  },
  {
    id: 'RP-REVIEW-01',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'CQ_KHCN',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'EDIT', 'APPROVE', 'REJECT', 'RETURN', 'COMMENT', 'EXPORT'],
    enabled: true,
  },
  {
    id: 'RP-REVIEW-02',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'CQ_QLKHCN',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'EDIT', 'APPROVE', 'REJECT', 'RETURN', 'COMMENT', 'EXPORT', 'AUDIT'],
    enabled: true,
  },
  {
    id: 'RP-BOARD-01',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'HDKHCN',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'APPROVE', 'REJECT', 'COMMENT', 'SIGN'],
    enabled: true,
  },
  {
    id: 'RP-TGD-01',
    domainCode: DEFAULT_DOMAIN_CODE,
    roleCode: 'TGD_VHT',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'APPROVE', 'REJECT', 'SIGN', 'AUDIT'],
    enabled: true,
  },
]

/** Scope mặc định theo role khi seed assignment (mock). Fallback = OWN_DEPARTMENT. */
const DEFAULT_SCOPE_BY_ROLE: Record<string, DataScopeCode> = {
  ADMIN: 'ALL',
  OPERATOR: 'ALL',
  VIEWER: 'OWN_MISSION',
  PM: 'OWN_MISSION',
  PA: 'OWN_MISSION',
  NNC: 'OWN_MISSION',
  CQ_KHCN: 'OWN_DEPARTMENT',
  CQ_MS: 'OWN_DEPARTMENT',
  CQ_NS: 'OWN_DEPARTMENT',
  CQ_TCKT: 'OWN_DEPARTMENT',
  CQ_QLKHCN: 'OWN_CENTER',
  BGD_TT: 'OWN_CENTER',
  BGD_KHOI: 'OWN_CENTER',
  HDKHCN: 'OWN_CENTER',
  HDXD: 'OWN_CENTER',
  HDXD_DC: 'OWN_CENTER',
  HDNT: 'OWN_CENTER',
  HD_DGHT: 'OWN_CENTER',
  PTGD_CT: 'ALL',
  TGD_VHT: 'ALL',
  TP_CLKHCN: 'OWN_DEPARTMENT',
  TP_TCKT: 'OWN_DEPARTMENT',
  TP_NS: 'OWN_DEPARTMENT',
  GD_TTMS: 'OWN_DEPARTMENT',
  CQ_KHCN_TD: 'ALL',
  CQNV_TD: 'ALL',
  HDKHCN_TD: 'ALL',
  HDXD_TD: 'ALL',
  HDNT_TD: 'ALL',
  BTGD_TD: 'ALL',
}

export function defaultScopeForRole(roleCode: string): DataScopeCode {
  return DEFAULT_SCOPE_BY_ROLE[roleCode] ?? 'OWN_DEPARTMENT'
}

/**
 * Seed assignment suy từ users × role đang giữ (qua ROLE_LABEL_TO_CODES).
 * Mỗi (user, businessRole) → 1 assignment với scope mặc định + đơn vị = donVi của user.
 * Admin (isAdmin) → 1 assignment ADMIN/ALL. Đây là nguồn phạm vi dữ liệu mới,
 * thay cho dataScope cũ nằm trong policy — xem D11.
 */
export const USER_ROLE_ASSIGNMENTS: UserRoleAssignment[] = users.flatMap((user) => {
  if (user.vaiTro.includes(ADMIN_ROLE_LABEL)) {
    return [
      {
        id: `URA-${user.id}-ADMIN`,
        domainCode: DEFAULT_DOMAIN_CODE,
        userId: user.id,
        roleCode: 'ADMIN',
        dataScope: 'ALL',
        orgUnitId: user.donVi,
      },
    ]
  }
  const roleCodes = [...new Set(user.vaiTro.flatMap((label) => ROLE_LABEL_TO_CODES[label] ?? []))]
  return roleCodes.map((roleCode) => ({
    id: `URA-${user.id}-${roleCode}`,
    domainCode: DEFAULT_DOMAIN_CODE,
    userId: user.id,
    roleCode,
    dataScope: defaultScopeForRole(roleCode),
    orgUnitId: user.donVi,
  }))
})

export const ROLE_LABEL: Record<string, string> = Object.fromEntries(RBAC_ROLES.map((role) => [role.code, role.name]))
export const FEATURE_LABEL: Record<FeatureCode, string> = Object.fromEntries(
  FEATURE_DEFINITIONS.map((feature) => [feature.code, feature.name]),
) as Record<FeatureCode, string>
export const PERMISSION_LABEL: Record<PermissionCode, string> = Object.fromEntries(
  PERMISSION_DEFINITIONS.map((permission) => [permission.code, permission.name]),
) as Record<PermissionCode, string>
export const DATA_SCOPE_LABEL: Record<DataScopeCode, string> = Object.fromEntries(
  DATA_SCOPE_DEFINITIONS.map((scope) => [scope.code, scope.name]),
) as Record<DataScopeCode, string>
