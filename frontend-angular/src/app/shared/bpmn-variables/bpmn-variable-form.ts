import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { BpmnVariableUsage, extractVariableUsages, parseBpmnModel } from './bpmn-variable-usage';

/**
 * Form biến "thông minh": parse BPMN XML (Lát 1, `bpmn-variable-usage.ts`) để hiện field có nhãn
 * tiếng Việt thay ô JSON thô, dùng chung cho "biến khởi tạo" (không truyền `focusElementId`) và
 * "biến hoàn tất task" (`focusElementId` = id task đang hoàn tất, form tự dò gateway ngay sau đó).
 *
 * Input `initialJson` chỉ là giá trị khởi tạo một lần (component không tự đồng bộ ngược mỗi khi
 * cha đổi `initialJson` sau khi đã mount) — nơi gọi coi component này như nguồn chân lý của giá trị
 * biến sau khi mount, tương tự cách `variablesText` signal hiện có hoạt động.
 */
@Component({
  selector: 'app-bpmn-variable-form',
  imports: [
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzSwitchModule,
    NzTypographyModule,
  ],
  templateUrl: './bpmn-variable-form.html',
  styleUrl: './bpmn-variable-form.scss',
})
export class BpmnVariableFormComponent {
  readonly xml = input.required<string>();
  readonly focusElementId = input<string | null>(null);
  readonly initialJson = input<string>('{}');

  /** Phát ra mỗi khi giá trị biến thay đổi — luôn là JSON text (object ở chế độ form, text thô ở chế độ nâng cao). */
  readonly jsonChange = output<string>();

  private readonly model = computed(() => parseBpmnModel(this.xml()));
  private readonly allUsages = computed(() => extractVariableUsages(this.model()));
  private readonly focusedUsages = computed(() => {
    const focus = this.focusElementId();
    return focus ? extractVariableUsages(this.model(), focus) : this.allUsages();
  });

  readonly expanded = signal(false);
  readonly usages = computed<BpmnVariableUsage[]>(() =>
    this.expanded() || !this.focusElementId() ? this.allUsages() : this.focusedUsages(),
  );
  readonly hiddenCount = computed(() => Math.max(0, this.allUsages().length - this.focusedUsages().length));
  readonly noVariablesDetected = computed(() => this.allUsages().length === 0);

  readonly values = signal<Record<string, unknown>>(this.parseInitial());
  readonly rawText = signal(this.initialJson());
  /**
   * `null` = chưa toggle thủ công, dùng mặc định suy từ `noVariablesDetected()`. Không thể seed
   * signal này bằng `noVariablesDetected()` ngay lúc khởi tạo field (như trước) vì lúc đó input
   * required `xml` chưa được Angular gán giá trị — đọc sớm gây NG0950 và crash cả nhánh
   * template chứa component này (nút "Bắt đầu chạy thử" biến mất không rõ lý do).
   */
  private readonly rawModeOverride = signal<boolean | null>(null);
  readonly rawMode = computed(() => this.rawModeOverride() ?? this.noVariablesDetected());

  readonly extraEntries = computed(() => {
    const recognized = new Set(this.usages().map((u) => u.name));
    return Object.entries(this.values()).filter(([key]) => !recognized.has(key));
  });

  private parseInitial(): Record<string, unknown> {
    try {
      const parsed = JSON.parse(this.initialJson() || '{}');
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  usageHint(usage: BpmnVariableUsage): string {
    return usage.locations
      .map((loc) => `${loc.gatewayName ?? loc.gatewayId} (${loc.condition})`)
      .join('; ');
  }

  boolValue(name: string): boolean {
    return this.values()[name] === true;
  }

  numberValue(name: string): number | null {
    const v = this.values()[name];
    return typeof v === 'number' ? v : null;
  }

  stringValue(name: string): string | null {
    const v = this.values()[name];
    if (v === undefined || v === null) return null;
    return typeof v === 'string' ? v : String(v);
  }

  setValue(name: string, value: unknown): void {
    this.values.update((v) => ({ ...v, [name]: value }));
    this.emitStructured();
  }

  private emitStructured(): void {
    this.jsonChange.emit(JSON.stringify(this.values()));
  }

  expandAll(): void {
    this.expanded.set(true);
  }

  toggleMode(): void {
    if (this.rawMode()) {
      try {
        const parsed = JSON.parse(this.rawText() || '{}');
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          this.values.set(parsed);
        }
      } catch {
        // Giữ nguyên values() hiện có nếu JSON thô đang gõ dở không hợp lệ — không mất dữ liệu.
      }
      this.rawModeOverride.set(false);
    } else {
      this.rawText.set(JSON.stringify(this.values(), null, 2));
      this.rawModeOverride.set(true);
    }
  }

  onRawTextChange(text: string): void {
    this.rawText.set(text);
    this.jsonChange.emit(text);
  }
}
