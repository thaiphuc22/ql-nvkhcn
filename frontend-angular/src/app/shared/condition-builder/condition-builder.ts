import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import {
  OPERATORS,
  describeConditionTree,
  group,
  type ConditionGroup,
  type ConditionLeaf,
  type ConditionNode,
  type ConditionOperator,
} from '../../core/models/approval-conditions';
import { APPROVAL_VARIABLES, describeHelpers, variableDef } from '../../core/models/approval-variable-registry';

const OP_META = new Map(OPERATORS.map((o) => [o.op, o]));
const FIELD_OPTIONS = APPROVAL_VARIABLES.map((v) => ({ value: v.key, label: v.label }));

type ValueControlKind = 'none' | 'multiSelect' | 'select' | 'boolean' | 'numberRange' | 'number' | 'text';

/** Leaf mặc định khi thêm điều kiện mới: biến đầu tiên + toán tử đầu tiên của nó. */
function defaultLeaf(): ConditionLeaf {
  const v = APPROVAL_VARIABLES[0];
  return { kind: 'condition', field: v.key, operator: v.operators[0] };
}

function isUnary(op: ConditionOperator): boolean {
  return OP_META.get(op)?.arity === 'unary';
}

function controlKindFor(leafNode: ConditionLeaf): ValueControlKind {
  if (isUnary(leafNode.operator)) return 'none';
  const def = variableDef(leafNode.field);
  const type = def?.type ?? 'string';
  if (leafNode.operator === 'in' && def?.options) return 'multiSelect';
  if (type === 'enum' || type === 'multiEnum') return 'select';
  if (type === 'boolean') return 'boolean';
  if (type === 'number') return leafNode.operator === 'between' ? 'numberRange' : 'number';
  return 'text';
}

/**
 * Trình soạn cây điều kiện AND/OR của một luật Ma trận phê duyệt. Port của
 * webapp/src/components/ConditionBuilder.tsx (`ConditionBuilder` + `GroupEditor` +
 * `LeafRow` + `ValueControl` gộp lại — D17 Angular migration).
 *
 * Đệ quy: một instance đại diện cho một nhóm (AND/OR); nhóm con tái dùng chính
 * component này qua `[isRoot]="false"`, tự chứa nút "Xoá nhóm" gọi `removeGroup`
 * — logic xoá (splice khỏi mảng items) do component CHA (đang lặp `items`) thực
 * hiện, y hệt boundary `onRemove` của React.
 */
@Component({
  selector: 'app-condition-builder',
  imports: [
    ConditionBuilderComponent,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSegmentedModule,
    NzSelectModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './condition-builder.html',
  styleUrl: './condition-builder.scss',
})
export class ConditionBuilderComponent {
  readonly value = input.required<ConditionGroup>();
  readonly isRoot = input<boolean>(true);

  readonly valueChange = output<ConditionGroup>();
  /** Chỉ phát khi `isRoot()` là false — nhóm cha xoá item này khỏi mảng items của nó. */
  readonly removeGroup = output<void>();

  readonly fieldOptions = FIELD_OPTIONS;
  readonly logicOptions = [
    { label: 'TẤT CẢ (VÀ)', value: 'AND' },
    { label: 'MỘT TRONG (HOẶC)', value: 'OR' },
  ];

  readonly preview = computed(() => describeConditionTree(this.value(), describeHelpers));

  setLogic(logic: string | number): void {
    this.valueChange.emit({ ...this.value(), logic: logic as 'AND' | 'OR' });
  }

  addLeaf(): void {
    this.valueChange.emit({ ...this.value(), items: [...this.value().items, defaultLeaf()] });
  }

  addGroup(): void {
    this.valueChange.emit({ ...this.value(), items: [...this.value().items, group('AND', [defaultLeaf()])] });
  }

  setItem(i: number, node: ConditionNode): void {
    this.valueChange.emit({
      ...this.value(),
      items: this.value().items.map((it, idx) => (idx === i ? node : it)),
    });
  }

  removeItem(i: number): void {
    this.valueChange.emit({ ...this.value(), items: this.value().items.filter((_, idx) => idx !== i) });
  }

  operatorOptions(leafNode: ConditionLeaf): { value: ConditionOperator; label: string }[] {
    const def = variableDef(leafNode.field);
    return (def?.operators ?? []).map((op) => ({ value: op, label: OP_META.get(op)?.symbol ?? op }));
  }

  controlKind(leafNode: ConditionLeaf): ValueControlKind {
    return controlKindFor(leafNode);
  }

  selectOptions(leafNode: ConditionLeaf): { value: string; label: string }[] {
    return variableDef(leafNode.field)?.options ?? [];
  }

  onFieldChange(i: number, field: string): void {
    const def = variableDef(field);
    this.setItem(i, { kind: 'condition', field, operator: def?.operators[0] ?? 'eq' });
  }

  onOperatorChange(i: number, leafNode: ConditionLeaf, operator: ConditionOperator): void {
    this.setItem(i, { ...leafNode, operator, value: undefined, valueTo: undefined });
  }

  onValueChange(i: number, leafNode: ConditionLeaf, patch: { value?: unknown; valueTo?: unknown }): void {
    this.setItem(i, { ...leafNode, ...patch });
  }

  stringValue(leafNode: ConditionLeaf): string | null {
    return typeof leafNode.value === 'string' ? leafNode.value : null;
  }

  multiValue(leafNode: ConditionLeaf): string[] {
    return Array.isArray(leafNode.value) ? (leafNode.value as string[]) : [];
  }

  boolValue(leafNode: ConditionLeaf): boolean | null {
    return leafNode.value === undefined ? null : Boolean(leafNode.value);
  }

  numberValue(leafNode: ConditionLeaf): number | null {
    return typeof leafNode.value === 'number' ? leafNode.value : null;
  }

  numberToValue(leafNode: ConditionLeaf): number | null {
    return typeof leafNode.valueTo === 'number' ? leafNode.valueTo : null;
  }

  formatVnd(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  parseVnd(value: string): number {
    return Number((value ?? '').replace(/\D/g, ''));
  }

  isLeaf(node: ConditionNode): node is ConditionLeaf {
    return node.kind === 'condition';
  }

  asGroup(node: ConditionNode): ConditionGroup {
    return node as ConditionGroup;
  }
}
