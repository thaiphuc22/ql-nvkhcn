import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import {
  SERVICE_TASK_RECONCILE_STATUS_META,
  reconcilableServiceTaskProcesses,
  reconcileServiceTasks,
  scaffoldServiceTaskBinding,
  summarizeServiceTaskReconcileHealth,
  type ReconcilableServiceTaskProcess,
  type ServiceTaskReconcileRow,
} from '../../core/models/service-task-reconcile';
import { SERVICE_TASK_STATUS_META } from '../../core/models/service-task';
import { ServiceTaskService } from '../../core/services/service-task.service';

// Port của webapp/src/components/ServiceTaskBindingTable.tsx — tab "Đối soát BPMN"
// đối chiếu metadata service task (mock, xem service-task-reconcile.ts) với binding
// thực tế đã gắn trong ServiceTaskService.

function processOptionValue(processCode: string, processVersion: string): string {
  return `${processCode}::${processVersion}`;
}

function rowCanBind(row: ServiceTaskReconcileRow): boolean {
  return row.source === 'bpmn' && row.status !== 'orphan';
}

@Component({
  selector: 'app-service-task-binding-table',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
  ],
  templateUrl: './service-task-binding-table.html',
  styleUrl: './service-task-binding-table.scss',
})
export class ServiceTaskBindingTable {
  private readonly auth = inject(AuthService);
  private readonly serviceTasks = inject(ServiceTaskService);
  private readonly message = inject(NzMessageService);

  readonly statusMeta = SERVICE_TASK_RECONCILE_STATUS_META;
  readonly definitionStatusMeta = SERVICE_TASK_STATUS_META;

  readonly processes: ReconcilableServiceTaskProcess[] = reconcilableServiceTaskProcesses();
  readonly selectedProcessKey = signal<string | undefined>(
    this.processes[0] ? processOptionValue(this.processes[0].processCode, this.processes[0].processVersion) : undefined,
  );

  readonly bindingRow = signal<ServiceTaskReconcileRow | undefined>(undefined);
  readonly selectedDefinitionId = signal<string | undefined>(undefined);

  readonly processOptions = this.processes.map((process) => ({
    label: `${process.processCode} v${process.processVersion} - ${process.processName}`,
    value: processOptionValue(process.processCode, process.processVersion),
  }));

  readonly selectedProcess = computed(
    () => this.processes.find((p) => processOptionValue(p.processCode, p.processVersion) === this.selectedProcessKey()) ?? this.processes[0],
  );

  readonly rows = computed(() => {
    const process = this.selectedProcess();
    if (!process) return [];
    return reconcileServiceTasks(process, this.serviceTasks.bindings(), this.serviceTasks.definitions(), this.serviceTasks.versions());
  });

  readonly health = computed(() =>
    summarizeServiceTaskReconcileHealth(this.processes, this.serviceTasks.bindings(), this.serviceTasks.definitions(), this.serviceTasks.versions()),
  );

  readonly bindableDefinitions = computed(() =>
    this.serviceTasks.definitions().filter((definition) => definition.status === 'ACTIVE' || definition.status === 'READY'),
  );

  readonly bindableDefinitionOptions = computed(() =>
    this.bindableDefinitions().map((definition) => ({
      label: `${definition.name} - ${definition.code} (${this.definitionStatusMeta[definition.status].label})`,
      value: definition.id,
    })),
  );

  rowCanBind = rowCanBind;

  definitionLabel(definitionId?: string) {
    if (!definitionId) return undefined;
    return this.serviceTasks.getDefinition(definitionId);
  }

  openBindModal(row: ServiceTaskReconcileRow): void {
    this.bindingRow.set(row);
    this.selectedDefinitionId.set(row.definition?.id);
  }

  closeBindModal(): void {
    this.bindingRow.set(undefined);
    this.selectedDefinitionId.set(undefined);
  }

  confirmBind(): void {
    const row = this.bindingRow();
    const definitionId = this.selectedDefinitionId();
    if (!row || !definitionId) return;
    const actor = this.auth.user()?.email ?? 'admin';
    const definition = this.serviceTasks.getDefinition(definitionId);
    this.serviceTasks.bindTask(scaffoldServiceTaskBinding(row, definitionId, actor));
    this.closeBindModal();

    if (definition?.status === 'READY') {
      this.message.warning('Đã gắn cấu hình, nhưng definition chưa active nên trạng thái sẽ là "Chưa sẵn sàng".');
      return;
    }
    this.message.success('Đã gắn cấu hình cho service task BPMN.');
  }

  unbind(row: ServiceTaskReconcileRow): void {
    if (!row.binding) return;
    const actor = this.auth.user()?.email ?? 'admin';
    this.serviceTasks.unbindTask(row.binding.id, actor);
    this.message.success('Đã bỏ gắn cấu hình khỏi service task BPMN.');
  }
}
