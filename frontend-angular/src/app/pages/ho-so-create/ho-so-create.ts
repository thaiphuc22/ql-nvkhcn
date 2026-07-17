import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import {
  CreateHoSoDocument,
  CreateHoSoRequest,
  DOSSIER_STATUS_LABEL,
  HO_SO_LOAI_LABEL,
  HoSoLoai,
  HoSoResponse,
} from '../../core/models/ho-so';
import {
  NHIEM_VU_CAP_LABEL,
  NHIEM_VU_GIAI_DOAN_COLOR,
  NHIEM_VU_GIAI_DOAN_LABEL,
  NHIEM_VU_GIAI_DOAN_ORDER,
  NhiemVuGiaiDoan,
  NhiemVuResponse,
} from '../../core/models/nhiem-vu';
import { HoSoService } from '../../core/services/ho-so.service';
import { NhiemVuService } from '../../core/services/nhiem-vu.service';

const LOAI_OPTIONS = Object.entries(HO_SO_LOAI_LABEL).map(([value, label]) => ({
  value: value as HoSoLoai,
  label,
}));

const LOAI_TO_STAGE: Record<HoSoLoai, NhiemVuGiaiDoan> = {
  CHU_TRUONG: 'CHU_TRUONG', XET_DUYET: 'XET_DUYET', BAO_CAO: 'THUC_HIEN',
  DIEU_CHINH: 'DIEU_CHINH', NGHIEM_THU: 'NGHIEM_THU', QUYET_TOAN: 'QUYET_TOAN',
};

const LOAI_TO_GROUP: Record<HoSoLoai, string> = {
  CHU_TRUONG: 'RD01', XET_DUYET: 'RD02', BAO_CAO: 'RD03',
  DIEU_CHINH: 'RD04', NGHIEM_THU: 'RD05', QUYET_TOAN: 'RD06',
};

export const DOCUMENTS_BY_LOAI: Record<HoSoLoai, string[]> = {
  CHU_TRUONG: ['Thuyết minh đề tài.pdf', 'Dự toán PL1-PL6.xlsx'],
  XET_DUYET: ['Hồ sơ xét duyệt.pdf', 'Dự toán PL1-PL6.xlsx', 'Biên bản họp HĐXD.pdf'],
  BAO_CAO: ['Báo cáo định kỳ.pdf', 'Phụ lục tiến độ.xlsx'],
  DIEU_CHINH: ['Tờ trình điều chỉnh.pdf', 'Căn cứ điều chỉnh.pdf', 'Phụ lục dự toán/thời gian.xlsx'],
  NGHIEM_THU: ['Báo cáo tổng kết.pdf', 'Sản phẩm và kết quả.zip', 'Biên bản nghiệm thu.pdf'],
  QUYET_TOAN: ['Báo cáo quyết toán.pdf', 'Bảng tổng hợp chi phí.xlsx', 'Chứng từ kèm theo.zip'],
};

@Component({
  selector: 'app-ho-so-create',
  imports: [
    FormsModule, ReactiveFormsModule, NzAlertModule, NzButtonModule, NzCardModule, NzCheckboxModule,
    NzDatePickerModule, NzDescriptionsModule, NzEmptyModule, NzFormModule, NzGridModule, NzIconModule,
    NzInputModule, NzSelectModule, NzSpinModule, NzTableModule, NzTagModule,
  ],
  templateUrl: './ho-so-create.html',
  styleUrl: './ho-so-create.scss',
})
export class HoSoCreatePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly hoSoService = inject(HoSoService);
  private readonly nhiemVuService = inject(NhiemVuService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly loaiOptions = LOAI_OPTIONS;
  readonly loaiGroup = LOAI_TO_GROUP;
  readonly loaiLabel = HO_SO_LOAI_LABEL;
  readonly statusLabel = DOSSIER_STATUS_LABEL;
  readonly capLabel = NHIEM_VU_CAP_LABEL;
  readonly stageLabel = NHIEM_VU_GIAI_DOAN_LABEL;
  readonly stageColor = NHIEM_VU_GIAI_DOAN_COLOR;
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly nhiemVuList = signal<NhiemVuResponse[]>([]);
  readonly dossiers = signal<HoSoResponse[]>([]);
  readonly selectedMaNV = signal('');
  readonly selectedLoai = signal<HoSoLoai | null>(null);
  readonly selectedDocuments = signal(new Set<string>());

  readonly form = this.formBuilder.group({
    maNV: ['', Validators.required],
    loai: this.formBuilder.control<HoSoLoai | null>(null, Validators.required),
    ngayTao: this.formBuilder.control<Date | null>(new Date(), Validators.required),
    nguoiKhoiTao: ['', [Validators.required, Validators.maxLength(255)]],
  });

  readonly selectedNhiemVu = computed(() =>
    this.nhiemVuList().find((item) => item.ma === this.selectedMaNV()) ?? null,
  );
  readonly availableDocuments = computed(() => {
    const loai = this.selectedLoai();
    return loai ? DOCUMENTS_BY_LOAI[loai] : [];
  });
  readonly history = computed(() =>
    this.dossiers().filter((item) => item.maNV === this.selectedMaNV()),
  );
  readonly processGroup = computed(() => this.selectedLoai() ? LOAI_TO_GROUP[this.selectedLoai()!] : null);
  readonly warnings = computed(() => {
    const nv = this.selectedNhiemVu();
    const loai = this.selectedLoai();
    if (!nv || !loai) return [];
    const targetStage = LOAI_TO_STAGE[loai];
    const currentIndex = NHIEM_VU_GIAI_DOAN_ORDER.indexOf(nv.giaiDoan);
    const targetIndex = NHIEM_VU_GIAI_DOAN_ORDER.indexOf(targetStage);
    const warnings: string[] = [];
    if (loai === 'CHU_TRUONG') {
      warnings.push('Hồ sơ Chủ trương thường được sinh cùng lúc tạo mới Nhiệm vụ KHCN.');
    }
    if (targetIndex > currentIndex) {
      warnings.push(`Loại hồ sơ thuộc giai đoạn ${this.stageLabel[targetStage]}, sau giai đoạn hiện tại của nhiệm vụ.`);
    } else if (targetIndex < currentIndex) {
      warnings.push(`Loại hồ sơ thuộc giai đoạn ${this.stageLabel[targetStage]}, trước giai đoạn hiện tại của nhiệm vụ.`);
    }
    return warnings;
  });

  constructor() {
    this.form.controls.maNV.valueChanges.subscribe((maNV) => {
      this.selectedMaNV.set(maNV ?? '');
      const nv = this.nhiemVuList().find((item) => item.ma === maNV);
      if (nv && !this.form.controls.nguoiKhoiTao.value?.trim()) {
        this.form.controls.nguoiKhoiTao.setValue(nv.chuNhiem);
      }
    });
    this.form.controls.loai.valueChanges.subscribe((loai) => {
      this.selectedLoai.set(loai);
      this.selectedDocuments.set(new Set(loai ? DOCUMENTS_BY_LOAI[loai] : []));
    });
    this.load();
  }

  toggleDocument(name: string, checked: boolean): void {
    this.selectedDocuments.update((current) => {
      const next = new Set(current);
      checked ? next.add(name) : next.delete(name);
      return next;
    });
  }

  cancel(): void {
    void this.router.navigate(['/ho-so']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const date = value.ngayTao!;
    const payload: CreateHoSoRequest = {
      maNV: value.maNV!,
      loai: value.loai!,
      nguoiKhoiTao: value.nguoiKhoiTao!.trim(),
      ngayTao: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      taiLieu: [...this.selectedDocuments()].map((ten) => ({ ten, loai: this.documentType(ten) })),
    };
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.hoSoService.create(payload).subscribe({
      next: (created) => {
        this.message.success(`Đã tạo hồ sơ ${created.id} ở trạng thái Khởi tạo.`);
        void this.router.navigate(['/ho-so'], { queryParams: { id: created.id } });
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message || `Không thể tạo hồ sơ (HTTP ${error.status}).`);
        this.submitting.set(false);
      },
    });
  }

  private load(): void {
    forkJoin({ nhiemVu: this.nhiemVuService.list(), dossiers: this.hoSoService.list() }).subscribe({
      next: ({ nhiemVu, dossiers }) => {
        this.nhiemVuList.set(nhiemVu);
        this.dossiers.set(dossiers);
        const requestedMa = this.route.snapshot.queryParamMap.get('maNV');
        if (requestedMa && nhiemVu.some((item) => item.ma === requestedMa)) {
          this.form.controls.maNV.setValue(requestedMa);
        }
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(`Không thể tải dữ liệu khởi tạo hồ sơ (HTTP ${error.status}).`);
        this.loading.set(false);
      },
    });
  }

  private documentType(name: string): CreateHoSoDocument['loai'] {
    const extension = name.split('.').pop()?.toLowerCase();
    if (extension === 'xlsx' || extension === 'xls') return 'Excel';
    if (extension === 'zip' || extension === 'rar') return 'Archive';
    return 'PDF';
  }
}
