/**
 * Danh sách tài khoản demo cho auth stub Mốc 4 — subset port từ
 * webapp/src/data/users.ts (13 tài khoản đầy đủ + RBAC engine đầy đủ port sang Angular
 * là việc của Mốc 6+ strangler migration RBAC, KHÔNG thuộc phạm vi Mốc 4 "không cần dữ
 * liệu thật"). 5 tài khoản này đủ đại diện các nhóm vai trò chính (khởi tạo/quản trị/xét
 * duyệt cấp cơ sở/xét duyệt cấp tập đoàn) để demo đăng nhập + hiển thị đúng tên/chức danh.
 */
export interface DemoUser {
  hoTen: string;
  email: string;
  chucDanh: string;
  isAdmin: boolean;
}

/** Mật khẩu chung cho mọi tài khoản demo — khớp DEMO_PASSWORD của webapp (mock, không xác thực thật). */
export const DEMO_PASSWORD = '123456';

export const DEMO_USERS: DemoUser[] = [
  { hoTen: 'Lê Văn Cường', email: 'admin@example.com', chucDanh: 'Quản trị hệ thống', isAdmin: true },
  { hoTen: 'Trần Văn Nam', email: 'pm@example.com', chucDanh: 'Chủ nhiệm đề tài (PM)', isAdmin: false },
  { hoTen: 'Phạm Thu Hà', email: 'cqnv@example.com', chucDanh: 'Cơ quan nghiệp vụ VHT', isAdmin: false },
  { hoTen: 'Phạm Quang Vinh', email: 'tgd@example.com', chucDanh: 'Tổng Giám đốc VHT', isAdmin: false },
  { hoTen: 'Ngô Thị Thanh Hằng', email: 'hdkhcn@example.com', chucDanh: 'Thường trực HĐ KHCN VHT', isAdmin: false },
];

export function findDemoUser(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}
