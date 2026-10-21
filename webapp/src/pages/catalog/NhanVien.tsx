/**
 * Nhân viên (Employees) - Full Catalog Page
 * Route: /phan-he/PH2/nhan-vien
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
import { CloudUploadOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import { seedNhanVien, NhanVien, TRANG_THAI_NV_OPTIONS } from '../../data/catalogNhanVien'
import { seedDonVi } from '../../data/catalogDonVi'
import { seedChucDanh } from '../../data/catalogChucDanh'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  maNV: string
  hoTen: string
  ngaySinh?: string
  gioiTinh: 'nam' | 'nữ' | 'khac'
  cccd?: string
  ngayCccd?: string
  noiCccd?: string
  dienThoai?: string
  email: string
  diaChi?: string
  donViId: string
  chucDanhId: string
  ngayVaoLam?: string
  trinhDo?: string
  chuyenNganh?: string
  trangThai: 'active' | 'inactive' | 'nghiViec'
  sapId?: string
}

export default function NhanVienPage() {
  const [data, setData] = useState<NhanVien[]>(seedNhanVien)
  const [searchText, setSearchText] = useState('')
  const [filterDonVi, setFilterDonVi] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<NhanVien | null>(null)
  const [form] = Form.useForm<FormValues>()

  const donViMap = new Map(seedDonVi.map((d) => [d.id, d.ten]))
  const chucDanhMap = new Map(seedChucDanh.map((c) => [c.id, c.ten]))

  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length
  const sapCount = data.filter((u) => u.sapId).length

  const filtered = data.filter((u) => {
    if (filterDonVi && u.donViId !== filterDonVi) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.maNV.toLowerCase().includes(s) && !u.hoTen.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<NhanVien> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã NV', dataIndex: 'maNV', key: 'maNV', width: 100 },
    { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200, ellipsis: true },
    { title: 'Điện thoại', dataIndex: 'dienThoai', key: 'dienThoai', width: 130 },
    {
      title: 'Đơn vị',
      dataIndex: 'donViId',
      key: 'donViId',
      width: 150,
      render: (v) => donViMap.get(v) || v,
    },
    {
      title: 'Chức danh',
      dataIndex: 'chucDanhId',
      key: 'chucDanhId',
      width: 130,
      render: (v) => chucDanhMap.get(v) || v,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      render: (v: 'active' | 'inactive' | 'nghiViec') => {
        const opt = TRANG_THAI_NV_OPTIONS.find((o) => o.value === v)
        return <Tag color={v === 'active' ? 'green' : v === 'inactive' ? 'orange' : 'red'}>{opt?.label || v}</Tag>
      },
    },
    {
      title: 'SAP',
      dataIndex: 'sapId',
      key: 'sapId',
      width: 80,
      align: 'center',
      render: (v) => (v ? <Tag color="blue">SAP</Tag> : <Text type="secondary">—</Text>),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa nhân viên?"
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
    form.setFieldsValue({ trangThai: 'active', gioiTinh: 'nam', donViId: seedDonVi[0]?.id, chucDanhId: seedChucDanh[0]?.id })
    setDrawerOpen(true)
  }

  function openEdit(record: NhanVien) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      maNV: record.maNV,
      hoTen: record.hoTen,
      ngaySinh: record.ngaySinh,
      gioiTinh: record.gioiTinh,
      cccd: record.cccd,
      ngayCccd: record.ngayCccd,
      noiCccd: record.noiCccd,
      dienThoai: record.dienThoai,
      email: record.email,
      diaChi: record.diaChi,
      donViId: record.donViId,
      chucDanhId: record.chucDanhId,
      ngayVaoLam: record.ngayVaoLam,
      trinhDo: record.trinhDo,
      chuyenNganh: record.chuyenNganh,
      trangThai: record.trangThai,
      sapId: record.sapId,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: NhanVien = {
          id: 'NV' + Date.now().toString(36),
          maNV: values.maNV.trim().toUpperCase(),
          hoTen: values.hoTen.trim(),
          ngaySinh: values.ngaySinh,
          gioiTinh: values.gioiTinh,
          cccd: values.cccd,
          ngayCccd: values.ngayCccd,
          noiCccd: values.noiCccd,
          dienThoai: values.dienThoai,
          email: values.email.trim(),
          diaChi: values.diaChi,
          donViId: values.donViId,
          chucDanhId: values.chucDanhId,
          ngayVaoLam: values.ngayVaoLam,
          trinhDo: values.trinhDo,
          chuyenNganh: values.chuyenNganh,
          trangThai: values.trangThai,
          sapId: values.sapId,
        }
        setData((prev) => [...prev, newItem])
        message.success('Đã thêm nhân viên: ' + values.hoTen)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, maNV: values.maNV.trim().toUpperCase(), hoTen: values.hoTen.trim(), ngaySinh: values.ngaySinh, gioiTinh: values.gioiTinh, cccd: values.cccd, ngayCccd: values.ngayCccd, noiCccd: values.noiCccd, dienThoai: values.dienThoai, email: values.email.trim(), diaChi: values.diaChi, donViId: values.donViId, chucDanhId: values.chucDanhId, ngayVaoLam: values.ngayVaoLam, trinhDo: values.trinhDo, chuyenNganh: values.chuyenNganh, trangThai: values.trangThai, sapId: values.sapId }
              : u,
          ),
        )
        message.success('Đã cập nhật nhân viên: ' + values.hoTen)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa nhân viên')
  }

  return (
    <div>
      <PageHeader
        icon={<UserOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Danh mục nhân viên"
        extra={
          <Space>
            <Button icon={<CloudUploadOutlined />} onClick={() => message.info('Tích hợp SAP đang phát triển')}>
              Đồng bộ SAP
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Thêm nhân viên
            </Button>
          </Space>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Tổng số nhân viên" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Đang làm việc" value={active} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Đã đồng bộ SAP" value={sapCount} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Nghỉ việc" value={total - active} color="#8c8c8c" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã NV, họ tên, email..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Đơn vị"
              allowClear
              style={{ width: '100%' }}
              value={filterDonVi}
              onChange={setFilterDonVi}
              options={seedDonVi.map((d) => ({ value: d.id, label: d.ten }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={TRANG_THAI_NV_OPTIONS}
            />
          </Col>
          <Col xs={24} sm={6} md={8}>
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> nhân viên</Text>
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
        title={drawerMode === 'add' ? 'Thêm nhân viên mới' : 'Sửa nhân viên'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
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
                name="maNV"
                label="Mã nhân viên"
                rules={[{ required: true, message: 'Nhập mã NV' }]}
              >
                <Input placeholder="VD: VHT-0001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trangThai" label="Trạng thái" initialValue="active">
                <Select>
                  {TRANG_THAI_NV_OPTIONS.map((o) => (
                    <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
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
            <Input placeholder="VD: Nguyễn Văn An" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="VD: nv.an@viettel.com.vn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dienThoai" label="Điện thoại">
                <Input placeholder="VD: 0912 xxx xxx" />
              </Form.Item>
            </Col>
          </Row>

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
              <Form.Item name="ngayVaoLam" label="Ngày vào làm">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="donViId"
                label="Đơn vị"
                rules={[{ required: true, message: 'Chọn đơn vị' }]}
              >
                <Select placeholder="Chọn đơn vị">
                  {seedDonVi.map((d) => (
                    <Select.Option key={d.id} value={d.id}>{d.ten}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chucDanhId"
                label="Chức danh"
                rules={[{ required: true, message: 'Chọn chức danh' }]}
              >
                <Select placeholder="Chọn chức danh">
                  {seedChucDanh.map((c) => (
                    <Select.Option key={c.id} value={c.id}>{c.ten}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cccd" label="Số CCCD">
                <Input placeholder="VD: 012345678901" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ngayCccd" label="Ngày CCCD">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="noiCccd" label="Nơi CCCD">
                <Input placeholder="VD: Hà Nội" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="diaChi" label="Địa chỉ">
            <TextArea rows={2} placeholder="Địa chỉ thường trú" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trinhDo" label="Trình độ">
                <Input placeholder="VD: Thạc sĩ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="chuyenNganh" label="Chuyên ngành">
                <Input placeholder="VD: Quản trị kinh doanh" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="sapId" label="SAP ID">
            <Input placeholder="VD: SAP-NV001" disabled />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
