/**
 * PH2 Dashboard - Seed data for the KHCN Mission Management Dashboard
 * Provides real-time overview of mission execution status
 */

import type { GiaiDoan } from './nhiemVu'

// ===== Type definitions =====

export type TrangThaiNhiemVu = 'tat_ca' | 'dang_thuc_hien' | 'hoan_thanh' | 'qua_han' | 'bi_tu_choi'

export interface DashboardKpi {
  tongSoNhiemVu: number
  dangThucHien: number
  hoanThanh: number
  quaHan: number
  biTuChoi: number
  tyLeHoanThanhPct: number
  tyLeQuaHanPct: number
}

export interface DanhMucDeTaiItem {
  giaiDoan: GiaiDoan
  label: string
  soLuong: number
  thanhTich: number
  dangXuLy: number
  biTuChoi: number
}

export interface ChiPhiDeTaiItem {
  donVi: string
  duToan: number      // triệu đồng
  daChi: number        // triệu đồng
  conLai: number       // triệu đồng
  tiLeGiaiNganPct: number
}

export interface NhanSuItem {
  vaiTro: string
  soLuong: number
  tyLePct: number
}

export interface TaiSanTriTueItem {
  loai: 'patent' | 'publication' | 'copyright' | 'technology_transfer'
  label: string
  soLuong: number
  namNay: number
  tangTruongPct: number
}

export interface GiaiDoanTrend {
  thang: string
  chuTrương: number
  xetDuyet: number
  thucHien: number
  dieuChinh: number
  nghiemThu: number
  quyetToan: number
}

// ===== Seed data =====

export const KPI_HIENTAI: DashboardKpi = {
  tongSoNhiemVu: 156,
  dangThucHien: 87,
  hoanThanh: 52,
  quaHan: 12,
  biTuChoi: 5,
  tyLeHoanThanhPct: 38.2,
  tyLeQuaHanPct: 7.7,
}

export const KPI_THANG_TRUOC: DashboardKpi = {
  tongSoNhiemVu: 148,
  dangThucHien: 82,
  hoanThanh: 48,
  quaHan: 14,
  biTuChoi: 4,
  tyLeHoanThanhPct: 35.1,
  tyLeQuaHanPct: 9.5,
}

export const DELTA_KPI = {
  tongSoNhiemVu: +8,
  dangThucHien: +5,
  hoanThanh: +4,
  quaHan: -2,
  biTuChoi: +1,
  tyLeHoanThanhPct: +3.1,
  tyLeQuaHanPct: -1.8,
}

export const DANH_MUC_DE_TAI: DanhMucDeTaiItem[] = [
  { giaiDoan: 'chu_truong', label: 'Chủ trương', soLuong: 18, thanhTich: 14, dangXuLy: 3, biTuChoi: 1 },
  { giaiDoan: 'xet_duyet', label: 'Xét duyệt', soLuong: 24, thanhTich: 20, dangXuLy: 3, biTuChoi: 1 },
  { giaiDoan: 'thuc_hien', label: 'Thực hiện', soLuong: 68, thanhTich: 45, dangXuLy: 18, biTuChoi: 5 },
  { giaiDoan: 'dieu_chinh', label: 'Điều chỉnh', soLuong: 15, thanhTich: 8, dangXuLy: 5, biTuChoi: 2 },
  { giaiDoan: 'nghiem_thu', label: 'Nghiệm thu', soLuong: 22, thanhTich: 18, dangXuLy: 3, biTuChoi: 1 },
  { giaiDoan: 'quyet_toan', label: 'Quyết toán', soLuong: 9, thanhTich: 7, dangXuLy: 2, biTuChoi: 0 },
]

export const CHI_PHI_DE_TAI: ChiPhiDeTaiItem[] = [
  { donVi: 'TT Nghiên cứu Vô tuyến', duToan: 15800, daChi: 12450, conLai: 3350, tiLeGiaiNganPct: 78.8 },
  { donVi: 'TT Nghiên cứu Điều khiển', duToan: 8500, daChi: 6800, conLai: 1700, tiLeGiaiNganPct: 80.0 },
  { donVi: 'TT Nghiên cứu Vật liệu', duToan: 6200, daChi: 3720, conLai: 2480, tiLeGiaiNganPct: 60.0 },
  { donVi: 'TT Nghiên cứu Tác chiến ĐT', duToan: 12400, daChi: 9920, conLai: 2480, tiLeGiaiNganPct: 80.0 },
  { donVi: 'TT Nghiên cứu Cyber', duToan: 5600, daChi: 3360, conLai: 2240, tiLeGiaiNganPct: 60.0 },
  { donVi: 'TT Nghiên cứu AI & Robotics', duToan: 9200, daChi: 7360, conLai: 1840, tiLeGiaiNganPct: 80.0 },
]

export const TONG_CHI_PHI = {
  duToan: 57700,  // triệu đồng
  daChi: 43610,    // triệu đồng
  conLai: 14090,   // triệu đồng
  tiLeGiaiNganPct: 75.6,
}

export const NHAN_SU: NhanSuItem[] = [
  { vaiTro: 'Chủ nhiệm đề tài', soLuong: 156, tyLePct: 100 },
  { vaiTro: 'Thành viên nghiên cứu', soLuong: 423, tyLePct: 100 },
  { vaiTro: 'Chuyên gia tư vấn', soLuong: 67, tyLePct: 100 },
  { vaiTro: 'Kỹ thuật viên', soLuong: 189, tyLePct: 100 },
]

export const TAI_SAN_TRI_TUE: TaiSanTriTueItem[] = [
  { loai: 'patent', label: 'Sáng chế / Patent', soLuong: 48, namNay: 12, tangTruongPct: 33.3 },
  { loai: 'publication', label: 'Công bố khoa học', soLuong: 127, namNay: 34, tangTruongPct: 21.4 },
  { loai: 'copyright', label: 'Bản quyền phần mềm', soLuong: 89, namNay: 18, tangTruongPct: 12.5 },
  { loai: 'technology_transfer', label: 'Chuyển giao công nghệ', soLuong: 23, namNay: 7, tangTruongPct: 75.0 },
]

export const GIAI_DOAN_TRENDS: GiaiDoanTrend[] = [
  { thang: 'T1/2026', chuTrương: 12, xetDuyet: 18, thucHien: 52, dieuChinh: 8, nghiemThu: 14, quyetToan: 6 },
  { thang: 'T2/2026', chuTrương: 15, xetDuyet: 20, thucHien: 58, dieuChinh: 10, nghiemThu: 16, quyetToan: 7 },
  { thang: 'T3/2026', chuTrương: 18, xetDuyet: 24, thucHien: 62, dieuChinh: 12, nghiemThu: 19, quyetToan: 8 },
  { thang: 'T4/2026', chuTrương: 14, xetDuyet: 22, thucHien: 65, dieuChinh: 13, nghiemThu: 21, quyetToan: 9 },
  { thang: 'T5/2026', chuTrương: 16, xetDuyet: 21, thucHien: 67, dieuChinh: 14, nghiemThu: 20, quyetToan: 9 },
  { thang: 'T6/2026', chuTrương: 18, xetDuyet: 24, thucHien: 68, dieuChinh: 15, nghiemThu: 22, quyetToan: 9 },
]

export const GIAI_DOAN_COLORS: Record<GiaiDoan, string> = {
  chu_truong: '#1890ff',
  xet_duyet: '#2f54eb',
  thuc_hien: '#faad14',
  dieu_chinh: '#fa8c16',
  nghiem_thu: '#52c41a',
  quyet_toan: '#722ed1',
}

export const GIAI_DOAN_LABELS: Record<GiaiDoan, string> = {
  chu_truong: 'Chủ trương',
  xet_duyet: 'Xét duyệt',
  thuc_hien: 'Thực hiện',
  dieu_chinh: 'Điều chỉnh',
  nghiem_thu: 'Nghiệm thu',
  quyet_toan: 'Quyết toán',
}

// ===== Helper functions =====

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} tỷ đ`
  }
  return `${value} triệu đ`
}

export function calcTiLeGiaiNgan(daChi: number, duToan: number): number {
  if (duToan === 0) return 0
  return Math.round((daChi / duToan) * 100 * 10) / 10
}