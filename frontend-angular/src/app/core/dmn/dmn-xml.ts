import {
  DecisionColumn,
  DecisionCondition,
  DecisionGrid,
  DecisionGridDecision,
  DecisionOperator,
  DecisionValueType,
  DmnHitPolicy,
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

function hitPolicyOf(raw: string | null): DmnHitPolicy {
  const normalized = (raw || 'FIRST').toUpperCase();
  return normalized === 'UNIQUE' || normalized === 'COLLECT'
    ? (normalized as DmnHitPolicy)
    : 'FIRST';
}

/**
 * Parse toàn bộ DRD trong một tài nguyên DMN thành lưới nhiều bảng, giữ đúng thứ tự tài liệu.
 * Cạnh phụ thuộc đọc từ `<informationRequirement><requiredDecision href="#X">`.
 */
export function dmnXmlToDecisionGrid(dmnXml: string): DecisionGrid {
  const document = new DOMParser().parseFromString(dmnXml, 'application/xml');
  const parserError = document.querySelector('parsererror');
  if (parserError) throw new Error('DMN XML không hợp lệ.');
  const decisions = Array.from(document.getElementsByTagNameNS('*', 'decision'));
  if (!decisions.length) throw new Error('DMN chưa có bảng quyết định.');

  return decisions.map((decision, decisionIndex) => {
    const table = directChild(decision, 'decisionTable');
    if (!table) throw new Error('DMN chưa có bảng quyết định.');
    const decisionId = decision.getAttribute('id') || `decision-${decisionIndex + 1}`;

    const requires = directChildren(decision, 'informationRequirement')
      .map((requirement) => directChild(requirement, 'requiredDecision')?.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#'))
      .map((href) => href.slice(1));

    const inputs: DecisionColumn[] = directChildren(table, 'input').map((input, index) => {
      const expression = directChild(input, 'inputExpression');
      if (!expression) throw new Error(`Cột điều kiện ${index + 1} thiếu inputExpression.`);
      const typeRef = expression.getAttribute('typeRef');
      // Bảng nguồn nhiều cột kết quả được đọc qua context `dv_<id>.<biến>` — lưới chỉ giữ tên biến.
      const variable = textOf(expression).replace(/^dv_[^.]+\./, '');
      return {
        id: input.getAttribute('id') || `${decisionId}_i${index + 1}`,
        label: input.getAttribute('label') || variable,
        variable,
        type: typeOf(typeRef),
        typeRef: typeRef ?? undefined,
      };
    });
    const outputs: DecisionColumn[] = directChildren(table, 'output').map((output, index) => {
      const typeRef = output.getAttribute('typeRef');
      return {
        id: output.getAttribute('id') || `${decisionId}_o${index + 1}`,
        label:
          output.getAttribute('label') || output.getAttribute('name') || `Kết quả ${index + 1}`,
        variable: output.getAttribute('name') || `ketQua${index + 1}`,
        type: typeOf(typeRef),
        typeRef: typeRef ?? undefined,
      };
    });

    const rows = directChildren(table, 'rule').map((rule, index) => ({
      id: rule.getAttribute('id') || `${decisionId}_r${index + 1}`,
      conditions: directChildren(rule, 'inputEntry').map((entry, columnIndex) =>
        feelInputToCondition(textOf(entry), inputs[columnIndex]?.type ?? 'string'),
      ),
      outputs: directChildren(rule, 'outputEntry').map((entry, columnIndex) =>
        feelOutputToValue(textOf(entry), outputs[columnIndex]?.type ?? 'string'),
      ),
    }));

    return {
      id: decisionId,
      name: decision.getAttribute('name') || 'Bảng quyết định',
      hitPolicy: hitPolicyOf(table.getAttribute('hitPolicy')),
      requires,
      inputs,
      outputs,
      rows,
    };
  });
}

/** Các cột input gốc của DRD: biến không do bảng nào sinh ra (khử trùng theo tên biến). */
export function rootInputColumns(grid: DecisionGrid): DecisionColumn[] {
  const producedBy = new Set<string>();
  for (const decision of grid) {
    for (const output of decision.outputs) producedBy.add(output.variable);
  }
  const roots = new Map<string, DecisionColumn>();
  for (const decision of grid) {
    for (const column of decision.inputs) {
      if (!producedBy.has(column.variable) && !roots.has(column.variable)) {
        roots.set(column.variable, column);
      }
    }
  }
  return [...roots.values()];
}

function typeRefOf(column: DecisionColumn): string {
  return column.typeRef ?? column.type;
}

/**
 * Camunda gắn kết quả một quyết định vào biến khai báo ở `<decision><variable>`; thiếu phần tử này
 * thì bảng sau đọc biến của bảng trước ra null và không khớp dòng nào. Bảng đúng 1 cột kết quả trả
 * về giá trị đơn nên đặt tên biến quyết định trùng luôn tên biến output để bảng sau tham chiếu
 * thẳng; bảng nhiều cột kết quả trả về context nên phải tham chiếu qua `dv_<id>.<biến>`.
 */
function decisionVariableName(decision: DecisionGridDecision): string {
  return decision.outputs.length === 1 ? decision.outputs[0].variable : `dv_${decision.id}`;
}

/** Biểu thức đọc `column` từ bảng sinh ra nó — có tiền tố context nếu bảng đó nhiều cột kết quả. */
function inputExpressionOf(
  column: DecisionColumn,
  producedBy: Map<string, string>,
  byId: Map<string, DecisionGridDecision>,
): string {
  const source = producedBy.get(column.variable);
  const producer = source ? byId.get(source) : undefined;
  if (!producer || producer.outputs.length === 1) return column.variable;
  return `${decisionVariableName(producer)}.${column.variable}`;
}

function decisionToXml(
  decision: DecisionGridDecision,
  producedBy: Map<string, string>,
  rootInputs: Map<string, string>,
  byId: Map<string, DecisionGridDecision>,
): string {
  // Phụ thuộc suy từ cột input (chính xác nhất); requires[] chỉ bổ sung cạnh đọc được từ DMN gốc.
  const requiredDecisions = new Set<string>();
  const requiredInputs = new Set<string>();
  for (const column of decision.inputs) {
    const source = producedBy.get(column.variable);
    if (source && source !== decision.id) requiredDecisions.add(source);
    else if (rootInputs.has(column.variable)) requiredInputs.add(column.variable);
  }
  for (const dependency of decision.requires) {
    if (dependency !== decision.id) requiredDecisions.add(dependency);
  }

  const requirementsXml = [
    ...[...requiredDecisions].map(
      (id, index) =>
        `    <informationRequirement id="ir_${escapeXml(decision.id)}_d${index}">\n` +
        `      <requiredDecision href="#${escapeXml(id)}" />\n` +
        `    </informationRequirement>`,
    ),
    ...[...requiredInputs].map(
      (variable, index) =>
        `    <informationRequirement id="ir_${escapeXml(decision.id)}_in${index}">\n` +
        `      <requiredInput href="#in_${escapeXml(variable)}" />\n` +
        `    </informationRequirement>`,
    ),
  ].join('\n');

  const inputs = decision.inputs
    .map(
      (column) =>
        `      <input id="${escapeXml(column.id)}" label="${escapeXml(column.label)}">\n` +
        `        <inputExpression id="${escapeXml(column.id)}_expr" typeRef="${escapeXml(typeRefOf(column))}"><text>${escapeXml(inputExpressionOf(column, producedBy, byId))}</text></inputExpression>\n` +
        `      </input>`,
    )
    .join('\n');
  const outputs = decision.outputs
    .map(
      (column) =>
        `      <output id="${escapeXml(column.id)}" label="${escapeXml(column.label)}" name="${escapeXml(column.variable)}" typeRef="${escapeXml(typeRefOf(column))}" />`,
    )
    .join('\n');
  const rules = decision.rows
    .map((row) => {
      const inputEntries = decision.inputs
        .map(
          (column, index) =>
            `        <inputEntry id="${escapeXml(row.id)}_in_${index + 1}"><text>${escapeXml(conditionToFeelInput(row.conditions[index] ?? { operator: 'ANY', value: null }, column.type))}</text></inputEntry>`,
        )
        .join('\n');
      const outputEntries = decision.outputs
        .map(
          (column, index) =>
            `        <outputEntry id="${escapeXml(row.id)}_out_${index + 1}"><text>${escapeXml(valueToFeelOutput(row.outputs[index] ?? null, column.type))}</text></outputEntry>`,
        )
        .join('\n');
      return `      <rule id="${escapeXml(row.id)}">\n${inputEntries}\n${outputEntries}\n      </rule>`;
    })
    .join('\n');

  const variableName = decisionVariableName(decision);
  const variableTypeRef =
    decision.outputs.length === 1 ? ` typeRef="${escapeXml(typeRefOf(decision.outputs[0]))}"` : '';

  return (
    `  <decision id="${escapeXml(decision.id)}" name="${escapeXml(decision.name)}">\n` +
    `    <variable id="var_${escapeXml(decision.id)}" name="${escapeXml(variableName)}"${variableTypeRef} />\n` +
    (requirementsXml ? `${requirementsXml}\n` : '') +
    `    <decisionTable id="table_${escapeXml(decision.id)}" hitPolicy="${escapeXml(decision.hitPolicy)}">\n` +
    `${inputs}\n${outputs}\n${rules}\n` +
    `    </decisionTable>\n` +
    `  </decision>`
  );
}

/**
 * Serialize lưới nhiều bảng thành DMN XML — nguồn chuẩn lưu ở backend. Tự suy `<inputData>` cho
 * biến gốc (không bảng nào sinh ra) và `<informationRequirement>` nối các bảng theo tên biến.
 */
export function decisionGridToDmnXml(
  grid: DecisionGrid,
  meta: { definitionsId?: string; name?: string; namespace?: string } = {},
): string {
  if (!grid.length) throw new Error('DRD phải có ít nhất một bảng quyết định.');

  const producedBy = new Map<string, string>();
  for (const decision of grid) {
    for (const output of decision.outputs) producedBy.set(output.variable, decision.id);
  }
  const rootInputs = new Map<string, string>();
  for (const decision of grid) {
    for (const column of decision.inputs) {
      if (!producedBy.has(column.variable) && !rootInputs.has(column.variable)) {
        rootInputs.set(column.variable, typeRefOf(column));
      }
    }
  }

  const inputDataXml = [...rootInputs.entries()]
    .map(
      ([variable, typeRef]) =>
        `  <inputData id="in_${escapeXml(variable)}" name="${escapeXml(variable)}">\n` +
        `    <variable id="var_${escapeXml(variable)}" name="${escapeXml(variable)}" typeRef="${escapeXml(typeRef)}" />\n` +
        `  </inputData>`,
    )
    .join('\n');

  const byId = new Map(grid.map((decision) => [decision.id, decision]));
  const decisionsXml = grid
    .map((decision) => decisionToXml(decision, producedBy, rootInputs, byId))
    .join('\n\n');
  const definitionsId = meta.definitionsId ?? `definitions_${grid[0].id}`;
  const name = meta.name ?? grid[grid.length - 1].name;
  const namespace = meta.namespace ?? 'http://vht.com.vn/qtkhcn/dmn';
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<definitions xmlns="${DMN_NS}" id="${escapeXml(definitionsId)}" name="${escapeXml(name)}" namespace="${escapeXml(namespace)}">\n` +
    (inputDataXml ? `${inputDataXml}\n\n` : '') +
    decisionsXml +
    `\n</definitions>`
  );
}
