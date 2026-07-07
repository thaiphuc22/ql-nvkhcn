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

export const VND = new Intl.NumberFormat('vi-VN')

/**
 * Mốc "hôm nay" của bản mock (toàn bộ seed data nằm ở 2026). Dùng làm mặc định khi
 * áp uỷ quyền theo hiệu lực để demo tất định — thay cho Date.now() (giờ thực không
 * rơi vào cửa sổ uỷ quyền 2026). Khi có backend, thay bằng thời gian thực.
 */
export const DEMO_TODAY = '2026-07-07'

/**
 * "Slot phê duyệt" = Need Role mà BPMN ghi vào User Task (doc §"BPMN chỉ ghi: Need
 * Role = FINANCE_APPROVER"). BPMN KHÔNG ghi người/nhóm cụ thể — chỉ ghi slot trừu
 * tượng này, rồi Approval Matrix resolve ra người. Đây là các slot xuất hiện trong
 * luồng RD01/RD02/RD05.
 */
export const APPROVAL_SLOTS = [
  { code: 'THAM_DINH', ten: 'Thẩm định hồ sơ (Cơ quan nghiệp vụ)' },
  { code: 'HOI_DONG', ten: 'Phê duyệt Hội đồng KHCN' },
  { code: 'PHE_DUYET', ten: 'Phê duyệt / Ký duyệt (Ban TGĐ)' },
] as const

export type SlotCode = (typeof APPROVAL_SLOTS)[number]['code']

const SLOT_LABEL = new Map(APPROVAL_SLOTS.map((s) => [s.code, s.ten]))
export function slotLabel(code: string): string {
  return SLOT_LABEL.get(code as SlotCode) ?? code
}

/** Nhãn tiếng Việt cho `loaiHoiDong` (đồng bộ variableContract.ts). */
export const LOAI_HOI_DONG_LABEL: Record<string, string> = {
  HD_KHCN_TD: 'Hội đồng KHCN Tập đoàn',
  HD_CS: 'Hội đồng Cơ sở',
  KHONG: 'Không cần hội đồng',
}

/**
 * Một dòng trong Ma trận phê duyệt. Điều kiện `= null/undefined` nghĩa là "bất kỳ"
 * (wildcard). Rule khớp khi MỌI điều kiện được khai báo đều thoả context.
 */
export interface ApprovalRule {
  id: string
  ten: string
  /** Slot phê duyệt mà rule này áp dụng (Need Role từ BPMN). */
  slot: SlotCode
  // ── Điều kiện (đối chiếu với context lúc resolve) ─────────────────────────
  /** Cấp nhiệm vụ — từ DMN/biến process. */
  cap?: 'CS' | 'TD' | null
  /** Loại hội đồng — output DMN, chỉ dùng cho slot HOI_DONG. */
  loaiHoiDong?: string | null
  /** Ngân sách tối thiểu (đồng), inclusive. null = không giới hạn dưới. */
  budgetMin?: number | null
  /** Ngân sách tối đa (đồng), exclusive. null = không giới hạn trên. */
  budgetMax?: number | null
  // ── Kết quả: ai là người phê duyệt ───────────────────────────────────────
  /** Nhóm (candidateGroup) — resolve tiếp ra danh sách user qua tổ chức. */
  approverRoleCodes: string[]
  /** Người cụ thể (candidateUsers) — dùng khi chỉ định đích danh. */
  approverUserIds?: string[]
  /** Ưu tiên: SỐ NHỎ = ưu tiên cao. First-match theo priority tăng dần. */
  priority: number
  enabled: boolean
}

/**
 * Ma trận mock. Minh hoạ đúng ví dụ đầu doc:
 *   "Mission Level = Tập đoàn AND Budget > 5 tỷ → HĐ KHCN → TGĐ"
 * = chuỗi 2 slot (HOI_DONG rồi PHE_DUYET), mỗi slot 1 dòng ma trận.
 * BPMN không đổi; chỉ ma trận này quyết định người.
 */
export const APPROVAL_MATRIX: ApprovalRule[] = [
  // ── Thẩm định: cơ sở → Chuyên quản KHCN; tập đoàn → CQ KHCN Tập đoàn ──
  {
    id: 'AM-01', ten: 'Thẩm định — cấp Cơ sở', slot: 'THAM_DINH', cap: 'CS',
    approverRoleCodes: ['CQ_KHCN'], priority: 10, enabled: true,
  },
  {
    id: 'AM-02', ten: 'Thẩm định — cấp Tập đoàn', slot: 'THAM_DINH', cap: 'TD',
    approverRoleCodes: ['CQ_KHCN_TD'], priority: 10, enabled: true,
  },
  // ── Hội đồng: chọn theo loaiHoiDong (seam DMN → Matrix) ──
  {
    id: 'AM-03', ten: 'Hội đồng — Cơ sở', slot: 'HOI_DONG', loaiHoiDong: 'HD_CS',
    approverRoleCodes: ['HDKHCN'], priority: 20, enabled: true,
  },
  {
    id: 'AM-04', ten: 'Hội đồng — Tập đoàn', slot: 'HOI_DONG', loaiHoiDong: 'HD_KHCN_TD',
    approverRoleCodes: ['HDKHCN_TD'], priority: 20, enabled: true,
  },
  // ── Phê duyệt: rule đặc thù (ngân sách lớn, cấp TĐ) ưu tiên trước fallback ──
  {
    id: 'AM-05', ten: 'Phê duyệt — Tập đoàn, ngân sách > 5 tỷ', slot: 'PHE_DUYET',
    cap: 'TD', budgetMin: 5_000_000_000, approverRoleCodes: ['BTGD_TD'],
    priority: 25, enabled: true,
  },
  {
    id: 'AM-06', ten: 'Phê duyệt — cấp Cơ sở', slot: 'PHE_DUYET', cap: 'CS',
    approverRoleCodes: ['TGD_VHT'], priority: 30, enabled: true,
  },
  {
    id: 'AM-07', ten: 'Phê duyệt — Tập đoàn (mặc định)', slot: 'PHE_DUYET', cap: 'TD',
    approverRoleCodes: ['CQNV_TD'], priority: 40, enabled: true,
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
  /** Ngày mô phỏng (ISO) để áp uỷ quyền theo hiệu lực. Mặc định hôm nay. */
  ngay?: string
}

export interface ResolvedApprover {
  user: AppUser
  /** Nhóm nguồn (nếu resolve từ candidateGroup). */
  viaRoleCode?: string
  /** Nếu bị thay bởi uỷ quyền: người gốc trước khi thay. */
  delegatedFrom?: AppUser
  delegationLyDo?: string
}

export interface ResolveResult {
  matchedRule: ApprovalRule | null
  approvers: ResolvedApprover[]
  /** Diễn giải cho panel mô phỏng. */
  reason: string
}

/** Parse chuỗi dự toán kiểu "4.850.000.000 đ" → số 4850000000. */
export function parseVND(s: string): number {
  return Number((s ?? '').replace(/\D/g, '')) || 0
}

/** Nhãn cấp NhiemVu ('Cơ sở'/'Tập đoàn') → mã 'CS'/'TD' dùng trong điều kiện. */
export function capCode(cap: string): 'CS' | 'TD' {
  return cap === 'Tập đoàn' ? 'TD' : 'CS'
}

function ruleMatches(rule: ApprovalRule, ctx: ResolveContext): boolean {
  if (!rule.enabled) return false
  if (rule.slot !== ctx.slot) return false
  if (rule.cap != null && rule.cap !== ctx.cap) return false
  if (rule.loaiHoiDong != null && rule.loaiHoiDong !== ctx.loaiHoiDong) return false
  if (rule.budgetMin != null && !(ctx.tongDuToan != null && ctx.tongDuToan >= rule.budgetMin)) return false
  if (rule.budgetMax != null && !(ctx.tongDuToan != null && ctx.tongDuToan < rule.budgetMax)) return false
  return true
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

/**
 * Trung tâm EPIC06: từ (slot + điều kiện) → danh sách người phê duyệt cụ thể.
 * First-match theo priority tăng dần; sau đó áp uỷ quyền theo hiệu lực.
 * Khi có backend, đây chính là `POST /approval-matrix/resolve`.
 */
export function resolveApprovers(
  rules: ApprovalRule[],
  ctx: ResolveContext,
): ResolveResult {
  const today = ctx.ngay ?? DEMO_TODAY
  const candidates = rules
    .filter((r) => ruleMatches(r, ctx))
    .sort((a, b) => a.priority - b.priority)
  const matchedRule = candidates[0] ?? null

  if (!matchedRule) {
    return {
      matchedRule: null,
      approvers: [],
      reason: 'Không có luật nào khớp — Camunda sẽ không có người xử lý (fail-closed). Cần bổ sung luật.',
    }
  }

  const approvers = resolveGroups(matchedRule.approverRoleCodes, today)
  const seen = new Set(approvers.map((a) => a.user.id))
  for (const uid of matchedRule.approverUserIds ?? []) {
    const u = users.find((x) => x.id === uid)
    if (u && !seen.has(u.id)) {
      seen.add(u.id)
      approvers.push({ user: u })
    }
  }

  const groups = matchedRule.approverRoleCodes.map(roleLabel).join(', ')
  return {
    matchedRule,
    approvers,
    reason: `Khớp luật "${matchedRule.ten}" (ưu tiên ${matchedRule.priority}) → nhóm: ${groups || '—'}.`,
  }
}
