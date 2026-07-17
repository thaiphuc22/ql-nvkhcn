import { useMemo, useState, type ReactNode } from 'react'
import {
  Alert,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  WarningOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  BulbOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import HelpButton from '../components/HelpButton'
import {
  PageHeader,
  StatCard,
  StatusTag,
  FilterBar,
  EntityTable,
  LIST_SCROLL_Y,
} from '../components/ui'
import {
  INSTANCE_STATE,
  seedInstances,
  type InstanceState,
  type ProcessInstance,
} from '../data/camundaOps'
import {
  OPTIMIZE_BOTTLENECKS,
  OPTIMIZE_CYCLE_BY_PROCESS,
  OPTIMIZE_DMN_RULE_HITS,
  OPTIMIZE_GATEWAY_RATES,
  OPTIMIZE_INSIGHTS,
  OPTIMIZE_OUTCOME_CORR,
  OPTIMIZE_SLA_KPI,
  INSIGHT_KIND_LABEL,
  type OptimizeInsight,
} from '../data/optimizeOpsInsights'
import { RED, RED_CHROME, SUCCESS, DANGER, WARNING } from '../theme'

const { Text, Paragraph } = Typography
const CHART_H = 260

/** Giám sát tiến trình — Operate instances + Optimize reports/insights (mock). */
export default function ProcessMonitor() {
  const [q, setQ] = useState('')
  const [fProcess, setFProcess] = useState<string>()
  const [fState, setFState] = useState<InstanceState>()
  const [detail, setDetail] = useState<ProcessInstance>()
  const [tab, setTab] = useState('instances')

  const stats = useMemo(() => {
    const active = seedInstances.filter((i) => i.trangThai === 'active').length
    const overdue = seedInstances.filter((i) => i.quaHan).length
    const incident = seedInstances.filter((i) => i.trangThai === 'incident').length
    const done = seedInstances.filter((i) => i.trangThai === 'completed').length
    return { active, overdue, incident, done }
  }, [])

  const processes = useMemo(
    () => Array.from(new Set(seedInstances.map((i) => i.process))).sort(),
    [],
  )

  const rows = useMemo(() => {
    return seedInstances.filter((i) => {
      if (fProcess && i.process !== fProcess) return false
      if (fState && i.trangThai !== fState) return false
      if (q) {
        const s = q.toLowerCase()
        if (
          !i.maHoSo.toLowerCase().includes(s) &&
          !i.instanceKey.includes(s) &&
          !i.maNV.toLowerCase().includes(s)
        )
          return false
      }
      return true
    })
  }, [q, fProcess, fState])

  const columns: ColumnsType<ProcessInstance> = [
    {
      title: 'Instance key',
      dataIndex: 'instanceKey',
      width: 150,
      render: (v: string) => (
        <Text code style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: 'Mã hồ sơ',
      dataIndex: 'maHoSo',
      width: 128,
      render: (v: string, r) => (
        <div>
          <Text strong>{v}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.maNV}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Quy trình',
      key: 'process',
      width: 220,
      render: (_, r) => (
        <div>
          <Space size={6}>
            <Text code>{r.process}</Text>
            <Text type="secondary">v{r.version}</Text>
          </Space>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.processTen}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Bước hiện tại',
      dataIndex: 'buocHienTai',
      render: (v: string, r) => (
        <div>
          <div>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.vaiTro}
          </Text>
        </div>
      ),
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'batDau',
      width: 140,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'state',
      width: 128,
      align: 'center',
      render: (_, r) => {
        const m = INSTANCE_STATE[r.trangThai]
        return (
          <Space direction="vertical" size={2}>
            <StatusTag color={m.color} label={m.label} />
            {r.quaHan && (
              <Tag color="error" icon={<ClockCircleOutlined />}>
                Quá hạn
              </Tag>
            )}
          </Space>
        )
      },
    },
  ]

  const insightCols: ColumnsType<OptimizeInsight> = [
    {
      title: 'Loại',
      dataIndex: 'kind',
      width: 140,
      render: (k: OptimizeInsight['kind']) => <Tag color="red">{INSIGHT_KIND_LABEL[k]}</Tag>,
    },
    { title: 'Đề xuất', dataIndex: 'title', width: 260 },
    { title: 'Căn cứ Optimize', dataIndex: 'detail' },
    { title: 'Tác động ước lượng', dataIndex: 'impact', width: 200 },
    {
      title: 'Độ tin cậy',
      dataIndex: 'confidence',
      width: 110,
      render: (c: OptimizeInsight['confidence']) => (
        <Tag color={c === 'cao' ? 'success' : c === 'trung_binh' ? 'warning' : 'default'}>
          {c === 'cao' ? 'Cao' : c === 'trung_binh' ? 'TB' : 'Thấp'}
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Giám sát tiến trình luồng"
        icon={<ThunderboltOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        code={
          <Text type="secondary" style={{ fontSize: 12 }}>
            Operate (instance) + Optimize (cycle, bottleneck, gateway, SLA, DMN, đề xuất) — mock.
          </Text>
        }
        extra={<HelpButton section="giamsat" />}
      />

      <Row gutter={14} style={{ marginBottom: 18 }}>
        <Col xs={12} md={6}>
          <StatCard title="Đang chạy" value={stats.active} color="#1677ff" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Quá hạn (SLA)" value={stats.overdue} color="#cf1322" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Sự cố (incident)" value={stats.incident} color="#cf1322" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Đã hoàn tất" value={stats.done} color="#17935a" />
        </Col>
      </Row>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: 'instances',
            label: (
              <span>
                <ApartmentOutlined /> Instance (Operate)
              </span>
            ),
            children: (
              <>
                <FilterBar
                  search={{
                    placeholder: 'Tìm mã hồ sơ / NV / instance key...',
                    onChange: setQ,
                    width: 320,
                  }}
                  selects={[
                    {
                      key: 'process',
                      placeholder: 'Tất cả quy trình',
                      value: fProcess,
                      onChange: setFProcess,
                      width: 160,
                      options: processes.map((p) => ({ value: p, label: p })),
                    },
                    {
                      key: 'state',
                      placeholder: 'Tất cả trạng thái',
                      value: fState,
                      onChange: setFState,
                      width: 170,
                      options: (Object.keys(INSTANCE_STATE) as InstanceState[]).map((k) => ({
                        value: k,
                        label: INSTANCE_STATE[k].label,
                      })),
                    },
                  ]}
                  right={
                    <Text type="secondary">
                      {rows.length}/{seedInstances.length} instance
                    </Text>
                  }
                />
                <EntityTable<ProcessInstance>
                  rowKey="instanceKey"
                  columns={columns}
                  dataSource={rows}
                  onRowClick={setDetail}
                  emptyText="Không có instance khớp bộ lọc."
                  scroll={{ y: LIST_SCROLL_Y }}
                />
              </>
            ),
          },
          {
            key: 'optimize',
            label: (
              <span>
                <BarChartOutlined /> Báo cáo Optimize
              </span>
            ),
            children: (
              <>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 14 }}
                  message="Optimize — cycle time, bottleneck, heatmap thời lượng activity, nhánh gateway, KPI SLA"
                  description="Số liệu mock. Khi F1 sẵn sàng nối Camunda Optimize report API."
                />
                <Row gutter={[14, 14]}>
                  <Col xs={24} lg={12}>
                    <Card title="Cycle time theo quy trình (ngày)" size="small">
                      <ResponsiveContainer width="100%" height={CHART_H}>
                        <BarChart data={OPTIMIZE_CYCLE_BY_PROCESS}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="process" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <RTooltip />
                          <Legend />
                          <Bar dataKey="avgDays" name="TB" fill={RED_CHROME} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="medianDays" name="Median" fill="#ff9aa8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="p95Days" name="P95" fill={DANGER} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Bottleneck — thời lượng activity (giờ)" size="small">
                      <ResponsiveContainer width="100%" height={CHART_H}>
                        <BarChart
                          layout="vertical"
                          data={OPTIMIZE_BOTTLENECKS}
                          margin={{ left: 8, right: 16 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="activity" width={150} tick={{ fontSize: 10 }} />
                          <RTooltip />
                          <Bar dataKey="avgHours" name="TB giờ" fill={RED} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Heatmap thời lượng activity (P95 giờ)" size="small">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {OPTIMIZE_BOTTLENECKS.map((a) => {
                          const t = Math.min(1, a.p95Hours / 180)
                          return (
                            <Tooltip
                              key={a.activity}
                              title={`${a.activity}: TB ${a.avgHours}h · P95 ${a.p95Hours}h · n=${a.instances}`}
                            >
                              <div
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  minWidth: 140,
                                  background: `rgba(238, 0, 51, ${0.1 + t * 0.55})`,
                                  border: '1px solid var(--vht-border)',
                                  color: t > 0.5 ? '#fff' : '#1c1c1c',
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                <div>{a.activity}</div>
                                <div style={{ opacity: 0.9 }}>{a.p95Hours}h P95</div>
                              </div>
                            </Tooltip>
                          )
                        })}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="KPI vi phạm SLA theo quy trình" size="small">
                      <ResponsiveContainer width="100%" height={CHART_H}>
                        <BarChart data={OPTIMIZE_SLA_KPI}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="process" tick={{ fontSize: 11 }} />
                          <YAxis unit="%" tick={{ fontSize: 11 }} />
                          <RTooltip
                            formatter={(v: number, _n, p) => {
                              const row = p.payload as SlaRow
                              return [`${v}% (${row.violations}/${row.instances})`, '% vi phạm']
                            }}
                          />
                          <Bar dataKey="rate" name="% vi phạm SLA" radius={[4, 4, 0, 0]}>
                            {OPTIMIZE_SLA_KPI.map((r) => (
                              <Cell key={r.process} fill={r.rate >= 20 ? DANGER : WARNING} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card title="Tỷ lệ đi từng nhánh gateway" size="small">
                      <Table
                        size="small"
                        pagination={false}
                        rowKey={(r) => `${r.gateway}-${r.branch}`}
                        dataSource={OPTIMIZE_GATEWAY_RATES}
                        columns={[
                          { title: 'Gateway', dataIndex: 'gateway', width: 220 },
                          { title: 'Nhánh', dataIndex: 'branch' },
                          {
                            title: 'Tỷ lệ',
                            dataIndex: 'rate',
                            width: 100,
                            align: 'right',
                            render: (v: number) => `${v}%`,
                          },
                          { title: 'Số lượt', dataIndex: 'count', width: 90, align: 'right' },
                        ]}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: 'dmn',
            label: (
              <span>
                <BarChartOutlined /> DMN / Outcome
              </span>
            ),
            children: (
              <Row gutter={[14, 14]}>
                <Col xs={24} lg={10}>
                  <Card title="Rule DMN dùng nhiều nhất" size="small">
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="ruleId"
                      dataSource={OPTIMIZE_DMN_RULE_HITS}
                      columns={[
                        {
                          title: 'Rule',
                          dataIndex: 'ruleId',
                          width: 140,
                          render: (v) => <Text code>{v}</Text>,
                        },
                        { title: 'Điều kiện', dataIndex: 'condition' },
                        { title: 'Hits', dataIndex: 'hits', width: 70, align: 'right' },
                      ]}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={14}>
                  <Card title="Outcome (approve/reject/rework) × thuộc tính hồ sơ" size="small">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={OPTIMIZE_OUTCOME_CORR}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="value"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={55}
                        />
                        <YAxis unit="%" tick={{ fontSize: 11 }} />
                        <RTooltip />
                        <Legend />
                        <Bar dataKey="approve" name="Đồng ý" stackId="a" fill={SUCCESS} />
                        <Bar dataKey="rework" name="Điều chỉnh" stackId="a" fill={WARNING} />
                        <Bar dataKey="reject" name="Từ chối" stackId="a" fill={DANGER} />
                      </BarChart>
                    </ResponsiveContainer>
                    <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
                      Tương quan outcome với cấp / ngân sách / loại NV — từ log DMN + user-task
                      outcome (mock).
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'insights',
            label: (
              <span>
                <BulbOutlined /> Đề xuất cải tiến
              </span>
            ),
            children: (
              <>
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 14 }}
                  message="Insight định lượng từ Optimize"
                  description="Đề xuất rút bước / đổi SLA / gom–tách quy trình dựa trên bottleneck, gateway rate và rule hits. Cần BA/architect xác nhận trước khi đổi BPMN."
                />
                <Table<OptimizeInsight>
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={insightCols}
                  dataSource={OPTIMIZE_INSIGHTS}
                />
              </>
            ),
          },
        ]}
      />

      <Modal
        open={!!detail}
        title={
          detail && (
            <Space>
              <Text>Instance</Text>
              <Text code>{detail.instanceKey}</Text>
            </Space>
          )
        }
        footer={null}
        onCancel={() => setDetail(undefined)}
        width={620}
      >
        {detail && (
          <div style={{ marginTop: 8 }}>
            {detail.trangThai === 'incident' && (
              <Alert
                type="error"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 14 }}
                message="Instance đang có sự cố (incident)"
                description={detail.incident}
              />
            )}
            <Row gutter={[12, 10]}>
              <Field label="Mã hồ sơ (correlation key)" value={<Text strong>{detail.maHoSo}</Text>} />
              <Field label="Nhiệm vụ KHCN" value={detail.maNV} />
              <Field
                label="Quy trình"
                value={
                  <Space>
                    <Text code>{detail.process}</Text>
                    <Tag>v{detail.version}</Tag>
                  </Space>
                }
              />
              <Field
                label="Trạng thái"
                value={
                  <StatusTag
                    color={INSTANCE_STATE[detail.trangThai].color}
                    label={INSTANCE_STATE[detail.trangThai].label}
                  />
                }
              />
              <Field label="Bước hiện tại" value={detail.buocHienTai} span={24} />
              <Field label="Người/nhóm được giao" value={detail.vaiTro} />
              <Field
                label="Hạn xử lý"
                value={
                  detail.hanXuLy ? (
                    <Tooltip title={detail.quaHan ? 'Đã quá hạn' : 'Trong hạn'}>
                      <Tag color={detail.quaHan ? 'error' : 'default'}>{detail.hanXuLy}</Tag>
                    </Tooltip>
                  ) : (
                    '—'
                  )
                }
              />
              <Field label="Bắt đầu" value={detail.batDau} />
              <Field label="Cập nhật gần nhất" value={detail.capNhat} />
            </Row>
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 14, marginBottom: 0 }}>
              Nguyên tắc D3: process variables chỉ giữ <Text code>maHoSo</Text> + biến điều khiển.
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  )
}

type SlaRow = { violations: number; instances: number }

function Field({
  label,
  value,
  span = 12,
}: {
  label: string
  value: ReactNode
  span?: number
}) {
  return (
    <Col span={span}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <div>{value}</div>
    </Col>
  )
}
