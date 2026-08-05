/**
 * Loại danh mục dùng chung — gom các danh mục cơ bản ít thay đổi / ít bản ghi
 * (Ngành, Lĩnh vực, Loại kết quả NCKH, Loại nhiệm vụ, …) vào một đối tượng cấu hình.
 */

export interface LoaiDanhMucChung {
  id: string
  ma: string
  ten: string
  moTa?: string
  soDanhMuc: number
  trangThai: 'active' | 'inactive'
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedLoaiDanhMucChung: LoaiDanhMucChung[] = [
  {
    id: 'L001',
    ma: 'NGANH',
    ten: 'Ngành',
    moTa: 'Phân loại theo ngành chuyên môn của nhiệm vụ KHCN',
    soDanhMuc: 5,
    trangThai: 'active',
  },
  {
    id: 'L002',
    ma: 'LINH_VUC',
    ten: 'Lĩnh vực',
    moTa: 'Lĩnh vực nghiên cứu / chuyên ngành hẹp trong ngành',
    soDanhMuc: 6,
    trangThai: 'active',
  },
  {
    id: 'L003',
    ma: 'LOAI_KET_QUA_NCKH',
    ten: 'Loại kết quả NCKH',
    moTa: 'Phân loại kết quả đầu ra nghiên cứu khoa học',
    soDanhMuc: 5,
    trangThai: 'active',
  },
  {
    id: 'L004',
    ma: 'LOAI_NHIEM_VU',
    ten: 'Loại nhiệm vụ',
    moTa: 'Phân loại nhiệm vụ KHCN (đề tài, dự án, sản xuất thử nghiệm…)',
    soDanhMuc: 4,
    trangThai: 'active',
  },
  {
    id: 'L005',
    ma: 'HINH_THUC',
    ten: 'Hình thức thực hiện',
    moTa: 'Hình thức tổ chức thực hiện nhiệm vụ',
    soDanhMuc: 3,
    trangThai: 'active',
  },
]
