/**
 * Nhân sự ngoài đơn vị (External Personnel) - Full Catalog Page
 * Route: /phan-he/PH2/nhan-su-ngoai-don-vi
 */
import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  DatePicker,
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
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import {
  seedNhanSuNgoaiDonVi,
  NhanSuNgoaiDonVi,
  VAI_TRO_NS,
  VAI_TRO_NS_COLOR,
  TRANG_THAI_OPTIONS,
  type NhanSuVaiTro,
} from '../../data/catalogNhanSuNgoaiDonVi'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  ma: string
  hoTen: string
  ngaySinh?: string
  gioiTinh: 'nam' | 'nữ' | 'khac'
  cccd?: string
  diaChi?: string
  dienThoai?: string
  email?: string
  donViCongTac?: string
  chucDanh?: string
  linhVucChuyenMon?: string
  kinhNghiemNam?: number
  vaiTro: NhanSuVaiTro
  ngayBatDauHopTac?: string
  ngayKetThucHopTac?: string
  trangThai: 'active' | 'inactive'
}

export default function NhanSuNgoaiDonViPage() {
  const [data, setData] = useState<NhanSuNgoaiDonVi[]>(seedNhanSuNgoaiDonVi)
  const [searchText, setSearchText] = useState('')
  const [filterVaiTro, setFilterVaiTro] = useState<NhanSuVaiTro | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<NhanSuNgoaiDonVi | null>(null)
  const [form] = Form.useForm<FormValues>()

  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length
  const avgExperience = data.length > 0 ? Math.round(data.reduce((sum, u) => sum + (u.kinhNghiemNam || 0), 0) / data.length) : 0

  const filtered = data.filter((u) => {
    if (filterVaiTro && u.vaiTro !== filterVaiTro) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.hoTen.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<NhanSuNgoaiDonVi> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã', dataIndex: 'ma', key: 'ma', width: 130 },
    { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Đơn vị công tác', dataIndex: 'donViCongTac', key: 'donViCongTac', width: 180 },
    { title: 'Chức danh', dataIndex: 'chucDanh', key: 'chucDanh', width: 130 },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      width: 160,
      render: (v: NhanSuVaiTro) => (
        <Tag color={VAI_TRO_NS_COLOR[v]}>{VAI_TRO_NS[v]}</Tag>
      ),
    },
    { title: 'Lĩnh vực', dataIndex: 'linhVucChuyenMon', key: 'linhVucChuyenMon', width: 150, ellipsis: true },
    { title: 'Kinh nghiệm', dataIndex: 'kinhNghiemNam', key: 'kinhNghiemNam', width: 100, align: 'center', render: (v) => (v ? v + ' năm' : '—') },
    { title: 'Điện thoại', dataIndex: 'dienThoai', key: 'dienThoai', width: 130 },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (v) => (
        <Tag color={v === 'active' ? 'green' : 'default'}>
          {v === 'active' ? 'Đang hợp tác' : 'Ngừng hợp tác'}
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
            title="Xóa nhân sự?"
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
    form.setFieldsValue({ trangThai: 'active', gioiTinh: 'nam', vaiTro: 'tuVan' })
    setDrawerOpen(true)
  }

  function openEdit(record: NhanSuNgoaiDonVi) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      hoTen: record.hoTen,
      ngaySinh: record.ngaySinh,
      gioiTinh: record.gioiTinh,
      cccd: record.cccd,
      diaChi: record.diaChi,
      dienThoai: record.dienThoai,
      email: record.email,
      donViCongTac: record.donViCongTac,
      chucDanh: record.chucDanh,
      linhVucChuyenMon: record.linhVucChuyenMon,
      kinhNghiemNam: record.kinhNghiemNam,
      vaiTro: record.vaiTro,
      ngayBatDauHopTac: record.ngayBatDauHopTac,
      ngayKetThucHopTac: record.ngayKetThucHopTac,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: NhanSuNgoaiDonVi = {
          id: 'NS' + Date.now().toString(36),
          ma: values.ma.trim().toUpperCase(),
          hoTen: values.hoTen.trim(),
          ngaySinh: values.ngaySinh,
          gioiTinh: values.gioiTinh,
          cccd: values.cccd,
          diaChi: values.diaChi,
          dienThoai: values.dienThoai,
          email: values.email,
          donViCongTac: values.donViCongTac,
          chucDanh: values.chucDanh,
          linhVucChuyenMon: values.linhVucChuyenMon,
          kinhNghiemNam: values.kinhNghiemNam,
          vaiTro: values.vaiTro,
          ngayBatDauHopTac: values.ngayBatDauHopTac,
          ngayKetThucHopTac: values.ngayKetThucHopTac,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success('Đã thêm nhân sự: ' + values.hoTen)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, ma: values.ma.trim().toUpperCase(), hoTen: values.hoTen.trim(), ngaySinh: values.ngaySinh, gioiTinh: values.gioiTinh, cccd: values.cccd, diaChi: values.diaChi, dienThoai: values.dienThoai, email: values.email, donViCongTac: values.donViCongTac, chucDanh: values.chucDanh, linhVucChuyenMon: values.linhVucChuyenMon, kinhNghiemNam: values.kinhNghiemNam, vaiTro: values.vaiTro, ngayBatDauHopTac: values.ngayBatDauHopTac, ngayKetThucHopTac: values.ngayKetThucHopTac, trangThai: values.trangThai }
              : u,
          ),
        )
        message.success('Đã cập nhật nhân sự: ' + values.hoTen)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa nhân sự')
  }

  return (
    <div>
      <PageHeader
        icon={<TeamOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Nhân sự ngoài đơn vị"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm nhân sự
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số nhân sự" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Đang hợp tác" value={active} color="#52c41a" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Kinh nghiệm TB" value={avgExperience + ' năm'} color="#faad14" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã, họ tên..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Vai trò"
              allowClear
              style={{ width: '100%' }}
              value={filterVaiTro}
              onChange={setFilterVaiTro}
              options={Object.entries(VAI_TRO_NS).map(([k, v]) => ({ value: k, label: v }))}
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
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> nhân sự</Text>
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
        title={drawerMode === 'add' ? 'Thêm nhân sự ngoài đơn vị' : 'Sửa nhân sự'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
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
                label="Mã nhân sự"
                rules={[{ required: true, message: 'Nhập mã' }]}
              >
                <Input placeholder="VD: NS-NDV-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vaiTro" label="Vai trò" rules={[{ required: true, message: 'Chọn vai trò' }]}>
                <Select placeholder="Chọn vai trò">
                  {Object.entries(VAI_TRO_NS).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="hoTen"
            label="Họ tên"
            rules={[{ required: true, message: 'Nhập họ tên' }]}
          >
            <Input placeholder="VD: GS.TS. Phạm Hùng" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gioiTinh" label="Giới tính" initialValue="nam">
                <Select>
                  <Select.Option value="nam">Nam</Select.Option>
                  <Select.Option value="nữ">Nữ</Select.Option>
                  <Select.Option value="khac">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ngaySinh" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="kinhNghiemNam" label="Kinh nghiệm (năm)">
                <InputNumber style={{ width: '100%' }} min={0} max={60} placeholder="VD: 25" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="cccd" label="Số CCCD">
            <Input placeholder="VD: 012345678901" />
          </Form.Item>

          <Form.Item name="diaChi" label="Địa chỉ">
            <TextArea rows={2} placeholder="Địa chỉ thường trú" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dienThoai" label="Điện thoại">
                <Input placeholder="VD: 0912 xxx xxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="VD: name@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="donViCongTac" label="Đơn vị công tác">
            <Input placeholder="VD: Đại học Quốc gia Hà Nội" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="chucDanh" label="Chức danh">
                <Input placeholder="VD: Giáo sư" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="linhVucChuyenMon" label="Lĩnh vực chuyên môn">
                <Input placeholder="VD: Công nghệ thông tin" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ngayBatDauHopTac" label="Ngày bắt đầu hợp tác">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ngayKetThucHopTac" label="Ngày kết thúc hợp tác">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

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
