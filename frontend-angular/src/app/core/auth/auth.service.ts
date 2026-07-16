import { Injectable, signal } from '@angular/core';
import { DEMO_PASSWORD, DemoUser, findDemoUser } from './demo-users';

const STORAGE_KEY = 'qtkhcn.auth.email';

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
  private readonly userSignal = signal<DemoUser | null>(this.restore());
  readonly user = this.userSignal.asReadonly();

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
    return { ok: true };
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* bỏ qua */
    }
    this.userSignal.set(null);
  }

  private restore(): DemoUser | null {
    try {
      const email = localStorage.getItem(STORAGE_KEY);
      return email ? (findDemoUser(email) ?? null) : null;
    } catch {
      return null;
    }
  }
}
