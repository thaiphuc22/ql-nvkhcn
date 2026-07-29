export interface ProcessMetric {
  processCode: string
  processName: string
  started7d: number
  running: number
  completed: number
  slaBreached: number
  openIncidents: number
  slaCompliancePct: number
  avgDurationDays: number
  p50Days: number
  p90Days: number
  p95Days: number
}

export interface ProcessNodeMetric {
  nodeId: string
  nodeName: string
  totalInstances: number
  outlierCount: number
  avgDurationDays: number
  p95Days: number
  slaBreachedPct: number
}

export interface ProcessOutcomeSlice {
  outcome: string
  count: number
}

export interface ProcessTrendPoint {
  month: string
  started: number
  completed: number
  avgDurationDays: number
}

export interface ProcessPerformanceData {
  kpis: import('./dashboard.models').KpiMetric[]
  monthlyTrend: ProcessTrendPoint[]
  avgDurationByProcess: ChartBarItem[]
  slaByProcess: ChartBarItem[]
  happyPathPct: number
  unwantedPathPct: number
  outcomes: ProcessOutcomeSlice[]
  bottleneckNodes: ProcessNodeMetric[]
  incidentNodes: ProcessNodeMetric[]
  outlierNodes: ProcessNodeMetric[]
}

export interface ChartBarItem {
  label: string
  value: number
}
