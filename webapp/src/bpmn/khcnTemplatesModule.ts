/*
 * P1 — Element Templates domain (bản nhẹ, không cần Camunda template engine).
 *
 * Từ đợt nâng UX (bpmn-editor-ux-upgrade-plan.md, Đợt 3): mẫu KHCN KHÔNG còn nằm
 * trong palette dọc (15 nút cùng icon, chỉ phân biệt được qua tooltip) mà chuyển
 * sang drawer "Mẫu nghiệp vụ KHCN" (components/BpmnTemplateDrawer.tsx) có nhóm,
 * nhãn, mô tả và tìm kiếm. File này giữ phần LÕI dùng chung: dựng businessObject
 * đúng cấu hình Zeebe rồi khởi động thao tác kéo-thả qua service `create`.
 *
 * Cách chèn: dựng sẵn businessObject (name + extensionElements) rồi
 * elementFactory.createShape({ type, businessObject }) → create.start(). Một lệnh
 * duy nhất, undo được, không race event. Các gói bpmn.io không kèm .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KhcnTemplate } from '../data/elementTemplates'

/** Icon bpmn-font tương ứng từng loại — drawer dùng để BA phân biệt bằng mắt. */
export const TEMPLATE_ICON: Record<KhcnTemplate['bpmnType'], string> = {
  'bpmn:UserTask': 'bpmn-icon-user-task',
  'bpmn:ServiceTask': 'bpmn-icon-service-task',
  'bpmn:CallActivity': 'bpmn-icon-call-activity',
  'bpmn:StartEvent': 'bpmn-icon-start-event-timer',
  'bpmn:IntermediateCatchEvent': 'bpmn-icon-intermediate-event-catch-timer',
  'bpmn:ExclusiveGateway': 'bpmn-icon-gateway-xor',
}

/** Dựng businessObject có sẵn name + cấu hình Zeebe (assignment / taskDefinition /
 *  calledElement / multi-instance / timer). */
export function buildKhcnBusinessObject(bpmnFactory: any, tmpl: KhcnTemplate): any {
  const f = bpmnFactory
  const d = tmpl.defaults
  const bo = f.create(tmpl.bpmnType, { name: d.name })

  // extensionElements cấp task: assignment / taskDefinition / calledElement.
  const ext: any[] = []
  if (d.candidateGroups) {
    ext.push(f.create('zeebe:AssignmentDefinition', { candidateGroups: d.candidateGroups }))
  }
  if (d.taskType) {
    ext.push(f.create('zeebe:TaskDefinition', { type: d.taskType }))
  }
  if (d.calledElement) {
    ext.push(f.create('zeebe:CalledElement', { processId: d.calledElement }))
  }
  if (ext.length) {
    const ee = f.create('bpmn:ExtensionElements', { values: ext })
    ee.$parent = bo
    ext.forEach((x) => (x.$parent = ee))
    bo.extensionElements = ee
  }

  // Multi-instance song song: loopCharacteristics kèm zeebe:LoopCharacteristics
  // (extensionElements RIÊNG của loop, tách khỏi extensionElements cấp task).
  if (d.multiInstance) {
    const loop = f.create('bpmn:MultiInstanceLoopCharacteristics', { isSequential: false })
    const zl = f.create('zeebe:LoopCharacteristics', {
      inputCollection: d.multiInstance.inputCollection,
      inputElement: d.multiInstance.inputElement,
    })
    const lee = f.create('bpmn:ExtensionElements', { values: [zl] })
    lee.$parent = loop
    zl.$parent = lee
    loop.extensionElements = lee
    loop.$parent = bo
    bo.loopCharacteristics = loop
  }

  // Sự kiện hẹn giờ: bpmn:TimerEventDefinition (timeCycle / timeDuration).
  if (d.timer) {
    const timerDef = f.create('bpmn:TimerEventDefinition', {})
    if (d.timer.timeCycle) {
      const tc = f.create('bpmn:FormalExpression', { body: d.timer.timeCycle })
      tc.$parent = timerDef
      timerDef.timeCycle = tc
    }
    if (d.timer.timeDuration) {
      const td = f.create('bpmn:FormalExpression', { body: d.timer.timeDuration })
      td.$parent = timerDef
      timerDef.timeDuration = td
    }
    timerDef.$parent = bo
    bo.eventDefinitions = [timerDef]
  }
  return bo
}

/**
 * Khởi động kéo-thả một mẫu KHCN trên modeler (drawer gọi khi BA bấm/kéo mẫu):
 * phần tử dính theo con trỏ, click lên canvas để đặt — một lệnh, undo được.
 */
export function startKhcnTemplate(modeler: any, tmpl: KhcnTemplate, event: Event): void {
  const create = modeler.get('create')
  const elementFactory = modeler.get('elementFactory')
  const bpmnFactory = modeler.get('bpmnFactory')
  const businessObject = buildKhcnBusinessObject(bpmnFactory, tmpl)
  const shape = elementFactory.createShape({ type: tmpl.bpmnType, businessObject })
  create.start(event, shape)
}
