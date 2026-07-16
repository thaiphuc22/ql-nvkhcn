import {
  DecisionColumn,
  DecisionCondition,
  DecisionOperator,
  DecisionTableDefinition,
  DecisionValueType,
} from '../models/business-rule';

const DMN_NS = 'https://www.omg.org/spec/DMN/20191111/MODEL/';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function typeOf(typeRef: string | null): DecisionValueType {
  const normalized = (typeRef ?? 'string').toLowerCase();
  if (['number', 'integer', 'long', 'double'].includes(normalized)) return 'number';
  return normalized === 'boolean' ? 'boolean' : 'string';
}

function directChildren(parent: Element, localName: string): Element[] {
  return Array.from(parent.children).filter((child) => child.localName === localName);
}

function directChild(parent: Element, localName: string): Element | undefined {
  return directChildren(parent, localName)[0];
}

function textOf(parent: Element): string {
  return directChild(parent, 'text')?.textContent?.trim() ?? '';
}

export function feelInputToCondition(text: string, type: DecisionValueType): DecisionCondition {
  const value = text.trim();
  if (!value || value === '-') return { operator: 'ANY', value: null };

  if (type === 'number') {
    const range = value.match(/^\[\s*(-?\d+(?:\.\d+)?)\s*\.\.\s*(-?\d+(?:\.\d+)?)\s*\]$/);
    if (range) return { operator: 'BETWEEN', value: Number(range[1]), valueTo: Number(range[2]) };
    const comparison = value.match(/^(>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/);
    if (!comparison) throw new Error(`Biểu thức số FEEL chưa được hỗ trợ: ${value}`);
    const operators: Record<string, DecisionOperator> = {
      '>=': 'GTE',
      '>': 'GT',
      '<=': 'LTE',
      '<': 'LT',
      '=': 'EQ',
      '': 'EQ',
    };
    return { operator: operators[comparison[1] ?? ''], value: Number(comparison[2]) };
  }

  if (type === 'boolean') {
    if (value === 'true' || value === 'false') return { operator: 'EQ', value: value === 'true' };
    throw new Error(`Biểu thức boolean FEEL chưa được hỗ trợ: ${value}`);
  }

  const quoted = value.match(/^"((?:[^"\\]|\\.)*)"$/);
  if (!quoted) throw new Error(`Biểu thức chuỗi FEEL chưa được hỗ trợ: ${value}`);
  return { operator: 'EQ', value: JSON.parse(`"${quoted[1]}"`) as string };
}

export function conditionToFeelInput(
  condition: DecisionCondition,
  type: DecisionValueType,
): string {
  if (condition.operator === 'ANY' || condition.value == null) return '-';
  if (type === 'number') {
    const prefixes: Partial<Record<DecisionOperator, string>> = {
      EQ: '',
      GTE: '>= ',
      GT: '> ',
      LTE: '<= ',
      LT: '< ',
    };
    if (condition.operator === 'BETWEEN') {
      return `[${Number(condition.value)}..${Number(condition.valueTo)}]`;
    }
    return `${prefixes[condition.operator] ?? ''}${Number(condition.value)}`;
  }
  if (type === 'boolean') return condition.value ? 'true' : 'false';
  return JSON.stringify(String(condition.value));
}

function feelOutputToValue(
  text: string,
  type: DecisionValueType,
): string | number | boolean | null {
  const value = text.trim();
  if (!value || value === '-') return null;
  if (type === 'number') {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`Kết quả số FEEL chưa được hỗ trợ: ${value}`);
    return number;
  }
  if (type === 'boolean') {
    if (value === 'true' || value === 'false') return value === 'true';
    throw new Error(`Kết quả boolean FEEL chưa được hỗ trợ: ${value}`);
  }
  const quoted = value.match(/^"((?:[^"\\]|\\.)*)"$/);
  if (!quoted) throw new Error(`Kết quả chuỗi FEEL chưa được hỗ trợ: ${value}`);
  return JSON.parse(`"${quoted[1]}"`) as string;
}

function valueToFeelOutput(
  value: string | number | boolean | null,
  type: DecisionValueType,
): string {
  if (value == null) return '-';
  if (type === 'number') return String(Number(value));
  if (type === 'boolean') return value ? 'true' : 'false';
  return JSON.stringify(String(value));
}

/** Parse the first decision table in a DMN artifact into the low-code Angular grid. */
export function dmnXmlToDecisionTable(dmnXml: string): DecisionTableDefinition {
  const document = new DOMParser().parseFromString(dmnXml, 'application/xml');
  const parserError = document.querySelector('parsererror');
  if (parserError) throw new Error('DMN XML không hợp lệ.');
  const decision = Array.from(document.getElementsByTagNameNS('*', 'decision'))[0];
  const table = decision && directChild(decision, 'decisionTable');
  if (!decision || !table) throw new Error('DMN chưa có bảng quyết định.');
  const hitPolicy = table.getAttribute('hitPolicy') || 'FIRST';
  if (hitPolicy !== 'FIRST')
    throw new Error(`Bảng luật chỉ hỗ trợ hit policy FIRST, nhận được ${hitPolicy}.`);

  const inputs: DecisionColumn[] = directChildren(table, 'input').map((input, index) => {
    const expression = directChild(input, 'inputExpression');
    if (!expression) throw new Error(`Cột điều kiện ${index + 1} thiếu inputExpression.`);
    return {
      id: input.getAttribute('id') || `input-${index + 1}`,
      label: input.getAttribute('label') || textOf(expression),
      variable: textOf(expression),
      type: typeOf(expression.getAttribute('typeRef')),
    };
  });
  const outputs: DecisionColumn[] = directChildren(table, 'output').map((output, index) => ({
    id: output.getAttribute('id') || `output-${index + 1}`,
    label: output.getAttribute('label') || output.getAttribute('name') || `Kết quả ${index + 1}`,
    variable: output.getAttribute('name') || `ketQua${index + 1}`,
    type: typeOf(output.getAttribute('typeRef')),
  }));

  const rows = directChildren(table, 'rule').map((rule, index) => ({
    id: rule.getAttribute('id') || `R${index + 1}`,
    conditions: directChildren(rule, 'inputEntry').map((entry, columnIndex) =>
      feelInputToCondition(textOf(entry), inputs[columnIndex]?.type ?? 'string'),
    ),
    outputs: directChildren(rule, 'outputEntry').map((entry, columnIndex) =>
      feelOutputToValue(textOf(entry), outputs[columnIndex]?.type ?? 'string'),
    ),
  }));

  return {
    id: decision.getAttribute('id') || 'decision-main',
    name: decision.getAttribute('name') || 'Bảng quyết định',
    hitPolicy: 'FIRST',
    inputs,
    outputs,
    rows,
  };
}

/** Serialize the structured grid as the canonical DMN XML persisted by the backend. */
export function decisionTableToDmnXml(
  definition: DecisionTableDefinition,
  meta: { definitionsId?: string; namespace?: string } = {},
): string {
  const inputs = definition.inputs
    .map(
      (column) =>
        `      <input id="${escapeXml(column.id)}" label="${escapeXml(column.label)}">\n` +
        `        <inputExpression id="${escapeXml(column.id)}_expr" typeRef="${column.type}"><text>${escapeXml(column.variable)}</text></inputExpression>\n` +
        `      </input>`,
    )
    .join('\n');
  const outputs = definition.outputs
    .map(
      (column) =>
        `      <output id="${escapeXml(column.id)}" label="${escapeXml(column.label)}" name="${escapeXml(column.variable)}" typeRef="${column.type}" />`,
    )
    .join('\n');
  const rules = definition.rows
    .map((row) => {
      const inputEntries = definition.inputs
        .map(
          (column, index) =>
            `        <inputEntry id="${escapeXml(row.id)}_in_${index + 1}"><text>${escapeXml(conditionToFeelInput(row.conditions[index] ?? { operator: 'ANY', value: null }, column.type))}</text></inputEntry>`,
        )
        .join('\n');
      const outputEntries = definition.outputs
        .map(
          (column, index) =>
            `        <outputEntry id="${escapeXml(row.id)}_out_${index + 1}"><text>${escapeXml(valueToFeelOutput(row.outputs[index] ?? null, column.type))}</text></outputEntry>`,
        )
        .join('\n');
      return `      <rule id="${escapeXml(row.id)}">\n${inputEntries}\n${outputEntries}\n      </rule>`;
    })
    .join('\n');
  const definitionsId = meta.definitionsId ?? `definitions_${definition.id}`;
  const namespace = meta.namespace ?? 'http://vht.com.vn/qtkhcn/dmn';
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="${DMN_NS}" id="${escapeXml(definitionsId)}" name="${escapeXml(definition.name)}" namespace="${escapeXml(namespace)}">
  <decision id="${escapeXml(definition.id)}" name="${escapeXml(definition.name)}">
    <decisionTable id="table_${escapeXml(definition.id)}" hitPolicy="FIRST">
${inputs}
${outputs}
${rules}
    </decisionTable>
  </decision>
</definitions>`;
}
