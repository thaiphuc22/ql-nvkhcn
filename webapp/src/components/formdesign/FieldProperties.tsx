// Panel thuộc tính AntD tự viết cho Form Designer (D13 — Lát B). Thay properties
// panel native của @bpmn-io/form-js bằng UI AntD, ghi ngược qua service `modeling`:
//   onEdit(field, prop, value)  → modeling.editFormField(field, prop, value)
//   onRemove(field)             → modeling.removeFormField(...)
// Thuộc tính lồng (validate.*, conditional.hide) GHI CẢ OBJECT CON (đúng cách panel
// native làm). Ô chữ commit khi blur (mỗi field 1 lần undo, không mất focus); công
// tắc/số commit ngay. Component được cha remount theo `key = id#version` nên tự nạp
// lại giá trị sau mỗi thay đổi/undo. FEEL nhập bằng textarea monospace (không popup
// autocomplete như native — đánh đổi đã ghi ở D13 §4).
import { useState, type ReactNode } from 'react'
import {
  Input,
  InputNumber,
  Switch,
  Button,
  Tag,
  Typography,
  Empty,
  Popconfirm,
  Divider,
  Space,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

export interface FField {
  id: string
  type: string
  key?: string
  label?: string
  description?: string
  text?: string
  expression?: string
  validate?: Record<string, unknown>
  conditional?: { hide?: string }
  values?: { value: string; label: string }[]
  showOutline?: boolean
  components?: unknown[]
  _parent?: string
}

type EditFn = (field: FField, prop: string, value: unknown) => void

const TYPE_LABELS: Record<string, string> = {
  default: 'Biểu mẫu',
  textfield: 'Ô chữ',
  textarea: 'Ô nhiều dòng',
  number: 'Số',
  datetime: 'Ngày / giờ',
  expression: 'Biểu thức',
  filepicker: 'Tải tệp',
  checkbox: 'Hộp kiểm',
  checklist: 'Danh sách kiểm',
  radio: 'Radio',
  select: 'Thả xuống',
  taglist: 'Nhãn nhiều chọn',
  text: 'Văn bản tĩnh',
  html: 'HTML',
  image: 'Hình ảnh',
  table: 'Bảng dữ liệu',
  separator: 'Đường kẻ',
  spacer: 'Khoảng trống',
  group: 'Nhóm',
  dynamiclist: 'Bảng động',
  button: 'Nút',
}

const KEYED = new Set([
  'textfield', 'textarea', 'number', 'datetime', 'expression', 'filepicker',
  'checkbox', 'checklist', 'radio', 'select', 'taglist', 'dynamiclist',
])
const REQUIREABLE = new Set([
  'textfield', 'textarea', 'number', 'datetime', 'filepicker',
  'checkbox', 'checklist', 'radio', 'select', 'taglist', 'dynamiclist',
])
const OPTIONED = new Set(['select', 'radio', 'checklist', 'taglist'])
const TEXTLEN = new Set(['textfield', 'textarea'])

const MONO: React.CSSProperties = { fontFamily: "'Fira Code', ui-monospace, 'SFMono-Regular', monospace" }

function emptyToUndef(v: string): string | undefined {
  return v.trim() === '' ? undefined : v
}
function numOr(v: unknown): number | null {
  return typeof v === 'number' ? v : v == null ? null : Number(v)
}
/** Ghi 1 khóa vào object con `validate`, xóa khóa khi value undefined; validate rỗng → undefined. */
function setValidate(field: FField, onEdit: EditFn, key: string, value: unknown) {
  const next: Record<string, unknown> = { ...(field.validate || {}) }
  if (value === undefined) delete next[key]
  else next[key] = value
  onEdit(field, 'validate', Object.keys(next).length ? next : undefined)
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text
        style={{
          display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: 0.4, color: 'var(--vht-ink-3)', marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {children}
    </div>
  )
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <Text style={{ display: 'block', fontSize: 13, color: 'var(--vht-ink-2)', marginBottom: 4 }}>{label}</Text>
      {children}
    </div>
  )
}

/** Ô chữ: commit khi blur (hoặc Enter với input 1 dòng) để mỗi lần sửa = 1 undo. */
function TextCommit({
  value, onCommit, textarea, mono, rows, placeholder,
}: {
  value?: string
  onCommit: (v: string) => void
  textarea?: boolean
  mono?: boolean
  rows?: number
  placeholder?: string
}) {
  const [v, setV] = useState(value ?? '')
  const commit = () => {
    if ((value ?? '') !== v) onCommit(v)
  }
  const style = mono ? MONO : undefined
  if (textarea) {
    return (
      <Input.TextArea
        value={v} rows={rows ?? 3} placeholder={placeholder} style={style}
        onChange={(e) => setV(e.target.value)} onBlur={commit}
      />
    )
  }
  return (
    <Input
      value={v} placeholder={placeholder} style={style}
      onChange={(e) => setV(e.target.value)} onBlur={commit} onPressEnter={commit}
    />
  )
}

/** Ô số: commit khi blur. */
function NumCommit({
  value, onCommit, min, max,
}: {
  value: number | null
  onCommit: (v: number | null) => void
  min?: number
  max?: number
}) {
  const [v, setV] = useState<number | null>(value)
  return (
    <InputNumber
      style={{ width: '100%' }} min={min} max={max} value={v}
      onChange={(val) => setV((val as number | null) ?? null)}
      onBlur={() => {
        if ((value ?? null) !== (v ?? null)) onCommit(v)
      }}
    />
  )
}

/** Trình sửa danh sách tùy chọn {value,label} cho select/radio/checklist/taglist. */
function OptionsEditor({ field, onEdit }: { field: FField; onEdit: EditFn }) {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>(() =>
    Array.isArray(field.values) ? field.values.map((o) => ({ ...o })) : [],
  )
  const commit = (next: { value: string; label: string }[]) => {
    setOpts(next)
    onEdit(field, 'values', next)
  }
  const setCell = (i: number, k: 'value' | 'label', val: string) => {
    if (opts[i][k] === val) return
    commit(opts.map((o, idx) => (idx === i ? { ...o, [k]: val } : o)))
  }
  const add = () => commit([...opts, { value: `value${opts.length + 1}`, label: `Tùy chọn ${opts.length + 1}` }])
  const remove = (i: number) => commit(opts.filter((_, idx) => idx !== i))

  return (
    <div>
      {opts.map((o, i) => (
        <Space.Compact key={i} block style={{ marginBottom: 6 }}>
          <Input
            style={{ width: '42%' }} placeholder="giá trị" defaultValue={o.value}
            onBlur={(e) => setCell(i, 'value', e.target.value)}
          />
          <Input
            style={{ width: '58%' }} placeholder="nhãn hiển thị" defaultValue={o.label}
            onBlur={(e) => setCell(i, 'label', e.target.value)}
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => remove(i)} />
        </Space.Compact>
      ))}
      <Button type="dashed" block icon={<PlusOutlined />} onClick={add}>
        Thêm tùy chọn
      </Button>
    </div>
  )
}

interface Props {
  field: FField | null
  onEdit: EditFn
  onRemove: (field: FField) => void
}

/** Panel thuộc tính — dock phải của Form Designer. */
export default function FieldProperties({ field, onEdit, onRemove }: Props) {
  if (!field) {
    return (
      <div style={{ padding: 16 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chọn một thành phần để chỉnh sửa"
          style={{ marginTop: 32 }}
        />
      </div>
    )
  }

  const t = field.type
  const isRoot = t === 'default'

  return (
    <div style={{ padding: '12px 14px', height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Tag color="red" style={{ marginInlineEnd: 0 }}>{TYPE_LABELS[t] ?? t}</Tag>
        <Text type="secondary" style={{ fontSize: 12 }} copyable={{ text: field.id }}>
          id: {field.id}
        </Text>
      </div>

      {isRoot ? (
        <Text type="secondary">
          Đây là biểu mẫu gốc. Chọn một thành phần bên trong để chỉnh thuộc tính.
        </Text>
      ) : (
        <>
          {KEYED.has(t) && (
            <Section title="Chung">
              <Field label="Khóa dữ liệu (key)">
                <TextCommit value={field.key} onCommit={(v) => onEdit(field, 'key', v)} />
              </Field>
              <Field label="Nhãn hiển thị">
                <TextCommit value={field.label} onCommit={(v) => onEdit(field, 'label', emptyToUndef(v))} />
              </Field>
              <Field label="Mô tả">
                <TextCommit value={field.description} onCommit={(v) => onEdit(field, 'description', emptyToUndef(v))} />
              </Field>
            </Section>
          )}

          {t === 'group' && (
            <Section title="Bố cục nhóm">
              <Field label="Nhãn nhóm">
                <TextCommit value={field.label} onCommit={(v) => onEdit(field, 'label', emptyToUndef(v))} />
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch
                  checked={!!field.showOutline}
                  onChange={(c) => onEdit(field, 'showOutline', c || undefined)}
                />
                <Text>Hiển thị khung viền</Text>
              </div>
            </Section>
          )}

          {(t === 'text' || t === 'html') && (
            <Section title="Nội dung">
              <Field label={t === 'text' ? 'Văn bản (Markdown)' : 'Mã HTML'}>
                <TextCommit
                  textarea rows={5} mono={t === 'html'} value={field.text}
                  onCommit={(v) => onEdit(field, 'text', v)}
                />
              </Field>
            </Section>
          )}

          {t === 'expression' && (
            <Section title="Biểu thức tự tính (FEEL)">
              <Field label="Bắt đầu bằng =, ví dụ =soThang * heSo">
                <TextCommit textarea mono rows={3} value={field.expression} onCommit={(v) => onEdit(field, 'expression', v)} />
              </Field>
            </Section>
          )}

          {REQUIREABLE.has(t) && (
            <Section title="Kiểm tra hợp lệ">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Switch
                  checked={!!field.validate?.required}
                  onChange={(c) => setValidate(field, onEdit, 'required', c || undefined)}
                />
                <Text>Bắt buộc nhập</Text>
              </div>
              {t === 'number' && (
                <>
                  <Field label="Giá trị nhỏ nhất">
                    <NumCommit value={numOr(field.validate?.min)} onCommit={(v) => setValidate(field, onEdit, 'min', v ?? undefined)} />
                  </Field>
                  <Field label="Giá trị lớn nhất">
                    <NumCommit value={numOr(field.validate?.max)} onCommit={(v) => setValidate(field, onEdit, 'max', v ?? undefined)} />
                  </Field>
                </>
              )}
              {TEXTLEN.has(t) && (
                <>
                  <Field label="Độ dài tối thiểu">
                    <NumCommit min={0} value={numOr(field.validate?.minLength)} onCommit={(v) => setValidate(field, onEdit, 'minLength', v ?? undefined)} />
                  </Field>
                  <Field label="Độ dài tối đa">
                    <NumCommit min={0} value={numOr(field.validate?.maxLength)} onCommit={(v) => setValidate(field, onEdit, 'maxLength', v ?? undefined)} />
                  </Field>
                </>
              )}
            </Section>
          )}

          {OPTIONED.has(t) && (
            <Section title="Tùy chọn">
              <OptionsEditor field={field} onEdit={onEdit} />
            </Section>
          )}

          <Section title="Ẩn / hiện có điều kiện (FEEL)">
            <Field label='Ẩn khi biểu thức đúng, ví dụ =vaiTro != "chu_nhiem"'>
              <TextCommit
                textarea mono rows={2} value={field.conditional?.hide}
                onCommit={(v) =>
                  onEdit(
                    field,
                    'conditional',
                    v && v.trim() ? { ...(field.conditional || {}), hide: v } : undefined,
                  )
                }
              />
            </Field>
          </Section>

          <Divider style={{ margin: '8px 0 12px' }} />
          <Popconfirm
            title="Xóa thành phần này?"
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
            onConfirm={() => onRemove(field)}
          >
            <Button danger block icon={<DeleteOutlined />}>Xóa thành phần</Button>
          </Popconfirm>
        </>
      )}
    </div>
  )
}
