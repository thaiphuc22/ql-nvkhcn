export type IntegrationConnectorStatus = 'ACTIVE' | 'DEGRADED' | 'ERROR' | 'OFFLINE'

export interface IntegrationStatus {
  systemCode: string
  systemName: string
  status: IntegrationConnectorStatus
  lastSyncAt: string
  latencyMs: number
  totalRecords: number
  successCount: number
  errorCount: number
  unmappedCount: number
}

export interface IntegrationHealthData {
  kpis: import('./dashboard.models').KpiMetric[]
  connectors: IntegrationStatus[]
  successBySystem: Array<{ label: string; value: number }>
  errorsOverTime: Array<{ label: string; value: number }>
  errorsByType: Array<{ label: string; value: number }>
  latencyTrend: Array<{ label: string; value: number }>
  autoVsManualPct: { auto: number; manual: number }
}

export interface TaskWorkloadMetric {
  assignee: string
  organization: string
  role: string
  inProgress: number
  dueSoon: number
  overdue: number
  completedInPeriod: number
  avgHandleDays: number
  onTimePct: number
}

export interface CouncilMetric {
  councilCode: string
  missionName: string
  councilLevel: string
  chairName: string
  meetingDate: string
  attendees: number
  reviewVotes: string
  evaluationVotes: string
  result: string
  minutesSignStatus: string
}

export interface FinanceMetric {
  missionCode: string
  missionName: string
  approvedBudget: number
  committed: number
  spent: number
  remaining: number
  disbursementPct: number
  planDelta: number
  warning?: string
}

export interface ResourceMetric {
  category: string
  label: string
  value: number
  status?: string
}

export interface AdoptionMetric {
  organization: string
  userCount: number
  activeUsers: number
  missionCount: number
  electronicDossiers: number
  usagePct: number
  lastAccessAt: string
}
