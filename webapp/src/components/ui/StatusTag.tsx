import type { ReactNode } from 'react'
import { Tag } from 'antd'
import { STATUS_META, type ProcessStatus } from '../../data/processes'
import { DOSSIER_STATUS, type DossierStatus } from '../../data/dossiers'

/** Tag trạng thái chung — nhận màu + nhãn. */
export function StatusTag({ color, label }: { color: string; label: ReactNode }) {
  return <Tag color={color}>{label}</Tag>
}

/** Trạng thái quy trình (active/draft/stopped/planned) — nguồn: STATUS_META. */
export function ProcessStatusTag({ status }: { status: ProcessStatus }) {
  const m = STATUS_META[status]
  return <StatusTag color={m.color} label={m.label} />
}

/** Trạng thái hồ sơ (processing/approved/rejected) — nguồn: DOSSIER_STATUS. */
export function DossierStatusTag({ status }: { status: DossierStatus }) {
  const m = DOSSIER_STATUS[status]
  return <StatusTag color={m.color} label={m.label} />
}
