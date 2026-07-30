import { Injectable, inject, signal } from '@angular/core';
import { DEMO_PASSWORD, DemoUser, findDemoUser } from './demo-users';
import { ALL_APP_CODES, AppCode } from './app-registry';
import { UserService } from '../services/user.service';

const STORAGE_KEY = 'qtkhcn.auth.email';
const ACTIVE_APP_STORAGE_KEY = 'qtkhcn.auth.active-app';

export interface LoginResult {
  ok: boolean;
  error?: string;
}

/**
 * Auth stub Mốc 4 — port tinh thần webapp/src/store/AuthContext.tsx (mật khẩu chung demo,
 * phiên lưu localStorage). Việc gọi API JWT thật (kế hoạch gốc ghi "auth guard stub gọi API
 * JWT tạm của Mốc 2") không áp dụng được nguyên văn vì Mốc 2 chỉ có DevApiKeyFilter (1 key
 * tĩnh chặn toàn API, không có endpoint đăng nhập) — xem active-task.md ghi chú Mốc 2. Login ở
 * đây vẫn thuần client-side; request thật sang backend đính kèm dev API key qua
 * dev-api-key.interceptor.ts, độc lập với "đăng nhập" này. Thay bằng OIDC/SAML thật khi
 * OQ-021 chốt (F3/F5).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userService = inject(UserService);

  private readonly userSignal = signal<DemoUser | null>(this.restore());
  readonly user = this.userSignal.asReadonly();
  private readonly activeAppSignal = signal<AppCode | null>(this.restoreActiveApp());
  readonly activeApp = this.activeAppSignal.asReadonly();

  entitledApps(): AppCode[] {
    const current = this.userSignal();
    if (!current) return [];
    return current.isAdmin ? [...ALL_APP_CODES] : [...current.apps];
  }

  selectApp(app: AppCode): boolean {
    if (!this.entitledApps().includes(app)) return false;
    this.activeAppSignal.set(app);
    try {
      sessionStorage.setItem(ACTIVE_APP_STORAGE_KEY, app);
    } catch {
      /* bỏ qua nếu sessionStorage không khả dụng */
    }
    return true;
  }

  login(email: string, password: string): LoginResult {
    const found = findDemoUser(email);
    if (!found) return { ok: false, error: 'Email không tồn tại trong danh sách tài khoản demo.' };
    if (password !== DEMO_PASSWORD) return { ok: false, error: 'Mật khẩu không đúng.' };
    try {
      localStorage.setItem(STORAGE_KEY, found.email);
    } catch {
      /* bỏ qua nếu localStorage không khả dụng */
    }
    this.userSignal.set(found);
    this.clearActiveApp();
    return { ok: true };
  }

  /**
   * Gỡ bản hardcode role/permission thứ 3 (`demo-users.ts`) — nạp role/permission/administrator
   * THẬT từ `identity-service` (D22) cho user đang đăng nhập, ghi đè lên field cùng tên của
   * `DemoUser` đang giữ trong signal. Gọi từ `Shell` (mounted sau khi qua `authGuard`, phủ cả
   * đăng nhập mới lẫn phiên khôi phục từ localStorage) — KHÔNG gọi từ `login()`/constructor để
   * các unit test gọi thẳng `AuthService.login()` (không dựng `Shell`) không phải lo mock HTTP.
   * Chạy ngầm, không chặn — lỗi mạng (identity-service chưa chạy) chỉ log cảnh báo, giữ nguyên
   * giá trị tĩnh, không phá luồng demo login hiện tại. `apps` KHÔNG bị ghi đè — entitlement App
   * vẫn theo nguồn tĩnh D19.
   */
  refreshCurrentUser(): void {
    const current = this.userSignal();
    if (current) this.refreshEffectivePermissions(current.email);
  }

  private refreshEffectivePermissions(email: string): void {
    this.userService.effectivePermissionsByEmail(email).subscribe({
      next: (effective) => {
        const current = this.userSignal();
        if (!current || current.email !== email) return;
        this.userSignal.set({
          ...current,
          roleCodes: [...effective.roleCodes],
          isAdmin: current.isAdmin || effective.administrator,
        });
      },
      error: (error) => {
        console.warn(`[AuthService] Không nạp được role/permission thật từ identity-service cho ${email}.`, error);
      },
    });
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* bỏ qua */
    }
    this.userSignal.set(null);
    this.clearActiveApp();
  }

  private restore(): DemoUser | null {
    try {
      const email = localStorage.getItem(STORAGE_KEY);
      return email ? (findDemoUser(email) ?? null) : null;
    } catch {
      return null;
    }
  }

  private restoreActiveApp(): AppCode | null {
    try {
      const app = sessionStorage.getItem(ACTIVE_APP_STORAGE_KEY) as AppCode | null;
      return app && ALL_APP_CODES.includes(app) ? app : null;
    } catch {
      return null;
    }
  }

  private clearActiveApp(): void {
    this.activeAppSignal.set(null);
    try {
      sessionStorage.removeItem(ACTIVE_APP_STORAGE_KEY);
    } catch {
      /* bỏ qua */
    }
  }
}
