import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../store/AuthContext'
import { canViewDashboard } from './dashboardPermissions'
import type { DashboardViewCode } from '../models/dashboard.models'

export function DashboardRouteGuard({ view, children }: { view: DashboardViewCode; children: ReactNode }) {
  const { user } = useAuth()
  if (!canViewDashboard(user, view)) {
    return <Navigate to="/dashboard/tong-quan" replace />
  }
  return <>{children}</>
}
