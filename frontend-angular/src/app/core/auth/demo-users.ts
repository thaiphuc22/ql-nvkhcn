/**
 * Danh sách tài khoản demo cho auth stub Mốc 4 — subset port từ
 * webapp/src/data/users.ts (13 tài khoản đầy đủ + RBAC engine đầy đủ port sang Angular
 * là việc của Mốc 6+ strangler migration RBAC, KHÔNG thuộc phạm vi Mốc 4 "không cần dữ
 * liệu thật"). 5 tài khoản này đủ đại diện các nhóm vai trò chính (khởi tạo/quản trị/xét
 * duyệt cấp cơ sở/xét duyệt cấp tập đoàn) để demo đăng nhập + hiển thị đúng tên/chức danh.
 */
import type { AppCode } from './app-registry';

export interface DemoUser {
  hoTen: string;
  email: string;
  chucDanh: string;
  isAdmin: boolean;
  /**
   * candidateGroups (BPMN) mà user nắm. **Không còn hardcode trong file này** — nạp runtime từ
   * `identity-service` (`user_role_assignments`) qua `AuthService.refreshCurrentUser()`; xem
   * {@link NO_STATIC_ROLES}. Đây là lọc phía client cho UI (dùng ở `/viec-cua-toi`) — KHÔNG
   * phải RBAC backend thật; enforce quyền ở server vẫn cần riêng, đọc
   * `HoSoResponse.steps[].vaiTroCodes` để so khớp.
   */
  roleCodes: string[];
  /** Entitlement App demo phía client; không thay thế authorization ở backend. */
  apps: AppCode[];
}

/**
 * Seed rỗng có chủ ý cho MỌI tài khoản demo. Trước đây file này hardcode `roleCodes` theo email
 * — nguồn sự thật thứ 3 song song với `user_role_assignments` trong DB `qtkhcn_identity` (đã seed
 * đủ 16 email ở `V1__identity_schema.sql`), nên gán vai trò trên `/nguoi-dung` đúng ở backend
 * nhưng UI vẫn đọc bản tĩnh. Nay `AuthService.refreshCurrentUser()` nạp vai trò thật từ
 * `/api/effective-permissions/{email}`; identity-service chưa chạy thì `AuthService.
 * identityUnavailable()` bật để UI nói rõ thay vì hiện danh sách trống.
 */
const NO_STATIC_ROLES: string[] = Object.freeze([] as string[]) as string[];

/** Mật khẩu chung cho mọi tài khoản demo — khớp DEMO_PASSWORD của webapp (mock, không xác thực thật). */
export const DEMO_PASSWORD = '123456';

export const DEMO_USERS: DemoUser[] = [
  { hoTen: 'Lê Văn Cường', email: 'admin@example.com', chucDanh: 'Quản trị hệ thống', isAdmin: true, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn', 'quytrinh', 'he-thong'] },
  { hoTen: 'Trần Văn Nam', email: 'pm@example.com', chucDanh: 'Chủ nhiệm đề tài (PM)', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Phạm Thu Hà', email: 'cqnv@example.com', chucDanh: 'Cơ quan nghiệp vụ VHT', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn', 'quytrinh'] },
  { hoTen: 'Phạm Quang Vinh', email: 'tgd@example.com', chucDanh: 'Tổng Giám đốc VHT', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Ngô Thị Thanh Hằng', email: 'hdkhcn@example.com', chucDanh: 'Thường trực HĐ KHCN VHT', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Đỗ Văn Mạnh', email: 'gd-ttms@example.com', chucDanh: 'Giám đốc Trung tâm Mua sắm', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Nguyễn Thu Hương', email: 'tp-ns@example.com', chucDanh: 'Trưởng phòng Nhân sự', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Trần Quốc Dũng', email: 'tp-tckt@example.com', chucDanh: 'Trưởng phòng Tài chính Kế toán', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  // Cấp Tập đoàn (RD02.02) — mỗi vai một tài khoản, cố ý không gộp để demo được phân tách thẩm
  // quyền qua 4 cấp. Vai trò nay lấy từ `user_role_assignments`; nhưng phía SERVER
  // `DemoIdentityProvider.java` (ho-so-service) vẫn còn bản hardcode riêng — lệch giữa nó và DB
  // vẫn dẫn tới đăng nhập được mà `/viec-cua-toi` trống. Nợ kỹ thuật còn lại, xem active-task.md.
  { hoTen: 'Vũ Đình Khoa', email: 'cqkhcn-td@example.com', chucDanh: 'Cơ quan KHCN Tập đoàn (Ban CNCNC)', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Nguyễn Đức Thắng', email: 'cqtckt-td@example.com', chucDanh: 'Cơ quan TCKT Tập đoàn (Ban TCKT)', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Lý Thị Mai Phương', email: 'cqdtxd-td@example.com', chucDanh: 'Cơ quan ĐTXD Tập đoàn (Ban ĐTXD)', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Trịnh Văn Hiếu', email: 'cqtcnl-td@example.com', chucDanh: 'Cơ quan TCNL Tập đoàn (Ban TCNL)', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Đặng Minh Tuấn', email: 'hdxd-td@example.com', chucDanh: 'Hội đồng Xét duyệt Tập đoàn', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Bùi Thị Lan Anh', email: 'hdkhcn-td@example.com', chucDanh: 'Hội đồng KHCN Tập đoàn', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
  { hoTen: 'Hoàng Trọng Nghĩa', email: 'btgd-td@example.com', chucDanh: 'Ban Tổng Giám đốc Tập đoàn', isAdmin: false, roleCodes: NO_STATIC_ROLES, apps: ['qlnvkhcn'] },
];

export function findDemoUser(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}
