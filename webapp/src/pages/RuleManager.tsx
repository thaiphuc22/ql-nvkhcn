import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  InputNumber,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  ApartmentOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../components/ui'
import { type DmnEditorHandle } from '../components/DmnEditor'
import { RD02_ROUTING_DMN } from '../dmn/rd02Routing.dmn'
import {
  evaluateDrd,
  parseDmn,
  type DecisionResult,
} from '../dmn/evaluateDmn'

const { Text, Paragraph } = Typography

// dmn-js nặng → tách chunk, chỉ tải ở màn này.
const DmnEditor = lazy(() => import('../components/DmnEditor'))

/** Nhãn tiếng Việt cho giá trị output enum (chỉ để hiển thị). */
const VALUE_LABELS: Record<string, string> = {
  TD: 'Tập đoàn',
  CS: 'Cơ sở',
  HD_KHCN_TD: 'Hội đồng KHCN Tập đoàn',
  HD_CS: 'Hội đồng Cơ sở',
  KHONG: 'Không cần hội đồng',
  true: 'Có',
  false: 'Không',
}

function showValue(v: unknown): string {
  const key = String(v)
  return VALUE_LABELS[key] ?? key
}

const VND = new Intl.NumberFormat('vi-VN')

/**
 * EPIC09 — Quản lý luật nghiệp vụ (Business Rule) bằng DMN. Prototype mock:
 * soạn DRD "Định tuyến thẩm định RD02" bằng dmn-js + Test Rule đánh giá client-side
 * bằng feelin. Xem docs/research/EPIC09-dmn-design.md.
 */
export default function RuleManager() {
  const { message } = App.useApp()
  const editorRef = useRef<DmnEditorHandle>(null)
  const [tongDuToan, setTongDuToan] = useState<number>(12_000_000_000)
  const [results, setResults] = useState<DecisionResult[] | null>(null)
  const [firedByDecision, setFiredByDecision] = useState<Record<string, string[]>>({})
  const [evalError, setEvalError] = useState('')
  const [testing, setTesting] = useState(false)

  const runTest = useCallback(async () => {
    setTesting(true)
    setEvalError('')
    try {
      // Lấy XML HIỆN TẠI của editor → Test phản ánh cả chỉnh sửa trực tiếp trên bảng.
      const xml = (await editorRef.current?.getXml()) ?? RD02_ROUTING_DMN
      const decisions = parseDmn(xml)
      const out = evaluateDrd(decisions, { tongDuToan })
      if (out.error) {
        setEvalError(out.error)
        setResults(null)
        return
      }
      setResults(out.results)
      const fired: Record<string, string[]> = {}
      out.results.forEach((r) => (fired[r.decisionId] = r.firedRuleIds))
      setFiredByDecision(fired)
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : String(err))
      setResults(null)
    } finally {
      setTesting(false)
    }
  }, [tongDuToan])

  // Kết quả cuối luồng (output của decision cuối + các biến điều khiển suy ra).
  const finalOutputs = useMemo(() => {
    if (!results) return {}
    return results.reduce<Record<string, unknown>>((acc, r) => {
      Object.assign(acc, r.outputs)
      return acc
    }, {})
  }, [results])

  const download = async () => {
    const xml = (await editorRef.current?.getXml()) ?? RD02_ROUTING_DMN
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rd02-routing.dmn'
    a.click()
    URL.revokeObjectURL(url)
    message.success('Đã tải DMN XML (artifact source-of-truth).')
  }

  return (
    <div>
      <PageHeader
        icon={<ApartmentOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title="Quản lý luật nghiệp vụ"
        tag={<Tag color="processing">EPIC09 · DMN</Tag>}
        code={
          <Text type="secondary">
            DRD “Định tuyến thẩm định RD02” — prototype mock, đánh giá client-side (feelin)
          </Text>
        }
        breadcrumb={[
          { label: 'Hệ thống QTKHCN' },
          { label: 'Quản lý luật nghiệp vụ' },
        ]}
        extra={<Button onClick={download}>Tải DMN XML</Button>}
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Prototype giai đoạn mock (chưa nối Zeebe)"
        description={
          <span>
            DMN XML là <b>nguồn chuẩn</b>. Double-click một decision trong DRD để sửa Decision
            Table. “Test luật” đánh giá cả chuỗi <b>capNhiemVu → canHoiDong → loaiHoiDong</b> ngay
            trên trình duyệt. Khi backend/Zeebe sẵn sàng, eval chuyển sang{' '}
            <Text code>EvaluateDecision</Text>, DMN &amp; test giữ nguyên.
          </span>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Suspense
            fallback={
              <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
                <Spin size="large" />
              </div>
            }
          >
            <DmnEditor ref={editorRef} xml={RD02_ROUTING_DMN} />
          </Suspense>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            size="small"
            title={
              <Space>
                <ExperimentOutlined />
                Test luật (Rule Simulation)
              </Space>
            }
          >
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Tổng dự toán (đồng) — business data</Text>
                <InputNumber<number>
                  style={{ width: '100%', marginTop: 4 }}
                  min={0}
                  step={1_000_000_000}
                  value={tongDuToan}
                  onChange={(v) => setTongDuToan(v ?? 0)}
                  formatter={(v) => VND.format(Number(v ?? 0))}
                  parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
                />
                <Space size={6} wrap style={{ marginTop: 8 }}>
                  {[3, 6, 12, 35].map((ty) => (
                    <Button
                      key={ty}
                      size="small"
                      onClick={() => setTongDuToan(ty * 1_000_000_000)}
                    >
                      {ty} tỷ
                    </Button>
                  ))}
                </Space>
              </div>

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={testing}
                onClick={runTest}
                block
              >
                Chạy Test
              </Button>

              {evalError && (
                <Alert type="error" showIcon message="Lỗi đánh giá" description={evalError} />
              )}

              {results && (
                <>
                  <Card size="small" style={{ background: 'var(--vht-surface-2)' }}>
                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary">Cấp nhiệm vụ (cap): </Text>
                        <Tag color={finalOutputs.cap === 'TD' ? 'red' : 'blue'}>
                          {showValue(finalOutputs.cap)}
                        </Tag>
                      </div>
                      <div>
                        <Text type="secondary">Cần hội đồng (canHoiDong): </Text>
                        <Tag color={finalOutputs.canHoiDong ? 'green' : 'default'}>
                          {showValue(finalOutputs.canHoiDong)}
                        </Tag>
                      </div>
                      <div>
                        <Text type="secondary">Loại hội đồng (loaiHoiDong): </Text>
                        <Tag color="geekblue">{showValue(finalOutputs.loaiHoiDong)}</Tag>
                      </div>
                    </Space>
                  </Card>

                  <div>
                    <Text strong>Vết đánh giá (DRD)</Text>
                    <Table
                      size="small"
                      style={{ marginTop: 8 }}
                      pagination={false}
                      rowKey="decisionId"
                      dataSource={results}
                      columns={[
                        { title: 'Decision', dataIndex: 'decisionName' },
                        {
                          title: 'Rule fired',
                          key: 'fired',
                          render: (_, r) =>
                            (firedByDecision[r.decisionId] ?? []).map((id) => (
                              <Tag key={id}>{id}</Tag>
                            )),
                        },
                        {
                          title: 'Output',
                          key: 'out',
                          render: (_, r) =>
                            Object.entries(r.outputs).map(([k, v]) => (
                              <div key={k} style={{ fontSize: 12 }}>
                                <Text code>{k}</Text> = {showValue(v)}
                              </div>
                            )),
                        },
                      ]}
                    />
                  </div>

                  <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
                    Trong luồng RD02, output <Text code>canHoiDong</Text> điều khiển gateway, còn{' '}
                    <Text code>loaiHoiDong</Text> truyền sang Approval Matrix (EPIC06) để chọn hội
                    đồng. DMN chỉ trả “có cần làm gì không”, không quyết định “ai làm”.
                  </Paragraph>
                </>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
