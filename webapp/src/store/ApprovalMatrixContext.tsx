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
  type ApprovalRule,
  type Delegation,
} from '../data/approvalMatrix'

interface ApprovalMatrixCtxValue {
  rules: ApprovalRule[]
  delegations: Delegation[]
  /** Thêm mới hoặc cập nhật (theo id) một luật. */
  upsertRule: (rule: ApprovalRule) => void
  removeRule: (id: string) => void
  toggleRule: (id: string, enabled: boolean) => void
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

  const value = useMemo<ApprovalMatrixCtxValue>(
    () => ({
      rules,
      delegations,
      upsertRule: (rule) =>
        setRules((prev) =>
          prev.some((r) => r.id === rule.id)
            ? prev.map((r) => (r.id === rule.id ? rule : r))
            : [...prev, rule],
        ),
      removeRule: (id) => setRules((prev) => prev.filter((r) => r.id !== id)),
      toggleRule: (id, enabled) =>
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r))),
    }),
    [rules, delegations],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
