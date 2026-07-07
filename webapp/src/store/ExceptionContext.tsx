import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  seedExceptionRequests,
  type ExceptionRequest,
  type ExceptionType,
} from '../data/exceptions'
import { EXCEPTION_POLICIES, resolveExceptionPolicy } from '../data/exceptionPolicy'
import { useDossiers } from './DossierContext'

const NOW = '07/07/2026 10:00'

interface ExceptionCtxValue {
  list: ExceptionRequest[]
  /** Yêu cầu ngoại lệ đang chờ duyệt cho một hồ sơ (nếu có). */
  pendingFor: (hoSoId: string) => ExceptionRequest | undefined
  /** Yêu cầu đang "mở" (pending HOẶC approved-chờ-áp-dụng) — chặn xin yêu cầu mới. */
  activeFor: (hoSoId: string) => ExceptionRequest | undefined
  /** Toàn bộ yêu cầu ngoại lệ (mọi trạng thái) của một hồ sơ — hiển thị trên timeline. */
  forDossier: (hoSoId: string) => ExceptionRequest[]
  requestException: (input: {
    hoSoId: string
    exceptionType: ExceptionType
    fromStepIndex: number
    toStepIndex: number
    reason: string
    evidence?: string
    requestedBy: string
  }) => void
  /** Duyệt ngoại lệ (APPROVE_EXCEPTION): chuyển sang `approved` — CHƯA đổi luồng hồ sơ. */
  approveException: (id: string, actor: string, note?: string) => void
  /** Từ chối ngoại lệ. */
  rejectException: (id: string, actor: string, note: string) => void
  /** Áp dụng ngoại lệ đã duyệt (APPLY_EXCEPTION): `approved` → `applied` + nhảy bước thật. */
  applyException: (id: string, actor: string) => void
}

const ExceptionCtx = createContext<ExceptionCtxValue | null>(null)

export function useExceptions(): ExceptionCtxValue {
  const ctx = useContext(ExceptionCtx)
  if (!ctx) throw new Error('useExceptions must be used within ExceptionProvider')
  return ctx
}

/**
 * Vòng đời Exception Approval Workflow (controlled-exception-handling.md):
 * Request → Review (approverRoleCodes) → Approve/Reject → Apply.
 * "Apply" gọi sang DossierContext để thực sự bỏ qua/chuyển bước — tách bạch
 * quyết định ngoại lệ (ở đây) khỏi việc thay đổi luồng hồ sơ (DossierContext).
 */
export function ExceptionProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ExceptionRequest[]>(seedExceptionRequests)
  const { list: dossiers, applyExceptionSkip } = useDossiers()

  const forDossier = (hoSoId: string) => requests.filter((r) => r.hoSoId === hoSoId)
  const pendingFor = (hoSoId: string) =>
    requests.find((r) => r.hoSoId === hoSoId && r.status === 'pending')
  const activeFor = (hoSoId: string) =>
    requests.find(
      (r) => r.hoSoId === hoSoId && (r.status === 'pending' || r.status === 'approved'),
    )

  const requestException: ExceptionCtxValue['requestException'] = (input) => {
    const dossier = dossiers.find((d) => d.id === input.hoSoId)
    if (!dossier) return
    // Exception Policy Engine quyết định ai được duyệt (snapshot vào request).
    const policy = resolveExceptionPolicy(EXCEPTION_POLICIES, {
      exceptionType: input.exceptionType,
      cap: dossier.cap,
    })
    if (!policy) return // policy không cho phép loại này ở cấp hiện tại — fail-closed
    const approverRoleCodes = policy.requiredApproverRoleCodes
    const req: ExceptionRequest = {
      id: `EXC-${Date.now()}`,
      hoSoId: input.hoSoId,
      exceptionType: input.exceptionType,
      fromStepIndex: input.fromStepIndex,
      toStepIndex: input.toStepIndex,
      reason: input.reason,
      evidence: input.evidence,
      requestedBy: input.requestedBy,
      requestedAt: NOW,
      status: 'pending',
      approverRoleCodes,
    }
    setRequests((prev) => [req, ...prev])
  }

  // APPROVE: chỉ ra quyết định "cho phép" — CHƯA đụng vào luồng hồ sơ. Việc thay đổi
  // luồng (nhảy bước) tách sang applyException để không ai vừa duyệt vừa tự áp dụng.
  const approveException: ExceptionCtxValue['approveException'] = (id, actor, note) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id && r.status === 'pending'
          ? { ...r, status: 'approved' as const, decidedBy: actor, decidedAt: NOW, decisionNote: note }
          : r,
      ),
    )
  }

  const rejectException: ExceptionCtxValue['rejectException'] = (id, actor, note) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id && r.status === 'pending'
          ? { ...r, status: 'rejected' as const, decidedBy: actor, decidedAt: NOW, decisionNote: note }
          : r,
      ),
    )
  }

  // APPLY: thực thi ngoại lệ ĐÃ duyệt vào luồng (Dynamic Routing) — chỉ chạy khi đã `approved`.
  const applyException: ExceptionCtxValue['applyException'] = (id, actor) => {
    const req = requests.find((r) => r.id === id)
    if (!req || req.status !== 'approved') return
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'applied' as const } : r)),
    )
    applyExceptionSkip(
      req.hoSoId,
      req.fromStepIndex,
      req.toStepIndex,
      `[Ngoại lệ] ${req.decisionNote ?? ''} — duyệt bởi ${req.decidedBy ?? '—'}, áp dụng bởi ${actor}`.trim(),
      actor,
    )
  }

  return (
    <ExceptionCtx.Provider
      value={{
        list: requests,
        pendingFor,
        activeFor,
        forDossier,
        requestException,
        approveException,
        rejectException,
        applyException,
      }}
    >
      {children}
    </ExceptionCtx.Provider>
  )
}
