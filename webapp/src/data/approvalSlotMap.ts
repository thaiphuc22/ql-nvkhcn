// EPIC06 — Approval Matrix: bản đồ Bước → Slot + dựng context runtime (Slice G,
// docs/research/approval-matrix-refactor-plan.md §4.G / §8).
//
// ⚠️ GIẢ ĐỊNH DEMO (câu hỏi mở plan §8): slot phê duyệt nên đến từ BPMN extension
// property / task metadata do Camunda cấp. Ở mock chưa có nguồn đó, nên suy slot từ
// candidateGroups của bước. CHỈ bước map được slot mới đi qua resolveApprovers; bước
// không map giữ nguyên resolveGroups (tránh bịa slot/hội đồng sai). Khi có BPMN thật,
// thay bảng này bằng đọc metadata — phần còn lại của luồng không đổi.

import { capCode, parseVND, type ResolveContext, type SlotCode } from './approvalMatrix'

/** candidateGroup của bước → slot phê duyệt (suy diễn mock). */
const ROLE_TO_SLOT: Record<string, SlotCode> = {
  CQ_KHCN: 'THAM_DINH',
  CQ_KHCN_TD: 'THAM_DINH',
  HDKHCN: 'HOI_DONG',
  HDKHCN_TD: 'HOI_DONG',
  TGD_VHT: 'PHE_DUYET',
  BTGD_TD: 'PHE_DUYET',
  CQNV_TD: 'PHE_DUYET',
}

/** Slot của một bước theo candidateGroups; null = không suy được (giữ resolveGroups). */
export function slotForStep(vaiTroCodes: string[]): SlotCode | null {
  for (const c of vaiTroCodes) {
    if (ROLE_TO_SLOT[c]) return ROLE_TO_SLOT[c]
  }
  return null
}

/**
 * Dựng ResolveContext cho một bước hồ sơ. Trả null nếu bước không map được slot
 * (khi đó runtime dùng resolveGroups như cũ). `loaiHoiDong` là GIẢ ĐỊNH DEMO suy từ
 * cấp — thực tế do DMN (EPIC09) sinh.
 */
export function buildApprovalContext(
  cap: string,
  duToan: string,
  vaiTroCodes: string[],
  ngay?: string,
): ResolveContext | null {
  const slot = slotForStep(vaiTroCodes)
  if (!slot) return null
  const capC = capCode(cap)
  return {
    slot,
    cap: capC,
    tongDuToan: parseVND(duToan),
    loaiHoiDong: slot === 'HOI_DONG' ? (capC === 'TD' ? 'HD_KHCN_TD' : 'HD_CS') : undefined,
    ngay,
  }
}
