import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
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
  AuditLogResponse,
  FeatureResponse,
  MatrixEntryRequest,
  PermissionResponse,
  RoleMatrixCellRequest,
  RoleRequest,
  RoleResponse,
} from '../../core/models/identity';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AppCatalogService } from '../../core/services/app.service';
import { FeatureService } from '../../core/services/feature.service';
import { PermissionService } from '../../core/services/permission.service';
import { RoleMatrixService } from '../../core/services/role-matrix.service';
import { RoleService } from '../../core/services/role.service';

const ROLE_KIND_OPTIONS = ['SYSTEM', 'BUSINESS'];
const DEFAULT_MATRIX_APP = 'qlnvkhcn';

/**
 * Phân hệ 2 (D22) — CRUD vai trò + nhật ký thật qua `services/identity-service`.
 *
 * Tab "Ma trận phân quyền" ghim 1 Vai trò, liệt kê chức năng dạng lưới card (thay bảng cũ
 * ghim-Chức-năng/liệt-kê-Vai-trò) — xem `docs/plan/refactor-ma-tran-phan-quyen.md`. Catalog quyền
 * dùng chung (`permissions()`) tạm cố định 4 mục (Xem danh sách/Xem chi tiết/Thêm mới/Sửa, xem
 * migration V6 identity-service); BA sẽ định nghĩa quyền riêng theo từng chức năng sau.
 */
@Component({
  selector: 'app-role-permission',
  imports: [
    DatePipe,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
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
  templateUrl: './role-permission.html',
  styleUrl: './role-permission.scss',
})
export class RolePermissionPage implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly appCatalogService = inject(AppCatalogService);
  private readonly permissionService = inject(PermissionService);
  private readonly featureService = inject(FeatureService);
  private readonly roleMatrixService = inject(RoleMatrixService);
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
  readonly roleFormAppCode = signal('');
  readonly roleFormActive = signal(true);
  /** feature code -> set các permission code đã tick trong ma trận (modal Sửa vai trò). */
  readonly roleFormMatrix = signal<Record<string, Set<string>>>({});

  // --- Tính năng (ma trận role×feature×permission) ---
  readonly features = signal<FeatureResponse[]>([]);
  readonly featuresLoading = signal(false);
  readonly apps = signal<AppResponse[]>([]);
  readonly appsLoading = signal(false);

  // --- Quyền (catalog dùng chung cho lưới card + modal Sửa vai trò, không còn tab CRUD riêng) ---
  readonly permissions = signal<PermissionResponse[]>([]);
  readonly permissionsLoading = signal(false);
  readonly permissionsError = signal<string | null>(null);

  // --- Tab "Ma trận phân quyền": ghim 1 Vai trò, lưới card 1 Chức năng/thẻ ---
  readonly matrixAppCode = signal(DEFAULT_MATRIX_APP);
  readonly matrixRoleCode = signal('');
  readonly matrixFeatureQuery = signal('');
  /** Bản nháp đang sửa: featureCode -> tập permission trên `matrixRoleCode()`. */
  readonly matrixDraft = signal<Record<string, Set<string>>>({});
  /** featureCode -> trạng thái bật/tắt chức năng đó cho vai trò đang ghim. */
  readonly matrixEnabledDraft = signal<Record<string, boolean>>({});
  readonly matrixDirtyFeatures = signal<Set<string>>(new Set());
  readonly matrixSaving = signal(false);
  /** Chức năng đang mở drawer "Sửa" (null = đóng). */
  readonly matrixDetailFeatureCode = signal<string | null>(null);

  readonly matrixApp = computed(() => this.apps().find((app) => app.code === this.matrixAppCode()) ?? null);
  readonly matrixRole = computed(() => this.roles().find((r) => r.code === this.matrixRoleCode()) ?? null);
  readonly matrixRoleOptions = computed(() => this.roles().filter((r) => r.appCode === this.matrixAppCode()));
  readonly matrixFeatures = computed(() => this.features().filter((feature) => feature.appCode === this.matrixAppCode()));
  readonly filteredMatrixFeatures = computed(() => {
    const query = this.matrixFeatureQuery().trim().toLowerCase();
    const list = this.matrixFeatures();
    if (!query) return list;
    return list.filter((f) => f.code.toLowerCase().includes(query) || f.name.toLowerCase().includes(query));
  });
  readonly matrixDetailFeature = computed(() => this.features().find((f) => f.code === this.matrixDetailFeatureCode()) ?? null);
  /** Quyền đã tick cho chức năng đang mở drawer — tách riêng để template dùng `@empty` đúng nghĩa. */
  readonly matrixDetailGrantedPermissions = computed(() => {
    const featureCode = this.matrixDetailFeatureCode();
    if (!featureCode) return [];
    const codes = this.matrixDraft()[featureCode] ?? new Set<string>();
    return this.permissions().filter((p) => codes.has(p.code));
  });
  readonly roleFormFeatures = computed(() => this.features().filter((feature) => feature.appCode === this.roleFormAppCode()));
  readonly matrixDirtyCount = computed(() => this.matrixDirtyFeatures().size);

  // --- Nhật ký ---
  readonly auditLog = signal<AuditLogResponse[]>([]);
  readonly auditLogLoading = signal(false);
  readonly auditLogError = signal<string | null>(null);
  readonly auditLogLoaded = signal(false);

  ngOnInit(): void {
    this.reloadRoles();
    this.reloadPermissions();
    this.reloadApps();
    this.reloadFeatures();
  }

  reloadApps(): void {
    this.appsLoading.set(true);
    this.appCatalogService.list().subscribe({
      next: (list) => {
        this.apps.set(list.filter((app) => app.active));
        this.appsLoading.set(false);
        if (!list.some((app) => app.code === this.matrixAppCode() && app.active)) {
          const fallback = list.find((app) => app.active);
          if (fallback) this.matrixAppCode.set(fallback.code);
        }
        this.selectDefaultRoleForCurrentApp();
      },
      error: () => this.appsLoading.set(false),
    });
  }

  reloadFeatures(): void {
    this.featuresLoading.set(true);
    this.featureService.list().subscribe({
      next: (list) => {
        this.features.set(list);
        this.featuresLoading.set(false);
        this.resetMatrixDraft();
      },
      error: () => this.featuresLoading.set(false),
    });
  }

  onTabChange(index: number): void {
    this.activeTabIndex.set(index);
    if (index === 2 && !this.auditLogLoaded()) this.reloadAuditLog();
  }

  appName(appCode: string): string {
    return this.apps().find((app) => app.code === appCode)?.name ?? appCode;
  }

  // ---------- Vai trò ----------

  reloadRoles(): void {
    this.rolesLoading.set(true);
    this.rolesError.set(null);
    this.roleService.list().subscribe({
      next: (list) => {
        this.roles.set(list);
        this.rolesLoading.set(false);
        const selected = list.find((r) => r.code === this.matrixRoleCode());
        if (!selected || selected.appCode !== this.matrixAppCode()) this.selectDefaultRoleForCurrentApp();
        else this.resetMatrixDraft();
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
    this.roleFormAppCode.set(this.matrixAppCode());
    this.roleFormActive.set(true);
    this.roleFormMatrix.set({});
    this.roleModalOpen.set(true);
  }

  openEditRole(role: RoleResponse): void {
    this.editingRole.set(role);
    this.roleFormCode.set(role.code);
    this.roleFormName.set(role.name);
    this.roleFormKind.set(role.kind);
    this.roleFormAppCode.set(role.appCode);
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

  onRoleFormAppChange(appCode: string): void {
    this.roleFormAppCode.set(appCode ?? '');
    this.roleFormMatrix.set({});
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
    const appCode = this.roleFormAppCode();
    if (!code || !name || !appCode) {
      this.message.error('Nhập đủ ứng dụng, mã và tên vai trò.');
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
      appCode,
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

  // ---------- Ma trận phân quyền (ghim Vai trò, lưới card theo Chức năng) ----------
  //
  // Lưới dựng từ 3 signal đã tải sẵn (roles/features/permissions) — không thêm lượt gọi API nào
  // để mở tab. Sửa vào `matrixDraft`/`matrixEnabledDraft` (bản nháp) rồi mới lưu theo lô, nên tick
  // nhiều ô + đổi nhiều toggle chỉ sinh N request (N = số chức năng vừa sửa, gộp qua forkJoin).

  /** Nạp bản nháp từ `RoleResponse.matrix` cho vai trò đang chọn; bỏ mọi thay đổi chưa lưu. */
  private resetMatrixDraft(): void {
    const role = this.roles().find((r) => r.code === this.matrixRoleCode());
    const draft: Record<string, Set<string>> = {};
    const enabledDraft: Record<string, boolean> = {};
    for (const feature of this.matrixFeatures()) {
      const entry = role?.matrix.find((m) => m.featureCode === feature.code);
      draft[feature.code] = new Set(entry?.permissionCodes ?? []);
      enabledDraft[feature.code] = entry?.enabled ?? false;
    }
    this.matrixDraft.set(draft);
    this.matrixEnabledDraft.set(enabledDraft);
    this.matrixDirtyFeatures.set(new Set());
  }

  onMatrixRoleChange(roleCode: string): void {
    this.matrixRoleCode.set(roleCode ?? '');
    this.matrixFeatureQuery.set('');
    this.resetMatrixDraft();
  }

  onMatrixAppChange(appCode: string): void {
    this.matrixAppCode.set(appCode);
    this.matrixFeatureQuery.set('');
    this.selectDefaultRoleForCurrentApp();
  }

  private selectDefaultRoleForCurrentApp(): void {
    const currentApp = this.matrixAppCode();
    const current = this.roles().find((r) => r.code === this.matrixRoleCode());
    if (current?.appCode === currentApp) return;
    const fallback = this.roles().find((r) => r.appCode === currentApp);
    this.matrixRoleCode.set(fallback?.code ?? '');
    this.resetMatrixDraft();
  }

  discardMatrixChanges(): void {
    this.resetMatrixDraft();
  }

  isMatrixCellChecked(featureCode: string, permissionCode: string): boolean {
    return this.matrixDraft()[featureCode]?.has(permissionCode) ?? false;
  }

  isFeatureEnabled(featureCode: string): boolean {
    return this.matrixEnabledDraft()[featureCode] ?? false;
  }

  isFeatureDirty(featureCode: string): boolean {
    return this.matrixDirtyFeatures().has(featureCode);
  }

  matrixFeaturePermissionCount(featureCode: string): number {
    return this.matrixDraft()[featureCode]?.size ?? 0;
  }

  private markDirty(featureCodes: string[]): void {
    const next = new Set(this.matrixDirtyFeatures());
    for (const code of featureCodes) next.add(code);
    this.matrixDirtyFeatures.set(next);
  }

  /** Tên khác `toggleMatrixCell` (ma trận trong modal vai trò) — hai lưới, hai bản nháp riêng. */
  toggleMatrixGridCell(featureCode: string, permissionCode: string): void {
    const draft = { ...this.matrixDraft() };
    const codes = new Set(draft[featureCode] ?? []);
    if (codes.has(permissionCode)) codes.delete(permissionCode);
    else codes.add(permissionCode);
    draft[featureCode] = codes;
    this.matrixDraft.set(draft);
    this.markDirty([featureCode]);
  }

  toggleFeatureEnabled(featureCode: string, checked: boolean): void {
    this.matrixEnabledDraft.set({ ...this.matrixEnabledDraft(), [featureCode]: checked });
    this.markDirty([featureCode]);
  }

  openMatrixDetail(featureCode: string): void {
    this.matrixDetailFeatureCode.set(featureCode);
  }

  closeMatrixDetail(): void {
    this.matrixDetailFeatureCode.set(null);
  }

  saveMatrix(): void {
    const dirty = [...this.matrixDirtyFeatures()];
    if (dirty.length === 0) return;
    const roleCode = this.matrixRoleCode();
    const draft = this.matrixDraft();
    const enabledDraft = this.matrixEnabledDraft();
    this.matrixSaving.set(true);
    const requests = dirty.map((featureCode) =>
      this.roleMatrixService.replaceFeature(featureCode, {
        roles: [
          {
            roleCode,
            permissionCodes: [...(draft[featureCode] ?? [])],
            enabled: enabledDraft[featureCode] ?? false,
          },
        ],
      }),
    );
    forkJoin(requests).subscribe({
      next: () => {
        this.matrixSaving.set(false);
        this.message.success(`Đã lưu ${dirty.length} chức năng cho vai trò "${roleCode}".`);
        // Nạp lại từ server rồi dựng lại nháp — `reloadRoles()` là bất đồng bộ nên phải reset
        // trong callback, không thì nháp bị dựng từ dữ liệu cũ và cờ dirty sai.
        this.rolesLoading.set(true);
        this.roleService.list().subscribe({
          next: (list) => {
            this.roles.set(list);
            this.rolesLoading.set(false);
            this.resetMatrixDraft();
          },
          error: (error: HttpErrorResponse) => {
            this.rolesLoading.set(false);
            this.rolesError.set(this.connectionOrHttpError(error, 'Lỗi tải danh sách vai trò'));
          },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.matrixSaving.set(false);
        this.message.error(this.apiErrorMessage(error, 'Lưu ma trận thất bại'));
      },
    });
  }

  // ---------- Quyền (chỉ đọc, dùng cho lưới card + modal Sửa vai trò) ----------

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
