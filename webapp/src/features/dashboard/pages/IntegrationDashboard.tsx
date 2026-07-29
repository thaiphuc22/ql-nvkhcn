import { useCallback, useMemo } from 'react'
import { Button, Col, Row, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Bar, BarChart, Line, LineChart, Tooltip as RTooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import EntityTable from '../../../components/ui/EntityTable'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import type { IntegrationStatus } from '../models/integration-dashboard.models'
import { SUCCESS, DANGER, WARNING } from '../../../theme'

const svc = createDashboardService()
const STATUS_COLOR = { ACTIVE: 'green', DEGRADED: 'orange', ERROR: 'red', OFFLINE: 'default' } as const
const STATUS_LABEL = { ACTIVE: 'Hoạt động', DEGRADED: 'Suy giảm', ERROR: 'Lỗi', OFFLINE: 'Ngắt kết nối' }

export default function IntegrationDashboard() {
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getIntegrationHealth(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  const cols: ColumnsType<IntegrationStatus> = [
    { title: 'Hệ thống', dataIndex: 'systemName' },
    { title: 'Trạng thái', dataIndex: 'status', render: (v: IntegrationStatus['status']) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    { title: 'Đồng bộ gần nhất', dataIndex: 'lastSyncAt', width: 150 },
    { title: 'Độ trễ', dataIndex: 'latencyMs', width: 90, render: (v: number) => `${v} ms` },
    { title: 'Tổng', dataIndex: 'totalRecords', width: 80 },
    { title: 'OK', dataIndex: 'successCount', width: 80 },
    { title: 'Lỗi', dataIndex: 'errorCount', width: 70 },
    { title: 'Chưa map', dataIndex: 'unmappedCount', width: 90 },
    { title: 'Thao tác', key: 'act', width: 160, render: () => <><Button type="link" size="small">Xem log</Button><Button type="link" size="small">Thử lại</Button></> },
  ]

  return (
    <DashboardPageShell title="Chất lượng dữ liệu và tích hợp" breadcrumbLabel="Tích hợp dữ liệu"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => <Col xs={24} sm={12} lg={8} xl={6} key={k.id}><KpiCard metric={k} /></Col>)}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12} lg={6}><ChartCard title="Tỷ lệ thành công theo HT"><BarChart data={data.successBySystem}><XAxis dataKey="label" /><YAxis domain={[0, 100]} /><RTooltip formatter={(v: number) => `${v}%`} /><Bar dataKey="value" fill={SUCCESS} /></BarChart></ChartCard></Col>
            <Col xs={24} md={12} lg={6}><ChartCard title="Lỗi theo thời gian"><LineChart data={data.errorsOverTime}><XAxis dataKey="label" /><YAxis /><RTooltip /><Line dataKey="value" stroke={DANGER} /></LineChart></ChartCard></Col>
            <Col xs={24} md={12} lg={6}><ChartCard title="Lỗi theo loại DL"><BarChart data={data.errorsByType} layout="vertical"><YAxis type="category" dataKey="label" width={80} /><XAxis type="number" /><RTooltip /><Bar dataKey="value" fill={DANGER} /></BarChart></ChartCard></Col>
            <Col xs={24} md={12} lg={6}><ChartCard title="Tự động vs nhập tay"><PieChart><Pie data={[{ label: 'Tự động', value: data.autoVsManualPct.auto }, { label: 'Nhập tay', value: data.autoVsManualPct.manual }]} dataKey="value" nameKey="label" label>{[SUCCESS, WARNING].map((c, i) => <Cell key={i} fill={c} />)}</Pie><RTooltip /></PieChart></ChartCard></Col>
          </Row>
          <EntityTable rowKey="systemCode" columns={cols} dataSource={data.connectors} scroll={{ y: 'calc(100vh - 520px)' }} />
        </>
      )}
    </DashboardPageShell>
  )
}
