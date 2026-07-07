// Bộ đánh giá DMN Decision Table tối giản cho prototype EPIC09 (mock, chưa có Zeebe).
// Parse DMN XML → mô hình JS → đánh giá DRD theo thứ tự phụ thuộc bằng feelin.
//
// Khi backend/Zeebe sẵn sàng: thay hàm evaluateDrd() bằng gRPC EvaluateDecision của
// Camunda 8. DMN XML và test fixtures GIỮ NGUYÊN — chỉ đổi nơi chạy eval.
// Xem docs/research/EPIC09-dmn-design.md §9.

import { evaluate, unaryTest } from 'feelin'

export interface DmnInput {
  /** Nhãn cột (hiển thị). */
  label: string
  /** Biểu thức FEEL lấy giá trị input (thường là tên biến). */
  expr: string
  typeRef: string
}

export interface DmnOutput {
  name: string
  typeRef: string
}

export interface DmnRule {
  id: string
  /** Unary test theo từng cột input (text trong ô); '-' hoặc rỗng = khớp mọi giá trị. */
  inputEntries: string[]
  /** Biểu thức FEEL cho từng cột output. */
  outputEntries: string[]
}

export interface DmnDecision {
  id: string
  name: string
  hitPolicy: string
  /** Id các decision mà decision này phụ thuộc (requiredDecision). */
  requires: string[]
  inputs: DmnInput[]
  outputs: DmnOutput[]
  rules: DmnRule[]
}

/** Lấy text con đầu tiên của một element (đã trim). */
function childText(el: Element | null, localName: string): string {
  if (!el) return ''
  const node = el.getElementsByTagNameNS('*', localName)[0]
  return node?.textContent?.trim() ?? ''
}

/** Parse DMN XML thành danh sách decision. Không phụ thuộc dmn-js/moddle. */
export function parseDmn(xml: string): DmnDecision[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('DMN XML không hợp lệ (parse lỗi).')
  }
  const decisions: DmnDecision[] = []
  const decisionEls = Array.from(doc.getElementsByTagNameNS('*', 'decision'))
  for (const dEl of decisionEls) {
    const table = dEl.getElementsByTagNameNS('*', 'decisionTable')[0]
    if (!table) continue // bỏ qua decision không phải Decision Table (literal expression...)

    const requires = Array.from(
      dEl.getElementsByTagNameNS('*', 'requiredDecision'),
    )
      .map((r) => (r.getAttribute('href') ?? '').replace(/^#/, ''))
      .filter(Boolean)

    const inputs: DmnInput[] = Array.from(
      table.getElementsByTagNameNS('*', 'input'),
    ).map((i) => {
      const expr = i.getElementsByTagNameNS('*', 'inputExpression')[0] ?? null
      return {
        label: i.getAttribute('label') ?? childText(expr, 'text'),
        expr: childText(expr, 'text'),
        typeRef: expr?.getAttribute('typeRef') ?? 'string',
      }
    })

    const outputs: DmnOutput[] = Array.from(
      table.getElementsByTagNameNS('*', 'output'),
    ).map((o) => ({
      name: o.getAttribute('name') ?? 'output',
      typeRef: o.getAttribute('typeRef') ?? 'string',
    }))

    const rules: DmnRule[] = Array.from(
      table.getElementsByTagNameNS('*', 'rule'),
    ).map((r, idx) => ({
      id: r.getAttribute('id') ?? `rule_${idx + 1}`,
      inputEntries: Array.from(
        r.getElementsByTagNameNS('*', 'inputEntry'),
      ).map((e) => childText(e, 'text')),
      outputEntries: Array.from(
        r.getElementsByTagNameNS('*', 'outputEntry'),
      ).map((e) => childText(e, 'text')),
    }))

    decisions.push({
      id: dEl.getAttribute('id') ?? '',
      name: dEl.getAttribute('name') ?? dEl.getAttribute('id') ?? '',
      hitPolicy: (table.getAttribute('hitPolicy') ?? 'UNIQUE').toUpperCase(),
      requires,
      inputs,
      outputs,
      rules,
    })
  }
  return topoSort(decisions)
}

/** Sắp xếp decision theo thứ tự phụ thuộc (decision được yêu cầu chạy trước). */
function topoSort(decisions: DmnDecision[]): DmnDecision[] {
  const byId = new Map(decisions.map((d) => [d.id, d]))
  const sorted: DmnDecision[] = []
  const seen = new Set<string>()
  const visit = (d: DmnDecision, stack: Set<string>) => {
    if (seen.has(d.id)) return
    if (stack.has(d.id)) throw new Error(`DRD có phụ thuộc vòng ở "${d.id}".`)
    stack.add(d.id)
    for (const dep of d.requires) {
      const depDec = byId.get(dep)
      if (depDec) visit(depDec, stack)
    }
    stack.delete(d.id)
    seen.add(d.id)
    sorted.push(d)
  }
  for (const d of decisions) visit(d, new Set())
  return sorted
}

export interface DecisionResult {
  decisionId: string
  decisionName: string
  outputs: Record<string, unknown>
  firedRuleIds: string[]
}

export interface EvalResult {
  results: DecisionResult[]
  /** Context cuối cùng (input + mọi output đã suy ra). */
  context: Record<string, unknown>
  error?: string
}

/** Ô input '-' hoặc rỗng = khớp mọi giá trị (đúng chuẩn DMN). */
function isAnyEntry(text: string): boolean {
  return text === '' || text === '-'
}

function feelValue(expr: string, ctx: Record<string, unknown>): unknown {
  return evaluate(expr, ctx).value
}

/** Đánh giá cả DRD với bộ input cho trước; trả kết quả từng decision + context. */
export function evaluateDrd(
  decisions: DmnDecision[],
  inputs: Record<string, unknown>,
): EvalResult {
  const context: Record<string, unknown> = { ...inputs }
  const results: DecisionResult[] = []
  try {
    for (const d of decisions) {
      const inputValues = d.inputs.map((inp) => feelValue(inp.expr, context))
      const matched: DmnRule[] = []
      for (const rule of d.rules) {
        const ok = rule.inputEntries.every((entry, i) => {
          if (isAnyEntry(entry)) return true
          return (
            unaryTest(entry, { ...context, '?': inputValues[i] }).value === true
          )
        })
        if (ok) matched.push(rule)
      }

      // Hit policy: COLLECT giữ mọi dòng khớp; còn lại (FIRST/UNIQUE/ANY/PRIORITY)
      // lấy dòng khớp đầu tiên — đủ cho 3 bảng hero.
      const collect = d.hitPolicy === 'COLLECT'
      const taken = collect ? matched : matched.slice(0, 1)

      const outputs: Record<string, unknown> = {}
      d.outputs.forEach((out, j) => {
        const vals = taken.map((r) => feelValue(r.outputEntries[j], context))
        const value = collect ? vals : vals[0]
        outputs[out.name] = value
        // Output nhập vào context để decision sau dùng (chuỗi DRD).
        if (!collect) context[out.name] = vals[0]
        else context[out.name] = vals
      })

      results.push({
        decisionId: d.id,
        decisionName: d.name,
        outputs,
        firedRuleIds: taken.map((r) => r.id),
      })
    }
    return { results, context }
  } catch (err) {
    return {
      results,
      context,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
