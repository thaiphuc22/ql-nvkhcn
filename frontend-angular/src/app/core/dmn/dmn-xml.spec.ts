import { DecisionTableDefinition } from '../models/business-rule';
import { decisionTableToDmnXml, dmnXmlToDecisionTable, feelInputToCondition } from './dmn-xml';

const definition: DecisionTableDefinition = {
  id: 'approval',
  name: 'Phân cấp phê duyệt',
  hitPolicy: 'FIRST',
  inputs: [
    { id: 'budget', label: 'Tổng dự toán', variable: 'tongDuToan', type: 'number' },
    { id: 'scope', label: 'Phạm vi', variable: 'phamVi', type: 'string' },
  ],
  outputs: [{ id: 'level', label: 'Cấp phê duyệt', variable: 'capPheDuyet', type: 'string' }],
  rows: [
    {
      id: 'R1',
      conditions: [
        { operator: 'BETWEEN', value: 10, valueTo: 20 },
        { operator: 'EQ', value: 'TẬP ĐOÀN' },
      ],
      outputs: ['TẬP ĐOÀN'],
    },
    {
      id: 'R2',
      conditions: [
        { operator: 'ANY', value: null },
        { operator: 'ANY', value: null },
      ],
      outputs: ['CƠ SỞ'],
    },
  ],
};

describe('DMN XML decision table converter', () => {
  it('round-trips the supported structured table without semantic loss', () => {
    const xml = decisionTableToDmnXml(definition);
    const parsed = dmnXmlToDecisionTable(xml);

    expect(parsed).toEqual(definition);
    expect(decisionTableToDmnXml(parsed)).toBe(xml);
  });

  it('fails closed for an unsupported FEEL expression', () => {
    expect(() => feelInputToCondition('not(1)', 'number')).toThrowError(
      'Biểu thức số FEEL chưa được hỗ trợ: not(1)',
    );
  });
});
