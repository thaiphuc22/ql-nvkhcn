/*
 * Đợt 4 (bpmn-editor-ux-upgrade-plan.md) — nhóm "Tích hợp (KHCN)" cho ServiceTask.
 *
 * Thay ô text tự do "Type" (dễ gõ sai job type) bằng dropdown danh mục chuẩn
 * (data/jobTypes.ts, nhóm theo hệ). Ghi zeebe:TaskDefinition.type; giá trị ngoài
 * danh mục (đã có từ trước / người kỹ thuật nhập ở chế độ Nâng cao) vẫn hiển thị
 * dưới dạng "(tuỳ chỉnh)" để không mất dữ liệu.
 *
 * Cùng khuôn khcnFormModule/khcnConditionModule. Không JSX. Gói không .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel'
import { useService } from 'bpmn-js-properties-panel'
import { JOB_TYPES } from '../data/jobTypes'

// ── helpers (zeebe:TaskDefinition.type) ─────────────────────────────────────
function getTaskDefinition(element: any): any {
  const bo = getBusinessObject(element)
  const ee = bo.get('extensionElements')
  if (!ee) return undefined
  return (ee.get('values') || []).find((v: any) => is(v, 'zeebe:TaskDefinition'))
}

function getJobType(element: any): string {
  const td = getTaskDefinition(element)
  return td ? td.get('type') || '' : ''
}

function setJobType(element: any, modeling: any, bpmnFactory: any, value: string) {
  const bo = getBusinessObject(element)
  let ee = bo.get('extensionElements')
  if (!ee) {
    ee = bpmnFactory.create('bpmn:ExtensionElements', { values: [] })
    ee.$parent = bo
    modeling.updateModdleProperties(element, bo, { extensionElements: ee })
  }
  let td = getTaskDefinition(element)
  if (!td) {
    td = bpmnFactory.create('zeebe:TaskDefinition', {})
    td.$parent = ee
    modeling.updateModdleProperties(element, ee, { values: [...(ee.get('values') || []), td] })
  }
  modeling.updateModdleProperties(element, td, { type: value || undefined })
}

// ── entry (preact) ──────────────────────────────────────────────────────────
function JobTypeEntry(props: any) {
  const { element, id } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const translate = useService('translate')

  const getValue = () => getJobType(element)
  const setValue = (value: string) => setJobType(element, modeling, bpmnFactory, value)
  const getOptions = () => {
    const cur = getJobType(element)
    const groups = [...new Set(JOB_TYPES.map((j) => j.nhom))].map((nhom) => ({
      label: nhom,
      children: JOB_TYPES.filter((j) => j.nhom === nhom).map((j) => ({
        value: j.type,
        label: `${j.label} · ${j.type}`,
      })),
    }))
    const opts: any[] = [{ value: '', label: translate('— Chưa chọn job type —') }, ...groups]
    if (cur && !JOB_TYPES.some((j) => j.type === cur)) {
      opts.push({ value: cur, label: `${translate('(tuỳ chỉnh)')} ${cur}` })
    }
    return opts
  }

  return SelectEntry({
    element,
    id,
    label: translate('Job type (worker xử lý)'),
    description: translate('Worker backend nhận job theo type này — chọn từ danh mục để tránh gõ sai.'),
    getValue,
    setValue,
    getOptions,
  })
}

// ── provider ─────────────────────────────────────────────────────────────────
class KhcnJobTypePropertiesProvider {
  static $inject = ['propertiesPanel', 'translate']
  private _translate: any
  constructor(propertiesPanel: any, translate: any) {
    this._translate = translate
    propertiesPanel.registerProvider(525, this)
  }
  getGroups(element: any) {
    return (groups: any[]) => {
      if (is(element, 'bpmn:ServiceTask')) {
        groups.push({
          id: 'khcnJobType',
          label: this._translate('Tích hợp (KHCN)'),
          entries: [
            {
              id: 'khcn-jobType',
              element,
              component: JobTypeEntry,
              isEdited: isSelectEntryEdited,
            },
          ],
        })
      }
      return groups
    }
  }
}

/** Module didi — nạp vào additionalModules của BpmnModeler. */
export function khcnJobTypePropertiesModule() {
  return {
    __init__: ['khcnJobTypePropertiesProvider'],
    khcnJobTypePropertiesProvider: ['type', KhcnJobTypePropertiesProvider],
  }
}
