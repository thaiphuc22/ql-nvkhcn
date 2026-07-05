/*
 * Helper dùng chung cho `zeebe:AssignmentDefinition` (chuẩn Camunda 8).
 * Dùng bởi khcnAssignmentModule (Properties Panel) và khcnLaneModule (behavior
 * tự điền candidateGroups theo lane). Các gói bpmn.io không kèm .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'

export type AssignmentProp = 'candidateGroups' | 'assignee' | 'candidateUsers'

function createElement(type: string, props: any, parent: any, factory: any) {
  const el = factory.create(type, props)
  if (parent) el.$parent = parent
  return el
}

export function getAssignmentDefinition(element: any) {
  const bo = getBusinessObject(element)
  const ee = bo.get('extensionElements')
  if (!ee) return undefined
  return (ee.get('values') || []).find((v: any) => is(v, 'zeebe:AssignmentDefinition'))
}

export function getAssignmentProp(element: any, prop: AssignmentProp): string {
  const ad = getAssignmentDefinition(element)
  return ad ? ad.get(prop) || '' : ''
}

/** Đảm bảo có extensionElements + AssignmentDefinition rồi set 1 thuộc tính. */
export function setAssignmentProp(
  element: any,
  modeling: any,
  bpmnFactory: any,
  prop: AssignmentProp,
  value: string,
) {
  const bo = getBusinessObject(element)
  let ee = bo.get('extensionElements')
  if (!ee) {
    ee = createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory)
    modeling.updateModdleProperties(element, bo, { extensionElements: ee })
  }

  let ad = getAssignmentDefinition(element)
  if (!ad) {
    ad = createElement('zeebe:AssignmentDefinition', {}, ee, bpmnFactory)
    modeling.updateModdleProperties(element, ee, { values: [...ee.get('values'), ad] })
  }
  modeling.updateModdleProperties(element, ad, { [prop]: value || undefined })
}
