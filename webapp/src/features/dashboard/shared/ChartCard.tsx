import type { ReactNode } from 'react'
import { Card, Tooltip, Typography } from 'antd'
import { ResponsiveContainer } from 'recharts'

const { Text } = Typography

export interface ChartCardProps {
  title: string
  subtitle?: string
  tooltip?: string
  height?: number
  children: ReactNode
  extra?: ReactNode
}

/**
 * Absolute fill giúp ResponsiveContainer luôn đo được width/height
 * (tránh chart trắng khi nằm trong Ant Design Col/flex).
 */
export default function ChartCard({ title, subtitle, tooltip, height = 280, children, extra }: ChartCardProps) {
  return (
    <Card
      size="small"
      title={tooltip ? <Tooltip title={tooltip}>{title}</Tooltip> : title}
      extra={extra}
      styles={{ body: { paddingBottom: 8 } }}
    >
      {subtitle && <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{subtitle}</Text>}
      <div style={{ width: '100%', height, position: 'relative', minWidth: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
