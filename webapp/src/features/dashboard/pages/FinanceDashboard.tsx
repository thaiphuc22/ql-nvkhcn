import { useCallback, useMemo } from 'react'
import { Col, Row, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip as RTooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import EntityTable from '../../../components/ui/EntityTable'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import { formatVnd } from '../shared/formatters'
import type { FinanceMetric } from '../models/integration-dashboard.models'
import { RED } from '../../../theme'

const svc = createDashboardService()

export default function FinanceDashboard() {
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getFinanceAnalytics(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  const cols: ColumnsType<FinanceMetric> = [
    { title: 'Mã NV', dataIndex: 'missionCode', width: 110 },
    { title: 'Tên NV', dataIndex: 'missionName', ellipsis: true },
    { title: 'Dự toán', dataIndex: 'approvedBudget', render: formatVnd, width: 130 },
    { title: 'Cam kết', dataIndex: 'committed', render: formatVnd, width: 130 },
    { title: 'Đã chi', dataIndex: 'spent', render: formatVnd, width: 130 },
    { title: 'Còn lại', dataIndex: 'remaining', render: formatVnd, width: 130 },
    { title: 'Giải ngân %', dataIndex: 'disbursementPct', width: 100, render: (v: number) => `${v}%` },
    { title: 'Chênh KH', dataIndex: 'planDelta', width: 90, render: (v: number) => `${v > 0 ? '+' : ''}${v}%` },
    { title: 'Cảnh báo', dataIndex: 'warning', width: 120, render: (v?: string) => v ? <Tag color="orange">{v}</Tag> : '—' },
  ]

  return (
    <DashboardPageShell title="Kinh phí và giải ngân" breadcrumbLabel="Kinh phí"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => <Col xs={24} sm={12} lg={8} xl={6} key={k.id}><KpiCard metric={{ ...k, value: k.unit === 'đ' ? k.value : k.value }} /></Col>)}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={12}><ChartCard title="Kế hoạch vs thực tế giải ngân theo tháng" height={280}><LineChart data={data.monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis tickFormatter={(v) => `${((v as number) / 1e9).toFixed(1)}B`} /><RTooltip formatter={(v: number) => formatVnd(v)} /><Legend /><Line dataKey="plan" name="Kế hoạch" stroke="#999" /><Line dataKey="actual" name="Thực tế" stroke={RED} /></LineChart></ChartCard></Col>
            <Col xs={24} lg={6}><ChartCard title="Cơ cấu nguồn KP"><PieChart><Pie data={data.bySource} dataKey="value" nameKey="label" label>{data.bySource.map((_, i) => <Cell key={i} fill={['#ee0033', '#006e0d', '#1890ff', '#daa520'][i]} />)}</Pie><RTooltip /></PieChart></ChartCard></Col>
            <Col xs={24} lg={6}><ChartCard title="KP theo đơn vị"><BarChart data={data.byOrg} layout="vertical"><XAxis type="number" tickFormatter={(v) => `${((v as number) / 1e9).toFixed(1)}B`} /><YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 9 }} /><RTooltip formatter={(v: number) => formatVnd(v)} /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
          </Row>
          <EntityTable rowKey="missionCode" columns={cols} dataSource={data.rows} scroll={{ y: 'calc(100vh - 520px)' }} />
        </>
      )}
    </DashboardPageShell>
  )
}
