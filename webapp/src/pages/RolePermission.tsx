import { useMemo, useState } from 'react'
import { Alert, Card, Col, Row, Select, Space, Switch, Tabs, Tag, Typography } from 'antd'
import {
  ApartmentOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import { users } from '../data/users'
import {
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
      title: 'Loai',
      dataIndex: 'kind',
      width: 150,
      render: (value: RoleKind) => (
        <Tag color={value === 'SYSTEM' ? 'volcano' : 'blue'}>{ROLE_KIND_LABEL[value]}</Tag>
      ),
    },
    { title: 'Nhom', dataIndex: 'group', width: 220 },
    { title: 'Mo ta', dataIndex: 'description' },
    {
      title: 'Trang thai',
      dataIndex: 'active',
      width: 110,
      render: (active: boolean) => active ? <Tag color="green">active</Tag> : <Tag>off</Tag>,
    },
  ]

  return (
    <>
      <FilterBar
        search={{ placeholder: 'Tim role code / ten / nhom...', onChange: setQ }}
        selects={[
          {
            key: 'kind',
            placeholder: 'Loai role',
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

function PolicyTab({
  policies,
  setPolicies,
}: {
  policies: RolePermissionPolicy[]
  setPolicies: React.Dispatch<React.SetStateAction<RolePermissionPolicy[]>>
}) {
  const [roleCode, setRoleCode] = useState<string>()
  const [featureCode, setFeatureCode] = useState<FeatureCode>()

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
      width: 180,
      render: (scope: DataScopeCode) => (
        <Tag color={scopeColor(scope)}>{DATA_SCOPE_LABEL[scope]}</Tag>
      ),
    },
    {
      title: 'Bat',
      dataIndex: 'enabled',
      width: 80,
      render: (enabled: boolean, policy) => (
        <Switch size="small" checked={enabled} onChange={(checked) => toggle(policy.id, checked)} />
      ),
    },
  ]

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="Policy mock in-memory"
        description="Bang nay mo phong RolePermissionPolicy backend: role nao co permission nao tren feature nao va trong data scope nao. Toggle chi tac dong trong phien hien tai."
      />
      <FilterBar
        selects={[
          {
            key: 'role',
            placeholder: 'Loc role',
            value: roleCode,
            onChange: setRoleCode,
            width: 240,
            options: RBAC_ROLES.map((role) => ({ value: role.code, label: `${role.name} (${role.code})` })),
          },
          {
            key: 'feature',
            placeholder: 'Loc feature',
            value: featureCode,
            onChange: setFeatureCode,
            width: 220,
            options: FEATURE_DEFINITIONS.map((feature) => ({ value: feature.code, label: feature.name })),
          },
        ]}
      />
      <EntityTable<RolePermissionPolicy>
        rowKey="id"
        columns={columns}
        dataSource={rows}
        scroll={{ y: LIST_SCROLL_Y }}
      />
    </>
  )
}

function MatrixTab({ policies }: { policies: RolePermissionPolicy[] }) {
  const [roleCode, setRoleCode] = useState('ADMIN')

  const rows = useMemo(
    () =>
      FEATURE_DEFINITIONS.map((feature) => {
        const matched = policies.filter(
          (policy) => policy.enabled && policy.roleCode === roleCode && policy.featureCode === feature.code,
        )
        return {
          feature,
          permissionCodes: [...new Set(matched.flatMap((policy) => policy.permissionCodes))],
          scopes: [...new Set(matched.map((policy) => policy.dataScope))],
        }
      }),
    [policies, roleCode],
  )

  const columns = [
    {
      title: 'Feature',
      key: 'feature',
      width: 260,
      render: (_: unknown, row: (typeof rows)[number]) => (
        <div>
          <Text strong>{row.feature.name}</Text>
          <div><Text type="secondary">{row.feature.group}</Text></div>
        </div>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_: unknown, row: (typeof rows)[number]) =>
        row.permissionCodes.length ? (
          <Space size={[4, 4]} wrap>
            {row.permissionCodes.map((code) => (
              <Tag key={code} color={permissionColor(code)}>{PERMISSION_LABEL[code]}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">Khong co quyen</Text>
        ),
    },
    {
      title: 'Scopes',
      key: 'scopes',
      width: 220,
      render: (_: unknown, row: (typeof rows)[number]) =>
        row.scopes.length ? (
          <Space size={[4, 4]} wrap>
            {row.scopes.map((scope) => (
              <Tag key={scope} color={scopeColor(scope)}>{DATA_SCOPE_LABEL[scope]}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
  ]

  return (
    <>
      <FilterBar
        left={
          <Select
            showSearch
            value={roleCode}
            onChange={setRoleCode}
            style={{ width: 320 }}
            optionFilterProp="label"
            options={RBAC_ROLES.map((role) => ({ value: role.code, label: `${role.name} (${role.code})` }))}
          />
        }
      />
      <EntityTable
        rowKey={(row) => row.feature.code}
        columns={columns}
        dataSource={rows}
        scroll={{ y: LIST_SCROLL_Y }}
      />
    </>
  )
}

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
        <Card size="small" title={<Space><SafetyCertificateOutlined />Ngu canh kiem tra</Space>}>
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
        <Card size="small" title="Ket qua policy engine">
          <Alert
            type={result.allowed ? 'success' : 'warning'}
            showIcon
            message={result.allowed ? 'Duoc phep' : 'Khong duoc phep'}
            description={result.reason}
            style={{ marginBottom: 12 }}
          />

          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Role hieu luc</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {principal?.roleCodes.map((code) => (
                    <Tag key={code} color={code === 'ADMIN' ? 'volcano' : 'blue'}>{ROLE_LABEL[code] ?? code}</Tag>
                  ))}
                </Space>
              </div>
            </div>

            <div>
              <Text type="secondary">Permission tren feature</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {result.permissionCodes.length ? result.permissionCodes.map((code) => (
                    <Tag key={code} color={permissionColor(code)}>{PERMISSION_LABEL[code]}</Tag>
                  )) : <Text type="secondary">Khong co permission nao.</Text>}
                </Space>
              </div>
            </div>

            <div>
              <Text type="secondary">Data scope hieu luc</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {scopes.length ? scopes.map((scope) => (
                    <Tag key={scope} color={scopeColor(scope)}>{DATA_SCOPE_LABEL[scope]}</Tag>
                  )) : <Text type="secondary">Khong co scope.</Text>}
                </Space>
              </div>
            </div>

            <div>
              <Text type="secondary">Policy khop</Text>
              <div style={{ marginTop: 4 }}>
                <Space size={[4, 4]} wrap>
                  {result.matchedPolicies.length ? result.matchedPolicies.map((policy) => (
                    <Tag key={policy.id}>{policy.id}</Tag>
                  )) : <Text type="secondary">Khong co policy khop.</Text>}
                </Space>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}

export default function RolePermission() {
  const [policies, setPolicies] = useState<RolePermissionPolicy[]>(ROLE_PERMISSION_POLICIES)

  const stats = useMemo(
    () => ({
      roles: RBAC_ROLES.length,
      policies: policies.length,
      enabledPolicies: policies.filter((policy) => policy.enabled).length,
      features: FEATURE_DEFINITIONS.length,
    }),
    [policies],
  )

  const items = [
    {
      key: 'roles',
      label: <Space><TeamOutlined />Role Catalog</Space>,
      children: <RoleCatalogTab />,
    },
    {
      key: 'policies',
      label: <Space><KeyOutlined />Permission Policies</Space>,
      children: <PolicyTab policies={policies} setPolicies={setPolicies} />,
    },
    {
      key: 'matrix',
      label: <Space><ApartmentOutlined />Matrix</Space>,
      children: <MatrixTab policies={policies} />,
    },
    {
      key: 'simulator',
      label: <Space><SafetyCertificateOutlined />Simulator</Space>,
      children: <SimulatorTab policies={policies} />,
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<KeyOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title="Phan quyen"
        tag={<Tag color="processing">EPIC03 - Role & Permission</Tag>}
        code={<Text type="secondary">Role / Permission / Feature / Policy / Scope</Text>}
        breadcrumb={[{ label: 'He thong QTKHCN' }, { label: 'Phan quyen' }]}
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Mock in-memory, model dat theo huong backend"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            Man nay la buoc dau cua EPIC03: gom role he thong, role nghiep vu, permission, feature,
            policy va data scope vao mot noi. Cac toggle hien tai chi co hieu luc trong phien demo.
          </Paragraph>
        }
      />

      <Row gutter={14} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><StatCard title="Roles" value={stats.roles} color="#1677ff" /></Col>
        <Col xs={12} md={6}><StatCard title="Features" value={stats.features} color="#17935a" /></Col>
        <Col xs={12} md={6}><StatCard title="Policies" value={stats.policies} color="#722ed1" /></Col>
        <Col xs={12} md={6}><StatCard title="Dang bat" value={stats.enabledPolicies} color="#ee0033" /></Col>
      </Row>

      <Tabs defaultActiveKey="roles" items={items} />
    </div>
  )
}

