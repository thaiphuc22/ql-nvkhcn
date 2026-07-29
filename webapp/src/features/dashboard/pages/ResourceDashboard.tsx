import { useCallback, useMemo } from 'react'
import { Col, Row } from 'antd'
import { Bar, BarChart, CartesianGrid, Tooltip as RTooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import { RED, SUCCESS, DANGER, WARNING } from '../../../theme'

const svc = createDashboardService()

export default function ResourceDashboard() {
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getResourceAnalytics(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  return (
    <DashboardPageShell title="Nguồn lực thực hiện nhiệm vụ" breadcrumbLabel="Nguồn lực"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => <Col xs={24} sm={12} lg={8} xl={6} key={k.id}><KpiCard metric={k} /></Col>)}
          </Row>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12} lg={8}><ChartCard title="Nhân sự theo đơn vị"><BarChart data={data.staffByOrg}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 9 }} /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="Tải nhân sự"><PieChart><Pie data={data.workload} dataKey="value" nameKey="label" label>{data.workload.map((_, i) => <Cell key={i} fill={[SUCCESS, WARNING, DANGER][i]} />)}</Pie><RTooltip /></PieChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="Tiến độ mua sắm"><PieChart><Pie data={data.procurementStatus} dataKey="value" nameKey="label" label><Cell fill={RED} /></Pie><RTooltip /></PieChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="Trạng thái hợp đồng"><BarChart data={data.contractStatus}><XAxis dataKey="label" /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="Cơ cấu tài sản"><PieChart><Pie data={data.assetBreakdown} dataKey="value" nameKey="label" label /><RTooltip /></PieChart></ChartCard></Col>
            <Col xs={24} md={12} lg={8}><ChartCard title="Tiến độ sản phẩm"><BarChart data={data.productProgress}><XAxis dataKey="label" /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
          </Row>
        </>
      )}
    </DashboardPageShell>
  )
}
