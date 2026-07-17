import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { AuthService } from '../../core/auth/auth.service';
import {
  CAP_LABEL,
  DOSSIER_STATUS_LABEL,
  DossierStatus,
  DossierStepResponse,
  HO_SO_LOAI_LABEL,
  HoSoActionOutcome,
  HoSoResponse,
  StepStatus,
} from '../../core/models/ho-so';
import { HoSoService } from '../../core/services/ho-so.service';

const STATUS_COLOR: Record<DossierStatus, string> = {
  DRAFT: 'default', PROCESSING: 'processing', APPROVED: 'success', REJECTED: 'error',
};

const STEP_LABEL: Record<StepStatus, string> = {
  PENDING: 'Chờ xử lý', CURRENT: 'Đang xử lý', DONE: 'Hoàn thành', REJECTED: 'Từ chối', SKIPPED: 'Đã bỏ qua',
};

const STEP_COLOR: Record<StepStatus, string> = {
  PENDING: 'default', CURRENT: 'processing', DONE: 'success', REJECTED: 'error', SKIPPED: 'warning',
};

@Component({
  selector: 'app-ho-so-detail',
  imports: [
    FormsModule, NzAlertModule, NzButtonModule, NzCardModule, NzDescriptionsModule, NzEmptyModule,
    NzGridModule, NzIconModule, NzInputModule, NzModalModule, NzResultModule, NzSpinModule, NzTagModule,
  ],
  templateUrl: './ho-so-detail.html',
  styleUrl: './ho-so-detail.scss',
})
export class HoSoDetailPage {
  private readonly service = inject(HoSoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly statusLabel = DOSSIER_STATUS_LABEL;
  readonly statusColor = STATUS_COLOR;
  readonly loaiLabel = HO_SO_LOAI_LABEL;
  readonly capLabel = CAP_LABEL;
  readonly stepLabel = STEP_LABEL;
  readonly stepColor = STEP_COLOR;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly notFound = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly item = signal<HoSoResponse | null>(null);
  readonly submitOpen = signal(false);
  readonly actionOpen = signal(false);
  readonly selectedOutcome = signal<HoSoActionOutcome>('APPROVE_STEP');
  readonly actionNote = signal('');

  readonly currentStep = computed(() => {
    const dossier = this.item();
    return dossier?.steps.find((step) => step.buocIndex === dossier.buocHienTai) ?? null;
  });
  readonly rejectedStep = computed(() => this.item()?.steps.find((step) => step.trangThai === 'REJECTED') ?? null);
  readonly submitProcess = computed(() => {
    const dossier = this.item();
    if (!dossier || dossier.loai !== 'CHU_TRUONG') return null;
    return dossier.cap === 'CS'
      ? { code: 'RD01.01', name: 'Xét duyệt Chủ trương cấp Cơ sở', supported: true }
      : { code: 'RD01.02', name: 'Xét duyệt Chủ trương cấp Tập đoàn', supported: false };
  });

  constructor() {
    this.load(decodeURIComponent(this.route.snapshot.paramMap.get('id') ?? ''));
  }

  load(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.errorMessage.set(null);
    this.service.get(id).subscribe({
      next: (item) => { this.item.set(item); this.loading.set(false); },
      error: (error: HttpErrorResponse) => {
        this.notFound.set(error.status === 404);
        if (error.status !== 404) this.errorMessage.set(this.errorText(error, 'Không thể tải chi tiết hồ sơ'));
        this.loading.set(false);
      },
    });
  }

  back(): void { void this.router.navigate(['/ho-so']); }
  openMission(): void { void this.router.navigate(['/nhiem-vu', this.item()?.maNV]); }

  openAction(outcome: HoSoActionOutcome): void {
    this.selectedOutcome.set(outcome);
    this.actionNote.set('');
    this.actionOpen.set(true);
  }

  submit(): void {
    const dossier = this.item();
    const process = this.submitProcess();
    if (!dossier || !process?.supported) return;
    this.saving.set(true);
    this.service.submit(dossier.id, { quyTrinh: process.code, quyTrinhTen: process.name }).subscribe({
      next: (updated) => {
        this.item.set(updated); this.submitOpen.set(false); this.saving.set(false);
        this.message.success(`Đã gửi duyệt hồ sơ ${updated.id} vào quy trình ${process.code}.`);
      },
      error: (error: HttpErrorResponse) => { this.saving.set(false); this.message.error(this.errorText(error, 'Gửi duyệt thất bại')); },
    });
  }

  applyAction(): void {
    const dossier = this.item();
    const outcome = this.selectedOutcome();
    const note = this.actionNote().trim();
    if (!dossier || ((outcome === 'RETURN_STEP' || outcome === 'REJECT_STEP') && !note)) return;
    this.saving.set(true);
    this.service.applyAction(dossier.id, {
      outcome,
      actor: this.auth.user()?.hoTen ?? 'Người dùng hệ thống',
      yKien: note || null,
    }).subscribe({
      next: (updated) => {
        this.item.set(updated); this.actionOpen.set(false); this.saving.set(false);
        this.message.success('Đã cập nhật bước xử lý hồ sơ.');
      },
      error: (error: HttpErrorResponse) => { this.saving.set(false); this.message.error(this.errorText(error, 'Xử lý hồ sơ thất bại')); },
    });
  }

  actionTitle(): string {
    return this.selectedOutcome() === 'APPROVE_STEP' ? 'Phê duyệt bước' :
      this.selectedOutcome() === 'RETURN_STEP' ? 'Trả lại bước trước' : 'Từ chối hồ sơ';
  }

  documentIcon(type: string): string {
    return type === 'Excel' ? 'file-excel' : type === 'Archive' ? 'file-zip' : 'file-pdf';
  }

  trackStep(_: number, step: DossierStepResponse): number { return step.buocIndex; }

  private errorText(error: HttpErrorResponse, fallback: string): string {
    const message = typeof error.error?.message === 'string' ? error.error.message : null;
    return message ?? `${fallback} (HTTP ${error.status || 0}).`;
  }
}
