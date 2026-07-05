/*
 * Đợt 5 (bpmn-editor-ux-upgrade-plan.md) — tô màu element cho BA.
 *
 * Context-pad thêm nút "Tô màu" → popup bảng màu VHT định sẵn (khớp bảng màu
 * seed RD01.01 đang dùng bioc). Ghi màu qua modeling.setColor → serialize chuẩn
 * bioc:fill/bioc:stroke, Camunda Modeler/Operate đọc được.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is } from 'bpmn-js/lib/util/ModelUtil'

interface ColorDef {
  id: string
  label: string
  fill: string | undefined
  stroke: string | undefined
}

const COLORS: ColorDef[] = [
  { id: 'default', label: 'Mặc định (bỏ màu)', fill: undefined, stroke: undefined },
  { id: 'green', label: 'Xanh lá — bước thực hiện', fill: '#c5d9c3', stroke: '#7dcea0' },
  { id: 'orange', label: 'Cam — hệ thống/tích hợp', fill: '#fae5d3', stroke: '#e67e22' },
  { id: 'blue', label: 'Xanh dương — thông tin', fill: '#d6eaf8', stroke: '#3498db' },
  { id: 'yellow', label: 'Vàng — cần lưu ý', fill: '#fcf3cf', stroke: '#f1c40f' },
  { id: 'red', label: 'Đỏ — rủi ro/từ chối', fill: '#fdecea', stroke: '#e74c3c' },
  { id: 'grey', label: 'Xám — tạm gác', fill: '#eceff1', stroke: '#90a4ae' },
]

class KhcnColorContextPad {
  static $inject = ['contextPad', 'popupMenu', 'translate']
  private _popupMenu: any
  private _translate: any

  constructor(contextPad: any, popupMenu: any, translate: any) {
    this._popupMenu = popupMenu
    this._translate = translate
    contextPad.registerProvider(this)
  }

  getContextPadEntries(element: any) {
    // Chỉ shape nghiệp vụ (không label, không connection, không root/pool).
    if (element.labelTarget || element.waypoints) return {}
    if (!is(element, 'bpmn:FlowNode')) return {}

    return {
      'khcn.set-color': {
        group: 'edit',
        className: 'khcn-color-icon',
        title: this._translate('Tô màu phần tử'),
        action: {
          click: (event: any) => {
            // Mở popup cạnh vị trí click.
            this._popupMenu.open(element, 'khcn-color-picker', {
              x: event.x ?? event.clientX,
              y: event.y ?? event.clientY,
            })
          },
        },
      },
    }
  }
}

class KhcnColorPickerProvider {
  static $inject = ['popupMenu', 'modeling', 'translate']
  private _modeling: any
  private _translate: any

  constructor(popupMenu: any, modeling: any, translate: any) {
    this._modeling = modeling
    this._translate = translate
    popupMenu.registerProvider('khcn-color-picker', this)
  }

  getPopupMenuEntries(element: any) {
    const entries: Record<string, any> = {}
    for (const c of COLORS) {
      entries[`khcn-color-${c.id}`] = {
        label: this._translate(c.label),
        className: `khcn-color-swatch khcn-color-swatch-${c.id}`,
        action: () => {
          this._modeling.setColor([element], c.fill ? { fill: c.fill, stroke: c.stroke } : null)
        },
      }
    }
    return entries
  }
}

/** Module didi — nạp vào additionalModules của BpmnModeler. */
export function khcnColorModule() {
  return {
    __init__: ['khcnColorContextPad', 'khcnColorPickerProvider'],
    khcnColorContextPad: ['type', KhcnColorContextPad],
    khcnColorPickerProvider: ['type', KhcnColorPickerProvider],
  }
}
