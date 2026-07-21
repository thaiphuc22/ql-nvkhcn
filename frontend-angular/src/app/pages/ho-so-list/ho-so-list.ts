import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzStatusColor } from 'ng-zorro-antd/core/color';

import { HoSoService } from '../../core/services/ho-so.service';
import { AuthService } from '../../core/auth/auth.service';
import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import {
  CAP_LABEL,
  DOSSIER_STATUS_LABEL,
  DossierStatus,
  HO_SO_LOAI_LABEL,
  HoSoResponse,
} from '../../core/models/ho-so';

type StatusFilter = DossierStatus | 'ALL';

const STATUS_COLOR: Record<DossierStatus, NzStatusColor> = {
  DRAFT: 'default',
  START_PENDING: 'processing',
  START_FAILED: 'error',
  PROCESSING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

/**
 * Trang thật đầu tiên của F1 Mốc 5 nhánh Angular — thay `PlaceholderPage` cho route `/ho-so`.
 * Gọi thẳng `GET /api/ho-so` (backend Spring Boot Mốc 2/3, đã verify thật), KHÔNG dùng mock data.
 * Đối chiếu UX với `webapp/src/pages/DossierList.tsx` (bản tham chiếu React) nhưng đơn giản hoá:
 * Các luồng tạo mới và chi tiết đã được port sang Angular và gọi backend thật.
 */
@Component({
  selector: 'app-ho-so-list',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSegmentedModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
    NzPopconfirmModule,
  ],
  templateUrl: './ho-so-list.html',
  styleUrl: './ho-so-list.scss',
})
export class HoSoListPage {
  private readonly hoSoService = inject(HoSoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly statusLabel = DOSSIER_STATUS_LABEL;
  readonly loaiLabel = HO_SO_LOAI_LABEL;
  readonly capLabel = CAP_LABEL;
  readonly statusColor = STATUS_COLOR;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly rawList = signal<HoSoResponse[]>([]);
  readonly deletingId = signal<string | null>(null);

  readonly query = signal('');
  readonly statusFilter = signal<StatusFilter>('ALL');

  readonly statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Khởi tạo', value: 'DRAFT' },
    { label: 'Đang xử lý', value: 'PROCESSING' },
    { label: 'Đã phê duyệt', value: 'APPROVED' },
    { label: 'Bị từ chối', value: 'REJECTED' },
  ];

  readonly stats = computed(() => {
    const list = this.rawList();
    return {
      draft: list.filter((d) => d.trangThai === 'DRAFT').length,
      processing: list.filter((d) => d.trangThai === 'PROCESSING').length,
      approved: list.filter((d) => d.trangThai === 'APPROVED').length,
      rejected: list.filter((d) => d.trangThai === 'REJECTED').length,
    };
  });

  readonly rows = computed(() => {
    const status = this.statusFilter();
    const q = this.query().trim().toLowerCase();
    return this.rawList().filter((d) => {
      if (status !== 'ALL' && d.trangThai !== status) return false;
      if (
        q &&
        !d.id.toLowerCase().includes(q) &&
        !d.tenDeTai.toLowerCase().includes(q) &&
        !d.maDeTai.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  });

  constructor() {
    this.query.set(this.route.snapshot.queryParamMap.get('id') ?? '');
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status && this.statusOptions.some((o) => o.value === status)) {
      this.statusFilter.set(status as StatusFilter);
    }
    this.reload();
  }

  create(): void {
    void this.router.navigate(['/ho-so/tao-moi']);
  }

  openDetail(row: HoSoResponse): void {
    void this.router.navigate(['/ho-so', row.id]);
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.hoSoService.list().subscribe({
      next: (list) => {
        this.rawList.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(
          err.status === 0
            ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}) — kiểm tra backend, proxy và Docker stack (infra/).`
            : `Lỗi tải danh sách hồ sơ (HTTP ${err.status}).`,
        );
        this.loading.set(false);
      },
    });
  }

  currentStepLabel(d: HoSoResponse): string {
    if (d.trangThai === 'PROCESSING') return d.steps[d.buocHienTai]?.ten ?? '—';
    if (d.trangThai === 'DRAFT') return 'Chờ gửi duyệt';
    return '—';
  }

  delete(row: HoSoResponse): void {
    this.deletingId.set(row.id);
    const actor = this.auth.user()?.hoTen ?? 'unknown-demo-user';
    this.hoSoService.delete(row.id, actor).subscribe({
      next: () => {
        this.rawList.update((items) => items.filter((item) => item.id !== row.id));
        this.deletingId.set(null);
        this.message.success(`Đã xóa hồ sơ ${row.id}.`);
      },
      error: (error: HttpErrorResponse) => {
        this.deletingId.set(null);
        this.message.error(`Không xóa được hồ sơ (HTTP ${error.status}).`);
      },
    });
  }
}
