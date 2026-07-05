/*
 * P0 #3 — Map Lane → Vai trò (candidateGroup).
 *
 * Trong tài liệu QTKHCN, mỗi "Nhóm tác nhân" chính là một LANE. Module này:
 *  (a) Provider: thêm nhóm "Vai trò (KHCN)" cho bpmn:Lane — chọn vai trò từ danh
 *      mục ROLES; lưu ROLE CODE trong extension property riêng
 *      (zeebe:Properties → zeebe:Property name="khcn:vaiTro") — tên lane CHỈ là
 *      nhãn hiển thị, BA đổi tên lane để trình bày KHÔNG làm mất mapping vai trò.
 *      (Sơ đồ cũ lưu role qua tên lane vẫn đọc được nhờ fallback theo nhãn.)
 *  (b) Behavior: khi một User Task được tạo/di chuyển vào lane có vai trò và task
 *      CHƯA gán candidateGroups → tự điền theo vai trò của lane. Không đè lựa chọn
 *      đã có của người dùng.
 *
 * Cùng khuôn plain didi module như khcnFormModule/khcnAssignmentModule. Không JSX.
 * Các gói bpmn.io không kèm .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import { SelectEntry, isSelectEntryEdited, TextFieldEntry } from '@bpmn-io/properties-panel'
import { createElement } from '@bpmn-io/properties-panel/preact'
import { useState } from '@bpmn-io/properties-panel/preact/hooks'
import { useService } from 'bpmn-js-properties-panel'
import { ROLES, roleCodeByLabel, roleLabel } from '../data/roles'
import { getAssignmentProp, setAssignmentProp } from './assignmentUtil'

// ── helpers ─────────────────────────────────────────────────────────────────
/** Tên extension property giữ role code của lane. */
const LANE_ROLE_PROP = 'khcn:vaiTro'

function getZeebeProperties(bo: any): any {
  const ee = bo.get('extensionElements')
  if (!ee) return undefined
  return (ee.get('values') || []).find((v: any) => is(v, 'zeebe:Properties'))
}

function findRoleProp(bo: any): any {
  const props = getZeebeProperties(bo)
  if (!props) return undefined
  return (props.get('properties') || []).find((p: any) => p.get('name') === LANE_ROLE_PROP)
}

function laneRoleCode(laneEl: any): string {
  const bo = getBusinessObject(laneEl)
  const prop = findRoleProp(bo)
  if (prop) return prop.get('value') || ''
  // Tương thích sơ đồ cũ: suy từ tên lane (trước đây name = nhãn vai trò).
  return roleCodeByLabel(bo.get('name') || '')
}

/** Ghi role code vào extension property; tên lane chỉ cập nhật khi đang do module quản. */
function setLaneRole(laneEl: any, modeling: any, bpmnFactory: any, code: string) {
  const bo = getBusinessObject(laneEl)

  let ee = bo.get('extensionElements')
  if (!ee) {
    ee = bpmnFactory.create('bpmn:ExtensionElements', { values: [] })
    ee.$parent = bo
    modeling.updateModdleProperties(laneEl, bo, { extensionElements: ee })
  }
  let props = getZeebeProperties(bo)
  if (!props) {
    props = bpmnFactory.create('zeebe:Properties', { properties: [] })
    props.$parent = ee
    modeling.updateModdleProperties(laneEl, ee, { values: [...(ee.get('values') || []), props] })
  }
  const existing = findRoleProp(bo)
  if (!code) {
    if (existing) {
      modeling.updateModdleProperties(laneEl, props, {
        properties: (props.get('properties') || []).filter((p: any) => p !== existing),
      })
    }
  } else if (existing) {
    modeling.updateModdleProperties(laneEl, existing, { value: code })
  } else {
    const prop = bpmnFactory.create('zeebe:Property', { name: LANE_ROLE_PROP, value: code })
    prop.$parent = props
    modeling.updateModdleProperties(laneEl, props, {
      properties: [...(props.get('properties') || []), prop],
    })
  }

  // Tên lane là nhãn hiển thị: chỉ tự đặt khi lane chưa có tên hoặc tên hiện tại
  // chính là nhãn một vai trò (tức do module đặt trước đó) — tên BA tự gõ giữ nguyên.
  const curName = bo.get('name') || ''
  const nameIsManaged = !curName || !!roleCodeByLabel(curName)
  if (nameIsManaged) {
    if (code) modeling.updateProperties(laneEl, { name: roleLabel(code) })
    else if (curName) modeling.updateProperties(laneEl, { name: '' })
  }
}

/** Tìm lane chứa một flow node (qua flowNodeRef của các Lane). */
function findContainingLane(element: any, elementRegistry: any): any {
  const bo = getBusinessObject(element)
  const lanes = elementRegistry.filter((e: any) => is(e, 'bpmn:Lane'))
  return lanes.find((laneEl: any) => {
    const refs = getBusinessObject(laneEl).get('flowNodeRef') || []
    return refs.includes(bo)
  })
}

// ── (a) Provider: vai trò cho Lane ──────────────────────────────────────────
function LaneRoleEntry(props: any) {
  const { element, id } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const translate = useService('translate')
  const debounce = useService('debounceInput')
  const [query, setQuery] = useState('')

  const getValue = () => laneRoleCode(element)
  const setValue = (code: string) => setLaneRole(element, modeling, bpmnFactory, code || '')
  const normalizedQuery = query.trim().toLocaleLowerCase('vi')
  const visibleRoles = ROLES.filter((r) => {
    if (!normalizedQuery) return true
    return `${r.code} ${r.ten} ${r.nhom}`.toLocaleLowerCase('vi').includes(normalizedQuery)
  })
  const current = getValue()
  if (current && !visibleRoles.some((r) => r.code === current)) {
    const selected = ROLES.find((r) => r.code === current)
    if (selected) visibleRoles.unshift(selected)
  }
  const groups = [...new Set(visibleRoles.map((r) => r.nhom))].map((nhom) => ({
    label: nhom,
    children: visibleRoles
      .filter((r) => r.nhom === nhom)
      .map((r) => ({ value: r.code, label: `${r.ten} · ${r.code}` })),
  }))
  const getOptions = () => [
    { value: '', label: translate('— Không gán vai trò —') },
    ...groups,
  ]

  return createElement(
    'div',
    null,
    TextFieldEntry({
      element,
      id: `${id}-search`,
      label: translate('Tìm vai trò'),
      description: translate('Tìm theo tên, mã hoặc nhóm đơn vị.'),
      getValue: () => query,
      setValue: (value: string) => setQuery(value || ''),
      debounce,
    }),
    SelectEntry({
      element,
      id,
      label: translate('Vai trò của lane'),
      getValue,
      setValue,
      getOptions,
    }),
  )
}

class KhcnLanePropertiesProvider {
  static $inject = ['propertiesPanel', 'translate']
  private _translate: any
  constructor(propertiesPanel: any, translate: any) {
    this._translate = translate
    propertiesPanel.registerProvider(520, this)
  }
  getGroups(element: any) {
    return (groups: any[]) => {
      if (is(element, 'bpmn:Lane')) {
        groups.push({
          id: 'khcnLaneRole',
          label: this._translate('Vai trò (KHCN)'),
          entries: [
            {
              id: 'khcn-laneRole',
              element,
              component: LaneRoleEntry,
              isEdited: isSelectEntryEdited,
            },
          ],
        })
      }
      return groups
    }
  }
}

// ── (b) Behavior: tự điền candidateGroups theo lane ─────────────────────────
class KhcnLaneAutoAssign {
  static $inject = ['eventBus', 'modeling', 'bpmnFactory', 'elementRegistry']

  constructor(eventBus: any, modeling: any, bpmnFactory: any, elementRegistry: any) {
    const maybeAssign = (shape: any) => {
      try {
        if (!shape || !is(shape, 'bpmn:UserTask')) return
        // Không đè lựa chọn có sẵn của người dùng.
        if (getAssignmentProp(shape, 'candidateGroups')) return
        const lane = findContainingLane(shape, elementRegistry)
        if (!lane) return
        const code = laneRoleCode(lane)
        if (!code) return
        setAssignmentProp(shape, modeling, bpmnFactory, 'candidateGroups', code)
      } catch {
        /* best-effort — không để lỗi behavior phá modeler */
      }
    }

    eventBus.on('commandStack.shape.create.postExecuted', 500, (e: any) => {
      maybeAssign(e?.context?.shape)
    })
    eventBus.on('commandStack.elements.move.postExecuted', 500, (e: any) => {
      ;(e?.context?.shapes || []).forEach(maybeAssign)
    })
  }
}

/** Module didi — nạp vào additionalModules của BpmnModeler. */
export function khcnLanePropertiesModule() {
  return {
    __init__: ['khcnLanePropertiesProvider', 'khcnLaneAutoAssign'],
    khcnLanePropertiesProvider: ['type', KhcnLanePropertiesProvider],
    khcnLaneAutoAssign: ['type', KhcnLaneAutoAssign],
  }
}
