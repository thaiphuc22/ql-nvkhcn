/**
 * Danh mục người dùng tổ chức (13 tài khoản) + ánh xạ vai trò → candidateGroup.
 * Port của webapp/src/data/users.ts (D17 Angular migration) — chỉ phần dữ liệu tổ
 * chức mà Ma trận phê duyệt cần để resolve GROUP/USER target ra người cụ thể.
 *
 * Riêng với `core/auth/demo-users.ts` (5 tài khoản demo, chỉ dùng cho luồng đăng
 * nhập stub Mốc 4) — không gộp 2 file vì phạm vi khác nhau: RBAC engine đầy đủ
 * (ALL_ROLES/permissions/AuthContext) là việc của Mốc 6+, ngoài phạm vi lát này.
 */

export interface AppUser {
  id: string;
  hoTen: string;
  email: string;
  donVi: string;
  vaiTro: string[];
  chucDanh: string;
  trangThai: 'active' | 'locked';
}

/**
 * Ánh xạ nhãn vai trò → mã candidateGroup trong BPMN (core/models/roles.ts). Cầu
 * nối duy nhất giữa nhãn vai trò của user và assignment.targets[].roleCodes.
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
  'Hội đồng KHCN VHT': ['HDKHCN', 'HDXD', 'HDXD_DC', 'HDNT', 'HD_DGHT'],
  'CQ KHCN Tập đoàn': ['CQ_KHCN_TD'],
  'CQ nghiệp vụ Tập đoàn': ['CQNV_TD'],
  'Hội đồng KHCN Tập đoàn': ['HDKHCN_TD', 'HDXD_TD', 'HDNT_TD'],
  'Ban TGĐ Tập đoàn': ['BTGD_TD'],
};

export const users: AppUser[] = [
  {
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
];
