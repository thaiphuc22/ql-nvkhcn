import { useMemo, useState, type CSSProperties } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  sampleServiceTaskContext,
  seedProcessServiceTasks,
  SERVICE_TASK_STATUS_META,
  type ProcessServiceTaskRef,
  type ServiceTaskConfigVersion,
  type ServiceTaskPreviewResult,
  type ServiceTaskSampleContext,
} from '../data/serviceTasks'
import { useAuth } from '../store/AuthContext'
import { useServiceTasks } from '../store/ServiceTaskContext'
import { StatusTag } from './ui'

const { Text } = Typography

const MONO_STYLE = {
  fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, Consolas, monospace",
  fontSize: 12,
} satisfies CSSProperties

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

function parseJsonObject(label: string, raw: string): Record<string, unknown> {
  const value = JSON.parse(raw) as unknown
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`${label} phải là JSON object.`)
  }
  return value as Record<string, unknown>
}

function processKey(task: ProcessServiceTaskRef): string {
  return `${task.processCode}::${task.processVersion}::${task.taskDefinitionKey}`
}

function latestVersion(versions: ServiceTaskConfigVersion[]): ServiceTaskConfigVersion | undefined {
  return [...versions].sort((a, b) => b.versionNo - a.versionNo)[0]
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        ...MONO_STYLE,
        margin: 0,
        padding: 12,
        minHeight: 220,
        maxHeight: 420,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        background: '#f6f8fa',
        border: '1px solid var(--vht-border)',
        borderRadius: 6,
      }}
    >
      {pretty(value)}
    </pre>
  )
}

function ValidationView({
  result,
  jsonError,
}: {
  result: ServiceTaskPreviewResult | null
  jsonError?: string
}) {
  if (jsonError) {
    return <Alert type="error" showIcon message="Sample JSON chưa hợp lệ" description={jsonError} />
  }

  if (!result) {
    return <Empty description="Chưa chạy preview." />
  }

  return (
    <Space direction="vertical" size={10} style={{ width: '100%' }}>
      <Alert
        type={result.valid ? 'success' : 'error'}
        showIcon
        icon={result.valid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        message={result.valid ? 'Preview hợp lệ' : 'Preview có lỗi validation'}
        description={
          result.valid
            ? 'Input mapping, payload giả lập và output mapping đều sẵn sàng để kiểm tra.'
            : 'Cấu hình chưa được phép xem như hợp lệ; kiểm tra danh sách lỗi bên dưới.'
        }
      />
      {result.errors.length ? (
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text strong>Lỗi</Text>
          {result.errors.map((error) => (
            <Alert key={error} type="error" showIcon message={error} />
          ))}
        </Space>
      ) : null}
      {result.warnings.length ? (
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text strong>Cảnh báo</Text>
          {result.warnings.map((warning) => (
            <Alert key={warning} type="warning" showIcon message={warning} />
          ))}
        </Space>
      ) : null}
    </Space>
  )
}

export default function ServiceTaskTestPanel() {
  const { user } = useAuth()
  const serviceTasks = useServiceTasks()
  const [definitionId, setDefinitionId] = useState<string | undefined>(
    serviceTasks.definitions.find((definition) => definition.status === 'ACTIVE')?.id ??
      serviceTasks.definitions[0]?.id,
  )
  const [versionNo, setVersionNo] = useState<number | undefined>()
  const [selectedProcessKey, setSelectedProcessKey] = useState<string | undefined>(
    seedProcessServiceTasks[0] ? processKey(seedProcessServiceTasks[0]) : undefined,
  )
  const [variablesJson, setVariablesJson] = useState(pretty(sampleServiceTaskContext.variables))
  const [dossierJson, setDossierJson] = useState(pretty(sampleServiceTaskContext.dossier))
  const [userContextJson, setUserContextJson] = useState(
    pretty({
      initiator: sampleServiceTaskContext.initiator,
      assignee: sampleServiceTaskContext.assignee,
      org: sampleServiceTaskContext.org,
      system: sampleServiceTaskContext.system,
      form: sampleServiceTaskContext.form,
      previousOutput: sampleServiceTaskContext.previousOutput,
    }),
  )
  const [result, setResult] = useState<ServiceTaskPreviewResult | null>(null)
  const [jsonError, setJsonError] = useState<string>()

  const actor = user?.email ?? 'admin'
  const selectedDefinition =
    serviceTasks.definitions.find((definition) => definition.id === definitionId) ??
    serviceTasks.definitions[0]
  const versions = selectedDefinition ? serviceTasks.getVersions(selectedDefinition.id) : []
  const selectedVersionNo =
    versionNo ??
    selectedDefinition?.activeVersionNo ??
    latestVersion(versions)?.versionNo
  const selectedVersion = selectedVersionNo
    ? serviceTasks.getVersion(selectedDefinition.id, selectedVersionNo)
    : undefined
  const selectedProcess = seedProcessServiceTasks.find((task) => processKey(task) === selectedProcessKey)

  const versionOptions = versions.map((version) => ({
    label: `v${version.versionNo} - ${version.status}`,
    value: version.versionNo,
  }))

  const definitionOptions = useMemo(
    () =>
      serviceTasks.definitions.map((definition) => ({
        label: `${definition.name} - ${definition.code}`,
        value: definition.id,
      })),
    [serviceTasks.definitions],
  )

  const resetSamples = () => {
    setVariablesJson(pretty(sampleServiceTaskContext.variables))
    setDossierJson(pretty(sampleServiceTaskContext.dossier))
    setUserContextJson(
      pretty({
        initiator: sampleServiceTaskContext.initiator,
        assignee: sampleServiceTaskContext.assignee,
        org: sampleServiceTaskContext.org,
        system: sampleServiceTaskContext.system,
        form: sampleServiceTaskContext.form,
        previousOutput: sampleServiceTaskContext.previousOutput,
      }),
    )
    setResult(null)
    setJsonError(undefined)
  }

  const buildContext = (): ServiceTaskSampleContext => {
    const variables = parseJsonObject('Variables sample', variablesJson)
    const dossier = parseJsonObject('Dossier sample', dossierJson)
    const userContext = parseJsonObject('User/org context sample', userContextJson)
    const task = selectedProcess
      ? {
          key: selectedProcess.taskDefinitionKey,
          name: selectedProcess.taskName,
          processCode: selectedProcess.processCode,
          processVersion: selectedProcess.processVersion,
          jobType: selectedProcess.jobType,
        }
      : sampleServiceTaskContext.task

    return {
      variables,
      dossier,
      form: (userContext.form as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.form,
      task,
      initiator:
        (userContext.initiator as Record<string, unknown> | undefined) ??
        sampleServiceTaskContext.initiator,
      assignee:
        (userContext.assignee as Record<string, unknown> | undefined) ??
        sampleServiceTaskContext.assignee,
      org: (userContext.org as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.org,
      system:
        (userContext.system as Record<string, unknown> | undefined) ??
        sampleServiceTaskContext.system,
      previousOutput:
        (userContext.previousOutput as Record<string, unknown> | undefined) ??
        sampleServiceTaskContext.previousOutput,
    }
  }

  const runPreview = () => {
    if (!selectedDefinition || !selectedVersionNo) return
    try {
      const context = buildContext()
      const preview = serviceTasks.runPreview(
        selectedDefinition.id,
        selectedVersionNo,
        context,
        actor,
      )
      setResult(preview)
      setJsonError(undefined)
    } catch (error) {
      setResult(null)
      setJsonError(error instanceof Error ? error.message : 'Không đọc được sample JSON.')
    }
  }

  if (!selectedDefinition) {
    return <Empty description="Chưa có cấu hình service task để kiểm thử." />
  }

  const definitionStatusMeta = SERVICE_TASK_STATUS_META[selectedDefinition.status]

  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} xl={8}>
        <Card
          size="small"
          title="Mẫu kiểm thử"
          extra={
            <Button icon={<ReloadOutlined />} onClick={resetSamples}>
              Reset
            </Button>
          }
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Select
              showSearch
              optionFilterProp="label"
              value={selectedDefinition.id}
              options={definitionOptions}
              style={{ width: '100%' }}
              onChange={(nextDefinitionId) => {
                setDefinitionId(nextDefinitionId)
                setVersionNo(undefined)
                setResult(null)
              }}
            />
            <Select
              value={selectedVersionNo}
              options={versionOptions}
              style={{ width: '100%' }}
              onChange={(nextVersionNo) => {
                setVersionNo(nextVersionNo)
                setResult(null)
              }}
            />
            <Select
              value={selectedProcessKey}
              options={seedProcessServiceTasks.map((task) => ({
                label: `${task.processCode} v${task.processVersion} - ${task.taskName}`,
                value: processKey(task),
              }))}
              style={{ width: '100%' }}
              onChange={(nextProcessKey) => {
                setSelectedProcessKey(nextProcessKey)
                setResult(null)
              }}
            />

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Definition">
                <Space wrap>
                  <Text strong>{selectedDefinition.code}</Text>
                  <StatusTag color={definitionStatusMeta.color} label={definitionStatusMeta.label} />
                  <Tag>{selectedDefinition.typeCode}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Version">
                {selectedVersion ? (
                  <Space wrap>
                    <Tag color={selectedVersion.status === 'ACTIVE' ? 'green' : 'blue'}>
                      v{selectedVersion.versionNo}
                    </Tag>
                    <Tag>{selectedVersion.status}</Tag>
                  </Space>
                ) : (
                  <Text type="secondary">Chưa có version</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '4px 0' }} />
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text strong>Variables JSON</Text>
              <Input.TextArea
                value={variablesJson}
                rows={8}
                style={MONO_STYLE}
                spellCheck={false}
                onChange={(event) => setVariablesJson(event.target.value)}
              />
            </Space>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text strong>Dossier JSON</Text>
              <Input.TextArea
                value={dossierJson}
                rows={8}
                style={MONO_STYLE}
                spellCheck={false}
                onChange={(event) => setDossierJson(event.target.value)}
              />
            </Space>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text strong>User/org context JSON</Text>
              <Input.TextArea
                value={userContextJson}
                rows={10}
                style={MONO_STYLE}
                spellCheck={false}
                onChange={(event) => setUserContextJson(event.target.value)}
              />
            </Space>
            <Button
              type="primary"
              block
              icon={<PlayCircleOutlined />}
              disabled={!selectedVersion}
              onClick={runPreview}
            >
              Chạy preview
            </Button>
          </Space>
        </Card>
      </Col>

      <Col xs={24} xl={16}>
        <Card size="small" title="Kết quả preview">
          <Tabs
            size="small"
            items={[
              {
                key: 'input',
                label: 'Input sau mapping',
                children: result ? <JsonBlock value={result.resolvedInput} /> : <Empty />,
              },
              {
                key: 'payload',
                label: 'Payload',
                children: result ? <JsonBlock value={result.payload} /> : <Empty />,
              },
              {
                key: 'response',
                label: 'Response giả lập',
                children: result ? <JsonBlock value={result.simulatedResponse} /> : <Empty />,
              },
              {
                key: 'output',
                label: 'Output mapping',
                children: result ? <JsonBlock value={result.mappedOutput} /> : <Empty />,
              },
              {
                key: 'validation',
                label: 'Validation',
                children: <ValidationView result={result} jsonError={jsonError} />,
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  )
}
