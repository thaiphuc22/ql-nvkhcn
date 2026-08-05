/**
 * Danh mục dùng chung (Common Catalog) - Full Catalog Page
 * Route: /phan-he/PH3/danh-muc-chung
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
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import { seedDanhMucChung, DanhMucChung, TRANG_THAI_OPTIONS } from '../../data/catalogDanhMucChung'
import { seedLoaiDanhMucChung } from '../../data/catalogLoaiDanhMucChung'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  ma: string
  ten: string
  loaiId: string
  giaTri?: string
  moTa?: string
  thuTu?: number
  trangThai: 'active' | 'inactive'
}

export default function DanhMucChungPage() {
  const [data, setData] = useState<DanhMucChung[]>(seedDanhMucChung)
  const [searchText, setSearchText] = useState('')
  const [filterLoai, setFilterLoai] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<DanhMucChung | null>(null)
  const [form] = Form.useForm<FormValues>()

  const loaiMap = new Map(seedLoaiDanhMucChung.map((l) => [l.id, l.ten]))
  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length

  const filtered = data.filter((u) => {
    if (filterLoai && u.loaiId !== filterLoai) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<DanhMucChung> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã danh mục', dataIndex: 'ma', key: 'ma', width: 120 },
    { title: 'Tên danh mục', dataIndex: 'ten', key: 'ten' },
    {
      title: 'Loại',
      dataIndex: 'loaiId',
      key: 'loaiId',
      width: 180,
      render: (v) => loaiMap.get(v) || v,
    },
    { title: 'Giá trị', dataIndex: 'giaTri', key: 'giaTri', width: 120 },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    { title: 'Thứ tự', dataIndex: 'thuTu', key: 'thuTu', width: 80, align: 'center' },
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
            title="Xóa danh mục?"
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
    form.setFieldsValue({ trangThai: 'active', loaiId: seedLoaiDanhMucChung[0]?.id })
    setDrawerOpen(true)
  }

  function openEdit(record: DanhMucChung) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      loaiId: record.loaiId,
      giaTri: record.giaTri,
      moTa: record.moTa,
      thuTu: record.thuTu,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: DanhMucChung = {
          id: `D${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          loaiId: values.loaiId,
          giaTri: values.giaTri,
          moTa: values.moTa,
          thuTu: values.thuTu,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success(`Đã thêm danh mục "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, ma: values.ma.trim().toUpperCase(), ten: values.ten.trim(), loaiId: values.loaiId, giaTri: values.giaTri, moTa: values.moTa, thuTu: values.thuTu, trangThai: values.trangThai }
              : u,
          ),
        )
        message.success(`Đã cập nhật danh mục "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa danh mục')
  }

  return (
    <div>
      <PageHeader
        icon={<UnorderedListOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Danh mục dùng chung"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm danh mục
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số danh mục" value={total} color="#1890ff" />
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
              placeholder="Tìm mã, tên danh mục..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Loại danh mục"
              allowClear
              style={{ width: '100%' }}
              value={filterLoai}
              onChange={setFilterLoai}
              options={seedLoaiDanhMucChung.map((l) => ({ value: l.id, label: l.ten }))}
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
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> danh mục</Text>
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
        title={drawerMode === 'add' ? 'Thêm danh mục dùng chung' : 'Sửa danh mục dùng chung'}
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
                name="loaiId"
                label="Loại danh mục"
                rules={[{ required: true, message: 'Chọn loại danh mục' }]}
              >
                <Select placeholder="Chọn loại">
                  {seedLoaiDanhMucChung.map((l) => (
                    <Select.Option key={l.id} value={l.id}>{l.ten}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="thuTu" label="Thứ tự">
                <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ma"
                label="Mã danh mục"
                rules={[{ required: true, message: 'Nhập mã' }]}
              >
                <Input placeholder="VD: AI" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="giaTri" label="Giá trị">
                <Input placeholder="VD: AI" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Nhập tên' }]}
          >
            <Input placeholder="VD: Trí tuệ nhân tạo" />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết danh mục này" />
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