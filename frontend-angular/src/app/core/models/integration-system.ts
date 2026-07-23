// Port của phần "Integration system registry" trong webapp/src/data/camundaOps.ts.
// Ban đầu chỉ port phần connector cần cho validate/chọn connector ở Service Task;
// nay mở rộng thêm cho màn Tích hợp thật (`/tich-hop`, xem
// core/services/integration-system.service.ts) — GET /api/integration-systems là
// nguồn dữ liệu thật, `seedIntegrations` bên dưới CHỈ còn dùng làm option tĩnh cho
// dropdown connector của Service Task (không liên quan tới màn Tích hợp nữa).

export type IntegStatus = 'healthy' | 'degraded' | 'down';
export type IntegKind = 'connector' | 'job-worker' | 'idp';
export type SyncMode = 'realtime' | 'batch';

export const INTEG_STATUS: Record<IntegStatus, { label: string; color: string }> = {
  healthy: { label: 'Đã tích hợp', color: 'success' },
  degraded: { label: 'Tạm dừng', color: 'warning' },
  down: { label: 'Chưa kết nối', color: 'error' },
};

export const INTEG_KIND_LABEL: Record<IntegKind, string> = {
  connector: 'Connector (cấu hình)',
  'job-worker': 'Job worker (code)',
  idp: 'IdP (SSO/IAM)',
};

export const SYNC_MODE_LABEL: Record<SyncMode, string> = {
  realtime: 'Thời gian thực',
  batch: 'Theo lô',
};

export interface IntegrationSystem {
  key: string;
  ten: string;
  moTa: string;
  giaoThuc: string;
  kieu: IntegKind;
  syncMode: SyncMode;
  trangThai: IntegStatus;
  lanDongBoCuoi: string;
  banGhi24h: number;
  loi24h: number;
  doTreMs: number;
  hangDoi: number;
  endpoint: string;
  apiKeyTail?: string;
  ref: string;
  /** JPA @Version — dùng làm ETag cho If-Match khi connect/disconnect (GET /api/integration-systems). */
  version: number;
}

export interface ConnectSystemRequest {
  apiKey: string;
  endpoint: string;
}

/** Lần chạy job worker gần đây, đọc từ `GET /api/integration-systems/{key}/job-runs`. */
export type JobOutcome = 'success' | 'retry' | 'failed';

export const JOB_OUTCOME: Record<JobOutcome, { label: string; color: string }> = {
  success: { label: 'Thành công', color: 'success' },
  retry: { label: 'Đang thử lại', color: 'warning' },
  failed: { label: 'Thất bại', color: 'error' },
};

export interface JobRun {
  id: string;
  jobType: string;
  he: string;
  maHoSo: string;
  thoiDiem: string;
  ketQua: JobOutcome;
  retries: number;
  thongDiep: string;
}

/** Tỷ lệ thành công 24h (%) suy từ banGhi24h/loi24h — null nếu chưa có bản ghi nào. */
export function integrationSuccessRate(s: IntegrationSystem): number | null {
  if (s.banGhi24h <= 0) return null;
  return Math.round(((s.banGhi24h - s.loi24h) / s.banGhi24h) * 1000) / 10;
}

/** Job của một hệ, mới nhất lên đầu (dùng cho card + drawer chi tiết). */
export function jobRunsForSystem(runs: JobRun[], he: string): JobRun[] {
  return runs
    .filter((j) => j.he === he)
    .slice()
    .sort((a, b) => b.thoiDiem.localeCompare(a.thoiDiem));
}

/** Số job đang ở trạng thái lỗi (chưa retry thành công). */
export function openIncidentCount(runs: JobRun[], he: string): number {
  return runs.filter((j) => j.he === he && j.ketQua === 'failed').length;
}

/** Thời điểm lỗi/thử lại gần nhất của một hệ, undefined nếu chưa từng lỗi. */
export function lastErrorAt(runs: JobRun[], he: string): string | undefined {
  const failing = runs
    .filter((j) => j.he === he && j.ketQua !== 'success')
    .sort((a, b) => b.thoiDiem.localeCompare(a.thoiDiem));
  return failing[0]?.thoiDiem;
}

export const seedIntegrations: IntegrationSystem[] = [
  {
    key: 'QLNS',
    ten: 'Quản lý Nhân sự (QLNS)',
    moTa: 'Đồng bộ danh sách nhân sự & chi phí lương (PL1).',
    giaoThuc: 'REST/JSON',
    kieu: 'connector',
    syncMode: 'realtime',
    trangThai: 'healthy',
    lanDongBoCuoi: '03/07/2026 08:15',
    banGhi24h: 1284,
    loi24h: 0,
    doTreMs: 210,
    hangDoi: 0,
    endpoint: 'https://qlns.vht.vn/api/v1',
    apiKeyTail: 'NS81',
    ref: 'RD03.01 · NFR-INT-001',
    version: 0,
  },
  {
    key: 'MS',
    ten: 'Mua sắm (MS)',
    moTa: 'Cấu trúc sản phẩm, tờ trình/gói thầu/hợp đồng (PL2–PL5).',
    giaoThuc: 'REST/JSON',
    kieu: 'connector',
    syncMode: 'realtime',
    trangThai: 'healthy',
    lanDongBoCuoi: '03/07/2026 08:02',
    banGhi24h: 356,
    loi24h: 2,
    doTreMs: 340,
    hangDoi: 1,
    endpoint: 'https://ms.vht.vn/api/v1',
    apiKeyTail: 'MS27',
    ref: 'RD03.02 · NFR-INT-001',
    version: 0,
  },
  {
    key: 'SAP',
    ten: 'SAP (Tài chính – chi phí)',
    moTa: 'Kinh phí thực hiện/quyết toán theo PL1–PL6.',
    giaoThuc: 'SOAP/OData',
    kieu: 'job-worker',
    syncMode: 'batch',
    trangThai: 'down',
    lanDongBoCuoi: '02/07/2026 14:05',
    banGhi24h: 0,
    loi24h: 18,
    doTreMs: 0,
    hangDoi: 7,
    endpoint: 'https://sap-gw.vht.vn/odata/v2',
    ref: 'RD03.03 · NFR-INT-001',
    version: 0,
  },
  {
    key: 'QLTS',
    ten: 'Quản lý Tài sản (QLTS)',
    moTa: 'Tài sản hình thành từ đề tài, bàn giao sau nghiệm thu.',
    giaoThuc: 'REST/JSON',
    kieu: 'job-worker',
    syncMode: 'batch',
    trangThai: 'healthy',
    lanDongBoCuoi: '03/07/2026 06:00',
    banGhi24h: 92,
    loi24h: 0,
    doTreMs: 180,
    hangDoi: 0,
    endpoint: 'https://qlts.vht.vn/api/v1',
    apiKeyTail: 'TS40',
    ref: 'RD06 · NFR-INT-001',
    version: 0,
  },
  {
    key: 'PLM',
    ten: 'PLM (Quản lý vòng đời sản phẩm)',
    moTa: 'Cấu trúc sản phẩm/tài liệu kỹ thuật của đề tài.',
    giaoThuc: 'REST/JSON',
    kieu: 'connector',
    syncMode: 'realtime',
    trangThai: 'degraded',
    lanDongBoCuoi: '03/07/2026 07:48',
    banGhi24h: 214,
    loi24h: 6,
    doTreMs: 1250,
    hangDoi: 3,
    endpoint: 'https://plm.vht.vn/api/v2',
    apiKeyTail: 'PL9C',
    ref: 'RD03 · NFR-INT-001',
    version: 0,
  },
  {
    key: 'IAM',
    ten: 'SSO/IAM (Định danh tập trung)',
    moTa: 'Ánh xạ user/nhóm ↔ Camunda Identity; đăng nhập một lần.',
    giaoThuc: 'OIDC',
    kieu: 'idp',
    syncMode: 'realtime',
    trangThai: 'healthy',
    lanDongBoCuoi: '03/07/2026 08:20',
    banGhi24h: 640,
    loi24h: 0,
    doTreMs: 95,
    hangDoi: 0,
    endpoint: 'https://sso.vht.vn/oidc',
    apiKeyTail: 'IA55',
    ref: 'OQ-021 · REQ-ENG-004',
    version: 0,
  },
];
