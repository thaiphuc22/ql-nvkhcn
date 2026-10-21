/**
 * Quản lý thư viện nhiệm vụ (Task Library) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface ThuVienNhiemVu {
  id: string
  ma: string
  ten: string
  loai: ThuVienNhiemVuLoai
  moTa?: string
  noiDung?: string
  sanPhamDuKien?: string
  thoiGianUocTinh?: number // ngày
  mucDoPhucTap: MucDoPhucTap
  trangThai: 'active' | 'inactive'
}

export type ThuVienNhiemVuLoai = 'nghienCuu' | 'ungDung' | 'trienKhai' | 'daoTao' | 'khac'
export type MucDoPhucTap = 'thap' | 'trungBinh' | 'cao'

export const LOAI_TVN: Record<ThuVienNhiemVu['loai'], string> = {
  nghienCuu: 'Nghiên cứu',
  ungDung: 'Ứng dụng',
  trienKhai: 'Triển khai',
  daoTao: 'Đào tạo',
  khac: 'Khác',
}

export const LOAI_TVN_COLOR: Record<ThuVienNhiemVu['loai'], string> = {
  nghienCuu: 'blue',
  ungDung: 'green',
  trienKhai: 'orange',
  daoTao: 'purple',
  khac: 'default',
}

export const MUC_DO_PHUC_TAP: Record<ThuVienNhiemVu['mucDoPhucTap'], string> = {
  thap: 'Thấp',
  trungBinh: 'Trung bình',
  cao: 'Cao',
}

export const MUC_DO_PHUC_TAP_COLOR: Record<ThuVienNhiemVu['mucDoPhucTap'], string> = {
  thap: 'green',
  trungBinh: 'orange',
  cao: 'red',
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedThuVienNhiemVu: ThuVienNhiemVu[] = [
  {
    id: 'TV001',
    ma: 'TV-RD-001',
    ten: 'Nghiên cứu thị trường',
    loai: 'nghienCuu',
    moTa: 'Khảo sát và phân tích nhu cầu thị trường cho sản phẩm mới',
    noiDung: 'Thu thập dữ liệu, phân tích xu hướng, đánh giá đối thủ cạnh tranh',
    sanPhamDuKien: 'Báo cáo phân tích thị trường',
    thoiGianUocTinh: 30,
    mucDoPhucTap: 'trungBinh',
    trangThai: 'active',
  },
  {
    id: 'TV002',
    ma: 'TV-RD-002',
    ten: 'Thiết kế kỹ thuật',
    loai: 'nghienCuu',
    moTa: 'Thiết kế kỹ thuật chi tiết cho sản phẩm',
    noiDung: 'Tạo bản vẽ kỹ thuật, tính toán các thông số, lựa chọn vật liệu',
    sanPhamDuKien: 'Bộ tài liệu thiết kế',
    thoiGianUocTinh: 45,
    mucDoPhucTap: 'cao',
    trangThai: 'active',
  },
  {
    id: 'TV003',
    ma: 'TV-UD-001',
    ten: 'Phát triển prototype',
    loai: 'ungDung',
    moTa: 'Xây dựng và thử nghiệm prototype',
    noiDung: 'Lắp ráp, thử nghiệm, đánh giá hiệu suất',
    sanPhamDuKien: 'Prototype hoàn chỉnh',
    thoiGianUocTinh: 60,
    mucDoPhucTap: 'cao',
    trangThai: 'active',
  },
  {
    id: 'TV004',
    ma: 'TV-TK-001',
    ten: 'Triển khai hệ thống',
    loai: 'trienKhai',
    moTa: 'Cài đặt và triển khai hệ thống tại site',
    noiDung: 'Cài đặt, cấu hình, kiểm thử, đào tạo người dùng',
    sanPhamDuKien: 'Hệ thống vận hành',
    thoiGianUocTinh: 90,
    mucDoPhucTap: 'trungBinh',
    trangThai: 'active',
  },
  {
    id: 'TV005',
    ma: 'TV-DT-001',
    ten: 'Đào tạo nội bộ',
    loai: 'daoTao',
    moTa: 'Tổ chức đào tạo cho nhân viên',
    noiDung: 'Chuẩn bị tài liệu, trình bày, hướng dẫn thực hành',
    sanPhamDuKien: 'Nhân viên được đào tạo',
    thoiGianUocTinh: 15,
    mucDoPhucTap: 'thap',
    trangThai: 'active',
  },
  {
    id: 'TV006',
    ma: 'TV-RD-003',
    ten: 'Viết báo cáo khoa học',
    loai: 'nghienCuu',
    moTa: 'Tổng hợp kết quả nghiên cứu thành bài báo khoa học',
    noiDung: 'Tổng hợp dữ liệu, phân tích kết quả, viết báo cáo',
    sanPhamDuKien: 'Bài báo đăng tạp chí',
    thoiGianUocTinh: 21,
    mucDoPhucTap: 'trungBinh',
    trangThai: 'active',
  },
]