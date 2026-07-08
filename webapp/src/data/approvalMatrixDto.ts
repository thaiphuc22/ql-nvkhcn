// EPIC06 — Approval Matrix: DTO cho API tương lai (Slice I của refactor,
// docs/research/approval-matrix-refactor-plan.md §4.I).
//
// Chưa khởi động backend (chờ Foundation 1). File này CHỈ khai báo HÌNH DẠNG dữ liệu
// trao đổi để mock store có thể đổi sang API client với thay đổi UI tối thiểu. Các
// type nghiệp vụ (ApprovalRule/ConditionGroup/ApprovalAssignment) đã JSON-serializable
// nên DTO phần lớn alias thẳng; chỗ khác biệt (resolve trả id thay vì object user)
// được tách riêng để audit gọn.
//
// Endpoint dự kiến:
//   GET  /approval-matrix/rules            → ApprovalRuleDto[]
//   POST /approval-matrix/rules            (CreateApprovalRuleDto) → ApprovalRuleDto
//   PUT  /approval-matrix/rules/{id}       (UpdateApprovalRuleDto) → ApprovalRuleDto
//   POST /approval-matrix/resolve          (ResolveRequestDto)     → ResolveResultDto
//   POST /approval-matrix/analyze          (AnalyzeRequestDto)     → RuleWarningDto[]

import type { ConditionGroup } from './approvalConditions'
import type {
  ApprovalAssignment,
  ApprovalMode,
  ApprovalResolveAudit,
  ApprovalTarget,
  SlotCode,
} from './approvalMatrix'
import type { RuleWarning } from './approvalMatrixAnalyzer'

/** Một luật như backend trả về (≈ ApprovalRule của mock). */
export interface ApprovalRuleDto {
  id: string
  ten: string
  slot: SlotCode
  conditions: ConditionGroup
  assignment: ApprovalAssignment
  priority: number
  enabled: boolean
  version?: number
  updatedAt?: string
  updatedBy?: string
}

/** Tạo luật mới — không có id/version (server cấp). */
export type CreateApprovalRuleDto = Omit<ApprovalRuleDto, 'id' | 'version' | 'updatedAt' | 'updatedBy'>

/** Cập nhật luật — partial, id nằm trên path. */
export type UpdateApprovalRuleDto = Partial<CreateApprovalRuleDto>

/** Body của POST /resolve: slot + biến context (đã phẳng như engine). */
export interface ResolveRequestDto {
  slot: SlotCode
  /** Ngày áp uỷ quyền (ISO); bỏ trống = hôm nay ở server. */
  ngay?: string
  /** Biến điều kiện phẳng (capNhiemVu/tongDuToan/loaiHoiDong/…). */
  context: Record<string, unknown>
}

/** Người phê duyệt trả về — chỉ id + metadata resolve (không nhúng full user). */
export interface ResolvedApproverDto {
  userId: string
  viaRoleCode?: string
  viaTargetType?: ApprovalTarget['type']
  placeholder?: boolean
  delegatedFromUserId?: string
  delegationLyDo?: string
}

/** Kết quả resolve (≈ ResolveResult, nhưng người = id). */
export interface ResolveResultDto {
  matchedRuleId: string | null
  mode: ApprovalMode | null
  approvers: ResolvedApproverDto[]
  reason: string
  warnings: string[]
  audit: ApprovalResolveAudit
}

/** Body của POST /analyze — bỏ trống = phân tích toàn bộ ma trận hiện hành. */
export interface AnalyzeRequestDto {
  ruleIds?: string[]
}

/** Cảnh báo phân tích (≈ RuleWarning). */
export type RuleWarningDto = RuleWarning
