import { Button, Checkbox, Input, Select, Space, Table, Typography } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import type {
  ServiceTaskInputMapping,
  ServiceTaskInputSource,
  ServiceTaskOutputMapping,
  ServiceTaskOutputTarget,
} from '../data/serviceTasks'

const { Text } = Typography

const INPUT_SOURCE_OPTIONS: Array<{ label: string; value: ServiceTaskInputSource }> = [
  { label: 'Biến quy trình', value: 'variables' },
  { label: 'Hồ sơ', value: 'dossier' },
  { label: 'Biểu mẫu', value: 'form' },
  { label: 'Task', value: 'task' },
  { label: 'Người khởi tạo', value: 'initiator' },
  { label: 'Người xử lý', value: 'assignee' },
  { label: 'Đơn vị', value: 'org' },
  { label: 'Hệ thống', value: 'system' },
  { label: 'Output trước', value: 'previousOutput' },
]

const OUTPUT_TARGET_OPTIONS: Array<{ label: string; value: ServiceTaskOutputTarget }> = [
  { label: 'Biến quy trình', value: 'variables' },
  { label: 'Hồ sơ', value: 'dossier' },
  { label: 'Tham chiếu tích hợp', value: 'integrationRef' },
  { label: 'Metadata thực thi', value: 'executionMetadata' },
]

type MappingMode = 'input' | 'output'

type MappingValue<M extends MappingMode> = M extends 'input'
  ? ServiceTaskInputMapping[]
  : ServiceTaskOutputMapping[]

interface ServiceTaskMappingEditorProps<M extends MappingMode> {
  mode: M
  value: MappingValue<M>
  onChange: (next: MappingValue<M>) => void
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function ServiceTaskMappingEditor<M extends MappingMode>({
  mode,
  value,
  onChange,
}: ServiceTaskMappingEditorProps<M>) {
  if (mode === 'input') {
    const rows = value as ServiceTaskInputMapping[]
    const setRows = (next: ServiceTaskInputMapping[]) => onChange(next as MappingValue<M>)
    const update = (id: string, patch: Partial<ServiceTaskInputMapping>) => {
      setRows(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
    }

    return (
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Text type="secondary">
          Chỉ dùng expression dạng {'${variables.xxx}'}, {'${dossier.xxx}'}, {'${initiator.xxx}'}.
        </Text>
        <Table<ServiceTaskInputMapping>
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={rows}
          scroll={{ x: 900 }}
          columns={[
            {
              title: 'Đích',
              dataIndex: 'target',
              width: 160,
              render: (_, row) => (
                <Input value={row.target} placeholder="maHoSo" onChange={(e) => update(row.id, { target: e.target.value })} />
              ),
            },
            {
              title: 'Expression',
              dataIndex: 'expression',
              width: 280,
              render: (_, row) => (
                <Input
                  value={row.expression}
                  placeholder="${dossier.id}"
                  onChange={(e) => update(row.id, { expression: e.target.value })}
                />
              ),
            },
            {
              title: 'Nguồn',
              dataIndex: 'source',
              width: 160,
              render: (_, row) => (
                <Select
                  value={row.source}
                  options={INPUT_SOURCE_OPTIONS}
                  style={{ width: '100%' }}
                  onChange={(source) => update(row.id, { source })}
                />
              ),
            },
            {
              title: 'Bắt buộc',
              dataIndex: 'required',
              width: 100,
              align: 'center',
              render: (_, row) => (
                <Checkbox checked={row.required} onChange={(e) => update(row.id, { required: e.target.checked })} />
              ),
            },
            {
              title: 'Mô tả',
              dataIndex: 'description',
              width: 240,
              render: (_, row) => (
                <Input value={row.description} onChange={(e) => update(row.id, { description: e.target.value })} />
              ),
            },
            {
              title: '',
              width: 56,
              align: 'center',
              render: (_, row) => (
                <Button
                  aria-label="Xóa mapping"
                  icon={<DeleteOutlined />}
                  onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
                />
              ),
            },
          ]}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={() =>
            setRows([
              ...rows,
              {
                id: nextId('in'),
                target: '',
                expression: '',
                source: 'variables',
                required: false,
              },
            ])
          }
        >
          Thêm input
        </Button>
      </Space>
    )
  }

  const rows = value as ServiceTaskOutputMapping[]
  const setRows = (next: ServiceTaskOutputMapping[]) => onChange(next as MappingValue<M>)
  const update = (id: string, patch: Partial<ServiceTaskOutputMapping>) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  return (
    <Space direction="vertical" size={10} style={{ width: '100%' }}>
      <Text type="secondary">Output chỉ ghi về biến quy trình, field hồ sơ whitelist hoặc metadata thực thi.</Text>
      <Table<ServiceTaskOutputMapping>
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={rows}
        scroll={{ x: 900 }}
        columns={[
          {
            title: 'Nguồn response',
            dataIndex: 'sourcePath',
            width: 220,
            render: (_, row) => (
              <Input value={row.sourcePath} placeholder="$.externalId" onChange={(e) => update(row.id, { sourcePath: e.target.value })} />
            ),
          },
          {
            title: 'Đích',
            dataIndex: 'target',
            width: 180,
            render: (_, row) => (
              <Select
                value={row.target}
                options={OUTPUT_TARGET_OPTIONS}
                style={{ width: '100%' }}
                onChange={(target) => update(row.id, { target })}
              />
            ),
          },
          {
            title: 'Path đích',
            dataIndex: 'targetPath',
            width: 220,
            render: (_, row) => (
              <Input value={row.targetPath} placeholder="sapBudgetRequestId" onChange={(e) => update(row.id, { targetPath: e.target.value })} />
            ),
          },
          {
            title: 'Bắt buộc',
            dataIndex: 'required',
            width: 100,
            align: 'center',
            render: (_, row) => (
              <Checkbox checked={row.required} onChange={(e) => update(row.id, { required: e.target.checked })} />
            ),
          },
          {
            title: 'Mô tả',
            dataIndex: 'description',
            width: 240,
            render: (_, row) => (
              <Input value={row.description} onChange={(e) => update(row.id, { description: e.target.value })} />
            ),
          },
          {
            title: '',
            width: 56,
            align: 'center',
            render: (_, row) => (
              <Button
                aria-label="Xóa mapping"
                icon={<DeleteOutlined />}
                onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
              />
            ),
          },
        ]}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={() =>
          setRows([
            ...rows,
            {
              id: nextId('out'),
              sourcePath: '$.',
              target: 'variables',
              targetPath: '',
            },
          ])
        }
      >
        Thêm output
      </Button>
    </Space>
  )
}
