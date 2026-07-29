import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Col, Progress, Row, Tabs, Timeline, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CartesianGrid, Legend, Line, LineChart, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../../../components/ui/PageHeader'
import EntityTable from '../../../components/ui/EntityTable'
import { createDashboardService } from '../services/dashboard-mock.service'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import AlertTable from '../shared/AlertTable'
import { DashboardGate, DashboardLoading } from '../shared/DashboardStates'
import { RiskLevelBadge } from '../shared/StatusBadge'
import { formatVnd } from '../shared/formatters'
import type { MissionMilestone, MissionStaffRow } from '../models/mission-dashboard.models'
import { RED } from '../../../theme'

const svc = createDashboardService()

export default function MissionDetailDashboard() {
  const { missionId = '' } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<Awaited<ReturnType<typeof svc.getMissionDashboard>>>(null)

  useEffect(() => {
    setLoading(true)
    svc.getMissionDashboard(missionId).then(setData).catch(() => setError(true)).finally(() => setLoading(false))
  }, [missionId])

  if (loading) return <DashboardLoading rows={8} />
  if (error || !data) return <DashboardGate loading={false} error={!!error} empty={!data} onRetry={() => window.location.reload()}>{null}</DashboardGate>

  const { summary } = data
  const milestoneCols: ColumnsType<MissionMilestone> = [
    { title: 'Mốc', dataIndex: 'name' }, { title: 'Kế hoạch', dataIndex: 'plannedDate' },
    { title: 'Thực tế', dataIndex: 'actualDate', render: (v?: string) => v ?? '—' },
    { title: 'Trạng thái', dataIndex: 'status' }, { title: 'Chênh (ngày)', dataIndex: 'deltaDays' },
    { title: 'Phụ trách', dataIndex: 'ownerName' },
  ]
  const staffCols: ColumnsType<MissionStaffRow> = [
    { title: 'Họ tên', dataIndex: 'name' }, { title: 'Vai trò', dataIndex: 'role' },
    { title: 'Đơn vị', dataIndex: 'organization' }, { title: 'Phân bổ %', dataIndex: 'allocationPct' },
    { title: 'Trạng thái', dataIndex: 'status' }, { title: 'Khối lượng', dataIndex: 'workload' },
    { title: 'Cảnh báo', dataIndex: 'warning', render: (v?: string) => v ? <Tag color="orange">{v}</Tag> : '—' },
  ]

  return (
    <>
      <PageHeader
        title={summary.name}
        code={summary.code}
        tag={<><Tag>{summary.status}</Tag> <RiskLevelBadge level={summary.riskLevel} /></>}
        onBack={() => navigate('/dashboard/danh-muc-nhiem-vu')}
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Giám sát nhiệm vụ' }, { label: summary.code }]}
      />
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}><strong>Cấp:</strong> {summary.managementLevel}</Col>
          <Col span={6}><strong>Đơn vị:</strong> {summary.organizationName}</Col>
          <Col span={6}><strong>Chủ nhiệm:</strong> {summary.ownerName}</Col>
          <Col span={6}><strong>Thời gian:</strong> {summary.period}</Col>
        </Row>
      </Card>
      <Tabs items={[
        { key: 'overview', label: 'Tổng quan', children: (
          <Row gutter={[12, 12]}>
            {data.kpis.map((k) => <Col xs={12} md={6} key={k.id}><KpiCard metric={k} /></Col>)}
            <Col span={24}><Card size="small" title="Vòng đời"><Timeline items={data.lifecycleTimeline.map((s) => ({ color: s.active ? 'red' : 'gray', children: `${s.stage}${s.at ? ` — ${s.at}` : ''}` }))} /></Card></Col>
            <Col xs={24} md={8}><Card size="small" title="Mốc hiện tại">{data.currentStage}</Card></Col>
            <Col xs={24} md={8}><Card size="small" title="Bước đang xử lý">{data.currentStep}</Card></Col>
            <Col xs={24} md={8}><Card size="small" title="Người xử lý">{data.currentAssignee}</Card></Col>
            <Col span={24}><Progress percent={summary.progressPct} status={data.daysRemaining < 0 ? 'exception' : 'active'} format={() => `${summary.progressPct}% — ${data.daysRemaining < 0 ? `Quá ${Math.abs(data.daysRemaining)} ngày` : `Còn ${data.daysRemaining} ngày`}`} /></Col>
          </Row>
        )},
        { key: 'progress', label: 'Tiến độ', children: <EntityTable rowKey="id" columns={milestoneCols} dataSource={data.milestones} pagination={false} /> },
        { key: 'finance', label: 'Kinh phí', children: (
          <>
            <Row gutter={12} style={{ marginBottom: 12 }}>
              <Col span={6}><Card size="small">Dự toán: {formatVnd(data.finance.approvedBudget)}</Card></Col>
              <Col span={6}><Card size="small">Đã chi: {formatVnd(data.finance.spent)}</Card></Col>
              <Col span={6}><Card size="small">Còn lại: {formatVnd(data.finance.remaining)}</Card></Col>
              <Col span={6}><Card size="small">Giải ngân: {data.finance.disbursementPct}%</Card></Col>
            </Row>
            <ChartCard title="Kế hoạch vs thực tế giải ngân" height={260}>
              <LineChart data={data.finance.monthlyPlan}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><RTooltip /><Legend /><Line dataKey="plan" name="Kế hoạch" stroke="#999" /><Line dataKey="actual" name="Thực tế" stroke={RED} /></LineChart>
            </ChartCard>
            <EntityTable rowKey={(r) => r.source + r.category} columns={[
              { title: 'Nguồn', dataIndex: 'source' }, { title: 'Hạng mục', dataIndex: 'category' },
              { title: 'Dự toán', dataIndex: 'planned', render: formatVnd }, { title: 'Cam kết', dataIndex: 'committed', render: formatVnd },
              { title: 'Đã chi', dataIndex: 'spent', render: formatVnd }, { title: 'Còn lại', dataIndex: 'remaining', render: formatVnd },
            ]} dataSource={data.finance.rows} pagination={false} />
          </>
        )},
        { key: 'staff', label: 'Nhân sự', children: <EntityTable rowKey="name" columns={staffCols} dataSource={data.staff} pagination={false} /> },
        { key: 'procurement', label: 'Mua sắm & TS', children: <EntityTable rowKey="name" columns={[
          { title: 'Loại', dataIndex: 'type' }, { title: 'Tên', dataIndex: 'name' }, { title: 'Trạng thái', dataIndex: 'status' }, { title: 'Giá trị', dataIndex: 'amount', render: formatVnd },
        ]} dataSource={data.procurement} pagination={false} /> },
        { key: 'products', label: 'Sản phẩm', children: <EntityTable rowKey="name" columns={[
          { title: 'Tên', dataIndex: 'name' }, { title: 'Loại', dataIndex: 'productType' }, { title: 'Chỉ tiêu', dataIndex: 'target' },
          { title: 'Tiến độ', dataIndex: 'progressPct', render: (v: number) => `${v}%` }, { title: 'Kết quả', dataIndex: 'result' },
          { title: 'NT', dataIndex: 'acceptanceStatus' }, { title: 'SHTT', dataIndex: 'ipStatus' },
        ]} dataSource={data.products} pagination={false} /> },
        { key: 'dossiers', label: 'Hồ sơ', children: <EntityTable rowKey="name" columns={[
          { title: 'Tên', dataIndex: 'name' }, { title: 'Biểu mẫu', dataIndex: 'formType' }, { title: 'Phiên bản', dataIndex: 'version' },
          { title: 'Người tạo', dataIndex: 'creator' }, { title: 'Người ký', dataIndex: 'signer', render: (v?: string) => v ?? '—' },
          { title: 'Cập nhật', dataIndex: 'updatedAt' }, { title: 'Trạng thái', dataIndex: 'status' },
        ]} dataSource={data.dossiers} pagination={false} /> },
        { key: 'alerts', label: 'Cảnh báo', children: <AlertTable alerts={data.alerts} /> },
        { key: 'history', label: 'Lịch sử', children: <Timeline items={data.auditLog.map((l) => ({ children: `${l.at} — ${l.actor}: ${l.action}${l.after ? ` → ${l.after}` : ''}` }))} /> },
      ]} />
    </>
  )
}
