import { useMemo, useState, useEffect, lazy, Suspense, type CSSProperties, type ReactNode } from 'react'
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts'
import HelpButton from '../components/HelpButton'
import {
  getOptimizeSnapshot,
  getBpmnHeat,
  heatClass,
  BPMN_HEAT_PROCESS_OPTIONS,
  type AnalyticsPeriod,
  type BpmnHeatProcessMa,
  type BranchAnalysisRow,
  type GroupSlice,
  type OutlierInstance,
} from '../data/optimizeAnalytics'
import { NHOM, seedProcesses } from '../data/processes'
import { RED, RED_CHROME, SUCCESS, DANGER, WARNING } from '../theme'
import { seedHoSo, joinDossiers, type Dossier } from '../data/dossiers'
import { getNhiemVu } from '../data/nhiemVu'

const { RangePicker } = DatePicker
const { Text, Paragraph, Title } = Typography
const BpmnViewer = lazy(() => import('../components/BpmnViewer'))

type PeriodMode = AnalyticsPeriod | 'range'
type TrendGrain = 'day' | 'week'
type GroupBy = 'department' | 'caseType' | 'product'

interface SlaOverdueItem {
  id: string
  maNV: string
  tenDeTai: string
  step: string
  overdueDays: number
  nguoi: string
  cap: string
}

function computeSlaOverdue(dossiers: Dossier[], now: Dayjs): SlaOverdueItem[] {
  return dossiers
    .filter((d) => d.trangThai === 'processing')
    .map((d): SlaOverdueItem | null => {
      const currentStep = d.steps.find((s) => s.trangThai === 'current')
      if (!currentStep?.hanXuLy) return null
      const deadline = dayjs(currentStep.hanXuLy, 'DD/MM/YYYY')
      if (!deadline.isValid()) return null
      const diff = now.diff(deadline, 'day', true)
      if (diff < 0) return null
      return {
        id: d.id,
        maNV: d.maNV,
        tenDeTai: d.tenDeTai,
        step: currentStep.ten,
        overdueDays: Math.ceil(diff),
        nguoi: currentStep.nguoi ?? currentStep.vaiTro,
        cap: d.cap as string,
      }
    })
    .filter((x): x is SlaOverdueItem => x !== null)
    .sort((a, b) => b.overdueDays - a.overdueDays)
}

function Delta({ value, unit = '', invert = false }: { value: number; unit?: string; invert?: boolean }) {
  const good = invert ? value <= 0 : value >= 0
  const color = good ? SUCCESS : DANGER
  const Icon = value >= 0 ? ArrowUpOutlined : ArrowDownOutlined
  return (
    <Text style={{ color, fontSize: 12 }}>
      <Icon /> {value > 0 ? '+' : ''}
      {value}
      {unit} so với kỳ trước
    </Text>
  )
}

function ManagerCard({
  question,
  title,
  extra,
  children,
  dark,
}: {
  question: string
  title: ReactNode
  extra?: ReactNode
  children: ReactNode
  dark: boolean
}) {
  return (
    <Card
      size="small"
      title={
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            {question}
          </Text>
        </div>
      }
      extra={extra}
      styles={{
        body: { paddingTop: 12 },
        header: {
          background: dark ? 'rgba(255,255,255,0.03)' : undefined,
        },
      }}
      style={{
        height: '100%',
        background: dark ? '#1a1a1a' : '#fff',
        borderColor: dark ? '#333' : undefined,
      }}
    >
      {children}
    </Card>
  )
}

function KpiHero({
  title,
  value,
  suffix,
  color,
  delta,
  question,
  onClick,
  dark,
  icon,
}: {
  title: string
  value: number | string
  suffix?: string
  color: string
  delta?: ReactNode
  question: string
  onClick?: () => void
  dark: boolean
  icon: ReactNode
}) {
  return (
    <Card
      size="small"
      onClick={onClick}
      hoverable={!!onClick}
      style={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `4px solid ${color}`,
        background: dark ? '#1a1a1a' : '#fff',
        borderColor: dark ? '#333' : undefined,
      }}
    >
      <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {title}
          </Text>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.15, color, margin: '4px 0' }}>
            {value}
            {suffix ? <span style={{ fontSize: 16, marginLeft: 4 }}>{suffix}</span> : null}
          </div>
          {delta}
          <div style={{ marginTop: 6 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {question}
            </Text>
          </div>
        </div>
        <div style={{ fontSize: 22, color, opacity: 0.85 }}>{icon}</div>
      </Space>
    </Card>
  )
}

/**
 * Manager Dashboard — Camunda Optimize (mock).
 * 4 hàng: KPI → Trends → Analysis → Detail. Góc nhìn lãnh đạo vận hành.
 */
export default function Dashboard() {
  const navigate = useNavigate()
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs('2026-06-01'),
    dayjs('2026-06-30'),
  ])
  const [processGroup, setProcessGroup] = useState<string | undefined>()
  const [processVersion, setProcessVersion] = useState<string | undefined>()
  const [department, setDepartment] = useState<string | undefined>()
  const [heatProcess, setHeatProcess] = useState<BpmnHeatProcessMa>('RD01.01')
  const [trendGrain, setTrendGrain] = useState<TrendGrain>('week')
  const [groupBy, setGroupBy] = useState<GroupBy>('department')
  const [dark, setDark] = useState(false)

  const today = dayjs('2026-07-21')
  const period: AnalyticsPeriod = periodMode === 'quarter' ? 'quarter' : 'month'
  const snap = useMemo(() => getOptimizeSnapshot(period), [period])

  const periodLabel = useMemo(() => {
    if (periodMode === 'range' && dateRange) {
      return `${dateRange[0].format('DD/MM/YYYY')} – ${dateRange[1].format('DD/MM/YYYY')}`
    }
    return snap.kpi.periodLabel
  }, [periodMode, dateRange, snap])

  const heatProcessOptions = useMemo(() => {
    const all = [...BPMN_HEAT_PROCESS_OPTIONS]
    if (!processGroup) return all
    return all.filter((o) => o.ma.startsWith(processGroup))
  }, [processGroup])

  useEffect(() => {
    if (heatProcessOptions.length && !heatProcessOptions.some((o) => o.ma === heatProcess)) {
      setHeatProcess(heatProcessOptions[0].ma)
    }
  }, [heatProcessOptions, heatProcess])

  const bpmnHeat = useMemo(() => getBpmnHeat(heatProcess), [heatProcess])
  const heatXml = useMemo(
    () => seedProcesses.find((p) => p.ma === heatProcess)?.bpmnXml,
    [heatProcess],
  )

  const totalInstances =
    snap.kpi.byStatus.processing +
    snap.kpi.byStatus.approved +
    snap.kpi.byStatus.rejected +
    snap.kpi.byStatus.cancelled

  const trendData = trendGrain === 'day' ? snap.trendDaily : snap.trendWeekly

  const allDossiers = useMemo(() => joinDossiers(seedHoSo, getNhiemVu), [])
  const slaOverdueItems = useMemo(() => computeSlaOverdue(allDossiers, today), [allDossiers, today])

  const heatMarkers = useMemo(() => {
    const m: Record<string, string> = {}
    bpmnHeat.forEach((c) => {
      m[c.elementId] = heatClass(c.intensity)
    })
    return m
  }, [bpmnHeat])

  const groupSlices: GroupSlice[] = useMemo(() => {
    if (groupBy === 'caseType') return snap.byCaseType
    if (groupBy === 'product') return snap.byProduct
    return snap.byDepartment
  }, [groupBy, snap])

  const filteredGroups = useMemo(() => {
    if (!department) return groupSlices
    return groupSlices.filter((g) => g.label.includes(department) || g.key === department)
  }, [groupSlices, department])

  const departments = useMemo(() => snap.byDepartment.map((d) => d.label), [snap])

  const versionOptions = useMemo(() => {
    const procs = processGroup
      ? seedProcesses.filter((p) => p.nhom === processGroup)
      : seedProcesses.filter((p) => ['RD01', 'RD02', 'RD05'].includes(p.nhom))
    const vers = new Set<string>()
    procs.forEach((p) => p.versions.forEach((v) => vers.add(v.v)))
    return [...vers].sort()
  }, [processGroup])

  const branchCols: ColumnsType<BranchAnalysisRow> = [
    { title: 'Điểm rẽ', dataIndex: 'gateway', width: 150 },
    { title: 'Nhánh', dataIndex: 'branch' },
    {
      title: 'Tỷ lệ',
      dataIndex: 'rate',
      width: 80,
      align: 'right',
      render: (v: number) => `${v}%`,
    },
    { title: 'Số lượt', dataIndex: 'count', width: 80, align: 'right' },
    {
      title: 'Cycle TB',
      dataIndex: 'avgDays',
      width: 90,
      align: 'right',
      render: (v: number) => (
        <Text style={{ color: v >= 22 ? DANGER : undefined, fontWeight: v >= 22 ? 600 : 400 }}>{v}n</Text>
      ),
    },
    {
      title: 'Fail/Rework',
      dataIndex: 'failRate',
      width: 100,
      align: 'right',
      render: (v: number) =>
        v > 0 ? <Tag color={v >= 50 ? 'error' : 'warning'}>{v}%</Tag> : <Tag color="success">0%</Tag>,
    },
  ]

  const outlierCols: ColumnsType<OutlierInstance> = [
    { title: 'Hồ sơ', dataIndex: 'maHoSo', width: 120, render: (v) => <Text code>{v}</Text> },
    { title: 'Quy trình', dataIndex: 'process', width: 90 },
    { title: 'Bước', dataIndex: 'step', ellipsis: true },
    {
      title: 'Thời lượng',
      dataIndex: 'durationDays',
      width: 100,
      align: 'right',
      render: (v: number, r) => (
        <Tooltip title={`SLA ${r.slaDays} ngày`}>
          <Text style={{ color: DANGER, fontWeight: 700 }}>{v}n</Text>
        </Tooltip>
      ),
    },
    { title: 'Đơn vị', dataIndex: 'department', width: 120 },
    { title: 'Loại HS', dataIndex: 'caseType', width: 100 },
  ]

  const slaCols: ColumnsType<SlaOverdueItem> = [
    { title: 'Mã HS', dataIndex: 'id', width: 120, render: (v) => <Text code>{v}</Text> },
    { title: 'Đề tài', dataIndex: 'tenDeTai', ellipsis: true },
    { title: 'Bước', dataIndex: 'step', ellipsis: true },
    {
      title: 'Trễ',
      dataIndex: 'overdueDays',
      width: 90,
      align: 'right',
      render: (v: number) => <Text style={{ color: DANGER, fontWeight: 700 }}>{v} ngày</Text>,
    },
    { title: 'Xử lý bởi', dataIndex: 'nguoi', ellipsis: true },
    { title: 'Cấp', dataIndex: 'cap', width: 90 },
  ]

  const pageBg: CSSProperties = {
    background: dark ? '#0f0f0f' : 'transparent',
    margin: dark ? '-18px -20px' : undefined,
    padding: dark ? '18px 20px' : undefined,
    minHeight: dark ? '100%' : undefined,
    color: dark ? '#f0f0f0' : undefined,
  }

  const stickyBar: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: dark ? 'rgba(15,15,15,0.92)' : 'rgba(251,249,249,0.92)',
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${dark ? '#333' : 'var(--vht-border, #e6e9ee)'}`,
    padding: '12px 0 14px',
    marginBottom: 16,
  }

  return (
    <div style={pageBg} className={dark ? 'mgr-dash-dark' : undefined}>
      <div style={stickyBar}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Title level={3} style={{ margin: 0, color: dark ? '#fff' : undefined }}>
              Manager Dashboard — Optimize
            </Title>
            <Text type="secondary">
              Sức khỏe quy trình · kỳ {periodLabel}
              {processGroup ? ` · ${processGroup}` : ''}
              {processVersion ? ` · v${processVersion}` : ''}
              {department ? ` · ${department}` : ''}
            </Text>
          </Col>
          <Col>
            <Space wrap size={[8, 8]}>
              <Segmented
                value={periodMode}
                onChange={(v) => setPeriodMode(v as PeriodMode)}
                options={[
                  { label: 'Tháng', value: 'month' },
                  { label: 'Quý', value: 'quarter' },
                  { label: 'Khoảng', value: 'range' },
                ]}
              />
              {periodMode === 'range' && (
                <RangePicker
                  value={dateRange}
                  onChange={(v) => setDateRange(v as [Dayjs, Dayjs] | null)}
                  format="DD/MM/YYYY"
                  allowClear={false}
                />
              )}
              <Select
                allowClear
                placeholder="Nhóm quy trình"
                value={processGroup}
                onChange={setProcessGroup}
                style={{ minWidth: 160 }}
                options={Object.entries(NHOM).map(([k, ten]) => ({ value: k, label: `${k} — ${ten}` }))}
              />
              <Select
                allowClear
                placeholder="Process version"
                value={processVersion}
                onChange={setProcessVersion}
                style={{ minWidth: 130 }}
                options={versionOptions.map((v) => ({ value: v, label: `v${v}` }))}
              />
              <Select
                allowClear
                placeholder="Phòng ban"
                value={department}
                onChange={setDepartment}
                style={{ minWidth: 150 }}
                options={departments.map((d) => ({ value: d, label: d }))}
              />
              <Space size={6}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Dark
                </Text>
                <Switch checked={dark} onChange={setDark} size="small" />
              </Space>
              <HelpButton section="dashboard" />
            </Space>
          </Col>
        </Row>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Mock Camunda Optimize — góc nhìn lãnh đạo vận hành"
        description="Mỗi widget trả lời một câu hỏi quản lý. Click KPI/bảng để drill-down. Khi F1 sẵn sàng sẽ nối Optimize API."
      />

      {/* ── 1. KPI tổng quan ── */}
      <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13, letterSpacing: 0.4 }}>
        1 · SỨC KHỎE TỔNG QUAN
      </Text>
      <Row gutter={[14, 14]} style={{ marginBottom: 22 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiHero
            title="Total Process Instances"
            value={totalInstances}
            color={RED_CHROME}
            question="Quy trình đang xử lý bao nhiêu hồ sơ?"
            delta={<Delta value={snap.kpi.deltaInstancesPct} unit="%" />}
            icon={<ThunderboltOutlined />}
            dark={dark}
            onClick={() => navigate('/ho-so')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiHero
            title="Active Incidents"
            value={snap.kpi.openIncidents}
            color={snap.kpi.openIncidents ? DANGER : SUCCESS}
            question="Có sự cố kỹ thuật cần can thiệp ngay?"
            delta={<Delta value={snap.kpi.deltaIncidents} invert />}
            icon={<AlertOutlined />}
            dark={dark}
            onClick={() => navigate('/giam-sat')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiHero
            title="SLA Compliance"
            value={snap.kpi.slaCompliancePct}
            suffix="%"
            color={snap.kpi.slaCompliancePct >= 85 ? SUCCESS : WARNING}
            question="Quy trình có đang ổn không?"
            delta={<Delta value={snap.kpi.deltaSlaPct} unit="đ" />}
            icon={<CheckCircleOutlined />}
            dark={dark}
            onClick={() => navigate('/ho-so?sla=overdue')}
          />
          <Progress
            percent={snap.kpi.slaCompliancePct}
            showInfo={false}
            strokeColor={snap.kpi.slaCompliancePct >= 85 ? SUCCESS : WARNING}
            size="small"
            style={{ marginTop: -4, padding: '0 12px 8px' }}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiHero
            title="Average Process Duration"
            value={snap.kpi.avgCycleDays}
            suffix="ngày"
            color={RED}
            question="Chu kỳ xử lý có đang kéo dài?"
            delta={<Delta value={snap.kpi.deltaDurationDays} unit="n" invert />}
            icon={<ClockCircleOutlined />}
            dark={dark}
          />
        </Col>
      </Row>

      {/* ── 2. Xu hướng ── */}
      <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13, letterSpacing: 0.4 }}>
        2 · XU HƯỚNG
      </Text>
      <div style={{ marginBottom: 8 }}>
        <Segmented
          size="small"
          value={trendGrain}
          onChange={(v) => setTrendGrain(v as TrendGrain)}
          options={[
            { label: 'Theo ngày', value: 'day' },
            { label: 'Theo tuần', value: 'week' },
          ]}
        />
      </div>
      <Row gutter={[14, 14]} style={{ marginBottom: 22 }}>
        <Col xs={24} lg={8}>
          <ManagerCard
            dark={dark}
            title="Volume theo thời gian"
            question="Khối lượng hồ sơ đang tăng hay giảm?"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#333' : '#f0f0f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <RTooltip />
                <Bar dataKey="volume" name="Số HS" fill={RED_CHROME} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ManagerCard>
        </Col>
        <Col xs={24} lg={8}>
          <ManagerCard
            dark={dark}
            title="Duration trend"
            question="Thời gian xử lý có đang xấu đi?"
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#333' : '#f0f0f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <YAxis unit="n" tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <RTooltip />
                <Line
                  type="monotone"
                  dataKey="durationDays"
                  name="Cycle TB (ngày)"
                  stroke={RED}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ManagerCard>
        </Col>
        <Col xs={24} lg={8}>
          <ManagerCard
            dark={dark}
            title="Incident trend"
            question="Sự cố đang nhiều lên không?"
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#333' : '#f0f0f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <RTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  name="Incident mở"
                  stroke={DANGER}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ManagerCard>
        </Col>
      </Row>

      {/* ── 3. Phân tích tắc nghẽn ── */}
      <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13, letterSpacing: 0.4 }}>
        3 · ĐIỂM NGHẼN & NHÁNH RỦI RO
      </Text>
      <Row gutter={[14, 14]} style={{ marginBottom: 22 }}>
        <Col xs={24} xl={12}>
          <ManagerCard
            dark={dark}
            title="BPMN Heatmap"
            question="Đang tắc ở đâu trên sơ đồ quy trình?"
            extra={
              <Select
                value={heatProcess}
                onChange={(v) => setHeatProcess(v as BpmnHeatProcessMa)}
                style={{ minWidth: 220 }}
                options={heatProcessOptions.map((o) => ({
                  value: o.ma,
                  label: `${o.ma}`,
                }))}
              />
            }
          >
            <Space size={8} style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Thấp
              </Text>
              <div
                style={{
                  width: 100,
                  height: 10,
                  borderRadius: 5,
                  background:
                    'linear-gradient(90deg, #fff1f3, #ffdad8, #ff9aa8, #ee0033, #bf0027, #a80022)',
                }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Cao
              </Text>
            </Space>
            <Suspense fallback={<Text type="secondary">Đang tải BPMN…</Text>}>
              {heatXml ? (
                <BpmnViewer key={heatProcess} xml={heatXml} height="320px" heatMarkers={heatMarkers} />
              ) : (
                <Text type="secondary">Chưa có BPMN mock.</Text>
              )}
            </Suspense>
          </ManagerCard>
        </Col>
        <Col xs={24} xl={12}>
          <Row gutter={[14, 14]}>
            <Col span={24}>
              <ManagerCard
                dark={dark}
                title="Top Long-Running Tasks"
                question="Bước nào kéo dài cycle time nhất?"
              >
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart layout="vertical" data={snap.topSlowSteps} margin={{ left: 8, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#333' : '#f0f0f0'} />
                    <XAxis type="number" unit="n" tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                    <YAxis
                      type="category"
                      dataKey="step"
                      width={120}
                      tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }}
                    />
                    <RTooltip />
                    <Bar dataKey="avgDays" name="Ngày TB" radius={[0, 4, 4, 0]}>
                      {snap.topSlowSteps.map((s) => (
                        <Cell key={s.step} fill={s.avgDays >= 10 ? DANGER : s.avgDays >= 7 ? WARNING : RED_CHROME} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ManagerCard>
            </Col>
            <Col span={24}>
              <ManagerCard
                dark={dark}
                title="Branch Analysis"
                question="Nhánh nào gây chậm hoặc fail?"
              >
                <Table<BranchAnalysisRow>
                  size="small"
                  pagination={false}
                  rowKey={(r) => `${r.gateway}-${r.branch}`}
                  columns={branchCols}
                  dataSource={snap.branchAnalysis}
                  scroll={{ y: 180 }}
                />
              </ManagerCard>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* ── 4. Chi tiết hành động ── */}
      <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13, letterSpacing: 0.4 }}>
        4 · CASE CẦN XỬ LÝ & PHÂN NHÓM
      </Text>
      <Row gutter={[14, 14]}>
        <Col xs={24} xl={12}>
          <ManagerCard
            dark={dark}
            title={`Cases quá SLA (${slaOverdueItems.length})`}
            question="Case nào cần xử lý ngay?"
            extra={
              <a onClick={() => navigate('/ho-so?sla=overdue')}>Xem tất cả</a>
            }
          >
            {slaOverdueItems.length === 0 ? (
              <Text type="secondary">Không có hồ sơ vượt SLA.</Text>
            ) : (
              <Table<SlaOverdueItem>
                size="small"
                pagination={{ pageSize: 5 }}
                rowKey="id"
                columns={slaCols}
                dataSource={slaOverdueItems}
                onRow={(r) => ({
                  style: { cursor: 'pointer' },
                  onClick: () => navigate(`/ho-so/${r.id}`),
                })}
              />
            )}
          </ManagerCard>
        </Col>
        <Col xs={24} xl={12}>
          <ManagerCard
            dark={dark}
            title="Outlier instances"
            question="Instance nào bất thường (kéo dài quá SLA)?"
            extra={<a onClick={() => navigate('/giam-sat')}>Giám sát</a>}
          >
            <Table<OutlierInstance>
              size="small"
              pagination={false}
              rowKey="instanceKey"
              columns={outlierCols}
              dataSource={snap.outliers}
              onRow={(r) => ({
                style: { cursor: 'pointer' },
                onClick: () => navigate(`/ho-so/${r.maHoSo}`),
              })}
            />
          </ManagerCard>
        </Col>
        <Col span={24}>
          <ManagerCard
            dark={dark}
            title="Phân nhóm theo đơn vị / loại HS / sản phẩm"
            question="Đội nào cần can thiệp?"
            extra={
              <Segmented
                size="small"
                value={groupBy}
                onChange={(v) => setGroupBy(v as GroupBy)}
                options={[
                  { label: 'Phòng ban', value: 'department' },
                  { label: 'Loại HS', value: 'caseType' },
                  { label: 'Sản phẩm', value: 'product' },
                ]}
              />
            }
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={filteredGroups}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#333' : '#f0f0f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: dark ? '#aaa' : undefined }} />
                <RTooltip />
                <Legend />
                <Bar dataKey="count" name="Số HS" fill={RED_CHROME} radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Quá hạn" fill={DANGER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0, marginTop: 8 }}>
              Highlight: đơn vị có tỷ lệ quá hạn cao (Hội đồng KHCN, Ban TGĐ) cần ưu tiên hỗ trợ tài
              nguyên / nới SLA / rút bước.
            </Paragraph>
          </ManagerCard>
        </Col>
      </Row>
    </div>
  )
}
