// EPIC06 — Approval Matrix: shared store (Slice G prereq của refactor,
// docs/research/approval-matrix-refactor-plan.md §4.G "cross-page runtime impact
// requires a shared context/store").
//
// Trước đây `ApprovalMatrix.tsx` giữ luật trong useState cục bộ → sửa luật KHÔNG
// lan sang màn hồ sơ. Store này là NGUỒN DUY NHẤT cho rules + delegations, mount ở
// main.tsx, để cả trang cấu hình `/ma-tran-phe-duyet` lẫn `DossierDetail` (runtime)
// đọc/sửa CHUNG một tập luật. Khi có backend, provider này gọi
// `GET/POST/PUT /approval-matrix/rules` thay cho seed tĩnh.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  APPROVAL_MATRIX,
  DELEGATIONS,
  SEED_APPROVAL_VERSIONS,
  SEED_APPROVAL_AUDIT,
  type ApprovalRule,
  type ApprovalRuleVersion,
  type ApprovalRuleAuditEntry,
  type ApprovalRuleAuditAction,
  type Delegation,
} from '../data/approvalMatrix'

const TODAY = '2026-07-09'

function makeAuditId() {
  return `ama-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
function makeVersionId() {
  return `amv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

interface ApprovalMatrixCtxValue {
  rules: ApprovalRule[]
  delegations: Delegation[]
  /** Thêm mới hoặc cập nhật (theo id) một luật. */
  upsertRule: (rule: ApprovalRule, actor?: string) => void
  removeRule: (id: string, actor?: string) => void
  toggleRule: (id: string, enabled: boolean, actor?: string) => void
  /** Lịch sử phiên bản của một luật. */
  getVersions: (ruleId: string) => ApprovalRuleVersion[]
  /** Nhật ký thay đổi của một luật. */
  getAudit: (ruleId: string) => ApprovalRuleAuditEntry[]
}

const Ctx = createContext<ApprovalMatrixCtxValue | null>(null)

export function useApprovalMatrix(): ApprovalMatrixCtxValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApprovalMatrix must be used within ApprovalMatrixProvider')
  return ctx
}

export function ApprovalMatrixProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<ApprovalRule[]>(APPROVAL_MATRIX)
  const [delegations] = useState<Delegation[]>(DELEGATIONS)
  const [versions, setVersions] = useState<ApprovalRuleVersion[]>(SEED_APPROVAL_VERSIONS)
  const [auditEntries, setAuditEntries] = useState<ApprovalRuleAuditEntry[]>(SEED_APPROVAL_AUDIT)

  const logAudit = (
    ruleId: string,
    action: ApprovalRuleAuditAction,
    version: number,
    actor: string,
    detail: string,
  ) => {
    setAuditEntries((prev) => [
      {
        id: makeAuditId(),
        ruleId,
        action,
        version,
        actor,
        timestamp: `${TODAY} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
        detail,
      },
      ...prev,
    ])
  }

  const value = useMemo<ApprovalMatrixCtxValue>(
    () => ({
      rules,
      delegations,

      getVersions: (ruleId) =>
        versions
          .filter((v) => v.ruleId === ruleId)
          .sort((a, b) => b.version - a.version),

      getAudit: (ruleId) =>
        auditEntries
          .filter((a) => a.ruleId === ruleId)
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),

      upsertRule: (rule, actor) => {
        setRules((prev) => {
          const exists = prev.some((r) => r.id === rule.id)
          if (exists) {
            // Snapshot bản cũ trước khi cập nhật
            const old = prev.find((r) => r.id === rule.id)!
            if (old.version && old.version > 0) {
              const snap: ApprovalRuleVersion = {
                id: makeVersionId(),
                ruleId: old.id,
                version: old.version,
                ten: old.ten,
                slot: old.slot,
                conditions: structuredClone(old.conditions),
                assignment: structuredClone(old.assignment),
                priority: old.priority,
                enabled: old.enabled,
                capNhat: TODAY,
                nguoiCapNhat: actor ?? 'Hệ thống',
                changeNote: `Cập nhật lên phiên bản v${rule.version ?? (old.version ?? 0) + 1}.`,
              }
              setVersions((pv) => [snap, ...pv])
            }
            logAudit(rule.id, 'UPDATE', rule.version ?? 1, actor ?? 'Hệ thống', `Cập nhật luật "${rule.ten}".`)
            return prev.map((r) => (r.id === rule.id ? rule : r))
          } else {
            logAudit(rule.id, 'CREATE', rule.version ?? 1, actor ?? 'Hệ thống', `Tạo luật "${rule.ten}".`)
            return [...prev, rule]
          }
        })
      },

      removeRule: (id, actor) => {
        const target = rules.find((r) => r.id === id)
        if (target) {
          logAudit(id, 'DELETE', target.version ?? 1, actor ?? 'Hệ thống', `Xoá luật "${target.ten}".`)
        }
        setRules((prev) => prev.filter((r) => r.id !== id))
      },

      toggleRule: (id, enabled, actor) => {
        setRules((prev) =>
          prev.map((r) => {
            if (r.id !== id) return r
            logAudit(id, 'TOGGLE', r.version ?? 1, actor ?? 'Hệ thống', `Chuyển trạng thái: ${enabled ? 'Bật' : 'Tắt'}.`)
            return { ...r, enabled }
          }),
        )
      },
    }),
    [rules, delegations, versions, auditEntries],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
