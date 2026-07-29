import { useCallback, useMemo } from 'react'
import { Col, Row } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip as RTooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import EntityTable from '../../../components/ui/EntityTable'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import type { AdoptionMetric } from '../models/integration-dashboard.models'
import { RED, SUCCESS } from '../../../theme'

const svc = createDashboardService()

export default function AdoptionDashboard() {
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getAdoptionAnalytics(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  const cols: ColumnsType<AdoptionMetric> = [
    { title: 'Đơn vị', dataIndex: 'organization' },
    { title: 'Số người dùng', dataIndex: 'userCount', width: 110 },
    { title: 'Hoạt động', dataIndex: 'activeUsers', width: 100 },
    { title: 'Số NV', dataIndex: 'missionCount', width: 80 },
    { title: 'Hồ sơ ĐT', dataIndex: 'electronicDossiers', width: 100 },
    { title: 'Tỷ lệ SD', dataIndex: 'usagePct', width: 90, render: (v: number) => `${v}%` },
    { title: 'Truy cập gần nhất', dataIndex: 'lastAccessAt', width: 150 },
  ]

  return (
    <DashboardPageShell title="Mức độ sử dụng hệ thống" breadcrumbLabel="Mức độ sử dụng"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => <Col xs={24} sm={12} lg={8} xl={6} key={k.id}><KpiCard metric={k} /></Col>)}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12} lg={8}><ChartCard title="Người dùng hoạt động theo tháng"><LineChart data={data.usersByMonth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><RTooltip /><Line dataKey="value" stroke={RED} /></LineChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="SD theo đơn vị"><BarChart data={data.byOrg}><XAxis dataKey="label" tick={{ fontSize: 9 }} /><YAxis domain={[0, 100]} /><RTooltip formatter={(v: number) => `${v}%`} /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="SD theo vai trò"><PieChart><Pie data={data.byRole} dataKey="value" nameKey="label" label /><RTooltip /></PieChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="SD theo quy trình"><BarChart data={data.byProcess}><XAxis dataKey="label" /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="Tỷ lệ biểu mẫu ĐT"><PieChart><Pie data={data.eformRate} dataKey="value" nameKey="label" label>{[SUCCESS, '#ccc'].map((c, i) => <Cell key={i} fill={c} />)}</Pie><RTooltip /></PieChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="DL tự động/nhập tay"><PieChart><Pie data={data.autoRate} dataKey="value" nameKey="label" label>{[SUCCESS, '#ccc'].map((c, i) => <Cell key={i} fill={c} />)}</Pie><RTooltip /></PieChart></ChartCard></Col>
          </Row>
          <EntityTable rowKey="organization" columns={cols} dataSource={data.rows} scroll={{ y: 'calc(100vh - 520px)' }} />
        </>
      )}
    </DashboardPageShell>
  )
}
