/**
 * Mock Camunda Optimize analytics — lãnh đạo nhìn năng lực xử lý đa quy trình.
 * Port từ webapp/src/data/optimizeAnalytics.ts (nhánh tranngdt, frontend-mock).
 * Frontend-only seed; thay bằng Optimize API / Operate khi F1 sẵn sàng.
 * Kỳ tham chiếu demo: Tháng 6/2026 & Quý 2/2026.
 */

export type AnalyticsPeriod = 'month' | 'quarter';

export type StatusBucket = 'processing' | 'approved' | 'rejected' | 'cancelled';

export interface PeriodKpi {
  periodLabel: string;
  /** Tổng hồ sơ trong kỳ theo trạng thái (Optimize process-instance aggregates). */
  byStatus: Record<StatusBucket, number>;
  runningInstances: number;
  overdueSla: number;
  openIncidents: number;
  /** Overall cycle time: nộp → quyết định cuối (ngày). */
  avgCycleDays: number;
}

export interface CapBudgetSlice {
  cap: 'Cơ sở' | 'Tập đoàn';
  budgetBand: string;
  count: number;
}

export interface StepLoad {
  step: string;
  count: number;
}

export interface StepCycle {
  step: string;
  avgDays: number;
}

export interface UnitPerf {
  unit: string;
  avgCycleDays: number;
  completed: number;
  overdueRate: number;
  /** Vượt ngưỡng SLA nội bộ (highlight). */
  overThreshold: boolean;
}

export interface TopHandler {
  name: string;
  roleOrGroup: string;
  completed: number;
  avgCycleDays: number;
}

/** Heat trên BPMN — intensity 0..1 (Optimize heatmap). */
export interface BpmnHeatCell {
  elementId: string;
  label: string;
  intensity: number;
  openCount: number;
  avgCycleDays: number;
}

export interface UnitSlaHeat {
  unit: string;
  metric: 'SLA trễ %' | 'Cycle time (ngày)';
  value: number;
}

export interface OptimizeSnapshot {
  kpi: PeriodKpi;
  byCapBudget: CapBudgetSlice[];
  stepLoad: StepLoad[];
  topSlowSteps: StepCycle[];
  unitPerf: UnitPerf[];
  topHandlers: TopHandler[];
  unitMetricHeat: UnitSlaHeat[];
}

/** Quy trình có BPMN mock + seed heatmap Optimize. */
export const BPMN_HEAT_PROCESS_OPTIONS = [
  { ma: 'RD01.01', ten: 'Xét duyệt Chủ trương cấp Cơ sở' },
  { ma: 'RD01.02', ten: 'Xét duyệt Chủ trương cấp Tập đoàn' },
  { ma: 'RD02.01', ten: 'Xét duyệt NV KHCN cấp Cơ sở' },
] as const;

export type BpmnHeatProcessMa = (typeof BPMN_HEAT_PROCESS_OPTIONS)[number]['ma'];

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
};

export function getBpmnHeat(processMa: BpmnHeatProcessMa): BpmnHeatCell[] {
  return BPMN_HEAT_BY_PROCESS[processMa] ?? [];
}

const MONTH: OptimizeSnapshot = {
  kpi: {
    periodLabel: 'Tháng 6/2026',
    byStatus: { processing: 48, approved: 62, rejected: 11, cancelled: 5 },
    runningInstances: 48,
    overdueSla: 9,
    openIncidents: 3,
    avgCycleDays: 18.4,
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
};

const QUARTER: OptimizeSnapshot = {
  ...MONTH,
  kpi: {
    periodLabel: 'Quý 2/2026',
    byStatus: { processing: 48, approved: 186, rejected: 34, cancelled: 14 },
    runningInstances: 48,
    overdueSla: 9,
    openIncidents: 3,
    avgCycleDays: 19.7,
  },
  unitPerf: MONTH.unitPerf.map((u) => ({
    ...u,
    completed: Math.round(u.completed * 2.8),
  })),
  topHandlers: MONTH.topHandlers.map((h) => ({
    ...h,
    completed: Math.round(h.completed * 2.6),
  })),
};

export function getOptimizeSnapshot(period: AnalyticsPeriod): OptimizeSnapshot {
  return period === 'month' ? MONTH : QUARTER;
}

export const STATUS_LABEL: Record<StatusBucket, string> = {
  processing: 'Đang xử lý',
  approved: 'Đã phê duyệt',
  rejected: 'Bị từ chối',
  cancelled: 'Hủy',
};

export const STATUS_COLOR: Record<StatusBucket, string> = {
  processing: '#1677ff',
  approved: '#006e0d',
  rejected: '#ba1a1a',
  cancelled: '#8593a3',
};

/** Quy intensity 0..1 → lớp CSS heat 1..5. */
export function heatClass(intensity: number): string {
  if (intensity >= 0.8) return 'vht-heat-5';
  if (intensity >= 0.6) return 'vht-heat-4';
  if (intensity >= 0.4) return 'vht-heat-3';
  if (intensity >= 0.25) return 'vht-heat-2';
  return 'vht-heat-1';
}
