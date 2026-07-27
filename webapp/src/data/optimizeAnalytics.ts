/**
 * Mock Camunda Optimize analytics — lãnh đạo nhìn năng lực xử lý đa quy trình.
 * Frontend-only seed; thay bằng Optimize API / Operate khi F1 sẵn sàng.
 * Kỳ tham chiếu demo: Tháng 6/2026 & Quý 2/2026.
 */

export type AnalyticsPeriod = 'month' | 'quarter'

export type StatusBucket = 'processing' | 'approved' | 'rejected' | 'cancelled'

export interface PeriodKpi {
  periodLabel: string
  /** Tổng hồ sơ trong kỳ theo trạng thái (Optimize process-instance aggregates). */
  byStatus: Record<StatusBucket, number>
  runningInstances: number
  overdueSla: number
  openIncidents: number
  /** Overall cycle time: nộp → quyết định cuối (ngày). */
  avgCycleDays: number
  /** % instance hoàn thành đúng SLA trong kỳ. */
  slaCompliancePct: number
  /** Delta so với kỳ trước (điểm phần trăm / ngày). */
  deltaInstancesPct: number
  deltaIncidents: number
  deltaSlaPct: number
  deltaDurationDays: number
}

export interface TrendPoint {
  label: string
  volume: number
  durationDays: number
  incidents: number
}

export interface BranchAnalysisRow {
  gateway: string
  branch: string
  rate: number
  count: number
  /** avg cycle days when taking this branch */
  avgDays: number
  /** fail or rework rate on this branch */
  failRate: number
}

export interface OutlierInstance {
  instanceKey: string
  maHoSo: string
  process: string
  step: string
  durationDays: number
  slaDays: number
  department: string
  caseType: string
  product: string
}

export interface GroupSlice {
  key: string
  label: string
  count: number
  overdue: number
  avgDays: number
}

export interface CapBudgetSlice {
  cap: 'Cơ sở' | 'Tập đoàn'
  budgetBand: string
  count: number
}

export interface StepLoad {
  step: string
  count: number
}

export interface StepCycle {
  step: string
  avgDays: number
}

export interface BacklogPoint {
  label: string
  open: number
}

export interface SlaByCap {
  cap: string
  lateRate: number
  total: number
  late: number
}

export type OutcomeKind = 'approve' | 'rework' | 'reject'

export interface OutcomeRate {
  dimension: string
  /** Nhãn trục (RD01 / dải NS / cấp…). */
  label: string
  approve: number
  rework: number
  reject: number
}

export interface ReworkLoopBucket {
  times: number
  dossiers: number
}

export interface DmnRuleHit {
  ruleId: string
  condition: string
  hits: number
  /** true = rule thường “chặn” / yêu cầu bổ sung. */
  blocking: boolean
}

export interface UnitPerf {
  unit: string
  avgCycleDays: number
  completed: number
  overdueRate: number
  /** Vượt ngưỡng SLA nội bộ (highlight). */
  overThreshold: boolean
}

export interface TopHandler {
  name: string
  roleOrGroup: string
  completed: number
  avgCycleDays: number
}

/** Heat trên BPMN RD01.01 — intensity 0..1 (Optimize heatmap). */
export interface BpmnHeatCell {
  elementId: string
  label: string
  intensity: number
  openCount: number
  avgCycleDays: number
}

export interface UnitSlaHeat {
  unit: string
  metric: 'SLA trễ %' | 'Cycle time (ngày)'
  value: number
}

export interface OptimizeSnapshot {
  kpi: PeriodKpi
  byCapBudget: CapBudgetSlice[]
  stepLoad: StepLoad[]
  topSlowSteps: StepCycle[]
  backlogTrend: BacklogPoint[]
  /** Volume / duration / incident theo ngày hoặc tuần. */
  trendDaily: TrendPoint[]
  trendWeekly: TrendPoint[]
  branchAnalysis: BranchAnalysisRow[]
  outliers: OutlierInstance[]
  byDepartment: GroupSlice[]
  byCaseType: GroupSlice[]
  byProduct: GroupSlice[]
  slaByCap: SlaByCap[]
  outcomesByRd: OutcomeRate[]
  outcomesByBudget: OutcomeRate[]
  outcomesByCap: OutcomeRate[]
  reworkLoops: ReworkLoopBucket[]
  dmnRuleHits: DmnRuleHit[]
  unitPerf: UnitPerf[]
  topHandlers: TopHandler[]
  unitMetricHeat: UnitSlaHeat[]
}

/** Quy trình có BPMN mock + seed heatmap Optimize. */
export const BPMN_HEAT_PROCESS_OPTIONS = [
  { ma: 'RD01.01', ten: 'Xét duyệt Chủ trương cấp Cơ sở' },
  { ma: 'RD01.02', ten: 'Xét duyệt Chủ trương cấp Tập đoàn' },
  { ma: 'RD02.01', ten: 'Xét duyệt NV KHCN cấp Cơ sở' },
] as const

export type BpmnHeatProcessMa = (typeof BPMN_HEAT_PROCESS_OPTIONS)[number]['ma']

/** Heatmap theo quy trình (elementId khớp BPMN XML seed). */
export const BPMN_HEAT_BY_PROCESS: Record<BpmnHeatProcessMa, BpmnHeatCell[]> = {
  'RD01.01': [
    { elementId: 'Task_3', label: 'CQNV thẩm định', intensity: 0.85, openCount: 14, avgCycleDays: 9.8 },
    { elementId: 'Task_9', label: 'CQNV ký duyệt', intensity: 0.55, openCount: 6, avgCycleDays: 5.1 },
    { elementId: 'Task_10a', label: 'Lập BC thẩm định', intensity: 0.72, openCount: 11, avgCycleDays: 6.1 },
    { elementId: 'Task_10b', label: 'Trình ký QĐ', intensity: 0.4, openCount: 4, avgCycleDays: 3.2 },
    { elementId: 'Task_6', label: 'HĐ thẩm định', intensity: 0.95, openCount: 9, avgCycleDays: 12.6 },
    { elementId: 'Task_11_HD', label: 'HĐ ký thông qua', intensity: 0.65, openCount: 5, avgCycleDays: 8.0 },
    { elementId: 'Task_11_TGD', label: 'TGĐ phê duyệt', intensity: 0.78, openCount: 7, avgCycleDays: 7.4 },
    { elementId: 'Task_5', label: 'BGĐ ký HS', intensity: 0.35, openCount: 5, avgCycleDays: 4.2 },
    { elementId: 'Task_8', label: 'BGĐ ký duyệt', intensity: 0.28, openCount: 3, avgCycleDays: 3.5 },
    { elementId: 'Task_1', label: 'PM khởi tạo', intensity: 0.15, openCount: 2, avgCycleDays: 1.8 },
    { elementId: 'Task_2', label: 'PM dự thảo', intensity: 0.2, openCount: 2, avgCycleDays: 2.4 },
  ],
  'RD01.02': [
    { elementId: 'Task_1', label: 'Khởi tạo TĐ', intensity: 0.18, openCount: 2, avgCycleDays: 2.0 },
    { elementId: 'Task_6', label: 'Thẩm định HS Chủ trương', intensity: 0.88, openCount: 10, avgCycleDays: 11.4 },
    { elementId: 'Task_14', label: 'Kiểm tra HS CQ KHCN TĐ', intensity: 0.76, openCount: 8, avgCycleDays: 8.2 },
    { elementId: 'Task_17_PNX', label: 'PNX liên ngành', intensity: 0.92, openCount: 12, avgCycleDays: 13.1 },
    { elementId: 'Task_18', label: 'Ký duyệt HS', intensity: 0.48, openCount: 5, avgCycleDays: 5.5 },
    { elementId: 'Task_20', label: 'Ký duyệt HS (cấp cao)', intensity: 0.58, openCount: 6, avgCycleDays: 6.8 },
    { elementId: 'Task_22', label: 'Ký thông qua BC', intensity: 0.7, openCount: 7, avgCycleDays: 9.0 },
    { elementId: 'Task_23', label: 'Phê duyệt QĐ chủ trương', intensity: 0.82, openCount: 9, avgCycleDays: 10.2 },
    { elementId: 'Task_10', label: 'Lập CV đề nghị', intensity: 0.32, openCount: 4, avgCycleDays: 3.8 },
    { elementId: 'Task_3', label: 'PNX HS chủ trương', intensity: 0.42, openCount: 5, avgCycleDays: 4.6 },
  ],
  'RD02.01': [
    { elementId: 'Task_Rule', label: 'DMN định tuyến', intensity: 0.25, openCount: 3, avgCycleDays: 0.5 },
    { elementId: 'Task_CQ', label: 'Chuyên quản thẩm định', intensity: 0.8, openCount: 11, avgCycleDays: 8.6 },
    { elementId: 'Task_HDXD', label: 'HĐ Xét duyệt', intensity: 0.94, openCount: 13, avgCycleDays: 14.2 },
    { elementId: 'Task_HDKHCN', label: 'HĐ KHCN phê duyệt', intensity: 0.72, openCount: 8, avgCycleDays: 10.5 },
    { elementId: 'Task_TGD', label: 'TGĐ phê duyệt mở mới', intensity: 0.66, openCount: 7, avgCycleDays: 7.8 },
  ],
}

export function getBpmnHeat(processMa: BpmnHeatProcessMa): BpmnHeatCell[] {
  return BPMN_HEAT_BY_PROCESS[processMa] ?? []
}

const MONTH: OptimizeSnapshot = {
  kpi: {
    periodLabel: 'Tháng 6/2026',
    byStatus: { processing: 48, approved: 62, rejected: 11, cancelled: 5 },
    runningInstances: 48,
    overdueSla: 9,
    openIncidents: 3,
    avgCycleDays: 18.4,
    slaCompliancePct: 86.2,
    deltaInstancesPct: 4.8,
    deltaIncidents: -1,
    deltaSlaPct: -1.4,
    deltaDurationDays: 0.6,
  },
  byCapBudget: [
    { cap: 'Cơ sở', budgetBand: '< 5 tỷ', count: 28 },
    { cap: 'Cơ sở', budgetBand: '5–20 tỷ', count: 22 },
    { cap: 'Cơ sở', budgetBand: '> 20 tỷ', count: 8 },
    { cap: 'Tập đoàn', budgetBand: '< 5 tỷ', count: 12 },
    { cap: 'Tập đoàn', budgetBand: '5–20 tỷ', count: 31 },
    { cap: 'Tập đoàn', budgetBand: '> 20 tỷ', count: 25 },
  ],
  stepLoad: [
    { step: 'Thẩm định Cơ sở', count: 14 },
    { step: 'CQ QLKHCN', count: 11 },
    { step: 'Hội đồng KHCN', count: 9 },
    { step: 'TGĐ phê duyệt', count: 7 },
    { step: 'BGĐ TT/Khối', count: 5 },
    { step: 'Khởi tạo / PM', count: 2 },
  ],
  topSlowSteps: [
    { step: 'Hội đồng KHCN', avgDays: 12.6 },
    { step: 'Thẩm định Cơ sở', avgDays: 9.8 },
    { step: 'TGĐ phê duyệt', avgDays: 7.4 },
    { step: 'CQ QLKHCN', avgDays: 6.1 },
    { step: 'BGĐ TT/Khối', avgDays: 4.2 },
  ],
  backlogTrend: [
    { label: 'T1', open: 52 },
    { label: 'T2', open: 55 },
    { label: 'T3', open: 49 },
    { label: 'T4', open: 58 },
    { label: 'T5', open: 61 },
    { label: 'T6', open: 48 },
  ],
  trendDaily: [
    { label: '01/06', volume: 4, durationDays: 17.2, incidents: 0 },
    { label: '05/06', volume: 6, durationDays: 18.0, incidents: 1 },
    { label: '10/06', volume: 5, durationDays: 19.1, incidents: 0 },
    { label: '15/06', volume: 8, durationDays: 18.8, incidents: 2 },
    { label: '20/06', volume: 7, durationDays: 17.5, incidents: 0 },
    { label: '25/06', volume: 9, durationDays: 18.9, incidents: 1 },
    { label: '30/06', volume: 5, durationDays: 18.4, incidents: 0 },
  ],
  trendWeekly: [
    { label: 'Tuần 1', volume: 22, durationDays: 17.8, incidents: 1 },
    { label: 'Tuần 2', volume: 28, durationDays: 18.6, incidents: 2 },
    { label: 'Tuần 3', volume: 31, durationDays: 19.2, incidents: 3 },
    { label: 'Tuần 4', volume: 45, durationDays: 18.4, incidents: 1 },
  ],
  branchAnalysis: [
    { gateway: 'Sau thẩm định HĐ', branch: 'Đồng ý', rate: 61, count: 41, avgDays: 16.2, failRate: 0 },
    { gateway: 'Sau thẩm định HĐ', branch: 'Yêu cầu điều chỉnh', rate: 29, count: 20, avgDays: 24.8, failRate: 12 },
    { gateway: 'Sau thẩm định HĐ', branch: 'Từ chối', rate: 10, count: 7, avgDays: 12.0, failRate: 100 },
    { gateway: 'Sau ký TT/Khối', branch: 'Đồng ý', rate: 78, count: 62, avgDays: 14.5, failRate: 0 },
    { gateway: 'Sau ký TT/Khối', branch: 'Yêu cầu điều chỉnh', rate: 18, count: 14, avgDays: 21.3, failRate: 8 },
    { gateway: 'Sau ký TT/Khối', branch: 'Từ chối', rate: 4, count: 3, avgDays: 9.0, failRate: 100 },
    { gateway: 'Sau TGĐ', branch: 'Đồng ý', rate: 72, count: 39, avgDays: 17.1, failRate: 0 },
    { gateway: 'Sau TGĐ', branch: 'Yêu cầu điều chỉnh', rate: 22, count: 12, avgDays: 26.4, failRate: 15 },
    { gateway: 'Sau TGĐ', branch: 'Từ chối', rate: 6, count: 3, avgDays: 11.2, failRate: 100 },
  ],
  outliers: [
    {
      instanceKey: '2251799813688901',
      maHoSo: 'HS-2026-025',
      process: 'RD02.01',
      step: 'Chuyên quản thẩm định',
      durationDays: 41,
      slaDays: 20,
      department: 'CQ QLKHCN',
      caseType: 'Xét duyệt',
      product: 'Đề tài R&D',
    },
    {
      instanceKey: '2251799813685284',
      maHoSo: 'HS-2026-018',
      process: 'RD01.01',
      step: 'Hội đồng KHCN phê duyệt',
      durationDays: 36,
      slaDays: 25,
      department: 'Hội đồng KHCN',
      caseType: 'Chủ trương',
      product: 'Đề tài R&D',
    },
    {
      instanceKey: '2251799813690112',
      maHoSo: 'HS-2026-035',
      process: 'RD05.01',
      step: 'Hội đồng Nghiệm thu',
      durationDays: 33,
      slaDays: 22,
      department: 'Hội đồng KHCN',
      caseType: 'Nghiệm thu',
      product: 'Sản phẩm mẫu',
    },
    {
      instanceKey: '2251799813691455',
      maHoSo: 'HS-2026-027',
      process: 'RD01.01',
      step: 'Ký duyệt cấp TT/Khối',
      durationDays: 29,
      slaDays: 15,
      department: 'BGĐ TT/Khối',
      caseType: 'Chủ trương',
      product: 'Đề tài R&D',
    },
  ],
  byDepartment: [
    { key: 'hd', label: 'Hội đồng KHCN', count: 28, overdue: 9, avgDays: 12.1 },
    { key: 'cq', label: 'CQ QLKHCN', count: 34, overdue: 6, avgDays: 6.8 },
    { key: 'cs', label: 'CQ KHCN Cơ sở', count: 38, overdue: 4, avgDays: 5.2 },
    { key: 'tgd', label: 'Ban TGĐ', count: 18, overdue: 4, avgDays: 7.9 },
    { key: 'bgd', label: 'BGĐ TT/Khối', count: 41, overdue: 3, avgDays: 4.0 },
  ],
  byCaseType: [
    { key: 'ct', label: 'Chủ trương', count: 42, overdue: 8, avgDays: 18.4 },
    { key: 'xd', label: 'Xét duyệt', count: 36, overdue: 7, avgDays: 21.6 },
    { key: 'nt', label: 'Nghiệm thu', count: 24, overdue: 3, avgDays: 15.2 },
    { key: 'qt', label: 'Quyết toán', count: 14, overdue: 2, avgDays: 12.8 },
  ],
  byProduct: [
    { key: 'rd', label: 'Đề tài R&D', count: 68, overdue: 12, avgDays: 19.1 },
    { key: 'sp', label: 'Sản phẩm mẫu', count: 28, overdue: 5, avgDays: 16.4 },
    { key: 'da', label: 'Dự án ứng dụng', count: 20, overdue: 3, avgDays: 14.2 },
  ],
  slaByCap: [
    { cap: 'Cơ sở', lateRate: 14, total: 58, late: 8 },
    { cap: 'Tập đoàn', lateRate: 22, total: 68, late: 15 },
  ],
  outcomesByRd: [
    { dimension: 'rd', label: 'RD01', approve: 68, rework: 22, reject: 10 },
    { dimension: 'rd', label: 'RD02', approve: 61, rework: 28, reject: 11 },
    { dimension: 'rd', label: 'RD05', approve: 74, rework: 18, reject: 8 },
    { dimension: 'rd', label: 'RD06', approve: 70, rework: 20, reject: 10 },
  ],
  outcomesByBudget: [
    { dimension: 'budget', label: '< 5 tỷ', approve: 78, rework: 16, reject: 6 },
    { dimension: 'budget', label: '5–20 tỷ', approve: 64, rework: 26, reject: 10 },
    { dimension: 'budget', label: '> 20 tỷ', approve: 52, rework: 34, reject: 14 },
  ],
  outcomesByCap: [
    { dimension: 'cap', label: 'Cơ sở', approve: 72, rework: 20, reject: 8 },
    { dimension: 'cap', label: 'Tập đoàn', approve: 58, rework: 30, reject: 12 },
  ],
  reworkLoops: [
    { times: 0, dossiers: 71 },
    { times: 1, dossiers: 32 },
    { times: 2, dossiers: 14 },
    { times: 3, dossiers: 9 },
  ],
  dmnRuleHits: [
    {
      ruleId: 'DR-BUDGET-20',
      condition: 'tongDuToan ≥ 20 tỷ → cấp Tập đoàn',
      hits: 41,
      blocking: false,
    },
    {
      ruleId: 'DR-HD-BAT-BUOC',
      condition: 'cap = TD ∧ loai = Chủ trương → bắt buộc HĐ',
      hits: 28,
      blocking: false,
    },
    {
      ruleId: 'DR-BLOCK-NS',
      condition: 'ngân sách > trần đơn vị → chặn / trả bổ sung',
      hits: 19,
      blocking: true,
    },
    {
      ruleId: 'DR-CS-NHANH',
      condition: 'cap = CS ∧ NS < 5 tỷ → rút gọn thẩm định',
      hits: 17,
      blocking: false,
    },
    {
      ruleId: 'DR-SLA-ESC',
      condition: 'quá hạn bước HĐ → escalate TGĐ',
      hits: 11,
      blocking: true,
    },
  ],
  unitPerf: [
    { unit: 'CQ KHCN Cơ sở', avgCycleDays: 5.2, completed: 38, overdueRate: 11, overThreshold: false },
    { unit: 'CQ QLKHCN', avgCycleDays: 6.8, completed: 29, overdueRate: 18, overThreshold: false },
    { unit: 'Hội đồng KHCN', avgCycleDays: 12.1, completed: 22, overdueRate: 31, overThreshold: true },
    { unit: 'Ban TGĐ', avgCycleDays: 7.9, completed: 18, overdueRate: 24, overThreshold: true },
    { unit: 'BGĐ TT/Khối', avgCycleDays: 4.0, completed: 41, overdueRate: 8, overThreshold: false },
  ],
  topHandlers: [
    { name: 'Nguyễn Văn A', roleOrGroup: 'CQ_KHCN', completed: 24, avgCycleDays: 4.6 },
    { name: 'Trần Thị B', roleOrGroup: 'CQ_QLKHCN', completed: 21, avgCycleDays: 5.9 },
    { name: 'HĐ KHCN VHT', roleOrGroup: 'HDKHCN', completed: 19, avgCycleDays: 11.2 },
    { name: 'Lê Minh C', roleOrGroup: 'PM', completed: 17, avgCycleDays: 3.1 },
    { name: 'Phạm Quốc D', roleOrGroup: 'BGD', completed: 15, avgCycleDays: 4.4 },
    { name: 'Hoàng E', roleOrGroup: 'CQ_KHCN', completed: 14, avgCycleDays: 5.0 },
    { name: 'Vũ F', roleOrGroup: 'PA', completed: 13, avgCycleDays: 3.8 },
    { name: 'Đỗ G', roleOrGroup: 'CQ_QLKHCN', completed: 12, avgCycleDays: 6.4 },
    { name: 'Ban TGĐ', roleOrGroup: 'TGD_VHT', completed: 11, avgCycleDays: 7.6 },
    { name: 'Ngô H', roleOrGroup: 'NNC', completed: 10, avgCycleDays: 2.9 },
  ],
  unitMetricHeat: [
    { unit: 'CQ KHCN Cơ sở', metric: 'SLA trễ %', value: 11 },
    { unit: 'CQ KHCN Cơ sở', metric: 'Cycle time (ngày)', value: 5.2 },
    { unit: 'CQ QLKHCN', metric: 'SLA trễ %', value: 18 },
    { unit: 'CQ QLKHCN', metric: 'Cycle time (ngày)', value: 6.8 },
    { unit: 'Hội đồng KHCN', metric: 'SLA trễ %', value: 31 },
    { unit: 'Hội đồng KHCN', metric: 'Cycle time (ngày)', value: 12.1 },
    { unit: 'Ban TGĐ', metric: 'SLA trễ %', value: 24 },
    { unit: 'Ban TGĐ', metric: 'Cycle time (ngày)', value: 7.9 },
    { unit: 'BGĐ TT/Khối', metric: 'SLA trễ %', value: 8 },
    { unit: 'BGĐ TT/Khối', metric: 'Cycle time (ngày)', value: 4.0 },
  ],
}

const QUARTER: OptimizeSnapshot = {
  ...MONTH,
  kpi: {
    periodLabel: 'Quý 2/2026',
    byStatus: { processing: 48, approved: 186, rejected: 34, cancelled: 14 },
    runningInstances: 48,
    overdueSla: 9,
    openIncidents: 3,
    avgCycleDays: 19.7,
    slaCompliancePct: 84.1,
    deltaInstancesPct: 6.2,
    deltaIncidents: 0,
    deltaSlaPct: -2.1,
    deltaDurationDays: 1.1,
  },
  backlogTrend: [
    { label: 'T4', open: 44 },
    { label: 'T5', open: 51 },
    { label: 'T6', open: 48 },
  ],
  trendWeekly: [
    { label: 'T4', volume: 38, durationDays: 18.2, incidents: 2 },
    { label: 'T5', volume: 44, durationDays: 19.5, incidents: 3 },
    { label: 'T6', volume: 42, durationDays: 19.7, incidents: 3 },
  ],
  reworkLoops: [
    { times: 0, dossiers: 198 },
    { times: 1, dossiers: 54 },
    { times: 2, dossiers: 22 },
    { times: 3, dossiers: 8 },
  ],
  unitPerf: MONTH.unitPerf.map((u) => ({
    ...u,
    completed: Math.round(u.completed * 2.8),
  })),
  topHandlers: MONTH.topHandlers.map((h) => ({
    ...h,
    completed: Math.round(h.completed * 2.6),
  })),
}

export function getOptimizeSnapshot(period: AnalyticsPeriod): OptimizeSnapshot {
  return period === 'month' ? MONTH : QUARTER
}

export const STATUS_LABEL: Record<StatusBucket, string> = {
  processing: 'Đang xử lý',
  approved: 'Đã phê duyệt',
  rejected: 'Bị từ chối',
  cancelled: 'Hủy',
}

export const STATUS_COLOR: Record<StatusBucket, string> = {
  processing: '#1677ff',
  approved: '#006e0d',
  rejected: '#ba1a1a',
  cancelled: '#8593a3',
}

/** Quy intensity 0..1 → lớp CSS heat 1..5. */
export function heatClass(intensity: number): string {
  if (intensity >= 0.8) return 'vht-heat-5'
  if (intensity >= 0.6) return 'vht-heat-4'
  if (intensity >= 0.4) return 'vht-heat-3'
  if (intensity >= 0.25) return 'vht-heat-2'
  return 'vht-heat-1'
}
