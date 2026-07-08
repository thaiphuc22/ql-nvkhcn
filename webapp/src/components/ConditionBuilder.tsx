// EPIC06 — Approval Matrix: Condition Builder (Slice D của refactor,
// docs/research/approval-matrix-refactor-plan.md §4.D).
//
// Trình soạn CÂY điều kiện AND/OR động thay cho 4 trường cứng cũ. Đệ quy: mỗi
// nhóm tự quản mảng items (leaf hoặc nhóm con) + toán tử logic. Control giá trị
// render theo `type` của biến (registry) — người nghiệp vụ không chạm cấu trúc.

import {
  Button,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  PlusOutlined,
  BranchesOutlined,
} from '@ant-design/icons'
import {
  OPERATORS,
  describeConditionTree,
  group,
  type ConditionGroup,
  type ConditionLeaf,
  type ConditionNode,
  type ConditionOperator,
} from '../data/approvalConditions'
import {
  APPROVAL_VARIABLES,
  variableDef,
  describeHelpers,
} from '../data/approvalVariableRegistry'

const { Text } = Typography

const OP_META = new Map(OPERATORS.map((o) => [o.op, o]))
const FIELD_OPTIONS = APPROVAL_VARIABLES.map((v) => ({
  value: v.key,
  label: `${v.label}${v.simulated ? '' : ' ·'}`,
}))

/** Leaf mặc định khi thêm điều kiện mới: biến đầu tiên + toán tử đầu tiên của nó. */
function defaultLeaf(): ConditionLeaf {
  const v = APPROVAL_VARIABLES[0]
  return { kind: 'condition', field: v.key, operator: v.operators[0] }
}

function isUnary(op: ConditionOperator): boolean {
  return OP_META.get(op)?.arity === 'unary'
}

// ── Ô nhập giá trị theo kiểu biến ─────────────────────────────────────────────
function ValueControl({
  field,
  operator,
  value,
  valueTo,
  onChange,
}: {
  field: string
  operator: ConditionOperator
  value: unknown
  valueTo: unknown
  onChange: (patch: { value?: unknown; valueTo?: unknown }) => void
}) {
  if (isUnary(operator)) return null
  const def = variableDef(field)
  const type = def?.type ?? 'string'

  // `in` trên enum → chọn nhiều
  if (operator === 'in' && def?.options) {
    return (
      <Select
        mode="multiple"
        style={{ minWidth: 200 }}
        placeholder="Chọn giá trị"
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(v) => onChange({ value: v })}
        options={def.options}
      />
    )
  }
  if (type === 'enum' || type === 'multiEnum') {
    return (
      <Select
        style={{ minWidth: 180 }}
        placeholder="Chọn giá trị"
        value={(value as string) ?? undefined}
        onChange={(v) => onChange({ value: v })}
        options={def?.options ?? []}
      />
    )
  }
  if (type === 'boolean') {
    return (
      <Select
        style={{ width: 110 }}
        value={value === undefined ? undefined : Boolean(value)}
        placeholder="—"
        onChange={(v) => onChange({ value: v })}
        options={[
          { value: true, label: 'Có' },
          { value: false, label: 'Không' },
        ]}
      />
    )
  }
  if (type === 'number') {
    if (operator === 'between') {
      return (
        <Space size={4}>
          <InputNumber
            style={{ width: 150 }}
            placeholder="Từ"
            value={value as number}
            onChange={(v) => onChange({ value: v ?? undefined })}
            formatter={(v) => (v == null ? '' : new Intl.NumberFormat('vi-VN').format(Number(v)))}
            parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
          />
          <Text type="secondary">–</Text>
          <InputNumber
            style={{ width: 150 }}
            placeholder="Đến"
            value={valueTo as number}
            onChange={(v) => onChange({ valueTo: v ?? undefined })}
            formatter={(v) => (v == null ? '' : new Intl.NumberFormat('vi-VN').format(Number(v)))}
            parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
          />
        </Space>
      )
    }
    return (
      <InputNumber
        style={{ width: 180 }}
        placeholder="Giá trị"
        value={value as number}
        onChange={(v) => onChange({ value: v ?? undefined })}
        formatter={(v) => (v == null ? '' : new Intl.NumberFormat('vi-VN').format(Number(v)))}
        parser={(s) => Number((s ?? '').replace(/\D/g, ''))}
      />
    )
  }
  // string / date
  return (
    <Input
      style={{ width: 180 }}
      placeholder="Giá trị"
      value={(value as string) ?? ''}
      onChange={(e) => onChange({ value: e.target.value })}
    />
  )
}

// ── Một dòng điều kiện (leaf) ─────────────────────────────────────────────────
function LeafRow({
  node,
  onChange,
  onRemove,
}: {
  node: ConditionLeaf
  onChange: (next: ConditionLeaf) => void
  onRemove: () => void
}) {
  const def = variableDef(node.field)
  const opOptions = (def?.operators ?? []).map((op) => ({
    value: op,
    label: OP_META.get(op)?.symbol ?? op,
  }))
  return (
    <Space wrap style={{ marginBottom: 8 }}>
      <Select
        style={{ minWidth: 180 }}
        showSearch
        optionFilterProp="label"
        value={node.field}
        onChange={(field) => {
          const nd = variableDef(field)
          // Đổi biến → reset toán tử + giá trị theo biến mới
          onChange({ kind: 'condition', field, operator: nd?.operators[0] ?? 'eq' })
        }}
        options={FIELD_OPTIONS}
      />
      <Select
        style={{ minWidth: 120 }}
        value={node.operator}
        onChange={(operator) =>
          onChange({ ...node, operator, value: undefined, valueTo: undefined })
        }
        options={opOptions}
      />
      <ValueControl
        field={node.field}
        operator={node.operator}
        value={node.value}
        valueTo={node.valueTo}
        onChange={(patch) => onChange({ ...node, ...patch })}
      />
      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
    </Space>
  )
}

// ── Trình soạn một nhóm (đệ quy) ──────────────────────────────────────────────
function GroupEditor({
  value,
  onChange,
  isRoot,
  onRemove,
}: {
  value: ConditionGroup
  onChange: (next: ConditionGroup) => void
  isRoot?: boolean
  onRemove?: () => void
}) {
  const setItem = (i: number, node: ConditionNode) =>
    onChange({ ...value, items: value.items.map((it, idx) => (idx === i ? node : it)) })
  const removeItem = (i: number) =>
    onChange({ ...value, items: value.items.filter((_, idx) => idx !== i) })
  const addLeaf = () => onChange({ ...value, items: [...value.items, defaultLeaf()] })
  const addGroup = () =>
    onChange({ ...value, items: [...value.items, group('AND', [defaultLeaf()])] })

  return (
    <div
      style={{
        border: '1px solid var(--vht-border, #eee)',
        borderRadius: 8,
        padding: 12,
        background: isRoot ? 'transparent' : 'var(--vht-surface-2, #fafafa)',
      }}
    >
      <Space style={{ marginBottom: 8, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Segmented
            size="small"
            value={value.logic}
            onChange={(v) => onChange({ ...value, logic: v as 'AND' | 'OR' })}
            options={[
              { value: 'AND', label: 'TẤT CẢ (VÀ)' },
              { value: 'OR', label: 'MỘT TRONG (HOẶC)' },
            ]}
          />
          {value.items.length === 0 && <Tag>bất kỳ hồ sơ</Tag>}
        </Space>
        {!isRoot && (
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove}>
            Xoá nhóm
          </Button>
        )}
      </Space>

      <div style={{ paddingLeft: 4 }}>
        {value.items.map((it, i) =>
          it.kind === 'condition' ? (
            <LeafRow
              key={i}
              node={it}
              onChange={(n) => setItem(i, n)}
              onRemove={() => removeItem(i)}
            />
          ) : (
            <div key={i} style={{ marginBottom: 8 }}>
              <GroupEditor
                value={it}
                onChange={(n) => setItem(i, n)}
                onRemove={() => removeItem(i)}
              />
            </div>
          ),
        )}
      </div>

      <Space>
        <Button size="small" icon={<PlusOutlined />} onClick={addLeaf}>
          Thêm điều kiện
        </Button>
        <Button size="small" icon={<BranchesOutlined />} onClick={addGroup}>
          Thêm nhóm con
        </Button>
      </Space>
    </div>
  )
}

/**
 * Trình soạn cây điều kiện của một luật. `value` là nhóm gốc; nhóm rỗng = khớp mọi
 * hồ sơ. Hiển thị preview tiếng Việt bên dưới để người nghiệp vụ đọc lại.
 */
export default function ConditionBuilder({
  value,
  onChange,
}: {
  value: ConditionGroup
  onChange: (next: ConditionGroup) => void
}) {
  return (
    <div>
      <GroupEditor value={value} onChange={onChange} isRoot />
      <div style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Diễn giải:{' '}
        </Text>
        <Text style={{ fontSize: 12 }}>{describeConditionTree(value, describeHelpers)}</Text>
      </div>
    </div>
  )
}
