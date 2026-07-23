import { curVer, seedProcesses, type ProcessDef } from './process-registry';
import {
  seedProcessServiceTasks,
  type ProcessServiceTaskRef,
  type ServiceTaskBinding,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
} from './service-task';

// Port của webapp/src/data/serviceTaskReconcile.ts — đối soát service task
// metadata (BPMN) với binding/definition/version thực tế trong service-task.ts.

export type ServiceTaskReconcileStatus = 'ok' | 'missing' | 'unfilled' | 'generic' | 'orphan';

export const SERVICE_TASK_RECONCILE_STATUS_META: Record<ServiceTaskReconcileStatus, { label: string; color: string }> = {
  ok: { label: 'Đã khớp', color: 'success' },
  missing: { label: 'Thiếu binding', color: 'error' },
  unfilled: { label: 'Chưa sẵn sàng', color: 'warning' },
  generic: { label: 'Binding rộng', color: 'processing' },
  orphan: { label: 'Mồ côi', color: 'default' },
};

export interface ReconcilableServiceTaskProcess {
  processCode: string;
  processVersion: string;
  processName: string;
  bpmnProcessId: string;
  status: ProcessDef['trangThai'] | 'metadata-only';
  taskCount: number;
  criticalCount: number;
  tasks: ProcessServiceTaskRef[];
}

export interface ServiceTaskReconcileRow extends ProcessServiceTaskRef {
  id: string;
  status: ServiceTaskReconcileStatus;
  reason: string;
  binding?: ServiceTaskBinding;
  definition?: ServiceTaskDefinition;
  activeVersion?: ServiceTaskConfigVersion;
  source: 'bpmn' | 'binding';
}

export interface ServiceTaskReconcileHealthSummary {
  processCount: number;
  taskCount: number;
  criticalTaskCount: number;
  okCount: number;
  missingCount: number;
  unfilledCount: number;
  genericCount: number;
  orphanCount: number;
}

export interface ServiceTaskBindingDraft {
  processCode: string;
  processVersion: string;
  bpmnProcessId: string;
  taskDefinitionKey: string;
  taskName: string;
  jobType: string;
  serviceTaskDefinitionId: string;
  actor: string;
}

function processDisplayName(processCode: string): string {
  return seedProcesses.find((process) => process.ma === processCode)?.ten ?? processCode;
}

function processStatus(processCode: string): ReconcilableServiceTaskProcess['status'] {
  return seedProcesses.find((process) => process.ma === processCode)?.trangThai ?? 'metadata-only';
}

function activeVersionOf(
  definition: ServiceTaskDefinition | undefined,
  versions: ServiceTaskConfigVersion[],
): ServiceTaskConfigVersion | undefined {
  if (!definition) return undefined;
  if (definition.activeVersionNo) {
    return versions.find(
      (version) =>
        version.serviceTaskDefinitionId === definition.id &&
        version.versionNo === definition.activeVersionNo &&
        version.status === 'ACTIVE',
    );
  }
  return versions.find((version) => version.serviceTaskDefinitionId === definition.id && version.status === 'ACTIVE');
}

function isPinnedBinding(binding: ServiceTaskBinding): boolean {
  return Boolean(
    binding.processCode &&
      binding.processVersion &&
      binding.bpmnProcessId &&
      binding.taskDefinitionKey &&
      binding.processCode !== '*' &&
      binding.processVersion !== '*' &&
      binding.taskDefinitionKey !== '*',
  );
}

function bindingKey(binding: Pick<ServiceTaskBinding, 'processCode' | 'processVersion' | 'taskDefinitionKey'>) {
  return `${binding.processCode}::${binding.processVersion}::${binding.taskDefinitionKey}`;
}

function taskKey(task: Pick<ProcessServiceTaskRef, 'processCode' | 'processVersion' | 'taskDefinitionKey'>) {
  return `${task.processCode}::${task.processVersion}::${task.taskDefinitionKey}`;
}

function currentBindingFor(task: ProcessServiceTaskRef, bindings: ServiceTaskBinding[]) {
  return bindings
    .filter(
      (binding) =>
        binding.bindingStatus !== 'INACTIVE' &&
        binding.processCode === task.processCode &&
        binding.processVersion === task.processVersion &&
        binding.taskDefinitionKey === task.taskDefinitionKey,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

function reconcileBoundTask(
  task: ProcessServiceTaskRef,
  binding: ServiceTaskBinding,
  definitions: ServiceTaskDefinition[],
  versions: ServiceTaskConfigVersion[],
): ServiceTaskReconcileRow {
  const definition = definitions.find((item) => item.id === binding.serviceTaskDefinitionId);
  const activeVersion = activeVersionOf(definition, versions);

  if (!isPinnedBinding(binding)) {
    return {
      ...task,
      id: `generic-${binding.id}`,
      status: 'generic',
      reason: 'Binding chưa ghim đủ processVersion, bpmnProcessId hoặc taskDefinitionKey.',
      binding,
      definition,
      activeVersion,
      source: 'bpmn',
    };
  }

  if (binding.bindingStatus === 'ERROR') {
    return {
      ...task,
      id: `unfilled-${binding.id}`,
      status: 'unfilled',
      reason: 'Binding đang ở trạng thái lỗi, cần kiểm tra lại cấu hình hoặc connector.',
      binding,
      definition,
      activeVersion,
      source: 'bpmn',
    };
  }

  if (!definition) {
    return {
      ...task,
      id: `unfilled-${binding.id}`,
      status: 'unfilled',
      reason: 'Binding trỏ tới cấu hình không còn tồn tại.',
      binding,
      source: 'bpmn',
    };
  }

  if (definition.status !== 'ACTIVE' || !activeVersion) {
    return {
      ...task,
      id: `unfilled-${binding.id}`,
      status: 'unfilled',
      reason: 'Đã có binding nhưng definition hoặc config version chưa active.',
      binding,
      definition,
      activeVersion,
      source: 'bpmn',
    };
  }

  return {
    ...task,
    id: `ok-${binding.id}`,
    status: 'ok',
    reason: 'Binding active, definition active và có config version active.',
    binding,
    definition,
    activeVersion,
    source: 'bpmn',
  };
}

export function reconcilableServiceTaskProcesses(
  tasks: ProcessServiceTaskRef[] = seedProcessServiceTasks,
): ReconcilableServiceTaskProcess[] {
  const byProcess = new Map<string, ProcessServiceTaskRef[]>();

  tasks.forEach((task) => {
    const key = `${task.processCode}::${task.processVersion}`;
    byProcess.set(key, [...(byProcess.get(key) ?? []), task]);
  });

  return Array.from(byProcess.values())
    .map((items) => {
      const first = items[0];
      const process = seedProcesses.find((item) => item.ma === first.processCode);
      return {
        processCode: first.processCode,
        processVersion: first.processVersion || (process ? curVer(process) : ''),
        processName: process?.ten ?? processDisplayName(first.processCode),
        bpmnProcessId: first.bpmnProcessId,
        status: processStatus(first.processCode),
        taskCount: items.length,
        criticalCount: items.filter((item) => item.critical).length,
        tasks: items.sort((a, b) => a.taskDefinitionKey.localeCompare(b.taskDefinitionKey)),
      };
    })
    .sort((a, b) => a.processCode.localeCompare(b.processCode));
}

export function reconcileServiceTasks(
  process: ReconcilableServiceTaskProcess,
  bindings: ServiceTaskBinding[],
  definitions: ServiceTaskDefinition[],
  versions: ServiceTaskConfigVersion[],
): ServiceTaskReconcileRow[] {
  const rows = process.tasks.map((task) => {
    const binding = currentBindingFor(task, bindings);
    if (!binding) {
      return {
        ...task,
        id: `missing-${taskKey(task)}`,
        status: 'missing' as const,
        reason: 'BPMN có service task nhưng chưa có binding active.',
        source: 'bpmn' as const,
      };
    }
    return reconcileBoundTask(task, binding, definitions, versions);
  });

  const knownTaskKeys = new Set(process.tasks.map(taskKey));
  const orphanRows: ServiceTaskReconcileRow[] = bindings
    .filter(
      (binding) =>
        binding.bindingStatus !== 'INACTIVE' &&
        binding.processCode === process.processCode &&
        binding.processVersion === process.processVersion &&
        !knownTaskKeys.has(bindingKey(binding)),
    )
    .map((binding) => {
      const definition = definitions.find((item) => item.id === binding.serviceTaskDefinitionId);
      return {
        processCode: binding.processCode,
        processVersion: binding.processVersion,
        bpmnProcessId: binding.bpmnProcessId,
        taskDefinitionKey: binding.taskDefinitionKey,
        taskName: binding.taskName,
        jobType: binding.jobType,
        implementationHint: 'binding',
        critical: false,
        id: `orphan-${binding.id}`,
        status: 'orphan',
        reason: 'Binding trỏ tới taskDefinitionKey không còn trong metadata service task của quy trình.',
        binding,
        definition,
        activeVersion: activeVersionOf(definition, versions),
        source: 'binding',
      } satisfies ServiceTaskReconcileRow;
    });

  return [...rows, ...orphanRows];
}

export function summarizeServiceTaskReconcileHealth(
  processes: ReconcilableServiceTaskProcess[],
  bindings: ServiceTaskBinding[],
  definitions: ServiceTaskDefinition[],
  versions: ServiceTaskConfigVersion[],
): ServiceTaskReconcileHealthSummary {
  return processes.reduce<ServiceTaskReconcileHealthSummary>(
    (summary, process) => {
      const rows = reconcileServiceTasks(process, bindings, definitions, versions);
      summary.processCount += 1;
      summary.taskCount += process.taskCount;
      summary.criticalTaskCount += process.criticalCount;
      rows.forEach((row) => {
        if (row.status === 'ok') summary.okCount += 1;
        if (row.status === 'missing') summary.missingCount += 1;
        if (row.status === 'unfilled') summary.unfilledCount += 1;
        if (row.status === 'generic') summary.genericCount += 1;
        if (row.status === 'orphan') summary.orphanCount += 1;
      });
      return summary;
    },
    {
      processCount: 0,
      taskCount: 0,
      criticalTaskCount: 0,
      okCount: 0,
      missingCount: 0,
      unfilledCount: 0,
      genericCount: 0,
      orphanCount: 0,
    },
  );
}

export function scaffoldServiceTaskBinding(
  task: ProcessServiceTaskRef,
  serviceTaskDefinitionId: string,
  actor: string,
): ServiceTaskBindingDraft {
  return {
    processCode: task.processCode,
    processVersion: task.processVersion,
    bpmnProcessId: task.bpmnProcessId,
    taskDefinitionKey: task.taskDefinitionKey,
    taskName: task.taskName,
    jobType: task.jobType,
    serviceTaskDefinitionId,
    actor,
  };
}
