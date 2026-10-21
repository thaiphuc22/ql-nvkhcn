import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { AuthService } from '../../core/auth/auth.service';
import { countFields, slugifyFormKey, type FormMeta } from '../../core/models/eform';
import { NHOM_RD, NHOM_RD_PILL_COLOR, nhomRDSorted, nhomRDLabel, type NhomRD } from '../../core/models/eform-nhom-rd';
import { EformService } from '../../core/services/eform.service';
import { FormRendererComponent } from '../../shared/form-renderer/form-renderer';

// Port của webapp/src/pages/FormLibrary.tsx — trang "Thư viện biểu mẫu" (PH3 Danh mục
// dùng chung, nav "Biểu mẫu", route /phan-he/PH3/bieu-mau). Dữ liệu được tải/lưu qua
// Spring Boot `/api/eform`; `EformService` giữ signal cache sau khi backend xác nhận.
//
// KHÔNG port cột/stat "Đang dùng": bản gốc tính từ mock `store/ProcessContext`
// (taskSteps + formKey), đã bị thay bằng backend BPMN thật ở Angular (không có
// nguồn dữ liệu tương đương để tính lại đúng — xem `core/services/eform.service.ts`).
//
// Bổ sung 2026-08-05: bộ lọc "Nhóm RD" (RD01..RD10) + banner cảnh báo khi danh
// sách đến từ seed client-side (xem `.harness/state/...` 2026-08-05).

const ROUTE_BASE = '/phan-he/PH3/bieu-mau';

const LOAI_OPTIONS: NonNullable<FormMeta['loai']>[] = ['Soạn thảo', 'Góp ý', 'Nhận xét', 'Thẩm định', 'Phê duyệt'];

@Component({
  selector: 'app-form-library',
  standalone: true,
  imports: [
    FormsModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    NzTooltipModule,
    FormRendererComponent,
  ],
  templateUrl: './form-library.html',
  styleUrl: './form-library.scss',
})
export class FormLibraryPage implements OnInit {
  private readonly forms = inject(EformService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly auth = inject(AuthService);

  readonly list = this.forms.list;
  readonly loaiOptions = LOAI_OPTIONS;
  readonly nhomRDOptions = nhomRDSorted();
  readonly nhomRDLabelMap = NHOM_RD;
  readonly nhomRDColorMap = NHOM_RD_PILL_COLOR;
  readonly nhomRDLabel = nhomRDLabel;
  readonly countFields = countFields;
  readonly loading = signal(false);
  readonly creating = signal(false);

  readonly searchQuery = signal('');
  readonly typeFilter = signal<string | null>(null);
  readonly nhomRDFilter = signal<NhomRD | null>(null);

  readonly filteredList = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const type = this.typeFilter();
    const nhom = this.nhomRDFilter();
    let result = this.list();

    if (q) {
      result = result.filter(
        (f) =>
          f.ten.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          (f.moTa && f.moTa.toLowerCase().includes(q))
      );
    }

    if (type) {
      result = result.filter((f) => f.loai === type);
    }

    if (nhom) {
      result = result.filter((f) => f.nhomRD === nhom);
    }

    return result;
  });

  /** Đếm biểu mẫu theo từng Nhóm RD — dùng hiển thị badge "(N)" trên option
   * dropdown để user thấy ngay nhóm nào có dữ liệu, nhóm nào rỗng. */
  readonly nhomRDCounts = computed<Record<NhomRD, number>>(() => {
    const counts = {} as Record<NhomRD, number>;
    for (const code of this.nhomRDOptions) counts[code] = 0;
    for (const f of this.list()) {
      if (!f.nhomRD) continue; // không gắn nhóm → bỏ qua, không đếm
      counts[f.nhomRD] = (counts[f.nhomRD] ?? 0) + 1;
    }
    return counts;
  });

  /** Truy vấn count cho một mã — dùng từ template (tránh NG8102 vì computed
   * trả về `Record<NhomRD, number>` đầy đủ nên không cần fallback `?? 0`). */
  nhomRDCount(code: NhomRD): number {
    return this.nhomRDCounts()[code];
  }

  /** Backend trả rỗng + fallback seed bật → danh sách đến từ seed client-side.
   * Hiển thị banner cảnh báo để user không nhầm dữ liệu mẫu là dữ liệu thật. */
  readonly showingSeedBanner = computed(() => {
    if (!this.forms.isSeedFallbackEnabled()) return false;
    if (this.loading()) return false;
    return this.list().length > 0 && this.list().every((f) =>
      f.key.startsWith('bm-07-')
    );
  });

  readonly preview = signal<FormMeta | null>(null);
  readonly createOpen = signal(false);
  readonly formTen = signal('');
  readonly formKey = signal('');
  readonly formLoai = signal<FormMeta['loai'] | undefined>(undefined);
  readonly formNhomRD = signal<NhomRD | null>(null);
  readonly formMoTa = signal('');

  /** Mã sẽ thực sự được gửi lên backend — tự sinh từ Tên khi ô Mã bỏ trống, hiển thị làm gợi ý
   * trực quan thay vì để người dùng đoán (trước đây ô "Mã" chỉ ghi chú "tự sinh" mà không cho xem
   * trước giá trị). */
  readonly formKeyPreview = computed(() => slugifyFormKey(this.formKey().trim() || this.formTen()));

  /** Chặn trùng mã ngay trên client bằng danh sách đã tải, thay vì luôn chờ backend trả 409 —
   * danh sách có thể lệch nếu form vừa được tạo ở tab khác, nên submitCreate() vẫn giữ nguyên xử lý
   * lỗi 409 làm lưới an toàn cuối cùng. */
  readonly keyTaken = computed(() => {
    const key = this.formKeyPreview();
    return !!key && this.list().some((f) => f.key === key);
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.forms.load().subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        this.loading.set(false);
        this.message.error(error?.error?.message ?? 'Không tải được thư viện biểu mẫu từ backend.');
      },
    });
  }

  openCreate(): void {
    this.formTen.set('');
    this.formKey.set('');
    this.formLoai.set(undefined);
    this.formNhomRD.set(null);
    this.formMoTa.set('');
    this.createOpen.set(true);
  }

  submitCreate(): void {
    const ten = this.formTen().trim();
    if (!ten) {
      this.message.error('Nhập tên biểu mẫu.');
      return;
    }
    const key = this.formKeyPreview();
    if (!key) {
      this.message.error('Mã biểu mẫu không hợp lệ.');
      return;
    }
    if (this.keyTaken()) {
      this.message.error(`Mã biểu mẫu "${key}" đã tồn tại — đổi tên hoặc nhập mã khác.`);
      return;
    }
    this.creating.set(true);
    this.forms.addForm({
      key,
      ten,
      moTa: this.formMoTa(),
      loai: this.formLoai(),
      nhomRD: this.formNhomRD() ?? undefined,
    }, this.actor()).subscribe({
      next: (created) => {
        this.creating.set(false);
        this.message.success(`Đã tạo biểu mẫu "${ten}".`);
        this.createOpen.set(false);
        // "Tạo & mở designer" đúng nghĩa: chuyển thẳng sang trang thiết kế cho form vừa tạo.
        this.router.navigate([ROUTE_BASE, created.key, 'thiet-ke']);
      },
      error: (error) => {
        this.creating.set(false);
        this.message.error(error?.error?.message ?? `Mã biểu mẫu "${key}" đã tồn tại hoặc không hợp lệ.`);
      },
    });
  }

  openDesigner(meta: FormMeta): void {
    this.router.navigate([ROUTE_BASE, meta.key, 'thiet-ke']);
  }

  removeForm(meta: FormMeta): void {
    this.forms.removeForm(meta).subscribe({
      next: () => this.message.success(`Đã xoá biểu mẫu "${meta.ten}".`),
      error: (error) => this.message.error(error?.error?.message ?? 'Không xoá được biểu mẫu.'),
    });
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Quản trị hệ thống';
  }
}
