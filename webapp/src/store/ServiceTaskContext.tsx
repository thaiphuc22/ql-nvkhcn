import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
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
  type ServiceTaskAuditAction,
  type ServiceTaskAuditEntry,
  type ServiceTaskBinding,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskExecutionConfig,
  type ServiceTaskExecutionLog,
  type ServiceTaskInputMapping,
  type ServiceTaskOutputMapping,
  type ServiceTaskPreviewResult,
  type ServiceTaskSampleContext,
  type ServiceTaskType,
  type ServiceTaskTypeCode,
  type ServiceTaskValidationResult,
} from '../data/serviceTasks'
import { useIntegrationMapping } from './IntegrationMappingContext'

const TODAY = '2026-07-09'

function nowStamp(): string {
  return `${TODAY} ${new Date().toTimeString().slice(0, 5)}`
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
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
  }
}

function defaultConfig(typeCode: ServiceTaskTypeCode): ServiceTaskExecutionConfig {
  if (typeCode === 'SEND_NOTIFICATION') {
    return {
      typeCode,
      templateCode: '',
      channels: ['in_app'],
      recipientExpression: '${initiator.email}',
    }
  }
  if (typeCode === 'CALL_API') {
    return {
      typeCode,
      connectorKey: '',
      endpointAction: '',
      method: 'POST',
    }
  }
  if (typeCode === 'UPDATE_DOSSIER') {
    return {
      typeCode,
      allowedFields: [],
      updates: [],
    }
  }
  if (typeCode === 'GENERATE_DOCUMENT') {
    return {
      typeCode,
      templateCode: '',
      attachToDossier: true,
    }
  }
  return {
    typeCode,
    decisionCode: '',
    resultVariable: '',
  }
}

function audit(
  action: ServiceTaskAuditAction,
  entityType: ServiceTaskAuditEntry['entityType'],
  entityId: string,
  actor: string,
  detail: Omit<ServiceTaskAuditEntry, 'id' | 'action' | 'entityType' | 'entityId' | 'actor' | 'at'> = {},
): ServiceTaskAuditEntry {
  return {
    id: id('sta'),
    action,
    entityType,
    entityId,
    actor,
    at: nowStamp(),
    ...detail,
  }
}

export interface CreateServiceTaskDefinitionInput {
  code: string
  name: string
  description: string
  typeCode: ServiceTaskTypeCode
  ownerModule: string
  tags?: string[]
  actor: string
}

export interface SaveDraftServiceTaskVersionPatch {
  configJson?: ServiceTaskExecutionConfig
  inputMapping?: ServiceTaskInputMapping[]
  outputMapping?: ServiceTaskOutputMapping[]
  errorPolicy?: ServiceTaskConfigVersion['errorPolicy']
}

export interface BindServiceTaskInput {
  processCode: string
  processVersion: string
  bpmnProcessId: string
  taskDefinitionKey: string
  taskName: string
  jobType: string
  serviceTaskDefinitionId: string
  actor: string
}

interface ServiceTaskCtxValue {
  types: ServiceTaskType[]
  definitions: ServiceTaskDefinition[]
  versions: ServiceTaskConfigVersion[]
  bindings: ServiceTaskBinding[]
  executionLogs: ServiceTaskExecutionLog[]
  auditEntries: ServiceTaskAuditEntry[]
  getDefinition: (id: string) => ServiceTaskDefinition | undefined
  getVersions: (definitionId: string) => ServiceTaskConfigVersion[]
  getVersion: (definitionId: string, versionNo: number) => ServiceTaskConfigVersion | undefined
  getActiveVersion: (definitionId: string) => ServiceTaskConfigVersion | undefined
  createDefinition: (input: CreateServiceTaskDefinitionInput) => string
  updateDefinition: (id: string, patch: Partial<ServiceTaskDefinition>, actor: string) => void
  duplicateDefinition: (id: string, actor: string) => string | null
  saveDraftVersion: (
    definitionId: string,
    patch: SaveDraftServiceTaskVersionPatch,
    changeNote: string,
    actor: string,
  ) => number | null
  validateVersion: (definitionId: string, versionNo: number, actor?: string) => ServiceTaskValidationResult
  activateVersion: (
    definitionId: string,
    versionNo: number,
    actor: string,
    reason: string,
  ) => ServiceTaskValidationResult
  deprecateDefinition: (id: string, actor: string, reason: string) => void
  bindTask: (input: BindServiceTaskInput) => string
  unbindTask: (bindingId: string, actor?: string) => void
  runPreview: (
    definitionId: string,
    versionNo: number,
    sampleContext?: ServiceTaskSampleContext,
    actor?: string,
  ) => ServiceTaskPreviewResult | null
  retryExecution: (logId: string, actor: string) => void
  manualResolveExecution: (logId: string, actor: string, note: string) => void
}

const ServiceTaskCtx = createContext<ServiceTaskCtxValue | null>(null)

export function useServiceTasks(): ServiceTaskCtxValue {
  const ctx = useContext(ServiceTaskCtx)
  if (!ctx) throw new Error('useServiceTasks must be used within ServiceTaskProvider')
  return ctx
}

export function ServiceTaskProvider({ children }: { children: ReactNode }) {
  const integrationMapping = useIntegrationMapping()
  const [types] = useState<ServiceTaskType[]>(seedServiceTaskTypes)
  const [definitions, setDefinitions] = useState<ServiceTaskDefinition[]>(seedServiceTaskDefinitions)
  const [versions, setVersions] = useState<ServiceTaskConfigVersion[]>(seedServiceTaskConfigVersions)
  const [bindings, setBindings] = useState<ServiceTaskBinding[]>(seedServiceTaskBindings)
  const [executionLogs, setExecutionLogs] = useState<ServiceTaskExecutionLog[]>(seedServiceTaskExecutionLogs)
  const [auditEntries, setAuditEntries] = useState<ServiceTaskAuditEntry[]>(seedServiceTaskAuditEntries)

  const validationContext = useMemo(
    () => ({
      types,
      mappings: integrationMapping.list,
    }),
    [integrationMapping.list, types],
  )

  const appendAudit = (entry: ServiceTaskAuditEntry) => {
    setAuditEntries((prev) => [entry, ...prev])
  }

  const getDefinition = (definitionId: string) => definitions.find((d) => d.id === definitionId)
  const getVersions = (definitionId: string) =>
    versions
      .filter((v) => v.serviceTaskDefinitionId === definitionId)
      .sort((a, b) => b.versionNo - a.versionNo)
  const getVersion = (definitionId: string, versionNo: number) =>
    versions.find((v) => v.serviceTaskDefinitionId === definitionId && v.versionNo === versionNo)
  const getActiveVersion = (definitionId: string) => {
    const definition = getDefinition(definitionId)
    return definition?.activeVersionNo
      ? getVersion(definitionId, definition.activeVersionNo)
      : versions.find((v) => v.serviceTaskDefinitionId === definitionId && v.status === 'ACTIVE')
  }

  const createDefinition: ServiceTaskCtxValue['createDefinition'] = (input) => {
    const definitionId = id('std')
    const stamp = nowStamp()
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
    }
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
    }

    setDefinitions((prev) => [definition, ...prev])
    setVersions((prev) => [version, ...prev])
    appendAudit(
      audit('CREATE_DEFINITION', 'ServiceTaskDefinition', definitionId, input.actor, {
        after: { code: definition.code, typeCode: definition.typeCode },
      }),
    )
    return definitionId
  }

  const updateDefinition: ServiceTaskCtxValue['updateDefinition'] = (definitionId, patch, actor) => {
    const before = getDefinition(definitionId)
    setDefinitions((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? {
              ...d,
              ...patch,
              id: d.id,
              typeCode: patch.typeCode ?? d.typeCode,
              updatedBy: actor,
              updatedAt: nowStamp(),
            }
          : d,
      ),
    )
    appendAudit(
      audit('UPDATE_DEFINITION', 'ServiceTaskDefinition', definitionId, actor, {
        before: before ? { code: before.code, name: before.name, status: before.status } : undefined,
        after: patch as Record<string, unknown>,
      }),
    )
  }

  const duplicateDefinition: ServiceTaskCtxValue['duplicateDefinition'] = (definitionId, actor) => {
    const source = getDefinition(definitionId)
    if (!source) return null
    const sourceVersions = getVersions(definitionId)
    const sourceLatest = sourceVersions[0]
    const duplicateId = id('std')
    const stamp = nowStamp()
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
    }

    setDefinitions((prev) => [duplicate, ...prev])
    if (sourceLatest) {
      setVersions((prev) => [
        cloneVersion(sourceLatest, duplicateId, 1, actor, 'Sao chép từ cấu hình gốc.'),
        ...prev,
      ])
    }
    appendAudit(
      audit('DUPLICATE_DEFINITION', 'ServiceTaskDefinition', duplicateId, actor, {
        before: { sourceId: definitionId },
        after: { code: duplicate.code },
      }),
    )
    return duplicateId
  }

  const saveDraftVersion: ServiceTaskCtxValue['saveDraftVersion'] = (
    definitionId,
    patch,
    changeNote,
    actor,
  ) => {
    const definition = getDefinition(definitionId)
    if (!definition) return null
    const latest = getVersions(definitionId)[0]
    const nextVersionNo = latest ? latest.versionNo + 1 : 1
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
      } satisfies ServiceTaskConfigVersion)
    const draft: ServiceTaskConfigVersion = {
      ...cloneVersion(baseVersion, definitionId, nextVersionNo, actor, changeNote || 'Lưu bản nháp.'),
      ...patch,
      status: 'DRAFT',
    }

    setVersions((prev) => [draft, ...prev])
    setDefinitions((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? { ...d, status: d.status === 'ACTIVE' ? d.status : 'DRAFT', updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    )
    appendAudit(
      audit('SAVE_VERSION', 'ServiceTaskConfigVersion', draft.id, actor, {
        reason: changeNote,
        configVersionNo: draft.versionNo,
      }),
    )
    return draft.versionNo
  }

  const validateVersion: ServiceTaskCtxValue['validateVersion'] = (definitionId, versionNo, actor = 'system') => {
    const definition = getDefinition(definitionId)
    const version = getVersion(definitionId, versionNo)
    if (!definition || !version) {
      return { valid: false, errors: ['Không tìm thấy definition hoặc config version.'], warnings: [] }
    }
    const result = validateServiceTaskConfig(definition, version, validationContext)
    setVersions((prev) =>
      prev.map((v) =>
        v.id === version.id && v.status !== 'ACTIVE' && v.status !== 'ARCHIVED'
          ? { ...v, status: result.valid ? 'READY' : 'ERROR' }
          : v,
      ),
    )
    setDefinitions((prev) =>
      prev.map((d) =>
        d.id === definitionId && d.status !== 'ACTIVE' && d.status !== 'DEPRECATED'
          ? { ...d, status: result.valid ? 'READY' : 'ERROR', updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    )
    appendAudit(
      audit('VALIDATE_VERSION', 'ServiceTaskConfigVersion', version.id, actor, {
        after: { valid: result.valid, errors: result.errors },
        configVersionNo: version.versionNo,
      }),
    )
    return result
  }

  const activateVersion: ServiceTaskCtxValue['activateVersion'] = (definitionId, versionNo, actor, reason) => {
    const definition = getDefinition(definitionId)
    const version = getVersion(definitionId, versionNo)
    if (!definition || !version) {
      return { valid: false, errors: ['Không tìm thấy definition hoặc config version.'], warnings: [] }
    }
    const result = validateServiceTaskConfig(definition, version, validationContext)
    if (!result.valid) {
      setVersions((prev) => prev.map((v) => (v.id === version.id ? { ...v, status: 'ERROR' } : v)))
      setDefinitions((prev) =>
        prev.map((d) =>
          d.id === definitionId ? { ...d, status: 'ERROR', updatedBy: actor, updatedAt: nowStamp() } : d,
        ),
      )
      appendAudit(
        audit('VALIDATE_VERSION', 'ServiceTaskConfigVersion', version.id, actor, {
          after: { valid: false, errors: result.errors },
          reason,
          configVersionNo: version.versionNo,
        }),
      )
      return result
    }

    setVersions((prev) =>
      prev.map((v) => {
        if (v.serviceTaskDefinitionId !== definitionId) return v
        if (v.versionNo === versionNo) return { ...v, status: 'ACTIVE' }
        return v.status === 'ACTIVE' ? { ...v, status: 'ARCHIVED' } : v
      }),
    )
    setDefinitions((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? {
              ...d,
              status: 'ACTIVE',
              activeVersionNo: versionNo,
              updatedBy: actor,
              updatedAt: nowStamp(),
            }
          : d,
      ),
    )
    appendAudit(
      audit('ACTIVATE_VERSION', 'ServiceTaskConfigVersion', version.id, actor, {
        reason,
        configVersionNo: version.versionNo,
      }),
    )
    return result
  }

  const deprecateDefinition: ServiceTaskCtxValue['deprecateDefinition'] = (definitionId, actor, reason) => {
    setDefinitions((prev) =>
      prev.map((d) =>
        d.id === definitionId
          ? { ...d, status: 'DEPRECATED', activeVersionNo: undefined, updatedBy: actor, updatedAt: nowStamp() }
          : d,
      ),
    )
    setVersions((prev) =>
      prev.map((v) =>
        v.serviceTaskDefinitionId === definitionId && v.status === 'ACTIVE' ? { ...v, status: 'ARCHIVED' } : v,
      ),
    )
    appendAudit(audit('DEPRECATE_DEFINITION', 'ServiceTaskDefinition', definitionId, actor, { reason }))
  }

  const bindTask: ServiceTaskCtxValue['bindTask'] = (input) => {
    const bindingId = id('stb')
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
    }

    setBindings((prev) => [
      binding,
      ...prev.map((b) =>
        b.processCode === input.processCode &&
        b.processVersion === input.processVersion &&
        b.taskDefinitionKey === input.taskDefinitionKey &&
        b.bindingStatus === 'ACTIVE'
          ? { ...b, bindingStatus: 'INACTIVE' as const, effectiveTo: TODAY, updatedAt: nowStamp() }
          : b,
      ),
    ])
    appendAudit(
      audit('BIND_TASK', 'ServiceTaskBinding', bindingId, input.actor, {
        after: {
          processCode: input.processCode,
          processVersion: input.processVersion,
          taskDefinitionKey: input.taskDefinitionKey,
          serviceTaskDefinitionId: input.serviceTaskDefinitionId,
        },
      }),
    )
    return bindingId
  }

  const unbindTask: ServiceTaskCtxValue['unbindTask'] = (bindingId, actor = 'system') => {
    setBindings((prev) =>
      prev.map((b) =>
        b.id === bindingId
          ? { ...b, bindingStatus: 'INACTIVE', effectiveTo: TODAY, updatedAt: nowStamp() }
          : b,
      ),
    )
    appendAudit(audit('UNBIND_TASK', 'ServiceTaskBinding', bindingId, actor))
  }

  const runPreview: ServiceTaskCtxValue['runPreview'] = (
    definitionId,
    versionNo,
    context = sampleServiceTaskContext,
    actor = 'system',
  ) => {
    const definition = getDefinition(definitionId)
    const version = getVersion(definitionId, versionNo)
    if (!definition || !version) return null
    const preview = previewServiceTaskConfig(definition, version, context, validationContext)
    appendAudit(
      audit('TEST_CONFIG', 'ServiceTaskConfigVersion', version.id, actor, {
        after: { valid: preview.valid, errors: preview.errors },
        configVersionNo: version.versionNo,
      }),
    )
    return preview
  }

  const retryExecution: ServiceTaskCtxValue['retryExecution'] = (logId, actor) => {
    setExecutionLogs((prev) =>
      prev.map((log) =>
        log.id === logId && log.status === 'FAILED'
          ? {
              ...log,
              status: 'RETRYING',
              attemptNo: log.attemptNo + 1,
              finishedAt: undefined,
              durationMs: undefined,
              actor,
            }
          : log,
      ),
    )
    appendAudit(audit('RETRY_EXECUTION', 'ServiceTaskExecutionLog', logId, actor))
  }

  const manualResolveExecution: ServiceTaskCtxValue['manualResolveExecution'] = (logId, actor, note) => {
    setExecutionLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              status: 'MANUAL_RESOLVED',
              finishedAt: nowStamp(),
              errorMessage: note || log.errorMessage,
              actor,
            }
          : log,
      ),
    )
    appendAudit(audit('MANUAL_RESOLVE', 'ServiceTaskExecutionLog', logId, actor, { reason: note }))
  }

  return (
    <ServiceTaskCtx.Provider
      value={{
        types,
        definitions,
        versions,
        bindings,
        executionLogs,
        auditEntries,
        getDefinition,
        getVersions,
        getVersion,
        getActiveVersion,
        createDefinition,
        updateDefinition,
        duplicateDefinition,
        saveDraftVersion,
        validateVersion,
        activateVersion,
        deprecateDefinition,
        bindTask,
        unbindTask,
        runPreview,
        retryExecution,
        manualResolveExecution,
      }}
    >
      {children}
    </ServiceTaskCtx.Provider>
  )
}
