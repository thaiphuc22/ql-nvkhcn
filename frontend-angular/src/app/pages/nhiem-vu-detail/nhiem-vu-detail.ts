import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DOSSIER_STATUS_LABEL, HoSoResponse } from '../../core/models/ho-so';
import { NHIEM_VU_CAP_LABEL, NHIEM_VU_GIAI_DOAN_COLOR, NHIEM_VU_GIAI_DOAN_LABEL, NHIEM_VU_GIAI_DOAN_ORDER, NhiemVuResponse } from '../../core/models/nhiem-vu';
import { HoSoService } from '../../core/services/ho-so.service';
import { NhiemVuService } from '../../core/services/nhiem-vu.service';

@Component({
  selector: 'app-nhiem-vu-detail',
  imports: [NzAlertModule, NzButtonModule, NzCardModule, NzDescriptionsModule, NzEmptyModule, NzGridModule, NzIconModule, NzResultModule, NzSpinModule, NzStepsModule, NzTableModule, NzTagModule],
  templateUrl: './nhiem-vu-detail.html', styleUrl: './nhiem-vu-detail.scss',
})
export class NhiemVuDetailPage {
  private readonly service = inject(NhiemVuService); private readonly hoSoService = inject(HoSoService);
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  readonly capLabel = NHIEM_VU_CAP_LABEL; readonly stageLabel = NHIEM_VU_GIAI_DOAN_LABEL; readonly stageColor = NHIEM_VU_GIAI_DOAN_COLOR; readonly statusLabel = DOSSIER_STATUS_LABEL;
  readonly stages = NHIEM_VU_GIAI_DOAN_ORDER; readonly loading = signal(true); readonly notFound = signal(false); readonly errorMessage = signal<string | null>(null);
  readonly item = signal<NhiemVuResponse | null>(null); readonly dossiers = signal<HoSoResponse[]>([]);
  readonly currentStage = computed(() => Math.max(0, this.item() ? this.stages.indexOf(this.item()!.giaiDoan) : 0));
  constructor() { this.load(decodeURIComponent(this.route.snapshot.paramMap.get('ma') ?? '')); }
  load(ma: string): void {
    this.loading.set(true);
    forkJoin({ item: this.service.get(ma), dossiers: this.hoSoService.list() }).subscribe({
      next: ({ item, dossiers }) => { this.item.set(item); this.dossiers.set(dossiers.filter((d) => d.maNV === ma).sort((a, b) => a.ngayTao.localeCompare(b.ngayTao))); this.loading.set(false); },
      error: (error: HttpErrorResponse) => { this.notFound.set(error.status === 404); if (error.status !== 404) this.errorMessage.set(`Không thể tải chi tiết nhiệm vụ (HTTP ${error.status}).`); this.loading.set(false); },
    });
  }
  back(): void { void this.router.navigate(['/nhiem-vu']); }
  openDossiers(): void { void this.router.navigate(['/ho-so'], { queryParams: { maNV: this.item()?.ma } }); }
  createDossier(): void { void this.router.navigate(['/ho-so/tao-moi'], { queryParams: { maNV: this.item()?.ma } }); }
  openDossier(row: HoSoResponse): void { void this.router.navigate(['/ho-so', row.id]); }
}
