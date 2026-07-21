import { RD0101_BPMN } from './rd0101Bpmn'
import { RD0102_BPMN } from './rd0102Bpmn'
import { RD0201_BPMN } from './rd0201Bpmn'
import { RD0202_BPMN } from './rd0202Bpmn'

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
  /** Mã candidateGroup (data/roles.ts) — hiển thị catalog; check quyền dùng DossierStep.vaiTroCodes. */
  vaiTroCodes?: string[]
  hanhDong: string
  formKey?: string
  /**
   * Slot phê duyệt (Need Role) — hình chiếu mock của `zeebe:TaskHeaders["needRole"]`
   * ghi qua Properties Panel (Slice C, docs/research/approval-slot-catalog-plan.md
   * §4.C). Trống = quy trình CHƯA re-author bằng Need Role — approvalSlotMap.ts sẽ
   * dùng ROLE_TO_SLOT suy từ vaiTroCodes như cũ (Slice D §4.D).
   */
  needRole?: string
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
      { key: 't1', ten: 'Khởi tạo hồ sơ', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo', formKey: 'phieu-chu-truong' },
      { key: 't2', ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ TT/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], hanhDong: 'Ký duyệt', formKey: 'phieu-phe-duyet' },
      // Mở cho cả 4 TP theo nhãn hiện hành (BPMN Task_9 chỉ TP_CLKHCN — nới chủ
      // đích để tài khoản tp@ demo được đủ 4 vai), khớp bước seed trong dossiers.ts.
      { key: 't3', ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT, NS, GĐ TTMS', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT', 'TP_NS', 'GD_TTMS'], hanhDong: 'Thẩm định', formKey: 'phieu-nhan-xet', needRole: 'THAM_DINH' },
      { key: 't4', ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], hanhDong: 'Lập báo cáo', formKey: 'bao-cao-tham-dinh' },
      { key: 't5', ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'HĐ KHCN VHT', vaiTroCodes: ['HDKHCN'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet', needRole: 'HOI_DONG' },
      { key: 't6', ten: 'TGĐ phê duyệt Quyết định chủ trương', vaiTro: 'TGĐ VHT', vaiTroCodes: ['TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet', needRole: 'PHE_DUYET' },
    ],
    // RD01.01 = process ĐÃ re-author Need Role (Slice C) cho cả 3 bước phê duyệt —
    // ví dụ "đã migrate" trong bản mock. RD01.02/RD02.01/RD05.01 CHƯA re-author,
    // minh hoạ fallback ROLE_TO_SLOT (approvalSlotMap.ts) vẫn hoạt động song song.
    bpmnXml: RD0101_BPMN,
  },
  {
    ma: 'RD01.02', ten: 'Xét duyệt Chủ trương cấp Tập đoàn', nhom: 'RD01',
    trangThai: 'active', instances: 3, capNhat: '2026-07-06',
    moTa: 'Kế thừa cấp CS + CQ KHCN TĐ, HĐ KHCN TĐ, TGĐ TĐ; hỗ trợ vai trò thay thế.',
    versions: [
      { v: '1.0', date: '2026-05-20', note: 'Bản đầu tiên' },
      { v: '1.1', date: '2026-06-25', note: 'Thêm act-on-behalf cho Tập đoàn' },
      { v: '1.2', date: '2026-07-06', note: 'Dựng BPMN đầy đủ 10 làn theo sơ đồ nghiệp vụ (bước 1–23)' },
    ],
    taskSteps: [
      { key: 't1', ten: 'Khởi tạo & dự thảo HS cấp Tập đoàn', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo', formKey: 'phieu-chu-truong' },
      { key: 't2', ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ TT/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], hanhDong: 'Ký duyệt', formKey: 'phieu-phe-duyet' },
      { key: 't3', ten: 'Thẩm định HS Chủ trương', vaiTro: 'HĐ KHCN VHT', vaiTroCodes: ['HDKHCN'], hanhDong: 'Thẩm định', formKey: 'phieu-nhan-xet' },
      { key: 't4', ten: 'Lập & ký CV đề nghị thẩm định', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], hanhDong: 'Lập công văn', formKey: 'phieu-phe-duyet' },
      { key: 't5', ten: 'Phê duyệt CV đề nghị thẩm định', vaiTro: 'TGĐ VHT', vaiTroCodes: ['TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
      { key: 't6', ten: 'Kiểm tra HS, lập CV thẩm định', vaiTro: 'CQ KHCN TĐ', vaiTroCodes: ['CQ_KHCN_TD'], hanhDong: 'Thẩm định', formKey: 'phieu-nhan-xet' },
      { key: 't7', ten: 'PNX cơ quan nghiệp vụ Tập đoàn', vaiTro: 'CQNV TĐ', vaiTroCodes: ['CQNV_TD'], hanhDong: 'Nhận xét', formKey: 'phieu-nhan-xet' },
      { key: 't8', ten: 'Hội đồng KHCN TĐ ký duyệt', vaiTro: 'HĐ KHCN TĐ', vaiTroCodes: ['HDKHCN_TD'], hanhDong: 'Ký duyệt', formKey: 'phieu-phe-duyet' },
      { key: 't9', ten: 'TGĐ TĐ phê duyệt QĐ chủ trương', vaiTro: 'TGĐ TĐ', vaiTroCodes: ['BTGD_TD'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
    bpmnXml: RD0102_BPMN,
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
      { key: 't1', ten: 'Khởi tạo hồ sơ', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 't2', ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 't3', ten: 'Hội đồng Xét duyệt (phiên 1 & 2)', vaiTro: 'HĐXD cấp Cơ sở', vaiTroCodes: ['HDXD'], hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 't4', ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'HĐ KHCN VHT', vaiTroCodes: ['HDKHCN'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
      { key: 't5', ten: 'TGĐ phê duyệt mở mới đề tài', vaiTro: 'TGĐ VHT', vaiTroCodes: ['TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
    bpmnXml: RD0201_BPMN,
  },
  {
    ma: 'RD02.02', ten: 'Xét duyệt NV KHCN cấp Tập đoàn', nhom: 'RD02',
    trangThai: 'active', instances: 2, capNhat: '2026-07-20',
    moTa:
      'Khởi tạo HSXD → kiểm tra dự thảo 1 → thẩm định song song KHCN/TCKT/MS/NS → ký dự thảo 2 → thành lập HĐXD VHT → phiên 1/2 → trình CV đề nghị xét duyệt cấp Tập đoàn.',
    versions: [
      { v: '1.0', date: '2026-05-25', note: 'Bản đầu tiên (catalog)' },
      {
        v: '0.1',
        date: '2026-07-20',
        note: 'BPMN v0.1 từ file RD02.02-Xet-duyet-NV-KHCN-cap-Tap-doan-v0.1.bpmn',
      },
      {
        v: '0.2',
        date: '2026-07-20',
        note: 'BPMN fixed — Zeebe assignment/form, gateway condition/default, end events',
      },
    ],
    taskSteps: [
      {
        key: 'Task_1',
        ten: '1. Khởi tạo luồng RD02.02',
        vaiTro: 'PM',
        vaiTroCodes: ['PM'],
        hanhDong: 'Khởi tạo',
      },
      {
        key: 'Task_2',
        ten: '2. Xây dựng HSXD dự thảo 1',
        vaiTro: 'PM/PA/NNC',
        vaiTroCodes: ['PM', 'PA', 'NNC'],
        hanhDong: 'Soạn thảo',
      },
      {
        key: 'Task_3_KHCN',
        ten: '3.1. Thẩm định KHCN',
        vaiTro: 'CQ KHCN VHT',
        vaiTroCodes: ['CQ_KHCN'],
        hanhDong: 'Thẩm định',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_3_TCKT',
        ten: '3.2. Thẩm định TCKT',
        vaiTro: 'CQ TCKT VHT',
        vaiTroCodes: ['CQ_TCKT'],
        hanhDong: 'Thẩm định',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_3_MS',
        ten: '3.3. Thẩm định Mua sắm',
        vaiTro: 'CQ MS VHT',
        vaiTroCodes: ['CQ_MS'],
        hanhDong: 'Thẩm định',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_3_NS',
        ten: '3.4. Thẩm định Nhân sự',
        vaiTro: 'CQ NS VHT',
        vaiTroCodes: ['CQ_NS'],
        hanhDong: 'Thẩm định',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_3_5',
        ten: '3.5. Nhận PNX và hoàn chỉnh HSXD dự thảo 2',
        vaiTro: 'PM/PA/NNC',
        vaiTroCodes: ['PM', 'PA', 'NNC'],
        hanhDong: 'Hoàn chỉnh',
      },
      {
        key: 'Task_4',
        ten: '4. Ký HSXD dự thảo 2',
        vaiTro: 'BGĐ TT/Khối',
        vaiTroCodes: ['BGD_TT', 'BGD_KHOI'],
        hanhDong: 'Ký duyệt',
        formKey: 'phieu-phe-duyet',
      },
      {
        key: 'Task_5',
        ten: '5. Lập và trình QĐ thành lập HĐXD VHT',
        vaiTro: 'TP CLKHCN',
        vaiTroCodes: ['TP_CLKHCN'],
        hanhDong: 'Trình ký',
      },
      {
        key: 'Task_6',
        ten: '6. Phê duyệt QĐ thành lập HĐXD VHT',
        vaiTro: 'CQ QLKHCN VHT',
        vaiTroCodes: ['CQ_QLKHCN'],
        hanhDong: 'Phê duyệt',
        formKey: 'phieu-phe-duyet',
      },
      {
        key: 'Task_7',
        ten: '7. Họp HĐXD VHT phiên 1',
        vaiTro: 'HĐXD VHT',
        vaiTroCodes: ['HDXD_VHT'],
        hanhDong: 'Đánh giá',
        formKey: 'phieu-nhan-xet',
      },
      {
        key: 'Task_8',
        ten: '8. Hoàn thiện HSXD dự thảo 3',
        vaiTro: 'PM/PA/NNC',
        vaiTroCodes: ['PM', 'PA', 'NNC'],
        hanhDong: 'Hoàn thiện',
      },
      {
        key: 'Task_9_KHCN',
        ten: '9.1. Rà soát KHCN',
        vaiTro: 'CQ KHCN VHT',
        vaiTroCodes: ['CQ_KHCN'],
        hanhDong: 'Rà soát',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_9_TCKT',
        ten: '9.2. Rà soát TCKT',
        vaiTro: 'CQ TCKT VHT',
        vaiTroCodes: ['CQ_TCKT'],
        hanhDong: 'Rà soát',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_9_MS',
        ten: '9.3. Rà soát Mua sắm',
        vaiTro: 'CQ MS VHT',
        vaiTroCodes: ['CQ_MS'],
        hanhDong: 'Rà soát',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_9_NS',
        ten: '9.4. Rà soát Nhân sự',
        vaiTro: 'CQ NS VHT',
        vaiTroCodes: ['CQ_NS'],
        hanhDong: 'Rà soát',
        formKey: 'phieu-dat-chua-dat',
      },
      {
        key: 'Task_10',
        ten: '10. Họp HĐXD VHT phiên 2',
        vaiTro: 'HĐXD VHT',
        vaiTroCodes: ['HDXD_VHT'],
        hanhDong: 'Chấm điểm',
        formKey: 'phieu-nhan-xet',
      },
      {
        key: 'Task_11',
        ten: '11. Lập CV đề nghị xét duyệt cấp Tập đoàn',
        vaiTro: 'PM/PA/NNC',
        vaiTroCodes: ['PM', 'PA', 'NNC'],
        hanhDong: 'Trình ký',
      },
    ],
    bpmnXml: RD0202_BPMN,
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
      { key: 't1', ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 't2', ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 't3', ten: 'QĐ thành lập Hội đồng Nghiệm thu', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], hanhDong: 'Lập QĐ' },
      { key: 't4', ten: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS', vaiTroCodes: ['HDNT'], hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 't5', ten: 'TGĐ công nhận kết quả', vaiTro: 'TGĐ VHT', vaiTroCodes: ['TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
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
