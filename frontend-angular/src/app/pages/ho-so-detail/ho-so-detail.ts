import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, effect, inject, signal, viewChild, viewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { AuthService } from '../../core/auth/auth.service';
import {
  CAP_LABEL,
  DOSSIER_STATUS_LABEL,
  DossierStatus,
  DossierStepResponse,
  HO_SO_LOAI_LABEL,
  HOI_DONG_CAP_LABEL,
  HoSoActionOutcome,
  HoSoDocument,
  HoSoResponse,
  StepStatus,
} from '../../core/models/ho-so';
import { HoSoService } from '../../core/services/ho-so.service';
import { MyTaskService } from '../../core/services/my-task.service';
import { TaskAvailableAction } from '../../core/models/task-action';
import { TaskActionService } from '../../core/services/task-action.service';
import { SimulatedAction } from '../../core/models/action-studio';
import { DossierActionService } from '../../core/services/dossier-action.service';
import { EformService } from '../../core/services/eform.service';
import {
  HoiDongCandidateService,
  UNG_VIEN_HOI_DONG_KEY,
  type FormOption,
} from '../../core/services/hoi-dong-candidate.service';
import { SelectableProcessResponse } from '../../core/models/process-definition';
import { ProcessDefinitionService } from '../../core/services/process-definition.service';
import { BpmnViewerComponent } from '../../shared/bpmn-viewer/bpmn-viewer';
import { FormRendererComponent } from '../../shared/form-renderer/form-renderer';

const STATUS_COLOR: Record<DossierStatus, string> = {
  DRAFT: 'default', START_PENDING: 'processing', START_FAILED: 'error', PROCESSING: 'processing',
  APPROVED: 'success', REJECTED: 'error', CANCELLED: 'default',
};

const STEP_LABEL: Record<StepStatus, string> = {
  PENDING: 'Chờ xử lý', CURRENT: 'Đang xử lý', DONE: 'Hoàn thành', REJECTED: 'Từ chối', SKIPPED: 'Đã bỏ qua',
};

const STEP_COLOR: Record<StepStatus, string> = {
  PENDING: 'default', CURRENT: 'processing', DONE: 'success', REJECTED: 'error', SKIPPED: 'warning',
};

@Component({
  selector: 'app-ho-so-detail',
  imports: [
    DatePipe, FormsModule, NzAlertModule, NzButtonModule, NzCardModule, NzDescriptionsModule, NzEmptyModule,
    NzGridModule, NzIconModule, NzInputModule, NzModalModule, NzPopconfirmModule, NzResultModule, NzSelectModule,
    NzSpinModule, NzStepsModule, NzTabsModule, NzTagModule,
    FormRendererComponent, BpmnViewerComponent,
  ],
  templateUrl: './ho-so-detail.html',
  styleUrl: './ho-so-detail.scss',
})
export class HoSoDetailPage {
  private readonly service = inject(HoSoService);
  private readonly myTaskService = inject(MyTaskService);
  private readonly taskActionService = inject(TaskActionService);
  private readonly dossierActionApi = inject(DossierActionService);
  private readonly eformService = inject(EformService);
  private readonly hoiDongCandidates = inject(HoiDongCandidateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly processDefinitionService = inject(ProcessDefinitionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly statusLabel = DOSSIER_STATUS_LABEL;
  readonly statusColor = STATUS_COLOR;
  readonly loaiLabel = HO_SO_LOAI_LABEL;
  readonly capLabel = CAP_LABEL;
  readonly hoiDongCapLabel = HOI_DONG_CAP_LABEL;
  readonly stepLabel = STEP_LABEL;
  readonly stepColor = STEP_COLOR;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly notFound = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly item = signal<HoSoResponse | null>(null);
  readonly submitOpen = signal(false);
  readonly actionOpen = signal(false);
  readonly selectedOutcome = signal<HoSoActionOutcome>('APPROVE_STEP');
  readonly actionNote = signal('');
  readonly policyActions = signal<SimulatedAction[]>([]);
  readonly formAction = signal<SimulatedAction | null>(null);
  readonly actionForm = signal<ReturnType<EformService['getForm']>>(undefined);
  readonly formLoading = signal(false);
  /** Biểu mẫu gắn theo `TaskAvailableAction.formKey` cho hành động task thật (khác `actionForm`,
   * vốn chỉ phục vụ xem trước ở luồng dossier-level `runDossierAction`/SUBMIT). */
  readonly taskActionForm = signal<ReturnType<EformService['getForm']>>(undefined);
  readonly taskActionBundleForms = signal<Array<{ namespace: string; title: string; required: boolean;
    mode: 'VIEW' | 'EDIT'; schema: unknown; data: Record<string, unknown> }>>([]);
  readonly activeBundleItem = signal(0);
  readonly taskActionFormLoading = signal(false);
  /**
   * Options động cho các trường khai `valuesKey` (xem `FormComponent.valuesKey`). Nạp theo yêu cầu
   * khi biểu mẫu thực sự cần, không phải mỗi lần mở hồ sơ — chỉ QĐ thành lập HĐXD dùng tới.
   */
  readonly formValueSources = signal<Record<string, FormOption[]>>({});
  readonly taskActionFormRenderer = viewChild<FormRendererComponent>('taskActionFormRenderer');
  readonly taskActionBundleRenderers = viewChildren<FormRendererComponent>('bundleFormRenderer');
  readonly bpmnOpen = signal(false);
  readonly bpmnLoading = signal(false);
  readonly bpmnXml = signal<string | null>(null);
  readonly bpmnError = signal<string | null>(null);
  readonly documentUploading = signal(false);
  readonly documentLoadingId = signal<number | null>(null);
  readonly documentDeletingId = signal<number | null>(null);

  /** Task key mang theo từ `/viec-cua-toi` qua query param — Hồ sơ/DossierStep KHÔNG mang taskKey
   * (D20 gap đã ghi trong active-task.md), nên chi tiết mở trực tiếp (không qua Việc của tôi) sẽ
   * không có quyền thao tác task, chỉ xem. */
  readonly taskKey = signal<string | null>(null);
  readonly availableActions = signal<TaskAvailableAction[]>([]);
  readonly actionsLoading = signal(false);
  readonly actionsError = signal<string | null>(null);

  /** Vai trò lấy từ identity-service; gọi lỗi thì nút thao tác tính với danh sách rỗng — phải nói ra. */
  readonly identityUnavailable = this.auth.identityUnavailable;

  readonly currentStep = computed(() => {
    const dossier = this.item();
    return dossier?.steps.find((step) => step.buocIndex === dossier.buocHienTai) ?? null;
  });
  readonly rejectedStep = computed(() => this.item()?.steps.find((step) => step.trangThai === 'REJECTED') ?? null);
  /** Quy trình gửi duyệt = mọi quy trình đã deploy, nạp từ `/api/process-definitions/selectable`.
   *
   * Trước 2026-07-28 chỗ này là bảng hardcode 4 mã theo (loai, cap) kèm cờ `supported` — quy trình
   * người dùng tự vẽ không bao giờ tới được UI. Nay người dùng **chọn tự do** (quyết định user):
   * KHÔNG ràng buộc loại hồ sơ ↔ quy trình, nên chọn nhầm là có thật và chưa có gì chặn. Cảnh báo
   * `userTaskCount === 0` ở template là mức bảo vệ duy nhất hiện có. */
  readonly selectableProcesses = signal<SelectableProcessResponse[]>([]);
  readonly selectableLoading = signal(false);
  readonly selectableError = signal<string | null>(null);
  readonly selectedProcessId = signal<string | null>(null);
  readonly submitProcess = computed(
    () => this.selectableProcesses().find((p) => p.bpmnProcessId === this.selectedProcessId()) ?? null,
  );
  readonly selectedAction = computed(
    () => this.availableActions().find((a) => a.actionCode === this.selectedOutcome()) ?? null,
  );
  readonly dossierActions = computed(() => this.policyActions().filter((action) => {
    if (!action.visible || !action.enabled) return false;
    if (action.actionType === 'EXCEPTION') return false;
    if (action.outcome && action.outcome !== 'SUBMIT') return false;
    return true;
  }));

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, queryParams]) => {
        const key = queryParams.get('taskKey');
        this.taskKey.set(key && key.trim() ? key.trim() : null);
        this.load(decodeURIComponent(params.get('id') ?? ''));
      });

    // Vai trò của user nạp BẤT ĐỒNG BỘ từ identity-service (Shell gọi
    // AuthService.refreshCurrentUser()), nên hồ sơ có thể load xong TRƯỚC khi biết roleCodes —
    // khi đó simulate chạy với danh sách vai trò rỗng và nút thao tác biến mất oan. Effect này
    // chạy lại simulate đúng một lần nữa ngay khi vai trò về.
    let lastRoleKey: string | null = null;
    effect(() => {
      const roleKey = [...(this.auth.user()?.roleCodes ?? [])].sort().join(',');
      const changed = lastRoleKey !== null && lastRoleKey !== roleKey;
      lastRoleKey = roleKey;
      if (changed && this.item()) this.loadDossierActions();
    });
  }

  load(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.errorMessage.set(null);
    this.service.get(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.loading.set(false);
        this.loadDossierActions();
        this.resolveTaskContextAndLoadActions();
      },
      error: (error: HttpErrorResponse) => {
        this.notFound.set(error.status === 404);
        if (error.status !== 404) this.errorMessage.set(this.errorText(error, 'Không thể tải chi tiết hồ sơ'));
        this.loading.set(false);
      },
    });
  }

  private resolveTaskContextAndLoadActions(): void {
    const dossier = this.item();
    const userId = this.auth.user()?.email;
    if (this.taskKey() || dossier?.trangThai !== 'PROCESSING' || !userId) {
      this.loadAvailableActions();
      return;
    }
    this.actionsLoading.set(true);
    this.myTaskService.activeForHoSo(dossier.id, userId).subscribe({
      next: (task) => {
        this.taskKey.set(task.taskKey);
        this.actionsLoading.set(false);
        this.loadAvailableActions();
      },
      error: () => {
        this.taskKey.set(null);
        this.availableActions.set([]);
        this.actionsLoading.set(false);
      },
    });
  }

  private loadAvailableActions(): void {
    const key = this.taskKey();
    if (!key || this.item()?.trangThai !== 'PROCESSING') {
      this.availableActions.set([]);
      return;
    }
    this.actionsLoading.set(true);
    this.taskActionService.availableActions(key).subscribe({
      next: (response) => {
        this.availableActions.set(response.actions);
        this.actionsLoading.set(false);
      },
      error: () => {
        // Task không còn ACTIVE hoặc user không phải assignee/candidate — không có quyền thao tác.
        this.taskKey.set(null);
        this.availableActions.set([]);
        this.actionsLoading.set(false);
      },
    });
  }

  private loadDossierActions(): void {
    const dossier = this.item();
    const user = this.auth.user();
    // Hồ sơ đang chạy workflow chỉ render action từ task-centric API phía backend. Simulation này
    // được giữ riêng cho action trước khi khởi chạy quy trình (SUBMIT/support ở trạng thái nháp).
    if (!dossier || !user || dossier.trangThai === 'PROCESSING' || dossier.trangThai === 'START_PENDING') {
      this.policyActions.set([]);
      this.actionsError.set(null);
      return;
    }
    this.actionsLoading.set(true);
    this.actionsError.set(null);
    this.dossierActionApi.available(dossier.id).subscribe({
      next: (response) => {
        this.policyActions.set(response.actions);
        this.actionsLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.policyActions.set([]);
        this.actionsError.set(this.errorText(error, 'Không thể tải các thao tác khả dụng'));
        this.actionsLoading.set(false);
      },
    });
  }

  back(): void { void this.router.navigate(['/ho-so']); }
  openMission(): void { void this.router.navigate(['/nhiem-vu', this.item()?.maNV]); }

  openBpmn(): void {
    const processCode = this.item()?.quyTrinh;
    if (!processCode) return;
    this.bpmnOpen.set(true);
    this.bpmnLoading.set(true);
    this.bpmnError.set(null);
    this.bpmnXml.set(null);
    // `quyTrinh` giờ chính là `bpmnProcessId` — tra thẳng chuỗi đó trước. Fallback
    // `replaceAll('.','_')` chỉ để hồ sơ cũ (lưu dạng "RD01.01") vẫn xem được BPMN; đây đúng quy
    // tắc backend engine dùng khi start (CamundaReliableWorkflowEngine.start).
    const legacyProcessId = processCode.replaceAll('.', '_');
    this.processDefinitionService
      .getByBpmnProcessId(processCode)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          legacyProcessId === processCode
            ? throwError(() => error)
            : this.processDefinitionService.getByBpmnProcessId(legacyProcessId),
        ),
      )
      .subscribe({
        next: (definition) => {
          this.bpmnXml.set(definition.latestVersion.bpmnXml);
          this.bpmnLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.bpmnError.set(this.errorText(error, 'Không thể tải sơ đồ BPMN'));
          this.bpmnLoading.set(false);
        },
      });
  }

  closeBpmn(): void { this.bpmnOpen.set(false); }

  openAction(outcome: HoSoActionOutcome): void {
    this.selectedOutcome.set(outcome);
    this.actionNote.set('');
    this.taskActionForm.set(undefined);
    this.taskActionBundleForms.set([]);
    this.activeBundleItem.set(0);
    this.actionOpen.set(true);
    const action = this.selectedAction();
    const bundle = action?.formBundle;
    if (action && bundle?.items.length) {
      const key = this.taskKey();
      if (!key) return;
      const items = [...bundle.items].sort((a, b) => a.displayOrder - b.displayOrder);
      this.taskActionFormLoading.set(true);
      forkJoin({ forms: forkJoin(items.map((item) => this.eformService.loadOne(item.formKey, item.formVersion))),
        submissions: this.taskActionService.formSubmissions(key) }).subscribe({
        next: ({ forms, submissions }) => {
          this.taskActionBundleForms.set(items.map((item, index) => {
            const restored = submissions.find((submission) =>
              submission.outputNamespace === item.outputNamespace)?.data;
            return {
              namespace: item.outputNamespace, title: item.displayTitle || forms[index]?.ten || item.formKey,
              required: item.required, mode: item.mode, schema: forms[index]?.schema,
              data: restored && typeof restored === 'object' ? restored as Record<string, unknown> : {},
            };
          }));
          forms.forEach((form) => this.loadValueSources(form?.schema));
          this.taskActionFormLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.taskActionFormLoading.set(false);
          this.message.error(this.errorText(error, 'Không thể tải Form Bundle'));
        },
      });
      return;
    }
    const formKey = action?.formKey;
    if (!formKey) return;
    this.taskActionFormLoading.set(true);
    this.eformService.loadOne(formKey).subscribe({
      next: (form) => {
        this.taskActionForm.set(form);
        this.taskActionFormLoading.set(false);
        this.loadValueSources(form?.schema);
      },
      error: (error: HttpErrorResponse) => {
        this.taskActionFormLoading.set(false);
        this.message.error(this.errorText(error, `Không thể tải biểu mẫu ${formKey}`));
      },
    });
  }

  closeAction(): void {
    this.saveBundleDrafts();
    this.actionOpen.set(false);
    this.taskActionForm.set(undefined);
    this.taskActionBundleForms.set([]);
    this.activeBundleItem.set(0);
  }

  selectBundleItem(index: number): void {
    const last = this.taskActionBundleForms().length - 1;
    this.activeBundleItem.set(Math.max(0, Math.min(index, last)));
  }

  private saveBundleDrafts(): void {
    const key = this.taskKey();
    const action = this.selectedAction();
    if (!key || !action?.formBundle?.allowDraft) return;
    const renderers = this.taskActionBundleRenderers();
    this.taskActionBundleForms().forEach((form, index) => {
      if (form.mode !== 'EDIT' || !renderers[index]) return;
      this.taskActionService.saveFormDraft(key, { actionCode: action.actionCode,
        expectedPolicyId: action.policyId, expectedPolicyVersion: action.policyVersion,
        outputNamespace: form.namespace, data: renderers[index].submit().data }).subscribe({
        error: () => this.message.warning(`Không lưu được bản nháp ${form.title}.`),
      });
    });
  }

  /**
   * Chỉ gọi identity-service khi schema thật sự khai `valuesKey` tương ứng — biểu mẫu thường không
   * cần và không nên trả giá bằng một request thừa mỗi lần mở modal hành động.
   */
  private loadValueSources(schema: unknown): void {
    if (!this.schemaUsesValuesKey(schema, UNG_VIEN_HOI_DONG_KEY)) return;
    this.hoiDongCandidates
      .candidates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((options) =>
        this.formValueSources.update((prev) => ({ ...prev, [UNG_VIEN_HOI_DONG_KEY]: options })),
      );
  }

  private schemaUsesValuesKey(schema: unknown, key: string): boolean {
    if (Array.isArray(schema)) return schema.some((item) => this.schemaUsesValuesKey(item, key));
    if (!schema || typeof schema !== 'object') return false;
    const node = schema as Record<string, unknown>;
    if (node['valuesKey'] === key) return true;
    return Object.values(node).some((child) => this.schemaUsesValuesKey(child, key));
  }

  runDossierAction(action: SimulatedAction): void {
    if (action.outcome === 'SUBMIT') {
      this.formAction.set(action);
      this.submitOpen.set(true);
      this.loadSelectableProcesses();
      return;
    }
    if (!action.formKey) {
      this.message.info(action.helpText || `Hành động “${action.label}” chưa được gắn biểu mẫu.`);
      return;
    }
    this.formLoading.set(true);
    this.eformService.loadOne(action.formKey).subscribe({
      next: (form) => {
        this.actionForm.set(form);
        this.formAction.set(action);
        this.formLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.formLoading.set(false);
        this.message.error(this.errorText(error, `Không thể tải biểu mẫu ${action.formKey}`));
      },
    });
  }

  closeActionForm(): void {
    this.formAction.set(null);
    this.actionForm.set(undefined);
  }

  actionButtonType(action: SimulatedAction): 'primary' | 'default' {
    return action.tone === 'primary' ? 'primary' : 'default';
  }

  /** Nạp danh sách quy trình mỗi lần mở dialog — quy trình mới deploy phải thấy được ngay, không
   * chờ reload trang. */
  private loadSelectableProcesses(): void {
    this.selectableLoading.set(true);
    this.selectableError.set(null);
    this.processDefinitionService.selectable().subscribe({
      next: (processes) => {
        this.selectableProcesses.set(processes);
        this.selectableLoading.set(false);
        if (!processes.some((p) => p.bpmnProcessId === this.selectedProcessId())) {
          this.selectedProcessId.set(null);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.selectableProcesses.set([]);
        this.selectableLoading.set(false);
        this.selectableError.set(this.errorText(error, 'Không tải được danh sách quy trình'));
      },
    });
  }

  submit(): void {
    const dossier = this.item();
    const process = this.submitProcess();
    const policy = this.formAction();
    if (this.saving()) return;
    if (!dossier) {
      this.message.error('Không còn dữ liệu hồ sơ để gửi duyệt. Hãy tải lại trang.');
      return;
    }
    if (!process) {
      this.message.warning('Vui lòng chọn một quy trình đã deploy.');
      return;
    }
    if (!policy?.policyId || policy.policyVersion == null) {
      this.message.error('Luật hiển thị action Gửi duyệt chưa có mã hoặc phiên bản. Hãy tải lại trang để nạp luật mới nhất.');
      this.loadDossierActions();
      return;
    }
    this.saving.set(true);
    // `quyTrinh` mang thẳng `bpmnProcessId`. Backend engine tra đúng chuỗi này trước, chỉ fallback
    // `replace('.','_')` cho hồ sơ cũ lưu dạng "RD01.01" — xem CamundaReliableWorkflowEngine.start().
    this.dossierActionApi
      .execute(dossier.id, { actionCode: 'SUBMIT', expectedPolicyId: policy.policyId,
        expectedPolicyVersion: policy.policyVersion, processCode: process.bpmnProcessId, processName: process.name })
      .subscribe({
        next: () => {
          this.submitOpen.set(false); this.saving.set(false);
          this.message.success(`Đã gửi duyệt hồ sơ ${dossier.id} vào quy trình ${process.bpmnProcessId}.`);
          this.load(dossier.id);
        },
        error: (error: HttpErrorResponse) => { this.saving.set(false); this.message.error(this.errorText(error, 'Gửi duyệt thất bại')); },
      });
  }

  applyAction(): void {
    const dossier = this.item();
    const key = this.taskKey();
    const action = this.selectedAction();
    const note = this.actionNote().trim();
    if (!dossier || !key || !action || (action.requiresReason && !note)) return;
    let formData: Record<string, unknown> = {};
    if (action.formBundle?.items.length) {
      const renderers = this.taskActionBundleRenderers();
      const forms = this.taskActionBundleForms();
      if (renderers.length !== forms.length) return;
      for (let index = 0; index < forms.length; index++) {
        const result = renderers[index].submit();
        if (forms[index].required && Object.keys(result.errors).length) {
          this.selectBundleItem(index);
          this.message.error(`Vui lòng kiểm tra biểu mẫu ${forms[index].title}.`);
          return;
        }
        formData[forms[index].namespace] = result.data;
      }
    } else if (action.formKey) {
      const renderer = this.taskActionFormRenderer();
      if (!renderer) return;
      const result = renderer.submit();
      if (Object.keys(result.errors).length) {
        this.message.error('Vui lòng kiểm tra lại các trường trong biểu mẫu.');
        return;
      }
      formData = result.data;
    }
    this.saving.set(true);
    this.taskActionService.applyAction(key, {
      requestId: this.taskActionService.newRequestId(),
      taskKey: key,
      actionCode: action.actionCode,
      expectedPolicyId: action.policyId,
      expectedPolicyVersion: action.policyVersion,
      comment: note || null,
      formData,
      expectedTaskState: 'ACTIVE',
    }).subscribe({
      next: () => {
        this.closeAction();
        this.message.success('Đã gửi yêu cầu xử lý — đang chờ quy trình cập nhật.');
        this.pollAfterAction(dossier.id, dossier.buocHienTai, dossier.trangThai);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.error(this.errorText(error, 'Xử lý hồ sơ thất bại'));
      },
    });
  }

  /** Sau 202, POST không trả `HoSoResponse` (kết quả bất đồng bộ) — không cập nhật lạc quan, chờ
   * projection qua GET thật. Task cũ hết hiệu lực sau khi bước chuyển, nên khoá lại thao tác và yêu
   * cầu quay về "Việc của tôi" cho bước kế tiếp thay vì đoán taskKey mới. */
  private pollAfterAction(id: string, previousStep: number, previousStatus: DossierStatus, attempt = 0): void {
    const maxAttempts = 10;
    this.service.get(id).subscribe({
      next: (updated) => {
        this.item.set(updated);
        const changed = updated.buocHienTai !== previousStep || updated.trangThai !== previousStatus;
        if (changed) {
          this.saving.set(false);
          this.taskKey.set(null);
          this.availableActions.set([]);
          this.resolveTaskContextAndLoadActions();
          return;
        }
        if (attempt + 1 >= maxAttempts) {
          this.saving.set(false);
          this.message.warning('Chưa thấy cập nhật từ quy trình — hãy tải lại trang sau ít phút.');
          return;
        }
        setTimeout(() => this.pollAfterAction(id, previousStep, previousStatus, attempt + 1), 1500);
      },
      error: () => { this.saving.set(false); },
    });
  }

  actionTitle(): string {
    return this.selectedAction()?.label ?? 'Xử lý hồ sơ';
  }

  documentIcon(type: string): string {
    return type === 'Excel' ? 'file-excel' : type === 'Archive' ? 'file-zip' : type === 'PDF' ? 'file-pdf' : 'file-text';
  }

  chooseDocument(input: HTMLInputElement): void {
    input.value = '';
    input.click();
  }

  uploadDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const dossier = this.item();
    if (!file || !dossier) return;
    if (file.size > 20 * 1024 * 1024) {
      this.message.error('Tệp vượt quá giới hạn 20 MB.');
      return;
    }
    this.documentUploading.set(true);
    const actor = this.auth.user()?.hoTen ?? 'Người dùng hệ thống';
    this.service.uploadDocument(dossier.id, file, actor).subscribe({
      next: (uploaded) => {
        this.item.update((current) => current ? { ...current, taiLieu: [...current.taiLieu, uploaded] } : current);
        this.documentUploading.set(false);
        this.message.success(`Đã tải lên ${uploaded.ten}.`);
      },
      error: (error: HttpErrorResponse) => {
        this.documentUploading.set(false);
        this.message.error(this.errorText(error, 'Tải tệp lên thất bại'));
      },
    });
  }

  viewDocument(document: HoSoDocument): void {
    const dossier = this.item();
    if (!dossier || !document.hasContent) return;
    const previewWindow = window.open('about:blank', '_blank');
    if (previewWindow) previewWindow.opener = null;
    this.documentLoadingId.set(document.id);
    this.service.viewDocument(dossier.id, document.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        if (previewWindow) {
          previewWindow.location.replace(url);
        } else {
          const link = window.document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        this.documentLoadingId.set(null);
      },
      error: (error: HttpErrorResponse) => {
        previewWindow?.close();
        this.documentLoadingId.set(null);
        this.message.error(this.errorText(error, 'Không thể xem tệp'));
      },
    });
  }

  downloadDocument(document: HoSoDocument): void {
    const dossier = this.item();
    if (!dossier || !document.hasContent) return;
    this.documentLoadingId.set(document.id);
    this.service.downloadDocument(dossier.id, document.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.ten;
        link.click();
        URL.revokeObjectURL(url);
        this.documentLoadingId.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.documentLoadingId.set(null);
        this.message.error(this.errorText(error, 'Không thể tải tệp'));
      },
    });
  }

  deleteDocument(document: HoSoDocument): void {
    const dossier = this.item();
    if (!dossier || this.documentDeletingId() !== null) return;
    this.documentDeletingId.set(document.id);
    const actor = this.auth.user()?.hoTen ?? 'Người dùng hệ thống';
    this.service.deleteDocument(dossier.id, document.id, document.version, actor).subscribe({
      next: () => {
        this.item.update((current) => current
          ? { ...current, taiLieu: current.taiLieu.filter((item) => item.id !== document.id) }
          : current);
        this.documentDeletingId.set(null);
        this.message.success(`Đã xóa ${document.ten}.`);
      },
      error: (error: HttpErrorResponse) => {
        this.documentDeletingId.set(null);
        if (error.status === 404) {
          this.item.update((current) => current
            ? { ...current, taiLieu: current.taiLieu.filter((item) => item.id !== document.id) }
            : current);
          this.message.warning('Tài liệu đã được xóa trước đó. Danh sách đang được đồng bộ lại.');
          this.load(dossier.id);
          return;
        }
        this.message.error(this.errorText(error, 'Không thể xóa tệp'));
      },
    });
  }

  formatFileSize(bytes: number | null): string {
    if (bytes === null) return 'Chưa có nội dung tệp';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  trackStep(_: number, step: DossierStepResponse): number { return step.buocIndex; }

  private errorText(error: HttpErrorResponse, fallback: string): string {
    const message = typeof error.error?.message === 'string' ? error.error.message : null;
    return message ?? `${fallback} (HTTP ${error.status || 0}).`;
  }
}
