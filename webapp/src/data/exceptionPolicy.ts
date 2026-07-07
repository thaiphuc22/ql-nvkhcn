// Exception Policy Engine (mock) — controlled-exception-handling.md §4.2 (Exception Policy
// Engine), §9 (workflow_exception_policy) và action-availability-model.md §8 (exception_action_policy).
//
// Cùng khuôn với approvalMatrix.ts: một bảng luật CÓ THỂ CẤU HÌNH + resolver first-match,
// chạy client-side. Thay cho bảng tĩnh EXCEPTION_APPROVER_ROLES trước đây — giờ 3 câu hỏi
//   • ai được duyệt ngoại lệ (requiredApproverRoleCodes),
//   • có bắt buộc lý do / căn cứ không (requireReason / requireEvidence),
//   • mỗi hồ sơ được áp dụng loại này tối đa bao nhiêu lần (maxTimesPerDossier),
// đều do policy quyết định thay vì hard-code. `condition_expression` trong doc ở mock này
// mới evaluate trên `cap` (cấp nhiệm vụ); process_code / task_definition_key / budget sẽ
// thêm khi có Exception Policy Engine thật (F4).

import type { Cap } from './nhiemVu'
import type { ExceptionType } from './exceptions'

/** Ai được quyền DUYỆT ngoại lệ theo cấp nhiệm vụ — khớp role code trong data/roles.ts. */
const APPROVER_BY_CAP: Record<Cap, string[]> = {
  'Cơ sở': ['TGD_VHT'],
  'Tập đoàn': ['BTGD_TD'],
}

/**
 * Một dòng chính sách ngoại lệ. Điều kiện `cap = null` nghĩa là "bất kỳ cấp" (wildcard);
 * rule khớp khi mọi điều kiện được khai báo đều thoả context. Rule TỒN TẠI = loại ngoại
 * lệ này được PHÉP tại context đó (không có rule khớp = không cho xin — fail-closed).
 */
export interface ExceptionActionPolicy {
  id: string
  exceptionType: ExceptionType
  // ── Điều kiện ────────────────────────────────────────────────────────────
  cap?: Cap | null
  // ── Kết quả ──────────────────────────────────────────────────────────────
  /** Vai trò được duyệt ngoại lệ (snapshot vào ExceptionRequest.approverRoleCodes). */
  requiredApproverRoleCodes: string[]
  requireReason: boolean
  requireEvidence: boolean
  /** Số lần tối đa được áp dụng loại ngoại lệ này trên một hồ sơ. */
  maxTimesPerDossier: number
  /** Ưu tiên: SỐ NHỎ = cao. First-match theo priority tăng dần. */
  priority: number
  enabled: boolean
}

/** Cấu hình riêng theo từng loại — mức "nhạy cảm" khác nhau nên yêu cầu căn cứ / giới hạn khác nhau. */
const PER_TYPE: Record<ExceptionType, { requireEvidence: boolean; maxTimesPerDossier: number }> = {
  // Bỏ qua Hội đồng: nhạy cảm nhất — bắt buộc căn cứ, tối đa 1 lần / hồ sơ.
  BypassCouncil: { requireEvidence: true, maxTimesPerDossier: 1 },
  // Trình thẳng cấp cao hơn: cũng cần căn cứ, tối đa 1 lần.
  JumpToHigherApprover: { requireEvidence: true, maxTimesPerDossier: 1 },
  // Bỏ qua một bước thường: nhẹ hơn — không bắt buộc căn cứ, cho tối đa 2 lần.
  SkipStep: { requireEvidence: false, maxTimesPerDossier: 2 },
}

/**
 * Bảng chính sách mock = tích (ExceptionType × Cap). Sinh từ PER_TYPE + APPROVER_BY_CAP để
 * DRY nhưng vẫn là dữ liệu tĩnh có thể chỉnh tay / thay bằng bảng DB khi có backend.
 */
export const EXCEPTION_POLICIES: ExceptionActionPolicy[] = (
  Object.entries(PER_TYPE) as [ExceptionType, (typeof PER_TYPE)[ExceptionType]][]
).flatMap(([exceptionType, cfg], ti) =>
  (Object.keys(APPROVER_BY_CAP) as Cap[]).map((cap, ci) => ({
    id: `EP-${String(ti * 10 + ci + 1).padStart(2, '0')}`,
    exceptionType,
    cap,
    requiredApproverRoleCodes: APPROVER_BY_CAP[cap],
    requireReason: true,
    requireEvidence: cfg.requireEvidence,
    maxTimesPerDossier: cfg.maxTimesPerDossier,
    priority: 20,
    enabled: true,
  })),
)

export interface ExceptionPolicyContext {
  exceptionType: ExceptionType
  cap: Cap
}

/**
 * Trung tâm Exception Policy Engine (mock): (loại ngoại lệ + cấp) → dòng policy áp dụng.
 * First-match theo priority tăng dần. Trả `null` khi không loại nào khớp = không được phép.
 * Khi có backend, đây là `POST /exception-policy/resolve`.
 */
export function resolveExceptionPolicy(
  policies: ExceptionActionPolicy[],
  ctx: ExceptionPolicyContext,
): ExceptionActionPolicy | null {
  return (
    policies
      .filter(
        (p) =>
          p.enabled &&
          p.exceptionType === ctx.exceptionType &&
          (p.cap == null || p.cap === ctx.cap),
      )
      .sort((a, b) => a.priority - b.priority)[0] ?? null
  )
}

/** Diễn giải điều kiện của policy cho UI (thay chuỗi `conditionExpression` minh hoạ cũ). */
export function exceptionConditionExpression(p: ExceptionActionPolicy): string {
  const parts = [
    'dossierStatus = processing',
    'no pending/approved exception request',
    'user in currentStep.vaiTroCodes',
    p.cap ? `cap = ${p.cap}` : 'cap = any',
    `appliedCount < maxTimesPerDossier(${p.maxTimesPerDossier})`,
  ]
  return parts.join(' AND ')
}

/** Hợp các vai trò được duyệt ngoại lệ cho một cấp — dùng để gate quyền xem audit. */
export function exceptionApproverCodesForCap(cap: Cap): string[] {
  return [
    ...new Set(
      EXCEPTION_POLICIES.filter((p) => p.enabled && (p.cap == null || p.cap === cap)).flatMap(
        (p) => p.requiredApproverRoleCodes,
      ),
    ),
  ]
}
