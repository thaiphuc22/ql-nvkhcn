import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

import { type FormComponent, type FormFieldValidate } from '../../core/models/eform';
import { parseFormMarkdown } from '../../core/models/eform-runtime';

// Port của phần `ComponentField` trong webapp/src/components/FormRenderer.tsx (D12
// eForm "B-engine") — render MỘT component form-js bằng ng-zorro-antd. Component lá,
// dùng cả ở cấp gốc (FormRendererComponent) lẫn trong mỗi dòng dynamiclist
// (FormDynamicListComponent).

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    FormsModule,
    NzAlertModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzDividerModule,
    NzInputModule,
    NzInputNumberModule,
    NzRadioModule,
    NzSelectModule,
    NzTimePickerModule,
  ],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormFieldComponent {
  readonly comp = input.required<FormComponent>();
  readonly value = input<unknown>(undefined);
  readonly error = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly valueChange = output<unknown>();

  readonly options = computed(() => (this.comp().values ?? []).map((o) => ({ label: o.label, value: o.value })));
  readonly required = computed(() => !!(this.comp().validate as FormFieldValidate | undefined)?.required);
  readonly markdownBlocks = computed(() => parseFormMarkdown(this.comp().text ?? ''));
  /** checkbox tự chứa nhãn (bên phải ô tick) → không lặp label phía trên. */
  readonly showLabelOnTop = computed(() => this.comp().type !== 'checkbox');

  readonly textValue = computed(() => (this.value() as string | undefined) ?? '');
  readonly numberValue = computed(() => this.value() as number | null);
  readonly boolValue = computed(() => !!this.value());
  readonly listValue = computed(() => (Array.isArray(this.value()) ? (this.value() as string[]) : []));
  readonly dateValue = computed(() => {
    const v = this.value();
    return typeof v === 'string' && v ? new Date(v) : null;
  });
  readonly expressionDisplay = computed(() => {
    const v = this.value();
    return v == null ? '' : String(v);
  });

  emit(v: unknown): void {
    if (this.disabled()) return;
    this.valueChange.emit(v);
  }

  onDateChange(d: Date | null): void {
    this.emit(d ? d.toISOString() : undefined);
  }

  toggleListValue(val: string, checked: boolean): void {
    const cur = this.listValue();
    this.emit(checked ? [...cur, val] : cur.filter((v) => v !== val));
  }
}
