/**
 * Ma trận phê duyệt — Danh mục Loại phê duyệt (Approval Slot Catalog). Port của
 * webapp/src/data/approvalSlotCatalog.ts (D17 Angular migration).
 *
 * "Slot phê duyệt" = Need Role mà BPMN ghi vào User Task. BPMN KHÔNG ghi
 * người/nhóm cụ thể — chỉ ghi slot trừu tượng này, rồi Approval Matrix resolve ra
 * người.
 */

import type { ApprovalRule } from './approval-matrix';

export interface ApprovalSlot {
  code: string;
  ten: string;
  moTa?: string;
  /** Nhóm quy trình áp dụng, vd ['RD01', 'RD02']. Trống = áp dụng mọi quy trình. */
  nhomQuyTrinh?: string[];
  trangThai: 'active' | 'inactive';
  thuTu: number;
}

/**
 * Seed: 3 slot đang dùng thật trong RD01/02/05, cộng 2 slot ví dụ (TAI_CHINH_RASOAT,
 * PHAP_CHE_RASOAT) chưa có quy trình/luật nào tham chiếu.
 */
export const APPROVAL_SLOTS: ApprovalSlot[] = [
  {
    code: 'THAM_DINH',
    ten: 'Thẩm định hồ sơ (Cơ quan nghiệp vụ)',
    nhomQuyTrinh: ['RD01', 'RD02', 'RD05'],
    trangThai: 'active',
    thuTu: 10,
  },
  {
    code: 'HOI_DONG',
    ten: 'Phê duyệt Hội đồng KHCN',
    nhomQuyTrinh: ['RD01', 'RD02', 'RD05'],
    trangThai: 'active',
    thuTu: 20,
  },
  {
    code: 'PHE_DUYET',
    ten: 'Phê duyệt / Ký duyệt (Ban TGĐ)',
    nhomQuyTrinh: ['RD01', 'RD02', 'RD05'],
    trangThai: 'active',
    thuTu: 30,
  },
  {
    code: 'TAI_CHINH_RASOAT',
    ten: 'Rà soát tài chính',
    trangThai: 'active',
    thuTu: 40,
  },
  {
    code: 'PHAP_CHE_RASOAT',
    ten: 'Rà soát pháp chế',
    trangThai: 'active',
    thuTu: 50,
  },
];

export type SlotCode = string;

const SLOT_LABEL = new Map(APPROVAL_SLOTS.map((s) => [s.code, s.ten]));
export function slotLabel(code: string): string {
  return SLOT_LABEL.get(code) ?? code;
}

/** Số luật Approval Matrix đang tham chiếu slot này. */
export function usageForSlot(code: string, rules: ApprovalRule[]): number {
  return rules.filter((r) => r.slot === code).length;
}
