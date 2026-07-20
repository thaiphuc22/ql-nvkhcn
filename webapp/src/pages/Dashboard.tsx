import { useMemo, useState, useEffect, lazy, Suspense, type ReactNode } from 'react'
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
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
import { PageHeader, StatCard } from '../components/ui'
import HelpButton from '../components/HelpButton'
import {
  getOptimizeSnapshot,
  getBpmnHeat,
  heatClass,
  STATUS_COLOR,
  STATUS_LABEL,
  BPMN_HEAT_PROCESS_OPTIONS,
  type AnalyticsPeriod,
  type BpmnHeatProcessMa,
  type DmnRuleHit,
  type TopHandler,
  type UnitPerf,
} from '../data/optimizeAnalytics'
import { NHOM, seedProcesses } from '../data/processes'
import { RED, RED_CHROME, SUCCESS, DANGER, WARNING } from '../theme'

const { RangePicker } = DatePicker

type PeriodMode = AnalyticsPeriod | 'range'

const BpmnViewer = lazy(() => import('../components/BpmnViewer'))

const { Text, Paragraph } = Typography

const OUTCOME_COLORS = {
  approve: SUCCESS,
  rework: WARNING,
  reject: DANGER,
} as const

const CHART_H = 260

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text strong style={{ fontSize: 15, display: 'block', margin: '4px 0 12px' }}>
      {children}
    </Text>
  )
}

/** Heatmap Unit × metric (SLA % / cycle days) — CSS grid, không phụ thuộc chart lib. */
function UnitMetricHeatmap({
  units,
  rows,
}: {
  units: string[]
  rows: { metric: string; values: number[] }[]
}) {
  const maxByMetric = rows.map((r) => Math.max(...r.values, 1))
  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${units.length}, minmax(88px, 1fr))`,
          gap: 4,
          minWidth: 520,
        }}
      >
        <div />
        {units.map((u) => (
          <Text key={u} type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
            {u}
          </Text>
        ))}
        {rows.map((row, ri) => (
          <div key={row.metric} style={{ display: 'contents' }}>
            <Text style={{ fontSize: 12, alignSelf: 'center' }}>{row.metric}</Text>
            {row.values.map((v, ci) => {
              const t = v / maxByMetric[ri]
              const bg = `rgba(238, 0, 51, ${0.08 + t * 0.65})`
              return (
                <Tooltip key={`${ri}-${ci}`} title={`${units[ci]} · ${row.metric}: ${v}`}>
                  <div
                    style={{
                      height: 44,
                      borderRadius: 6,
                      background: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: t > 0.55 ? '#fff' : '#1c1c1c',
                      border: '1px solid var(--vht-border, #e8bcba)',
                    }}
                  >
                    {v}
                  </div>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Dashboard lãnh đạo — mock Camunda Optimize aggregates.
 * Route: `/tong-quan`. Dữ liệu thật chờ F1 + Optimize API.
 */
export default function Dashboard() {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs('2026-06-01'),
    dayjs('2026-06-30'),
  ])
  const [processGroup, setProcessGroup] = useState<string | undefined>()
  const [heatProcess, setHeatProcess] = useState<BpmnHeatProcessMa>('RD01.01')

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

  // Khi đổi nhóm: nếu quy trình đang chọn không thuộc nhóm → chọn mục đầu.
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
  const heatProcessLabel = useMemo(
    () => BPMN_HEAT_PROCESS_OPTIONS.find((o) => o.ma === heatProcess)?.ten ?? heatProcess,
    [heatProcess],
  )

  const totalInPeriod =
    snap.kpi.byStatus.processing +
    snap.kpi.byStatus.approved +
    snap.kpi.byStatus.rejected +
    snap.kpi.byStatus.cancelled

  const statusChart = useMemo(
    () =>
      (Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((k) => ({
        name: STATUS_LABEL[k],
        value: snap.kpi.byStatus[k],
        fill: STATUS_COLOR[k],
      })),
    [snap],
  )

  const capBudgetChart = useMemo(
    () =>
      snap.byCapBudget.map((x) => ({
        name: `${x.cap}\n${x.budgetBand}`,
        short: `${x.cap} · ${x.budgetBand}`,
        count: x.count,
      })),
    [snap],
  )

  const outcomeRd = useMemo(() => {
    let rows = snap.outcomesByRd
    if (processGroup) rows = rows.filter((o) => o.label === processGroup)
    return rows.map((o) => ({
      label: o.label,
      Đồngý: o.approve,
      'Điều chỉnh': o.rework,
      'Từ chối': o.reject,
    }))
  }, [snap, processGroup])

  const outcomeBudget = useMemo(
    () =>
      snap.outcomesByBudget.map((o) => ({
        label: o.label,
        Đồngý: o.approve,
        'Điều chỉnh': o.rework,
        'Từ chối': o.reject,
      })),
    [snap],
  )
  const outcomeCap = useMemo(
    () =>
      snap.outcomesByCap.map((o) => ({
        label: o.label,
        Đồngý: o.approve,
        'Điều chỉnh': o.rework,
        'Từ chối': o.reject,
      })),
    [snap],
  )

  const heatMarkers = useMemo(() => {
    const m: Record<string, string> = {}
    bpmnHeat.forEach((c) => {
      m[c.elementId] = heatClass(c.intensity)
    })
    return m
  }, [bpmnHeat])

  const heatUnits = useMemo(
    () => [...new Set(snap.unitMetricHeat.map((x) => x.unit))],
    [snap],
  )
  const heatRows = useMemo(() => {
    const metrics = [...new Set(snap.unitMetricHeat.map((x) => x.metric))]
    return metrics.map((metric) => ({
      metric,
      values: heatUnits.map(
        (u) => snap.unitMetricHeat.find((x) => x.unit === u && x.metric === metric)?.value ?? 0,
      ),
    }))
  }, [snap, heatUnits])

  const unitCols: ColumnsType<UnitPerf> = [
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      render: (v, r) => (
        <Space>
          <span>{v}</span>
          {r.overThreshold && <Tag color="error">Vượt SLA</Tag>}
        </Space>
      ),
    },
    { title: 'Cycle TB (ngày)', dataIndex: 'avgCycleDays', width: 130, align: 'right' },
    { title: 'Hoàn thành', dataIndex: 'completed', width: 110, align: 'right' },
    {
      title: 'Quá hạn %',
      dataIndex: 'overdueRate',
      width: 110,
      align: 'right',
      render: (v: number, r) => (
        <Text style={{ color: r.overThreshold ? DANGER : undefined, fontWeight: r.overThreshold ? 600 : 400 }}>
          {v}%
        </Text>
      ),
    },
  ]

  const topCols: ColumnsType<TopHandler> = [
    { title: '#', width: 48, render: (_v, _r, i) => i + 1 },
    { title: 'Người / nhóm', dataIndex: 'name' },
    { title: 'Role', dataIndex: 'roleOrGroup', width: 110, render: (v) => <Text code>{v}</Text> },
    { title: 'HS hoàn thành', dataIndex: 'completed', width: 120, align: 'right' },
    { title: 'Cycle TB', dataIndex: 'avgCycleDays', width: 100, align: 'right', render: (v) => `${v}n` },
  ]

  const dmnCols: ColumnsType<DmnRuleHit> = [
    { title: 'Rule', dataIndex: 'ruleId', width: 140, render: (v) => <Text code>{v}</Text> },
    { title: 'Điều kiện', dataIndex: 'condition' },
    { title: 'Lượt khớp', dataIndex: 'hits', width: 100, align: 'right' },
    {
      title: 'Loại',
      dataIndex: 'blocking',
      width: 110,
      render: (b: boolean) => (b ? <Tag color="error">Chặn / bổ sung</Tag> : <Tag>Định tuyến</Tag>),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tổng quan Optimize"
        style={{ marginBottom: 0 }}
        code={
          <Text type="secondary">
            Tổng hợp đa quy trình (mock Camunda Optimize) — kỳ {periodLabel}
            {processGroup ? ` · nhóm ${processGroup}` : ''}. Dùng cho lãnh đạo theo dõi năng lực xử
            lý.
          </Text>
        }
        extra={
          <Space wrap size={[8, 8]}>
            <Segmented
              value={periodMode}
              onChange={(v) => setPeriodMode(v as PeriodMode)}
              options={[
                { label: 'Tháng', value: 'month' },
                { label: 'Quý', value: 'quarter' },
                { label: 'Khoảng thời gian', value: 'range' },
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
              onChange={(v) => setProcessGroup(v)}
              style={{ minWidth: 180 }}
              options={Object.entries(NHOM).map(([k, ten]) => ({
                value: k,
                label: `${k} — ${ten}`,
              }))}
            />
            <HelpButton section="dashboard" />
          </Space>
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ margin: '14px 0 18px' }}
        message="Frontend mock — chưa nối Camunda Optimize / Operate"
        description="Số liệu seed mô phỏng báo cáo Optimize. Khi Foundation 1 sẵn sàng sẽ thay bằng API Optimize (report + heatmap BPMN thật)."
      />

      {/* KPI tổng hợp */}
      <SectionTitle>1. Tổng hợp từ tất cả quy trình</SectionTitle>
      <Row gutter={[12, 12]} style={{ marginBottom: 8 }}>
        <Col xs={12} sm={8} md={4}>
          <StatCard title="Tổng HS trong kỳ" value={totalInPeriod} color={RED_CHROME} />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <StatCard title="Đang xử lý" value={snap.kpi.byStatus.processing} color="#1677ff" />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <StatCard title="Đã phê duyệt" value={snap.kpi.byStatus.approved} color={SUCCESS} />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <StatCard title="Bị từ chối" value={snap.kpi.byStatus.rejected} color={DANGER} />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <StatCard title="Hủy" value={snap.kpi.byStatus.cancelled} color="#8593a3" />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <StatCard title="Cycle TB (ngày)" value={snap.kpi.avgCycleDays} color={RED} />
        </Col>
      </Row>
      <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
        <Col xs={12} md={8}>
          <StatCard title="Instance đang chạy" value={snap.kpi.runningInstances} color="#1677ff" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Quá hạn SLA"
            value={snap.kpi.overdueSla}
            color={snap.kpi.overdueSla ? DANGER : '#8593a3'}
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Incident kỹ thuật mở"
            value={snap.kpi.openIncidents}
            color={snap.kpi.openIncidents ? WARNING : '#8593a3'}
          />
        </Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 8 }}>
        <Col xs={24} lg={10}>
          <Card title="Hồ sơ theo trạng thái" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={statusChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RTooltip />
                <Bar dataKey="value" name="Số HS" radius={[4, 4, 0, 0]}>
                  {statusChart.map((e) => (
                    <Cell key={e.name} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Phân bố theo cấp × dải ngân sách" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={capBudgetChart} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="short" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RTooltip />
                <Bar dataKey="count" name="Hồ sơ" fill={RED_CHROME} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
        <Col xs={24} lg={12}>
          <Card title="Số HS đang nằm ở mỗi bước chính" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart
                layout="vertical"
                data={snap.stepLoad}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="step" width={120} tick={{ fontSize: 11 }} />
                <RTooltip />
                <Bar dataKey="count" name="Đang mở" fill="#1677ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top 5 bước cycle time dài nhất" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart
                layout="vertical"
                data={snap.topSlowSteps}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="n" />
                <YAxis type="category" dataKey="step" width={120} tick={{ fontSize: 11 }} />
                <RTooltip formatter={(v: number) => [`${v} ngày`, 'TB']} />
                <Bar dataKey="avgDays" name="Ngày TB" fill={RED} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Xu hướng backlog (HS mở)" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <LineChart data={snap.backlogTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="open"
                  name="Hồ sơ mở"
                  stroke={RED_CHROME}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tỷ lệ HS trễ SLA theo cấp phê duyệt" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={snap.slaByCap} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="cap" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 40]} />
                <RTooltip
                  formatter={(v: number, _n, p) => {
                    const row = p.payload as { late: number; total: number }
                    return [`${v}% (${row.late}/${row.total})`, 'Trễ SLA']
                  }}
                />
                <Bar dataKey="lateRate" name="% trễ" fill={DANGER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* DMN + outcome */}
      <SectionTitle>2. DMN + outcome user task</SectionTitle>
      <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
        <Col xs={24} lg={8}>
          <Card title="Outcome theo loại NV (RD)" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={outcomeRd} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <RTooltip />
                <Legend />
                <Bar dataKey="Đồngý" stackId="a" fill={OUTCOME_COLORS.approve} />
                <Bar dataKey="Điều chỉnh" stackId="a" fill={OUTCOME_COLORS.rework} />
                <Bar dataKey="Từ chối" stackId="a" fill={OUTCOME_COLORS.reject} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Outcome theo dải ngân sách" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={outcomeBudget} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <RTooltip />
                <Legend />
                <Bar dataKey="Đồngý" stackId="a" fill={OUTCOME_COLORS.approve} />
                <Bar dataKey="Điều chỉnh" stackId="a" fill={OUTCOME_COLORS.rework} />
                <Bar dataKey="Từ chối" stackId="a" fill={OUTCOME_COLORS.reject} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Outcome theo cấp phê duyệt" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={outcomeCap} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <RTooltip />
                <Legend />
                <Bar dataKey="Đồngý" stackId="a" fill={OUTCOME_COLORS.approve} />
                <Bar dataKey="Điều chỉnh" stackId="a" fill={OUTCOME_COLORS.rework} />
                <Bar dataKey="Từ chối" stackId="a" fill={OUTCOME_COLORS.reject} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Vòng lặp điều chỉnh (số lần quay lại)" size="small">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={snap.reworkLoops} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="times"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(t) => (t === 0 ? '0 lần' : `${t} lần`)}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RTooltip
                  labelFormatter={(t) => (Number(t) === 0 ? 'Không quay lại' : `Quay lại ${t} lần`)}
                />
                <Bar dataKey="dossiers" name="Số hồ sơ" fill={WARNING} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Rule DMN / ma trận quyết định dùng nhiều nhất" size="small">
            <Table<DmnRuleHit>
              rowKey="ruleId"
              size="small"
              pagination={false}
              columns={dmnCols}
              dataSource={snap.dmnRuleHits}
            />
          </Card>
        </Col>
      </Row>

      {/* Năng lực đơn vị */}
      <SectionTitle>3. Năng lực xử lý theo đơn vị / role</SectionTitle>
      <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
        <Col xs={24} lg={12}>
          <Card title="Cycle time & quá hạn theo đơn vị" size="small">
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 0 }}>
              Highlight đơn vị vượt ngưỡng SLA nội bộ (Hội đồng, Ban TGĐ trong kỳ demo).
            </Paragraph>
            <Table<UnitPerf>
              rowKey="unit"
              size="small"
              pagination={false}
              columns={unitCols}
              dataSource={snap.unitPerf}
              rowClassName={(r) => (r.overThreshold ? 'vht-row-warn' : '')}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top 10 người/nhóm xử lý nhiều HS nhất" size="small">
            <Table<TopHandler>
              rowKey={(r) => `${r.name}-${r.roleOrGroup}`}
              size="small"
              pagination={false}
              columns={topCols}
              dataSource={snap.topHandlers}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Heatmap Unit × SLA / cycle time" size="small">
            <UnitMetricHeatmap units={heatUnits} rows={heatRows} />
          </Card>
        </Col>
      </Row>

      {/* BPMN heatmap */}
      <SectionTitle>4. Heatmap BPMN (Optimize)</SectionTitle>
      <Card
        title={
          <Space wrap size={12}>
            <span>Cường độ theo số HS đang mở + cycle time bước</span>
            <Select
              value={heatProcess}
              onChange={(v) => setHeatProcess(v as BpmnHeatProcessMa)}
              style={{ minWidth: 320 }}
              options={heatProcessOptions.map((o) => ({
                value: o.ma,
                label: `${o.ma} — ${o.ten}`,
              }))}
              aria-label="Chọn quy trình heatmap"
            />
          </Space>
        }
        size="small"
        extra={
          <Space size={10} align="center">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Thấp
            </Text>
            <div
              title="Thang màu VHT (rose → brand red → chrome)"
              style={{
                width: 120,
                height: 12,
                borderRadius: 6,
                border: '1px solid var(--vht-border, #e6e9ee)',
                background:
                  'linear-gradient(90deg, #fff1f3 0%, #ffdad8 22%, #ff9aa8 45%, #ee0033 72%, #bf0027 88%, #a80022 100%)',
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cao
            </Text>
          </Space>
        }
      >
        <Paragraph type="secondary" style={{ marginTop: 0, fontSize: 12 }}>
          {heatProcess} · {heatProcessLabel} — glow kiểu Optimize, palette đỏ VHT (không dùng phổ cầu
          vồng).
        </Paragraph>
        <Suspense fallback={<Text type="secondary">Đang tải sơ đồ BPMN…</Text>}>
          {heatXml ? (
            <BpmnViewer key={heatProcess} xml={heatXml} height="420px" heatMarkers={heatMarkers} />
          ) : (
            <Text type="secondary">Quy trình chưa có BPMN mock.</Text>
          )}
        </Suspense>
        <Table
          style={{ marginTop: 12 }}
          size="small"
          pagination={false}
          rowKey="elementId"
          dataSource={[...bpmnHeat].sort((a, b) => b.intensity - a.intensity)}
          columns={[
            { title: 'Node', dataIndex: 'elementId', width: 130, render: (v) => <Text code>{v}</Text> },
            { title: 'Bước', dataIndex: 'label' },
            { title: 'HS mở', dataIndex: 'openCount', width: 90, align: 'right' },
            { title: 'Cycle TB', dataIndex: 'avgCycleDays', width: 100, align: 'right', render: (v) => `${v}n` },
            {
              title: 'Cường độ',
              dataIndex: 'intensity',
              width: 100,
              align: 'right',
              render: (v: number) => `${Math.round(v * 100)}%`,
            },
          ]}
        />
      </Card>
    </div>
  )
}
