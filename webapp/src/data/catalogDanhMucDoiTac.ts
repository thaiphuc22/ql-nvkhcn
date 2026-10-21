/**
 * Quản lý danh mục đối tác (Partner Catalog) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface DanhMucDoiTac {
  id: string
  ma: string
  ten: string
  loai: DanhMucDoiTacLoai
  nganhNghe?: string
  diaChi?: string
  dienThoai?: string
  email?: string
  website?: string
  moTa?: string
  trangThai: 'active' | 'inactive'
  xepHang?: number // 1-5 sao
}

export type DanhMucDoiTacLoai = 'nhaCungCap' | 'khachHang' | 'doiTac' | 'tuVan' | 'nghienCuu'

export const LOAI_DOI_TAC: Record<DanhMucDoiTac['loai'], string> = {
  nhaCungCap: 'Nhà cung cấp',
  khachHang: 'Khách hàng',
  doiTac: 'Đối tác chiến lược',
  tuVan: 'Tư vấn',
  nghienCuu: 'Đơn vị nghiên cứu',
}

export const LOAI_DOI_TAC_COLOR: Record<DanhMucDoiTac['loai'], string> = {
  nhaCungCap: 'blue',
  khachHang: 'green',
  doiTac: 'purple',
  tuVan: 'orange',
  nghienCuu: 'cyan',
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedDanhMucDoiTac: DanhMucDoiTac[] = [
  {
    id: 'DT001',
    ma: 'DT-NCC-001',
    ten: 'Công ty ABC Electronics',
    loai: 'nhaCungCap',
    nganhNghe: 'Linh kiện điện tử',
    diaChi: '123 Đường Nguyễn Trãi, Quận 1, TP.HCM',
    dienThoai: '028 1234 5678',
    email: 'contact@abc-electronics.com',
    website: 'https://abc-electronics.com',
    moTa: 'Nhà cung cấp linh kiện điện tử uy tín',
    trangThai: 'active',
    xepHang: 5,
  },
  {
    id: 'DT002',
    ma: 'DT-KH-001',
    ten: 'Tập đoàn XYZ',
    loai: 'khachHang',
    nganhNghe: 'Viễn thông',
    diaChi: '456 Đường Lê Lợi, Quận 3, TP.HCM',
    dienThoai: '028 9876 5432',
    email: 'info@xyz-group.com',
    website: 'https://xyz-group.com',
    moTa: 'Khách hàng lớn trong lĩnh vực viễn thông',
    trangThai: 'active',
    xepHang: 4,
  },
  {
    id: 'DT003',
    ma: 'DT-DC-001',
    ten: 'Viện Nghiên cứu Quốc gia',
    loai: 'doiTac',
    nganhNghe: 'Khoa học công nghệ',
    diaChi: '24 Đường Lý Thường Kiệt, Hà Nội',
    dienThoai: '024 3825 1234',
    email: 'contact@ncqg.gov.vn',
    moTa: 'Đối tác nghiên cứu chiến lược',
    trangThai: 'active',
    xepHang: 5,
  },
  {
    id: 'DT004',
    ma: 'DT-TV-001',
    ten: 'Công ty Tư vấn McKinsey',
    loai: 'tuVan',
    nganhNghe: 'Tư vấn quản lý',
    diaChi: 'Tòa nhà Union Square, 171 Đường Nguyễn Du, Q.1, TP.HCM',
    dienThoai: '028 3824 0000',
    email: 'contact@mckinsey.com',
    website: 'https://mckinsey.com',
    moTa: 'Công ty tư vấn quản lý hàng đầu thế giới',
    trangThai: 'active',
    xepHang: 4,
  },
  {
    id: 'DT005',
    ma: 'DT-NC-001',
    ten: 'Đại học Bách Khoa Hà Nội',
    loai: 'nghienCuu',
    nganhNghe: 'Giáo dục - Nghiên cứu',
    diaChi: 'Số 1 Đường Đại Cồ Việt, Quận Hai Bà Trưng, Hà Nội',
    dienThoai: '024 3869 1234',
    email: 'contact@hust.edu.vn',
    website: 'https://hust.edu.vn',
    moTa: 'Đối tác nghiên cứu và đào tạo',
    trangThai: 'active',
    xepHang: 5,
  },
  {
    id: 'DT006',
    ma: 'DT-NCC-002',
    ten: 'Công ty ChipTech Vietnam',
    loai: 'nhaCungCap',
    nganhNghe: 'Vi mạch bán dẫn',
    diaChi: 'Khu CNC Thạch Thất, Hà Nội',
    dienThoai: '024 1234 5678',
    email: 'info@chiptech.vn',
    moTa: 'Nhà cung cấp chip và vi mạch chuyên dụng',
    trangThai: 'active',
    xepHang: 4,
  },
]