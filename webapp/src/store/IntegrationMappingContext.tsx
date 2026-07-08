import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  seedMappingConfigs,
  validateMappingConfig,
  type FieldMapping,
  type MappingConfig,
  type MappingStatus,
} from '../data/integrationMapping'

const TODAY = '2026-07-08'

function nowStamp(): string {
  return `${TODAY} ${new Date().toTimeString().slice(0, 5)}`
}

export interface CreateMappingInput {
  he: string
  doiTuong: MappingConfig['doiTuong']
  chieu: MappingConfig['chieu']
  actor: string
}

interface IntegrationMappingCtxValue {
  list: MappingConfig[]
  get: (id: string) => MappingConfig | undefined
  listForSystem: (he: string) => MappingConfig[]
  create: (input: CreateMappingInput) => string
  /** Ghi đè toàn bộ field mapping (từ trình soạn lưới) — luôn hạ về draft, tăng version. */
  saveFields: (id: string, fields: FieldMapping[], actor: string) => void
  /**
   * Đổi trạng thái. Chuyển sang 'active' chạy qua validateMappingConfig trước (fail-closed):
   * nếu không hợp lệ, chặn — chuyển sang 'error' thay vì 'active' và trả về lỗi cho UI hiển thị.
   */
  setStatus: (id: string, status: MappingStatus, actor: string) => { ok: boolean; errors: string[] }
  remove: (id: string) => void
}

const IntegrationMappingCtx = createContext<IntegrationMappingCtxValue | null>(null)

export function useIntegrationMapping(): IntegrationMappingCtxValue {
  const ctx = useContext(IntegrationMappingCtx)
  if (!ctx) throw new Error('useIntegrationMapping must be used within IntegrationMappingProvider')
  return ctx
}

export function IntegrationMappingProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<MappingConfig[]>(seedMappingConfigs)

  const value = useMemo<IntegrationMappingCtxValue>(() => {
    const get = (id: string) => configs.find((c) => c.id === id)
    const listForSystem = (he: string) => configs.filter((c) => c.he === he)

    const create: IntegrationMappingCtxValue['create'] = (input) => {
      const id = `map-${input.he.toLowerCase()}-${Date.now()}`
      const config: MappingConfig = {
        id,
        he: input.he,
        doiTuong: input.doiTuong,
        chieu: input.chieu,
        trangThai: 'draft',
        version: 1,
        capNhatLuc: nowStamp(),
        capNhatBoi: input.actor,
        fields: [],
      }
      setConfigs((prev) => [config, ...prev])
      return id
    }

    const saveFields: IntegrationMappingCtxValue['saveFields'] = (id, fields, actor) => {
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                fields,
                trangThai: 'draft',
                version: c.version + 1,
                capNhatLuc: nowStamp(),
                capNhatBoi: actor,
              }
            : c,
        ),
      )
    }

    const setStatus: IntegrationMappingCtxValue['setStatus'] = (id, status, actor) => {
      const current = configs.find((c) => c.id === id)
      if (!current) return { ok: false, errors: ['Không tìm thấy cấu hình mapping.'] }

      if (status === 'active') {
        const { valid, errors } = validateMappingConfig(current)
        if (!valid) {
          setConfigs((prev) =>
            prev.map((c) => (c.id === id ? { ...c, trangThai: 'error', capNhatLuc: nowStamp(), capNhatBoi: actor } : c)),
          )
          return { ok: false, errors }
        }
      }

      setConfigs((prev) =>
        prev.map((c) => (c.id === id ? { ...c, trangThai: status, capNhatLuc: nowStamp(), capNhatBoi: actor } : c)),
      )
      return { ok: true, errors: [] }
    }

    const remove: IntegrationMappingCtxValue['remove'] = (id) => {
      setConfigs((prev) => prev.filter((c) => c.id !== id))
    }

    return { list: configs, get, listForSystem, create, saveFields, setStatus, remove }
  }, [configs])

  return <IntegrationMappingCtx.Provider value={value}>{children}</IntegrationMappingCtx.Provider>
}
