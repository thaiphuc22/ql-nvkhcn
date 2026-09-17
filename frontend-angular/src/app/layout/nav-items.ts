/**
 * Cấu trúc menu sider — port IA từ webapp/src/App.tsx (menuItemsMain + PH_MENU_MAP) và
 * webapp/src/data/phanHe.ts (danh sách module PH2/PH3/PH4). ĐƠN GIẢN HOÁ có chủ đích so
 * với bản React: gộp thành 1 sider phẳng duy nhất, KHÔNG port hành vi "đổi ngữ cảnh sider
 * khi vào /phan-he/PH2 hay /phan-he/PH3" (mini-sider PH_MENU_MAP) — mọi module vẫn đủ,
 * chỉ khác cách điều hướng tới. Việc đó thuộc phần polish tương tác, không chặn mục tiêu
 * Mốc 4 ("layout + nav render đúng nhóm phân hệ, không cần dữ liệu thật") lẫn Mốc 5.
 */
import type { AppCode } from '../core/auth/app-registry';

export interface NavLeaf {
  key: string;
  label: string;
  route: string;
  /** Mã quyền xem danh sách/màn hình — ẩn menu nếu user không có. */
  permission?: string;
}

export interface NavGroup {
  key: string;
  label: string;
  icon: string;
  children: NavLeaf[];
}

export type NavItem = ((NavLeaf & { icon: string }) | NavGroup) & { app: AppCode };

export function isNavGroup(item: NavItem): item is NavGroup & { app: AppCode } {
  return 'children' in item;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'worklist', label: 'Việc của tôi', route: '/viec-cua-toi', icon: 'carry-out', app: 'qlnvkhcn', permission: 'TASK01' },
  {
    key: 'nvkhcn',
    app: 'qlnvkhcn',
    label: 'Quản trị KHCN',
    icon: 'experiment',
    children: [
      { key: 'nhiem-vu', label: 'Danh sách NV KHCN', route: '/nhiem-vu', permission: 'NV01' },
      { key: 'ho-so', label: 'Danh sách Hồ sơ KHCN', route: '/ho-so', permission: 'HS01' },
      { key: 'hoi-dong', label: 'Quản lý Hội đồng', route: '/hoi-dong', permission: 'HD01' },
    ],
  },
  { key: 'dashboard', label: 'Tổng quan', route: '/tong-quan', icon: 'dashboard', app: 'quytrinh', permission: 'DB01' },
  {
    key: 'quytrinh-config',
    app: 'quytrinh',
    label: 'Quản trị quy trình',
    icon: 'partition',
    children: [
      { key: 'quy-trinh', label: 'Quản lý quy trình', route: '/quy-trinh', permission: 'QT01' },
      { key: 'luat', label: 'Ma trận quyết định', route: '/quan-ly-luat' },
      { key: 'matran', label: 'Ma trận phê duyệt', route: '/ma-tran-phe-duyet' },
      { key: 'hanhdong', label: 'Ma trận Hành động', route: '/cau-hinh-hanh-dong', permission: 'HTN01' },
      { key: 'servicetask', label: 'Tác vụ hệ thống', route: '/cau-hinh-service-task' },
      { key: 'giamsat', label: 'Giám sát tiến trình', route: '/giam-sat', permission: 'GS01' },
      { key: 'tichhop', label: 'Tích hợp', route: '/tich-hop', permission: 'INT01' },
      { key: 'nhatky', label: 'Nhật ký', route: '/nhat-ky' },
    ],
  },
  {
    key: 'ph2',
    app: 'he-thong',
    label: 'Phân quyền & Xác thực',
    icon: 'safety',
    children: [
      { key: 'donvi', label: 'Quản trị đơn vị', route: '/phan-he/PH2/co-cau-to-chuc' },
      { key: 'nguoidung', label: 'Quản trị người dùng', route: '/phan-he/PH2/nguoi-dung' },
      { key: 'phanquyen', label: 'Phân quyền', route: '/phan-he/PH2/phan-quyen' },
    ],
  },
  {
    key: 'ph3',
    app: 'he-thong',
    label: 'Danh mục dùng chung',
    icon: 'database',
    children: [{ key: 'bieumau', label: 'Thư viện biểu mẫu', route: '/phan-he/PH3/bieu-mau' }],
  },
];

export function navItemsForApp(app: AppCode | null | undefined): NavItem[] {
  return app ? NAV_ITEMS.filter((item) => item.app === app) : [];
}

/** Ẩn lá/nhóm không có quyền xem. `can` nhận mã permission của lá. */
export function visibleNavItems(app: AppCode | null | undefined, can: (code: string) => boolean): NavItem[] {
  const visible: NavItem[] = [];
  for (const item of navItemsForApp(app)) {
    if (!isNavGroup(item)) {
      if (item.permission && !can(item.permission)) continue;
      visible.push(item);
      continue;
    }
    const children = item.children.filter((leaf) => !leaf.permission || can(leaf.permission));
    if (children.length === 0) continue;
    visible.push({ ...item, children });
  }
  return visible;
}

/** Tiêu đề khu vực hiển thị trên breadcrumb header — khoá theo route hiện tại. */
export const SECTION_TITLE_BY_ROUTE: Record<string, string> = {
  '/tong-quan': 'Tổng quan',
  '/viec-cua-toi': 'Việc của tôi',
  '/nhiem-vu': 'Quản trị KHCN',
  '/ho-so': 'Quản trị KHCN',
  '/hoi-dong': 'Quản trị KHCN',
  '/quy-trinh': 'Quản lý quy trình',
  '/quan-ly-luat': 'Ma trận quyết định',
  '/ma-tran-phe-duyet': 'Ma trận phê duyệt',
  '/cau-hinh-hanh-dong': 'Ma trận Hành động',
  '/cau-hinh-service-task': 'Tác vụ hệ thống',
  '/giam-sat': 'Giám sát tiến trình',
  '/tich-hop': 'Tích hợp',
  '/nhat-ky': 'Nhật ký',
  '/phan-he/PH2/co-cau-to-chuc': 'Quản trị đơn vị',
  '/phan-he/PH2/nguoi-dung': 'Quản trị người dùng',
  '/phan-he/PH2/phan-quyen': 'Phân quyền',
  '/phan-he/PH3/bieu-mau': 'Thư viện biểu mẫu',
};
