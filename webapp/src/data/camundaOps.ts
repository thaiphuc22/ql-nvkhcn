// Dữ liệu mock cho 3 màn "Vận hành & Tích hợp" — điểm chạm với engine Camunda 8.
//
// Đây KHÔNG phải dữ liệu nghiệp vụ (hồ sơ/phiếu ở data/dossiers.ts). Ba màn này
// mô phỏng lớp ĐIỀU PHỐI + TÍCH HỢP theo docs/arch/camunda-design.md:
//   - ProcessInstance   → Seam A (App ↔ Camunda): trạng thái luồng do engine chủ.
//   - IntegrationSystem → Seam B (Camunda ↔ hệ ngoài): job worker/connector.
//   - ProcessEvent      → history Zeebe (nhật ký sự kiện luồng).
//
// Nguyên tắc D3: process CHỈ giữ ID + biến điều khiển (maHoSo, cap, ketQua...),
// KHÔNG chứa nội dung hồ sơ. Vì vậy các bản ghi dưới đây chỉ tham chiếu maHoSo.

/* ─────────────────────────── Seam A: Process instances ─────────────────────────── */

export type InstanceState = 'active' | 'completed' | 'incident' | 'canceled'

export const INSTANCE_STATE: Record<InstanceState, { label: string; color: string }> = {
  active: { label: 'Đang chạy', color: 'processing' },
  completed: { label: 'Hoàn tất', color: 'success' },
  incident: { label: 'Sự cố', color: 'error' },
  canceled: { label: 'Đã huỷ', color: 'default' },
}

export interface ProcessInstance {
  /** Zeebe instance key (khoá tương quan phía engine). */
  instanceKey: string
  /** Correlation key ↔ dữ liệu nghiệp vụ ở app (D3, mục 5.2). */
  maHoSo: string
  maNV: string
  /** Process definition id ↔ mã quy trình (data/processes.ts). */
  process: string
  processTen: string
  version: string
  /** Tên activity (bước) hiện tại — với instance đã kết thúc là bước cuối. */
  buocHienTai: string
  /** Candidate group / người được giao ở bước hiện tại. */
  vaiTro: string
  batDau: string
  capNhat: string
  trangThai: InstanceState
  /** Có vượt SLA (timer boundary event) chưa. */
  quaHan: boolean
  hanXuLy?: string
  /** Thông điệp sự cố khi trangThai = 'incident'. */
  incident?: string
}

export const seedInstances: ProcessInstance[] = [
  {
    instanceKey: '2251799813685284', maHoSo: 'HS-2026-018', maNV: 'RD.2026.018',
    process: 'RD01.01', processTen: 'Xét duyệt Chủ trương cấp Cơ sở', version: '1.2',
    buocHienTai: 'Hội đồng KHCN phê duyệt', vaiTro: 'HĐ KHCN VHT',
    batDau: '20/06/2026 09:12', capNhat: '27/06/2026 16:40',
    trangThai: 'active', quaHan: false, hanXuLy: '05/07/2026',
  },
  {
    instanceKey: '2251799813690112', maHoSo: 'HS-2026-035', maNV: 'RD.2026.012',
    process: 'RD05.01', processTen: 'Nghiệm thu NV KHCN cấp Cơ sở', version: '1.1',
    buocHienTai: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS',
    batDau: '28/06/2026 09:00', capNhat: '01/07/2026 10:00',
    trangThai: 'active', quaHan: false, hanXuLy: '08/07/2026',
  },
  {
    instanceKey: '2251799813688901', maHoSo: 'HS-2026-025', maNV: 'RD.2026.025',
    process: 'RD02.01', processTen: 'Xét duyệt NV KHCN cấp Cơ sở', version: '1.1',
    buocHienTai: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT',
    batDau: '24/06/2026 08:40', capNhat: '24/06/2026 08:41',
    trangThai: 'active', quaHan: true, hanXuLy: '30/06/2026',
  },
  {
    instanceKey: '2251799813691455', maHoSo: 'HS-2026-027', maNV: 'RD.2026.027',
    process: 'RD01.01', processTen: 'Xét duyệt Chủ trương cấp Cơ sở', version: '1.2',
    buocHienTai: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ TT/Khối',
    batDau: '29/06/2026 15:10', capNhat: '29/06/2026 15:10',
    trangThai: 'active', quaHan: false, hanXuLy: '08/07/2026',
  },
  {
    instanceKey: '2251799813679220', maHoSo: 'HS-2026-009', maNV: 'RD.2026.009',
    process: 'RD05.01', processTen: 'Nghiệm thu NV KHCN cấp Cơ sở', version: '1.1',
    buocHienTai: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS',
    batDau: '10/06/2026 09:00', capNhat: '18/06/2026 10:30',
    trangThai: 'active', quaHan: true, hanXuLy: '01/07/2026',
  },
  {
    instanceKey: '2251799813682007', maHoSo: 'HS-2026-030', maNV: 'RD.2026.030',
    process: 'RD05.02', processTen: 'Nghiệm thu NV KHCN cấp Tập đoàn', version: '1.0',
    buocHienTai: 'Hội đồng Nghiệm thu Tập đoàn (có Tổ KT)', vaiTro: 'HĐ Nghiệm thu Tập đoàn',
    batDau: '08/06/2026 09:00', capNhat: '22/06/2026 11:20',
    trangThai: 'active', quaHan: false, hanXuLy: '04/07/2026',
  },
  {
    // Sự cố: service task gọi SAP đồng bộ dự toán thất bại → incident (job retries = 0).
    // Minh hoạ Seam B lỗi làm treo luồng ở Seam A (liên kết 2 màn).
    instanceKey: '2251799813693318', maHoSo: 'HS-2026-033', maNV: 'RD.2026.033',
    process: 'RD03.03', processTen: 'Tương tác PM QLKHCN ↔ SAP (chi phí)', version: '0.1',
    buocHienTai: 'Đồng bộ dự toán sang SAP', vaiTro: 'Job worker: sap-connector',
    batDau: '02/07/2026 14:05', capNhat: '02/07/2026 14:06',
    trangThai: 'incident', quaHan: false,
    incident: 'Job "sap:sync-budget" hết số lần thử (retries=0): SAP trả HTTP 504 (timeout). Chờ xử lý ở Operate.',
  },
  {
    instanceKey: '2251799813670044', maHoSo: 'HS-2026-012', maNV: 'RD.2026.012',
    process: 'RD02.01', processTen: 'Xét duyệt NV KHCN cấp Cơ sở', version: '1.1',
    buocHienTai: 'TGĐ phê duyệt mở mới đề tài (kết thúc)', vaiTro: 'TGĐ VHT',
    batDau: '30/05/2026 08:20', capNhat: '16/06/2026 10:00',
    trangThai: 'completed', quaHan: false,
  },
  {
    // Rework: HĐXD trả lại → instance đi nhánh từ chối rồi kết thúc (OQ-002 minh hoạ).
    instanceKey: '2251799813675610', maHoSo: 'HS-2026-021', maNV: 'RD.2026.021',
    process: 'RD01.02', processTen: 'Xét duyệt Chủ trương cấp Tập đoàn', version: '1.1',
    buocHienTai: 'Trả lại do Thẩm định không đạt', vaiTro: 'CQNV VHT',
    batDau: '18/06/2026 08:00', capNhat: '21/06/2026 09:10',
    trangThai: 'canceled', quaHan: false,
  },
]

/* ────────────────────── Seam B: Tích hợp hệ ngoài (connectors) ────────────────────── */

export type IntegStatus = 'healthy' | 'degraded' | 'down'
export type IntegKind = 'connector' | 'job-worker' | 'idp'
export type SyncMode = 'realtime' | 'batch'

export const INTEG_STATUS: Record<IntegStatus, { label: string; color: string }> = {
  healthy: { label: 'Đang khoẻ', color: 'success' },
  degraded: { label: 'Chập chờn', color: 'warning' },
  down: { label: 'Gián đoạn', color: 'error' },
}

export const INTEG_KIND_LABEL: Record<IntegKind, string> = {
  connector: 'Connector (cấu hình)',
  'job-worker': 'Job worker (code)',
  idp: 'IdP (SSO/IAM)',
}

export const SYNC_MODE_LABEL: Record<SyncMode, string> = {
  realtime: 'Thời gian thực',
  batch: 'Theo lô',
}

export interface IntegrationSystem {
  key: string
  ten: string
  moTa: string
  giaoThuc: string
  kieu: IntegKind
  syncMode: SyncMode
  trangThai: IntegStatus
  lanDongBoCuoi: string
  banGhi24h: number
  loi24h: number
  doTreMs: number
  hangDoi: number
  /** Requirement/NFR liên quan (docs/req). */
  ref: string
}

export const seedIntegrations: IntegrationSystem[] = [
  {
    key: 'QLNS', ten: 'Quản lý Nhân sự (QLNS)',
    moTa: 'Đồng bộ danh sách nhân sự & chi phí lương (PL1).',
    giaoThuc: 'REST/JSON', kieu: 'connector', syncMode: 'realtime',
    trangThai: 'healthy', lanDongBoCuoi: '03/07/2026 08:15',
    banGhi24h: 1284, loi24h: 0, doTreMs: 210, hangDoi: 0, ref: 'RD03.01 · NFR-INT-001',
  },
  {
    key: 'MS', ten: 'Mua sắm (MS)',
    moTa: 'Cấu trúc sản phẩm, tờ trình/gói thầu/hợp đồng (PL2–PL5).',
    giaoThuc: 'REST/JSON', kieu: 'connector', syncMode: 'realtime',
    trangThai: 'healthy', lanDongBoCuoi: '03/07/2026 08:02',
    banGhi24h: 356, loi24h: 2, doTreMs: 340, hangDoi: 1, ref: 'RD03.02 · NFR-INT-001',
  },
  {
    key: 'SAP', ten: 'SAP (Tài chính – chi phí)',
    moTa: 'Kinh phí thực hiện/quyết toán theo PL1–PL6.',
    giaoThuc: 'SOAP/OData', kieu: 'job-worker', syncMode: 'batch',
    trangThai: 'down', lanDongBoCuoi: '02/07/2026 14:05',
    banGhi24h: 0, loi24h: 18, doTreMs: 0, hangDoi: 7, ref: 'RD03.03 · NFR-INT-001',
  },
  {
    key: 'QLTS', ten: 'Quản lý Tài sản (QLTS)',
    moTa: 'Tài sản hình thành từ đề tài, bàn giao sau nghiệm thu.',
    giaoThuc: 'REST/JSON', kieu: 'job-worker', syncMode: 'batch',
    trangThai: 'healthy', lanDongBoCuoi: '03/07/2026 06:00',
    banGhi24h: 92, loi24h: 0, doTreMs: 180, hangDoi: 0, ref: 'RD06 · NFR-INT-001',
  },
  {
    key: 'PLM', ten: 'PLM (Quản lý vòng đời sản phẩm)',
    moTa: 'Cấu trúc sản phẩm/tài liệu kỹ thuật của đề tài.',
    giaoThuc: 'REST/JSON', kieu: 'connector', syncMode: 'realtime',
    trangThai: 'degraded', lanDongBoCuoi: '03/07/2026 07:48',
    banGhi24h: 214, loi24h: 6, doTreMs: 1250, hangDoi: 3, ref: 'RD03 · NFR-INT-001',
  },
  {
    key: 'IAM', ten: 'SSO/IAM (Định danh tập trung)',
    moTa: 'Ánh xạ user/nhóm ↔ Camunda Identity; đăng nhập một lần.',
    giaoThuc: 'OIDC', kieu: 'idp', syncMode: 'realtime',
    trangThai: 'healthy', lanDongBoCuoi: '03/07/2026 08:20',
    banGhi24h: 640, loi24h: 0, doTreMs: 95, hangDoi: 0, ref: 'OQ-021 · REQ-ENG-004',
  },
]

/** Lần chạy job worker gần đây (bảng phụ ở màn Tích hợp). */
export type JobOutcome = 'success' | 'retry' | 'failed'

export const JOB_OUTCOME: Record<JobOutcome, { label: string; color: string }> = {
  success: { label: 'Thành công', color: 'success' },
  retry: { label: 'Đang thử lại', color: 'warning' },
  failed: { label: 'Thất bại', color: 'error' },
}

export interface JobRun {
  id: string
  jobType: string
  he: string
  maHoSo: string
  thoiDiem: string
  ketQua: JobOutcome
  retries: number
  thongDiep: string
}

export const seedJobRuns: JobRun[] = [
  { id: 'j-9001', jobType: 'sap:sync-budget', he: 'SAP', maHoSo: 'HS-2026-033', thoiDiem: '02/07/2026 14:06', ketQua: 'failed', retries: 0, thongDiep: 'HTTP 504 timeout — tạo incident' },
  { id: 'j-9002', jobType: 'plm:pull-structure', he: 'PLM', maHoSo: 'HS-2026-030', thoiDiem: '03/07/2026 07:48', ketQua: 'retry', retries: 2, thongDiep: 'Độ trễ cao 1.25s, thử lại lần 2' },
  { id: 'j-9003', jobType: 'qlns:sync-staff', he: 'QLNS', maHoSo: 'HS-2026-018', thoiDiem: '03/07/2026 08:15', ketQua: 'success', retries: 3, thongDiep: 'Đồng bộ 12 nhân sự (PL1)' },
  { id: 'j-9004', jobType: 'ms:pull-contract', he: 'MS', maHoSo: 'HS-2026-025', thoiDiem: '03/07/2026 08:02', ketQua: 'success', retries: 3, thongDiep: 'Lấy 1 hợp đồng (PL4)' },
  { id: 'j-9005', jobType: 'iam:resolve-group', he: 'IAM', maHoSo: 'HS-2026-035', thoiDiem: '03/07/2026 08:20', ketQua: 'success', retries: 3, thongDiep: 'Giải nhóm HĐ Nghiệm thu (5 thành viên)' },
  { id: 'j-9006', jobType: 'ms:pull-contract', he: 'MS', maHoSo: 'HS-2026-027', thoiDiem: '02/07/2026 22:14', ketQua: 'retry', retries: 1, thongDiep: 'Lỗi mạng tạm thời, thử lại' },
]

/* ─────────────────────────── History: nhật ký sự kiện luồng ─────────────────────────── */

export type EventType =
  | 'process-started'
  | 'task-created'
  | 'task-completed'
  | 'gateway'
  | 'service-task'
  | 'timer'
  | 'incident'
  | 'message'
  | 'process-completed'

export const EVENT_META: Record<EventType, { label: string; color: string }> = {
  'process-started': { label: 'Khởi tạo luồng', color: 'blue' },
  'task-created': { label: 'Tạo việc', color: 'cyan' },
  'task-completed': { label: 'Hoàn tất việc', color: 'green' },
  gateway: { label: 'Rẽ nhánh (gateway/DMN)', color: 'geekblue' },
  'service-task': { label: 'Gọi hệ ngoài', color: 'purple' },
  timer: { label: 'Hẹn giờ / SLA', color: 'gold' },
  incident: { label: 'Sự cố', color: 'red' },
  message: { label: 'Thông điệp/tương quan', color: 'magenta' },
  'process-completed': { label: 'Kết thúc luồng', color: 'green' },
}

export interface ProcessEvent {
  id: string
  /** Sắp xếp theo chuỗi 'YYYY-MM-DD HH:mm' (không dùng Date runtime). */
  thoiDiem: string
  maHoSo: string
  process: string
  loai: EventType
  /** Tên phần tử BPMN. */
  element: string
  chiTiet: string
  actor?: string
}

export const seedEvents: ProcessEvent[] = [
  // Luồng HS-2026-018 (RD01.01) — đi bộ gần trọn vòng, còn ở HĐ KHCN.
  { id: 'e-018-1', thoiDiem: '2026-06-20 09:12', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'process-started', element: 'Bắt đầu', chiTiet: 'Khởi tạo instance, correlation key = HS-2026-018', actor: 'TS. Trần Văn Nam' },
  { id: 'e-018-2', thoiDiem: '2026-06-20 09:12', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'task-created', element: 'Khởi tạo hồ sơ', chiTiet: 'User task giao nhóm PM/PA/NNC', actor: 'PM/PA/NNC' },
  { id: 'e-018-3', thoiDiem: '2026-06-20 09:40', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'task-completed', element: 'Khởi tạo hồ sơ', chiTiet: 'Hoàn tất; app đã validate "trong kế hoạch năm" (BR-RD0101-001)', actor: 'TS. Trần Văn Nam' },
  { id: 'e-018-4', thoiDiem: '2026-06-22 14:30', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'task-completed', element: 'Ký duyệt cấp Trung tâm/Khối', chiTiet: 'Đồng ý trình xét duyệt', actor: 'Đ/c Lê Minh Quang' },
  { id: 'e-018-5', thoiDiem: '2026-06-23 09:00', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'service-task', element: 'Đồng bộ nhân sự QLNS', chiTiet: 'Job qlns:sync-staff — lấy 12 nhân sự (PL1)', actor: 'job worker: qlns' },
  { id: 'e-018-6', thoiDiem: '2026-06-25 10:05', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'task-completed', element: 'Thẩm định Cơ quan nghiệp vụ', chiTiet: 'Phiếu nhận xét CQNV đã ký', actor: 'Phòng CLKHCN' },
  { id: 'e-018-7', thoiDiem: '2026-06-27 16:40', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'gateway', element: 'DMN: Sinh danh sách Hội đồng', chiTiet: 'Định tuyến cấp Cơ sở → HĐ KHCN VHT (quorum 2/3)', actor: 'DMN' },
  { id: 'e-018-8', thoiDiem: '2026-06-27 16:41', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'task-created', element: 'Hội đồng KHCN phê duyệt', chiTiet: 'Multi-instance, giao HĐ KHCN VHT; hạn 05/07/2026', actor: 'HĐ KHCN VHT' },
  { id: 'e-018-9', thoiDiem: '2026-06-30 08:00', maHoSo: 'HS-2026-018', process: 'RD01.01', loai: 'timer', element: 'SLA nhắc việc', chiTiet: 'Timer boundary: còn 5 ngày tới hạn — gửi nhắc', actor: 'Camunda' },

  // Luồng HS-2026-033 (RD03.03) — service task SAP lỗi → incident.
  { id: 'e-033-1', thoiDiem: '2026-07-02 14:00', maHoSo: 'HS-2026-033', process: 'RD03.03', loai: 'process-started', element: 'Bắt đầu', chiTiet: 'Khởi tạo instance đồng bộ chi phí', actor: 'Hệ thống' },
  { id: 'e-033-2', thoiDiem: '2026-07-02 14:05', maHoSo: 'HS-2026-033', process: 'RD03.03', loai: 'service-task', element: 'Đồng bộ dự toán sang SAP', chiTiet: 'Job sap:sync-budget bắt đầu', actor: 'job worker: sap' },
  { id: 'e-033-3', thoiDiem: '2026-07-02 14:06', maHoSo: 'HS-2026-033', process: 'RD03.03', loai: 'incident', element: 'Đồng bộ dự toán sang SAP', chiTiet: 'HTTP 504 timeout, retries=0 → tạo incident, chờ xử lý ở Operate', actor: 'job worker: sap' },

  // Luồng HS-2026-021 (RD01.02) — rework/từ chối.
  { id: 'e-021-1', thoiDiem: '2026-06-18 08:00', maHoSo: 'HS-2026-021', process: 'RD01.02', loai: 'process-started', element: 'Bắt đầu', chiTiet: 'Khởi tạo instance chủ trương cấp Tập đoàn', actor: 'TS. Hoàng Đức Anh' },
  { id: 'e-021-2', thoiDiem: '2026-06-19 13:20', maHoSo: 'HS-2026-021', process: 'RD01.02', loai: 'task-completed', element: 'Ký duyệt cấp Trung tâm/Khối', chiTiet: 'Đồng ý trình', actor: 'Đ/c Vũ Thành Long' },
  { id: 'e-021-3', thoiDiem: '2026-06-21 09:10', maHoSo: 'HS-2026-021', process: 'RD01.02', loai: 'gateway', element: 'Gateway: Kết quả thẩm định', chiTiet: 'ketQuaThamDinh = "Chưa đạt" → nhánh trả lại (rework, OQ-002)', actor: 'Phòng TCKT' },
  { id: 'e-021-4', thoiDiem: '2026-06-21 09:10', maHoSo: 'HS-2026-021', process: 'RD01.02', loai: 'process-completed', element: 'Kết thúc (trả lại)', chiTiet: 'Instance kết thúc nhánh từ chối; app chuyển hồ sơ về chủ nhiệm', actor: 'Camunda' },

  // Luồng HS-2026-012 (RD02.01) — hoàn tất trọn vẹn.
  { id: 'e-012-1', thoiDiem: '2026-05-30 08:20', maHoSo: 'HS-2026-012', process: 'RD02.01', loai: 'process-started', element: 'Bắt đầu', chiTiet: 'Khởi tạo instance xét duyệt', actor: 'ThS. Nguyễn Thị Lan' },
  { id: 'e-012-2', thoiDiem: '2026-06-03 11:00', maHoSo: 'HS-2026-012', process: 'RD02.01', loai: 'gateway', element: 'DMN: Đạt/Chưa đạt', chiTiet: 'Chuyên quản kết luận "Đạt" → tiếp tục HĐXD', actor: 'DMN' },
  { id: 'e-012-3', thoiDiem: '2026-06-10 15:30', maHoSo: 'HS-2026-012', process: 'RD02.01', loai: 'task-completed', element: 'Hội đồng Xét duyệt (phiên 1 & 2)', chiTiet: 'Quorum đạt, chuyển HĐ KHCN', actor: 'HĐXD' },
  { id: 'e-012-4', thoiDiem: '2026-06-16 10:00', maHoSo: 'HS-2026-012', process: 'RD02.01', loai: 'process-completed', element: 'Kết thúc', chiTiet: 'TGĐ phê duyệt mở mới; app khoá hồ sơ & sinh QĐ', actor: 'TGĐ VHT' },
]

/** Danh sách mã hồ sơ có nhật ký (cho bộ lọc màn History). */
export const eventDossiers = Array.from(new Set(seedEvents.map((e) => e.maHoSo)))
