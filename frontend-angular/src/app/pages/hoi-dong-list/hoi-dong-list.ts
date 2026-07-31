import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzStatusColor } from 'ng-zorro-antd/core/color';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import {
  CAP_LABEL,
  DOSSIER_STATUS_LABEL,
  DossierStatus,
  HOI_DONG_CAP_LABEL,
  HoSoResponse,
  HoiDongCap,
  HoiDongXetDuyetResponse,
} from '../../core/models/ho-so';
import { HoiDongService } from '../../core/services/hoi-dong.service';
import { HoSoService } from '../../core/services/ho-so.service';

const STATUS_COLOR: Record<DossierStatus, NzStatusColor> = {
  DRAFT: 'default',
  START_PENDING: 'processing',
  START_FAILED: 'error',
  PROCESSING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

/** Quản trị Hội đồng xét duyệt — mở rộng model đã có (`hoi_dong_xet_duyet`/`hoi_dong_thanh_vien`
 * ở ho-so-service) với CRUD thủ công, bên cạnh luồng tự sinh từ workflow. Tạo/sửa nay là trang
 * riêng (`/hoi-dong/moi`, `/hoi-dong/:id/sua`) thay vì modal, để khớp với các trường mở rộng
 * (thành viên chọn từ danh sách ứng viên HDXD, tự điền chức danh/mã NV/phòng ban/email). */
@Component({
  selector: 'app-hoi-dong-list',
  imports: [
    DatePipe,
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './hoi-dong-list.html',
  styleUrl: './hoi-dong-list.scss',
})
export class HoiDongListPage {
  private readonly service = inject(HoiDongService);
  private readonly hoSoService = inject(HoSoService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly capLabel = HOI_DONG_CAP_LABEL;
  readonly nhiemVuCapLabel = CAP_LABEL;
  readonly statusLabel = DOSSIER_STATUS_LABEL;
  readonly statusColor = STATUS_COLOR;

  readonly capOptions: { value: HoiDongCap; label: string }[] = [
    { value: 'CO_SO', label: 'Cơ sở' },
    { value: 'TAP_DOAN', label: 'Tập đoàn' },
  ];
  readonly nhiemVuCapOptions: { value: 'CS' | 'TD'; label: string }[] = [
    { value: 'CS', label: 'Cơ sở' },
    { value: 'TD', label: 'Tập đoàn' },
  ];
  readonly statusOptions: { value: DossierStatus; label: string }[] = Object.entries(DOSSIER_STATUS_LABEL)
    .map(([value, label]) => ({ value: value as DossierStatus, label }));

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly rawList = signal<HoiDongXetDuyetResponse[]>([]);
  readonly hoSoList = signal<HoSoResponse[]>([]);
  readonly query = signal('');
  readonly hoiDongCapFilter = signal<HoiDongCap | null>(null);
  readonly nhiemVuCapFilter = signal<'CS' | 'TD' | null>(null);
  readonly statusFilter = signal<DossierStatus | null>(null);
  readonly deletingId = signal<number | null>(null);

  readonly hoSoById = computed(() => new Map(this.hoSoList().map((h) => [h.id, h])));

  readonly rows = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('vi');
    return this.rawList().filter((item) => {
      const hoSo = this.hoSoById().get(item.hoSoId);
      if (this.hoiDongCapFilter() && item.cap !== this.hoiDongCapFilter()) return false;
      if (this.nhiemVuCapFilter() && hoSo?.cap !== this.nhiemVuCapFilter()) return false;
      if (this.statusFilter() && hoSo?.trangThai !== this.statusFilter()) return false;
      if (!q) return true;
      return [item.maHoiDong, item.hoSoId, hoSo?.maNV, hoSo?.tenDeTai]
        .some((value) => value?.toLocaleLowerCase('vi').includes(q));
    });
  });

  constructor() {
    this.reload();
    this.hoSoService.list().subscribe({ next: (list) => this.hoSoList.set(list) });
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.service.list().subscribe({
      next: (list) => {
        this.rawList.set([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.status === 0
          ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}).`
          : `Lỗi tải danh sách hội đồng (HTTP ${error.status}).`);
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    void this.router.navigate(['/hoi-dong/moi']);
  }

  openEdit(row: HoiDongXetDuyetResponse): void {
    void this.router.navigate(['/hoi-dong', row.id, 'sua']);
  }

  remove(row: HoiDongXetDuyetResponse): void {
    this.deletingId.set(row.id);
    const actor = this.auth.user()?.hoTen ?? 'unknown-demo-user';
    this.service.delete(row.id, actor).subscribe({
      next: () => {
        this.rawList.update((items) => items.filter((item) => item.id !== row.id));
        this.deletingId.set(null);
        this.message.success('Đã xóa hội đồng.');
      },
      error: (error: HttpErrorResponse) => {
        this.deletingId.set(null);
        this.message.error(this.apiErrorMessage(error, 'Xóa hội đồng thất bại'));
      },
    });
  }

  private apiErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as { message?: string } | null;
    return body?.message || `${fallback} (HTTP ${error.status}).`;
  }
}
