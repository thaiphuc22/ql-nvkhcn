import type { CSSProperties, ReactNode } from 'react'
import { Card, Statistic } from 'antd'

export interface StatCardProps {
  title: ReactNode
  value: ReactNode
  suffix?: ReactNode
  /** Màu số liệu (shortcut cho valueStyle.color). */
  color?: string
  valueStyle?: CSSProperties
  size?: 'default' | 'small'
}

/** Thẻ KPI chuẩn (Card + Statistic). Dùng ở mọi trang có dải chỉ số. */
export default function StatCard({ title, value, suffix, color, valueStyle, size = 'default' }: StatCardProps) {
  return (
    <Card size={size}>
      <Statistic title={title} value={value as string | number} suffix={suffix} valueStyle={{ color, ...valueStyle }} />
    </Card>
  )
}
