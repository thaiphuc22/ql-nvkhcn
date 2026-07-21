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
   * candidateGroups (BPMN) mà user nắm — port tối thiểu của `ROLE_LABEL_TO_CODES` ở
   * `webapp/src/data/users.ts`, chỉ cho đúng 5 tài khoản demo hiện có. Đây là lọc phía
   * client cho UI (dùng ở `/viec-cua-toi`) — KHÔNG phải RBAC backend thật; enforce quyền
   * ở server (Bước 4 trong active-task.md) vẫn cần làm riêng, đọc `HoSoResponse.
   * steps[].vaiTroCodes` để so khớp.
   */
  roleCodes: string[];
  /** Entitlement App demo phía client; không thay thế authorization ở backend. */
  apps: AppCode[];
}

/** Mật khẩu chung cho mọi tài khoản demo — khớp DEMO_PASSWORD của webapp (mock, không xác thực thật). */
export const DEMO_PASSWORD = '123456';

export const DEMO_USERS: DemoUser[] = [
  { hoTen: 'Lê Văn Cường', email: 'admin@example.com', chucDanh: 'Quản trị hệ thống', isAdmin: true, roleCodes: [], apps: ['qlnvkhcn', 'quytrinh', 'he-thong'] },
  { hoTen: 'Trần Văn Nam', email: 'pm@example.com', chucDanh: 'Chủ nhiệm đề tài (PM)', isAdmin: false, roleCodes: ['PM', 'PA', 'NNC'], apps: ['qlnvkhcn'] },
  { hoTen: 'Phạm Thu Hà', email: 'cqnv@example.com', chucDanh: 'Cơ quan nghiệp vụ VHT', isAdmin: false, roleCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], apps: ['qlnvkhcn', 'quytrinh'] },
  { hoTen: 'Phạm Quang Vinh', email: 'tgd@example.com', chucDanh: 'Tổng Giám đốc VHT', isAdmin: false, roleCodes: ['TGD_VHT', 'PTGD_CT'], apps: ['qlnvkhcn'] },
  { hoTen: 'Ngô Thị Thanh Hằng', email: 'hdkhcn@example.com', chucDanh: 'Thường trực HĐ KHCN VHT', isAdmin: false, roleCodes: ['HDKHCN', 'HDXD', 'HDXD_DC', 'HDNT', 'HD_DGHT'], apps: ['qlnvkhcn'] },
  { hoTen: 'Đỗ Văn Mạnh', email: 'gd-ttms@example.com', chucDanh: 'Giám đốc Trung tâm Mua sắm', isAdmin: false, roleCodes: ['GD_TTMS'], apps: ['qlnvkhcn'] },
  { hoTen: 'Nguyễn Thu Hương', email: 'tp-ns@example.com', chucDanh: 'Trưởng phòng Nhân sự', isAdmin: false, roleCodes: ['TP_NS'], apps: ['qlnvkhcn'] },
  { hoTen: 'Trần Quốc Dũng', email: 'tp-tckt@example.com', chucDanh: 'Trưởng phòng Tài chính Kế toán', isAdmin: false, roleCodes: ['TP_TCKT'], apps: ['qlnvkhcn'] },
  // Cấp Tập đoàn (RD02.02) — mỗi vai một tài khoản, cố ý không gộp để demo được phân tách thẩm
  // quyền qua 4 cấp. Phải giữ đồng bộ với DemoIdentityProvider.java ở ho-so-service, lệch là
  // đăng nhập được nhưng `/viec-cua-toi` trống.
  { hoTen: 'Vũ Đình Khoa', email: 'cqkhcn-td@example.com', chucDanh: 'Cơ quan KHCN Tập đoàn (Ban CNCNC)', isAdmin: false, roleCodes: ['CQ_KHCN_TD'], apps: ['qlnvkhcn'] },
  { hoTen: 'Nguyễn Đức Thắng', email: 'cqtckt-td@example.com', chucDanh: 'Cơ quan TCKT Tập đoàn (Ban TCKT)', isAdmin: false, roleCodes: ['CQ_TCKT_TD'], apps: ['qlnvkhcn'] },
  { hoTen: 'Lý Thị Mai Phương', email: 'cqdtxd-td@example.com', chucDanh: 'Cơ quan ĐTXD Tập đoàn (Ban ĐTXD)', isAdmin: false, roleCodes: ['CQ_DTXD_TD'], apps: ['qlnvkhcn'] },
  { hoTen: 'Trịnh Văn Hiếu', email: 'cqtcnl-td@example.com', chucDanh: 'Cơ quan TCNL Tập đoàn (Ban TCNL)', isAdmin: false, roleCodes: ['CQ_TCNL_TD'], apps: ['qlnvkhcn'] },
  { hoTen: 'Đặng Minh Tuấn', email: 'hdxd-td@example.com', chucDanh: 'Hội đồng Xét duyệt Tập đoàn', isAdmin: false, roleCodes: ['HDXD_TD'], apps: ['qlnvkhcn'] },
  { hoTen: 'Bùi Thị Lan Anh', email: 'hdkhcn-td@example.com', chucDanh: 'Hội đồng KHCN Tập đoàn', isAdmin: false, roleCodes: ['HDKHCN_TD'], apps: ['qlnvkhcn'] },
  { hoTen: 'Hoàng Trọng Nghĩa', email: 'btgd-td@example.com', chucDanh: 'Ban Tổng Giám đốc Tập đoàn', isAdmin: false, roleCodes: ['BTGD_TD'], apps: ['qlnvkhcn'] },
];

export function findDemoUser(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}
