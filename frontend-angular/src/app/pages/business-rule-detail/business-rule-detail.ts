import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
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
import { rootInputColumns } from '../../core/dmn/dmn-xml';
import {
  BUSINESS_RULE_CATEGORY_LABEL,
  BUSINESS_RULE_STATUS_META,
  BusinessRule,
  DecisionColumn,
  DecisionCondition,
  DecisionGrid,
  DecisionGridDecision,
  DecisionOperator,
  DecisionValueType,
  DmnDecisionEvaluationResponse,
  DmnHitPolicy,
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

const HIT_POLICY_OPTIONS: { value: DmnHitPolicy; label: string }[] = [
  { value: 'FIRST', label: 'Dòng khớp đầu tiên' },
  { value: 'UNIQUE', label: 'Duy nhất 1 dòng khớp' },
  { value: 'COLLECT', label: 'Gộp mọi dòng khớp' },
];

const TYPE_OPTIONS: { value: DecisionValueType; label: string }[] = [
  { value: 'number', label: 'Số' },
  { value: 'string', label: 'Chữ' },
  { value: 'boolean', label: 'Đúng/Sai' },
];

/** Nguồn dữ liệu khả dụng cho một cột NẾU: kết quả bảng khác, hoặc đầu vào dùng chung. */
export interface DecisionFieldOption {
  variable: string;
  type: DecisionValueType;
  typeRef?: string;
  /** Nhãn ngắn đặt lên đầu cột khi chọn nguồn này. */
  columnLabel: string;
  /** Nhãn dài hiển thị trong dropdown chọn nguồn. */
  optionLabel: string;
  options?: string[];
}

/** Giá trị sentinel cho lựa chọn "đầu vào riêng" trong dropdown nguồn. */
export const OWN_INPUT_SOURCE = '__own__';

let uidSequence = 0;
function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${(uidSequence++).toString(36)}`;
}

function defaultCondition(): DecisionCondition {
  return { operator: 'ANY', value: null };
}

function newColumn(kind: 'in' | 'out', type: DecisionValueType, label: string): DecisionColumn {
  return { id: uid('col'), label, variable: uid(kind === 'in' ? 'bien' : 'kq'), type, typeRef: type };
}

@Component({
  selector: 'app-business-rule-detail',
  imports: [
    FormsModule,
    KeyValuePipe,
    NzAlertModule,
    NzButtonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzPageHeaderModule,
    NzPopconfirmModule,
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
  readonly hitPolicyOptions = HIT_POLICY_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;
  readonly ownInputSource = OWN_INPUT_SOURCE;

  readonly rule = signal<BusinessRule | null>(null);
  readonly draft = signal<DecisionGrid | null>(null);
  readonly baseDefinition = signal('');
  readonly saveNote = signal('');
  readonly showColumnConfig = signal(false);
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

  /** Cột đầu vào gốc của cả DRD — bộ dữ liệu cần nhập khi chạy thử. */
  readonly testColumns = computed(() => {
    const draft = this.draft();
    return draft ? rootInputColumns(draft) : [];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.store.get(id).subscribe({
      next: (rule) => {
        const definition = rule.definition?.length
          ? rule.definition
          : [this.starterDecision(rule.name)];
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

  toggleColumnConfig(): void {
    this.showColumnConfig.update((shown) => !shown);
  }

  // ── Thao tác cấp bảng ─────────────────────────────────────────────────────

  addDecision(): void {
    this.change((grid) => [
      ...grid,
      this.starterDecision(
        grid.length === 0 ? (this.rule()?.name ?? 'Quyết định') : `Bảng ${grid.length + 1}`,
      ),
    ]);
  }

  removeDecision(decisionIndex: number): void {
    this.change((grid) => grid.filter((_, index) => index !== decisionIndex));
  }

  updateDecisionName(decisionIndex: number, name: string): void {
    this.patchDecision(decisionIndex, (decision) => ({ ...decision, name }));
  }

  updateHitPolicy(decisionIndex: number, hitPolicy: DmnHitPolicy): void {
    this.patchDecision(decisionIndex, (decision) => ({ ...decision, hitPolicy }));
  }

  /**
   * Nguồn khả dụng cho cột NẾU của bảng `decisionIndex`: kết quả của các bảng khác (chọn vào
   * sẽ trùng tên biến ⇒ serializer tự suy `requiredDecision`) và các đầu vào gốc dùng chung.
   */
  fieldsForDecision(decisionIndex: number): DecisionFieldOption[] {
    const grid = this.draft() ?? [];
    const produced = new Set<string>();
    for (const decision of grid) {
      for (const output of decision.outputs) produced.add(output.variable);
    }

    const seen = new Set<string>();
    const fields: DecisionFieldOption[] = [];
    grid.forEach((decision, index) => {
      if (index === decisionIndex) return;
      decision.outputs.forEach((output, outputIndex) => {
        if (seen.has(output.variable)) return;
        seen.add(output.variable);
        let options: string[] | undefined;
        if (output.type === 'string') {
          const values = new Set<string>();
          for (const row of decision.rows) {
            const value = row.outputs[outputIndex];
            if (value != null && typeof value !== 'boolean') values.add(String(value));
          }
          if (values.size) options = [...values];
        }
        fields.push({
          variable: output.variable,
          type: output.type,
          typeRef: output.typeRef,
          columnLabel: output.label,
          optionLabel: `${decision.name} › ${output.label}`,
          options,
        });
      });
      for (const column of decision.inputs) {
        if (produced.has(column.variable) || seen.has(column.variable)) continue;
        seen.add(column.variable);
        fields.push({
          variable: column.variable,
          type: column.type,
          typeRef: column.typeRef,
          columnLabel: column.label,
          optionLabel: `Đầu vào chung: ${column.label}`,
          options: column.options,
        });
      }
    });
    return fields;
  }

  /** Nguồn đang gán cho một cột NẾU, hoặc sentinel "đầu vào riêng". */
  boundSource(decisionIndex: number, columnIndex: number): string {
    const column = this.draft()?.[decisionIndex]?.inputs[columnIndex];
    if (!column) return OWN_INPUT_SOURCE;
    const bound = this.fieldsForDecision(decisionIndex).find(
      (field) => field.variable === column.variable,
    );
    return bound ? bound.variable : OWN_INPUT_SOURCE;
  }

  isBound(decisionIndex: number, columnIndex: number): boolean {
    return this.boundSource(decisionIndex, columnIndex) !== OWN_INPUT_SOURCE;
  }

  // ── Thao tác cấp cột ──────────────────────────────────────────────────────

  addInputColumn(decisionIndex: number): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      inputs: [
        ...decision.inputs,
        newColumn('in', 'number', `Điều kiện ${decision.inputs.length + 1}`),
      ],
      rows: decision.rows.map((row) => ({
        ...row,
        conditions: [...row.conditions, defaultCondition()],
      })),
    }));
  }

  addOutputColumn(decisionIndex: number): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      outputs: [
        ...decision.outputs,
        newColumn('out', 'string', `Kết quả ${decision.outputs.length + 1}`),
      ],
      rows: decision.rows.map((row) => ({ ...row, outputs: [...row.outputs, null] })),
    }));
  }

  removeInputColumn(decisionIndex: number, columnIndex: number): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      inputs: decision.inputs.filter((_, index) => index !== columnIndex),
      rows: decision.rows.map((row) => ({
        ...row,
        conditions: row.conditions.filter((_, index) => index !== columnIndex),
      })),
    }));
  }

  removeOutputColumn(decisionIndex: number, columnIndex: number): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      outputs: decision.outputs.filter((_, index) => index !== columnIndex),
      rows: decision.rows.map((row) => ({
        ...row,
        outputs: row.outputs.filter((_, index) => index !== columnIndex),
      })),
    }));
  }

  patchInputColumn(
    decisionIndex: number,
    columnIndex: number,
    patch: Partial<DecisionColumn>,
  ): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      inputs: decision.inputs.map((column, index) =>
        index === columnIndex
          ? { ...column, ...patch, ...(patch.type ? { typeRef: patch.type } : {}) }
          : column,
      ),
      // Đổi kiểu cột → reset điều kiện của đúng cột đó để không còn giá trị lệch kiểu.
      rows: patch.type
        ? decision.rows.map((row) => ({
            ...row,
            conditions: row.conditions.map((condition, index) =>
              index === columnIndex ? defaultCondition() : condition,
            ),
          }))
        : decision.rows,
    }));
  }

  patchOutputColumn(
    decisionIndex: number,
    columnIndex: number,
    patch: Partial<DecisionColumn>,
  ): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      outputs: decision.outputs.map((column, index) =>
        index === columnIndex
          ? { ...column, ...patch, ...(patch.type ? { typeRef: patch.type } : {}) }
          : column,
      ),
      rows: patch.type
        ? decision.rows.map((row) => ({
            ...row,
            outputs: row.outputs.map((output, index) => (index === columnIndex ? null : output)),
          }))
        : decision.rows,
    }));
  }

  /** Gán nguồn cho một cột NẾU. `OWN_INPUT_SOURCE` → tách thành đầu vào riêng. */
  bindInputSource(decisionIndex: number, columnIndex: number, variable: string): void {
    const field =
      variable === OWN_INPUT_SOURCE
        ? null
        : (this.fieldsForDecision(decisionIndex).find((item) => item.variable === variable) ?? null);
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      inputs: decision.inputs.map((column, index) => {
        if (index !== columnIndex) return column;
        return field
          ? {
              ...column,
              // Trùng tên biến ⇒ decisionGridToDmnXml tự nối requiredDecision.
              variable: field.variable,
              label: field.columnLabel,
              type: field.type,
              typeRef: field.typeRef ?? field.type,
              options: field.options,
            }
          : { ...column, variable: uid('bien'), options: undefined };
      }),
      rows: decision.rows.map((row) => ({
        ...row,
        conditions: row.conditions.map((condition, index) =>
          index === columnIndex ? defaultCondition() : condition,
        ),
      })),
    }));
  }

  // ── Thao tác cấp dòng ─────────────────────────────────────────────────────

  updateCondition(
    decisionIndex: number,
    rowIndex: number,
    columnIndex: number,
    patch: Partial<DecisionCondition>,
  ): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      rows: decision.rows.map((row, ri) =>
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

  changeOperator(
    decisionIndex: number,
    rowIndex: number,
    columnIndex: number,
    operator: DecisionOperator,
  ): void {
    const column = this.draft()![decisionIndex].inputs[columnIndex];
    this.updateCondition(decisionIndex, rowIndex, columnIndex, {
      operator,
      value: operator === 'ANY' ? null : emptyValue(column),
      valueTo: operator === 'BETWEEN' ? 0 : undefined,
    });
  }

  updateOutput(
    decisionIndex: number,
    rowIndex: number,
    columnIndex: number,
    value: unknown,
  ): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      rows: decision.rows.map((row, ri) =>
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

  addRow(decisionIndex: number): void {
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      rows: [...decision.rows, newDecisionRow(decision)],
    }));
  }

  duplicateRow(decisionIndex: number, rowIndex: number): void {
    this.patchDecision(decisionIndex, (decision) => {
      const copy = structuredClone(decision.rows[rowIndex]);
      copy.id = uid('r');
      const rows = [...decision.rows];
      rows.splice(rowIndex + 1, 0, copy);
      return { ...decision, rows };
    });
  }

  removeRow(decisionIndex: number, rowIndex: number): void {
    if ((this.draft()?.[decisionIndex]?.rows.length ?? 0) <= 1) {
      this.message.warning('Bảng quyết định phải có ít nhất một dòng luật.');
      return;
    }
    this.patchDecision(decisionIndex, (decision) => ({
      ...decision,
      rows: decision.rows.filter((_, index) => index !== rowIndex),
    }));
  }

  // ── Lưu / chạy thử / lịch sử ──────────────────────────────────────────────

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
        this.evaluationError.set(
          details || error?.error?.message || 'Không evaluate được decision trên Camunda.',
        );
        this.evaluating.set(false);
      },
    });
  }

  /** Dòng vừa khớp của ĐÚNG bảng đang render — kết quả trả về theo từng decision. */
  isFiredRow(decisionId: string, rowId: string): boolean {
    const decision = this.testResult()?.decisions.find(
      (candidate) => candidate.decisionId === decisionId,
    );
    return !!decision?.matchedRules.some((rule) => rule.ruleId === rowId);
  }

  useVersion(version: number): void {
    const rule = this.rule();
    if (!rule) return;
    this.store.getVersionArtifact(rule.id, version).subscribe({
      next: (snapshot) => {
        const copy = structuredClone(snapshot.definition!);
        this.draft.set(copy);
        this.resetTestInputs(copy);
        this.activeTab.set(0);
        this.message.info(
          `Đã nạp nội dung v${version} vào bản soạn. Bấm Lưu để tạo phiên bản mới.`,
        );
      },
      error: (error) =>
        this.message.error(error?.error?.message ?? `Không tải được phiên bản v${version}.`),
    });
  }

  private patchDecision(
    decisionIndex: number,
    mapper: (decision: DecisionGridDecision) => DecisionGridDecision,
  ): void {
    this.change((grid) =>
      grid.map((decision, index) => (index === decisionIndex ? mapper(decision) : decision)),
    );
  }

  private change(mapper: (draft: DecisionGrid) => DecisionGrid): void {
    const current = this.draft();
    if (current) this.draft.set(mapper(current));
    this.testResult.set(null);
  }

  private loadDefinition(definition: DecisionGrid): void {
    const copy = structuredClone(definition);
    this.draft.set(copy);
    this.baseDefinition.set(JSON.stringify(copy));
    this.resetTestInputs(copy);
  }

  private resetTestInputs(grid: DecisionGrid): void {
    this.testInputs.set(
      Object.fromEntries(
        rootInputColumns(grid).map((column) => [column.variable, emptyValue(column)]),
      ),
    );
    this.testResult.set(null);
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng';
  }

  private starterDecision(name: string): DecisionGridDecision {
    const input = newColumn('in', 'number', 'Giá trị đầu vào');
    const output = newColumn('out', 'string', 'Kết quả');
    return {
      id: uid('dec'),
      name,
      hitPolicy: 'FIRST',
      requires: [],
      inputs: [input],
      outputs: [output],
      rows: [{ id: uid('r'), conditions: [defaultCondition()], outputs: ['MAC_DINH'] }],
    };
  }
}
