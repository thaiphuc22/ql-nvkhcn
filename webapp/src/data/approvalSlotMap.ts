// EPIC06 — Approval Matrix: bản đồ Bước → Slot + dựng context runtime (Slice G,
// docs/research/approval-matrix-refactor-plan.md §4.G / §8; Slice D,
// docs/research/approval-slot-catalog-plan.md §4.D).
//
// Nguồn slot ưu tiên: `needRole` thật ghi trên User Task qua Properties Panel
// (zeebe:TaskHeaders, Slice C) — hình chiếu mock ở `TaskStep.needRole`
// (data/processes.ts). CHỈ khi bước chưa được re-author (`needRole` rỗng) mới suy
// slot từ candidateGroups (ROLE_TO_SLOT) như cách làm cũ — giữ các quy trình chưa
// migrate vẫn chạy được. Bước không suy được slot bằng cả 2 cách giữ nguyên
// resolveGroups (tránh bịa slot/hội đồng sai).

import { capCode, parseVND, type ResolveContext, type SlotCode } from './approvalMatrix'

/** candidateGroup của bước → slot phê duyệt (suy diễn mock — chỉ dùng khi bước chưa có needRole thật). */
const ROLE_TO_SLOT: Record<string, SlotCode> = {
  CQ_KHCN: 'THAM_DINH',
  CQ_KHCN_TD: 'THAM_DINH',
  HDKHCN: 'HOI_DONG',
  HDKHCN_TD: 'HOI_DONG',
  TGD_VHT: 'PHE_DUYET',
  BTGD_TD: 'PHE_DUYET',
  CQNV_TD: 'PHE_DUYET',
}

/**
 * Slot của một bước: ưu tiên `needRole` thật (Need Role trên User Task); rơi về
 * suy diễn theo candidateGroups nếu bước chưa được re-author. Null = không suy
 * được bằng cả 2 cách (giữ resolveGroups).
 */
export function slotForStep(vaiTroCodes: string[], needRole?: string | null): SlotCode | null {
  if (needRole) return needRole
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
  needRole?: string | null,
): ResolveContext | null {
  const slot = slotForStep(vaiTroCodes, needRole)
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
