import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  InputNumber,
  Input,
  Row,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  AuditOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  SaveOutlined,
  TableOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { PageHeader, NotFound, StatusTag } from '../components/ui'
import { type DmnEditorHandle } from '../components/DmnEditor'
import RuleGridBuilder from '../components/RuleGridBuilder'
import RuleVersionTimeline from '../components/RuleVersionTimeline'
import RuleAuditTable from '../components/RuleAuditTable'
import { useRules } from '../store/RuleContext'
import { usePermissions } from '../store/AuthContext'
import {
  RULE_CATEGORY_LABEL,
  RULE_KIND_META,
  RULE_STATUS_META,
} from '../data/rules'
import { parseDmn, evaluateDrd, type DecisionResult } from '../dmn/evaluateDmn'
import {
  dmnToGrid,
  describeResult,
  gridToDmn,
  type GridColumn,
  type RuleGrid,
} from '../dmn/ruleGrid'

const { Text, Paragraph } = Typography
const DmnEditor = lazy(() => import('../components/DmnEditor'))

/** DMN khởi tạo cho luật DMN mới chưa có nội dung — 1 điều kiện → 1 kết quả. */
const STARTER_DMN = gridToDmn(
  [
    {
      id: 'quyetDinh',
      name: 'Quyết định',
      hitPolicy: 'FIRST',
      requires: [],
      inputs: [
        { id: 'i1', label: 'Đầu vào', variable: 'dauVao', type: 'number', typeRef: 'number' },
      ],
      outputs: [
        { id: 'o1', label: 'Kết quả', variable: 'ketQua', type: 'string', typeRef: 'string' },
      ],
      rules: [{ id: 'r1', when: [{ op: 'any', value: null }], then: [{ value: 'MAC_DINH' }] }],
    },
  ],
  { id: 'drd_new', name: 'Luật mới' },
)

/** Biến input gốc của DRD (không do decision nào sinh ra) — để dựng form Test. */
function rootInputColumns(grid: RuleGrid): GridColumn[] {
  const produced = new Set<string>()
  for (const d of grid) for (const o of d.outputs) produced.add(o.variable)
  const seen = new Set<string>()
  const cols: GridColumn[] = []
  for (const d of grid)
    for (const col of d.inputs)
      if (!produced.has(col.variable) && !seen.has(col.variable)) {
        seen.add(col.variable)
        cols.push(col)
      }
  return cols
}

const NUM = new Intl.NumberFormat('vi-VN')

export default function RuleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { get, saveXml } = useRules()
  const { user } = usePermissions()
  const actor = user?.hoTen ?? 'Người dùng'

  const editorRef = useRef<DmnEditorHandle>(null)
  const rule = id ? get(id) : undefined

  // Suy lưới từ DMN XML (nguồn chuẩn). Bọc lỗi parse để không vỡ trang.
  const parsed = useMemo(() => {
    if (!rule?.dmnXml) return { grid: [] as RuleGrid, error: '' }
    try {
      return { grid: dmnToGrid(parseDmn(rule.dmnXml)), error: '' }
    } catch (e) {
      return { grid: [] as RuleGrid, error: e instanceof Error ? e.message : String(e) }
    }
  }, [rule?.dmnXml])

  const testInputs = useMemo(() => rootInputColumns(parsed.grid), [parsed.grid])
  // Bản đồ tên output → cột (để định dạng kết quả Test ra nhãn tiếng Việt).
  const outputCols = useMemo(() => {
    const m = new Map<string, GridColumn>()
    for (const d of parsed.grid) for (const o of d.outputs) m.set(o.variable, o)
    return m
  }, [parsed.grid])

  const [inputVals, setInputVals] = useState<Record<string, unknown>>({})
  const [results, setResults] = useState<DecisionResult[] | null>(null)
  const [evalError, setEvalError] = useState('')

  if (!rule) {
    return (
      <NotFound
        title="Không tìm thấy luật"
        subTitle="Luật không tồn tại hoặc đã bị xoá."
        onBack={() => navigate('/quan-ly-luat')}
        backText="Về danh sách luật"
      />
    )
  }

  const runTest = () => {
    setEvalError('')
    if (!rule.dmnXml) return
    try {
      const decisions = parseDmn(rule.dmnXml)
      // Ép kiểu input theo cột (InputNumber trả number, Switch trả boolean, Input trả string).
      const ctx: Record<string, unknown> = {}
      for (const col of testInputs) ctx[col.variable] = inputVals[col.variable] ?? (col.type === 'number' ? 0 : col.type === 'boolean' ? false : '')
      const out = evaluateDrd(decisions, ctx)
      if (out.error) {
        setEvalError(out.error)
        setResults(null)
        return
      }
      setResults(out.results)
    } catch (e) {
      setEvalError(e instanceof Error ? e.message : String(e))
      setResults(null)
    }
  }

  const download = async () => {
    const xml = rule.dmnXml ?? (await editorRef.current?.getXml()) ?? ''
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${rule.ma}.dmn`
    a.click()
    URL.revokeObjectURL(url)
    message.success('Đã tải DMN XML (nguồn chuẩn).')
  }

  const saveAdvanced = async () => {
    const xml = await editorRef.current?.getXml()
    if (!xml) return
    saveXml(rule.id, xml, actor)
    message.success(`Đã lưu DMN (phiên bản v${rule.version + 1}).`)
  }

  // Lưu từ trình soạn lưới: lưới → DMN XML nguồn chuẩn → tăng version.
  const saveGrid = (g: RuleGrid) => {
    try {
      const xml = gridToDmn(g, { id: `drd_${rule.id.replace(/[^\w]/g, '_')}`, name: rule.ten })
      saveXml(rule.id, xml, actor)
      message.success(`Đã lưu bảng luật (phiên bản v${rule.version + 1}).`)
    } catch (e) {
      message.error(`Không lưu được: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const meta = RULE_STATUS_META[rule.trangThai]

  return (
    <div>
      <PageHeader
        icon={<ApartmentOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title={rule.ten}
        tag={<StatusTag color={meta.color} label={meta.label} />}
        code={<Text type="secondary">{rule.moTa}</Text>}
        breadcrumb={[
          { label: 'Hệ thống QTKHCN' },
          { label: 'Ma trận quyết định', to: '/quan-ly-luat' },
          { label: rule.ma },
        ]}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/quan-ly-luat')}>
              Danh sách
            </Button>
            {rule.kind === 'DMN' && <Button onClick={download}>Tải DMN XML</Button>}
          </Space>
        }
      />

      <Descriptions
        size="small"
        bordered
        column={{ xs: 1, sm: 2, md: 4 }}
        style={{ marginBottom: 16 }}
        items={[
          { key: 'ma', label: 'Mã luật', children: <Text code>{rule.ma}</Text> },
          { key: 'loai', label: 'Loại', children: RULE_CATEGORY_LABEL[rule.category] },
          { key: 'kind', label: 'Kiểu', children: <Tag color={RULE_KIND_META[rule.kind].color}>{RULE_KIND_META[rule.kind].label}</Tag> },
          { key: 'ver', label: 'Phiên bản', children: <Tag>v{rule.version}</Tag> },
          { key: 'rd', label: 'RD áp dụng', children: <Space size={4} wrap>{rule.rdApDung.map((rd) => <Tag key={rd}>{rd}</Tag>)}</Space> },
          { key: 'capnhat', label: 'Cập nhật', children: `${rule.capNhat} · ${rule.nguoiCapNhat}` },
        ]}
      />

      {rule.kind === 'SERVICE' ? (
        <>
          <Alert
            type="warning"
            showIcon
            message="Luật dịch vụ (Service rule) — không dùng DMN"
            description={
              <Space direction="vertical">
                <span>
                  Luật này cần tra cứu CSDL / gọi hệ ngoài nên <b>không</b> biểu diễn bằng bảng quyết định
                  DMN (xem ranh giới §7). Chỉ khai báo interface; đội phát triển hiện thực ở backend.
                </span>
                {rule.serviceInterface && (
                  <Descriptions size="small" column={1} bordered>
                    <Descriptions.Item label="Đầu vào">{rule.serviceInterface.inputs || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Đầu ra">{rule.serviceInterface.output || '—'}</Descriptions.Item>
                  </Descriptions>
                )}
              </Space>
            }
          />
          <Tabs
            style={{ marginTop: 16 }}
            items={[
              {
                key: 'versions',
                label: (
                  <span>
                    <HistoryOutlined /> Lịch sử Phiên bản
                  </span>
                ),
                children: <RuleVersionTimeline ruleId={rule.id} />,
              },
              {
                key: 'audit',
                label: (
                  <span>
                    <AuditOutlined /> Lịch sử Thay đổi
                  </span>
                ),
                children: <RuleAuditTable ruleId={rule.id} />,
              },
            ]}
          />
        </>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <Tabs
              items={[
                {
                  key: 'grid',
                  label: (
                    <span>
                      <TableOutlined /> Soạn bảng luật
                    </span>
                  ),
                  children: parsed.error ? (
                    <Alert type="error" showIcon message="Lỗi đọc DMN" description={parsed.error} />
                  ) : (
                    <RuleGridBuilder
                      grid={parsed.grid}
                      ruleName={rule.ten}
                      resetKey={`${rule.id}:v${rule.version}`}
                      onSave={saveGrid}
                    />
                  ),
                },
                {
                  key: 'advanced',
                  label: (
                    <span>
                      <ApartmentOutlined /> Chế độ nâng cao (DMN)
                    </span>
                  ),
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Button type="primary" icon={<SaveOutlined />} onClick={saveAdvanced}>
                          Lưu DMN
                        </Button>
                        <Text type="secondary">
                          Chỉnh trực tiếp bảng quyết định. Lưu xong quay tab “Điều kiện” để xem lại.
                        </Text>
                      </Space>
                      <Suspense
                        fallback={
                          <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
                            <Spin size="large" />
                          </div>
                        }
                      >
                        <DmnEditor ref={editorRef} xml={rule.dmnXml ?? STARTER_DMN} />
                      </Suspense>
                    </Space>
                  ),
                },
                {
                  key: 'versions',
                  label: (
                    <span>
                      <HistoryOutlined /> Lịch sử Phiên bản
                    </span>
                  ),
                  children: <RuleVersionTimeline ruleId={rule.id} />,
                },
                {
                  key: 'audit',
                  label: (
                    <span>
                      <AuditOutlined /> Lịch sử Thay đổi
                    </span>
                  ),
                  children: <RuleAuditTable ruleId={rule.id} />,
                },
              ]}
            />
          </Col>

          <Col xs={24} lg={9}>
            <Card
              size="small"
              title={
                <Space>
                  <ExperimentOutlined />
                  Test luật (mô phỏng)
                </Space>
              }
            >
              {parsed.grid.length === 0 ? (
                <Empty description="Chưa có nội dung để test." />
              ) : (
                <Space direction="vertical" size={14} style={{ width: '100%' }}>
                  {testInputs.map((col) => (
                    <div key={col.variable}>
                      <Text type="secondary">{col.label}</Text>
                      {col.type === 'number' ? (
                        <InputNumber<number>
                          style={{ width: '100%', marginTop: 4 }}
                          min={0}
                          value={inputVals[col.variable] as number}
                          onChange={(v) => setInputVals((s) => ({ ...s, [col.variable]: v ?? 0 }))}
                          formatter={(v) => NUM.format(Number(v ?? 0))}
                          parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
                        />
                      ) : col.type === 'boolean' ? (
                        <div style={{ marginTop: 4 }}>
                          <Switch
                            checked={!!inputVals[col.variable]}
                            onChange={(v) => setInputVals((s) => ({ ...s, [col.variable]: v }))}
                          />
                        </div>
                      ) : (
                        <Input
                          style={{ marginTop: 4 }}
                          value={inputVals[col.variable] as string}
                          onChange={(e) => setInputVals((s) => ({ ...s, [col.variable]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}

                  <Button type="primary" icon={<ThunderboltOutlined />} onClick={runTest} block>
                    Chạy Test
                  </Button>

                  {evalError && <Alert type="error" showIcon message="Lỗi đánh giá" description={evalError} />}

                  {results && (
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="decisionId"
                      dataSource={results}
                      columns={[
                        { title: 'Quyết định', dataIndex: 'decisionName' },
                        {
                          title: 'Kết quả',
                          key: 'out',
                          render: (_, r) =>
                            Object.entries(r.outputs).map(([k, v]) => {
                              const col = outputCols.get(k)
                              return (
                                <div key={k} style={{ fontSize: 12 }}>
                                  <Text code>{col?.label ?? k}</Text> ={' '}
                                  <Tag color="blue">
                                    {col ? describeResult({ value: v as never }, col) : String(v)}
                                  </Tag>
                                </div>
                              )
                            }),
                        },
                      ]}
                    />
                  )}

                  <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
                    Đánh giá client-side (feelin) trên nguồn chuẩn đã lưu. Nếu vừa sửa ở tab nâng cao,
                    hãy Lưu DMN trước khi test.
                  </Paragraph>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
