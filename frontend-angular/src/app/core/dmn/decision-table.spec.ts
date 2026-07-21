import { DecisionGridDecision } from '../models/business-rule';
import { evaluateDecisionTable, matchesCondition } from './decision-table';

const definition: DecisionGridDecision = {
  id: 'scale',
  name: 'Xếp quy mô',
  hitPolicy: 'FIRST',
  requires: [],
  inputs: [{ id: 'i1', label: 'Dự toán', variable: 'budget', type: 'number' }],
  outputs: [{ id: 'o1', label: 'Quy mô', variable: 'scale', type: 'string' }],
  rows: [
    { id: 'R1', conditions: [{ operator: 'GTE', value: 10 }], outputs: ['LỚN'] },
    { id: 'R2', conditions: [{ operator: 'ANY', value: null }], outputs: ['NHỎ'] },
  ],
};

describe('decision table evaluator', () => {
  it('supports numeric boundaries and first-match fallback', () => {
    expect(evaluateDecisionTable(definition, { budget: 10 })).toEqual({
      matchedRowId: 'R1',
      outputs: { scale: 'LỚN' },
    });
    expect(evaluateDecisionTable(definition, { budget: 9 }).matchedRowId).toBe('R2');
  });

  it('supports inclusive ranges', () => {
    const column = definition.inputs[0];
    const condition = { operator: 'BETWEEN' as const, value: 5, valueTo: 8 };
    expect(matchesCondition(condition, 5, column)).toBe(true);
    expect(matchesCondition(condition, 8, column)).toBe(true);
    expect(matchesCondition(condition, 9, column)).toBe(false);
  });
});
