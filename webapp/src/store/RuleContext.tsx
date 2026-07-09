import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  seedRules,
  seedRuleVersions,
  seedRuleAuditEntries,
  type BusinessRule,
  type RuleCategory,
  type RuleKind,
  type RuleStatus,
  type RuleVersion,
  type RuleAuditEntry,
  type RuleAuditAction,
} from '../data/rules'

const TODAY = '2026-07-09'

function makeAuditId() {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
function makeVersionId() {
  return `ver-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

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
  /** Lưu DMN XML mới (nguồn chuẩn) từ trình soạn — tự tăng version + snapshot bản cũ. */
  saveXml: (id: string, dmnXml: string, actor?: string, changeNote?: string) => void
  /** Nhân bản một luật (bản nháp) → trả id bản mới. */
  duplicate: (id: string, actor: string) => string
  /** Đổi trạng thái (hiệu lực ↔ vô hiệu…). */
  setStatus: (id: string, status: RuleStatus, actor?: string) => void
  remove: (id: string) => void
  /** Lịch sử phiên bản của một luật. */
  getVersions: (ruleId: string) => RuleVersion[]
  /** Nhật ký thay đổi của một luật. */
  getAudit: (ruleId: string) => RuleAuditEntry[]
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
  const [versions, setVersions] = useState<RuleVersion[]>(seedRuleVersions)
  const [auditEntries, setAuditEntries] = useState<RuleAuditEntry[]>(seedRuleAuditEntries)

  /** Ghi một audit entry. */
  const logAudit = (
    ruleId: string,
    action: RuleAuditAction,
    version: number,
    actor: string,
    detail: string,
  ) => {
    setAuditEntries((prev) => [
      { id: makeAuditId(), ruleId, action, version, actor, timestamp: `${TODAY} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`, detail },
      ...prev,
    ])
  }

  /** Snapshot trạng thái hiện tại của rule thành RuleVersion (dùng trước khi saveXml). */
  const snapshotCurrent = (rule: BusinessRule, changeNote: string) => {
    const snap: RuleVersion = {
      id: makeVersionId(),
      ruleId: rule.id,
      version: rule.version,
      ten: rule.ten,
      moTa: rule.moTa,
      category: rule.category,
      kind: rule.kind,
      rdApDung: [...rule.rdApDung],
      trangThai: rule.trangThai,
      dmnXml: rule.dmnXml,
      serviceInterface: rule.serviceInterface
        ? { ...rule.serviceInterface }
        : undefined,
      capNhat: rule.capNhat,
      nguoiCapNhat: rule.nguoiCapNhat,
      changeNote,
    }
    setVersions((prev) => [snap, ...prev])
  }

  const value = useMemo<RuleCtxValue>(() => {
    const get = (id: string) => rules.find((r) => r.id === id)
    const getVersions: RuleCtxValue['getVersions'] = (ruleId) =>
      versions
        .filter((v) => v.ruleId === ruleId)
        .sort((a, b) => b.version - a.version)
    const getAudit: RuleCtxValue['getAudit'] = (ruleId) =>
      auditEntries
        .filter((a) => a.ruleId === ruleId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

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
        ...(input.kind === 'DMN'
          ? { dmnXml: undefined }
          : { serviceInterface: { inputs: '', output: '' } }),
      }
      setRules((prev) => [rule, ...prev])
      logAudit(id, 'CREATE', 1, input.actor, `Tạo luật "${input.ten}" (bản nháp).`)
      return id
    }

    const update: RuleCtxValue['update'] = (id, patch, actor) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          // Build detail từ các field thay đổi
          const changed: string[] = []
          for (const k of Object.keys(patch) as (keyof BusinessRule)[]) {
            if (patch[k] !== undefined && k !== 'nguoiCapNhat' && k !== 'capNhat' && k !== 'version') {
              changed.push(k)
            }
          }
          const detail = changed.length > 0
            ? `Cập nhật: ${changed.join(', ')}.`
            : 'Cập nhật metadata.'
          logAudit(id, 'UPDATE_META', r.version, actor ?? r.nguoiCapNhat, detail)
          return { ...r, ...patch, capNhat: TODAY, nguoiCapNhat: actor ?? r.nguoiCapNhat }
        }),
      )
    }

    const saveXml: RuleCtxValue['saveXml'] = (id, dmnXml, actor, changeNote) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          // Snapshot trạng thái hiện tại trước khi tăng version
          snapshotCurrent(r, changeNote ?? 'Lưu phiên bản mới.')
          const newVersion = r.version + 1
          const note = changeNote ?? `Lưu DMN phiên bản v${newVersion}.`
          logAudit(id, 'SAVE_VERSION', newVersion, actor ?? r.nguoiCapNhat, note)
          return {
            ...r,
            dmnXml,
            version: newVersion,
            capNhat: TODAY,
            nguoiCapNhat: actor ?? r.nguoiCapNhat,
          }
        }),
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
      logAudit(newId, 'DUPLICATE', 1, actor, `Nhân bản từ "${src.ma}" (v${src.version}).`)
      return newId
    }

    const setStatus: RuleCtxValue['setStatus'] = (id, status, actor) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          const oldLabel = r.trangThai === 'active' ? 'active' : r.trangThai === 'draft' ? 'draft' : 'disabled'
          const newLabel = status === 'active' ? 'active' : status === 'draft' ? 'draft' : 'disabled'
          logAudit(id, 'SET_STATUS', r.version, actor ?? r.nguoiCapNhat, `Đổi trạng thái: ${oldLabel} → ${newLabel}.`)
          return { ...r, trangThai: status, capNhat: TODAY, nguoiCapNhat: actor ?? r.nguoiCapNhat }
        }),
      )
    }

    const remove: RuleCtxValue['remove'] = (id) => {
      const target = rules.find((r) => r.id === id)
      if (target) {
        logAudit(id, 'DELETE', target.version, target.nguoiCapNhat, `Xoá luật "${target.ma}".`)
      }
      setRules((prev) => prev.filter((r) => r.id !== id))
    }

    return { list: rules, get, create, update, saveXml, duplicate, setStatus, remove, getVersions, getAudit }
  }, [rules, versions, auditEntries])

  return <RuleCtx.Provider value={value}>{children}</RuleCtx.Provider>
}
