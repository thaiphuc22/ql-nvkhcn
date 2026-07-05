import type { CSSProperties, ReactNode } from 'react'
import { Input, Select, Space } from 'antd'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FilterSelectConfig {
  key: string
  placeholder?: string
  value?: any
  onChange: (value: any) => void
  options: { value: string | number; label: ReactNode }[]
  width?: number
  allowClear?: boolean
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface FilterBarProps {
  /** Ô tìm kiếm (Input.Search). */
  search?: { placeholder?: string; value?: string; onChange: (value: string) => void; width?: number }
  /** Các bộ lọc dạng Select. */
  selects?: FilterSelectConfig[]
  /** Slot bên trái (vd: Segmented). */
  left?: ReactNode
  /** Slot bên phải (vd: dòng đếm kết quả). */
  right?: ReactNode
  justify?: CSSProperties['justifyContent']
  style?: CSSProperties
}

/**
 * Thanh lọc chuẩn: [left] + tìm kiếm + các Select + [right], bọc trong Space wrap.
 * Dùng ở mọi trang danh sách (Danh mục quy trình, Hồ sơ...).
 */
export default function FilterBar({ search, selects, left, right, justify, style }: FilterBarProps) {
  return (
    <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: justify, ...style }}>
      {left}
      {search && (
        <Input.Search
          placeholder={search.placeholder}
          allowClear
          style={{ width: search.width ?? 300 }}
          onChange={(e) => search.onChange(e.target.value)}
        />
      )}
      {selects?.map((s) => (
        <Select
          key={s.key}
          placeholder={s.placeholder}
          allowClear={s.allowClear ?? true}
          value={s.value}
          onChange={s.onChange}
          options={s.options}
          style={{ width: s.width ?? 180 }}
        />
      ))}
      {right}
    </Space>
  )
}
