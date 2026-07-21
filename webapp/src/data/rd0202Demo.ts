// RD02.02 Demo Data — Xét duyệt NV KHCN cấp Tập đoàn
// Demo đầy đủ cho R1 (Process Admin), R2 (Council Member), R3 (Mission Owner)
// theo mô tả chi tiết trong docs/req/RD02.02-demo-spec.md
//
// Mục lục:
//  1. Forms (BM.02.01 – BM.02.17)
//  2. DMN Decision Tables
//  3. SLA Configuration
//  4. Service Task & Agent Task Definitions
//  5. Demo Dossiers (R3 - Mission Owner)
//  6. Demo Council Tasks (R2 - Council Member)
//  7. Process Configuration Demo (R1 - Process Admin)
//  8. Demo Scenarios (happy path + error scenarios)

import { RD0202_BPMN } from './rd0202Bpmn'

// ══════════════════════════════════════════════════════════════════════════════
// 1. FORMS — BM.02.01 đến BM.02.17
// ══════════════════════════════════════════════════════════════════════════════

export type FormKey =
  | 'BM.02.01.DKI.NV' | 'BM.02.02.DTO.NV' | 'BM.02.03.TMI.DT'
  | 'BM.02.04.TMI.SX' | 'BM.02.05.TMI.DA' | 'BM.02.06.LLK.NV'
  | 'BM.02.07.GXN.NV' | 'BM.02.08.QDH.NV' | 'BM.02.09.PNX.DT'
  | 'BM.02.10.PNX.SX' | 'BM.02.11.PNX.DA' | 'BM.02.12.PDG.DT'
  | 'BM.02.13.PDG.SX' | 'BM.02.14.PDG.DA' | 'BM.02.15.BBH.NV'
  | 'BM.02.16.TTR.NV' | 'BM.02.17.TTR.NV'

export interface FormDefinition {
  key: FormKey
  ten: string
  loai: 'DK' | 'DT' | 'TM' | 'LL' | 'GX' | 'QD' | 'PN' | 'PD' | 'BB' | 'TT'
  version: string
  soLuongToiThieu: number  // số tờ tối thiểu phải điền
  truongBatBuoc: string[]
  nhom: string  // BPMN task gắn form này
}

/** Danh mục tất cả biểu mẫu RD02.02 */
export const RD0202_FORMS: FormDefinition[] = [
  // ── Nhóm B02: Khởi tạo HSXD ──────────────────────────────────────────────
  {
    key: 'BM.02.01.DKI.NV', ten: 'Đăng ký thông tin nhiệm vụ', loai: 'DK',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['maNV', 'tenDeTai', 'chuNhiem', 'donViChuTri', 'duToan', 'lichTrinh'],
    nhom: 'B02-B03',
  },
  // ── Nhóm B03: Xây dựng HSXD dự thảo 1 ───────────────────────────────────
  {
    key: 'BM.02.02.DTO.NV', ten: 'Dự toán kinh phí NV KHCN', loai: 'DT',
    version: '1.0', soLuongToiThieu: 6,  // PL1–PL6
    truongBatBuoc: ['pl1', 'pl2', 'pl3', 'pl4', 'pl5', 'pl6', 'tongCong'],
    nhom: 'B03',
  },
  {
    key: 'BM.02.03.TMI.DT', ten: 'Thuyết minh đề tài', loai: 'TM',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['tenDeTai', 'mucTieu', 'noiDung', 'sanPham', 'phuongPhap', 'thoiGian'],
    nhom: 'B03',
  },
  {
    key: 'BM.02.04.TMI.SX', ten: 'Thuyết minh sản xuất', loai: 'TM',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['tenDuAn', 'quyCach', 'chatLuong', 'soLuong', 'thoiGian'],
    nhom: 'B03',
  },
  {
    key: 'BM.02.05.TMI.DA', ten: 'Thuyết minh dự án', loai: 'TM',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['tenDuAn', 'mucTieu', 'phanMem', 'thietBi', 'nhanSu'],
    nhom: 'B03',
  },
  {
    key: 'BM.02.06.LLK.NV', ten: 'Danh mục liên kết nhiệm vụ', loai: 'LL',
    version: '1.0', soLuongToiThieu: 0,
    truongBatBuoc: [],
    nhom: 'B03',
  },
  {
    key: 'BM.02.07.GXN.NV', ten: 'Giấy xác nhận tham gia NV', loai: 'GX',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['hoTen', 'donVi', 'vaiTro', 'thoiGian'],
    nhom: 'B03',
  },
  // ── Nhóm B12: Hoàn chỉnh HSXD dự thảo 2 ────────────────────────────────
  // (dùng chung BM.02.01–07)
  // ── Nhóm B13: Ký HSXD dự thảo 2 ─────────────────────────────────────────
  // (dùng chung BM.02.01–07)
  // ── Nhóm B14: QĐ thành lập HĐXD VHT ─────────────────────────────────────
  {
    key: 'BM.02.08.QDH.NV', ten: 'Quyết định thành lập HĐXD VHT', loai: 'QD',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['soQuyetDinh', 'ngayKy', 'thanhVienHDXD', 'chuTich', 'thuKy'],
    nhom: 'B14-B15',
  },
  // ── Nhóm B16: Họp HĐXD phiên 1 — Phiếu nhận xét ───────────────────────
  {
    key: 'BM.02.09.PNX.DT', ten: 'Phiếu nhận xét đề tài (phiên 1)', loai: 'PN',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['maHSXD', 'noiDungNX', 'diemManh', 'diemYeu', 'kienDongGop'],
    nhom: 'B16',
  },
  {
    key: 'BM.02.10.PNX.SX', ten: 'Phiếu nhận xét sản xuất (phiên 1)', loai: 'PN',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['maHSXD', 'quyCachNX', 'chatLuongNX', 'kienDongGop'],
    nhom: 'B16',
  },
  {
    key: 'BM.02.11.PNX.DA', ten: 'Phiếu nhận xét dự án (phiên 1)', loai: 'PN',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['maHSXD', 'mucTieuNX', 'ketQuaNX', 'kienDongGop'],
    nhom: 'B16',
  },
  // ── Nhóm B17: Hoàn thiện HSXD dự thảo 3 ────────────────────────────────
  // (dùng chung BM.02.01–07)
  // ── Nhóm B19–B22: Rà soát HSXD dự thảo 3 (song song 4 CQ) ─────────────
  // (dùng chung PNX_KHCN, PNX_TCKT, PNX_MS, PNX_NS — key giống B16)
  // ── Nhóm B24: Họp HĐXD phiên 2 — Phiếu đánh giá ───────────────────────
  {
    key: 'BM.02.12.PDG.DT', ten: 'Phiếu đánh giá đề tài (phiên 2)', loai: 'PD',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['maHSXD', 'tinhThaytien', 'khaThi', 'datYeu', 'diemSo'],
    nhom: 'B24',
  },
  {
    key: 'BM.02.13.PDG.SX', ten: 'Phiếu đánh giá sản xuất (phiên 2)', loai: 'PD',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['maHSXD', 'chatLuongDG', 'tienDoDG', 'diemSo'],
    nhom: 'B24',
  },
  {
    key: 'BM.02.14.PDG.DA', ten: 'Phiếu đánh giá dự án (phiên 2)', loai: 'PD',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['maHSXD', 'mucTieuDG', 'ketQuaDG', 'hieuQuaDG', 'diemSo'],
    nhom: 'B24',
  },
  // ── Nhóm B16/B24: Biên bản họp ─────────────────────────────────────────
  {
    key: 'BM.02.15.BBH.NV', ten: 'Biên bản họp HĐXD VHT', loai: 'BB',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['soBienBan', 'ngayHop', 'thanhVienThamDu', 'ketLuan', 'diemBinhChon'],
    nhom: 'B16-B24',
  },
  // ── Nhóm B26: Trình ký CV/Tờ trình đề nghị cấp TĐ ──────────────────────
  {
    key: 'BM.02.16.TTR.NV', ten: 'Tờ trình đề nghị xét duyệt cấp TĐ (nháp)', loai: 'TT',
    version: '0.1', soLuongToiThieu: 1,
    truongBatBuoc: ['tenDeTai', 'tomTat', 'deXuat'],
    nhom: 'B26',
  },
  {
    key: 'BM.02.17.TTR.NV', ten: 'Tờ trình đề nghị xét duyệt cấp TĐ (chính thức)', loai: 'TT',
    version: '1.0', soLuongToiThieu: 1,
    truongBatBuoc: ['soToTrinh', 'ngayTrinh', 'tenDeTai', 'tomTat', 'deXuat', 'fileDinhKem'],
    nhom: 'B26',
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// 2. DMN DECISION TABLES
// ══════════════════════════════════════════════════════════════════════════════

export interface DmnRule {
  id: string
  description: string
  inputs: Record<string, string | number | boolean>
  outputs: Record<string, string>
}

export interface DmnDecisionTable {
  key: string
  ten: string
  version: string
  rules: DmnRule[]
}

// DMN-1: Định tuyến theo kết quả thẩm định nội bộ — quyết định đi tiếp hay quay lại
export const DMN_ROUTING_THAMDINH: DmnDecisionTable = {
  key: 'DMN-1',
  ten: 'Định tuyến theo kết quả thẩm định nội bộ',
  version: '1.0',
  rules: [
    {
      id: 'R1', description: 'Tất cả 4 CQ đạt → chuyển B12',
      inputs: { CQ_KHCN: 'dat', CQ_TCKT: 'dat', CQ_MS: 'dat', CQ_NS: 'dat' },
      outputs: { hanhDong: 'tiep_tuc_B12', nhacNho: 'none' },
    },
    {
      id: 'R2', description: 'Ít nhất 1 CQ chưa đạt → quay B03 sửa đổi',
      inputs: { CQ_KHCN: 'chua_dat', CQ_TCKT: '*', CQ_MS: '*', CQ_NS: '*' },
      outputs: { hanhDong: 'quay_B03', nhacNho: 'CQ_KHCN_chua_dat' },
    },
    {
      id: 'R3', description: 'CQ TCKT chưa đạt',
      inputs: { CQ_KHCN: 'dat', CQ_TCKT: 'chua_dat', CQ_MS: 'dat', CQ_NS: 'dat' },
      outputs: { hanhDong: 'quay_B03', nhacNho: 'CQ_TCKT_chua_dat' },
    },
    {
      id: 'R4', description: 'CQ MS chưa đạt',
      inputs: { CQ_KHCN: 'dat', CQ_TCKT: 'dat', CQ_MS: 'chua_dat', CQ_NS: 'dat' },
      outputs: { hanhDong: 'quay_B03', nhacNho: 'CQ_MS_chua_dat' },
    },
    {
      id: 'R5', description: 'CQ NS chưa đạt',
      inputs: { CQ_KHCN: 'dat', CQ_TCKT: 'dat', CQ_MS: 'dat', CQ_NS: 'chua_dat' },
      outputs: { hanhDong: 'quay_B03', nhacNhoe: 'CQ_NS_chua_dat' },
    },
  ],
}

// DMN-2: Chấm điểm HĐXD phiên 2 — xác định hướng xử lý sau HĐXD Tập đoàn
// Ghi chú: inputs dùng prefix "min_" và "max_" để tránh trùng key trong object literal.
// Rule format mô phỏng FEEL expression của DMN thực tế.
// Output: vhtCouncilResult — "APPROVED" (≥70) hoặc "REJECTED" (<70)
// BPMN gọi: zeebe:calledDecision decisionId="decision-1l9z3ao" resultVariable="vhtCouncilResult"
export const DMN_CHAMDIEM_HDXD: DmnDecisionTable = {
  key: 'DMN-2',
  ten: 'Chấm điểm HĐXD VHT phiên 2',
  version: '1.0',
  rules: [
    {
      id: 'R1', description: 'Điểm trung bình ≥ 70 → Thông qua, trình ký cấp Tập đoàn',
      inputs: { 'hasEnoughScoreData >=': 70, 'hasEnoughScoreData <=': 100 },
      outputs: { vhtCouncilResult: 'APPROVED', hanhDong: 'chuyen_B26' },
    },
    {
      id: 'R2', description: 'Điểm trung bình 50–69 → Điều chỉnh bổ sung (rework)',
      inputs: { 'hasEnoughScoreData >=': 50, 'hasEnoughScoreData <=': 69 },
      outputs: { vhtCouncilResult: 'REJECTED', hanhDong: 'quay_B17' },
    },
    {
      id: 'R3', description: 'Điểm trung bình < 50 → Không đạt, kết thúc tại VHT',
      inputs: { 'hasEnoughScoreData >=': 0, 'hasEnoughScoreData <': 50 },
      outputs: { vhtCouncilResult: 'REJECTED', hanhDong: 'ket_thuc_B99b' },
    },
  ],
}

// DMN-3: Gán hạn xử lý theo loại bước
export const DMN_SLA_AUTO: DmnDecisionTable = {
  key: 'DMN-3',
  ten: 'Tự động gán hạn xử lý theo loại bước',
  version: '1.0',
  rules: [
    {
      id: 'R1', description: 'Bước PM xây dựng/hoàn thiện',
      inputs: { loaiBuoc: 'PM_build', cap: 'CS' },
      outputs: { hanXuLy: '10 ngày làm việc', nhacNho: '5 ngày trước hạn' },
    },
    {
      id: 'R2', description: 'Bước PM xây dựng/hoàn thiện cấp TĐ',
      inputs: { loaiBuoc: 'PM_build', cap: 'TD' },
      outputs: { hanXuLy: '15 ngày làm việc', nhacNho: '7 ngày trước hạn' },
    },
    {
      id: 'R3', description: 'Bước CQ thẩm định',
      inputs: { loaiBuoc: 'CQ_tham_dinh', cap: '*' },
      outputs: { hanXuLy: '5 ngày làm việc', nhacNho: '2 ngày trước hạn' },
    },
    {
      id: 'R4', description: 'Bước ký duyệt cấp TT/Khối',
      inputs: { loaiBuoc: 'BGD_ky', cap: '*' },
      outputs: { hanXuLy: '3 ngày làm việc', nhacNho: '1 ngày trước hạn' },
    },
    {
      id: 'R5', description: 'Bước TP trình QĐ thành lập HĐXD',
      inputs: { loaiBuoc: 'TP_trinh', cap: '*' },
      outputs: { hanXuLy: '2 ngày làm việc', nhacNho: '1 ngày trước hạn' },
    },
    {
      id: 'R6', description: 'Bước TGĐ phê duyệt QĐ',
      inputs: { loaiBuoc: 'TGD_phe_duyet', cap: '*' },
      outputs: { hanXuLy: '3 ngày làm việc', nhacNho: '1 ngày trước hạn' },
    },
    {
      id: 'R7', description: 'Bước HĐXD họp và chấm điểm',
      inputs: { loaiBuoc: 'HDXD_hop', cap: '*' },
      outputs: { hanXuLy: '10 ngày làm việc', nhacNho: '3 ngày trước hạn' },
    },
  ],
}

export const RD0202_DMN_TABLES: DmnDecisionTable[] = [
  DMN_ROUTING_THAMDINH,
  DMN_CHAMDIEM_HDXD,
  DMN_SLA_AUTO,
]

// ══════════════════════════════════════════════════════════════════════════════
// 3. SLA CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

export interface SlaConfig {
  taskKey: string
  tenBuoc: string
  /** Ngày làm việc */
  hanXuLy: number
  /** Ngày trước hạn bắt đầu nhắc nhở */
  nhacTruoc: number
  canhBao: 'info' | 'warning' | 'critical'
  coTheGiaHan: boolean
  soLanGiaHanToiDa: number
}

export const RD0202_SLA: SlaConfig[] = [
  // Nhóm B02-B03: Khởi tạo & xây dựng dự thảo 1
  { taskKey: 'B02', tenBuoc: 'Khởi tạo hồ sơ xét duyệt cấp Tập đoàn', hanXuLy: 3, nhacTruoc: 1, canhBao: 'info', coTheGiaHan: false, soLanGiaHanToiDa: 0 },
  { taskKey: 'B03', tenBuoc: 'Xây dựng Bộ HSXD dự thảo 1', hanXuLy: 15, nhacTruoc: 5, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 2 },

  // B04: Service Task — tự động, không có SLA user
  // Nhóm B07-B10: Thẩm định song song 4 CQ
  { taskKey: 'B07', tenBuoc: 'Thẩm định nội dung KHCN', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B08', tenBuoc: 'Thẩm định tài chính, kế toán', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B09', tenBuoc: 'Thẩm định mua sắm', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B10', tenBuoc: 'Thẩm định nhân sự', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },

  // Nhóm B12-B13: Hoàn chỉnh & ký dự thảo 2
  { taskKey: 'B12', tenBuoc: 'Hoàn chỉnh Bộ HSXD dự thảo 2', hanXuLy: 7, nhacTruoc: 3, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B13', tenBuoc: 'Ký Bộ HSXD dự thảo 2', hanXuLy: 3, nhacTruoc: 1, canhBao: 'critical', coTheGiaHan: false, soLanGiaHanToiDa: 0 },

  // Nhóm B14-B15: QĐ thành lập HĐXD VHT
  { taskKey: 'B14', tenBuoc: 'Lập và trình QĐ thành lập HĐXD VHT', hanXuLy: 2, nhacTruoc: 1, canhBao: 'info', coTheGiaHan: false, soLanGiaHanToiDa: 0 },
  { taskKey: 'B15', tenBuoc: 'Phê duyệt QĐ thành lập HĐXD VHT', hanXuLy: 3, nhacTruoc: 1, canhBao: 'critical', coTheGiaHan: false, soLanGiaHanToiDa: 0 },

  // Nhóm B16-B17: Họp phiên 1 & hoàn thiện dự thảo 3
  { taskKey: 'B16', tenBuoc: 'Họp HĐXD VHT phiên 1', hanXuLy: 10, nhacTruoc: 3, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B17', tenBuoc: 'Hoàn thiện Bộ HSXD dự thảo 3', hanXuLy: 7, nhacTruoc: 3, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },

  // Nhóm B19-B22: Rà soát dự thảo 3 (4 CQ song song)
  { taskKey: 'B19', tenBuoc: 'Rà soát Bộ HSXD dự thảo 3 về KHCN', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B20', tenBuoc: 'Rà soát Bộ HSXD dự thảo 3 về TCKT', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B21', tenBuoc: 'Rà soát Bộ HSXD dự thảo 3 về mua sắm', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },
  { taskKey: 'B22', tenBuoc: 'Rà soát Bộ HSXD dự thảo 3 về nhân sự', hanXuLy: 5, nhacTruoc: 2, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },

  // B24: Họp phiên 2 & chấm điểm
  { taskKey: 'B24', tenBuoc: 'Họp HĐXD VHT phiên 2 và chấm điểm', hanXuLy: 10, nhacTruoc: 3, canhBao: 'warning', coTheGiaHan: true, soLanGiaHanToiDa: 1 },

  // B26: Trình ký cấp Tập đoàn
  { taskKey: 'B26', tenBuoc: 'Trình ký CV/Tờ trình đề nghị xét duyệt cấp TĐ', hanXuLy: 3, nhacTruoc: 1, canhBao: 'critical', coTheGiaHan: false, soLanGiaHanToiDa: 0 },
]

// ══════════════════════════════════════════════════════════════════════════════
// 4. SERVICE TASK & AGENT TASK DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

export interface ServiceTaskDef {
  taskKey: string
  type: string
  retries: number
  /** Headers bổ sung */
  headers?: Record<string, string>
  description: string
}

export interface AgentTaskDef {
  taskKey: string
  type: 'ai_agent'
  agentId: string
  prompt: string
  trigger: 'manual' | 'auto'
  description: string
}

export const RD0202_SERVICE_TASKS: ServiceTaskDef[] = [
  {
    taskKey: 'B04',
    type: 'rd0202-validation',
    retries: 3,
    headers: { resultVariable: 'ketQuaKiemTraDuThao1', ruleSet: 'draft1-check' },
    description: 'Kiểm tra điều kiện và thành phần Bộ HSXD dự thảo 1',
  },
  // B11 và B23 là Parallel Gateway — không phải Service Task
  {
    taskKey: 'B04_notify_pm',
    type: 'rd0202-notify',
    retries: 2,
    headers: { channel: 'email', template: 'draft1_rejected' },
    description: 'Gửi thông báo PM khi dự thảo 1 bị từ chối',
  },
]

export const RD0202_AGENT_TASKS: AgentTaskDef[] = [
  // Agent Task gọi AI phân tích HSXD thay vì chờ 4 CQ nhập tay
  // Chỉ dùng trong môi trường demo; production sẽ dùng User Task thực
  {
    taskKey: 'B07_agent',
    type: 'ai_agent',
    agentId: 'cq-khcn-reviewer',
    prompt: `Bạn là chuyên gia phân tích nội dung KHCN. Đọc thuyết minh đề tài và dự toán, đánh giá:
1. Tính khả thi về mặt kỹ thuật
2. Tính hợp lý của mục tiêu và nội dung
3. Chất lượng sản phẩm dự kiến
4. Nhận xét chung và đề xuất

Trả về JSON: { "dat": true/false, "noiDungNX": "...", "diemManh": "...", "diemYeu": "..." }`,
    trigger: 'auto',
    description: 'AI hỗ trợ CQ_KHCN thẩm định nội dung KHCN (demo)',
  },
  {
    taskKey: 'B08_agent',
    type: 'ai_agent',
    agentId: 'cq-tckt-reviewer',
    prompt: `Bạn là chuyên gia tài chính kế toán. Đọc dự toán PL1-PL6 và đánh giá:
1. Tính hợp lý của các khoản mục chi phí
2. Độ chính xác của dự toán so với thực tế
3. Rủi ro về chi phí
4. Nhận xét chung và đề xuất

Trả về JSON: { "dat": true/false, "noiDungNX": "...", "diemManh": "...", "diemYeu": "..." }`,
    trigger: 'auto',
    description: 'AI hỗ trợ CQ_TCKT thẩm định dự toán (demo)',
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// 5. DEMO DOSSIERS — R3 (Mission Owner) Demo Flow
// ══════════════════════════════════════════════════════════════════════════════

export interface DemoDossierForm {
  formKey: FormKey
  trangThai: 'chua_dien' | 'dang_dien' | 'da_ky' | 'da_nop'
  nguoiDien?: string
  ngayDien?: string
  noiDung?: Record<string, string | number>
}

export interface DemoDossier {
  id: string
  maNV: string
  tenDeTai: string
  chuNhiem: string
  donVi: string
  cap: 'CS' | 'TD'
  /** Trạng thái demo: đang ở bước nào trong R3 demo flow */
  demoStep: number
  forms: DemoDossierForm[]
  trangThaiHS: 'du_thao_1' | 'du_thao_2' | 'du_thao_2_signed' | 'du_thao_3'
  bieuMauDaNop: FormKey[]
  /** true = PM đã gửi kiểm tra, đang chờ B04 validation */
  pendingValidation: boolean
  /** Kết quả từ DMN-1 */
  validationResult?: 'dat' | 'khong_dat'
  notes: string[]
}

/** R3 Demo: Hồ sơ đang ở B03 — đợi kiểm tra dự thảo 1 */
export const DEMO_DOSSIER_R3_B03: DemoDossier = {
  id: 'HS-2026-040',
  maNV: 'RD.2026.040',
  tenDeTai: 'Nghiên cứu ứng dụng AI trong kiểm thử phần mềm cho hệ thống viễn thông 5G',
  chuNhiem: 'ThS. Nguyễn Văn An',
  donVi: 'Trung tâm Nghiên cứu Phần mềm',
  cap: 'TD',
  demoStep: 3,
  forms: [
    { formKey: 'BM.02.01.DKI.NV', trangThai: 'da_nop', nguoiDien: 'ThS. Nguyễn Văn An', ngayDien: '15/07/2026', noiDung: { maNV: 'RD.2026.040', tenDeTai: 'Nghiên cứu ứng dụng AI...', chuNhiem: 'ThS. Nguyễn Văn An' } },
    { formKey: 'BM.02.02.DTO.NV', trangThai: 'da_nop', nguoiDien: 'ThS. Nguyễn Văn An', ngayDien: '16/07/2026' },
    { formKey: 'BM.02.03.TMI.DT', trangThai: 'da_nop', nguoiDien: 'ThS. Nguyễn Văn An', ngayDien: '17/07/2026' },
    { formKey: 'BM.02.06.LLK.NV', trangThai: 'chua_dien' },
    { formKey: 'BM.02.07.GXN.NV', trangThai: 'da_ky', nguoiDien: 'ThS. Nguyễn Văn An', ngayDien: '17/07/2026' },
  ],
  trangThaiHS: 'du_thao_1',
  pendingValidation: true,
  bieuMauDaNop: ['BM.02.01.DKI.NV', 'BM.02.02.DTO.NV', 'BM.02.03.TMI.DT', 'BM.02.07.GXN.NV'],
  notes: [
    'PM đã nộp đủ 6 biểu mẫu, đang chờ B04 validation',
    'Dự kiến B04 trả về "dat" nếu đủ thành phần, chuyển B07-B10 (4 CQ thẩm định song song)',
    'R3 demo: click "Theo dõi" → xem tiến độ tại "Việc của tôi"',
  ],
}

/** R3 Demo: Hồ sơ đang ở B12 — đợi PM hoàn chỉnh dự thảo 2 sau khi nhận PNX từ 4 CQ */
export const DEMO_DOSSIER_R3_B12: DemoDossier = {
  id: 'HS-2026-041',
  maNV: 'RD.2026.041',
  tenDeTai: 'Phát triển nền tảng IoT giám sát năng lượng thông minh cho doanh nghiệp vừa và nhỏ',
  chuNhiem: 'TS. Trần Thị Bình',
  donVi: 'Trung tâm IoT & AI',
  cap: 'TD',
  demoStep: 12,
  forms: [
    { formKey: 'BM.02.01.DKI.NV', trangThai: 'da_nop' },
    { formKey: 'BM.02.02.DTO.NV', trangThai: 'da_nop' },
    { formKey: 'BM.02.03.TMI.DT', trangThai: 'da_nop' },
    // 4 CQ đã nhận xét — đang ở B12 để PM tiếp nhận
    { formKey: 'BM.02.09.PNX.DT', trangThai: 'da_nop', nguoiDien: 'CQ KHCN', ngayDien: '18/07/2026', noiDung: { noiDungNX: 'Nội dung khả thi, phương pháp phù hợp', diemManh: 'Có tính ứng dụng cao', diemYeu: 'Cần bổ sung tài liệu tham khảo' } },
    { formKey: 'BM.02.06.LLK.NV', trangThai: 'da_nop' },
    { formKey: 'BM.02.07.GXN.NV', trangThai: 'da_ky' },
  ],
  trangThaiHS: 'du_thao_2',
  pendingValidation: false,
  validationResult: 'dat',
  bieuMauDaNop: ['BM.02.01.DKI.NV', 'BM.02.02.DTO.NV', 'BM.02.03.TMI.DT', 'BM.02.09.PNX.DT', 'BM.02.06.LLK.NV', 'BM.02.07.GXN.NV'],
  notes: [
    'B07-B10 đã hoàn thành: tất cả 4 CQ đều đạt (DMN-1 R1 áp dụng)',
    'PM nhận 4 Phiếu nhận xét, đang ở B12 để tiếp nhận và hoàn chỉnh dự thảo 2',
    'R3 demo: xem "Việc của tôi" → thấy B12 task đang chờ',
  ],
}

/** R3 Demo: Hồ sơ đang ở B17 — đợi PM hoàn thiện dự thảo 3 sau phiên 1 */
export const DEMO_DOSSIER_R3_B17: DemoDossier = {
  id: 'HS-2026-042',
  maNV: 'RD.2026.042',
  tenDeTai: 'Xây dựng hệ thống blockchain cho quản lý hợp đồng thông minh',
  chuNhiem: 'KS. Lê Hoàng Nam',
  donVi: 'Trung tâm An ninh Mạng',
  cap: 'TD',
  demoStep: 17,
  forms: [
    { formKey: 'BM.02.01.DKI.NV', trangThai: 'da_nop' },
    { formKey: 'BM.02.02.DTO.NV', trangThai: 'da_nop' },
    { formKey: 'BM.02.03.TMI.DT', trangThai: 'da_nop' },
    { formKey: 'BM.02.09.PNX.DT', trangThai: 'da_nop' },
    { formKey: 'BM.02.15.BBH.NV', trangThai: 'da_ky', nguoiDien: 'HĐXD VHT', ngayDien: '19/07/2026', noiDung: { ketLuan: 'Đạt yêu cầu phiên 1, cần bổ sung thêm tài liệu triển khai', diemBinhChon: 72 } },
  ],
  trangThaiHS: 'du_thao_3',
  pendingValidation: false,
  bieuMauDaNop: ['BM.02.01.DKI.NV', 'BM.02.02.DTO.NV', 'BM.02.03.TMI.DT', 'BM.02.09.PNX.DT', 'BM.02.15.BBH.NV'],
  notes: [
    'B16 (phiên 1) đã hoàn thành: điểm bình chọn 72, kết luận đạt yêu cầu',
    'PM đang ở B17 để tiếp nhận kết luận phiên 1 và hoàn thiện dự thảo 3',
    'Sau B17 → B19-B22 (4 CQ rà soát song song) → B24 (phiên 2)',
  ],
}

export const DEMO_DOSSIERS_R3: DemoDossier[] = [
  DEMO_DOSSIER_R3_B03,
  DEMO_DOSSIER_R3_B12,
  DEMO_DOSSIER_R3_B17,
]

// ══════════════════════════════════════════════════════════════════════════════
// 6. DEMO COUNCIL TASKS — R2 (Council Member) Demo Flow
// ══════════════════════════════════════════════════════════════════════════════

export interface DemoCouncilTask {
  id: string
  taskKey: string
  tenBuoc: string
  maHSXD: string
  tenDeTai: string
  chuNhiem: string
  vaiTro: string
  hanXuLy: string
  trangThai: 'cho_nhan_xet' | 'dang_nhap' | 'da_ky' | 'da_hoan_thanh'
  formKey: FormKey
  /** Phiếu đã điền (nếu trangThai = da_ky) */
  phieuDaDien?: Record<string, string | number | string[]>
  /** Thành viên HĐXD đã xác nhận tham dự */
  thanhVienThamDu?: string[]
  /** Biên bản họp (sau khi hoàn thành B16/B24) */
  bienBan?: {
    soBienBan: string
    ngayHop: string
    ketLuan: string
    diemBinhChon: number
  }
  notes: string[]
}

/** R2 Demo: 4 CQ thẩm định song song đang chờ */
export const DEMO_COUNCIL_TASKS_R2_CQ: DemoCouncilTask[] = [
  {
    id: 'CT-R2-001',
    taskKey: 'B07',
    tenBuoc: 'Thẩm định nội dung KHCN',
    maHSXD: 'HS-2026-040',
    tenDeTai: 'Nghiên cứu ứng dụng AI trong kiểm thử phần mềm cho hệ thống viễn thông 5G',
    chuNhiem: 'ThS. Nguyễn Văn An',
    vaiTro: 'CQ_KHCN',
    hanXuLy: '22/07/2026',
    trangThai: 'cho_nhan_xet',
    formKey: 'BM.02.09.PNX.DT',
    notes: [
      'R2 demo: đăng nhập với vai trò CQ_KHCN → thấy task B07 trong "Việc của tôi"',
      'Click mở BM.02.09.PNX.DT → điền phiếu → ký → hoàn thành',
      'Sau khi đủ 4/4 CQ hoàn thành → B04 (validation) → định tuyến DMN-1',
    ],
  },
  {
    id: 'CT-R2-002',
    taskKey: 'B08',
    tenBuoc: 'Thẩm định tài chính, kế toán',
    maHSXD: 'HS-2026-040',
    tenDeTai: 'Nghiên cứu ứng dụng AI trong kiểm thử phần mềm cho hệ thống viễn thông 5G',
    chuNhiem: 'ThS. Nguyễn Văn An',
    vaiTro: 'CQ_TCKT',
    hanXuLy: '22/07/2026',
    trangThai: 'cho_nhan_xet',
    formKey: 'BM.02.09.PNX.DT',
    notes: [
      'R2 demo: đăng nhập vai trò CQ_TCKT',
      'Điền BM.02.09.PNX.DT → ký → hoàn thành',
    ],
  },
  {
    id: 'CT-R2-003',
    taskKey: 'B09',
    tenBuoc: 'Thẩm định mua sắm',
    maHSXD: 'HS-2026-040',
    tenDeTai: 'Nghiên cứu ứng dụng AI trong kiểm thử phần mềm cho hệ thống viễn thông 5G',
    chuNhiem: 'ThS. Nguyễn Văn An',
    vaiTro: 'CQ_MS',
    hanXuLy: '22/07/2026',
    trangThai: 'cho_nhan_xet',
    formKey: 'BM.02.09.PNX.DT',
    notes: ['R2 demo: đăng nhập vai trò CQ_MS'],
  },
  {
    id: 'CT-R2-004',
    taskKey: 'B10',
    tenBuoc: 'Thẩm định nhân sự',
    maHSXD: 'HS-2026-040',
    tenDeTai: 'Nghiên cứu ứng dụng AI trong kiểm thử phần mềm cho hệ thống viễn thông 5G',
    chuNhiem: 'ThS. Nguyễn Văn An',
    vaiTro: 'CQ_NS',
    hanXuLy: '22/07/2026',
    trangThai: 'cho_nhan_xet',
    formKey: 'BM.02.09.PNX.DT',
    notes: ['R2 demo: đăng nhập vai trò CQ_NS'],
  },
]

/** R2 Demo: HĐXD VHT phiên 1 - nhận xét từng đề tài */
export const DEMO_COUNCIL_TASK_R2_PHien1: DemoCouncilTask = {
  id: 'CT-R2-005',
  taskKey: 'B16',
  tenBuoc: 'Họp HĐXD VHT phiên 1',
  maHSXD: 'HS-2026-041',
  tenDeTai: 'Phát triển nền tảng IoT giám sát năng lượng thông minh cho doanh nghiệp vừa và nhỏ',
  chuNhiem: 'TS. Trần Thị Bình',
  vaiTro: 'HDXD_VHT',
  hanXuLy: '25/07/2026',
  trangThai: 'dang_nhap',
  formKey: 'BM.02.09.PNX.DT',
  thanhVienThamDu: ['PGS.TS. Lê Minh Đức (Chủ tịch)', 'TS. Hoàng Thu Hà (Thư ký)', 'TS. Vũ Xuân Bách (Ủy viên)', 'TS. Đặng Thị Lan (Ủy viên)'],
  notes: [
    'R2 demo: đăng nhập vai trò HDXD_VHT',
    'Xem danh sách đề tài trong phiên họp → click từng đề tài để nhận xét',
    'Điền BM.02.09.PNX.DT → ký từng phiếu → xác nhận tham dự → tạo Biên bản (BM.02.15.BBH.NV)',
    'Kết quả: điểm bình chọn 72 → chuyển B17 (hoàn thiện dự thảo 3)',
  ],
}

/** R2 Demo: HĐXD VHT phiên 2 - chấm điểm */
export const DEMO_COUNCIL_TASK_R2_PHien2: DemoCouncilTask = {
  id: 'CT-R2-006',
  taskKey: 'B24',
  tenBuoc: 'Họp HĐXD VHT phiên 2 và chấm điểm',
  maHSXD: 'HS-2026-042',
  tenDeTai: 'Xây dựng hệ thống blockchain cho quản lý hợp đồng thông minh',
  chuNhiem: 'KS. Lê Hoàng Nam',
  vaiTro: 'HDXD_VHT',
  hanXuLy: '28/07/2026',
  trangThai: 'dang_nhap',
  formKey: 'BM.02.12.PDG.DT',
  thanhVienThamDu: ['PGS.TS. Lê Minh Đức (Chủ tịch)', 'TS. Hoàng Thu Hà (Thư ký)', 'TS. Vũ Xuân Bách (Ủy viên)', 'TS. Đặng Thị Lan (Ủy viên)', 'TS. Nguyễn Minh Tuấn (Ủy viên)'],
  phieuDaDien: {
    tinhThaytien: 4,
    khaThi: 3,
    datYeu: 2,
    diemSo: 78,
    diemTruot: 'Không',
  },
  notes: [
    'R2 demo: đăng nhập vai trò HDXD_VHT',
    'Xem kết quả rà soát B19-B22 của 4 CQ → tiến hành chấm điểm',
    'Điền BM.02.12-14.PDG.DT/SX/DA → ký từng phiếu → xác nhận điểm chung',
    'DMN-2: điểm 78 ≥ 70 → chuyển B26 (trình ký cấp Tập đoàn)',
    'Nếu điểm < 50 → kết thúc tại B99b (không đạt)',
  ],
}

export const DEMO_COUNCIL_TASKS_R2: DemoCouncilTask[] = [
  ...DEMO_COUNCIL_TASKS_R2_CQ,
  DEMO_COUNCIL_TASK_R2_PHien1,
  DEMO_COUNCIL_TASK_R2_PHien2,
]

// ══════════════════════════════════════════════════════════════════════════════
// 7. PROCESS CONFIGURATION DEMO — R1 (Process Admin)
// ══════════════════════════════════════════════════════════════════════════════

export interface ProcessConfigVersion {
  version: string
  ngayTao: string
  trangThai: 'nhap' | 'dang_thu' | 'da_chinh_thuc' | 'da_ngung'
  bpmnXml?: string
  formsAttached: FormKey[]
  dmnAttached: string[]
  slaEnabled: boolean
  agentTasksEnabled: boolean
  serviceTasksConfigured: boolean
  permissionsConfigured: boolean
  notes: string
}

export interface ProcessConfigDemo {
  ma: string
  ten: string
  versions: ProcessConfigVersion[]
  currentConfig: {
    version: string
    soLuongTask: number
    soLuongParallelGateway: number
    soLuongExclusiveGateway: number
    soLuongServiceTask: number
    soLuongAgentTask: number
    soLuongUserTask: number
    soLuongDmn: number
    slaRules: number
    errorScenarioCount: number
  }
}

export const RD0202_CONFIG_DEMO: ProcessConfigDemo = {
  ma: 'RD02.02',
  ten: 'Xét duyệt NV KHCN cấp Tập đoàn',
  versions: [
    {
      version: '0.1',
      ngayTao: '2026-07-10',
      trangThai: 'da_ngung',
      bpmnXml: undefined, // bản cũ, không còn dùng
      formsAttached: [],
      dmnAttached: [],
      slaEnabled: false,
      agentTasksEnabled: false,
      serviceTasksConfigured: false,
      permissionsConfigured: false,
      notes: 'Bản test ban đầu — thiếu Zeebe extension, gateway condition, end event. Không nên dùng.',
    },
    {
      version: '0.2',
      ngayTao: '2026-07-15',
      trangThai: 'dang_thu',
      bpmnXml: RD0202_BPMN, // bản hiện tại
      formsAttached: ['BM.02.01.DKI.NV', 'BM.02.02.DTO.NV', 'BM.02.03.TMI.DT', 'BM.02.08.QDH.NV', 'BM.02.09.PNX.DT', 'BM.02.12.PDG.DT', 'BM.02.15.BBH.NV', 'BM.02.17.TTR.NV'],
      dmnAttached: ['DMN-1', 'DMN-2', 'DMN-3'],
      slaEnabled: true,
      agentTasksEnabled: true,
      serviceTasksConfigured: true,
      permissionsConfigured: true,
      notes: 'Bản đang thử nghiệm — đã có đủ BPMN, forms, DMN, SLA. Test trước khi publish chính thức.',
    },
    {
      version: '1.0',
      ngayTao: '2026-07-22',
      trangThai: 'dang_thu',
      bpmnXml: RD0202_BPMN,
      formsAttached: ['BM.02.01.DKI.NV', 'BM.02.02.DTO.NV', 'BM.02.03.TMI.DT', 'BM.02.04.TMI.SX', 'BM.02.05.TMI.DA', 'BM.02.06.LLK.NV', 'BM.02.07.GXN.NV', 'BM.02.08.QDH.NV', 'BM.02.09.PNX.DT', 'BM.02.10.PNX.SX', 'BM.02.11.PNX.DA', 'BM.02.12.PDG.DT', 'BM.02.13.PDG.SX', 'BM.02.14.PDG.DA', 'BM.02.15.BBH.NV', 'BM.02.17.TTR.NV'],
      dmnAttached: ['DMN-1', 'DMN-2', 'DMN-3'],
      slaEnabled: true,
      agentTasksEnabled: false, // production: user task thật, không agent
      serviceTasksConfigured: true,
      permissionsConfigured: true,
      notes: 'Bản chuẩn bị publish — đầy đủ 16 biểu mẫu, tắt agent task (dùng user task thật cho 4 CQ).',
    },
  ],
  currentConfig: {
    version: '1.0',
    soLuongTask: 27,
    soLuongParallelGateway: 3,  // B06, B11, B18, B23 (tách/gộp 4 CQ)
    soLuongExclusiveGateway: 2, // B05 (validation), B25 (điểm phiên 2)
    soLuongServiceTask: 1,       // B04
    soLuongAgentTask: 0,         // v1.0 không dùng agent
    soLuongUserTask: 22,         // B02, B03, B07-B10, B12-B17, B19-B22, B24, B26
    soLuongDmn: 3,
    slaRules: 19,
    errorScenarioCount: 7,
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// 8. DEMO SCENARIOS
// ══════════════════════════════════════════════════════════════════════════════

export interface DemoScenario {
  id: string
  nhom: 'R1' | 'R2' | 'R3'
  ten: string
  moTa: string
  /** Các bước thực hiện (mô phỏng UI click) */
  cacBuoc: string[]
  /** True = happy path; False = error scenario */
  isHappy: boolean
  tags: string[]
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  // ── R1: Process Admin Scenarios ──────────────────────────────────────────
  {
    id: 'R1-01',
    nhom: 'R1',
    ten: 'Tạo mới & cấu hình RD02.02 v0.1',
    moTa: 'Tạo quy trình RD02.02, gắn BPMN, gắn forms, gắn DMN, cấu hình SLA, phân quyền',
    cacBuoc: [
      '1. Vào "Danh mục quy trình" → click "Tạo mới"',
      '2. Nhập mã RD02.02, tên "Xét duyệt NV KHCN cấp Tập đoàn"',
      '3. Upload BPMN XML (RD0202_BPMN)',
      '4. Gắn 8 biểu mẫu: BM.02.01–08',
      '5. Gắn DMN-1 (định tuyến thẩm định), DMN-3 (SLA auto)',
      '6. Bật SLA: mỗi bước tự gán hạn xử lý theo loại',
      '7. Cấu hình permissions: PM, CQ_KHCN, CQ_TCKT, CQ_MS, CQ_NS, HDXD_VHT, TGD_VHT',
      '8. Lưu → trạng thái "Nháp"',
    ],
    isHappy: true,
    tags: ['bpmn', 'form', 'dmn', 'sla', 'permissions'],
  },
  {
    id: 'R1-02',
    nhom: 'R1',
    ten: 'Test quy trình với dữ liệu giả — phát hiện BPMN INVALID',
    moTa: 'Run test với instance giả, phát hiện lỗi BPMN (gateway thiếu default flow)',
    cacBuoc: [
      '1. Từ config RD02.02 v0.1 → click "Chạy test"',
      '2. Tạo test instance: maNV=TEST.001, cap=TD',
      '3. Đi qua B01 → B02 (PM khởi tạo) → B03 (PM xây dựng dự thảo)',
      '4. Đến B04 → System gọi Service Task rd0202-validation → thành công',
      '5. B05 Gateway phân nhánh: thiếu default flow → process INCIDENT → BPMN INVALID',
      '6. R1 sửa BPMN: thêm default flow cho B05 (ketQuaKiemTraDuThao1="khong_dat")',
      '7. Re-upload BPMN → chạy lại → thành công',
    ],
    isHappy: false,
    tags: ['test', 'bpmn-error', 'gateway'],
  },
  {
    id: 'R1-03',
    nhom: 'R1',
    ten: 'Cấu hình DMN — DMN rule không khớp với BPMN flow',
    moTa: 'DMN-1 rule định tuyến không đúng → B05 gateway nhận kết quả lạ → incident',
    cacBuoc: [
      '1. Từ config RD02.02 v0.2 → mở "DMN-1: Định tuyến thẩm định nội bộ"',
      '2. Thêm rule R2: CQ_KHCN="chua_dat" → quay B03',
      '3. Test: CQ_KHCN đánh dấu "chua_dat" → B04 trả về "chua_dat"',
      '4. DMN-1 rule R2 match → output "quay_B03"',
      '5. B05 gateway nhận output "quay_B03" → nhưng BPMN flow ID không đúng → INCIDENT',
      '6. R1 fix: cập nhật BPMN flow name cho khớp DMN output',
      '7. Test lại → đúng → publish v0.3',
    ],
    isHappy: false,
    tags: ['dmn', 'bpmn', 'incident'],
  },
  {
    id: 'R1-04',
    nhom: 'R1',
    ten: 'Version management — nâng cấp v0.2 → v0.3 ảnh hưởng instance cũ',
    moTa: 'Khi upgrade BPMN version, các instance đang chạy v0.2 có thể bị ảnh hưởng. Minh hoạ cách xử lý.',
    cacBuoc: [
      '1. RD02.02 v0.2 đang chạy 3 active instances',
      '2. R1 tạo v0.3: bổ sung thêm trường "diaChiUngDung" vào BM.02.01.DKI.NV',
      '3a. Option A: "Hot upgrade" — instance cũ tiếp tục chạy v0.2, instance mới dùng v0.3',
      '3b. Option B: "Cold upgrade" — suspend 3 instance → upgrade → resume v0.3',
      '4. Chọn Option A: giữ 3 instance v0.2, v0.3 chỉ áp dụng instance mới',
      '5. Xem "Version instances" → thấy 3 instance v0.2, 0 instance v0.3',
    ],
    isHappy: true,
    tags: ['version', 'upgrade'],
  },
  {
    id: 'R1-05',
    nhom: 'R1',
    ten: 'Monitor incidents — Service Task B04 fail sau 3 retries',
    moTa: 'B04 (rd0202-validation) fail liên tục → hệ thống tạo incident, R1 theo dõi và xử lý',
    cacBuoc: [
      '1. Instance đang chạy đến B04 → Service Task call external validation API',
      '2. API không phản hồi (timeout) → B04 RETRY 1/3 → fail',
      '3. RETRY 2/3 → fail, RETRY 3/3 → fail',
      '4. System tạo INCIDENT: type=zeebe职工TaskExecutionFailed, retries exhausted',
      '5. R1 vào "Monitor" → thấy incident màu đỏ tại B04',
      '6. R1 kiểm tra: validation service down → restart service',
      '7. R1: resolve incident → instance tiếp tục B04 → thành công',
    ],
    isHappy: false,
    tags: ['incident', 'service-task', 'monitor'],
  },

  // ── R2: Council Member Scenarios ─────────────────────────────────────────
  {
    id: 'R2-01',
    nhom: 'R2',
    ten: 'Đăng nhập HĐXD VHT — xem danh sách phiên họp phiên 1',
    moTa: 'R2 đăng nhập với vai trò HDXD_VHT, thấy task B16 trong "Việc của tôi"',
    cacBuoc: [
      '1. R2 đăng nhập: tài khoản hdxd_vht@vht.com / mật khẩu',
      '2. Dashboard hiển thị: 1 task mới — "Họp HĐXD VHT phiên 1"',
      '3. Click task → xem chi tiết đề tài HS-2026-041',
      '4. Xem thông tin: chuNhiem, donVi, tenDeTai, duToan, taiLieu',
      '5. Tải về bộ hồ sơ để chuẩn bị phiên họp',
    ],
    isHappy: true,
    tags: ['council', 'hdxd', 'task-list'],
  },
  {
    id: 'R2-02',
    nhom: 'R2',
    ten: 'Điền Phiếu nhận xét BM.02.09.PNX.DT — phiên 1',
    moTa: 'R2 mở đề tài, đọc nội dung, điền và ký Phiếu nhận xét đề tài',
    cacBuoc: [
      '1. Từ task B16 → click "Mở đề tài" → xem chi tiết HS-2026-041',
      '2. Đọc BM.02.03.TMI.DT (thuyết minh) + BM.02.02.DTO.NV (dự toán)',
      '3. Click "Điền Phiếu nhận xét" → mở BM.02.09.PNX.DT',
      '4. Nhập: Nội dung NX = "Đề tài có tính khả thi, phương pháp phù hợp"',
      '5. Điểm mạnh: "Có tính ứng dụng thực tiễn cao cho doanh nghiệp viễn thông"',
      '6. Điểm yếu: "Cần bổ sung thêm tài liệu benchmark quốc tế"',
      '7. Kiến đóng góp: "Nên bổ sung phương pháp Agile vào quy trình phát triển"',
      '8. Click "Ký và gửi" → form bị lock, không thể sửa đổi',
    ],
    isHappy: true,
    tags: ['form', 'pnx', 'ky'],
  },
  {
    id: 'R2-03',
    nhom: 'R2',
    ten: 'Xác nhận tham dự và tạo Biên bản họp BM.02.15.BBH.NV',
    moTa: 'Sau khi tất cả thành viên ký phiếu, R2 xác nhận và tạo Biên bản họp',
    cacBuoc: [
      '1. Tất cả 5 thành viên HĐXD đã ký phiếu nhận xét',
      '2. R2 click "Xác nhận tham dự" → điền danh sách thành viên có mặt',
      '3. Hệ thống tự động tạo BM.02.15.BBH.NV (Biên bản họp)',
      '4. Xem trước biên bản: số BB, ngày, thành viên, kết luận, điểm bình chọn',
      '5. Click "Phát hành Biên bản" → gửi email cho PM và các thành viên',
      '6. B16 hoàn thành → tiến trình chuyển B17 (PM hoàn thiện dự thảo 3)',
    ],
    isHappy: true,
    tags: ['bien-ban', 'xac-nhan-tham-du'],
  },
  {
    id: 'R2-04',
    nhom: 'R2',
    ten: 'Chấm điểm phiên 2 — điền BM.02.12.PDG.DT với điểm 78 (đạt)',
    moTa: 'R2 điền Phiếu đánh giá, điểm ≥ 70 → chuyển B26. Nếu < 50 → kết thúc B99b',
    cacBuoc: [
      '1. Sau khi B19-B22 rà soát xong, R2 nhận task B24 "Họp phiên 2 và chấm điểm"',
      '2. Xem kết quả rà soát của 4 CQ: KHCN đạt, TCKT đạt, MS đạt, NS đạt',
      '3. Click "Chấm điểm" → mở BM.02.12.PDG.DT',
      '4. Điền: Tính thay thiên=4, Khả thi=3, Đạt/Yếu=2 → hệ thống tính điểm TB=78',
      '5. Điểm 78 ≥ 70 → DMN-2 rule R1 match → output: chuyển B26',
      '6. Click "Ký và gửi điểm" → form lock',
      '7. B24 hoàn thành → tiến trình chuyển B26 (trình ký cấp Tập đoàn)',
    ],
    isHappy: true,
    tags: ['pdg', 'cham-diem', 'dmn-2'],
  },
  {
    id: 'R2-05',
    nhom: 'R2',
    ten: 'Lỗi: Form không mở được (Zeebe formId không khớp)',
    moTa: 'Khi click task B16, form BM.02.09.PNX.DT không load — do formId không khớp với BPMN',
    cacBuoc: [
      '1. R2 nhận task B16, click "Mở Phiếu nhận xét"',
      '2. Lỗi: "Form not found: BM.02.09.PNX.DT"',
      '3. R2 báo cho R1: "Task B16 form không mở"',
      '4. R1 kiểm tra: BPMN zeebe:formDefinition formId="PNX_KHCN" ≠ "BM.02.09.PNX.DT"',
      '5. R1 fix BPMN: đổi formId sang "BM.02.09.PNX.DT"',
      '6. Re-upload BPMN → restart process definition',
      '7. R2 thử lại → form mở thành công',
    ],
    isHappy: false,
    tags: ['form-error', 'zeebe'],
  },

  // ── R3: Mission Owner Scenarios ──────────────────────────────────────────
  {
    id: 'R3-01',
    nhom: 'R3',
    ten: 'Tạo hồ sơ RD02.02 từ nhiệm vụ đã được phê duyệt chủ trương',
    moTa: 'PM khởi tạo HSXD từ RD.2026.040 — hệ thống tự kế thừa thông tin chủ trương',
    cacBuoc: [
      '1. R3 đăng nhập với vai trò PM',
      '2. Vào "Nhiệm vụ của tôi" → chọn RD.2026.040 (đã có QĐ chủ trương RD01.02)',
      '3. Click "Tạo hồ sơ xét duyệt" → chọn quy trình RD02.02',
      '4. Hệ thống tự điền: maNV, tenDeTai, chuNhiem, donVi từ RD01.02',
      '5. Điền thêm: duToan, lichTrinh → click "Lưu tạm"',
      '6. Trạng thái: "Khởi tạo" → task B02 hoàn thành, B03 được tạo',
    ],
    isHappy: true,
    tags: ['pm', 'khoi-tao', 'ke-thua'],
  },
  {
    id: 'R3-02',
    nhom: 'R3',
    ten: 'Điền và gửi bộ hồ sơ dự thảo 1 — BM.02.01 đến BM.02.07',
    moTa: 'PM điền đủ 6 biểu mẫu, gửi kiểm tra. Hệ thống gọi B04 validation',
    cacBuoc: [
      '1. Từ task B03 "Xây dựng Bộ HSXD dự thảo 1" → click "Làm việc"',
      '2. Mở BM.02.01.DKI.NV → điền thông tin cơ bản → Lưu',
      '3. Mở BM.02.02.DTO.NV → điền dự toán PL1-PL6 → Lưu',
      '4. Mở BM.02.03.TMI.DT → điền thuyết minh → Lưu',
      '5. Mở BM.02.06.LLK.NV → thêm liên kết (nếu có)',
      '6. Mở BM.02.07.GXN.NV → thêm giấy xác nhận → Ký',
      '7. Kiểm tra "Tiến độ": 6/6 biểu mẫu đã nộp',
      '8. Click "Gửi kiểm tra" → xác nhận → chuyển B04',
      '9. B04 Service Task chạy → kết quả: "dat"',
      '10. DMN-1 R1 match → chuyển 4 task B07-B10 (4 CQ thẩm định song song)',
    ],
    isHappy: true,
    tags: ['bm02', 'form', 'validation'],
  },
  {
    id: 'R3-03',
    nhom: 'R3',
    ten: 'Theo dõi tiến độ tại "Việc của tôi" — xem 4 CQ đang thẩm định',
    moTa: 'Sau khi gửi dự thảo 1, R3 theo dõi trạng thái 4 task CQ song song',
    cacBuoc: [
      '1. Vào "Việc của tôi" → thấy 4 task đang chạy: B07, B08, B09, B10',
      '2. Click "Theo dõi" → xem dashboard tiến độ: đang chờ CQ KHCN, TCKT, MS, NS',
      '3. Thanh tiến độ: 0/4 CQ hoàn thành',
      '4. Sau 2 ngày: 2/4 CQ hoàn thành → cập nhật',
      '5. Sau 3 ngày: 4/4 CQ hoàn thành → hệ thống gộp B11 → tự động chuyển B12',
      '6. Nhận thông báo: "4 CQ đã thẩm định xong, đi đến B12"',
    ],
    isHappy: true,
    tags: ['tracking', 'parallel', 'notification'],
  },
  {
    id: 'R3-04',
    nhom: 'R3',
    ten: 'Nhận phản hồi từ HĐXD phiên 1 — xem Biên bản và kết luận',
    moTa: 'Sau phiên 1, R3 nhận BM.02.15.BBH.NV từ HĐXD VHT, xem kết luận và điểm bình chọn',
    cacBuoc: [
      '1. Sau khi B16 hoàn thành, R3 nhận email + notification trong app',
      '2. Vào "Hồ sơ của tôi" → HS-2026-042 → xem tiến độ',
      '3. Thấy: B16 hoàn thành, B17 được tạo (theo kết luận phiên 1)',
      '4. Mở BM.02.15.BBH.NV (Biên bản): số BB, ngày, thành viên, kết luận: "Đạt yêu cầu, cần bổ sung tài liệu triển khai"',
      '5. Xem điểm bình chọn: 72/100',
      '6. Bắt đầu B17: đọc kết luận → chỉnh sửa BM.02.03.TMI.DT → bổ sung tài liệu',
    ],
    isHappy: true,
    tags: ['bien-ban', 'phan-hoi', 'phiên-1'],
  },
  {
    id: 'R3-05',
    nhom: 'R3',
    ten: 'Lỗi: Dự thảo bị trả lại — CQ TCKT đánh dấu "chưa đạt"',
    moTa: 'CQ TCKT đánh dấu dự toán chưa đạt → DMN-1 quay về B03, R3 phải sửa và gửi lại',
    cacBuoc: [
      '1. Sau khi B04 validation → kết quả "dat" → 4 CQ thẩm định',
      '2. CQ TCKT nhập BM.02.09.PNX.DT: đánh dấu "chưa đạt" — "Dự toán PL2 chưa hợp lý"',
      '3. Sau khi đủ 4 CQ → DMN-1 R3 match → output "quay_B03"',
      '4. B11 gộp → tự động chuyển về B03 (không cần PM làm gì)',
      '5. R3 nhận notification: "Hồ sơ bị trả lại, lý do: CQ TCKT chưa đạt"',
      '6. R3 mở BM.02.02.DTO.NV → sửa PL2 → gửi lại',
      '7. B04 chạy lại → "dat" → 4 CQ thẩm định lại',
    ],
    isHappy: false,
    tags: ['chua-dat', 'rejected', 'dmn'],
  },
  {
    id: 'R3-06',
    nhom: 'R3',
    ten: 'Hoàn thành B26 — trình ký Tờ trình đề nghị cấp Tập đoàn',
    moTa: 'Sau khi phiên 2 đạt điểm ≥ 70, R3 hoàn thành B26 và gửi CV/Tờ trình lên cấp Tập đoàn',
    cacBuoc: [
      '1. B24 hoàn thành với điểm 78 → DMN-2 R1 → chuyển B26',
      '2. R3 nhận task B26 "Trình ký CV/Tờ trình đề nghị cấp Tập đoàn"',
      '3. Click "Làm việc" → mở BM.02.17.TTR.NV (chính thức)',
      '4. Hệ thống tự điền: thông tin đề tài, tóm tắt, điểm phiên 2',
      '5. R3 điền: Số tờ trình, ngày trình, đề xuất',
      '6. Upload tài liệu đính kèm (bộ HSXD + Biên bản phiên 2)',
      '7. Click "Trình ký" → gửi lên cấp Tập đoàn',
      '8. Process kết thúc tại B99d — chờ Tập đoàn tiếp nhận',
    ],
    isHappy: true,
    tags: ['ket-thuc', 'to-trinh', 'cap-tap-doan'],
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export const RD0202_DEMO = {
  forms: RD0202_FORMS,
  dmn: RD0202_DMN_TABLES,
  sla: RD0202_SLA,
  serviceTasks: RD0202_SERVICE_TASKS,
  agentTasks: RD0202_AGENT_TASKS,
  dossiersR3: DEMO_DOSSIERS_R3,
  councilTasksR2: DEMO_COUNCIL_TASKS_R2,
  configDemo: RD0202_CONFIG_DEMO,
  scenarios: DEMO_SCENARIOS,
} as const

export default RD0202_DEMO