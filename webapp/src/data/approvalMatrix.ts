// EPIC06 — Ma trận phê duyệt (Approval Matrix). Prototype mock (chưa nối backend).
//
// Bối cảnh (docs/research/configuration-service-EPIC06.md): BPMN trả lời "cần phê
// duyệt Ở ĐÂU", DMN (EPIC09) trả lời "cần LOẠI/CẤP phê duyệt nào" (sinh `cap`,
// `loaiHoiDong` — xem data/variableContract.ts). Approval Matrix trả lời câu hỏi
// cuối cùng: "chính xác AI sẽ phê duyệt", dựa trên điều kiện nghiệp vụ + cơ cấu tổ
// chức + uỷ quyền. Camunda 8 KHÔNG có sẵn Approval Matrix → phải tự xây (doc §"Q:
// Approval Matrix có được hỗ trợ trong Camunda 8 không → Không").
//
// Ở giai đoạn mock: dữ liệu + resolver chạy client-side. Khi backend/Zeebe sẵn
// sàng, resolver này chuyển thành Approval Matrix Service (microservice độc lập,
// doc §"đề xuất Approval Matrix là một microservice độc lập"); UI giữ nguyên.

import { users, ROLE_LABEL_TO_CODES, type AppUser } from './users'
import { roleLabel } from './roles'
import {
  evaluateConditionTree,
  group,
  leaf,
  type ConditionGroup,
  type EvalContext,
} from './approvalConditions'
import type { SlotCode } from './approvalSlotCatalog'

export type { SlotCode } from './approvalSlotCatalog'

export const VND = new Intl.NumberFormat('vi-VN')

/**
 * Mốc "hôm nay" của bản mock (toàn bộ seed data nằm ở 2026). Dùng làm mặc định khi
 * áp uỷ quyền theo hiệu lực để demo tất định — thay cho Date.now() (giờ thực không
 * rơi vào cửa sổ uỷ quyền 2026). Khi có backend, thay bằng thời gian thực.
 */
export const DEMO_TODAY = '2026-07-07'

// "Slot phê duyệt" (APPROVAL_SLOTS/SlotCode/slotLabel) chuyển sang
// data/approvalSlotCatalog.ts (Slice A, docs/research/approval-slot-catalog-plan.md) —
// catalog quản lý (trạng thái/thứ tự/usage), không còn là mảng cứng ở đây.

/** Nhãn tiếng Việt cho `loaiHoiDong` (đồng bộ variableContract.ts). */
export const LOAI_HOI_DONG_LABEL: Record<string, string> = {
  HD_KHCN_TD: 'Hội đồng KHCN Tập đoàn',
  HD_CS: 'Hội đồng Cơ sở',
  KHONG: 'Không cần hội đồng',
}

// ── Kết quả phân công (Slice E — docs/research/approval-matrix-refactor-plan.md §3.4) ──
// Chế độ phê duyệt: cần MỘT người bất kỳ, TẤT CẢ, hay TUẦN TỰ theo thứ tự target.
export type ApprovalMode = 'ANY_ONE' | 'ALL' | 'SEQUENTIAL'

/** Phạm vi tổ chức khi resolve theo chức danh (placeholder Đợt 2/backend). */
export type OrgScope = 'DON_VI' | 'CAP_TREN' | 'TOAN_HE_THONG'

/**
 * Đích phân công. Đợt 1 chỉ GROUP; Đợt 2 mở GROUP + USER (resolve thật) và khai
 * báo ORG_POSITION/COUNCIL/EXPRESSION làm PLACEHOLDER — chưa resolve ở mock (chờ
 * module Cơ cấu tổ chức / Hội đồng / engine biểu thức + backend).
 */
export type ApprovalTarget =
  | { type: 'GROUP'; roleCodes: string[] }
  | { type: 'USER'; userIds: string[] }
  | { type: 'ORG_POSITION'; positionCode: string; orgScope: OrgScope }
  | { type: 'COUNCIL'; councilType: string; roleInCouncil?: string }
  | { type: 'EXPRESSION'; expression: string }

export type ApprovalTargetType = ApprovalTarget['type']

export interface ApprovalAssignment {
  mode: ApprovalMode
  targets: ApprovalTarget[]
}

/**
 * Một dòng trong Ma trận phê duyệt. Điều kiện là một CÂY (ConditionGroup) đánh giá
 * qua approvalConditions.ts; kết quả là ApprovalAssignment (nhiều target + mode).
 * Nhóm điều kiện RỖNG = "bất kỳ" (wildcard). Rule khớp khi cây điều kiện thoả
 * context (slot khớp riêng, không nằm trong cây).
 */
export interface ApprovalRule {
  id: string
  ten: string
  /** Slot phê duyệt mà rule này áp dụng (Need Role từ BPMN). Khớp riêng, ngoài cây. */
  slot: SlotCode
  /** Cây điều kiện nghiệp vụ (AND/OR + toán tử) — nguồn khớp duy nhất. */
  conditions: ConditionGroup
  /** Kết quả: ai/nhóm nào phê duyệt + chế độ (Slice E). */
  assignment: ApprovalAssignment
  /** Ưu tiên: SỐ NHỎ = ưu tiên cao. First-match theo priority tăng dần. */
  priority: number
  enabled: boolean
  /** Phiên bản (audit) — tăng khi sửa; mock cấp, backend sẽ quản. */
  version?: number
}

/** Tạo assignment GROUP một-nhóm (dùng cho seed + tương thích ngược). */
export function groupAssignment(roleCodes: string[], mode: ApprovalMode = 'ANY_ONE'): ApprovalAssignment {
  return { mode, targets: [{ type: 'GROUP', roleCodes }] }
}

// ── Version History & Audit cho Approval Matrix ──

export type ApprovalRuleAuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'TOGGLE'

export interface ApprovalRuleVersion {
  id: string
  ruleId: string
  version: number
  ten: string
  slot: SlotCode
  conditions: ConditionGroup
  assignment: ApprovalAssignment
  priority: number
  enabled: boolean
  capNhat: string
  nguoiCapNhat: string
  changeNote: string
}

export interface ApprovalRuleAuditEntry {
  id: string
  ruleId: string
  action: ApprovalRuleAuditAction
  version: number
  actor: string
  timestamp: string
  detail: string
}

export const APPROVAL_AUDIT_ACTION_LABEL: Record<ApprovalRuleAuditAction, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xoá',
  TOGGLE: 'Bật/Tắt',
}

export const APPROVAL_AUDIT_ACTION_COLOR: Record<ApprovalRuleAuditAction, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  TOGGLE: 'orange',
}

/** Seed version history — snapshot các phiên bản cũ của các luật đã sửa nhiều lần. */
export const SEED_APPROVAL_VERSIONS: ApprovalRuleVersion[] = [
  // AM-05: đã chỉnh sửa 2 lần (v1→v2→v3 hiện tại)
  {
    id: 'amv-05-v1',
    ruleId: 'AM-05',
    version: 1,
    ten: 'Phê duyệt — Tập đoàn, ngân sách > 10 tỷ',
    slot: 'PHE_DUYET',
    conditions: { kind: 'group', logic: 'AND', items: [leaf('capNhiemVu', 'eq', 'TD'), leaf('tongDuToan', 'gte', 10_000_000_000)] },
    assignment: groupAssignment(['BTGD_TD']),
    priority: 25,
    enabled: true,
    capNhat: '2026-06-10',
    nguoiCapNhat: 'Quản trị hệ thống',
    changeNote: 'Phiên bản đầu — ngưỡng 10 tỷ.',
  },
  {
    id: 'amv-05-v2',
    ruleId: 'AM-05',
    version: 2,
    ten: 'Phê duyệt — Tập đoàn, ngân sách > 5 tỷ',
    slot: 'PHE_DUYET',
    conditions: { kind: 'group', logic: 'AND', items: [leaf('capNhiemVu', 'eq', 'TD'), leaf('tongDuToan', 'gte', 5_000_000_000)] },
    assignment: groupAssignment(['BTGD_TD']),
    priority: 25,
    enabled: true,
    capNhat: '2026-07-01',
    nguoiCapNhat: 'Chuyên viên nghiệp vụ',
    changeNote: 'Hạ ngưỡng ngân sách từ 10 tỷ xuống 5 tỷ.',
  },
  // AM-01: v1 ban đầu
  {
    id: 'amv-01-v1',
    ruleId: 'AM-01',
    version: 1,
    ten: 'Thẩm định — cấp Cơ sở',
    slot: 'THAM_DINH',
    conditions: { kind: 'group', logic: 'AND', items: [leaf('capNhiemVu', 'eq', 'CS')] },
    assignment: groupAssignment(['CQ_KHCN']),
    priority: 10,
    enabled: true,
    capNhat: '2026-06-01',
    nguoiCapNhat: 'Quản trị hệ thống',
    changeNote: 'Phiên bản khởi tạo.',
  },
]

/** Seed audit entries. */
export const SEED_APPROVAL_AUDIT: ApprovalRuleAuditEntry[] = [
  { id: 'ama-01', ruleId: 'AM-01', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-01 09:00', detail: 'Tạo luật Thẩm định — cấp Cơ sở.' },
  { id: 'ama-02', ruleId: 'AM-02', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-01 09:30', detail: 'Tạo luật Thẩm định — cấp Tập đoàn.' },
  { id: 'ama-03', ruleId: 'AM-03', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-05 10:00', detail: 'Tạo luật Hội đồng — Cơ sở.' },
  { id: 'ama-04', ruleId: 'AM-04', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-05 10:30', detail: 'Tạo luật Hội đồng — Tập đoàn.' },
  { id: 'ama-05a', ruleId: 'AM-05', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-10 14:00', detail: 'Tạo luật Phê duyệt — Tập đoàn, ngân sách > 10 tỷ.' },
  { id: 'ama-05b', ruleId: 'AM-05', action: 'UPDATE', version: 2, actor: 'Chuyên viên nghiệp vụ', timestamp: '2026-07-01 11:00', detail: 'Hạ ngưỡng ngân sách từ 10 tỷ → 5 tỷ.' },
  { id: 'ama-05c', ruleId: 'AM-05', action: 'UPDATE', version: 3, actor: 'Quản trị hệ thống', timestamp: '2026-07-07 08:00', detail: 'Cập nhật mô tả + bổ sung điều kiện.' },
  { id: 'ama-06', ruleId: 'AM-06', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-15 09:00', detail: 'Tạo luật Phê duyệt — cấp Cơ sở.' },
  { id: 'ama-07', ruleId: 'AM-07', action: 'CREATE', version: 1, actor: 'Quản trị hệ thống', timestamp: '2026-06-15 09:30', detail: 'Tạo luật Phê duyệt — Tập đoàn (mặc định).' },
]

/**
 * Ma trận mock. Minh hoạ đúng ví dụ đầu doc:
 *   "Mission Level = Tập đoàn AND Budget > 5 tỷ → HĐ KHCN → TGĐ"
 * = chuỗi 2 slot (HOI_DONG rồi PHE_DUYET), mỗi slot 1 dòng ma trận.
 * BPMN không đổi; chỉ ma trận này quyết định người.
 *
 * Seed đã migrate sang cây điều kiện (Slice C) — giữ nguyên ngữ nghĩa cũ:
 * `cap` → `capNhiemVu eq`, `budgetMin` → `tongDuToan gte`, `loaiHoiDong` → `eq`.
 */
export const APPROVAL_MATRIX: ApprovalRule[] = [
  // ── Thẩm định: cơ sở → Chuyên quản KHCN; tập đoàn → CQ KHCN Tập đoàn ──
  {
    id: 'AM-01', ten: 'Thẩm định — cấp Cơ sở', slot: 'THAM_DINH',
    conditions: group('AND', [leaf('capNhiemVu', 'eq', 'CS')]),
    assignment: groupAssignment(['CQ_KHCN']), priority: 10, enabled: true,
  },
  {
    id: 'AM-02', ten: 'Thẩm định — cấp Tập đoàn', slot: 'THAM_DINH',
    conditions: group('AND', [leaf('capNhiemVu', 'eq', 'TD')]),
    assignment: groupAssignment(['CQ_KHCN_TD']), priority: 10, enabled: true,
  },
  // ── Hội đồng: chọn theo loaiHoiDong (seam DMN → Matrix) ──
  {
    id: 'AM-03', ten: 'Hội đồng — Cơ sở', slot: 'HOI_DONG',
    conditions: group('AND', [leaf('loaiHoiDong', 'eq', 'HD_CS')]),
    assignment: groupAssignment(['HDKHCN'], 'ALL'), priority: 20, enabled: true,
  },
  {
    id: 'AM-04', ten: 'Hội đồng — Tập đoàn', slot: 'HOI_DONG',
    conditions: group('AND', [leaf('loaiHoiDong', 'eq', 'HD_KHCN_TD')]),
    assignment: groupAssignment(['HDKHCN_TD'], 'ALL'), priority: 20, enabled: true,
  },
  // ── Phê duyệt: rule đặc thù (ngân sách lớn, cấp TĐ) ưu tiên trước fallback ──
  {
    id: 'AM-05', ten: 'Phê duyệt — Tập đoàn, ngân sách > 5 tỷ', slot: 'PHE_DUYET',
    conditions: group('AND', [
      leaf('capNhiemVu', 'eq', 'TD'),
      leaf('tongDuToan', 'gte', 5_000_000_000),
    ]),
    assignment: groupAssignment(['BTGD_TD']), priority: 25, enabled: true,
  },
  {
    id: 'AM-06', ten: 'Phê duyệt — cấp Cơ sở', slot: 'PHE_DUYET',
    conditions: group('AND', [leaf('capNhiemVu', 'eq', 'CS')]),
    assignment: groupAssignment(['TGD_VHT']), priority: 30, enabled: true,
  },
  {
    id: 'AM-07', ten: 'Phê duyệt — Tập đoàn (mặc định)', slot: 'PHE_DUYET',
    conditions: group('AND', [leaf('capNhiemVu', 'eq', 'TD')]),
    assignment: groupAssignment(['CQNV_TD']), priority: 40, enabled: true,
  },
]

/**
 * Uỷ quyền / thay thế tạm thời (doc §Delegation, §Temporary Assignment). Approval
 * Matrix xử lý — Workflow KHÔNG biết. Áp lên trên kết quả resolve theo hiệu lực
 * thời gian: nếu `from` được uỷ quyền cho `to` và ngày hiện tại nằm trong khoảng,
 * mọi công việc rơi vào `from` sẽ chuyển sang `to`.
 */
export interface Delegation {
  id: string
  fromUserId: string
  toUserId: string
  /** Hiệu lực (ISO date, inclusive). */
  from: string
  to: string
  lyDo: string
}

export const DELEGATIONS: Delegation[] = [
  {
    id: 'DL-01', fromUserId: 'U-007', toUserId: 'U-005',
    from: '2026-07-01', to: '2026-07-15',
    lyDo: 'TGĐ đi công tác — uỷ quyền Phó TGĐ Chuyên trách',
  },
]

// ── Resolve tổ chức: candidateGroup code → danh sách user cụ thể ──────────────
// Đảo ROLE_LABEL_TO_CODES (users.ts): user giữ nhãn vai trò → code candidateGroup.
const codeToUsers = new Map<string, AppUser[]>()
for (const u of users) {
  const codes = new Set<string>()
  for (const label of u.vaiTro) (ROLE_LABEL_TO_CODES[label] ?? []).forEach((c) => codes.add(c))
  for (const c of codes) {
    const arr = codeToUsers.get(c) ?? []
    arr.push(u)
    codeToUsers.set(c, arr)
  }
}
export function usersForRoleCode(code: string): AppUser[] {
  return codeToUsers.get(code) ?? []
}

// ── Resolver ────────────────────────────────────────────────────────────────
export interface ResolveContext {
  slot: SlotCode
  cap?: 'CS' | 'TD'
  loaiHoiDong?: string
  tongDuToan?: number
  /** Biến điều kiện mở rộng (Đợt 2: resolve từ context hồ sơ). Ghi đè 3 biến lõi. */
  vars?: Record<string, unknown>
  /** Ngày mô phỏng (ISO) để áp uỷ quyền theo hiệu lực. Mặc định hôm nay. */
  ngay?: string
}

/**
 * Dựng context PHẲNG cho engine điều kiện: 3 biến lõi map từ ResolveContext theo
 * key registry (capNhiemVu/loaiHoiDong/tongDuToan) + gộp `vars` mở rộng. Slot KHÔNG
 * vào đây (khớp riêng).
 */
export function toEvalContext(ctx: ResolveContext): EvalContext {
  return {
    capNhiemVu: ctx.cap,
    loaiHoiDong: ctx.loaiHoiDong,
    tongDuToan: ctx.tongDuToan,
    ...(ctx.vars ?? {}),
  }
}

export interface ResolvedApprover {
  user: AppUser
  /** Nhóm nguồn (nếu resolve từ candidateGroup). */
  viaRoleCode?: string
  /** Loại target đã sinh ra người này (GROUP/USER/…) — audit. */
  viaTargetType?: ApprovalTargetType
  /** Placeholder chưa resolve được ở mock (ORG_POSITION/COUNCIL/EXPRESSION). */
  placeholder?: boolean
  /** Nếu bị thay bởi uỷ quyền: người gốc trước khi thay. */
  delegatedFrom?: AppUser
  delegationLyDo?: string
}

/** Một dòng "vì sao" cho panel mô phỏng/audit (Slice audit-minimum). */
export interface EvaluatedRule {
  rule: ApprovalRule
  /** Điều kiện có khớp không (bỏ qua ưu tiên). */
  matched: boolean
  /** Có phải rule thắng (first-match) không. */
  chosen: boolean
  /** Diễn giải ngắn: được chọn / khớp nhưng ưu tiên thấp / lý do bị loại. */
  note: string
}

/**
 * Payload audit đầy đủ (Slice H) — "vì sao người này". Process Monitor/Audit sau
 * này tái dùng nguyên khối. Khi có backend, đây là body trả về của
 * `POST /approval-matrix/resolve`.
 */
export interface ApprovalResolveAudit {
  /** Ảnh chụp context đầu vào (đã phẳng hoá cho engine). */
  context: EvalContext
  slot: SlotCode
  matchedRuleId: string | null
  matchedRuleVersion?: number
  mode: ApprovalMode | null
  /** Target trước khi resolve tổ chức (assignment gốc của rule thắng). */
  targetsBeforeOrg: ApprovalTarget[]
  /** User cuối sau khi áp uỷ quyền (loại placeholder). */
  finalUserIds: string[]
  /** Uỷ quyền đã áp trong lần resolve này. */
  delegationsApplied: { fromUserId: string; toUserId: string; lyDo: string }[]
  /** Rule cùng slot bị bỏ qua + lý do. */
  skipped: { ruleId: string; reason: string }[]
  /** Thời điểm resolve (mock = ngay context). */
  at: string
}

export interface ResolveResult {
  matchedRule: ApprovalRule | null
  approvers: ResolvedApprover[]
  /** Chế độ phê duyệt của rule thắng (ANY_ONE/ALL/SEQUENTIAL). */
  mode: ApprovalMode | null
  /** Diễn giải cho panel mô phỏng. */
  reason: string
  /** Cảnh báo (target placeholder chưa resolve, nhóm rỗng…). */
  warnings: string[]
  /** Tất cả rule cùng slot đã xét (khớp + bị loại) — audit "vì sao người này". */
  evaluatedRules: EvaluatedRule[]
  /** Payload audit đầy đủ (Slice H). */
  audit: ApprovalResolveAudit
}

/** Parse chuỗi dự toán kiểu "4.850.000.000 đ" → số 4850000000. */
export function parseVND(s: string): number {
  return Number((s ?? '').replace(/\D/g, '')) || 0
}

/** Nhãn cấp NhiemVu ('Cơ sở'/'Tập đoàn') → mã 'CS'/'TD' dùng trong điều kiện. */
export function capCode(cap: string): 'CS' | 'TD' {
  return cap === 'Tập đoàn' ? 'TD' : 'CS'
}

/** Rule khớp khi enabled + đúng slot + cây điều kiện thoả context phẳng. */
function ruleMatches(rule: ApprovalRule, ctx: ResolveContext, evalCtx: EvalContext): boolean {
  if (!rule.enabled) return false
  if (rule.slot !== ctx.slot) return false
  return evaluateConditionTree(rule.conditions, evalCtx)
}

/** Uỷ quyền đang hiệu lực tại ngày `ngay`, map fromUserId → Delegation. */
function activeDelegations(ngay: string): Map<string, Delegation> {
  const m = new Map<string, Delegation>()
  for (const d of DELEGATIONS) {
    if (ngay >= d.from && ngay <= d.to) m.set(d.fromUserId, d)
  }
  return m
}

/**
 * Tầng "tổ chức" của Approval Matrix: từ danh sách candidateGroup → người cụ thể,
 * áp uỷ quyền theo hiệu lực. Đây là phần dùng chung để nối vào BPMN (Option A):
 * một User Task chỉ mang candidateGroups trừu tượng, hàm này resolve ra người thật.
 */
export function resolveGroups(codes: string[], ngay?: string): ResolvedApprover[] {
  const today = ngay ?? DEMO_TODAY
  const delg = activeDelegations(today)
  const seen = new Set<string>()
  const out: ResolvedApprover[] = []
  const push = (user: AppUser, viaRoleCode?: string) => {
    const d = delg.get(user.id)
    const finalUser = d ? users.find((u) => u.id === d.toUserId) ?? user : user
    if (seen.has(finalUser.id)) return
    seen.add(finalUser.id)
    out.push({
      user: finalUser,
      viaRoleCode,
      delegatedFrom: d ? user : undefined,
      delegationLyDo: d?.lyDo,
    })
  }
  for (const code of codes) {
    const us = usersForRoleCode(code)
    if (us.length === 0) {
      push(
        { id: `__missing_${code}`, hoTen: `(chưa có ai ở nhóm ${roleLabel(code)})`, email: '', donVi: '', vaiTro: [], chucDanh: '', trangThai: 'locked' },
        code,
      )
    } else {
      us.forEach((u) => push(u, code))
    }
  }
  return out
}

/** Nhãn chế độ phê duyệt. */
export const MODE_LABEL: Record<ApprovalMode, string> = {
  ANY_ONE: 'Một người bất kỳ',
  ALL: 'Tất cả',
  SEQUENTIAL: 'Tuần tự',
}

/** Nhãn tiếng Việt cho một target (dùng cho UI + audit + placeholder). */
export function describeTarget(t: ApprovalTarget): string {
  switch (t.type) {
    case 'GROUP':
      return `Nhóm: ${t.roleCodes.map(roleLabel).join(', ') || '—'}`
    case 'USER':
      return `Người: ${t.userIds.map((id) => users.find((u) => u.id === id)?.hoTen ?? id).join(', ') || '—'}`
    case 'ORG_POSITION':
      return `Chức danh: ${t.positionCode} (${t.orgScope})`
    case 'COUNCIL':
      return `Hội đồng: ${t.councilType}${t.roleInCouncil ? ` · ${t.roleInCouncil}` : ''}`
    case 'EXPRESSION':
      return `Biểu thức: ${t.expression}`
  }
}

/** Stable key cho placeholder user (giữ tính tất định của mock). */
function placeholderKey(t: ApprovalTarget): string {
  if (t.type === 'ORG_POSITION') return t.positionCode
  if (t.type === 'COUNCIL') return t.councilType
  if (t.type === 'EXPRESSION') return t.expression.slice(0, 12)
  return t.type
}

export interface ResolveAssignmentOut {
  approvers: ResolvedApprover[]
  warnings: string[]
  delegationsApplied: { fromUserId: string; toUserId: string; lyDo: string }[]
}

/**
 * Tầng resolve KẾT QUẢ PHÂN CÔNG (Slice E): assignment.targets → người cụ thể.
 * GROUP/USER resolve thật (+ uỷ quyền theo hiệu lực); ORG_POSITION/COUNCIL/EXPRESSION
 * là PLACEHOLDER ở mock (sinh 1 người khoá + cảnh báo — chờ module tổ chức/hội đồng
 * + backend). `mode` không đổi DANH SÁCH người, chỉ là metadata (ai/bao nhiêu cần duyệt).
 */
export function resolveAssignment(
  assignment: ApprovalAssignment,
  ngay?: string,
): ResolveAssignmentOut {
  const today = ngay ?? DEMO_TODAY
  const delg = activeDelegations(today)
  const seen = new Set<string>()
  const out: ResolvedApprover[] = []
  const warnings: string[] = []
  const delegationsApplied: { fromUserId: string; toUserId: string; lyDo: string }[] = []

  const push = (user: AppUser, extra: Partial<ResolvedApprover>) => {
    const d = delg.get(user.id)
    const finalUser = d ? users.find((u) => u.id === d.toUserId) ?? user : user
    if (seen.has(finalUser.id)) return
    seen.add(finalUser.id)
    if (d) delegationsApplied.push({ fromUserId: d.fromUserId, toUserId: d.toUserId, lyDo: d.lyDo })
    out.push({
      user: finalUser,
      ...extra,
      delegatedFrom: d ? user : undefined,
      delegationLyDo: d?.lyDo,
    })
  }

  const lockedUser = (id: string, hoTen: string): AppUser => ({
    id, hoTen, email: '', donVi: '', vaiTro: [], chucDanh: '', trangThai: 'locked',
  })

  for (const t of assignment.targets) {
    if (t.type === 'GROUP') {
      for (const code of t.roleCodes) {
        const us = usersForRoleCode(code)
        if (us.length === 0) {
          warnings.push(`Nhóm "${roleLabel(code)}" chưa có thành viên.`)
          push(lockedUser(`__missing_${code}`, `(chưa có ai ở nhóm ${roleLabel(code)})`), {
            viaRoleCode: code, viaTargetType: 'GROUP', placeholder: true,
          })
        } else {
          us.forEach((u) => push(u, { viaRoleCode: code, viaTargetType: 'GROUP' }))
        }
      }
    } else if (t.type === 'USER') {
      for (const uid of t.userIds) {
        const u = users.find((x) => x.id === uid)
        if (u) push(u, { viaTargetType: 'USER' })
        else warnings.push(`Không tìm thấy người dùng ${uid}.`)
      }
    } else {
      const label = describeTarget(t)
      warnings.push(`${label} — chưa resolve ở mock (Đợt 2/backend).`)
      push(lockedUser(`__ph_${t.type}_${placeholderKey(t)}`, `(${label})`), {
        viaTargetType: t.type, placeholder: true,
      })
    }
  }
  return { approvers: out, warnings, delegationsApplied }
}

/**
 * Trung tâm EPIC06: từ (slot + điều kiện) → danh sách người phê duyệt cụ thể.
 * First-match theo priority tăng dần; resolve assignment của rule thắng; sau đó
 * dựng payload audit. Khi có backend, đây chính là `POST /approval-matrix/resolve`.
 */
export function resolveApprovers(
  rules: ApprovalRule[],
  ctx: ResolveContext,
): ResolveResult {
  const today = ctx.ngay ?? DEMO_TODAY
  const evalCtx = toEvalContext(ctx)

  // Xét TẤT CẢ rule cùng slot theo ưu tiên tăng dần → dựng "vì sao" (audit) + chọn
  // rule khớp đầu tiên (first-match).
  const sameSlot = rules
    .filter((r) => r.slot === ctx.slot)
    .sort((a, b) => a.priority - b.priority)
  const evaluated: EvaluatedRule[] = []
  const skipped: { ruleId: string; reason: string }[] = []
  let matchedRule: ApprovalRule | null = null
  for (const r of sameSlot) {
    const matched = ruleMatches(r, ctx, evalCtx)
    const chosen = matched && matchedRule == null
    if (chosen) matchedRule = r
    const note = chosen
      ? 'Khớp — được chọn'
      : matched
        ? 'Khớp nhưng ưu tiên thấp hơn'
        : !r.enabled
          ? 'Đã tắt'
          : 'Điều kiện không khớp'
    if (!chosen) skipped.push({ ruleId: r.id, reason: note })
    evaluated.push({ rule: r, matched, chosen, note })
  }

  const baseAudit: ApprovalResolveAudit = {
    context: evalCtx,
    slot: ctx.slot,
    matchedRuleId: matchedRule?.id ?? null,
    matchedRuleVersion: matchedRule?.version,
    mode: matchedRule?.assignment.mode ?? null,
    targetsBeforeOrg: matchedRule?.assignment.targets ?? [],
    finalUserIds: [],
    delegationsApplied: [],
    skipped,
    at: today,
  }

  if (!matchedRule) {
    return {
      matchedRule: null,
      approvers: [],
      mode: null,
      reason: 'Không có luật nào khớp — Camunda sẽ không có người xử lý (fail-closed). Cần bổ sung luật.',
      warnings: ['Không có luật khớp cho slot + context này.'],
      evaluatedRules: evaluated,
      audit: baseAudit,
    }
  }

  const { approvers, warnings, delegationsApplied } = resolveAssignment(matchedRule.assignment, today)
  const finalUserIds = approvers.filter((a) => !a.placeholder).map((a) => a.user.id)

  return {
    matchedRule,
    approvers,
    mode: matchedRule.assignment.mode,
    reason: `Khớp luật "${matchedRule.ten}" (ưu tiên ${matchedRule.priority}) → ${
      matchedRule.assignment.targets.map(describeTarget).join('; ') || '—'
    } · chế độ: ${MODE_LABEL[matchedRule.assignment.mode]}.`,
    warnings,
    evaluatedRules: evaluated,
    audit: { ...baseAudit, finalUserIds, delegationsApplied },
  }
}
