// EPIC06 — Approval Matrix: Assignment Builder (Slice E của refactor,
// docs/research/approval-matrix-refactor-plan.md §4.E / §3.4).
//
// Soạn KẾT QUẢ PHÂN CÔNG của một luật: mode (ANY_ONE/ALL/SEQUENTIAL) + nhiều
// target. Đợt 2: GROUP + USER resolve thật; ORG_POSITION/COUNCIL/EXPRESSION khai báo
// kiểu nhưng để DISABLED ("sắp có") — chờ module tổ chức/hội đồng + backend.

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

const TARGET_TYPE_OPTIONS: { value: ApprovalTargetType; label: string; disabled?: boolean }[] = [
  { value: 'GROUP', label: 'Nhóm phê duyệt' },
  { value: 'USER', label: 'Người cụ thể' },
  { value: 'ORG_POSITION', label: 'Chức danh tổ chức · sắp có', disabled: true },
  { value: 'COUNCIL', label: 'Hội đồng · sắp có', disabled: true },
  { value: 'EXPRESSION', label: 'Biểu thức · sắp có', disabled: true },
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
  onChange,
  onRemove,
}: {
  target: ApprovalTarget
  onChange: (next: ApprovalTarget) => void
  onRemove: () => void
}) {
  return (
    <Space wrap align="start" style={{ marginBottom: 8 }}>
      <Select
        style={{ width: 210 }}
        value={target.type}
        onChange={(type) => onChange(emptyTargetOf(type as ApprovalTargetType))}
        options={TARGET_TYPE_OPTIONS}
      />
      {target.type === 'GROUP' && (
        <Select
          mode="multiple"
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
        <Tag color="default">Placeholder — resolve ở Đợt 2 / backend</Tag>
      )}
      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
    </Space>
  )
}

/**
 * Soạn ApprovalAssignment. `value` là kết quả phân công; mode + danh sách target.
 * Ít nhất một target GROUP/USER nên có (validate ở nơi gọi khi lưu).
 */
export default function AssignmentBuilder({
  value,
  onChange,
}: {
  value: ApprovalAssignment
  onChange: (next: ApprovalAssignment) => void
}) {
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
