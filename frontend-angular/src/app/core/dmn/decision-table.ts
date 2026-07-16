import {
  DecisionColumn,
  DecisionCondition,
  DecisionRow,
  DecisionTableDefinition,
} from '../models/business-rule';

export interface DecisionTableResult {
  matchedRowId: string | null;
  outputs: Record<string, string | number | boolean | null>;
}

export function emptyValue(column: DecisionColumn): string | number | boolean {
  if (column.type === 'number') return 0;
  if (column.type === 'boolean') return false;
  return column.options?.[0] ?? '';
}

export function matchesCondition(
  condition: DecisionCondition,
  actual: unknown,
  column: DecisionColumn,
): boolean {
  if (condition.operator === 'ANY') return true;
  if (column.type === 'number') {
    const value = Number(actual);
    const expected = Number(condition.value);
    if (!Number.isFinite(value) || !Number.isFinite(expected)) return false;
    switch (condition.operator) {
      case 'GTE':
        return value >= expected;
      case 'GT':
        return value > expected;
      case 'LTE':
        return value <= expected;
      case 'LT':
        return value < expected;
      case 'BETWEEN':
        return value >= expected && value <= Number(condition.valueTo);
      default:
        return value === expected;
    }
  }
  return actual === condition.value;
}

export function evaluateDecisionTable(
  definition: DecisionTableDefinition,
  inputs: Record<string, unknown>,
): DecisionTableResult {
  const matched = definition.rows.find((candidate) =>
    definition.inputs.every((column, index) =>
      matchesCondition(
        candidate.conditions[index] ?? { operator: 'ANY', value: null },
        inputs[column.variable],
        column,
      ),
    ),
  );
  return {
    matchedRowId: matched?.id ?? null,
    outputs: Object.fromEntries(
      definition.outputs.map((column, index) => [column.variable, matched?.outputs[index] ?? null]),
    ),
  };
}

export function newDecisionRow(definition: DecisionTableDefinition): DecisionRow {
  return {
    id: `R${Date.now()}`,
    conditions: definition.inputs.map(() => ({ operator: 'ANY', value: null })),
    outputs: definition.outputs.map((column) => emptyValue(column)),
  };
}
