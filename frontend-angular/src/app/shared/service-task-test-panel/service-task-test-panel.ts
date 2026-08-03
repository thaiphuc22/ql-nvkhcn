import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import {
  SERVICE_TASK_STATUS_META,
  sampleServiceTaskContext,
  seedProcessServiceTasks,
  type ProcessServiceTaskRef,
  type ServiceTaskConfigVersion,
  type ServiceTaskPreviewResult,
  type ServiceTaskSampleContext,
} from '../../core/models/service-task';
import { ServiceTaskService } from '../../core/services/service-task.service';

// Port của webapp/src/components/ServiceTaskTestPanel.tsx — tab "Kiểm thử": chọn
// definition/version + kịch bản mẫu (JSON), chạy `runPreview` của ServiceTaskService
// và hiện input sau mapping/payload/response giả lập/output mapping/validation.

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseJsonObject(label: string, raw: string): Record<string, unknown> {
  const value: unknown = JSON.parse(raw);
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`${label} phải là JSON object.`);
  }
  return value as Record<string, unknown>;
}

function processKey(task: ProcessServiceTaskRef): string {
  return `${task.processCode}::${task.processVersion}::${task.taskDefinitionKey}`;
}

function latestVersion(versions: ServiceTaskConfigVersion[]): ServiceTaskConfigVersion | undefined {
  return [...versions].sort((a, b) => b.versionNo - a.versionNo)[0];
}

@Component({
  selector: 'app-service-task-test-panel',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTabsModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './service-task-test-panel.html',
  styleUrl: './service-task-test-panel.scss',
})
export class ServiceTaskTestPanel {
  private readonly auth = inject(AuthService);
  private readonly serviceTasks = inject(ServiceTaskService);

  readonly statusMeta = SERVICE_TASK_STATUS_META;
  readonly seedProcessServiceTasks = seedProcessServiceTasks;

  readonly definitionId = signal<string | undefined>(
    this.serviceTasks.definitions().find((d) => d.status === 'ACTIVE')?.id ?? this.serviceTasks.definitions()[0]?.id,
  );
  readonly versionNo = signal<number | undefined>(undefined);
  readonly selectedProcessKey = signal<string | undefined>(
    seedProcessServiceTasks[0] ? processKey(seedProcessServiceTasks[0]) : undefined,
  );

  readonly variablesJson = signal(pretty(sampleServiceTaskContext.variables));
  readonly dossierJson = signal(pretty(sampleServiceTaskContext.dossier));
  readonly userContextJson = signal(
    pretty({
      initiator: sampleServiceTaskContext.initiator,
      assignee: sampleServiceTaskContext.assignee,
      org: sampleServiceTaskContext.org,
      system: sampleServiceTaskContext.system,
      form: sampleServiceTaskContext.form,
      previousOutput: sampleServiceTaskContext.previousOutput,
    }),
  );

  readonly result = signal<ServiceTaskPreviewResult | null>(null);
  readonly jsonError = signal<string | undefined>(undefined);

  readonly selectedDefinition = computed(
    () => this.serviceTasks.definitions().find((d) => d.id === this.definitionId()) ?? this.serviceTasks.definitions()[0],
  );
  readonly versions = computed(() => {
    const definition = this.selectedDefinition();
    return definition ? this.serviceTasks.getVersions(definition.id) : [];
  });
  readonly selectedVersionNo = computed(
    () => this.versionNo() ?? this.selectedDefinition()?.activeVersionNo ?? latestVersion(this.versions())?.versionNo,
  );
  readonly selectedVersion = computed(() => {
    const definition = this.selectedDefinition();
    const versionNo = this.selectedVersionNo();
    return definition && versionNo !== undefined ? this.serviceTasks.getVersion(definition.id, versionNo) : undefined;
  });
  readonly selectedProcess = computed(() =>
    seedProcessServiceTasks.find((task) => processKey(task) === this.selectedProcessKey()),
  );

  readonly versionOptions = computed(() =>
    this.versions().map((version) => ({ label: `v${version.versionNo} - ${version.status}`, value: version.versionNo })),
  );
  readonly definitionOptions = computed(() =>
    this.serviceTasks.definitions().map((definition) => ({ label: `${definition.name} - ${definition.code}`, value: definition.id })),
  );
  readonly processOptions = seedProcessServiceTasks.map((task) => ({
    label: `${task.processCode} v${task.processVersion} - ${task.taskName}`,
    value: processKey(task),
  }));

  selectDefinition(nextDefinitionId: string): void {
    this.definitionId.set(nextDefinitionId);
    this.versionNo.set(undefined);
    this.result.set(null);
  }

  selectVersion(nextVersionNo: number): void {
    this.versionNo.set(nextVersionNo);
    this.result.set(null);
  }

  selectProcess(nextProcessKey: string): void {
    this.selectedProcessKey.set(nextProcessKey);
    this.result.set(null);
  }

  resetSamples(): void {
    this.variablesJson.set(pretty(sampleServiceTaskContext.variables));
    this.dossierJson.set(pretty(sampleServiceTaskContext.dossier));
    this.userContextJson.set(
      pretty({
        initiator: sampleServiceTaskContext.initiator,
        assignee: sampleServiceTaskContext.assignee,
        org: sampleServiceTaskContext.org,
        system: sampleServiceTaskContext.system,
        form: sampleServiceTaskContext.form,
        previousOutput: sampleServiceTaskContext.previousOutput,
      }),
    );
    this.result.set(null);
    this.jsonError.set(undefined);
  }

  private buildContext(): ServiceTaskSampleContext {
    const variables = parseJsonObject('Variables sample', this.variablesJson());
    const dossier = parseJsonObject('Dossier sample', this.dossierJson());
    const userContext = parseJsonObject('User/org context sample', this.userContextJson());
    const selectedProcess = this.selectedProcess();
    const task = selectedProcess
      ? {
          key: selectedProcess.taskDefinitionKey,
          name: selectedProcess.taskName,
          processCode: selectedProcess.processCode,
          processVersion: selectedProcess.processVersion,
          jobType: selectedProcess.jobType,
        }
      : sampleServiceTaskContext.task;

    return {
      variables,
      dossier,
      form: (userContext['form'] as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.form,
      task,
      initiator: (userContext['initiator'] as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.initiator,
      assignee: (userContext['assignee'] as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.assignee,
      org: (userContext['org'] as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.org,
      system: (userContext['system'] as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.system,
      previousOutput:
        (userContext['previousOutput'] as Record<string, unknown> | undefined) ?? sampleServiceTaskContext.previousOutput,
    };
  }

  runPreview(): void {
    const definition = this.selectedDefinition();
    const versionNo = this.selectedVersionNo();
    if (!definition || versionNo === undefined) return;
    try {
      const context = this.buildContext();
      const actor = this.auth.user()?.email ?? 'admin';
      const preview = this.serviceTasks.runPreview(definition.id, versionNo, context, actor);
      this.result.set(preview);
      this.jsonError.set(undefined);
    } catch (error) {
      this.result.set(null);
      this.jsonError.set(error instanceof Error ? error.message : 'Không đọc được sample JSON.');
    }
  }

  pretty(value: unknown): string {
    return pretty(value);
  }
}
