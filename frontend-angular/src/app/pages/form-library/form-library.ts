import { Component, OnInit, inject, signal } from '@angular/core';
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
import { EformService } from '../../core/services/eform.service';
import { FormRendererComponent } from '../../shared/form-renderer/form-renderer';

// Port của webapp/src/pages/FormLibrary.tsx — trang "Thư viện biểu mẫu" (PH3 Danh mục
// dùng chung, nav "Biểu mẫu", route /phan-he/PH3/bieu-mau). Dữ liệu được tải/lưu qua
// Spring Boot `/api/eform`; `EformService` giữ signal cache sau khi backend xác nhận.
//
// KHÔNG port cột/stat "Đang dùng": bản gốc tính từ mock `store/ProcessContext`
// (taskSteps + formKey), đã bị thay bằng backend BPMN thật ở Angular (không có
// nguồn dữ liệu tương đương để tính lại đúng — xem `core/services/eform.service.ts`).

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
  readonly countFields = countFields;
  readonly loading = signal(false);
  readonly creating = signal(false);

  readonly preview = signal<FormMeta | null>(null);
  readonly createOpen = signal(false);
  readonly formTen = signal('');
  readonly formKey = signal('');
  readonly formLoai = signal<FormMeta['loai'] | undefined>(undefined);
  readonly formMoTa = signal('');

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
    this.formMoTa.set('');
    this.createOpen.set(true);
  }

  submitCreate(): void {
    const ten = this.formTen().trim();
    if (!ten) {
      this.message.error('Nhập tên biểu mẫu.');
      return;
    }
    const key = slugifyFormKey(this.formKey() || ten);
    if (!key) {
      this.message.error('Mã biểu mẫu không hợp lệ.');
      return;
    }
    this.creating.set(true);
    this.forms.addForm({ key, ten, moTa: this.formMoTa(), loai: this.formLoai() }, this.actor()).subscribe({
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
