import { lazy } from 'react'
import { Route } from 'react-router-dom'
import { DashboardRouteGuard } from './shared/DashboardRouteGuard'

const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard'))
const PortfolioDashboard = lazy(() => import('./pages/PortfolioDashboard'))
const MissionDetailDashboard = lazy(() => import('./pages/MissionDetailDashboard'))
const ProcessSlaDashboard = lazy(() => import('./pages/ProcessSlaDashboard'))
const WorkloadDashboard = lazy(() => import('./pages/WorkloadDashboard'))
const CouncilDashboard = lazy(() => import('./pages/CouncilDashboard'))
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'))
const ResourceDashboard = lazy(() => import('./pages/ResourceDashboard'))
const RiskDashboard = lazy(() => import('./pages/RiskDashboard'))
const IntegrationDashboard = lazy(() => import('./pages/IntegrationDashboard'))
const AdoptionDashboard = lazy(() => import('./pages/AdoptionDashboard'))

/** Route nodes — dùng trực tiếp trong <Routes> của App.tsx */
export const dashboardRouteNodes = [
  <Route key="dash-tong-quan" path="/dashboard/tong-quan" element={<DashboardRouteGuard view="DASHBOARD_EXECUTIVE_VIEW"><ExecutiveDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-danh-muc" path="/dashboard/danh-muc-nhiem-vu" element={<DashboardRouteGuard view="DASHBOARD_PORTFOLIO_VIEW"><PortfolioDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-nhiem-vu" path="/dashboard/nhiem-vu/:missionId" element={<DashboardRouteGuard view="DASHBOARD_MISSION_VIEW"><MissionDetailDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-quy-trinh" path="/dashboard/quy-trinh-sla" element={<DashboardRouteGuard view="DASHBOARD_PROCESS_VIEW"><ProcessSlaDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-tai-xu-ly" path="/dashboard/tai-xu-ly" element={<DashboardRouteGuard view="DASHBOARD_WORKLOAD_VIEW"><WorkloadDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-hoi-dong" path="/dashboard/hoi-dong" element={<DashboardRouteGuard view="DASHBOARD_COUNCIL_VIEW"><CouncilDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-kinh-phi" path="/dashboard/kinh-phi" element={<DashboardRouteGuard view="DASHBOARD_FINANCE_VIEW"><FinanceDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-nguon-luc" path="/dashboard/nguon-luc" element={<DashboardRouteGuard view="DASHBOARD_RESOURCE_VIEW"><ResourceDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-rui-ro" path="/dashboard/rui-ro" element={<DashboardRouteGuard view="DASHBOARD_RISK_VIEW"><RiskDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-tich-hop" path="/dashboard/tich-hop-du-lieu" element={<DashboardRouteGuard view="DASHBOARD_INTEGRATION_VIEW"><IntegrationDashboard /></DashboardRouteGuard>} />,
  <Route key="dash-su-dung" path="/dashboard/muc-do-su-dung" element={<DashboardRouteGuard view="DASHBOARD_ADOPTION_VIEW"><AdoptionDashboard /></DashboardRouteGuard>} />,
]

export { DASHBOARD_MENU } from './dashboard.routes'
