import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { nextNhiemVuMa, seedNhiemVu, type NhiemVu } from '../data/nhiemVu'

/** Dữ liệu khởi tạo NV mới — mã + giai đoạn do store tự đặt. */
export type NhiemVuInput = Omit<NhiemVu, 'ma' | 'giaiDoan'>

interface NhiemVuCtxValue {
  /** Toàn bộ Nhiệm vụ KHCN (master). */
  list: NhiemVu[]
  getByMa: (ma: string) => NhiemVu | undefined
  /** Tạo NV mới (giai đoạn = chủ trương). Trả về NV đã có Mã NV để nối hồ sơ. */
  create: (input: NhiemVuInput) => NhiemVu
}

const NhiemVuCtx = createContext<NhiemVuCtxValue | null>(null)

export function useNhiemVu(): NhiemVuCtxValue {
  const ctx = useContext(NhiemVuCtx)
  if (!ctx) throw new Error('useNhiemVu must be used within NhiemVuProvider')
  return ctx
}

export function NhiemVuProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<NhiemVu[]>(seedNhiemVu)

  const getByMa = useMemo(() => {
    const m = new Map(list.map((n) => [n.ma, n]))
    return (ma: string) => m.get(ma)
  }, [list])

  const create = (input: NhiemVuInput): NhiemVu => {
    const { ma } = nextNhiemVuMa(list)
    const nv: NhiemVu = { ...input, ma, giaiDoan: 'chu_truong' }
    setList((prev) => [nv, ...prev])
    return nv
  }

  return <NhiemVuCtx.Provider value={{ list, getByMa, create }}>{children}</NhiemVuCtx.Provider>
}
