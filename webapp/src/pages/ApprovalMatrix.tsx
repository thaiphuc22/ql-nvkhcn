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
  Tooltip,
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
  WarningOutlined,
} from '@ant-design/icons'
import HelpButton from '../components/HelpButton'
import ConditionBuilder from '../components/ConditionBuilder'
import AssignmentBuilder from '../components/AssignmentBuilder'
import { PageHeader } from '../components/ui'
import { roleLabel } from '../data/roles'
import {
  APPROVAL_SLOTS,
  DELEGATIONS,
  LOAI_HOI_DONG_LABEL,
  MODE_LABEL,
  VND,
  describeTarget,
  groupAssignment,
  resolveApprovers,
  slotLabel,
  type ApprovalAssignment,
  type ApprovalRule,
  type ResolveResult,
  type SlotCode,
} from '../data/approvalMatrix'
import {
  anyCondition,
  describeConditionTree,
  type ConditionGroup,
} from '../data/approvalConditions'
import { describeHelpers } from '../data/approvalVariableRegistry'
import { analyzeRules, warningsByRule } from '../data/approvalMatrixAnalyzer'
import { useApprovalMatrix } from '../store/ApprovalMatrixContext'
import { users } from '../data/users'

const { Text, Paragraph } = Typography

/** Chữ cái đầu họ tên → nhãn avatar. */
function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

/** Diễn giải điều kiện của một rule thành câu đọc được (bảng). */
function conditionSummary(r: ApprovalRule) {
  const empty = r.conditions.items.length === 0
  return empty ? (
    <Tag>Mọi hồ sơ</Tag>
  ) : (
    <Text style={{ fontSize: 12 }}>{describeConditionTree(r.conditions, describeHelpers)}</Text>
  )
}

interface RuleFormValues {
  ten: string
  slot: SlotCode
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
  // Nguồn luật CHUNG (store) — sửa ở đây lan sang runtime hồ sơ (Slice G).
  const { rules, upsertRule, removeRule: removeRuleCtx, toggleRule } = useApprovalMatrix()

  // ── Rule Builder (modal) ────────────────────────────────────────────────
  const [editing, setEditing] = useState<ApprovalRule | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<RuleFormValues>()
  // Cây điều kiện + kết quả phân công soạn tách khỏi antd Form (Form giữ trường phẳng).
  const [condDraft, setCondDraft] = useState<ConditionGroup>(anyCondition())
  const [asgDraft, setAsgDraft] = useState<ApprovalAssignment>(groupAssignment([]))

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({ ten: '', slot: 'THAM_DINH', priority: 50, enabled: true })
    setCondDraft(anyCondition())
    setAsgDraft(groupAssignment([]))
    setModalOpen(true)
  }
  const openEdit = (r: ApprovalRule) => {
    setEditing(r)
    form.setFieldsValue({ ten: r.ten, slot: r.slot, priority: r.priority, enabled: r.enabled })
    setCondDraft(structuredClone(r.conditions))
    setAsgDraft(structuredClone(r.assignment))
    setModalOpen(true)
  }
  const saveRule = async () => {
    const v = await form.validateFields()
    // Validate: cần ít nhất một target có nội dung (GROUP có nhóm / USER có người).
    const hasTarget = asgDraft.targets.some(
      (t) =>
        (t.type === 'GROUP' && t.roleCodes.length > 0) ||
        (t.type === 'USER' && t.userIds.length > 0) ||
        (t.type !== 'GROUP' && t.type !== 'USER'),
    )
    if (!hasTarget) {
      message.error('Cần ít nhất một đích phân công (nhóm hoặc người).')
      return
    }
    const next: ApprovalRule = {
      id: editing?.id ?? `AM-${Date.now().toString().slice(-5)}`,
      ten: v.ten.trim(),
      slot: v.slot,
      conditions: condDraft,
      assignment: asgDraft,
      priority: v.priority,
      enabled: v.enabled,
      version: (editing?.version ?? 0) + 1,
    }
    upsertRule(next)
    setModalOpen(false)
    message.success(editing ? 'Đã cập nhật luật.' : 'Đã thêm luật mới.')
  }
  const removeRule = (id: string) => {
    removeRuleCtx(id)
    message.success('Đã xoá luật.')
  }
  const toggle = (id: string, enabled: boolean) => toggleRule(id, enabled)

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.priority - b.priority),
    [rules],
  )

  // ── Phân tích xung đột / độ phủ (Slice F) ────────────────────────────────
  const warnings = useMemo(() => analyzeRules(rules), [rules])
  const warnByRule = useMemo(() => warningsByRule(warnings), [warnings])
  const slotWarnings = useMemo(() => warnings.filter((w) => !w.ruleId), [warnings])

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
      render: (_: unknown, r: ApprovalRule) => {
        const rw = warnByRule.get(r.id) ?? []
        return (
          <div>
            <Space size={4}>
              <Text strong>{r.ten}</Text>
              {rw.length > 0 && (
                <Tooltip title={<div>{rw.map((w, i) => <div key={i}>• {w.message}</div>)}</div>}>
                  <WarningOutlined style={{ color: rw.some((w) => w.level === 'error') ? '#cf1322' : '#d48806' }} />
                </Tooltip>
              )}
            </Space>
            <div><Tag color="purple" style={{ marginTop: 4 }}>{slotLabel(r.slot)}</Tag></div>
          </div>
        )
      },
    },
    { title: 'Điều kiện', key: 'dk', render: (_: unknown, r: ApprovalRule) => conditionSummary(r) },
    {
      title: 'Kết quả phân công', key: 'approver',
      render: (_: unknown, r: ApprovalRule) => (
        <Space direction="vertical" size={2}>
          <Space size={4} wrap>
            {r.assignment.targets.map((t, i) => (
              <Tag key={i} color={t.type === 'GROUP' ? 'green' : t.type === 'USER' ? 'blue' : 'default'}>
                {describeTarget(t)}
              </Tag>
            ))}
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>Chế độ: {MODE_LABEL[r.assignment.mode]}</Text>
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
        // tag={<Tag color="processing">EPIC06 · Approval Matrix</Tag>}
        // code={<Text type="secondary">Ánh xạ “slot phê duyệt + điều kiện” → người phê duyệt cụ thể — prototype mock</Text>}
        breadcrumb={[{ label: 'Hệ thống QTKHCN' }, { label: 'Ma trận phê duyệt' }]}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm luật</Button>
            <HelpButton section="matran" />
          </Space>
        }
      />

      {/* <Alert
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
      /> */}

      {warnings.length > 0 && (
        <Alert
          type={warnings.some((w) => w.level === 'error') ? 'error' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
          message={`Phân tích ma trận: ${warnings.length} cảnh báo (${warnings.filter((w) => w.level === 'error').length} lỗi)`}
          description={
            slotWarnings.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                {slotWarnings.map((w, i) => <li key={i}>{w.message}</li>)}
              </ul>
            ) : (
              <span style={{ fontSize: 12 }}>Xem chi tiết ở biểu tượng cảnh báo từng dòng.</span>
            )
          }
        />
      )}

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
                    message={result.matchedRule ? `Đã resolve · ${result.mode ? MODE_LABEL[result.mode] : ''}` : 'Không có luật khớp'}
                    description={<span style={{ fontSize: 12 }}>{result.reason}</span>}
                  />
                  {result.warnings.length > 0 && (
                    <Alert
                      type="warning"
                      showIcon
                      style={{ fontSize: 12 }}
                      message="Cảnh báo"
                      description={
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                          {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      }
                    />
                  )}
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

                  {result.evaluatedRules.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Đã xét {result.evaluatedRules.length} luật cùng slot (vì sao chọn/loại):
                      </Text>
                      <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 6 }}>
                        {result.evaluatedRules.map((e) => (
                          <div
                            key={e.rule.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 8,
                              fontSize: 12,
                              opacity: e.matched ? 1 : 0.6,
                            }}
                          >
                            <Space size={4}>
                              <Tag color={e.chosen ? 'green' : e.matched ? 'blue' : 'default'}>
                                #{e.rule.priority}
                              </Tag>
                              <Text delete={!e.matched && !e.chosen}>{e.rule.ten}</Text>
                            </Space>
                            <Text type="secondary">{e.note}</Text>
                          </div>
                        ))}
                      </Space>
                    </div>
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
          <Form.Item
            label="Điều kiện áp dụng"
            tooltip="Cây điều kiện AND/OR — để trống = khớp mọi hồ sơ. Slot khớp riêng (chọn ở trên)."
          >
            <ConditionBuilder value={condDraft} onChange={setCondDraft} />
          </Form.Item>
          <Form.Item
            label="Kết quả phân công"
            tooltip="Ai/nhóm nào phê duyệt + chế độ. Đợt 2: GROUP/USER resolve thật; Chức danh/Hội đồng/Biểu thức sắp có."
          >
            <AssignmentBuilder value={asgDraft} onChange={setAsgDraft} />
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
