import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import { OrganizationRequest, OrganizationResponse } from '../../core/models/identity';
import { OrganizationService } from '../../core/services/organization.service';

/** Phân hệ 2 (D22) — CRUD đơn vị/phòng ban thật qua `services/identity-service`. Bảng phẳng: MVP đợt
 * này, không hiển thị dạng cây `nz-tree` (nâng cấp hiển thị nếu cần sau). */
@Component({
  selector: 'app-org-management',
  imports: [
    FormsModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
  ],
  templateUrl: './org-management.html',
  styleUrl: './org-management.scss',
})
export class OrgManagementPage implements OnInit {
  private readonly orgs = inject(OrganizationService);
  private readonly message = inject(NzMessageService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly list = signal<OrganizationResponse[]>([]);

  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly editing = signal<OrganizationResponse | null>(null);
  readonly formCode = signal('');
  readonly formName = signal('');
  readonly formParentId = signal<string | null>(null);
  readonly formActive = signal(true);

  /** Không cho chọn chính nó (hoặc để trống nếu chưa có đơn vị nào khác) làm đơn vị cha. */
  readonly parentOptions = computed(() => {
    const current = this.editing();
    return this.list().filter((o) => o.id !== current?.id);
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.orgs.list().subscribe({
      next: (list) => {
        this.list.set(list);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.status === 0
            ? `Không kết nối được identity-service (${BACKEND_CONNECTION_LABEL}).`
            : `Lỗi tải danh sách đơn vị (HTTP ${error.status}).`,
        );
      },
    });
  }

  parentName(parentId: string | null): string {
    if (!parentId) return '—';
    return this.list().find((o) => o.id === parentId)?.name ?? '—';
  }

  openCreate(): void {
    this.editing.set(null);
    this.formCode.set('');
    this.formName.set('');
    this.formParentId.set(null);
    this.formActive.set(true);
    this.modalOpen.set(true);
  }

  openEdit(org: OrganizationResponse): void {
    this.editing.set(org);
    this.formCode.set(org.code);
    this.formName.set(org.name);
    this.formParentId.set(org.parentId);
    this.formActive.set(org.active);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.saving()) this.modalOpen.set(false);
  }

  submit(): void {
    const code = this.formCode().trim();
    const name = this.formName().trim();
    if (!code || !name) {
      this.message.error('Nhập đủ mã và tên đơn vị.');
      return;
    }
    const request: OrganizationRequest = {
      code,
      name,
      parentId: this.formParentId(),
      active: this.formActive(),
    };
    this.saving.set(true);
    const editing = this.editing();
    const request$ = editing ? this.orgs.update(editing.id, request) : this.orgs.create(request);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.message.success(editing ? `Đã cập nhật đơn vị "${name}".` : `Đã tạo đơn vị "${name}".`);
        this.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.error(this.apiErrorMessage(error, 'Lưu đơn vị thất bại'));
      },
    });
  }

  remove(org: OrganizationResponse): void {
    this.orgs.delete(org.id).subscribe({
      next: () => {
        this.message.success(`Đã xoá đơn vị "${org.name}".`);
        this.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.message.error(this.apiErrorMessage(error, 'Xoá đơn vị thất bại'));
      },
    });
  }

  private apiErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as { message?: string } | null;
    return body?.message || `${fallback} (HTTP ${error.status}).`;
  }
}
