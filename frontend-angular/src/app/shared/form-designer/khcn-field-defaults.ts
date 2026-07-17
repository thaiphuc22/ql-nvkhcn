/*
 * Việt hoá NHÃN MẶC ĐỊNH của field mới trong Form Designer.
 *
 * form-js gán nhãn tiếng Anh khi tạo field ('Text area', 'Number', 'Select'…)
 * qua `config.create()` bên trong `fieldFactory.create` — vá DOM không đủ vì nhãn
 * này nằm TRONG SCHEMA (xuất JSON vẫn tiếng Anh). Cách sạch: override service
 * `fieldFactory` (didi), thay nhãn mặc định ngay khi tạo.
 *
 * Chỉ thay khi caller KHÔNG truyền `label` riêng → giữ nguyên import schema,
 * copy/paste field. Nhãn tiếng Việt đồng bộ với palette (`form-field-palette.ts`).
 * Port 1:1 từ `webapp/src/formjs/khcnFieldDefaultsModule.ts`.
 */
import { FieldFactory } from '@bpmn-io/form-js';

interface FieldAttrs {
  type?: string;
  label?: unknown;
  dateLabel?: unknown;
}

interface CreatedField {
  type: string;
  label?: unknown;
  dateLabel?: unknown;
}

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
};

class KhcnFieldFactory extends FieldFactory {
  override create(attrs: FieldAttrs, isNewField = true): CreatedField {
    const field = super.create(attrs, isNewField) as CreatedField;
    if (!isNewField) return field;
    if (attrs.label == null) {
      const vi = VI_DEFAULT_LABELS[field.type];
      if (vi && typeof field.label === 'string') field.label = vi;
    }
    if (field.type === 'datetime' && attrs.dateLabel == null && field.dateLabel === 'Date') {
      field.dateLabel = 'Ngày';
    }
    return field;
  }
}

export const khcnFieldDefaultsModule = {
  fieldFactory: ['type', KhcnFieldFactory],
};
