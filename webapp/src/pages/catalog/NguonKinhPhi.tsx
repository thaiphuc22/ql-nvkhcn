/**
 * Nguồn kinh phí (Funding Sources) - Full Catalog Page
 * Route: /phan-he/PH2/nguon-kinh-phi
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
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, WalletOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import {
  seedNguonKinhPhi,
  NguonKinhPhi,
  LOAI_NGUON_KINH_PHI,
  LOAI_NGUON_KINH_PHI_COLOR,
  TRANG_THAI_OPTIONS,
  type NguonKinhPhiLoai,
} from '../../data/catalogNguonKinhPhi'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  ma: string
  ten: string
  loai: NguonKinhPhiLoai
  donViCungCap?: string
  lienHe?: string
  namBatDau?: number
  namKetThuc?: number
  tongDuToan?: number
  moTa?: string
  trangThai: 'active' | 'inactive'
}

export default function NguonKinhPhiPage() {
  const [data, setData] = useState<NguonKinhPhi[]>(seedNguonKinhPhi)
  const [searchText, setSearchText] = useState('')
  const [filterLoai, setFilterLoai] = useState<NguonKinhPhiLoai | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<NguonKinhPhi | null>(null)
  const [form] = Form.useForm<FormValues>()

  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length
  const totalBudget = data.reduce((sum, u) => sum + (u.tongDuToan || 0), 0)

  const filtered = data.filter((u) => {
    if (filterLoai && u.loai !== filterLoai) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<NguonKinhPhi> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã nguồn', dataIndex: 'ma', key: 'ma', width: 150 },
    { title: 'Tên nguồn kinh phí', dataIndex: 'ten', key: 'ten' },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 160,
      render: (v: NguonKinhPhiLoai) => (
        <Tag color={LOAI_NGUON_KINH_PHI_COLOR[v]}>{LOAI_NGUON_KINH_PHI[v]}</Tag>
      ),
    },
    { title: 'Đơn vị cung cấp', dataIndex: 'donViCungCap', key: 'donViCungCap', width: 180 },
    {
      title: 'Tổng dự toán',
      dataIndex: 'tongDuToan',
      key: 'tongDuToan',
      width: 160,
      align: 'right',
      render: (v) => (v ? `${v.toLocaleString('vi-VN')} VNĐ` : '—'),
    },
    { title: 'Năm', dataIndex: 'namBatDau', key: 'namBatDau', width: 80 },
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
            title="Xóa nguồn kinh phí?"
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
    form.setFieldsValue({ trangThai: 'active' })
    setDrawerOpen(true)
  }

  function openEdit(record: NguonKinhPhi) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      loai: record.loai,
      donViCungCap: record.donViCungCap,
      lienHe: record.lienHe,
      namBatDau: record.namBatDau,
      namKetThuc: record.namKetThuc,
      tongDuToan: record.tongDuToan,
      moTa: record.moTa,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: NguonKinhPhi = {
          id: `NKP${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          loai: values.loai,
          donViCungCap: values.donViCungCap,
          lienHe: values.lienHe,
          namBatDau: values.namBatDau,
          namKetThuc: values.namKetThuc,
          tongDuToan: values.tongDuToan,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success(`Đã thêm nguồn kinh phí "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? {
                  ...u,
                  ma: values.ma.trim().toUpperCase(),
                  ten: values.ten.trim(),
                  loai: values.loai,
                  donViCungCap: values.donViCungCap,
                  lienHe: values.lienHe,
                  namBatDau: values.namBatDau,
                  namKetThuc: values.namKetThuc,
                  tongDuToan: values.tongDuToan,
                  trangThai: values.trangThai,
                }
              : u,
          ),
        )
        message.success(`Đã cập nhật nguồn kinh phí "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa nguồn kinh phí')
  }

  return (
    <div>
      <PageHeader
        icon={<WalletOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Danh mục nguồn kinh phí"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm nguồn kinh phí
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Tổng số nguồn" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Đang sử dụng" value={active} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Tổng dự toán" value={`${(totalBudget / 1e9).toFixed(1)} tỷ`} color="#faad14" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Ngừng sử dụng" value={total - active} color="#8c8c8c" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã, tên nguồn kinh phí..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Loại nguồn"
              allowClear
              style={{ width: '100%' }}
              value={filterLoai}
              onChange={setFilterLoai}
              options={Object.entries(LOAI_NGUON_KINH_PHI).map(([k, v]) => ({ value: k, label: v }))}
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
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> nguồn kinh phí</Text>
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
        title={drawerMode === 'add' ? 'Thêm nguồn kinh phí mới' : 'Sửa nguồn kinh phí'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
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
                label="Mã nguồn kinh phí"
                rules={[{ required: true, message: 'Nhập mã' }]}
              >
                <Input placeholder="VD: NSNN-2024" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="loai"
                label="Loại nguồn"
                rules={[{ required: true, message: 'Chọn loại' }]}
              >
                <Select placeholder="Chọn loại">
                  {Object.entries(LOAI_NGUON_KINH_PHI).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên nguồn kinh phí"
            rules={[{ required: true, message: 'Nhập tên' }]}
          >
            <Input placeholder="VD: Ngân sách nhà nước 2024" />
          </Form.Item>

          <Form.Item name="donViCungCap" label="Đơn vị cung cấp">
            <Input placeholder="VD: Bộ Khoa học và Công nghệ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="namBatDau" label="Năm bắt đầu">
                <InputNumber style={{ width: '100%' }} placeholder="2024" min={1900} max={2100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="namKetThuc" label="Năm kết thúc">
                <InputNumber style={{ width: '100%' }} placeholder="2024" min={1900} max={2100} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tongDuToan" label="Tổng dự toán (VNĐ)">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="VD: 500000000000"
              min={0}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number(String(v).replace(/,/g, '')) as unknown as 0}
            />
          </Form.Item>

          <Form.Item name="lienHe" label="Liên hệ">
            <Input placeholder="VD: contact@example.com" />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả thêm về nguồn kinh phí này" />
          </Form.Item>

          <Form.Item name="trangThai" label="Trạng thái" initialValue="active">
            <Select>
              {TRANG_THAI_OPTIONS.map((o) => (
                <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}