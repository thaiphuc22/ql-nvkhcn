/*
 * Custom Properties Provider: nhóm "Biểu mẫu KHCN".
 *
 * Thêm 1 nhóm vào Properties Panel cho mỗi User Task, với dropdown chọn biểu mẫu
 * LẤY TỪ ĐÚNG THƯ VIỆN BIỂU MẪU (FormContext) — BA gán nhanh, không gõ tay.
 * Giá trị ghi vào `zeebe:FormDefinition.formKey` (chuẩn Camunda 8) nên đồng bộ
 * với nhóm "Form" gốc của Zeebe và xuất ra XML triển khai được.
 *
 * Lưu ý: các component ở đây chạy trong preact (của properties-panel). Ta GỌI
 * `SelectEntry(...)` như hàm (trả vnode) — không dùng JSX — để không lẫn với
 * React của app. Vì các gói này không kèm .d.ts nên file để lỏng kiểu (any).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'

export interface FormLite {
  key: string
  ten: string
}

// ── moddle helpers (zeebe:FormDefinition) ──────────────────────────────────
function createElement(type: string, props: any, parent: any, factory: any) {
  const el = factory.create(type, props)
  if (parent) el.$parent = parent
  return el
}

function getFormDefinition(element: any) {
  const bo = getBusinessObject(element)
  const ee = bo.get('extensionElements')
  if (!ee) return undefined
  return (ee.get('values') || []).find((v: any) => is(v, 'zeebe:FormDefinition'))
}

function getFormKey(element: any): string {
  const fd = getFormDefinition(element)
  return fd ? fd.get('formKey') || '' : ''
}

function setFormKey(element: any, modeling: any, bpmnFactory: any, value: string) {
  const bo = getBusinessObject(element)
  let ee = bo.get('extensionElements')

  if (!ee) {
    ee = createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory)
    modeling.updateModdleProperties(element, bo, { extensionElements: ee })
  }

  const existing = getFormDefinition(element)

  if (value) {
    if (existing) {
      modeling.updateModdleProperties(element, existing, { formKey: value })
    } else {
      const fd = createElement('zeebe:FormDefinition', { formKey: value }, ee, bpmnFactory)
      modeling.updateModdleProperties(element, ee, { values: [...ee.get('values'), fd] })
    }
  } else if (existing) {
    // Bỏ gán → gỡ FormDefinition khỏi extensionElements.
    modeling.updateModdleProperties(element, ee, {
      values: ee.get('values').filter((v: any) => v !== existing),
    })
  }
}

// ── entry component (preact) ───────────────────────────────────────────────
function KhcnFormKeyEntry(props: any) {
  const { element, id, getForms } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const translate = useService('translate')

  const getValue = () => getFormKey(element)
  const setValue = (value: string) => setFormKey(element, modeling, bpmnFactory, value)
  const getOptions = () => [
    { value: '', label: translate('— Không gán —') },
    ...(getForms() as FormLite[]).map((f) => ({ value: f.key, label: `${f.ten} · ${f.key}` })),
  ]

  return SelectEntry({
    element,
    id,
    label: translate('Biểu mẫu (formKey)'),
    getValue,
    setValue,
    getOptions,
  })
}

// ── provider ───────────────────────────────────────────────────────────────
function makeProvider(getForms: () => FormLite[]) {
  class KhcnFormPropertiesProvider {
    static $inject = ['propertiesPanel', 'translate']
    private _translate: any
    constructor(propertiesPanel: any, translate: any) {
      this._translate = translate
      propertiesPanel.registerProvider(500, this)
    }
    getGroups(element: any) {
      return (groups: any[]) => {
        if (is(element, 'bpmn:UserTask')) {
          groups.push({
            id: 'khcnForm',
            label: this._translate('Biểu mẫu KHCN'),
            entries: [
              {
                id: 'khcn-formKey',
                element,
                getForms,
                component: KhcnFormKeyEntry,
                isEdited: isSelectEntryEdited,
              },
            ],
          })
        }
        return groups
      }
    }
  }
  return KhcnFormPropertiesProvider
}

/** Module didi — nạp vào additionalModules của BpmnModeler. */
export function khcnFormPropertiesModule(getForms: () => FormLite[]) {
  return {
    __init__: ['khcnFormPropertiesProvider'],
    khcnFormPropertiesProvider: ['type', makeProvider(getForms)],
  }
}
