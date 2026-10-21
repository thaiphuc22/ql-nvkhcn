/**
 * Vai trò nhiệm vụ (Task Roles) - Full Catalog Page
 * Route: /phan-he/PH2/vai-tro-nhiem-vu
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
import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import { seedVaiTroNhiemVu, VaiTroNhiemVu, TRANG_THAI_OPTIONS } from '../../data/catalogVaiTroNhiemVu'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  ma: string
  ten: string
  moTa?: string
  quyenHan?: string[]
  donViPheDuyet?: string
  soLuongToiDa?: number
  trangThai: 'active' | 'inactive'
}

export default function VaiTroNhiemVuPage() {
  const [data, setData] = useState<VaiTroNhiemVu[]>(seedVaiTroNhiemVu)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<VaiTroNhiemVu | null>(null)
  const [form] = Form.useForm<FormValues>()

  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length

  const filtered = data.filter((u) => {
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<VaiTroNhiemVu> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã vai trò', dataIndex: 'ma', key: 'ma', width: 150 },
    { title: 'Tên vai trò nhiệm vụ', dataIndex: 'ten', key: 'ten' },
    {
      title: 'Quyền hạn',
      dataIndex: 'quyenHan',
      key: 'quyenHan',
      width: 200,
      render: (v: string[]) =>
        v?.map((q) => (
          <Tag key={q} color="blue" style={{ marginBottom: 2 }}>{q}</Tag>
        )),
    },
    { title: 'Đơn vị phê duyệt', dataIndex: 'donViPheDuyet', key: 'donViPheDuyet', width: 150 },
    { title: 'Số lượng tối đa', dataIndex: 'soLuongToiDa', key: 'soLuongToiDa', width: 120, align: 'center' },
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
            title="Xóa vai trò nhiệm vụ?"
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
    form.setFieldsValue({ trangThai: 'active', quyenHan: [] })
    setDrawerOpen(true)
  }

  function openEdit(record: VaiTroNhiemVu) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      moTa: record.moTa,
      quyenHan: record.quyenHan,
      donViPheDuyet: record.donViPheDuyet,
      soLuongToiDa: record.soLuongToiDa,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: VaiTroNhiemVu = {
          id: `VT${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          moTa: values.moTa,
          quyenHan: values.quyenHan || [],
          donViPheDuyet: values.donViPheDuyet,
          soLuongToiDa: values.soLuongToiDa,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success(`Đã thêm vai trò "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, ma: values.ma.trim().toUpperCase(), ten: values.ten.trim(), moTa: values.moTa, quyenHan: values.quyenHan || [], donViPheDuyet: values.donViPheDuyet, soLuongToiDa: values.soLuongToiDa, trangThai: values.trangThai }
              : u,
          ),
        )
        message.success(`Đã cập nhật vai trò "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa vai trò nhiệm vụ')
  }

  return (
    <div>
      <PageHeader
        icon={<SafetyOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Danh mục vai trò nhiệm vụ"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm vai trò
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số vai trò" value={total} color="#1890ff" />
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
          <Col xs={24} sm={14} md={10}>
            <Input.Search
              placeholder="Tìm mã, tên vai trò..."
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
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> vai trò</Text>
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
        title={drawerMode === 'add' ? 'Thêm vai trò nhiệm vụ' : 'Sửa vai trò nhiệm vụ'}
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
                label="Mã vai trò"
                rules={[{ required: true, message: 'Nhập mã' }]}
              >
                <Input placeholder="VD: CHU_NHIEM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soLuongToiDa" label="Số lượng tối đa">
                <Input type="number" placeholder="VD: 1" min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Nhập tên' }]}
          >
            <Input placeholder="VD: Chủ nhiệm đề tài" />
          </Form.Item>

          <Form.Item name="donViPheDuyet" label="Đơn vị phê duyệt">
            <Input placeholder="VD: Hội đồng xét duyệt" />
          </Form.Item>

          <Form.Item name="quyenHan" label="Quyền hạn">
            <Select mode="tags" placeholder="Nhập quyền hạn (VD: taoMoi, chinhSua)">
              {['taoMoi', 'chinhSua', 'xemBaoCao', 'nopBaoCao', 'pheDuyet', 'tuChoi', 'xoa'].map((q) => (
                <Select.Option key={q} value={q}>{q}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết vai trò này" />
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