import { useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Button,
  Col,
  Drawer,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { PlusOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { users, ALL_ROLES, type AppUser } from '../data/users'
import {
  DATA_SCOPE_DEFINITIONS,
  DATA_SCOPE_LABEL,
  ROLE_LABEL,
  type DataScopeCode,
} from '../data/rbac'
import { getPrincipal } from '../data/rbacEngine'
import { useRbac, defaultScopeForRole } from '../store/RbacContext'
import HelpButton from '../components/HelpButton'
import {
  PageHeader,
  StatCard,
  FilterBar,
  EntityTable,
  ViewModeToggle,
  useCatalogViewMode,
} from '../components/ui'
import ProcessMapView from '../components/ProcessMapView'
import { LIFECYCLE_STAGES, RD_GROUPS } from '../data/processLifecycle'
import { useToast } from '../components/ui/feedback'

const { Text, Paragraph } = Typography

const SCOPE_OPTIONS = DATA_SCOPE_DEFINITIONS.map((scope) => ({
  value: scope.code,
  label: `${scope.name} (${scope.code})`,
}))

/** Vai trò nghiệp vụ gắn gần đúng từng giai đoạn vòng đời (mock minh hoạ dataflow). */
const ROLES_BY_STAGE: Record<string, string[]> = {
  'de-xuat': ['PM', 'PA', 'NNC', 'BGD_TT', 'BGD_KHOI', 'CQ_QLKHCN', 'HDKHCN', 'TGD_VHT'],
  'tuyen-chon': ['PM', 'PA', 'TP_CLKHCN', 'TP_TCKT', 'TP_NS', 'GD_TTMS', 'HDKHCN', 'TGD_VHT'],
  'thuc-hien': ['PM', 'PA', 'NNC', 'TP_CLKHCN', 'CQ_QLKHCN'],
  'nghiem-thu': ['PM', 'CQ_QLKHCN', 'HDKHCN', 'TGD_VHT', 'TP_TCKT'],
  'chuyen-giao': ['PM', 'CQ_QLKHCN', 'TP_CLKHCN'],
}

function scopeColor(scope: DataScopeCode): string {
  if (scope === 'ALL') return 'red'
  if (scope === 'OWN_CENTER') return 'purple'
  if (scope === 'OWN_DEPARTMENT') return 'geekblue'
  return 'default'
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function AssignmentDrawer({ user, onClose }: { user: AppUser | null; onClose: () => void }) {
  const { assignmentsForUser, upsertAssignment } = useRbac()
  const toast = useToast()

  if (!user) return null

  const principal = getPrincipal(user)
  const roleCodes = principal
    ? principal.systemRoleCodes.includes('ADMIN')
      ? ['ADMIN']
      : principal.businessRoleCodes
    : []
  const current = assignmentsForUser(user.id)

  return (
    <Drawer
      title={
        <Space>
          <SafetyCertificateOutlined />
          Phân quyền dữ liệu · {user.hoTen}
        </Space>
      }
      open={!!user}
      onClose={onClose}
      width={460}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Vai trò suy từ tài khoản; ở đây chỉ đặt phạm vi dữ liệu (scope) và đơn vị áp dụng cho từng vai trò."
      />

      {roleCodes.length === 0 ? (
        <Empty description="User chưa gắn vai trò nghiệp vụ nào." />
      ) : (
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          {roleCodes.map((roleCode) => {
            const assignment = current.find((a) => a.roleCode === roleCode)
            const scope = assignment?.dataScope ?? defaultScopeForRole(roleCode)
            const orgUnit = assignment?.orgUnitId ?? user.donVi

            return (
              <div key={roleCode} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 14 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>{ROLE_LABEL[roleCode] ?? roleCode}</Text> <Text code>{roleCode}</Text>
                  {!assignment && (
                    <Tag color="default" style={{ marginLeft: 8 }}>
                      mặc định
                    </Tag>
                  )}
                </div>
                <Row gutter={10}>
                  <Col span={13}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Phạm vi dữ liệu
                    </Text>
                    <Select<DataScopeCode>
                      value={scope}
                      options={SCOPE_OPTIONS}
                      style={{ width: '100%', marginTop: 4 }}
                      onChange={(value) => {
                        upsertAssignment({ userId: user.id, roleCode, dataScope: value, orgUnitId: orgUnit })
                        toast.success('Đã cập nhật phạm vi', `${roleCode} · ${DATA_SCOPE_LABEL[value]}`)
                      }}
                    />
                  </Col>
                  <Col span={11}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Đơn vị áp dụng
                    </Text>
                    <Input
                      defaultValue={orgUnit}
                      style={{ marginTop: 4 }}
                      onBlur={(e) => {
                        const next = e.target.value.trim()
                        if (next === orgUnit) return
                        upsertAssignment({ userId: user.id, roleCode, dataScope: scope, orgUnitId: next })
                        toast.success('Đã cập nhật đơn vị', `${roleCode} · ${next}`)
                      }}
                    />
                  </Col>
                </Row>
              </div>
            )
          })}
        </Space>
      )}
    </Drawer>
  )
}

function UserCard({
  u,
  scopes,
  onAssign,
}: {
  u: AppUser
  scopes: DataScopeCode[]
  onAssign: () => void
}) {
  return (
    <div
      style={{
        height: '100%',
        borderRadius: 8,
        border: '1px solid var(--vht-border, #e8e8e8)',
        background: '#fff',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Space size={12} align="start">
        <Avatar style={{ background: '#ffdad8', color: '#bf0027', fontWeight: 700 }} size={40}>
          {initials(u.hoTen)}
        </Avatar>
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ display: 'block' }}>{u.hoTen}</Text>
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {u.email}
          </Text>
        </div>
      </Space>
      <Text type="secondary" style={{ fontSize: 12 }}>{u.donVi}</Text>
      <Space size={[6, 6]} wrap>
        {u.vaiTro.map((r) => (
          <Tag key={r} color="processing" bordered>
            {r}
          </Tag>
        ))}
      </Space>
      {scopes.length > 0 && (
        <Space size={[4, 4]} wrap>
          {scopes.map((s) => (
            <Tag key={s} color={scopeColor(s)}>
              {DATA_SCOPE_LABEL[s]}
            </Tag>
          ))}
        </Space>
      )}
      <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
        <Button type="link" size="small" style={{ paddingInline: 0 }} onClick={onAssign}>
          Phân quyền dữ liệu
        </Button>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState<string | undefined>()
  const [assignUser, setAssignUser] = useState<AppUser | null>(null)
  const [viewMode, setViewMode] = useCatalogViewMode('qtkhcn.view.nguoi-dung', 'list')
  const { assignments } = useRbac()

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

  const mapStats = useMemo(() => {
    const out: Record<string, { count: number; statusHint?: string }> = {}
    for (const g of RD_GROUPS) {
      const stageRoles = ROLES_BY_STAGE[g.stageId] ?? []
      const matched = users.filter((u) => u.vaiTro.some((r) => stageRoles.includes(r)))
      out[g.code] = {
        count: matched.length,
        statusHint: `${stageRoles.length} vai trò mẫu`,
      }
    }
    return out
  }, [])

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
      width: 200,
      render: (v: string) => <Text code>{v}</Text>,
    },
    { title: 'Đơn vị', dataIndex: 'donVi', width: 170 },
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
      title: 'Phạm vi dữ liệu',
      key: 'scope',
      width: 190,
      render: (_, u) => {
        const scopes = [...new Set(assignments.filter((a) => a.userId === u.id).map((a) => a.dataScope))]
        return scopes.length ? (
          <Space size={[4, 4]} wrap>
            {scopes.map((s) => (
              <Tag key={s} color={scopeColor(s)}>
                {DATA_SCOPE_LABEL[s]}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        )
      },
    },
    {
      title: '',
      key: 'action',
      width: 150,
      align: 'right',
      render: (_, u) => (
        <Space size={4}>
          <Button type="link" size="small" style={{ paddingInline: 4 }} onClick={() => setAssignUser(u)}>
            Phân quyền
          </Button>
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
          <Space>
            <Tooltip title="Sắp ra mắt (F4 — RBAC / IAM)">
              <Button type="primary" icon={<PlusOutlined />} disabled>
                Thêm người dùng
              </Button>
            </Tooltip>
            <HelpButton section="donvi" />
          </Space>
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ margin: '16px 0' }}
        message="Màn quản trị người dùng đang ở dạng mô phỏng — tài khoản tĩnh. Nút Phân quyền đặt phạm vi dữ liệu (scope-overlay) theo từng vai trò; thao tác Thêm/Khoá sẽ mở khi triển khai RBAC/IAM (F4)."
      />

      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={8}>
          <StatCard title="Người dùng" value={users.length} color="#1677ff" />
        </Col>
        <Col xs={8}>
          <StatCard title="Vai trò" value={roleCount} color="#17935a" />
        </Col>
        <Col xs={8}>
          <StatCard title="Lượt gán quyền" value={assignments.length} color="#722ed1" />
        </Col>
      </Row>

      <FilterBar
        search={
          viewMode === 'map'
            ? undefined
            : { placeholder: 'Tìm họ tên / email / đơn vị...', onChange: setQ }
        }
        selects={
          viewMode === 'map'
            ? undefined
            : [
                {
                  key: 'role',
                  placeholder: 'Lọc theo vai trò',
                  value: role,
                  onChange: setRole,
                  width: 220,
                  options: ALL_ROLES.map((r) => ({ value: r, label: r })),
                },
              ]
        }
        right={
          <Space>
            {viewMode !== 'map' && (
              <Text type="secondary">{rows.length}/{users.length} người dùng</Text>
            )}
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </Space>
        }
      />

      {viewMode === 'list' && (
        <EntityTable<AppUser>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          emptyText="Không có người dùng khớp bộ lọc."
        />
      )}

      {viewMode === 'grid' && (
        rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#8593a3' }}>
            <TeamOutlined style={{ fontSize: 40, marginBottom: 12 }} />
            <br />
            <Text type="secondary">Không có người dùng khớp bộ lọc.</Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {rows.map((u) => {
              const scopes = [
                ...new Set(assignments.filter((a) => a.userId === u.id).map((a) => a.dataScope)),
              ]
              return (
                <Col key={u.id} xs={24} sm={12} lg={8} xl={6}>
                  <UserCard u={u} scopes={scopes} onAssign={() => setAssignUser(u)} />
                </Col>
              )
            })}
          </Row>
        )
      )}

      {viewMode === 'map' && (
        <>
          <ProcessMapView
            statsByRd={mapStats}
            subtitle="Số người dùng có vai trò tham gia từng nhóm RD theo vòng đời (mock). Bấm nhóm để xem danh sách người dùng."
            onSelectGroup={() => setViewMode('list')}
          />
          <div style={{ marginTop: 20 }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
              Vai trò mẫu theo giai đoạn
            </Text>
            <Row gutter={[12, 12]}>
              {LIFECYCLE_STAGES.map((stage) => (
                <Col key={stage.id} xs={24} sm={12} lg={8} xl={4}>
                  <div
                    style={{
                      border: `1px solid ${stage.color}33`,
                      borderRadius: 8,
                      padding: 12,
                      background: `${stage.color}08`,
                      height: '100%',
                    }}
                  >
                    <Text strong style={{ color: stage.color, fontSize: 12 }}>
                      {stage.label}
                    </Text>
                    <Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 8px' }}>
                      {stage.description}
                    </Paragraph>
                    <Space size={[4, 4]} wrap>
                      {(ROLES_BY_STAGE[stage.id] ?? []).map((r) => (
                        <Tag key={r} style={{ margin: 0 }}>
                          {r}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}

      <AssignmentDrawer user={assignUser} onClose={() => setAssignUser(null)} />
    </div>
  )
}
