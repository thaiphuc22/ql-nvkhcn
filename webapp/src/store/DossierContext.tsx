import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { seedHoSo, joinDossiers, stepsFromTaskSteps, type Dossier, type HoSo } from '../data/dossiers'
import type { TaskStep } from '../data/processes'
import { useNhiemVu } from './NhiemVuContext'

const NOW = '03/07/2026 10:00'
/** Hạn xử lý mặc định cho bước đầu tiên sau Gửi duyệt: NOW + 7 ngày. */
const HAN_XU_LY = '10/07/2026'

interface DossierCtxValue {
  /** Danh sách hồ sơ dạng view (đã join Nhiệm vụ KHCN). */
  list: Dossier[]
  getById: (id: string) => Dossier | undefined
  /** Thêm hồ sơ mới (vd hồ sơ Chủ trương sinh cùng NV). Mới nhất lên đầu. */
  createHoSo: (h: HoSo) => void
  /**
   * Gửi duyệt hồ sơ Khởi tạo (draft): gắn quy trình đã chọn, dựng các bước phê
   * duyệt từ taskSteps của quy trình → hồ sơ chuyển sang Đang xử lý.
   */
  submitHoSo: (id: string, quyTrinh: { ma: string; ten: string; taskSteps?: TaskStep[] }) => void
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

  const submitHoSo = (id: string, quyTrinh: { ma: string; ten: string; taskSteps?: TaskStep[] }) => {
    setHoSo((prev) =>
      prev.map((h) => {
        if (h.id !== id || h.trangThai !== 'draft') return h
        const buocMoi = stepsFromTaskSteps(quyTrinh.taskSteps ?? [], { hanXuLy: HAN_XU_LY })
        // Quy trình chưa cấu hình bước → giữ nguyên draft (UI đã lọc, đây là chốt chặn).
        if (!buocMoi.length) return h
        return {
          ...h,
          quyTrinh: quyTrinh.ma,
          quyTrinhTen: quyTrinh.ten,
          trangThai: 'processing' as const,
          buocHienTai: h.steps.length,
          steps: [...h.steps, ...buocMoi],
        }
      }),
    )
  }

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
    <DossierCtx.Provider value={{ list, getById, createHoSo, submitHoSo, approveStep, rejectStep }}>
      {children}
    </DossierCtx.Provider>
  )
}
