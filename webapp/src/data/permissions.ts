// Lớp quyền MOCK (F4 — RBAC) suy diễn từ nhãn vai trò của tài khoản demo.
// Nguồn sự thật về vai trò = Role.code trong data/roles.ts — chính là
// candidateGroups trong `zeebe:AssignmentDefinition` của BPMN RD01.01/RD01.02.
// Check quyền ở tầng UI (mock); khi có engine thật, worklist/complete-task
// sẽ do Camunda + IAM quyết định.

import { ADMIN_ROLE_LABEL, ROLE_LABEL_TO_CODES, type AppUser } from './users'
import type { DossierStep } from './dossiers'
import type { ExceptionRequest } from './exceptions'

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

/**
 * Quyền REQUEST_EXCEPTION (action-availability-model.md): người xử lý bước hiện tại
 * mới được xin ngoại lệ trên bước đó — không mở cho toàn bộ người xem hồ sơ.
 */
export function canRequestException(
  user: AppUser | null | undefined,
  currentStep: Pick<DossierStep, 'vaiTroCodes'> | undefined,
): boolean {
  return canProcessStep(user, currentStep)
}

/**
 * Quyền APPROVE_EXCEPTION: chỉ vai trò trong `approverRoleCodes` snapshot trên chính
 * yêu cầu ngoại lệ (không phải vai trò của bước gốc) mới được duyệt/từ chối — tách
 * biệt quyền xin và quyền duyệt (nguyên tắc trong controlled-exception-handling.md).
 */
export function canApproveException(
  user: AppUser | null | undefined,
  request: Pick<ExceptionRequest, 'approverRoleCodes'>,
): boolean {
  if (!user) return false
  if (isAdmin(user)) return true
  return hasAnyRole(user, request.approverRoleCodes)
}

/**
 * Quyền APPLY_EXCEPTION: người xử lý bước gốc (hoặc admin) THỰC THI ngoại lệ ĐÃ được
 * duyệt — tách khỏi quyền duyệt (canApproveException). Nhờ vậy không ai vừa duyệt vừa tự
 * áp dụng: cấp có thẩm quyền cho phép, người vận hành bước mới bấm áp dụng vào luồng.
 * (controlled-exception-handling.md §10 — 4 quyền REQUEST/APPROVE/APPLY/VIEW tách bạch.)
 */
export function canApplyException(
  user: AppUser | null | undefined,
  fromStep: Pick<DossierStep, 'vaiTroCodes'> | undefined,
): boolean {
  return canProcessStep(user, fromStep)
}

/**
 * Quyền VIEW_EXCEPTION_AUDIT: xem lịch sử ngoại lệ của hồ sơ. Mở cho người tham gia hồ sơ
 * (người xử lý bước hiện tại, vai trò được duyệt ngoại lệ) và admin — không mở cho người
 * ngoài. Audit ngoại lệ luôn hiển thị công khai với các bên liên quan (không "âm thầm").
 */
export function canViewExceptionAudit(
  user: AppUser | null | undefined,
  ctx: { currentStep?: Pick<DossierStep, 'vaiTroCodes'>; approverRoleCodes: string[] },
): boolean {
  if (!user) return false
  if (isAdmin(user)) return true
  if (canProcessStep(user, ctx.currentStep)) return true
  return hasAnyRole(user, ctx.approverRoleCodes)
}

/** Nhãn vai trò "Chủ nhiệm đề tài" trong ALL_ROLES / AppUser.vaiTro. */
export const PM_ROLE_LABEL = 'Chủ nhiệm đề tài'

/** User có vai trò "Chủ nhiệm đề tài" (PM/PA/NNC) — bị giới hạn một số menu. */
export function isChuNhiemDeTai(user: AppUser | null | undefined): boolean {
  return user?.vaiTro.includes(PM_ROLE_LABEL) ?? false
}
