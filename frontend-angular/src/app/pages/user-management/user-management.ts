import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import {
  AppResponse,
  AssignmentResponse,
  BulkAssignmentRequest,
  DataScopeResponse,
  RoleResponse,
  UserRequest,
  UserResponse,
} from '../../core/models/identity';
import { AppCatalogService } from '../../core/services/app.service';
import { DataScopeService } from '../../core/services/data-scope.service';
import { OrganizationService } from '../../core/services/organization.service';
import { RoleService } from '../../core/services/role.service';
import { UserService } from '../../core/services/user.service';

/** Phân hệ 2 (D22) — CRUD người dùng + gán vai trò thật qua `services/identity-service`. */
@Component({
  selector: 'app-user-management',
  imports: [
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzDrawerModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTabsModule,
    NzTagModule,
    NzTooltipModule,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagementPage implements OnInit {
  private readonly users = inject(UserService);
  private readonly orgService = inject(OrganizationService);
  private readonly roleService = inject(RoleService);
  private readonly dataScopeService = inject(DataScopeService);
  private readonly appCatalogService = inject(AppCatalogService);
  private readonly message = inject(NzMessageService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly list = signal<UserResponse[]>([]);
  readonly orgs = signal<{ id: string; name: string }[]>([]);
  readonly roles = signal<RoleResponse[]>([]);
  readonly dataScopes = signal<DataScopeResponse[]>([]);
  readonly appCatalog = signal<AppResponse[]>([]);
  /** Assignment của mọi user (1 request) — nguồn cho cột "Vai trò" ở bảng ngoài. */
  readonly allAssignments = signal<AssignmentResponse[]>([]);

  readonly statusOptions = ['ACTIVE', 'INACTIVE'];

  /** userId -> danh sách mã vai trò, để render tag không phải quét lại mảng mỗi ô. */
  readonly roleCodesByUser = computed(() => {
    const map = new Map<string, string[]>();
    for (const a of this.allAssignments()) {
      const codes = map.get(a.userId) ?? [];
      if (!codes.includes(a.roleCode)) codes.push(a.roleCode);
      map.set(a.userId, codes);
    }
    for (const codes of map.values()) codes.sort();
    return map;
  });

  readonly usersWithoutRole = computed(
    () => this.list().filter((u) => (this.roleCodesByUser().get(u.id) ?? []).length === 0).length,
  );

  // --- CRUD user ---
  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly editing = signal<UserResponse | null>(null);
  readonly formEmail = signal('');
  readonly formEmployeeCode = signal('');
  readonly formFullName = signal('');
  readonly formJobTitle = signal('');
  readonly formOrganizationId = signal<string | null>(null);
  readonly formStatus = signal('ACTIVE');
  readonly formAdministrator = signal(false);

  // --- Drawer phân quyền ---
  readonly assignDrawerOpen = signal(false);
  readonly assignDrawerTabIndex = signal(0);
  readonly assignTarget = signal<UserResponse | null>(null);
  readonly assignments = signal<AssignmentResponse[]>([]);
  readonly assignmentsLoading = signal(false);
  /** Gán nhiều vai trò 1 lượt — trước đây là 1 mã/lần nên gán 4 vai trò là 4 lần bấm. */
  readonly newRoleCodes = signal<string[]>([]);
  readonly newDataScope = signal<string | null>(null);
  readonly newOrganizationId = signal<string | null>(null);
  readonly newEffectiveFrom = signal<Date | null>(null);
  readonly newEffectiveTo = signal<Date | null>(null);
  readonly assigning = signal(false);

  // --- Drawer Ứng dụng (D19 — danh mục qlnvkhcn/quytrinh/he-thong từ identity-service) ---
  readonly userAppCodes = signal<Set<string>>(new Set());
  readonly userAppsLoading = signal(false);
  readonly userAppsSaving = signal(false);

  readonly canAssign = computed(() => this.newRoleCodes().length > 0 && !!this.newDataScope());

  /** Vai trò user đã có bị loại khỏi ô chọn — gán lại sẽ bị backend bỏ qua, hiện ra chỉ gây nhầm. */
  readonly assignableRoles = computed(() => {
    const owned = new Set(this.assignments().map((a) => a.roleCode));
    return this.roles().filter((r) => !owned.has(r.code));
  });

  ngOnInit(): void {
    this.reload();
    this.reloadAllAssignments();
    this.orgService.list().subscribe({ next: (list) => this.orgs.set(list) });
    this.roleService.list().subscribe({ next: (list) => this.roles.set(list) });
    this.dataScopeService.list().subscribe({ next: (list) => this.dataScopes.set(list) });
    this.appCatalogService.list().subscribe({ next: (list) => this.appCatalog.set(list) });
  }

  /** Không chặn UI: lỗi ở đây chỉ làm cột "Vai trò" trống, bảng người dùng vẫn dùng được. */
  private reloadAllAssignments(): void {
    this.users.allAssignments().subscribe({
      next: (list) => this.allAssignments.set(list),
      error: () => this.allAssignments.set([]),
    });
  }

  roleCodesOf(userId: string): string[] {
    return this.roleCodesByUser().get(userId) ?? [];
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.users.list().subscribe({
      next: (list) => {
        this.list.set(list);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.status === 0
            ? `Không kết nối được identity-service (${BACKEND_CONNECTION_LABEL}).`
            : `Lỗi tải danh sách người dùng (HTTP ${error.status}).`,
        );
      },
    });
  }

  orgName(id: string | null): string {
    if (!id) return '—';
    return this.orgs().find((o) => o.id === id)?.name ?? '—';
  }

  openCreate(): void {
    this.editing.set(null);
    this.formEmail.set('');
    this.formEmployeeCode.set('');
    this.formFullName.set('');
    this.formJobTitle.set('');
    this.formOrganizationId.set(null);
    this.formStatus.set('ACTIVE');
    this.formAdministrator.set(false);
    this.modalOpen.set(true);
  }

  openEdit(user: UserResponse): void {
    this.editing.set(user);
    this.formEmail.set(user.email);
    this.formEmployeeCode.set(user.employeeCode ?? '');
    this.formFullName.set(user.fullName);
    this.formJobTitle.set(user.jobTitle ?? '');
    this.formOrganizationId.set(user.organizationId);
    this.formStatus.set(user.status);
    this.formAdministrator.set(user.administrator);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.saving()) this.modalOpen.set(false);
  }

  submit(): void {
    const email = this.formEmail().trim();
    const fullName = this.formFullName().trim();
    if (!email || !fullName) {
      this.message.error('Nhập đủ email và họ tên.');
      return;
    }
    const request: UserRequest = {
      email,
      employeeCode: this.formEmployeeCode().trim() || null,
      fullName,
      jobTitle: this.formJobTitle().trim() || null,
      organizationId: this.formOrganizationId(),
      status: this.formStatus(),
      administrator: this.formAdministrator(),
    };
    this.saving.set(true);
    const editing = this.editing();
    const request$ = editing ? this.users.update(editing.id, request) : this.users.create(request);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.message.success(editing ? `Đã cập nhật người dùng "${fullName}".` : `Đã tạo người dùng "${fullName}".`);
        this.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.error(this.apiErrorMessage(error, 'Lưu người dùng thất bại'));
      },
    });
  }

  remove(user: UserResponse): void {
    this.users.delete(user.id).subscribe({
      next: () => {
        this.message.success(`Đã xoá người dùng "${user.fullName}".`);
        this.reload();
        this.reloadAllAssignments(); // xoá user cascade cả assignment — cột "Vai trò" phải theo.
      },
      error: (error: HttpErrorResponse) => {
        this.message.error(this.apiErrorMessage(error, 'Xoá người dùng thất bại'));
      },
    });
  }

  openAssignments(user: UserResponse): void {
    this.assignTarget.set(user);
    this.assignDrawerOpen.set(true);
    this.assignDrawerTabIndex.set(0);
    this.resetAssignForm();
    this.reloadAssignments(user.id);
    this.reloadUserApps(user.id);
  }

  closeAssignments(): void {
    this.assignDrawerOpen.set(false);
  }

  private reloadAssignments(userId: string): void {
    this.assignmentsLoading.set(true);
    this.users.assignments(userId).subscribe({
      next: (list) => {
        this.assignments.set(list);
        this.assignmentsLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.assignmentsLoading.set(false);
        this.message.error(this.apiErrorMessage(error, 'Không tải được danh sách phân quyền'));
      },
    });
  }

  private resetAssignForm(): void {
    this.newRoleCodes.set([]);
    // Phạm vi dữ liệu preselect theo rank thấp nhất (hẹp nhất) đang active: bắt buộc phải có
    // giá trị nên để trống chỉ làm nút "Gán vai trò" bị disable mà không nói vì sao, và mặc
    // định hẹp là hướng an toàn khi người gán không nghĩ tới trường này.
    const narrowest = [...this.dataScopes()].sort((a, b) => a.rank - b.rank)[0];
    this.newDataScope.set(narrowest?.code ?? null);
    this.newOrganizationId.set(null);
    this.newEffectiveFrom.set(null);
    this.newEffectiveTo.set(null);
  }

  addAssignment(): void {
    const target = this.assignTarget();
    const roleCodes = this.newRoleCodes();
    const dataScope = this.newDataScope();
    if (!target || roleCodes.length === 0 || !dataScope) return;
    const request: BulkAssignmentRequest = {
      roleCodes,
      dataScope,
      organizationId: this.newOrganizationId(),
      effectiveFrom: toIsoDate(this.newEffectiveFrom()),
      effectiveTo: toIsoDate(this.newEffectiveTo()),
    };
    this.assigning.set(true);
    this.users.assignBulk(target.id, request).subscribe({
      next: (created) => {
        this.assigning.set(false);
        if (created.length === 0) {
          this.message.info('Các vai trò đã chọn đều đã được gán với cùng phạm vi — không tạo thêm.');
        } else {
          this.message.success(`Đã gán ${created.length} vai trò: ${created.map((a) => a.roleCode).join(', ')}.`);
        }
        this.resetAssignForm();
        this.reloadAssignments(target.id);
        this.reloadAllAssignments();
      },
      error: (error: HttpErrorResponse) => {
        this.assigning.set(false);
        this.message.error(this.apiErrorMessage(error, 'Gán vai trò thất bại'));
      },
    });
  }

  revokeAssignment(assignment: AssignmentResponse): void {
    const target = this.assignTarget();
    if (!target) return;
    this.users.revoke(target.id, assignment.id).subscribe({
      next: () => {
        this.message.success(`Đã thu hồi vai trò ${assignment.roleCode}.`);
        this.reloadAssignments(target.id);
        this.reloadAllAssignments();
      },
      error: (error: HttpErrorResponse) => {
        this.message.error(this.apiErrorMessage(error, 'Thu hồi vai trò thất bại'));
      },
    });
  }

  private reloadUserApps(userId: string): void {
    this.userAppsLoading.set(true);
    this.users.apps(userId).subscribe({
      next: (response) => {
        this.userAppCodes.set(new Set(response.appCodes));
        this.userAppsLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.userAppsLoading.set(false);
        this.message.error(this.apiErrorMessage(error, 'Không tải được danh sách ứng dụng'));
      },
    });
  }

  isAppGranted(code: string): boolean {
    return this.userAppCodes().has(code);
  }

  toggleUserApp(code: string): void {
    const current = new Set(this.userAppCodes());
    if (current.has(code)) current.delete(code);
    else current.add(code);
    this.userAppCodes.set(current);
  }

  saveUserApps(): void {
    const target = this.assignTarget();
    if (!target) return;
    this.userAppsSaving.set(true);
    this.users.replaceApps(target.id, { appCodes: [...this.userAppCodes()] }).subscribe({
      next: (response) => {
        this.userAppCodes.set(new Set(response.appCodes));
        this.userAppsSaving.set(false);
        this.message.success(`Đã cập nhật ứng dụng cho "${target.fullName}".`);
      },
      error: (error: HttpErrorResponse) => {
        this.userAppsSaving.set(false);
        this.message.error(this.apiErrorMessage(error, 'Cập nhật ứng dụng thất bại'));
      },
    });
  }

  private apiErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as { message?: string } | null;
    return body?.message || `${fallback} (HTTP ${error.status}).`;
  }
}

function toIsoDate(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
