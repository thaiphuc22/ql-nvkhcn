/*
 * Helper cho `zeebe:TaskHeaders` (chuẩn Camunda 8 cho metadata tuỳ ý trên User
 * Task) — dùng để ghi "Need Role" = mã slot phê duyệt trừu tượng (Slice C,
 * docs/research/approval-slot-catalog-plan.md §4.C). Cùng khuôn get/set với
 * assignmentUtil.ts (AssignmentDefinition) / khcnFormModule.ts (FormDefinition),
 * chỉ khác loại extension element. Các gói bpmn.io không kèm .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'

/** Key cố định trong zeebe:TaskHeaders dùng cho Need Role. */
export const NEED_ROLE_HEADER_KEY = 'needRole'

function createElement(type: string, props: any, parent: any, factory: any) {
  const el = factory.create(type, props)
  if (parent) el.$parent = parent
  return el
}

function getTaskHeaders(element: any) {
  const bo = getBusinessObject(element)
  const ee = bo.get('extensionElements')
  if (!ee) return undefined
  return (ee.get('values') || []).find((v: any) => is(v, 'zeebe:TaskHeaders'))
}

function getHeaderEntry(element: any, key: string) {
  const th = getTaskHeaders(element)
  if (!th) return undefined
  return (th.get('values') || []).find((h: any) => h.get('key') === key)
}

/** Đọc mã slot Need Role hiện gán trên User Task (rỗng nếu chưa gán). */
export function getNeedRole(element: any): string {
  const h = getHeaderEntry(element, NEED_ROLE_HEADER_KEY)
  return h ? h.get('value') || '' : ''
}

/** Ghi/gỡ Need Role — đảm bảo extensionElements + TaskHeaders tồn tại trước khi ghi. */
export function setNeedRole(element: any, modeling: any, bpmnFactory: any, value: string) {
  const bo = getBusinessObject(element)
  let ee = bo.get('extensionElements')
  if (!ee) {
    if (!value) return
    ee = createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory)
    modeling.updateModdleProperties(element, bo, { extensionElements: ee })
  }

  let th = getTaskHeaders(element)
  if (!th) {
    if (!value) return
    th = createElement('zeebe:TaskHeaders', { values: [] }, ee, bpmnFactory)
    modeling.updateModdleProperties(element, ee, { values: [...ee.get('values'), th] })
  }

  const existing = getHeaderEntry(element, NEED_ROLE_HEADER_KEY)
  if (value) {
    if (existing) {
      modeling.updateModdleProperties(element, existing, { value })
    } else {
      const header = createElement('zeebe:Header', { key: NEED_ROLE_HEADER_KEY, value }, th, bpmnFactory)
      modeling.updateModdleProperties(element, th, { values: [...th.get('values'), header] })
    }
  } else if (existing) {
    modeling.updateModdleProperties(element, th, {
      values: th.get('values').filter((h: any) => h !== existing),
    })
  }
}
