import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  seedProcesses,
  curVer,
  bumpVersion,
  type ProcessDef,
  type ProcessStatus,
} from '../data/processes'

interface ProcessCtxValue {
  list: ProcessDef[]
  getByMa: (ma: string) => ProcessDef | undefined
  addProcess: (p: ProcessDef) => boolean
  updateProcess: (ma: string, patch: Partial<ProcessDef>) => void
  toggleStatus: (ma: string) => ProcessStatus
  deployVersion: (ma: string, note: string) => string
  setStepForm: (ma: string, stepKey: string, formKey: string | undefined) => void
}

const ProcessCtx = createContext<ProcessCtxValue | null>(null)

export function useProcesses(): ProcessCtxValue {
  const ctx = useContext(ProcessCtx)
  if (!ctx) throw new Error('useProcesses must be used within ProcessProvider')
  return ctx
}

export function ProcessProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<ProcessDef[]>(seedProcesses)

  const getByMa = (ma: string) => list.find((p) => p.ma === ma)

  const addProcess = (p: ProcessDef): boolean => {
    if (list.some((x) => x.ma.toLowerCase() === p.ma.toLowerCase())) return false
    setList((prev) => [p, ...prev])
    return true
  }

  const updateProcess = (ma: string, patch: Partial<ProcessDef>) => {
    setList((prev) =>
      prev.map((p) => (p.ma === ma ? { ...p, ...patch, capNhat: '2026-07-03' } : p)),
    )
  }

  const toggleStatus = (ma: string): ProcessStatus => {
    const p = list.find((x) => x.ma === ma)
    const next: ProcessStatus = p && p.trangThai === 'active' ? 'stopped' : 'active'
    setList((prev) =>
      prev.map((x) =>
        x.ma === ma
          ? { ...x, trangThai: next, instances: next === 'stopped' ? 0 : x.instances }
          : x,
      ),
    )
    return next
  }

  const deployVersion = (ma: string, note: string): string => {
    const p = list.find((x) => x.ma === ma)
    const next = p ? bumpVersion(curVer(p)) : '1.0'
    setList((prev) =>
      prev.map((x) =>
        x.ma === ma
          ? {
              ...x,
              trangThai: 'active',
              capNhat: '2026-07-03',
              versions: [
                ...x.versions,
                { v: next, date: '2026-07-03', note: note || 'Cập nhật quy trình' },
              ],
            }
          : x,
      ),
    )
    return next
  }

  const setStepForm = (ma: string, stepKey: string, formKey: string | undefined) => {
    setList((prev) =>
      prev.map((p) =>
        p.ma === ma
          ? {
              ...p,
              taskSteps: p.taskSteps?.map((ts) =>
                ts.key === stepKey ? { ...ts, formKey: formKey || undefined } : ts,
              ),
            }
          : p,
      ),
    )
  }

  return (
    <ProcessCtx.Provider
      value={{ list, getByMa, addProcess, updateProcess, toggleStatus, deployVersion, setStepForm }}
    >
      {children}
    </ProcessCtx.Provider>
  )
}
