// EPIC06 — Approval Slot Catalog: shared store (Slice B,
// docs/research/approval-slot-catalog-plan.md §4.B).
//
// Nguồn duy nhất cho danh sách slot phê duyệt — mount ở main.tsx để cả trang
// `/ma-tran-phe-duyet` (Slice E, admin UI) lẫn Properties Panel BPMN (Slice C, Need
// Role) đọc/ghi CHUNG một catalog. `create` chuẩn hoá mã về UPPER_SNAKE và chặn
// trùng (kể cả trùng sau chuẩn hoá, vd "xyz" trùng "XYZ") — cách khắc phục cụ thể
// cho vấn đề trôi mã (`XYZ`/`xyz`/`XetDuyet`) mà BA notes nêu.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { APPROVAL_SLOTS, type ApprovalSlot } from '../data/approvalSlotCatalog'

export interface CreateApprovalSlotInput {
  code: string
  ten: string
  moTa?: string
  nhomQuyTrinh?: string[]
}

export interface UpdateApprovalSlotInput {
  ten?: string
  moTa?: string
  nhomQuyTrinh?: string[]
  thuTu?: number
}

export interface CreateApprovalSlotResult {
  ok: boolean
  slot?: ApprovalSlot
  errors: string[]
}

/** Chuẩn hoá mã slot: chữ hoa, khoảng trắng/gạch nối → gạch dưới (vd "xyz duyet" → "XYZ_DUYET"). */
export function normalizeSlotCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, '_')
}

interface ApprovalSlotCatalogCtxValue {
  slots: ApprovalSlot[]
  findByCode: (code: string) => ApprovalSlot | undefined
  /** Tạo slot mới. Chặn (ok:false) nếu mã sau chuẩn hoá trùng slot có sẵn — không ghi đè âm thầm. */
  create: (input: CreateApprovalSlotInput) => CreateApprovalSlotResult
  update: (code: string, patch: UpdateApprovalSlotInput) => void
  setStatus: (code: string, trangThai: ApprovalSlot['trangThai']) => void
}

const Ctx = createContext<ApprovalSlotCatalogCtxValue | null>(null)

export function useApprovalSlotCatalog(): ApprovalSlotCatalogCtxValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApprovalSlotCatalog must be used within ApprovalSlotCatalogProvider')
  return ctx
}

export function ApprovalSlotCatalogProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<ApprovalSlot[]>(APPROVAL_SLOTS)

  const value = useMemo<ApprovalSlotCatalogCtxValue>(() => {
    const findByCode = (code: string) => slots.find((s) => s.code === code)

    const create: ApprovalSlotCatalogCtxValue['create'] = (input) => {
      const code = normalizeSlotCode(input.code)
      if (!code) return { ok: false, errors: ['Mã slot không được để trống.'] }
      const existing = findByCode(code)
      if (existing) {
        return {
          ok: false,
          errors: [`Mã slot "${code}" đã trùng với slot có sẵn "${existing.code}" (${existing.ten}) — chọn mã khác.`],
        }
      }
      const thuTu = Math.max(0, ...slots.map((s) => s.thuTu)) + 10
      const slot: ApprovalSlot = {
        code,
        ten: input.ten,
        moTa: input.moTa,
        nhomQuyTrinh: input.nhomQuyTrinh,
        trangThai: 'active',
        thuTu,
      }
      setSlots((prev) => [...prev, slot])
      return { ok: true, slot, errors: [] }
    }

    const update: ApprovalSlotCatalogCtxValue['update'] = (code, patch) =>
      setSlots((prev) => prev.map((s) => (s.code === code ? { ...s, ...patch } : s)))

    const setStatus: ApprovalSlotCatalogCtxValue['setStatus'] = (code, trangThai) =>
      setSlots((prev) => prev.map((s) => (s.code === code ? { ...s, trangThai } : s)))

    return { slots, findByCode, create, update, setStatus }
  }, [slots])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
