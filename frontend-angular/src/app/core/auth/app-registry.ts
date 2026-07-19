export type AppCode = 'qlnvkhcn' | 'quytrinh' | 'he-thong';

export interface AppDefinition {
  code: AppCode;
  label: string;
  moTa: string;
  icon: string;
  defaultRoute: string;
}

export const APP_REGISTRY: readonly AppDefinition[] = [
  {
    code: 'qlnvkhcn',
    label: 'Quản lý NV KHCN & Hồ sơ',
    moTa: 'Quản lý nhiệm vụ khoa học công nghệ, hồ sơ và công việc cần xử lý.',
    icon: 'experiment',
    defaultRoute: '/tong-quan',
  },
  {
    code: 'quytrinh',
    label: 'Quản trị quy trình',
    moTa: 'Thiết kế, cấu hình, giám sát quy trình và theo dõi tích hợp.',
    icon: 'partition',
    defaultRoute: '/quy-trinh',
  },
  {
    code: 'he-thong',
    label: 'Quản trị hệ thống',
    moTa: 'Quản trị đơn vị, người dùng, phân quyền và danh mục dùng chung.',
    icon: 'safety',
    defaultRoute: '/phan-he/PH2/co-cau-to-chuc',
  },
] as const;

export const ALL_APP_CODES: readonly AppCode[] = APP_REGISTRY.map((app) => app.code);

export function findApp(code: AppCode | null | undefined): AppDefinition | undefined {
  return code ? APP_REGISTRY.find((app) => app.code === code) : undefined;
}
