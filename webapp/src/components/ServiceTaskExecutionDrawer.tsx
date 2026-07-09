import { useMemo, useState, type CSSProperties } from 'react'
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Modal,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RetweetOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import {
  SERVICE_TASK_EXECUTION_STATUS_META,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskExecutionLog,
} from '../data/serviceTasks'
import { StatusTag } from './ui'

const { Text } = Typography

const MONO_STYLE = {
  fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, Consolas, monospace",
  fontSize: 12,
} satisfies CSSProperties

function pretty(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2)
}

function JsonBlock({ value }: { value?: Record<string, unknown> }) {
  if (!value) return <Empty description="KhÃ´ng cÃ³ dá»¯ liá»‡u." />
  return (
    <pre
      style={{
        ...MONO_STYLE,
        margin: 0,
        padding: 12,
        maxHeight: 260,
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

function formatDuration(durationMs?: number): string {
  if (durationMs === undefined) return '-'
  if (durationMs < 1000) return `${durationMs} ms`
  return `${(durationMs / 1000).toFixed(durationMs >= 10000 ? 0 : 1)} s`
}

interface ServiceTaskExecutionDrawerProps {
  open: boolean
  log?: ServiceTaskExecutionLog
  definition?: ServiceTaskDefinition
  version?: ServiceTaskConfigVersion
  onClose: () => void
  onRetry: (logId: string) => void
  onManualResolve: (logId: string, note: string) => void
}

export default function ServiceTaskExecutionDrawer({
  open,
  log,
  definition,
  version,
  onClose,
  onRetry,
  onManualResolve,
}: ServiceTaskExecutionDrawerProps) {
  const [manualNote, setManualNote] = useState('')
  const statusMeta = log ? SERVICE_TASK_EXECUTION_STATUS_META[log.status] : undefined

  const timelineItems = useMemo(() => {
    if (!log) return []
    const attempts = Array.from({ length: Math.max(log.attemptNo, 1) }, (_, index) => index + 1)
    return attempts.map((attempt) => {
      const isCurrent = attempt === log.attemptNo
      const failed = log.status === 'FAILED' && isCurrent
      const retrying = log.status === 'RETRYING' && isCurrent
      const success = log.status === 'SUCCESS' && isCurrent
      return {
        color: failed ? 'red' : retrying ? 'orange' : success ? 'green' : 'blue',
        dot: failed ? (
          <ExclamationCircleOutlined />
        ) : retrying ? (
          <RetweetOutlined />
        ) : success ? (
          <CheckCircleOutlined />
        ) : (
          <ClockCircleOutlined />
        ),
        children: (
          <Space direction="vertical" size={2}>
            <Text strong>Attempt {attempt}</Text>
            <Text type="secondary">
              {isCurrent
                ? `${log.startedAt}${log.finishedAt ? ` -> ${log.finishedAt}` : ''}`
                : 'Láº§n thá»­ trÆ°á»›c trong cÃ¹ng incident mock'}
            </Text>
            {failed && log.errorMessage ? <Text type="danger">{log.errorMessage}</Text> : null}
          </Space>
        ),
      }
    })
  }, [log])

  const confirmManualResolve = () => {
    if (!log) return
    let note = manualNote
    Modal.confirm({
      title: 'Manual resolve service task?',
      content: (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Text>Ghi chÃº sáº½ Ä‘Æ°á»£c lÆ°u vÃ o execution log mock vÃ  audit in-memory.</Text>
          <Input.TextArea
            rows={4}
            defaultValue={manualNote}
            placeholder="Nháº­p lÃ½ do xá»­ lÃ½ tay"
            onChange={(event) => {
              note = event.target.value
              setManualNote(event.target.value)
            }}
          />
        </Space>
      ),
      okText: 'Manual resolve',
      cancelText: 'Há»§y',
      onOk: () => {
        onManualResolve(log.id, note.trim() || 'ÄÃ£ xá»­ lÃ½ tay bá»Ÿi ngÆ°á»i váº­n hÃ nh.')
        setManualNote('')
      },
    })
  }

  return (
    <Drawer
      title={log ? `Execution log ${log.processInstanceKey}` : 'Execution log'}
      open={open}
      onClose={onClose}
      width={760}
      destroyOnClose
      extra={
        log ? (
          <Space>
            <Button
              icon={<RetweetOutlined />}
              disabled={log.status !== 'FAILED'}
              onClick={() => onRetry(log.id)}
            >
              Retry
            </Button>
            <Button
              icon={<ToolOutlined />}
              disabled={log.status !== 'FAILED' && log.status !== 'RETRYING'}
              onClick={confirmManualResolve}
            >
              Manual resolve
            </Button>
          </Space>
        ) : null
      }
    >
      {!log || !statusMeta ? (
        <Empty description="ChÆ°a chá»n execution log." />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            type={log.status === 'FAILED' ? 'error' : log.status === 'SUCCESS' ? 'success' : 'info'}
            showIcon
            message={
              <Space wrap>
                <Text strong>{log.taskName}</Text>
                <StatusTag color={statusMeta.color} label={statusMeta.label} />
                {log.incidentId ? <Tag color="error">{log.incidentId}</Tag> : null}
              </Space>
            }
            description={`${log.processCode} v${log.processVersion} / ${log.taskDefinitionKey}`}
          />

          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Instance key">{log.processInstanceKey}</Descriptions.Item>
            <Descriptions.Item label="Definition">
              {definition ? (
                <Space wrap>
                  <Text strong>{definition.name}</Text>
                  <Tag>{definition.code}</Tag>
                  <Tag>{definition.typeCode}</Tag>
                </Space>
              ) : (
                <Text type="secondary">KhÃ´ng tÃ¬m tháº¥y definition</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Config version">
              {version ? (
                <Space wrap>
                  <Tag color={version.status === 'ACTIVE' ? 'green' : 'blue'}>v{version.versionNo}</Tag>
                  <Tag>{version.status}</Tag>
                  <Text type="secondary">{version.changeNote}</Text>
                </Space>
              ) : (
                <Tag>v{log.configVersionNo}</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Thá»i gian">
              {log.startedAt} {'->'} {log.finishedAt ?? 'Ä‘ang xá»­ lÃ½'} ({formatDuration(log.durationMs)})
            </Descriptions.Item>
            <Descriptions.Item label="Worker">{log.actor ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Error">
              {log.errorCode ? (
                <Space direction="vertical" size={2}>
                  <Tag color="error">{log.errorCode}</Tag>
                  <Text>{log.errorMessage}</Text>
                </Space>
              ) : (
                <Text type="secondary">KhÃ´ng cÃ³ lá»—i.</Text>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Error policy Ã¡p dá»¥ng">
              {version ? (
                <Space wrap>
                  <Tag>timeout {version.errorPolicy.timeoutMs} ms</Tag>
                  <Tag>retry {version.errorPolicy.maxRetry}</Tag>
                  <Tag>delay {version.errorPolicy.retryDelayMs} ms</Tag>
                  <Tag>{version.errorPolicy.retryBackoff}</Tag>
                  <Tag>{version.errorPolicy.onFailure}</Tag>
                </Space>
              ) : (
                <Text type="secondary">KhÃ´ng cÃ³ snapshot policy trong mock log.</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="LiÃªn káº¿t mock">
              <Space wrap>
                <Tag color="blue">Process {log.processCode}</Tag>
                <Tag color="purple">Job {log.taskDefinitionKey}</Tag>
                {log.incidentId ? <Tag color="red">Incident {log.incidentId}</Tag> : null}
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Text strong>Request summary masked</Text>
            <JsonBlock value={log.requestSummary} />
          </Space>

          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Text strong>Response summary masked</Text>
            <JsonBlock value={log.responseSummary} />
          </Space>

          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Text strong>Timeline attempt</Text>
            <Timeline items={timelineItems} />
          </Space>
        </Space>
      )}
    </Drawer>
  )
}





