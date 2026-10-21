/**
 * Quản lý vai trò của nhiệm vụ (Task Role Management) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface VaiTroNhiemVu {
  id: string
  ma: string
  ten: string
  moTa?: string
  quyenHan: string[]
  donViPheDuyet?: string
  soLuongToiDa?: number
  trangThai: 'active' | 'inactive'
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedVaiTroNhiemVu: VaiTroNhiemVu[] = [
  {
    id: 'VT001',
    ma: 'CHU_NHIEM',
    ten: 'Chủ nhiệm đề tài',
    moTa: 'Người chịu trách nhiệm chính về thực hiện nhiệm vụ, báo cáo tiến độ và kết quả',
    quyenHan: ['taoMoi', 'chinhSua', 'xemBaoCao', 'nopBaoCao'],
    donViPheDuyet: 'Hội đồng xét duyệt',
    soLuongToiDa: 1,
    trangThai: 'active',
  },
  {
    id: 'VT002',
    ma: 'PCHU_NHIEM',
    ten: 'Phó chủ nhiệm',
    moTa: 'Hỗ trợ Chủ nhiệm trong công tác điều phối và quản lý nhiệm vụ',
    quyenHan: ['xemBaoCao', 'chinhSua', 'taoBaoCao'],
    soLuongToiDa: 2,
    trangThai: 'active',
  },
  {
    id: 'VT003',
    ma: 'THU_KY',
    ten: 'Thư ký kỹ thuật',
    moTa: 'Hỗ trợ soạn thảo tài liệu, theo dõi tiến độ và lưu trữ hồ sơ',
    quyenHan: ['xemBaoCao', 'chinhSua'],
    trangThai: 'active',
  },
  {
    id: 'VT004',
    ma: 'THANH_VIEN',
    ten: 'Thành viên nghiên cứu',
    moTa: 'Thực hiện các công việc theo phân công của Chủ nhiệm',
    quyenHan: ['xemBaoCao'],
    trangThai: 'active',
  },
  {
    id: 'VT005',
    ma: 'CHUYEN_GIA',
    ten: 'Chuyên gia tư vấn',
    moTa: 'Cung cấp chuyên môn và tư vấn kỹ thuật cho nhiệm vụ',
    quyenHan: ['xemBaoCao', 'taoYKien'],
    trangThai: 'active',
  },
  {
    id: 'VT006',
    ma: 'QUAN_TRI',
    ten: 'Quản trị hệ thống',
    moTa: 'Quản lý người dùng, phân quyền và cấu hình hệ thống',
    quyenHan: ['quanTriHeThong', 'quanTriNguoiDung', 'xemBaoCao'],
    trangThai: 'active',
  },
  {
    id: 'VT007',
    ma: 'PHE_DUYET',
    ten: 'Người phê duyệt',
    moTa: 'Phê duyệt các báo cáo, đề xuất và kết quả nhiệm vụ',
    quyenHan: ['xemBaoCao', 'pheDuyet', 'tuChoi'],
    donViPheDuyet: 'Ban giám đốc',
    trangThai: 'active',
  },
]