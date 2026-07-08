// Trình soạn "bảng luật" thân thiện (native Rule Builder, EPIC09 Pha 2).
// Người dùng lowtech soạn điều kiện NẾU…THÌ… bằng Select/InputNumber — KHÔNG chạm FEEL.
// Lưu → gridToDmn(...) → DMN XML nguồn chuẩn (execution không đổi). Xem docs EPIC09 §2/§8.
//
// Mức đầy đủ: soạn nhiều bảng (decision) nối chuỗi. Cột NẾU của một bảng có thể lấy
// nguồn từ KẾT QUẢ của bảng khác (hoặc đầu vào dùng chung) — trùng tên biến, gridToDmn
// tự suy requiredDecision, parseDmn tự topo-sort khi eval. Người dùng chỉ thấy nhãn Việt.

import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Divider,
  Empty,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  PartitionOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  TableOutlined,
} from '@ant-design/icons'
import type {
  CellType,
  ConditionOp,
  GridColumn,
  GridCondition,
  GridDecision,
  GridResult,
  GridRule,
  RuleGrid,
} from '../dmn/ruleGrid'

const { Text } = Typography

let uidSeq = 0
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(uidSeq++).toString(36)}`
const newVar = (p: string) => uid(p).replace(/-/g, '_')

/** Toán tử hợp lệ theo kiểu cột (thứ tự hiển thị trong dropdown). */
const OPS_BY_TYPE: Record<CellType, { value: ConditionOp; label: string }[]> = {
  number: [
    { value: 'any', label: 'Bất kỳ' },
    { value: 'eq', label: '= (bằng)' },
    { value: 'gte', label: '≥ (từ)' },
    { value: 'gt', label: '> (lớn hơn)' },
    { value: 'lte', label: '≤ (đến)' },
    { value: 'lt', label: '< (nhỏ hơn)' },
    { value: 'between', label: 'Trong khoảng' },
  ],
  string: [
    { value: 'any', label: 'Bất kỳ' },
    { value: 'is', label: 'Là' },
  ],
  boolean: [
    { value: 'any', label: 'Bất kỳ' },
    { value: 'is', label: 'Là' },
  ],
}

const TYPE_OPTIONS: { value: CellType; label: string }[] = [
  { value: 'number', label: 'Số' },
  { value: 'string', label: 'Chữ' },
  { value: 'boolean', label: 'Đúng/Sai' },
]

/** Nguồn dữ liệu khả dụng cho một cột NẾU (kết quả bảng khác / đầu vào dùng chung). */
interface FieldOption {
  variable: string
  type: CellType
  typeRef: string
  /** Nhãn ngắn để đặt lên đầu cột khi chọn nguồn này. */
  colLabel: string
  /** Nhãn dài hiển thị trong dropdown chọn nguồn. */
  optionLabel: string
  /** Miền giá trị enum suy từ kết quả bảng nguồn (nếu là chữ). */
  options?: { value: string; label: string }[]
}

const NEW_SOURCE = '__new__'

/** Giá trị mặc định của 1 điều kiện khi đổi cột/kiểu. */
const defaultCondition = (): GridCondition => ({ op: 'any', value: null })
const defaultResult = (): GridResult => ({ value: null })

/** Tạo cột mới với kiểu cho trước. */
function newColumn(kind: 'in' | 'out', type: CellType, label: string): GridColumn {
  return { id: uid('col'), label, variable: newVar(kind === 'in' ? 'bien' : 'kq'), type, typeRef: type }
}

/** Bảng quyết định khởi tạo cho luật rỗng / khi thêm bảng mới. */
function starterDecision(name: string): GridDecision {
  const input = newColumn('in', 'number', 'Đầu vào')
  const output = newColumn('out', 'string', 'Kết quả')
  return {
    id: uid('dec'),
    name,
    hitPolicy: 'FIRST',
    requires: [],
    inputs: [input],
    outputs: [output],
    rules: [
      { id: uid('r'), when: [defaultCondition()], then: [defaultResult()] },
    ],
  }
}

/** Tập hợp các "trường" mà cột NẾU của bảng `di` có thể lấy nguồn (loại trừ chính nó). */
function fieldsForDecision(grid: RuleGrid, di: number): FieldOption[] {
  const produced = new Set<string>()
  grid.forEach((d) => d.outputs.forEach((o) => produced.add(o.variable)))

  const seen = new Set<string>()
  const fields: FieldOption[] = []
  grid.forEach((d, idx) => {
    if (idx === di) return
    // Kết quả của bảng khác → nối chuỗi (requiredDecision).
    d.outputs.forEach((o, oi) => {
      if (seen.has(o.variable)) return
      seen.add(o.variable)
      let options: FieldOption['options']
      if (o.type === 'string') {
        const vals = new Set<string>()
        d.rules.forEach((r) => {
          const v = r.then[oi]?.value
          if (v != null && typeof v !== 'boolean') vals.add(String(v))
        })
        if (vals.size) options = [...vals].map((v) => ({ value: v, label: v }))
      }
      fields.push({
        variable: o.variable,
        type: o.type,
        typeRef: o.typeRef,
        colLabel: o.label,
        optionLabel: `${d.name} › ${o.label}`,
        options,
      })
    })
    // Đầu vào dùng chung (biến gốc, không do bảng nào sinh ra).
    d.inputs.forEach((c) => {
      if (produced.has(c.variable) || seen.has(c.variable)) return
      seen.add(c.variable)
      fields.push({
        variable: c.variable,
        type: c.type,
        typeRef: c.typeRef,
        colLabel: c.label,
        optionLabel: `Đầu vào chung: ${c.label}`,
        options: c.options,
      })
    })
  })
  return fields
}

interface Props {
  grid: RuleGrid
  ruleName: string
  /** Nguồn nhận dạng lại draft khi luật đổi (id + version đã lưu). */
  resetKey: string
  onSave: (grid: RuleGrid) => void
}

export default function RuleGridBuilder({ grid, ruleName, resetKey, onSave }: Props) {
  const [draft, setDraft] = useState<RuleGrid>(grid)
  const [dirty, setDirty] = useState(false)
  const [showCols, setShowCols] = useState(false)

  // Nạp lại khi chuyển luật / sau khi lưu (version mới).
  useEffect(() => {
    setDraft(grid)
    setDirty(false)
  }, [resetKey])

  const mutate = (fn: (g: RuleGrid) => RuleGrid) => {
    setDraft((g) => fn(structuredClone(g)))
    setDirty(true)
  }

  // ── thao tác cấp bảng ─────────────────────────────────────────────────────
  const addDecision = () =>
    mutate((g) => [...g, starterDecision(g.length === 0 ? ruleName || 'Quyết định' : `Bảng ${g.length + 1}`)])

  const removeDecision = (di: number) =>
    mutate((g) => {
      g.splice(di, 1)
      return g
    })

  // ── thao tác cấp cột ──────────────────────────────────────────────────────
  const addInput = (di: number) =>
    mutate((g) => {
      const col = newColumn('in', 'number', `Điều kiện ${g[di].inputs.length + 1}`)
      g[di].inputs.push(col)
      g[di].rules.forEach((r) => r.when.push(defaultCondition()))
      return g
    })

  const addOutput = (di: number) =>
    mutate((g) => {
      const col = newColumn('out', 'string', `Kết quả ${g[di].outputs.length + 1}`)
      g[di].outputs.push(col)
      g[di].rules.forEach((r) => r.then.push(defaultResult()))
      return g
    })

  const removeInput = (di: number, ci: number) =>
    mutate((g) => {
      g[di].inputs.splice(ci, 1)
      g[di].rules.forEach((r) => r.when.splice(ci, 1))
      return g
    })

  const removeOutput = (di: number, oi: number) =>
    mutate((g) => {
      g[di].outputs.splice(oi, 1)
      g[di].rules.forEach((r) => r.then.splice(oi, 1))
      return g
    })

  const patchInputCol = (di: number, ci: number, patch: Partial<GridColumn>) =>
    mutate((g) => {
      const col = g[di].inputs[ci]
      Object.assign(col, patch)
      if (patch.type) {
        col.typeRef = patch.type
        // đổi kiểu → reset điều kiện của cột này về 'any' để tránh lệch kiểu
        g[di].rules.forEach((r) => (r.when[ci] = defaultCondition()))
      }
      return g
    })

  const patchOutputCol = (di: number, oi: number, patch: Partial<GridColumn>) =>
    mutate((g) => {
      const col = g[di].outputs[oi]
      Object.assign(col, patch)
      if (patch.type) {
        col.typeRef = patch.type
        g[di].rules.forEach((r) => (r.then[oi] = defaultResult()))
      }
      return g
    })

  /** Gán/huỷ nguồn cho một cột NẾU: field=null → tách thành đầu vào riêng. */
  const bindInputSource = (di: number, ci: number, field: FieldOption | null) =>
    mutate((g) => {
      const col = g[di].inputs[ci]
      if (field) {
        col.variable = field.variable // trùng biến ⇒ gridToDmn nối requiredDecision
        col.label = field.colLabel
        col.type = field.type
        col.typeRef = field.typeRef
        col.options = field.options
      } else {
        col.variable = newVar('bien')
        col.options = undefined
      }
      g[di].rules.forEach((r) => (r.when[ci] = defaultCondition()))
      return g
    })

  // ── thao tác cấp dòng ─────────────────────────────────────────────────────
  const addRule = (di: number) =>
    mutate((g) => {
      g[di].rules.push({
        id: uid('r'),
        when: g[di].inputs.map(defaultCondition),
        then: g[di].outputs.map(defaultResult),
      })
      return g
    })

  const removeRule = (di: number, ri: number) =>
    mutate((g) => {
      g[di].rules.splice(ri, 1)
      return g
    })

  const duplicateRule = (di: number, ri: number) =>
    mutate((g) => {
      const src = g[di].rules[ri]
      g[di].rules.splice(ri + 1, 0, { ...structuredClone(src), id: uid('r') })
      return g
    })

  const patchCondition = (di: number, ri: number, ci: number, patch: Partial<GridCondition>) =>
    mutate((g) => {
      Object.assign(g[di].rules[ri].when[ci], patch)
      return g
    })

  const patchResult = (di: number, ri: number, oi: number, value: GridResult['value']) =>
    mutate((g) => {
      g[di].rules[ri].then[oi] = { value }
      return g
    })

  const patchDecision = (di: number, patch: Partial<GridDecision>) =>
    mutate((g) => {
      Object.assign(g[di], patch)
      return g
    })

  const save = () => onSave(draft)

  const isEmpty = draft.length === 0

  if (isEmpty) {
    return (
      <Empty description="Luật chưa có bảng nào. Tạo bảng quyết định đầu tiên để bắt đầu soạn.">
        <Button type="primary" icon={<PlusOutlined />} onClick={addDecision}>
          Tạo bảng quyết định
        </Button>
      </Empty>
    )
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Space wrap>
        <Button type="primary" icon={<SaveOutlined />} onClick={save} disabled={!dirty}>
          Lưu bảng luật
        </Button>
        <Button
          icon={<SettingOutlined />}
          type={showCols ? 'default' : 'text'}
          onClick={() => setShowCols((s) => !s)}
        >
          {showCols ? 'Ẩn cấu hình cột' : 'Cấu hình cột'}
        </Button>
        {dirty && <Tag color="warning">Có thay đổi chưa lưu</Tag>}
        <Text type="secondary">
          Mỗi dòng: khi TẤT CẢ ô “NẾU” khớp thì áp dụng ô “THÌ”. Chọn “Bất kỳ” = luôn khớp.
        </Text>
      </Space>

      {draft.map((d, di) => (
        <DecisionCard
          key={d.id}
          d={d}
          di={di}
          order={di + 1}
          total={draft.length}
          showCols={showCols}
          fields={fieldsForDecision(draft, di)}
          onPatchDecision={(patch) => patchDecision(di, patch)}
          onRemoveDecision={() => removeDecision(di)}
          onAddInput={() => addInput(di)}
          onAddOutput={() => addOutput(di)}
          onRemoveInput={(ci) => removeInput(di, ci)}
          onRemoveOutput={(oi) => removeOutput(di, oi)}
          onPatchInputCol={(ci, p) => patchInputCol(di, ci, p)}
          onPatchOutputCol={(oi, p) => patchOutputCol(di, oi, p)}
          onBindInput={(ci, f) => bindInputSource(di, ci, f)}
          onAddRule={() => addRule(di)}
          onRemoveRule={(ri) => removeRule(di, ri)}
          onDuplicateRule={(ri) => duplicateRule(di, ri)}
          onPatchCondition={(ri, ci, p) => patchCondition(di, ri, ci, p)}
          onPatchResult={(ri, oi, v) => patchResult(di, ri, oi, v)}
        />
      ))}

      <Button type="dashed" icon={<PlusOutlined />} onClick={addDecision} block>
        Thêm bảng quyết định
      </Button>
      {draft.length > 1 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <PartitionOutlined /> Mẹo: để một bảng dùng kết quả của bảng khác, mở “Cấu hình cột” và
          chọn <b>Nguồn</b> cho cột NẾU = kết quả bảng đó — các bảng sẽ tự nối chuỗi.
        </Text>
      )}
    </Space>
  )
}

// ── Card cho 1 bảng quyết định ───────────────────────────────────────────────

interface DecisionCardProps {
  d: GridDecision
  di: number
  order: number
  total: number
  showCols: boolean
  fields: FieldOption[]
  onPatchDecision: (patch: Partial<GridDecision>) => void
  onRemoveDecision: () => void
  onAddInput: () => void
  onAddOutput: () => void
  onRemoveInput: (ci: number) => void
  onRemoveOutput: (oi: number) => void
  onPatchInputCol: (ci: number, p: Partial<GridColumn>) => void
  onPatchOutputCol: (oi: number, p: Partial<GridColumn>) => void
  onBindInput: (ci: number, field: FieldOption | null) => void
  onAddRule: () => void
  onRemoveRule: (ri: number) => void
  onDuplicateRule: (ri: number) => void
  onPatchCondition: (ri: number, ci: number, p: Partial<GridCondition>) => void
  onPatchResult: (ri: number, oi: number, v: GridResult['value']) => void
}

function DecisionCard(props: DecisionCardProps) {
  const {
    d,
    order,
    total,
    showCols,
    fields,
    onPatchDecision,
    onRemoveDecision,
    onAddInput,
    onAddOutput,
    onRemoveInput,
    onRemoveOutput,
    onPatchInputCol,
    onPatchOutputCol,
    onBindInput,
    onAddRule,
    onRemoveRule,
    onDuplicateRule,
    onPatchCondition,
    onPatchResult,
  } = props

  const columns = [
    { title: '#', width: 44, fixed: 'left' as const, render: (_: unknown, __: GridRule, i: number) => i + 1 },
    ...d.inputs.map((col, ci) => ({
      title: (
        <span>
          <Text type="secondary" style={{ fontSize: 11 }}>
            NẾU
          </Text>
          <br />
          {col.label}
        </span>
      ),
      key: `in_${col.id}`,
      width: 220,
      render: (_: unknown, r: GridRule) => (
        <ConditionCell
          col={col}
          cond={r.when[ci]}
          onChange={(p) => onPatchCondition(indexOf(d.rules, r), ci, p)}
        />
      ),
    })),
    ...d.outputs.map((col, oi) => ({
      title: (
        <span>
          <Text strong style={{ fontSize: 11, color: 'var(--vht-red)' }}>
            THÌ
          </Text>
          <br />
          {col.label}
        </span>
      ),
      key: `out_${col.id}`,
      width: 200,
      render: (_: unknown, r: GridRule) => (
        <ResultCell
          col={col}
          res={r.then[oi]}
          onChange={(v) => onPatchResult(indexOf(d.rules, r), oi, v)}
        />
      ),
    })),
    {
      title: '',
      key: 'ops',
      width: 76,
      fixed: 'right' as const,
      render: (_: unknown, r: GridRule) => {
        const ri = indexOf(d.rules, r)
        return (
          <Space size={2}>
            <Tooltip title="Nhân đôi dòng">
              <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => onDuplicateRule(ri)} />
            </Tooltip>
            <Popconfirm title="Xoá dòng này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemoveRule(ri)}>
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <Card
      size="small"
      title={
        <Space wrap>
          <Tag color="blue">
            Bảng {order}/{total}
          </Tag>
          <TableOutlined />
          <Input
            size="small"
            value={d.name}
            onChange={(e) => onPatchDecision({ name: e.target.value })}
            style={{ width: 220, fontWeight: 600 }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Ưu tiên:
          </Text>
          <Select
            size="small"
            value={d.hitPolicy}
            onChange={(v) => onPatchDecision({ hitPolicy: v })}
            style={{ width: 200 }}
            options={[
              { value: 'FIRST', label: 'Dòng khớp đầu tiên' },
              { value: 'UNIQUE', label: 'Duy nhất 1 dòng khớp' },
              { value: 'COLLECT', label: 'Gộp mọi dòng khớp' },
            ]}
          />
        </Space>
      }
      extra={
        <Popconfirm
          title="Xoá cả bảng này?"
          description="Bảng khác đang lấy kết quả từ đây sẽ mất liên kết."
          okText="Xoá"
          cancelText="Huỷ"
          onConfirm={onRemoveDecision}
        >
          <Button size="small" type="text" danger icon={<DeleteOutlined />}>
            Xoá bảng
          </Button>
        </Popconfirm>
      }
    >
      {showCols && (
        <>
          <ColumnConfig
            title="Cột điều kiện (NẾU)"
            cols={d.inputs}
            onAdd={onAddInput}
            onRemove={onRemoveInput}
            onPatch={onPatchInputCol}
            minCols={1}
            fields={fields}
            onBind={onBindInput}
          />
          <ColumnConfig
            title="Cột kết quả (THÌ)"
            cols={d.outputs}
            onAdd={onAddOutput}
            onRemove={onRemoveOutput}
            onPatch={onPatchOutputCol}
            minCols={1}
          />
          <Divider style={{ margin: '8px 0' }} />
        </>
      )}

      <Table<GridRule>
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={d.rules}
        columns={columns}
        scroll={{ x: 'max-content' }}
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onAddRule}
        style={{ marginTop: 8 }}
        block
      >
        Thêm dòng luật
      </Button>
    </Card>
  )
}

const indexOf = (rules: GridRule[], r: GridRule) => rules.findIndex((x) => x.id === r.id)

// ── Cấu hình cột (nhãn / kiểu / nguồn) ───────────────────────────────────────

function ColumnConfig({
  title,
  cols,
  onAdd,
  onRemove,
  onPatch,
  minCols,
  fields,
  onBind,
}: {
  title: string
  cols: GridColumn[]
  onAdd: () => void
  onRemove: (i: number) => void
  onPatch: (i: number, p: Partial<GridColumn>) => void
  minCols: number
  /** Chỉ truyền cho cột NẾU: danh sách nguồn (kết quả bảng khác / đầu vào chung). */
  fields?: FieldOption[]
  onBind?: (i: number, field: FieldOption | null) => void
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {title}
      </Text>
      <Space wrap style={{ display: 'flex', marginTop: 4 }}>
        {cols.map((col, i) => {
          const bound = fields?.find((f) => f.variable === col.variable)
          return (
            <Space
              key={col.id}
              size={4}
              style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: 4 }}
            >
              <Input
                size="small"
                value={col.label}
                onChange={(e) => onPatch(i, { label: e.target.value })}
                style={{ width: 150 }}
                placeholder="Tên cột"
              />
              {fields && onBind && (fields.length > 0 || bound) && (
                <Tooltip title="Nguồn dữ liệu của cột">
                  <Select
                    size="small"
                    value={bound ? bound.variable : NEW_SOURCE}
                    onChange={(v) =>
                      onBind(i, v === NEW_SOURCE ? null : fields.find((f) => f.variable === v) ?? null)
                    }
                    style={{ width: 200 }}
                    options={[
                      { value: NEW_SOURCE, label: 'Đầu vào riêng (nhập tay)' },
                      ...fields.map((f) => ({ value: f.variable, label: f.optionLabel })),
                    ]}
                  />
                </Tooltip>
              )}
              <Tooltip title={bound ? 'Kiểu do nguồn quy định' : 'Kiểu dữ liệu'}>
                <Select
                  size="small"
                  value={col.type}
                  onChange={(v) => onPatch(i, { type: v })}
                  options={TYPE_OPTIONS}
                  style={{ width: 96 }}
                  disabled={!!bound}
                />
              </Tooltip>
              <Tooltip title={cols.length <= minCols ? 'Cần ít nhất 1 cột' : 'Xoá cột'}>
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={cols.length <= minCols}
                  onClick={() => onRemove(i)}
                />
              </Tooltip>
            </Space>
          )
        })}
        <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={onAdd}>
          Thêm cột
        </Button>
      </Space>
    </div>
  )
}

// ── Ô điều kiện (NẾU) ────────────────────────────────────────────────────────

function ConditionCell({
  col,
  cond,
  onChange,
}: {
  col: GridColumn
  cond: GridCondition
  onChange: (p: Partial<GridCondition>) => void
}) {
  const ops = OPS_BY_TYPE[col.type]
  return (
    <Space size={4} wrap>
      <Select
        size="small"
        value={cond.op}
        onChange={(op) => onChange({ op, value: op === 'any' ? null : cond.value ?? null })}
        options={ops}
        style={{ width: col.type === 'number' ? 108 : 92 }}
      />
      {cond.op !== 'any' && <ValueInput col={col} value={cond.value} onChange={(v) => onChange({ value: v })} />}
      {cond.op === 'between' && (
        <>
          <Text type="secondary">→</Text>
          <InputNumber
            size="small"
            value={cond.value2 ?? undefined}
            onChange={(v) => onChange({ value2: v })}
            style={{ width: 120 }}
            formatter={(v) => (v == null ? '' : NUM.format(Number(v)))}
            parser={(s) => Number((s ?? '').replace(/\D/g, '')) as unknown as number}
          />
        </>
      )}
    </Space>
  )
}

// ── Ô kết quả (THÌ) ──────────────────────────────────────────────────────────

function ResultCell({
  col,
  res,
  onChange,
}: {
  col: GridColumn
  res: GridResult
  onChange: (v: GridResult['value']) => void
}) {
  return <ValueInput col={col} value={res.value} onChange={onChange} placeholder="Kết quả" />
}

// ── Ô nhập giá trị theo kiểu cột (dùng chung cho điều kiện & kết quả) ──────────

const NUM = new Intl.NumberFormat('vi-VN')

function ValueInput({
  col,
  value,
  onChange,
  placeholder,
}: {
  col: GridColumn
  value: GridCondition['value']
  onChange: (v: GridResult['value']) => void
  placeholder?: string
}) {
  if (col.type === 'number') {
    return (
      <InputNumber
        size="small"
        value={value == null ? undefined : Number(value)}
        onChange={(v) => onChange(v)}
        style={{ width: 130 }}
        placeholder={placeholder}
        formatter={(v) => (v == null ? '' : NUM.format(Number(v)))}
        parser={(s) => Number((s ?? '').replace(/\D/g, '')) as unknown as number}
      />
    )
  }
  if (col.type === 'boolean') {
    return (
      <Select
        size="small"
        value={value == null ? undefined : Boolean(value)}
        onChange={(v) => onChange(v)}
        style={{ width: 96 }}
        placeholder={placeholder}
        options={[
          { value: true, label: 'Có' },
          { value: false, label: 'Không' },
        ]}
      />
    )
  }
  // string: dropdown nếu có enum, ngược lại nhập tự do
  if (col.options?.length) {
    return (
      <Select
        size="small"
        value={value == null ? undefined : String(value)}
        onChange={(v) => onChange(v)}
        style={{ width: 150 }}
        placeholder={placeholder}
        options={col.options}
      />
    )
  }
  return (
    <Input
      size="small"
      value={value == null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 150 }}
      placeholder={placeholder}
    />
  )
}
