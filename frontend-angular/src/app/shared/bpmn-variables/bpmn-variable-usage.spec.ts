import {
  extractVariableUsages,
  findGateway,
  parseBpmnModel,
  resolveFocusGatewayId,
} from './bpmn-variable-usage';

function xmlWithGateway(conditions: { flowId: string; condition: string | null; target: string }[], opts?: {
  defaultFlowId?: string;
  gatewayId?: string;
  gatewayName?: string;
  sourceTaskId?: string;
}): string {
  const gatewayId = opts?.gatewayId ?? 'Gateway_1';
  const sourceTaskId = opts?.sourceTaskId ?? 'Task_1';
  const flows = conditions
    .map((c) => {
      const escaped = c.condition?.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const cond = escaped
        ? `<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=${escaped}</bpmn:conditionExpression>`
        : '';
      return `<bpmn:sequenceFlow id="${c.flowId}" sourceRef="${gatewayId}" targetRef="${c.target}">${cond}</bpmn:sequenceFlow>`;
    })
    .join('');
  const targets = conditions
    .map((c) => `<bpmn:task id="${c.target}" name="${c.target}" />`)
    .join('');
  const defaultAttr = opts?.defaultFlowId ? ` default="${opts.defaultFlowId}"` : '';
  return `<?xml version="1.0"?>
<bpmn:definitions xmlns:bpmn="${'http://www.omg.org/spec/BPMN/20100524/MODEL'}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:task id="${sourceTaskId}" name="Nộp hồ sơ" />
    <bpmn:sequenceFlow id="flow-in" sourceRef="${sourceTaskId}" targetRef="${gatewayId}" />
    <bpmn:exclusiveGateway id="${gatewayId}" name="${opts?.gatewayName ?? 'Kiểm tra kết quả'}"${defaultAttr}>
    </bpmn:exclusiveGateway>
    ${flows}
    ${targets}
  </bpmn:process>
</bpmn:definitions>`;
}

describe('parseBpmnModel + extractVariableUsages', () => {
  it('finds gateway flows, default flow flag, and target names', () => {
    const xml = xmlWithGateway(
      [
        { flowId: 'flow-approve', condition: 'decision = "approve"', target: 'Task_Approve' },
        { flowId: 'flow-reject', condition: 'decision = "reject"', target: 'Task_Reject' },
      ],
      { defaultFlowId: 'flow-reject' },
    );
    const model = parseBpmnModel(xml);
    expect(model.gateways.length).toBe(1);
    const gateway = model.gateways[0];
    expect(gateway.elementId).toBe('Gateway_1');
    expect(gateway.hasDefaultFlow).toBe(true);
    expect(gateway.flows.find((f) => f.flowId === 'flow-reject')?.isDefault).toBe(true);
    expect(gateway.flows.find((f) => f.flowId === 'flow-approve')?.isDefault).toBe(false);
    expect(gateway.flows.find((f) => f.flowId === 'flow-approve')?.targetElementName).toBe('Task_Approve');
  });

  it('infers enum kind with distinct string values across flows', () => {
    const xml = xmlWithGateway([
      { flowId: 'flow-approve', condition: 'decision = "approve"', target: 'Task_Approve' },
      { flowId: 'flow-reject', condition: 'decision = "reject"', target: 'Task_Reject' },
    ]);
    const model = parseBpmnModel(xml);
    const usages = extractVariableUsages(model);
    expect(usages.length).toBe(1);
    expect(usages[0].name).toBe('decision');
    expect(usages[0].kind).toBe('enum');
    expect(usages[0].enumValues.sort()).toEqual(['approve', 'reject']);
    expect(usages[0].locations.length).toBe(2);
  });

  it('infers number kind for numeric comparisons', () => {
    const xml = xmlWithGateway([
      { flowId: 'flow-big', condition: 'budget > 1000', target: 'Task_Big' },
      { flowId: 'flow-small', condition: 'budget <= 1000', target: 'Task_Small' },
    ]);
    const usages = extractVariableUsages(parseBpmnModel(xml));
    expect(usages.find((u) => u.name === 'budget')?.kind).toBe('number');
  });

  it('infers boolean kind for true/false comparisons and bare flag usage', () => {
    const xml = xmlWithGateway([
      { flowId: 'flow-yes', condition: 'quorumDat = true', target: 'Task_Yes' },
      { flowId: 'flow-no', condition: 'quorumDat = false', target: 'Task_No' },
    ]);
    const usages = extractVariableUsages(parseBpmnModel(xml));
    expect(usages.find((u) => u.name === 'quorumDat')?.kind).toBe('boolean');
  });

  it('falls back to text kind when no literal comparison is detected', () => {
    const xml = xmlWithGateway([
      { flowId: 'flow-a', condition: 'amount > otherAmount', target: 'Task_A' },
      { flowId: 'flow-b', condition: 'otherAmount >= amount', target: 'Task_B' },
    ]);
    const usages = extractVariableUsages(parseBpmnModel(xml));
    const amount = usages.find((u) => u.name === 'amount');
    expect(amount?.kind).toBe('text');
  });

  it('excludes flows with no conditionExpression (default-only routing) from variable usages', () => {
    const xml = xmlWithGateway([
      { flowId: 'flow-cond', condition: 'decision = "approve"', target: 'Task_Approve' },
      { flowId: 'flow-default', condition: null, target: 'Task_Default' },
    ]);
    const usages = extractVariableUsages(parseBpmnModel(xml));
    expect(usages.length).toBe(1);
    expect(usages[0].locations.length).toBe(1);
  });

  it('resolveFocusGatewayId finds the gateway one hop after a task, and identity when already a gateway', () => {
    const xml = xmlWithGateway(
      [{ flowId: 'flow-approve', condition: 'decision = "approve"', target: 'Task_Approve' }],
      { sourceTaskId: 'Task_Submit' },
    );
    const model = parseBpmnModel(xml);
    expect(resolveFocusGatewayId(model, 'Task_Submit')).toBe('Gateway_1');
    expect(resolveFocusGatewayId(model, 'Gateway_1')).toBe('Gateway_1');
    expect(resolveFocusGatewayId(model, 'Task_Approve')).toBeNull();
    expect(resolveFocusGatewayId(model, null)).toBeNull();
  });

  it('extractVariableUsages filters to the gateway near focusElementId', () => {
    const xml = xmlWithGateway(
      [{ flowId: 'flow-approve', condition: 'decision = "approve"', target: 'Task_Approve' }],
      { sourceTaskId: 'Task_Submit' },
    );
    const model = parseBpmnModel(xml);
    expect(extractVariableUsages(model, 'Task_Submit').map((u) => u.name)).toEqual(['decision']);
    expect(extractVariableUsages(model, 'Task_Approve')).toEqual([]);
  });

  it('findGateway returns the gateway by id or null', () => {
    const xml = xmlWithGateway([{ flowId: 'flow-a', condition: 'x = 1', target: 'Task_A' }]);
    const model = parseBpmnModel(xml);
    expect(findGateway(model, 'Gateway_1')?.elementId).toBe('Gateway_1');
    expect(findGateway(model, 'Gateway_missing')).toBeNull();
  });

  it('returns empty model for blank or malformed XML instead of throwing', () => {
    expect(parseBpmnModel('').gateways).toEqual([]);
    expect(parseBpmnModel('not xml at all <<<').gateways).toEqual([]);
  });
});
