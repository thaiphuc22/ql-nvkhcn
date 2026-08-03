import { Injectable, computed, signal } from '@angular/core';

import {
  DEFAULT_ERROR_POLICY,
  previewServiceTaskConfig,
  sampleServiceTaskContext,
  seedServiceTaskAuditEntries,
  seedServiceTaskBindings,
  seedServiceTaskConfigVersions,
  seedServiceTaskDefinitions,
  seedServiceTaskExecutionLogs,
  seedServiceTaskTypes,
  validateServiceTaskConfig,
  type BindServiceTaskInput,
  type CreateServiceTaskDefinitionInput,
  type SaveDraftServiceTaskVersionPatch,
  type ServiceTaskAuditAction,
  type ServiceTaskAuditEntry,
  type ServiceTaskBinding,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskExecutionConfig,
  type ServiceTaskExecutionLog,
  type ServiceTaskPreviewResult,
  type ServiceTaskSampleContext,
  type ServiceTaskType,
  type ServiceTaskTypeCode,
  type ServiceTaskValidationResult,
} from '../models/service-task';
import { seedMappingConfigs } from '../models/integration-mapping';

// Signal store thay ServiceTaskContext.tsx (React) — không backend (xác nhận không
// có contract ServiceTaskDefinition/Version/Binding trong backend/src/main/java),
// giữ đúng hành vi in-memory của bản gốc.

const TODAY = '2026-07-09';

function nowStamp(): string {
  return `${TODAY} ${new Date().toTimeString().slice(0, 5)}`;
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function cloneVersion(
  version: ServiceTaskConfigVersion,
  definitionId: string,
  nextVersionNo: number,
  actor: string,
  changeNote: string,
): ServiceTaskConfigVersion {
  return {
    ...version,
    id: id('stv'),
    serviceTaskDefinitionId: definitionId,
    versionNo: nextVersionNo,
    status: 'DRAFT',
    changeNote,
    createdBy: actor,
    createdAt: nowStamp(),
  };
}

function defaultConfig(typeCode: ServiceTaskTypeCode): ServiceTaskExecutionConfig {
  if (typeCode === 'SEND_NOTIFICATION') {
    return { typeCode, templateCode: '', channels: ['in_app'], recipientExpression: '${initiator.email}' };
  }
  if (typeCode === 'CALL_API') {
    return { typeCode, connectorKey: '', endpointAction: '', method: 'POST' };
  }
  if (typeCode === 'UPDATE_DOSSIER') {
    return { typeCode, allowedFields: [], updates: [] };
  }
  if (typeCode === 'GENERATE_DOCUMENT') {
    return { typeCode, templateCode: '', attachToDossier: true };
  }
  if (typeCode === 'AI_AGENT') {
    return { typeCode, model: 'gpt-4o-mini', maxTokens: 512, promptTemplateCode: '', resultDossierField: '' };
  }
  return { typeCode, decisionCode: '', resultVariable: '' };
}

function audit(
  action: ServiceTaskAuditAction,
  entityType: ServiceTaskAuditEntry['entityType'],
  entityId: string,
  actor: string,
  detail: Omit<ServiceTaskAuditEntry, 'id' | 'action' | 'entityType' | 'entityId' | 'actor' | 'at'> = {},
): ServiceTaskAuditEntry {
  return { id: id('sta'), action, entityType, entityId, actor, at: nowStamp(), ...detail };
}

@Injectable({ providedIn: 'root' })
export class ServiceTaskService {
  private readonly typesSignal = signal<ServiceTaskType[]>(seedServiceTaskTypes);
  private readonly definitionsSignal = signal<ServiceTaskDefinition[]>(seedServiceTaskDefinitions);
  private readonly versionsSignal = signal<ServiceTaskConfigVersion[]>(seedServiceTaskConfigVersions);
  private readonly bindingsSignal = signal<ServiceTaskBinding[]>(seedServiceTaskBindings);
  private readonly executionLogsSignal = signal<ServiceTaskExecutionLog[]>(seedServiceTaskExecutionLogs);
  private readonly auditEntriesSignal = signal<ServiceTaskAuditEntry[]>(seedServiceTaskAuditEntries);

  readonly types = this.typesSignal.asReadonly();
  readonly definitions = this.definitionsSignal.asReadonly();
  readonly versions = this.versionsSignal.asReadonly();
  readonly bindings = this.bindingsSignal.asReadonly();
  readonly executionLogs = this.executionLogsSignal.asReadonly();
  readonly auditEntries = this.auditEntriesSignal.asReadonly();

  private readonly validationContext = computed(() => ({
    types: this.typesSignal(),
    mappings: seedMappingConfigs,
  }));

  private appendAudit(entry: ServiceTaskAuditEntry): void {
    this.auditEntriesSignal.update((prev) => [entry, ...prev]);
  }

  getDefinition(definitionId: string): ServiceTaskDefinition | undefined {
    return this.definitionsSignal().find((d) => d.id === definitionId);
  }

  getVersions(definitionId: string): ServiceTaskConfigVersion[] {
    return this.versionsSignal()
      .filter((v) => v.serviceTaskDefinitionId === definitionId)
      .sort((a, b) => b.versionNo - a.versionNo);
  }

  getVersion(definitionId: string, versionNo: number): ServiceTaskConfigVersion | undefined {
    return this.versionsSignal().find((v) => v.serviceTaskDefinitionId === definitionId && v.versionNo === versionNo);
  }

  getActiveVersion(definitionId: string): ServiceTaskConfigVersion | undefined {
    const definition = this.getDefinition(definitionId);
    return definition?.activeVersionNo
      ? this.getVersion(definitionId, definition.activeVersionNo)
      : this.versionsSignal().find((v) => v.serviceTaskDefinitionId === definitionId && v.status === 'ACTIVE');
  }

  createDefinition(input: CreateServiceTaskDefinitionInput): string {
    const definitionId = id('std');
    const stamp = nowStamp();
    const definition: ServiceTaskDefinition = {
      id: definitionId,
      code: input.code.trim(),
      name: input.name.trim(),
      description: input.description.trim(),
      typeCode: input.typeCode,
      status: 'DRAFT',
      ownerModule: input.ownerModule.trim(),
      tags: input.tags ?? [],
      createdBy: input.actor,
      updatedBy: input.actor,
      createdAt: stamp,
      updatedAt: stamp,
    };
    const version: ServiceTaskConfigVersion = {
      id: id('stv'),
      serviceTaskDefinitionId: definitionId,
      versionNo: 1,
      configJson: defaultConfig(input.typeCode),
      inputMapping: [],
      outputMapping: [],
      errorPolicy: { ...DEFAULT_ERROR_POLICY },
      status: 'DRAFT',
      changeNote: 'Khởi tạo cấu hình nháp.',
      createdBy: input.actor,
      createdAt: stamp,
    };

    this.definitionsSignal.update((prev) => [definition, ...prev]);
    this.versionsSignal.update((prev) => [version, ...prev]);
    this.appendAudit(
      audit('CREATE_DEFINITION', 'ServiceTaskDefinition', definitionId, input.actor, {
        after: { code: definition.code, typeCode: definition.typeCode },
      }),
    );
    return definitionId;
  }

  updateDefinition(definitionId: string, patch: Partial<ServiceTaskDefinition>, actor: string): void {
    const before = this.getDefinition(definitionId);
    this.definitionsSignal.update((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? { ...d, ...patch, id: d.id, typeCode: patch.typeCode ?? d.typeCode, updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    );
    this.appendAudit(
      audit('UPDATE_DEFINITION', 'ServiceTaskDefinition', definitionId, actor, {
        before: before ? { code: before.code, name: before.name, status: before.status } : undefined,
        after: patch as Record<string, unknown>,
      }),
    );
  }

  duplicateDefinition(definitionId: string, actor: string): string | null {
    const source = this.getDefinition(definitionId);
    if (!source) return null;
    const sourceVersions = this.getVersions(definitionId);
    const sourceLatest = sourceVersions[0];
    const duplicateId = id('std');
    const stamp = nowStamp();
    const duplicate: ServiceTaskDefinition = {
      ...source,
      id: duplicateId,
      code: `${source.code}_COPY`,
      name: `${source.name} (bản sao)`,
      status: 'DRAFT',
      activeVersionNo: undefined,
      createdBy: actor,
      updatedBy: actor,
      createdAt: stamp,
      updatedAt: stamp,
    };

    this.definitionsSignal.update((prev) => [duplicate, ...prev]);
    if (sourceLatest) {
      this.versionsSignal.update((prev) => [
        cloneVersion(sourceLatest, duplicateId, 1, actor, 'Sao chép từ cấu hình gốc.'),
        ...prev,
      ]);
    }
    this.appendAudit(
      audit('DUPLICATE_DEFINITION', 'ServiceTaskDefinition', duplicateId, actor, {
        before: { sourceId: definitionId },
        after: { code: duplicate.code },
      }),
    );
    return duplicateId;
  }

  saveDraftVersion(
    definitionId: string,
    patch: SaveDraftServiceTaskVersionPatch,
    changeNote: string,
    actor: string,
  ): number | null {
    const definition = this.getDefinition(definitionId);
    if (!definition) return null;
    const latest = this.getVersions(definitionId)[0];
    const nextVersionNo = latest ? latest.versionNo + 1 : 1;
    const baseVersion: ServiceTaskConfigVersion =
      latest ??
      ({
        id: id('stv'),
        serviceTaskDefinitionId: definitionId,
        versionNo: 0,
        configJson: defaultConfig(definition.typeCode),
        inputMapping: [],
        outputMapping: [],
        errorPolicy: { ...DEFAULT_ERROR_POLICY },
        status: 'DRAFT',
        changeNote: '',
        createdBy: actor,
        createdAt: nowStamp(),
      } satisfies ServiceTaskConfigVersion);
    const draft: ServiceTaskConfigVersion = {
      ...cloneVersion(baseVersion, definitionId, nextVersionNo, actor, changeNote || 'Lưu bản nháp.'),
      ...patch,
      status: 'DRAFT',
    };

    this.versionsSignal.update((prev) => [draft, ...prev]);
    this.definitionsSignal.update((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? { ...d, status: d.status === 'ACTIVE' ? d.status : 'DRAFT', updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    );
    this.appendAudit(
      audit('SAVE_VERSION', 'ServiceTaskConfigVersion', draft.id, actor, {
        reason: changeNote,
        configVersionNo: draft.versionNo,
      }),
    );
    return draft.versionNo;
  }

  validateVersion(definitionId: string, versionNo: number, actor = 'system'): ServiceTaskValidationResult {
    const definition = this.getDefinition(definitionId);
    const version = this.getVersion(definitionId, versionNo);
    if (!definition || !version) {
      return { valid: false, errors: ['Không tìm thấy definition hoặc config version.'], warnings: [] };
    }
    const result = validateServiceTaskConfig(definition, version, this.validationContext());
    this.versionsSignal.update((prev) =>
      prev.map((v) =>
        v.id === version.id && v.status !== 'ACTIVE' && v.status !== 'ARCHIVED'
          ? { ...v, status: result.valid ? 'READY' : 'ERROR' }
          : v,
      ),
    );
    this.definitionsSignal.update((prev) =>
      prev.map((d) =>
        d.id === definitionId && d.status !== 'ACTIVE' && d.status !== 'DEPRECATED'
          ? { ...d, status: result.valid ? 'READY' : 'ERROR', updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    );
    this.appendAudit(
      audit('VALIDATE_VERSION', 'ServiceTaskConfigVersion', version.id, actor, {
        after: { valid: result.valid, errors: result.errors },
        configVersionNo: version.versionNo,
      }),
    );
    return result;
  }

  activateVersion(definitionId: string, versionNo: number, actor: string, reason: string): ServiceTaskValidationResult {
    const definition = this.getDefinition(definitionId);
    const version = this.getVersion(definitionId, versionNo);
    if (!definition || !version) {
      return { valid: false, errors: ['Không tìm thấy definition hoặc config version.'], warnings: [] };
    }
    const result = validateServiceTaskConfig(definition, version, this.validationContext());
    if (!result.valid) {
      this.versionsSignal.update((prev) => prev.map((v) => (v.id === version.id ? { ...v, status: 'ERROR' } : v)));
      this.definitionsSignal.update((prev) =>
        prev.map((d) => (d.id === definitionId ? { ...d, status: 'ERROR', updatedBy: actor, updatedAt: nowStamp() } : d)),
      );
      this.appendAudit(
        audit('VALIDATE_VERSION', 'ServiceTaskConfigVersion', version.id, actor, {
          after: { valid: false, errors: result.errors },
          reason,
          configVersionNo: version.versionNo,
        }),
      );
      return result;
    }

    this.versionsSignal.update((prev) =>
      prev.map((v) => {
        if (v.serviceTaskDefinitionId !== definitionId) return v;
        if (v.versionNo === versionNo) return { ...v, status: 'ACTIVE' };
        return v.status === 'ACTIVE' ? { ...v, status: 'ARCHIVED' } : v;
      }),
    );
    this.definitionsSignal.update((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? { ...d, status: 'ACTIVE', activeVersionNo: versionNo, updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    );
    this.appendAudit(
      audit('ACTIVATE_VERSION', 'ServiceTaskConfigVersion', version.id, actor, { reason, configVersionNo: version.versionNo }),
    );
    return result;
  }

  deprecateDefinition(definitionId: string, actor: string, reason: string): void {
    this.definitionsSignal.update((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? { ...d, status: 'DEPRECATED', activeVersionNo: undefined, updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    );
    this.versionsSignal.update((prev) =>
      prev.map((v) => (v.serviceTaskDefinitionId === definitionId && v.status === 'ACTIVE' ? { ...v, status: 'ARCHIVED' } : v)),
    );
    this.appendAudit(audit('DEPRECATE_DEFINITION', 'ServiceTaskDefinition', definitionId, actor, { reason }));
  }

  bindTask(input: BindServiceTaskInput): string {
    const bindingId = id('stb');
    const binding: ServiceTaskBinding = {
      id: bindingId,
      processCode: input.processCode,
      processVersion: input.processVersion,
      bpmnProcessId: input.bpmnProcessId,
      taskDefinitionKey: input.taskDefinitionKey,
      taskName: input.taskName,
      jobType: input.jobType,
      serviceTaskDefinitionId: input.serviceTaskDefinitionId,
      bindingStatus: 'ACTIVE',
      effectiveFrom: TODAY,
      createdBy: input.actor,
      updatedAt: nowStamp(),
    };

    this.bindingsSignal.update((prev) => [
      binding,
      ...prev.map((b) =>
        b.processCode === input.processCode &&
        b.processVersion === input.processVersion &&
        b.taskDefinitionKey === input.taskDefinitionKey &&
        b.bindingStatus === 'ACTIVE'
          ? { ...b, bindingStatus: 'INACTIVE' as const, effectiveTo: TODAY, updatedAt: nowStamp() }
          : b,
      ),
    ]);
    this.appendAudit(
      audit('BIND_TASK', 'ServiceTaskBinding', bindingId, input.actor, {
        after: {
          processCode: input.processCode,
          processVersion: input.processVersion,
          taskDefinitionKey: input.taskDefinitionKey,
          serviceTaskDefinitionId: input.serviceTaskDefinitionId,
        },
      }),
    );
    return bindingId;
  }

  unbindTask(bindingId: string, actor = 'system'): void {
    this.bindingsSignal.update((prev) =>
      prev.map((b) => (b.id === bindingId ? { ...b, bindingStatus: 'INACTIVE', effectiveTo: TODAY, updatedAt: nowStamp() } : b)),
    );
    this.appendAudit(audit('UNBIND_TASK', 'ServiceTaskBinding', bindingId, actor));
  }

  runPreview(
    definitionId: string,
    versionNo: number,
    context: ServiceTaskSampleContext = sampleServiceTaskContext,
    actor = 'system',
  ): ServiceTaskPreviewResult | null {
    const definition = this.getDefinition(definitionId);
    const version = this.getVersion(definitionId, versionNo);
    if (!definition || !version) return null;
    const preview = previewServiceTaskConfig(definition, version, context, this.validationContext());
    this.appendAudit(
      audit('TEST_CONFIG', 'ServiceTaskConfigVersion', version.id, actor, {
        after: { valid: preview.valid, errors: preview.errors },
        configVersionNo: version.versionNo,
      }),
    );
    return preview;
  }

  retryExecution(logId: string, actor: string): void {
    this.executionLogsSignal.update((prev) =>
      prev.map((log) =>
        log.id === logId && log.status === 'FAILED'
          ? { ...log, status: 'RETRYING', attemptNo: log.attemptNo + 1, finishedAt: undefined, durationMs: undefined, actor }
          : log,
      ),
    );
    this.appendAudit(audit('RETRY_EXECUTION', 'ServiceTaskExecutionLog', logId, actor));
  }

  manualResolveExecution(logId: string, actor: string, note: string): void {
    this.executionLogsSignal.update((prev) =>
      prev.map((log) =>
        log.id === logId
          ? { ...log, status: 'MANUAL_RESOLVED', finishedAt: nowStamp(), errorMessage: note || log.errorMessage, actor }
          : log,
      ),
    );
    this.appendAudit(audit('MANUAL_RESOLVE', 'ServiceTaskExecutionLog', logId, actor, { reason: note }));
  }
}
