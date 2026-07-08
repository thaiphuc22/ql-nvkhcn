// EPIC06 — Approval Matrix: phân tích xung đột & độ phủ (Slice F của refactor,
// docs/research/approval-matrix-refactor-plan.md §4.F).
//
// Vì hệ FAIL-CLOSED (không luật khớp = không có người xử lý), việc phát hiện luật bị
// che khuất (shadow) hoặc slot thiếu fallback là cơ chế ĐÚNG-SAI, không chỉ tiện lợi.
// Analyzer thuần logic, không UI — trả cảnh báo để bảng/modal hiển thị.

import type { ApprovalRule, SlotCode } from './approvalMatrix'
import { APPROVAL_SLOTS } from './approvalSlotCatalog'

export type WarningLevel = 'error' | 'warning' | 'info'

export interface RuleWarning {
  level: WarningLevel
  /** Luật mà cảnh báo gắn vào (để badge theo dòng). Bỏ trống = cảnh báo mức slot. */
  ruleId?: string
  slot?: SlotCode
  message: string
}

/** Rule "bất kỳ" (điều kiện rỗng) — khớp mọi context của slot. */
function isWildcard(r: ApprovalRule): boolean {
  return r.conditions.items.length === 0
}

/** Assignment có đích thực sự? (GROUP có nhóm / USER có người / target placeholder). */
function hasRealTarget(r: ApprovalRule): boolean {
  return r.assignment.targets.some(
    (t) =>
      (t.type === 'GROUP' && t.roleCodes.length > 0) ||
      (t.type === 'USER' && t.userIds.length > 0) ||
      (t.type !== 'GROUP' && t.type !== 'USER'),
  )
}

/**
 * Phân tích toàn bộ ma trận → danh sách cảnh báo:
 * - error: luật không có đích phân công.
 * - warning: trùng ưu tiên cùng slot; luật bị "bất kỳ" ưu tiên cao hơn che khuất;
 *   fallback của slot đang tắt.
 * - info: slot chưa có luật fallback (điều kiện bất kỳ).
 */
export function analyzeRules(rules: ApprovalRule[]): RuleWarning[] {
  const out: RuleWarning[] = []

  // 1. Đích phân công rỗng (mọi luật, kể cả đang tắt).
  for (const r of rules) {
    if (!hasRealTarget(r)) {
      out.push({
        level: 'error',
        ruleId: r.id,
        slot: r.slot,
        message: `Luật "${r.ten}" chưa có đích phân công — sẽ không ra được người.`,
      })
    }
  }

  // Phân tích theo slot trên luật ĐANG BẬT (chỉ slot còn active trong catalog).
  for (const { code: slot } of APPROVAL_SLOTS.filter((s) => s.trangThai === 'active')) {
    const enabled = rules.filter((r) => r.slot === slot && r.enabled)
    const sorted = [...enabled].sort((a, b) => a.priority - b.priority)

    // 2. Trùng ưu tiên (first-match không xác định thứ tự).
    const byPrio = new Map<number, ApprovalRule[]>()
    for (const r of sorted) {
      const arr = byPrio.get(r.priority) ?? []
      arr.push(r)
      byPrio.set(r.priority, arr)
    }
    for (const [prio, arr] of byPrio) {
      if (arr.length > 1) {
        out.push({
          level: 'warning',
          slot,
          message: `Slot "${slot}": ${arr.length} luật trùng ưu tiên ${prio} (${arr
            .map((r) => r.ten)
            .join(', ')}) — thứ tự first-match không xác định.`,
        })
      }
    }

    // 3. Luật bị "bất kỳ" ưu tiên cao hơn che khuất (không bao giờ được chọn).
    const firstWildcard = sorted.find(isWildcard)
    if (firstWildcard) {
      for (const r of sorted) {
        if (r.priority > firstWildcard.priority) {
          out.push({
            level: 'warning',
            ruleId: r.id,
            slot,
            message: `Bị luật "${firstWildcard.ten}" (điều kiện bất kỳ, ưu tiên ${firstWildcard.priority}) che khuất — không bao giờ được chọn.`,
          })
        }
      }
    }

    // 4. Fallback (điều kiện bất kỳ) — độ phủ.
    const wildcardAll = rules.filter((r) => r.slot === slot && isWildcard(r))
    const wildcardEnabled = wildcardAll.filter((r) => r.enabled)
    if (wildcardEnabled.length === 0) {
      if (wildcardAll.length > 0) {
        out.push({
          level: 'warning',
          slot,
          message: `Slot "${slot}": luật fallback (điều kiện bất kỳ) đang bị tắt — một số hồ sơ có thể không khớp luật nào.`,
        })
      } else {
        out.push({
          level: 'info',
          slot,
          message: `Slot "${slot}": chưa có luật fallback (điều kiện bất kỳ) — hồ sơ ngoài các điều kiện đã khai sẽ không có người xử lý.`,
        })
      }
    }
  }

  return out
}

/** Nhóm cảnh báo theo ruleId để badge theo dòng bảng. */
export function warningsByRule(warnings: RuleWarning[]): Map<string, RuleWarning[]> {
  const m = new Map<string, RuleWarning[]>()
  for (const w of warnings) {
    if (!w.ruleId) continue
    const arr = m.get(w.ruleId) ?? []
    arr.push(w)
    m.set(w.ruleId, arr)
  }
  return m
}
