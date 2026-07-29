import { Button, Empty, Result, Skeleton } from 'antd'
import type { ReactNode } from 'react'

export function DashboardLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #f0f0f0' }}>
      <Skeleton active paragraph={{ rows }} />
    </div>
  )
}

export function DashboardEmpty() {
  return <Empty description="Không có dữ liệu phù hợp với điều kiện tìm kiếm." />
}

export function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <Result
      status="error"
      title="Không thể tải dữ liệu dashboard"
      subTitle="Vui lòng thử lại."
      extra={<Button type="primary" onClick={onRetry}>Thử lại</Button>}
    />
  )
}

function hasRenderableChildren(children: ReactNode): boolean {
  return children !== null && children !== false && children !== undefined
}

/** Không đổi wrapper giữa các state để tránh remount chart. */
export function DashboardGate({ loading, error, empty, onRetry, children }: {
  loading: boolean
  error: boolean
  empty: boolean
  onRetry: () => void
  children: ReactNode
}) {
  const ready = hasRenderableChildren(children)

  if (error && !ready) return <DashboardError onRetry={onRetry} />
  if (!ready && loading) return <DashboardLoading />
  if (empty) return <DashboardEmpty />
  if (!ready) return <DashboardLoading />

  return (
    <div style={{ opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s ease' }}>
      {children}
    </div>
  )
}
