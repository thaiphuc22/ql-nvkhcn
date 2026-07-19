import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import type { IntegrationSystem } from '../../core/models/integration-system';
import type { InternalIntegrationStatus } from '../../core/models/internal-integration-status';
import { IntegrationMappingService } from '../../core/services/integration-mapping.service';
import { IntegrationSystemService } from '../../core/services/integration-system.service';
import { InternalIntegrationStatusService } from '../../core/services/internal-integration-status.service';
import { IntegrationMappingStudio } from '../../shared/integration-mapping-studio/integration-mapping-studio';
import { IntegrationSystemCard } from '../../shared/integration-system-card/integration-system-card';
import { IntegrationSystemDetailDrawer } from '../../shared/integration-system-detail-drawer/integration-system-detail-drawer';

// Port của webapp/src/pages/IntegrationStatus.tsx — "Trạng thái Tích hợp" (route
// /tich-hop). Seam B (Camunda ↔ QLNS/MS/SAP/QLTS/PLM/IAM): kết nối/cấu hình hệ
// ngoài + mapping dữ liệu. Dữ liệu tải qua `/api/integration-systems` +
// `/api/integration-mappings` (Spring Boot); các service giữ signal cache sau khi
// backend xác nhận — không còn state cục bộ như bản React gốc.

@Component({
  selector: 'app-integration-status',
  imports: [
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTabsModule,
    NzTagModule,
    NzTypographyModule,
    IntegrationMappingStudio,
    IntegrationSystemCard,
    IntegrationSystemDetailDrawer,
  ],
  templateUrl: './integration-status.html',
  styleUrl: './integration-status.scss',
})
export class IntegrationStatusPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  readonly systems = inject(IntegrationSystemService);
  readonly mappings = inject(IntegrationMappingService);
  private readonly internalIntegration = inject(InternalIntegrationStatusService);

  readonly loading = signal(false);
  readonly target = signal<IntegrationSystem | undefined>(undefined);
  readonly detail = signal<IntegrationSystem | undefined>(undefined);
  readonly connecting = signal(false);
  readonly apiKey = signal('');
  readonly endpoint = signal('');
  readonly loadingInternalStatus = signal(false);
  readonly internalStatus = signal<InternalIntegrationStatus | null>(null);

  readonly internalHealth = computed(() => {
    const status = this.internalStatus();
    if (!status) return { label: 'Chưa xác định', color: 'default' };
    if (status.outboxFailed > 0 || status.startFailedDossiers.length > 0) {
      return { label: 'Cần xử lý', color: 'red' };
    }
    if (status.outboxPending > 0) return { label: 'Đang đồng bộ', color: 'gold' };
    return { label: 'Hoạt động', color: 'green' };
  });

  readonly latestInternalEvent = computed(() => {
    const events = this.internalStatus()?.latestInboxByType ?? [];
    return events.slice().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))[0] ?? null;
  });

  readonly stats = computed(() => {
    const list = this.systems.systems();
    const total = list.length;
    const connected = list.filter((s) => s.trangThai !== 'down').length;
    const errors = list.reduce((sum, s) => sum + s.loi24h, 0);
    const queued = list.reduce((sum, s) => sum + s.hangDoi, 0);
    return { total, connected, errors, queued };
  });

  ngOnInit(): void {
    this.loadInternalStatus();
    this.loading.set(true);
    this.systems.load().subscribe({
      next: (list) => {
        this.loading.set(false);
        // Tải job run của từng hệ ngay khi vào trang để card hiện đúng "Lỗi mở" (giống
        // bản React gốc tính trực tiếp từ seedJobRuns đã có sẵn toàn bộ trong bộ nhớ).
        list.forEach((s) => this.systems.loadJobRuns(s.key).subscribe());
      },
      error: () => {
        this.loading.set(false);
        this.message.error('Không tải được danh sách hệ tích hợp từ backend.');
      },
    });
    this.mappings.load().subscribe({
      error: () => this.message.error('Không tải được mapping dữ liệu từ backend.'),
    });
  }

  loadInternalStatus(): void {
    this.loadingInternalStatus.set(true);
    this.internalIntegration.load().subscribe({
      next: (status) => {
        this.internalStatus.set(status);
        this.loadingInternalStatus.set(false);
      },
      error: () => {
        this.loadingInternalStatus.set(false);
        this.message.error('Không tải được trạng thái tích hợp giữa hai service nội bộ.');
      },
    });
  }

  fmtIso(value: string | null | undefined): string {
    if (!value) return 'Chưa có dữ liệu';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));
  }

  private actor(): string {
    return this.auth.user()?.email ?? 'admin';
  }

  openConnect(system: IntegrationSystem): void {
    this.target.set(system);
    this.apiKey.set('');
    this.endpoint.set(system.endpoint);
  }

  closeConnect(): void {
    this.target.set(undefined);
  }

  submitConnect(): void {
    const system = this.target();
    if (!system) return;
    const apiKey = this.apiKey().trim();
    const endpoint = this.endpoint().trim();
    if (!apiKey || apiKey.length < 8) {
      this.message.error('API key tối thiểu 8 ký tự.');
      return;
    }
    if (!endpoint) {
      this.message.error('Nhập endpoint của hệ đích.');
      return;
    }
    this.connecting.set(true);
    this.systems.connect(system, { apiKey, endpoint }, this.actor()).subscribe({
      next: () => {
        this.connecting.set(false);
        this.target.set(undefined);
        this.message.success(`Đã kết nối hệ ${system.key} — ${system.ten}.`);
      },
      error: () => {
        this.connecting.set(false);
        this.message.error('Không thể kết nối — vui lòng tải lại và thử lại.');
      },
    });
  }

  disconnect(system: IntegrationSystem): void {
    this.modal.confirm({
      nzTitle: `Ngắt kết nối ${system.key}?`,
      nzContent: `Các service task gọi ${system.ten} sẽ tạo incident cho tới khi kết nối lại. API key hiện tại bị thu hồi khỏi cấu hình.`,
      nzOkText: 'Ngắt kết nối',
      nzOkDanger: true,
      nzCancelText: 'Huỷ',
      nzOnOk: () =>
        this.systems.disconnect(system, this.actor()).subscribe({
          next: () => this.message.success(`Đã ngắt kết nối hệ ${system.key}.`),
          error: () => this.message.error('Không thể ngắt kết nối — vui lòng tải lại và thử lại.'),
        }),
    });
  }

  openDetail(system: IntegrationSystem): void {
    this.detail.set(system);
  }

  closeDetail(): void {
    this.detail.set(undefined);
  }
}
