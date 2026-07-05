/*
 * Chế độ Đơn giản cho FORM designer (mirror src/bpmn/khcnSimplePanelModule.ts):
 * lọc + Việt hoá NHÓM thuộc tính của properties panel form-js.
 *
 * - Việt hoá label nhóm ngay trong DATA (sạch hơn vá DOM — relabel-vi chỉ còn
 *   lo entry label/placeholder).
 * - Đơn giản (mặc định, cho nghiệp vụ): chỉ giữ nhóm Chung/Tùy chọn/Ràng buộc/
 *   Điều kiện/Cột bảng; ẩn Giao diện/Bố cục/Tuần tự hoá/Bảo mật/Tuỳ biến.
 * - Nâng cao: trả lại đầy đủ (label vẫn tiếng Việt).
 *
 * ID nhóm đối chiếu form-js-editor 1.23 dist (PropertiesProvider mặc định) —
 * kiểm lại khi nâng version gói.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

const GROUP_LABEL_VI: Record<string, string> = {
  general: 'Chung',
  valuesSource: 'Nguồn tùy chọn',
  staticOptions: 'Danh sách cố định',
  dynamicOptions: 'Tùy chọn động',
  optionsExpression: 'Tùy chọn theo biểu thức',
  validation: 'Ràng buộc nhập',
  constraints: 'Giới hạn giá trị',
  condition: 'Điều kiện hiển thị',
  appearance: 'Giao diện',
  layout: 'Bố cục',
  serialization: 'Tuần tự hoá',
  securityAttributes: 'Thuộc tính bảo mật',
  'custom-values': 'Thuộc tính tuỳ biến',
  headersSource: 'Nguồn cột (bảng)',
}

/** Nhóm giữ ở chế độ Đơn giản. form-js đã tự ẩn nhóm không áp dụng cho loại field. */
const SIMPLE_KEEP = new Set([
  'general',
  'valuesSource',
  'staticOptions',
  'dynamicOptions',
  'optionsExpression',
  'validation',
  'constraints',
  'condition',
  'headersSource',
])

class KhcnFormSimplePanelFilter {
  private _isAdvanced: () => boolean

  constructor(propertiesPanel: any, isAdvanced: () => boolean) {
    this._isAdvanced = isAdvanced
    // CHÚ Ý form-js 1.23: registerProvider(provider, priority) — thứ tự tham số
    // NGƯỢC với bio-properties-panel bên bpmn-js (priority, provider).
    // Priority 100 < mặc định 1000 → updater của ta chạy CUỐI, thấy đủ groups.
    propertiesPanel.registerProvider(this, 100)
  }

  // Contract form-js 1.23: getGroups(field, editField) => (groups) => groups'
  getGroups(_field: any, _editField: any) {
    return (groups: any[]) => {
      for (const g of groups) {
        const vi = GROUP_LABEL_VI[String(g.id)]
        if (vi) g.label = vi
      }
      if (this._isAdvanced()) return groups
      return groups.filter((g) => SIMPLE_KEEP.has(String(g.id)))
    }
  }
}

/** Module didi — callback đọc trạng thái "Nâng cao" từ React ref (không rebuild editor). */
export function khcnFormSimplePanelModule(isAdvanced: () => boolean) {
  const factory = (propertiesPanel: any) => new KhcnFormSimplePanelFilter(propertiesPanel, isAdvanced)
  factory.$inject = ['propertiesPanel']
  return {
    __init__: ['khcnFormSimplePanelFilter'],
    khcnFormSimplePanelFilter: ['factory', factory],
  }
}
