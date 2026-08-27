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
  { key: 'worklist', label: 'Việc của tôi', route: '/viec-cua-toi', icon: 'carry-out', app: 'qlnvkhcn' },
  {
    key: 'nvkhcn',
    app: 'qlnvkhcn',
    label: 'Quản trị KHCN',
    icon: 'experiment',
    children: [
      { key: 'nhiem-vu', label: 'Danh sách NV KHCN', route: '/nhiem-vu' },
      { key: 'ho-so', label: 'Danh sách Hồ sơ KHCN', route: '/ho-so' },
      { key: 'hoi-dong', label: 'Quản lý Hội đồng', route: '/hoi-dong' },
    ],
  },
  { key: 'dashboard', label: 'Tổng quan', route: '/tong-quan', icon: 'dashboard', app: 'quytrinh' },
  {
    key: 'quytrinh-config',
    app: 'quytrinh',
    label: 'Quản trị quy trình',
    icon: 'partition',
    children: [
      { key: 'quy-trinh', label: 'Quản lý quy trình', route: '/quy-trinh' },
      { key: 'luat', label: 'Ma trận quyết định', route: '/quan-ly-luat' },
      { key: 'matran', label: 'Ma trận phê duyệt', route: '/ma-tran-phe-duyet' },
      { key: 'hanhdong', label: 'Ma trận Hành động', route: '/cau-hinh-hanh-dong' },
      { key: 'servicetask', label: 'Tác vụ hệ thống', route: '/cau-hinh-service-task' },
      { key: 'giamsat', label: 'Giám sát tiến trình', route: '/giam-sat' },
      { key: 'tichhop', label: 'Tích hợp', route: '/tich-hop' },
      { key: 'nhatky', label: 'Nhật ký', route: '/nhat-ky' },
    ],
  },
  {
    key: 'hr-nhiem-vu',
    app: 'hrtools',
    label: 'Quản lý nhiệm vụ',
    icon: 'project',
    children: [
      { key: 'hr-danh-muc-nhiem-vu', label: 'Danh mục nhiệm vụ', route: '/hr/nhiem-vu' },
      { key: 'hr-khai-bao-nhiem-vu', label: 'Khai báo nhiệm vụ', route: '/hr/khai-bao-nhiem-vu' },
    ],
  },
  {
    key: 'hr-nhan-su',
    app: 'hrtools',
    label: 'Quản lý nhân sự',
    icon: 'team',
    children: [{ key: 'hr-danh-sach-nhan-su', label: 'Danh sách nhân sự', route: '/hr/nhan-su' }],
  },
  {
    key: 'hr-ky-bang-cong',
    app: 'hrtools',
    label: 'Kỳ & bảng công',
    icon: 'carry-out',
    children: [
      { key: 'hr-ky', label: 'Kỳ chấm công', route: '/hr/ky' },
      { key: 'hr-bang-cong', label: 'Bảng công tháng', route: '/hr/bang-cong-thang' },
      { key: 'hr-bang-luong', label: 'Bảng lương tháng', route: '/hr/bang-luong-thang' },
    ],
  },
  {
    key: 'hr-danh-muc',
    app: 'hrtools',
    label: 'Danh mục',
    icon: 'database',
    children: [
      { key: 'hr-dm-don-vi', label: 'Đơn vị', route: '/hr/danh-muc/don-vi' },
      { key: 'hr-dm-nhan-vien', label: 'Nhân viên', route: '/hr/danh-muc/nhan-vien' },
      { key: 'hr-dm-chuc-danh', label: 'Chức danh', route: '/hr/danh-muc/chuc-danh' },
      { key: 'hr-dm-nguon-kinh-phi', label: 'Nguồn kinh phí', route: '/hr/danh-muc/nguon-kinh-phi' },
      { key: 'hr-dm-loai-cpnc', label: 'Loại chi phí nhân công', route: '/hr/danh-muc/loai-cpnc' },
      { key: 'hr-dm-san-pham', label: 'Sản phẩm', route: '/hr/danh-muc/san-pham' },
      {
        key: 'hr-dm-thu-vien-cong-viec',
        label: 'Thư viện công việc',
        route: '/hr/danh-muc/thu-vien-cong-viec',
      },
      { key: 'hr-dm-nhom-cong-viec', label: 'Nhóm công việc', route: '/hr/danh-muc/nhom-cong-viec' },
      { key: 'hr-dm-ky-hieu-cong', label: 'Ký hiệu công', route: '/hr/danh-muc/ky-hieu-cong' },
      { key: 'hr-dm-nhiem-vu-mau', label: 'Nhiệm vụ mẫu', route: '/hr/danh-muc/nhiem-vu-mau' },
      { key: 'hr-dm-doi-tac', label: 'Đối tác', route: '/hr/danh-muc/doi-tac' },
      {
        key: 'hr-dm-trang-thai-nv',
        label: 'Trạng thái nhiệm vụ',
        route: '/hr/danh-muc/trang-thai-nhiem-vu',
      },
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
  '/hr/nhiem-vu': 'Quản lý nhiệm vụ',
  '/hr/khai-bao-nhiem-vu': 'Quản lý nhiệm vụ',
  '/hr/nhan-su': 'Quản lý nhân sự',
  '/hr/danh-muc': 'Danh mục',
  '/hr/ky': 'Kỳ & bảng công',
  '/hr/bang-cong-thang': 'Kỳ & bảng công',
  '/hr/bang-luong-thang': 'Kỳ & bảng công',
  '/phan-he/PH2/co-cau-to-chuc': 'Quản trị đơn vị',
  '/phan-he/PH2/nguoi-dung': 'Quản trị người dùng',
  '/phan-he/PH2/phan-quyen': 'Phân quyền',
  '/phan-he/PH3/bieu-mau': 'Thư viện biểu mẫu',
};
