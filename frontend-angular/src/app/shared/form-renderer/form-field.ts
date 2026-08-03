import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import { wrapCSSStyles } from '@bpmn-io/form-js';
import DOMPurify from 'dompurify';
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly comp = input.required<FormComponent>();
  readonly value = input<unknown>(undefined);
  readonly error = input<string | undefined>(undefined);
  readonly disabled = input(false);
  /**
   * Options động theo `valuesKey` (xem `FormComponent.valuesKey`) — do component cha bơm xuống từ
   * input data của form, vì trường lá không biết gì về dữ liệu ngoài giá trị của chính nó.
   */
  readonly valueSources = input<Record<string, { value: string; label: string }[]>>({});
  readonly valueChange = output<unknown>();

  readonly options = computed(() => {
    const c = this.comp();
    const source = c.values ?? (c.valuesKey ? this.valueSources()[c.valuesKey] : undefined) ?? [];
    return source.map((o) => ({ label: o.label, value: o.value }));
  });
  readonly required = computed(() => !!(this.comp().validate as FormFieldValidate | undefined)?.required);
  readonly markdownBlocks = computed(() => parseFormMarkdown(this.comp().text ?? ''));

  /** Class scope riêng cho từng field `html` — dùng làm tiền tố khi khoanh vùng `<style>` bằng
   * `wrapCSSStyles`, để style tự định nghĩa trong 1 khối HTML không rò sang field khác. */
  readonly htmlScopeClass = computed(() => `ff-html-scope-${(this.comp().id ?? 'x').replace(/[^a-zA-Z0-9_-]/g, '_')}`);

  /**
   * Nội dung khối HTML tĩnh (`type: 'html'`) đã qua sanitize. Angular sanitizer mặc định của
   * `[innerHTML]` xoá cả thẻ `<style>` lẫn thuộc tính `style="..."` (không nằm trong whitelist
   * thẻ/attr riêng của Angular) — đó là lý do style tự định nghĩa trong HTML không bao giờ áp dụng
   * được dù nội dung đã đúng field `content`. Tự sanitize bằng `DOMPurify` với đúng cấu hình
   * `@bpmn-io/form-js-viewer` dùng cho field `html` thật (`FORCE_BODY: true, FORBID_TAGS: []` — giữ
   * thẻ `<style>`, vẫn chặn `<script>`/event handler như `onerror`), rồi khoanh vùng bằng
   * `wrapCSSStyles` (cùng helper form-js dùng, export public từ `@bpmn-io/form-js`) để CSS không rò
   * ra field khác — KHÔNG bypass thẳng nội dung thô, tránh XSS.
   */
  readonly sanitizedHtml = computed<SafeHtml>(() => {
    const cleaned = DOMPurify.sanitize(this.comp().content ?? '', { FORCE_BODY: true, FORBID_TAGS: [] });
    const wrapper = document.createElement('div');
    wrapper.innerHTML = cleaned;
    wrapCSSStyles(wrapper, `.${this.htmlScopeClass()}`);
    return this.sanitizer.bypassSecurityTrustHtml(wrapper.innerHTML);
  });
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
