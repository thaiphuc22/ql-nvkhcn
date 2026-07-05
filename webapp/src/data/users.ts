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
    // Tên user demo khớp người xuất hiện trong mock data (nhiemVu.ts/dossiers.ts)
    // để demo nhất quán: đăng nhập pm@ thấy đúng chủ nhiệm của RD.2026.012.
    id: 'U-004',
    hoTen: 'Trần Văn Nam',
    email: 'pm@example.com',
    donVi: 'Trung tâm Nghiên cứu',
    vaiTro: ['Chủ nhiệm đề tài'],
    chucDanh: 'Chủ nhiệm đề tài (PM)',
    trangThai: 'active',
  },
  {
    id: 'U-002',
    hoTen: 'Lê Minh Quang',
    email: 'bgd@example.com',
    donVi: 'Ban Giám đốc',
    vaiTro: ['Ban GĐ Trung tâm', 'Ban GĐ Khối'],
    chucDanh: 'Ban Giám đốc TT/Khối',
    trangThai: 'active',
  },
  {
    id: 'U-003',
    hoTen: 'Phạm Thu Hà',
    email: 'cqnv@example.com',
    donVi: 'CQNV VHT',
    vaiTro: ['Cơ quan nghiệp vụ VHT'],
    chucDanh: 'Cơ quan nghiệp vụ VHT',
    trangThai: 'active',
  },
  {
    id: 'U-006',
    hoTen: 'Vũ Thành Long',
    email: 'qlkhcn@example.com',
    donVi: 'CQ QLKHCN',
    vaiTro: ['CQ Quản lý KHCN'],
    chucDanh: 'CQ Quản lý KHCN',
    trangThai: 'active',
  },
  {
    id: 'U-008',
    hoTen: 'Đặng Thị Mai Hương',
    email: 'tp@example.com',
    donVi: 'Khối Phòng ban',
    vaiTro: ['TP Chiến lược KHCN', 'TP Tài chính Kế toán', 'TP Nhân sự', 'GĐ TT Mua sắm'],
    chucDanh: 'Trưởng phòng (CLKHCN/TCKT/NS)',
    trangThai: 'active',
  },
  {
    id: 'U-005',
    hoTen: 'Nguyễn Đức Thắng',
    email: 'ptgd@example.com',
    donVi: 'Ban Tổng Giám đốc',
    vaiTro: ['Phó TGĐ chuyên trách'],
    chucDanh: 'Phó TGĐ chuyên trách',
    trangThai: 'active',
  },
  {
    id: 'U-007',
    hoTen: 'Phạm Quang Vinh',
    email: 'tgd@example.com',
    donVi: 'Ban Tổng Giám đốc',
    vaiTro: ['Tổng Giám đốc VHT'],
    chucDanh: 'Tổng Giám đốc VHT',
    trangThai: 'active',
  },
  {
    id: 'U-001',
    hoTen: 'Lê Văn Cường',
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
