/**
 * Chức danh (Job Titles) - Full Catalog Page
 * Route: /phan-he/PH2/chuc-danh
 */
import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SolutionOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import { seedChucDanh, ChucDanh, TRANG_THAI_OPTIONS } from '../../data/catalogChucDanh'

const { Text } = Typography
const { TextArea } = Input

interface ChucDanhFormValues {
  ma: string
  ten: string
  nhomChucDanh?: string
  capQuanLy?: number
  thuTu?: number
  moTa?: string
  trangThai: 'active' | 'inactive'
}

export default function ChucDanhPage() {
  const [data, setData] = useState<ChucDanh[]>(seedChucDanh)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<ChucDanh | null>(null)
  const [form] = Form.useForm<ChucDanhFormValues>()

  // Stats
  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length

  // Filter
  const filtered = data.filter((u) => {
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  // Columns
  const columns: ColumnsType<ChucDanh> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã chức danh', dataIndex: 'ma', key: 'ma', width: 130 },
    { title: 'Tên chức danh', dataIndex: 'ten', key: 'ten' },
    { title: 'Nhóm chức danh', dataIndex: 'nhomChucDanh' as keyof ChucDanh, key: 'nhomChucDanh', width: 150 },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (v) => (
        <Tag color={v === 'active' ? 'green' : 'default'}>
          {v === 'active' ? 'Đang sử dụng' : 'Ngừng sử dụng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa chức danh?"
            description="Thao tác này không thể hoàn tác."
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // Handlers
  function openAdd() {
    setDrawerMode('add')
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({ trangThai: 'active' })
    setDrawerOpen(true)
  }

  function openEdit(record: ChucDanh) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      nhomChucDanh: (record as any).nhomChucDanh,
      capQuanLy: (record as any).capQuanLy,
      moTa: record.moTa,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: ChucDanh = {
          id: `CD${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          moTa: values.moTa,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success(`Đã thêm chức danh "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, ma: values.ma.trim().toUpperCase(), ten: values.ten.trim(), moTa: values.moTa, trangThai: values.trangThai }
              : u,
          ),
        )
        message.success(`Đã cập nhật chức danh "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa chức danh')
  }

  const NHOM_OPTIONS = [
    'Quản lý',
    'Nghiên cứu',
    'Kỹ thuật',
    'Hành chính',
    'Tài chính',
    'Nhân sự',
  ]

  return (
    <div>
      <PageHeader
        icon={<SolutionOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Danh mục chức danh"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm chức danh
          </Button>
        }
      />

      {/* Stats */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số chức danh" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Đang sử dụng" value={active} color="#52c41a" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Ngừng sử dụng" value={total - active} color="#8c8c8c" />
        </Col>
      </Row>

      {/* Search & Filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã, tên chức danh..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={TRANG_THAI_OPTIONS}
            />
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> chức danh</Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `Tổng ${total} dòng`,
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 420px)' }}
        />
      </Card>

      {/* Drawer */}
      <Drawer
        title={drawerMode === 'add' ? 'Thêm chức danh mới' : 'Sửa chức danh'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button type="primary" onClick={handleSubmit}>
              {drawerMode === 'add' ? 'Thêm mới' : 'Lưu'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ma"
                label="Mã chức danh"
                rules={[
                  { required: true, message: 'Nhập mã chức danh' },
                  { pattern: /^[A-Z0-9-]+$/, message: 'Chỉ chấp nhận A-Z, 0-9, dấu gạch ngang' },
                ]}
              >
                <Input placeholder="VD: GD, TP, CV" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nhomChucDanh" label="Nhóm chức danh">
                <Select placeholder="Chọn nhóm" allowClear>
                  {NHOM_OPTIONS.map((n) => (
                    <Select.Option key={n} value={n}>{n}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên chức danh"
            rules={[{ required: true, message: 'Nhập tên chức danh' }]}
          >
            <Input placeholder="VD: Trưởng phòng" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="capQuanLy" label="Cấp quản lý">
                <Input type="number" placeholder="1" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trangThai" label="Trạng thái" initialValue="active">
                <Select>
                  {TRANG_THAI_OPTIONS.map((o) => (
                    <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả ngắn về chức danh này" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}