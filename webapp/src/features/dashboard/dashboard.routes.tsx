import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

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

export const dashboardRoutes: RouteObject[] = [
  { path: '/dashboard/tong-quan', element: <ExecutiveDashboard /> },
  { path: '/dashboard/danh-muc-nhiem-vu', element: <PortfolioDashboard /> },
  { path: '/dashboard/nhiem-vu/:missionId', element: <MissionDetailDashboard /> },
  { path: '/dashboard/quy-trinh-sla', element: <ProcessSlaDashboard /> },
  { path: '/dashboard/tai-xu-ly', element: <WorkloadDashboard /> },
  { path: '/dashboard/hoi-dong', element: <CouncilDashboard /> },
  { path: '/dashboard/kinh-phi', element: <FinanceDashboard /> },
  { path: '/dashboard/nguon-luc', element: <ResourceDashboard /> },
  { path: '/dashboard/rui-ro', element: <RiskDashboard /> },
  { path: '/dashboard/tich-hop-du-lieu', element: <IntegrationDashboard /> },
  { path: '/dashboard/muc-do-su-dung', element: <AdoptionDashboard /> },
]

export const DASHBOARD_MENU = [
  { key: 'dash-tong-quan', label: 'Tổng quan điều hành', path: '/dashboard/tong-quan', permission: 'DASHBOARD_EXECUTIVE_VIEW' as const },
  { key: 'dash-danh-muc', label: 'Danh mục nhiệm vụ', path: '/dashboard/danh-muc-nhiem-vu', permission: 'DASHBOARD_PORTFOLIO_VIEW' as const },
  { key: 'dash-quy-trinh', label: 'Quy trình và SLA', path: '/dashboard/quy-trinh-sla', permission: 'DASHBOARD_PROCESS_VIEW' as const },
  { key: 'dash-tai-xu-ly', label: 'Tải xử lý', path: '/dashboard/tai-xu-ly', permission: 'DASHBOARD_WORKLOAD_VIEW' as const },
  { key: 'dash-hoi-dong', label: 'Hội đồng', path: '/dashboard/hoi-dong', permission: 'DASHBOARD_COUNCIL_VIEW' as const },
  { key: 'dash-kinh-phi', label: 'Kinh phí', path: '/dashboard/kinh-phi', permission: 'DASHBOARD_FINANCE_VIEW' as const },
  { key: 'dash-nguon-luc', label: 'Nguồn lực', path: '/dashboard/nguon-luc', permission: 'DASHBOARD_RESOURCE_VIEW' as const },
  { key: 'dash-rui-ro', label: 'Rủi ro và cảnh báo', path: '/dashboard/rui-ro', permission: 'DASHBOARD_RISK_VIEW' as const },
  { key: 'dash-tich-hop', label: 'Tích hợp dữ liệu', path: '/dashboard/tich-hop-du-lieu', permission: 'DASHBOARD_INTEGRATION_VIEW' as const },
  { key: 'dash-su-dung', label: 'Mức độ sử dụng', path: '/dashboard/muc-do-su-dung', permission: 'DASHBOARD_ADOPTION_VIEW' as const },
]
