import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import {
  SERVICE_TASK_EXECUTION_STATUS_META,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskExecutionLog,
} from '../../core/models/service-task';

// Port của webapp/src/components/ServiceTaskExecutionDrawer.tsx — drawer chi tiết
// execution log ở tab "Log thực thi": timeline attempt, request/response summary
// masked, Retry/Manual resolve. Bản gốc bị lỗi encoding mojibake ở nhiều chuỗi
// tiếng Việt (vd. "KhÃ´ng cÃ³ dá»¯ liá»‡u.") — port này gõ lại đúng UTF-8 từ ngữ cảnh,
// không copy nguyên văn chuỗi hỏng.

function pretty(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function formatDuration(durationMs?: number): string {
  if (durationMs === undefined) return '-';
  if (durationMs < 1000) return `${durationMs} ms`;
  return `${(durationMs / 1000).toFixed(durationMs >= 10000 ? 0 : 1)} s`;
}

interface TimelineItem {
  color: string;
  icon: string;
  attempt: number;
  isCurrent: boolean;
  timeText: string;
  errorMessage?: string;
}

@Component({
  selector: 'app-service-task-execution-drawer',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzDrawerModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTagModule,
    NzTimelineModule,
    NzTypographyModule,
  ],
  templateUrl: './service-task-execution-drawer.html',
  styleUrl: './service-task-execution-drawer.scss',
})
export class ServiceTaskExecutionDrawer {
  readonly open = input(false);
  readonly log = input<ServiceTaskExecutionLog | undefined>(undefined);
  readonly definition = input<ServiceTaskDefinition | undefined>(undefined);
  readonly version = input<ServiceTaskConfigVersion | undefined>(undefined);
  readonly closed = output<void>();
  readonly retry = output<string>();
  readonly manualResolve = output<{ logId: string; note: string }>();

  readonly statusMeta = SERVICE_TASK_EXECUTION_STATUS_META;
  readonly manualNote = signal('');
  readonly manualResolveOpen = signal(false);

  readonly currentStatusMeta = computed(() => {
    const log = this.log();
    return log ? this.statusMeta[log.status] : undefined;
  });

  readonly timelineItems = computed<TimelineItem[]>(() => {
    const log = this.log();
    if (!log) return [];
    const attempts = Array.from({ length: Math.max(log.attemptNo, 1) }, (_, index) => index + 1);
    return attempts.map((attempt) => {
      const isCurrent = attempt === log.attemptNo;
      const failed = log.status === 'FAILED' && isCurrent;
      const retrying = log.status === 'RETRYING' && isCurrent;
      const success = log.status === 'SUCCESS' && isCurrent;
      return {
        color: failed ? 'red' : retrying ? 'orange' : success ? 'green' : 'blue',
        icon: failed ? 'exclamation-circle' : retrying ? 'retweet' : success ? 'check-circle' : 'clock-circle',
        attempt,
        isCurrent,
        timeText: isCurrent
          ? `${log.startedAt}${log.finishedAt ? ` -> ${log.finishedAt}` : ''}`
          : 'Lần thử trước trong cùng incident mock',
        errorMessage: failed ? log.errorMessage : undefined,
      };
    });
  });

  prettyRequest(): string {
    return pretty(this.log()?.requestSummary);
  }

  prettyResponse(): string {
    return pretty(this.log()?.responseSummary);
  }

  formatDuration(durationMs?: number): string {
    return formatDuration(durationMs);
  }

  close(): void {
    this.closed.emit();
  }

  onRetry(): void {
    const log = this.log();
    if (log) this.retry.emit(log.id);
  }

  openManualResolve(): void {
    this.manualNote.set('');
    this.manualResolveOpen.set(true);
  }

  closeManualResolve(): void {
    this.manualResolveOpen.set(false);
  }

  confirmManualResolve(): void {
    const log = this.log();
    if (!log) return;
    const note = this.manualNote();
    this.manualResolve.emit({ logId: log.id, note: note.trim() || 'Đã xử lý tay bởi người vận hành.' });
    this.manualResolveOpen.set(false);
    this.manualNote.set('');
  }
}
