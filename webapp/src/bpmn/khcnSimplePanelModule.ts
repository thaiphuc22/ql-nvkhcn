/*
 * Đợt 4 (bpmn-editor-ux-upgrade-plan.md) — Properties panel 2 chế độ.
 *
 * Chế độ ĐƠN GIẢN (mặc định, cho BA lowcode): mỗi loại element chỉ hiện các nhóm
 * thuộc tính nghiệp vụ cần thiết (whitelist dưới đây + mọi nhóm custom `khcn*`).
 * Chế độ NÂNG CAO: trả lại đầy đủ nhóm Zeebe (execution listeners, headers,
 * input/output mappings…) cho người dùng kỹ thuật.
 *
 * Cơ chế: registerProvider với priority THẤP (chạy cuối chuỗi middleware
 * getGroups) → nhìn thấy toàn bộ groups đã dựng rồi lọc. ID nhóm đối chiếu từ
 * bpmn-js-properties-panel (general/documentation/condition/multiInstance/
 * calledElement/taskDefinition/form/timer…).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is } from 'bpmn-js/lib/util/ModelUtil'

/** Nhóm luôn giữ ở chế độ đơn giản, mọi loại element. */
const ALWAYS_KEEP = new Set(['general', 'documentation'])

/** Whitelist nhóm bổ sung theo loại element (chế độ đơn giản). */
const KEEP_BY_TYPE: Array<{ type: string; groups: string[] }> = [
  // multiInstance: cấu hình hội đồng/quorum — nghiệp vụ cần nhìn thấy.
  { type: 'bpmn:UserTask', groups: ['multiInstance'] },
  { type: 'bpmn:ServiceTask', groups: [] }, // job type đã có nhóm "Tích hợp (KHCN)"
  { type: 'bpmn:CallActivity', groups: ['calledElement'] },
  { type: 'bpmn:SequenceFlow', groups: [] }, // điều kiện đã có nhóm "Điều kiện (KHCN)"
  { type: 'bpmn:CatchEvent', groups: ['timer', 'message'] },
  { type: 'bpmn:StartEvent', groups: ['timer', 'message'] },
  { type: 'bpmn:BoundaryEvent', groups: ['timer', 'error', 'message'] },
]

function allowedGroups(element: any): Set<string> {
  const allow = new Set(ALWAYS_KEEP)
  for (const rule of KEEP_BY_TYPE) {
    if (is(element, rule.type)) rule.groups.forEach((g) => allow.add(g))
  }
  return allow
}

class KhcnSimplePanelFilter {
  private _isAdvanced: () => boolean

  constructor(propertiesPanel: any, isAdvanced: () => boolean) {
    this._isAdvanced = isAdvanced
    // Priority 1 → chạy SAU mọi provider (mặc định 1000, custom khcn 520/530).
    propertiesPanel.registerProvider(1, this)
  }

  getGroups(element: any) {
    return (groups: any[]) => {
      if (this._isAdvanced()) return groups
      const allow = allowedGroups(element)
      return groups.filter((g: any) => {
        const id = String(g.id || '')
        return id.startsWith('khcn') || allow.has(id)
      })
    }
  }
}

/** Module didi — truyền callback đọc trạng thái "Chế độ nâng cao" từ React. */
export function khcnSimplePanelModule(isAdvanced: () => boolean) {
  const factory = (propertiesPanel: any) => new KhcnSimplePanelFilter(propertiesPanel, isAdvanced)
  factory.$inject = ['propertiesPanel']
  return {
    __init__: ['khcnSimplePanelFilter'],
    khcnSimplePanelFilter: ['factory', factory],
  }
}
