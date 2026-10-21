/**
 * Nguồn kinh phí (Funding Sources) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface NguonKinhPhi {
  id: string
  ma: string
  ten: string
  loai: NguonKinhPhiLoai
  moTa?: string
  donViCungCap?: string
  lienHe?: string
  namBatDau?: number
  namKetThuc?: number
  tongDuToan?: number
  trangThai: 'active' | 'inactive'
}

export type NguonKinhPhiLoai = 'nhaNuoc' | 'doanhNghiep' | 'quocTe' | 'khac'

export const LOAI_NGUON_KINH_PHI: Record<NguonKinhPhi['loai'], string> = {
  nhaNuoc: 'Ngân sách nhà nước',
  doanhNghiep: 'Đầu tư doanh nghiệp',
  quocTe: 'Quỹ quốc tế',
  khac: 'Khác',
}

export const LOAI_NGUON_KINH_PHI_COLOR: Record<NguonKinhPhi['loai'], string> = {
  nhaNuoc: 'blue',
  doanhNghiep: 'green',
  quocTe: 'purple',
  khac: 'default',
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedNguonKinhPhi: NguonKinhPhi[] = [
  {
    id: 'NKP001',
    ma: 'NSNN-2024',
    ten: 'Ngân sách nhà nước 2024',
    loai: 'nhaNuoc',
    moTa: 'Kinh phí từ ngân sách nhà nước cấp cho các nhiệm vụ KHCN',
    donViCungCap: 'Bộ Khoa học và Công nghệ',
    lienHe: 'contact@most.gov.vn',
    namBatDau: 2024,
    namKetThuc: 2024,
    tongDuToan: 500000000000,
    trangThai: 'active',
  },
  {
    id: 'NKP002',
    ma: 'VHT-TA-2024',
    ten: 'Quỹ tái đầu tư VHT 2024',
    loai: 'doanhNghiep',
    moTa: 'Kinh phí từ quỹ tái đầu tư của Tập đoàn Viettel',
    donViCungCap: 'Tập đoàn Viettel',
    namBatDau: 2024,
    namKetThuc: 2024,
    tongDuToan: 200000000000,
    trangThai: 'active',
  },
  {
    id: 'NKP003',
    ma: 'WORLD-BANK-2023',
    ten: 'Dự án World Bank',
    loai: 'quocTe',
    moTa: 'Kinh phí hỗ trợ từ Ngân hàng Thế giới cho các dự án nghiên cứu',
    donViCungCap: 'World Bank',
    lienHe: 'info@worldbank.org',
    namBatDau: 2023,
    namKetThuc: 2025,
    tongDuToan: 100000000000,
    trangThai: 'active',
  },
  {
    id: 'NKP004',
    ma: 'NTT-2024',
    ten: 'Quỹ phát triển khoa học VHT',
    loai: 'khac',
    moTa: 'Quỹ nội bộ VHT dành cho nghiên cứu và phát triển',
    donViCungCap: 'Viettel High Tech',
    namBatDau: 2024,
    tongDuToan: 80000000000,
    trangThai: 'active',
  },
  {
    id: 'NKP005',
    ma: 'NSNN-2023',
    ten: 'Ngân sách nhà nước 2023',
    loai: 'nhaNuoc',
    moTa: 'Kinh phí từ ngân sách nhà nước cấp cho các nhiệm vụ KHCN năm 2023',
    donViCungCap: 'Bộ Khoa học và Công nghệ',
    namBatDau: 2023,
    namKetThuc: 2023,
    tongDuToan: 450000000000,
    trangThai: 'inactive',
  },
]