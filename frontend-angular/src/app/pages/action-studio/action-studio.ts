import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import {
  ACTION_GROUP_LABEL, ACTION_TONE_LABEL, ACTION_TYPE_LABEL, ActionAvailabilityPolicy,
  ActionDefinition, ActionPresentation, ActionSurface, ActionTone, ActionUiGroup, DossierStatus, ExceptionPolicy,
  FORM_OPTIONS, PERMISSION_LABEL, ROLE_LABEL, STATUS_LABEL, SURFACE_LABEL, SimulationContext,
  SimulatedAction,
} from '../../core/models/action-studio';
import { ActionStudioService, ReconcileRow } from '../../core/services/action-studio.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-action-studio',
  imports: [
    FormsModule, NzAlertModule, NzBadgeModule, NzButtonModule, NzCardModule, NzDescriptionsModule,
    NzDrawerModule, NzEmptyModule, NzGridModule, NzIconModule, NzInputModule, NzPopconfirmModule,
    NzProgressModule, NzSelectModule, NzSpaceModule, NzSwitchModule, NzTableModule, NzTabsModule,
    NzTagModule, NzTooltipModule, NzTypographyModule,
  ],
  templateUrl: './action-studio.html',
  styleUrl: './action-studio.scss',
})
export class ActionStudioPage implements OnInit {
  readonly store = inject(ActionStudioService);
  private readonly message = inject(NzMessageService);
  private readonly auth = inject(AuthService);
  private simulationRequestId = 0;

  readonly typeLabel = ACTION_TYPE_LABEL;
  readonly groupLabel = ACTION_GROUP_LABEL;
  readonly toneLabel = ACTION_TONE_LABEL;
  readonly surfaceLabel = SURFACE_LABEL;
  readonly statusLabel = STATUS_LABEL;
  readonly roleLabel = ROLE_LABEL;
  readonly permissionLabel = PERMISSION_LABEL;
  readonly forms = FORM_OPTIONS;
  readonly surfaces = Object.keys(SURFACE_LABEL) as ActionSurface[];
  readonly statuses = Object.keys(STATUS_LABEL) as DossierStatus[];
  readonly roles = Object.keys(ROLE_LABEL);
  readonly permissions = Object.keys(PERMISSION_LABEL);
  readonly groups = Object.keys(ACTION_GROUP_LABEL) as ActionUiGroup[];
  readonly tones = Object.keys(ACTION_TONE_LABEL) as ActionTone[];

  readonly selectedTabIndex = signal(0);
  readonly policyQuery = signal('');
  readonly policyActionFilter = signal<string | null>(null);
  readonly policyEnabledFilter = signal<boolean | null>(null);
  readonly policyDraft = signal<ActionAvailabilityPolicy | null>(null);
  readonly exceptionDraft = signal<ExceptionPolicy | null>(null);
  readonly presentationDraft = signal<ActionPresentation | null>(null);
  readonly reconcileProcess = signal('RD01.01');
  readonly reconcileRows = signal<ReconcileRow[]>([]);
  readonly simulatedActions = signal<SimulatedAction[]>([]);
  readonly simulation = signal<SimulationContext>({
    surface: 'DOSSIER_DETAIL', processCode: 'RD01.01', taskDefinitionKey: 't2',
    dossierStatus: 'processing', roleCodes: ['TD'], permissions: ['PROCESS_STEP', 'ADD_COMMENT', 'DOWNLOAD_DOCUMENT'], isAdmin: false,
  });

  readonly filteredPolicies = computed(() => {
    const query = this.policyQuery().trim().toLowerCase();
    return this.store.availabilityPolicies().filter((item) =>
      (!query || `${item.id} ${item.actionCode} ${item.processCode ?? ''} ${item.taskDefinitionKey ?? ''}`.toLowerCase().includes(query)) &&
      (!this.policyActionFilter() || item.actionCode === this.policyActionFilter()) &&
      (this.policyEnabledFilter() == null || item.enabled === this.policyEnabledFilter()),
    ).sort((a, b) => a.displayOrder - b.displayOrder);
  });
  readonly reconcileStats = computed(() => {
    const rows = this.reconcileRows();
    return {
      ok: rows.filter((item) => item.status === 'ok').length,
      generic: rows.filter((item) => item.status === 'generic').length,
      unfilled: rows.filter((item) => item.status === 'unfilled').length,
      missing: rows.filter((item) => item.status === 'missing').length,
      percent: rows.length ? Math.round(rows.filter((item) => item.status === 'ok').length / rows.length * 100) : 0,
    };
  });
  readonly simulationSteps = computed(() => this.store.processes().find((item) => item.code === this.simulation().processCode)?.steps ?? []);
  readonly visibleActions = computed(() => this.simulatedActions().filter((item) => item.visible));
  readonly hiddenActions = computed(() => this.simulatedActions().filter((item) => !item.visible));

  ngOnInit(): void {
    this.store.load().subscribe({
      next: () => {
        const process = this.store.processes()[0];
        if (process && !this.store.processes().some((item) => item.code === this.simulation().processCode)) {
          this.reconcileProcess.set(process.code);
          this.simulation.update((item) => ({ ...item, processCode: process.code, taskDefinitionKey: process.steps[0]?.key ?? '' }));
        }
        this.refreshReconcile();
        this.refreshSimulation();
      },
      error: (error) => this.showError('Không tải được cấu hình Ma trận Hành động.', error),
    });
  }

  actionName(code: string): string {
    return this.store.definitions().find((item) => item.actionCode === code)?.actionName ?? code;
  }

  processName(code: string | null): string {
    return !code ? 'Mọi quy trình' : this.store.processes().find((item) => item.code === code)?.name ?? code;
  }

  openNewPolicy(): void {
    this.policyDraft.set({ id: `AP-${Date.now()}`, actionCode: 'APPROVE_STEP', surface: 'DOSSIER_DETAIL', processCode: null,
      taskDefinitionKey: null, dossierStatus: 'processing', allowedRoleCodes: [], requiredPermissions: ['PROCESS_STEP'],
      formKey: 'phieu-phe-duyet', conditionExpression: 'user in currentStep.candidateGroups', displayOrder: 50, enabled: true });
  }

  editPolicy(item: ActionAvailabilityPolicy): void {
    this.policyDraft.set({ ...item, allowedRoleCodes: [...item.allowedRoleCodes], requiredPermissions: [...item.requiredPermissions] });
  }

  patchPolicy<K extends keyof ActionAvailabilityPolicy>(key: K, value: ActionAvailabilityPolicy[K]): void {
    this.policyDraft.update((item) => item ? { ...item, [key]: value } : item);
  }

  savePolicy(): void {
    const item = this.policyDraft();
    if (!item) return;
    if (!item.id.trim() || !item.actionCode) { this.message.warning('Vui lòng nhập đủ mã luật và hành động.'); return; }
    this.store.saveAvailability(item, this.actor()).subscribe({
      next: () => { this.policyDraft.set(null); this.message.success('Đã lưu luật hiển thị nút.'); this.refreshDerived(); },
      error: (error) => this.showError('Không lưu được luật hiển thị nút.', error),
    });
  }

  togglePolicy(item: ActionAvailabilityPolicy, enabled: boolean): void {
    this.store.saveAvailability({ ...item, enabled }, this.actor()).subscribe({
      next: () => this.refreshDerived(),
      error: (error) => this.showError('Không đổi được trạng thái luật.', error),
    });
  }

  removePolicy(item: ActionAvailabilityPolicy): void {
    this.store.removeAvailability(item, this.actor()).subscribe({
      next: () => { this.message.success('Đã xóa luật.'); this.refreshDerived(); },
      error: (error) => this.showError('Không xóa được luật.', error),
    });
  }

  openNewException(): void {
    this.exceptionDraft.set({ id: `EP-${Date.now()}`, actionCode: 'REQUEST_SKIP_STEP', objectType: 'DOSSIER', processCode: null,
      fromStepKey: null, targetType: 'STEP', targetStepKey: null, allowedRoleCodes: [], requiredPermissions: ['REQUEST_EXCEPTION'],
      requiresApproval: true, requiresReason: true, requiresEvidence: false, enabled: true });
  }

  editException(item: ExceptionPolicy): void {
    this.exceptionDraft.set({ ...item, allowedRoleCodes: [...item.allowedRoleCodes], requiredPermissions: [...item.requiredPermissions] });
  }

  patchException<K extends keyof ExceptionPolicy>(key: K, value: ExceptionPolicy[K]): void {
    this.exceptionDraft.update((item) => item ? { ...item, [key]: value } : item);
  }

  saveException(): void {
    const item = this.exceptionDraft();
    if (!item) return;
    this.store.saveException(item, this.actor()).subscribe({
      next: () => { this.exceptionDraft.set(null); this.message.success('Đã lưu chính sách Chi tiết.'); },
      error: (error) => this.showError('Không lưu được chính sách Chi tiết.', error),
    });
  }

  toggleException(item: ExceptionPolicy, enabled: boolean): void {
    this.store.saveException({ ...item, enabled }, this.actor()).subscribe({
      error: (error) => this.showError('Không đổi được trạng thái chính sách Chi tiết.', error),
    });
  }

  hasVisibleGroup(group: ActionUiGroup): boolean {
    return this.visibleActions().some((item) => item.uiGroup === group);
  }

  editPresentation(code: string): void {
    const item = this.store.presentations().find((value) => value.actionCode === code);
    this.presentationDraft.set(item ? { ...item } : null);
  }

  patchPresentation<K extends keyof ActionPresentation>(key: K, value: ActionPresentation[K]): void {
    this.presentationDraft.update((item) => item ? { ...item, [key]: value } : item);
  }

  savePresentation(): void {
    const item = this.presentationDraft();
    if (!item) return;
    this.store.savePresentation(item, this.actor()).subscribe({
      next: () => { this.presentationDraft.set(null); this.message.success('Đã cập nhật cách hiển thị nút.'); this.refreshSimulation(); },
      error: (error) => this.showError('Không lưu được cách hiển thị nút.', error),
    });
  }

  scaffold(): void {
    this.store.scaffold(this.reconcileProcess(), this.actor()).subscribe({
      next: (response) => {
        this.reconcileRows.set(response.rows);
        response.createdCount ? this.message.success(`Đã tạo ${response.createdCount} luật còn thiếu từ BPMN.`)
          : this.message.info('Không có luật thiếu cần tạo.');
        this.refreshSimulation();
      },
      error: (error) => this.showError('Không scaffold được luật từ BPMN.', error),
    });
  }

  setReconcileProcess(processCode: string): void {
    this.reconcileProcess.set(processCode);
    this.refreshReconcile();
  }

  toggleAction(item: ActionDefinition, active: boolean): void {
    this.store.toggleAction(item, active, this.actor()).subscribe({
      next: () => this.refreshSimulation(),
      error: (error) => this.showError('Không đổi được trạng thái hành động.', error),
    });
  }

  setSimulation<K extends keyof SimulationContext>(key: K, value: SimulationContext[K]): void {
    this.simulation.update((item) => ({ ...item, [key]: value }));
    if (key === 'processCode') {
      const firstStep = this.store.processes().find((item) => item.code === value)?.steps[0];
      if (firstStep) this.simulation.update((item) => ({ ...item, taskDefinitionKey: firstStep.key }));
    }
    this.refreshSimulation();
  }

  statusColor(status: ReconcileRow['status']): string {
    return ({ ok: 'success', generic: 'processing', unfilled: 'warning', missing: 'error' })[status];
  }

  statusText(status: ReconcileRow['status']): string {
    return ({ ok: 'Đã khớp', generic: 'Luật chung', unfilled: 'Thiếu biểu mẫu', missing: 'Thiếu luật' })[status];
  }

  private refreshDerived(): void {
    this.refreshReconcile();
    this.refreshSimulation();
  }

  private refreshReconcile(): void {
    this.store.reconcile(this.reconcileProcess()).subscribe({
      next: (rows) => this.reconcileRows.set(rows),
      error: (error) => this.showError('Không tải được kết quả đối soát BPMN.', error),
    });
  }

  private refreshSimulation(): void {
    const requestId = ++this.simulationRequestId;
    this.store.simulate(this.simulation()).subscribe({
      next: (items) => { if (requestId === this.simulationRequestId) this.simulatedActions.set(items); },
      error: (error) => this.showError('Không chạy được mô phỏng hành động.', error),
    });
  }

  private actor(): string | undefined {
    return this.auth.user()?.hoTen;
  }

  private showError(prefix: string, error: unknown): void {
    const detail = error instanceof HttpErrorResponse
      ? (error.error?.message as string | undefined) ?? error.message : undefined;
    this.message.error(detail ? `${prefix} ${detail}` : prefix);
  }
}
