import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  seedRules,
  type BusinessRule,
  type RuleCategory,
  type RuleKind,
  type RuleStatus,
} from '../data/rules'

const TODAY = '2026-07-08'

/** Payload tạo luật mới (metadata; nội dung bảng soạn sau ở màn chi tiết). */
export interface CreateRuleInput {
  ten: string
  moTa: string
  category: RuleCategory
  kind: RuleKind
  rdApDung: string[]
  actor: string
}

interface RuleCtxValue {
  list: BusinessRule[]
  get: (id: string) => BusinessRule | undefined
  /** Tạo luật mới → trả id để điều hướng sang màn chi tiết. */
  create: (input: CreateRuleInput) => string
  /** Cập nhật metadata (tên/mô tả/loại/RD…). */
  update: (id: string, patch: Partial<BusinessRule>, actor?: string) => void
  /** Lưu DMN XML mới (nguồn chuẩn) từ trình soạn — tự tăng version. */
  saveXml: (id: string, dmnXml: string, actor?: string) => void
  /** Nhân bản một luật (bản nháp) → trả id bản mới. */
  duplicate: (id: string, actor: string) => string
  /** Đổi trạng thái (hiệu lực ↔ vô hiệu…). */
  setStatus: (id: string, status: RuleStatus, actor?: string) => void
  remove: (id: string) => void
}

const RuleCtx = createContext<RuleCtxValue | null>(null)

export function useRules(): RuleCtxValue {
  const ctx = useContext(RuleCtx)
  if (!ctx) throw new Error('useRules must be used within RuleProvider')
  return ctx
}

/** Sinh mã luật từ tên (slug ASCII in hoa) — chỉ mock, backend sẽ tự cấp. */
function makeMa(ten: string): string {
  const slug = ten
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 3)
    .join('-')
  return `BR-${slug || 'RULE'}`
}

export function RuleProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<BusinessRule[]>(seedRules)

  const value = useMemo<RuleCtxValue>(() => {
    const get = (id: string) => rules.find((r) => r.id === id)

    const create: RuleCtxValue['create'] = (input) => {
      const id = `rule-${Date.now()}`
      const rule: BusinessRule = {
        id,
        ma: makeMa(input.ten),
        ten: input.ten,
        moTa: input.moTa,
        category: input.category,
        kind: input.kind,
        rdApDung: input.rdApDung,
        trangThai: 'draft',
        version: 1,
        capNhat: TODAY,
        nguoiCapNhat: input.actor,
        // DMN mới: bảng rỗng, người dùng soạn ở màn chi tiết. SERVICE: chỉ interface.
        ...(input.kind === 'DMN'
          ? { dmnXml: undefined }
          : { serviceInterface: { inputs: '', output: '' } }),
      }
      setRules((prev) => [rule, ...prev])
      return id
    }

    const update: RuleCtxValue['update'] = (id, patch, actor) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, ...patch, capNhat: TODAY, nguoiCapNhat: actor ?? r.nguoiCapNhat }
            : r,
        ),
      )
    }

    const saveXml: RuleCtxValue['saveXml'] = (id, dmnXml, actor) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                dmnXml,
                version: r.version + 1,
                capNhat: TODAY,
                nguoiCapNhat: actor ?? r.nguoiCapNhat,
              }
            : r,
        ),
      )
    }

    const duplicate: RuleCtxValue['duplicate'] = (id, actor) => {
      const src = rules.find((r) => r.id === id)
      const newId = `rule-${Date.now()}`
      if (!src) return newId
      const copy: BusinessRule = {
        ...src,
        id: newId,
        ma: `${src.ma}-COPY`,
        ten: `${src.ten} (bản sao)`,
        trangThai: 'draft',
        version: 1,
        capNhat: TODAY,
        nguoiCapNhat: actor,
      }
      setRules((prev) => [copy, ...prev])
      return newId
    }

    const setStatus: RuleCtxValue['setStatus'] = (id, status, actor) => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, trangThai: status, capNhat: TODAY, nguoiCapNhat: actor ?? r.nguoiCapNhat }
            : r,
        ),
      )
    }

    const remove: RuleCtxValue['remove'] = (id) => {
      setRules((prev) => prev.filter((r) => r.id !== id))
    }

    return { list: rules, get, create, update, saveXml, duplicate, setStatus, remove }
  }, [rules])

  return <RuleCtx.Provider value={value}>{children}</RuleCtx.Provider>
}
