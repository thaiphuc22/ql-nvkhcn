import type { KpiMetric, MissionSummary, RiskAlert } from './dashboard.models'

export interface MissionMilestone {
  id: string
  name: string
  plannedDate: string
  actualDate?: string
  status: string
  ownerName: string
  deltaDays: number
}

export interface MissionFinanceRow {
  source: string
  category: string
  planned: number
  committed: number
  spent: number
  remaining: number
}

export interface MissionStaffRow {
  name: string
  role: string
  organization: string
  allocationPct: number
  status: string
  workload: string
  warning?: string
}

export interface MissionProcurementRow {
  type: string
  name: string
  status: string
  amount: number
}

export interface MissionProductRow {
  name: string
  productType: string
  target: string
  progressPct: number
  result: string
  acceptanceStatus: string
  ipStatus: string
}

export interface MissionDossierRow {
  name: string
  formType: string
  version: string
  creator: string
  signer?: string
  updatedAt: string
  status: string
}

export interface MissionAuditRow {
  at: string
  actor: string
  action: string
  before?: string
  after?: string
}

export interface MissionDashboardData {
  summary: MissionSummary
  kpis: KpiMetric[]
  currentStage: string
  currentStep: string
  currentAssignee: string
  daysRemaining: number
  lifecycleTimeline: Array<{ stage: string; at?: string; active?: boolean }>
  milestones: MissionMilestone[]
  finance: {
    approvedBudget: number
    spent: number
    remaining: number
    disbursementPct: number
    monthlyPlan: Array<{ month: string; plan: number; actual: number }>
    rows: MissionFinanceRow[]
  }
  staff: MissionStaffRow[]
  procurement: MissionProcurementRow[]
  products: MissionProductRow[]
  dossiers: MissionDossierRow[]
  alerts: RiskAlert[]
  auditLog: MissionAuditRow[]
}
