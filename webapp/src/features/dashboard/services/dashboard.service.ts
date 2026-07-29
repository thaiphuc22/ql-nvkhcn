import type { DashboardFilter } from '../models/dashboard.models'
import type { MissionDashboardData } from '../models/mission-dashboard.models'
import type { ProcessPerformanceData } from '../models/process-dashboard.models'
import type { IntegrationHealthData } from '../models/integration-dashboard.models'

export interface ExecutiveSummaryData {
  kpis: import('../models/dashboard.models').KpiMetric[]
  lifecycle: import('../models/dashboard.models').MissionLifecycleStage[]
  monthly: Array<{ month: string; started: number; completed: number }>
  byLevel: Array<{ label: string; value: number }>
  heatmap: import('../models/dashboard.models').HeatmapCell[]
  topRisk: import('../models/dashboard.models').MissionSummary[]
  slowSteps: Array<{ label: string; value: number }>
  alerts: import('../models/dashboard.models').RiskAlert[]
}

export interface PortfolioAnalyticsData {
  kpis: import('../models/dashboard.models').KpiMetric[]
  missions: import('../models/dashboard.models').MissionSummary[]
  byType: Array<{ label: string; value: number }>
  byField: Array<{ label: string; value: number }>
  byOrg: Array<{ label: string; value: number }>
  byLevel: Array<{ label: string; value: number }>
  budgetByField: Array<{ label: string; value: number }>
  budgetByOrg: Array<{ label: string; value: number }>
  bySource: Array<{ label: string; value: number }>
  byPlanYear: Array<{ label: string; value: number }>
}

export interface DashboardService {
  getExecutiveSummary(filter: DashboardFilter): Promise<ExecutiveSummaryData>
  getPortfolioAnalytics(filter: DashboardFilter): Promise<PortfolioAnalyticsData>
  getMissionDashboard(missionId: string): Promise<MissionDashboardData | null>
  getProcessPerformance(filter: DashboardFilter): Promise<ProcessPerformanceData>
  getTaskWorkload(filter: DashboardFilter): Promise<ReturnType<typeof import('../mocks/dashboard.mock-data').getTaskWorkload>>
  getCouncilAnalytics(filter: DashboardFilter): Promise<ReturnType<typeof import('../mocks/dashboard.mock-data').getCouncilAnalytics>>
  getFinanceAnalytics(filter: DashboardFilter): Promise<ReturnType<typeof import('../mocks/dashboard.mock-data').getFinanceAnalytics>>
  getResourceAnalytics(filter: DashboardFilter): Promise<ReturnType<typeof import('../mocks/dashboard.mock-data').getResourceAnalytics>>
  getRiskAlerts(filter: DashboardFilter): Promise<ReturnType<typeof import('../mocks/dashboard.mock-data').getRiskAnalytics>>
  getIntegrationHealth(filter: DashboardFilter): Promise<IntegrationHealthData>
  getAdoptionAnalytics(filter: DashboardFilter): Promise<ReturnType<typeof import('../mocks/dashboard.mock-data').getAdoptionAnalytics>>
}

import { createDashboardService } from './dashboard-mock.service'

/** Factory — đổi implementation tại đây khi nối API thật. */
export function getDashboardService(): DashboardService {
  return createDashboardService()
}
