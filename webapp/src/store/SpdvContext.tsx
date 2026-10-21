import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  nextSpdvId,
  seedKyCapNhatSpdv,
  seedSpdvCatalog,
  type KyCapNhatSpdv,
  type SpdvItem,
} from '../data/rd07Spdv'

export type SpdvCreateInput = Omit<SpdvItem, 'id' | 'updatedAt' | 'history' | 'trangThai'> & {
  trangThai?: SpdvItem['trangThai']
  historyAction?: string
}

interface SpdvCtxValue {
  list: SpdvItem[]
  ky: KyCapNhatSpdv
  setKy: React.Dispatch<React.SetStateAction<KyCapNhatSpdv>>
  setList: React.Dispatch<React.SetStateAction<SpdvItem[]>>
  create: (input: SpdvCreateInput) => SpdvItem
  update: (id: string, patch: Partial<SpdvItem>) => void
}

const SpdvCtx = createContext<SpdvCtxValue | null>(null)

export function useSpdv(): SpdvCtxValue {
  const ctx = useContext(SpdvCtx)
  if (!ctx) throw new Error('useSpdv must be used within SpdvProvider')
  return ctx
}

export function SpdvProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<SpdvItem[]>(seedSpdvCatalog)
  const [ky, setKy] = useState(seedKyCapNhatSpdv)

  const create = (input: SpdvCreateInput): SpdvItem => {
    const { historyAction, trangThai, ...rest } = input
    const item: SpdvItem = {
      ...rest,
      id: nextSpdvId(list),
      trangThai: trangThai ?? 'draft_dau_nam',
      updatedAt: new Date().toLocaleDateString('vi-VN'),
      history: [
        {
          at: new Date().toLocaleString('vi-VN'),
          actor: 'QLDM SPDV',
          action: historyAction ?? 'Thêm mới SPDV',
          buoc: 1,
        },
      ],
    }
    setList((prev) => [item, ...prev])
    return item
  }

  const update = (id: string, patch: Partial<SpdvItem>) => {
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  return (
    <SpdvCtx.Provider value={{ list, ky, setKy, setList, create, update }}>
      {children}
    </SpdvCtx.Provider>
  )
}
