import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import HelpButton from '../components/HelpButton'
import { PageHeader, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import { useToast, useConfirm } from '../components/ui/feedback'
import { users } from '../data/users'
import {
  DATA_SCOPE_LABEL,
  FEATURE_DEFINITIONS,
  PERMISSION_DEFINITIONS,
  PERMISSION_LABEL,
  RBAC_ROLES,
  ROLE_LABEL,
  type FeatureCode,
  type PermissionCode,
  type RbacRole,
  type RoleKind,
  type RolePermissionPolicy,
  type UserRoleAssignment,
} from '../data/rbac'
import {
  checkPermission,
  getEffectiveDataScopes,
  getPrincipal,
  getUserAssignments,
} from '../data/rbacEngine'
import { useRbac } from '../store/RbacContext'

const { Text } = Typography

const ROLE_KIND_LABEL: Record<RoleKind, string> = {
  SYSTEM: 'Vai trò hệ thống',
  BUSINESS: 'Vai trò nghiệp vụ',
}

/** Id ổn định theo (role, feature) — bảo đảm bất biến "1 policy / role / feature". */
function policyId(roleCode: string, featureCode: FeatureCode): string {
  return `RP-${roleCode}-${featureCode}`
}

function permissionColor(code: PermissionCode): string {
  if (code === 'CONFIGURE') return 'volcano'
  if (code === 'APPROVE' || code === 'SIGN') return 'green'
  if (code === 'REJECT' || code === 'RETURN') return 'red'
  if (code === 'AUDIT') return 'purple'
  return 'blue'
}

const ROLE_OPTIONS = RBAC_ROLES.map((role) => ({ value: role.code, label: `${role.name} (${role.code})` }))

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 · Danh mục Role (CRUD)
// ─────────────────────────────────────────────────────────────────────────────

function RoleCatalogTab({
  roles,
  setRoles,
  policies,
  assignments,
}: {
  roles: RbacRole[]
  setRoles: React.Dispatch<React.SetStateAction<RbacRole[]>>
  policies: RolePermissionPolicy[]
  assignments: UserRoleAssignment[]
}) {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<RoleKind | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RbacRole | null>(null)
  const toast = useToast()
  const confirm = useConfirm()

  const rows = useMemo(
    () =>
      roles.filter((role) => {
        if (kind && role.kind !== kind) return false
        if (!q) return true
        const s = q.toLowerCase()
        return (
          role.code.toLowerCase().includes(s) ||
          role.name.toLowerCase().includes(s) ||
          role.group.toLowerCase().includes(s)
        )
      }),
    [q, kind, roles],
  )

  const roleInUse = (code: string) =>
    policies.some((p) => p.roleCode === code) || assignments.some((a) => a.roleCode === code)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (role: RbacRole) => {
    setEditing(role)
    setModalOpen(true)
  }

  const handleDelete = (role: RbacRole) => {
    if (role.kind === 'SYSTEM') {
      toast.warning('Không thể xoá', 'Vai trò hệ thống không được phép xoá.')
      return
    }
    if (roleInUse(role.code)) {
      toast.warning('Không thể xoá', `Vai trò ${role.code} đang được sử dụng trong policy hoặc gán quyền.`)
      return
    }
    confirm({
      title: `Xoá vai trò ${role.name}?`,
      content: `Mã: ${role.code}`,
      danger: true,
      okText: 'Xoá',
      onOk: () => {
        setRoles((prev) => prev.filter((r) => r.code !== role.code))
        toast.warning('Đã xoá vai trò', role.code)
      },
    })
  }

  const handleSubmit = (values: { code: string; name: string; group: string; description: string }) => {
    if (editing) {
      setRoles((prev) =>
        prev.map((r) => (r.code === editing.code ? { ...r, ...values, kind: 'BUSINESS' as const, active: true } : r)),
      )
      toast.success('Đã cập nhật vai trò', values.code)
    } else {
      if (roles.some((r) => r.code === values.code.toUpperCase())) {
        toast.warning('Trùng mã', 'Mã role đã tồn tại.')
        return
      }
      setRoles((prev) => [
        ...prev,
        { ...values, code: values.code.toUpperCase(), kind: 'BUSINESS' as const, active: true },
      ])
      toast.success('Đã thêm vai trò', values.code.toUpperCase())
    }
    setModalOpen(false)
    setEditing(null)
  }

  const columns: ColumnsType<RbacRole> = [
    {
      title: 'Vai trò',
      key: 'role',
      width: 260,
      render: (_, role) => (
        <div>
          <Text code>{role.code}</Text>
          <div><Text strong>{role.name}</Text></div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'kind',
      width: 150,
      render: (value: RoleKind) => (
        <Tag color={value === 'SYSTEM' ? 'volcano' : 'blue'}>{ROLE_KIND_LABEL[value]}</Tag>
      ),
    },
    { title: 'Nhóm', dataIndex: 'group', width: 220 },
    { title: 'Mô tả', dataIndex: 'description' },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 110,
      render: (active: boolean) => (active ? <Tag color="green">active</Tag> : <Tag>off</Tag>),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, role) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => openEdit(role)}><EditOutlined /></Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={role.kind === 'SYSTEM'}
            onClick={() => handleDelete(role)}
          ><DeleteOutlined /></Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <FilterBar
        search={{ placeholder: 'Tìm mã vai trò / tên / nhóm...', onChange: setQ }}
        selects={[
          {
            key: 'kind',
            placeholder: 'Loại vai trò',
            value: kind,
            onChange: setKind,
            options: (Object.keys(ROLE_KIND_LABEL) as RoleKind[]).map((k) => ({ value: k, label: ROLE_KIND_LABEL[k] })),
          },
        ]}
        right={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm vai trò
          </Button>
        }
      />
      <EntityTable<RbacRole>
        rowKey="code"
        columns={columns}
        dataSource={rows}
        scroll={{ y: LIST_SCROLL_Y }}
      />

      <Modal
        title={editing ? 'Sửa vai trò' : 'Thêm vai trò mới'}
        open={modalOpen}
        destroyOnClose
        onCancel={() => { setModalOpen(false); setEditing(null) }}
        okText={editing ? 'Lưu' : 'Thêm'}
        cancelText="Huỷ"
        onOk={() => {
          const form = (window as any).__roleForm
          if (form) form.submit()
        }}
      >
        <RoleForm initial={editing} onSubmit={handleSubmit} />
      </Modal>
    </>
  )
}

function RoleForm({
  initial,
  onSubmit,
}: {
  initial: RbacRole | null
  onSubmit: (values: { code: string; name: string; group: string; description: string }) => void
}) {
  const [form] = Form.useForm()
  ;(window as any).__roleForm = form

  return (
    <Form
      form={form}
      layout="vertical"
      preserve={false}
      initialValues={initial ? { code: initial.code, name: initial.name, group: initial.group, description: initial.description } : { group: 'Custom' }}
      onFinish={onSubmit}
    >
      <Form.Item name="code" label="Mã vai trò" rules={[{ required: true, message: 'Nhập mã vai trò' }]}>
        <Input placeholder="VD: CUSTOM_ROLE" disabled={!!initial} style={{ textTransform: 'uppercase' }} />
      </Form.Item>
      <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: 'Nhập tên vai trò' }]}>
        <Input placeholder="VD: Vai trò tuỳ chỉnh" />
      </Form.Item>
      <Form.Item name="group" label="Nhóm" rules={[{ required: true }]}>
        <Input placeholder="VD: Custom" />
      </Form.Item>
      <Form.Item name="description" label="Mô tả">
        <Input.TextArea rows={2} placeholder="Mô tả ngắn về role này" />
      </Form.Item>
    </Form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 · Ma trận quyền (checkbox matrix + drawer chi tiết)
// ─────────────────────────────────────────────────────────────────────────────
// Click 1 dòng → Drawer "Chi tiết policy": xem raw permissions + toggle enabled.

interface FeatureState {
  perms: PermissionCode[]
  enabled: boolean
}

function PolicyDrawer({
  open,
  policy,
  onClose,
  onToggleEnabled,
}: {
  open: boolean
  policy: { feature: (typeof FEATURE_DEFINITIONS)[number]; state: FeatureState; roleCode: string } | null
  onClose: () => void
  onToggleEnabled: (featureCode: FeatureCode, enabled: boolean) => void
}) {
  if (!policy) return null
  const { feature, state, roleCode } = policy
  const policyIdStr = policyId(roleCode, feature.code)

  return (
    <Drawer
      title={`Chi tiết policy: ${feature.name}`}
      open={open}
      onClose={onClose}
      width={400}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Text type="secondary">Chức năng</Text>
          <div><Text strong>{feature.name}</Text> <Text code>{feature.code}</Text></div>
        </div>
        <div>
          <Text type="secondary">Vai trò</Text>
          <div><Text code>{roleCode}</Text></div>
        </div>
        <div>
          <Text type="secondary">Mã policy</Text>
          <div><Text code>{policyIdStr}</Text></div>
        </div>

        <div>
          <Text type="secondary">Bật policy</Text>
          <div style={{ marginTop: 4 }}>
            <Switch
              checked={state.enabled}
              onChange={(checked) => onToggleEnabled(feature.code, checked)}
            />
          </div>
        </div>

        <div>
          <Text type="secondary">Quyền ({state.perms.length})</Text>
          <div style={{ marginTop: 8 }}>
            <Space size={[4, 4]} wrap>
              {state.perms.length
                ? state.perms.map((code) => (
                    <Tag key={code} color={permissionColor(code)}>
                      {PERMISSION_LABEL[code]} ({code})
                    </Tag>
                  ))
                : <Text type="secondary">Chưa có permission nào.</Text>}
            </Space>
          </div>
        </div>
      </Space>
    </Drawer>
  )
}

function MatrixTab({
  policies,
  setPolicies,
}: {
  policies: RolePermissionPolicy[]
  setPolicies: React.Dispatch<React.SetStateAction<RolePermissionPolicy[]>>
}) {
  const [roleCode, setRoleCode] = useState('ADMIN')
  const [drawerPolicy, setDrawerPolicy] = useState<{
    feature: (typeof FEATURE_DEFINITIONS)[number]
    state: FeatureState
    roleCode: string
  } | null>(null)
  const toast = useToast()
  const confirm = useConfirm()

  const role = RBAC_ROLES.find((r) => r.code === roleCode)

  // Gom về đúng 1 state/feature cho role đang chọn (đọc).
  const roleMap = useMemo(() => {
    const m = new Map<FeatureCode, FeatureState>()
    policies
      .filter((p) => p.roleCode === roleCode)
      .forEach((p) => {
        const ex = m.get(p.featureCode)
        if (ex) {
          ex.perms = [...new Set([...ex.perms, ...p.permissionCodes])]
          ex.enabled = ex.enabled || p.enabled
        } else {
          m.set(p.featureCode, { perms: [...p.permissionCodes], enabled: p.enabled })
        }
      })
    return m
  }, [policies, roleCode])

  const stateOf = (feat: FeatureCode): FeatureState =>
    roleMap.get(feat) ?? { perms: [], enabled: true }

  /**
   * Mọi thao tác sửa đi qua đây: dựng lại toàn bộ policy của role từ map (gộp
   * trùng → bất biến "1 policy/feature"), gọi mutator, rồi loại feature rỗng (=xoá).
   */
  const mutateRole = (mutator: (map: Map<FeatureCode, RolePermissionPolicy>) => void) => {
    setPolicies((prev) => {
      const others = prev.filter((p) => p.roleCode !== roleCode)
      const map = new Map<FeatureCode, RolePermissionPolicy>()
      prev
        .filter((p) => p.roleCode === roleCode)
        .forEach((p) => {
          const ex = map.get(p.featureCode)
          if (ex) ex.permissionCodes = [...new Set([...ex.permissionCodes, ...p.permissionCodes])]
          else map.set(p.featureCode, { ...p, permissionCodes: [...p.permissionCodes] })
        })
      mutator(map)
      const result = [...map.values()].filter((p) => p.permissionCodes.length > 0)
      return [...others, ...result]
    })
  }

  const ensure = (map: Map<FeatureCode, RolePermissionPolicy>, feat: FeatureCode): RolePermissionPolicy => {
    let p = map.get(feat)
    if (!p) {
      p = {
        id: policyId(roleCode, feat),
        roleCode,
        featureCode: feat,
        permissionCodes: [],
        enabled: true,
      }
      map.set(feat, p)
    }
    return p
  }

  const togglePerm = (feat: FeatureCode, perm: PermissionCode, checked: boolean) =>
    mutateRole((map) => {
      const p = ensure(map, feat)
      p.permissionCodes = checked
        ? [...new Set([...p.permissionCodes, perm])]
        : p.permissionCodes.filter((c) => c !== perm)
    })

  const toggleColumn = (perm: PermissionCode, checked: boolean) =>
    mutateRole((map) => {
      FEATURE_DEFINITIONS.forEach((f) => {
        if (checked) {
          const p = ensure(map, f.code)
          p.permissionCodes = [...new Set([...p.permissionCodes, perm])]
        } else {
          const p = map.get(f.code)
          if (p) p.permissionCodes = p.permissionCodes.filter((c) => c !== perm)
        }
      })
    })

  const toggleRow = (feat: FeatureCode, checked: boolean) =>
    mutateRole((map) => {
      if (checked) {
        const p = ensure(map, feat)
        p.permissionCodes = PERMISSION_DEFINITIONS.map((d) => d.code)
      } else {
        map.delete(feat)
      }
    })

  const clearRow = (feat: FeatureCode) => mutateRole((map) => map.delete(feat))

  const toggleEnabled = (feat: FeatureCode, enabled: boolean) =>
    mutateRole((map) => {
      const p = ensure(map, feat)
      p.enabled = enabled
    })

  const grantAll = () =>
    mutateRole((map) => {
      FEATURE_DEFINITIONS.forEach((f) => {
        ensure(map, f.code).permissionCodes = PERMISSION_DEFINITIONS.map((d) => d.code)
      })
    })

  const clearAll = () =>
    confirm({
      title: `Xoá toàn bộ quyền của ${role?.name ?? roleCode}?`,
      content: 'Mọi policy của role này trong phiên demo sẽ bị gỡ.',
      danger: true,
      okText: 'Xoá hết',
      onOk: () => {
        mutateRole((map) => map.clear())
        toast.warning('Đã xoá quyền', `Toàn bộ policy của ${role?.name ?? roleCode} đã được gỡ.`)
      },
    })

  // Cột: Feature (fixed) + mỗi permission 1 cột checkbox
  const permColumns: ColumnsType<(typeof FEATURE_DEFINITIONS)[number]> = PERMISSION_DEFINITIONS.map((perm) => {
    const withPerm = FEATURE_DEFINITIONS.filter((f) => stateOf(f.code).perms.includes(perm.code)).length
    const all = withPerm === FEATURE_DEFINITIONS.length
    const some = withPerm > 0 && !all
    return {
      title: (
        <Tooltip title={perm.description}>
          <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
            <Checkbox
              checked={all}
              indeterminate={some}
              onChange={(e) => toggleColumn(perm.code, e.target.checked)}
            />
            <div style={{ fontSize: 11, marginTop: 3, fontWeight: 500 }}>{PERMISSION_LABEL[perm.code]}</div>
          </div>
        </Tooltip>
      ),
      key: perm.code,
      width: 82,
      align: 'center' as const,
      render: (_: unknown, f) => (
        <Checkbox
          checked={stateOf(f.code).perms.includes(perm.code)}
          onChange={(e) => togglePerm(f.code, perm.code, e.target.checked)}
        />
      ),
    }
  })

  const columns: ColumnsType<(typeof FEATURE_DEFINITIONS)[number]> = [
    {
      title: 'Chức năng',
      key: 'feature',
      width: 220,
      fixed: 'left',
      render: (_, f) => {
        const st = stateOf(f.code)
        const all = st.perms.length === PERMISSION_DEFINITIONS.length
        return (
          <Space align="start">
            <Checkbox
              checked={st.perms.length > 0}
              indeterminate={st.perms.length > 0 && !all}
              onChange={(e) => toggleRow(f.code, e.target.checked)}
            />
            <div style={{ cursor: 'pointer' }} onClick={() => setDrawerPolicy({ feature: f, state: st, roleCode })}>
              <Text strong>{f.name}</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>{f.group}</Text></div>
            </div>
          </Space>
        )
      },
    },
    ...permColumns,
    {
      title: '',
      key: 'action',
      width: 48,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_, f) =>
        stateOf(f.code).perms.length ? (
          <Tooltip title="Xoá quyền của chức năng này">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => clearRow(f.code)} />
          </Tooltip>
        ) : null,
    },
  ]

  const grantedCount = FEATURE_DEFINITIONS.filter((f) => stateOf(f.code).perms.length > 0).length

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">
          Chọn role → tích ô [chức năng × quyền]. Tích tiêu đề cột để cấp cả cột, tích ô đầu dòng để cấp cả dòng.
          Bấm vào <Text strong>tên chức năng</Text> để xem chi tiết policy + bật/tắt.
        </Text>
      </div>

      <FilterBar
        left={
          <Space wrap>
            <Text type="secondary">Vai trò:</Text>
            <Select
              showSearch
              value={roleCode}
              onChange={setRoleCode}
              style={{ width: 320 }}
              optionFilterProp="label"
              options={ROLE_OPTIONS}
            />
            {role && <Tag color={role.kind === 'SYSTEM' ? 'volcano' : 'blue'}>{ROLE_KIND_LABEL[role.kind]}</Tag>}
          </Space>
        }
        right={
          <Space wrap>
            <Text type="secondary">{grantedCount}/{FEATURE_DEFINITIONS.length} chức năng có quyền</Text>
            <Button size="small" onClick={grantAll}>Cấp toàn quyền</Button>
            <Button size="small" danger onClick={clearAll}>Xoá hết</Button>
          </Space>
        }
      />

      <EntityTable
        rowKey={(f) => f.code}
        columns={columns}
        dataSource={FEATURE_DEFINITIONS}
        pagination={false}
        scroll={{ x: 'max-content', y: LIST_SCROLL_Y }}
      />

      <PolicyDrawer
        open={!!drawerPolicy}
        policy={drawerPolicy}
        onClose={() => setDrawerPolicy(null)}
        onToggleEnabled={toggleEnabled}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 · Mô phỏng — 2 khối: Quyền thao tác (từ Role) + Phạm vi dữ liệu (từ Assignment)
// ─────────────────────────────────────────────────────────────────────────────

function SimulatorTab({
  policies,
  assignments,
}: {
  policies: RolePermissionPolicy[]
  assignments: UserRoleAssignment[]
}) {
  const [userId, setUserId] = useState(users[0]?.id)
  const [featureCode, setFeatureCode] = useState<FeatureCode>('DOSSIER')
  const [permissionCode, setPermissionCode] = useState<PermissionCode>('VIEW')

  const user = users.find((u) => u.id === userId)
  const principal = getPrincipal(user)
  const result = checkPermission(user, featureCode, permissionCode, policies)
  const userAssignments = getUserAssignments(user, assignments)
  const dataScopes = getEffectiveDataScopes(user, assignments)

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={9}>
        <Card size="small" title={<Space><SafetyCertificateOutlined />Ngữ cảnh kiểm tra</Space>}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Người dùng</Text>
              <Select
                showSearch
                value={userId}
                onChange={setUserId}
                style={{ width: '100%', marginTop: 4 }}
                optionFilterProp="label"
                options={users.map((u) => ({ value: u.id, label: `${u.hoTen} (${u.email})` }))}
              />
            </div>
            <div>
              <Text type="secondary">Chức năng</Text>
              <Select
                value={featureCode}
                onChange={setFeatureCode}
                style={{ width: '100%', marginTop: 4 }}
                options={FEATURE_DEFINITIONS.map((feature) => ({ value: feature.code, label: feature.name }))}
              />
            </div>
            <div>
              <Text type="secondary">Quyền</Text>
              <Select
                value={permissionCode}
                onChange={setPermissionCode}
                style={{ width: '100%', marginTop: 4 }}
                options={PERMISSION_DEFINITIONS.map((permission) => ({ value: permission.code, label: permission.name }))}
              />
            </div>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={15}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Khối 1: Quyền thao tác (từ Role) */}
          <Card size="small" title={<Space><KeyOutlined />Quyền thao tác (từ Role)</Space>}>
            <Alert
              type={result.allowed ? 'success' : 'warning'}
              showIcon
              message={result.allowed ? 'Được phép' : 'Không được phép'}
              description={result.reason}
              style={{ marginBottom: 12 }}
            />

            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Vai trò hiệu lực</Text>
                <div style={{ marginTop: 4 }}>
                  <Space size={[4, 4]} wrap>
                    {principal?.roleCodes.map((code) => (
                      <Tag key={code} color={code === 'ADMIN' ? 'volcano' : 'blue'}>{ROLE_LABEL[code] ?? code}</Tag>
                    ))}
                  </Space>
                </div>
              </div>

              <div>
                <Text type="secondary">Quyền trên chức năng</Text>
                <div style={{ marginTop: 4 }}>
                  <Space size={[4, 4]} wrap>
                    {result.permissionCodes.length
                      ? result.permissionCodes.map((code) => (
                          <Tag key={code} color={permissionColor(code)}>{PERMISSION_LABEL[code]}</Tag>
                        ))
                      : <Text type="secondary">Không có permission nào.</Text>}
                  </Space>
                </div>
              </div>

              <div>
                <Text type="secondary">Policy khớp</Text>
                <div style={{ marginTop: 4 }}>
                  <Space size={[4, 4]} wrap>
                    {result.matchedPolicies.length
                      ? result.matchedPolicies.map((policy) => (
                          <Tag key={policy.id}>{policy.id}</Tag>
                        ))
                      : <Text type="secondary">Không có policy khớp.</Text>}
                  </Space>
                </div>
              </div>
            </Space>
          </Card>

          {/* Khối 2: Phạm vi dữ liệu (từ Assignment) */}
          <Card size="small" title={<Space><TeamOutlined />Phạm vi dữ liệu (từ gán quyền người dùng)</Space>}>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Phạm vi dữ liệu hiệu lực</Text>
                <div style={{ marginTop: 4 }}>
                  <Space size={[4, 4]} wrap>
                    {dataScopes.length
                      ? dataScopes.map((scope) => (
                          <Tag key={scope}>{DATA_SCOPE_LABEL[scope]} ({scope})</Tag>
                        ))
                      : <Text type="secondary">Không có scope.</Text>}
                  </Space>
                </div>
              </div>

              {userAssignments.length > 0 && (
                <div>
                  <Text type="secondary">Gán quyền gốc</Text>
                  <div style={{ marginTop: 4 }}>
                    {userAssignments.map((a) => (
                      <Tag key={a.id} style={{ fontSize: 11 }}>
                        {a.roleCode} · {DATA_SCOPE_LABEL[a.dataScope]}
                        {a.orgUnitId ? ` · ${a.orgUnitId}` : ''}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  )
}
// ─────────────────────────────────────────────────────────────────────────────
// Trang
// ─────────────────────────────────────────────────────────────────────────────

export default function RolePermission() {
  const { roles, setRoles, policies, setPolicies, assignments, resetDefaults } = useRbac()
  const [activeKey, setActiveKey] = useState('matrix')
  const toast = useToast()
  const confirm = useConfirm()

  const resetDefault = () =>
    confirm({
      title: 'Khôi phục phân quyền mặc định?',
      content: 'Mọi thay đổi trong phiên demo sẽ bị bỏ, đưa toàn bộ policy, role và gán quyền về cấu hình gốc.',
      okText: 'Khôi phục',
      onOk: () => {
        resetDefaults()
        toast.success('Đã khôi phục', 'Phân quyền trở về cấu hình mặc định.')
      },
    })

  const items = [
    {
      key: 'roles',
      label: <Space><TeamOutlined />Danh mục vai trò</Space>,
      children: <RoleCatalogTab roles={roles} setRoles={setRoles} policies={policies} assignments={assignments} />,
    },
    {
      key: 'matrix',
      label: <Space><ApartmentOutlined />Ma trận quyền</Space>,
      children: <MatrixTab policies={policies} setPolicies={setPolicies} />,
    },
    {
      key: 'simulator',
      label: <Space><SafetyCertificateOutlined />Mô phỏng</Space>,
      children: <SimulatorTab policies={policies} assignments={assignments} />,
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<KeyOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title="Phân quyền"
        // tag={<Tag color="processing">EPIC03 · Role &amp; Permission</Tag>}
        // code={<Text type="secondary">Vai trò / Quyền / Chức năng / Policy / Gán quyền</Text>}
        breadcrumb={[{ label: 'Hệ thống QTKHCN' }, { label: 'Phân quyền' }]}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={resetDefault}>Khôi phục mặc định</Button>
            <HelpButton section="donvi" />
          </Space>
        }
      />

      {/* <Row gutter={14} style={{ marginBottom: 16 }}>
        <Col xs={12} md={3}><StatCard title="Vai trò (Role)" value={stats.roles} color="#1677ff" /></Col>
        <Col xs={12} md={3}><StatCard title="Tính năng (Feature)" value={stats.features} color="#17935a" /></Col>
        <Col xs={12} md={3}><StatCard title="Chính sách (Policy)" value={stats.policies} color="#722ed1" /></Col>
        <Col xs={12} md={3}><StatCard title="Đang bật" value={stats.enabledPolicies} color="#ee0033" /></Col>
      </Row> */}

      <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
    </div>
  )
}
