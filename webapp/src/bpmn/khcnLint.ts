/*
 * P2 — Validation / lint BPMN (bản nhẹ, không cần bpmnlint).
 *
 * Kiểm tra tính nhất quán của luồng phê duyệt KHCN trước khi lưu quy trình:
 *  - UserTask phải có vai trò phụ trách (candidateGroups/assignee) — mọi bước là "ai làm".
 *  - UserTask nên gán biểu mẫu (formKey).
 *  - ServiceTask phải có job type (zeebe:TaskDefinition.type).
 *  - ExclusiveGateway ≥2 nhánh: phải có default flow + các nhánh nên có nhãn;
 *    nhánh KHÔNG-default bắt buộc có điều kiện (error); default KHÔNG nên có điều kiện.
 *  - Điều kiện FEEL chỉ được dùng biến thuộc contract (data/variableContract.ts).
 *  - Task/Event có ≥2 luồng đi ra = tách nhánh ngầm (Camunda chạy SONG SONG cả hai) → error,
 *    phải rẽ nhánh qua Gateway. (Chính là lỗi token-flow của RD01.01 trước đây.)
 *  - Call Activity phải trỏ tới process đích (zeebe:CalledElement.processId).
 *  - Multi-instance phải có inputCollection; nên có completion condition (quorum — OQ-003).
 *  - Không node treo: task/gateway/intermediate cần cả vào & ra; start cần ra; end cần vào.
 *  - Quy trình nên có ≥1 Start và ≥1 End.
 *
 * Chạy trên elementRegistry hiện tại (không phụ thuộc React). Gói bpmn.io không .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import { VARIABLE_NAMES } from '../data/variableContract'

export type LintSeverity = 'error' | 'warning' | 'info'

export interface LintIssue {
  severity: LintSeverity
  elementId: string
  elementName: string
  message: string
}

/** Đọc 1 phần tử mở rộng theo type trong extensionElements. */
function getExt(bo: any, type: string): any {
  const ee = bo.get('extensionElements')
  if (!ee) return undefined
  return (ee.get('values') || []).find((v: any) => is(v, type))
}

function nameOf(el: any): string {
  const bo = getBusinessObject(el)
  return bo.get('name') || bo.get('id') || el.id || '(không tên)'
}

/** Từ khoá FEEL cần bỏ qua khi soi tên biến trong điều kiện. */
const FEEL_KEYWORDS = new Set([
  'true', 'false', 'null', 'and', 'or', 'not', 'if', 'then', 'else',
  'in', 'between', 'some', 'every', 'satisfies', 'instance', 'of',
])

/** Tên biến xuất hiện trong biểu thức FEEL nhưng KHÔNG thuộc contract. */
function unknownVariables(body: string): string[] {
  const noStrings = body.replace(/^=/, '').replace(/"[^"]*"/g, '""')
  const idents = noStrings.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []
  return [...new Set(idents.filter((t) => !FEEL_KEYWORDS.has(t) && !VARIABLE_NAMES.has(t)))]
}

export function lintDiagram(modeler: any): LintIssue[] {
  const issues: LintIssue[] = []
  const registry = modeler.get('elementRegistry')
  const all: any[] = registry.getAll()

  const push = (severity: LintSeverity, el: any, message: string) =>
    issues.push({ severity, elementId: el.id, elementName: nameOf(el), message })

  let startCount = 0
  let endCount = 0

  for (const el of all) {
    // Bỏ qua nhãn, root, connection, pool/lane.
    if (el.labelTarget || el.waypoints) continue
    if (!is(el, 'bpmn:FlowNode')) continue

    const bo = getBusinessObject(el)
    const incoming = (bo.get('incoming') || []).length
    const outgoing = (bo.get('outgoing') || []).length

    // ── Node treo ──────────────────────────────────────────────────────────
    if (is(el, 'bpmn:StartEvent')) {
      startCount++
      if (outgoing === 0) push('error', el, 'Sự kiện bắt đầu chưa có luồng đi ra.')
    } else if (is(el, 'bpmn:EndEvent')) {
      endCount++
      if (incoming === 0) push('error', el, 'Sự kiện kết thúc chưa có luồng đi vào.')
    } else if (is(el, 'bpmn:BoundaryEvent')) {
      // gắn vào host — bỏ qua kiểm tra vào/ra.
    } else {
      if (incoming === 0) push('error', el, 'Phần tử chưa có luồng đi vào (node treo).')
      if (outgoing === 0) push('error', el, 'Phần tử chưa có luồng đi ra (node treo).')
    }

    // ── User Task: vai trò + biểu mẫu ───────────────────────────────────────
    if (is(el, 'bpmn:UserTask')) {
      const ad = getExt(bo, 'zeebe:AssignmentDefinition')
      const hasRole = ad && (ad.get('candidateGroups') || ad.get('assignee'))
      if (!hasRole) push('warning', el, 'User Task chưa gán vai trò phụ trách (candidateGroups/assignee).')

      const fd = getExt(bo, 'zeebe:FormDefinition')
      if (!fd || !fd.get('formKey')) push('info', el, 'User Task chưa gán biểu mẫu (formKey).')
    }

    // ── Service Task: job type ─────────────────────────────────────────────
    if (is(el, 'bpmn:ServiceTask')) {
      const td = getExt(bo, 'zeebe:TaskDefinition')
      if (!td || !td.get('type')) push('warning', el, 'Service Task chưa có job type (zeebe:taskDefinition.type).')
    }

    // ── Tách nhánh ngầm: activity/event có ≥2 luồng đi ra ──────────────────
    // Camunda kích hoạt TẤT CẢ outgoing của activity (parallel fork ngầm) —
    // rẽ nhánh phải đi qua Gateway, nếu không token chạy cả hai hướng.
    if (!is(el, 'bpmn:Gateway') && outgoing >= 2) {
      push('error', el, `Phần tử có ${outgoing} luồng đi ra — Camunda sẽ chạy SONG SONG tất cả các nhánh. Hãy rẽ nhánh qua một Gateway.`)
    }

    // ── Call Activity: process đích ────────────────────────────────────────
    if (is(el, 'bpmn:CallActivity')) {
      const ce = getExt(bo, 'zeebe:CalledElement')
      if (!ce || !ce.get('processId'))
        push('error', el, 'Call Activity chưa trỏ tới process đích (zeebe:CalledElement.processId) — sẽ incident khi chạy.')
    }

    // ── Multi-instance: inputCollection + completion condition ─────────────
    const loop = bo.get('loopCharacteristics')
    if (loop && is(loop, 'bpmn:MultiInstanceLoopCharacteristics')) {
      const zl = ((loop.get('extensionElements')?.get('values')) || []).find((v: any) =>
        is(v, 'zeebe:LoopCharacteristics'),
      )
      if (!zl || !zl.get('inputCollection'))
        push('error', el, 'Multi-instance chưa có inputCollection (danh sách thành viên hội đồng).')
      if (!loop.get('completionCondition'))
        push('warning', el, 'Multi-instance chưa có completion condition (quorum hội đồng — OQ-003 chưa chốt).')
    }

    // ── Exclusive Gateway: default + điều kiện từng nhánh + nhãn ───────────
    if (is(el, 'bpmn:ExclusiveGateway') && outgoing >= 2) {
      const flows = (bo.get('outgoing') || []).filter((f: any) => is(f, 'bpmn:SequenceFlow'))
      const def = bo.get('default')
      if (!def) push('warning', el, 'Cổng rẽ nhánh chưa đặt luồng mặc định (default flow).')

      for (const f of flows) {
        const flowName = f.get('name') || f.get('id')
        const cond = f.get('conditionExpression')
        const isDefault = def && f === def
        if (isDefault && cond) {
          issues.push({
            severity: 'warning', elementId: f.get('id'), elementName: flowName,
            message: 'Nhánh mặc định không nên có điều kiện — Camunda bỏ qua điều kiện trên default flow.',
          })
        }
        if (!isDefault && !cond) {
          issues.push({
            severity: 'error', elementId: f.get('id'), elementName: flowName,
            message: 'Nhánh không-default chưa có điều kiện rẽ nhánh — deploy sẽ lỗi hoặc chạy sai hướng.',
          })
        }
        const body = cond?.get('body') || ''
        if (body) {
          const unknown = unknownVariables(body)
          if (unknown.length > 0) {
            issues.push({
              severity: 'warning', elementId: f.get('id'), elementName: flowName,
              message: `Điều kiện dùng biến ngoài contract: ${unknown.join(', ')} (xem data/variableContract.ts).`,
            })
          }
        }
      }

      const unnamed = flows.filter((f: any) => !f.get('name')).length
      if (unnamed > 0) push('warning', el, `Cổng rẽ nhánh có ${unnamed} nhánh chưa gán nhãn.`)
    }
  }

  if (startCount === 0) issues.push({ severity: 'error', elementId: '', elementName: 'Quy trình', message: 'Chưa có sự kiện bắt đầu (Start Event).' })
  if (endCount === 0) issues.push({ severity: 'error', elementId: '', elementName: 'Quy trình', message: 'Chưa có sự kiện kết thúc (End Event).' })

  // error trước, rồi warning, rồi info.
  const rank: Record<LintSeverity, number> = { error: 0, warning: 1, info: 2 }
  return issues.sort((a, b) => rank[a.severity] - rank[b.severity])
}

/**
 * Lint một chuỗi BPMN XML mà không cần editor đang mở (cổng chặn DEPLOY).
 * Dựng BpmnModeler tách rời (không gắn DOM) chỉ để import + đọc elementRegistry;
 * nạp động để không kéo bpmn-js vào chunk chính.
 */
export async function lintBpmnXml(xml: string): Promise<LintIssue[]> {
  const [{ default: BpmnModeler }, { default: zeebeModdle }] = await Promise.all([
    import('bpmn-js/lib/Modeler'),
    import('zeebe-bpmn-moddle/resources/zeebe.json'),
  ])
  const modeler: any = new BpmnModeler({ moddleExtensions: { zeebe: zeebeModdle } } as never)
  try {
    await modeler.importXML(xml)
    return lintDiagram(modeler)
  } finally {
    modeler.destroy()
  }
}
