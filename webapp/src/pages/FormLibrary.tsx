import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FormOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { countFields, type FormMeta } from '../forms'
import { useForms } from '../store/FormContext'
import { useProcesses } from '../store/ProcessContext'
import FormRenderer from '../components/FormRenderer'
import { type FormDesignerHandle } from '../components/FormDesigner'
import { PageHeader, StatCard, EntityTable, LIST_SCROLL_Y } from '../components/ui'

// Trình thiết kế form-js khá nặng → chỉ nạp khi mở drawer (tách chunk riêng).
const FormDesigner = lazy(() => import('../components/FormDesigner'))

const { Text, Paragraph } = Typography

const LOAI_COLOR: Record<string, string> = {
  'Góp ý': 'blue',
  'Nhận xét': 'geekblue',
  'Thẩm định': 'gold',
  'Phê duyệt': 'green',
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function FormLibrary() {
  const { message, modal } = App.useApp()
  const { list, addForm, updateSchema, removeForm } = useForms()
  const { list: processes } = useProcesses()

  const [preview, setPreview] = useState<FormMeta | null>(null)
  const [editing, setEditing] = useState<FormMeta | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm] = Form.useForm()
  const designerRef = useRef<FormDesignerHandle>(null)

  // Đếm số User Task đang tham chiếu mỗi biểu mẫu (trên toàn bộ quy trình).
  const usage = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of processes) {
      for (const ts of p.taskSteps ?? []) {
        if (ts.formKey) m.set(ts.formKey, (m.get(ts.formKey) ?? 0) + 1)
      }
    }
    return m
  }, [processes])

  function submitCreate() {
    createForm.validateFields().then((v) => {
      const key = slugify(v.key || v.ten)
      const created = addForm({ key, ten: v.ten, moTa: v.moTa, loai: v.loai })
      if (!created) {
        message.error(`Mã biểu mẫu "${key}" đã tồn tại hoặc không hợp lệ.`)
        return
      }
      message.success(`Đã tạo biểu mẫu "${v.ten}".`)
      setCreateOpen(false)
      createForm.resetFields()
      // "Tạo & mở designer" đúng nghĩa: mở luôn drawer thiết kế cho form vừa tạo.
      setEditing(created)
    })
  }

  function saveDesign() {
    if (!editing) return
    const schema = designerRef.current?.getSchema()
    if (!schema) {
      message.error('Không lấy được schema từ designer.')
      return
    }
    updateSchema(editing.key, schema)
    designerRef.current?.markSaved()
    message.success(`Đã lưu thiết kế biểu mẫu "${editing.ten}".`)
    setEditing(null)
  }

  /** Đóng drawer thiết kế — còn thay đổi chưa lưu thì hỏi trước. */
  function closeDesigner() {
    if (designerRef.current?.isDirty()) {
      modal.confirm({
        title: 'Thoát khi chưa lưu?',
        content: 'Thay đổi thiết kế chưa lưu sẽ bị mất.',
        okText: 'Thoát',
        okButtonProps: { danger: true },
        cancelText: 'Ở lại',
        onOk: () => setEditing(null),
      })
      return
    }
    setEditing(null)
  }

  const columns: ColumnsType<FormMeta> = [
    {
      title: 'Biểu mẫu',
      dataIndex: 'ten',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.moTa}</Text>
        </div>
      ),
    },
    { title: 'Mã (formKey)', dataIndex: 'key', width: 170, render: (v: string) => <Text code>{v}</Text> },
    {
      title: 'Loại',
      dataIndex: 'loai',
      width: 120,
      render: (v?: string) => (v ? <Tag color={LOAI_COLOR[v]}>{v}</Tag> : <Text type="secondary">—</Text>),
    },
    {
      title: 'Số trường',
      key: 'fields',
      width: 100,
      align: 'center',
      render: (_, r) => countFields(r.schema),
    },
    {
      title: 'Đang dùng',
      key: 'usage',
      width: 120,
      align: 'center',
      render: (_, r) => {
        const n = usage.get(r.key) ?? 0
        return n > 0 ? <Tag color="processing">{n} bước</Tag> : <Text type="secondary">chưa gán</Text>
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      render: (_, r) => {
        const n = usage.get(r.key) ?? 0
        return (
          <Space>
            <Tooltip title="Xem trước">
              <Button size="small" icon={<EyeOutlined />} onClick={() => setPreview(r)} />
            </Tooltip>
            <Tooltip title="Thiết kế trường (designer)">
              <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(r)}>Thiết kế</Button>
            </Tooltip>
            <Popconfirm
              title="Xoá biểu mẫu?"
              description={
                n > 0
                  ? `Đang được ${n} bước tham chiếu — xoá sẽ khiến các bước đó không còn biểu mẫu.`
                  : 'Thao tác này không thể hoàn tác (mock).'
              }
              okText="Xoá"
              okButtonProps={{ danger: true }}
              cancelText="Huỷ"
              onConfirm={() => {
                removeForm(r.key)
                message.success(`Đã xoá biểu mẫu "${r.ten}".`)
              }}
            >
              <Tooltip title="Xoá">
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  const boundCount = list.filter((f) => (usage.get(f.key) ?? 0) > 0).length

  return (
    <div>
      <PageHeader
        icon={<FormOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Thư viện biểu mẫu (eForm)"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Tạo biểu mẫu
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><StatCard size="small" title="Tổng biểu mẫu" value={list.length} /></Col>
        <Col xs={12} sm={6}><StatCard size="small" title="Đang được gán" value={boundCount} color="#1677ff" /></Col>
        <Col xs={12} sm={6}><StatCard size="small" title="Chưa gán" value={list.length - boundCount} color="#8c8c8c" /></Col>
        <Col xs={12} sm={6}><StatCard size="small" title="Bước đã cấu hình" value={Array.from(usage.values()).reduce((a, b) => a + b, 0)} color="#ee0033" /></Col>
      </Row>

      <Card>
        <EntityTable<FormMeta> rowKey="key" columns={columns} dataSource={list} scroll={{ y: LIST_SCROLL_Y }} />
      </Card>

      {/* Tạo biểu mẫu */}
      <Modal
        open={createOpen}
        title="Tạo biểu mẫu mới"
        okText="Tạo & mở designer"
        cancelText="Huỷ"
        onOk={submitCreate}
        onCancel={() => { setCreateOpen(false); createForm.resetFields() }}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="ten" label="Tên biểu mẫu" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input placeholder="VD: Phiếu đánh giá tiến độ" />
          </Form.Item>
          <Form.Item name="key" label="Mã (formKey)" tooltip="Bỏ trống để tự sinh từ tên. Đây là formKey gán vào User Task.">
            <Input placeholder="tự sinh, vd: phieu-danh-gia-tien-do" />
          </Form.Item>
          <Form.Item name="loai" label="Loại">
            <Select
              allowClear
              placeholder="Chọn loại"
              options={['Góp ý', 'Nhận xét', 'Thẩm định', 'Phê duyệt'].map((x) => ({ value: x, label: x }))}
            />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn mục đích biểu mẫu" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Xem trước */}
      <Modal
        open={!!preview}
        title={`Xem trước — ${preview?.ten ?? ''}`}
        footer={<Button onClick={() => setPreview(null)}>Đóng</Button>}
        width={640}
        destroyOnClose
        onCancel={() => setPreview(null)}
      >
        {preview && <FormRenderer schema={preview.schema} />}
      </Modal>

      {/* Designer (form-js FormEditor) */}
      <Drawer
        open={!!editing}
        title={
          <Space>
            <span>Thiết kế biểu mẫu — {editing?.ten}</span>
            {editing && <Text code>{editing.key}</Text>}
          </Space>
        }
        width="calc(100vw - var(--vht-sider-w, 230px) - 16px)"
        rootStyle={{ zIndex: 90 }}
        destroyOnClose
        onClose={closeDesigner}
        // Full-height: body flex column, hint cố định trên, designer chiếm phần còn lại.
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
        extra={
          <Space>
            <Button onClick={closeDesigner}>Huỷ</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveDesign}>Lưu thiết kế</Button>
          </Space>
        }
      >
        {editing ? (
          <>
            <Paragraph type="secondary" style={{ flex: '0 0 auto', margin: 0, padding: '8px 16px 0' }}>
              Kéo–thả các trường từ dock <Text strong>Thành phần</Text> (trái), chỉnh thuộc tính ở dock phải,
              bật <Text strong>Xem trước</Text> để thấy form render trực tiếp. Đặt <Text code>key</Text> ={' '}
              <Text code>ketLuan</Text> cho trường kết luận để hệ thống tự nhận Đồng ý/Đạt/Thông qua/Phê duyệt.
            </Paragraph>
            <div style={{ flex: 1, minHeight: 0, padding: '8px 16px 16px' }}>
              <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}><Spin tip="Đang tải trình thiết kế..." /></div>}>
                <FormDesigner ref={designerRef} schema={editing.schema} />
              </Suspense>
            </div>
          </>
        ) : (
          <Empty />
        )}
      </Drawer>
    </div>
  )
}
