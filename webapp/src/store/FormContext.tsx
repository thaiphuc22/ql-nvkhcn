import { createContext, useContext, useState, type ReactNode } from 'react'
import { seedForms, emptySchema, type FormMeta } from '../forms'

interface FormCtxValue {
  list: FormMeta[]
  getForm: (key?: string) => FormMeta | undefined
  /** Tạo biểu mẫu mới với schema rỗng. Trả false nếu trùng key. */
  addForm: (meta: { key: string; ten: string; moTa?: string; loai?: FormMeta['loai'] }) => boolean
  updateMeta: (key: string, patch: Partial<Pick<FormMeta, 'ten' | 'moTa' | 'loai'>>) => void
  /** Cập nhật schema sau khi thiết kế trong designer. */
  updateSchema: (key: string, schema: unknown) => void
  removeForm: (key: string) => void
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

  const addForm: FormCtxValue['addForm'] = ({ key, ten, moTa, loai }) => {
    const k = key.trim().toLowerCase()
    if (!k || list.some((f) => f.key === k)) return false
    setList((prev) => [
      { key: k, ten: ten.trim(), moTa: moTa?.trim() || '', loai, schema: emptySchema(k, ten.trim()) },
      ...prev,
    ])
    return true
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

  return (
    <FormCtx.Provider value={{ list, getForm, addForm, updateMeta, updateSchema, removeForm }}>
      {children}
    </FormCtx.Provider>
  )
}
