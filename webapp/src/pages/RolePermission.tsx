import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
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
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import { useToast, useConfirm } from '../components/ui/feedback'
import { users } from '../data/users'
import {
  DATA_SCOPE_DEFINITIONS,
  DATA_SCOPE_LABEL,
  FEATURE_DEFINITIONS,
  FEATURE_LABEL,
  PERMISSION_DEFINITIONS,
  PERMISSION_LABEL,
  RBAC_ROLES,
  ROLE_LABEL,
  ROLE_PERMISSION_POLICIES,
  type DataScopeCode,
  type FeatureCode,
  type PermissionCode,
  type RbacRole,
  type RoleKind,
  type RolePermissionPolicy,
} from '../data/rbac'
import {
  checkPermission,
  getEffectiveDataScopes,
  getPrincipal,
} from '../data/rbacEngine'

const { Text, Paragraph } = Typography

const ROLE_KIND_LABEL: Record<RoleKind, string> = {
  SYSTEM: 'System Role',
  BUSINESS: 'Business Role',
}

const SYSTEM_ROLE_CODES = new Set(['ADMIN', 'OPERATOR', 'VIEWER'])

/** Scope mặc định khi cấp quyền lần đầu: role hệ thống rộng, role nghiệp vụ hẹp. */
function defaultScopeFor(roleCode: string): DataScopeCode {
  return SYSTEM_ROLE_CODES.has(roleCode) ? 'ALL' : 'OWN_MISSION'
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

function scopeColor(scope: DataScopeCode): string {
  if (scope === 'ALL') return 'red'
  if (scope === 'OWN_CENTER') return 'purple'
  if (scope === 'OWN_DEPARTMENT') return 'geekblue'
  return 'default'
}

const ROLE_OPTIONS = RBAC_ROLES.map((role) => ({ value: role.code, label: `${role.name} (${role.code})` }))
const SCOPE_OPTIONS = DATA_SCOPE_DEFINITIONS.map((scope) => ({ value: scope.code, label: scope.name }))

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 · Role Catalog (đọc)
// ─────────────────────────────────────────────────────────────────────────────

function RoleCatalogTab() {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<RoleKind | undefined>()

  const rows = useMemo(
    () =>
      RBAC_ROLES.filter((role) => {
        if (kind && role.kind !== kind) return false
        if (!q) return true
        const s = q.toLowerCase()
        return (
          role.code.toLowerCase().includes(s) ||
          role.name.toLowerCase().includes(s) ||
          role.group.toLowerCase().includes(s)
        )
      }),
    [q, kind],
  )

  const columns: ColumnsType<RbacRole> = [
    {
      title: 'Role',
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
      render: (active: boolean) => active ? <Tag color="green">active</Tag> : <Tag>off</Tag>,
    },
  ]

  return (
    <>
      <FilterBar
        search={{ placeholder: 'Tìm role code / tên / nhóm...', onChange: setQ }}
        selects={[
          {
            key: 'kind',
            placeholder: 'Loại role',
            value: kind,
            onChange: setKind,
            options: (Object.keys(ROLE_KIND_LABEL) as RoleKind[]).map((k) => ({ value: k, label: ROLE_KIND_LABEL[k] })),
          },
        ]}
      />
      <EntityTable<RbacRole>
        rowKey="code"
        columns={columns}
        dataSource={rows}
        scroll={{ y: LIST_SCROLL_Y }}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 · Ma trận phân quyền (CRUD bằng checkbox)
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureState {
  perms: PermissionCode[]
  scope: DataScopeCode
  enabled: boolean
}

function MatrixTab({
  policies,
  setPolicies,
}: {
  policies: RolePermissionPolicy[]
  setPolicies: React.Dispatch<React.SetStateAction<RolePermissionPolicy[]>>
}) {
  const [roleCode, setRoleCode] = useState('ADMIN')
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
          m.set(p.featureCode, { perms: [...p.permissionCodes], scope: p.dataScope, enabled: p.enabled })
        }
      })
    return m
  }, [policies, roleCode])

  const stateOf = (feature: FeatureCode): FeatureState =>
    roleMap.get(feature) ?? { perms: [], scope: defaultScopeFor(roleCode), enabled: true }

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

  const ensure = (map: Map<FeatureCode, RolePermissionPolicy>, feature: FeatureCode): RolePermissionPolicy => {
    let p = map.get(feature)
    if (!p) {
      p = {
        id: policyId(roleCode, feature),
        roleCode,
        featureCode: feature,
        permissionCodes: [],
        dataScope: defaultScopeFor(roleCode),
        enabled: true,
      }
      map.set(feature, p)
    }
    return p
  }

  const togglePerm = (feature: FeatureCode, perm: PermissionCode, checked: boolean) =>
    mutateRole((map) => {
      const p = ensure(map, feature)
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

  const toggleRow = (feature: FeatureCode, checked: boolean) =>
    mutateRole((map) => {
      if (checked) {
        const p = ensure(map, feature)
        p.permissionCodes = PERMISSION_DEFINITIONS.map((d) => d.code)
      } else {
        map.delete(feature)
      }
    })

  const setScope = (feature: FeatureCode, scope: DataScopeCode) =>
    mutateRole((map) => {
      const p = map.get(feature)
      if (p) p.dataScope = scope
    })

  const clearRow = (feature: FeatureCode) => mutateRole((map) => map.delete(feature))

  const grantAll = () =>
    mutateRole((map) => {
      FEATURE_DEFINITIONS.forEach((f) => {
        ensure(map, f.code).permissionCodes = PERMISSION_DEFINITIONS.map((d) => d.code)
      })
    })

  const clearAll = () =>
    confirm({
      title: `Xoá toàn bộ quyền của ${role?.name ?? roleCode}?`,
      content: 'Mọi policy của role này (trong phiên demo) sẽ bị gỡ. Có thể khôi phục mặc định sau.',
      danger: true,
      okText: 'Xoá hết',
      onOk: () => {
        mutateRole((map) => map.clear())
        toast.warning('Đã xoá quyền', `Toàn bộ policy của ${role?.name ?? roleCode} đã được gỡ.`)
      },
    })

  // Cột: Feature (fixed) + mỗi permission 1 cột checkbox + Data scope + xoá dòng.
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
            <div>
              <Text strong>{f.name}</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>{f.group}</Text></div>
            </div>
          </Space>
        )
      },
    },
    ...permColumns,
    {
      title: 'Phạm vi dữ liệu',
      key: 'scope',
      width: 180,
      fixed: 'right',
      render: (_, f) => {
        const st = stateOf(f.code)
        return (
          <Select<DataScopeCode>
            size="small"
            style={{ width: 160 }}
            value={st.perms.length ? st.scope : undefined}
            placeholder="—"
            disabled={st.perms.length === 0}
            options={SCOPE_OPTIONS}
            onChange={(v) => setScope(f.code, v)}
          />
        )
      },
    },
    {
      title: '',
      key: 'action',
      width: 48,
      fixed: 'right',
      align: 'center',
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
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="Ma trận phân quyền — tích để cấp, bỏ tích để thu hồi"
        description="Chọn role, rồi tích ô [chức năng × quyền]. Tích tiêu đề cột để cấp cả cột, tích ô đầu dòng để cấp cả dòng. Mỗi thay đổi ghi ngay vào policy in-memory của phiên demo."
      />

      <FilterBar
        left={
          <Space wrap>
            <Text type="secondary">Role:</Text>
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
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 · Danh sách policy (CRUD dạng bảng + form)
// ─────────────────────────────────────────────────────────────────────────────

interface PolicyFormValues {
  roleCode: string
  featureCode: FeatureCode
  permissionCodes: PermissionCode[]
  dataScope: DataScopeCode
  enabled: boolean
}

function PolicyFormModal({
  open,
  editing,
  onCancel,
  onSubmit,
}: {
  open: boolean
  editing: RolePermissionPolicy | null
  onCancel: () => void
  onSubmit: (values: PolicyFormValues) => void
}) {
  const [form] = Form.useForm<PolicyFormValues>()

  return (
    <Modal
      title={editing ? 'Sửa policy' : 'Thêm policy'}
      open={open}
      destroyOnClose
      onCancel={onCancel}
      okText={editing ? 'Lưu' : 'Thêm'}
      cancelText="Huỷ"
      className="vht-modal-topred"
      onOk={() => form.validateFields().then(onSubmit)}
    >
      <Form<PolicyFormValues>
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={
          editing
            ? {
                roleCode: editing.roleCode,
                featureCode: editing.featureCode,
                permissionCodes: editing.permissionCodes,
                dataScope: editing.dataScope,
                enabled: editing.enabled,
              }
            : { permissionCodes: ['VIEW'], dataScope: 'OWN_MISSION', enabled: true }
        }
      >
        <Form.Item name="roleCode" label="Role" rules={[{ required: true, message: 'Chọn role' }]}>
          <Select showSearch optionFilterProp="label" options={ROLE_OPTIONS} disabled={!!editing} />
        </Form.Item>
        <Form.Item name="featureCode" label="Feature" rules={[{ required: true, message: 'Chọn feature' }]}>
          <Select
            options={FEATURE_DEFINITIONS.map((f) => ({ value: f.code, label: `${f.name} (${f.code})` }))}
            disabled={!!editing}
          />
        </Form.Item>
        <Form.Item
          name="permissionCodes"
          label="Permissions"
          rules={[{ required: true, message: 'Chọn ít nhất 1 permission' }]}
        >
          <Select
            mode="multiple"
            allowClear
            options={PERMISSION_DEFINITIONS.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }))}
          />
        </Form.Item>
        <Form.Item name="dataScope" label="Data scope" rules={[{ required: true }]}>
          <Select options={SCOPE_OPTIONS} />
        </Form.Item>
        <Form.Item name="enabled" label="Bật" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}

function PolicyTab({
  policies,
  setPolicies,
}: {
  policies: RolePermissionPolicy[]
  setPolicies: React.Dispatch<React.SetStateAction<RolePermissionPolicy[]>>
}) {
  const [roleCode, setRoleCode] = useState<string>()
  const [featureCode, setFeatureCode] = useState<FeatureCode>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RolePermissionPolicy | null>(null)
  const toast = useToast()
  const confirm = useConfirm()

  const rows = useMemo(
    () =>
      policies.filter((policy) => {
        if (roleCode && policy.roleCode !== roleCode) return false
        if (featureCode && policy.featureCode !== featureCode) return false
        return true
      }),
    [policies, roleCode, featureCode],
  )

  const toggle = (id: string, enabled: boolean) => {
    setPolicies((prev) => prev.map((policy) => policy.id === id ? { ...policy, enabled } : policy))
  }

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (policy: RolePermissionPolicy) => {
    setEditing(policy)
    setModalOpen(true)
  }

  const remove = (policy: RolePermissionPolicy) =>
    confirm({
      title: 'Xoá policy này?',
      content: `${ROLE_LABEL[policy.roleCode] ?? policy.roleCode} · ${FEATURE_LABEL[policy.featureCode]}`,
      danger: true,
      okText: 'Xoá',
      onOk: () => {
        setPolicies((prev) => prev.filter((p) => p.id !== policy.id))
        toast.warning('Đã xoá policy', policy.id)
      },
    })

  const handleSubmit = (values: PolicyFormValues) => {
    if (editing) {
      setPolicies((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...values } : p))
      toast.success('Đã lưu policy', editing.id)
    } else {
      const dup = policies.some((p) => p.roleCode === values.roleCode && p.featureCode === values.featureCode)
      const id = dup
        ? `${policyId(values.roleCode, values.featureCode)}-${Date.now().toString().slice(-4)}`
        : policyId(values.roleCode, values.featureCode)
      setPolicies((prev) => [...prev, { id, ...values }])
      toast.success('Đã thêm policy', id)
    }
    setModalOpen(false)
    setEditing(null)
  }

  const columns: ColumnsType<RolePermissionPolicy> = [
    {
      title: 'Role',
      dataIndex: 'roleCode',
      width: 220,
      render: (code: string) => (
        <div>
          <Text code>{code}</Text>
          <div><Text type="secondary">{ROLE_LABEL[code] ?? code}</Text></div>
        </div>
      ),
    },
    {
      title: 'Feature',
      dataIndex: 'featureCode',
      width: 180,
      render: (code: FeatureCode) => (
        <div>
          <Text strong>{FEATURE_LABEL[code]}</Text>
          <div><Text code style={{ fontSize: 11 }}>{code}</Text></div>
        </div>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissionCodes',
      render: (permissionCodes: PermissionCode[]) => (
        <Space size={[4, 4]} wrap>
          {permissionCodes.map((code) => (
            <Tag key={code} color={permissionColor(code)}>{PERMISSION_LABEL[code]}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Data scope',
      dataIndex: 'dataScope',
      width: 170,
      render: (scope: DataScopeCode) => (
        <Tag color={scopeColor(scope)}>{DATA_SCOPE_LABEL[scope]}</Tag>
      ),
    },
    {
      title: 'Bật',
      dataIndex: 'enabled',
      width: 70,
      render: (enabled: boolean, policy) => (
        <Switch size="small" checked={enabled} onChange={(checked) => toggle(policy.id, checked)} />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 110,
      align: 'right',
      render: (_, policy) => (
        <Space size={4}>
          <Button type="link" size="small" style={{ paddingInline: 4 }} onClick={() => openEdit(policy)}>Sửa</Button>
          <Button type="link" size="small" danger style={{ paddingInline: 4 }} onClick={() => remove(policy)}>Xoá</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="Danh sách policy in-memory"
        description="Mỗi dòng = role nào có permission nào trên feature nào và trong data scope nào. Thêm / Sửa / Xoá / bật-tắt chỉ tác động trong phiên demo."
      />
      <FilterBar
        selects={[
          {
            key: 'role',
            placeholder: 'Lọc role',
            value: roleCode,
            onChange: setRoleCode,
            width: 240,
            options: ROLE_OPTIONS,
          },
          {
            key: 'feature',
            placeholder: 'Lọc feature',
            value: featureCode,
            onChange: setFeatureCode,
            width: 220,
            options: FEATURE_DEFINITIONS.map((feature) => ({ value: feature.code, label: feature.name })),
          },
        ]}
        right={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm policy</Button>
        }
      />
      <EntityTable<RolePermissionPolicy>
        rowKey="id"
        columns={columns}
        dataSource={rows}
        scroll={{ y: LIST_SCROLL_Y }}
      />
      <PolicyFormModal
        open={modalOpen}
        editing={editing}
        onCancel={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4 · Simulator (đọc)
// ─────────────────────────────────────────────────────────────────────────────

function SimulatorTab({ policies }: { policies: RolePermissionPolicy[] }) {
  const [userId, setUserId] = useState(users[0]?.id)
  const [featureCode, setFeatureCode] = useState<FeatureCode>('DOSSIER')
  const [permissionCode, setPermissionCode] = useState<PermissionCode>('VIEW')

  const user = users.find((u) => u.id === userId)
  const principal = getPrincipal(user)
  const result = checkPermission(user, featureCode, permissionCode, policies)
  const scopes = getEffectiveDataScopes(user, featureCode, policies)

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={9}>
        <Card size="small" title={<Space><SafetyCertificateOutlined />Ngữ cảnh kiểm tra</Space>}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div>
              <Text type="secondary">User</Text>
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
              <Text type="secondary">Feature</Text>
              <Select
                value={featureCode}
                onChange={setFeatureCode}
                style={{ width: '100%', marginTop: 4 }}
                options={FEATURE_DEFINITIONS.map((feature) => ({ value: feature.code, label: feature.name }))}
              />
            </div>
            <div>
              <Text type="secondary">Permission</Text>
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
        <Card size="small" title="Kết quả policy engine">
          <Alert
            type={result.allowed ? 'success' : 'warning'}
            showIcon
            message={result.allowed ? 'Được phép' : 'Không được phép'}
            description={result.reason}
            style={{ marginBottom: 12 }}
          />

          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Role hiệu lực</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {principal?.roleCodes.map((code) => (
                    <Tag key={code} color={code === 'ADMIN' ? 'volcano' : 'blue'}>{ROLE_LABEL[code] ?? code}</Tag>
                  ))}
                </Space>
              </div>
            </div>

            <div>
              <Text type="secondary">Permission trên feature</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {result.permissionCodes.length ? result.permissionCodes.map((code) => (
                    <Tag key={code} color={permissionColor(code)}>{PERMISSION_LABEL[code]}</Tag>
                  )) : <Text type="secondary">Không có permission nào.</Text>}
                </Space>
              </div>
            </div>

            <div>
              <Text type="secondary">Data scope hiệu lực</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {scopes.length ? scopes.map((scope) => (
                    <Tag key={scope} color={scopeColor(scope)}>{DATA_SCOPE_LABEL[scope]}</Tag>
                  )) : <Text type="secondary">Không có scope.</Text>}
                </Space>
              </div>
            </div>

            <div>
              <Text type="secondary">Policy khớp</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {result.matchedPolicies.length ? result.matchedPolicies.map((policy) => (
                    <Tag key={policy.id}>{policy.id}</Tag>
                  )) : <Text type="secondary">Không có policy khớp.</Text>}
                </Space>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Trang
// ─────────────────────────────────────────────────────────────────────────────

export default function RolePermission() {
  const [policies, setPolicies] = useState<RolePermissionPolicy[]>(ROLE_PERMISSION_POLICIES)
  const [activeKey, setActiveKey] = useState('matrix')
  const toast = useToast()
  const confirm = useConfirm()

  const stats = useMemo(
    () => ({
      roles: RBAC_ROLES.length,
      policies: policies.length,
      enabledPolicies: policies.filter((policy) => policy.enabled).length,
      features: FEATURE_DEFINITIONS.length,
    }),
    [policies],
  )

  const resetDefault = () =>
    confirm({
      title: 'Khôi phục phân quyền mặc định?',
      content: 'Mọi thay đổi trong phiên demo sẽ bị bỏ, đưa toàn bộ policy về cấu hình gốc.',
      okText: 'Khôi phục',
      onOk: () => {
        setPolicies(ROLE_PERMISSION_POLICIES)
        toast.success('Đã khôi phục', 'Phân quyền trở về cấu hình mặc định.')
      },
    })

  const items = [
    {
      key: 'matrix',
      label: <Space><ApartmentOutlined />Ma trận phân quyền</Space>,
      children: <MatrixTab policies={policies} setPolicies={setPolicies} />,
    },
    {
      key: 'policies',
      label: <Space><KeyOutlined />Danh sách policy</Space>,
      children: <PolicyTab policies={policies} setPolicies={setPolicies} />,
    },
    {
      key: 'roles',
      label: <Space><TeamOutlined />Danh mục role</Space>,
      children: <RoleCatalogTab />,
    },
    {
      key: 'simulator',
      label: <Space><SafetyCertificateOutlined />Mô phỏng</Space>,
      children: <SimulatorTab policies={policies} />,
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<KeyOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title="Phân quyền"
        tag={<Tag color="processing">EPIC03 · Role &amp; Permission</Tag>}
        code={<Text type="secondary">Role / Permission / Feature / Policy / Scope</Text>}
        breadcrumb={[{ label: 'Hệ thống QTKHCN' }, { label: 'Phân quyền' }]}
        extra={
          <Button icon={<ReloadOutlined />} onClick={resetDefault}>Khôi phục mặc định</Button>
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Mock in-memory — chỉnh sửa trực tiếp trên ma trận"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            Màn này gom role hệ thống, role nghiệp vụ, permission, feature, policy và data scope vào một nơi.
            Cấp/thu hồi quyền ngay trên ma trận checkbox; mọi thay đổi chỉ có hiệu lực trong phiên demo.
          </Paragraph>
        }
      />

      <Row gutter={14} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><StatCard title="Roles" value={stats.roles} color="#1677ff" /></Col>
        <Col xs={12} md={6}><StatCard title="Features" value={stats.features} color="#17935a" /></Col>
        <Col xs={12} md={6}><StatCard title="Policies" value={stats.policies} color="#722ed1" /></Col>
        <Col xs={12} md={6}><StatCard title="Đang bật" value={stats.enabledPolicies} color="#ee0033" /></Col>
      </Row>

      <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
    </div>
  )
}
