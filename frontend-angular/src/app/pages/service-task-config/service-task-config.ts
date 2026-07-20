import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import {
  reconcilableServiceTaskProcesses,
  summarizeServiceTaskReconcileHealth,
} from '../../core/models/service-task-reconcile';
import {
  SERVICE_TASK_EXECUTION_STATUS_META,
  SERVICE_TASK_STATUS_META,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskDefinitionStatus,
  type ServiceTaskExecutionLog,
  type ServiceTaskExecutionStatus,
  type ServiceTaskTypeCode,
} from '../../core/models/service-task';
import { ServiceTaskService } from '../../core/services/service-task.service';
import {
  ServiceTaskConfigApiService,
  type ServiceTaskApiBinding,
  type ServiceTaskApiDefinitionSummary,
  type ServiceTaskApiDefinitionDetail,
} from '../../core/services/service-task-config-api.service';
import { ServiceTaskBindingTable } from '../../shared/service-task-binding-table/service-task-binding-table';
import { ServiceTaskExecutionDrawer } from '../../shared/service-task-execution-drawer/service-task-execution-drawer';
import { ServiceTaskFormDrawer } from '../../shared/service-task-form-drawer/service-task-form-drawer';
import { ServiceTaskTestPanel } from '../../shared/service-task-test-panel/service-task-test-panel';

// Port của webapp/src/pages/ServiceTaskConfig.tsx — trang "Cấu hình Service Task"
// (nav: "Tác vụ hệ thống", route /cau-hinh-service-task). 6 tab: Tổng quan / Cấu
// hình / Đối soát BPMN / Kiểm thử / Log thực thi / Phiên bản & audit. Không
// backend — toàn bộ state qua ServiceTaskService (signal store).

interface DefinitionRow {
  definition: ServiceTaskDefinition;
  typeName: string;
  latestVersion?: ServiceTaskConfigVersion;
  bindingCount: number;
  processCodes: string[];
  connectorKey?: string;
  incidentCount: number;
  successRate: string;
}

const CATEGORY_GROUPS: { key: string; label: string; icon: string }[] = [
  { key: 'communication', label: 'Giao tiếp', icon: 'send' },
  { key: 'integration', label: 'Tích hợp', icon: 'api' },
  { key: 'data', label: 'Dữ liệu', icon: 'database' },
  { key: 'document', label: 'Văn bản', icon: 'file-text' },
  { key: 'decision', label: 'Quyết định', icon: 'branches' },
];

function latestVersion(versions: ServiceTaskConfigVersion[]): ServiceTaskConfigVersion | undefined {
  return [...versions].sort((a, b) => b.versionNo - a.versionNo)[0];
}

function connectorOf(config?: ServiceTaskConfigVersion['configJson']): string | undefined {
  return config?.typeCode === 'CALL_API' ? config.connectorKey : undefined;
}

@Component({
  selector: 'app-service-task-config',
  imports: [
    KeyValuePipe,
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzDropDownModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzProgressModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
    NzTagModule,
    NzTypographyModule,
    ServiceTaskBindingTable,
    ServiceTaskExecutionDrawer,
    ServiceTaskFormDrawer,
    ServiceTaskTestPanel,
  ],
  templateUrl: './service-task-config.html',
  styleUrl: './service-task-config.scss',
})
export class ServiceTaskConfigPage {
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  readonly serviceTasks = inject(ServiceTaskService);
  private readonly configApi = inject(ServiceTaskConfigApiService);

  // Mọi thứ còn lại trên trang này đọc từ ServiceTaskService (seed in-memory, KHÔNG chi phối runtime).
  // Ba signal dưới đây là nguồn thật từ `/api/service-tasks` — dùng để banner đầu trang nói rõ cấu
  // hình nào đang thực sự điều khiển job worker, thay vì để người dùng tưởng bảng mock là thật.
  readonly realDefinitions = signal<ServiceTaskApiDefinitionSummary[]>([]);
  readonly realBindings = signal<ServiceTaskApiBinding[]>([]);
  readonly realConfigLoading = signal(true);
  readonly realConfigError = signal<string | undefined>(undefined);
  readonly editingApi = signal<ServiceTaskApiDefinitionDetail | undefined>(undefined);

  constructor() {
    this.reloadRealConfig();
  }

  reloadRealConfig(): void {
    this.realConfigLoading.set(true);
    this.realConfigError.set(undefined);
    forkJoin({ definitions: this.configApi.list(), bindings: this.configApi.listBindings() }).subscribe({
      next: ({ definitions, bindings }) => {
        this.realDefinitions.set(definitions);
        this.realBindings.set(bindings);
        this.realConfigLoading.set(false);
      },
      error: () => {
        this.realConfigError.set('Không đọc được /api/service-tasks — backend 8090 có chạy không?');
        this.realConfigLoading.set(false);
      },
    });
  }

  readonly activeRealBindings = computed(() =>
    this.realBindings().filter((binding) => binding.bindingStatus === 'ACTIVE'),
  );

  readonly statusMeta = SERVICE_TASK_STATUS_META;
  readonly executionStatusMeta = SERVICE_TASK_EXECUTION_STATUS_META;
  readonly categoryGroups = CATEGORY_GROUPS;
  readonly statusList: ServiceTaskDefinitionStatus[] = ['DRAFT', 'READY', 'ACTIVE', 'DEPRECATED', 'ERROR'];

  readonly editing = signal<ServiceTaskDefinition | undefined>(undefined);
  readonly drawerOpen = signal(false);

  readonly typeFilter = signal<ServiceTaskTypeCode | undefined>(undefined);
  readonly statusFilter = signal<ServiceTaskDefinitionStatus | undefined>(undefined);
  readonly processFilter = signal<string | undefined>(undefined);
  readonly connectorFilter = signal<string | undefined>(undefined);
  readonly incidentFilter = signal<boolean | undefined>(undefined);

  readonly logProcessFilter = signal<string | undefined>(undefined);
  readonly logDefinitionFilter = signal<string | undefined>(undefined);
  readonly logStatusFilter = signal<ServiceTaskExecutionStatus | undefined>(undefined);
  readonly logIncidentFilter = signal<boolean | undefined>(undefined);
  readonly selectedLogId = signal<string | undefined>(undefined);

  readonly auditDefinitionFilter = signal<string | undefined>(undefined);

  private readonly reconcileProcesses = reconcilableServiceTaskProcesses();

  readonly rows = computed<DefinitionRow[]>(() => {
    const definitions = this.realDefinitions().map((item): ServiceTaskDefinition => ({
      id: item.id, code: item.code, name: item.name, description: item.description,
      typeCode: item.typeCode, status: item.status, ownerModule: item.ownerModule, tags: item.tags,
      activeVersionNo: item.activeVersion ?? undefined, createdBy: '', updatedBy: '', createdAt: '', updatedAt: item.updatedAt,
    }));
    const types = this.serviceTasks.types();
    const bindings = this.serviceTasks.bindings();
    const executionLogs = this.serviceTasks.executionLogs();

    return definitions.map((definition) => {
      const type = types.find((item) => item.code === definition.typeCode);
      const summary = this.realDefinitions().find((item) => item.id === definition.id)!;
      const latest = summary.latestVersion ? ({ versionNo: summary.latestVersion } as ServiceTaskConfigVersion) : undefined;
      const activeBindings = this.realBindings().filter(
        (binding) => binding.definitionId === definition.id && binding.bindingStatus === 'ACTIVE',
      );
      const logs = executionLogs.filter((log) => log.serviceTaskDefinitionId === definition.id);
      const successCount = logs.filter((log) => log.status === 'SUCCESS').length;
      const incidentCount = logs.filter((log) => log.status === 'FAILED' && log.incidentId).length;
      return {
        definition,
        typeName: type?.name ?? definition.typeCode,
        latestVersion: latest,
        bindingCount: activeBindings.length,
        processCodes: [...new Set(activeBindings.map((binding) => binding.processCode))],
        connectorKey: connectorOf(latest?.configJson),
        incidentCount,
        successRate: logs.length ? `${Math.round((successCount / logs.length) * 100)}%` : '-',
      };
    });
  });

  readonly filteredRows = computed(() =>
    this.rows().filter((row) => {
      if (this.typeFilter() && row.definition.typeCode !== this.typeFilter()) return false;
      if (this.statusFilter() && row.definition.status !== this.statusFilter()) return false;
      if (this.processFilter() && !row.processCodes.includes(this.processFilter()!)) return false;
      if (this.connectorFilter() && row.connectorKey !== this.connectorFilter()) return false;
      if (this.incidentFilter() !== undefined && row.incidentCount > 0 !== this.incidentFilter()) return false;
      return true;
    }),
  );

  private readonly reconcileHealth = computed(() =>
    summarizeServiceTaskReconcileHealth(
      this.reconcileProcesses,
      this.serviceTasks.bindings(),
      this.serviceTasks.definitions(),
      this.serviceTasks.versions(),
    ),
  );

  readonly missingBinding = computed(() => this.reconcileHealth().missingCount);
  readonly openIncidents = computed(
    () => this.serviceTasks.executionLogs().filter((log) => log.status === 'FAILED' && log.incidentId).length,
  );

  readonly topProcesses = computed(() => {
    const map = new Map<string, number>();
    this.serviceTasks
      .bindings()
      .filter((b) => b.bindingStatus === 'ACTIVE')
      .forEach((b) => map.set(b.processCode, (map.get(b.processCode) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ code, count }));
  });

  readonly filteredStats = computed(() => {
    const filtered = this.filteredRows();
    return {
      total: filtered.length,
      active: filtered.filter((r) => r.definition.status === 'ACTIVE').length,
      withIncidents: filtered.filter((r) => r.incidentCount > 0).length,
      missingBinding: filtered.filter((r) => r.bindingCount === 0).length,
    };
  });

  readonly processOptions = computed(() => [
    ...new Set([
      ...this.serviceTasks.bindings().map((b) => b.processCode),
      ...this.reconcileProcesses.map((p) => p.processCode),
    ]),
  ].map((value) => ({ label: value, value })));

  readonly connectorOptions = computed(() =>
    [...new Set(this.rows().map((row) => row.connectorKey).filter((v): v is string => Boolean(v)))].map((value) => ({
      label: value,
      value,
    })),
  );

  readonly definitionOptions = computed(() =>
    this.serviceTasks.definitions().map((d) => ({ label: `${d.name} - ${d.code}`, value: d.id })),
  );

  readonly selectedLog = computed(() => this.serviceTasks.executionLogs().find((log) => log.id === this.selectedLogId()));
  readonly selectedLogDefinition = computed(() => {
    const log = this.selectedLog();
    return log ? this.serviceTasks.getDefinition(log.serviceTaskDefinitionId) : undefined;
  });
  readonly selectedLogVersion = computed(() => {
    const log = this.selectedLog();
    return log ? this.serviceTasks.getVersion(log.serviceTaskDefinitionId, log.configVersionNo) : undefined;
  });

  readonly filteredExecutionLogs = computed(() =>
    this.serviceTasks.executionLogs().filter((log) => {
      if (this.logProcessFilter() && log.processCode !== this.logProcessFilter()) return false;
      if (this.logDefinitionFilter() && log.serviceTaskDefinitionId !== this.logDefinitionFilter()) return false;
      if (this.logStatusFilter() && log.status !== this.logStatusFilter()) return false;
      if (this.logIncidentFilter() !== undefined && Boolean(log.incidentId) !== this.logIncidentFilter()) return false;
      return true;
    }),
  );

  readonly versionRows = computed(() => {
    const filter = this.auditDefinitionFilter();
    return this.serviceTasks
      .versions()
      .filter((version) => (filter ? version.serviceTaskDefinitionId === filter : true))
      .sort((a, b) => b.versionNo - a.versionNo);
  });

  readonly filteredAuditEntries = computed(() => {
    const filter = this.auditDefinitionFilter();
    if (!filter) return this.serviceTasks.auditEntries();
    const versionIds = new Set(this.serviceTasks.versions().filter((v) => v.serviceTaskDefinitionId === filter).map((v) => v.id));
    const bindingIds = new Set(
      this.serviceTasks.bindings().filter((b) => b.serviceTaskDefinitionId === filter).map((b) => b.id),
    );
    const logIds = new Set(
      this.serviceTasks.executionLogs().filter((l) => l.serviceTaskDefinitionId === filter).map((l) => l.id),
    );
    const entityIds = new Set<string>([filter, ...versionIds, ...bindingIds, ...logIds]);
    return this.serviceTasks.auditEntries().filter((entry) => entityIds.has(entry.entityId));
  });

  readonly sortedRecentAudit = computed(() =>
    [...this.serviceTasks.auditEntries()].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 5),
  );

  readonly attentionRows = computed(() =>
    this.rows().filter((row) => row.incidentCount > 0 || row.bindingCount === 0),
  );

  private actor(): string {
    return this.auth.user()?.email ?? 'admin';
  }

  openCreate(): void {
    this.editing.set(undefined);
    this.editingApi.set(undefined);
    this.drawerOpen.set(true);
  }

  openEdit(row: DefinitionRow): void {
    this.configApi.get(row.definition.id).subscribe({
      next: (detail) => { this.editing.set(row.definition); this.editingApi.set(detail); this.drawerOpen.set(true); },
      error: () => this.message.error('Không đọc được chi tiết cấu hình.'),
    });
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editing.set(undefined);
    this.editingApi.set(undefined);
  }

  delete(row: DefinitionRow): void {
    this.modal.confirm({
      nzTitle: `Xóa cấu hình ${row.definition.code}?`,
      nzContent: 'Chỉ có thể xóa cấu hình chưa được gắn binding.', nzOkDanger: true,
      nzOnOk: () => new Promise<void>((resolve, reject) => this.configApi.delete(row.definition.id).subscribe({
        next: () => { this.message.success('Đã xóa cấu hình.'); this.reloadRealConfig(); resolve(); },
        error: () => { this.message.error('Không thể xóa cấu hình đang có binding.'); reject(); },
      })),
    });
  }

  duplicate(row: DefinitionRow): void {
    this.configApi.get(row.definition.id).subscribe({
      next: (detail) => {
        const version = detail.versions[0];
        if (!version?.config || !version.errorPolicy) {
          this.message.error('Không thể nhân bản cấu hình bị lỗi JSON.');
          return;
        }
        this.configApi.create({
          code: `${detail.code}_COPY_${Date.now().toString().slice(-6)}`,
          name: `${detail.name} (Bản sao)`, description: detail.description, typeCode: detail.typeCode,
          ownerModule: detail.ownerModule, tags: detail.tags, config: version.config,
          inputMapping: version.inputMapping ?? [], outputMapping: version.outputMapping ?? [],
          errorPolicy: version.errorPolicy, changeNote: `Nhân bản từ ${detail.code}.`, actor: this.actor(),
        }).subscribe({
          next: () => { this.message.success('Đã tạo bản sao cấu hình.'); this.reloadRealConfig(); },
          error: () => this.message.error('Không thể tạo bản sao cấu hình.'),
        });
      },
      error: () => this.message.error('Không đọc được cấu hình cần nhân bản.'),
    });
  }

  validate(row: DefinitionRow): void {
    const version = latestVersion(this.serviceTasks.getVersions(row.definition.id));
    if (!version) {
      this.message.error('Chưa có version để validate.');
      return;
    }
    const result = this.serviceTasks.validateVersion(row.definition.id, version.versionNo, this.actor());
    if (result.valid) {
      this.message.success('Cấu hình hợp lệ, đã chuyển trạng thái sẵn sàng.');
      return;
    }
    this.modal.error({
      nzTitle: 'Cấu hình chưa hợp lệ',
      nzContent: result.errors.map((error) => `<p>${error}</p>`).join(''),
    });
  }

  activate(row: DefinitionRow): void {
    const version = latestVersion(this.serviceTasks.getVersions(row.definition.id));
    if (!version) {
      this.message.error('Chưa có version để active.');
      return;
    }
    const result = this.serviceTasks.activateVersion(row.definition.id, version.versionNo, this.actor(), 'Active từ màn cấu hình.');
    if (result.valid) this.message.success(`Đã active version ${version.versionNo}.`);
    else this.message.error('Không thể active do cấu hình chưa hợp lệ.');
  }

  clearFilters(): void {
    this.typeFilter.set(undefined);
    this.statusFilter.set(undefined);
    this.processFilter.set(undefined);
    this.connectorFilter.set(undefined);
    this.incidentFilter.set(undefined);
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.typeFilter()) count++;
    if (this.statusFilter()) count++;
    if (this.processFilter()) count++;
    if (this.connectorFilter()) count++;
    if (this.incidentFilter() !== undefined) count++;
    return count;
  }

  definitionName(id: string): string {
    const definition = this.serviceTasks.getDefinition(id);
    return definition ? `${definition.name} (${definition.code})` : id;
  }

  statusLabel(status: ServiceTaskDefinitionStatus): string {
    return this.statusMeta[status].label;
  }

  onRetryLog(logId: string): void {
    this.serviceTasks.retryExecution(logId, this.actor());
    this.message.success('Đã đưa execution log vào trạng thái retry mock.');
  }

  onManualResolveLog(payload: { logId: string; note: string }): void {
    this.serviceTasks.manualResolveExecution(payload.logId, this.actor(), payload.note);
    this.message.success('Đã manual resolve execution log mock.');
  }
}
