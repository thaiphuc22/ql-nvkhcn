import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import { MyTaskResponse } from '../../core/models/my-task';
import { MyTaskService } from '../../core/services/my-task.service';

// Port của webapp/src/pages/Worklist.tsx — "Việc của tôi" (route /viec-cua-toi).
// Danh sách và quyền xử lý đều lấy từ projection server-side; client không còn tải toàn bộ
// hồ sơ rồi tự lọc theo roleCodes.

function timestamp(value?: string | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatDateTime(value?: string | null): string {
  const parsed = timestamp(value);
  if (parsed == null) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

@Component({
  selector: 'app-worklist',
  imports: [
    NzAlertModule,
    NzButtonModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
  ],
  templateUrl: './worklist.html',
  styleUrl: './worklist.scss',
})
export class WorklistPage implements OnInit {
  private readonly myTaskService = inject(MyTaskService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly tasks = signal<MyTaskResponse[]>([]);

  readonly currentUser = computed(() => this.auth.user()?.hoTen ?? 'Người dùng');

  readonly overdueCount = computed(
    () => this.tasks().filter((task) => this.isOverdue(task.dueAt)).length,
  );

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const userId = this.auth.user()?.email;
    if (!userId) {
      this.tasks.set([]);
      this.errorMessage.set('Không xác định được tài khoản đang đăng nhập.');
      this.loading.set(false);
      return;
    }
    this.myTaskService.list(userId).subscribe({
      next: (list) => {
        this.tasks.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(
          err.status === 0
            ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}) — kiểm tra backend, proxy và Docker stack (infra/).`
            : `Lỗi tải việc cần xử lý (HTTP ${err.status}).`,
        );
        this.loading.set(false);
      },
    });
  }

  isOverdue(dueAt: string | null): boolean {
    const due = timestamp(dueAt);
    return due != null && due < Date.now();
  }

  formatDateTime(value: string | null): string {
    return formatDateTime(value);
  }

  candidateLabel(task: MyTaskResponse): string {
    if (task.assignee) return task.assignee;
    if (task.candidateGroups.length) return task.candidateGroups.join(', ');
    if (task.candidateUsers.length) return task.candidateUsers.join(', ');
    return '—';
  }

  openDetail(task: MyTaskResponse): void {
    void this.router.navigate(['/ho-so', task.maHoSo], {
      queryParams: { taskKey: task.taskKey },
    });
  }
}
