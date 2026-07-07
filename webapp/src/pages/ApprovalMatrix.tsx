import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  ClusterOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SolutionOutlined,
  SwapOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../components/ui'
import { ROLES, roleLabel } from '../data/roles'
import {
  APPROVAL_MATRIX,
  APPROVAL_SLOTS,
  DELEGATIONS,
  LOAI_HOI_DONG_LABEL,
  VND,
  resolveApprovers,
  slotLabel,
  type ApprovalRule,
  type ResolveResult,
  type SlotCode,
} from '../data/approvalMatrix'
import { users } from '../data/users'

const { Text, Paragraph } = Typography

const CAP_LABEL: Record<string, string> = { CS: 'Cơ sở', TD: 'Tập đoàn' }

/** Chữ cái đầu họ tên → nhãn avatar. */
function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

/** Gói điều kiện của một rule thành các Tag để hiển thị trong bảng. */
function conditionTags(r: ApprovalRule) {
  const tags: React.ReactNode[] = []
  if (r.cap) tags.push(<Tag key="cap" color={r.cap === 'TD' ? 'red' : 'blue'}>Cấp: {CAP_LABEL[r.cap]}</Tag>)
  if (r.loaiHoiDong) tags.push(<Tag key="hd" color="geekblue">HĐ: {LOAI_HOI_DONG_LABEL[r.loaiHoiDong] ?? r.loaiHoiDong}</Tag>)
  if (r.budgetMin != null || r.budgetMax != null) {
    const lo = r.budgetMin != null ? `≥ ${VND.format(r.budgetMin)}` : ''
    const hi = r.budgetMax != null ? `< ${VND.format(r.budgetMax)}` : ''
    tags.push(<Tag key="bud" color="gold">Ngân sách: {[lo, hi].filter(Boolean).join(' & ')} đ</Tag>)
  }
  if (tags.length === 0) tags.push(<Tag key="any">Mọi hồ sơ</Tag>)
  return <Space size={4} wrap>{tags}</Space>
}

interface RuleFormValues {
  ten: string
  slot: SlotCode
  cap?: 'CS' | 'TD' | null
  loaiHoiDong?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
  approverRoleCodes: string[]
  priority: number
  enabled: boolean
}

/**
 * EPIC06 — Ma trận phê duyệt (Approval Matrix). Prototype mock: quản lý luật ánh xạ
 * (slot phê duyệt + điều kiện) → người phê duyệt cụ thể, + Rule Builder (thêm/sửa)
 * + Simulation (resolve người) + Uỷ quyền theo hiệu lực. Xem
 * docs/research/configuration-service-EPIC06.md. State giữ in-memory (mock).
 */
export default function ApprovalMatrix() {
  const { message } = App.useApp()
  const [rules, setRules] = useState<ApprovalRule[]>(APPROVAL_MATRIX)

  // ── Rule Builder (modal) ────────────────────────────────────────────────
  const [editing, setEditing] = useState<ApprovalRule | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<RuleFormValues>()

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      ten: '', slot: 'THAM_DINH', cap: null, loaiHoiDong: null,
      budgetMin: null, budgetMax: null, approverRoleCodes: [], priority: 50, enabled: true,
    })
    setModalOpen(true)
  }
  const openEdit = (r: ApprovalRule) => {
    setEditing(r)
    form.setFieldsValue({ ...r })
    setModalOpen(true)
  }
  const saveRule = async () => {
    const v = await form.validateFields()
    const next: ApprovalRule = {
      id: editing?.id ?? `AM-${Date.now().toString().slice(-5)}`,
      ten: v.ten.trim(),
      slot: v.slot,
      cap: v.cap ?? null,
      loaiHoiDong: v.slot === 'HOI_DONG' ? v.loaiHoiDong ?? null : null,
      budgetMin: v.budgetMin ?? null,
      budgetMax: v.budgetMax ?? null,
      approverRoleCodes: v.approverRoleCodes,
      priority: v.priority,
      enabled: v.enabled,
    }
    setRules((prev) =>
      editing ? prev.map((r) => (r.id === editing.id ? next : r)) : [...prev, next],
    )
    setModalOpen(false)
    message.success(editing ? 'Đã cập nhật luật.' : 'Đã thêm luật mới.')
  }
  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
    message.success('Đã xoá luật.')
  }
  const toggle = (id: string, enabled: boolean) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)))

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.priority - b.priority),
    [rules],
  )

  // ── Simulation ──────────────────────────────────────────────────────────
  const [simSlot, setSimSlot] = useState<SlotCode>('PHE_DUYET')
  const [simCap, setSimCap] = useState<'CS' | 'TD'>('TD')
  const [simLoaiHD, setSimLoaiHD] = useState<string>('HD_KHCN_TD')
  const [simBudget, setSimBudget] = useState<number>(12_000_000_000)
  const [result, setResult] = useState<ResolveResult | null>(null)

  const runSim = useCallback(() => {
    setResult(
      resolveApprovers(rules, {
        slot: simSlot,
        cap: simCap,
        loaiHoiDong: simLoaiHD,
        tongDuToan: simBudget,
      }),
    )
  }, [rules, simSlot, simCap, simLoaiHD, simBudget])

  const columns = [
    {
      title: 'Ưu tiên', dataIndex: 'priority', width: 84,
      render: (p: number) => <Tag>{p}</Tag>,
    },
    {
      title: 'Luật', key: 'ten',
      render: (_: unknown, r: ApprovalRule) => (
        <div>
          <Text strong>{r.ten}</Text>
          <div><Tag color="purple" style={{ marginTop: 4 }}>{slotLabel(r.slot)}</Tag></div>
        </div>
      ),
    },
    { title: 'Điều kiện', key: 'dk', render: (_: unknown, r: ApprovalRule) => conditionTags(r) },
    {
      title: 'Người / nhóm phê duyệt', key: 'approver',
      render: (_: unknown, r: ApprovalRule) => (
        <Space size={4} wrap>
          {r.approverRoleCodes.map((c) => <Tag key={c} color="green">{roleLabel(c)}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'Bật', dataIndex: 'enabled', width: 64,
      render: (v: boolean, r: ApprovalRule) => (
        <Switch size="small" checked={v} onChange={(c) => toggle(r.id, c)} />
      ),
    },
    {
      title: '', key: 'act', width: 92,
      render: (_: unknown, r: ApprovalRule) => (
        <Space size={2}>
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xoá luật này?" onConfirm={() => removeRule(r.id)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<ClusterOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title="Ma trận phê duyệt"
        tag={<Tag color="processing">EPIC06 · Approval Matrix</Tag>}
        code={<Text type="secondary">Ánh xạ “slot phê duyệt + điều kiện” → người phê duyệt cụ thể — prototype mock</Text>}
        breadcrumb={[{ label: 'Hệ thống QTKHCN' }, { label: 'Ma trận phê duyệt' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm luật</Button>}
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Vì sao cần Ma trận phê duyệt khi BPMN đã có User Task?"
        description={
          <span>
            BPMN trả lời <b>“cần phê duyệt ở đâu”</b>, DMN (EPIC09) trả lời <b>“cần loại/cấp
            phê duyệt nào”</b> (sinh <Text code>cap</Text>, <Text code>loaiHoiDong</Text>), còn
            Ma trận phê duyệt trả lời <b>“chính xác ai phê duyệt”</b>. Nhờ vậy khi tổ chức đổi
            (nghỉ việc, uỷ quyền, tách phòng…) chỉ sửa ma trận, <b>không phải sửa &amp; deploy lại
            BPMN</b>. Camunda 8 không có sẵn tính năng này — đây là mock của Approval Matrix Service.
          </span>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card size="small" title={<Space><SolutionOutlined />Bảng luật ánh xạ (first-match theo ưu tiên)</Space>}>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={sortedRules}
              columns={columns}
            />
          </Card>

          <Card
            size="small"
            style={{ marginTop: 16 }}
            title={<Space><SwapOutlined />Uỷ quyền / Thay thế tạm thời (theo hiệu lực)</Space>}
          >
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              Uỷ quyền được áp <b>lên trên</b> kết quả resolve — Workflow không biết. Ví dụ dưới đang
              hiệu lực sẽ tự chuyển công việc của người uỷ quyền sang người nhận.
            </Paragraph>
            {DELEGATIONS.map((d) => {
              const from = users.find((u) => u.id === d.fromUserId)
              const to = users.find((u) => u.id === d.toUserId)
              return (
                <div key={d.id} style={{ marginBottom: 8 }}>
                  <Space wrap>
                    <Tag color="volcano">{from?.hoTen}</Tag>
                    <SwapOutlined />
                    <Tag color="green">{to?.hoTen}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {d.from} → {d.to} · {d.lyDo}
                    </Text>
                  </Space>
                </div>
              )
            })}
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card size="small" title={<Space><ThunderboltOutlined />Mô phỏng (Simulation)</Space>}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Slot phê duyệt (Need Role từ BPMN)</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={simSlot}
                  onChange={setSimSlot}
                  options={APPROVAL_SLOTS.map((s) => ({ value: s.code, label: s.ten }))}
                />
              </div>
              <div>
                <Text type="secondary">Cấp nhiệm vụ (cap) — từ DMN</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={simCap}
                  onChange={setSimCap}
                  options={[
                    { value: 'CS', label: 'Cơ sở' },
                    { value: 'TD', label: 'Tập đoàn' },
                  ]}
                />
              </div>
              {simSlot === 'HOI_DONG' && (
                <div>
                  <Text type="secondary">Loại hội đồng (loaiHoiDong) — output DMN</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    value={simLoaiHD}
                    onChange={setSimLoaiHD}
                    options={Object.entries(LOAI_HOI_DONG_LABEL).map(([v, l]) => ({ value: v, label: l }))}
                  />
                </div>
              )}
              <div>
                <Text type="secondary">Tổng dự toán (đồng) — business data</Text>
                <InputNumber<number>
                  style={{ width: '100%', marginTop: 4 }}
                  min={0}
                  step={1_000_000_000}
                  value={simBudget}
                  onChange={(v) => setSimBudget(v ?? 0)}
                  formatter={(v) => VND.format(Number(v ?? 0))}
                  parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
                />
              </div>

              <Button type="primary" icon={<ThunderboltOutlined />} block onClick={runSim}>
                Giải quyết (Resolve người)
              </Button>

              {result && (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <Alert
                    type={result.matchedRule ? 'success' : 'warning'}
                    showIcon
                    message={result.matchedRule ? 'Đã resolve' : 'Không có luật khớp'}
                    description={<span style={{ fontSize: 12 }}>{result.reason}</span>}
                  />
                  {result.approvers.length > 0 && (
                    <Card size="small" style={{ background: 'var(--vht-surface-2)' }}>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {result.approvers.map((a) => (
                          <Space key={a.user.id} align="start">
                            <Avatar style={{ background: '#ffdad8', color: '#bf0027', fontWeight: 700 }}>
                              {initials(a.user.hoTen)}
                            </Avatar>
                            <div style={{ lineHeight: 1.35 }}>
                              <Text strong>{a.user.hoTen}</Text>
                              <div><Text type="secondary" style={{ fontSize: 12 }}>{a.user.chucDanh}</Text></div>
                              {a.viaRoleCode && <Tag color="green" style={{ marginTop: 2 }}>{roleLabel(a.viaRoleCode)}</Tag>}
                              {a.delegatedFrom && (
                                <Tag color="volcano" icon={<SwapOutlined />} style={{ marginTop: 2 }}>
                                  thay {a.delegatedFrom.hoTen}
                                </Tag>
                              )}
                            </div>
                          </Space>
                        ))}
                      </Space>
                    </Card>
                  )}
                  {result.approvers.length === 0 && result.matchedRule == null && (
                    <Empty description="Không có người phê duyệt" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </>
              )}

              <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
                Khi backend/Zeebe sẵn sàng, nút này gọi <Text code>POST /approval-matrix/resolve</Text>;
                Camunda chỉ nhận danh sách <Text code>candidateUsers</Text> đã tính. BPMN &amp; ma trận
                giữ nguyên.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={editing ? 'Sửa luật ánh xạ' : 'Thêm luật ánh xạ'}
        open={modalOpen}
        onOk={saveRule}
        onCancel={() => setModalOpen(false)}
        okText="Lưu"
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="ten" label="Tên luật" rules={[{ required: true, message: 'Nhập tên luật' }]}>
            <Input placeholder="VD: Phê duyệt — Tập đoàn, ngân sách > 5 tỷ" />
          </Form.Item>
          <Form.Item name="slot" label="Slot phê duyệt" rules={[{ required: true }]}>
            <Select options={APPROVAL_SLOTS.map((s) => ({ value: s.code, label: s.ten }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="cap" label="Điều kiện: Cấp nhiệm vụ">
                <Select
                  allowClear
                  placeholder="Bất kỳ"
                  options={[
                    { value: 'CS', label: 'Cơ sở' },
                    { value: 'TD', label: 'Tập đoàn' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item noStyle shouldUpdate={(p, c) => p.slot !== c.slot}>
                {({ getFieldValue }) =>
                  getFieldValue('slot') === 'HOI_DONG' ? (
                    <Form.Item name="loaiHoiDong" label="Điều kiện: Loại hội đồng">
                      <Select
                        allowClear
                        placeholder="Bất kỳ"
                        options={Object.entries(LOAI_HOI_DONG_LABEL).map(([v, l]) => ({ value: v, label: l }))}
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="budgetMin" label="Ngân sách tối thiểu (đ)">
                <InputNumber<number>
                  style={{ width: '100%' }}
                  min={0}
                  step={1_000_000_000}
                  formatter={(v) => (v == null ? '' : VND.format(Number(v)))}
                  parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="budgetMax" label="Ngân sách tối đa (đ, exclusive)">
                <InputNumber<number>
                  style={{ width: '100%' }}
                  min={0}
                  step={1_000_000_000}
                  formatter={(v) => (v == null ? '' : VND.format(Number(v)))}
                  parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="approverRoleCodes" label="Người / nhóm phê duyệt (candidateGroup)" rules={[{ required: true, message: 'Chọn ít nhất một nhóm' }]}>
            <Select
              mode="multiple"
              placeholder="Chọn nhóm phê duyệt"
              optionFilterProp="label"
              options={ROLES.map((r) => ({ value: r.code, label: `${r.ten} (${r.code})` }))}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="priority" label="Ưu tiên (số nhỏ = cao)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enabled" label="Kích hoạt" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
