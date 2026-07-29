import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Input, Row } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Bar, BarChart, CartesianGrid, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import EntityTable from '../../../components/ui/EntityTable'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import { MissionStatusBadge, RiskLevelBadge } from '../shared/StatusBadge'
import { formatVnd } from '../shared/formatters'
import type { MissionSummary } from '../models/dashboard.models'
import { RED } from '../../../theme'
import { useState } from 'react'

const svc = createDashboardService()

export default function PortfolioDashboard() {
  const navigate = useNavigate()
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const [search, setSearch] = useState('')
  const fetcher = useCallback((f: typeof filter) => svc.getPortfolioAnalytics(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  const columns: ColumnsType<MissionSummary> = [
    { title: 'Mã NV', dataIndex: 'code', width: 120, sorter: (a, b) => a.code.localeCompare(b.code) },
    { title: 'Tên nhiệm vụ', dataIndex: 'name', ellipsis: true },
    { title: 'Loại', dataIndex: 'missionType', width: 160 },
    { title: 'Cấp', dataIndex: 'managementLevel', width: 110 },
    { title: 'Lĩnh vực', dataIndex: 'scienceField', width: 130 },
    { title: 'Đơn vị', dataIndex: 'organizationName', width: 180, ellipsis: true },
    { title: 'Chủ nhiệm', dataIndex: 'ownerName', width: 130 },
    { title: 'Kinh phí', dataIndex: 'totalBudget', width: 130, render: (v: number) => formatVnd(v), sorter: (a, b) => a.totalBudget - b.totalBudget },
    { title: 'Thời gian', dataIndex: 'period', width: 140 },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (v: string) => <MissionStatusBadge status={v} /> },
    { title: 'Rủi ro', dataIndex: 'riskLevel', width: 100, render: (v: string) => <RiskLevelBadge level={v} /> },
    { title: 'Thao tác', key: 'act', width: 90, render: (_, r) => <a onClick={() => navigate(`/dashboard/nhiem-vu/${r.id}`)}>Chi tiết</a> },
  ]

  const missions = data?.missions.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())) ?? []

  return (
    <DashboardPageShell title="Phân tích danh mục nhiệm vụ KHCN" breadcrumbLabel="Danh mục nhiệm vụ"
      loading={loading} error={error} empty={empty} onRetry={retry} onApply={apply}>
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => (
              <Col xs={24} sm={12} lg={8} xl={4} key={k.id}>
                <KpiCard metric={{ ...k, value: k.unit === 'đ' ? k.value : k.value, tooltip: k.tooltip }} />
              </Col>
            ))}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {[
              { title: 'Theo loại hình', data: data.byType },
              { title: 'Theo lĩnh vực', data: data.byField },
              { title: 'Theo đơn vị', data: data.byOrg },
              { title: 'Theo cấp quản lý', data: data.byLevel },
            ].map((c) => (
              <Col xs={24} md={12} lg={6} key={c.title}>
                <ChartCard title={c.title} height={220}>
                  <BarChart data={c.data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 9 }} /><YAxis /><RTooltip /><Bar dataKey="value" fill={RED} /></BarChart>
                </ChartCard>
              </Col>
            ))}
          </Row>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {[
              { title: 'Kinh phí theo lĩnh vực', data: data.budgetByField },
              { title: 'Kinh phí theo đơn vị', data: data.budgetByOrg },
              { title: 'Theo nguồn kinh phí', data: data.bySource },
              { title: 'Theo năm kế hoạch', data: data.byPlanYear },
            ].map((c) => (
              <Col xs={24} md={12} lg={6} key={c.title}>
                <ChartCard title={c.title} height={220}>
                  <BarChart data={c.data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 9 }} /><YAxis tickFormatter={(v) => `${(v as number / 1e9).toFixed(1)}B`} /><RTooltip formatter={(v: number) => formatVnd(v)} /><Bar dataKey="value" fill={RED} /></BarChart>
                </ChartCard>
              </Col>
            ))}
          </Row>
          <Input.Search placeholder="Tìm mã hoặc tên nhiệm vụ..." style={{ marginBottom: 12, maxWidth: 400 }} onSearch={setSearch} allowClear />
          <EntityTable rowKey="id" columns={columns} dataSource={missions} scroll={{ y: 'calc(100vh - 520px)' }} />
        </>
      )}
    </DashboardPageShell>
  )
}
