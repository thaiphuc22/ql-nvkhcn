import { RD0101_BPMN } from './rd0101Bpmn'
import { RD0102_BPMN } from './rd0102Bpmn'
import { RD0201_BPMN } from './rd0201Bpmn'
import { RD0202_BPMN } from './rd0202Bpmn'
import { RD0601_BPMN } from './rd0601Bpmn'
import { RD0602_BPMN } from './rd0602Bpmn'

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

/** 10 nhóm nghiệp vụ — đồng bộ docs/req + processLifecycle.ts */
export const NHOM: Record<string, string> = {
  RD01: 'Xét duyệt Chủ trương',
  RD02: 'Xét duyệt NV KHCN',
  RD03: 'Thực hiện NV KHCN',
  RD04: 'Điều chỉnh NV KHCN',
  RD05: 'Nghiệm thu',
  RD06: 'Quyết toán',
  RD07: 'Quản lý danh mục SPDV',
  RD08: 'Sở hữu trí tuệ',
  RD09: 'Quản lý, tổng hợp thông tin',
  RD10: 'Lưu trữ hồ sơ, văn bản pháp lý',
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
    trangThai: 'active', instances: 2, capNhat: '2026-09-08',
    moTa: 'Đồng bộ danh sách nhân sự & chi phí lương (PL1) với phần mềm QLNS.',
    versions: [
      { v: '0.1', date: '2026-06-15', note: 'Nháp' },
      { v: '1.0', date: '2026-09-08', note: 'Mock runnable — giả lập đồng bộ QLNS' },
    ],
    taskSteps: [
      { key: 'rd0301_t1', ten: 'Khởi tạo yêu cầu đồng bộ nhân sự', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0301_t2', ten: 'Gán / cập nhật DS nhân sự & công dự kiến (PL1)', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Cập nhật' },
      { key: 'rd0301_t3', ten: 'Đồng bộ sang PM QLNS', vaiTro: 'CQ NS VHT', vaiTroCodes: ['CQ_NS'], hanhDong: 'Đồng bộ' },
      { key: 'rd0301_t4', ten: 'Xác nhận chi phí lương phân bổ từ QLNS', vaiTro: 'CQ TCKT VHT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Xác nhận' },
    ],
  },
  {
    ma: 'RD03.02', ten: 'Tương tác PM QLKHCN ↔ Mua sắm (MS)', nhom: 'RD03',
    trangThai: 'active', instances: 1, capNhat: '2026-09-08',
    moTa: 'Đồng bộ cấu trúc sản phẩm, tờ trình/gói thầu/hợp đồng (PL2–PL5).',
    versions: [
      { v: '0.1', date: '2026-06-15', note: 'Nháp' },
      { v: '1.0', date: '2026-09-08', note: 'Mock runnable — giả lập đồng bộ MS' },
    ],
    taskSteps: [
      { key: 'rd0302_t1', ten: 'Khởi tạo yêu cầu đồng bộ mua sắm', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0302_t2', ten: 'Khai báo cấu trúc SP (System→VTLK, PL2–PL5)', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khai báo' },
      { key: 'rd0302_t3', ten: 'Đồng bộ tờ trình / gói thầu / HĐ từ PM MS', vaiTro: 'CQ MS VHT', vaiTroCodes: ['CQ_MS'], hanhDong: 'Đồng bộ' },
      { key: 'rd0302_t4', ten: 'Xác nhận tiến độ mua sắm', vaiTro: 'CQ KHCN VHT', vaiTroCodes: ['CQ_KHCN'], hanhDong: 'Xác nhận' },
    ],
  },
  {
    ma: 'RD03.03', ten: 'Tương tác PM QLKHCN ↔ SAP (chi phí)', nhom: 'RD03',
    trangThai: 'active', instances: 2, capNhat: '2026-09-08',
    moTa: 'Đồng bộ kinh phí thực hiện/quyết toán theo PL1–PL6.',
    versions: [
      { v: '0.1', date: '2026-06-15', note: 'Nháp' },
      { v: '1.0', date: '2026-09-08', note: 'Mock runnable — giả lập đồng bộ SAP' },
    ],
    taskSteps: [
      { key: 'rd0303_t1', ten: 'Khởi tạo yêu cầu đồng bộ chi phí SAP', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0303_t2', ten: 'Mapping mã NV ↔ Internal Order SAP', vaiTro: 'CQ TCKT VHT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Mapping' },
      { key: 'rd0303_t3', ten: 'Kéo số liệu kinh phí thực hiện PL1–PL6', vaiTro: 'CQ TCKT VHT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Đồng bộ' },
      { key: 'rd0303_t4', ten: 'Xác nhận số liệu chi phí đề tài', vaiTro: 'TP TCKT', vaiTroCodes: ['TP_TCKT'], hanhDong: 'Xác nhận' },
    ],
  },
  {
    ma: 'RD03.06', ten: 'Báo cáo tiến độ thực hiện đề tài', nhom: 'RD03',
    trangThai: 'active', instances: 3, capNhat: '2026-09-08',
    moTa: 'Khởi tạo/cập nhật/trình ký/xuất báo cáo tiến độ theo form mẫu (định kỳ 6/12 tháng).',
    versions: [
      { v: '0.2', date: '2026-06-18', note: 'Nháp' },
      { v: '1.0', date: '2026-09-08', note: 'Mock runnable — bám mục 3.6 tài liệu quy trình' },
    ],
    taskSteps: [
      { key: 'rd0306_t1', ten: 'Khởi tạo / cập nhật Báo cáo tiến độ', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo', formKey: 'bm-bao-cao-tien-do' },
      { key: 'rd0306_t2', ten: 'Chuyên quản nhận xét (KHCN/MS/NS/TCKT)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Nhận xét', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0306_t3', ten: 'BGĐ TT/Khối ký duyệt', vaiTro: 'BGĐ Trung tâm/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], hanhDong: 'Ký duyệt' },
      { key: 'rd0306_t4', ten: 'CQNV VHT (TP CLKHCN/TCKT) ký duyệt', vaiTro: 'TP CLKHCN / TP TCKT', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT'], hanhDong: 'Ký duyệt' },
      { key: 'rd0306_t5', ten: 'BTGĐ VHT phê duyệt Báo cáo', vaiTro: 'Phó TGĐ Chuyên trách', vaiTroCodes: ['PTGD_CT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD04.01', ten: 'Điều chỉnh Chủ nhiệm qua CQ KHCN (CS)', nhom: 'RD04',
    trangThai: 'active', instances: 1, capNhat: '2026-09-08',
    moTa: 'PM cũ → PM mới → CQ KHCN thẩm định → BTGĐ phê duyệt QĐ điều chỉnh CNĐT.',
    versions: [
      { v: '0.1', date: '2026-06-12', note: 'Nháp' },
      { v: '1.0', date: '2026-09-08', note: 'Mock runnable — mục 4.1' },
    ],
    taskSteps: [
      { key: 'rd0401_t1', ten: 'Khởi tạo hồ sơ điều chỉnh CNĐT (PM cũ)', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0401_t2', ten: 'PM mới ký duyệt tiếp nhận', vaiTro: 'PM (mới)', vaiTroCodes: ['PM'], hanhDong: 'Ký duyệt' },
      { key: 'rd0401_t3', ten: 'BGĐ TT/Khối ký duyệt', vaiTro: 'BGĐ Trung tâm/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], hanhDong: 'Ký duyệt' },
      { key: 'rd0401_t4', ten: 'CQ KHCN thẩm định điều kiện', vaiTro: 'CQ KHCN VHT', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], hanhDong: 'Thẩm định' },
      { key: 'rd0401_t5', ten: 'BTGĐ phê duyệt QĐ điều chỉnh CNĐT', vaiTro: 'TGĐ / Phó TGĐ', vaiTroCodes: ['TGD_VHT', 'PTGD_CT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD04.02', ten: 'Điều chỉnh nội dung/dự toán qua HĐ KHCN (CS)', nhom: 'RD04',
    trangThai: 'active', instances: 1, capNhat: '2026-09-08',
    moTa: 'Điều chỉnh nội dung/thời gian/dự toán không tăng tổng dự toán — qua HĐ KHCN.',
    versions: [{ v: '1.0', date: '2026-09-08', note: 'Mock runnable — mục 4.2' }],
    taskSteps: [
      { key: 'rd0402_t1', ten: 'Khởi tạo hồ sơ điều chỉnh', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0402_t2', ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0402_t3', ten: 'Lập Báo cáo thông qua HS điều chỉnh', vaiTro: 'CQ KHCN VHT', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], hanhDong: 'Lập BC' },
      { key: 'rd0402_t4', ten: 'HĐ KHCN phê duyệt Báo cáo', vaiTro: 'Hội đồng KHCN VHT', vaiTroCodes: ['HDKHCN'], hanhDong: 'Phê duyệt' },
      { key: 'rd0402_t5', ten: 'BTGĐ phê duyệt QĐ điều chỉnh', vaiTro: 'TGĐ / Phó TGĐ', vaiTroCodes: ['TGD_VHT', 'PTGD_CT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD04.03', ten: 'Điều chỉnh qua HĐXD ĐC (CS)', nhom: 'RD04',
    trangThai: 'active', instances: 1, capNhat: '2026-09-08',
    moTa: 'Điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương — qua HĐXD điều chỉnh.',
    versions: [
      { v: '0.1', date: '2026-06-12', note: 'Nháp' },
      { v: '1.0', date: '2026-09-08', note: 'Mock runnable — mục 4.3' },
    ],
    taskSteps: [
      { key: 'rd0403_t1', ten: 'Khởi tạo hồ sơ điều chỉnh (HĐXD ĐC)', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0403_t2', ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0403_t3', ten: 'QĐ thành lập HĐXD điều chỉnh', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN', 'TP_CLKHCN'], hanhDong: 'Lập QĐ' },
      { key: 'rd0403_t4', ten: 'HĐXD ĐC họp phiên 1 & 2', vaiTro: 'HĐXD điều chỉnh', vaiTroCodes: ['HDXD_DC', 'HDXD'], hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 'rd0403_t5', ten: 'TGĐ phê duyệt QĐ điều chỉnh NV', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD04.05', ten: 'Dừng thực hiện NV KHCN (CS)', nhom: 'RD04',
    trangThai: 'active', instances: 1, capNhat: '2026-09-08',
    moTa: 'Dừng NV KHCN qua HĐ Đánh giá hoàn thành (ĐGHT).',
    versions: [
      { v: '0.1', date: '2026-06-12', note: 'Nháp' },
      { v: '1.0', date: '2026-09-08', note: 'Mock runnable — mục 4.5' },
    ],
    taskSteps: [
      { key: 'rd0405_t1', ten: 'Khởi tạo hồ sơ xin Dừng thực hiện', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0405_t2', ten: 'Chuyên quản thẩm định hồ sơ ĐGHT', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0405_t3', ten: 'QĐ thành lập HĐ ĐGHT', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN', 'TP_CLKHCN'], hanhDong: 'Lập QĐ' },
      { key: 'rd0405_t4', ten: 'HĐ ĐGHT đánh giá & HĐ KHCN phê duyệt', vaiTro: 'HĐ ĐGHT / HĐ KHCN', vaiTroCodes: ['HD_DGHT', 'HDKHCN'], hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 'rd0405_t5', ten: 'TGĐ phê duyệt QĐ Dừng thực hiện', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD05.01', ten: 'Nghiệm thu NV KHCN cấp Cơ sở', nhom: 'RD05',
    trangThai: 'active', instances: 4, capNhat: '2026-09-08',
    moTa: 'Khởi tạo hồ sơ → thẩm định → QĐ TL HĐNT → HĐNT đánh giá → TGĐ công nhận kết quả.',
    versions: [
      { v: '1.0', date: '2026-05-28', note: 'Bản đầu tiên' },
      { v: '1.1', date: '2026-06-26', note: 'Ràng buộc RD03 hoàn thành' },
      { v: '1.2', date: '2026-09-08', note: 'Đồng bộ bước với mục 5.1 tài liệu quy trình' },
    ],
    taskSteps: [
      { key: 't1', ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 't2', ten: 'BGĐ TT/Khối ký duyệt hồ sơ', vaiTro: 'BGĐ Trung tâm/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], hanhDong: 'Ký duyệt' },
      { key: 't3', ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 't4', ten: 'QĐ thành lập Hội đồng Nghiệm thu', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN', 'TP_CLKHCN'], hanhDong: 'Lập QĐ' },
      { key: 't5', ten: 'Hội đồng Nghiệm thu đánh giá (phiên 1 & 2)', vaiTro: 'HĐ Nghiệm thu cấp CS', vaiTroCodes: ['HDNT'], hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 't6', ten: 'TGĐ công nhận kết quả nghiệm thu', vaiTro: 'TGĐ VHT', vaiTroCodes: ['TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD05.02', ten: 'Nghiệm thu NV KHCN cấp Tập đoàn', nhom: 'RD05',
    trangThai: 'active', instances: 1, capNhat: '2026-09-08',
    moTa: 'HĐNT TĐ có Tổ KT; BTGĐ TĐ công nhận kết quả.',
    versions: [
      { v: '1.0', date: '2026-05-30', note: 'Bản đầu tiên' },
      { v: '1.1', date: '2026-09-08', note: 'Mock runnable — mục 5.2' },
    ],
    taskSteps: [
      { key: 'rd0502_t1', ten: 'Khởi tạo hồ sơ nghiệm thu cấp TĐ', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Khởi tạo' },
      { key: 'rd0502_t2', ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0502_t3', ten: 'QĐ TL HĐNT + CV đề nghị nghiệm thu cấp TĐ', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], hanhDong: 'Lập QĐ' },
      { key: 'rd0502_t4', ten: 'Hội đồng Nghiệm thu Tập đoàn (có Tổ KT)', vaiTro: 'HĐ Nghiệm thu Tập đoàn', vaiTroCodes: ['HDNT_TD'], hanhDong: 'Đánh giá', formKey: 'phieu-nhan-xet' },
      { key: 'rd0502_t5', ten: 'BTGĐ Tập đoàn công nhận kết quả', vaiTro: 'BTGĐ Tập đoàn', vaiTroCodes: ['BTGD_TD'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD06.01', ten: 'Quyết toán NV KHCN cấp Cơ sở', nhom: 'RD06',
    trangThai: 'active', instances: 2, capNhat: '2026-09-08',
    moTa:
      'RD06.01 (PDF trang 61): CQ TCKT khởi động → VT34 → song song lập BM (TCKT/PM/TTMS/P.NS) → thẩm định BM5–7 → tổng hợp → BC TH QT + QĐ → chuỗi ký → BGĐ → CQNV → BTGĐ phê duyệt QĐ QT. Loop: 7→4, 8→2, 16→9.',
    versions: [
      { v: '1.0', date: '2026-09-08', note: 'Mock sơ bộ (sai so với sơ đồ)' },
      { v: '1.1', date: '2026-09-08', note: 'Khớp sơ đồ RD06.01 — 16 bước / 8 lane' },
      { v: '1.2', date: '2026-09-08', note: 'Gắn BPMN swimlane; sửa loop bước 8→2' },
    ],
    bpmnXml: RD0601_BPMN,
    taskSteps: [
      { key: 'rd0601_t1', ten: '1. Khởi động luồng QT RD06.01', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Khởi tạo' },
      { key: 'rd0601_t2', ten: '2. Gửi VT34, triển khai xây dựng BM', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Triển khai' },
      { key: 'rd0601_t3', ten: '3. Lập BM3, 4, 8', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Lập BM' },
      { key: 'rd0601_t4', ten: '4. Lập BM5, 6, 7; Chứng từ tài sản', vaiTro: 'PM', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Lập BM' },
      { key: 'rd0601_t5', ten: '5. Lập BM2', vaiTro: 'TTMS', vaiTroCodes: ['CQ_MS', 'GD_TTMS'], hanhDong: 'Lập BM' },
      { key: 'rd0601_t6', ten: '6. Lập BM Chi phí nhân công', vaiTro: 'P.NS', vaiTroCodes: ['CQ_NS', 'TP_NS'], hanhDong: 'Lập BM' },
      { key: 'rd0601_t7', ten: '7. Rà soát, thẩm định BM5, 6, 7', vaiTro: 'CQ CLKHCN / CQ TS', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0601_t8', ten: '8. Tổng hợp, thẩm định chung', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0601_t9', ten: '9. Lập, trình BC TH Quyết toán; Lập QĐ phê duyệt QT', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Lập BC' },
      { key: 'rd0601_t10', ten: '10. Ký thẩm định HS', vaiTro: 'CQ CLKHCN / CQ TS', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0601_t11', ten: '11. Ký thẩm định HS', vaiTro: 'PM', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0601_t12', ten: '12. Ký thẩm định HS', vaiTro: 'TTMS', vaiTroCodes: ['CQ_MS', 'GD_TTMS'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0601_t13', ten: '13. Ký thẩm định HS', vaiTro: 'P.NS', vaiTroCodes: ['CQ_NS', 'TP_NS'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0601_t14', ten: '14. Ký duyệt HS', vaiTro: 'GĐ TT / BGĐ Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], hanhDong: 'Ký duyệt' },
      { key: 'rd0601_t15', ten: '15. Ký duyệt BC', vaiTro: 'CQNV VHT', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT'], hanhDong: 'Ký duyệt' },
      { key: 'rd0601_t16', ten: '16. Phê duyệt Quyết định Quyết toán', vaiTro: 'BTGĐ VHT', vaiTroCodes: ['PTGD_CT', 'TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD06.02', ten: 'Quyết toán NV KHCN cấp Tập đoàn', nhom: 'RD06',
    trangThai: 'active', instances: 1, capNhat: '2026-09-08',
    moTa:
      'RD06.02 (PDF trang 62): pha CS lập BM + ký VHT + BTGĐ VHT phê duyệt Tờ trình đề nghị QT → Phòng QLDA TĐ / Chuyên hướng TĐ thẩm định 2 lần → CQ NV TĐ ký → BTGĐ TĐ phê duyệt QĐ QT. Gate: đã có QĐ nghiệm thu cấp TĐ.',
    versions: [
      { v: '1.0', date: '2026-09-08', note: 'Mock SAP 5 bước (sai sơ đồ)' },
      { v: '1.1', date: '2026-09-08', note: 'Khớp sơ đồ PDF — 25 bước hiển thị (1–24, 26) / 12 lane' },
    ],
    bpmnXml: RD0602_BPMN,
    taskSteps: [
      { key: 'rd0602_t1', ten: '1. Khởi động luồng quyết toán TĐ RD06.02', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Khởi tạo' },
      { key: 'rd0602_t2', ten: '2. Gửi VT34, triển khai xây dựng BM', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Triển khai' },
      { key: 'rd0602_t3', ten: '3. Lập BM3, 4, 8', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Lập BM' },
      { key: 'rd0602_t4', ten: '4. Lập BM5, 6, 7; Chứng từ tài sản', vaiTro: 'PM', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Lập BM' },
      { key: 'rd0602_t5', ten: '5. Rà soát, thẩm định BM5, 6, 7', vaiTro: 'CQ CLKHCN / CQ TS', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0602_t6', ten: '6. Lập BM2', vaiTro: 'TTMS', vaiTroCodes: ['CQ_MS', 'GD_TTMS'], hanhDong: 'Lập BM' },
      { key: 'rd0602_t7', ten: '7. Lập BM Chi phí nhân công', vaiTro: 'P.NS', vaiTroCodes: ['CQ_NS', 'TP_NS'], hanhDong: 'Lập BM' },
      { key: 'rd0602_t8', ten: '8. Tổng hợp, thẩm định chung', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0602_t9', ten: '9. Lập BC tổng hợp quyết toán, Tờ trình đề nghị QT', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], hanhDong: 'Lập BC' },
      { key: 'rd0602_t10', ten: '10. Ký thẩm định HS', vaiTro: 'CQ CLKHCN / CQ TS', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0602_t11', ten: '11. Ký thẩm định HS', vaiTro: 'PM', vaiTroCodes: ['PM', 'PA', 'NNC'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0602_t12', ten: '12. Ký thẩm định HS', vaiTro: 'TTMS', vaiTroCodes: ['CQ_MS', 'GD_TTMS'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0602_t13', ten: '13. Ký thẩm định HS', vaiTro: 'P.NS', vaiTroCodes: ['CQ_NS', 'TP_NS'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0602_t14', ten: '14. Ký duyệt HS', vaiTro: 'GĐ TT / BGĐ Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], hanhDong: 'Ký duyệt' },
      { key: 'rd0602_t15', ten: '15. Ký duyệt HS', vaiTro: 'CQNV VHT', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT'], hanhDong: 'Ký duyệt' },
      { key: 'rd0602_t16', ten: '16. Phê duyệt Tờ trình đề nghị QT', vaiTro: 'BTGĐ VHT', vaiTroCodes: ['PTGD_CT', 'TGD_VHT'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
      { key: 'rd0602_t17', ten: '17. Lập CV đề nghị thẩm định', vaiTro: 'Phòng QLDA TĐ', vaiTroCodes: ['QLDA_TD'], hanhDong: 'Lập CV' },
      { key: 'rd0602_t18', ten: '18. Thẩm định lần 1, trả PNX', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0602_t19', ten: '19. Hoàn thiện HS (TCKT/CLKHCN/PM/TTMS/P.NS)', vaiTro: 'CQ TCKT (+ CS)', vaiTroCodes: ['CQ_TCKT', 'CQ_KHCN', 'PM', 'CQ_MS', 'CQ_NS'], hanhDong: 'Hoàn thiện HS' },
      { key: 'rd0602_t20', ten: '20. Thẩm định lần 2', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], hanhDong: 'Thẩm định', formKey: 'phieu-dat-chua-dat' },
      { key: 'rd0602_t21', ten: '21. Trả KQ thẩm định', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], hanhDong: 'Trả KQ' },
      { key: 'rd0602_t22', ten: '22. Tổng hợp BC thẩm tra, Trình ký QĐ phê duyệt QT', vaiTro: 'Phòng QLDA TĐ', vaiTroCodes: ['QLDA_TD'], hanhDong: 'Tổng hợp' },
      { key: 'rd0602_t23', ten: '23. Ký thẩm định HS', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], hanhDong: 'Ký thẩm định' },
      { key: 'rd0602_t24', ten: '24. Ký duyệt HS', vaiTro: 'CQ NV TĐ', vaiTroCodes: ['CQNV_TD'], hanhDong: 'Ký duyệt' },
      { key: 'rd0602_t26', ten: '26. Phê duyệt QĐ QT', vaiTro: 'BTGĐ Tập đoàn', vaiTroCodes: ['BTGD_TD'], hanhDong: 'Phê duyệt', formKey: 'phieu-phe-duyet' },
    ],
  },
  {
    ma: 'RD07',
    ten: 'Quản lý danh mục dịch vụ, sản phẩm nghiên cứu',
    nhom: 'RD07',
    trangThai: 'draft',
    instances: 1,
    capNhat: '2026-08-07',
    moTa:
      'RD07 — 4 tuyến (QLDM SPDV · TT KD VHT · TTNCSP · P.TCKT VHT). B1 đầu năm → B2 timer 20 cuối quý → song song B3/B4/B5 → B6 đủ/không đủ căn cứ → B7 cập nhật DM Quý N. Mock UI: /san-pham-nghien-cuu.',
    versions: [{ v: '0.1', date: '2026-08-07', note: 'Nháp mock — bám sơ đồ BPMN 7 bước' }],
    taskSteps: [
      {
        key: 'b1',
        ten: 'Cập nhật danh mục SPDV và trạng thái SPDV đầu năm',
        vaiTro: 'Đơn vị QLDM SPDV',
        hanhDong: 'Cập nhật đầu năm',
        formKey: 'bm-07-01-cnhap-dm-spdv-dau-nam',
      },
      {
        key: 'b2',
        ten: 'Gửi yêu cầu cập nhật thông tin trong danh mục SPDV',
        vaiTro: 'Đơn vị QLDM SPDV',
        hanhDong: 'Gửi yêu cầu (timer 20 cuối quý)',
        formKey: 'bm-07-02-yeu-cau-cap-nhat',
      },
      {
        key: 'b3',
        ten: 'Cập nhật thay đổi trong danh mục SPDV kinh doanh của TCT',
        vaiTro: 'TT KD VHT',
        hanhDong: 'Cập nhật (song song)',
        formKey: 'bm-07-03-tt-kd-cap-nhat',
      },
      {
        key: 'b4',
        ten: 'Cập nhật thay đổi trong danh mục SPDV NCPT',
        vaiTro: 'TTNCSP',
        hanhDong: 'Cập nhật (song song)',
        formKey: 'bm-07-04-ttncsp-cap-nhat',
      },
      {
        key: 'b5',
        ten: 'Cập nhật thông tin doanh thu, chi phí, lợi nhuận cho SPDV',
        vaiTro: 'P.TCKT VHT',
        hanhDong: 'Cập nhật DT/CP/LN (song song)',
        formKey: 'bm-07-05-tckt-dt-cp-ln',
      },
      {
        key: 'b6',
        ten: 'Tổng hợp thông tin và xác thực các căn cứ điều chỉnh',
        vaiTro: 'Đơn vị QLDM SPDV',
        hanhDong: 'Xác thực căn cứ',
        formKey: 'bm-07-06-tong-hop-xac-thuc',
        needRole: 'THAM_DINH',
      },
      {
        key: 'b7',
        ten: 'Cập nhật vào Danh mục SPDV tại Quý N',
        vaiTro: 'Đơn vị QLDM SPDV',
        hanhDong: 'Cập nhật DB',
        formKey: 'bm-07-07-cap-nhat-dm-quy-n',
      },
    ],
  },
  {
    ma: 'RD08', ten: 'Quản lý sở hữu trí tuệ', nhom: 'RD08',
    trangThai: 'draft', instances: 0, capNhat: '2026-06-14',
    moTa: 'Đăng ký SHTT (bài báo, sáng chế), công nghệ lõi — thiếu luồng phê duyệt (OQ-014).',
    versions: [{ v: '0.1', date: '2026-06-14', note: 'Nháp — thiếu tác nhân/luồng' }],
  },
  {
    ma: 'RD09', ten: 'Quản lý, tổng hợp thông tin KHCN', nhom: 'RD09',
    trangThai: 'planned', instances: 0, capNhat: '—',
    moTa: 'Pha 2 — tổng hợp báo cáo / thông tin điều hành.',
    versions: [],
  },
  {
    ma: 'RD10', ten: 'Lưu trữ hồ sơ, tài liệu, văn bản pháp lý KHCN', nhom: 'RD10',
    trangThai: 'planned', instances: 0, capNhat: '—',
    moTa: 'Pha 1 (kế hoạch) — kho lưu trữ hồ sơ pháp lý gắn vòng đời nhiệm vụ.',
    versions: [],
  },
]
