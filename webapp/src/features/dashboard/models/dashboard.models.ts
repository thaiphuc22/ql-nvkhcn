export type KpiStatus = 'success' | 'warning' | 'danger' | 'neutral'
export type KpiTrend = 'up' | 'down' | 'neutral'
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type AlertStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface DashboardFilter {
  fromDate?: string
  toDate?: string
  planYear?: number
  organizationIds?: string[]
  managementLevels?: string[]
  missionTypes?: string[]
  scienceFields?: string[]
  statuses?: string[]
  processCodes?: string[]
}

export interface KpiMetric {
  id: string
  title: string
  value: number
  unit?: string
  changePercent?: number
  trend?: KpiTrend
  status?: KpiStatus
  tooltip?: string
  route?: string
  filterKey?: string
}

export interface ChartSeries {
  name: string
  data: Array<{ label: string; value: number; extra?: Record<string, string | number> }>
}

export interface MissionSummary {
  id: string
  code: string
  name: string
  missionType: string
  managementLevel: string
  scienceField: string
  organizationName: string
  ownerName: string
  totalBudget: number
  period: string
  status: string
  riskLevel: string
  progressPct: number
}

export type MissionStatus =
  | 'khoi_tao'
  | 'xet_duyet_chu_truong'
  | 'da_duyet_chu_truong'
  | 'xet_duyet_nhiem_vu'
  | 'da_phe_duyet'
  | 'dang_thuc_hien'
  | 'nghiem_thu'
  | 'quyet_toan'
  | 'hoan_thanh'

export interface MissionLifecycleStage {
  stage: MissionStatus
  label: string
  count: number
}

export interface RiskAlert {
  id: string
  severity: AlertSeverity
  missionCode: string
  missionName: string
  category: string
  message: string
  ownerName: string
  organizationName: string
  detectedAt: string
  dueDate?: string
  status: AlertStatus
}

export interface HeatmapCell {
  row: string
  col: string
  value: number
}

export interface DashboardPageState<T> {
  loading: boolean
  error: boolean
  empty: boolean
  data: T | null
}

export type DashboardViewCode =
  | 'DASHBOARD_EXECUTIVE_VIEW'
  | 'DASHBOARD_PORTFOLIO_VIEW'
  | 'DASHBOARD_MISSION_VIEW'
  | 'DASHBOARD_PROCESS_VIEW'
  | 'DASHBOARD_WORKLOAD_VIEW'
  | 'DASHBOARD_COUNCIL_VIEW'
  | 'DASHBOARD_FINANCE_VIEW'
  | 'DASHBOARD_RESOURCE_VIEW'
  | 'DASHBOARD_RISK_VIEW'
  | 'DASHBOARD_INTEGRATION_VIEW'
  | 'DASHBOARD_ADOPTION_VIEW'
  | 'DASHBOARD_EXPORT'
