import { createContext, useContext, useState, type ReactNode } from 'react'
import { seedForms, emptySchema, type FormMeta } from '../forms'
import { RD07_FORM_SEEDS } from '../eform-rd07-seed'
import type { NhomRD } from '../eform-nhom-rd'

interface FormCtxValue {
  list: FormMeta[]
  getForm: (key?: string) => FormMeta | undefined
  /** Tạo biểu mẫu mới với schema rỗng. Trả FormMeta vừa tạo (để mở designer ngay), null nếu trùng key. */
  addForm: (meta: {
    key: string
    ten: string
    moTa?: string
    loai?: FormMeta['loai']
    nhomRD?: NhomRD
  }) => FormMeta | null
  updateMeta: (key: string, patch: Partial<Pick<FormMeta, 'ten' | 'moTa' | 'loai' | 'nhomRD'>>) => void
  /** Cập nhật schema sau khi thiết kế trong designer. */
  updateSchema: (key: string, schema: unknown) => void
  removeForm: (key: string) => void
  /** Nạp 4 biểu mẫu mẫu RD07 vào list (idempotent — skip key trùng).
   * Trả về số lượng đã thêm và danh sách key đã bị skip. */
  seedRD07: () => { added: number; skipped: string[] }
  /** Xoá tất cả biểu mẫu có key bắt đầu 'bm-07-' (dùng để reset seed demo).
   * Trả về số lượng đã xoá. */
  clearRD07Seed: () => number
}

const FormCtx = createContext<FormCtxValue | null>(null)

export function useForms(): FormCtxValue {
  const ctx = useContext(FormCtx)
  if (!ctx) throw new Error('useForms must be used within FormProvider')
  return ctx
}

export function FormProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<FormMeta[]>(seedForms)

  const getForm = (key?: string) => (key ? list.find((f) => f.key === key) : undefined)

  const addForm: FormCtxValue['addForm'] = ({ key, ten, moTa, loai, nhomRD }) => {
    const k = key.trim().toLowerCase()
    if (!k || list.some((f) => f.key === k)) return null
    const meta: FormMeta = {
      key: k,
      ten: ten.trim(),
      moTa: moTa?.trim() || '',
      loai,
      nhomRD,
      schema: emptySchema(k, ten.trim()),
    }
    setList((prev) => [meta, ...prev])
    return meta
  }

  const updateMeta: FormCtxValue['updateMeta'] = (key, patch) => {
    setList((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)))
  }

  const updateSchema: FormCtxValue['updateSchema'] = (key, schema) => {
    setList((prev) => prev.map((f) => (f.key === key ? { ...f, schema } : f)))
  }

  const removeForm: FormCtxValue['removeForm'] = (key) => {
    setList((prev) => prev.filter((f) => f.key !== key))
  }

  /** Seed RD07 — thay thế toàn bộ form `bm-07-*` bằng bộ seed 7 bước hiện hành,
   *  rồi giữ nguyên các form khác. Idempotent về nội dung seed mới nhất. */
  const seedRD07: FormCtxValue['seedRD07'] = () => {
    const existingRd07 = new Set(list.filter((f) => f.key.startsWith('bm-07-')).map((f) => f.key))
    const seedKeys = new Set(RD07_FORM_SEEDS.map((f) => f.key))
    const skipped: string[] = []
    // Keys cũ trong list không còn trong seed mới → sẽ bị clear cùng bm-07-*
    existingRd07.forEach((k) => {
      if (seedKeys.has(k)) skipped.push(k)
    })
    setList((prev) => [...RD07_FORM_SEEDS, ...prev.filter((f) => !f.key.startsWith('bm-07-'))])
    return { added: RD07_FORM_SEEDS.length, skipped }
  }

  /** Clear tất cả form có key bắt đầu 'bm-07-' — dùng để reset seed demo. */
  const clearRD07Seed: FormCtxValue['clearRD07Seed'] = () => {
    let removed = 0
    setList((prev) => {
      const next = prev.filter((f) => {
        if (f.key.startsWith('bm-07-')) {
          removed += 1
          return false
        }
        return true
      })
      return next
    })
    return removed
  }

  return (
    <FormCtx.Provider
      value={{
        list,
        getForm,
        addForm,
        updateMeta,
        updateSchema,
        removeForm,
        seedRD07,
        clearRD07Seed,
      }}
    >
      {children}
    </FormCtx.Provider>
  )
}
