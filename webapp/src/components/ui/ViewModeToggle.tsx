import { useCallback, useState, type ReactNode } from 'react'
import { Segmented, Tooltip } from 'antd'
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'

export type CatalogViewMode = 'grid' | 'list' | 'map'

const OPTIONS: { value: CatalogViewMode; icon: ReactNode; tip: string }[] = [
  { value: 'grid', icon: <AppstoreOutlined />, tip: 'Chế độ thẻ (Grid)' },
  { value: 'list', icon: <UnorderedListOutlined />, tip: 'Chế độ danh sách (List)' },
  { value: 'map', icon: <ApartmentOutlined />, tip: 'Sơ đồ tiến trình (Process Map)' },
]

function loadMode(key: string, fallback: CatalogViewMode): CatalogViewMode {
  try {
    const raw = localStorage.getItem(key)
    if (raw === 'grid' || raw === 'list' || raw === 'map') return raw
  } catch {
    /* ignore */
  }
  return fallback
}

/** Persist view mode per màn hình (localStorage). */
export function useCatalogViewMode(
  storageKey: string,
  defaultMode: CatalogViewMode = 'grid',
): [CatalogViewMode, (mode: CatalogViewMode) => void] {
  const [mode, setModeState] = useState<CatalogViewMode>(() =>
    loadMode(storageKey, defaultMode),
  )

  const setMode = useCallback(
    (next: CatalogViewMode) => {
      setModeState(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  )

  return [mode, setMode]
}

export interface ViewModeToggleProps {
  value: CatalogViewMode
  onChange: (mode: CatalogViewMode) => void
  /** Ẩn chế độ map (vd. màn chỉ cần Grid/List). */
  hideMap?: boolean
}

/**
 * Toggle View: Grid · List · Process Map — đặt ở FilterBar.right.
 */
export default function ViewModeToggle({ value, onChange, hideMap }: ViewModeToggleProps) {
  const opts = (hideMap ? OPTIONS.filter((o) => o.value !== 'map') : OPTIONS).map((o) => ({
    value: o.value,
    label: (
      <Tooltip title={o.tip}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingInline: 2 }}>
          {o.icon}
        </span>
      </Tooltip>
    ),
  }))

  return (
    <Segmented
      size="middle"
      value={value}
      onChange={(v) => onChange(v as CatalogViewMode)}
      options={opts}
      aria-label="Chế độ xem"
    />
  )
}
