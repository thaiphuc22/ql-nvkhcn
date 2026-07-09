import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
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
} from '@ant-design/icons'
import { countFields, type FormMeta } from '../forms'
import { useForms } from '../store/FormContext'
import { useProcesses } from '../store/ProcessContext'
import FormRenderer from '../components/FormRenderer'
import { PageHeader, StatCard, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import HelpButton from '../components/HelpButton'

const { Text } = Typography

const ROUTE_BASE = '/phan-he/PH3/bieu-mau'

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
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { list, addForm, removeForm } = useForms()
  const { list: processes } = useProcesses()

  const [preview, setPreview] = useState<FormMeta | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm] = Form.useForm()

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
      // "Tạo & mở designer" đúng nghĩa: chuyển thẳng sang trang thiết kế cho form vừa tạo.
      navigate(`${ROUTE_BASE}/${encodeURIComponent(created.key)}/thiet-ke`)
    })
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
      render: (v?: string) => (v ? <Text>{v}</Text> : <Text type="secondary">—</Text>),
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
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`${ROUTE_BASE}/${encodeURIComponent(r.key)}/thiet-ke`)}
              >
                Thiết kế
              </Button>
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
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo biểu mẫu
            </Button>
            <HelpButton section="bieumau" />
          </Space>
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
    </div>
  )
}
