/**
 * PH2 - Quản trị người dùng
 * Route: /phan-he/PH2/nguoi-dung
 *
 * User management for PH2 subsystem:
 * - List all users with roles
 * - Add/Edit/Remove user-role assignments
 * - View user details and activity
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
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Avatar,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'

const { Text } = Typography

// ─── Types ────────────────────────────────────────────────────────────────────
interface NguoiDung {
  id: string
  hoTen: string
  email: string
  chucDanh: string
  donVi: string
  vaiTro: string[]
  trangThai: 'active' | 'inactive'
  ngayThamGia: string
  dangHoatDong: boolean
}

// ─── Seed Data ───────────────────────────────────────────────────────────────
const seedNguoiDung: NguoiDung[] = [
  {
    id: 'ND001',
    hoTen: 'Nguyen Van A',
    email: 'nguyenvana@vht.vn',
    chucDanh: 'Truong phong KHCN',
    donVi: 'TT Nghiên cứu Vô tuyến',
    vaiTro: ['truong-phong', 'chu-nhiem-de-tai'],
    trangThai: 'active',
    ngayThamGia: '2024-03-15',
    dangHoatDong: true,
  },
  {
    id: 'ND002',
    hoTen: 'Tran Thi B',
    email: 'tranthib@vht.vn',
    chucDanh: 'Chuyen vien KHCN',
    donVi: 'TT Nghiên cứu Vô tuyến',
    vaiTro: ['chuyen-vien'],
    trangThai: 'active',
    ngayThamGia: '2024-05-20',
    dangHoatDong: true,
  },
  {
    id: 'ND003',
    hoTen: 'Le Van C',
    email: 'levanc@vht.vn',
    chucDanh: 'Truong phong',
    donVi: 'TT Nghiên cứu Viễn thông',
    vaiTro: ['truong-phong'],
    trangThai: 'active',
    ngayThamGia: '2023-11-10',
    dangHoatDong: true,
  },
  {
    id: 'ND004',
    hoTen: 'Pham Thi D',
    email: 'phamthid@vht.vn',
    chucDanh: 'Chuyen vien',
    donVi: 'TT Nghiên cứu Viễn thông',
    vaiTro: ['chuyen-vien', 'thu-ky-hoi-dong'],
    trangThai: 'inactive',
    ngayThamGia: '2024-01-05',
    dangHoatDong: false,
  },
  {
    id: 'ND005',
    hoTen: 'Hoang Van E',
    email: 'hoangvane@vht.vn',
    chucDanh: 'Giam doc',
    donVi: 'TT Nghiên cứu Vô tuyến',
    vaiTro: ['giam-doc'],
    trangThai: 'active',
    ngayThamGia: '2022-06-01',
    dangHoatDong: true,
  },
]

const VAITRO_OPTIONS = [
  { value: 'giam-doc', label: 'Giám đốc' },
  { value: 'truong-phong', label: 'Trưởng phòng' },
  { value: 'chu-nhiem-de-tai', label: 'Chủ nhiệm đề tài' },
  { value: 'chuyen-vien', label: 'Chuyên viên' },
  { value: 'thu-ky-hoi-dong', label: 'Thư ký hội đồng' },
  { value: 'thanh-vien-hoi-dong', label: 'Thành viên hội đồng' },
]

const DONVI_OPTIONS = [
  'TT Nghiên cứu Vô tuyến',
  'TT Nghiên cứu Viễn thông',
  'TT Nghiên cứu Điện tử',
  'TT Nghiên cứu Cơ điện tử',
  'Phòng KHCN & Đào tạo',
  'Phòng Tài chính',
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function NguoiDungPH2() {
  const [data] = useState<NguoiDung[]>(seedNguoiDung)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<NguoiDung | null>(null)
  const [form] = Form.useForm()

  const filtered = data.filter((item) => {
    if (filterStatus && item.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      const match =
        item.hoTen.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        item.donVi.toLowerCase().includes(s) ||
        item.chucDanh.toLowerCase().includes(s)
      if (!match) return false
    }
    return true
  })

  const columns: ColumnsType<NguoiDung> = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 250,
      render: (_, r) => (
        <Space size={12}>
          <Avatar
            style={{
              background: r.trangThai === 'active' ? '#52c41a' : '#d9d9d9',
              flexShrink: 0,
            }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{r.hoTen}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Chức danh',
      dataIndex: 'chucDanh',
      key: 'chucDanh',
      width: 180,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donVi',
      key: 'donVi',
      width: 200,
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      width: 220,
      render: (vaiTro: string[]) => (
        <Space size={4} wrap>
          {vaiTro.map((vt) => {
            const opt = VAITRO_OPTIONS.find((o) => o.value === vt)
            const color =
              vt === 'giam-doc'
                ? 'red'
                : vt === 'truong-phong'
                  ? 'orange'
                  : vt.includes('hoi-dong')
                    ? 'purple'
                    : 'blue'
            return (
              <Tag key={vt} color={color} style={{ marginRight: 0 }}>
                {opt?.label ?? vt}
              </Tag>
            )
          })}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 100,
      align: 'center',
      render: (v: 'active' | 'inactive') => (
        <Tag color={v === 'active' ? 'success' : 'default'}>
          {v === 'active' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => {
                setSelectedUser(r)
                setDrawerOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Phân quyền">
            <Button
              type="text"
              size="small"
              icon={<LockOutlined />}
              onClick={() => {
                setEditingId(r.id)
                form.setFieldsValue({
                  hoTen: r.hoTen,
                  email: r.email,
                  chucDanh: r.chucDanh,
                  donVi: r.donVi,
                  vaiTro: r.vaiTro,
                })
                setModalOpen(true)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng?"
            description={`Bạn có chắc muốn xóa "${r.hoTen}"?`}
            onConfirm={() => message.success('Đã xóa người dùng')}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<UserOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Quan tri nguoi dung"
        code="Quan ly tai khoan va vai tro nguoi dung PH2"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              setModalOpen(true)
            }}
          >
            Them nguoi dung
          </Button>
        }
      />

      <Card
        size="small"
        styles={{ body: { padding: 0 } }}
      >
        {/* Filters */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Row gutter={12} align="middle">
            <Col flex="auto">
              <Input
                placeholder="Tim kiem theo ten, email, don vi..."
                prefix={<SearchOutlined style={{ color: '#bf0027' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ maxWidth: 360 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Loc trang thai"
                value={filterStatus}
                onChange={setFilterStatus}
                allowClear
                style={{ width: 150 }}
                options={[
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'inactive', label: 'Tạm khóa' },
                ]}
              />
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {filtered.length} nguoi dung
              </Text>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} người dùng`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingId ? 'Chinh sua nguoi dung' : 'Them nguoi dung moi'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingId(null)
          form.resetFields()
        }}
        footer={null}
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={() => {
            if (editingId) {
              message.success('Cap nhat thanh cong')
            } else {
              message.success('Them moi thanh cong')
            }
            setModalOpen(false)
            setEditingId(null)
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="hoTen"
                label="Ho va ten"
                rules={[{ required: true, message: 'Vui long nhap ho ten' }]}
              >
                <Input placeholder="Nguyen Van A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui long nhap email' },
                  { type: 'email', message: 'Email khong hop le' },
                ]}
              >
                <Input placeholder="nguyenvana@vht.vn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="chucDanh" label="Chuc danh">
                <Input placeholder="Truong phong KHCN" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="donVi" label="Don vi">
                <Select
                  placeholder="Chon don vi"
                  options={DONVI_OPTIONS.map((v) => ({ value: v, label: v }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="vaiTro" label="Vai tro">
                <Select
                  mode="multiple"
                  placeholder="Chon vai tro"
                  options={VAITRO_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Huy</Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cap nhat' : 'Them moi'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* User Detail Drawer */}
      <Drawer
        title="Chi tiet nguoi dung"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedUser(null)
        }}
        width={400}
      >
        {selectedUser && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', paddingBottom: 16 }}>
              <Avatar
                size={72}
                style={{
                  background: selectedUser.trangThai === 'active' ? '#52c41a' : '#d9d9d9',
                  marginBottom: 8,
                }}
                icon={<UserOutlined />}
              />
              <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedUser.hoTen}</div>
              <Text type="secondary">{selectedUser.email}</Text>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Chức danh</Text>
              <div>{selectedUser.chucDanh}</div>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Đơn vị</Text>
              <div>{selectedUser.donVi}</div>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Vai trò</Text>
              <div>
                <Space size={4} wrap>
                  {selectedUser.vaiTro.map((vt) => {
                    const opt = VAITRO_OPTIONS.find((o) => o.value === vt)
                    return (
                      <Tag key={vt} color="blue">
                        {opt?.label ?? vt}
                      </Tag>
                    )
                  })}
                </Space>
              </div>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Trạng thái</Text>
              <div>
                <Tag color={selectedUser.trangThai === 'active' ? 'success' : 'default'}>
                  {selectedUser.trangThai === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                </Tag>
              </div>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Ngày tham gia</Text>
              <div>{selectedUser.ngayThamGia}</div>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  )
}