import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import { seedIntegrations } from '../../core/models/integration-system';
import { seedMappingConfigs } from '../../core/models/integration-mapping';
import {
  DEFAULT_ERROR_POLICY,
  DOSSIER_OUTPUT_FIELD_WHITELIST,
  type RetryBackoff,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskExecutionConfig,
  type ServiceTaskFailurePolicy,
  type ServiceTaskInputMapping,
  type ServiceTaskOutputMapping,
  type ServiceTaskTypeCode,
} from '../../core/models/service-task';
import { ServiceTaskService } from '../../core/services/service-task.service';
import { ServiceTaskConfigApiService, type ServiceTaskApiDefinitionDetail, type ServiceTaskApiWriteRequest } from '../../core/services/service-task-config-api.service';
import { ServiceTaskMappingEditor } from '../service-task-mapping-editor/service-task-mapping-editor';

// Port của webapp/src/components/ServiceTaskFormDrawer.tsx — drawer Tạo/Sửa cấu
// hình Service Task, 5 tab: Tổng quan / Cấu hình thực thi / Input mapping / Output
// mapping / Chính sách lỗi. Dùng signal cho từng field thay React Hook Form
// (`Form.useForm`) — codebase Angular ở đây quy ước ngModel + signal, không dùng
// Reactive Forms cho các drawer tương tự (xem approval-matrix-rules-tab).

function latestVersion(versions: ServiceTaskConfigVersion[]): ServiceTaskConfigVersion | undefined {
  return [...versions].sort((a, b) => b.versionNo - a.versionNo)[0];
}

@Component({
  selector: 'app-service-task-form-drawer',
  imports: [
    FormsModule,
    NzButtonModule,
    NzDrawerModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzSwitchModule,
    NzTabsModule,
    NzTypographyModule,
    ServiceTaskMappingEditor,
  ],
  templateUrl: './service-task-form-drawer.html',
  styleUrl: './service-task-form-drawer.scss',
})
export class ServiceTaskFormDrawer {
  private readonly auth = inject(AuthService);
  private readonly serviceTasks = inject(ServiceTaskService);
  private readonly configApi = inject(ServiceTaskConfigApiService);
  private readonly message = inject(NzMessageService);

  readonly open = input(false);
  readonly definition = input<ServiceTaskDefinition | undefined>(undefined);
  readonly apiDefinition = input<ServiceTaskApiDefinitionDetail | undefined>(undefined);
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly saving = signal(false);

  readonly types = this.serviceTasks.types;
  readonly connectorOptions = seedIntegrations.map((item) => ({ label: `${item.key} - ${item.ten}`, value: item.key }));
  readonly dossierFieldOptions = DOSSIER_OUTPUT_FIELD_WHITELIST.map((value) => ({ label: value, value }));
  readonly methodOptions = ['GET', 'POST', 'PUT', 'PATCH'].map((value) => ({ label: value, value }));
  readonly channelOptions = [
    { label: 'Email', value: 'email' },
    { label: 'In-app', value: 'in_app' },
    { label: 'SMS', value: 'sms' },
    { label: 'Zalo', value: 'zalo' },
  ];
  readonly retryBackoffOptions: { label: string; value: RetryBackoff }[] = [
    { label: 'Cố định', value: 'fixed' },
    { label: 'Tăng dần', value: 'exponential' },
  ];
  readonly onFailureOptions: { label: string; value: ServiceTaskFailurePolicy }[] = [
    { label: 'Tạo incident', value: 'CREATE_INCIDENT' },
    { label: 'Fail process', value: 'FAIL_PROCESS' },
    { label: 'Tiếp tục', value: 'CONTINUE' },
    { label: 'Compensate', value: 'COMPENSATE' },
    { label: 'Tạo việc thủ công', value: 'MANUAL_TASK' },
  ];

  // Tổng quan
  readonly code = signal('');
  readonly name = signal('');
  readonly description = signal('');
  readonly typeCode = signal<ServiceTaskTypeCode>('SEND_NOTIFICATION');
  readonly ownerModule = signal('Workflow Platform');
  readonly tags = signal<string[]>([]);

  // Cấu hình thực thi — SEND_NOTIFICATION
  readonly templateCode = signal('');
  readonly channels = signal<Array<'email' | 'in_app' | 'sms' | 'zalo'>>(['in_app']);
  readonly recipientExpression = signal('');
  readonly subjectExpression = signal('');
  // CALL_API
  readonly connectorKey = signal('');
  readonly mappingConfigId = signal<string | undefined>(undefined);
  readonly endpointAction = signal('');
  readonly method = signal<'GET' | 'POST' | 'PUT' | 'PATCH'>('POST');
  readonly idempotencyKeyExpression = signal('');
  // UPDATE_DOSSIER
  readonly allowedFields = signal<string[]>([]);
  readonly updateField = signal<string | undefined>(undefined);
  readonly updateValueExpression = signal('');
  // GENERATE_DOCUMENT
  readonly outputFolderExpression = signal('');
  readonly attachToDossier = signal(true);
  // EVALUATE_DECISION
  readonly decisionCode = signal('');
  readonly decisionVersion = signal('');
  readonly resultVariable = signal('');

  // Input/Output mapping
  readonly inputMapping = signal<ServiceTaskInputMapping[]>([]);
  readonly outputMapping = signal<ServiceTaskOutputMapping[]>([]);

  // Chính sách lỗi
  readonly timeoutMs = signal(DEFAULT_ERROR_POLICY.timeoutMs);
  readonly maxRetry = signal(DEFAULT_ERROR_POLICY.maxRetry);
  readonly retryDelayMs = signal(DEFAULT_ERROR_POLICY.retryDelayMs);
  readonly retryBackoff = signal<RetryBackoff>(DEFAULT_ERROR_POLICY.retryBackoff);
  readonly onFailure = signal<ServiceTaskFailurePolicy>(DEFAULT_ERROR_POLICY.onFailure);
  readonly notifyRoles = signal<string[]>(DEFAULT_ERROR_POLICY.notifyRoles);
  readonly changeNote = signal('');

  readonly mappingOptions = computed(() =>
    seedMappingConfigs
      .filter((item) => !this.connectorKey() || item.he === this.connectorKey())
      .map((item) => ({ label: `${item.id} - ${item.doiTuong} v${item.version}`, value: item.id })),
  );

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const apiDefinition = this.apiDefinition();
      const definition = apiDefinition ?? this.definition();
      const apiVersion = apiDefinition?.versions[0];
      const version = apiVersion ? {
        configJson: apiVersion.config as unknown as ServiceTaskExecutionConfig,
        inputMapping: (apiVersion.inputMapping ?? []) as unknown as ServiceTaskInputMapping[],
        outputMapping: (apiVersion.outputMapping ?? []) as unknown as ServiceTaskOutputMapping[],
        errorPolicy: (apiVersion.errorPolicy ?? DEFAULT_ERROR_POLICY) as unknown as typeof DEFAULT_ERROR_POLICY,
      } : definition ? latestVersion(this.serviceTasks.getVersions(definition.id)) : undefined;
      const policy = version?.errorPolicy ?? DEFAULT_ERROR_POLICY;

      this.code.set(definition?.code ?? '');
      this.name.set(definition?.name ?? '');
      this.description.set(definition?.description ?? '');
      this.typeCode.set(definition?.typeCode ?? 'SEND_NOTIFICATION');
      this.ownerModule.set(definition?.ownerModule ?? 'Workflow Platform');
      this.tags.set(definition?.tags ?? []);
      this.changeNote.set(definition ? 'Cập nhật cấu hình từ drawer.' : 'Tạo cấu hình Service Task.');

      this.timeoutMs.set(policy.timeoutMs);
      this.maxRetry.set(policy.maxRetry);
      this.retryDelayMs.set(policy.retryDelayMs);
      this.retryBackoff.set(policy.retryBackoff);
      this.onFailure.set(policy.onFailure);
      this.notifyRoles.set(policy.notifyRoles);

      this.inputMapping.set(version?.inputMapping ?? []);
      this.outputMapping.set(version?.outputMapping ?? []);

      const config = version?.configJson;
      this.templateCode.set(config?.typeCode === 'SEND_NOTIFICATION' || config?.typeCode === 'GENERATE_DOCUMENT' ? config.templateCode : '');
      this.channels.set(config?.typeCode === 'SEND_NOTIFICATION' ? config.channels : ['in_app']);
      this.recipientExpression.set(config?.typeCode === 'SEND_NOTIFICATION' ? config.recipientExpression : '');
      this.subjectExpression.set(config?.typeCode === 'SEND_NOTIFICATION' ? (config.subjectExpression ?? '') : '');
      this.connectorKey.set(config?.typeCode === 'CALL_API' ? config.connectorKey : '');
      this.mappingConfigId.set(config?.typeCode === 'CALL_API' ? config.mappingConfigId : undefined);
      this.endpointAction.set(config?.typeCode === 'CALL_API' ? config.endpointAction : '');
      this.method.set(config?.typeCode === 'CALL_API' ? config.method : 'POST');
      this.idempotencyKeyExpression.set(config?.typeCode === 'CALL_API' ? (config.idempotencyKeyExpression ?? '') : '');
      this.allowedFields.set(config?.typeCode === 'UPDATE_DOSSIER' ? config.allowedFields : []);
      this.updateField.set(config?.typeCode === 'UPDATE_DOSSIER' ? config.updates[0]?.field : undefined);
      this.updateValueExpression.set(config?.typeCode === 'UPDATE_DOSSIER' ? (config.updates[0]?.valueExpression ?? '') : '');
      this.outputFolderExpression.set(config?.typeCode === 'GENERATE_DOCUMENT' ? (config.outputFolderExpression ?? '') : '');
      this.attachToDossier.set(config?.typeCode === 'GENERATE_DOCUMENT' ? config.attachToDossier : true);
      this.decisionCode.set(config?.typeCode === 'EVALUATE_DECISION' ? config.decisionCode : '');
      this.decisionVersion.set(config?.typeCode === 'EVALUATE_DECISION' ? (config.decisionVersion ?? '') : '');
      this.resultVariable.set(config?.typeCode === 'EVALUATE_DECISION' ? config.resultVariable : '');
    });
  }

  close(): void {
    this.closed.emit();
  }

  private buildConfig(): ServiceTaskExecutionConfig {
    const typeCode = this.typeCode();
    if (typeCode === 'SEND_NOTIFICATION') {
      return {
        typeCode,
        templateCode: this.templateCode(),
        channels: this.channels(),
        recipientExpression: this.recipientExpression(),
        subjectExpression: this.subjectExpression() || undefined,
      };
    }
    if (typeCode === 'CALL_API') {
      return {
        typeCode,
        connectorKey: this.connectorKey(),
        mappingConfigId: this.mappingConfigId(),
        endpointAction: this.endpointAction(),
        method: this.method(),
        idempotencyKeyExpression: this.idempotencyKeyExpression() || undefined,
      };
    }
    if (typeCode === 'UPDATE_DOSSIER') {
      const updateField = this.updateField();
      return {
        typeCode,
        allowedFields: this.allowedFields(),
        updates: updateField ? [{ field: updateField, valueExpression: this.updateValueExpression() }] : [],
      };
    }
    if (typeCode === 'GENERATE_DOCUMENT') {
      return {
        typeCode,
        templateCode: this.templateCode(),
        outputFolderExpression: this.outputFolderExpression() || undefined,
        attachToDossier: this.attachToDossier(),
      };
    }
    return {
      typeCode,
      decisionCode: this.decisionCode(),
      decisionVersion: this.decisionVersion() || undefined,
      resultVariable: this.resultVariable(),
    };
  }

  submit(): void {
    const actor = this.auth.user()?.email ?? 'admin';
    const patch = {
      configJson: this.buildConfig(),
      inputMapping: this.inputMapping(),
      outputMapping: this.outputMapping(),
      errorPolicy: {
        ...DEFAULT_ERROR_POLICY,
        timeoutMs: this.timeoutMs(),
        maxRetry: this.maxRetry(),
        retryDelayMs: this.retryDelayMs(),
        retryBackoff: this.retryBackoff(),
        onFailure: this.onFailure(),
        notifyRoles: this.notifyRoles(),
      },
    };
    const request: ServiceTaskApiWriteRequest = {
      code: this.code().trim(), name: this.name().trim(), description: this.description().trim(),
      typeCode: this.typeCode(), ownerModule: this.ownerModule().trim(), tags: this.tags(),
      config: patch.configJson as unknown as Record<string, unknown>,
      inputMapping: patch.inputMapping as unknown as Record<string, unknown>[],
      outputMapping: patch.outputMapping as unknown as Record<string, unknown>[],
      errorPolicy: patch.errorPolicy as unknown as Record<string, unknown>,
      changeNote: this.changeNote() || (this.apiDefinition() ? 'Cập nhật cấu hình.' : 'Tạo cấu hình.'), actor,
    };
    const detail = this.apiDefinition();
    const operation = detail ? this.configApi.update(detail.id, request) : this.configApi.create(request);
    this.saving.set(true);
    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.success(detail ? 'Đã lưu bản nháp cấu hình.' : 'Đã tạo cấu hình Service Task.');
        this.saved.emit();
        this.close();
      },
      error: () => { this.saving.set(false); this.message.error('Không thể lưu cấu hình Service Task.'); },
    });
  }
}
