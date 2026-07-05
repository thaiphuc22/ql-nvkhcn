import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { seedHoSo, joinDossiers, type Dossier, type HoSo } from '../data/dossiers'
import { useNhiemVu } from './NhiemVuContext'

const NOW = '03/07/2026 10:00'

interface DossierCtxValue {
  /** Danh sách hồ sơ dạng view (đã join Nhiệm vụ KHCN). */
  list: Dossier[]
  getById: (id: string) => Dossier | undefined
  /** Thêm hồ sơ mới (vd hồ sơ Chủ trương sinh cùng NV). Mới nhất lên đầu. */
  createHoSo: (h: HoSo) => void
  approveStep: (id: string, actor: string, yKien?: string) => void
  rejectStep: (id: string, reason: string, actor: string) => void
}

const DossierCtx = createContext<DossierCtxValue | null>(null)

export function useDossiers(): DossierCtxValue {
  const ctx = useContext(DossierCtx)
  if (!ctx) throw new Error('useDossiers must be used within DossierProvider')
  return ctx
}

export function DossierProvider({ children }: { children: ReactNode }) {
  // Lưu trữ chuẩn hoá: chỉ giữ HoSo. NhiemVu (master) lấy từ NhiemVuContext để
  // hồ sơ của NV vừa tạo cũng join được (không kẹt ở seed tĩnh).
  const [hoso, setHoSo] = useState<HoSo[]>(seedHoSo)
  const { getByMa } = useNhiemVu()

  // View join dùng cho UI.
  const list = useMemo(() => joinDossiers(hoso, getByMa), [hoso, getByMa])
  const getById = (id: string) => list.find((d) => d.id === id)

  const createHoSo = (h: HoSo) => setHoSo((prev) => [h, ...prev])

  const approveStep = (id: string, actor: string, yKien?: string) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (h.id !== id || h.trangThai !== 'processing') return h
        const idx = h.buocHienTai
        const steps = h.steps.map((s, i) =>
          i === idx
            ? { ...s, trangThai: 'done' as const, thoiDiem: NOW, nguoi: s.nguoi || actor, yKien: yKien ?? s.yKien }
            : s,
        )
        const nextIdx = idx + 1
        if (nextIdx < steps.length) {
          steps[nextIdx] = { ...steps[nextIdx], trangThai: 'current' }
          return { ...h, steps, buocHienTai: nextIdx }
        }
        return { ...h, steps, trangThai: 'approved' as const }
      }),
    )
  }

  const rejectStep = (id: string, reason: string, actor: string) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (h.id !== id || h.trangThai !== 'processing') return h
        const idx = h.buocHienTai
        const steps = h.steps.map((s, i) =>
          i === idx
            ? { ...s, trangThai: 'rejected' as const, thoiDiem: NOW, nguoi: s.nguoi || actor, yKien: reason }
            : s,
        )
        return { ...h, steps, trangThai: 'rejected' as const }
      }),
    )
  }

  return (
    <DossierCtx.Provider value={{ list, getById, createHoSo, approveStep, rejectStep }}>
      {children}
    </DossierCtx.Provider>
  )
}
