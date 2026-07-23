import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';

import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import {
  NHIEM_VU_CAP_LABEL,
  NHIEM_VU_GIAI_DOAN_COLOR,
  NHIEM_VU_GIAI_DOAN_LABEL,
  NhiemVuCap,
  NhiemVuGiaiDoan,
  NhiemVuResponse,
} from '../../core/models/nhiem-vu';
import { HoSoService } from '../../core/services/ho-so.service';
import { NhiemVuService } from '../../core/services/nhiem-vu.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-nhiem-vu-list',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
    NzPopconfirmModule,
  ],
  templateUrl: './nhiem-vu-list.html',
  styleUrl: './nhiem-vu-list.scss',
})
export class NhiemVuListPage {
  private readonly service = inject(NhiemVuService);
  private readonly hoSoService = inject(HoSoService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly capLabel = NHIEM_VU_CAP_LABEL;
  readonly stageLabel = NHIEM_VU_GIAI_DOAN_LABEL;
  readonly stageColor = NHIEM_VU_GIAI_DOAN_COLOR;
  readonly stageOptions = Object.entries(NHIEM_VU_GIAI_DOAN_LABEL).map(([value, label]) => ({ value, label }));

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly rawList = signal<NhiemVuResponse[]>([]);
  readonly dossierCount = signal(new Map<string, number>());
  readonly totalDossiers = signal(0);
  readonly query = signal('');
  readonly capFilter = signal<NhiemVuCap | null>(null);
  readonly stageFilter = signal<NhiemVuGiaiDoan | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly stats = computed(() => ({
    total: this.rawList().length,
    coSo: this.rawList().filter((item) => item.cap === 'CS').length,
    tapDoan: this.rawList().filter((item) => item.cap === 'TD').length,
    hoSo: this.totalDossiers(),
  }));

  readonly rows = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('vi');
    return this.rawList().filter((item) => {
      if (this.capFilter() && item.cap !== this.capFilter()) return false;
      if (this.stageFilter() && item.giaiDoan !== this.stageFilter()) return false;
      return !q || [item.ma, item.ten, item.chuNhiem].some((value) => value.toLocaleLowerCase('vi').includes(q));
    });
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    forkJoin({ nhiemVu: this.service.list(), hoSo: this.hoSoService.list() }).subscribe({
      next: ({ nhiemVu, hoSo }) => {
        const count = new Map<string, number>();
        hoSo.forEach((item) => count.set(item.maNV, (count.get(item.maNV) ?? 0) + 1));
        this.rawList.set(nhiemVu);
        this.dossierCount.set(count);
        this.totalDossiers.set(hoSo.length);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.status === 0
          ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}).`
          : `Lỗi tải dữ liệu nhiệm vụ (HTTP ${error.status}).`);
        this.loading.set(false);
      },
    });
  }

  open(row: NhiemVuResponse): void {
    void this.router.navigate(['/nhiem-vu', row.ma]);
  }

  create(): void {
    void this.router.navigate(['/nhiem-vu/moi']);
  }

  openDossiers(): void {
    void this.router.navigate(['/ho-so']);
  }

  delete(row: NhiemVuResponse): void {
    this.deletingId.set(row.ma);
    const actor = this.auth.user()?.hoTen ?? 'unknown-demo-user';
    this.service.delete(row.ma, actor).subscribe({
      next: () => {
        this.rawList.update((items) => items.filter((item) => item.ma !== row.ma));
        const removedDossiers = this.dossierCount().get(row.ma) ?? 0;
        this.totalDossiers.update((total) => Math.max(0, total - removedDossiers));
        this.dossierCount.update((counts) => { const next = new Map(counts); next.delete(row.ma); return next; });
        this.deletingId.set(null);
        this.message.success(`Đã xóa nhiệm vụ ${row.ma}.`);
      },
      error: (error: HttpErrorResponse) => {
        this.deletingId.set(null);
        this.message.error(`Không xóa được nhiệm vụ (HTTP ${error.status}).`);
      },
    });
  }
}
