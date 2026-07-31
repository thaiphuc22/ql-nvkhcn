import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, input, signal, untracked } from '@angular/core';

import { componentsOf, idOf, type FormComponent } from '../../core/models/eform';
import { deriveState, submitForm, type FormSubmitResult } from '../../core/models/eform-runtime';
import { FormDynamicListComponent } from './form-dynamic-list';
import { FormFieldComponent } from './form-field';

// Port của webapp/src/components/FormRenderer.tsx (D12 — eForm "B-engine") — render
// một Camunda Form (form-js schema) bằng ng-zorro-antd thay renderer preact nội bộ
// của @bpmn-io/form-js, để eForm đồng bộ giao diện với phần còn lại của app.
// GIỮ NGUYÊN hợp đồng dữ liệu (JSON schema form-js): trường phẳng + validate + submit
// (Lát 1), ẩn/hiện có điều kiện + trường tính toán qua `feelin` (Lát 2), bảng động
// `dynamiclist` (Lát 3). Không dùng `useImperativeHandle`/forwardRef như React — thay
// bằng phương thức public `submit()` gọi qua ViewChild (đúng quy ước
// `BpmnModelerComponent`).

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [NgTemplateOutlet, FormFieldComponent, FormDynamicListComponent],
  templateUrl: './form-renderer.html',
  styleUrl: './form-renderer.scss',
})
export class FormRendererComponent {
  readonly schema = input.required<unknown>();
  readonly data = input<Record<string, unknown>>({});
  readonly readonly = input(false);
  /**
   * Danh mục options động, tra theo `valuesKey` của từng component (cơ chế chuẩn form-js: options
   * lấy từ input data của form chứ không nằm trong schema). Tách khỏi `data` vì `data` là GIÁ TRỊ
   * khởi tạo của biểu mẫu và được ghi đè mỗi lần người dùng nhập — danh mục thì không.
   */
  readonly valueSources = input<Record<string, { value: string; label: string }[]>>({});

  private readonly formData = signal<Record<string, unknown>>({});
  private readonly errors = signal<Record<string, string>>({});

  readonly components = computed<FormComponent[]>(() => componentsOf(this.schema()));
  readonly derived = computed(() => deriveState(this.components(), this.formData()));

  constructor() {
    // Đổi schema → nạp lại dữ liệu khởi tạo, xoá lỗi (giống re-import của renderer cũ).
    effect(() => {
      this.schema();
      untracked(() => {
        this.formData.set({ ...this.data() });
        this.errors.set({});
      });
    });
  }

  isHidden(c: FormComponent): boolean {
    return this.derived().hidden.has(idOf(c));
  }

  isComputed(c: FormComponent): boolean {
    return c.type === 'expression';
  }

  fieldValue(c: FormComponent): unknown {
    if (!c.key) return undefined;
    return this.isComputed(c) ? this.derived().computed[c.key] : this.formData()[c.key];
  }

  fieldError(c: FormComponent): string | undefined {
    return this.errors()[idOf(c)];
  }

  fieldErrorsMap(): Record<string, string> {
    return this.errors();
  }

  listRows(c: FormComponent): Record<string, unknown>[] {
    const v = c.key ? this.formData()[c.key] : undefined;
    return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
  }

  setValue(c: FormComponent, value: unknown): void {
    if (this.readonly() || !c.key) return;
    const key = c.key;
    this.formData.update((prev) => ({ ...prev, [key]: value }));
    this.errors.update((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next = { ...prev };
      let changed = false;
      for (const comp of this.components()) {
        if (comp.key === key && next[idOf(comp)]) {
          delete next[idOf(comp)];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }

  submit(): FormSubmitResult {
    const result = submitForm(this.schema(), this.formData());
    this.errors.set(result.errors);
    return result;
  }
}
