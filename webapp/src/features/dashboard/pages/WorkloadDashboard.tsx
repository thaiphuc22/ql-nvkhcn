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
import type { TaskWorkloadMetric } from '../models/integration-dashboard.models'
import { RED, SUCCESS, WARNING, DANGER } from '../../../theme'

const svc = createDashboardService()
const AGING_COLORS = [SUCCESS, '#1890ff', WARNING, DANGER]

export default function WorkloadDashboard() {
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getTaskWorkload(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  const cols: ColumnsType<TaskWorkloadMetric> = [
    { title: 'Người xử lý', dataIndex: 'assignee' }, { title: 'Đơn vị', dataIndex: 'organization' },
    { title: 'Vai trò', dataIndex: 'role' }, { title: 'Đang xử lý', dataIndex: 'inProgress' },
    { title: 'Sắp đến hạn', dataIndex: 'dueSoon' }, { title: 'Quá hạn', dataIndex: 'overdue' },
    { title: 'HT trong kỳ', dataIndex: 'completedInPeriod' }, { title: 'TB (ngày)', dataIndex: 'avgHandleDays' },
    { title: 'Đúng hạn %', dataIndex: 'onTimePct', render: (v: number) => `${v}%` },
  ]

  return (
    <DashboardPageShell title="Công việc và tải xử lý" breadcrumbLabel="Tải xử lý"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => <Col xs={24} sm={12} lg={8} xl={4} key={k.id}><KpiCard metric={k} /></Col>)}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {[{ t: 'Theo người xử lý', d: data.byAssignee }, { t: 'Theo đơn vị', d: data.byOrg }, { t: 'Theo vai trò', d: data.byRole }].map((c) => (
              <Col xs={24} md={8} key={c.t}><ChartCard title={c.t} height={240}><BarChart data={c.d}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 10 }} /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart></ChartCard></Col>
            ))}
            <Col xs={24} md={8}>
              <ChartCard title="Aging bucket" height={240}>
                <PieChart><Pie data={data.aging} dataKey="value" nameKey="label" label>{data.aging.map((_, i) => <Cell key={i} fill={AGING_COLORS[i % AGING_COLORS.length]} />)}</Pie><RTooltip /></PieChart>
              </ChartCard>
            </Col>
          </Row>
          <EntityTable rowKey="assignee" columns={cols} dataSource={data.rows} scroll={{ y: 'calc(100vh - 480px)' }} />
        </>
      )}
    </DashboardPageShell>
  )
}
