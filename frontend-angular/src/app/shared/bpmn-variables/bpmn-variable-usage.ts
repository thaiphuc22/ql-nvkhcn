/**
 * Parser thuần TypeScript (không phụ thuộc Angular) đọc BPMN XML để tìm các biến FEEL được tham
 * chiếu trong `conditionExpression` của `sequenceFlow` đi ra từ gateway (`exclusiveGateway`/
 * `inclusiveGateway`). Dùng chung cho form biến thông minh (Lát 1) và UX giải thích incident
 * `CONDITION_ERROR` (Lát 3) — cả hai đều cần "biến nào, dùng ở gateway nào, điều kiện gì".
 *
 * Đây là heuristic (regex trên identifier FEEL), không phải FEEL parser đầy đủ: đủ dùng cho các
 * biểu thức so sánh phổ biến (`bien = "gia_tri"`, `bien > 100`, `bien = true`, `bien`), không đảm
 * bảo đúng 100% với biểu thức FEEL phức tạp (context/list/function call lồng nhau).
 */

const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
const GATEWAY_LOCAL_NAMES = new Set(['exclusiveGateway', 'inclusiveGateway']);
const FEEL_KEYWORDS = new Set([
  'true', 'false', 'null', 'and', 'or', 'not', 'in', 'then', 'else', 'if',
  'for', 'some', 'every', 'return', 'between',
]);

export interface BpmnFlowCondition {
  flowId: string;
  targetElementId: string | null;
  targetElementName: string | null;
  /** Biểu thức FEEL gốc (đã bỏ dấu `=` dẫn đầu), hoặc null nếu flow không có điều kiện (ứng viên default). */
  condition: string | null;
  isDefault: boolean;
}

export interface BpmnGatewayInfo {
  elementId: string;
  name: string | null;
  flows: BpmnFlowCondition[];
  hasDefaultFlow: boolean;
}

export interface BpmnParsedModel {
  gateways: BpmnGatewayInfo[];
  /** sourceRef -> flows đi ra, dùng để dò gateway ngay sau một task (Lát 1 focusElementId). */
  flowsBySource: Map<string, BpmnFlowCondition[]>;
  elementNames: Map<string, string | null>;
}

export type BpmnVariableFieldKind = 'boolean' | 'number' | 'enum' | 'text';

export interface BpmnVariableUsageLocation {
  gatewayId: string;
  gatewayName: string | null;
  flowId: string;
  targetElementName: string | null;
  condition: string;
}

export interface BpmnVariableUsage {
  name: string;
  kind: BpmnVariableFieldKind;
  enumValues: string[];
  locations: BpmnVariableUsageLocation[];
}

function localName(el: Element): string {
  return el.localName ?? el.tagName;
}

/** Parse toàn bộ XML một lần: element theo id (tag + name), flow theo sourceRef, gateway + default flow. */
export function parseBpmnModel(xml: string): BpmnParsedModel {
  const gateways: BpmnGatewayInfo[] = [];
  const flowsBySource = new Map<string, BpmnFlowCondition[]>();
  const elementNames = new Map<string, string | null>();

  if (!xml || !xml.trim()) {
    return { gateways, flowsBySource, elementNames };
  }

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length > 0) {
      return { gateways, flowsBySource, elementNames };
    }
  } catch {
    return { gateways, flowsBySource, elementNames };
  }

  const allElements = Array.from(doc.getElementsByTagNameNS(BPMN_NS, '*'));
  for (const el of allElements) {
    const id = el.getAttribute('id');
    if (id) elementNames.set(id, el.getAttribute('name'));
  }

  const flowsByTargetId = new Map<string, Element>();
  const flowElements = doc.getElementsByTagNameNS(BPMN_NS, 'sequenceFlow');
  const flowsById = new Map<string, BpmnFlowCondition>();
  for (let i = 0; i < flowElements.length; i++) {
    const flowEl = flowElements.item(i)!;
    const flowId = flowEl.getAttribute('id') ?? `flow-${i}`;
    const sourceRef = flowEl.getAttribute('sourceRef');
    const targetRef = flowEl.getAttribute('targetRef');
    const conditionEl = Array.from(flowEl.getElementsByTagNameNS(BPMN_NS, 'conditionExpression'))[0];
    const rawCondition = conditionEl?.textContent?.trim() ?? null;
    const condition = rawCondition ? rawCondition.replace(/^=\s*/, '') : null;
    const flow: BpmnFlowCondition = {
      flowId,
      targetElementId: targetRef,
      targetElementName: targetRef ? (elementNames.get(targetRef) ?? null) : null,
      condition,
      isDefault: false,
    };
    flowsById.set(flowId, flow);
    if (sourceRef) {
      const list = flowsBySource.get(sourceRef) ?? [];
      list.push(flow);
      flowsBySource.set(sourceRef, list);
    }
    if (targetRef) flowsByTargetId.set(flowId, flowEl);
  }

  for (const el of allElements) {
    if (!GATEWAY_LOCAL_NAMES.has(localName(el))) continue;
    const elementId = el.getAttribute('id');
    if (!elementId) continue;
    const defaultFlowId = el.getAttribute('default');
    const flows = (flowsBySource.get(elementId) ?? []).map((f) => ({
      ...f,
      isDefault: !!defaultFlowId && f.flowId === defaultFlowId,
    }));
    gateways.push({
      elementId,
      name: el.getAttribute('name'),
      flows,
      hasDefaultFlow: !!defaultFlowId,
    });
  }

  return { gateways, flowsBySource, elementNames };
}

/** Tìm gateway ngay sau một phần tử (task vừa hoàn tất) — 1 hop qua sequenceFlow đi ra. */
export function resolveFocusGatewayId(model: BpmnParsedModel, focusElementId: string | null): string | null {
  if (!focusElementId) return null;
  if (model.gateways.some((g) => g.elementId === focusElementId)) return focusElementId;
  const outgoing = model.flowsBySource.get(focusElementId) ?? [];
  for (const flow of outgoing) {
    if (flow.targetElementId && model.gateways.some((g) => g.elementId === flow.targetElementId)) {
      return flow.targetElementId;
    }
  }
  return null;
}

function stripStringLiterals(expr: string): string {
  return expr.replace(/"[^"]*"|'[^']*'/g, ' ');
}

function extractIdentifiers(expr: string): string[] {
  const clean = stripStringLiterals(expr);
  const matches = clean.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  return [...new Set(matches.filter((m) => !FEEL_KEYWORDS.has(m.toLowerCase())))];
}

interface LiteralSignal {
  kind: BpmnVariableFieldKind;
  value?: string;
}

/** Với một biến + một điều kiện FEEL, suy luận literal nó được so sánh (nếu có). */
function detectLiteralSignals(varName: string, condition: string): LiteralSignal[] {
  const signals: LiteralSignal[] = [];
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const stringRe = new RegExp(`\\b${escaped}\\b\\s*(=|!=)\\s*"([^"]*)"`, 'g');
  for (const m of condition.matchAll(stringRe)) signals.push({ kind: 'enum', value: m[2] });
  const stringReReversed = new RegExp(`"([^"]*)"\\s*(=|!=)\\s*\\b${escaped}\\b`, 'g');
  for (const m of condition.matchAll(stringReReversed)) signals.push({ kind: 'enum', value: m[1] });

  const boolRe = new RegExp(`\\b${escaped}\\b\\s*(=|!=)?\\s*\\b(true|false)\\b`, 'gi');
  if (boolRe.test(condition)) signals.push({ kind: 'boolean' });
  if (condition.trim() === varName || condition.trim() === `not(${varName})`) {
    signals.push({ kind: 'boolean' });
  }

  const numberRe = new RegExp(`\\b${escaped}\\b\\s*(=|!=|>=|<=|>|<)\\s*(-?\\d+(\\.\\d+)?)\\b`, 'g');
  if (numberRe.test(condition)) signals.push({ kind: 'number' });

  return signals;
}

function pickKind(signals: LiteralSignal[]): BpmnVariableFieldKind {
  if (signals.some((s) => s.kind === 'boolean')) return 'boolean';
  if (signals.some((s) => s.kind === 'enum')) return 'enum';
  if (signals.some((s) => s.kind === 'number')) return 'number';
  return 'text';
}

/**
 * Trích danh sách biến FEEL được tham chiếu trong các gateway đã cho, kèm nơi dùng + kiểu dữ liệu
 * suy luận. `focusElementId` (tuỳ chọn) lọc chỉ gateway ngay sau phần tử đó — dùng cho drawer hoàn
 * tất task; truyền `null`/bỏ qua để lấy toàn bộ biến trong BPMN (form biến khởi tạo).
 */
export function extractVariableUsages(model: BpmnParsedModel, focusElementId?: string | null): BpmnVariableUsage[] {
  const focusGatewayId = focusElementId ? resolveFocusGatewayId(model, focusElementId) : null;
  const gateways = focusElementId
    ? model.gateways.filter((g) => g.elementId === focusGatewayId)
    : model.gateways;

  const byName = new Map<string, { signals: LiteralSignal[]; locations: BpmnVariableUsageLocation[] }>();
  for (const gateway of gateways) {
    for (const flow of gateway.flows) {
      if (!flow.condition) continue;
      const identifiers = extractIdentifiers(flow.condition);
      for (const name of identifiers) {
        const entry = byName.get(name) ?? { signals: [], locations: [] };
        entry.signals.push(...detectLiteralSignals(name, flow.condition));
        entry.locations.push({
          gatewayId: gateway.elementId,
          gatewayName: gateway.name,
          flowId: flow.flowId,
          targetElementName: flow.targetElementName,
          condition: flow.condition,
        });
        byName.set(name, entry);
      }
    }
  }

  return [...byName.entries()]
    .map(([name, { signals, locations }]) => ({
      name,
      kind: pickKind(signals),
      enumValues: [...new Set(signals.filter((s) => s.kind === 'enum' && s.value !== undefined).map((s) => s.value!))],
      locations,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Lấy thông tin 1 gateway theo id — dùng cho UX incident CONDITION_ERROR (Lát 3). */
export function findGateway(model: BpmnParsedModel, gatewayId: string): BpmnGatewayInfo | null {
  return model.gateways.find((g) => g.elementId === gatewayId) ?? null;
}

/** Danh sách tên biến FEEL được tham chiếu trong MỘT điều kiện — dùng để đối chiếu với biến hiện có (Lát 3). */
export function referencedVariableNames(condition: string): string[] {
  return extractIdentifiers(condition);
}
