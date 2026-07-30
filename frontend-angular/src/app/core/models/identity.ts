/** Mirror 1:1 `IdentityDtos` (services/identity-service) — field name giữ nguyên camelCase JSON. */

export interface OrganizationResponse {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  active: boolean;
}

export interface OrganizationRequest {
  code: string;
  name: string;
  parentId: string | null;
  active?: boolean;
}

export interface PermissionResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface PermissionRequest {
  code: string;
  name: string;
  description: string | null;
  active?: boolean;
}

export interface FeatureResponse {
  id: string;
  code: string;
  name: string;
  group: string;
  description: string | null;
  active: boolean;
  legacy: boolean;
}

export interface MatrixEntryRequest {
  featureCode: string;
  permissionCodes: string[];
  enabled?: boolean;
}

export interface MatrixEntryResponse {
  featureCode: string;
  permissionCodes: string[];
  enabled: boolean;
}

export interface RoleResponse {
  id: string;
  code: string;
  name: string;
  kind: string;
  active: boolean;
  permissionCodes: string[];
  matrix: MatrixEntryResponse[];
}

export interface RoleRequest {
  code: string;
  name: string;
  kind: string;
  active?: boolean;
  permissionCodes: string[];
  matrix?: MatrixEntryRequest[];
}

export interface UserResponse {
  id: string;
  email: string;
  employeeCode: string | null;
  fullName: string;
  jobTitle: string | null;
  organizationId: string | null;
  status: string;
  administrator: boolean;
}

export interface UserRequest {
  email: string;
  employeeCode: string | null;
  fullName: string;
  jobTitle: string | null;
  organizationId: string | null;
  status?: string;
  administrator?: boolean;
}

export interface AssignmentResponse {
  id: string;
  userId: string;
  roleCode: string;
  dataScope: string;
  organizationId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface AssignmentRequest {
  roleCode: string;
  dataScope: string;
  organizationId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface DataScopeResponse {
  code: string;
  name: string;
  description: string | null;
  rank: number;
  active: boolean;
}

export interface AppResponse {
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface UserAppsRequest {
  appCodes: string[];
}

export interface UserAppsResponse {
  userId: string;
  appCodes: string[];
}

export interface EffectiveAssignmentResponse {
  roleCode: string;
  dataScope: string;
  organizationId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface EffectivePermissionsResponse {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  organizationId: string | null;
  roleCodes: string[];
  permissions: string[];
  featurePermissions: MatrixEntryResponse[];
  assignments: EffectiveAssignmentResponse[];
  apps: string[];
  administrator: boolean;
}

export interface AuditLogResponse {
  id: string;
  eventType: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  details: string | null;
  occurredAt: string;
}
