import type { DashboardService } from './dashboard.service'
import {
  getAdoptionAnalytics,
  getCouncilAnalytics,
  getExecutiveData,
  getFinanceAnalytics,
  getIntegrationHealth,
  getMissionDashboard,
  getPortfolioData,
  getProcessPerformance,
  getResourceAnalytics,
  getRiskAnalytics,
  getTaskWorkload,
} from '../mocks/dashboard.mock-data'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

function shouldFail(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('mockError') === '1'
}

async function withMock<T>(fn: () => T): Promise<T> {
  await delay(300 + Math.random() * 200)
  if (shouldFail()) throw new Error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
  return fn()
}

export const dashboardMockService: DashboardService = {
  getExecutiveSummary: (f) => withMock(() => getExecutiveData(f)),
  getPortfolioAnalytics: (f) => withMock(() => getPortfolioData(f)),
  getMissionDashboard: (id) => withMock(() => getMissionDashboard(id)),
  getProcessPerformance: (f) => withMock(() => getProcessPerformance(f)),
  getTaskWorkload: (f) => withMock(() => getTaskWorkload(f)),
  getCouncilAnalytics: (f) => withMock(() => getCouncilAnalytics(f)),
  getFinanceAnalytics: (f) => withMock(() => getFinanceAnalytics(f)),
  getResourceAnalytics: (f) => withMock(() => getResourceAnalytics(f)),
  getRiskAlerts: (f) => withMock(() => getRiskAnalytics(f)),
  getIntegrationHealth: (f) => withMock(() => getIntegrationHealth(f)),
  getAdoptionAnalytics: (f) => withMock(() => getAdoptionAnalytics(f)),
}

/** Factory — đổi implementation tại đây khi nối API thật. */
export function createDashboardService(): DashboardService {
  return dashboardMockService
}
