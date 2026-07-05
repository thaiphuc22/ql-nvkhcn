import { createContext, useContext, useState, type ReactNode } from 'react'

/** Một mắt breadcrumb: nhãn + đường dẫn (nếu là link). */
export interface Crumb {
  label: string
  to?: string
}

interface BreadcrumbCtxValue {
  crumbs: Crumb[] | null
  setCrumbs: (c: Crumb[] | null) => void
}

const BreadcrumbCtx = createContext<BreadcrumbCtxValue | null>(null)

export function useBreadcrumb(): BreadcrumbCtxValue {
  const ctx = useContext(BreadcrumbCtx)
  if (!ctx) throw new Error('useBreadcrumb must be used within BreadcrumbProvider')
  return ctx
}

/**
 * Nguồn breadcrumb DÙNG CHUNG: mỗi trang (qua PageHeader) đẩy breadcrumb lên đây;
 * Header của layout đọc và hiển thị ở MỘT nơi duy nhất. Trang không set → header
 * tự dùng breadcrumb mặc định (Hệ thống / khu chức năng).
 */
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[] | null>(null)
  return <BreadcrumbCtx.Provider value={{ crumbs, setCrumbs }}>{children}</BreadcrumbCtx.Provider>
}
