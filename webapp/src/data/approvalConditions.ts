// EPIC06 — Approval Matrix: động cơ điều kiện (condition engine).
//
// Slice A của refactor (docs/research/approval-matrix-refactor-plan.md §4.A): thay
// schema điều kiện CỨNG (cap/loaiHoiDong/budgetMin/budgetMax trên ApprovalRule) bằng
// một CÂY ĐIỀU KIỆN tổng quát AND/OR + tập toán tử. Nhờ đó thêm điều kiện nghiệp vụ
// mới (loaiNhiemVu, nguonVon, mucDoMat, coMuaSam...) KHÔNG phải sửa resolver hay UI —
// chỉ khai báo thêm biến trong approvalVariableRegistry.ts (Slice B).
//
// File này KHÔNG phụ thuộc registry: nó chỉ đánh giá cây trên một context phẳng
// (Record<string, unknown>) và mô tả cây thành câu tiếng Việt (nhãn do caller cấp,
// mặc định = tên trường/giá trị thô). Registry (Slice B) sẽ cấp nhãn đẹp.

// ── Kiểu ──────────────────────────────────────────────────────────────────────

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'contains'
  | 'exists'
  | 'notExists'

export type ConditionNode = ConditionLeaf | ConditionGroup

export interface ConditionGroup {
  kind: 'group'
  logic: 'AND' | 'OR'
  items: ConditionNode[]
}

export interface ConditionLeaf {
  kind: 'condition'
  field: string
  operator: ConditionOperator
  /** Giá trị so sánh. Với `between` là cận dưới; với `in` là mảng. */
  value?: unknown
  /** Cận trên của `between` (inclusive). */
  valueTo?: unknown
}

export type EvalContext = Record<string, unknown>

/** Toán tử không cần vế phải (chỉ kiểm tra sự tồn tại của trường). */
export const UNARY_OPERATORS: ReadonlySet<ConditionOperator> = new Set([
  'exists',
  'notExists',
])

// ── Metadata toán tử (UI Slice D dùng để render nhãn + chọn toán tử) ───────────

export interface OperatorMeta {
  op: ConditionOperator
  /** Ký hiệu/nhãn ngắn hiển thị trên nút/select. */
  symbol: string
  /** Cụm từ đọc được trong câu mô tả tiếng Việt. */
  phrase: string
  /** Cần vế phải hay không. */
  arity: 'unary' | 'binary' | 'range'
}

export const OPERATORS: OperatorMeta[] = [
  { op: 'eq', symbol: '=', phrase: 'bằng', arity: 'binary' },
  { op: 'neq', symbol: '≠', phrase: 'khác', arity: 'binary' },
  { op: 'gt', symbol: '>', phrase: 'lớn hơn', arity: 'binary' },
  { op: 'gte', symbol: '≥', phrase: 'lớn hơn hoặc bằng', arity: 'binary' },
  { op: 'lt', symbol: '<', phrase: 'nhỏ hơn', arity: 'binary' },
  { op: 'lte', symbol: '≤', phrase: 'nhỏ hơn hoặc bằng', arity: 'binary' },
  { op: 'between', symbol: 'trong khoảng', phrase: 'trong khoảng', arity: 'range' },
  { op: 'in', symbol: 'thuộc', phrase: 'thuộc nhóm', arity: 'binary' },
  { op: 'contains', symbol: 'chứa', phrase: 'chứa', arity: 'binary' },
  { op: 'exists', symbol: 'có giá trị', phrase: 'có giá trị', arity: 'unary' },
  { op: 'notExists', symbol: 'không có giá trị', phrase: 'không có giá trị', arity: 'unary' },
]

const OP_META = new Map(OPERATORS.map((o) => [o.op, o]))

// ── Đánh giá ──────────────────────────────────────────────────────────────────

/** Trường coi như "vắng" khi undefined/null (chuỗi rỗng vẫn là có giá trị). */
function isMissing(v: unknown): boolean {
  return v === undefined || v === null
}

/** Ép về số để so sánh; trả NaN nếu không phải số hợp lệ. */
function toNum(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '') return Number(v)
  return NaN
}

/** So sánh bằng, có chuẩn hoá số ("5" == 5) nhưng giữ nghĩa với chuỗi/boolean. */
function looseEq(a: unknown, b: unknown): boolean {
  if (a === b) return true
  const na = toNum(a)
  const nb = toNum(b)
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb
  return String(a) === String(b)
}

export function evaluateLeaf(leaf: ConditionLeaf, ctx: EvalContext): boolean {
  const actual = ctx[leaf.field]

  // Toán tử tồn tại — xử lý trước, không fail-closed.
  if (leaf.operator === 'exists') return !isMissing(actual)
  if (leaf.operator === 'notExists') return isMissing(actual)

  // Fail-closed: trường bắt buộc mà thiếu → KHÔNG khớp (kể cả `neq`).
  if (isMissing(actual)) return false

  switch (leaf.operator) {
    case 'eq':
      return looseEq(actual, leaf.value)
    case 'neq':
      return !looseEq(actual, leaf.value)
    case 'gt': {
      const a = toNum(actual), b = toNum(leaf.value)
      return !Number.isNaN(a) && !Number.isNaN(b) && a > b
    }
    case 'gte': {
      const a = toNum(actual), b = toNum(leaf.value)
      return !Number.isNaN(a) && !Number.isNaN(b) && a >= b
    }
    case 'lt': {
      const a = toNum(actual), b = toNum(leaf.value)
      return !Number.isNaN(a) && !Number.isNaN(b) && a < b
    }
    case 'lte': {
      const a = toNum(actual), b = toNum(leaf.value)
      return !Number.isNaN(a) && !Number.isNaN(b) && a <= b
    }
    case 'between': {
      const a = toNum(actual), lo = toNum(leaf.value), hi = toNum(leaf.valueTo)
      return (
        !Number.isNaN(a) &&
        !Number.isNaN(lo) &&
        !Number.isNaN(hi) &&
        a >= lo &&
        a <= hi
      )
    }
    case 'in': {
      const arr = Array.isArray(leaf.value) ? leaf.value : [leaf.value]
      return arr.some((v) => looseEq(actual, v))
    }
    case 'contains': {
      if (Array.isArray(actual)) return actual.some((v) => looseEq(v, leaf.value))
      return String(actual).includes(String(leaf.value))
    }
    default:
      return false
  }
}

/**
 * Đánh giá cây điều kiện trên context. Nhóm RỖNG (không có items) = "bất kỳ"
 * (wildcard) → true, giữ đúng ngữ nghĩa "điều kiện để trống = khớp mọi hồ sơ" của
 * bản mock cũ. AND = mọi nhánh đúng; OR = ít nhất một nhánh đúng.
 */
export function evaluateConditionTree(
  node: ConditionNode,
  ctx: EvalContext,
): boolean {
  if (node.kind === 'condition') return evaluateLeaf(node, ctx)
  if (node.items.length === 0) return true // wildcard
  return node.logic === 'AND'
    ? node.items.every((it) => evaluateConditionTree(it, ctx))
    : node.items.some((it) => evaluateConditionTree(it, ctx))
}

// ── Mô tả tiếng Việt (preview cho người nghiệp vụ) ────────────────────────────

export interface DescribeHelpers {
  /** Nhãn hiển thị của trường (mặc định = tên trường thô). */
  fieldLabel?: (field: string) => string
  /** Nhãn hiển thị của một giá trị theo trường (mặc định = ép chuỗi). */
  valueLabel?: (field: string, value: unknown) => string
}

function fmtValue(field: string, value: unknown, h?: DescribeHelpers): string {
  if (Array.isArray(value)) {
    return value.map((v) => fmtValue(field, v, h)).join(', ')
  }
  if (h?.valueLabel) return h.valueLabel(field, value)
  return String(value)
}

/** Mô tả một leaf: `<Nhãn trường> <cụm toán tử> <giá trị>`. */
export function describeLeaf(leaf: ConditionLeaf, h?: DescribeHelpers): string {
  const field = h?.fieldLabel ? h.fieldLabel(leaf.field) : leaf.field
  const meta = OP_META.get(leaf.operator)
  const phrase = meta?.phrase ?? leaf.operator
  if (meta?.arity === 'unary') return `${field} ${phrase}`
  if (meta?.arity === 'range') {
    return `${field} ${phrase} ${fmtValue(leaf.field, leaf.value, h)} – ${fmtValue(
      leaf.field,
      leaf.valueTo,
      h,
    )}`
  }
  return `${field} ${phrase} ${fmtValue(leaf.field, leaf.value, h)}`
}

/**
 * Mô tả cả cây thành câu đọc được. Nhóm con lồng nhau được bọc trong ngoặc để
 * giữ đúng ưu tiên AND/OR. Nhóm rỗng → "(bất kỳ)".
 */
export function describeConditionTree(
  node: ConditionNode,
  h?: DescribeHelpers,
  depth = 0,
): string {
  if (node.kind === 'condition') return describeLeaf(node, h)
  if (node.items.length === 0) return '(bất kỳ)'
  const sep = node.logic === 'AND' ? ' VÀ ' : ' HOẶC '
  const inner = node.items
    .map((it) => describeConditionTree(it, h, depth + 1))
    .join(sep)
  return depth === 0 ? inner : `(${inner})`
}

// ── Tiện ích dựng cây ─────────────────────────────────────────────────────────

export function leaf(
  field: string,
  operator: ConditionOperator,
  value?: unknown,
  valueTo?: unknown,
): ConditionLeaf {
  return { kind: 'condition', field, operator, value, valueTo }
}

export function group(
  logic: 'AND' | 'OR',
  items: ConditionNode[],
): ConditionGroup {
  return { kind: 'group', logic, items }
}

/** Nhóm AND rỗng = wildcard (khớp mọi context). */
export function anyCondition(): ConditionGroup {
  return { kind: 'group', logic: 'AND', items: [] }
}
