/*
 * P2 #9 — Điều kiện rẽ nhánh (KHCN) cho Sequence Flow ra từ Gateway.
 *
 * Người vẽ TỰ thiết lập điều kiện rẽ nhánh — không phụ thuộc số liệu khách. Con số
 * ngưỡng (vd "vượt chủ trương") KHÔNG nằm ở gateway mà ở BIẾN quyết định tính từ
 * bước phía trước (business rule/DMN). Gateway chỉ so biến đó bằng FEEL.
 *
 * Module thêm nhóm "Điều kiện (KHCN)" cho bpmn:SequenceFlow (khi nguồn là Gateway):
 * dropdown preset nghiệp vụ → ghi bpmn:conditionExpression (FEEL, dùng BIẾN, không
 * hardcode số). Vẫn dùng chung ô Condition tự do của panel Zeebe cho biểu thức khác.
 *
 * Cùng khuôn khcnFormModule/khcnAssignmentModule. Không JSX. Gói không .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import { SelectEntry, isSelectEntryEdited, CheckboxEntry, isCheckboxEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'
import { CONDITION_PRESETS } from '../data/variableContract'

// ── helpers (bpmn:conditionExpression) ──────────────────────────────────────
function getCondition(flow: any): string {
  const ce = getBusinessObject(flow).get('conditionExpression')
  return ce ? ce.get('body') || '' : ''
}

function setCondition(flow: any, modeling: any, bpmnFactory: any, body: string) {
  const bo = getBusinessObject(flow)
  if (body) {
    const ce = bpmnFactory.create('bpmn:FormalExpression', { body })
    ce.$parent = bo
    modeling.updateModdleProperties(flow, bo, { conditionExpression: ce })
  } else {
    modeling.updateModdleProperties(flow, bo, { conditionExpression: undefined })
  }
}

// ── entry (preact) ──────────────────────────────────────────────────────────
function ConditionPresetEntry(props: any) {
  const { element, id } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const translate = useService('translate')

  const getValue = () => getCondition(element)
  const setValue = (value: string) => setCondition(element, modeling, bpmnFactory, value)
  const getOptions = () => {
    const cur = getCondition(element)
    // Nhóm preset theo biến (optgroup) — panel hỗ trợ children native.
    const groups = [...new Set(CONDITION_PRESETS.map((p) => p.group))].map((group) => ({
      label: group,
      children: CONDITION_PRESETS.filter((p) => p.group === group).map((p) => ({
        value: p.value,
        label: p.label,
      })),
    }))
    const opts: any[] = [{ value: '', label: translate('— Không đặt điều kiện —') }, ...groups]
    // Nếu điều kiện hiện tại là biểu thức tuỳ chỉnh (không thuộc preset) → hiện để không mất giá trị.
    if (cur && !CONDITION_PRESETS.some((p) => p.value === cur)) {
      opts.push({ value: cur, label: `${translate('(tuỳ chỉnh)')} ${cur}` })
    }
    return opts
  }

  return SelectEntry({
    element,
    id,
    label: translate('Điều kiện nghiệp vụ (FEEL)'),
    getValue,
    setValue,
    getOptions,
  })
}

/**
 * "Đặt làm nhánh mặc định" ngay trong nhóm Điều kiện — BA không phải mò sang
 * panel Zeebe gốc. Đặt default → tự XOÁ điều kiện trên flow (Camunda bỏ qua
 * điều kiện của default flow; lint cũng cảnh báo trường hợp này).
 */
function DefaultFlowEntry(props: any) {
  const { element, id } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const translate = useService('translate')

  const sourceEl = element.source
  const getValue = () => {
    if (!sourceEl) return false
    const src = getBusinessObject(sourceEl)
    return src.get('default') === getBusinessObject(element)
  }
  const setValue = (checked: boolean) => {
    if (!sourceEl) return
    if (checked) {
      setCondition(element, modeling, bpmnFactory, '')
      modeling.updateProperties(sourceEl, { default: getBusinessObject(element) })
    } else {
      modeling.updateProperties(sourceEl, { default: undefined })
    }
  }

  return CheckboxEntry({
    element,
    id,
    label: translate('Đặt làm nhánh mặc định'),
    description: translate('Đi nhánh này khi không nhánh nào khớp điều kiện (khuyến nghị: nhánh Từ chối/hiệu chỉnh).'),
    getValue,
    setValue,
  })
}

// ── provider ─────────────────────────────────────────────────────────────────
class KhcnConditionPropertiesProvider {
  static $inject = ['propertiesPanel', 'translate']
  private _translate: any
  constructor(propertiesPanel: any, translate: any) {
    this._translate = translate
    propertiesPanel.registerProvider(530, this)
  }
  getGroups(element: any) {
    return (groups: any[]) => {
      // Chỉ hiện cho luồng đi ra TỪ một Gateway.
      if (is(element, 'bpmn:SequenceFlow') && element.source && is(element.source, 'bpmn:Gateway')) {
        groups.push({
          id: 'khcnCondition',
          label: this._translate('Điều kiện (KHCN)'),
          entries: [
            {
              id: 'khcn-condition',
              element,
              component: ConditionPresetEntry,
              isEdited: isSelectEntryEdited,
            },
            {
              id: 'khcn-defaultFlow',
              element,
              component: DefaultFlowEntry,
              isEdited: isCheckboxEntryEdited,
            },
          ],
        })
      }
      return groups
    }
  }
}

/** Module didi — nạp vào additionalModules của BpmnModeler. */
export function khcnConditionPropertiesModule() {
  return {
    __init__: ['khcnConditionPropertiesProvider'],
    khcnConditionPropertiesProvider: ['type', KhcnConditionPropertiesProvider],
  }
}
