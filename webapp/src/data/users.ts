// Mock dữ liệu người dùng cho màn Quản trị người dùng + Đăng nhập (F4 — RBAC, mock).
// Vai trò (role) ở đây là nhãn hiển thị; ánh xạ quyền chi tiết sẽ chốt ở F4.

export interface AppUser {
  id: string
  hoTen: string
  email: string
  donVi: string
  vaiTro: string[]
  /** Chức danh ngắn — hiển thị ở màn đăng nhập (demo) và header. */
  chucDanh: string
  trangThai: 'active' | 'locked'
}

/** Mật khẩu chung cho mọi tài khoản demo (mock — không xác thực thật). */
export const DEMO_PASSWORD = '123456'

/** Danh sách vai trò dùng chung (nguồn cho bộ lọc + gợi ý gán quyền). */
export const ALL_ROLES = [
  'Quản trị hệ thống',
  'Ban GĐ Trung tâm',
  'Ban GĐ Khối',
  'Cơ quan nghiệp vụ VHT',
  'Chủ nhiệm đề tài',
  'Phó TGĐ chuyên trách',
  'CQ Quản lý KHCN',
  'Tổng Giám đốc VHT',
  'TP Chiến lược KHCN',
  'TP Tài chính Kế toán',
  'TP Nhân sự',
  'GĐ TT Mua sắm',
] as const

export const users: AppUser[] = [
  {
    id: 'U-004',
    hoTen: 'Nguyễn Văn PM',
    email: 'pm@example.com',
    donVi: 'Trung tâm Nghiên cứu',
    vaiTro: ['Chủ nhiệm đề tài'],
    chucDanh: 'Chủ nhiệm đề tài (PM)',
    trangThai: 'active',
  },
  {
    id: 'U-002',
    hoTen: 'Trần Thị Ban Giám Đốc',
    email: 'bgd@example.com',
    donVi: 'Ban Giám đốc',
    vaiTro: ['Ban GĐ Trung tâm', 'Ban GĐ Khối'],
    chucDanh: 'Ban Giám đốc TT/Khối',
    trangThai: 'active',
  },
  {
    id: 'U-003',
    hoTen: 'Lê Văn Nghiệp Vụ',
    email: 'cqnv@example.com',
    donVi: 'CQNV VHT',
    vaiTro: ['Cơ quan nghiệp vụ VHT'],
    chucDanh: 'Cơ quan nghiệp vụ VHT',
    trangThai: 'active',
  },
  {
    id: 'U-006',
    hoTen: 'Phạm Thị QLKHCN',
    email: 'qlkhcn@example.com',
    donVi: 'CQ QLKHCN',
    vaiTro: ['CQ Quản lý KHCN'],
    chucDanh: 'CQ Quản lý KHCN',
    trangThai: 'active',
  },
  {
    id: 'U-008',
    hoTen: 'Vũ Thị Trưởng Phòng',
    email: 'tp@example.com',
    donVi: 'Khối Phòng ban',
    vaiTro: ['TP Chiến lược KHCN', 'TP Tài chính Kế toán', 'TP Nhân sự', 'GĐ TT Mua sắm'],
    chucDanh: 'Trưởng phòng (CLKHCN/TCKT/NS)',
    trangThai: 'active',
  },
  {
    id: 'U-005',
    hoTen: 'Hoàng Văn Phó Tổng',
    email: 'ptgd@example.com',
    donVi: 'Ban Tổng Giám đốc',
    vaiTro: ['Phó TGĐ chuyên trách'],
    chucDanh: 'Phó TGĐ chuyên trách',
    trangThai: 'active',
  },
  {
    id: 'U-007',
    hoTen: 'Đỗ Văn Tổng Giám Đốc',
    email: 'tgd@example.com',
    donVi: 'Ban Tổng Giám đốc',
    vaiTro: ['Tổng Giám đốc VHT'],
    chucDanh: 'Tổng Giám đốc VHT',
    trangThai: 'active',
  },
  {
    id: 'U-001',
    hoTen: 'Quản trị viên hệ thống',
    email: 'admin@example.com',
    donVi: 'CNTT',
    vaiTro: ['Quản trị hệ thống'],
    chucDanh: 'Quản trị hệ thống',
    trangThai: 'active',
  },
]

/** Tìm user theo email (không phân biệt hoa/thường, bỏ khoảng trắng). */
export function findUserByEmail(email: string): AppUser | undefined {
  const key = email.trim().toLowerCase()
  return users.find((u) => u.email.toLowerCase() === key)
}
