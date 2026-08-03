// Port của phần "History: nhật ký sự kiện luồng" trong webapp/src/data/camundaOps.ts,
// dùng riêng cho tab "Nhật ký luồng" ở màn Nhật ký (/nhat-ky).
//
// Đây là lịch sử sự kiện Zeebe (audit lớp điều phối: luồng đi bước nào, rẽ nhánh,
// gọi hệ ngoài, sự cố) — KHÔNG có backend nào lưu lịch sử này (Camunda self-managed
// history/Operate export chưa được tích hợp), nên vẫn là dữ liệu mock, khác với tab
// "Nhật ký tích hợp" đã nối `/api/integration-systems` thật.

export type EventType =
  | 'process-started'
  | 'task-created'
  | 'task-completed'
  | 'gateway'
  | 'service-task'
  | 'timer'
  | 'incident'
  | 'message'
  | 'process-completed';

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
};

export interface ProcessEvent {
  id: string;
  /** Sắp xếp theo chuỗi 'YYYY-MM-DD HH:mm' (không dùng Date runtime). */
  thoiDiem: string;
  maHoSo: string;
  process: string;
  loai: EventType;
  /** Tên phần tử BPMN. */
  element: string;
  chiTiet: string;
  actor?: string;
}

export const seedEvents: ProcessEvent[] = [
  // Luồng HS-2026-018 (RD01.01) — đi bộ gần trọn vòng, còn ở HĐ KHCN.
  {
    id: 'e-018-1',
    thoiDiem: '2026-06-20 09:12',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'process-started',
    element: 'Bắt đầu',
    chiTiet: 'Khởi tạo instance, correlation key = HS-2026-018',
    actor: 'TS. Trần Văn Nam',
  },
  {
    id: 'e-018-2',
    thoiDiem: '2026-06-20 09:12',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'task-created',
    element: 'Khởi tạo hồ sơ',
    chiTiet: 'User task giao nhóm PM/PA/NNC',
    actor: 'PM/PA/NNC',
  },
  {
    id: 'e-018-3',
    thoiDiem: '2026-06-20 09:40',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'task-completed',
    element: 'Khởi tạo hồ sơ',
    chiTiet: 'Hoàn tất; app đã validate "trong kế hoạch năm" (BR-RD0101-001)',
    actor: 'TS. Trần Văn Nam',
  },
  {
    id: 'e-018-4',
    thoiDiem: '2026-06-22 14:30',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'task-completed',
    element: 'Ký duyệt cấp Trung tâm/Khối',
    chiTiet: 'Đồng ý trình xét duyệt',
    actor: 'Đ/c Lê Minh Quang',
  },
  {
    id: 'e-018-5',
    thoiDiem: '2026-06-23 09:00',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'service-task',
    element: 'Đồng bộ nhân sự QLNS',
    chiTiet: 'Job qlns:sync-staff — lấy 12 nhân sự (PL1)',
    actor: 'job worker: qlns',
  },
  {
    id: 'e-018-6',
    thoiDiem: '2026-06-25 10:05',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'task-completed',
    element: 'Thẩm định Cơ quan nghiệp vụ',
    chiTiet: 'Phiếu nhận xét CQNV đã ký',
    actor: 'Phòng CLKHCN',
  },
  {
    id: 'e-018-7',
    thoiDiem: '2026-06-27 16:40',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'gateway',
    element: 'DMN: Sinh danh sách Hội đồng',
    chiTiet: 'Định tuyến cấp Cơ sở → HĐ KHCN VHT (quorum 2/3)',
    actor: 'DMN',
  },
  {
    id: 'e-018-8',
    thoiDiem: '2026-06-27 16:41',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'task-created',
    element: 'Hội đồng KHCN phê duyệt',
    chiTiet: 'Multi-instance, giao HĐ KHCN VHT; hạn 05/07/2026',
    actor: 'HĐ KHCN VHT',
  },
  {
    id: 'e-018-9',
    thoiDiem: '2026-06-30 08:00',
    maHoSo: 'HS-2026-018',
    process: 'RD01.01',
    loai: 'timer',
    element: 'SLA nhắc việc',
    chiTiet: 'Timer boundary: còn 5 ngày tới hạn — gửi nhắc',
    actor: 'Camunda',
  },

  // Luồng HS-2026-033 (RD03.03) — service task SAP lỗi → incident.
  {
    id: 'e-033-1',
    thoiDiem: '2026-07-02 14:00',
    maHoSo: 'HS-2026-033',
    process: 'RD03.03',
    loai: 'process-started',
    element: 'Bắt đầu',
    chiTiet: 'Khởi tạo instance đồng bộ chi phí',
    actor: 'Hệ thống',
  },
  {
    id: 'e-033-2',
    thoiDiem: '2026-07-02 14:05',
    maHoSo: 'HS-2026-033',
    process: 'RD03.03',
    loai: 'service-task',
    element: 'Đồng bộ dự toán sang SAP',
    chiTiet: 'Job sap:sync-budget bắt đầu',
    actor: 'job worker: sap',
  },
  {
    id: 'e-033-3',
    thoiDiem: '2026-07-02 14:06',
    maHoSo: 'HS-2026-033',
    process: 'RD03.03',
    loai: 'incident',
    element: 'Đồng bộ dự toán sang SAP',
    chiTiet: 'HTTP 504 timeout, retries=0 → tạo incident, chờ xử lý ở Operate',
    actor: 'job worker: sap',
  },

  // Luồng HS-2026-021 (RD01.02) — rework/từ chối.
  {
    id: 'e-021-1',
    thoiDiem: '2026-06-18 08:00',
    maHoSo: 'HS-2026-021',
    process: 'RD01.02',
    loai: 'process-started',
    element: 'Bắt đầu',
    chiTiet: 'Khởi tạo instance chủ trương cấp Tập đoàn',
    actor: 'TS. Hoàng Đức Anh',
  },
  {
    id: 'e-021-2',
    thoiDiem: '2026-06-19 13:20',
    maHoSo: 'HS-2026-021',
    process: 'RD01.02',
    loai: 'task-completed',
    element: 'Ký duyệt cấp Trung tâm/Khối',
    chiTiet: 'Đồng ý trình',
    actor: 'Đ/c Vũ Thành Long',
  },
  {
    id: 'e-021-3',
    thoiDiem: '2026-06-21 09:10',
    maHoSo: 'HS-2026-021',
    process: 'RD01.02',
    loai: 'gateway',
    element: 'Gateway: Kết quả thẩm định',
    chiTiet: 'ketQuaThamDinh = "Chưa đạt" → nhánh trả lại (rework, OQ-002)',
    actor: 'Phòng TCKT',
  },
  {
    id: 'e-021-4',
    thoiDiem: '2026-06-21 09:10',
    maHoSo: 'HS-2026-021',
    process: 'RD01.02',
    loai: 'process-completed',
    element: 'Kết thúc (trả lại)',
    chiTiet: 'Instance kết thúc nhánh từ chối; app chuyển hồ sơ về chủ nhiệm',
    actor: 'Camunda',
  },

  // Luồng HS-2026-012 (RD02.01) — hoàn tất trọn vẹn.
  {
    id: 'e-012-1',
    thoiDiem: '2026-05-30 08:20',
    maHoSo: 'HS-2026-012',
    process: 'RD02.01',
    loai: 'process-started',
    element: 'Bắt đầu',
    chiTiet: 'Khởi tạo instance xét duyệt',
    actor: 'ThS. Nguyễn Thị Lan',
  },
  {
    id: 'e-012-2',
    thoiDiem: '2026-06-03 11:00',
    maHoSo: 'HS-2026-012',
    process: 'RD02.01',
    loai: 'gateway',
    element: 'DMN: Đạt/Chưa đạt',
    chiTiet: 'Chuyên quản kết luận "Đạt" → tiếp tục HĐXD',
    actor: 'DMN',
  },
  {
    id: 'e-012-3',
    thoiDiem: '2026-06-10 15:30',
    maHoSo: 'HS-2026-012',
    process: 'RD02.01',
    loai: 'task-completed',
    element: 'Hội đồng Xét duyệt (phiên 1 & 2)',
    chiTiet: 'Quorum đạt, chuyển HĐ KHCN',
    actor: 'HĐXD',
  },
  {
    id: 'e-012-4',
    thoiDiem: '2026-06-16 10:00',
    maHoSo: 'HS-2026-012',
    process: 'RD02.01',
    loai: 'process-completed',
    element: 'Kết thúc',
    chiTiet: 'TGĐ phê duyệt mở mới; app khoá hồ sơ & sinh QĐ',
    actor: 'TGĐ VHT',
  },
];

/** Danh sách mã hồ sơ có nhật ký (cho bộ lọc màn Nhật ký luồng). */
export const eventDossiers = Array.from(new Set(seedEvents.map((e) => e.maHoSo)));
