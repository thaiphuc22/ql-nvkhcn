/**
 * PH2 - Phan quyen
 * Route: /phan-he/PH2/phan-quyen
 *
 * Role-based access control for PH2 subsystem:
 * - Role matrix management
 * - Permission assignment by role
 * - User-role mapping
 */
import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  Badge,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  KeyOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  LockOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'

const { Text } = Typography

// ─── Types ────────────────────────────────────────────────────────────────────
interface VaiTro {
  id: string
  ma: string
  ten: string
  moTa: string
  soNguoi: number
  quyenCount: number
  trangThai: 'active' | 'inactive'
  permissions: string[]
}

interface Permission {
  key: string
  label: string
  description: string
  module: string
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const PERMISSIONS: Permission[] = [
  { key: 'ph2.xem-tong-quan', label: 'Xem tổng quan', description: 'Truy cập dashboard PH2', module: 'Tổng quan' },
  { key: 'ph2.don-vi.xem', label: 'Xem đơn vị', description: 'Xem danh sách đơn vị', module: 'Đơn vị' },
  { key: 'ph2.don-vi.them', label: 'Thêm đơn vị', description: 'Tạo đơn vị mới', module: 'Đơn vị' },
  { key: 'ph2.don-vi.sua', label: 'Sửa đơn vị', description: 'Chỉnh sửa thông tin đơn vị', module: 'Đơn vị' },
  { key: 'ph2.don-vi.xoa', label: 'Xóa đơn vị', description: 'Xóa đơn vị', module: ' ' },
  { key: 'ph2.nhan-vien.xem', label: 'Xem nhân viên', description: 'Xem danh sách nhân viên', module: 'Nhân viên' },
  { key: 'ph2.nhan-vien.them', label: 'Thêm nhân viên', description: 'Tạo nhân viên mới', module: 'Nhân viên' },
  { key: 'ph2.nhan-vien.sua', label: 'Sửa nhân viên', description: 'Chỉnh sửa thông tin nhân viên', module: 'Nhân viên' },
  { key: 'ph2.bao-cao.xem', label: 'Xem báo cáo', description: 'Truy cập module báo cáo', module: 'Báo cáo' },
  { key: 'ph2.bao-cao.tao', label: 'Tạo báo cáo', description: 'Tạo báo cáo mới', module: 'Báo cáo' },
  { key: 'ph2.thong-bao.xem', label: 'Xem thông báo', description: 'Truy cập cấu hình thông báo', module: 'Thông báo' },
  { key: 'ph2.danh-muc.xem', label: 'Xem danh mục', description: 'Truy cập danh mục dùng chung', module: 'Danh mục' },
  { key: 'ph2.danh-muc.them', label: 'Thêm danh mục', description: 'Tạo mục mới', module: 'Danh mục' },
  { key: 'ph2.nguoi-dung.xem', label: 'Xem người dùng', description: 'Xem danh sách người dùng', module: 'Người dùng' },
  { key: 'ph2.nguoi-dung.them', label: 'Thêm người dùng', description: 'Tạo người dùng mới', module: 'Người dùng' },
  { key: 'ph2.phan-quyen.xem', label: 'Xem phân quyền', description: 'Truy cập module phân quyền', module: 'Phân quyền' },
  { key: 'ph2.phan-quyen.sua', label: 'Sửa phân quyền', description: 'Thay đổi phân quyền', module: 'Phân quyền' },
]

const seedVaiTro: VaiTro[] = [
  {
    id: 'vt001',
    ma: 'giam-doc',
    ten: 'Giám đốc',
    moTa: 'Toàn quyền quản trị hệ thống PH2',
    soNguoi: 3,
    quyenCount: 17,
    trangThai: 'active',
    permissions: PERMISSIONS.map((p) => p.key),
  },
  {
    id: 'vt002',
    ma: 'truong-phong',
    ten: 'Trưởng phòng',
    moTa: 'Quản lý phòng ban và nhân sự',
    soNguoi: 8,
    quyenCount: 12,
    trangThai: 'active',
    permissions: [
      'ph2.xem-tong-quan',
      'ph2.don-vi.xem',
      'ph2.don-vi.sua',
      'ph2.nhan-vien.xem',
      'ph2.nhan-vien.them',
      'ph2.nhan-vien.sua',
      'ph2.bao-cao.xem',
      'ph2.bao-cao.tao',
      'ph2.thong-bao.xem',
      'ph2.danh-muc.xem',
      'ph2.danh-muc.them',
      'ph2.nguoi-dung.xem',
    ],
  },
  {
    id: 'vt003',
    ma: 'chuyen-vien',
    ten: 'Chuyên viên',
    moTa: 'Thực hiện nghiệp vụ cơ bản',
    soNguoi: 24,
    quyenCount: 6,
    trangThai: 'active',
    permissions: [
      'ph2.xem-tong-quan',
      'ph2.don-vi.xem',
      'ph2.nhan-vien.xem',
      'ph2.bao-cao.xem',
      'ph2.danh-muc.xem',
      'ph2.nguoi-dung.xem',
    ],
  },
  {
    id: 'vt004',
    ma: 'thu-ky',
    ten: 'Thư ký Hội đồng',
    moTa: 'Hỗ trợ họp Hội đồng xét duyệt',
    soNguoi: 4,
    quyenCount: 5,
    trangThai: 'active',
    permissions: [
      'ph2.xem-tong-quan',
      'ph2.bao-cao.xem',
      'ph2.bao-cao.tao',
      'ph2.thong-bao.xem',
      'ph2.danh-muc.xem',
    ],
  },
  {
    id: 'vt005',
    ma: 'quan-ly-nguoi-dung',
    ten: 'Quản lý người dùng',
    moTa: 'Quản trị tài khoản người dùng',
    soNguoi: 2,
    quyenCount: 8,
    trangThai: 'active',
    permissions: [
      'ph2.xem-tong-quan',
      'ph2.nguoi-dung.xem',
      'ph2.nguoi-dung.them',
      'ph2.phan-quyen.xem',
      'ph2.phan-quyen.sua',
      'ph2.thong-bao.xem',
      'ph2.danh-muc.xem',
      'ph2.bao-cao.xem',
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function PhanQuyenPH2() {
  const [data, setData] = useState<VaiTro[]>(seedVaiTro)
  const [modalOpen, setModalOpen] = useState(false)
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedVaiTro, setSelectedVaiTro] = useState<VaiTro | null>(null)
  const [permissionList, setPermissionList] = useState<string[]>([])
  const [form] = Form.useForm()

  // Group permissions by module
  const permissionsByModule = PERMISSIONS.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {} as Record<string, Permission[]>)

  const columns: ColumnsType<VaiTro> = [
    {
      title: 'Vai trò',
      key: 'vaiTro',
      width: 250,
      render: (_, r) => (
        <Space size={12}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: r.trangThai === 'active' ? '#1890ff15' : '#f0f0f0',
              color: r.trangThai === 'active' ? '#1890ff' : '#999',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <SafetyOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>
              {r.ten}
              {r.id === 'vt001' && (
                <Tag color="red" style={{ marginLeft: 6, fontSize: 10 }}>
                  Admin
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.moTa}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Mã vai trò',
      dataIndex: 'ma',
      key: 'ma',
      width: 160,
      render: (v: string) => (
        <code style={{ fontSize: 12, background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>
          {v}
        </code>
      ),
    },
    {
      title: 'Số người',
      dataIndex: 'soNguoi',
      key: 'soNguoi',
      width: 100,
      align: 'center',
      render: (v: number) => (
        <Badge count={v} showZero color="#1890ff" style={{ fontSize: 12 }} />
      ),
    },
    {
      title: 'Số quyền',
      dataIndex: 'quyenCount',
      key: 'quyenCount',
      width: 100,
      align: 'center',
      render: (v: number) => (
        <Tag color="blue">{v} quyền</Tag>
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
      width: 160,
      align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Phân quyền">
            <Button
              type="text"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => {
                setSelectedVaiTro(r)
                setPermissionList(r.permissions)
                setPermModalOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingId(r.id)
                form.setFieldsValue({ ten: r.ten, moTa: r.moTa })
                setModalOpen(true)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa vai trò?"
            description={`Bạn có chắc muốn xóa vai trò "${r.ten}"?`}
            onConfirm={() => {
              setData((prev) => prev.filter((d) => d.id !== r.id))
              message.success('Đã xóa vai trò')
            }}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={r.id === 'vt001'} // Can't delete admin role
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const permissionColumns: ColumnsType<Permission> = [
    {
      title: 'Tên quyền',
      dataIndex: 'label',
      key: 'label',
      render: (label: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{label}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text>
        </div>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Bật/Tắt',
      key: 'toggle',
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Switch
          checked={permissionList.includes(r.key)}
          onChange={(checked) => {
            if (checked) {
              setPermissionList((prev) => [...prev, r.key])
            } else {
              setPermissionList((prev) => prev.filter((k) => k !== r.key))
            }
          }}
          disabled={selectedVaiTro?.id === 'vt001'} // Admin has all permissions
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<KeyOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Phan quyen"
        code="Quan ly vai tro va quyen truy cap PH2"
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
            Them vai tro
          </Button>
        }
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng vai trò"
              value={data.length}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng người dùng"
              value={data.reduce((s, d) => s + d.soNguoi, 0)}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Đang hoạt động"
              value={data.filter((d) => d.trangThai === 'active').length}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng quyền hệ thống"
              value={PERMISSIONS.length}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          size="middle"
          pagination={false}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingId ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingId(null)
          form.resetFields()
        }}
        footer={null}
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingId) {
              setData((prev) =>
                prev.map((d) =>
                  d.id === editingId
                    ? { ...d, ten: values.ten, moTa: values.moTa }
                    : d,
                ),
              )
              message.success('Cập nhật thành công')
            } else {
              const newRole: VaiTro = {
                id: `vt${Date.now()}`,
                ma: values.ten.toLowerCase().replace(/\s+/g, '-'),
                ten: values.ten,
                moTa: values.moTa,
                soNguoi: 0,
                quyenCount: 0,
                trangThai: 'active',
                permissions: [],
              }
              setData((prev) => [...prev, newRole])
              message.success('Thêm vai trò thành công')
            }
            setModalOpen(false)
            setEditingId(null)
          }}
        >
          <Form.Item
            name="ten"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
          >
            <Input placeholder="Trưởng phòng" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chức năng của vai trò này" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Permission Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Phân quyền cho vai trò: {selectedVaiTro?.ten}</span>
          </Space>
        }
        open={permModalOpen}
        onCancel={() => {
          setPermModalOpen(false)
          setSelectedVaiTro(null)
        }}
        width={700}
        footer={
          <Space>
            <Button onClick={() => setPermModalOpen(false)}>Đóng</Button>
            <Button
              type="primary"
              onClick={() => {
                setData((prev) =>
                  prev.map((d) =>
                    d.id === selectedVaiTro?.id
                      ? {
                          ...d,
                          permissions: permissionList,
                          quyenCount: permissionList.length,
                        }
                      : d,
                  ),
                )
                message.success('Cập nhật quyền thành công')
                setPermModalOpen(false)
                setSelectedVaiTro(null)
              }}
            >
              Luu thay doi
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">
            {permissionList.length} / {PERMISSIONS.length} quyền được bật
          </Text>
        </div>

        {Object.entries(permissionsByModule).map(([module, perms]) => (
          <div key={module} style={{ marginBottom: 16 }}>
            <Divider orientation="left" style={{ fontSize: 13, color: '#1890ff' }}>
              {module || 'Khác'}
            </Divider>
            <Table
              columns={permissionColumns}
              dataSource={perms}
              rowKey="key"
              size="small"
              pagination={false}
              showHeader={false}
            />
          </div>
        ))}
      </Modal>
    </div>
  )
}