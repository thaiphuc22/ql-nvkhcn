import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { type FormComponent } from '../../core/models/eform';

// Port của webapp/src/components/formdesign/FieldProperties.tsx (D13 — Lát B). Panel
// thuộc tính AntD tự viết cho Form Designer, ghi ngược qua service `modeling`:
//   edit.emit({field, prop, value})  → modeling.editFormField(field, prop, value)
//   remove.emit(field)               → modeling.removeFormField(...)
// Thuộc tính lồng (validate.*, conditional.hide) GHI CẢ OBJECT CON (đúng cách panel
// native làm). Ô chữ/số commit khi blur (mỗi field 1 lần undo, không mất focus khi
// gõ) — component này được `form-designer.ts` remount mỗi khi đổi field chọn/undo/
// redo (khớp `key={selectedField.id}#{selVersion}` của bản gốc React), nên state cục
// bộ (draft*) chỉ cần khởi tạo MỘT LẦN trong constructor từ `field()` hiện tại.

export interface EditFieldEvent {
  field: FormComponent;
  prop: string;
  value: unknown;
}

const TYPE_LABELS: Record<string, string> = {
  default: 'Biểu mẫu',
  textfield: 'Ô chữ',
  textarea: 'Ô nhiều dòng',
  number: 'Số',
  datetime: 'Ngày / giờ',
  expression: 'Biểu thức',
  filepicker: 'Tải tệp',
  checkbox: 'Hộp kiểm',
  checklist: 'Danh sách kiểm',
  radio: 'Radio',
  select: 'Thả xuống',
  taglist: 'Nhãn nhiều chọn',
  text: 'Văn bản tĩnh',
  html: 'HTML',
  image: 'Hình ảnh',
  table: 'Bảng dữ liệu',
  separator: 'Đường kẻ',
  spacer: 'Khoảng trống',
  group: 'Nhóm',
  dynamiclist: 'Bảng động',
  button: 'Nút',
};

const KEYED = new Set(['textfield', 'textarea', 'number', 'datetime', 'expression', 'filepicker', 'checkbox', 'checklist', 'radio', 'select', 'taglist', 'dynamiclist']);
const REQUIREABLE = new Set(['textfield', 'textarea', 'number', 'datetime', 'filepicker', 'checkbox', 'checklist', 'radio', 'select', 'taglist', 'dynamiclist']);
const OPTIONED = new Set(['select', 'radio', 'checklist', 'taglist']);
const TEXTLEN = new Set(['textfield', 'textarea']);
// Có nhãn hiển thị nhưng KHÔNG có key dữ liệu riêng (khớp `LABELED_NON_INPUTS` của
// @bpmn-io/form-js-editor, trừ `group`/`dynamiclist` đã có mục riêng ở trên).
const LABEL_ONLY = new Set(['button', 'table']);

function emptyToUndef(v: string): string | undefined {
  return v.trim() === '' ? undefined : v;
}
function numOr(v: unknown): number | null {
  return typeof v === 'number' ? v : v == null ? null : Number(v);
}

@Component({
  selector: 'app-form-field-properties',
  standalone: true,
  imports: [FormsModule, NzButtonModule, NzDividerModule, NzEmptyModule, NzIconModule, NzInputModule, NzInputNumberModule, NzPopconfirmModule, NzRadioModule, NzSwitchModule, NzTagModule],
  templateUrl: './form-field-properties.html',
  styleUrl: './form-field-properties.scss',
})
export class FormFieldPropertiesComponent {
  readonly field = input<FormComponent | null>(null);
  readonly edit = output<EditFieldEvent>();
  readonly remove = output<FormComponent>();

  readonly typeLabel = computed(() => {
    const t = this.field()?.type ?? '';
    return (TYPE_LABELS as Record<string, string | undefined>)[t] ?? t;
  });
  readonly isRoot = computed(() => this.field()?.type === 'default');
  readonly isKeyed = computed(() => KEYED.has(this.field()?.type ?? ''));
  readonly isGroup = computed(() => this.field()?.type === 'group');
  readonly isTextOrHtml = computed(() => this.field()?.type === 'text' || this.field()?.type === 'html');
  readonly isExpression = computed(() => this.field()?.type === 'expression');
  readonly isRequireable = computed(() => REQUIREABLE.has(this.field()?.type ?? ''));
  readonly isNumber = computed(() => this.field()?.type === 'number');
  readonly isTextLen = computed(() => TEXTLEN.has(this.field()?.type ?? ''));
  readonly isOptioned = computed(() => OPTIONED.has(this.field()?.type ?? ''));
  readonly isLabelOnly = computed(() => LABEL_ONLY.has(this.field()?.type ?? ''));
  readonly isImage = computed(() => this.field()?.type === 'image');
  readonly isDatetime = computed(() => this.field()?.type === 'datetime');

  // Draft locale — instance này được remount mỗi lần đổi field chọn (key ở
  // form-designer.ts), nên khởi tạo 1 lần từ field() hiện tại là đủ, không cần effect.
  readonly draftKey = signal(this.field()?.key ?? '');
  readonly draftLabel = signal(this.field()?.label ?? '');
  readonly draftDescription = signal(this.field()?.description ?? '');
  readonly draftText = signal(this.field()?.text ?? '');
  readonly draftSource = signal(this.field()?.source ?? '');
  readonly draftExpression = signal(this.field()?.expression ?? '');
  readonly draftHide = signal(this.field()?.conditional?.hide ?? '');
  readonly draftMin = signal(numOr(this.field()?.validate?.min));
  readonly draftMax = signal(numOr(this.field()?.validate?.max));
  readonly draftMinLength = signal(numOr(this.field()?.validate?.minLength));
  readonly draftMaxLength = signal(numOr(this.field()?.validate?.maxLength));
  readonly draftOptions = signal<{ value: string; label: string }[]>(
    Array.isArray(this.field()?.values) ? this.field()!.values!.map((o) => ({ ...o })) : [],
  );

  emitEdit(prop: string, value: unknown): void {
    const f = this.field();
    if (f) this.edit.emit({ field: f, prop, value });
  }

  commitKey(): void {
    this.emitEdit('key', this.draftKey());
  }
  commitLabel(): void {
    this.emitEdit('label', emptyToUndef(this.draftLabel()));
  }
  commitDescription(): void {
    this.emitEdit('description', emptyToUndef(this.draftDescription()));
  }
  commitText(): void {
    this.emitEdit('text', this.draftText());
  }
  commitSource(): void {
    this.emitEdit('source', emptyToUndef(this.draftSource()));
  }
  commitSubtype(value: string): void {
    this.emitEdit('subtype', value);
  }
  commitExpression(): void {
    this.emitEdit('expression', this.draftExpression());
  }
  commitHide(): void {
    const v = this.draftHide();
    this.emitEdit('conditional', v && v.trim() ? { ...(this.field()?.conditional ?? {}), hide: v } : undefined);
  }
  setValidate(key: string, value: unknown): void {
    const next: Record<string, unknown> = { ...(this.field()?.validate ?? {}) };
    if (value === undefined) delete next[key];
    else next[key] = value;
    this.emitEdit('validate', Object.keys(next).length ? next : undefined);
  }
  commitMin(): void {
    this.setValidate('min', this.draftMin() ?? undefined);
  }
  commitMax(): void {
    this.setValidate('max', this.draftMax() ?? undefined);
  }
  commitMinLength(): void {
    this.setValidate('minLength', this.draftMinLength() ?? undefined);
  }
  commitMaxLength(): void {
    this.setValidate('maxLength', this.draftMaxLength() ?? undefined);
  }
  toggleRequired(checked: boolean): void {
    this.setValidate('required', checked || undefined);
  }
  toggleShowOutline(checked: boolean): void {
    this.emitEdit('showOutline', checked || undefined);
  }

  setOptionCell(i: number, k: 'value' | 'label', val: string): void {
    const opts = this.draftOptions();
    if (opts[i][k] === val) return;
    const next = opts.map((o, idx) => (idx === i ? { ...o, [k]: val } : o));
    this.draftOptions.set(next);
    this.emitEdit('values', next);
  }
  addOption(): void {
    const opts = this.draftOptions();
    const next = [...opts, { value: `value${opts.length + 1}`, label: `Tùy chọn ${opts.length + 1}` }];
    this.draftOptions.set(next);
    this.emitEdit('values', next);
  }
  removeOption(i: number): void {
    const next = this.draftOptions().filter((_, idx) => idx !== i);
    this.draftOptions.set(next);
    this.emitEdit('values', next);
  }

  confirmRemove(): void {
    const f = this.field();
    if (f) this.remove.emit(f);
  }
}
