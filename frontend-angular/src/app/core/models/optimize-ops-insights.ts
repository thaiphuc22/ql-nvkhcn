/**
 * Seed báo cáo Optimize cho `/giam-sat` — cycle/bottleneck/gateway/SLA, DMN outcome,
 * đề xuất cải tiến. Port từ webapp/src/data/optimizeOpsInsights.ts (nhánh tranngdt,
 * frontend-mock React). Frontend-only seed; thay Optimize API khi F1 sẵn sàng.
 */

export interface CycleByProcess {
  process: string;
  avgDays: number;
  medianDays: number;
  p95Days: number;
}

export interface ActivityDuration {
  activity: string;
  avgHours: number;
  p95Hours: number;
  instances: number;
}

export interface GatewayBranchRate {
  gateway: string;
  branch: string;
  rate: number;
  count: number;
}

export interface SlaViolationKpi {
  process: string;
  violations: number;
  instances: number;
  rate: number;
}

export interface OutcomeByAttr {
  attr: string;
  value: string;
  approve: number;
  reject: number;
  rework: number;
}

export interface DmnRuleHit {
  ruleId: string;
  condition: string;
  hits: number;
}

export type InsightKind = 'rut_buoc' | 'doi_sla' | 'gom_qt' | 'tach_qt';
export type InsightConfidence = 'cao' | 'trung_binh' | 'thap';

export interface OptimizeInsight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string;
  impact: string;
  confidence: InsightConfidence;
}

export const OPTIMIZE_CYCLE_BY_PROCESS: CycleByProcess[] = [
  { process: 'RD01.01', avgDays: 18.4, medianDays: 16.0, p95Days: 32 },
  { process: 'RD01.02', avgDays: 24.1, medianDays: 22.0, p95Days: 41 },
  { process: 'RD02.01', avgDays: 21.6, medianDays: 19.5, p95Days: 38 },
  { process: 'RD05.01', avgDays: 15.2, medianDays: 14.0, p95Days: 28 },
];

export const OPTIMIZE_BOTTLENECKS: ActivityDuration[] = [
  { activity: 'Hội đồng KHCN phê duyệt', avgHours: 98, p95Hours: 168, instances: 42 },
  { activity: 'Thẩm định Cơ sở / CQNV', avgHours: 76, p95Hours: 120, instances: 58 },
  { activity: 'HĐ Xét duyệt (RD02)', avgHours: 110, p95Hours: 180, instances: 31 },
  { activity: 'TGĐ phê duyệt', avgHours: 58, p95Hours: 96, instances: 36 },
  { activity: 'CQ QLKHCN lập BC', avgHours: 46, p95Hours: 72, instances: 40 },
];

export const OPTIMIZE_GATEWAY_RATES: GatewayBranchRate[] = [
  { gateway: 'Gateway_5 (Ký TT/Khối)', branch: 'Đồng ý', rate: 78, count: 62 },
  { gateway: 'Gateway_5 (Ký TT/Khối)', branch: 'Yêu cầu hiệu chỉnh', rate: 18, count: 14 },
  { gateway: 'Gateway_5 (Ký TT/Khối)', branch: 'Từ chối', rate: 4, count: 3 },
  { gateway: 'Gateway_6 (HĐ thẩm định)', branch: 'Đồng ý', rate: 61, count: 41 },
  { gateway: 'Gateway_6 (HĐ thẩm định)', branch: 'Yêu cầu hiệu chỉnh', rate: 29, count: 20 },
  { gateway: 'Gateway_6 (HĐ thẩm định)', branch: 'Từ chối', rate: 10, count: 7 },
  { gateway: 'Gateway_11_TGD', branch: 'Đồng ý', rate: 72, count: 39 },
  { gateway: 'Gateway_11_TGD', branch: 'Yêu cầu hiệu chỉnh', rate: 22, count: 12 },
  { gateway: 'Gateway_11_TGD', branch: 'Từ chối', rate: 6, count: 3 },
];

export const OPTIMIZE_SLA_KPI: SlaViolationKpi[] = [
  { process: 'RD01.01', violations: 9, instances: 64, rate: 14 },
  { process: 'RD01.02', violations: 11, instances: 38, rate: 29 },
  { process: 'RD02.01', violations: 8, instances: 45, rate: 18 },
  { process: 'RD05.01', violations: 4, instances: 32, rate: 13 },
];

export const OPTIMIZE_OUTCOME_CORR: OutcomeByAttr[] = [
  { attr: 'Cấp', value: 'Cơ sở', approve: 72, reject: 8, rework: 20 },
  { attr: 'Cấp', value: 'Tập đoàn', approve: 58, reject: 12, rework: 30 },
  { attr: 'Ngân sách', value: '< 5 tỷ', approve: 78, reject: 6, rework: 16 },
  { attr: 'Ngân sách', value: '5–20 tỷ', approve: 64, reject: 10, rework: 26 },
  { attr: 'Ngân sách', value: '> 20 tỷ', approve: 52, reject: 14, rework: 34 },
  { attr: 'Loại NV', value: 'RD01', approve: 68, reject: 10, rework: 22 },
  { attr: 'Loại NV', value: 'RD02', approve: 61, reject: 11, rework: 28 },
];

export const OPTIMIZE_DMN_RULE_HITS: DmnRuleHit[] = [
  { ruleId: 'DR-BUDGET-20', condition: 'tongDuToan ≥ 20 tỷ → cấp TĐ', hits: 41 },
  { ruleId: 'DR-HD-BAT-BUOC', condition: 'cap=TD ∧ Chủ trương → bắt buộc HĐ', hits: 28 },
  { ruleId: 'DR-BLOCK-NS', condition: 'NS > trần đơn vị → trả bổ sung', hits: 19 },
  { ruleId: 'DR-CS-NHANH', condition: 'cap=CS ∧ NS<5 tỷ → rút gọn', hits: 17 },
];

export const OPTIMIZE_INSIGHTS: OptimizeInsight[] = [
  {
    id: 'INS-01',
    kind: 'doi_sla',
    title: 'Nới SLA bước Hội đồng KHCN (+2 ngày)',
    detail:
      'P95 thời lượng HĐ = 168h; 31% instance quá hạn tại bước này. Nới timer boundary giảm false-positive escalate.',
    impact: 'Giảm ~8–12 vi phạm SLA/tháng (ước lượng)',
    confidence: 'cao',
  },
  {
    id: 'INS-02',
    kind: 'rut_buoc',
    title: 'Rút bước ký trùng ở cấp CS khi NS < 5 tỷ',
    detail:
      'Rule DR-CS-NHANH đã khớp 17 lần; nhánh "ký TT/Khối" ít đổi outcome. Có thể gom ký + thẩm định gọn.',
    impact: 'Giảm ~2.5 ngày cycle TB trên luồng CS nhỏ',
    confidence: 'trung_binh',
  },
  {
    id: 'INS-03',
    kind: 'tach_qt',
    title: 'Tách RD01.02 (TĐ) khỏi template CS',
    detail:
      'Gateway/PNX liên ngành trên RD01.02 chiếm 40% thời lượng; khác biệt cấu trúc so với RD01.01 đủ lớn để tách definition.',
    impact: 'Giảm nhiễu báo cáo Optimize + SLA riêng theo cấp',
    confidence: 'trung_binh',
  },
  {
    id: 'INS-04',
    kind: 'gom_qt',
    title: 'Gom subprocess "ký duyệt HS" dùng chung RD01/RD02',
    detail:
      '3 gateway ký có tỷ lệ Đồng ý tương đương (~70–78%). Call-activity dùng chung giảm drift BPMN.',
    impact: 'Ít bảo trì + đồng bộ heatmap/branch report',
    confidence: 'thap',
  },
];

export const INSIGHT_KIND_LABEL: Record<InsightKind, string> = {
  rut_buoc: 'Rút bớt bước',
  doi_sla: 'Thay đổi SLA',
  gom_qt: 'Gom quy trình',
  tach_qt: 'Tách quy trình',
};

export const INSIGHT_CONFIDENCE_LABEL: Record<InsightConfidence, string> = {
  cao: 'Độ tin cậy cao',
  trung_binh: 'Độ tin cậy trung bình',
  thap: 'Độ tin cậy thấp',
};

export const INSIGHT_CONFIDENCE_COLOR: Record<InsightConfidence, string> = {
  cao: 'success',
  trung_binh: 'warning',
  thap: 'default',
};

/** Đậm nhạt heat theo p95Hours — quy về 0..1 (180h ≈ điểm nóng nhất trong seed). */
export function bottleneckHeat(p95Hours: number): number {
  return Math.min(1, p95Hours / 180);
}
