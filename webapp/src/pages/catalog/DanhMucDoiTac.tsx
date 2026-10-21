/**
 * Danh mục đối tác (Partner Catalog) - Full Catalog Page
 * Route: /phan-he/PH2/danh-muc-doi-tac
 */
import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
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
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import {
  seedDanhMucDoiTac,
  DanhMucDoiTac,
  LOAI_DOI_TAC,
  LOAI_DOI_TAC_COLOR,
  TRANG_THAI_OPTIONS,
  type DanhMucDoiTacLoai,
} from '../../data/catalogDanhMucDoiTac'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  ma: string
  ten: string
  loai: DanhMucDoiTacLoai
  nganhNghe?: string
  diaChi?: string
  dienThoai?: string
  email?: string
  website?: string
  moTa?: string
  xepHang?: number
  trangThai: 'active' | 'inactive'
}

export default function DanhMucDoiTacPage() {
  const [data, setData] = useState<DanhMucDoiTac[]>(seedDanhMucDoiTac)
  const [searchText, setSearchText] = useState('')
  const [filterLoai, setFilterLoai] = useState<DanhMucDoiTacLoai | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<DanhMucDoiTac | null>(null)
  const [form] = Form.useForm<FormValues>()

  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length

  const filtered = data.filter((u) => {
    if (filterLoai && u.loai !== filterLoai) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<DanhMucDoiTac> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã đối tác', dataIndex: 'ma', key: 'ma', width: 140 },
    { title: 'Tên đối tác', dataIndex: 'ten', key: 'ten' },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 150,
      render: (v: DanhMucDoiTacLoai) => (
        <Tag color={LOAI_DOI_TAC_COLOR[v]}>{LOAI_DOI_TAC[v]}</Tag>
      ),
    },
    { title: 'Ngành nghề', dataIndex: 'nganhNghe', key: 'nganhNghe', width: 150 },
    { title: 'Điện thoại', dataIndex: 'dienThoai', key: 'dienThoai', width: 130 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200, ellipsis: true },
    {
      title: 'Xếp hạng',
      dataIndex: 'xepHang',
      key: 'xepHang',
      width: 100,
      align: 'center',
      render: (v) =>
        v ? (
          <span style={{ color: '#faad14', fontSize: 14 }}>
            {'★'.repeat(v)}{'☆'.repeat(5 - v)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
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
            title="Xóa đối tác?"
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

  function openAdd() {
    setDrawerMode('add')
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({ trangThai: 'active', loai: 'doiTac' })
    setDrawerOpen(true)
  }

  function openEdit(record: DanhMucDoiTac) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      loai: record.loai,
      nganhNghe: record.nganhNghe,
      diaChi: record.diaChi,
      dienThoai: record.dienThoai,
      email: record.email,
      website: record.website,
      moTa: record.moTa,
      xepHang: record.xepHang,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: DanhMucDoiTac = {
          id: `DT${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          loai: values.loai,
          nganhNghe: values.nganhNghe,
          diaChi: values.diaChi,
          dienThoai: values.dienThoai,
          email: values.email,
          website: values.website,
          moTa: values.moTa,
          xepHang: values.xepHang,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success(`Đã thêm đối tác "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, ma: values.ma.trim().toUpperCase(), ten: values.ten.trim(), loai: values.loai, nganhNghe: values.nganhNghe, diaChi: values.diaChi, dienThoai: values.dienThoai, email: values.email, website: values.website, moTa: values.moTa, xepHang: values.xepHang, trangThai: values.trangThai }
              : u,
          ),
        )
        message.success(`Đã cập nhật đối tác "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa đối tác')
  }

  return (
    <div>
      <PageHeader
        icon={<ShopOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Quản lý danh mục đối tác"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm đối tác
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số đối tác" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Đang sử dụng" value={active} color="#52c41a" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Ngừng sử dụng" value={total - active} color="#8c8c8c" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã, tên đối tác..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Loại đối tác"
              allowClear
              style={{ width: '100%' }}
              value={filterLoai}
              onChange={setFilterLoai}
              options={Object.entries(LOAI_DOI_TAC).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={TRANG_THAI_OPTIONS}
            />
          </Col>
          <Col xs={24} sm={6} md={8}>
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> đối tác</Text>
          </Col>
        </Row>
      </Card>

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

      <Drawer
        title={drawerMode === 'add' ? 'Thêm đối tác mới' : 'Sửa đối tác'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
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
                label="Mã đối tác"
                rules={[{ required: true, message: 'Nhập mã' }]}
              >
                <Input placeholder="VD: DT-NCC-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="loai"
                label="Loại đối tác"
                rules={[{ required: true, message: 'Chọn loại' }]}
              >
                <Select placeholder="Chọn loại">
                  {Object.entries(LOAI_DOI_TAC).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên đối tác"
            rules={[{ required: true, message: 'Nhập tên' }]}
          >
            <Input placeholder="VD: Công ty ABC Electronics" />
          </Form.Item>

          <Form.Item name="nganhNghe" label="Ngành nghề">
            <Input placeholder="VD: Linh kiện điện tử" />
          </Form.Item>

          <Form.Item name="diaChi" label="Địa chỉ">
            <TextArea rows={2} placeholder="Địa chỉ đầy đủ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dienThoai" label="Điện thoại">
                <Input placeholder="VD: 028 1234 5678" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="VD: contact@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="website" label="Website">
            <Input placeholder="VD: https://example.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="xepHang" label="Xếp hạng (1-5 sao)">
                <InputNumber style={{ width: '100%' }} min={1} max={5} placeholder="VD: 5" />
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
            <TextArea rows={3} placeholder="Mô tả thêm về đối tác này" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}