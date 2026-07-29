import { useCallback, useMemo } from 'react'
import { Col, Row, Card, Table } from 'antd'
import { Bar, BarChart, CartesianGrid, Tooltip as RTooltip, XAxis, YAxis, Line, LineChart } from 'recharts'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import AlertTable from '../shared/AlertTable'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import { RED } from '../../../theme'

const svc = createDashboardService()

export default function RiskDashboard() {
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getRiskAlerts(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  return (
    <DashboardPageShell title="Rủi ro và cảnh báo" breadcrumbLabel="Rủi ro và cảnh báo"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => <Col xs={24} sm={12} lg={8} xl={4} key={k.id}><KpiCard metric={k} /></Col>)}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={8}>
              <Card size="small" title="Ma trận xác suất × ảnh hưởng">
                <Table size="small" pagination={false} dataSource={data.matrix.map((m, i) => ({ key: i, ...m }))}
                  columns={[{ title: 'Xác suất', dataIndex: 'prob' }, { title: 'Ảnh hưởng', dataIndex: 'impact' }, { title: 'Số', dataIndex: 'count' }]} />
              </Card>
            </Col>
            <Col xs={24} lg={8}><ChartCard title="Cảnh báo theo nhóm"><BarChart data={data.byGroup} layout="vertical"><YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 9 }} /><XAxis type="number" /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            <Col xs={24} lg={8}><ChartCard title="Xu hướng cảnh báo"><LineChart data={data.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><RTooltip /><Line dataKey="value" stroke={RED} /></LineChart></ChartCard></Col>
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}><ChartCard title="Theo đơn vị" height={220}><BarChart data={data.byOrg}><XAxis dataKey="label" tick={{ fontSize: 9 }} /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            <Col xs={24} md={12}><ChartCard title="Theo quy trình" height={220}><BarChart data={data.byProcess}><XAxis dataKey="label" /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
          </Row>
          <Card size="small" title="Danh sách cảnh báo"><AlertTable alerts={data.alerts} /></Card>
        </>
      )}
    </DashboardPageShell>
  )
}
