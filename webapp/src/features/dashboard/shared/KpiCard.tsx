import type { ReactNode } from 'react'
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons'
import { Card, Space, Statistic, Tooltip } from 'antd'
import type { KpiMetric } from '../models/dashboard.models'
import { DANGER, SUCCESS, WARNING } from '../../../theme'

const STATUS_COLOR: Record<string, string> = {
  success: SUCCESS,
  warning: WARNING,
  danger: DANGER,
  neutral: undefined as unknown as string,
}

export interface KpiCardProps {
  metric: KpiMetric
  icon?: ReactNode
  onClick?: () => void
}

export default function KpiCard({ metric, icon, onClick }: KpiCardProps) {
  const color = metric.status ? STATUS_COLOR[metric.status] : undefined
  const trendIcon =
    metric.trend === 'up' ? <ArrowUpOutlined /> :
    metric.trend === 'down' ? <ArrowDownOutlined /> :
    <MinusOutlined />

  const value = metric.unit === 'đ'
    ? new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(metric.value)
    : metric.value

  const card = (
    <Card size="small" hoverable={!!onClick} onClick={onClick} style={{ borderLeft: color ? `3px solid ${color}` : undefined }}>
      <Space align="start">
        {icon}
        <Statistic
          title={metric.tooltip ? <Tooltip title={metric.tooltip}>{metric.title}</Tooltip> : metric.title}
          value={value}
          suffix={metric.unit && metric.unit !== 'đ' ? metric.unit : undefined}
          valueStyle={{ color, fontSize: 28 }}
        />
      </Space>
      {metric.changePercent !== undefined && (
        <div style={{ marginTop: 8, fontSize: 12, color: metric.trend === 'up' ? SUCCESS : metric.trend === 'down' ? DANGER : undefined }}>
          {trendIcon} {Math.abs(metric.changePercent)}% so với kỳ trước
        </div>
      )}
    </Card>
  )
  return card
}
