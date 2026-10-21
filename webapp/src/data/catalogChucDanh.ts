/**
 * Chức danh (Job Titles) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface ChucDanh {
  id: string
  ma: string
  ten: string
  moTa?: string
  ngachLuong?: string
  bacLuong?: string
  trangThai: 'active' | 'inactive'
  sapId?: string
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedChucDanh: ChucDanh[] = [
  {
    id: 'CD001',
    ma: 'GD',
    ten: 'Giám đốc',
    moTa: 'Người đứng đầu đơn vị, có quyền quyết định cao nhất về chiến lược và nhân sự',
    ngachLuong: 'Ngạch A',
    bacLuong: 'I',
    trangThai: 'active',
    sapId: 'SAP-CD001',
  },
  {
    id: 'CD002',
    ma: 'PGD',
    ten: 'Phó Giám đốc',
    moTa: 'Hỗ trợ Giám đốc trong công tác điều hành và quản lý',
    ngachLuong: 'Ngạch A',
    bacLuong: 'II',
    trangThai: 'active',
    sapId: 'SAP-CD002',
  },
  {
    id: 'CD003',
    ma: 'TP',
    ten: 'Trưởng phòng',
    moTa: 'Quản lý và điều hành hoạt động của phòng ban',
    ngachLuong: 'Ngạch B',
    bacLuong: 'I',
    trangThai: 'active',
    sapId: 'SAP-CD003',
  },
  {
    id: 'CD004',
    ma: 'PTRD',
    ten: 'Phó Trưởng phòng',
    moTa: 'Hỗ trợ Trưởng phòng trong công tác điều hành',
    ngachLuong: 'Ngạch B',
    bacLuong: 'II',
    trangThai: 'active',
    sapId: 'SAP-CD004',
  },
  {
    id: 'CD005',
    ma: 'CV',
    ten: 'Chuyên viên',
    moTa: 'Nhân viên thực hiện các công việc chuyên môn theo phân công',
    ngachLuong: 'Ngạch C',
    bacLuong: 'I-III',
    trangThai: 'active',
    sapId: 'SAP-CD005',
  },
  {
    id: 'CD006',
    ma: 'KTV',
    ten: 'Kỹ thuật viên',
    moTa: 'Hỗ trợ kỹ thuật trong các hoạt động nghiên cứu và sản xuất',
    ngachLuong: 'Ngạch C',
    bacLuong: 'I-II',
    trangThai: 'active',
    sapId: 'SAP-CD006',
  },
  {
    id: 'CD007',
    ma: 'TT',
    ten: 'Thực tập sinh',
    moTa: 'Học viên thực tập tại đơn vị',
    ngachLuong: 'Thực tập',
    bacLuong: '-',
    trangThai: 'active',
  },
  {
    id: 'CD008',
    ma: 'CN',
    ten: 'Cán bộ nghiên cứu',
    moTa: 'Nhân viên nghiên cứu có trình độ cao',
    ngachLuong: 'Ngạch A',
    bacLuong: 'III-V',
    trangThai: 'active',
    sapId: 'SAP-CD008',
  },
]