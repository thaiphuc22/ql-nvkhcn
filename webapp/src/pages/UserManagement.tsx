import { useMemo, useState } from 'react'
import { Alert, Avatar, Button, Col, Row, Space, Tag, Tooltip, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { users, ALL_ROLES, type AppUser } from '../data/users'
import { PageHeader, StatCard, FilterBar, EntityTable } from '../components/ui'

const { Text } = Typography

/** Chữ cái đầu của họ tên → nhãn avatar (tối đa 2 ký tự). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export default function UserManagement() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState<string | undefined>()

  const rows = useMemo(
    () =>
      users.filter((u) => {
        if (role && !u.vaiTro.includes(role)) return false
        if (q) {
          const s = q.toLowerCase()
          if (
            !u.hoTen.toLowerCase().includes(s) &&
            !u.email.toLowerCase().includes(s) &&
            !u.donVi.toLowerCase().includes(s)
          )
            return false
        }
        return true
      }),
    [q, role],
  )

  const roleCount = useMemo(() => new Set(users.flatMap((u) => u.vaiTro)).size, [])

  const columns: ColumnsType<AppUser> = [
    {
      title: 'Họ tên',
      dataIndex: 'hoTen',
      render: (v: string) => (
        <Space size={10}>
          <Avatar style={{ background: '#ffdad8', color: '#bf0027', fontWeight: 700 }} size="small">
            {initials(v)}
          </Avatar>
          <span style={{ fontWeight: 600 }}>{v}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 220,
      render: (v: string) => <Text code>{v}</Text>,
    },
    { title: 'Đơn vị', dataIndex: 'donVi', width: 200 },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      render: (roles: string[]) => (
        <Space size={[6, 6]} wrap>
          {roles.map((r) => (
            <Tag key={r} color="processing" bordered>
              {r}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 90,
      align: 'right',
      render: () => (
        <Space size={4}>
          <Tooltip title="Sắp ra mắt (F4 — RBAC / IAM)">
            <Button type="link" size="small" style={{ paddingInline: 4 }} disabled>
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title="Sắp ra mắt (F4 — RBAC / IAM)">
            <Button type="link" size="small" danger style={{ paddingInline: 4 }} disabled>
              Khoá
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Quản trị người dùng"
        style={{ marginBottom: 0 }}
        extra={
          <Tooltip title="Sắp ra mắt (F4 — RBAC / IAM)">
            <Button type="primary" icon={<PlusOutlined />} disabled>
              Thêm người dùng
            </Button>
          </Tooltip>
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ margin: '16px 0' }}
        message="Màn quản trị người dùng đang ở dạng mô phỏng — dữ liệu tĩnh, các thao tác Thêm/Sửa/Khoá sẽ mở khi triển khai phân quyền RBAC/IAM (F4)."
      />

      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={8}>
          <StatCard title="Người dùng" value={users.length} color="#1677ff" />
        </Col>
        <Col xs={8}>
          <StatCard title="Vai trò" value={roleCount} color="#17935a" />
        </Col>
        <Col xs={8}>
          <StatCard
            title="Đang hoạt động"
            value={users.filter((u) => u.trangThai === 'active').length}
            color="#722ed1"
          />
        </Col>
      </Row>

      <FilterBar
        search={{ placeholder: 'Tìm họ tên / email / đơn vị...', onChange: setQ }}
        selects={[
          {
            key: 'role',
            placeholder: 'Lọc theo vai trò',
            value: role,
            onChange: setRole,
            width: 220,
            options: ALL_ROLES.map((r) => ({ value: r, label: r })),
          },
        ]}
      />

      <EntityTable<AppUser>
        rowKey="id"
        columns={columns}
        dataSource={rows}
        emptyText="Không có người dùng khớp bộ lọc."
      />
    </div>
  )
}
