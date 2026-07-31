import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
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
  ActionDefinition, ActionPresentation, ActionTone, ActionUiGroup, ExceptionPolicy,
  STATUS_LABEL, SURFACE_LABEL, SimulationContext,
  SimulatedAction,
} from '../../core/models/action-studio';
import { ActionStudioService, ReconcileRow } from '../../core/services/action-studio.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-action-studio',
  imports: [
    FormsModule, CdkDrag, CdkDragHandle, CdkDropList, NzAlertModule, NzBadgeModule, NzButtonModule, NzCardModule, NzCheckboxModule, NzDescriptionsModule,
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
  readonly forms = computed(() => this.store.referenceData().forms);
  readonly surfaces = computed(() => this.store.referenceData().surfaces);
  readonly statuses = computed(() => this.store.referenceData().statuses);
  readonly roles = computed(() => this.store.referenceData().roles);
  readonly permissions = computed(() => this.store.referenceData().permissions);
  readonly groups = Object.keys(ACTION_GROUP_LABEL) as ActionUiGroup[];
  readonly tones = Object.keys(ACTION_TONE_LABEL) as ActionTone[];
  readonly policyStatusLabel = {
    DRAFT: 'Bản nháp', ACTIVE: 'Đang hoạt động', DISABLED: 'Đã vô hiệu', INVALID: 'Không còn hợp lệ',
  } as const;
  readonly policyStatusColor = {
    DRAFT: 'gold', ACTIVE: 'success', DISABLED: 'default', INVALID: 'error',
  } as const;

  readonly selectedTabIndex = signal(0);
  readonly policyQuery = signal('');
  readonly policyActionFilter = signal<string | null>(null);
  readonly policyEnabledFilter = signal<boolean | null>(null);
  readonly policyDraft = signal<ActionAvailabilityPolicy | null>(null);
  readonly selectedPolicyIds = signal<ReadonlySet<string>>(new Set());
  readonly deletingPolicies = signal(false);
  readonly updatingPolicyStatus = signal(false);
  readonly exceptionDraft = signal<ExceptionPolicy | null>(null);
  readonly presentationDraft = signal<ActionPresentation | null>(null);
  readonly bundleCopySourceId = signal<string | null>(null);
  readonly reconcileProcess = signal('');
  readonly reconcileRows = signal<ReconcileRow[]>([]);
  readonly simulatedActions = signal<SimulatedAction[]>([]);
  readonly simulation = signal<SimulationContext>({
    surface: 'DOSSIER_DETAIL', processCode: '', taskDefinitionKey: '',
    dossierStatus: 'processing', roleCodes: ['TD'], permissions: ['PROCESS_STEP', 'ADD_COMMENT', 'DOWNLOAD_DOCUMENT'], isAdmin: false,
  });

  readonly filteredPolicies = computed(() => {
    const query = this.policyQuery().trim().toLowerCase();
    return this.store.availabilityPolicies().filter((item) =>
      (!query || `${item.id} ${item.actionCode} ${item.processCode ?? ''} ${item.taskDefinitionKey ?? ''}`.toLowerCase().includes(query)) &&
      (!this.policyActionFilter() || item.actionCode === this.policyActionFilter()) &&
      (this.policyEnabledFilter() == null || (item.lifecycleStatus === 'ACTIVE') === this.policyEnabledFilter()),
    ).sort((a, b) => a.displayOrder - b.displayOrder);
  });
  readonly selectedPolicies = computed(() => this.store.availabilityPolicies()
    .filter((item) => this.selectedPolicyIds().has(item.id)));
  readonly allFilteredPoliciesSelected = computed(() => this.filteredPolicies().length > 0
    && this.filteredPolicies().every((item) => this.selectedPolicyIds().has(item.id)));
  readonly someFilteredPoliciesSelected = computed(() => !this.allFilteredPoliciesSelected()
    && this.filteredPolicies().some((item) => this.selectedPolicyIds().has(item.id)));
  readonly reconcileStats = computed(() => {
    const rows = this.reconcileRows();
    return {
      ok: rows.filter((item) => item.status === 'OK').length,
      generic: rows.filter((item) => item.status === 'GENERIC_POLICY').length,
      unfilled: rows.filter((item) => item.status === 'MISSING_FORM').length,
      missing: rows.filter((item) => item.status === 'MISSING_POLICY').length,
      percent: rows.length ? Math.round(rows.filter((item) => item.status === 'OK').length / rows.length * 100) : 0,
    };
  });
  readonly simulationSteps = computed(() => this.store.processes().find((item) => item.code === this.simulation().processCode)?.steps ?? []);
  readonly visibleActions = computed(() => this.simulatedActions().filter((item) => item.visible));
  readonly hiddenActions = computed(() => this.simulatedActions().filter((item) => !item.visible));

  ngOnInit(): void {
    this.store.load().subscribe({
      next: () => {
        const process = this.store.processes()[0];
        if (process) {
          this.reconcileProcess.set(process.code);
          this.simulation.update((item) => ({ ...item, processCode: process.code, taskDefinitionKey: process.steps[0]?.key ?? '' }));
          this.refreshReconcile();
          this.refreshSimulation();
        }
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

  policySteps(processCode: string | null) {
    return this.store.processes().find((process) => process.code === processCode)?.steps ?? [];
  }

  openNewPolicy(): void {
    this.policyDraft.set({ id: `AP-${Date.now()}`, actionCode: 'APPROVE_STEP', surface: 'DOSSIER_DETAIL', processCode: null,
      taskDefinitionKey: null, dossierStatus: 'processing', allowedRoleCodes: [],
      formKey: null, conditionExpression: 'user in currentStep.candidateGroups', displayOrder: 50, lifecycleStatus: 'DRAFT' });
  }

  editPolicy(item: ActionAvailabilityPolicy): void {
    this.policyDraft.set({ ...item, allowedRoleCodes: [...item.allowedRoleCodes] });
  }

  patchPolicy<K extends keyof ActionAvailabilityPolicy>(key: K, value: ActionAvailabilityPolicy[K]): void {
    this.policyDraft.update((item) => item ? { ...item, [key]: value } : item);
  }

  selectPolicyProcess(code: string | null): void {
    const process = this.store.processes().find((item) => item.code === code);
    this.policyDraft.update((item) => item ? { ...item, processCode: code, processVersion: process?.processVersion ?? null,
      taskDefinitionKey: null } : item);
  }

  addBundleItem(): void {
    this.policyDraft.update((item) => item ? { ...item, formBundle: {
      displayMode: item.formBundle?.displayMode ?? 'STEPPER', allowDraft: item.formBundle?.allowDraft ?? false,
      completionPolicy: 'ALL_REQUIRED_VALID', version: item.formBundle?.version ?? 1,
      items: [...(item.formBundle?.items ?? []), { formKey: this.forms()[0]?.value ?? '', formVersion: null,
        displayOrder: (item.formBundle?.items.length ?? 0) + 1, required: true, mode: 'EDIT', skippable: false,
        outputNamespace: `form${(item.formBundle?.items.length ?? 0) + 1}` }],
    } } : item);
  }

  patchBundleItem(index: number, patch: Record<string, unknown>): void {
    this.policyDraft.update((item) => item?.formBundle ? { ...item, formBundle: { ...item.formBundle,
      items: item.formBundle.items.map((form, i) => i === index ? { ...form, ...patch } : form) } } : item);
  }

  removeBundleItem(index: number): void {
    this.policyDraft.update((item) => item?.formBundle ? { ...item, formBundle: { ...item.formBundle,
      items: item.formBundle.items.filter((_, i) => i !== index).map((form, i) => ({ ...form, displayOrder: i + 1 })) } } : item);
  }

  patchBundle(patch: Partial<NonNullable<ActionAvailabilityPolicy['formBundle']>>): void {
    this.policyDraft.update((item) => item?.formBundle
      ? { ...item, formBundle: { ...item.formBundle, ...patch } } : item);
  }

  dropBundleItem(event: CdkDragDrop<unknown[]>): void {
    this.policyDraft.update((item) => {
      if (!item?.formBundle || event.previousIndex === event.currentIndex) return item;
      const items = item.formBundle.items.map((form) => ({ ...form }));
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      return { ...item, formBundle: { ...item.formBundle,
        items: items.map((form, index) => ({ ...form, displayOrder: index + 1 })) } };
    });
  }

  copyBundle(): void {
    const source = this.store.availabilityPolicies().find((item) => item.id === this.bundleCopySourceId());
    if (!source?.formBundle) { this.message.warning('Vui lòng chọn một luật có Form Bundle.'); return; }
    const bundle = source.formBundle;
    this.policyDraft.update((item) => item ? { ...item, formBundle: {
      displayMode: bundle.displayMode, allowDraft: bundle.allowDraft,
      completionPolicy: bundle.completionPolicy, version: 1,
      items: bundle.items.map((form) => ({ ...form })),
    } } : item);
    this.message.success(`Đã sao chép Form Bundle từ ${source.id}.`);
  }

  savePolicy(): void {
    const item = this.policyDraft();
    if (!item) return;
    if (!item.id.trim() || !item.actionCode) { this.message.warning('Vui lòng nhập đủ mã luật và hành động.'); return; }
    const action = this.store.definitions().find((definition) => definition.actionCode === item.actionCode);
    if (item.lifecycleStatus === 'ACTIVE' && action?.actionType === 'STANDARD') {
      if (!item.processCode || !item.processVersion || !item.taskDefinitionKey) {
        this.message.warning('Luật Standard Action phải chọn quy trình và bước BPMN trước khi kích hoạt.');
        return;
      }
      if (!item.allowedRoleCodes.length) {
        this.message.warning('Luật Standard Action phải có ít nhất một vai trò trước khi kích hoạt.');
        return;
      }
    }
    this.store.saveAvailability(item, this.actor()).subscribe({
      next: () => { this.policyDraft.set(null); this.message.success('Đã lưu luật hiển thị nút.'); this.refreshDerived(); },
      error: (error) => this.showError('Không lưu được luật hiển thị nút.', error),
    });
  }

  togglePolicy(item: ActionAvailabilityPolicy, enabled: boolean): void {
    this.store.saveAvailability({ ...item, lifecycleStatus: enabled ? 'ACTIVE' : 'DISABLED' }, this.actor()).subscribe({
      next: () => this.refreshDerived(),
      error: (error) => this.showError('Không đổi được trạng thái luật.', error),
    });
  }

  removePolicy(item: ActionAvailabilityPolicy): void {
    this.store.removeAvailability(item, this.actor()).subscribe({
      next: () => { this.setPolicySelected(item.id, false); this.message.success('Đã xóa luật.'); this.refreshDerived(); },
      error: (error) => this.showError('Không xóa được luật.', error),
    });
  }

  setPolicySelected(id: string, selected: boolean): void {
    this.selectedPolicyIds.update((current) => {
      const next = new Set(current);
      selected ? next.add(id) : next.delete(id);
      return next;
    });
  }

  setAllFilteredPoliciesSelected(selected: boolean): void {
    this.selectedPolicyIds.update((current) => {
      const next = new Set(current);
      this.filteredPolicies().forEach((item) => selected ? next.add(item.id) : next.delete(item.id));
      return next;
    });
  }

  removeSelectedPolicies(): void {
    const selected = this.selectedPolicies();
    if (!selected.length || this.deletingPolicies()) return;
    this.deletingPolicies.set(true);
    this.store.removeAvailabilityBulk(selected, this.actor()).subscribe({
      next: (result) => {
        this.selectedPolicyIds.set(new Set());
        this.deletingPolicies.set(false);
        this.message.success(`Đã xóa ${result.deletedCount} luật hiển thị nút.`);
        this.refreshDerived();
      },
      error: (error) => {
        this.deletingPolicies.set(false);
        this.showError('Không xóa được các luật đã chọn.', error);
      },
    });
  }

  setSelectedPoliciesStatus(enabled: boolean): void {
    const selected = this.selectedPolicies();
    if (!selected.length || this.updatingPolicyStatus()) return;
    this.updatingPolicyStatus.set(true);
    this.store.setAvailabilityStatusBulk(selected, enabled, this.actor()).subscribe({
      next: (result) => {
        this.selectedPolicyIds.set(new Set());
        this.updatingPolicyStatus.set(false);
        this.message.success(`Đã ${enabled ? 'bật' : 'tắt'} ${result.updatedCount} luật hiển thị nút.`);
        this.refreshDerived();
      },
      error: (error) => {
        this.updatingPolicyStatus.set(false);
        this.showError(`Không ${enabled ? 'bật' : 'tắt'} được các luật đã chọn.`, error);
      },
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

  resetPresentation(): void {
    const item = this.presentationDraft();
    if (!item) return;
    this.store.resetPresentation(item, this.actor()).subscribe({
      next: (saved) => {
        this.presentationDraft.set({ ...saved });
        this.message.success('Đã khôi phục cách trình bày mặc định.');
        this.refreshSimulation();
      },
      error: (error) => this.showError('Không khôi phục được cách trình bày mặc định.', error),
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
    return ({ OK: 'success', GENERIC_POLICY: 'processing', MISSING_FORM: 'warning', MISSING_POLICY: 'error',
      UNMAPPED_BRANCH: 'default', ORPHAN_POLICY: 'error', ROLE_MISMATCH: 'warning', CONFLICT: 'error',
      INVALID_TARGET: 'error' })[status];
  }

  statusText(status: ReconcileRow['status']): string {
    return ({ OK: 'Đã khớp', GENERIC_POLICY: 'Luật chung', MISSING_FORM: 'Thiếu biểu mẫu',
      MISSING_POLICY: 'Thiếu luật', UNMAPPED_BRANCH: 'Chưa ánh xạ', ORPHAN_POLICY: 'Luật mồ côi',
      ROLE_MISMATCH: 'Lệch vai trò', CONFLICT: 'Xung đột', INVALID_TARGET: 'Đích không hợp lệ' })[status];
  }

  private refreshDerived(): void {
    this.refreshReconcile();
    this.refreshSimulation();
  }

  private refreshReconcile(): void {
    if (!this.reconcileProcess()) { this.reconcileRows.set([]); return; }
    this.store.reconcile(this.reconcileProcess()).subscribe({
      next: (rows) => this.reconcileRows.set(rows),
      error: (error) => this.showError('Không tải được kết quả đối soát BPMN.', error),
    });
  }

  private refreshSimulation(): void {
    if (!this.simulation().processCode || !this.simulation().taskDefinitionKey) {
      this.simulatedActions.set([]);
      return;
    }
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
