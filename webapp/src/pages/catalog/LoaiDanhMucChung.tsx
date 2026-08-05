/**
 * Loại danh mục dùng chung (Common Category Types) - Full Catalog Page
 * Route: /phan-he/PH3/loai-danh-muc-chung
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
import { AppstoreOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import { seedLoaiDanhMucChung, LoaiDanhMucChung, TRANG_THAI_OPTIONS } from '../../data/catalogLoaiDanhMucChung'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  ma: string
  ten: string
  moTa?: string
  trangThai: 'active' | 'inactive'
}

export default function LoaiDanhMucChungPage() {
  const [data, setData] = useState<LoaiDanhMucChung[]>(seedLoaiDanhMucChung)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<LoaiDanhMucChung | null>(null)
  const [form] = Form.useForm<FormValues>()

  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length
  const totalSubItems = data.reduce((sum, u) => sum + u.soDanhMuc, 0)

  const filtered = data.filter((u) => {
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<LoaiDanhMucChung> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã loại', dataIndex: 'ma', key: 'ma', width: 150 },
    { title: 'Tên loại danh mục', dataIndex: 'ten', key: 'ten' },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    { title: 'Số danh mục con', dataIndex: 'soDanhMuc', key: 'soDanhMuc', width: 130, align: 'center' },
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
            title="Xóa loại danh mục?"
            description={record.soDanhMuc > 0 ? `Có ${record.soDanhMuc} danh mục con bên trong.` : undefined}
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

  function openEdit(record: LoaiDanhMucChung) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      moTa: record.moTa,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: LoaiDanhMucChung = {
          id: `L${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          moTa: values.moTa,
          soDanhMuc: 0,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success(`Đã thêm loại danh mục "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, ma: values.ma.trim().toUpperCase(), ten: values.ten.trim(), moTa: values.moTa, trangThai: values.trangThai }
              : u,
          ),
        )
        message.success(`Đã cập nhật loại danh mục "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa loại danh mục')
  }

  return (
    <div>
      <PageHeader
        icon={<AppstoreOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Loại danh mục dùng chung"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm loại danh mục
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số loại" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Đang sử dụng" value={active} color="#52c41a" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng danh mục con" value={totalSubItems} color="#faad14" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={14} md={10}>
            <Input.Search
              placeholder="Tìm mã, tên loại danh mục..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={5} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={TRANG_THAI_OPTIONS}
            />
          </Col>
          <Col xs={12} sm={5} md={10}>
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> loại danh mục</Text>
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
        title={drawerMode === 'add' ? 'Thêm loại danh mục dùng chung' : 'Sửa loại danh mục dùng chung'}
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
                label="Mã loại danh mục"
                rules={[{ required: true, message: 'Nhập mã' }]}
              >
                <Input placeholder="VD: LINH_VUC" />
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

          <Form.Item
            name="ten"
            label="Tên loại danh mục"
            rules={[{ required: true, message: 'Nhập tên' }]}
          >
            <Input placeholder="VD: Lĩnh vực nghiên cứu" />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết loại danh mục này" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}