import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  Radio,
  Select,
  TimePicker,
  Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { evaluate } from 'feelin'

const { Title, Paragraph, Text } = Typography

export interface FormSubmitResult {
  data: Record<string, unknown>
  errors: Record<string, unknown>
}

export interface FormRendererHandle {
  submit: () => FormSubmitResult
}

interface Props {
  schema: unknown
  data?: Record<string, unknown>
}

/**
 * (D12 — eForm "B-engine", Lát 1) Render một Camunda Form (form-js schema) bằng
 * component Ant Design thay cho renderer preact nội bộ của @bpmn-io/form-js — để
 * eForm đồng bộ giao diện với phần còn lại của app AntD.
 *
 * GIỮ NGUYÊN hợp đồng dữ liệu (JSON schema form-js) và interface `FormRendererHandle`,
 * nên builder / binding formKey / TaskFormModal / preview không phải sửa gì.
 *
 * Lát 1 = trường phẳng + validate + submit.
 * Lát 2 = cắm `feelin` (FEEL engine): ① hiển thị có điều kiện
 * (`component.conditional.hide`) + ② trường tính toán (`component.type === 'expression'`,
 * readonly). Trường ẩn bị loại khỏi validate + data submit.
 * Lát 3 (NÀY) = ③ `dynamiclist` → bảng động (thêm/xoá dòng). Mỗi dòng render đệ quy các
 * component con qua `deriveState` + `ComponentField` với context = {gốc, ...dòng} (biến FEEL
 * trong dòng thấy cả trường dòng lẫn trường gốc — quyết R2). Validate + computed/hidden tính
 * theo từng dòng; submit gom lại thành mảng object. Xem
 * docs/arch/eform-b-engine-architecture.md §6 & §8.
 */

// ── Kiểu schema form-js (chỉ phần Lát 1 dùng tới) ───────────────────────────
interface FieldValidate {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  validationType?: string
}
interface FComp {
  type: string
  id?: string
  key?: string
  label?: string
  text?: string
  subtype?: string
  validate?: FieldValidate
  values?: { value: string; label: string }[]
  /** ① Hiển thị có điều kiện — `hide` là biểu thức FEEL, true ⇒ ẩn trường. */
  conditional?: { hide?: string }
  /** ② Trường tính toán — biểu thức FEEL, giá trị readonly (dùng với type `expression`). */
  expression?: string
  /** Trường chỉ đọc (không cho nhập tay). */
  readonly?: boolean
  /** ③ Template component con — dùng cho `dynamiclist` (mỗi dòng render theo template này). */
  components?: FComp[]
}
interface FSchema {
  components?: FComp[]
}

function componentsOf(schema: unknown): FComp[] {
  const comps = (schema as FSchema)?.components
  return Array.isArray(comps) ? comps : []
}

/** Khoá để tra state/errors: ưu tiên id ổn định, fallback key. */
function idOf(c: FComp): string {
  return c.id ?? c.key ?? ''
}

/**
 * (Lát 2) Đánh giá một biểu thức FEEL của form-js bằng `feelin`.
 * form-js viết biểu thức với tiền tố '=' → bỏ '=' trước khi eval.
 * `feelin@7` trả `{ value, warnings }` — ta chỉ lấy `value`; lỗi/parse hỏng → undefined
 * (fail-safe: không làm sập renderer — R4).
 */
function evalFeel(expr: string | undefined, ctx: Record<string, unknown>): unknown {
  if (!expr) return undefined
  const src = expr.startsWith('=') ? expr.slice(1) : expr
  try {
    return evaluate(src, ctx).value
  } catch {
    return undefined
  }
}

function isEmpty(v: unknown): boolean {
  if (v == null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  return false
}

// ── Markdown-lite cho component `text` (tránh thêm dependency ở Lát 1) ───────
// Hỗ trợ: heading (#/##/###), **đậm**, xuống dòng. Không dựng innerHTML → an toàn XSS.
function renderInline(line: string): ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <Text strong key={i}>
        {p.slice(2, -2)}
      </Text>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  lines.forEach((raw, i) => {
    const line = raw.trimEnd()
    if (line.trim() === '') return
    if (line.startsWith('### ')) {
      out.push(
        <Title level={5} key={i} style={{ marginTop: 0 }}>
          {renderInline(line.slice(4))}
        </Title>,
      )
    } else if (line.startsWith('## ')) {
      out.push(
        <Title level={5} key={i} style={{ marginTop: 0 }}>
          {renderInline(line.slice(3))}
        </Title>,
      )
    } else if (line.startsWith('# ')) {
      out.push(
        <Title level={4} key={i} style={{ marginTop: 0 }}>
          {renderInline(line.slice(2))}
        </Title>,
      )
    } else {
      out.push(
        <Paragraph key={i} style={{ marginBottom: 8 }}>
          {renderInline(line)}
        </Paragraph>,
      )
    }
  })
  return <div>{out}</div>
}

// ── Validate một trường theo component.validate ─────────────────────────────
function validateField(c: FComp, value: unknown): string | undefined {
  const v = c.validate
  if (!v) return undefined
  if (v.required && isEmpty(value)) return 'Trường này là bắt buộc.'
  if (isEmpty(value)) return undefined // các rule còn lại chỉ áp khi có giá trị
  if (typeof value === 'string') {
    if (v.minLength != null && value.length < v.minLength)
      return `Tối thiểu ${v.minLength} ký tự.`
    if (v.maxLength != null && value.length > v.maxLength)
      return `Tối đa ${v.maxLength} ký tự.`
    if (v.pattern && !new RegExp(v.pattern).test(value))
      return 'Giá trị không đúng định dạng.'
    if (v.validationType === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value))
      return 'Email không hợp lệ.'
  }
  if (typeof value === 'number') {
    if (v.min != null && value < v.min) return `Giá trị tối thiểu là ${v.min}.`
    if (v.max != null && value > v.max) return `Giá trị tối đa là ${v.max}.`
  }
  return undefined
}

/**
 * (Lát 2+3) Tính trạng thái suy diễn cho MỘT cấp component (gốc hoặc 1 dòng dynamiclist):
 *   - `computed`: giá trị các trường `expression`.
 *   - `ctx`: context để eval/validate = { ...parent, ...data, ...computed }.
 *   - `hidden`: tập id trường đang ẩn (`conditional.hide` === true).
 * `parent` là context cấp trên: dòng dynamiclist truyền context gốc vào đây nên biểu thức
 * FEEL trong dòng thấy cả biến gốc lẫn biến của dòng (dòng ưu tiên) — quyết R2.
 */
function deriveState(
  components: FComp[],
  data: Record<string, unknown>,
  parent: Record<string, unknown> = {},
) {
  const base = { ...parent, ...data }
  const computed: Record<string, unknown> = {}
  for (const c of components) {
    if (c.type === 'expression' && c.key && c.expression) {
      computed[c.key] = evalFeel(c.expression, base)
    }
  }
  const ctx = { ...base, ...computed }
  const hidden = new Set<string>()
  for (const c of components) {
    const expr = c.conditional?.hide
    if (expr && evalFeel(expr, ctx) === true) hidden.add(idOf(c))
  }
  return { computed, ctx, hidden }
}

/** Khoá lỗi cho 1 ô trong dynamiclist: `<idList>#<dòng>.<idÔ>`. */
function rowErrKey(listId: string, index: number, fieldId: string): string {
  return `${listId}#${index}.${fieldId}`
}

/**
 * (Lát 3) Xử lý validate + gom data cho MỘT cấp component (đệ quy vào `dynamiclist`).
 * - Ghi lỗi vào `errs` (key phẳng; dòng dùng {@link rowErrKey}).
 * - Trả về object data của cấp này (chỉ trường visible; dynamiclist → mảng object).
 */
function processLevel(
  components: FComp[],
  data: Record<string, unknown>,
  parent: Record<string, unknown>,
  prefix: string,
  errs: Record<string, unknown>,
): Record<string, unknown> {
  const { ctx, hidden } = deriveState(components, data, parent)
  const out: Record<string, unknown> = {}
  for (const c of components) {
    if (!c.key || hidden.has(idOf(c))) continue // trường ẩn: bỏ validate + khỏi payload
    if (c.type === 'dynamiclist') {
      const rows = Array.isArray(data[c.key]) ? (data[c.key] as Record<string, unknown>[]) : []
      if (c.validate?.required && rows.length === 0) {
        errs[prefix + idOf(c)] = 'Cần ít nhất một dòng.'
      }
      out[c.key] = rows.map((row, i) =>
        processLevel(c.components ?? [], row ?? {}, ctx, `${prefix}${rowErrKey(idOf(c), i, '')}`, errs),
      )
      continue
    }
    const msg = validateField(c, ctx[c.key])
    if (msg) errs[prefix + idOf(c)] = msg
    if (ctx[c.key] !== undefined) out[c.key] = ctx[c.key]
  }
  return out
}

const FormRenderer = forwardRef<FormRendererHandle, Props>(({ schema, data }, ref) => {
  const components = useMemo(() => componentsOf(schema), [schema])
  const [formData, setFormData] = useState<Record<string, unknown>>(() => ({
    ...(data ?? {}),
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Đổi schema → nạp lại dữ liệu khởi tạo, xoá lỗi (giống re-import của renderer cũ).
  useEffect(() => {
    setFormData({ ...(data ?? {}) })
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema])

  // ── Vòng reactivity (Lát 2): tính computed + hidden mỗi lần formData đổi ────
  // 1) Đánh giá các trường tính toán (`expression`) từ formData → computed.
  // 2) Đánh giá điều kiện ẩn (`conditional.hide`) trên context đã trộn computed,
  //    để điều kiện có thể tham chiếu cả trường tính toán.
  const derived = useMemo(
    () => deriveState(components, formData),
    [components, formData],
  )

  const setValue = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    // Xoá lỗi của trường ngay khi người dùng chỉnh sửa.
    setErrors((prev) => {
      if (!Object.keys(prev).length) return prev
      const next = { ...prev }
      let changed = false
      for (const c of components) {
        if (c.key === key && next[idOf(c)]) {
          delete next[idOf(c)]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }

  useImperativeHandle(
    ref,
    () => ({
      submit: (): FormSubmitResult => {
        const errs: Record<string, unknown> = {}
        const outData = processLevel(components, formData, {}, '', errs)
        setErrors(errs as Record<string, string>)
        return { data: outData, errors: errs }
      },
    }),
    [components, formData],
  )

  return (
    <div className="vht-form">
      {components.map((c, idx) => {
        if (derived.hidden.has(idOf(c))) return null // ① trường đang ẩn
        // ③ bảng động: render riêng, quản lý mảng dòng.
        if (c.type === 'dynamiclist') {
          return (
            <DynamicList
              key={idOf(c) || idx}
              comp={c}
              rows={Array.isArray(formData[c.key ?? '']) ? (formData[c.key ?? ''] as Record<string, unknown>[]) : []}
              rootCtx={derived.ctx}
              errors={errors}
              errPrefix=""
              onChange={(next) => c.key && setValue(c.key, next)}
            />
          )
        }
        // ② trường tính toán: giá trị lấy từ computed, không phải formData.
        const isComputed = c.type === 'expression'
        const value = c.key
          ? isComputed
            ? derived.computed[c.key]
            : formData[c.key]
          : undefined
        return (
          <ComponentField
            key={idOf(c) || idx}
            comp={c}
            value={value}
            error={errors[idOf(c)]}
            disabled={isComputed || c.readonly === true}
            onChange={(v) => c.key && !isComputed && setValue(c.key, v)}
          />
        )
      })}
    </div>
  )
})

FormRenderer.displayName = 'FormRenderer'
export default FormRenderer

// ── ③ Bảng động (dynamiclist) → danh sách dòng thêm/xoá ──────────────────────
// Mỗi dòng là 1 object; render đệ quy các component con qua chính `ComponentField`
// (leaf) — computed/hidden của dòng suy từ `deriveState(children, row, rootCtx)`, nên
// biểu thức FEEL trong dòng thấy cả biến gốc (rootCtx) lẫn biến của dòng (row ưu tiên).
function DynamicList({
  comp,
  rows,
  rootCtx,
  errors,
  errPrefix,
  onChange,
}: {
  comp: FComp
  rows: Record<string, unknown>[]
  rootCtx: Record<string, unknown>
  errors: Record<string, string>
  errPrefix: string
  onChange: (rows: Record<string, unknown>[]) => void
}) {
  const children = comp.components ?? []
  const updateCell = (i: number, key: string, val: unknown) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)))
  const addRow = () => onChange([...rows, {}])
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))

  return (
    <div style={{ marginBottom: 16 }}>
      {comp.label && (
        <div style={{ marginBottom: 6, fontWeight: 500 }}>
          {comp.label}
          {comp.validate?.required && (
            <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
          )}
        </div>
      )}
      {rows.map((row, i) => {
        const { computed, hidden } = deriveState(children, row, rootCtx)
        return (
          <div
            key={i}
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: '12px 12px 0',
              marginBottom: 8,
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeRow(i)}
                aria-label="Xoá dòng"
              />
            </div>
            {children.map((cc, ci) => {
              if (hidden.has(idOf(cc))) return null
              const isComputed = cc.type === 'expression'
              const value = cc.key
                ? isComputed
                  ? computed[cc.key]
                  : row[cc.key]
                : undefined
              return (
                <ComponentField
                  key={idOf(cc) || ci}
                  comp={cc}
                  value={value}
                  error={errors[errPrefix + rowErrKey(idOf(comp), i, idOf(cc))]}
                  disabled={isComputed || cc.readonly === true}
                  onChange={(v) => cc.key && !isComputed && updateCell(i, cc.key, v)}
                />
              )
            })}
          </div>
        )
      })}
      <Button type="dashed" block icon={<PlusOutlined />} onClick={addRow}>
        Thêm dòng
      </Button>
      {errors[errPrefix + idOf(comp)] && (
        <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
          {errors[errPrefix + idOf(comp)]}
        </div>
      )}
    </div>
  )
}

// ── Render 1 component theo type → AntD ──────────────────────────────────────
function ComponentField({
  comp,
  value,
  error,
  disabled,
  onChange,
}: {
  comp: FComp
  value: unknown
  error?: string
  disabled?: boolean
  onChange: (v: unknown) => void
}) {
  const required = !!comp.validate?.required
  const options = (comp.values ?? []).map((o) => ({ label: o.label, value: o.value }))

  // Component tĩnh / bố cục (không có input) render riêng, không bọc label.
  if (comp.type === 'text') {
    return <div style={{ marginBottom: 12 }}>{renderMarkdown(comp.text ?? '')}</div>
  }
  if (comp.type === 'separator') return <Divider style={{ margin: '12px 0' }} />
  if (comp.type === 'spacer') return <div style={{ height: 16 }} />
  // ② Trường tính toán (`expression`): headless nếu không có label; có label → hiển thị
  //    readonly (giá trị do renderer tính, người dùng không gõ tay).
  if (comp.type === 'expression') {
    if (!comp.label) return null
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>{comp.label}</div>
        <Input value={value == null ? '' : String(value)} disabled readOnly />
      </div>
    )
  }

  let control: ReactNode
  switch (comp.type) {
    case 'textfield':
      control = (
        <Input
          value={(value as string) ?? ''}
          status={error ? 'error' : undefined}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )
      break
    case 'textarea':
      control = (
        <Input.TextArea
          rows={3}
          value={(value as string) ?? ''}
          status={error ? 'error' : undefined}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )
      break
    case 'number':
      control = (
        <InputNumber
          style={{ width: '100%' }}
          value={value as number}
          status={error ? 'error' : undefined}
          disabled={disabled}
          onChange={(v) => onChange(v ?? undefined)}
        />
      )
      break
    case 'checkbox':
      control = (
        <Checkbox
          checked={!!value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        >
          {comp.label}
        </Checkbox>
      )
      break
    case 'checklist':
      control = (
        <Checkbox.Group
          options={options}
          value={(value as string[]) ?? []}
          disabled={disabled}
          onChange={(v) => onChange(v)}
        />
      )
      break
    case 'radio':
      control = (
        <Radio.Group
          options={options}
          value={value as string}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )
      break
    case 'select':
      control = (
        <Select
          style={{ width: '100%' }}
          options={options}
          value={value as string}
          status={error ? 'error' : undefined}
          disabled={disabled}
          allowClear
          onChange={(v) => onChange(v)}
        />
      )
      break
    case 'taglist':
      control = (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          options={options}
          value={(value as string[]) ?? []}
          status={error ? 'error' : undefined}
          disabled={disabled}
          onChange={(v) => onChange(v)}
        />
      )
      break
    case 'datetime': {
      const val = value ? dayjs(value as string) : null
      if (comp.subtype === 'time') {
        control = (
          <TimePicker
            style={{ width: '100%' }}
            value={val}
            status={error ? 'error' : undefined}
            disabled={disabled}
            onChange={(d) => onChange(d ? d.toISOString() : undefined)}
          />
        )
      } else {
        control = (
          <DatePicker
            style={{ width: '100%' }}
            showTime={comp.subtype === 'datetime'}
            value={val}
            status={error ? 'error' : undefined}
            disabled={disabled}
            onChange={(d) => onChange(d ? d.toISOString() : undefined)}
          />
        )
      }
      break
    }
    default:
      // R4 — component chưa hỗ trợ: cảnh báo an toàn, không crash.
      control = (
        <Alert
          type="warning"
          showIcon
          message={`Loại trường chưa hỗ trợ: "${comp.type}"`}
        />
      )
  }

  // checkbox tự chứa nhãn (bên phải ô tick) → không lặp label phía trên.
  const showLabelOnTop = comp.type !== 'checkbox'

  return (
    <div style={{ marginBottom: 16 }}>
      {showLabelOnTop && comp.label && (
        <div style={{ marginBottom: 6, fontWeight: 500 }}>
          {comp.label}
          {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
        </div>
      )}
      {control}
      {error && (
        <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{error}</div>
      )}
    </div>
  )
}
