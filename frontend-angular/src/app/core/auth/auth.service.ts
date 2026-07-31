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

  /**
   * Đã nạp xong vai trò thật từ identity-service cho user đang đăng nhập chưa. `demo-users.ts`
   * không còn hardcode `roleCodes`, nên trước khi cờ này bật thì "không có vai trò" chỉ nghĩa là
   * CHƯA BIẾT — màn phụ thuộc vai trò (`/viec-cua-toi`) phải hiện trạng thái đang tải, không
   * được kết luận danh sách rỗng.
   */
  private readonly rolesLoadedSignal = signal(false);
  readonly rolesLoaded = this.rolesLoadedSignal.asReadonly();

  /** Gọi identity-service thất bại — UI phải nói rõ thay vì hiện màn trống không giải thích. */
  private readonly identityUnavailableSignal = signal(false);
  readonly identityUnavailable = this.identityUnavailableSignal.asReadonly();

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
    this.rolesLoadedSignal.set(false);
    this.identityUnavailableSignal.set(false);
    return { ok: true };
  }

  /**
   * Nạp vai trò/administrator THẬT từ `identity-service` (D22, bảng `user_role_assignments`) cho
   * user đang đăng nhập. Đây là nguồn sự thật DUY NHẤT về vai trò kể từ khi `demo-users.ts` bỏ
   * hardcode `roleCodes` — gán vai trò trên `/nguoi-dung` có hiệu lực ngay ở lần nạp kế tiếp.
   *
   * Gọi từ `Shell` (mounted sau khi qua `authGuard`, phủ cả đăng nhập mới lẫn phiên khôi phục từ
   * localStorage) — KHÔNG gọi từ `login()`/constructor để các unit test gọi thẳng
   * `AuthService.login()` (không dựng `Shell`) không phải mock HTTP.
   *
   * Chạy ngầm, không chặn điều hướng: lỗi mạng chỉ bật `identityUnavailable()` để UI nói rõ, chứ
   * không đá người dùng ra trang đăng nhập. `apps` KHÔNG bị ghi đè — entitlement App vẫn theo
   * nguồn tĩnh D19.
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
          // Nguồn thật thắng, KHÔNG OR với giá trị tĩnh: hạ cờ admin của một tài khoản trên
          // `/nguoi-dung` phải có tác dụng, chứ không bị `demo-users.ts` giữ mãi ở true.
          isAdmin: effective.administrator,
        });
        this.identityUnavailableSignal.set(false);
        this.rolesLoadedSignal.set(true);
      },
      error: (error) => {
        console.warn(`[AuthService] Không nạp được vai trò thật từ identity-service cho ${email}.`, error);
        this.identityUnavailableSignal.set(true);
        // Vẫn coi là "đã xong lượt nạp" để UI thoát khỏi trạng thái loading vô hạn; phân biệt
        // "không có vai trò" với "không gọi được" bằng identityUnavailable().
        this.rolesLoadedSignal.set(true);
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
    this.rolesLoadedSignal.set(false);
    this.identityUnavailableSignal.set(false);
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
