import { Component, computed, input, output } from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';

import { idOf, type FormComponent } from '../../core/models/eform';
import { deriveState, rowErrKey } from '../../core/models/eform-runtime';
import { FormFieldComponent } from './form-field';

// Port của `DynamicList` trong webapp/src/components/FormRenderer.tsx — bảng động
// (form-js `dynamiclist`): thêm/xoá dòng, mỗi dòng render đệ quy các component con
// qua `FormFieldComponent` (leaf) với context = { ...gốc, ...dòng } (dòng ưu tiên —
// quyết R2 của D12). CHỈ hỗ trợ 1 cấp `dynamiclist` (khớp hành vi bản gốc: dòng
// không tự render lồng dynamiclist con, dù model dữ liệu cho phép).

interface RowView {
  index: number;
  row: Record<string, unknown>;
  computed: Record<string, unknown>;
  hidden: Set<string>;
}

@Component({
  selector: 'app-form-dynamic-list',
  standalone: true,
  imports: [NzButtonModule, FormFieldComponent],
  templateUrl: './form-dynamic-list.html',
  styleUrl: './form-dynamic-list.scss',
})
export class FormDynamicListComponent {
  readonly comp = input.required<FormComponent>();
  readonly rows = input<Record<string, unknown>[]>([]);
  readonly rootCtx = input<Record<string, unknown>>({});
  readonly errors = input<Record<string, string>>({});
  readonly errPrefix = input('');
  readonly rowsChange = output<Record<string, unknown>[]>();

  readonly children = computed(() => this.comp().components ?? []);
  readonly required = computed(() => !!this.comp().validate?.required);
  readonly listErrorKey = computed(() => this.errPrefix() + idOf(this.comp()));
  readonly listError = computed(() => this.errors()[this.listErrorKey()]);

  readonly rowViews = computed<RowView[]>(() =>
    this.rows().map((row, index) => {
      const { computed: comp, hidden } = deriveState(this.children(), row, this.rootCtx());
      return { index, row, computed: comp, hidden };
    }),
  );

  fieldValue(view: RowView, child: FormComponent): unknown {
    if (!child.key) return undefined;
    return child.type === 'expression' ? view.computed[child.key] : view.row[child.key];
  }

  isComputed(child: FormComponent): boolean {
    return child.type === 'expression';
  }

  fieldError(view: RowView, child: FormComponent): string | undefined {
    return this.errors()[this.errPrefix() + rowErrKey(idOf(this.comp()), view.index, idOf(child))];
  }

  updateCell(index: number, key: string, value: unknown): void {
    this.rowsChange.emit(this.rows().map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  addRow(): void {
    this.rowsChange.emit([...this.rows(), {}]);
  }

  removeRow(index: number): void {
    this.rowsChange.emit(this.rows().filter((_, i) => i !== index));
  }
}
