import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, catchError, switchMap, takeUntil, takeWhile, tap, timer } from 'rxjs';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { ProcessDefinitionDraftService } from '../../core/services/process-definition-draft.service';
import { BpmnTestService } from '../../core/services/bpmn-test.service';
import { AuthService } from '../../core/auth/auth.service';
import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import { ProcessDefinitionDraftResponse } from '../../core/models/process-definition';
import {
  BPMN_TEST_TERMINAL_STATUSES,
  BpmnTestBlockedJob,
  BpmnTestErrorBody,
  BpmnTestIncident,
  BpmnTestSessionResponse,
  BpmnTestStatus,
  BpmnTestTask,
} from '../../core/models/bpmn-test';
import { BpmnViewerComponent } from '../../shared/bpmn-viewer/bpmn-viewer';
import { BpmnVariableFormComponent } from '../../shared/bpmn-variables/bpmn-variable-form';
import { findGateway, parseBpmnModel, referencedVariableNames } from '../../shared/bpmn-variables/bpmn-variable-usage';

const POLL_INTERVAL_MS = 3000;

/**
 * Trang "Chạy thử BPMN" — route `/quy-trinh/nhap/:draftId/chay-thu`. Chạy một BPMN **draft** (chưa
 * deploy lên production Camunda) trên một Camunda test engine cô lập riêng qua `/api/bpmn-tests`
 * (backend Test BPMN Lát A+B+C, đã DONE+VERIFIED). Vì vậy tính năng này KHÔNG yêu cầu draft phải
 * deploy trước — chỉ cần chọn đúng draft + revision đã lưu trong PostgreSQL của App.
 */
@Component({
  selector: 'app-bpmn-test-session',
  imports: [
    DatePipe,
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzDrawerModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzPageHeaderModule,
    NzResultModule,
    NzSelectModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
    BpmnViewerComponent,
    BpmnVariableFormComponent,
  ],
  templateUrl: './bpmn-test-session.html',
  styleUrl: './bpmn-test-session.scss',
})
export class BpmnTestSessionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly draftService = inject(ProcessDefinitionDraftService);
  private readonly bpmnTestService = inject(BpmnTestService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stopPoll$ = new Subject<void>();

  readonly loadingDraft = signal(true);
  readonly draftError = signal<string | null>(null);
  readonly draft = signal<ProcessDefinitionDraftResponse | null>(null);

  readonly selectedRevision = signal<number | null>(null);
  readonly variablesText = signal('{}');
  readonly ttlSeconds = signal<number | null>(null);

  readonly starting = signal(false);
  readonly startError = signal<BpmnTestErrorBody | null>(null);
  readonly session = signal<BpmnTestSessionResponse | null>(null);
  readonly cancelling = signal(false);

  readonly completingTask = signal<BpmnTestTask | null>(null);
  readonly completeVariablesText = signal('{}');
  readonly completing = signal(false);

  readonly resolvingIncident = signal<BpmnTestIncident | null>(null);
  readonly resolveIncidentVariablesText = signal('{}');
  readonly resolvingIncidentSubmitting = signal(false);

  readonly bypassingJob = signal<BpmnTestBlockedJob | null>(null);
  readonly bypassVariablesText = signal('{}');
  readonly bypassingSubmitting = signal(false);

  private readonly bpmnModel = computed(() => parseBpmnModel(this.selectedRevisionXml()));

  readonly selectedRevisionXml = computed(() => {
    const revision = this.selectedRevision();
    const draft = this.draft();
    if (!draft || revision === null) return '';
    if (revision === draft.revision) return draft.bpmnXml;
    return draft.revisions.find((r) => r.revision === revision)?.bpmnXml ?? draft.bpmnXml;
  });

  readonly activeElementIds = computed(
    () => this.session()?.currentElements.map((e) => e.elementId) ?? [],
  );

  readonly incidentElementIds = computed(
    () => (this.session()?.incidents ?? [])
      .filter((i) => i.type === 'CONDITION_ERROR')
      .map((i) => i.elementId),
  );

  readonly isTerminal = computed(() => {
    const status = this.session()?.status;
    return !!status && BPMN_TEST_TERMINAL_STATUSES.includes(status);
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const draftId = params.get('draftId');
      if (draftId) this.loadDraft(draftId);
    });
    this.destroyRef.onDestroy(() => this.stopPoll$.next());
  }

  backToCatalog(): void {
    this.router.navigate(['/quy-trinh']);
  }

  statusColor(status: BpmnTestStatus): string {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'RUNNING':
      case 'STARTING':
        return 'processing';
      case 'BLOCKED':
        return 'warning';
      case 'CANCELLED':
      case 'TIMED_OUT':
        return 'default';
      case 'FAILED':
        return 'error';
    }
  }

  startSession(): void {
    const draft = this.draft();
    const revision = this.selectedRevision();
    if (!draft || revision === null) return;

    let variables: Record<string, unknown> | undefined;
    const text = this.variablesText().trim();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Biến khởi tạo phải là một JSON object.');
        }
        variables = parsed as Record<string, unknown>;
      } catch (error) {
        this.startError.set({
          message: 'Biến khởi tạo không hợp lệ.',
          errors: [error instanceof Error ? error.message : 'JSON không hợp lệ.'],
        });
        return;
      }
    }

    this.starting.set(true);
    this.startError.set(null);
    this.bpmnTestService
      .create(
        {
          draftId: draft.id,
          revision,
          variables,
          ttlSeconds: this.ttlSeconds() ?? undefined,
        },
        this.auth.user()?.hoTen,
      )
      .subscribe({
        next: (res) => {
          this.starting.set(false);
          this.session.set(res);
          this.startPolling(res.id);
        },
        error: (error: HttpErrorResponse) => {
          this.starting.set(false);
          this.startError.set(this.parseError(error, 'Không bắt đầu được phiên chạy thử'));
        },
      });
  }

  private startPolling(sessionId: string): void {
    this.stopPoll$.next();
    timer(0, POLL_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.bpmnTestService.get(sessionId).pipe(
            tap((s) => this.session.set(s)),
            catchError(() => EMPTY),
          ),
        ),
        takeWhile(() => !this.isTerminal(), true),
        takeUntil(this.stopPoll$),
      )
      .subscribe();
  }

  refreshNow(): void {
    const session = this.session();
    if (!session) return;
    this.bpmnTestService.get(session.id).subscribe((s) => this.session.set(s));
  }

  openCompleteTask(task: BpmnTestTask): void {
    this.completingTask.set(task);
    this.completeVariablesText.set('{}');
  }

  closeCompleteTask(): void {
    if (!this.completing()) this.completingTask.set(null);
  }

  submitCompleteTask(): void {
    const session = this.session();
    const task = this.completingTask();
    if (!session || !task) return;

    let variables: Record<string, unknown> | undefined;
    const text = this.completeVariablesText().trim();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Biến hoàn tất phải là một JSON object.');
        }
        variables = parsed as Record<string, unknown>;
      } catch (error) {
        this.message.error(error instanceof Error ? error.message : 'JSON không hợp lệ.');
        return;
      }
    }

    this.completing.set(true);
    this.bpmnTestService.completeTask(session.id, task.key, { variables }).subscribe({
      next: (res) => {
        this.completing.set(false);
        this.completingTask.set(null);
        this.session.set(res);
        this.message.success(`Đã hoàn tất "${task.name ?? task.elementId}".`);
      },
      error: (error: HttpErrorResponse) => {
        this.completing.set(false);
        this.message.error(this.parseError(error, 'Hoàn tất task thất bại').message);
      },
    });
  }

  gatewayInfo(elementId: string) {
    return findGateway(this.bpmnModel(), elementId);
  }

  referencedVariables(condition: string): string[] {
    return referencedVariableNames(condition);
  }

  variableDisplay(variables: Record<string, unknown>, name: string): string {
    if (!(name in variables)) return '— (thiếu)';
    const v = variables[name];
    return typeof v === 'string' ? v : JSON.stringify(v);
  }

  openResolveIncident(incident: BpmnTestIncident): void {
    this.resolvingIncident.set(incident);
    this.resolveIncidentVariablesText.set(JSON.stringify(this.session()?.variables ?? {}));
  }

  closeResolveIncident(): void {
    if (!this.resolvingIncidentSubmitting()) this.resolvingIncident.set(null);
  }

  submitResolveIncident(): void {
    const session = this.session();
    const incident = this.resolvingIncident();
    if (!session || !incident) return;

    let variables: Record<string, unknown> | undefined;
    const text = this.resolveIncidentVariablesText().trim();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Biến phải là một JSON object.');
        }
        variables = parsed as Record<string, unknown>;
      } catch (error) {
        this.message.error(error instanceof Error ? error.message : 'JSON không hợp lệ.');
        return;
      }
    }

    this.resolvingIncidentSubmitting.set(true);
    this.bpmnTestService.resolveIncident(session.id, incident.key, { variables }).subscribe({
      next: (res) => {
        this.resolvingIncidentSubmitting.set(false);
        this.resolvingIncident.set(null);
        this.session.set(res);
        this.message.success('Đã sửa biến và tiếp tục instance.');
      },
      error: (error: HttpErrorResponse) => {
        this.resolvingIncidentSubmitting.set(false);
        this.message.error(this.parseError(error, 'Sửa incident thất bại').message);
      },
    });
  }

  openBypassJob(job: BpmnTestBlockedJob): void {
    this.bypassingJob.set(job);
    this.bypassVariablesText.set('{}');
  }

  closeBypassJob(): void {
    if (!this.bypassingSubmitting()) this.bypassingJob.set(null);
  }

  submitBypassJob(): void {
    const session = this.session();
    const job = this.bypassingJob();
    if (!session || !job) return;

    let variables: Record<string, unknown> | undefined;
    const text = this.bypassVariablesText().trim();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Biến output phải là một JSON object.');
        }
        variables = parsed as Record<string, unknown>;
      } catch (error) {
        this.message.error(error instanceof Error ? error.message : 'JSON không hợp lệ.');
        return;
      }
    }

    this.bypassingSubmitting.set(true);
    this.bpmnTestService.bypassServiceTask(session.id, job.key, { variables }).subscribe({
      next: (res) => {
        this.bypassingSubmitting.set(false);
        this.bypassingJob.set(null);
        this.session.set(res);
        this.message.success(`Đã bypass "${job.elementId}".`);
      },
      error: (error: HttpErrorResponse) => {
        this.bypassingSubmitting.set(false);
        this.message.error(this.parseError(error, 'Bypass service task thất bại').message);
      },
    });
  }

  confirmCancelSession(): void {
    const session = this.session();
    if (!session) return;
    this.modal.confirm({
      nzTitle: 'Huỷ phiên chạy thử?',
      nzContent: 'Instance đang chạy trên test engine cô lập sẽ bị huỷ; không ảnh hưởng production.',
      nzOkText: 'Huỷ phiên',
      nzOkDanger: true,
      nzCancelText: 'Đóng',
      nzOnOk: () => this.cancelSession(session.id),
    });
  }

  private cancelSession(id: string): void {
    this.cancelling.set(true);
    this.bpmnTestService.cancel(id).subscribe({
      next: (res) => {
        this.cancelling.set(false);
        this.session.set(res);
        this.stopPoll$.next();
      },
      error: (error: HttpErrorResponse) => {
        this.cancelling.set(false);
        this.message.error(this.parseError(error, 'Huỷ phiên thất bại').message);
      },
    });
  }

  runAgain(): void {
    this.stopPoll$.next();
    this.session.set(null);
    this.startError.set(null);
    this.resolvingIncident.set(null);
    this.bypassingJob.set(null);
  }

  variableEntries(variables: Record<string, unknown>): { key: string; value: string }[] {
    return Object.entries(variables).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));
  }

  private loadDraft(draftId: string): void {
    this.loadingDraft.set(true);
    this.draftError.set(null);
    this.draft.set(null);
    this.session.set(null);
    this.stopPoll$.next();
    this.draftService.get(draftId).subscribe({
      next: (draft) => {
        this.draft.set(draft);
        this.selectedRevision.set(draft.revision);
        this.loadingDraft.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loadingDraft.set(false);
        this.draftError.set(
          error.status === 404
            ? 'Không tìm thấy bản nháp này — có thể đã bị xoá hoặc id sai.'
            : error.status === 0
              ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}).`
              : `Lỗi tải bản nháp (HTTP ${error.status}).`,
        );
      },
    });
  }

  private parseError(error: HttpErrorResponse, fallback: string): BpmnTestErrorBody {
    const body = error.error as Partial<BpmnTestErrorBody> | null;
    if (body?.message) return { message: body.message, errors: body.errors ?? [] };
    if (error.status === 0) {
      return { message: `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}).`, errors: [] };
    }
    return { message: `${fallback} (HTTP ${error.status}).`, errors: [] };
  }
}
