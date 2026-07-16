import { Injectable, signal } from '@angular/core';

import { APPROVAL_SLOTS, type ApprovalSlot } from '../models/approval-slot-catalog';

export interface CreateApprovalSlotInput {
  code: string;
  ten: string;
  moTa?: string;
  nhomQuyTrinh?: string[];
}

export interface UpdateApprovalSlotInput {
  ten?: string;
  moTa?: string;
  nhomQuyTrinh?: string[];
  thuTu?: number;
}

export interface CreateApprovalSlotResult {
  ok: boolean;
  slot?: ApprovalSlot;
  errors: string[];
}

/** Chuẩn hoá mã slot: chữ hoa, khoảng trắng/gạch nối → gạch dưới (vd "xyz duyet" → "XYZ_DUYET"). */
export function normalizeSlotCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

/**
 * Nguồn duy nhất cho danh sách slot phê duyệt. Port của
 * webapp/src/store/ApprovalSlotCatalogContext.tsx (D17 Angular migration).
 * `create` chuẩn hoá mã về UPPER_SNAKE và chặn trùng (kể cả trùng sau chuẩn hoá).
 */
@Injectable({ providedIn: 'root' })
export class ApprovalSlotCatalogService {
  private readonly slotsSignal = signal<ApprovalSlot[]>(APPROVAL_SLOTS);
  readonly slots = this.slotsSignal.asReadonly();

  findByCode(code: string): ApprovalSlot | undefined {
    return this.slotsSignal().find((s) => s.code === code);
  }

  /** Tạo slot mới. Chặn (ok:false) nếu mã sau chuẩn hoá trùng slot có sẵn — không ghi đè âm thầm. */
  create(input: CreateApprovalSlotInput): CreateApprovalSlotResult {
    const code = normalizeSlotCode(input.code);
    if (!code) return { ok: false, errors: ['Mã slot không được để trống.'] };
    const existing = this.findByCode(code);
    if (existing) {
      return {
        ok: false,
        errors: [`Mã slot "${code}" đã trùng với slot có sẵn "${existing.code}" (${existing.ten}) — chọn mã khác.`],
      };
    }
    const thuTu = Math.max(0, ...this.slotsSignal().map((s) => s.thuTu)) + 10;
    const slot: ApprovalSlot = {
      code,
      ten: input.ten,
      moTa: input.moTa,
      nhomQuyTrinh: input.nhomQuyTrinh,
      trangThai: 'active',
      thuTu,
    };
    this.slotsSignal.update((prev) => [...prev, slot]);
    return { ok: true, slot, errors: [] };
  }

  update(code: string, patch: UpdateApprovalSlotInput): void {
    this.slotsSignal.update((prev) => prev.map((s) => (s.code === code ? { ...s, ...patch } : s)));
  }

  setStatus(code: string, trangThai: ApprovalSlot['trangThai']): void {
    this.slotsSignal.update((prev) => prev.map((s) => (s.code === code ? { ...s, trangThai } : s)));
  }
}
