import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';

import { AuthService } from '../../core/auth/auth.service';
import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import { ProcessDefinitionDraftService } from '../../core/services/process-definition-draft.service';
import { ProcessDefinitionService } from '../../core/services/process-definition.service';
import {
  BpmnLintIssue,
  ProcessDefinitionSummaryResponse,
  ProcessDefinitionDraftResponse,
  ProcessDefinitionDraftSummaryResponse,
  ProcessImportErrorBody,
  ProcessReadinessResponse,
  ProcessSyncResponse,
  ReadinessStatus,
  RunningInstanceResponse,
} from '../../core/models/process-definition';

/** Trang quản lý quy trình: nhập file tạo draft trong App; deploy chỉ là thao tác phát hành riêng. */
@Component({
  selector: 'app-process-catalog',
  imports: [
    DatePipe,
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzDrawerModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    NzTagModule,
    NzTabsModule,
    NzTypographyModule,
    NzUploadModule,
  ],
  templateUrl: './process-catalog.html',
  styleUrl: './process-catalog.scss',
})
export class ProcessCatalogPage {
  private readonly processDefinitionService = inject(ProcessDefinitionService);
  private readonly processDefinitionDraftService = inject(ProcessDefinitionDraftService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly rawList = signal<ProcessDefinitionSummaryResponse[]>([]);
  readonly draftList = signal<ProcessDefinitionDraftSummaryResponse[]>([]);
  readonly loadingDrafts = signal(true);
  readonly activeTabIndex = signal(0);

  readonly query = signal('');

  // --- Đồng bộ quy trình deploy thẳng lên Camunda ---
  readonly syncing = signal(false);
  readonly syncResult = signal<ProcessSyncResponse | null>(null);

  // --- Đối soát quy trình (chẩn đoán đọc-thôi, không chặn deploy) ---
  readonly readinessDrawerOpen = signal(false);
  readonly readinessLoading = signal(false);
  readonly readinessProcess = signal<ProcessDefinitionSummaryResponse | null>(null);
  readonly readiness = signal<ProcessReadinessResponse | null>(null);
  readonly readinessError = signal<string | null>(null);

  // --- Runtime instance state (Camunda, tách khỏi catalog PostgreSQL) ---
  readonly instanceCounts = signal<Record<string, number>>({});
  readonly instanceCountsAvailable = signal(true);
  readonly instanceCountsMessage = signal<string | null>(null);
  readonly loadingInstanceCounts = signal(true);

  readonly instanceDrawerOpen = signal(false);
  readonly instanceDrawerLoading = signal(false);
  readonly instanceDrawerProcess = signal<ProcessDefinitionSummaryResponse | null>(null);
  readonly instanceRows = signal<RunningInstanceResponse[]>([]);
  readonly instanceListMessage = signal<string | null>(null);

  runningCount(bpmnProcessId: string): number {
    return this.instanceCounts()[bpmnProcessId] ?? 0;
  }

  readonly stats = computed(() => {
    const list = this.rawList();
    return {
      total: list.length,
      totalVersions: list.reduce((sum, p) => sum + p.latestVersion, 0),
      drafts: this.draftList().filter((draft) => draft.status !== 'DEPLOYED').length,
    };
  });

  readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.rawList();
    return this.rawList().filter(
      (p) => p.bpmnProcessId.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  });

  readonly draftRows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const drafts = this.draftList().filter((draft) => draft.status !== 'DEPLOYED');
    if (!q) return drafts;
    return drafts.filter(
      (draft) => draft.bpmnProcessId.toLowerCase().includes(q) || draft.name.toLowerCase().includes(q),
    );
  });

  // --- Import modal state ---
  readonly importModalOpen = signal(false);
  readonly importing = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly draftProcessId = signal('');
  readonly draftName = signal('');
  readonly importErrors = signal<ProcessImportErrorBody | null>(null);
  readonly canSaveDraft = computed(
    () => !!this.selectedFile() && !!this.draftProcessId().trim() && !!this.draftName().trim(),
  );
  readonly draftDrawerOpen = signal(false);
  readonly draftDetailLoading = signal(false);
  readonly draftActionLoading = signal(false);
  readonly draftDetail = signal<ProcessDefinitionDraftResponse | null>(null);
  readonly validationWarnings = signal<string[]>([]);
  readonly validationIssues = signal<BpmnLintIssue[]>([]);
  readonly validationIssueGroups = computed(() => [
    { label: 'Lỗi', severity: 'ERROR', issues: this.validationIssues().filter((i) => i.severity === 'ERROR') },
    { label: 'Cảnh báo', severity: 'WARNING', issues: this.validationIssues().filter((i) => i.severity === 'WARNING') },
    { label: 'Gợi ý', severity: 'SUGGESTION', issues: this.validationIssues().filter((i) => i.severity === 'SUGGESTION') },
  ]);
  readonly canDeployDraft = computed(() => !!this.auth.user()?.isAdmin);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.processDefinitionService.list().subscribe({
      next: (list) => {
        this.rawList.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(
          err.status === 0
            ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}) — kiểm tra backend, proxy và Docker stack (infra/).`
            : `Lỗi tải danh mục quy trình (HTTP ${err.status}).`,
        );
        this.loading.set(false);
      },
    });
    this.reloadDrafts();
    this.reloadInstanceCounts();
  }

  private reloadInstanceCounts(): void {
    this.loadingInstanceCounts.set(true);
    this.processDefinitionService.runningInstanceCounts().subscribe({
      next: (res) => {
        this.instanceCounts.set(res.countsByProcessId ?? {});
        this.instanceCountsAvailable.set(res.available);
        this.instanceCountsMessage.set(res.message);
        this.loadingInstanceCounts.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // Cột runtime hỏng thì chỉ tắt cột đó — danh mục quy trình vẫn phải đọc được.
        this.instanceCounts.set({});
        this.instanceCountsAvailable.set(false);
        this.instanceCountsMessage.set(`Không đọc được số instance đang chạy (HTTP ${err.status}).`);
        this.loadingInstanceCounts.set(false);
      },
    });
  }

  /**
   * Hút quy trình deploy thẳng lên Camunda về catalog.
   *
   * Hiển thị kết quả bằng banner giữ nguyên trên màn (`syncResult`) thay vì toast: một lượt đồng bộ
   * có thể vừa nhập được vài quy trình vừa lỗi vài quy trình, toast biến mất trước khi đọc xong.
   */
  syncFromCamunda(): void {
    this.syncing.set(true);
    this.syncResult.set(null);
    this.processDefinitionService.syncFromCamunda(this.auth.user()?.hoTen).subscribe({
      next: (result) => {
        this.syncing.set(false);
        this.syncResult.set(result);
        if (result.imported > 0) {
          this.activeTabIndex.set(1);
          this.reload();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.syncing.set(false);
        this.message.error(this.apiErrorMessage(error, 'Đồng bộ từ Camunda thất bại'));
      },
    });
  }

  dismissSyncResult(): void {
    this.syncResult.set(null);
  }

  /**
   * Mở bảng đối soát của một quy trình. Không cache: người dùng vừa sửa biểu mẫu / thêm luật xong là
   * bấm lại để xem đã xanh chưa, mà cache thì họ vẫn thấy màu đỏ cũ và tưởng sửa không ăn.
   */
  openReadiness(process: ProcessDefinitionSummaryResponse): void {
    this.readinessDrawerOpen.set(true);
    this.readinessLoading.set(true);
    this.readinessProcess.set(process);
    this.readiness.set(null);
    this.readinessError.set(null);
    this.processDefinitionService.readiness(process.bpmnProcessId).subscribe({
      next: (result) => {
        this.readiness.set(result);
        this.readinessLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.readinessError.set(this.apiErrorMessage(error, 'Không đối soát được quy trình'));
        this.readinessLoading.set(false);
      },
    });
  }

  closeReadinessDrawer(): void {
    this.readinessDrawerOpen.set(false);
  }

  readinessColor(status: ReadinessStatus): string {
    return status === 'ok' ? 'success' : status === 'warn' ? 'warning' : 'error';
  }

  readinessLabel(status: ReadinessStatus): string {
    return status === 'ok' ? 'Sẵn sàng' : status === 'warn' ? 'Cần xem lại' : 'Sẽ hỏng';
  }

  openInstances(process: ProcessDefinitionSummaryResponse): void {
    this.instanceDrawerOpen.set(true);
    this.instanceDrawerLoading.set(true);
    this.instanceDrawerProcess.set(process);
    this.instanceRows.set([]);
    this.instanceListMessage.set(null);
    this.processDefinitionService.runningInstances(process.id).subscribe({
      next: (res) => {
        this.instanceRows.set(res.instances);
        this.instanceListMessage.set(res.available ? null : res.message);
        this.instanceDrawerLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.instanceListMessage.set(`Không tải được danh sách instance (HTTP ${err.status}).`);
        this.instanceDrawerLoading.set(false);
      },
    });
  }

  closeInstanceDrawer(): void {
    this.instanceDrawerOpen.set(false);
  }

  private reloadDrafts(onLoaded?: () => void): void {
    this.loadingDrafts.set(true);
    this.processDefinitionDraftService.list().subscribe({
      next: (list) => {
        this.draftList.set(list);
        this.loadingDrafts.set(false);
        onLoaded?.();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingDrafts.set(false);
        this.errorMessage.set(`Lỗi tải danh sách bản nháp (HTTP ${err.status}).`);
      },
    });
  }

  openImportModal(): void {
    this.selectedFile.set(null);
    this.draftProcessId.set('');
    this.draftName.set('');
    this.importErrors.set(null);
    this.importModalOpen.set(true);
  }

  createBpmn(): void {
    this.router.navigate(['/quy-trinh/ve']);
  }

  closeImportModal(): void {
    if (this.importing()) return;
    this.importModalOpen.set(false);
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const selected = nativeUploadFile(file);
    if (!selected) {
      this.selectedFile.set(null);
      this.importErrors.set({
        message: 'Không thể đọc file đã chọn.',
        errors: ['Trình duyệt không cung cấp nội dung file BPMN. Vui lòng chọn lại file.'],
      });
      return false;
    }
    this.selectedFile.set(selected);
    this.importErrors.set(null);
    void this.prefillMetadata(selected);
    return false;
  };

  removeSelectedFile(): void {
    this.selectedFile.set(null);
    this.draftProcessId.set('');
    this.draftName.set('');
    this.importErrors.set(null);
  }

  saveDraft(): void {
    const file = this.selectedFile();
    const processId = this.draftProcessId().trim();
    const name = this.draftName().trim();
    if (!file || !processId || !name) return;
    const duplicateCount = this.draftList().filter(
      (draft) => draft.status !== 'DEPLOYED' && draft.bpmnProcessId.toLowerCase() === processId.toLowerCase(),
    ).length;
    if (duplicateCount > 0) {
      this.modal.confirm({
        nzTitle: 'Mã quy trình đã có bản nháp',
        nzContent: `Đang có ${duplicateCount} bản nháp mang mã ${processId}. Bạn vẫn muốn tạo thêm một bản nháp độc lập?`,
        nzOkText: 'Tạo thêm',
        nzCancelText: 'Quay lại',
        nzOnOk: () => this.submitDraft(file, processId, name),
      });
      return;
    }
    this.submitDraft(file, processId, name);
  }

  private submitDraft(file: File, processId: string, name: string): void {
    this.importing.set(true);
    this.importErrors.set(null);
    const actor = this.auth.user()?.hoTen;
    let request: ReturnType<ProcessDefinitionDraftService['import']>;
    try {
      request = this.processDefinitionDraftService.import(file, processId, name, actor);
    } catch (error) {
      this.importing.set(false);
      this.showImportError(error);
      return;
    }
    request.subscribe({
      next: (res) => {
        this.importing.set(false);
        this.importModalOpen.set(false);
        this.message.success(`Đã lưu bản nháp ${res.bpmnProcessId} — ${res.name}.`);
        this.activeTabIndex.set(0);
        this.reloadDrafts(() => this.openDraft(res.id));
      },
      error: (error: unknown) => {
        this.importing.set(false);
        this.showImportError(error);
      },
    });
  }

  openDraft(id: string): void {
    this.draftDrawerOpen.set(true);
    this.draftDetailLoading.set(true);
    this.draftDetail.set(null);
    this.validationWarnings.set([]);
    this.validationIssues.set([]);
    this.processDefinitionDraftService.get(id).subscribe({
      next: (draft) => {
        this.draftDetail.set(draft);
        this.draftDetailLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.draftDetailLoading.set(false);
        this.message.error(`Không tải được bản nháp (HTTP ${error.status}).`);
      },
    });
  }

  closeDraftDrawer(): void {
    if (!this.draftActionLoading()) this.draftDrawerOpen.set(false);
  }

  validateDraft(): void {
    const draft = this.draftDetail();
    if (!draft) return;
    this.draftActionLoading.set(true);
    this.processDefinitionDraftService.validate(draft.id, draft.revision, this.auth.user()?.hoTen).subscribe({
      next: (result) => {
        this.draftActionLoading.set(false);
        if (result.valid) this.message.success('BPMN hợp lệ và sẵn sàng deploy.');
        else this.message.error(result.errors.join(' ') || 'BPMN không hợp lệ.');
        this.reloadDrafts();
        this.openDraft(draft.id);
        this.validationWarnings.set(result.warnings ?? []);
        this.validationIssues.set(result.issues ?? []);
      },
      error: (error: HttpErrorResponse) => {
        this.draftActionLoading.set(false);
        this.message.error(this.apiErrorMessage(error, 'Kiểm tra BPMN thất bại'));
      },
    });
  }

  confirmDeployDraft(): void {
    const draft = this.draftDetail();
    if (!draft) return;
    this.modal.confirm({
      nzTitle: `Deploy ${draft.bpmnProcessId}?`,
      nzContent: 'Thao tác này sẽ phát hành một version bất biến lên Camunda. Bản nháp sẽ không thể chỉnh sửa sau khi deploy.',
      nzOkText: 'Deploy',
      nzOkDanger: true,
      nzCancelText: 'Huỷ',
      nzOnOk: () => this.deployDraft(draft),
    });
  }

  private deployDraft(draft: ProcessDefinitionDraftResponse): void {
    this.draftActionLoading.set(true);
    this.processDefinitionDraftService.deploy(draft.id, draft.revision, this.auth.user()?.hoTen).subscribe({
      next: (deployed) => {
        this.draftActionLoading.set(false);
        this.draftDrawerOpen.set(false);
        this.activeTabIndex.set(1);
        this.message.success(`Đã deploy ${deployed.bpmnProcessId} phiên bản v${deployed.version}.`);
        this.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.draftActionLoading.set(false);
        this.message.error(this.apiErrorMessage(error, 'Deploy thất bại'));
      },
    });
  }

  private apiErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as Partial<ProcessImportErrorBody> | null;
    return body?.message || `${fallback} (HTTP ${error.status}).`;
  }

  private showImportError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as Partial<ProcessImportErrorBody> | null;
      if (error.status === 404 || error.status === 405) {
        this.importErrors.set({
          message: `Lưu bản nháp thất bại (HTTP ${error.status}).`,
          errors: ['Backend đang chạy chưa có API import draft; hãy restart backend từ source mới nhất.'],
        });
        return;
      }
      if (body?.message) {
        this.importErrors.set({ message: body.message, errors: Array.isArray(body.errors) ? body.errors : [] });
        return;
      }
      if (error.status === 0) {
        this.importErrors.set({
          message: `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}).`,
          errors: ['Kiểm tra backend, reverse proxy và cấu hình mạng hiện tại.'],
        });
        return;
      }
      this.importErrors.set({
        message: `Lưu bản nháp thất bại (HTTP ${error.status}).`,
        errors: [],
      });
      return;
    }
    this.importErrors.set({
      message: 'Không thể tạo request lưu bản nháp.',
      errors: [error instanceof Error ? error.message : 'Lỗi frontend không xác định.'],
    });
  }

  private async prefillMetadata(file: File): Promise<void> {
    try {
      const xml = await file.text();
      if (this.selectedFile() !== file) return;
      const document = new DOMParser().parseFromString(xml, 'application/xml');
      if (document.querySelector('parsererror')) throw new Error('XML không hợp lệ.');
      const processes = Array.from(
        document.getElementsByTagNameNS('http://www.omg.org/spec/BPMN/20100524/MODEL', 'process'),
      ).filter((process) => {
        const executable = process.getAttribute('isExecutable');
        return executable?.toLowerCase() === 'true' || executable === '1';
      });
      if (processes.length !== 1) {
        throw new Error('File phải có đúng một bpmn:process executable.');
      }
      const processId = processes[0].getAttribute('id')?.trim() ?? '';
      if (!processId) throw new Error('Process executable chưa có thuộc tính id.');
      this.draftProcessId.set(processId);
      this.draftName.set(processes[0].getAttribute('name')?.trim() || processId);
    } catch (error) {
      if (this.selectedFile() !== file) return;
      this.importErrors.set({
        message: 'Không thể đọc metadata BPMN từ file.',
        errors: [error instanceof Error ? error.message : 'Nội dung file không hợp lệ.'],
      });
    }
  }

  viewDetail(process: ProcessDefinitionSummaryResponse): void {
    this.router.navigate(['/quy-trinh', process.id]);
  }

  runTestDraft(draft: { id: string }): void {
    this.router.navigate(['/quy-trinh/nhap', draft.id, 'chay-thu']);
  }

  editDraft(draft: { id: string }): void {
    this.router.navigate(['/quy-trinh/nhap', draft.id, 've']);
  }

  deleteDraft(draft: ProcessDefinitionDraftSummaryResponse): void {
    this.modal.confirm({
      nzTitle: `Xóa bản nháp ${draft.bpmnProcessId}?`,
      nzContent: `Thao tác này sẽ xóa vĩnh viễn bản nháp "${draft.name}" cùng lịch sử revision. Không thể hoàn tác.`,
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzCancelText: 'Huỷ',
      nzOnOk: () => this.processDefinitionDraftService.delete(draft.id, draft.revision).subscribe({
        next: () => {
          this.message.success(`Đã xóa bản nháp ${draft.bpmnProcessId}.`);
          this.reloadDrafts();
        },
        error: (error: HttpErrorResponse) => {
          this.message.error(this.apiErrorMessage(error, 'Xóa bản nháp thất bại'));
          this.reloadDrafts();
        },
      }),
    });
  }
}

/** NzUpload may pass either the browser File itself or a list wrapper containing originFileObj. */
export function nativeUploadFile(upload: NzUploadFile): File | null {
  if (upload.originFileObj instanceof File) return upload.originFileObj;
  return upload instanceof File ? upload : null;
}
