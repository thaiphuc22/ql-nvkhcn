import { useMemo, useState, type ReactNode } from 'react'
import {
  Alert,
  App,
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
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  ApiOutlined,
  AppstoreOutlined,
  ControlOutlined,
  DeleteOutlined,
  EditOutlined,
  PartitionOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../components/ui'
import { ROLES, roleLabel } from '../data/roles'
import {
  ACTION_REGISTRY,
  EXCEPTION_ACTION_CODE,
  type ActionDefinition,
  type ActionType,
} from '../data/actionRegistry'
import {
  ACTION_AVAILABILITY_POLICIES,
  DOSSIER_STATUS_LABEL,
  PERMISSIONS,
  PERMISSION_LABEL,
  PROCESS_CODES,
  type ActionAvailabilityPolicy,
} from '../data/actionAvailabilityPolicy'
import {
  EXCEPTION_POLICIES,
  type ExceptionActionPolicy,
} from '../data/exceptionPolicy'
import { EXCEPTION_TYPE_LABEL } from '../data/exceptions'
import { getAvailableActions, type AvailableAction } from '../data/actionAvailability'
import {
  ACTION_PRESENTATIONS,
  ACTION_SURFACE_LABEL,
  ACTION_SURFACES,
  ACTION_TONE_LABEL,
  ACTION_UI_GROUP_LABEL,
  type ActionPresentation,
  type ActionSurface,
  type ActionTone,
  type ActionUiGroup,
} from '../data/actionPresentation'
import type { DossierStatus } from '../data/dossiers'
import { seedNhiemVu, type Cap } from '../data/nhiemVu'
import { seedProcesses } from '../data/processes'
import { useForms } from '../store/FormContext'
import { ROUTING_TABLES, resolveRouting } from '../data/stepRouting'
import StepRoutingDiagram, { type DiagramStep } from '../components/StepRoutingDiagram'

const { Text, Paragraph } = Typography

// ── Nhãn & màu cho 3 loại action ────────────────────────────────────────────
const TYPE_META: Record<ActionType, { label: string; color: string; hint: string }> = {
  STANDARD: { label: 'Chuẩn (Standard)', color: 'blue', hint: 'Đi theo BPMN — Camunda Active User Task + Permission' },
  SUPPORT: { label: 'Hỗ trợ (Support)', color: 'default', hint: 'Không đổi luồng chính — Permission + Dossier Status + Document Policy' },
  EXCEPTION: { label: 'Ngoại lệ (Exception)', color: 'volcano', hint: 'Đổi đường đi chuẩn — Exception Policy + duyệt riêng' },
}

const ALL_PERMISSIONS = Object.values(PERMISSIONS)

function boolTag(v: boolean | undefined, yes = 'Có', no = '—') {
  return v ? <Tag color="green">{yes}</Tag> : <Text type="secondary">{no}</Text>
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — Action Registry (doc §3.1 / §8 action_definition): danh mục tĩnh.
// ════════════════════════════════════════════════════════════════════════════
// ------------------------------------------------------------------------------
// TAB 1 — Action Registry: gộp logic action và hiển thị action trong cùng 1 grid.
// ------------------------------------------------------------------------------
interface PresentationFormValues {
  displayLabel: string
  tooltip?: string
  icon: string
  uiGroup: ActionUiGroup
  tone: ActionTone
  defaultOrder: number
}

function RegistryTab({
  presentations,
  setPresentations,
}: {
  presentations: ActionPresentation[]
  setPresentations: React.Dispatch<React.SetStateAction<ActionPresentation[]>>
}) {
  const { message } = App.useApp()
  const [editing, setEditing] = useState<ActionPresentation | null>(null)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<PresentationFormValues>()

  const presentationByCode = useMemo(
    () => new Map(presentations.map((p) => [p.actionCode, p] as const)),
    [presentations],
  )

  const rows = useMemo(
    () =>
      Object.values(ACTION_REGISTRY).map((def) => ({
        def,
        presentation: presentationByCode.get(def.actionCode),
      })),
    [presentationByCode],
  )

  const openEdit = (actionCode: string) => {
    const current =
      presentationByCode.get(actionCode) ??
      ({
        actionCode,
        displayLabel: ACTION_REGISTRY[actionCode]?.actionName ?? actionCode,
        tooltip: undefined,
        icon: 'control',
        uiGroup: 'MORE',
        tone: 'default',
        defaultOrder: 999,
      } as ActionPresentation)

    setEditing(current)
    form.setFieldsValue({
      displayLabel: current.displayLabel,
      tooltip: current.tooltip,
      icon: current.icon,
      uiGroup: current.uiGroup,
      tone: current.tone,
      defaultOrder: current.defaultOrder,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!editing) return
    const v = await form.validateFields()
    setPresentations((prev) =>
      prev.map((p) =>
        p.actionCode === editing.actionCode
          ? {
              ...p,
              displayLabel: v.displayLabel.trim(),
              tooltip: v.tooltip?.trim() || undefined,
              icon: v.icon.trim() || 'control',
              uiGroup: v.uiGroup,
              tone: v.tone,
              defaultOrder: v.defaultOrder,
            }
          : p,
      ),
    )
    setOpen(false)
    message.success('Đã cập nhật hiển thị action.')
  }

  const sorted = useMemo(() => {
    const typeOrder: ActionType[] = ['STANDARD', 'SUPPORT', 'EXCEPTION']
    return [...rows].sort((a, b) => {
      const typeDiff = typeOrder.indexOf(a.def.actionType) - typeOrder.indexOf(b.def.actionType)
      if (typeDiff !== 0) return typeDiff
      const orderA = a.presentation?.defaultOrder ?? 999
      const orderB = b.presentation?.defaultOrder ?? 999
      return orderA - orderB || a.def.actionCode.localeCompare(b.def.actionCode)
    })
  }, [rows])

  const columns = [
    { title: 'Mã action', dataIndex: ['def', 'actionCode'], width: 130, render: (c: string) => <Text code>{c}</Text> },
    {
      title: 'Registry',
      key: 'registry',
      width: 260,
      render: (_: unknown, row: { def: ActionDefinition }) => (
        <div>
          <Text strong>{row.def.actionName}</Text>
          <div>
            <Tag color={TYPE_META[row.def.actionType].color} style={{ marginTop: 4 }}>
              {TYPE_META[row.def.actionType].label}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Hiển thị action',
      key: 'presentation',
      render: (_: unknown, row: { def: ActionDefinition; presentation?: ActionPresentation }) => {
        const p = row.presentation
        return p ? (
          <Space direction="vertical" size={2}>
            <Text strong>{p.displayLabel}</Text>
            <Space size={4} wrap>
              <Tag color={p.uiGroup === 'EXCEPTION' ? 'volcano' : p.uiGroup === 'PRIMARY' ? 'blue' : 'default'}>
                {ACTION_UI_GROUP_LABEL[p.uiGroup]}
              </Tag>
              <Tag>{ACTION_TONE_LABEL[p.tone]}</Tag>
              <Tag>{p.icon}</Tag>
            </Space>
            {p.tooltip ? <Text type="secondary">{p.tooltip}</Text> : <Text type="secondary">—</Text>}
          </Space>
        ) : (
          <Text type="secondary">Chưa cấu hình</Text>
        )
      },
    },
    {
      title: 'Thứ tự',
      key: 'order',
      width: 90,
      render: (_: unknown, row: { presentation?: ActionPresentation }) => (
        <Tag>{row.presentation?.defaultOrder ?? '—'}</Tag>
      ),
    },
    { title: 'Cần lý do', dataIndex: ['def', 'requiresReason'], width: 96, render: (v: boolean) => boolTag(v) },
    { title: 'Cần căn cứ', dataIndex: ['def', 'requiresEvidence'], width: 96, render: (v: boolean) => boolTag(v) },
    { title: 'Xác nhận', dataIndex: ['def', 'requiresConfirm'], width: 96, render: (v: boolean) => boolTag(v) },
    {
      title: 'Kích hoạt', dataIndex: ['def', 'active'], width: 96,
      render: (v: boolean) => (v ? <Tag color="green">active</Tag> : <Tag>off</Tag>),
    },
    {
      title: '', key: 'act', width: 48,
      render: (_: unknown, row: { def: ActionDefinition }) => (
        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(row.def.actionCode)} />
      ),
    },
  ]

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Action Registry — gộp cấu hình logic và hiển thị trong cùng một data grid"
        description={
          <span>
            User <b>không tự tạo action logic mới</b>; action code vẫn do hệ thống định nghĩa sẵn. Ngay tại đây
            admin vừa xem được phần nghiệp vụ, vừa chỉnh được nhãn hiển thị, icon, nhóm UI và thứ tự xuất hiện.
          </span>
        }
      />

      <Card
        size="small"
        title={<Space><AppstoreOutlined />Data Grid Action Registry</Space>}
      >
        <Table
          size="small"
          rowKey={(row) => row.def.actionCode}
          pagination={false}
          dataSource={sorted}
          columns={columns}
        />
      </Card>

      <Modal
        title={editing ? ('Sửa hiển thị ' + editing.actionCode) : 'Sửa hiển thị action'}
        open={open}
        onOk={save}
        onCancel={() => setOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="displayLabel" label="Tên hiển thị" rules={[{ required: true, whitespace: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tooltip" label="Tooltip / mô tả ngắn">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="uiGroup" label="Nhóm UI" rules={[{ required: true }]}>
                <Select
                  options={(Object.keys(ACTION_UI_GROUP_LABEL) as ActionUiGroup[]).map((g) => ({
                    value: g,
                    label: ACTION_UI_GROUP_LABEL[g],
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tone" label="Tone" rules={[{ required: true }]}>
                <Select
                  options={(Object.keys(ACTION_TONE_LABEL) as ActionTone[]).map((t) => ({
                    value: t,
                    label: ACTION_TONE_LABEL[t],
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="icon" label="Icon key" rules={[{ required: true, whitespace: true }]}>
                <Input placeholder="send, form, comment..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="defaultOrder" label="Thứ tự mặc định" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}
// TAB 3 — Action Availability Policy (doc §8 action_availability_policy).
// ════════════════════════════════════════════════════════════════════════════
interface AvailFormValues {
  actionCode: string
  surface?: ActionSurface | null
  processCode?: string | null
  dossierStatus?: DossierStatus | null
  taskDefinitionKey?: string | null
  formKey?: string | null
  allowedRoleCodes: string[]
  requiredPermissions: string[]
  conditionExpression?: string
  displayOrder: number
  enabled: boolean
}

function AvailabilityTab({
  policies,
  setPolicies,
}: {
  policies: ActionAvailabilityPolicy[]
  setPolicies: React.Dispatch<React.SetStateAction<ActionAvailabilityPolicy[]>>
}) {
  const { message } = App.useApp()
  const { list: formList } = useForms()
  const [editing, setEditing] = useState<ActionAvailabilityPolicy | null>(null)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<AvailFormValues>()

  // Chỉ STANDARD/SUPPORT — EXCEPTION do Exception Policy phụ trách (tab kế).
  const actionOptions = Object.values(ACTION_REGISTRY)
    .filter((d) => d.actionType !== 'EXCEPTION')
    .map((d) => ({ value: d.actionCode, label: `${d.actionName} (${d.actionCode})` }))

  // Biểu mẫu để gắn theo action (từ Thư viện biểu mẫu — 1 eForm : n Action).
  const formOptions = formList.map((f) => ({
    value: f.key,
    label: f.loai ? `${f.ten} · ${f.loai}` : f.ten,
  }))
  const formTen = (key?: string | null) => (key ? formList.find((f) => f.key === key)?.ten ?? key : null)

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      actionCode: 'ADD_COMMENT', surface: 'DOSSIER_DETAIL', processCode: null, dossierStatus: null, taskDefinitionKey: null,
      formKey: null, allowedRoleCodes: [], requiredPermissions: [], conditionExpression: '', displayOrder: 50, enabled: true,
    })
    setOpen(true)
  }
  const openEdit = (p: ActionAvailabilityPolicy) => {
    setEditing(p)
    form.setFieldsValue({ ...p })
    setOpen(true)
  }
  const save = async () => {
    const v = await form.validateFields()
    const next: ActionAvailabilityPolicy = {
      id: editing?.id ?? `AP-${Date.now().toString().slice(-5)}`,
      actionCode: v.actionCode,
      surface: v.surface ?? null,
      processCode: v.processCode ?? null,
      taskDefinitionKey: v.taskDefinitionKey?.trim() || null,
      dossierStatus: v.dossierStatus ?? null,
      allowedRoleCodes: v.allowedRoleCodes,
      requiredPermissions: v.requiredPermissions,
      conditionExpression: v.conditionExpression?.trim() || undefined,
      displayOrder: v.displayOrder,
      enabled: v.enabled,
    }
    setPolicies((prev) => (editing ? prev.map((p) => (p.id === editing.id ? next : p)) : [...prev, next]))
    setOpen(false)
    message.success(editing ? 'Đã cập nhật luật hiển thị.' : 'Đã thêm luật hiển thị.')
  }
  const remove = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id))
    message.success('Đã xoá luật.')
  }
  const toggle = (id: string, enabled: boolean) =>
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, enabled } : p)))

  const sorted = useMemo(() => [...policies].sort((a, b) => a.displayOrder - b.displayOrder), [policies])

  const columns = [
    { title: 'Thứ tự', dataIndex: 'displayOrder', width: 76, render: (n: number) => <Tag>{n}</Tag> },
    {
      title: 'Action', key: 'action', width: 200,
      render: (_: unknown, p: ActionAvailabilityPolicy) => {
        const def = ACTION_REGISTRY[p.actionCode]
        return (
          <div>
            <Text strong>{def?.actionName ?? p.actionCode}</Text>
            <div>
              <Tag color={TYPE_META[def?.actionType ?? 'STANDARD'].color} style={{ marginTop: 4 }}>
                {def?.actionType ?? '—'}
              </Tag>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Điều kiện hiển thị', key: 'cond',
      render: (_: unknown, p: ActionAvailabilityPolicy) => (
        <Space size={4} wrap>
          <Tag color={p.surface ? 'blue' : undefined}>Surface: {p.surface ? ACTION_SURFACE_LABEL[p.surface] : 'mọi'}</Tag>
          <Tag color={p.processCode ? 'geekblue' : undefined}>QT: {p.processCode ?? 'mọi'}</Tag>
          <Tag color={p.dossierStatus ? 'purple' : undefined}>
            TT: {p.dossierStatus ? DOSSIER_STATUS_LABEL[p.dossierStatus] : 'mọi'}
          </Tag>
          {p.allowedRoleCodes.length ? (
            p.allowedRoleCodes.map((c) => <Tag key={c} color="green">{c}</Tag>)
          ) : (
            <Tag>vai trò: mọi</Tag>
          )}
          {p.conditionExpression && <Tag color="gold">{p.conditionExpression}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Quyền yêu cầu', key: 'perms',
      render: (_: unknown, p: ActionAvailabilityPolicy) =>
        p.requiredPermissions.length ? (
          <Space size={4} wrap>
            {p.requiredPermissions.map((c) => (
              <Tooltip key={c} title={c}><Tag color="cyan">{PERMISSION_LABEL[c] ?? c}</Tag></Tooltip>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Bật', dataIndex: 'enabled', width: 60,
      render: (v: boolean, p: ActionAvailabilityPolicy) => (
        <Switch size="small" checked={v} onChange={(c) => toggle(p.id, c)} />
      ),
    },
    {
      title: '', key: 'act', width: 88,
      render: (_: unknown, p: ActionAvailabilityPolicy) => (
        <Space size={2}>
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(p)} />
          <Popconfirm title="Xoá luật này?" onConfirm={() => remove(p.id)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Admin cấu hình “action nào được hiển thị, ở đâu, cho ai” — không sửa & deploy lại BPMN"
        description={
          <span>
            Bảng này chỉ chi phối action <b>STANDARD + SUPPORT</b>. Không có luật khớp = nút
            không hiện (fail-closed). Sửa ở đây sẽ phản ánh ngay ở tab <b>Simulator</b>.
            Action <b>EXCEPTION</b> nằm ở tab kế (Exception Policy).
          </span>
        }
      />
      <Card
        size="small"
        title={<Space><ControlOutlined />Luật hiển thị action (first-match theo thứ tự)</Space>}
        extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreate}>Thêm luật</Button>}
      >
        <Table<ActionAvailabilityPolicy>
          size="small" rowKey="id" pagination={false} dataSource={sorted} columns={columns}
        />
      </Card>

      <Modal
        title={editing ? 'Sửa luật hiển thị action' : 'Thêm luật hiển thị action'}
        open={open}
        onOk={save}
        onCancel={() => setOpen(false)}
        okText="Lưu"
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="actionCode" label="Action (từ Registry)" rules={[{ required: true }]}>
            <Select options={actionOptions} />
          </Form.Item>
          <Form.Item name="surface" label="Business surface">
            <Select allowClear placeholder="Mọi surface"
              options={ACTION_SURFACES.map((s) => ({ value: s, label: ACTION_SURFACE_LABEL[s] }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="processCode" label="Điều kiện: Quy trình">
                <Select allowClear placeholder="Mọi quy trình"
                  options={PROCESS_CODES.map((c) => ({ value: c, label: c }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dossierStatus" label="Điều kiện: Trạng thái hồ sơ">
                <Select allowClear placeholder="Mọi trạng thái"
                  options={(Object.keys(DOSSIER_STATUS_LABEL) as DossierStatus[]).map((s) => ({
                    value: s, label: DOSSIER_STATUS_LABEL[s],
                  }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="taskDefinitionKey" label="Điều kiện: Task key (BPMN, tuỳ chọn)">
            <Input placeholder="VD: COUNCIL_REVIEW — để trống = mọi bước" />
          </Form.Item>
          <Form.Item name="allowedRoleCodes" label="Vai trò được thấy (để trống = mọi vai trò / theo bước)">
            <Select mode="multiple" placeholder="Chọn vai trò" optionFilterProp="label"
              options={ROLES.map((r) => ({ value: r.code, label: `${r.ten} (${r.code})` }))} />
          </Form.Item>
          <Form.Item name="requiredPermissions" label="Quyền yêu cầu (required_permissions)">
            <Select mode="multiple" placeholder="Chọn quyền"
              options={ALL_PERMISSIONS.map((p) => ({ value: p, label: `${PERMISSION_LABEL[p]} (${p})` }))} />
          </Form.Item>
          <Form.Item name="conditionExpression" label="Điều kiện nghiệp vụ (minh hoạ)">
            <Input placeholder="VD: dossier.docsComplete = true" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="displayOrder" label="Thứ tự hiển thị" rules={[{ required: true }]}>
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
    </>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — Exception Policy (doc §8 exception_action_policy) — view + chỉnh nhanh.
// ════════════════════════════════════════════════════════════════════════════
function ExceptionTab({
  policies,
  setPolicies,
}: {
  policies: ExceptionActionPolicy[]
  setPolicies: React.Dispatch<React.SetStateAction<ExceptionActionPolicy[]>>
}) {
  const patch = (id: string, p: Partial<ExceptionActionPolicy>) =>
    setPolicies((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))

  const sorted = useMemo(
    () => [...policies].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id)),
    [policies],
  )

  const columns = [
    {
      title: 'Loại ngoại lệ', key: 'type',
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <div>
          <Text strong>{EXCEPTION_TYPE_LABEL[p.exceptionType]}</Text>
          <div><Text code style={{ fontSize: 11 }}>{EXCEPTION_ACTION_CODE[p.exceptionType]}</Text></div>
        </div>
      ),
    },
    {
      title: 'Cấp', dataIndex: 'cap', width: 110,
      render: (c: Cap | null | undefined) =>
        c ? <Tag>{c}</Tag> : <Tag>mọi cấp</Tag>,
    },
    {
      title: 'Người duyệt ngoại lệ', key: 'approver',
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <Space size={4} wrap>
          {p.requiredApproverRoleCodes.map((c) => <Tag key={c} color="green">{roleLabel(c)}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'Bắt buộc căn cứ', dataIndex: 'requireEvidence', width: 130,
      render: (v: boolean, p: ExceptionActionPolicy) => (
        <Switch size="small" checked={v} onChange={(c) => patch(p.id, { requireEvidence: c })} />
      ),
    },
    {
      title: 'Tối đa / hồ sơ', dataIndex: 'maxTimesPerDossier', width: 130,
      render: (v: number, p: ExceptionActionPolicy) => (
        <InputNumber size="small" min={1} max={9} value={v}
          onChange={(n) => patch(p.id, { maxTimesPerDossier: n ?? 1 })} />
      ),
    },
    {
      title: 'Bật', dataIndex: 'enabled', width: 60,
      render: (v: boolean, p: ExceptionActionPolicy) => (
        <Switch size="small" checked={v} onChange={(c) => patch(p.id, { enabled: c })} />
      ),
    },
  ]

  return (
    <>
      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 16 }}
        message="Exception Action được kiểm soát bằng Exception Policy Engine"
        description={
          <span>
            Rule tồn tại (khớp loại × cấp) = ngoại lệ được PHÉP; không rule = không cho xin
            (fail-closed). Ngoài ra còn cần: user xử lý đúng bước · không có yêu cầu ngoại lệ
            khác đang mở · chưa đạt “tối đa/hồ sơ”. Chỉnh ở đây phản ánh ngay ở tab API.
          </span>
        }
      />
      <Card size="small" title={<Space><SafetyCertificateOutlined />Bảng chính sách ngoại lệ (exception_action_policy)</Space>}>
        <Table<ExceptionActionPolicy>
          size="small" rowKey="id" pagination={false} dataSource={sorted} columns={columns} />
      </Card>
    </>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 4 — available-actions API inspector (doc §4 + §9): render động từ policy.
// ════════════════════════════════════════════════════════════════════════════
function InspectorTab({
  availPolicies,
  excPolicies,
  presentations,
}: {
  availPolicies: ActionAvailabilityPolicy[]
  excPolicies: ExceptionActionPolicy[]
  presentations: ActionPresentation[]
}) {
  const [surface, setSurface] = useState<ActionSurface>('DOSSIER_DETAIL')
  const [processCode, setProcessCode] = useState<string>('RD02')
  const [dossierStatus, setDossierStatus] = useState<DossierStatus>('processing')
  const [taskDefinitionKey, setTaskDefinitionKey] = useState<string>()
  const [cap, setCap] = useState<Cap>(seedNhiemVu[0].cap)
  const [roleCodes, setRoleCodes] = useState<string[]>(['CQ_KHCN'])
  const [perms, setPerms] = useState<string[]>([
    PERMISSIONS.PROCESS_STEP, PERMISSIONS.REQUEST_EXCEPTION,
    PERMISSIONS.ADD_COMMENT, PERMISSIONS.DOWNLOAD_DOCUMENT, PERMISSIONS.VIEW_AUDIT,
  ])
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasExceptionTargets, setHasExceptionTargets] = useState(true)
  const [canRequestOnCurrentStep, setCanRequestOnCurrentStep] = useState(true)
  const [hasActiveException, setHasActiveException] = useState(false)

  const effectiveCanRequestException =
    canRequestOnCurrentStep && (isAdmin || perms.includes(PERMISSIONS.REQUEST_EXCEPTION))

  const actions = useMemo<AvailableAction[]>(
    () =>
      getAvailableActions({
        policies: availPolicies,
        exceptionPolicies: excPolicies,
        presentations,
        surface,
        processCode,
        dossierStatus,
        taskDefinitionKey,
        userRoleCodes: roleCodes,
        userPermissions: perms,
        isAdmin,
        activeExc: hasActiveException ? true : undefined,
        hasExceptionTargets,
        canRequestExceptionOnCurrentStep: effectiveCanRequestException,
        cap,
        exceptionCountByType: {},
      }),
    [
      availPolicies,
      excPolicies,
      presentations,
      surface,
      processCode,
      dossierStatus,
      taskDefinitionKey,
      roleCodes,
      perms,
      isAdmin,
      hasActiveException,
      hasExceptionTargets,
      effectiveCanRequestException,
      cap,
    ],
  )
  // Payload JSON đúng shape doc §4.
  const payload = actions.map((a) => ({
    actionCode: a.actionCode, label: a.label, type: a.type, uiGroup: a.uiGroup, tone: a.tone, enabled: a.enabled,
    ...(a.requiresConfirm ? { requiresConfirm: true } : {}),
    ...(a.requiresReason ? { requiresReason: true } : {}),
    ...(a.requiresEvidence ? { requiresEvidence: true } : {}),
  }))

  const byGroup = (g: ActionUiGroup) => actions.filter((a) => a.uiGroup === g)
  const groups: { title: string; icon: ReactNode; group: ActionUiGroup; hint: string }[] = [
    { title: ACTION_UI_GROUP_LABEL.PRIMARY, icon: <ThunderboltOutlined />, group: 'PRIMARY', hint: 'Hành động nổi bật theo Presentation' },
    { title: ACTION_UI_GROUP_LABEL.MORE, icon: <AppstoreOutlined />, group: 'MORE', hint: 'Thao tác hỗ trợ, gom vào menu thao tác khác' },
    { title: ACTION_UI_GROUP_LABEL.EXCEPTION, icon: <WarningOutlined />, group: 'EXCEPTION', hint: 'Ngoại lệ, tách riêng khỏi thao tác thông thường' },
  ]

  return (
    <>
      <Alert
        type="info"
        showIcon
        message="Hướng dẫn sử dụng Simulator"
        description={
          <div style={{ fontSize: 12 }}>
            <div><Text strong>1. Chọn ngữ cảnh nghiệp vụ</Text>: surface, quy trình, trạng thái hồ sơ và task key cần kiểm thử.</div>
            <div><Text strong>2. Chọn ngữ cảnh người dùng</Text>: vai trò, quyền và trạng thái admin để mô phỏng user thực tế.</div>
            <div><Text strong>3. Bật/tắt điều kiện ngoại lệ</Text>: còn bước phía sau, user có đang xử lý bước hiện tại, hồ sơ có ngoại lệ đang mở.</div>
            <div><Text strong>4. Đọc kết quả bên phải</Text>: action hiển thị theo nhóm UI; action mờ là có rule hiển thị nhưng chưa đủ điều kiện bấm.</div>
            <div><Text strong>5. Đối chiếu payload</Text>: JSON phía dưới là dữ liệu UI nghiệp vụ sẽ nhận từ available-actions.</div>
            <div><Text strong>Công thức hiển thị nút = Action Definition + Workflow Step + User Role + Permission + Business Condition + Exception Policy + Dossier State</Text></div>
          </div>
        }
      />
      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            <Col xs={24} lg={9}>
        <Card size="small" title={<Space><ApiOutlined />Ngữ cảnh gọi API</Space>}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            
            <div>
              <Text type="secondary">Business surface</Text>
              <Select style={{ width: '100%', marginTop: 4 }} value={surface} onChange={setSurface}
                options={ACTION_SURFACES.map((s) => ({ value: s, label: ACTION_SURFACE_LABEL[s] }))} />
            </div>
            <div>
              <Text type="secondary">Quy trình (processCode)</Text>
              <Select style={{ width: '100%', marginTop: 4 }} value={processCode} onChange={setProcessCode}
                options={PROCESS_CODES.map((c) => ({ value: c, label: c }))} />
            </div>
            <div>
              <Text type="secondary">Trạng thái hồ sơ (dossierStatus)</Text>
              <Select style={{ width: '100%', marginTop: 4 }} value={dossierStatus} onChange={setDossierStatus}
                options={(Object.keys(DOSSIER_STATUS_LABEL) as DossierStatus[]).map((s) => ({
                  value: s, label: DOSSIER_STATUS_LABEL[s],
                }))} />
            </div>
            <div>
              <Text type="secondary">Task key hiện tại (taskDefinitionKey)</Text>
              <Input
                allowClear
                style={{ marginTop: 4 }}
                value={taskDefinitionKey}
                placeholder="VD: t2 — để trống = không pin theo bước"
                onChange={(e) => setTaskDefinitionKey(e.target.value.trim() || undefined)}
              />
            </div>
            <div>
              <Text type="secondary">Cấp nhiệm vụ (cap) — cho Exception Policy</Text>
              <Select style={{ width: '100%', marginTop: 4 }} value={cap} onChange={setCap}
                options={[{ value: 'Cơ sở', label: 'Cơ sở' }, { value: 'Tập đoàn', label: 'Tập đoàn' }]} />
            </div>
            <div>
              <Text type="secondary">Vai trò user (candidateGroups)</Text>
              <Select mode="multiple" style={{ width: '100%', marginTop: 4 }} value={roleCodes} onChange={setRoleCodes}
                placeholder="Chọn vai trò" optionFilterProp="label"
                options={ROLES.map((r) => ({ value: r.code, label: `${r.ten} (${r.code})` }))} />
            </div>
            <div>
              <Text type="secondary">Quyền user (permissions)</Text>
              <Select mode="multiple" style={{ width: '100%', marginTop: 4 }} value={perms} onChange={setPerms}
                options={ALL_PERMISSIONS.map((p) => ({ value: p, label: PERMISSION_LABEL[p] }))} />
            </div>
            <Space direction="vertical" size={8}>
              <Space>
                <Switch checked={isAdmin} onChange={setIsAdmin} />
                <Text>Là Quản trị viên (bỏ qua role/permission)</Text>
              </Space>
              <Space>
                <Switch checked={canRequestOnCurrentStep} onChange={setCanRequestOnCurrentStep} />
                <Text>User là người xử lý bước hiện tại</Text>
              </Space>
              <Space>
                <Switch checked={hasExceptionTargets} onChange={setHasExceptionTargets} />
                <Text>Còn bước phía sau để chuyển ngoại lệ</Text>
              </Space>
              <Space>
                <Switch checked={hasActiveException} onChange={setHasActiveException} />
                <Text>Đang có yêu cầu ngoại lệ mở</Text>
              </Space>
            </Space>
            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
              Đây là mock của <Text code>GET /dossiers/{'{id}'}/available-actions</Text>: UI chỉ render
              theo kết quả bên phải, <b>không tự quyết định điều kiện</b>. Đổi cấu hình ở 2 tab trước
              → kết quả đổi ngay.
            </Paragraph>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={15}>
        <Card size="small" title="Kết quả render động (chia nhóm theo doc §9)">
          {actions.length === 0 && (
            <Empty description="Không action nào hiển thị ở ngữ cảnh này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
          {groups.map((g) => {
            const rows = byGroup(g.group)
            if (rows.length === 0) return null
            return (
              <div key={g.group} style={{ marginBottom: 12 }}>
                <Space style={{ marginBottom: 8 }}>
                  {g.icon}
                  <Text strong>{g.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{g.hint}</Text>
                </Space>
                <Space wrap size={[8, 8]}>
                  {rows.map((a) => (
                    <Tooltip key={a.actionCode} title={a.disabledReason ?? a.conditionExpression}>
                      <Tag
                        color={a.enabled ? (a.tone === 'danger' ? 'volcano' : a.tone === 'warning' ? 'gold' : TYPE_META[a.type].color) : undefined}
                        style={{ padding: '4px 10px', opacity: a.enabled ? 1 : 0.55, cursor: 'help' }}
                      >
                        {a.label}
                        {!a.enabled && <Text type="secondary"> (mờ)</Text>}
                        {a.requiresReason && <Text type="secondary"> · lý do</Text>}
                        {a.requiresEvidence && <Text type="secondary"> · căn cứ</Text>}
                      </Tag>
                    </Tooltip>
                  ))}
                </Space>
              </div>
            )
          })}

          <Divider style={{ margin: '12px 0 8px' }}>Payload API (doc §4)</Divider>
          <pre
            style={{
              margin: 0, padding: 12, borderRadius: 8, fontSize: 12, lineHeight: 1.5,
              background: 'var(--vht-surface-2)', overflowX: 'auto', maxHeight: 320,
            }}
          >
            {JSON.stringify(payload, null, 2)}
          </pre>
        </Card>
      </Col>
    </Row>
    </>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 5 — Ma trận định tuyến (Routing Matrix) design-time: mỗi bước → nhánh kết quả.
// Tái dùng StepRoutingDiagram (cùng component với Chi tiết hồ sơ) + resolveRouting.
// ════════════════════════════════════════════════════════════════════════════
function RoutingMatrixTab() {
  const processOptions = Object.keys(ROUTING_TABLES)
  const [ma, setMa] = useState(processOptions[0])
  const proc = seedProcesses.find((p) => p.ma === ma)
  // Bước "tổng hợp" từ taskSteps (design-time, không gắn hồ sơ cụ thể).
  const steps: DiagramStep[] = (proc?.taskSteps ?? []).map((ts) => ({
    ten: ts.ten,
    vaiTro: ts.vaiTro,
    vaiTroCodes: ts.vaiTroCodes ?? [],
  }))
  const table = ROUTING_TABLES[ma] ?? []

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Ma trận định tuyến — (bước, kết quả xử lý) → bước đích / điểm kết thúc"
        description={
          <span>
            Cùng một <Text code>resolveRouting</Text> và <Text code>StepRoutingDiagram</Text> mà màn{' '}
            <b>Chi tiết hồ sơ</b> dùng ở runtime — ở đây xem theo <b>loại bước</b> (design-time), không
            gắn hồ sơ cụ thể. Sửa luồng/đích rework tại <Text code>data/stepRouting.ts</Text>.
          </span>
        }
      />
      <Space style={{ marginBottom: 16 }}>
        <Text type="secondary">Quy trình</Text>
        <Select
          style={{ minWidth: 320 }}
          value={ma}
          onChange={setMa}
          options={processOptions.map((code) => {
            const p = seedProcesses.find((x) => x.ma === code)
            return { value: code, label: p ? `${code} · ${p.ten}` : code }
          })}
        />
      </Space>

      {table.length === 0 ? (
        <Empty description="Quy trình chưa có bảng định tuyến." />
      ) : (
        <Row gutter={[16, 16]}>
          {table.map((r) => {
            const ts = proc?.taskSteps?.find((t) => t.key === r.stepKey)
            if (!ts) return null
            const routing = resolveRouting(proc, steps, ts.ten)
            return (
              <Col xs={24} xl={12} key={r.stepKey}>
                <Card size="small" title={<Space><PartitionOutlined />{ts.ten}</Space>}>
                  <StepRoutingDiagram
                    currentStepTen={ts.ten}
                    currentStepRole={ts.vaiTro}
                    branches={routing.branches}
                    steps={steps}
                    showApprovers={false}
                  />
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Trang chính — các lớp cấu hình của Action Availability Model.
// ════════════════════════════════════════════════════════════════════════════
/**
 * Action Studio — cấu hình các lớp của Action Availability Model
 * (docs/research/action-availability-model.md §10):
 *   1. System có sẵn Action Registry
 *   2. Admin cấu hình Action Availability Policy
 *   3. Exception Action được kiểm soát bằng Exception Policy
 *   4. UI gọi API available-actions để render động
 * State giữ in-memory (mock) — chỉnh policy ở tab 2/3 chảy ngay vào inspector tab 4.
 */
export default function ActionStudio() {
  const [presentations, setPresentations] = useState<ActionPresentation[]>(ACTION_PRESENTATIONS)
  const [availPolicies, setAvailPolicies] = useState<ActionAvailabilityPolicy[]>(ACTION_AVAILABILITY_POLICIES)
  const [excPolicies, setExcPolicies] = useState<ExceptionActionPolicy[]>(EXCEPTION_POLICIES)

  const items = [
    {
      key: 'registry',
      label: <Space><AppstoreOutlined />Action Registry</Space>,
      children: <RegistryTab presentations={presentations} setPresentations={setPresentations} />,
    },
    {
      key: 'availability',
      label: <Space><ControlOutlined />Availability Policy</Space>,
      children: <AvailabilityTab policies={availPolicies} setPolicies={setAvailPolicies} />,
    },
    {
      key: 'exception',
      label: <Space><SafetyCertificateOutlined />Exception Policy</Space>,
      children: <ExceptionTab policies={excPolicies} setPolicies={setExcPolicies} />,
    },
    {
      key: 'routing',
      label: <Space><PartitionOutlined />Ma trận định tuyến</Space>,
      children: <RoutingMatrixTab />,
    },
    {
      key: 'inspector',
      label: <Space><ApiOutlined />Simulator</Space>,
      children: <InspectorTab availPolicies={availPolicies} excPolicies={excPolicies} presentations={presentations} />,
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<ControlOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title="Cấu hình Hành động (Action Studio)"
        tag={<Tag color="processing">Action Availability Model</Tag>}
        code={<Text type="secondary">Registry / Availability Policy / Exception Policy / Simulator</Text>}
        breadcrumb={[{ label: 'Hệ thống QTKHCN' }, { label: 'Cấu hình Hành động' }]}
      />
      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message=""
        description={
          <div style={{ fontSize: 12 }}>
                  <div><Text strong>1. Chọn ngữ cảnh nghiệp vụ</Text>: surface, quy trình, trạng thái hồ sơ và task key cần kiểm thử.</div>
                  <div><Text strong>2. Chọn ngữ cảnh người dùng</Text>: vai trò, quyền và trạng thái admin để mô phỏng người dùng thực tế.</div>
                  <div><Text strong>3. Bật/tắt điều kiện ngoại lệ</Text>: condition các bước phía sau, người dùng đang xử lý bước hiện tại, hồ sơ có ngoại lệ đang mở.</div>
                  <div><Text strong>4. Đọc kết quả bên phải</Text>: action hiển thị theo nhóm UI; action mở là có rule hiển thị nhưng chưa đủ điều kiện bấm.</div>
                  <div><Text strong>5. Đối chiếu payload</Text>: JSON phía dưới là dữ liệu UI nghiệp vụ sẽ nhận từ available-actions.</div>
                </div>
        }
      /> */}
      <Tabs defaultActiveKey="registry" items={items} />
    </div>
  )
}

