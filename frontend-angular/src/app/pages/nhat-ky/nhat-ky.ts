import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import type { JobOutcome, JobRun } from '../../core/models/integration-system';
import type { InternalIntegrationStatus } from '../../core/models/internal-integration-status';
import { JOB_OUTCOME } from '../../core/models/integration-system';
import {
  EVENT_META,
  eventDossiers,
  seedEvents,
  type EventType,
  type ProcessEvent,
} from '../../core/models/process-event';
import { IntegrationSystemService } from '../../core/services/integration-system.service';
import { InternalIntegrationStatusService } from '../../core/services/internal-integration-status.service';

// Port của webapp/src/pages/ProcessEventLog.tsx — "Nhật ký" (route /nhat-ky), hub
// lịch sử 2 tab:
//  • Nhật ký luồng   → per-hồ sơ, timeline sự kiện Zeebe (audit lớp điều phối).
//    KHÔNG có backend nào lưu lịch sử Zeebe (chưa tích hợp Operate/history export) —
//    vẫn dùng seedEvents mock, xem core/models/process-event.ts.
//  • Nhật ký tích hợp → cross-hồ sơ, bảng job worker gọi hệ ngoài. Nối thẳng
//    `/api/integration-systems/{key}/job-runs` thật (đã có từ lát /tich-hop) thay vì
//    lặp lại seedJobRuns mock — một nguồn sự thật cho cùng một dữ liệu.

@Component({
  selector: 'app-nhat-ky',
  imports: [
    FormsModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
    NzTagModule,
    NzTimelineModule,
    NzTypographyModule,
  ],
  templateUrl: './nhat-ky.html',
  styleUrl: './nhat-ky.scss',
})
export class NhatKyPage implements OnInit {
  private readonly message = inject(NzMessageService);
  private readonly integrationSystems = inject(IntegrationSystemService);
  private readonly internalIntegration = inject(InternalIntegrationStatusService);

  readonly eventMeta = EVENT_META;
  readonly jobOutcomeMeta = JOB_OUTCOME;
  readonly eventTypeOptions = Object.keys(EVENT_META) as EventType[];
  readonly jobOutcomeOptions = Object.keys(JOB_OUTCOME) as JobOutcome[];
  readonly dossierOptions = eventDossiers;
  readonly loadingInternalStatus = signal(false);
  readonly internalStatus = signal<InternalIntegrationStatus | null>(null);

  /* ── Tab 1: Nhật ký luồng (mock) ───────────────────────────────────────── */

  readonly fHoSo = signal<string>(eventDossiers[0] ?? '');
  readonly fType = signal<EventType | undefined>(undefined);

  readonly flowEvents = computed<ProcessEvent[]>(() => {
    const hoSo = this.fHoSo();
    const type = this.fType();
    const rows = seedEvents
      .filter((e) => (hoSo ? e.maHoSo === hoSo : true))
      .filter((e) => (type ? e.loai === type : true));
    return [...rows].sort((a, b) => a.thoiDiem.localeCompare(b.thoiDiem));
  });

  readonly flowStats = computed(() => {
    const hoSo = this.fHoSo();
    const scope = seedEvents.filter((e) => (hoSo ? e.maHoSo === hoSo : true));
    return {
      total: scope.length,
      services: scope.filter((e) => e.loai === 'service-task').length,
      incidents: scope.filter((e) => e.loai === 'incident').length,
    };
  });

  /* ── Tab 2: Nhật ký tích hợp (backend thật) ────────────────────────────── */

  readonly loadingJobRuns = signal(false);
  readonly fHe = signal<string | undefined>(undefined);
  readonly fKetQua = signal<JobOutcome | undefined>(undefined);

  readonly allJobRuns = computed<JobRun[]>(() =>
    this.integrationSystems.systems().flatMap((s) => this.integrationSystems.jobRunsFor(s.key)),
  );

  readonly heOptions = computed(() => Array.from(new Set(this.allJobRuns().map((j) => j.he))).sort());

  readonly jobRows = computed<JobRun[]>(() => {
    const he = this.fHe();
    const ketQua = this.fKetQua();
    return this.allJobRuns()
      .filter((j) => (he ? j.he === he : true))
      .filter((j) => (ketQua ? j.ketQua === ketQua : true))
      // Bảng cross-hồ sơ: mới nhất lên đầu.
      .slice()
      .sort((a, b) => b.thoiDiem.localeCompare(a.thoiDiem));
  });

  readonly jobStats = computed(() => {
    const runs = this.allJobRuns();
    return {
      total: runs.length,
      failed: runs.filter((j) => j.ketQua === 'failed').length,
      retry: runs.filter((j) => j.ketQua === 'retry').length,
    };
  });

  ngOnInit(): void {
    this.loadInternalStatus();
    this.loadingJobRuns.set(true);
    this.integrationSystems.load().subscribe({
      next: (list) => {
        if (!list.length) {
          this.loadingJobRuns.set(false);
          return;
        }
        let remaining = list.length;
        list.forEach((s) =>
          this.integrationSystems.loadJobRuns(s.key).subscribe({
            next: () => {
              remaining -= 1;
              if (remaining <= 0) this.loadingJobRuns.set(false);
            },
            error: () => {
              remaining -= 1;
              if (remaining <= 0) this.loadingJobRuns.set(false);
            },
          }),
        );
      },
      error: () => {
        this.loadingJobRuns.set(false);
        this.message.error('Không tải được nhật ký tích hợp từ backend.');
      },
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
        this.message.error('Không tải được trạng thái đồng bộ nội bộ Hồ sơ ↔ Quy trình.');
      },
    });
  }

  fmtIso(value: string | null | undefined): string {
    if (!value) return '—';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));
  }

  /** '2026-06-20 09:12' → '20/06/2026 09:12' */
  fmt(s: string): string {
    const [d, t] = s.split(' ');
    const [y, m, dd] = d.split('-');
    return `${dd}/${m}/${y} ${t}`;
  }
}
