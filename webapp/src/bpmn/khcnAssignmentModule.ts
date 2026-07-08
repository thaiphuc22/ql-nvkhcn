/*
 * Custom Properties Provider: nhóm "Phân công (KHCN)".
 *
 * Thêm 1 nhóm vào Properties Panel cho mỗi User Task để BA gán VAI TRÒ phụ trách
 * — chọn từ ĐÚNG danh mục vai trò (data/roles.ts, rút từ bảng "Tác nhân tham gia"
 * của RD01–RD10) thay vì gõ tay ID nhóm. Đây là gap P0 quan trọng nhất: mọi bước
 * trong mọi luồng đều là "ai làm việc này".
 *
 * Giá trị ghi vào `zeebe:AssignmentDefinition` (chuẩn Camunda 8):
 *   - candidateGroups ← code vai trò (vd 'HDXD', 'TGD_VHT')
 *   - assignee        ← người/biểu thức cụ thể (tùy chọn)
 * → đồng bộ với nhóm "Assignment" gốc của Zeebe và xuất ra XML triển khai được.
 *
 * Cùng nhóm còn "Cần vai trò (Need Role)" (Slice C, docs/research/
 * approval-slot-catalog-plan.md §4.C): mã SLOT PHÊ DUYỆT trừu tượng (không phải
 * người/nhóm) — Approval Matrix (EPIC06) resolve slot này ra người cụ thể theo
 * điều kiện nghiệp vụ. Ghi vào `zeebe:TaskHeaders` (needRoleUtil.ts), tách khỏi
 * candidateGroups/assignee vì đây là 2 tầng khác nhau (D3: BPMN không giữ business
 * data, chỉ trỏ tới slot trừu tượng).
 *
 * Cùng khuôn với khcnFormModule: component chạy trong preact của properties-panel,
 * GỌI *Entry(...) như hàm (trả vnode), không JSX. Các gói không kèm .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is } from 'bpmn-js/lib/util/ModelUtil'
import {
  SelectEntry,
  isSelectEntryEdited,
  TextFieldEntry,
  isTextFieldEntryEdited,
} from '@bpmn-io/properties-panel'
import { createElement } from '@bpmn-io/properties-panel/preact'
import { useState } from '@bpmn-io/properties-panel/preact/hooks'
import { useService } from 'bpmn-js-properties-panel'
import { ROLES } from '../data/roles'
import type { ApprovalSlot } from '../data/approvalSlotCatalog'
import { getAssignmentProp, setAssignmentProp } from './assignmentUtil'
import { getNeedRole, setNeedRole } from './needRoleUtil'

/** Kết quả tạo slot mới — cùng hình dạng với ApprovalSlotCatalogContext.create(). */
export interface CreateSlotResult {
  ok: boolean
  slot?: ApprovalSlot
  errors: string[]
}

// ── entries (preact) ───────────────────────────────────────────────────────
function CandidateGroupEntry(props: any) {
  const { element, id } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const debounce = useService('debounceInput')
  const translate = useService('translate')
  const [query, setQuery] = useState('')

  const getValue = () => getAssignmentProp(element, 'candidateGroups')
  const setValue = (value: string) =>
    setAssignmentProp(element, modeling, bpmnFactory, 'candidateGroups', value)
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
    { value: '', label: translate('— Chưa phân công —') },
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
      label: translate('Nhóm phụ trách (candidateGroups)'),
      getValue,
      setValue,
      getOptions,
    }),
  )
}

function AssigneeEntry(props: any) {
  const { element, id } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const debounce = useService('debounceInput')
  const translate = useService('translate')

  const getValue = () => getAssignmentProp(element, 'assignee')
  const setValue = (value: string) =>
    setAssignmentProp(element, modeling, bpmnFactory, 'assignee', value)

  return TextFieldEntry({
    element,
    id,
    label: translate('Người cụ thể (assignee)'),
    description: translate('Tùy chọn — username hoặc biểu thức. Bỏ trống nếu giao cả nhóm.'),
    getValue,
    setValue,
    debounce,
  })
}

function NeedRoleEntry(props: any) {
  const { element, id, getSlots, createSlot } = props
  const modeling = useService('modeling')
  const bpmnFactory = useService('bpmnFactory')
  const debounce = useService('debounceInput')
  const translate = useService('translate')
  const [adding, setAdding] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newTen, setNewTen] = useState('')
  const [addError, setAddError] = useState('')

  const getValue = () => getNeedRole(element)
  const setValue = (value: string) => setNeedRole(element, modeling, bpmnFactory, value)

  const activeSlots = (getSlots() as ApprovalSlot[]).filter((s) => s.trangThai === 'active')
  const current = getValue()
  const currentKnown = !current || activeSlots.some((s) => s.code === current)

  const getOptions = () => {
    const opts = [
      { value: '', label: translate('— Chưa gán —') },
      ...activeSlots.map((s) => ({ value: s.code, label: `${s.ten} · ${s.code}` })),
    ]
    if (current && !currentKnown) opts.push({ value: current, label: `${current} (chưa có trong danh mục)` })
    return opts
  }

  const submitNewSlot = () => {
    const result = createSlot({ code: newCode, ten: newTen || newCode }) as CreateSlotResult
    if (!result.ok || !result.slot) {
      setAddError(result.errors.join(' '))
      return
    }
    setValue(result.slot.code)
    setAdding(false)
    setNewCode('')
    setNewTen('')
    setAddError('')
  }

  const children: any[] = [
    SelectEntry({
      element,
      id,
      label: translate('Cần vai trò (Need Role)'),
      description: translate('Loại phê duyệt trừu tượng — Ma trận phê duyệt sẽ resolve ra người/nhóm cụ thể.'),
      getValue,
      setValue,
      getOptions,
    }),
  ]

  if (current && !currentKnown) {
    children.push(
      createElement(
        'div',
        { style: { fontSize: 12, color: '#ad6800', padding: '2px 0 6px' } },
        translate(`Mã "${current}" chưa có trong Danh mục Loại phê duyệt.`),
      ),
    )
  }

  if (adding) {
    children.push(
      createElement(
        'div',
        { style: { padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 4 } },
        TextFieldEntry({
          element,
          id: `${id}-newCode`,
          label: translate('Mã loại phê duyệt mới'),
          description: translate('VD: TAI_CHINH_RASOAT — tự chuẩn hoá chữ hoa khi lưu.'),
          getValue: () => newCode,
          setValue: (v: string) => setNewCode(v || ''),
          debounce,
        }),
        TextFieldEntry({
          element,
          id: `${id}-newTen`,
          label: translate('Tên hiển thị'),
          getValue: () => newTen,
          setValue: (v: string) => setNewTen(v || ''),
          debounce,
        }),
        addError ? createElement('div', { style: { fontSize: 12, color: '#cf1322' } }, addError) : null,
        createElement(
          'div',
          { style: { display: 'flex', gap: 8 } },
          createElement(
            'button',
            { type: 'button', disabled: !newCode.trim(), onClick: submitNewSlot, style: { fontSize: 12 } },
            translate('Lưu loại phê duyệt mới'),
          ),
          createElement(
            'button',
            {
              type: 'button',
              onClick: () => {
                setAdding(false)
                setAddError('')
              },
              style: { fontSize: 12 },
            },
            translate('Huỷ'),
          ),
        ),
      ),
    )
  } else {
    children.push(
      createElement(
        'button',
        {
          type: 'button',
          onClick: () => setAdding(true),
          style: {
            fontSize: 12,
            padding: '2px 0',
            background: 'none',
            border: 'none',
            color: '#1677ff',
            cursor: 'pointer',
          },
        },
        translate('+ Tạo loại phê duyệt mới'),
      ),
    )
  }

  return createElement('div', null, ...children)
}

// ── provider ───────────────────────────────────────────────────────────────
function makeProvider(getSlots: () => ApprovalSlot[], createSlot: (input: { code: string; ten: string }) => CreateSlotResult) {
  class KhcnAssignmentPropertiesProvider {
    static $inject = ['propertiesPanel', 'translate']
    private _translate: any
    constructor(propertiesPanel: any, translate: any) {
      this._translate = translate
      propertiesPanel.registerProvider(510, this)
    }
    getGroups(element: any) {
      return (groups: any[]) => {
        if (is(element, 'bpmn:UserTask')) {
          groups.push({
            id: 'khcnAssignment',
            label: this._translate('Phân công (KHCN)'),
            entries: [
              {
                id: 'khcn-candidateGroups',
                element,
                component: CandidateGroupEntry,
                isEdited: isSelectEntryEdited,
              },
              {
                id: 'khcn-assignee',
                element,
                component: AssigneeEntry,
                isEdited: isTextFieldEntryEdited,
              },
              {
                id: 'khcn-needRole',
                element,
                getSlots,
                createSlot,
                component: NeedRoleEntry,
                isEdited: isSelectEntryEdited,
              },
            ],
          })
        }
        return groups
      }
    }
  }
  return KhcnAssignmentPropertiesProvider
}

/** Module didi — nạp vào additionalModules của BpmnModeler. */
export function khcnAssignmentPropertiesModule(
  getSlots: () => ApprovalSlot[],
  createSlot: (input: { code: string; ten: string }) => CreateSlotResult,
) {
  return {
    __init__: ['khcnAssignmentPropertiesProvider'],
    khcnAssignmentPropertiesProvider: ['type', makeProvider(getSlots, createSlot)],
  }
}
