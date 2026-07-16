import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import { emptyValue, newDecisionRow } from '../../core/dmn/decision-table';
import {
  BUSINESS_RULE_CATEGORY_LABEL,
  BUSINESS_RULE_STATUS_META,
  BusinessRule,
  DecisionColumn,
  DecisionCondition,
  DecisionOperator,
  DecisionTableDefinition,
  DmnDecisionEvaluationResponse,
} from '../../core/models/business-rule';
import { BusinessRuleService } from '../../core/services/business-rule.service';

const OPERATOR_LABELS: Record<DecisionOperator, string> = {
  ANY: 'Bất kỳ',
  EQ: 'Bằng',
  GTE: 'Lớn hơn hoặc bằng',
  GT: 'Lớn hơn',
  LTE: 'Nhỏ hơn hoặc bằng',
  LT: 'Nhỏ hơn',
  BETWEEN: 'Trong khoảng',
};

@Component({
  selector: 'app-business-rule-detail',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzPageHeaderModule,
    NzResultModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
    NzTagModule,
    NzTimelineModule,
    NzTooltipModule,
    NzTypographyModule,
  ],
  templateUrl: './business-rule-detail.html',
  styleUrl: './business-rule-detail.scss',
})
export class BusinessRuleDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(BusinessRuleService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly categoryLabels = BUSINESS_RULE_CATEGORY_LABEL;
  readonly statusMeta = BUSINESS_RULE_STATUS_META;
  readonly operatorLabels = OPERATOR_LABELS;
  readonly rule = signal<BusinessRule | null>(null);
  readonly draft = signal<DecisionTableDefinition | null>(null);
  readonly baseDefinition = signal('');
  readonly saveNote = signal('');
  readonly testInputs = signal<Record<string, unknown>>({});
  readonly testResult = signal<DmnDecisionEvaluationResponse | null>(null);
  readonly evaluating = signal(false);
  readonly evaluationError = signal<string | null>(null);
  readonly activeTab = signal(0);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly dirty = computed(() => {
    const draft = this.draft();
    return !!draft && JSON.stringify(draft) !== this.baseDefinition();
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.store.get(id).subscribe({
      next: (rule) => {
        const definition = rule.definition ?? this.starterDefinition(rule.name);
        this.rule.set({ ...rule, definition });
        this.loadDefinition(definition);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Không tải được luật từ backend.');
        this.loading.set(false);
      },
    });
  }

  back(): void {
    this.router.navigate(['/quan-ly-luat']);
  }

  operatorOptions(column: DecisionColumn): DecisionOperator[] {
    return column.type === 'number'
      ? ['ANY', 'EQ', 'GTE', 'GT', 'LTE', 'LT', 'BETWEEN']
      : ['ANY', 'EQ'];
  }

  updateTableName(name: string): void {
    this.change((draft) => ({ ...draft, name }));
  }

  updateCondition(rowIndex: number, columnIndex: number, patch: Partial<DecisionCondition>): void {
    this.change((draft) => ({
      ...draft,
      rows: draft.rows.map((row, ri) =>
        ri !== rowIndex
          ? row
          : {
              ...row,
              conditions: row.conditions.map((condition, ci) =>
                ci === columnIndex ? { ...condition, ...patch } : condition,
              ),
            },
      ),
    }));
  }

  changeOperator(rowIndex: number, columnIndex: number, operator: DecisionOperator): void {
    const column = this.draft()!.inputs[columnIndex];
    this.updateCondition(rowIndex, columnIndex, {
      operator,
      value: operator === 'ANY' ? null : emptyValue(column),
      valueTo: operator === 'BETWEEN' ? 0 : undefined,
    });
  }

  updateOutput(rowIndex: number, columnIndex: number, value: unknown): void {
    this.change((draft) => ({
      ...draft,
      rows: draft.rows.map((row, ri) =>
        ri !== rowIndex
          ? row
          : {
              ...row,
              outputs: row.outputs.map((output, ci) =>
                ci === columnIndex ? (value as string | number | boolean | null) : output,
              ),
            },
      ),
    }));
  }

  addRow(): void {
    this.change((draft) => ({ ...draft, rows: [...draft.rows, newDecisionRow(draft)] }));
  }

  duplicateRow(index: number): void {
    this.change((draft) => {
      const copy = structuredClone(draft.rows[index]);
      copy.id = `R${Date.now()}`;
      const rows = [...draft.rows];
      rows.splice(index + 1, 0, copy);
      return { ...draft, rows };
    });
  }

  removeRow(index: number): void {
    if ((this.draft()?.rows.length ?? 0) <= 1) {
      this.message.warning('Bảng quyết định phải có ít nhất một dòng luật.');
      return;
    }
    this.change((draft) => ({ ...draft, rows: draft.rows.filter((_, i) => i !== index) }));
  }

  resetDraft(): void {
    const definition = this.rule()?.definition;
    if (definition) this.loadDefinition(definition);
    this.message.info('Đã hoàn tác các thay đổi chưa lưu.');
  }

  save(): void {
    const rule = this.rule();
    const definition = this.draft();
    if (!rule || !definition || !this.dirty()) return;
    this.saving.set(true);
    this.store
      .saveVersion(rule.id, definition, this.saveNote(), this.actor(), rule.version)
      .subscribe({
        next: (saved) => {
          this.rule.set(saved);
          this.loadDefinition(saved.definition!);
          this.saveNote.set('');
          this.saving.set(false);
          this.message.success(`Đã lưu phiên bản v${saved.version}.`);
        },
        error: (error) => {
          this.saving.set(false);
          this.message.error(error?.error?.message ?? 'Không lưu được phiên bản DMN.');
        },
      });
  }

  setTestInput(variable: string, value: unknown): void {
    this.testInputs.update((inputs) => ({ ...inputs, [variable]: value }));
    this.testResult.set(null);
    this.evaluationError.set(null);
  }

  runTest(): void {
    const rule = this.rule();
    if (!rule || this.evaluating()) return;
    this.evaluating.set(true);
    this.evaluationError.set(null);
    this.testResult.set(null);
    this.store.evaluate(rule.id, this.testInputs()).subscribe({
      next: (result) => {
        this.testResult.set(result);
        this.evaluating.set(false);
      },
      error: (error) => {
        const details = error?.error?.errors?.filter(Boolean)?.join(' · ');
        this.evaluationError.set(details || error?.error?.message || 'Không evaluate được decision trên Camunda.');
        this.evaluating.set(false);
      },
    });
  }

  useVersion(version: number): void {
    const rule = this.rule();
    if (!rule) return;
    this.store.getVersionArtifact(rule.id, version).subscribe({
      next: (snapshot) => {
        const copy = structuredClone(snapshot.definition!);
        this.draft.set(copy);
        this.testInputs.set(
          Object.fromEntries(copy.inputs.map((column) => [column.variable, emptyValue(column)])),
        );
        this.testResult.set(null);
        this.activeTab.set(0);
        this.message.info(
          `Đã nạp nội dung v${version} vào bản soạn. Bấm Lưu để tạo phiên bản mới.`,
        );
      },
      error: (error) =>
        this.message.error(error?.error?.message ?? `Không tải được phiên bản v${version}.`),
    });
  }

  private change(mapper: (draft: DecisionTableDefinition) => DecisionTableDefinition): void {
    const current = this.draft();
    if (current) this.draft.set(mapper(current));
    this.testResult.set(null);
  }

  private loadDefinition(definition: DecisionTableDefinition): void {
    const copy = structuredClone(definition);
    this.draft.set(copy);
    this.baseDefinition.set(JSON.stringify(copy));
    this.testInputs.set(
      Object.fromEntries(copy.inputs.map((column) => [column.variable, emptyValue(column)])),
    );
    this.testResult.set(null);
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng';
  }

  private starterDefinition(name: string): DecisionTableDefinition {
    return {
      id: 'decision-main',
      name,
      hitPolicy: 'FIRST',
      inputs: [{ id: 'input-1', label: 'Giá trị đầu vào', variable: 'dauVao', type: 'number' }],
      outputs: [{ id: 'output-1', label: 'Kết quả', variable: 'ketQua', type: 'string' }],
      rows: [
        {
          id: 'R1',
          conditions: [{ operator: 'ANY', value: null }],
          outputs: ['MAC_DINH'],
        },
      ],
    };
  }
}
