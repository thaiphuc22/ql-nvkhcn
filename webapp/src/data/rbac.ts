import { ROLES } from './roles'

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

export interface RolePermissionPolicy {
  id: string
  roleCode: string
  featureCode: FeatureCode
  permissionCodes: PermissionCode[]
  dataScope: DataScopeCode
  enabled: boolean
}

export const SYSTEM_ROLES: RbacRole[] = [
  {
    code: 'ADMIN',
    name: 'Quan tri he thong',
    kind: 'SYSTEM',
    group: 'System Role',
    description: 'Toan quyen cau hinh, van hanh va quan tri he thong.',
    active: true,
  },
  {
    code: 'OPERATOR',
    name: 'Van hanh',
    kind: 'SYSTEM',
    group: 'System Role',
    description: 'Van hanh quy trinh, theo doi tich hop, xu ly su co nghiep vu.',
    active: true,
  },
  {
    code: 'VIEWER',
    name: 'Nguoi xem',
    kind: 'SYSTEM',
    group: 'System Role',
    description: 'Quyen xem mac dinh cho user dang hoat dong.',
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
  { code: 'VIEW', name: 'Xem', description: 'Duoc xem du lieu/chuc nang.' },
  { code: 'CREATE', name: 'Tao moi', description: 'Duoc tao ban ghi hoac khoi tao ho so.' },
  { code: 'EDIT', name: 'Chinh sua', description: 'Duoc cap nhat du lieu trong pham vi cho phep.' },
  { code: 'APPROVE', name: 'Phe duyet', description: 'Duoc phe duyet task hoac ho so.' },
  { code: 'REJECT', name: 'Tu choi', description: 'Duoc tu choi ho so/task va ghi ly do.' },
  { code: 'RETURN', name: 'Tra lai', description: 'Duoc tra ho so ve buoc truoc hoac yeu cau sua.' },
  { code: 'EXPORT', name: 'Xuat du lieu', description: 'Duoc tai/xuat file, PDF, bao cao.' },
  { code: 'COMMENT', name: 'Binh luan', description: 'Duoc them y kien trao doi.' },
  { code: 'SIGN', name: 'Ky duyet', description: 'Duoc thuc hien hanh dong ky duyet.' },
  { code: 'CONFIGURE', name: 'Cau hinh', description: 'Duoc thay doi cau hinh he thong.' },
  { code: 'AUDIT', name: 'Xem audit', description: 'Duoc xem nhat ky/audit chi tiet.' },
]

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  { code: 'DASHBOARD', name: 'Tong quan', group: 'Workspace', description: 'Trang tong quan he thong.' },
  { code: 'WORKLIST', name: 'Viec cua toi', group: 'Workspace', description: 'Danh sach task can xu ly.' },
  { code: 'MISSION', name: 'Nhiem vu KHCN', group: 'Core', description: 'Quan ly master Nhiem vu KHCN.' },
  { code: 'DOSSIER', name: 'Ho so KHCN', group: 'Core', description: 'Quan ly ho so va vong doi xu ly.' },
  { code: 'PROCESS', name: 'Quy trinh', group: 'Configuration', description: 'Danh muc va phien ban quy trinh BPMN.' },
  { code: 'FORM', name: 'Bieu mau', group: 'Configuration', description: 'Thu vien bieu mau gan vao task.' },
  { code: 'ACTION_CONFIG', name: 'Cau hinh hanh dong', group: 'Configuration', description: 'Action Registry va policy hien thi action.' },
  { code: 'USER_ADMIN', name: 'Nguoi dung', group: 'Administration', description: 'Quan tri tai khoan nguoi dung.' },
  { code: 'ORG_ADMIN', name: 'Co cau to chuc', group: 'Administration', description: 'Quan tri don vi va phan bo nguoi dung.' },
  { code: 'RBAC_ADMIN', name: 'Phan quyen', group: 'Administration', description: 'Role, permission, policy va data scope.' },
  { code: 'REPORT', name: 'Bao cao', group: 'Operation', description: 'Bao cao va xuat du lieu tong hop.' },
  { code: 'AUDIT', name: 'Nhat ky/Audit', group: 'Operation', description: 'Nhat ky he thong, su kien va audit.' },
]

export const DATA_SCOPE_DEFINITIONS: DataScopeDefinition[] = [
  { code: 'OWN_MISSION', name: 'Nhiem vu cua toi', description: 'Chi du lieu user tham gia/phu trach.', rank: 1 },
  { code: 'OWN_DEPARTMENT', name: 'Don vi cua toi', description: 'Du lieu trong don vi cua user.', rank: 2 },
  { code: 'OWN_CENTER', name: 'Trung tam/Khoi cua toi', description: 'Du lieu trong trung tam hoac khoi.', rank: 3 },
  { code: 'ALL', name: 'Toan he thong', description: 'Khong gioi han pham vi du lieu.', rank: 4 },
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
    roleCode: 'ADMIN',
    featureCode: feature.code,
    permissionCodes: ADMIN_PERMISSIONS,
    dataScope: 'ALL' as DataScopeCode,
    enabled: true,
  })),
  ...OPERATOR_FEATURES.map((feature, index) => ({
    id: `RP-OPER-${String(index + 1).padStart(2, '0')}`,
    roleCode: 'OPERATOR',
    featureCode: feature,
    permissionCodes: ['VIEW', 'EDIT', 'EXPORT', 'AUDIT'] as PermissionCode[],
    dataScope: 'ALL' as DataScopeCode,
    enabled: true,
  })),
  {
    id: 'RP-VIEWER-01',
    roleCode: 'VIEWER',
    featureCode: 'DASHBOARD',
    permissionCodes: ['VIEW'],
    dataScope: 'OWN_MISSION',
    enabled: true,
  },
  {
    id: 'RP-VIEWER-02',
    roleCode: 'VIEWER',
    featureCode: 'WORKLIST',
    permissionCodes: ['VIEW'],
    dataScope: 'OWN_MISSION',
    enabled: true,
  },
  {
    id: 'RP-PM-01',
    roleCode: 'PM',
    featureCode: 'MISSION',
    permissionCodes: ['VIEW', 'CREATE', 'EDIT', 'COMMENT', 'EXPORT'],
    dataScope: 'OWN_MISSION',
    enabled: true,
  },
  {
    id: 'RP-PM-02',
    roleCode: 'PM',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'CREATE', 'EDIT', 'COMMENT', 'EXPORT'],
    dataScope: 'OWN_MISSION',
    enabled: true,
  },
  {
    id: 'RP-REVIEW-01',
    roleCode: 'CQ_KHCN',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'EDIT', 'APPROVE', 'REJECT', 'RETURN', 'COMMENT', 'EXPORT'],
    dataScope: 'OWN_DEPARTMENT',
    enabled: true,
  },
  {
    id: 'RP-REVIEW-02',
    roleCode: 'CQ_QLKHCN',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'EDIT', 'APPROVE', 'REJECT', 'RETURN', 'COMMENT', 'EXPORT', 'AUDIT'],
    dataScope: 'OWN_CENTER',
    enabled: true,
  },
  {
    id: 'RP-BOARD-01',
    roleCode: 'HDKHCN',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'APPROVE', 'REJECT', 'COMMENT', 'SIGN'],
    dataScope: 'OWN_CENTER',
    enabled: true,
  },
  {
    id: 'RP-TGD-01',
    roleCode: 'TGD_VHT',
    featureCode: 'DOSSIER',
    permissionCodes: ['VIEW', 'APPROVE', 'REJECT', 'SIGN', 'AUDIT'],
    dataScope: 'ALL',
    enabled: true,
  },
]

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
