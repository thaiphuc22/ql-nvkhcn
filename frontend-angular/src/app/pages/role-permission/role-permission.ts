import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
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
  AuditLogResponse,
  FeatureResponse,
  MatrixEntryRequest,
  PermissionRequest,
  PermissionResponse,
  RoleRequest,
  RoleResponse,
} from '../../core/models/identity';
import { AuditLogService } from '../../core/services/audit-log.service';
import { FeatureService } from '../../core/services/feature.service';
import { PermissionService } from '../../core/services/permission.service';
import { RoleService } from '../../core/services/role.service';

const ROLE_KIND_OPTIONS = ['SYSTEM', 'BUSINESS'];

/** Phân hệ 2 (D22) — CRUD vai trò + quyền + nhật ký thật qua `services/identity-service`. */
@Component({
  selector: 'app-role-permission',
  imports: [
    DatePipe,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
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
  templateUrl: './role-permission.html',
  styleUrl: './role-permission.scss',
})
export class RolePermissionPage implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly featureService = inject(FeatureService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly message = inject(NzMessageService);

  readonly roleKindOptions = ROLE_KIND_OPTIONS;
  readonly activeTabIndex = signal(0);

  // --- Vai trò ---
  readonly roles = signal<RoleResponse[]>([]);
  readonly rolesLoading = signal(false);
  readonly rolesError = signal<string | null>(null);
  readonly roleModalOpen = signal(false);
  readonly roleSaving = signal(false);
  readonly editingRole = signal<RoleResponse | null>(null);
  readonly roleFormCode = signal('');
  readonly roleFormName = signal('');
  readonly roleFormKind = signal('BUSINESS');
  readonly roleFormActive = signal(true);
  /** feature code -> set các permission code đã tick trong ma trận. */
  readonly roleFormMatrix = signal<Record<string, Set<string>>>({});

  // --- Tính năng (ma trận role×feature×permission) ---
  readonly features = signal<FeatureResponse[]>([]);
  readonly featuresLoading = signal(false);

  // --- Quyền ---
  readonly permissions = signal<PermissionResponse[]>([]);
  readonly permissionsLoading = signal(false);
  readonly permissionsError = signal<string | null>(null);
  readonly permissionModalOpen = signal(false);
  readonly permissionSaving = signal(false);
  readonly editingPermission = signal<PermissionResponse | null>(null);
  readonly permissionFormCode = signal('');
  readonly permissionFormName = signal('');
  readonly permissionFormDescription = signal('');
  readonly permissionFormActive = signal(true);

  // --- Nhật ký ---
  readonly auditLog = signal<AuditLogResponse[]>([]);
  readonly auditLogLoading = signal(false);
  readonly auditLogError = signal<string | null>(null);
  readonly auditLogLoaded = signal(false);

  ngOnInit(): void {
    this.reloadRoles();
    this.reloadPermissions();
    this.reloadFeatures();
  }

  reloadFeatures(): void {
    this.featuresLoading.set(true);
    this.featureService.list().subscribe({
      next: (list) => {
        this.features.set(list);
        this.featuresLoading.set(false);
      },
      error: () => this.featuresLoading.set(false),
    });
  }

  onTabChange(index: number): void {
    this.activeTabIndex.set(index);
    if (index === 2 && !this.auditLogLoaded()) this.reloadAuditLog();
  }

  // ---------- Vai trò ----------

  reloadRoles(): void {
    this.rolesLoading.set(true);
    this.rolesError.set(null);
    this.roleService.list().subscribe({
      next: (list) => {
        this.roles.set(list);
        this.rolesLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.rolesLoading.set(false);
        this.rolesError.set(this.connectionOrHttpError(error, 'Lỗi tải danh sách vai trò'));
      },
    });
  }

  openCreateRole(): void {
    this.editingRole.set(null);
    this.roleFormCode.set('');
    this.roleFormName.set('');
    this.roleFormKind.set('BUSINESS');
    this.roleFormActive.set(true);
    this.roleFormMatrix.set({});
    this.roleModalOpen.set(true);
  }

  openEditRole(role: RoleResponse): void {
    this.editingRole.set(role);
    this.roleFormCode.set(role.code);
    this.roleFormName.set(role.name);
    this.roleFormKind.set(role.kind);
    this.roleFormActive.set(role.active);
    const matrix: Record<string, Set<string>> = {};
    for (const entry of role.matrix) {
      const existing = matrix[entry.featureCode] ?? new Set<string>();
      for (const code of entry.permissionCodes) existing.add(code);
      matrix[entry.featureCode] = existing;
    }
    this.roleFormMatrix.set(matrix);
    this.roleModalOpen.set(true);
  }

  isMatrixChecked(featureCode: string, permissionCode: string): boolean {
    return this.roleFormMatrix()[featureCode]?.has(permissionCode) ?? false;
  }

  toggleMatrixCell(featureCode: string, permissionCode: string): void {
    const matrix = { ...this.roleFormMatrix() };
    const current = new Set(matrix[featureCode] ?? []);
    if (current.has(permissionCode)) current.delete(permissionCode);
    else current.add(permissionCode);
    matrix[featureCode] = current;
    this.roleFormMatrix.set(matrix);
  }

  matrixCheckedCount(featureCode: string): number {
    return this.roleFormMatrix()[featureCode]?.size ?? 0;
  }

  closeRoleModal(): void {
    if (!this.roleSaving()) this.roleModalOpen.set(false);
  }

  submitRole(): void {
    const code = this.roleFormCode().trim();
    const name = this.roleFormName().trim();
    if (!code || !name) {
      this.message.error('Nhập đủ mã và tên vai trò.');
      return;
    }
    const matrix: MatrixEntryRequest[] = Object.entries(this.roleFormMatrix())
      .filter(([, codes]) => codes.size > 0)
      .map(([featureCode, codes]) => ({ featureCode, permissionCodes: [...codes], enabled: true }));
    const flatCodes = [...new Set(matrix.flatMap((entry) => entry.permissionCodes))];
    const request: RoleRequest = {
      code,
      name,
      kind: this.roleFormKind(),
      active: this.roleFormActive(),
      permissionCodes: flatCodes,
      matrix,
    };
    this.roleSaving.set(true);
    const editing = this.editingRole();
    const request$ = editing ? this.roleService.update(editing.id, request) : this.roleService.create(request);
    request$.subscribe({
      next: () => {
        this.roleSaving.set(false);
        this.roleModalOpen.set(false);
        this.message.success(editing ? `Đã cập nhật vai trò "${code}".` : `Đã tạo vai trò "${code}".`);
        this.reloadRoles();
      },
      error: (error: HttpErrorResponse) => {
        this.roleSaving.set(false);
        this.message.error(this.apiErrorMessage(error, 'Lưu vai trò thất bại'));
      },
    });
  }

  removeRole(role: RoleResponse): void {
    this.roleService.delete(role.id).subscribe({
      next: () => {
        this.message.success(`Đã xoá vai trò "${role.code}".`);
        this.reloadRoles();
      },
      error: (error: HttpErrorResponse) => {
        this.message.error(this.apiErrorMessage(error, 'Xoá vai trò thất bại'));
      },
    });
  }

  // ---------- Quyền ----------

  reloadPermissions(): void {
    this.permissionsLoading.set(true);
    this.permissionsError.set(null);
    this.permissionService.list().subscribe({
      next: (list) => {
        this.permissions.set(list);
        this.permissionsLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.permissionsLoading.set(false);
        this.permissionsError.set(this.connectionOrHttpError(error, 'Lỗi tải danh sách quyền'));
      },
    });
  }

  openCreatePermission(): void {
    this.editingPermission.set(null);
    this.permissionFormCode.set('');
    this.permissionFormName.set('');
    this.permissionFormDescription.set('');
    this.permissionFormActive.set(true);
    this.permissionModalOpen.set(true);
  }

  openEditPermission(permission: PermissionResponse): void {
    this.editingPermission.set(permission);
    this.permissionFormCode.set(permission.code);
    this.permissionFormName.set(permission.name);
    this.permissionFormDescription.set(permission.description ?? '');
    this.permissionFormActive.set(permission.active);
    this.permissionModalOpen.set(true);
  }

  closePermissionModal(): void {
    if (!this.permissionSaving()) this.permissionModalOpen.set(false);
  }

  submitPermission(): void {
    const code = this.permissionFormCode().trim();
    const name = this.permissionFormName().trim();
    if (!code || !name) {
      this.message.error('Nhập đủ mã và tên quyền.');
      return;
    }
    const request: PermissionRequest = {
      code,
      name,
      description: this.permissionFormDescription().trim() || null,
      active: this.permissionFormActive(),
    };
    this.permissionSaving.set(true);
    const editing = this.editingPermission();
    const request$ = editing
      ? this.permissionService.update(editing.id, request)
      : this.permissionService.create(request);
    request$.subscribe({
      next: () => {
        this.permissionSaving.set(false);
        this.permissionModalOpen.set(false);
        this.message.success(editing ? `Đã cập nhật quyền "${code}".` : `Đã tạo quyền "${code}".`);
        this.reloadPermissions();
      },
      error: (error: HttpErrorResponse) => {
        this.permissionSaving.set(false);
        this.message.error(this.apiErrorMessage(error, 'Lưu quyền thất bại'));
      },
    });
  }

  removePermission(permission: PermissionResponse): void {
    this.permissionService.delete(permission.id).subscribe({
      next: () => {
        this.message.success(`Đã xoá quyền "${permission.code}".`);
        this.reloadPermissions();
      },
      error: (error: HttpErrorResponse) => {
        this.message.error(this.apiErrorMessage(error, 'Xoá quyền thất bại'));
      },
    });
  }

  // ---------- Nhật ký ----------

  reloadAuditLog(): void {
    this.auditLogLoading.set(true);
    this.auditLogError.set(null);
    this.auditLogService.list().subscribe({
      next: (list) => {
        this.auditLog.set(list);
        this.auditLogLoading.set(false);
        this.auditLogLoaded.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.auditLogLoading.set(false);
        this.auditLogError.set(this.connectionOrHttpError(error, 'Lỗi tải nhật ký'));
      },
    });
  }

  private connectionOrHttpError(error: HttpErrorResponse, fallback: string): string {
    return error.status === 0
      ? `Không kết nối được identity-service (${BACKEND_CONNECTION_LABEL}).`
      : `${fallback} (HTTP ${error.status}).`;
  }

  private apiErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as { message?: string } | null;
    return body?.message || `${fallback} (HTTP ${error.status}).`;
  }
}
