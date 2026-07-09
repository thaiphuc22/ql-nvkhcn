/**
 * Danh sách 7 Phân hệ — nguồn từ docs/research/userflow-sso-app-portal-phan-he-2026-07-09.md.
 * Dùng cho SubsystemSwitcher (header popover) và SubsystemList (trang danh sách).
 */

/**
 * Trạng thái phân hệ dưới góc nhìn của user hiện tại.
 * - `active`: user có quyền, vào được.
 * - `no-permission`: phân hệ đang hoạt động nhưng user không có quyền.
 * - `coming-soon`: chưa triển khai (toàn hệ thống).
 * - `maintenance`: đang bảo trì.
 */
export type PhanHeStatus = 'active' | 'no-permission' | 'coming-soon' | 'maintenance'

export interface PhanHeModule {
  label: string
  route: string
}

export interface PhanHe {
  id: string
  ten: string
  moTa: string
  /** Tên icon Ant Design (dạng string để map động). */
  icon: string
  /** Màu accent cho card (hex). */
  color: string
  /** Route mặc định khi click card (nếu có quyền). */
  route: string
  /** Trạng thái gốc toàn hệ thống. */
  trangThai: 'active' | 'coming-soon'
  /** Các module con (label + route thật). */
  modules: PhanHeModule[]
  /**
   * Hàm kiểm tra user có quyền vào phân hệ này không.
   * Nhận permissions object từ usePermissions().
   * Trả về true nếu user có quyền truy cập ít nhất một module.
   */
  hasPermission?: (perms: PhanHePermissions) => boolean
  /** Lộ trình dự kiến (chỉ cho coming-soon). */
  estimatedRelease?: string
  /** Số việc chờ trong phân hệ (tính năng sau — hiện = 0). */
  pendingTasks?: number
}

/** Tập con các quyền từ usePermissions() mà danh sách phân hệ cần. */
export interface PhanHePermissions {
  admin: boolean
  canManageSystem: boolean
  isChuNhiemDeTai: boolean
}

export const DANH_SACH_PHAN_HE: PhanHe[] = [
  {
    id: 'PH1',
    ten: 'Cổng truy cập tập trung',
    moTa: 'Điểm vào duy nhất sau SSO. Hiển thị các phân hệ được cấp quyền, thông báo tổng hợp, dashboard cá nhân và ghi nhớ phân hệ gần nhất.',
    icon: 'HomeOutlined',
    color: '#1677ff',
    route: '/phan-he/PH1',
    trangThai: 'active',
    modules: [
      { label: 'Tổng quan', route: '/tong-quan' },
    ],
    // Ai cũng vào được cổng
    hasPermission: () => true,
  },
  {
    id: 'PH2',
    ten: 'Phân quyền & Xác thực tập trung',
    moTa: 'Quản lý danh tính, SSO, phân quyền RBAC, phạm vi dữ liệu, ủy quyền xử lý và audit truy cập toàn hệ thống.',
    icon: 'SafetyOutlined',
    color: '#52c41a',
    route: '/phan-he/PH2',
    trangThai: 'active',
    modules: [
      { label: 'Quản trị đơn vị', route: '/phan-he/PH2/co-cau-to-chuc' },
      { label: 'Quản trị người dùng', route: '/phan-he/PH2/nguoi-dung' },
      { label: 'Phân quyền', route: '/phan-he/PH2/phan-quyen' },
    ],
    hasPermission: (p) => p.canManageSystem,
  },
  {
    id: 'PH3',
    ten: 'Danh mục dùng chung',
    moTa: 'Dữ liệu nền, danh mục, biểu mẫu động (eForm engine), cấu hình dùng chung cho toàn hệ thống.',
    icon: 'DatabaseOutlined',
    color: '#fa8c16',
    route: '/phan-he/PH3',
    trangThai: 'active',
    modules: [
      { label: 'Thư viện biểu mẫu', route: '/phan-he/PH3/bieu-mau' },
    ],
    hasPermission: (p) => !p.isChuNhiemDeTai,
  },
  {
    id: 'PH4',
    ten: 'Thiết kế, Giám sát & Điều phối Quy trình',
    moTa: 'Workflow/BPM trung tâm: thiết kế BPMN, cấu hình bước duyệt, SLAs, hành động, giám sát tiến trình và điều phối hồ sơ KHCN.',
    icon: 'PartitionOutlined',
    color: '#722ed1',
    route: '/phan-he/PH4',
    trangThai: 'active',
    modules: [
      { label: 'Quản lý quy trình', route: '/quy-trinh' },
      { label: 'Ma trận quyết định', route: '/quan-ly-luat' },
      { label: 'Ma trận phê duyệt', route: '/ma-tran-phe-duyet' },
      { label: 'Giám sát tiến trình', route: '/giam-sat' },
    ],
    hasPermission: (p) => !p.isChuNhiemDeTai,
  },
  {
    id: 'PH5',
    ten: 'Mua sắm',
    moTa: 'Quản lý toàn bộ quy trình mua sắm thiết bị, vật tư, dịch vụ cho đề tài/dự án KHCN.',
    icon: 'ShoppingOutlined',
    color: '#eb2f96',
    route: '/phan-he/PH5',
    trangThai: 'coming-soon',
    modules: [],
    estimatedRelease: 'Dự kiến Q1/2027',
  },
  {
    id: 'PH6',
    ten: 'Quản lý chi phí nhân công, đề tài dự án',
    moTa: 'Theo dõi chi phí nhân công, phân bổ nguồn lực, quản lý ngân sách đề tài và báo cáo tài chính dự án.',
    icon: 'DollarOutlined',
    color: '#13c2c2',
    route: '/phan-he/PH6',
    trangThai: 'coming-soon',
    modules: [],
    estimatedRelease: 'Dự kiến Q2/2027',
  },
  {
    id: 'PH7',
    ten: 'Quản lý hàng hóa đề tài dự án',
    moTa: 'Quản lý danh mục hàng hóa, vật tư, thiết bị; theo dõi nhập/xuất/kiểm kê trong phạm vi đề tài.',
    icon: 'InboxOutlined',
    color: '#fadb14',
    route: '/phan-he/PH7',
    trangThai: 'coming-soon',
    modules: [],
    estimatedRelease: 'Dự kiến Q2/2027',
  },
]

/* ---------- helper: xác định trạng thái phân hệ với user hiện tại ---------- */
export function getPhanHeStatus(ph: PhanHe, perms: PhanHePermissions): PhanHeStatus {
  if (ph.trangThai === 'coming-soon') return 'coming-soon'
  if (ph.hasPermission && !ph.hasPermission(perms)) return 'no-permission'
  return 'active'
}

/**
 * Normalize chuỗi tiếng Việt → bỏ dấu, lowercase.
 * Dùng cho search không dấu: gõ "phan quyen" vẫn tìm được "Phân quyền".
 */
export function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}
