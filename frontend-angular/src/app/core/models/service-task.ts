import { seedIntegrations } from './integration-system';
import { seedMappingConfigs, validateMappingConfig, type MappingConfig } from './integration-mapping';

// Port của webapp/src/data/serviceTasks.ts — domain model cho module "Cấu hình
// Service Task / Tác vụ hệ thống". Không backend (xác nhận không có contract
// ServiceTaskDefinition/Version/Binding trong backend/src/main/java) — service
// signal-based (core/services/service-task.service.ts) đóng vai trò
// ServiceTaskContext.tsx gốc.

/* ─────────────────────────── Type registry ─────────────────────────── */

export type ServiceTaskTypeCode =
  | 'SEND_NOTIFICATION'
  | 'CALL_API'
  | 'UPDATE_DOSSIER'
  | 'GENERATE_DOCUMENT'
  | 'EVALUATE_DECISION';

export type ServiceTaskCategory = 'communication' | 'integration' | 'data' | 'document' | 'decision';

export interface ServiceTaskCapabilities {
  supportsRetry: boolean;
  supportsPreview: boolean;
  requiresConnector: boolean;
  allowsOutputMapping: boolean;
  requiresTemplate?: boolean;
  mutatesDossier?: boolean;
}

export interface ServiceTaskSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
  required?: boolean;
  enumValues?: string[];
  hint?: string;
}

export interface ServiceTaskType {
  code: ServiceTaskTypeCode;
  name: string;
  description: string;
  category: ServiceTaskCategory;
  inputSchema: ServiceTaskSchemaField[];
  outputSchema: ServiceTaskSchemaField[];
  capabilities: ServiceTaskCapabilities;
  enabled: boolean;
}

/* ─────────────────────────── Definition & version ─────────────────────────── */

export type ServiceTaskDefinitionStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'DEPRECATED' | 'ERROR';

export const SERVICE_TASK_STATUS_META: Record<ServiceTaskDefinitionStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  READY: { label: 'Sẵn sàng', color: 'blue' },
  ACTIVE: { label: 'Đang dùng', color: 'success' },
  DEPRECATED: { label: 'Ngừng dùng', color: 'default' },
  ERROR: { label: 'Có lỗi', color: 'error' },
};

export interface ServiceTaskDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  typeCode: ServiceTaskTypeCode;
  status: ServiceTaskDefinitionStatus;
  ownerModule: string;
  tags: string[];
  activeVersionNo?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceTaskConfigVersionStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'ARCHIVED' | 'ERROR';

export type RetryBackoff = 'fixed' | 'exponential';

export type ServiceTaskFailurePolicy = 'CREATE_INCIDENT' | 'FAIL_PROCESS' | 'CONTINUE' | 'COMPENSATE' | 'MANUAL_TASK';

export interface ServiceTaskErrorPolicy {
  timeoutMs: number;
  maxRetry: number;
  retryDelayMs: number;
  retryBackoff: RetryBackoff;
  retryableErrorCodes: string[];
  onFailure: ServiceTaskFailurePolicy;
  notifyRoles: string[];
}

export type ServiceTaskInputSource =
  | 'variables'
  | 'dossier'
  | 'form'
  | 'task'
  | 'initiator'
  | 'assignee'
  | 'org'
  | 'system'
  | 'previousOutput';

export interface ServiceTaskInputMapping {
  id: string;
  target: string;
  expression: string;
  source: ServiceTaskInputSource;
  required: boolean;
  description?: string;
}

export type ServiceTaskOutputTarget = 'variables' | 'dossier' | 'integrationRef' | 'executionMetadata';

export interface ServiceTaskOutputMapping {
  id: string;
  sourcePath: string;
  target: ServiceTaskOutputTarget;
  targetPath: string;
  required?: boolean;
  description?: string;
}

export type ServiceTaskExecutionConfig =
  | SendNotificationConfig
  | CallApiConfig
  | UpdateDossierConfig
  | GenerateDocumentConfig
  | EvaluateDecisionConfig;

export interface SendNotificationConfig {
  typeCode: 'SEND_NOTIFICATION';
  templateCode: string;
  channels: Array<'email' | 'in_app' | 'sms' | 'zalo'>;
  recipientExpression: string;
  subjectExpression?: string;
}

export interface CallApiConfig {
  typeCode: 'CALL_API';
  connectorKey: string;
  mappingConfigId?: string;
  endpointAction: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  idempotencyKeyExpression?: string;
}

export interface UpdateDossierConfig {
  typeCode: 'UPDATE_DOSSIER';
  allowedFields: string[];
  updates: Array<{ field: string; valueExpression: string }>;
}

export interface GenerateDocumentConfig {
  typeCode: 'GENERATE_DOCUMENT';
  templateCode: string;
  outputFolderExpression?: string;
  attachToDossier: boolean;
}

export interface EvaluateDecisionConfig {
  typeCode: 'EVALUATE_DECISION';
  decisionCode: string;
  decisionVersion?: string;
  resultVariable: string;
}

export interface ServiceTaskConfigVersion {
  id: string;
  serviceTaskDefinitionId: string;
  versionNo: number;
  configJson: ServiceTaskExecutionConfig;
  inputMapping: ServiceTaskInputMapping[];
  outputMapping: ServiceTaskOutputMapping[];
  errorPolicy: ServiceTaskErrorPolicy;
  status: ServiceTaskConfigVersionStatus;
  changeNote: string;
  createdBy: string;
  createdAt: string;
}

/* ─────────────────────────── Binding BPMN ─────────────────────────── */

export type ServiceTaskBindingStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export interface ServiceTaskBinding {
  id: string;
  processCode: string;
  processVersion: string;
  bpmnProcessId: string;
  taskDefinitionKey: string;
  taskName: string;
  jobType: string;
  serviceTaskDefinitionId: string;
  bindingStatus: ServiceTaskBindingStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  updatedAt: string;
}

/** Metadata service task đọc từ BPMN/process — seed điểm bám cho binding/log. */
export interface ProcessServiceTaskRef {
  processCode: string;
  processVersion: string;
  bpmnProcessId: string;
  taskDefinitionKey: string;
  taskName: string;
  jobType: string;
  implementationHint?: string;
  critical: boolean;
}

/* ─────────────────────────── Execution log & audit ─────────────────────────── */

export type ServiceTaskExecutionStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'SKIPPED' | 'MANUAL_RESOLVED';

export const SERVICE_TASK_EXECUTION_STATUS_META: Record<ServiceTaskExecutionStatus, { label: string; color: string }> = {
  RUNNING: { label: 'Đang chạy', color: 'processing' },
  SUCCESS: { label: 'Thành công', color: 'success' },
  FAILED: { label: 'Thất bại', color: 'error' },
  RETRYING: { label: 'Đang thử lại', color: 'warning' },
  SKIPPED: { label: 'Bỏ qua', color: 'default' },
  MANUAL_RESOLVED: { label: 'Xử lý tay', color: 'blue' },
};

export interface ServiceTaskExecutionLog {
  id: string;
  processInstanceKey: string;
  processCode: string;
  processVersion: string;
  taskDefinitionKey: string;
  taskName: string;
  serviceTaskDefinitionId: string;
  configVersionNo: number;
  status: ServiceTaskExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  attemptNo: number;
  requestSummary: Record<string, unknown>;
  responseSummary?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
  incidentId?: string;
  actor?: string;
}

export type ServiceTaskAuditAction =
  | 'CREATE_DEFINITION'
  | 'UPDATE_DEFINITION'
  | 'DUPLICATE_DEFINITION'
  | 'SAVE_VERSION'
  | 'VALIDATE_VERSION'
  | 'ACTIVATE_VERSION'
  | 'DEPRECATE_DEFINITION'
  | 'BIND_TASK'
  | 'UNBIND_TASK'
  | 'TEST_CONFIG'
  | 'RETRY_EXECUTION'
  | 'MANUAL_RESOLVE';

export interface ServiceTaskAuditEntry {
  id: string;
  action: ServiceTaskAuditAction;
  entityType: 'ServiceTaskDefinition' | 'ServiceTaskConfigVersion' | 'ServiceTaskBinding' | 'ServiceTaskExecutionLog';
  entityId: string;
  actor: string;
  at: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  configVersionNo?: number;
}

/* ─────────────────────────── Preview/validation helpers ─────────────────────────── */

export interface ServiceTaskSampleContext {
  variables: Record<string, unknown>;
  dossier: Record<string, unknown>;
  form: Record<string, unknown>;
  task: Record<string, unknown>;
  initiator: Record<string, unknown>;
  assignee: Record<string, unknown>;
  org: Record<string, unknown>;
  system: Record<string, unknown>;
  previousOutput: Record<string, unknown>;
}

export interface ServiceTaskValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ServiceTaskPreviewResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  resolvedInput: Record<string, unknown>;
  payload: Record<string, unknown>;
  simulatedResponse: Record<string, unknown>;
  mappedOutput: Record<string, unknown>;
}

export interface ServiceTaskValidationContext {
  types?: ServiceTaskType[];
  integrations?: typeof seedIntegrations;
  mappings?: MappingConfig[];
  dossierFieldWhitelist?: string[];
}

export const DEFAULT_ERROR_POLICY: ServiceTaskErrorPolicy = {
  timeoutMs: 30000,
  maxRetry: 3,
  retryDelayMs: 60000,
  retryBackoff: 'exponential',
  retryableErrorCodes: ['TIMEOUT', 'HTTP_502', 'HTTP_503', 'HTTP_504'],
  onFailure: 'CREATE_INCIDENT',
  notifyRoles: ['ADMIN', 'CQ_QLKHCN'],
};

export const DOSSIER_OUTPUT_FIELD_WHITELIST = [
  'trangThai',
  'maDongBoNgoai',
  'trangThaiDongBo',
  'ghiChuHeThong',
  'documentIds',
];

const EXPRESSION_RE = /\$\{([a-zA-Z][\w]*)\.([^}]+)\}/g;
const EXPRESSION_TOKEN_RE = /\$\{[^}]*\}/g;
const EXPRESSION_PATH_RE = /^[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)*$/;

function getPath(source: Record<string, unknown>, path?: string): unknown {
  if (!path) return source;
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return;
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  });
  cursor[parts[parts.length - 1]] = value;
}

function sourceBag(scope: string, context: ServiceTaskSampleContext): Record<string, unknown> | undefined {
  if (scope === 'variables') return context.variables;
  if (scope === 'dossier') return context.dossier;
  if (scope === 'form') return context.form;
  if (scope === 'task') return context.task;
  if (scope === 'initiator') return context.initiator;
  if (scope === 'assignee') return context.assignee;
  if (scope === 'org') return context.org;
  if (scope === 'system') return context.system;
  if (scope === 'previousOutput') return context.previousOutput;
  return undefined;
}

export function resolveExpression(expression: string, context: ServiceTaskSampleContext): unknown {
  const exact = expression.match(/^\$\{([a-zA-Z][\w]*)\.([^}]+)\}$/);
  if (exact) {
    return getPath(sourceBag(exact[1], context) ?? {}, exact[2]);
  }

  return expression.replace(EXPRESSION_RE, (_full, scope: string, path: string) => {
    const value = getPath(sourceBag(scope, context) ?? {}, path);
    return value == null ? '' : String(value);
  });
}

export function resolveInputMapping(
  mapping: ServiceTaskInputMapping[],
  context: ServiceTaskSampleContext,
): Record<string, unknown> {
  return mapping.reduce<Record<string, unknown>>((acc, item) => {
    acc[item.target] = resolveExpression(item.expression, context);
    return acc;
  }, {});
}

export function valueAtJsonPath(source: Record<string, unknown>, path: string): unknown {
  const normalized = path.replace(/^\$\./, '').replace(/^\$/, '');
  return getPath(source, normalized);
}

export function applyOutputMapping(
  response: Record<string, unknown>,
  outputMapping: ServiceTaskOutputMapping[],
): Record<string, unknown> {
  return outputMapping.reduce<Record<string, unknown>>((acc, item) => {
    const root = item.target;
    if (!acc[root]) acc[root] = {};
    setPath(acc[root] as Record<string, unknown>, item.targetPath, valueAtJsonPath(response, item.sourcePath));
    return acc;
  }, {});
}

export function maskServiceTaskPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskServiceTaskPayload);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      const sensitive = /secret|token|password|api.?key|authorization/i.test(key);
      return [key, sensitive ? '***' : maskServiceTaskPayload(item)];
    }),
  );
}

function validateExpression(expression: string, allowedScopes: string[]): string | null {
  if (!expression.trim()) return 'Biểu thức mapping đang rỗng.';
  const candidates = expression.match(EXPRESSION_TOKEN_RE) ?? [];
  const matches = Array.from(expression.matchAll(EXPRESSION_RE));
  if (matches.length === 0) return 'Biểu thức phải dùng placeholder dạng ${scope.path}.';
  if (candidates.length !== matches.length) {
    return 'Biểu thức có placeholder sai format; chỉ hỗ trợ ${scope.path}.';
  }
  const invalid = matches.find((m) => !allowedScopes.includes(m[1]));
  if (invalid) return `Scope "${invalid[1]}" không được hỗ trợ trong mapping.`;
  const invalidPath = matches.find((m) => !EXPRESSION_PATH_RE.test(m[2]));
  if (invalidPath) return `Path "${invalidPath[2]}" sai format.`;
  return null;
}

function validateExecutionConfig(
  config: ServiceTaskExecutionConfig,
  context: Required<ServiceTaskValidationContext>,
): string[] {
  const errors: string[] = [];

  if (config.typeCode === 'SEND_NOTIFICATION') {
    if (!config.templateCode.trim()) errors.push('Thiếu template thông báo.');
    if (config.channels.length === 0) errors.push('Thiếu kênh gửi thông báo.');
    const err = validateExpression(config.recipientExpression, ['variables', 'dossier', 'initiator', 'assignee', 'org']);
    if (err) errors.push(`Người nhận thông báo: ${err}`);
  }

  if (config.typeCode === 'CALL_API') {
    const integration = context.integrations.find((i) => i.key === config.connectorKey);
    if (!integration) errors.push(`Connector "${config.connectorKey}" không tồn tại.`);
    else if (integration.trangThai !== 'healthy') {
      errors.push(`Connector "${config.connectorKey}" đang không healthy.`);
    }
    if (!config.mappingConfigId) {
      errors.push('CALL_API phải tham chiếu một mapping active.');
    } else {
      const mapping = context.mappings.find((m) => m.id === config.mappingConfigId);
      if (!mapping) errors.push(`Mapping "${config.mappingConfigId}" không tồn tại.`);
      else {
        const validation = validateMappingConfig(mapping);
        if (mapping.he !== config.connectorKey) {
          errors.push(`Mapping "${mapping.id}" không thuộc connector "${config.connectorKey}".`);
        }
        if (mapping.trangThai !== 'active') errors.push(`Mapping "${mapping.id}" chưa active.`);
        if (!validation.valid) {
          errors.push(...validation.errors.map((e) => `Mapping "${mapping.id}": ${e}`));
        }
      }
    }
    if (!config.endpointAction.trim()) errors.push('Thiếu endpoint/action cần gọi.');
    if (config.idempotencyKeyExpression) {
      const err = validateExpression(config.idempotencyKeyExpression, ['variables', 'dossier', 'task', 'system']);
      if (err) errors.push(`Idempotency key: ${err}`);
    }
  }

  if (config.typeCode === 'UPDATE_DOSSIER') {
    if (config.updates.length === 0) errors.push('Chưa có field hồ sơ cần cập nhật.');
    config.updates.forEach((u) => {
      if (!context.dossierFieldWhitelist.includes(u.field)) {
        errors.push(`Field hồ sơ "${u.field}" không thuộc whitelist.`);
      }
      const err = validateExpression(u.valueExpression, ['variables', 'dossier', 'form', 'system', 'previousOutput']);
      if (err) errors.push(`Update "${u.field}": ${err}`);
    });
  }

  if (config.typeCode === 'GENERATE_DOCUMENT') {
    if (!config.templateCode.trim()) errors.push('Thiếu template tài liệu.');
    if (config.outputFolderExpression) {
      const err = validateExpression(config.outputFolderExpression, ['variables', 'dossier', 'task', 'system']);
      if (err) errors.push(`Thư mục xuất tài liệu: ${err}`);
    }
  }

  if (config.typeCode === 'EVALUATE_DECISION') {
    if (!config.decisionCode.trim()) errors.push('Thiếu mã DMN/decision.');
    if (!config.resultVariable.trim()) errors.push('Thiếu biến lưu kết quả decision.');
  }

  return errors;
}

export function validateServiceTaskConfig(
  definition: ServiceTaskDefinition,
  version: ServiceTaskConfigVersion,
  validationContext: ServiceTaskValidationContext = {},
): ServiceTaskValidationResult {
  const context: Required<ServiceTaskValidationContext> = {
    types: validationContext.types ?? seedServiceTaskTypes,
    integrations: validationContext.integrations ?? seedIntegrations,
    mappings: validationContext.mappings ?? seedMappingConfigs,
    dossierFieldWhitelist: validationContext.dossierFieldWhitelist ?? DOSSIER_OUTPUT_FIELD_WHITELIST,
  };
  const errors: string[] = [];
  const warnings: string[] = [];
  const type = context.types.find((t) => t.code === definition.typeCode);

  if (!type) errors.push(`Loại service task "${definition.typeCode}" không tồn tại.`);
  else if (!type.enabled) errors.push(`Loại service task "${type.name}" đang bị tắt.`);

  if (version.serviceTaskDefinitionId !== definition.id) {
    errors.push('Version không thuộc definition đang validate.');
  }

  if (version.configJson.typeCode !== definition.typeCode) {
    errors.push('Type của config version không khớp type của definition.');
  }

  if (version.errorPolicy.timeoutMs <= 0) errors.push('Timeout phải lớn hơn 0.');
  if (version.errorPolicy.maxRetry < 0) errors.push('maxRetry không được âm.');
  if (version.errorPolicy.retryDelayMs < 0) errors.push('retryDelayMs không được âm.');
  if (
    version.errorPolicy.onFailure === 'CONTINUE' &&
    (definition.typeCode === 'UPDATE_DOSSIER' || definition.typeCode === 'CALL_API')
  ) {
    warnings.push('Tác vụ có tác động dữ liệu/hệ ngoài đang cấu hình CONTINUE khi lỗi.');
  }

  version.inputMapping.forEach((m) => {
    const err = validateExpression(m.expression, [
      'variables',
      'dossier',
      'form',
      'task',
      'initiator',
      'assignee',
      'org',
      'system',
      'previousOutput',
    ]);
    if (err) errors.push(`Input "${m.target}": ${err}`);
  });

  version.outputMapping.forEach((m) => {
    if (m.target === 'dossier' && !context.dossierFieldWhitelist.includes(m.targetPath)) {
      errors.push(`Output mapping ghi vào field hồ sơ "${m.targetPath}" không thuộc whitelist.`);
    }
    if (!m.sourcePath.trim()) errors.push(`Output mapping "${m.id}" thiếu sourcePath.`);
    if (!m.targetPath.trim()) errors.push(`Output mapping "${m.id}" thiếu targetPath.`);
  });

  errors.push(...validateExecutionConfig(version.configJson, context));

  return { valid: errors.length === 0, errors, warnings };
}

function simulateResponse(config: ServiceTaskExecutionConfig, input: Record<string, unknown>): Record<string, unknown> {
  if (config.typeCode === 'SEND_NOTIFICATION') {
    return {
      delivered: true,
      channels: config.channels,
      recipientCount: input['nguoiNhan'] ? 1 : 0,
      messageId: 'msg-20260709-001',
    };
  }
  if (config.typeCode === 'CALL_API') {
    return {
      externalId: `${config.connectorKey}-EXT-20260709-001`,
      status: 'SYNCED',
      message: 'Đồng bộ thành công ở chế độ preview',
    };
  }
  if (config.typeCode === 'UPDATE_DOSSIER') {
    return {
      updated: true,
      fields: config.updates.map((u) => u.field),
    };
  }
  if (config.typeCode === 'GENERATE_DOCUMENT') {
    return {
      documentId: 'doc-20260709-001',
      templateCode: config.templateCode,
      fileName: `${config.templateCode}.pdf`,
    };
  }
  return {
    decisionCode: config.decisionCode,
    decision: 'APPROVE',
    reason: 'Preview mock decision',
  };
}

export function previewServiceTaskConfig(
  definition: ServiceTaskDefinition,
  version: ServiceTaskConfigVersion,
  sampleContext: ServiceTaskSampleContext,
  validationContext: ServiceTaskValidationContext = {},
): ServiceTaskPreviewResult {
  const validation = validateServiceTaskConfig(definition, version, validationContext);
  const resolvedInput = resolveInputMapping(version.inputMapping, sampleContext);
  const previewErrors = [...validation.errors];

  version.inputMapping.forEach((item) => {
    const value = resolvedInput[item.target];
    if (item.required && (value === undefined || value === null || value === '')) {
      previewErrors.push(`Input bắt buộc "${item.target}" không resolve được từ sample context.`);
    }
  });

  const payload = maskServiceTaskPayload({
    definitionCode: definition.code,
    typeCode: definition.typeCode,
    config: version.configJson,
    input: resolvedInput,
  }) as Record<string, unknown>;
  const simulatedResponse = simulateResponse(version.configJson, resolvedInput);
  const mappedOutput = applyOutputMapping(simulatedResponse, version.outputMapping);

  return {
    valid: previewErrors.length === 0,
    errors: previewErrors,
    warnings: validation.warnings,
    resolvedInput,
    payload,
    simulatedResponse,
    mappedOutput,
  };
}

/* ─────────────────────────── Seed data ─────────────────────────── */

export const seedServiceTaskTypes: ServiceTaskType[] = [
  {
    code: 'SEND_NOTIFICATION',
    name: 'Gửi thông báo',
    description: 'Gửi email/in-app/SMS/Zalo theo template đã được quản trị.',
    category: 'communication',
    inputSchema: [
      { key: 'nguoiNhan', label: 'Người nhận', type: 'string', required: true },
      { key: 'maHoSo', label: 'Mã hồ sơ', type: 'string', required: true },
    ],
    outputSchema: [
      { key: 'messageId', label: 'Mã thông điệp', type: 'string' },
      { key: 'delivered', label: 'Đã gửi', type: 'boolean' },
    ],
    capabilities: {
      supportsRetry: true,
      supportsPreview: true,
      requiresConnector: false,
      allowsOutputMapping: true,
      requiresTemplate: true,
    },
    enabled: true,
  },
  {
    code: 'CALL_API',
    name: 'Gọi API qua connector',
    description: 'Gọi endpoint/action của connector đã whitelist trong cấu hình tích hợp.',
    category: 'integration',
    inputSchema: [
      { key: 'maHoSo', label: 'Mã hồ sơ', type: 'string', required: true },
      { key: 'payload', label: 'Payload', type: 'object', required: true },
    ],
    outputSchema: [
      { key: 'externalId', label: 'Mã hệ ngoài', type: 'string' },
      { key: 'status', label: 'Trạng thái đồng bộ', type: 'string' },
      { key: 'message', label: 'Thông điệp', type: 'string' },
    ],
    capabilities: {
      supportsRetry: true,
      supportsPreview: true,
      requiresConnector: true,
      allowsOutputMapping: true,
    },
    enabled: true,
  },
  {
    code: 'UPDATE_DOSSIER',
    name: 'Cập nhật hồ sơ',
    description: 'Cập nhật trường/trạng thái hồ sơ trong whitelist.',
    category: 'data',
    inputSchema: [
      { key: 'maHoSo', label: 'Mã hồ sơ', type: 'string', required: true },
      { key: 'trangThai', label: 'Trạng thái mới', type: 'string' },
    ],
    outputSchema: [
      { key: 'updated', label: 'Đã cập nhật', type: 'boolean' },
      { key: 'fields', label: 'Field đã cập nhật', type: 'array' },
    ],
    capabilities: {
      supportsRetry: false,
      supportsPreview: true,
      requiresConnector: false,
      allowsOutputMapping: true,
      mutatesDossier: true,
    },
    enabled: true,
  },
  {
    code: 'GENERATE_DOCUMENT',
    name: 'Sinh tài liệu',
    description: 'Sinh văn bản từ template chính thức và gắn vào hồ sơ.',
    category: 'document',
    inputSchema: [
      { key: 'maHoSo', label: 'Mã hồ sơ', type: 'string', required: true },
      { key: 'templateCode', label: 'Template', type: 'string', required: true },
    ],
    outputSchema: [
      { key: 'documentId', label: 'Mã tài liệu', type: 'string' },
      { key: 'fileName', label: 'Tên file', type: 'string' },
    ],
    capabilities: {
      supportsRetry: true,
      supportsPreview: true,
      requiresConnector: false,
      allowsOutputMapping: true,
      requiresTemplate: true,
    },
    enabled: true,
  },
  {
    code: 'EVALUATE_DECISION',
    name: 'Đánh giá quyết định',
    description: 'Gọi DMN/rule đã quản trị và lưu kết quả về biến quy trình.',
    category: 'decision',
    inputSchema: [
      { key: 'cap', label: 'Cấp nhiệm vụ', type: 'string' },
      { key: 'tongDuToan', label: 'Tổng dự toán', type: 'string' },
    ],
    outputSchema: [
      { key: 'decision', label: 'Kết quả', type: 'string' },
      { key: 'reason', label: 'Lý do', type: 'string' },
    ],
    capabilities: {
      supportsRetry: false,
      supportsPreview: true,
      requiresConnector: false,
      allowsOutputMapping: true,
    },
    enabled: true,
  },
];

export const seedProcessServiceTasks: ProcessServiceTaskRef[] = [
  {
    processCode: 'RD01.01',
    processVersion: '1.2',
    bpmnProcessId: 'Process_RD0101',
    taskDefinitionKey: 'svc-notify-approval',
    taskName: 'Thông báo hồ sơ đã phê duyệt',
    jobType: 'khcn.notification.send',
    implementationHint: 'notification-template',
    critical: false,
  },
  {
    processCode: 'RD02.01',
    processVersion: '1.1',
    bpmnProcessId: 'Process_RD0201',
    taskDefinitionKey: 'svc-evaluate-routing',
    taskName: 'Đánh giá luật định tuyến RD02',
    jobType: 'khcn.rule.evaluate-routing',
    implementationHint: 'dmn',
    critical: true,
  },
  {
    // Bám đúng service task thật trong backend/src/main/resources/processes/rd0202.bpmn:57 —
    // taskDefinitionKey/jobType copy nguyên văn từ BPMN, KHÔNG đặt lại tên.
    // Lưu ý: processVersion ở đây là version của registry mock (RD02.02 mới có 1.0), không phải
    // version của process definition thật trên backend (0f92a992-… đang ở ver 2).
    processCode: 'RD02.02',
    processVersion: '1.0',
    bpmnProcessId: 'RD02_02',
    taskDefinitionKey: 'Check_ChuTruongTD',
    taskName: 'Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
    jobType: 'khcn.rd0202.check-chu-truong-td',
    implementationHint: 'precondition-check',
    critical: true,
  },
  {
    processCode: 'RD03.03',
    processVersion: '0.1',
    bpmnProcessId: 'Process_RD0303',
    taskDefinitionKey: 'svc-sync-sap-budget',
    taskName: 'Đồng bộ dự toán sang SAP',
    jobType: 'khcn.sync.sap',
    implementationHint: 'connector',
    critical: true,
  },
  {
    processCode: 'RD05.01',
    processVersion: '1.1',
    bpmnProcessId: 'Process_RD0501',
    taskDefinitionKey: 'svc-generate-acceptance-decision',
    taskName: 'Sinh quyết định công nhận kết quả',
    jobType: 'khcn.document.generate',
    implementationHint: 'document-template',
    critical: true,
  },
  {
    processCode: 'RD05.01',
    processVersion: '1.1',
    bpmnProcessId: 'Process_RD0501',
    taskDefinitionKey: 'svc-update-dossier-approved',
    taskName: 'Cập nhật trạng thái hồ sơ nghiệm thu',
    jobType: 'khcn.dossier.update',
    implementationHint: 'dossier',
    critical: true,
  },
];

export const seedServiceTaskDefinitions: ServiceTaskDefinition[] = [
  {
    id: 'std-notify-approved',
    code: 'NOTIFY_DOSSIER_APPROVED',
    name: 'Thông báo hồ sơ đã phê duyệt',
    description: 'Gửi thông báo cho chủ nhiệm và CQ QLKHCN khi hồ sơ được phê duyệt.',
    typeCode: 'SEND_NOTIFICATION',
    status: 'ACTIVE',
    ownerModule: 'Workflow Platform',
    tags: ['notification', 'approval'],
    activeVersionNo: 1,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-07-09 08:30',
    updatedAt: '2026-07-09 08:45',
  },
  {
    id: 'std-sync-sap-budget',
    code: 'SYNC_SAP_BUDGET',
    name: 'Đồng bộ dự toán sang SAP',
    description: 'Gọi connector SAP để đồng bộ kinh phí/dự toán của hồ sơ.',
    typeCode: 'CALL_API',
    status: 'ERROR',
    ownerModule: 'RD03',
    tags: ['sap', 'budget', 'integration'],
    activeVersionNo: 2,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-07-09 08:40',
    updatedAt: '2026-07-09 09:05',
  },
  {
    id: 'std-update-dossier-approved',
    code: 'UPDATE_DOSSIER_APPROVED',
    name: 'Cập nhật trạng thái hồ sơ đã duyệt',
    description: 'Đổi trạng thái hồ sơ và ghi metadata sau khi bước cuối hoàn tất.',
    typeCode: 'UPDATE_DOSSIER',
    status: 'READY',
    ownerModule: 'Dossier',
    tags: ['dossier', 'status'],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-07-09 09:00',
    updatedAt: '2026-07-09 09:10',
  },
  {
    id: 'std-generate-acceptance-decision',
    code: 'GENERATE_ACCEPTANCE_DECISION',
    name: 'Sinh quyết định công nhận kết quả',
    description: 'Sinh QĐ công nhận kết quả nghiệm thu từ template văn bản chính thức.',
    typeCode: 'GENERATE_DOCUMENT',
    status: 'ACTIVE',
    ownerModule: 'Document',
    tags: ['document', 'rd05'],
    activeVersionNo: 1,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-07-09 09:15',
    updatedAt: '2026-07-09 09:25',
  },
  {
    id: 'std-check-chu-truong-td',
    code: 'CHECK_CHU_TRUONG_TD',
    name: 'Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
    description:
      'Kiểm tra tiền điều kiện BR-RD0202-001 (đã có QĐ phê duyệt chủ trương cấp Tập đoàn từ RD01.02) ' +
      'rồi trả biến điều khiển dieuKienMacDinhDat cho gateway Gateway_BR.',
    typeCode: 'EVALUATE_DECISION',
    status: 'ACTIVE',
    ownerModule: 'RD02',
    tags: ['rd02', 'precondition', 'br-rd0202-001'],
    activeVersionNo: 1,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-07-20 10:00',
    updatedAt: '2026-07-20 10:05',
  },
  {
    id: 'std-evaluate-rd02-routing',
    code: 'EVALUATE_RD02_ROUTING',
    name: 'Đánh giá định tuyến RD02',
    description: 'Gọi DMN định tuyến xét duyệt RD02 và lưu kết quả vào process variables.',
    typeCode: 'EVALUATE_DECISION',
    status: 'DRAFT',
    ownerModule: 'Business Rule',
    tags: ['dmn', 'rd02'],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-07-09 09:20',
    updatedAt: '2026-07-09 09:20',
  },
];

export const seedServiceTaskConfigVersions: ServiceTaskConfigVersion[] = [
  {
    id: 'stv-notify-approved-v1',
    serviceTaskDefinitionId: 'std-notify-approved',
    versionNo: 1,
    configJson: {
      typeCode: 'SEND_NOTIFICATION',
      templateCode: 'tpl-dossier-approved',
      channels: ['email', 'in_app'],
      recipientExpression: '${variables.nextApproverEmail}',
      subjectExpression: 'Hồ sơ ${dossier.id} đã được phê duyệt',
    },
    inputMapping: [
      { id: 'in-notify-1', target: 'maHoSo', expression: '${dossier.id}', source: 'dossier', required: true },
      {
        id: 'in-notify-2',
        target: 'nguoiNhan',
        expression: '${variables.nextApproverEmail}',
        source: 'variables',
        required: true,
      },
    ],
    outputMapping: [
      { id: 'out-notify-1', sourcePath: '$.messageId', target: 'executionMetadata', targetPath: 'notificationMessageId' },
    ],
    errorPolicy: { ...DEFAULT_ERROR_POLICY, maxRetry: 2, onFailure: 'CREATE_INCIDENT' },
    status: 'ACTIVE',
    changeNote: 'Bản đầu cho thông báo phê duyệt.',
    createdBy: 'admin',
    createdAt: '2026-07-09 08:45',
  },
  {
    id: 'stv-sync-sap-v2',
    serviceTaskDefinitionId: 'std-sync-sap-budget',
    versionNo: 2,
    configJson: {
      typeCode: 'CALL_API',
      connectorKey: 'SAP',
      mappingConfigId: 'map-sap-dutoan',
      endpointAction: 'budget/sync',
      method: 'POST',
      idempotencyKeyExpression: '${dossier.id}-${variables.configVersion}',
    },
    inputMapping: [
      { id: 'in-sap-1', target: 'maHoSo', expression: '${dossier.id}', source: 'dossier', required: true },
      { id: 'in-sap-2', target: 'tongDuToan', expression: '${variables.totalBudget}', source: 'variables', required: true },
      { id: 'in-sap-3', target: 'donVi', expression: '${initiator.orgCode}', source: 'initiator', required: true },
    ],
    outputMapping: [
      { id: 'out-sap-1', sourcePath: '$.externalId', target: 'variables', targetPath: 'sapBudgetRequestId' },
      { id: 'out-sap-2', sourcePath: '$.status', target: 'variables', targetPath: 'sapSyncStatus' },
      { id: 'out-sap-3', sourcePath: '$.externalId', target: 'dossier', targetPath: 'maDongBoNgoai' },
    ],
    errorPolicy: {
      ...DEFAULT_ERROR_POLICY,
      timeoutMs: 45000,
      maxRetry: 3,
      onFailure: 'CREATE_INCIDENT',
      notifyRoles: ['ADMIN', 'CQ_TCKT', 'CQ_QLKHCN'],
    },
    status: 'ACTIVE',
    changeNote: 'Thêm idempotency key theo hồ sơ + version.',
    createdBy: 'admin',
    createdAt: '2026-07-09 09:05',
  },
  {
    id: 'stv-update-approved-v1',
    serviceTaskDefinitionId: 'std-update-dossier-approved',
    versionNo: 1,
    configJson: {
      typeCode: 'UPDATE_DOSSIER',
      allowedFields: ['trangThai', 'trangThaiDongBo', 'ghiChuHeThong'],
      updates: [
        { field: 'trangThai', valueExpression: '${variables.nextDossierStatus}' },
        { field: 'ghiChuHeThong', valueExpression: 'Cập nhật tự động từ service task ${task.key}' },
      ],
    },
    inputMapping: [
      { id: 'in-update-1', target: 'maHoSo', expression: '${dossier.id}', source: 'dossier', required: true },
      {
        id: 'in-update-2',
        target: 'trangThaiMoi',
        expression: '${variables.nextDossierStatus}',
        source: 'variables',
        required: true,
      },
    ],
    outputMapping: [
      { id: 'out-update-1', sourcePath: '$.updated', target: 'executionMetadata', targetPath: 'dossierUpdated' },
    ],
    errorPolicy: { ...DEFAULT_ERROR_POLICY, maxRetry: 0, onFailure: 'FAIL_PROCESS' },
    status: 'READY',
    changeNote: 'Nháp sẵn sàng chờ active sau khi chốt whitelist.',
    createdBy: 'admin',
    createdAt: '2026-07-09 09:10',
  },
  {
    id: 'stv-generate-acceptance-v1',
    serviceTaskDefinitionId: 'std-generate-acceptance-decision',
    versionNo: 1,
    configJson: {
      typeCode: 'GENERATE_DOCUMENT',
      templateCode: 'qd-cong-nhan',
      outputFolderExpression: 'dossier/${dossier.id}/documents',
      attachToDossier: true,
    },
    inputMapping: [
      { id: 'in-doc-1', target: 'maHoSo', expression: '${dossier.id}', source: 'dossier', required: true },
      {
        id: 'in-doc-2',
        target: 'templateCode',
        expression: '${system.acceptanceDecisionTemplateCode}',
        source: 'system',
        required: true,
      },
    ],
    outputMapping: [
      { id: 'out-doc-1', sourcePath: '$.documentId', target: 'dossier', targetPath: 'documentIds' },
      { id: 'out-doc-2', sourcePath: '$.fileName', target: 'variables', targetPath: 'acceptanceDecisionFileName' },
    ],
    errorPolicy: {
      ...DEFAULT_ERROR_POLICY,
      maxRetry: 2,
      onFailure: 'MANUAL_TASK',
      notifyRoles: ['ADMIN', 'CQ_QLKHCN'],
    },
    status: 'ACTIVE',
    changeNote: 'Sinh QĐ công nhận nghiệm thu.',
    createdBy: 'admin',
    createdAt: '2026-07-09 09:25',
  },
  {
    id: 'stv-check-chu-truong-td-v1',
    serviceTaskDefinitionId: 'std-check-chu-truong-td',
    versionNo: 1,
    configJson: {
      typeCode: 'EVALUATE_DECISION',
      // CHƯA CÓ DMN thật cho tiền điều kiện này — worker Java hiện trả true vô điều kiện
      // (SystemCheckJobWorker.checkChuTruongTapDoan), vì nguồn dữ liệu là RD01.02 mà RD01.02
      // chưa có BPMN. decisionCode dưới đây là chỗ đặt sẵn, phải trỏ DMN thật khi nối dữ liệu.
      decisionCode: 'rd0202-check-chu-truong-td',
      resultVariable: 'dieuKienMacDinhDat',
    },
    inputMapping: [
      { id: 'in-ctrtd-1', target: 'maHoSo', expression: '${variables.maHoSo}', source: 'variables', required: true },
      { id: 'in-ctrtd-2', target: 'maNhiemVu', expression: '${dossier.maNV}', source: 'dossier', required: true },
    ],
    outputMapping: [
      // Đích là đúng biến điều khiển trong ProcessVariableContract mà Gateway_BR đọc (D3: chỉ
      // biến điều khiển, không nhét dữ liệu nghiệp vụ vào process).
      { id: 'out-ctrtd-1', sourcePath: '$.decision', target: 'variables', targetPath: 'dieuKienMacDinhDat' },
      { id: 'out-ctrtd-2', sourcePath: '$.reason', target: 'executionMetadata', targetPath: 'lyDoThieuChuTruong' },
    ],
    // maxRetry 3 khớp retries="3" khai báo trên serviceTask trong rd0202.bpmn; hết retry thì
    // Zeebe tạo incident nên onFailure để CREATE_INCIDENT.
    errorPolicy: {
      ...DEFAULT_ERROR_POLICY,
      maxRetry: 3,
      onFailure: 'CREATE_INCIDENT',
      notifyRoles: ['ADMIN', 'CQ_KHCN_TD'],
    },
    status: 'ACTIVE',
    changeNote: 'Cấu hình cho service task Check_ChuTruongTD của RD02.02.',
    createdBy: 'admin',
    createdAt: '2026-07-20 10:05',
  },
  {
    id: 'stv-evaluate-rd02-v1',
    serviceTaskDefinitionId: 'std-evaluate-rd02-routing',
    versionNo: 1,
    configJson: {
      typeCode: 'EVALUATE_DECISION',
      decisionCode: 'rd02-routing',
      decisionVersion: '1.0',
      resultVariable: 'rd02RoutingDecision',
    },
    inputMapping: [
      { id: 'in-dmn-1', target: 'cap', expression: '${dossier.cap}', source: 'dossier', required: true },
      { id: 'in-dmn-2', target: 'tongDuToan', expression: '${variables.totalBudget}', source: 'variables', required: true },
    ],
    outputMapping: [
      { id: 'out-dmn-1', sourcePath: '$.decision', target: 'variables', targetPath: 'rd02RoutingDecision' },
      { id: 'out-dmn-2', sourcePath: '$.reason', target: 'variables', targetPath: 'rd02RoutingReason' },
    ],
    errorPolicy: { ...DEFAULT_ERROR_POLICY, maxRetry: 0, onFailure: 'FAIL_PROCESS' },
    status: 'DRAFT',
    changeNote: 'Nháp cấu hình gọi DMN định tuyến.',
    createdBy: 'admin',
    createdAt: '2026-07-09 09:20',
  },
];

export const seedServiceTaskBindings: ServiceTaskBinding[] = [
  {
    id: 'stb-rd0101-notify',
    processCode: 'RD01.01',
    processVersion: '1.2',
    bpmnProcessId: 'Process_RD0101',
    taskDefinitionKey: 'svc-notify-approval',
    taskName: 'Thông báo hồ sơ đã phê duyệt',
    jobType: 'khcn.notification.send',
    serviceTaskDefinitionId: 'std-notify-approved',
    bindingStatus: 'ACTIVE',
    effectiveFrom: '2026-07-09',
    createdBy: 'admin',
    updatedAt: '2026-07-09 09:00',
  },
  {
    id: 'stb-rd0303-sap',
    processCode: 'RD03.03',
    processVersion: '0.1',
    bpmnProcessId: 'Process_RD0303',
    taskDefinitionKey: 'svc-sync-sap-budget',
    taskName: 'Đồng bộ dự toán sang SAP',
    jobType: 'khcn.sync.sap',
    serviceTaskDefinitionId: 'std-sync-sap-budget',
    bindingStatus: 'ERROR',
    effectiveFrom: '2026-07-09',
    createdBy: 'admin',
    updatedAt: '2026-07-09 09:08',
  },
  {
    id: 'stb-rd0202-check-chu-truong',
    processCode: 'RD02.02',
    processVersion: '1.0',
    bpmnProcessId: 'RD02_02',
    taskDefinitionKey: 'Check_ChuTruongTD',
    taskName: 'Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
    jobType: 'khcn.rd0202.check-chu-truong-td',
    serviceTaskDefinitionId: 'std-check-chu-truong-td',
    bindingStatus: 'ACTIVE',
    effectiveFrom: '2026-07-20',
    createdBy: 'admin',
    updatedAt: '2026-07-20 10:10',
  },
  {
    id: 'stb-rd0501-doc',
    processCode: 'RD05.01',
    processVersion: '1.1',
    bpmnProcessId: 'Process_RD0501',
    taskDefinitionKey: 'svc-generate-acceptance-decision',
    taskName: 'Sinh quyết định công nhận kết quả',
    jobType: 'khcn.document.generate',
    serviceTaskDefinitionId: 'std-generate-acceptance-decision',
    bindingStatus: 'ACTIVE',
    effectiveFrom: '2026-07-09',
    createdBy: 'admin',
    updatedAt: '2026-07-09 09:30',
  },
];

export const seedServiceTaskExecutionLogs: ServiceTaskExecutionLog[] = [
  {
    id: 'stel-018-notify',
    processInstanceKey: '2251799813685284',
    processCode: 'RD01.01',
    processVersion: '1.2',
    taskDefinitionKey: 'svc-notify-approval',
    taskName: 'Thông báo hồ sơ đã phê duyệt',
    serviceTaskDefinitionId: 'std-notify-approved',
    configVersionNo: 1,
    status: 'SUCCESS',
    startedAt: '2026-06-27 16:42',
    finishedAt: '2026-06-27 16:42',
    durationMs: 820,
    attemptNo: 1,
    requestSummary: { maHoSo: 'HS-2026-018', channels: ['email', 'in_app'], recipient: '***' },
    responseSummary: { delivered: true, messageId: 'msg-018-0001' },
    actor: 'job worker: notification',
  },
  {
    id: 'stel-033-sap',
    processInstanceKey: '2251799813693318',
    processCode: 'RD03.03',
    processVersion: '0.1',
    taskDefinitionKey: 'svc-sync-sap-budget',
    taskName: 'Đồng bộ dự toán sang SAP',
    serviceTaskDefinitionId: 'std-sync-sap-budget',
    configVersionNo: 2,
    status: 'FAILED',
    startedAt: '2026-07-02 14:05',
    finishedAt: '2026-07-02 14:06',
    durationMs: 61000,
    attemptNo: 3,
    requestSummary: { maHoSo: 'HS-2026-033', connectorKey: 'SAP', endpointAction: 'budget/sync', apiKey: '***' },
    responseSummary: { status: 504, message: 'Gateway timeout' },
    errorCode: 'HTTP_504',
    errorMessage: 'SAP trả HTTP 504, hết số lần thử.',
    incidentId: 'INC-SVC-20260702-001',
    actor: 'job worker: sap',
  },
  {
    id: 'stel-035-doc',
    processInstanceKey: '2251799813690112',
    processCode: 'RD05.01',
    processVersion: '1.1',
    taskDefinitionKey: 'svc-generate-acceptance-decision',
    taskName: 'Sinh quyết định công nhận kết quả',
    serviceTaskDefinitionId: 'std-generate-acceptance-decision',
    configVersionNo: 1,
    status: 'SUCCESS',
    startedAt: '2026-07-01 10:01',
    finishedAt: '2026-07-01 10:01',
    durationMs: 1430,
    attemptNo: 1,
    requestSummary: { maHoSo: 'HS-2026-035', templateCode: 'qd-cong-nhan' },
    responseSummary: { documentId: 'doc-035-qd-cong-nhan', fileName: 'QD-cong-nhan-HS-2026-035.pdf' },
    actor: 'job worker: document',
  },
];

export const seedServiceTaskAuditEntries: ServiceTaskAuditEntry[] = [
  {
    id: 'sta-001',
    action: 'CREATE_DEFINITION',
    entityType: 'ServiceTaskDefinition',
    entityId: 'std-sync-sap-budget',
    actor: 'admin',
    at: '2026-07-09 08:40',
    after: { code: 'SYNC_SAP_BUDGET', typeCode: 'CALL_API' },
  },
  {
    id: 'sta-002',
    action: 'ACTIVATE_VERSION',
    entityType: 'ServiceTaskConfigVersion',
    entityId: 'stv-sync-sap-v2',
    actor: 'admin',
    at: '2026-07-09 09:05',
    reason: 'Chốt mapping SAP v3 và policy retry.',
    configVersionNo: 2,
  },
  {
    id: 'sta-003',
    action: 'BIND_TASK',
    entityType: 'ServiceTaskBinding',
    entityId: 'stb-rd0303-sap',
    actor: 'admin',
    at: '2026-07-09 09:08',
    after: {
      processCode: 'RD03.03',
      processVersion: '0.1',
      taskDefinitionKey: 'svc-sync-sap-budget',
      serviceTaskDefinitionId: 'std-sync-sap-budget',
    },
  },
  {
    id: 'sta-004',
    action: 'TEST_CONFIG',
    entityType: 'ServiceTaskConfigVersion',
    entityId: 'stv-generate-acceptance-v1',
    actor: 'admin',
    at: '2026-07-09 09:26',
    reason: 'Preview sinh QĐ công nhận với hồ sơ nghiệm thu mẫu.',
    configVersionNo: 1,
  },
];

export const sampleServiceTaskContext: ServiceTaskSampleContext = {
  variables: {
    totalBudget: '2.500.000.000 VND',
    nextApproverEmail: 'cqqlkhcn@vht.vn',
    nextDossierStatus: 'approved',
    configVersion: 'v2',
  },
  dossier: {
    id: 'HS-2026-033',
    maNV: 'RD.2026.033',
    cap: 'Cơ sở',
    tenDeTai: 'Nghiên cứu nền tảng mô phỏng số cho sản phẩm KHCN',
    trangThai: 'processing',
  },
  form: { ketQuaThamDinh: 'Đạt' },
  task: { key: 'svc-sync-sap-budget', name: 'Đồng bộ dự toán sang SAP' },
  initiator: { userId: 'pm01', orgCode: 'VHT-RD', email: 'pm01@vht.vn' },
  assignee: { userId: 'worker-sap' },
  org: { code: 'VHT' },
  system: { today: '2026-07-09', acceptanceDecisionTemplateCode: 'qd-cong-nhan' },
  previousOutput: {},
};

/* ─────────────────────────── Input types for service ──────────────────────── */

export interface CreateServiceTaskDefinitionInput {
  code: string;
  name: string;
  description: string;
  typeCode: ServiceTaskTypeCode;
  ownerModule: string;
  tags?: string[];
  actor: string;
}

export interface SaveDraftServiceTaskVersionPatch {
  configJson?: ServiceTaskExecutionConfig;
  inputMapping?: ServiceTaskInputMapping[];
  outputMapping?: ServiceTaskOutputMapping[];
  errorPolicy?: ServiceTaskErrorPolicy;
}

export interface BindServiceTaskInput {
  processCode: string;
  processVersion: string;
  bpmnProcessId: string;
  taskDefinitionKey: string;
  taskName: string;
  jobType: string;
  serviceTaskDefinitionId: string;
  actor: string;
}
