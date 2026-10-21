/**
 * Thư viện nhiệm vụ (Task Library) - Full Catalog Page
 * Route: /phan-he/PH2/thu-vien-nhiem-vu
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
import { DeleteOutlined, EditOutlined, PlusOutlined, ProjectOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import {
  seedThuVienNhiemVu,
  ThuVienNhiemVu,
  LOAI_TVN,
  LOAI_TVN_COLOR,
  MUC_DO_PHUC_TAP,
  MUC_DO_PHUC_TAP_COLOR,
  TRANG_THAI_OPTIONS,
  type ThuVienNhiemVuLoai,
  type MucDoPhucTap,
} from '../../data/catalogThuVienNhiemVu'

const { Text } = Typography
const { TextArea } = Input

interface FormValues {
  ma: string
  ten: string
  loai: ThuVienNhiemVuLoai
  moTa?: string
  noiDung?: string
  sanPhamDuKien?: string
  thoiGianUocTinh?: number
  mucDoPhucTap: MucDoPhucTap
  trangThai: 'active' | 'inactive'
}

export default function ThuVienNhiemVuPage() {
  const [data, setData] = useState<ThuVienNhiemVu[]>(seedThuVienNhiemVu)
  const [searchText, setSearchText] = useState('')
  const [filterLoai, setFilterLoai] = useState<ThuVienNhiemVuLoai | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<ThuVienNhiemVu | null>(null)
  const [form] = Form.useForm<FormValues>()

  const total = data.length
  const active = data.filter((u) => u.trangThai === 'active').length
  const totalDays = data.reduce((sum, u) => sum + (u.thoiGianUocTinh || 0), 0)

  const filtered = data.filter((u) => {
    if (filterLoai && u.loai !== filterLoai) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  const columns: ColumnsType<ThuVienNhiemVu> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã thư viện', dataIndex: 'ma', key: 'ma', width: 130 },
    { title: 'Tên nhiệm vụ', dataIndex: 'ten', key: 'ten' },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 130,
      render: (v: ThuVienNhiemVuLoai) => (
        <Tag color={LOAI_TVN_COLOR[v]}>{LOAI_TVN[v]}</Tag>
      ),
    },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    {
      title: 'Mức độ phức tạp',
      dataIndex: 'mucDoPhucTap',
      key: 'mucDoPhucTap',
      width: 120,
      render: (v: MucDoPhucTap) => (
        <Tag color={MUC_DO_PHUC_TAP_COLOR[v]}>{MUC_DO_PHUC_TAP[v]}</Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'thoiGianUocTinh',
      key: 'thoiGianUocTinh',
      width: 100,
      align: 'right',
      render: (v) => (v ? `${v} ngày` : '—'),
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
            title="Xóa nhiệm vụ?"
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
    form.setFieldsValue({ trangThai: 'active', loai: 'nghienCuu', mucDoPhucTap: 'trungBinh' })
    setDrawerOpen(true)
  }

  function openEdit(record: ThuVienNhiemVu) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      loai: record.loai,
      moTa: record.moTa,
      noiDung: record.noiDung,
      sanPhamDuKien: record.sanPhamDuKien,
      thoiGianUocTinh: record.thoiGianUocTinh,
      mucDoPhucTap: record.mucDoPhucTap,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newItem: ThuVienNhiemVu = {
          id: `TV${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          loai: values.loai,
          moTa: values.moTa,
          noiDung: values.noiDung,
          sanPhamDuKien: values.sanPhamDuKien,
          thoiGianUocTinh: values.thoiGianUocTinh,
          mucDoPhucTap: values.mucDoPhucTap,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newItem])
        message.success(`Đã thêm nhiệm vụ "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? { ...u, ma: values.ma.trim().toUpperCase(), ten: values.ten.trim(), loai: values.loai, moTa: values.moTa, noiDung: values.noiDung, sanPhamDuKien: values.sanPhamDuKien, thoiGianUocTinh: values.thoiGianUocTinh, mucDoPhucTap: values.mucDoPhucTap, trangThai: values.trangThai }
              : u,
          ),
        )
        message.success(`Đã cập nhật nhiệm vụ "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    setData((prev) => prev.filter((u) => u.id !== id))
    message.success('Đã xóa nhiệm vụ')
  }

  return (
    <div>
      <PageHeader
        icon={<ProjectOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Quản lý thư viện nhiệm vụ"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm nhiệm vụ
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng số nhiệm vụ" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Đang sử dụng" value={active} color="#52c41a" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard size="small" title="Tổng thời gian" value={`${totalDays} ngày`} color="#faad14" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã, tên nhiệm vụ..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Loại"
              allowClear
              style={{ width: '100%' }}
              value={filterLoai}
              onChange={setFilterLoai}
              options={Object.entries(LOAI_TVN).map(([k, v]) => ({ value: k, label: v }))}
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
            <Text type="secondary">Kết quả: <strong>{filtered.length}</strong> nhiệm vụ</Text>
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
        title={drawerMode === 'add' ? 'Thêm nhiệm vụ mới' : 'Sửa nhiệm vụ'}
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
                label="Mã thư viện"
                rules={[{ required: true, message: 'Nhập mã' }]}
              >
                <Input placeholder="VD: TV-RD-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="loai"
                label="Loại"
                rules={[{ required: true, message: 'Chọn loại' }]}
              >
                <Select placeholder="Chọn loại">
                  {Object.entries(LOAI_TVN).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên nhiệm vụ"
            rules={[{ required: true, message: 'Nhập tên' }]}
          >
            <Input placeholder="VD: Nghiên cứu thị trường" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mucDoPhucTap"
                label="Mức độ phức tạp"
                rules={[{ required: true, message: 'Chọn mức độ' }]}
              >
                <Select placeholder="Chọn mức độ">
                  {Object.entries(MUC_DO_PHUC_TAP).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="thoiGianUocTinh" label="Thời gian ước tính (ngày)">
                <InputNumber style={{ width: '100%' }} placeholder="VD: 30" min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={2} placeholder="Mô tả ngắn về nhiệm vụ" />
          </Form.Item>

          <Form.Item name="noiDung" label="Nội dung thực hiện">
            <TextArea rows={3} placeholder="Mô tả chi tiết nội dung thực hiện" />
          </Form.Item>

          <Form.Item name="sanPhamDuKien" label="Sản phẩm dự kiến">
            <TextArea rows={2} placeholder="Các sản phẩm dự kiến tạo ra" />
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