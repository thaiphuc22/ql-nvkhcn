import { Button, Segmented, Select, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { ROLES } from '../data/roles'
import { users } from '../data/users'
import {
  MODE_LABEL,
  type ApprovalAssignment,
  type ApprovalMode,
  type ApprovalTarget,
  type ApprovalTargetType,
} from '../data/approvalMatrix'

const { Text } = Typography

export interface AssignmentTargetIssue {
  index: number
  message: string
}

const TARGET_TYPE_OPTIONS: { value: ApprovalTargetType; label: string; disabled?: boolean }[] = [
  { value: 'GROUP', label: 'Nhóm phê duyệt' },
  { value: 'USER', label: 'Người cụ thể' },
  { value: 'ORG_POSITION', label: 'Chức danh tổ chức — sắp có', disabled: true },
  { value: 'COUNCIL', label: 'Hội đồng — sắp có', disabled: true },
  { value: 'EXPRESSION', label: 'Biểu thức — sắp có', disabled: true },
]

const ROLE_OPTIONS = ROLES.map((r) => ({ value: r.code, label: `${r.ten} (${r.code})` }))
const USER_OPTIONS = users.map((u) => ({ value: u.id, label: `${u.hoTen}${u.chucDanh ? ` — ${u.chucDanh}` : ''}` }))

const MODE_HELP: Record<ApprovalMode, string> = {
  ANY_ONE: 'Chỉ cần một người trong danh sách hoàn thành phê duyệt.',
  ALL: 'Tất cả người được phân công đều cần phê duyệt.',
  SEQUENTIAL: 'Phê duyệt lần lượt theo thứ tự các đích phân công.',
}

function emptyTargetOf(type: ApprovalTargetType): ApprovalTarget {
  switch (type) {
    case 'GROUP':
      return { type: 'GROUP', roleCodes: [] }
    case 'USER':
      return { type: 'USER', userIds: [] }
    case 'ORG_POSITION':
      return { type: 'ORG_POSITION', positionCode: '', orgScope: 'DON_VI' }
    case 'COUNCIL':
      return { type: 'COUNCIL', councilType: '' }
    case 'EXPRESSION':
      return { type: 'EXPRESSION', expression: '' }
  }
}

function TargetRow({
  target,
  issue,
  onChange,
  onRemove,
}: {
  target: ApprovalTarget
  issue?: string
  onChange: (next: ApprovalTarget) => void
  onRemove: () => void
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <Space wrap align="start">
        <Select
          style={{ width: 210 }}
          value={target.type}
          onChange={(type) => onChange(emptyTargetOf(type as ApprovalTargetType))}
          options={TARGET_TYPE_OPTIONS}
        />
        {target.type === 'GROUP' && (
          <Select
            mode="multiple"
            status={issue ? 'error' : undefined}
            style={{ minWidth: 260 }}
            placeholder="Chọn nhóm phê duyệt"
            optionFilterProp="label"
            value={target.roleCodes}
            onChange={(roleCodes) => onChange({ type: 'GROUP', roleCodes })}
            options={ROLE_OPTIONS}
          />
        )}
        {target.type === 'USER' && (
          <Select
            mode="multiple"
            status={issue ? 'error' : undefined}
            style={{ minWidth: 260 }}
            placeholder="Chọn người cụ thể"
            optionFilterProp="label"
            value={target.userIds}
            onChange={(userIds) => onChange({ type: 'USER', userIds })}
            options={USER_OPTIONS}
          />
        )}
        {(target.type === 'ORG_POSITION' ||
          target.type === 'COUNCIL' ||
          target.type === 'EXPRESSION') && (
          <Tag color="default">Placeholder — sẽ resolve ở đợt backend</Tag>
        )}
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
      </Space>
      {issue && (
        <div style={{ marginTop: 4, paddingLeft: 214 }}>
          <Text type="danger" style={{ fontSize: 12 }}>{issue}</Text>
        </div>
      )}
    </div>
  )
}

export default function AssignmentBuilder({
  value,
  issues = [],
  onChange,
}: {
  value: ApprovalAssignment
  issues?: AssignmentTargetIssue[]
  onChange: (next: ApprovalAssignment) => void
}) {
  const issueByIndex = new Map(issues.map((it) => [it.index, it.message]))
  const setTarget = (i: number, t: ApprovalTarget) =>
    onChange({ ...value, targets: value.targets.map((it, idx) => (idx === i ? t : it)) })
  const removeTarget = (i: number) =>
    onChange({ ...value, targets: value.targets.filter((_, idx) => idx !== i) })
  const addTarget = () =>
    onChange({ ...value, targets: [...value.targets, { type: 'GROUP', roleCodes: [] }] })

  return (
    <div>
      <Space style={{ marginBottom: 8 }} wrap>
        <Text type="secondary">Chế độ:</Text>
        <Segmented
          size="small"
          value={value.mode}
          onChange={(m) => onChange({ ...value, mode: m as ApprovalMode })}
          options={(Object.keys(MODE_LABEL) as ApprovalMode[]).map((m) => ({
            value: m,
            label: MODE_LABEL[m],
          }))}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>{MODE_HELP[value.mode]}</Text>
      </Space>
      {value.targets.length === 0 && (
        <div style={{ marginBottom: 8 }}>
          <Tag color="warning">Chưa có đích phân công</Tag>
        </div>
      )}
      {value.targets.map((t, i) => (
        <TargetRow
          key={i}
          target={t}
          issue={issueByIndex.get(i)}
          onChange={(n) => setTarget(i, n)}
          onRemove={() => removeTarget(i)}
        />
      ))}
      <Button size="small" icon={<PlusOutlined />} onClick={addTarget}>
        Thêm đích phân công
      </Button>
    </div>
  )
}
