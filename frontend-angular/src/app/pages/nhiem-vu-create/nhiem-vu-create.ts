import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { CreateNhiemVuRequest, NhiemVuCap } from '../../core/models/nhiem-vu';
import { NhiemVuService } from '../../core/services/nhiem-vu.service';

@Component({
  selector: 'app-nhiem-vu-create',
  imports: [ReactiveFormsModule, NzAlertModule, NzButtonModule, NzCardModule, NzDatePickerModule, NzFormModule, NzGridModule, NzIconModule, NzInputModule, NzInputNumberModule, NzSelectModule],
  templateUrl: './nhiem-vu-create.html',
  styleUrl: './nhiem-vu-create.scss',
})
export class NhiemVuCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(NhiemVuService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly academicTitles = ['GS.TS.', 'PGS.TS.', 'TS.', 'ThS.', 'KS.', 'CN.'];
  readonly formatter = (value: number | null): string => value == null ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  readonly form = this.fb.group({
    ten: ['', [Validators.required, Validators.maxLength(500)]], cap: ['CS' as NhiemVuCap, Validators.required],
    donViChuTri: ['', Validators.required], thoiGian: this.fb.control<Date[] | null>(null), duToan: [null as number | null, [Validators.min(0)]],
    chuNhiemHocHamHocVi: [''], chuNhiemHoTen: ['', Validators.required], chuNhiemMaNhanVien: [''], chuNhiemEmail: ['', Validators.email],
  });
  cancel(): void { void this.router.navigate(['/nhiem-vu']); }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue(); const range = value.thoiGian;
    const payload: CreateNhiemVuRequest = {
      ten: value.ten!.trim(), cap: value.cap!, chuNhiemHoTen: value.chuNhiemHoTen!.trim(),
      chuNhiemHocHamHocVi: value.chuNhiemHocHamHocVi?.trim() || undefined,
      chuNhiemMaNhanVien: value.chuNhiemMaNhanVien?.trim() || undefined,
      chuNhiemEmail: value.chuNhiemEmail?.trim() || undefined, donViChuTri: value.donViChuTri!.trim(),
      thoiGianThucHien: range?.length === 2 ? `${this.month(range[0])} – ${this.month(range[1])}` : undefined,
      duToan: value.duToan == null ? undefined : `${value.duToan.toLocaleString('vi-VN')} đ`,
    };
    this.submitting.set(true); this.errorMessage.set(null);
    this.service.create(payload).subscribe({
      next: (created) => { this.message.success(`Đã tạo nhiệm vụ ${created.ma}.`); void this.router.navigate(['/nhiem-vu', created.ma]); },
      error: (error: HttpErrorResponse) => { this.errorMessage.set(error.error?.message || `Không thể tạo nhiệm vụ (HTTP ${error.status}).`); this.submitting.set(false); },
    });
  }
  private month(date: Date): string { return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; }
}
