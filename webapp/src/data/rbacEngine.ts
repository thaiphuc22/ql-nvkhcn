import { ADMIN_ROLE_LABEL, ROLE_LABEL_TO_CODES, type AppUser } from './users'
import {
  DATA_SCOPE_DEFINITIONS,
  DEFAULT_DOMAIN_CODE,
  ROLE_PERMISSION_POLICIES,
  USER_ROLE_ASSIGNMENTS,
  type DataScopeCode,
  type DomainCode,
  type FeatureCode,
  type PermissionCode,
  type RolePermissionPolicy,
  type SystemRoleCode,
  type UserRoleAssignment,
} from './rbac'

export interface RbacPrincipal {
  userId: string
  userName: string
  email: string
  systemRoleCodes: SystemRoleCode[]
  businessRoleCodes: string[]
  roleCodes: string[]
}

export interface PermissionCheckResult {
  allowed: boolean
  matchedPolicies: RolePermissionPolicy[]
  roleCodes: string[]
  permissionCodes: PermissionCode[]
  dataScopes: DataScopeCode[]
  reason: string
}

export function getPrincipal(user: AppUser | null | undefined): RbacPrincipal | null {
  if (!user) return null

  const isAdmin = user.vaiTro.includes(ADMIN_ROLE_LABEL)
  const systemRoleCodes: SystemRoleCode[] = isAdmin ? ['ADMIN'] : ['VIEWER']
  const businessRoleCodes = [
    ...new Set(user.vaiTro.flatMap((label) => ROLE_LABEL_TO_CODES[label] ?? [])),
  ]

  return {
    userId: user.id,
    userName: user.hoTen,
    email: user.email,
    systemRoleCodes,
    businessRoleCodes,
    roleCodes: [...systemRoleCodes, ...businessRoleCodes],
  }
}

export function getMatchedPolicies(
  user: AppUser | null | undefined,
  featureCode: FeatureCode,
  policies: RolePermissionPolicy[] = ROLE_PERMISSION_POLICIES,
  domainCode: DomainCode = DEFAULT_DOMAIN_CODE,
): RolePermissionPolicy[] {
  const principal = getPrincipal(user)
  if (!principal) return []

  return policies.filter(
    (policy) =>
      policy.enabled &&
      policy.domainCode === domainCode &&
      policy.featureCode === featureCode &&
      principal.roleCodes.includes(policy.roleCode),
  )
}

export function getEffectivePermissions(
  user: AppUser | null | undefined,
  featureCode: FeatureCode,
  policies: RolePermissionPolicy[] = ROLE_PERMISSION_POLICIES,
  domainCode: DomainCode = DEFAULT_DOMAIN_CODE,
): PermissionCode[] {
  return [
    ...new Set(
      getMatchedPolicies(user, featureCode, policies, domainCode).flatMap((policy) => policy.permissionCodes),
    ),
  ]
}

/** Assignment còn hiệu lực tại thời điểm `at` (mặc định: bây giờ). */
function isAssignmentEffective(assignment: UserRoleAssignment, at: Date = new Date()): boolean {
  if (assignment.effectiveFrom && at < new Date(assignment.effectiveFrom)) return false
  if (assignment.effectiveTo && at > new Date(assignment.effectiveTo)) return false
  return true
}

/**
 * Assignment còn hiệu lực của user, lọc theo role user thực sự đang giữ (fail-safe:
 * assignment cho role đã gỡ khỏi vaiTro sẽ không được tính). Membership role vẫn
 * suy từ `user.vaiTro` — assignment chỉ phủ scope. Xem D11.
 */
export function getUserAssignments(
  user: AppUser | null | undefined,
  assignments: UserRoleAssignment[] = USER_ROLE_ASSIGNMENTS,
  domainCode: DomainCode = DEFAULT_DOMAIN_CODE,
): UserRoleAssignment[] {
  const principal = getPrincipal(user)
  if (!principal) return []
  return assignments.filter(
    (assignment) =>
      assignment.domainCode === domainCode &&
      assignment.userId === principal.userId &&
      principal.roleCodes.includes(assignment.roleCode) &&
      isAssignmentEffective(assignment),
  )
}

/**
 * Phạm vi dữ liệu hiệu lực của user — lấy từ UserRoleAssignment, KHÔNG còn từ policy.
 * Scope không còn phụ thuộc feature (một user có 1 tập scope chung theo các role được gán).
 */
export function getEffectiveDataScopes(
  user: AppUser | null | undefined,
  assignments: UserRoleAssignment[] = USER_ROLE_ASSIGNMENTS,
  domainCode: DomainCode = DEFAULT_DOMAIN_CODE,
): DataScopeCode[] {
  const scopeRank = new Map(DATA_SCOPE_DEFINITIONS.map((scope) => [scope.code, scope.rank]))
  return [
    ...new Set(
      getUserAssignments(user, assignments, domainCode)
        .map((assignment) => assignment.dataScope)
        .sort((a, b) => (scopeRank.get(b) ?? 0) - (scopeRank.get(a) ?? 0)),
    ),
  ]
}

export function checkPermission(
  user: AppUser | null | undefined,
  featureCode: FeatureCode,
  permissionCode: PermissionCode,
  policies: RolePermissionPolicy[] = ROLE_PERMISSION_POLICIES,
  domainCode: DomainCode = DEFAULT_DOMAIN_CODE,
): PermissionCheckResult {
  const principal = getPrincipal(user)
  if (!principal) {
    return {
      allowed: false,
      matchedPolicies: [],
      roleCodes: [],
      permissionCodes: [],
      dataScopes: [],
      reason: 'Chua co user dang nhap.',
    }
  }

  const matchedPolicies = getMatchedPolicies(user, featureCode, policies, domainCode)
  const permissionCodes = [...new Set(matchedPolicies.flatMap((policy) => policy.permissionCodes))]
  const dataScopes = getEffectiveDataScopes(user, USER_ROLE_ASSIGNMENTS, domainCode)
  const allowed = permissionCodes.includes(permissionCode)

  return {
    allowed,
    matchedPolicies,
    roleCodes: principal.roleCodes,
    permissionCodes,
    dataScopes,
    reason: allowed
      ? 'Co policy dang bat cap quyen nay cho mot trong cac role cua user.'
      : matchedPolicies.length
        ? 'Co policy cho feature nay nhung chua cap permission dang kiem tra.'
        : 'Khong co policy dang bat nao khop role va feature.',
  }
}

export function hasPermission(
  user: AppUser | null | undefined,
  featureCode: FeatureCode,
  permissionCode: PermissionCode,
  policies: RolePermissionPolicy[] = ROLE_PERMISSION_POLICIES,
  domainCode: DomainCode = DEFAULT_DOMAIN_CODE,
): boolean {
  return checkPermission(user, featureCode, permissionCode, policies, domainCode).allowed
}

export function canAccessFeature(
  user: AppUser | null | undefined,
  featureCode: FeatureCode,
  policies: RolePermissionPolicy[] = ROLE_PERMISSION_POLICIES,
  domainCode: DomainCode = DEFAULT_DOMAIN_CODE,
): boolean {
  return (
    hasPermission(user, featureCode, 'VIEW', policies, domainCode) ||
    hasPermission(user, featureCode, 'CONFIGURE', policies, domainCode)
  )
}
