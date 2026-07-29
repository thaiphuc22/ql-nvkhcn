import { useCallback, useMemo } from 'react'
import { Col, Row } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Bar, BarChart, CartesianGrid, Tooltip as RTooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import EntityTable from '../../../components/ui/EntityTable'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import type { CouncilMetric } from '../models/integration-dashboard.models'
import { RED, SUCCESS, DANGER, WARNING } from '../../../theme'

const svc = createDashboardService()

export default function CouncilDashboard() {
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getCouncilAnalytics(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  const cols: ColumnsType<CouncilMetric> = [
    { title: 'Mã HĐ', dataIndex: 'councilCode', width: 90 },
    { title: 'Nhiệm vụ', dataIndex: 'missionName', ellipsis: true },
    { title: 'Cấp HĐ', dataIndex: 'councilLevel', width: 110 },
    { title: 'Chủ tịch', dataIndex: 'chairName', width: 140 },
    { title: 'Ngày họp', dataIndex: 'meetingDate', width: 110 },
    { title: 'Tham dự', dataIndex: 'attendees', width: 80 },
    { title: 'Phiếu NX', dataIndex: 'reviewVotes', width: 90 },
    { title: 'Phiếu ĐG', dataIndex: 'evaluationVotes', width: 90 },
    { title: 'Kết quả', dataIndex: 'result', width: 110 },
    { title: 'Ký BB', dataIndex: 'minutesSignStatus', width: 110 },
  ]

  return (
    <DashboardPageShell title="Theo dõi Hội đồng và phê duyệt" breadcrumbLabel="Hội đồng"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => <Col xs={24} sm={12} lg={8} xl={6} key={k.id}><KpiCard metric={k} /></Col>)}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}><ChartCard title="Kết quả xét duyệt"><PieChart><Pie data={data.results} dataKey="value" nameKey="label" label>{data.results.map((_, i) => <Cell key={i} fill={[SUCCESS, DANGER, WARNING][i % 3]} />)}</Pie><RTooltip /></PieChart></ChartCard></Col>
            <Col xs={24} md={8}><ChartCard title="Điểm theo tiêu chí"><BarChart data={data.criteria}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis domain={[0, 10]} /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            <Col xs={24} md={8}><ChartCard title="Điểm TB theo Hội đồng"><BarChart data={data.avgByCouncil}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis domain={[0, 10]} /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
          </Row>
          <EntityTable rowKey="councilCode" columns={cols} dataSource={data.rows} scroll={{ y: 'calc(100vh - 480px)' }} />
        </>
      )}
    </DashboardPageShell>
  )
}
