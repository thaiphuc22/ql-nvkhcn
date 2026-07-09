import { useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  DisconnectOutlined,
  LinkOutlined,
  SwapOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  reconcilableServiceTaskProcesses,
  reconcileServiceTasks,
  scaffoldServiceTaskBinding,
  SERVICE_TASK_RECONCILE_STATUS_META,
  summarizeServiceTaskReconcileHealth,
  type ServiceTaskReconcileRow,
} from '../data/serviceTaskReconcile'
import { SERVICE_TASK_STATUS_META, type ServiceTaskDefinition } from '../data/serviceTasks'
import { useAuth } from '../store/AuthContext'
import { useServiceTasks } from '../store/ServiceTaskContext'
import { StatCard, StatusTag } from './ui'

const { Text } = Typography

function processOptionValue(processCode: string, processVersion: string) {
  return `${processCode}::${processVersion}`
}

function rowCanBind(row: ServiceTaskReconcileRow) {
  return row.source === 'bpmn' && row.status !== 'orphan'
}

export default function ServiceTaskBindingTable() {
  const { message } = App.useApp()
  const { user } = useAuth()
  const serviceTasks = useServiceTasks()
  const actor = user?.email ?? 'admin'
  const processes = useMemo(() => reconcilableServiceTaskProcesses(), [])
  const [selectedProcessKey, setSelectedProcessKey] = useState<string | undefined>(
    processes[0] ? processOptionValue(processes[0].processCode, processes[0].processVersion) : undefined,
  )
  const [bindingRow, setBindingRow] = useState<ServiceTaskReconcileRow | undefined>()
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | undefined>()

  const selectedProcess =
    processes.find(
      (process) =>
        processOptionValue(process.processCode, process.processVersion) === selectedProcessKey,
    ) ?? processes[0]

  const rows = useMemo(
    () =>
      selectedProcess
        ? reconcileServiceTasks(
            selectedProcess,
            serviceTasks.bindings,
            serviceTasks.definitions,
            serviceTasks.versions,
          )
        : [],
    [selectedProcess, serviceTasks.bindings, serviceTasks.definitions, serviceTasks.versions],
  )

  const health = useMemo(
    () =>
      summarizeServiceTaskReconcileHealth(
        processes,
        serviceTasks.bindings,
        serviceTasks.definitions,
        serviceTasks.versions,
      ),
    [processes, serviceTasks.bindings, serviceTasks.definitions, serviceTasks.versions],
  )

  const bindableDefinitions = serviceTasks.definitions.filter(
    (definition) => definition.status === 'ACTIVE' || definition.status === 'READY',
  )

  const openBindModal = (row: ServiceTaskReconcileRow) => {
    setBindingRow(row)
    setSelectedDefinitionId(row.definition?.id)
  }

  const closeBindModal = () => {
    setBindingRow(undefined)
    setSelectedDefinitionId(undefined)
  }

  const confirmBind = () => {
    if (!bindingRow || !selectedDefinitionId) return
    const definition = serviceTasks.definitions.find((item) => item.id === selectedDefinitionId)
    serviceTasks.bindTask(scaffoldServiceTaskBinding(bindingRow, selectedDefinitionId, actor))
    closeBindModal()

    if (definition?.status === 'READY') {
      message.warning('Đã gắn cấu hình, nhưng definition chưa active nên trạng thái sẽ là "Chưa sẵn sàng".')
      return
    }
    message.success('Đã gắn cấu hình cho service task BPMN.')
  }

  const unbind = (row: ServiceTaskReconcileRow) => {
    if (!row.binding) return
    serviceTasks.unbindTask(row.binding.id, actor)
    message.success('Đã bỏ gắn cấu hình khỏi service task BPMN.')
  }

  const definitionLabel = (definition?: ServiceTaskDefinition) => {
    if (!definition) return <Text type="secondary">Chưa gắn</Text>
    const meta = SERVICE_TASK_STATUS_META[definition.status]
    return (
      <Space direction="vertical" size={0}>
        <Text strong>{definition.name}</Text>
        <Space size={4} wrap>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {definition.code}
          </Text>
          <StatusTag color={meta.color} label={meta.label} />
        </Space>
      </Space>
    )
  }

  const columns: ColumnsType<ServiceTaskReconcileRow> = [
    {
      title: 'Service task BPMN',
      dataIndex: 'taskName',
      width: 290,
      fixed: 'left',
      render: (value, row) => (
        <Space direction="vertical" size={0}>
          <Space size={6} wrap>
            <Text strong>{value}</Text>
            {row.critical ? <Tag color="red">Critical</Tag> : <Tag>Non-critical</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.taskDefinitionKey}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 160,
      render: (status: ServiceTaskReconcileRow['status'], row) => {
        const meta = SERVICE_TASK_RECONCILE_STATUS_META[status]
        return (
          <Tooltip title={row.reason}>
            <span>
              <StatusTag color={meta.color} label={meta.label} />
            </span>
          </Tooltip>
        )
      },
    },
    {
      title: 'Job type',
      dataIndex: 'jobType',
      width: 230,
      render: (value, row) => (
        <Space direction="vertical" size={0}>
          <Text>{value}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.implementationHint ?? '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Cấu hình đã gắn',
      dataIndex: 'definition',
      width: 300,
      render: (_, row) => definitionLabel(row.definition),
    },
    {
      title: 'Version',
      dataIndex: 'activeVersion',
      width: 120,
      render: (_, row) =>
        row.activeVersion ? (
          <Tag color="green">v{row.activeVersion.versionNo}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Binding',
      dataIndex: 'binding',
      width: 140,
      render: (_, row) =>
        row.binding ? (
          <Space direction="vertical" size={0}>
            <Tag color={row.binding.bindingStatus === 'ACTIVE' ? 'green' : 'orange'}>
              {row.binding.bindingStatus}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.binding.updatedAt}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Thao tác',
      width: 210,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          {rowCanBind(row) ? (
            <Button
              type={row.binding ? 'default' : 'primary'}
              icon={row.binding ? <SwapOutlined /> : <LinkOutlined />}
              onClick={() => openBindModal(row)}
            >
              {row.binding ? 'Đổi cấu hình' : 'Gắn cấu hình'}
            </Button>
          ) : null}
          {row.binding ? (
            <Button danger icon={<DisconnectOutlined />} onClick={() => unbind(row)}>
              Bỏ gắn
            </Button>
          ) : null}
        </Space>
      ),
    },
  ]

  if (!selectedProcess) {
    return <Empty description="Chưa có metadata service task để đối soát." />
  }

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="Đối soát theo metadata service task mock"
        description="Nguồn BPMN hiện tại là PROCESS_SERVICE_TASKS trong data mock; phase sau có thể thay bằng parser BPMN XML thật mà vẫn giữ contract binding processCode + processVersion + taskDefinitionKey."
      />

      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <StatCard title="Quy trình đối soát" value={health.processCount} />
        </Col>
        <Col xs={24} md={6}>
          <StatCard title="Service task BPMN" value={health.taskCount} color="#1677ff" />
        </Col>
        <Col xs={24} md={6}>
          <StatCard title="Thiếu binding" value={health.missingCount} color={health.missingCount ? '#cf1322' : undefined} />
        </Col>
        <Col xs={24} md={6}>
          <StatCard
            title="Chưa sẵn sàng"
            value={health.unfilledCount + health.genericCount + health.orphanCount}
            color={health.unfilledCount + health.genericCount + health.orphanCount ? '#fa8c16' : undefined}
          />
        </Col>
      </Row>

      <Card
        size="small"
        title="Binding service task"
        extra={
          <Select
            value={processOptionValue(selectedProcess.processCode, selectedProcess.processVersion)}
            style={{ width: 360 }}
            options={processes.map((process) => ({
              label: `${process.processCode} v${process.processVersion} - ${process.processName}`,
              value: processOptionValue(process.processCode, process.processVersion),
            }))}
            onChange={setSelectedProcessKey}
          />
        }
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">{selectedProcess.bpmnProcessId}</Tag>
            <Tag>{selectedProcess.status}</Tag>
            <Tag color={selectedProcess.criticalCount ? 'red' : 'default'}>
              {selectedProcess.criticalCount} critical
            </Tag>
          </Space>
          <Table<ServiceTaskReconcileRow>
            rowKey="id"
            size="small"
            dataSource={rows}
            columns={columns}
            scroll={{ x: 1450 }}
            pagination={false}
          />
        </Space>
      </Card>

      <Modal
        title={bindingRow?.binding ? 'Đổi cấu hình service task' : 'Gắn cấu hình service task'}
        open={Boolean(bindingRow)}
        onCancel={closeBindModal}
        onOk={confirmBind}
        okText="Lưu binding"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedDefinitionId }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {bindingRow ? (
            <Alert
              type={bindingRow.critical ? 'warning' : 'info'}
              showIcon
              icon={bindingRow.critical ? <WarningOutlined /> : undefined}
              message={bindingRow.taskName}
              description={`${bindingRow.processCode} v${bindingRow.processVersion} / ${bindingRow.taskDefinitionKey} / ${bindingRow.jobType}`}
            />
          ) : null}
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Chọn cấu hình active hoặc ready"
            value={selectedDefinitionId}
            onChange={setSelectedDefinitionId}
            style={{ width: '100%' }}
            options={bindableDefinitions.map((definition) => ({
              label: `${definition.name} - ${definition.code} (${SERVICE_TASK_STATUS_META[definition.status].label})`,
              value: definition.id,
            }))}
          />
          <Text type="secondary">
            Nếu chọn definition chưa active, hệ thống vẫn lưu binding nhưng reconcile sẽ báo "Chưa sẵn sàng"
            cho tới khi config version được active.
          </Text>
        </Space>
      </Modal>
    </Space>
  )
}
