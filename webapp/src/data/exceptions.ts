// Ngoại lệ có kiểm soát (Controlled Exception Handling) — mock/prototype F0.
// Tham chiếu: docs/research/controlled-exception-handling.md, action-availability-model.md.
// Đây là lớp riêng biệt với luồng phê duyệt chuẩn (DossierStep): một yêu cầu ngoại lệ
// đi qua vòng đời request → duyệt/từ chối → áp dụng (bỏ qua/chuyển bước), luôn để lại
// audit trail hiển thị công khai trên timeline hồ sơ — không "âm thầm" như BPMN chuẩn.
// CHƯA có Exception Policy Engine thật (F4) — policy dưới đây chỉ là bảng tĩnh minh hoạ.

/** Tập con taxonomy đã wire được cơ chế "nhảy bước" — không liệt kê hết 12 loại
 * trong tài liệu gốc vì các loại còn lại (AddReviewer, ReplaceApprover...) cần cơ chế
 * khác (không phải nhảy bước) và chưa có nền (F4) để triển khai thật. */
export type ExceptionType = 'BypassCouncil' | 'JumpToHigherApprover' | 'SkipStep'

export const EXCEPTION_TYPE_LABEL: Record<ExceptionType, string> = {
  BypassCouncil: 'Bỏ qua Hội đồng',
  JumpToHigherApprover: 'Trình thẳng cấp phê duyệt cao hơn',
  SkipStep: 'Bỏ qua bước hiện tại',
}

export type ExceptionRequestStatus = 'pending' | 'approved' | 'rejected' | 'applied'

export const EXCEPTION_STATUS_LABEL: Record<ExceptionRequestStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt ngoại lệ', color: 'gold' },
  approved: { label: 'Đã duyệt — chờ áp dụng', color: 'blue' },
  rejected: { label: 'Ngoại lệ bị từ chối', color: 'red' },
  applied: { label: 'Đã áp dụng ngoại lệ', color: 'purple' },
}

export interface ExceptionRequest {
  id: string
  /** FK → HoSo.id */
  hoSoId: string
  exceptionType: ExceptionType
  /** Bước hiện tại của hồ sơ tại thời điểm xin ngoại lệ. */
  fromStepIndex: number
  /** Bước đích muốn chuyển tới (phải là bước pending phía sau fromStepIndex). */
  toStepIndex: number
  reason: string
  evidence?: string
  requestedBy: string
  requestedAt: string
  status: ExceptionRequestStatus
  /** Snapshot vai trò được phép duyệt tại thời điểm tạo (theo policy dưới). */
  approverRoleCodes: string[]
  decidedBy?: string
  decidedAt?: string
  decisionNote?: string
}

// Ai được duyệt ngoại lệ, có bắt buộc căn cứ không, tối đa mấy lần/hồ sơ — đã chuyển
// sang Exception Policy Engine (data/exceptionPolicy.ts) để cấu hình theo (loại × cấp),
// thay cho bảng tĩnh trước đây. ExceptionRequest chỉ giữ snapshot `approverRoleCodes`.

export const seedExceptionRequests: ExceptionRequest[] = []
