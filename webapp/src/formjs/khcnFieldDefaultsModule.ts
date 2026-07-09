/*
 * Việt hoá NHÃN MẶC ĐỊNH của field mới trong Form Designer.
 *
 * form-js gán nhãn tiếng Anh khi tạo field ('Text area', 'Number', 'Select'…)
 * qua `config.create()` bên trong `fieldFactory.create` — vá DOM (relabel-vi)
 * không đủ vì nhãn này nằm TRONG SCHEMA (xuất JSON vẫn tiếng Anh). Cách sạch:
 * override service `fieldFactory` (didi), thay nhãn mặc định ngay khi tạo.
 *
 * Chỉ thay khi caller KHÔNG truyền `label` riêng → giữ nguyên import schema,
 * copy/paste field (đường đó đi qua create với attrs đầy đủ hoặc isNewField=false).
 * Nhãn tiếng Việt đồng bộ với palette (FieldPalette.tsx) — đổi một nơi thì đổi cả hai.
 */
import { FieldFactory } from '@bpmn-io/form-js'

interface FieldAttrs {
  type?: string
  label?: unknown
  dateLabel?: unknown
}

interface CreatedField {
  type: string
  label?: unknown
  dateLabel?: unknown
}

/** Nhãn mặc định tiếng Việt theo type — khớp wording palette/panel AntD. */
const VI_DEFAULT_LABELS: Record<string, string> = {
  textfield: 'Ô chữ',
  textarea: 'Ô nhiều dòng',
  number: 'Số',
  select: 'Danh sách thả xuống',
  checkbox: 'Hộp kiểm',
  checklist: 'Danh sách kiểm',
  radio: 'Chọn một (radio)',
  taglist: 'Nhãn nhiều chọn',
  filepicker: 'Tải tệp',
  table: 'Bảng dữ liệu',
  group: 'Nhóm',
  dynamiclist: 'Bảng động',
  button: 'Nút',
}

class KhcnFieldFactory extends FieldFactory {
  create(attrs: FieldAttrs, isNewField = true): CreatedField {
    const field = super.create(attrs, isNewField) as CreatedField
    if (!isNewField) return field
    if (attrs.label == null) {
      const vi = VI_DEFAULT_LABELS[field.type]
      if (vi && typeof field.label === 'string') field.label = vi
    }
    // Ngày/giờ không dùng `label` — form-js đặt `dateLabel: 'Date'` cho field mới.
    if (field.type === 'datetime' && attrs.dateLabel == null && field.dateLabel === 'Date') {
      field.dateLabel = 'Ngày'
    }
    return field
  }
}

export const khcnFieldDefaultsModule = {
  fieldFactory: ['type', KhcnFieldFactory],
}
