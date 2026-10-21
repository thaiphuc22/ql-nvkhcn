/**
 * Danh mục nghiệp vụ - Danh sách (Business Category List)
 * Route: /phan-he/PH2/danh-muc-nghiep-vu
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import {
  seedDanhMucNghiepVu,
  type DanhMucNghiepVu,
  TRANG_THAI_OPTIONS,
} from '../../data/catalogDanhMucNghiepVu'

const { Text } = Typography

interface FormValues {
  ma: string
  ten: string
  moTa?: string
  trangThai: 'active' | 'inactive'
  thuTuHienThi?: number
}

export default function DanhMucNghiepVuList() {
  const navigate = useNavigate()
  const [data, setData] = useState<DanhMucNghiepVu[]>(seedDanhMucNghiepVu)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<DanhMucNghiepVu | null>(null)
  const [form] = Form.useForm<FormValues>()

  const total = data.length
  const activeCount = data.filter((u) => u.trangThai === 'active').length
  const inactiveCount = data.filter((u) => u.trangThai === 'inactive').length

  const filtered = data.filter((u) => {
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<DanhMucNghiepVu> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã nghiệp vụ',
      dataIndex: 'ma',
      key: 'ma',
      width: 120,
      render: (v) => <Text code style={{ background: '#ffdad8', color: '#a80022' }}>{v}</Text>,
    },
    {
      title: 'Tên danh mục nghiệp vụ',
      dataIndex: 'ten',
      key: 'ten',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          {r.moTa && <Text type="secondary" style={{ fontSize: 12 }}>{r.moTa}</Text>}
        </Space>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'thuTuHienThi',
      key: 'thuTuHienThi',
      width: 80,
      align: 'center',
      render: (v) => v || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      align: 'center',
      render: (v) => (
        <Tag color={v === 'active' ? 'green' : 'default'}>
          {v === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'nguoiTao',
      key: 'nguoiTao',
      width: 100,
      render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 110,
      align: 'center',
      render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/phan-he/PH2/danh-muc-nghiep-vu/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục nghiệp vụ?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
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

  function openEdit(record: DanhMucNghiepVu) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      moTa: record.moTa,
      trangThai: record.trangThai,
      thuTuHienThi: record.thuTuHienThi,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: DanhMucNghiepVu = {
          id: 'DV' + Date.now().toString(36).toUpperCase(),
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          moTa: values.moTa,
          trangThai: values.trangThai,
          thuTuHienThi: values.thuTuHienThi,
          nguoiTao: 'admin',
          ngayTao: new Date().toISOString().split('T')[0],
        }
        setData((prev) => [...prev, newItem])
        message.success('Đã thêm danh mục nghiệp vụ: ' + values.ten)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? {
                  ...u,
                  ma: values.ma.trim().toUpperCase(),
                  ten: values.ten.trim(),
                  moTa: values.moTa,
                  trangThai: values.trangThai,
                  thuTuHienThi: values.thuTuHienThi,
                  ngayCapNhat: new Date().toISOString().split('T')[0],
                }
              : u,
          ),
        )
        message.success('Đã cập nhật danh mục nghiệp vụ: ' + values.ten)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa danh mục nghiệp vụ')
  }

  return (
    <div>
      <PageHeader
        icon={<SettingOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Danh muc nghiep vu"
        code="Quan ly cac loai nghiep vu trong he thong QTKHCN"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm danh mục mới
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số danh mục" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Đang hoạt động" value={activeCount} color="#52c41a" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Không hoạt động" value={inactiveCount} color="#8c8c8c" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Input.Search
              placeholder="Tìm mã, tên danh mục nghiệp vụ..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
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
          <Col xs={24} sm={6} md={10}>
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> danh mục nghiệp vụ</Text>
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
            showTotal: (total) => 'Tổng ' + total + ' dòng',
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 420px)' }}
        />
      </Card>

      <Drawer
        title={drawerMode === 'add' ? 'Thêm danh mục nghiệp vụ mới' : 'Sửa danh mục nghiệp vụ'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={540}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
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
                label="Mã nghiệp vụ"
                rules={[{ required: true, message: 'Nhập mã nghiệp vụ' }]}
              >
                <Input placeholder="VD: RD01, BC, HD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="thuTuHienThi"
                label="Thứ tự hiển thị"
              >
                <Input type="number" placeholder="VD: 1" min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên danh mục nghiệp vụ"
            rules={[{ required: true, message: 'Nhập tên danh mục' }]}
          >
            <Input placeholder="VD: Rà soát chủ trương đầu tư" />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về danh mục nghiệp vụ này" />
          </Form.Item>

          <Form.Item
            name="trangThai"
            label="Trạng thái"
            initialValue="active"
          >
            <Select>
              {TRANG_THAI_OPTIONS.map((o) => (
                <Select.Option key={o.value} value={o.value}>
                  {o.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
