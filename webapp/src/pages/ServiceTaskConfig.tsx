import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Dropdown,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ApiOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  ClearOutlined,
  CopyOutlined,
  DatabaseOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  MoreOutlined,
  PlusOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import ServiceTaskBindingTable from '../components/ServiceTaskBindingTable'
import ServiceTaskExecutionDrawer from '../components/ServiceTaskExecutionDrawer'
import ServiceTaskFormDrawer from '../components/ServiceTaskFormDrawer'
import ServiceTaskTestPanel from '../components/ServiceTaskTestPanel'
import { EmptyState, PageHeader, StatCard, StatusTag } from '../components/ui'
import {
  reconcilableServiceTaskProcesses,
  summarizeServiceTaskReconcileHealth,
} from '../data/serviceTaskReconcile'
import {
  SERVICE_TASK_EXECUTION_STATUS_META,
  SERVICE_TASK_STATUS_META,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskDefinitionStatus,
  type ServiceTaskExecutionConfig,
  type ServiceTaskExecutionStatus,
  type ServiceTaskCategory,
  type ServiceTaskTypeCode,
} from '../data/serviceTasks'
import { useAuth } from '../store/AuthContext'
import { useServiceTasks } from '../store/ServiceTaskContext'

const { Text } = Typography

const CATEGORY_GROUPS: { key: ServiceTaskCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'communication', label: 'Giao tiếp', icon: <SendOutlined /> },
  { key: 'integration', label: 'Tích hợp', icon: <ApiOutlined /> },
  { key: 'data', label: 'Dữ liệu', icon: <DatabaseOutlined /> },
  { key: 'document', label: 'Văn bản', icon: <FileTextOutlined /> },
  { key: 'decision', label: 'Quyết định', icon: <BranchesOutlined /> },
]

interface DefinitionRow extends ServiceTaskDefinition {
  typeName: string
  latestVersion?: ServiceTaskConfigVersion
  bindingCount: number
  processCodes: string[]
  connectorKey?: string
  incidentCount: number
  successRate: string
}

function latestVersion(versions: ServiceTaskConfigVersion[]): ServiceTaskConfigVersion | undefined {
  return [...versions].sort((a, b) => b.versionNo - a.versionNo)[0]
}

function connectorOf(config?: ServiceTaskExecutionConfig): string | undefined {
  return config?.typeCode === 'CALL_API' ? config.connectorKey : undefined
}

export default function ServiceTaskConfig() {
  const { message } = App.useApp()
  const { user } = useAuth()
  const serviceTasks = useServiceTasks()
  const [editing, setEditing] = useState<ServiceTaskDefinition | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<ServiceTaskTypeCode | undefined>()
  const [statusFilter, setStatusFilter] = useState<ServiceTaskDefinitionStatus | undefined>()
  const [processFilter, setProcessFilter] = useState<string | undefined>()
  const [connectorFilter, setConnectorFilter] = useState<string | undefined>()
  const [incidentFilter, setIncidentFilter] = useState<boolean | undefined>()
  const [logProcessFilter, setLogProcessFilter] = useState<string | undefined>()
  const [logDefinitionFilter, setLogDefinitionFilter] = useState<string | undefined>()
  const [logStatusFilter, setLogStatusFilter] = useState<ServiceTaskExecutionStatus | undefined>()
  const [logIncidentFilter, setLogIncidentFilter] = useState<boolean | undefined>()
  const [selectedLogId, setSelectedLogId] = useState<string | undefined>()
  const [auditDefinitionFilter, setAuditDefinitionFilter] = useState<string | undefined>()

  const rows = useMemo<DefinitionRow[]>(() => {
    return serviceTasks.definitions.map((definition) => {
      const type = serviceTasks.types.find((item) => item.code === definition.typeCode)
      const versions = serviceTasks.getVersions(definition.id)
      const latest = latestVersion(versions)
      const bindings = serviceTasks.bindings.filter(
        (binding) => binding.serviceTaskDefinitionId === definition.id && binding.bindingStatus === 'ACTIVE',
      )
      const logs = serviceTasks.executionLogs.filter((log) => log.serviceTaskDefinitionId === definition.id)
      const successCount = logs.filter((log) => log.status === 'SUCCESS').length
      const incidentCount = logs.filter((log) => log.status === 'FAILED' && log.incidentId).length
      return {
        ...definition,
        typeName: type?.name ?? definition.typeCode,
        latestVersion: latest,
        bindingCount: bindings.length,
        processCodes: [...new Set(bindings.map((binding) => binding.processCode))],
        connectorKey: connectorOf(latest?.configJson),
        incidentCount,
        successRate: logs.length ? `${Math.round((successCount / logs.length) * 100)}%` : '-',
      }
    })
  }, [serviceTasks])

  const filteredRows = rows.filter((row) => {
    if (typeFilter && row.typeCode !== typeFilter) return false
    if (statusFilter && row.status !== statusFilter) return false
    if (processFilter && !row.processCodes.includes(processFilter)) return false
    if (connectorFilter && row.connectorKey !== connectorFilter) return false
    if (incidentFilter !== undefined && (row.incidentCount > 0) !== incidentFilter) return false
    return true
  })

  const actor = user?.email ?? 'admin'
  const reconcileProcesses = useMemo(() => reconcilableServiceTaskProcesses(), [])
  const reconcileHealth = useMemo(
    () =>
      summarizeServiceTaskReconcileHealth(
        reconcileProcesses,
        serviceTasks.bindings,
        serviceTasks.definitions,
        serviceTasks.versions,
      ),
    [reconcileProcesses, serviceTasks.bindings, serviceTasks.definitions, serviceTasks.versions],
  )
  const missingBinding = reconcileHealth.missingCount
  const openIncidents = serviceTasks.executionLogs.filter((log) => log.status === 'FAILED' && log.incidentId).length

const trends = useMemo(() => ({
    total: { direction: 'up' as const, pct: 12 },
    active: { direction: 'up' as const, pct: 8 },
    missingBinding: { direction: 'down' as const, pct: 25 },
    incidents: { direction: 'down' as const, pct: 50 },
  }), [rows.length])

  const topProcesses = useMemo(() => {
    const map = new Map<string, number>()
    serviceTasks.bindings
      .filter((b) => b.bindingStatus === 'ACTIVE')
      .forEach((b) => map.set(b.processCode, (map.get(b.processCode) ?? 0) + 1))
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count }))
  }, [serviceTasks.bindings])

  const filteredStats = useMemo(() => ({
    total: filteredRows.length,
    active: filteredRows.filter((r) => r.status === 'ACTIVE').length,
    withIncidents: filteredRows.filter((r) => r.incidentCount > 0).length,
    missingBinding: filteredRows.filter((r) => r.bindingCount === 0).length,
  }), [filteredRows])

  const activeFilters: { key: string; label: string; onClear: () => void }[] = [
    ...(typeFilter ? [{ key: 'type', label: `Loại: ${serviceTasks.types.find((t) => t.code === typeFilter)?.name ?? typeFilter}`, onClear: () => setTypeFilter(undefined) }] : []),
    ...(statusFilter ? [{ key: 'status', label: `Trạng thái: ${SERVICE_TASK_STATUS_META[statusFilter].label}`, onClear: () => setStatusFilter(undefined) }] : []),
    ...(processFilter ? [{ key: 'process', label: `Quy trình: ${processFilter}`, onClear: () => setProcessFilter(undefined) }] : []),
    ...(connectorFilter ? [{ key: 'connector', label: `Connector: ${connectorFilter}`, onClear: () => setConnectorFilter(undefined) }] : []),
    ...(incidentFilter !== undefined ? [{ key: 'incident', label: `Incident: ${incidentFilter ? 'Có' : 'Không'}`, onClear: () => setIncidentFilter(undefined) }] : []),
  ]
  const processOptions = [


    ...new Set([
      ...serviceTasks.bindings.map((binding) => binding.processCode),
      ...reconcileProcesses.map((process) => process.processCode),
    ]),
  ].map((value) => ({ label: value, value }))
  const connectorOptions = [...new Set(rows.map((row) => row.connectorKey).filter(Boolean) as string[])].map(
    (value) => ({ label: value, value }),
  )
  const definitionOptions = serviceTasks.definitions.map((definition) => ({
    label: `${definition.name} - ${definition.code}`,
    value: definition.id,
  }))
  const selectedLog = selectedLogId
    ? serviceTasks.executionLogs.find((log) => log.id === selectedLogId)
    : undefined
  const selectedLogDefinition = selectedLog ? serviceTasks.getDefinition(selectedLog.serviceTaskDefinitionId) : undefined
  const selectedLogVersion = selectedLog
    ? serviceTasks.getVersion(selectedLog.serviceTaskDefinitionId, selectedLog.configVersionNo)
    : undefined
  const filteredExecutionLogs = serviceTasks.executionLogs.filter((log) => {
    if (logProcessFilter && log.processCode !== logProcessFilter) return false
    if (logDefinitionFilter && log.serviceTaskDefinitionId !== logDefinitionFilter) return false
    if (logStatusFilter && log.status !== logStatusFilter) return false
    if (logIncidentFilter !== undefined && Boolean(log.incidentId) !== logIncidentFilter) return false
    return true
  })
  const versionRows = serviceTasks.versions.filter((version) =>
    auditDefinitionFilter ? version.serviceTaskDefinitionId === auditDefinitionFilter : true,
  )
  const auditEntityIds = new Set([
    ...(auditDefinitionFilter ? [auditDefinitionFilter] : serviceTasks.definitions.map((definition) => definition.id)),
    ...versionRows.map((version) => version.id),
    ...serviceTasks.bindings
      .filter((binding) => !auditDefinitionFilter || binding.serviceTaskDefinitionId === auditDefinitionFilter)
      .map((binding) => binding.id),
    ...serviceTasks.executionLogs
      .filter((log) => !auditDefinitionFilter || log.serviceTaskDefinitionId === auditDefinitionFilter)
      .map((log) => log.id),
  ])
  const filteredAuditEntries = serviceTasks.auditEntries.filter((entry) =>
    auditDefinitionFilter ? auditEntityIds.has(entry.entityId) : true,
  )

  const validate = (definition: ServiceTaskDefinition) => {
    const version = latestVersion(serviceTasks.getVersions(definition.id))
    if (!version) {
      message.error('Chưa có version để validate.')
      return
    }
    const result = serviceTasks.validateVersion(definition.id, version.versionNo, actor)
    if (result.valid) {
      message.success('Cấu hình hợp lệ, đã chuyển trạng thái sẵn sàng.')
      return
    }
    Modal.error({
      title: 'Cấu hình chưa hợp lệ',
      content: (
        <Space direction="vertical" size={4}>
          {result.errors.map((error) => (
            <Text key={error}>{error}</Text>
          ))}
        </Space>
      ),
    })
  }

  const activate = (definition: ServiceTaskDefinition) => {
    const version = latestVersion(serviceTasks.getVersions(definition.id))
    if (!version) {
      message.error('Chưa có version để active.')
      return
    }
    const result = serviceTasks.activateVersion(definition.id, version.versionNo, actor, 'Active từ màn cấu hình.')
    if (result.valid) message.success(`Đã active version ${version.versionNo}.`)
    else message.error('Không thể active do cấu hình chưa hợp lệ.')
  }

  const duplicate = (definition: ServiceTaskDefinition) => {
    const duplicatedId = serviceTasks.duplicateDefinition(definition.id, actor)
    if (duplicatedId) message.success('Đã tạo bản sao cấu hình.')
  }

  const columns: ColumnsType<DefinitionRow> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      width: 190,
      fixed: 'left',
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (value, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.ownerModule}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      width: 240,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, row) => (
        <Space direction="vertical" size={2}>
          <Text>{value}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.description}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'typeName',
      width: 150,
      render: (value, row) => (
        <Space direction="vertical" size={0}>
          <Text>{value}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.typeCode}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: ServiceTaskDefinitionStatus, row) => {
        const meta = SERVICE_TASK_STATUS_META[status]
        const ver = row.latestVersion?.versionNo
        return (
          <Space size={4}>
            <StatusTag color={meta.color} label={meta.label} />
            {ver !== undefined && (
              <Tag style={{ fontSize: 11, margin: 0 }}>v{ver}</Tag>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Binding',
      dataIndex: 'bindingCount',
      width: 170,
      render: (_, row) => {
        const codes = row.processCodes
        if (codes.length === 0) return <Text type="secondary">Chưa gắn</Text>
        const visible = codes.slice(0, 2)
        const rest = codes.length - visible.length
        return (
          <Space size={2} wrap>
            {visible.map((code) => (
              <Tag key={code} style={{ fontSize: 11, margin: 0 }}>{code}</Tag>
            ))}
            {rest > 0 && (
              <Tooltip title={codes.slice(2).join(', ')}>
                <Tag style={{ fontSize: 11, margin: 0, cursor: 'pointer' }}>+{rest}</Tag>
              </Tooltip>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Success 7 ngày',
      dataIndex: 'successRate',
      width: 150,
      sorter: (a, b) => {
        const na = a.successRate === '-' ? -1 : parseInt(a.successRate)
        const nb = b.successRate === '-' ? -1 : parseInt(b.successRate)
        return na - nb
      },
      render: (value: string) => {
        if (value === '-') return <Text type="secondary">-</Text>
        const pct = parseInt(value)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Progress
              percent={pct}
              size="small"
              showInfo={false}
              strokeColor={pct >= 90 ? '#1677ff' : pct >= 70 ? '#fa8c16' : '#cf1322'}
              style={{ width: 56, margin: 0 }}
            />
            <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{value}</Text>
          </div>
        )
      },
    },
    {
      title: 'Incident',
      dataIndex: 'incidentCount',
      width: 90,
      sorter: (a, b) => a.incidentCount - b.incidentCount,
      render: (value) => (value ? <Tag color="error">{value}</Tag> : <Tag>0</Tag>),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      width: 140,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '',
      width: 52,
      fixed: 'right',
      render: (_, row) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Sửa cấu hình',
                onClick: () => {
                  setEditing(row)
                  setDrawerOpen(true)
                },
              },
              { type: 'divider' },
              {
                key: 'copy',
                icon: <CopyOutlined />,
                label: 'Nhân bản',
                onClick: () => duplicate(row),
              },
              {
                key: 'validate',
                icon: <CheckCircleOutlined />,
                label: 'Validate',
                onClick: () => validate(row),
              },
              {
                key: 'activate',
                icon: <ThunderboltOutlined />,
                label: 'Active',
                disabled: row.status === 'ACTIVE',
                onClick: () => activate(row),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} type="text" />
        </Dropdown>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Cấu hình Service Task"
        icon={<ApiOutlined style={{ color: 'var(--vht-red)', fontSize: 28 }} />}
        breadcrumb={[
          { label: 'Hệ thống QTKHCN' },
          { label: 'Quản trị quy trình' },
          { label: 'Cấu hình Service Task' },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(undefined)
              setDrawerOpen(true)
            }}
          >
            Tạo cấu hình
          </Button>
        }
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={5}>
          <StatCard
            title="Tổng cấu hình"
            value={rows.length}
            suffix={trends.total !== undefined ? <span style={{ fontSize: 12, color: trends.total.direction === 'up' ? '#1677ff' : '#cf1322' }}>{trends.total.direction === 'up' ? '↑' : '↓'} {trends.total.pct}%</span> : undefined}
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <StatCard
            title="Đang active"
            value={rows.filter((row) => row.status === 'ACTIVE').length}
            color="#1677ff"
            suffix={trends.active !== undefined ? <span style={{ fontSize: 12, color: trends.active.direction === 'up' ? '#1677ff' : '#cf1322' }}>{trends.active.direction === 'up' ? '↑' : '↓'} {trends.active.pct}%</span> : undefined}
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <StatCard
            title="Thiếu binding"
            value={missingBinding}
            color={missingBinding ? '#fa8c16' : undefined}
            suffix={trends.missingBinding !== undefined ? <span style={{ fontSize: 12, color: trends.missingBinding.direction === 'down' ? '#389e0d' : '#cf1322' }}>{trends.missingBinding.direction === 'down' ? '↓' : '↑'} {trends.missingBinding.pct}%</span> : undefined}
          />
        </Col>
        <Col xs={24} sm={12} md={5}>
          <StatCard
            title="Incident mở"
            value={openIncidents}
            color={openIncidents ? '#cf1322' : undefined}
            suffix={trends.incidents !== undefined ? <span style={{ fontSize: 12, color: trends.incidents.direction === 'down' ? '#389e0d' : '#cf1322' }}>{trends.incidents.direction === 'down' ? '↓' : '↑'} {trends.incidents.pct}%</span> : undefined}
          />
        </Col>
        <Col xs={24} md={4} style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <Button type="primary" icon={<PlusOutlined />} block onClick={() => { setEditing(undefined); setDrawerOpen(true) }}>
            Tạo mới
          </Button>
          <Button icon={<CheckCircleOutlined />} block>
            Đối soát
          </Button>
          <Button icon={<EyeOutlined />} block>
            Xem log
          </Button>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small" title="Phân bổ trạng thái">
            {(['DRAFT', 'READY', 'ACTIVE', 'DEPRECATED', 'ERROR'] as const).map((status) => {
              const count = rows.filter((r) => r.status === status).length
              const meta = SERVICE_TASK_STATUS_META[status]
              const pct = rows.length ? Math.round((count / rows.length) * 100) : 0
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <Text style={{ width: 72, fontSize: 12 }}>{meta.label}</Text>
                  <div style={{ flex: 1, height: 10, background: 'var(--vht-border)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: meta.color, borderRadius: 5, transition: 'width 0.4s', minWidth: pct > 0 ? 8 : 0 }} />
                  </div>
                  <Text strong style={{ width: 28, textAlign: 'right', fontSize: 12 }}>{count}</Text>
                </div>
              )
            })}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" title="Process gắn nhiều nhất">
            {topProcesses.length === 0 ? (
              <EmptyState compact title="Chưa có binding nào" />
            ) : (
              topProcesses.slice(0, 5).map((p) => (
                <div key={p.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid var(--vht-border)' }}>
                  <Text style={{ fontSize: 12 }}>{p.code}</Text>
                  <Tag>{p.count} binding</Tag>
                </div>
              ))
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" title="Phân bổ theo loại">
            {serviceTasks.types.map((type) => {
              const count = rows.filter((r) => r.typeCode === type.code).length
              const pct = rows.length ? Math.round((count / rows.length) * 100) : 0
              return (
                <div key={type.code} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <Text style={{ width: 105, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{type.name}</Text>
                  <div style={{ flex: 1, height: 10, background: 'var(--vht-border)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: '#1677ff', borderRadius: 5, transition: 'width 0.4s', minWidth: pct > 0 ? 8 : 0 }} />
                  </div>
                  <Text strong style={{ width: 28, textAlign: 'right', fontSize: 12 }}>{count}</Text>
                </div>
              )
            })}
          </Card>
        </Col>
      </Row>

      <Tabs
        items={[
          {
            key: 'overview',
            label: 'Tổng quan',
            children: (
              <>
<Row gutter={[12, 12]}>
                <Col xs={24} lg={14}>
                  <Card size="small" title="Cấu hình cần chú ý">
                    <Table
                      size="small"
                      rowKey="id"
                      pagination={{
                        pageSize: 6,
                        showSizeChanger: true,
                        pageSizeOptions: [6, 10, 20],
                        showTotal: (total: number) => `Tổng ${total} config cần chú ý`,
                        hideOnSinglePage: true,
                      }}
                      dataSource={rows.filter((row) => row.incidentCount > 0 || row.bindingCount === 0)}
                      columns={columns.slice(0, 8)}
                      scroll={{ x: 1260, y: 320 }}
                      locale={{
                        emptyText: (
                          <EmptyState
                            compact
                            title="Tất cả cấu hình đều ổn"
                            description="Không có config nào có incident mở hoặc thiếu binding."
                          />
                        ),
                      }}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={10}>
                  <Card size="small" title="Loại Service Task">
                    {CATEGORY_GROUPS.map((group) => {
                      const groupTypes = serviceTasks.types.filter((t) => t.category === group.key)
                      if (groupTypes.length === 0) return null
                      return (
                        <div key={group.key} style={{ marginBottom: 12 }}>
                          <Text
                            type="secondary"
                            strong
                            style={{
                              fontSize: 11,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              display: 'block',
                              marginBottom: 4,
                            }}
                          >
                            {group.label}
                          </Text>
                          {groupTypes.map((type) => {
                            const count = rows.filter((r) => r.typeCode === type.code).length
                            const caps = type.capabilities
                            return (
                              <div
                                key={type.code}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '6px 0',
                                  borderBottom: '1px solid var(--vht-border)',
                                }}
                              >
                                <span style={{ fontSize: 18, opacity: 0.55, flexShrink: 0 }}>
                                  {group.icon}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Text strong style={{ fontSize: 13 }}>{type.name}</Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 11, display: 'block', lineHeight: '1.3' }}
                                  >
                                    {type.description}
                                  </Text>
                                </div>
                                <Space size={2} wrap style={{ flexShrink: 0 }}>
                                  {caps.supportsRetry && (
                                    <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>retry</Tag>
                                  )}
                                  {caps.requiresConnector && (
                                    <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>connector</Tag>
                                  )}
                                  {caps.mutatesDossier && (
                                    <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>mutate</Tag>
                                  )}
                                </Space>
                                <Tag
                                  color={type.enabled ? 'success' : 'default'}
                                  style={{ flexShrink: 0, minWidth: 24, textAlign: 'center' }}
                                >
                                  {count}
                                </Tag>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </Card>
                </Col>
              </Row>
              <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                <Col span={24}>
                  <Card size="small" title="Hoạt động gần đây">
                    {serviceTasks.auditEntries
                      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                      .slice(0, 5)
                      .length === 0 ? (
                      <EmptyState compact title="Chưa có hoạt động nào" />
                    ) : (
                      serviceTasks.auditEntries
                        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                        .slice(0, 5)
                        .map((entry) => (
                          <div
                            key={entry.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '4px 0',
                              borderBottom: '1px solid var(--vht-border)',
                            }}
                          >
                            <Tag color="blue" style={{ fontSize: 11 }}>{entry.action}</Tag>
                            <Text style={{ fontSize: 12, flex: 1 }}>
                              {entry.entityType} · {entry.actor}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {entry.at}
                            </Text>
                          </div>
                        ))
                    )}
                  </Card>
                </Col>
              </Row>


              </>),
          },
          {
            key: 'config',
            label: 'Cấu hình',
            children: (
              <>
                <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Đang hiển thị"
                      value={filteredStats.total}
                      suffix={<Text type="secondary" style={{ fontSize: 12 }}>/ {rows.length}</Text>}
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Active"
                      value={filteredStats.active}
                      color="#1677ff"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Có incident"
                      value={filteredStats.withIncidents}
                      color={filteredStats.withIncidents ? '#cf1322' : undefined}
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <StatCard
                      title="Thiếu binding"
                      value={filteredStats.missingBinding}
                      color={filteredStats.missingBinding ? '#fa8c16' : undefined}
                    />
                  </Col>
                </Row>

                <Card size="small">
                  <Row gutter={[12, 8]} align="middle" style={{ marginBottom: activeFilters.length > 0 ? 8 : 12 }}>
                    <Col flex="auto">
                      <Space wrap size={8}>
                        <Select
                          allowClear
                          placeholder="Loại"
                          style={{ width: 180 }}
                          value={typeFilter}
                          options={serviceTasks.types.map((type) => ({ label: type.name, value: type.code }))}
                          onChange={setTypeFilter}
                        />
                        <Select
                          allowClear
                          placeholder="Trạng thái"
                          style={{ width: 150 }}
                          value={statusFilter}
                          options={Object.entries(SERVICE_TASK_STATUS_META).map(([value, meta]) => ({
                            label: meta.label,
                            value,
                          }))}
                          onChange={setStatusFilter}
                        />
                        <Select
                          allowClear
                          placeholder="Quy trình"
                          style={{ width: 150 }}
                          value={processFilter}
                          options={processOptions}
                          onChange={setProcessFilter}
                        />
                        <Select
                          allowClear
                          placeholder="Connector"
                          style={{ width: 160 }}
                          value={connectorFilter}
                          options={connectorOptions}
                          onChange={setConnectorFilter}
                        />
                        <Select
                          allowClear
                          placeholder="Incident"
                          style={{ width: 140 }}
                          value={incidentFilter}
                          options={[
                            { label: 'Có incident', value: true },
                            { label: 'Không incident', value: false },
                          ]}
                          onChange={setIncidentFilter}
                        />
                      </Space>
                    </Col>
                    <Col flex="none">
                      <Space size={4}>
                        <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                          <FilterOutlined /> {filteredRows.length}/{rows.length} cấu hình
                        </Text>
                        {activeFilters.length > 0 && (
                          <Button
                            size="small"
                            icon={<ClearOutlined />}
                            onClick={() => {
                              setTypeFilter(undefined)
                              setStatusFilter(undefined)
                              setProcessFilter(undefined)
                              setConnectorFilter(undefined)
                              setIncidentFilter(undefined)
                            }}
                          >
                            Xóa bộ lọc
                          </Button>
                        )}
                      </Space>
                    </Col>
                  </Row>

                  {activeFilters.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <Space size={4} wrap>
                        {activeFilters.map((f) => (
                          <Tag
                            key={f.key}
                            closable
                            color="blue"
                            onClose={f.onClear}
                            style={{ margin: 0 }}
                          >
                            {f.label}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}

                  <Table<DefinitionRow>
                    rowKey="id"
                    dataSource={filteredRows}
                    columns={columns}
                    scroll={{ x: 1300 }}
                    pagination={{
                      pageSize: 8,
                      showSizeChanger: true,
                      pageSizeOptions: [8, 15, 30],
                      showTotal: (total: number) => `Tổng ${total} cấu hình`,
                    }}
                    locale={{
                      emptyText: (
                        <EmptyState
                          compact
                          title="Không có cấu hình nào"
                          description={activeFilters.length > 0 ? 'Thử xóa bộ lọc để xem tất cả cấu hình.' : 'Nhấn "Tạo cấu hình" để thêm mới.'}
                        />
                      ),
                    }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'reconcile',
            label: 'Đối soát BPMN',
            children: <ServiceTaskBindingTable />,
          },
          {
            key: 'test',
            label: 'Kiểm thử',
            children: <ServiceTaskTestPanel />,
          },
          {
            key: 'logs',
            label: 'Log thực thi',
            children: (
              <Card size="small">
                <Space wrap style={{ marginBottom: 12 }}>
                  <Select
                    allowClear
                    placeholder="Quy trình"
                    style={{ width: 160 }}
                    value={logProcessFilter}
                    options={processOptions}
                    onChange={setLogProcessFilter}
                  />
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Definition"
                    style={{ width: 280 }}
                    value={logDefinitionFilter}
                    options={definitionOptions}
                    onChange={setLogDefinitionFilter}
                  />
                  <Select
                    allowClear
                    placeholder="Trạng thái"
                    style={{ width: 180 }}
                    value={logStatusFilter}
                    options={Object.entries(SERVICE_TASK_EXECUTION_STATUS_META).map(([value, meta]) => ({
                      label: meta.label,
                      value,
                    }))}
                    onChange={setLogStatusFilter}
                  />
                  <Select
                    allowClear
                    placeholder="Incident"
                    style={{ width: 150 }}
                    value={logIncidentFilter}
                    options={[
                      { label: 'Có incident', value: true },
                      { label: 'Không incident', value: false },
                    ]}
                    onChange={setLogIncidentFilter}
                  />
                </Space>
                <Table
                  rowKey="id"
                  size="small"
                  dataSource={filteredExecutionLogs}
                  pagination={{ pageSize: 6 }}
                  scroll={{ x: 1300 }}
                  columns={[
                    { title: 'Instance key', dataIndex: 'processInstanceKey', width: 170 },
                    { title: 'Process', dataIndex: 'processCode', width: 120 },
                    {
                      title: 'Task key',
                      dataIndex: 'taskDefinitionKey',
                      width: 220,
                      render: (value, row) => (
                        <Space direction="vertical" size={0}>
                          <Text>{value}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{row.taskName}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: 'Definition',
                      dataIndex: 'serviceTaskDefinitionId',
                      width: 260,
                      render: (value) => {
                        const definition = serviceTasks.getDefinition(value)
                        return definition ? (
                          <Space direction="vertical" size={0}>
                            <Text strong>{definition.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{definition.code}</Text>
                          </Space>
                        ) : <Text type="secondary">-</Text>
                      },
                    },
                    { title: 'Version', dataIndex: 'configVersionNo', width: 90, render: (value) => <Tag>v{value}</Tag> },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      width: 130,
                      render: (status: ServiceTaskExecutionStatus) => {
                        const meta = SERVICE_TASK_EXECUTION_STATUS_META[status]
                        return <StatusTag color={meta.color} label={meta.label} />
                      },
                    },
                    { title: 'Attempt', dataIndex: 'attemptNo', width: 90 },
                    { title: 'Duration', dataIndex: 'durationMs', width: 100, render: (value) => value ? `${value} ms` : '-' },
                    { title: 'Error', dataIndex: 'errorCode', width: 170, render: (value, row) => value ? <Text type="danger">{value}: {row.errorMessage}</Text> : '-' },
                    { title: 'Incident id', dataIndex: 'incidentId', width: 170, render: (value) => value ? <Tag color="error">{value}</Tag> : '-' },
                    {
                      title: 'Thao tác',
                      width: 110,
                      fixed: 'right',
                      render: (_, row) => (
                        <Button icon={<EyeOutlined />} onClick={() => setSelectedLogId(row.id)}>
                          Chi tiết
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'audit',
            label: 'Phiên bản & audit',
            children: (
              <Row gutter={[12, 12]}>
                <Col xs={24} lg={10}>
                  <Card
                    size="small"
                    title="Lịch sử phiên bản"
                    extra={
                      <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        placeholder="Lọc definition"
                        style={{ width: 260 }}
                        value={auditDefinitionFilter}
                        options={definitionOptions}
                        onChange={setAuditDefinitionFilter}
                      />
                    }
                  >
                    <Table
                      rowKey="id"
                      size="small"
                      dataSource={versionRows}
                      pagination={{ pageSize: 6 }}
                      columns={[
                        {
                          title: 'Definition',
                          dataIndex: 'serviceTaskDefinitionId',
                          width: 220,
                          render: (value) => {
                            const definition = serviceTasks.getDefinition(value)
                            return definition ? (
                              <Space direction="vertical" size={0}>
                                <Text strong>{definition.code}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>{definition.name}</Text>
                              </Space>
                            ) : '-'
                          },
                        },
                        { title: 'Version', dataIndex: 'versionNo', width: 90, render: (value) => <Tag>v{value}</Tag> },
                        { title: 'Status', dataIndex: 'status', width: 110, render: (value) => <Tag color={value === 'ACTIVE' ? 'green' : value === 'ARCHIVED' ? 'default' : 'blue'}>{value}</Tag> },
                        { title: 'Người tạo', dataIndex: 'createdBy', width: 130 },
                        { title: 'Ghi chú', dataIndex: 'changeNote', width: 260 },
                      ]}
                      scroll={{ x: 820 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={14}>
                  <Card size="small" title="Audit trail">
                    <Table
                      rowKey="id"
                      size="small"
                      dataSource={filteredAuditEntries}
                      pagination={{ pageSize: 8 }}
                      scroll={{ x: 980 }}
                      columns={[
                        { title: 'Thời điểm', dataIndex: 'at', width: 150 },
                        { title: 'Action', dataIndex: 'action', width: 180, render: (value) => <Tag color="blue">{value}</Tag> },
                        { title: 'Entity', dataIndex: 'entityType', width: 190 },
                        { title: 'Actor', dataIndex: 'actor', width: 150 },
                        { title: 'Version', dataIndex: 'configVersionNo', width: 90, render: (value) => value ? <Tag>v{value}</Tag> : '-' },
                        { title: 'Lý do', dataIndex: 'reason', width: 260, render: (value) => value ?? '-' },
                        {
                          title: 'Payload',
                          width: 220,
                          render: (_, row) => (
                            <Space direction="vertical" size={0}>
                              {row.before ? <Text type="secondary">before: {Object.keys(row.before).join(', ')}</Text> : null}
                              {row.after ? <Text type="secondary">after: {Object.keys(row.after).join(', ')}</Text> : null}
                              {!row.before && !row.after ? <Text type="secondary">-</Text> : null}
                            </Space>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },        ]}
      />

      <ServiceTaskFormDrawer
        open={drawerOpen}
        definition={editing}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(undefined)
        }}
      />

      <ServiceTaskExecutionDrawer
        open={Boolean(selectedLog)}
        log={selectedLog}
        definition={selectedLogDefinition}
        version={selectedLogVersion}
        onClose={() => setSelectedLogId(undefined)}
        onRetry={(logId) => {
          serviceTasks.retryExecution(logId, actor)
          message.success('Đã đưa execution log vào trạng thái retry mock.')
        }}
        onManualResolve={(logId, note) => {
          serviceTasks.manualResolveExecution(logId, actor, note)
          message.success('Đã manual resolve execution log mock.')
        }}
      />
    </>
  )
}
