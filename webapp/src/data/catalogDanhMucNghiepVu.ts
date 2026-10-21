/**
 * Danh mục nghiệp vụ (Business Category) - Catalog data
 * Part of PH2 - Quản lý danh mục nghiệp vụ
 */

export type DanhMucNghiepVuTrangThai = 'active' | 'inactive'

export interface DanhMucNghiepVu {
  id: string
  ma: string
  ten: string
  moTa?: string
  trangThai: DanhMucNghiepVuTrangThai
  nguoiTao: string
  ngayTao: string
  ngayCapNhat?: string
  thuTuHienThi?: number
  lichSu?: Array<{
    hanhDong: string
    nguoiThucHien: string
    ngay: string
    chiTiet?: string
  }>
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedDanhMucNghiepVu: DanhMucNghiepVu[] = [
  {
    id: 'DV001',
    ma: 'RD01',
    ten: 'Rà soát chủ trương đầu tư',
    moTa: 'Quy trình rà soát và phê duyệt chủ trương đầu tư cho các dự án KH&CN',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-01-10',
    ngayCapNhat: '2026-06-15',
    thuTuHienThi: 1,
  },
  {
    id: 'DV002',
    ma: 'RD02',
    ten: 'Xét duyệt nhiệm vụ KH&CN',
    moTa: 'Quy trình xét duyệt nhiệm vụ khoa học và công nghệ cấp Tổng Công ty',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-01-10',
    ngayCapNhat: '2026-06-15',
    thuTuHienThi: 2,
  },
  {
    id: 'DV003',
    ma: 'RD05',
    ten: 'Điều chỉnh nhiệm vụ',
    moTa: 'Quy trình điều chỉnh nội dung, tiến độ, dự toán nhiệm vụ đã được phê duyệt',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-01-15',
    ngayCapNhat: '2026-06-20',
    thuTuHienThi: 3,
  },
  {
    id: 'DV004',
    ma: 'RD06',
    ten: 'Nghiệm thu nhiệm vụ',
    moTa: 'Quy trình nghiệm thu kết quả thực hiện nhiệm vụ KH&CN',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-01-20',
    ngayCapNhat: '2026-06-18',
    thuTuHienThi: 4,
  },
  {
    id: 'DV005',
    ma: 'RD08',
    ten: 'Quyết toán nhiệm vụ',
    moTa: 'Quy trình quyết toán tài chính cho các nhiệm vụ đã nghiệm thu',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-02-01',
    ngayCapNhat: '2026-06-10',
    thuTuHienThi: 5,
  },
  {
    id: 'DV006',
    ma: 'RD10',
    ten: 'Đổi chủ nhiệm',
    moTa: 'Quy trình thay đổi chủ nhiệm nhiệm vụ KH&CN',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-02-10',
    ngayCapNhat: '2026-06-15',
    thuTuHienThi: 6,
  },
  {
    id: 'DV007',
    ma: 'BC',
    ten: 'Báo cáo định kỳ/đột xuất',
    moTa: 'Quy trình lập và trình duyệt báo cáo định kỳ hoặc đột xuất',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-02-15',
    ngayCapNhat: '2026-06-20',
    thuTuHienThi: 7,
  },
  {
    id: 'DV008',
    ma: 'HD',
    ten: 'Hội đồng KHCN',
    moTa: 'Quy trình thành lập và hoạt động của Hội đồng khoa học và công nghệ',
    trangThai: 'active',
    nguoiTao: 'admin',
    ngayTao: '2026-03-01',
    ngayCapNhat: '2026-06-18',
    thuTuHienThi: 8,
  },
  {
    id: 'DV009',
    ma: 'PLM',
    ten: 'Kế hoạch thực hiện từ PLM',
    moTa: 'Đồng bộ kế hoạch và tiến độ từ hệ thống PLM',
    trangThai: 'inactive',
    nguoiTao: 'admin',
    ngayTao: '2026-03-15',
    ngayCapNhat: '2026-05-20',
    thuTuHienThi: 9,
  },
  {
    id: 'DV010',
    ma: 'QLTS',
    ten: 'Quản lý tài sản',
    moTa: 'Theo dõi tài sản hình thành từ nhiệm vụ KH&CN',
    trangThai: 'inactive',
    nguoiTao: 'admin',
    ngayTao: '2026-04-01',
    ngayCapNhat: '2026-05-15',
    thuTuHienThi: 10,
  },
]
