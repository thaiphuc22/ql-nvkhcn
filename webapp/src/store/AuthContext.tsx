import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_PASSWORD, findUserByEmail, type AppUser } from '../data/users'

const STORAGE_KEY = 'qtkhcn.auth.email'

export interface LoginResult {
  ok: boolean
  error?: string
}

interface AuthCtxValue {
  user: AppUser | null
  login: (email: string, password: string) => LoginResult
  logout: () => void
}

const AuthCtx = createContext<AuthCtxValue | null>(null)

export function useAuth(): AuthCtxValue {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Khôi phục phiên đăng nhập từ localStorage (mock — chỉ lưu email). */
function restoreUser(): AppUser | null {
  try {
    const email = localStorage.getItem(STORAGE_KEY)
    return email ? findUserByEmail(email) ?? null : null
  } catch {
    return null
  }
}

/**
 * Xác thực MOCK: mọi tài khoản demo dùng chung mật khẩu `DEMO_PASSWORD`.
 * Giữ phiên qua localStorage để refresh không mất đăng nhập. Sẽ thay bằng
 * SSO/IAM thật ở F2/F4.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(restoreUser)

  const value = useMemo<AuthCtxValue>(
    () => ({
      user,
      login(email, password) {
        const found = findUserByEmail(email)
        if (!found) return { ok: false, error: 'Email không tồn tại trong danh sách tài khoản.' }
        if (password !== DEMO_PASSWORD) return { ok: false, error: 'Mật khẩu không đúng.' }
        if (found.trangThai === 'locked') return { ok: false, error: 'Tài khoản đã bị khoá.' }
        try {
          localStorage.setItem(STORAGE_KEY, found.email)
        } catch {
          /* bỏ qua nếu localStorage không khả dụng */
        }
        setUser(found)
        return { ok: true }
      },
      logout() {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* bỏ qua */
        }
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
