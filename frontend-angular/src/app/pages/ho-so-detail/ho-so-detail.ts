import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

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
import { NzSpinModule } from 'ng-zorro-antd/spin';
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
import { TaskAvailableAction } from '../../core/models/task-action';
import { TaskActionService } from '../../core/services/task-action.service';
import { PERMISSION_LABEL, SimulatedAction, type DossierStatus as PolicyDossierStatus } from '../../core/models/action-studio';
import { ActionStudioService } from '../../core/services/action-studio.service';
import { EformService } from '../../core/services/eform.service';
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

/** Chưa có nguồn permission thật theo user (chỉ có roleCodes, xem D9) — cấp sẵn toàn bộ danh mục
 * quyền cho user đã đăng nhập, cùng cách WorkflowDemoIdentityProvider cấp PROCESS_STEP cho mọi
 * identity ở backend. RBAC thật vẫn do allowedRoleCodes/candidateGroups của policy quyết định. */
const ALL_PERMISSIONS = Object.keys(PERMISSION_LABEL);

@Component({
  selector: 'app-ho-so-detail',
  imports: [
    DatePipe, FormsModule, NzAlertModule, NzButtonModule, NzCardModule, NzDescriptionsModule, NzEmptyModule,
    NzGridModule, NzIconModule, NzInputModule, NzModalModule, NzPopconfirmModule, NzResultModule, NzSpinModule,
    NzTagModule,
    FormRendererComponent, BpmnViewerComponent,
  ],
  templateUrl: './ho-so-detail.html',
  styleUrl: './ho-so-detail.scss',
})
export class HoSoDetailPage {
  private readonly service = inject(HoSoService);
  private readonly taskActionService = inject(TaskActionService);
  private readonly actionStudioService = inject(ActionStudioService);
  private readonly eformService = inject(EformService);
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
  readonly taskActionFormLoading = signal(false);
  readonly taskActionFormRenderer = viewChild<FormRendererComponent>('taskActionFormRenderer');
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

  readonly currentStep = computed(() => {
    const dossier = this.item();
    return dossier?.steps.find((step) => step.buocIndex === dossier.buocHienTai) ?? null;
  });
  readonly rejectedStep = computed(() => this.item()?.steps.find((step) => step.trangThai === 'REJECTED') ?? null);
  /** Quy trình gửi duyệt theo (loai, cap). `supported` = đã có BPMN active trên Zeebe.
   *
   * XET_DUYET+CS cố ý KHÔNG map sang RD02.02: quy trình đó tự tính lại `cap` bằng DMN
   * `capNhiemVu` (`resultVariable="cap"`, ghi đè biến truyền vào) rồi rẽ `cap = "TD"`; hồ sơ
   * cấp Cơ sở sẽ kết thúc ngay tại `End_KhongThuocTD` — start "thành công" nhưng không sinh
   * task nào và hồ sơ treo. Chờ BPMN riêng cho cấp Cơ sở. */
  readonly submitProcess = computed(() => {
    const dossier = this.item();
    if (!dossier) return null;
    if (dossier.loai === 'CHU_TRUONG') {
      return dossier.cap === 'CS'
        ? { code: 'RD01.01', name: 'Xét duyệt Chủ trương cấp Cơ sở', supported: true }
        : { code: 'RD01.02', name: 'Xét duyệt Chủ trương cấp Tập đoàn', supported: false };
    }
    if (dossier.loai === 'XET_DUYET') {
      return dossier.cap === 'TD'
        ? { code: 'RD02.02', name: 'Xét duyệt NV KHCN cấp Tập đoàn', supported: true }
        : { code: 'RD02.01', name: 'Xét duyệt NV KHCN cấp Cơ sở', supported: false };
    }
    return null;
  });
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
        this.loadAvailableActions();
      },
      error: (error: HttpErrorResponse) => {
        this.notFound.set(error.status === 404);
        if (error.status !== 404) this.errorMessage.set(this.errorText(error, 'Không thể tải chi tiết hồ sơ'));
        this.loading.set(false);
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
    if (!dossier || !user) {
      this.policyActions.set([]);
      return;
    }
    this.actionsLoading.set(true);
    this.actionStudioService.simulate({
      surface: 'DOSSIER_DETAIL',
      processCode: dossier.quyTrinh || '__UNASSIGNED__',
      taskDefinitionKey: this.currentStep()?.taskDefinitionKey || '__NO_TASK__',
      dossierStatus: this.policyStatus(dossier.trangThai),
      roleCodes: user.roleCodes,
      permissions: ALL_PERMISSIONS,
      isAdmin: user.isAdmin,
    }).subscribe({
      next: (actions) => {
        this.policyActions.set(actions);
        this.actionsLoading.set(false);
      },
      error: () => {
        this.policyActions.set([]);
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
    const bpmnProcessId = processCode.replaceAll('.', '_');
    this.processDefinitionService.getByBpmnProcessId(bpmnProcessId).subscribe({
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
    this.actionOpen.set(true);
    const formKey = this.selectedAction()?.formKey;
    if (!formKey) return;
    this.taskActionFormLoading.set(true);
    this.eformService.loadOne(formKey).subscribe({
      next: (form) => {
        this.taskActionForm.set(form);
        this.taskActionFormLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.taskActionFormLoading.set(false);
        this.message.error(this.errorText(error, `Không thể tải biểu mẫu ${formKey}`));
      },
    });
  }

  closeAction(): void {
    this.actionOpen.set(false);
    this.taskActionForm.set(undefined);
  }

  runDossierAction(action: SimulatedAction): void {
    if (action.outcome === 'SUBMIT') {
      this.submitOpen.set(true);
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

  private policyStatus(status: DossierStatus): PolicyDossierStatus {
    if (status === 'PROCESSING' || status === 'START_PENDING') return 'processing';
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'rejected';
    return 'draft';
  }

  submit(): void {
    const dossier = this.item();
    const process = this.submitProcess();
    if (!dossier || !process?.supported) return;
    this.saving.set(true);
    const actor = this.auth.user()?.hoTen ?? 'Người dùng hệ thống';
    this.service.submit(dossier.id, { quyTrinh: process.code, quyTrinhTen: process.name }, actor).subscribe({
      next: (updated) => {
        this.item.set(updated); this.submitOpen.set(false); this.saving.set(false);
        this.message.success(`Đã gửi duyệt hồ sơ ${updated.id} vào quy trình ${process.code}.`);
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
    if (action.formKey) {
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
