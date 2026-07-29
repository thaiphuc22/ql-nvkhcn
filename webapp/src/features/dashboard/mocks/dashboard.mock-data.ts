import type { DashboardFilter, KpiMetric, MissionLifecycleStage, MissionSummary, RiskAlert, HeatmapCell } from '../models/dashboard.models'
import type { MissionDashboardData } from '../models/mission-dashboard.models'
import type { ProcessPerformanceData } from '../models/process-dashboard.models'
import type { AdoptionMetric, CouncilMetric, FinanceMetric, IntegrationHealthData, ResourceMetric, TaskWorkloadMetric } from '../models/integration-dashboard.models'

export const ORGANIZATIONS = [
  { id: 'DV001', name: 'Trung tâm Nghiên cứu Công nghệ' },
  { id: 'DV002', name: 'Khối Kỹ thuật' },
  { id: 'DV003', name: 'Ban Công nghiệp Công nghệ cao' },
  { id: 'DV004', name: 'Trung tâm Phần mềm' },
  { id: 'DV005', name: 'Trung tâm Sản phẩm' },
]

export const MISSION_TYPES = ['Đề tài KHCN', 'Dự án KHCN', 'Dự án sản xuất thử nghiệm', 'Dự án đầu tư hỗ trợ KHCN']
export const SCIENCE_FIELDS = ['Công nghệ thông tin', 'Viễn thông', 'Điện tử', 'Vật liệu', 'Cơ khí chính xác']
export const STATUSES = ['Đúng tiến độ', 'Có nguy cơ chậm', 'Quá hạn', 'Chờ phê duyệt', 'Hoàn thành']
export const PROCESS_CODES = ['RD01', 'RD02', 'RD03', 'RD04', 'RD05', 'RD06', 'RD07', 'RD08', 'RD09', 'RD10']

const OWNERS = ['Nguyễn Văn An', 'Trần Minh Đức', 'Lê Hoàng Nam', 'Phạm Thu Hà', 'Vũ Quốc Huy']

const MISSION_NAMES = [
  'Nghiên cứu phát triển nền tảng AI hỗ trợ phân tích dữ liệu',
  'Phát triển thiết bị thông tin thế hệ mới',
  'Nghiên cứu công nghệ radar đa chức năng',
  'Phát triển hệ thống mô phỏng và thử nghiệm',
  'Xây dựng nền tảng quản trị dữ liệu KHCN',
  'Nghiên cứu chip viễn thông tốc độ cao',
  'Phát triển giải pháp bảo mật mạng quân sự',
  'Thử nghiệm sản xuất thiết bị IoT công nghiệp',
  'Đề tài vật liệu composite cho thiết bị bay',
  'Hệ thống nhận dạng hình ảnh thời gian thực',
  'Nền tảng điều phối quy trình KHCN tập trung',
  'Nghiên cứu anten mảng thông minh',
  'Phát triển phần mềm mô phỏng radar',
  'Đề tài công nghệ 5G nội bộ',
  'Dự án sản xuất thử nghiệm thiết bị đo lường',
  'Nghiên cứu năng lượng pin lithium công nghiệp',
  'Hệ thống quản lý tài sản KHCN tích hợp',
  'Phát triển module xử lý tín hiệu số',
  'Đề tài robot kiểm tra hạ tầng viễn thông',
  'Nghiên cứu công nghệ blockchain cho hồ sơ KHCN',
  'Dự án đầu tư hỗ trợ phòng lab thử nghiệm',
  'Phát triển nền tảng học máy cho bảo trì dự báo',
]

export const MISSIONS: MissionSummary[] = MISSION_NAMES.map((name, i) => ({
  id: `NV${String(i + 1).padStart(3, '0')}`,
  code: `RD.2026.${String(i + 1).padStart(3, '0')}`,
  name,
  missionType: MISSION_TYPES[i % MISSION_TYPES.length],
  managementLevel: i % 3 === 0 ? 'Cấp Tập đoàn' : 'Cấp Cơ sở',
  scienceField: SCIENCE_FIELDS[i % SCIENCE_FIELDS.length],
  organizationName: ORGANIZATIONS[i % ORGANIZATIONS.length].name,
  ownerName: OWNERS[i % OWNERS.length],
  totalBudget: 800_000_000 + i * 120_000_000,
  period: '01/2026 – 12/2028',
  status: STATUSES[i % STATUSES.length],
  riskLevel: i % 5 === 0 ? 'Cao' : i % 3 === 0 ? 'Trung bình' : 'Thấp',
  progressPct: Math.min(95, 15 + i * 4),
}))

const ALERT_CATEGORIES = [
  'Chậm xử lý hồ sơ', 'Chậm tiến độ nhiệm vụ', 'Vượt dự toán', 'Thiếu hồ sơ',
  'Thiếu chữ ký', 'Thiếu thành viên Hội đồng', 'Nhân sự quá tải', 'Mua sắm chậm',
  'Sản phẩm chậm', 'Lỗi đồng bộ dữ liệu',
]

const SEVERITIES: RiskAlert['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const ALERT_STATUSES: RiskAlert['status'][] = ['OPEN', 'IN_PROGRESS', 'RESOLVED']

export const RISK_ALERTS: RiskAlert[] = Array.from({ length: 32 }, (_, i) => {
  const m = MISSIONS[i % MISSIONS.length]
  return {
    id: `AL${String(i + 1).padStart(3, '0')}`,
    severity: SEVERITIES[i % SEVERITIES.length],
    missionCode: m.code,
    missionName: m.name,
    category: ALERT_CATEGORIES[i % ALERT_CATEGORIES.length],
    message: `${ALERT_CATEGORIES[i % ALERT_CATEGORIES.length]} — cần xử lý trong 3 ngày làm việc`,
    ownerName: m.ownerName,
    organizationName: m.organizationName,
    detectedAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    dueDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String(((i + 5) % 28) + 1).padStart(2, '0')}`,
    status: ALERT_STATUSES[i % ALERT_STATUSES.length],
  }
})

export const MONTHS_12 = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

function inFilterMission(m: MissionSummary, f: DashboardFilter): boolean {
  if (f.organizationIds?.length && !f.organizationIds.includes(ORGANIZATIONS.find((o) => o.name === m.organizationName)?.id ?? '')) return false
  if (f.managementLevels?.length && !f.managementLevels.includes(m.managementLevel)) return false
  if (f.missionTypes?.length && !f.missionTypes.includes(m.missionType)) return false
  if (f.scienceFields?.length && !f.scienceFields.includes(m.scienceField)) return false
  if (f.statuses?.length && !f.statuses.includes(m.status)) return false
  return true
}

export function filterMissions(filter: DashboardFilter): MissionSummary[] {
  return MISSIONS.filter((m) => inFilterMission(m, filter))
}

export function filterAlerts(filter: DashboardFilter): RiskAlert[] {
  const codes = new Set(filterMissions(filter).map((m) => m.code))
  return RISK_ALERTS.filter((a) => codes.has(a.missionCode))
}

export function getExecutiveData(filter: DashboardFilter) {
  const missions = filterMissions(filter)
  const alerts = filterAlerts(filter)
  const kpis: KpiMetric[] = [
    { id: 'active', title: 'Tổng nhiệm vụ đang hoạt động', value: missions.filter((m) => m.status !== 'Hoàn thành').length, changePercent: 4.2, trend: 'up', status: 'neutral', tooltip: 'Số nhiệm vụ chưa hoàn thành trong phạm vi lọc', filterKey: 'active' },
    { id: 'onTrack', title: 'Đúng tiến độ', value: missions.filter((m) => m.status === 'Đúng tiến độ').length, changePercent: 2.1, trend: 'up', status: 'success', tooltip: 'Nhiệm vụ đang thực hiện đúng kế hoạch', filterKey: 'onTrack' },
    { id: 'atRisk', title: 'Có nguy cơ chậm', value: missions.filter((m) => m.status === 'Có nguy cơ chậm').length, changePercent: -1.5, trend: 'down', status: 'warning', tooltip: 'Cần theo dõi sát, có dấu hiệu trễ hạn', filterKey: 'atRisk' },
    { id: 'overdue', title: 'Quá hạn', value: missions.filter((m) => m.status === 'Quá hạn').length, changePercent: 0.8, trend: 'up', status: 'danger', tooltip: 'Đã vượt hạn xử lý hoặc mốc kế hoạch', filterKey: 'overdue' },
    { id: 'pending', title: 'Chờ phê duyệt', value: missions.filter((m) => m.status === 'Chờ phê duyệt').length, changePercent: -3.2, trend: 'down', status: 'warning', tooltip: 'Đang chờ quyết định phê duyệt', filterKey: 'pending' },
    { id: 'critical', title: 'Cảnh báo nghiêm trọng', value: alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length, changePercent: 1.1, trend: 'up', status: 'danger', tooltip: 'Cảnh báo mức nghiêm trọng chưa xử lý xong', filterKey: 'critical' },
  ]
  const lifecycle: MissionLifecycleStage[] = [
    { stage: 'khoi_tao', label: 'Khởi tạo', count: 3 },
    { stage: 'xet_duyet_chu_truong', label: 'Đang xét duyệt chủ trương', count: 4 },
    { stage: 'da_duyet_chu_truong', label: 'Đã duyệt chủ trương', count: 5 },
    { stage: 'xet_duyet_nhiem_vu', label: 'Đang xét duyệt nhiệm vụ', count: 3 },
    { stage: 'da_phe_duyet', label: 'Đã phê duyệt nhiệm vụ', count: 6 },
    { stage: 'dang_thuc_hien', label: 'Đang thực hiện', count: 12 },
    { stage: 'nghiem_thu', label: 'Nghiệm thu', count: 4 },
    { stage: 'quyet_toan', label: 'Quyết toán', count: 2 },
    { stage: 'hoan_thanh', label: 'Hoàn thành', count: 3 },
  ]
  const monthly = MONTHS_12.map((m, i) => ({ month: m, started: 2 + (i % 5), completed: 1 + (i % 4) }))
  const byLevel = [
    { label: 'Cấp Cơ sở', value: missions.filter((m) => m.managementLevel === 'Cấp Cơ sở').length },
    { label: 'Cấp Tập đoàn', value: missions.filter((m) => m.managementLevel === 'Cấp Tập đoàn').length },
  ]
  const heatmap: HeatmapCell[] = ORGANIZATIONS.flatMap((org) =>
    STATUSES.slice(0, 4).map((st) => ({
      row: org.name,
      col: st,
      value: missions.filter((m) => m.organizationName === org.name && m.status === st).length + (org.id.charCodeAt(3) % 3),
    })),
  )
  const topRisk = [...missions].sort((a, _b) => (a.riskLevel === 'Cao' ? -1 : 1)).slice(0, 10)
  const slowSteps = [
    { label: 'RD01 — Thẩm định hồ sơ', value: 12.4 },
    { label: 'RD02 — Họp Hội đồng', value: 9.8 },
    { label: 'RD05 — Nghiệm thu sản phẩm', value: 8.2 },
    { label: 'RD06 — Quyết toán kinh phí', value: 7.5 },
    { label: 'RD01 — Ký duyệt cấp Tập đoàn', value: 6.9 },
  ]
  return { kpis, lifecycle, monthly, byLevel, heatmap, topRisk, slowSteps, alerts: alerts.slice(0, 20) }
}

export function getPortfolioData(filter: DashboardFilter) {
  const missions = filterMissions(filter)
  const kpis: KpiMetric[] = [
    { id: 'total', title: 'Tổng số nhiệm vụ', value: missions.length, tooltip: 'Tổng nhiệm vụ trong phạm vi lọc' },
    { id: 'new', title: 'Nhiệm vụ mới trong kỳ', value: Math.max(1, Math.round(missions.length * 0.15)), changePercent: 6, trend: 'up', status: 'success' },
    { id: 'budget', title: 'Tổng kinh phí', value: missions.reduce((s, m) => s + m.totalBudget, 0), unit: 'đ', tooltip: 'Tổng dự toán được duyệt' },
    { id: 'orgs', title: 'Số đơn vị chủ trì', value: new Set(missions.map((m) => m.organizationName)).size },
    { id: 'partners', title: 'Số đối tác phối hợp', value: 8 },
    { id: 'onTime', title: 'Tỷ lệ hoàn thành đúng hạn', value: 78, unit: '%', status: 'success' },
  ]
  const byType = MISSION_TYPES.map((t) => ({ label: t, value: missions.filter((m) => m.missionType === t).length }))
  const byField = SCIENCE_FIELDS.map((f) => ({ label: f, value: missions.filter((m) => m.scienceField === f).length }))
  const byOrg = ORGANIZATIONS.map((o) => ({ label: o.name, value: missions.filter((m) => m.organizationName === o.name).length }))
  const byLevel = [{ label: 'Cấp Cơ sở', value: missions.filter((m) => m.managementLevel === 'Cấp Cơ sở').length }, { label: 'Cấp Tập đoàn', value: missions.filter((m) => m.managementLevel === 'Cấp Tập đoàn').length }]
  const budgetByField = SCIENCE_FIELDS.map((f, i) => ({ label: f, value: 2_000_000_000 + i * 500_000_000 }))
  const budgetByOrg = ORGANIZATIONS.map((o, i) => ({ label: o.name, value: 1_500_000_000 + i * 400_000_000 }))
  const bySource = [
    { label: 'Quỹ phát triển KH&CN Viettel', value: 12 },
    { label: 'Nguồn tự có', value: 6 },
    { label: 'Nguồn liên doanh/phối hợp', value: 3 },
    { label: 'Nguồn kinh phí khác', value: 1 },
  ]
  const byPlanYear = [{ label: '2024', value: 2 }, { label: '2025', value: 5 }, { label: '2026', value: missions.length - 7 }]
  return { kpis, missions, byType, byField, byOrg, byLevel, budgetByField, budgetByOrg, bySource, byPlanYear }
}

export function getMissionDashboard(missionId: string): MissionDashboardData | null {
  const summary = MISSIONS.find((m) => m.id === missionId || m.code === missionId)
  if (!summary) return null
  return {
    summary,
    kpis: [
      { id: 'progress', title: 'Tiến độ', value: summary.progressPct, unit: '%', status: summary.progressPct >= 70 ? 'success' : 'warning' },
      { id: 'budget', title: 'Giải ngân', value: 62, unit: '%' },
      { id: 'alerts', title: 'Cảnh báo mở', value: RISK_ALERTS.filter((a) => a.missionCode === summary.code && a.status !== 'RESOLVED').length, status: 'warning' },
      { id: 'staff', title: 'Nhân sự', value: 8 },
    ],
    currentStage: 'Đang thực hiện',
    currentStep: 'RD05 — Nghiệm thu sản phẩm',
    currentAssignee: summary.ownerName,
    daysRemaining: summary.status === 'Quá hạn' ? -12 : 45,
    lifecycleTimeline: [
      { stage: 'Khởi tạo', at: '15/01/2026' },
      { stage: 'Duyệt chủ trương', at: '20/02/2026' },
      { stage: 'Phê duyệt nhiệm vụ', at: '10/04/2026' },
      { stage: 'Thực hiện', at: '01/05/2026', active: true },
      { stage: 'Nghiệm thu' },
      { stage: 'Quyết toán' },
    ],
    milestones: [
      { id: 'M1', name: 'Hoàn thiện thiết kế', plannedDate: '30/06/2026', actualDate: '28/06/2026', status: 'Hoàn thành', ownerName: summary.ownerName, deltaDays: -2 },
      { id: 'M2', name: 'Tích hợp thử nghiệm', plannedDate: '30/09/2026', status: 'Đang thực hiện', ownerName: 'Trần Minh Đức', deltaDays: 0 },
      { id: 'M3', name: 'Nghiệm thu sản phẩm', plannedDate: '15/12/2026', status: 'Chưa bắt đầu', ownerName: summary.ownerName, deltaDays: 0 },
    ],
    finance: {
      approvedBudget: summary.totalBudget,
      spent: Math.round(summary.totalBudget * 0.42),
      remaining: Math.round(summary.totalBudget * 0.58),
      disbursementPct: 42,
      monthlyPlan: MONTHS_12.map((m, i) => ({ month: m, plan: 80_000_000 + i * 5_000_000, actual: 60_000_000 + i * 4_000_000 })),
      rows: [
        { source: 'Quỹ phát triển KH&CN Viettel', category: 'Nhân công', planned: 400_000_000, committed: 380_000_000, spent: 180_000_000, remaining: 220_000_000 },
        { source: 'Nguồn tự có', category: 'Mua sắm', planned: 300_000_000, committed: 250_000_000, spent: 120_000_000, remaining: 180_000_000 },
      ],
    },
    staff: OWNERS.map((name, i) => ({
      name, role: i === 0 ? 'Chủ nhiệm' : 'Thành viên', organization: summary.organizationName,
      allocationPct: i === 0 ? 30 : 15, status: 'Đang tham gia', workload: i === 4 ? 'Quá tải' : 'Bình thường',
      warning: i === 4 ? 'Phân bổ > 100%' : undefined,
    })),
    procurement: [
      { type: 'Tờ trình', name: 'TT-MS-2026-01', status: 'Đã phê duyệt', amount: 120_000_000 },
      { type: 'Gói thầu', name: 'GT-TB-2026-03', status: 'Đang thực hiện', amount: 450_000_000 },
      { type: 'Hợp đồng', name: 'HD-2026-015', status: 'Đã ký', amount: 380_000_000 },
    ],
    products: [
      { name: 'Module xử lý lõi', productType: 'Phần mềm', target: 'Đạt 99.5% uptime', progressPct: 75, result: 'Đang thử nghiệm', acceptanceStatus: 'Chưa nghiệm thu', ipStatus: 'Đang đăng ký' },
    ],
    dossiers: [
      { name: 'Hồ sơ đề xuất chủ trương', formType: 'RD01.01', version: 'v3', creator: summary.ownerName, signer: 'Lãnh đạo đơn vị', updatedAt: '10/02/2026', status: 'Đã ký' },
      { name: 'Hồ sơ nghiệm thu', formType: 'RD05.01', version: 'v1', creator: summary.ownerName, updatedAt: '01/07/2026', status: 'Đang soạn' },
    ],
    alerts: RISK_ALERTS.filter((a) => a.missionCode === summary.code),
    auditLog: [
      { at: '15/01/2026 09:00', actor: summary.ownerName, action: 'Khởi tạo nhiệm vụ', after: summary.code },
      { at: '20/02/2026 14:30', actor: 'CQ QLKHCN', action: 'Phê duyệt chủ trương', before: 'Chờ duyệt', after: 'Đã duyệt' },
    ],
  }
}

export function getProcessPerformance(_filter: DashboardFilter): ProcessPerformanceData {
  return {
    kpis: [
      { id: 'started7d', title: 'Quy trình khởi tạo trong 7 ngày', value: 28, status: 'neutral' },
      { id: 'running', title: 'Instance đang chạy', value: 156 },
      { id: 'completed', title: 'Instance đã hoàn thành', value: 892, status: 'success' },
      { id: 'slaBreached', title: 'Instance quá SLA', value: 23, status: 'danger' },
      { id: 'incidents', title: 'Sự cố đang mở', value: 7, status: 'warning' },
      { id: 'slaPct', title: 'Tỷ lệ hoàn thành đúng SLA', value: 91.2, unit: '%', status: 'success' },
      { id: 'avgDur', title: 'Thời gian xử lý TB', value: 4.6, unit: 'ngày' },
      { id: 'p50', title: 'P50', value: 3.2, unit: 'ngày' },
      { id: 'p90', title: 'P90', value: 8.5, unit: 'ngày' },
      { id: 'p95', title: 'P95', value: 12.1, unit: 'ngày' },
    ],
    monthlyTrend: MONTHS_12.map((m, i) => ({ month: m, started: 20 + i, completed: 18 + i, avgDurationDays: 3.5 + (i % 4) * 0.3 })),
    avgDurationByProcess: PROCESS_CODES.slice(0, 6).map((c, i) => ({ label: c, value: 2.5 + i * 0.8 })),
    slaByProcess: PROCESS_CODES.slice(0, 6).map((c, i) => ({ label: c, value: 95 - i * 2 })),
    happyPathPct: 82,
    unwantedPathPct: 18,
    outcomes: [
      { outcome: 'Phê duyệt', count: 520 },
      { outcome: 'Từ chối', count: 45 },
      { outcome: 'Yêu cầu hoàn thiện', count: 128 },
      { outcome: 'Hủy', count: 12 },
    ],
    bottleneckNodes: [
      { nodeId: 'Task_Thẩm định', nodeName: 'Thẩm định hồ sơ', totalInstances: 320, outlierCount: 28, avgDurationDays: 5.2, p95Days: 11.3, slaBreachedPct: 8.7 },
      { nodeId: 'Task_HoiDong', nodeName: 'Họp Hội đồng', totalInstances: 180, outlierCount: 15, avgDurationDays: 7.1, p95Days: 14.2, slaBreachedPct: 12.4 },
    ],
    incidentNodes: [
      { nodeId: 'Task_TichHop', nodeName: 'Đồng bộ SAP', totalInstances: 450, outlierCount: 0, avgDurationDays: 0.5, p95Days: 1.2, slaBreachedPct: 2.1 },
    ],
    outlierNodes: [
      { nodeId: 'Task_QuyetToan', nodeName: 'Quyết toán kinh phí', totalInstances: 95, outlierCount: 12, avgDurationDays: 9.8, p95Days: 18.5, slaBreachedPct: 15.8 },
    ],
  }
}

export function getTaskWorkload(_filter: DashboardFilter) {
  const kpis: KpiMetric[] = [
    { id: 'pending', title: 'Tổng việc đang chờ', value: 87 },
    { id: 'unassigned', title: 'Việc chưa có người nhận', value: 12, status: 'warning' },
    { id: 'dueSoon', title: 'Việc sắp đến hạn', value: 23, status: 'warning' },
    { id: 'overdue', title: 'Việc quá hạn', value: 9, status: 'danger' },
    { id: 'avgHandle', title: 'Thời gian xử lý TB', value: 2.3, unit: 'ngày' },
    { id: 'onTime', title: 'Tỷ lệ hoàn thành đúng hạn', value: 88, unit: '%', status: 'success' },
  ]
  const byAssignee = OWNERS.map((n, i) => ({ label: n, value: 8 + i * 3 }))
  const byOrg = ORGANIZATIONS.map((o, i) => ({ label: o.name, value: 10 + i * 5 }))
  const byRole = [{ label: 'Chuyên viên', value: 35 }, { label: 'Lãnh đạo', value: 18 }, { label: 'Hội đồng', value: 12 }]
  const aging = [
    { label: 'Dưới 1 ngày', value: 28 },
    { label: '1–3 ngày', value: 32 },
    { label: '3–7 ngày', value: 19 },
    { label: 'Trên 7 ngày', value: 8 },
  ]
  const rows: TaskWorkloadMetric[] = OWNERS.map((assignee, i) => ({
    assignee,
    organization: ORGANIZATIONS[i % ORGANIZATIONS.length].name,
    role: i === 0 ? 'Chủ nhiệm' : 'Chuyên viên',
    inProgress: 3 + i,
    dueSoon: 1 + (i % 3),
    overdue: i % 4 === 0 ? 1 : 0,
    completedInPeriod: 12 + i * 2,
    avgHandleDays: 1.5 + i * 0.3,
    onTimePct: 90 - i * 2,
  }))
  return { kpis, byAssignee, byOrg, byRole, aging, rows }
}

export function getCouncilAnalytics(_filter: DashboardFilter) {
  const kpis: KpiMetric[] = [
    { id: 'formed', title: 'Hội đồng đã thành lập', value: 18 },
    { id: 'upcoming', title: 'Phiên họp sắp diễn ra', value: 4, status: 'warning' },
    { id: 'missingReview', title: 'Thành viên chưa nộp phiếu nhận xét', value: 6, status: 'warning' },
    { id: 'missingEval', title: 'Phiếu đánh giá còn thiếu', value: 3 },
    { id: 'unsigned', title: 'Biên bản chưa ký đủ', value: 2, status: 'danger' },
    { id: 'pendingDecision', title: 'Quyết định đang chờ ký', value: 5 },
    { id: 'passRate', title: 'Tỷ lệ hồ sơ được thông qua', value: 76, unit: '%', status: 'success' },
  ]
  const results = [{ label: 'Thông qua', value: 42 }, { label: 'Không thông qua', value: 8 }, { label: 'Hoàn thiện', value: 15 }]
  const criteria = [{ label: 'Tính mới', value: 7.8 }, { label: 'Khả thi', value: 7.2 }, { label: 'Hiệu quả', value: 7.5 }]
  const rows: CouncilMetric[] = MISSIONS.slice(0, 8).map((m, i) => ({
    councilCode: `HD${String(i + 1).padStart(3, '0')}`,
    missionName: m.name,
    councilLevel: m.managementLevel === 'Cấp Tập đoàn' ? 'Cấp Tập đoàn' : 'Cấp cơ sở',
    chairName: 'PGS.TS Nguyễn Văn An',
    meetingDate: `2026-0${(i % 6) + 1}-15`,
    attendees: 7 + (i % 3),
    reviewVotes: `${5 + (i % 3)}/7`,
    evaluationVotes: `${4 + (i % 4)}/7`,
    result: i % 3 === 0 ? 'Thông qua' : i % 3 === 1 ? 'Hoàn thiện' : 'Chờ họp',
    minutesSignStatus: i % 4 === 0 ? 'Chưa ký đủ' : 'Đã ký',
  }))
  return { kpis, results, criteria, avgByCouncil: [{ label: 'HD cơ sở', value: 7.4 }, { label: 'HD Tập đoàn', value: 8.1 }], attendance: [{ label: 'Tham dự', value: 85 }, { label: 'Vắng', value: 15 }], timeToConclusion: [{ label: 'TB (ngày)', value: 21 }], reworkRate: [{ label: 'Họp lại', value: 12 }], rows }
}

export function getFinanceAnalytics(filter: DashboardFilter) {
  const missions = filterMissions(filter)
  const total = missions.reduce((s, m) => s + m.totalBudget, 0)
  const kpis: KpiMetric[] = [
    { id: 'approved', title: 'Tổng dự toán được duyệt', value: total, unit: 'đ' },
    { id: 'committed', title: 'Kinh phí đã cam kết', value: Math.round(total * 0.72), unit: 'đ' },
    { id: 'spent', title: 'Chi phí đã thực hiện', value: Math.round(total * 0.45), unit: 'đ' },
    { id: 'remaining', title: 'Kinh phí còn lại', value: Math.round(total * 0.55), unit: 'đ' },
    { id: 'disbursement', title: 'Tỷ lệ giải ngân', value: 45, unit: '%' },
    { id: 'overBudget', title: 'NV vượt/nguy cơ vượt dự toán', value: 3, status: 'danger' },
    { id: 'available', title: 'Ngân sách còn khả dụng', value: Math.round(total * 0.28), unit: 'đ', status: 'success' },
  ]
  const monthly = MONTHS_12.map((m, i) => ({ month: m, plan: 200_000_000 + i * 10_000_000, actual: 150_000_000 + i * 8_000_000 }))
  const bySource = [
    { label: 'Quỹ phát triển KH&CN Viettel', value: 45 },
    { label: 'Nguồn tự có', value: 30 },
    { label: 'Nguồn liên doanh/phối hợp', value: 18 },
    { label: 'Nguồn kinh phí khác', value: 7 },
  ]
  const rows: FinanceMetric[] = missions.slice(0, 15).map((m, i) => ({
    missionCode: m.code,
    missionName: m.name,
    approvedBudget: m.totalBudget,
    committed: Math.round(m.totalBudget * 0.7),
    spent: Math.round(m.totalBudget * (0.3 + (i % 5) * 0.05)),
    remaining: Math.round(m.totalBudget * 0.4),
    disbursementPct: 30 + (i % 5) * 10,
    planDelta: i % 4 === 0 ? -5 : 2,
    warning: i % 4 === 0 ? 'Chậm giải ngân' : undefined,
  }))
  return { kpis, monthly, bySource, byOrg: ORGANIZATIONS.map((o, i) => ({ label: o.name, value: 1_000_000_000 + i * 300_000_000 })), byField: SCIENCE_FIELDS.map((f, i) => ({ label: f, value: 800_000_000 + i * 200_000_000 })), byType: MISSION_TYPES.map((t, i) => ({ label: t, value: 600_000_000 + i * 150_000_000 })), topSpend: rows.slice(0, 5), slowDisburse: rows.filter((r) => r.disbursementPct < 40), rows }
}

export function getResourceAnalytics(_filter: DashboardFilter) {
  const kpis: KpiMetric[] = [
    { id: 'staff', title: 'Tổng nhân sự tham gia', value: 124 },
    { id: 'overload', title: 'Nhân sự quá tải', value: 8, status: 'warning' },
    { id: 'procurement', title: 'Gói thầu đang thực hiện', value: 15 },
    { id: 'contracts', title: 'Hợp đồng sắp hết hạn', value: 4, status: 'warning' },
    { id: 'assets', title: 'Tài sản đã hình thành', value: 32, status: 'success' },
    { id: 'productsOk', title: 'Sản phẩm đúng tiến độ', value: 18, status: 'success' },
    { id: 'productsLate', title: 'Sản phẩm chậm tiến độ', value: 5, status: 'danger' },
  ]
  const groups: ResourceMetric[] = [
    { category: 'Nhân sự', label: 'Phân bổ theo đơn vị', value: 124 },
    { category: 'Mua sắm', label: 'Đang thực hiện', value: 15 },
    { category: 'Hợp đồng', label: 'Hiệu lực', value: 28 },
    { category: 'Tài sản', label: 'Đã hình thành', value: 32 },
    { category: 'Sản phẩm', label: 'Theo dõi', value: 23 },
    { category: 'Đối tác', label: 'Phối hợp', value: 11 },
  ]
  return {
    kpis, groups,
    staffByOrg: ORGANIZATIONS.map((o, i) => ({ label: o.name, value: 15 + i * 8 })),
    staffByMission: MISSIONS.slice(0, 5).map((m, i) => ({ label: m.code, value: 5 + i * 2 })),
    workload: [{ label: 'Bình thường', value: 80 }, { label: 'Cao', value: 36 }, { label: 'Quá tải', value: 8 }],
    procurementStatus: [{ label: 'Chuẩn bị', value: 5 }, { label: 'Đang thực hiện', value: 15 }, { label: 'Hoàn thành', value: 22 }],
    contractStatus: [{ label: 'Hiệu lực', value: 28 }, { label: 'Sắp hết hạn', value: 4 }, { label: 'Hết hạn', value: 2 }],
    assetBreakdown: [{ label: 'Thiết bị', value: 18 }, { label: 'CCDC', value: 8 }, { label: 'TSCĐ', value: 6 }],
    productProgress: [{ label: 'Đúng tiến độ', value: 18 }, { label: 'Chậm', value: 5 }],
  }
}

export function getRiskAnalytics(filter: DashboardFilter) {
  const alerts = filterAlerts(filter)
  const kpis: KpiMetric[] = [
    { id: 'critical', title: 'Cảnh báo nghiêm trọng', value: alerts.filter((a) => a.severity === 'CRITICAL').length, status: 'danger' },
    { id: 'high', title: 'Cảnh báo cao', value: alerts.filter((a) => a.severity === 'HIGH').length, status: 'warning' },
    { id: 'medium', title: 'Cảnh báo trung bình', value: alerts.filter((a) => a.severity === 'MEDIUM').length },
    { id: 'open', title: 'Cảnh báo chưa xử lý', value: alerts.filter((a) => a.status === 'OPEN').length, status: 'warning' },
    { id: 'overdue', title: 'Cảnh báo quá hạn xử lý', value: 5, status: 'danger' },
    { id: 'highRisk', title: 'NV có mức rủi ro cao', value: filterMissions(filter).filter((m) => m.riskLevel === 'Cao').length, status: 'danger' },
  ]
  const matrix = [
    { prob: 'Cao', impact: 'Cao', count: 4 }, { prob: 'Cao', impact: 'TB', count: 6 },
    { prob: 'TB', impact: 'Cao', count: 5 }, { prob: 'TB', impact: 'TB', count: 12 },
    { prob: 'Thấp', impact: 'Cao', count: 2 }, { prob: 'Thấp', impact: 'TB', count: 8 },
  ]
  return {
    kpis, alerts,
    matrix,
    byGroup: ALERT_CATEGORIES.map((c) => ({ label: c, value: alerts.filter((a) => a.category === c).length + 1 })),
    byOrg: ORGANIZATIONS.map((o) => ({ label: o.name, value: 3 + o.id.charCodeAt(3) % 5 })),
    byProcess: PROCESS_CODES.slice(0, 5).map((c) => ({ label: c, value: 2 + c.charCodeAt(3) % 4 })),
    aging: [{ label: '< 7 ngày', value: 12 }, { label: '7–30 ngày', value: 10 }, { label: '> 30 ngày', value: 5 }],
    trend: MONTHS_12.map((m, i) => ({ label: m, value: 2 + (i % 4) })),
  }
}

export function getIntegrationHealth(_filter: DashboardFilter): IntegrationHealthData {
  const connectors = [
    { systemCode: 'QLNS', systemName: 'QLNS', status: 'ACTIVE' as const, lastSyncAt: '27/07/2026 08:00', latencyMs: 320, totalRecords: 12500, successCount: 12480, errorCount: 12, unmappedCount: 8 },
    { systemCode: 'SAP', systemName: 'SAP/TCKT', status: 'DEGRADED' as const, lastSyncAt: '27/07/2026 07:45', latencyMs: 1200, totalRecords: 8900, successCount: 8650, errorCount: 180, unmappedCount: 70 },
    { systemCode: 'MS', systemName: 'Mua sắm', status: 'ACTIVE' as const, lastSyncAt: '27/07/2026 08:10', latencyMs: 450, totalRecords: 3200, successCount: 3180, errorCount: 15, unmappedCount: 5 },
    { systemCode: 'TS', systemName: 'Quản lý tài sản', status: 'ACTIVE' as const, lastSyncAt: '27/07/2026 07:55', latencyMs: 380, totalRecords: 2100, successCount: 2095, errorCount: 3, unmappedCount: 2 },
    { systemCode: 'PLM', systemName: 'PLM', status: 'ERROR' as const, lastSyncAt: '26/07/2026 22:00', latencyMs: 0, totalRecords: 1500, successCount: 1200, errorCount: 280, unmappedCount: 20 },
  ]
  return {
    kpis: [
      { id: 'active', title: 'Kết nối đang hoạt động', value: 3, status: 'success' },
      { id: 'error', title: 'Kết nối lỗi', value: 1, status: 'danger' },
      { id: 'syncOk', title: 'Bản ghi đồng bộ thành công', value: 27605, status: 'success' },
      { id: 'syncErr', title: 'Bản ghi đồng bộ lỗi', value: 490, status: 'danger' },
      { id: 'unmapped', title: 'Bản ghi chưa mapping', value: 105, status: 'warning' },
      { id: 'fallback', title: 'Bản ghi nhập tay fallback', value: 42 },
      { id: 'latency', title: 'Độ trễ đồng bộ TB', value: 590, unit: 'ms' },
    ],
    connectors,
    successBySystem: connectors.map((c) => ({ label: c.systemName, value: Math.round((c.successCount / c.totalRecords) * 100) })),
    errorsOverTime: MONTHS_12.map((m, i) => ({ label: m, value: 20 + (i % 5) * 8 })),
    errorsByType: [{ label: 'Mapping', value: 45 }, { label: 'Timeout', value: 28 }, { label: 'Validation', value: 35 }],
    latencyTrend: MONTHS_12.map((m, i) => ({ label: m, value: 400 + i * 15 })),
    autoVsManualPct: { auto: 87, manual: 13 },
  }
}

export function getAdoptionAnalytics(_filter: DashboardFilter) {
  const kpis: KpiMetric[] = [
    { id: 'mau', title: 'Người dùng hoạt động trong tháng', value: 186 },
    { id: 'orgs', title: 'Đơn vị đang sử dụng', value: 5, status: 'success' },
    { id: 'missions', title: 'NV khởi tạo trên hệ thống', value: MISSIONS.length },
    { id: 'dossiers', title: 'Hồ sơ xử lý điện tử', value: 342 },
    { id: 'eform', title: 'Tỷ lệ sử dụng biểu mẫu điện tử', value: 92, unit: '%', status: 'success' },
    { id: 'esign', title: 'Tỷ lệ ký điện tử', value: 78, unit: '%' },
    { id: 'auto', title: 'Tỷ lệ dữ liệu lấy tự động', value: 85, unit: '%', status: 'success' },
  ]
  const rows: AdoptionMetric[] = ORGANIZATIONS.map((o, i) => ({
    organization: o.name,
    userCount: 30 + i * 12,
    activeUsers: 20 + i * 8,
    missionCount: 3 + i * 2,
    electronicDossiers: 40 + i * 15,
    usagePct: 65 + i * 5,
    lastAccessAt: `27/07/2026 0${8 - i}:30`,
  }))
  return {
    kpis, rows,
    usersByMonth: MONTHS_12.map((m, i) => ({ label: m, value: 120 + i * 6 })),
    byOrg: rows.map((r) => ({ label: r.organization, value: r.usagePct })),
    byRole: [{ label: 'Chuyên viên', value: 55 }, { label: 'Lãnh đạo', value: 25 }, { label: 'Hội đồng', value: 12 }],
    byProcess: PROCESS_CODES.slice(0, 5).map((c) => ({ label: c, value: 40 + c.charCodeAt(3) * 3 })),
    eformRate: [{ label: 'Điện tử', value: 92 }, { label: 'Giấy', value: 8 }],
    autoRate: [{ label: 'Tự động', value: 85 }, { label: 'Nhập tay', value: 15 }],
  }
}

export const FILTER_OPTIONS = {
  organizations: ORGANIZATIONS,
  managementLevels: ['Tất cả', 'Cấp Cơ sở', 'Cấp Tập đoàn'],
  missionTypes: MISSION_TYPES,
  scienceFields: SCIENCE_FIELDS,
  statuses: STATUSES,
  processCodes: PROCESS_CODES,
  planYears: [2024, 2025, 2026],
}
