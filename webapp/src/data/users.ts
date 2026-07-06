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
  'Hội đồng KHCN VHT',
  'CQ KHCN Tập đoàn',
  'CQ nghiệp vụ Tập đoàn',
  'Hội đồng KHCN Tập đoàn',
  'Ban TGĐ Tập đoàn',
] as const

/** Nhãn vai trò của Quản trị hệ thống — bypass mọi check quyền (xem data/permissions.ts). */
export const ADMIN_ROLE_LABEL = 'Quản trị hệ thống'

/**
 * Ánh xạ nhãn vai trò (ALL_ROLES) → mã candidateGroup trong BPMN (data/roles.ts).
 * Đây là cầu nối duy nhất giữa tài khoản demo và `zeebe:AssignmentDefinition
 * candidateGroups` trong RD01.01/RD01.02 — quyền xử lý bước suy từ map này.
 */
export const ROLE_LABEL_TO_CODES: Record<string, string[]> = {
  'Quản trị hệ thống': [], // bypass qua isAdmin, không cần code
  'Ban GĐ Trung tâm': ['BGD_TT'],
  'Ban GĐ Khối': ['BGD_KHOI'],
  'Cơ quan nghiệp vụ VHT': ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'],
  'Chủ nhiệm đề tài': ['PM', 'PA', 'NNC'],
  'Phó TGĐ chuyên trách': ['PTGD_CT'],
  'CQ Quản lý KHCN': ['CQ_QLKHCN'],
  'Tổng Giám đốc VHT': ['TGD_VHT'],
  'TP Chiến lược KHCN': ['TP_CLKHCN'],
  'TP Tài chính Kế toán': ['TP_TCKT'],
  'TP Nhân sự': ['TP_NS'],
  'GĐ TT Mua sắm': ['GD_TTMS'],
  // Demo gộp mọi hội đồng cấp VHT/TĐ vào 1 tài khoản thường trực — nếu tách,
  // các bước HĐXD/HĐNT trong seed dossiers.ts sẽ không có ai xử lý được.
  'Hội đồng KHCN VHT': ['HDKHCN', 'HDXD', 'HDXD_DC', 'HDNT', 'HD_DGHT'],
  'CQ KHCN Tập đoàn': ['CQ_KHCN_TD'],
  'CQ nghiệp vụ Tập đoàn': ['CQNV_TD'],
  'Hội đồng KHCN Tập đoàn': ['HDKHCN_TD', 'HDXD_TD', 'HDNT_TD'],
  'Ban TGĐ Tập đoàn': ['BTGD_TD'],
}

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
    id: 'U-009',
    hoTen: 'Ngô Thị Thanh Hằng',
    email: 'hdkhcn@example.com',
    donVi: 'Hội đồng KHCN VHT',
    vaiTro: ['Hội đồng KHCN VHT'],
    chucDanh: 'Thường trực HĐ KHCN VHT',
    trangThai: 'active',
  },
  {
    id: 'U-010',
    hoTen: 'Trịnh Văn Sơn',
    email: 'khcntd@example.com',
    donVi: 'Ban CNCNC Tập đoàn',
    vaiTro: ['CQ KHCN Tập đoàn'],
    chucDanh: 'CQ KHCN Tập đoàn',
    trangThai: 'active',
  },
  {
    id: 'U-011',
    hoTen: 'Lương Thị Bích Ngọc',
    email: 'cqnvtd@example.com',
    donVi: 'CQNV Tập đoàn',
    vaiTro: ['CQ nghiệp vụ Tập đoàn'],
    chucDanh: 'CQ nghiệp vụ Tập đoàn',
    trangThai: 'active',
  },
  {
    id: 'U-012',
    hoTen: 'Hoàng Minh Đức',
    email: 'hdtd@example.com',
    donVi: 'Hội đồng KHCN Tập đoàn',
    vaiTro: ['Hội đồng KHCN Tập đoàn'],
    chucDanh: 'Thường trực HĐ KHCN TĐ',
    trangThai: 'active',
  },
  {
    id: 'U-013',
    hoTen: 'Vũ Ngọc Toàn',
    email: 'btgdtd@example.com',
    donVi: 'Ban TGĐ Tập đoàn',
    vaiTro: ['Ban TGĐ Tập đoàn'],
    chucDanh: 'Ban TGĐ Tập đoàn',
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
