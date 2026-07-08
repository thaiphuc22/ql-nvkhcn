// Lớp chuyển đổi giữa "lưới điều kiện thân thiện" (Rule Builder native, không FEEL)
// và DMN Decision Table. EPIC09 Pha 2: DMN XML vẫn là NGUỒN CHUẨN — lưới chỉ là lớp
// soạn sinh ra cùng một DMN XML, nên execution (evaluateDrd / EvaluateDecision) không đổi.
// Xem docs/research/EPIC09-dmn-design.md §2, §8.
//
// Hai chiều:
//   dmnToGrid(decisions)  : DmnDecision[]  → RuleGrid   (đọc DMN thô ra lưới thân thiện)
//   gridToDmn(grid)       : RuleGrid       → DMN XML    (soạn trên lưới → DMN nguồn chuẩn)
//
// Người dùng lowtech thao tác trên GridCondition/GridResult (op + value có cấu trúc),
// KHÔNG chạm vào FEEL. Chuyển đổi FEEL nằm gọn trong file này.

import type { DmnDecision } from './evaluateDmn'

/** Kiểu dữ liệu một cột (suy từ typeRef DMN). */
export type CellType = 'number' | 'string' | 'boolean'

/** Toán tử điều kiện thân thiện — thay cho việc gõ unary test FEEL. */
export type ConditionOp =
  | 'any' // '-' : khớp mọi giá trị
  | 'is' // string/boolean : bằng đúng giá trị
  | 'eq' // number : =
  | 'gte' // number : >=
  | 'gt' // number : >
  | 'lte' // number : <=
  | 'lt' // number : <
  | 'between' // number : [value..value2]

export interface GridColumn {
  id: string
  /** Nhãn tiếng Việt hiển thị trên đầu cột. */
  label: string
  /** Biến FEEL (inputExpression / tên output) — vd 'tongDuToan', 'cap'. */
  variable: string
  type: CellType
  /** typeRef gốc để tái tạo DMN (number/string/boolean). */
  typeRef: string
  /** (tuỳ chọn) miền giá trị enum để render dropdown thay ô nhập tự do. */
  options?: { value: string; label: string }[]
}

export interface GridCondition {
  op: ConditionOp
  /** Giá trị so sánh (số / slug string / boolean). null khi op='any'. */
  value?: string | number | boolean | null
  /** Cận trên khi op='between'. */
  value2?: number | null
}

export interface GridResult {
  value: string | number | boolean | null
}

export interface GridRule {
  id: string
  when: GridCondition[] // theo thứ tự inputs
  then: GridResult[] // theo thứ tự outputs
}

export interface GridDecision {
  id: string
  name: string
  hitPolicy: string
  /** Id các decision phụ thuộc (giữ để tái tạo requiredDecision + topo-sort). */
  requires: string[]
  inputs: GridColumn[]
  outputs: GridColumn[]
  rules: GridRule[]
}

export type RuleGrid = GridDecision[]

// ── FEEL ↔ mô hình lưới ────────────────────────────────────────────────────

function cellTypeOf(typeRef: string): CellType {
  const t = typeRef.toLowerCase()
  if (t === 'number' || t === 'integer' || t === 'long' || t === 'double')
    return 'number'
  if (t === 'boolean') return 'boolean'
  return 'string'
}

const ANY_TEXTS = new Set(['', '-'])

/** Ô input DMN (unary test FEEL) → điều kiện lưới. Chỉ nhận các dạng do lưới sinh
 *  + các dạng phổ biến trong seed viết tay (>=, >, <=, <, =, [a..b], "slug", true). */
export function feelInputToCondition(text: string, type: CellType): GridCondition {
  const s = text.trim()
  if (ANY_TEXTS.has(s)) return { op: 'any', value: null }

  if (type === 'number') {
    const range = s.match(/^[[(]\s*(-?\d+(?:\.\d+)?)\s*\.\.\s*(-?\d+(?:\.\d+)?)\s*[\])]$/)
    if (range) return { op: 'between', value: Number(range[1]), value2: Number(range[2]) }
    const cmp = s.match(/^(>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/)
    if (cmp) {
      const n = Number(cmp[2])
      switch (cmp[1]) {
        case '>=':
          return { op: 'gte', value: n }
        case '>':
          return { op: 'gt', value: n }
        case '<=':
          return { op: 'lte', value: n }
        case '<':
          return { op: 'lt', value: n }
        default:
          return { op: 'eq', value: n }
      }
    }
    // Không parse được → coi như 'any' để không vỡ lưới (nghiệp vụ sửa lại trên UI).
    return { op: 'any', value: null }
  }

  if (type === 'boolean') {
    if (s === 'true') return { op: 'is', value: true }
    if (s === 'false') return { op: 'is', value: false }
    return { op: 'any', value: null }
  }

  // string
  const quoted = s.match(/^"(.*)"$/)
  return { op: 'is', value: quoted ? quoted[1] : s }
}

/** Điều kiện lưới → text unary test FEEL (nội dung <text> trong inputEntry). */
export function conditionToFeelInput(cond: GridCondition, type: CellType): string {
  if (cond.op === 'any' || cond.value == null) return '-'
  if (type === 'number') {
    const n = Number(cond.value)
    switch (cond.op) {
      case 'gte':
        return `>= ${n}`
      case 'gt':
        return `> ${n}`
      case 'lte':
        return `<= ${n}`
      case 'lt':
        return `< ${n}`
      case 'between':
        return `[${n}..${Number(cond.value2)}]`
      default:
        return `${n}` // eq
    }
  }
  if (type === 'boolean') return cond.value ? 'true' : 'false'
  return `"${String(cond.value)}"` // string slug
}

/** Ô output DMN (FEEL literal) → giá trị lưới. */
export function feelOutputToResult(text: string, type: CellType): GridResult {
  const s = text.trim()
  if (ANY_TEXTS.has(s)) return { value: null }
  if (type === 'number') return { value: Number(s) }
  if (type === 'boolean') return { value: s === 'true' }
  const quoted = s.match(/^"(.*)"$/)
  return { value: quoted ? quoted[1] : s }
}

/** Giá trị lưới → FEEL literal (nội dung <text> trong outputEntry). */
export function resultToFeelOutput(res: GridResult, type: CellType): string {
  if (res.value == null) return '-'
  if (type === 'number') return `${Number(res.value)}`
  if (type === 'boolean') return res.value ? 'true' : 'false'
  return `"${String(res.value)}"`
}

// ── Mô tả điều kiện ra tiếng Việt (hiển thị lưới read-only / xem trước) ───────

const NUM = new Intl.NumberFormat('vi-VN')

function labelOf(col: GridColumn, value: unknown): string {
  const opt = col.options?.find((o) => o.value === String(value))
  if (opt) return opt.label
  if (col.type === 'boolean') return value ? 'Có' : 'Không'
  if (col.type === 'number') return NUM.format(Number(value))
  return String(value)
}

/** Điều kiện lưới → câu tiếng Việt (vd "≥ 10.000.000.000", "Tập đoàn", "Bất kỳ"). */
export function describeCondition(cond: GridCondition, col: GridColumn): string {
  if (cond.op === 'any' || cond.value == null) return 'Bất kỳ'
  if (col.type === 'number') {
    const n = NUM.format(Number(cond.value))
    switch (cond.op) {
      case 'gte':
        return `≥ ${n}`
      case 'gt':
        return `> ${n}`
      case 'lte':
        return `≤ ${n}`
      case 'lt':
        return `< ${n}`
      case 'between':
        return `${n} … ${NUM.format(Number(cond.value2))}`
      default:
        return `= ${n}`
    }
  }
  return labelOf(col, cond.value) // string/boolean: 'is'
}

/** Giá trị kết quả lưới → câu tiếng Việt. */
export function describeResult(res: GridResult, col: GridColumn): string {
  if (res.value == null) return '—'
  return labelOf(col, res.value)
}

// ── DMN thô → lưới ──────────────────────────────────────────────────────────

export function dmnToGrid(decisions: DmnDecision[]): RuleGrid {
  return decisions.map((d) => {
    const inputs: GridColumn[] = d.inputs.map((i, idx) => ({
      id: `${d.id}_i${idx + 1}`,
      label: i.label || i.expr,
      variable: i.expr,
      type: cellTypeOf(i.typeRef),
      typeRef: i.typeRef,
    }))
    const outputs: GridColumn[] = d.outputs.map((o, idx) => ({
      id: `${d.id}_o${idx + 1}`,
      label: o.name,
      variable: o.name,
      type: cellTypeOf(o.typeRef),
      typeRef: o.typeRef,
    }))
    const rules: GridRule[] = d.rules.map((r, idx) => ({
      id: r.id || `${d.id}_r${idx + 1}`,
      when: inputs.map((col, i) =>
        feelInputToCondition(r.inputEntries[i] ?? '-', col.type),
      ),
      then: outputs.map((col, j) =>
        feelOutputToResult(r.outputEntries[j] ?? '-', col.type),
      ),
    }))
    return {
      id: d.id,
      name: d.name,
      hitPolicy: d.hitPolicy,
      requires: d.requires,
      inputs,
      outputs,
      rules,
    }
  })
}

// ── Lưới → DMN XML (nguồn chuẩn) ─────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const DMN_NS = 'https://www.omg.org/spec/DMN/20191111/MODEL/'

/**
 * Sinh DMN XML từ lưới. Tự suy inputData (biến không do decision nào sinh ra) và
 * informationRequirement (requiredDecision cho biến là output của decision khác,
 * requiredInput cho biến gốc). KHÔNG sinh DMNDI (layout) — chiều này phục vụ eval &
 * lưu nguồn chuẩn; khi mở "chế độ nâng cao" dmn-js sẽ tự layout nếu thiếu DMNDI.
 */
export function gridToDmn(
  grid: RuleGrid,
  meta: { id: string; name: string; namespace?: string } = {
    id: 'drd',
    name: 'DRD',
  },
): string {
  const producedBy = new Map<string, string>() // variable → decisionId sinh ra nó
  for (const d of grid) for (const o of d.outputs) producedBy.set(o.variable, d.id)

  // inputData gốc = biến input không do decision nào sinh ra (dedupe).
  const rootInputs = new Map<string, string>() // variable → typeRef
  for (const d of grid)
    for (const col of d.inputs)
      if (!producedBy.has(col.variable) && !rootInputs.has(col.variable))
        rootInputs.set(col.variable, col.typeRef)

  const inputDataXml = [...rootInputs.entries()]
    .map(
      ([v, typeRef]) =>
        `  <inputData id="in_${v}" name="${esc(v)}">\n` +
        `    <variable id="var_${v}" name="${esc(v)}" typeRef="${esc(typeRef)}" />\n` +
        `  </inputData>`,
    )
    .join('\n')

  const decisionsXml = grid
    .map((d) => {
      // Requirements: gộp từ cột input (chính xác nhất) + requires[] còn sót.
      const reqDecisions = new Set<string>()
      const reqInputs = new Set<string>()
      for (const col of d.inputs) {
        const src = producedBy.get(col.variable)
        if (src && src !== d.id) reqDecisions.add(src)
        else if (rootInputs.has(col.variable)) reqInputs.add(col.variable)
      }
      for (const dep of d.requires) reqDecisions.add(dep)

      const reqXml = [
        ...[...reqDecisions].map(
          (id, i) =>
            `    <informationRequirement id="ir_${d.id}_d${i}">\n` +
            `      <requiredDecision href="#${id}" />\n` +
            `    </informationRequirement>`,
        ),
        ...[...reqInputs].map(
          (v, i) =>
            `    <informationRequirement id="ir_${d.id}_in${i}">\n` +
            `      <requiredInput href="#in_${v}" />\n` +
            `    </informationRequirement>`,
        ),
      ].join('\n')

      const inputsXml = d.inputs
        .map(
          (col) =>
            `      <input id="${col.id}" label="${esc(col.label)}">\n` +
            `        <inputExpression id="${col.id}e" typeRef="${esc(col.typeRef)}"><text>${esc(col.variable)}</text></inputExpression>\n` +
            `      </input>`,
        )
        .join('\n')

      const outputsXml = d.outputs
        .map(
          (col) =>
            `      <output id="${col.id}" name="${esc(col.variable)}" typeRef="${esc(col.typeRef)}" />`,
        )
        .join('\n')

      const rulesXml = d.rules
        .map((r) => {
          const ins = d.inputs
            .map(
              (col, i) =>
                `        <inputEntry id="${r.id}i${i + 1}"><text>${esc(
                  conditionToFeelInput(r.when[i] ?? { op: 'any' }, col.type),
                )}</text></inputEntry>`,
            )
            .join('\n')
          const outs = d.outputs
            .map(
              (col, j) =>
                `        <outputEntry id="${r.id}o${j + 1}"><text>${esc(
                  resultToFeelOutput(r.then[j] ?? { value: null }, col.type),
                )}</text></outputEntry>`,
            )
            .join('\n')
          return `      <rule id="${r.id}">\n${ins}\n${outs}\n      </rule>`
        })
        .join('\n')

      return (
        `  <decision id="${d.id}" name="${esc(d.name)}">\n` +
        (reqXml ? reqXml + '\n' : '') +
        `    <decisionTable id="dt_${d.id}" hitPolicy="${esc(d.hitPolicy)}">\n` +
        `${inputsXml}\n${outputsXml}\n${rulesXml}\n` +
        `    </decisionTable>\n` +
        `  </decision>`
      )
    })
    .join('\n\n')

  const ns = meta.namespace ?? 'http://vht.com.vn/qtkhcn/dmn'
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<definitions xmlns="${DMN_NS}"\n` +
    `             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"\n` +
    `             xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"\n` +
    `             xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/"\n` +
    `             id="${esc(meta.id)}"\n` +
    `             name="${esc(meta.name)}"\n` +
    `             namespace="${esc(ns)}">\n` +
    (inputDataXml ? inputDataXml + '\n\n' : '') +
    decisionsXml +
    `\n</definitions>`
  )
}
