import { RD0101_BPMN } from './rd0101Bpmn'

// Dữ liệu mock cho màn Danh mục quy trình.
// Seed từ catalog RD01–RD10 (docs/req) — trạng thái phản ánh đúng độ phủ RTM.

export type ProcessStatus = 'active' | 'draft' | 'stopped' | 'planned'

export interface ProcessVersion {
  v: string
  date: string
  note: string
}

export interface TaskStep {
  key: string
  ten: string
  vaiTro: string
  hanhDong: string
  formKey?: string
}

export interface ProcessDef {
  ma: string
  ten: string
  nhom: string
  trangThai: ProcessStatus
  instances: number
  capNhat: string
  moTa: string
  versions: ProcessVersion[]
  taskSteps?: TaskStep[]
  /** Định nghĩa BPMN (XML) — nguồn triển khai lên engine. Có khi vẽ ở màn Tạo mới. */
  bpmnXml?: string
}

export const NHOM: Record<string, string> = {
  RD01: 'Xét duyệt Chủ trương',
  RD02: 'Xét duyệt NV KHCN',
  RD03: 'Thực hiện NV KHCN',
  RD04: 'Điều chỉnh NV KHCN',
  RD05: 'Nghiệm thu',
  RD06: 'Quyết toán',
  RD08: 'Sở hữu trí tuệ',
}

export const STATUS_META: Record<
  ProcessStatus,
  { label: string; color: string }
> = {
  active: { label: 'Đang chạy', color: 'green' },
  draft: { label: 'Nháp', color: 'gold' },
  stopped: { label: 'Tạm ngừng', color: 'default' },
  planned: { label: 'Chưa triển khai', color: 'red' },
}

export const curVer = (p: ProcessDef): string =>
  p.versions.length ? p.versions[p.versions.length - 1].v : '—'

export function bumpVersion(v: string): string {
  if (v === '—') return '1.0'
  const [a, b] = v.split('.').map(Number)
  return `${a}.${(b || 0) + 1}`
}

export const seedProcesses: ProcessDef[] = [
  {
    ma: 'RD01.01', ten: 'Xét duyệt Chủ trương cấp Cơ sở', nhom: 'RD01',
    trangThai: 'active', instances: 7, capNhat: '2026-06-28',
    moTa: 'Khởi tạo → ký cấp TT/Khối → CQNV thẩm định → HĐ KHCN → TGĐ ban hành QĐ chủ trương.',
    versions: [
      { v: '1.0', date: '2026-05-12', note: 'Bản đầu tiên' },
      { v: '1.1', date: '2026-06-10', note: 'Bổ sung phiếu nhận xét CQNV' },
      { v: '1.2', date: '2026-06-28', note: 'Chuẩn hoá bước ký TGĐ' },
    ],
    taskSteps: [
      { key: 't1', ten: 'Khởi tạo hồ sơ', vaiTro: 'PM/PA/NNC', hanhDong: 'Khởi tạo' },
      { key: 't2', ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ TT/Khối', hanhDong: 'Ký duyệt', formKey: 'phieu-phe-duyet' },
      { key: 't3', ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'CQNV VHT', hanhDong: 'Thẩm định', formKey: 'phieu-nhan-xet' },
      { key: 't4', ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', hanhDong: 'Lập báo cáo', formKey: 'bao-cao-tham-dinh' },
      { key: 't5', ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'HĐ KHCN VHT', hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
      { key: 't6', ten: 'TGĐ phê duyệt Quyết định chủ trương', vaiTro: 'TGĐ VHT', hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
    bpmnXml: RD0101_BPMN,
  },
  {
    ma: 'RD01.02', ten: 'Xét duyệt Chủ trương cấp Tập đoàn', nhom: 'RD01',
    trangThai: 'active', instances: 3, capNhat: '2026-06-25',
    moTa: 'Kế thừa cấp CS + CQ KHCN TĐ, HĐ KHCN TĐ, TGĐ TĐ; hỗ trợ vai trò thay thế.',
    versions: [
      { v: '1.0', date: '2026-05-20', note: 'Bản đầu tiên' },
      { v: '1.1', date: '2026-06-25', note: 'Thêm act-on-behalf cho Tập đoàn' },
    ],
  },
  {
    ma: 'RD02.01', ten: 'Xét duyệt NV KHCN cấp Cơ sở', nhom: 'RD02',
    trangThai: 'active', instances: 5, capNhat: '2026-06-27',
    moTa: 'Kế thừa chủ trương → chuyên quản Đạt/Chưa đạt → HĐXD (phiên 1&2) → TGĐ phê duyệt mở mới.',
    versions: [
      { v: '1.0', date: '2026-05-22', note: 'Bản đầu tiên' },
      { v: '1.1', date: '2026-06-27', note: 'Mô hình hoá phiên họp 1/2' },
    ],
    taskSteps: [
      { key: 't1', ten: 'Khởi tạo hồ sơ', vaiTro: 'PM/PA/NNC', hanhDong: 'Khởi tạo' },
      { key: 't2', ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 't3', ten: 'Hội đồng Xét duyệt (phiên 1 & 2)', vaiTro: 'HĐXD cấp Cơ sở', hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 't4', ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'HĐ KHCN VHT', hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
      { key: 't5', ten: 'TGĐ phê duyệt mở mới đề tài', vaiTro: 'TGĐ VHT', hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD02.02', ten: 'Xét duyệt NV KHCN cấp Tập đoàn', nhom: 'RD02',
    trangThai: 'active', instances: 2, capNhat: '2026-06-27',
    moTa: 'HĐXD TĐ, HĐ KHCN TĐ, BTGĐ TĐ; CV đề nghị xét duyệt.',
    versions: [{ v: '1.0', date: '2026-05-25', note: 'Bản đầu tiên' }],
  },
  {
    ma: 'RD03.01', ten: 'Tương tác PM QLKHCN ↔ QLNS (nhân sự)', nhom: 'RD03',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-15',
    moTa: 'Đồng bộ danh sách nhân sự & chi phí lương (PL1) với phần mềm QLNS.',
    versions: [{ v: '0.1', date: '2026-06-15', note: 'Nháp — chờ chốt mô hình đồng bộ (OQ-009)' }],
  },
  {
    ma: 'RD03.02', ten: 'Tương tác PM QLKHCN ↔ Mua sắm (MS)', nhom: 'RD03',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-15',
    moTa: 'Đồng bộ cấu trúc sản phẩm, tờ trình/gói thầu/hợp đồng (PL2–PL5).',
    versions: [{ v: '0.1', date: '2026-06-15', note: 'Nháp' }],
  },
  {
    ma: 'RD03.03', ten: 'Tương tác PM QLKHCN ↔ SAP (chi phí)', nhom: 'RD03',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-15',
    moTa: 'Đồng bộ kinh phí thực hiện/quyết toán theo PL1–PL6.',
    versions: [{ v: '0.1', date: '2026-06-15', note: 'Nháp' }],
  },
  {
    ma: 'RD03.06', ten: 'Báo cáo tiến độ thực hiện đề tài', nhom: 'RD03',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-18',
    moTa: 'Khởi tạo/cập nhật/trình ký/xuất báo cáo tiến độ theo form mẫu.',
    versions: [{ v: '0.2', date: '2026-06-18', note: 'Nháp — chờ AC' }],
  },
  {
    ma: 'RD04.01', ten: 'Điều chỉnh Chủ nhiệm qua CQ KHCN (CS)', nhom: 'RD04',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-12',
    moTa: 'PM cũ → PM mới → CQ KHCN thẩm định → BTGĐ phê duyệt QĐ điều chỉnh CNĐT.',
    versions: [{ v: '0.1', date: '2026-06-12', note: 'Nháp — chờ decision table định tuyến (OQ-008)' }],
  },
  {
    ma: 'RD04.03', ten: 'Điều chỉnh qua HĐXD ĐC (CS)', nhom: 'RD04',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-12',
    moTa: 'Điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương.',
    versions: [{ v: '0.1', date: '2026-06-12', note: 'Nháp' }],
  },
  {
    ma: 'RD04.05', ten: 'Dừng thực hiện NV KHCN (CS)', nhom: 'RD04',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-12',
    moTa: 'Qua HĐ Đánh giá hoàn thành (ĐGHT).',
    versions: [{ v: '0.1', date: '2026-06-12', note: 'Nháp' }],
  },
  {
    ma: 'RD05.01', ten: 'Nghiệm thu NV KHCN cấp Cơ sở', nhom: 'RD05',
    trangThai: 'active', instances: 4, capNhat: '2026-06-26',
    moTa: 'Khởi tạo hồ sơ → QĐ TL HĐNT → HĐNT đánh giá → TGĐ công nhận kết quả.',
    versions: [
      { v: '1.0', date: '2026-05-28', note: 'Bản đầu tiên' },
      { v: '1.1', date: '2026-06-26', note: 'Ràng buộc RD03 hoàn thành' },
    ],
    taskSteps: [
      { key: 't1', ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'PM/PA/NNC', hanhDong: 'Khởi tạo' },
      { key: 't2', ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 't3', ten: 'QĐ thành lập Hội đồng Nghiệm thu', vaiTro: 'CQ QLKHCN', hanhDong: 'Lập QĐ' },
      { key: 't4', ten: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS', hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 't5', ten: 'TGĐ công nhận kết quả', vaiTro: 'TGĐ VHT', hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD05.02', ten: 'Nghiệm thu NV KHCN cấp Tập đoàn', nhom: 'RD05',
    trangThai: 'active', instances: 1, capNhat: '2026-06-26',
    moTa: 'HĐNT TĐ có Tổ KT; BTGĐ TĐ công nhận kết quả.',
    versions: [{ v: '1.0', date: '2026-05-30', note: 'Bản đầu tiên' }],
  },
  {
    ma: 'RD06.01', ten: 'Quyết toán NV KHCN cấp Cơ sở', nhom: 'RD06',
    trangThai: 'planned', instances: 0, capNhat: '—',
    moTa: '⚠ Tài liệu gốc bỏ trống tác nhân/luồng (OQ-010) — cần khảo sát bổ sung.',
    versions: [],
  },
  {
    ma: 'RD06.02', ten: 'Quyết toán NV KHCN cấp Tập đoàn', nhom: 'RD06',
    trangThai: 'planned', instances: 0, capNhat: '—',
    moTa: '⚠ Chưa đủ thông tin để mô hình hoá (OQ-010).',
    versions: [],
  },
  {
    ma: 'RD08', ten: 'Quản lý sở hữu trí tuệ', nhom: 'RD08',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-14',
    moTa: 'Đăng ký SHTT (bài báo, sáng chế), công nghệ lõi — thiếu luồng phê duyệt (OQ-014).',
    versions: [{ v: '0.1', date: '2026-06-14', note: 'Nháp — thiếu tác nhân/luồng' }],
  },
]
