// Lớp quyền MOCK (F4 — RBAC) suy diễn từ nhãn vai trò của tài khoản demo.
// Nguồn sự thật về vai trò = Role.code trong data/roles.ts — chính là
// candidateGroups trong `zeebe:AssignmentDefinition` của BPMN RD01.01/RD01.02.
// Check quyền ở tầng UI (mock); khi có engine thật, worklist/complete-task
// sẽ do Camunda + IAM quyết định.

import { ADMIN_ROLE_LABEL, ROLE_LABEL_TO_CODES, type AppUser } from './users'
import type { DossierStep } from './dossiers'

/** Toàn bộ mã candidateGroup user đang nắm, suy từ nhãn vai trò. */
export function getUserRoleCodes(user: AppUser | null | undefined): string[] {
  if (!user) return []
  return [...new Set(user.vaiTro.flatMap((label) => ROLE_LABEL_TO_CODES[label] ?? []))]
}

export function isAdmin(user: AppUser | null | undefined): boolean {
  return user?.vaiTro.includes(ADMIN_ROLE_LABEL) ?? false
}

/** User thuộc ít nhất một trong các candidateGroup? Admin luôn đạt. */
export function hasAnyRole(user: AppUser | null | undefined, codes: string[]): boolean {
  if (!user) return false
  if (isAdmin(user)) return true
  const owned = getUserRoleCodes(user)
  return codes.some((c) => owned.includes(c))
}

/** Nhóm được khởi tạo NV KHCN — BPMN RD01 Task_1 nằm ở lane PM (PA/NNC đồng khởi tạo). */
export const CREATE_NV_ROLES = ['PM', 'PA', 'NNC']

export function canCreateNhiemVu(user: AppUser | null | undefined): boolean {
  return hasAnyRole(user, CREATE_NV_ROLES)
}

/** Hồ sơ hiện chỉ sinh cùng NV (Chủ trương) — cùng nhóm PM; giữ hàm riêng cho RD02–RD06 sau. */
export function canCreateHoSo(user: AppUser | null | undefined): boolean {
  return canCreateNhiemVu(user)
}

/**
 * Quyền xử lý bước hiện tại: user thuộc candidateGroups của bước.
 * Bước không có `vaiTroCodes` → chỉ admin (fail-closed, tránh lệch nhãn).
 */
export function canProcessStep(
  user: AppUser | null | undefined,
  step: Pick<DossierStep, 'vaiTroCodes'> | undefined,
): boolean {
  if (!user || !step) return false
  if (isAdmin(user)) return true
  return hasAnyRole(user, step.vaiTroCodes ?? [])
}

/** Trang quản trị (người dùng, cơ cấu tổ chức, tạo/deploy quy trình). */
export function canManageSystem(user: AppUser | null | undefined): boolean {
  return isAdmin(user)
}

/** Nhãn vai trò "Chủ nhiệm đề tài" trong ALL_ROLES / AppUser.vaiTro. */
export const PM_ROLE_LABEL = 'Chủ nhiệm đề tài'

/** User có vai trò "Chủ nhiệm đề tài" (PM/PA/NNC) — bị giới hạn một số menu. */
export function isChuNhiemDeTai(user: AppUser | null | undefined): boolean {
  return user?.vaiTro.includes(PM_ROLE_LABEL) ?? false
}
