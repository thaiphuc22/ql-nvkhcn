import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
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
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  FormOutlined,
  PlusOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { countFields, type FormMeta } from '../forms'
import { useForms } from '../store/FormContext'
import { useProcesses } from '../store/ProcessContext'
import FormRenderer from '../components/FormRenderer'
import { PageHeader, StatCard, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import HelpButton from '../components/HelpButton'
import {
  NHOM_RD,
  NHOM_RD_ORDER,
  NHOM_RD_PILL_COLOR,
  nhomRDLabel,
  type NhomRD,
} from '../eform-nhom-rd'

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
  const { message, modal } = App.useApp()
  const { list, addForm, removeForm, seedRD07, clearRD07Seed } = useForms()
  const { list: processes } = useProcesses()

  const [preview, setPreview] = useState<FormMeta | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm] = Form.useForm()
  const [nhomRDFilter, setNhomRDFilter] = useState<NhomRD | null>(null)

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

  // Đếm form theo từng Nhóm RD — hiển thị "(N)" trên dropdown option.
  const nhomRDCounts = useMemo(() => {
    const m = {} as Record<NhomRD, number>
    for (const code of NHOM_RD_ORDER) m[code] = 0
    for (const f of list) {
      if (f.nhomRD) m[f.nhomRD] += 1
    }
    return m
  }, [list])

  // Filter list theo Nhóm RD (search chưa có — giữ UI gọn).
  const filteredList = useMemo(() => {
    if (!nhomRDFilter) return list
    return list.filter((f) => f.nhomRD === nhomRDFilter)
  }, [list, nhomRDFilter])

  // Có ít nhất 1 form seed RD07 trong list không?
  const hasRD07Seed = useMemo(() => list.some((f) => f.key.startsWith('bm-07-')), [list])

  function handleSeedRD07() {
    const { added } = seedRD07()
    message.success(
      `Đã nạp / làm mới ${added} biểu mẫu mẫu RD07 (B1–B7 · đủ/không đủ căn cứ).`,
    )
  }

  function handleClearRD07Seed() {
    modal.confirm({
      title: 'Xoá hết biểu mẫu mẫu RD07?',
      content:
        'Tất cả biểu mẫu có mã bắt đầu "bm-07-" sẽ bị xoá khỏi thư viện. Các biểu mẫu khác (nếu có) sẽ được giữ nguyên.',
      okText: 'Xoá hết',
      okButtonProps: { danger: true },
      cancelText: 'Huỷ',
      onOk: () => {
        const removed = clearRD07Seed()
        message.success(`Đã xoá ${removed} biểu mẫu mẫu RD07.`)
      },
    })
  }

  function submitCreate() {
    createForm.validateFields().then((v) => {
      const key = slugify(v.key || v.ten)
      const created = addForm({
        key,
        ten: v.ten,
        moTa: v.moTa,
        loai: v.loai,
        nhomRD: v.nhomRD,
      })
      if (!created) {
        message.error(`Mã biểu mẫu "${key}" đã tồn tại hoặc không hợp lệ.`)
        return
      }
      message.success(`Đã tạo biểu mẫu "${v.ten}".`)
      setCreateOpen(false)
      createForm.resetFields()
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
      title: 'Nhóm RD',
      dataIndex: 'nhomRD',
      key: 'nhomRD',
      width: 120,
      render: (code?: NhomRD) => {
        if (!code) return <Text type="secondary">—</Text>
        const color = NHOM_RD_PILL_COLOR[code]
        return (
          <Tag
            style={{
              backgroundColor: color,
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              margin: 0,
            }}
            title={NHOM_RD[code]}
          >
            {code}
          </Tag>
        )
      },
    },
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

  const boundCount = filteredList.filter((f) => (usage.get(f.key) ?? 0) > 0).length
  const totalCount = list.length
  const showSeedBanner = hasRD07Seed

  return (
    <div>
      <PageHeader
        icon={<FormOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Thư viện biểu mẫu (eForm)"
        extra={
          <Space wrap>
            <Button icon={<FilterOutlined />} onClick={handleSeedRD07}>
              Nạp biểu mẫu mẫu RD07
            </Button>
            {hasRD07Seed && (
              <Button icon={<ClearOutlined />} danger onClick={handleClearRD07Seed}>
                Xoá hết biểu mẫu mẫu
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo biểu mẫu
            </Button>
            <HelpButton section="bieumau" />
          </Space>
        }
      />

      {showSeedBanner && (
        <Alert
          banner
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="Đang hiển thị biểu mẫu mẫu RD07"
          description={
            <>
              Một số biểu mẫu trong thư viện là dữ liệu mẫu tạm thời (RD07 — Quản lý Danh mục SPDV, 7 bước). Bấm{' '}
              <strong>"Xoá hết biểu mẫu mẫu"</strong> ở header để reset về danh sách ban đầu.
            </>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard
            size="small"
            title="Tổng biểu mẫu"
            value={nhomRDFilter ? `${filteredList.length}/${totalCount}` : totalCount}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Đang được gán" value={boundCount} color="#1677ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            size="small"
            title="Chưa gán"
            value={filteredList.length - boundCount}
            color="#8c8c8c"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            size="small"
            title="Bước đã cấu hình"
            value={Array.from(usage.values()).reduce((a, b) => a + b, 0)}
            color="#ee0033"
          />
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 12 }} wrap>
          <Text strong>Lọc:</Text>
          <Select
            allowClear
            placeholder="Lọc theo nhóm RD..."
            style={{ width: 280 }}
            value={nhomRDFilter ?? undefined}
            onChange={(v) => setNhomRDFilter((v ?? null) as NhomRD | null)}
            options={NHOM_RD_ORDER.map((code) => ({
              value: code,
              label: `${nhomRDLabel(code)} (${nhomRDCounts[code]})`,
            }))}
          />
          {nhomRDFilter && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiển thị {filteredList.length}/{totalCount} biểu mẫu thuộc nhóm <strong>{nhomRDFilter}</strong>.
            </Text>
          )}
        </Space>
        <EntityTable<FormMeta>
          rowKey="key"
          columns={columns}
          dataSource={filteredList}
          scroll={{ y: LIST_SCROLL_Y }}
          emptyText={
            nhomRDFilter
              ? `Không có biểu mẫu nào thuộc nhóm ${nhomRDFilter}.`
              : 'Chưa có biểu mẫu nào trong thư viện.'
          }
        />
      </Card>

      {/* Tạo biểu mẫu */}
      <Modal
        open={createOpen}
        title="Tạo biểu mẫu mới"
        okText="Tạo & mở designer"
        cancelText="Huỷ"
        onOk={submitCreate}
        onCancel={() => {
          setCreateOpen(false)
          createForm.resetFields()
        }}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="ten" label="Tên biểu mẫu" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input placeholder="VD: Phiếu đánh giá tiến độ" />
          </Form.Item>
          <Form.Item
            name="key"
            label="Mã (formKey)"
            tooltip="Bỏ trống để tự sinh từ tên. Đây là formKey gán vào User Task."
          >
            <Input placeholder="tự sinh, vd: phieu-danh-gia-tien-do" />
          </Form.Item>
          <Form.Item name="nhomRD" label="Nhóm RD" tooltip="Để trống nếu biểu mẫu chưa gắn với luồng quy trình cụ thể.">
            <Select
              allowClear
              placeholder="Chọn nhóm quy trình RD"
              options={NHOM_RD_ORDER.map((code) => ({
                value: code,
                label: nhomRDLabel(code),
              }))}
            />
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
