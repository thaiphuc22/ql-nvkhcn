import type { DashboardViewCode } from '../models/dashboard.models'
import { isAdmin } from '../../../data/permissions'
import type { AppUser } from '../../../data/users'

const OPERATOR_VIEWS: DashboardViewCode[] = [
  'DASHBOARD_EXECUTIVE_VIEW',
  'DASHBOARD_PORTFOLIO_VIEW',
  'DASHBOARD_MISSION_VIEW',
  'DASHBOARD_PROCESS_VIEW',
  'DASHBOARD_WORKLOAD_VIEW',
  'DASHBOARD_COUNCIL_VIEW',
  'DASHBOARD_RISK_VIEW',
]

const MANAGER_VIEWS: DashboardViewCode[] = [
  ...OPERATOR_VIEWS,
  'DASHBOARD_FINANCE_VIEW',
  'DASHBOARD_RESOURCE_VIEW',
  'DASHBOARD_INTEGRATION_VIEW',
  'DASHBOARD_ADOPTION_VIEW',
  'DASHBOARD_EXPORT',
]

export function canViewDashboard(user: AppUser | null | undefined, view: DashboardViewCode): boolean {
  if (!user) return false
  if (isAdmin(user)) return true
  if (user.vaiTro.some((v) => v.includes('Lãnh đạo') || v.includes('CQ QLKHCN'))) {
    return MANAGER_VIEWS.includes(view)
  }
  return OPERATOR_VIEWS.includes(view)
}
