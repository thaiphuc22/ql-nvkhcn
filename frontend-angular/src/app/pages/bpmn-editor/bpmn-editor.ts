import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { AuthService } from '../../core/auth/auth.service';
import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import {
  BpmnLintIssue,
  ProcessDefinitionDraftResponse,
  ProcessImportErrorBody,
} from '../../core/models/process-definition';
import { ProcessDefinitionDraftService } from '../../core/services/process-definition-draft.service';
import { BpmnModelerComponent } from '../../shared/bpmn-modeler/bpmn-modeler';
import { BpmnLintResultsComponent } from '../../shared/bpmn-lint-results/bpmn-lint-results';
import { safeBpmnFileName, starterBpmn } from './starter-bpmn';

const BPMN_ID_PATTERN = /^[A-Za-z_][A-Za-z0-9._-]*$/;

@Component({
  selector: 'app-bpmn-editor-page',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSpinModule,
    NzTagModule,
    BpmnModelerComponent,
    BpmnLintResultsComponent,
  ],
  templateUrl: './bpmn-editor.html',
  styleUrl: './bpmn-editor.scss',
})
export class BpmnEditorPage {
  @ViewChild(BpmnModelerComponent) private modeler?: BpmnModelerComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly drafts = inject(ProcessDefinitionDraftService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly validating = signal(false);
  readonly editorReady = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly validationErrors = signal<string[]>([]);
  readonly validationWarnings = signal<string[]>([]);
  readonly validationIssues = signal<BpmnLintIssue[]>([]);
  readonly draft = signal<ProcessDefinitionDraftResponse | null>(null);
  readonly processId = signal(`Process_${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`);
  readonly processName = signal('Quy trình mới');
  readonly initialXml = signal<string | null>(null);
  readonly dirty = signal(true);

  readonly isNew = computed(() => !this.draft());
  readonly processIdValid = computed(() => BPMN_ID_PATTERN.test(this.processId().trim()));
  readonly canSave = computed(
    () => this.editorReady() && this.processIdValid() && !!this.processName().trim() && !this.saving(),
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const draftId = params.get('draftId');
      if (draftId) this.loadDraft(draftId);
      else this.initialXml.set(starterBpmn(this.processId(), this.processName()));
    });
  }

  back(): void {
    this.router.navigate(['/quy-trinh']);
  }

  metadataChanged(): void {
    this.dirty.set(true);
    this.validationErrors.set([]);
    this.validationWarnings.set([]);
    this.validationIssues.set([]);
  }

  editorDirtyChanged(value: boolean): void {
    if (value) this.dirty.set(true);
  }

  save(): void {
    this.persist();
  }

  async exportBpmn(): Promise<void> {
    if (!this.canSave() || !this.modeler) return;
    this.errorMessage.set(null);
    try {
      const processId = this.processId().trim();
      const xml = await this.modeler.exportXml(processId, this.processName().trim());
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeBpmnFileName(processId);
      link.click();
      URL.revokeObjectURL(url);
      this.message.success(`Đã kết xuất ${link.download}.`);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Không thể kết xuất file BPMN.');
    }
  }

  validate(): void {
    if (this.dirty() || !this.draft()) {
      this.persist((saved) => this.validateSaved(saved));
      return;
    }
    this.validateSaved(this.draft()!);
  }

  @HostListener('window:beforeunload', ['$event'])
  warnUnsaved(event: BeforeUnloadEvent): void {
    if (!this.dirty()) return;
    event.preventDefault();
    event.returnValue = '';
  }

  private loadDraft(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.drafts.get(id).subscribe({
      next: (draft) => {
        if (draft.status === 'DEPLOYED') {
          this.errorMessage.set('Bản nháp đã deploy là bất biến và không thể chỉnh sửa.');
          this.loading.set(false);
          return;
        }
        this.draft.set(draft);
        this.processId.set(draft.bpmnProcessId);
        this.processName.set(draft.name);
        this.initialXml.set(draft.bpmnXml);
        this.dirty.set(false);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.apiError(error, 'Không tải được bản nháp'));
      },
    });
  }

  private async persist(onSaved?: (draft: ProcessDefinitionDraftResponse) => void): Promise<void> {
    if (!this.canSave() || !this.modeler) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.validationErrors.set([]);
    this.validationWarnings.set([]);
    this.validationIssues.set([]);
    try {
      const processId = this.processId().trim();
      const name = this.processName().trim();
      const bpmnXml = await this.modeler.exportXml(processId, name);
      const current = this.draft();
      const request = current
        ? this.drafts.update(
            current.id,
            {
              expectedRevision: current.revision,
              resourceName: `${processId}.bpmn`,
              bpmnProcessId: processId,
              name,
              bpmnXml,
            },
            this.auth.user()?.hoTen,
          )
        : this.drafts.create(
            { resourceName: `${processId}.bpmn`, bpmnProcessId: processId, name, bpmnXml },
            this.auth.user()?.hoTen,
          );
      request.subscribe({
        next: (saved) => {
          const wasNew = !this.draft();
          this.draft.set(saved);
          this.saving.set(false);
          this.dirty.set(false);
          this.modeler?.markSaved();
          this.message.success(`Đã lưu bản nháp ${saved.bpmnProcessId} · revision ${saved.revision}.`);
          if (wasNew) {
            void this.router.navigate(['/quy-trinh/nhap', saved.id, 've'], { replaceUrl: true });
          }
          onSaved?.(saved);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.errorMessage.set(this.apiError(error, 'Lưu bản nháp thất bại'));
        },
      });
    } catch (error) {
      this.saving.set(false);
      this.errorMessage.set(error instanceof Error ? error.message : 'Không thể xuất BPMN XML.');
    }
  }

  private validateSaved(draft: ProcessDefinitionDraftResponse): void {
    this.validating.set(true);
    this.validationErrors.set([]);
    this.validationWarnings.set([]);
    this.validationIssues.set([]);
    this.drafts.validate(draft.id, draft.revision, this.auth.user()?.hoTen).subscribe({
      next: (result) => {
        this.validating.set(false);
        this.validationErrors.set(result.errors);
        this.validationWarnings.set(result.warnings);
        this.validationIssues.set(result.issues ?? [
          ...result.errors.map((message) => ({ code: 'LEGACY_ERROR', severity: 'ERROR' as const, message, elementId: null, elementName: null })),
          ...result.warnings.map((message) => ({ code: 'LEGACY_WARNING', severity: 'WARNING' as const, message, elementId: null, elementName: null })),
        ]);
        this.draft.update((current) =>
          current ? { ...current, revision: result.revision, status: result.status } : current,
        );
        if (result.valid) this.message.success('BPMN hợp lệ và sẵn sàng chạy thử/deploy.');
        else this.message.error('BPMN chưa hợp lệ. Hãy xem danh sách lỗi bên dưới.');
      },
      error: (error: HttpErrorResponse) => {
        this.validating.set(false);
        this.errorMessage.set(this.apiError(error, 'Kiểm tra BPMN thất bại'));
      },
    });
  }

  focusIssue(issue: BpmnLintIssue): void {
    if (!issue.elementId) return;
    if (!this.modeler?.focusElement(issue.elementId)) {
      this.message.warning(`Không tìm thấy phần tử ${issue.elementId} trên sơ đồ hiện tại.`);
    }
  }

  private apiError(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as Partial<ProcessImportErrorBody> | null;
    if (error.status === 409) return body?.message || 'Bản nháp đã được cập nhật ở nơi khác. Hãy tải lại trước khi lưu.';
    if (error.status === 0) return `Không kết nối được backend tại ${BACKEND_CONNECTION_LABEL}.`;
    return body?.message || `${fallback} (HTTP ${error.status}).`;
  }
}
