import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { LoginPage } from './pages/login/login';
import { HoSoListPage } from './pages/ho-so-list/ho-so-list';
import { ProcessCatalogPage } from './pages/process-catalog/process-catalog';
import { ProcessDetailPage } from './pages/process-detail/process-detail';
import { BpmnTestSessionPage } from './pages/bpmn-test-session/bpmn-test-session';
import { BusinessRuleListPage } from './pages/business-rule-list/business-rule-list';
import { BusinessRuleDetailPage } from './pages/business-rule-detail/business-rule-detail';
import { authGuard, loginPageGuard } from './core/auth/auth.guard';
import { appChildGuard } from './core/auth/app.guard';
import { AppListPage } from './pages/app-list/app-list';

export const routes: Routes = [
  { path: 'dang-nhap', component: LoginPage, canActivate: [loginPageGuard] },
  { path: 'chon-ung-dung', component: AppListPage, canActivate: [authGuard] },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    canActivateChild: [appChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/chon-ung-dung' },
      {
        path: 'tong-quan',
        loadComponent: () => import('./pages/tong-quan/tong-quan').then((module) => module.TongQuanPage),
        data: { title: 'Tổng quan', app: 'quytrinh' },
      },
      {
        path: 'viec-cua-toi',
        loadComponent: () => import('./pages/worklist/worklist').then((module) => module.WorklistPage),
        data: { title: 'Việc của tôi', app: 'qlnvkhcn' },
      },
      {
        path: 'nhiem-vu',
        loadComponent: () => import('./pages/nhiem-vu-list/nhiem-vu-list').then((module) => module.NhiemVuListPage),
        data: { title: 'Danh sách NV KHCN', app: 'qlnvkhcn' },
      },
      {
        path: 'nhiem-vu/moi',
        loadComponent: () => import('./pages/nhiem-vu-create/nhiem-vu-create').then((module) => module.NhiemVuCreatePage),
        data: { title: 'Tạo Nhiệm vụ KHCN', app: 'qlnvkhcn' },
      },
      {
        path: 'nhiem-vu/:ma',
        loadComponent: () => import('./pages/nhiem-vu-detail/nhiem-vu-detail').then((module) => module.NhiemVuDetailPage),
        data: { title: 'Chi tiết Nhiệm vụ KHCN', app: 'qlnvkhcn' },
      },
      { path: 'ho-so', component: HoSoListPage, data: { title: 'Danh sách Hồ sơ KHCN', app: 'qlnvkhcn' } },
      {
        path: 'hoi-dong',
        loadComponent: () => import('./pages/hoi-dong-list/hoi-dong-list').then((module) => module.HoiDongListPage),
        data: { title: 'Quản lý Hội đồng', app: 'qlnvkhcn' },
      },
      {
        path: 'hoi-dong/moi',
        loadComponent: () => import('./pages/hoi-dong-form/hoi-dong-form').then((module) => module.HoiDongFormPage),
        data: { title: 'Tạo mới Hội đồng', app: 'qlnvkhcn' },
      },
      {
        path: 'hoi-dong/:id/sua',
        loadComponent: () => import('./pages/hoi-dong-form/hoi-dong-form').then((module) => module.HoiDongFormPage),
        data: { title: 'Sửa Hội đồng', app: 'qlnvkhcn' },
      },
      {
        path: 'ho-so/tao-moi',
        loadComponent: () => import('./pages/ho-so-create/ho-so-create').then((module) => module.HoSoCreatePage),
        data: { title: 'Tạo mới Hồ sơ', app: 'qlnvkhcn' },
      },
      {
        path: 'ho-so/:id',
        loadComponent: () => import('./pages/ho-so-detail/ho-so-detail').then((module) => module.HoSoDetailPage),
        data: { title: 'Chi tiết Hồ sơ', app: 'qlnvkhcn' },
      },
      { path: 'quy-trinh', component: ProcessCatalogPage, data: { title: 'Quản lý quy trình', app: 'quytrinh' } },
      {
        path: 'quy-trinh/ve',
        loadComponent: () => import('./pages/bpmn-editor/bpmn-editor').then((module) => module.BpmnEditorPage),
        data: { title: 'Tạo & vẽ BPMN', app: 'quytrinh' },
      },
      {
        path: 'quy-trinh/nhap/:draftId/ve',
        loadComponent: () => import('./pages/bpmn-editor/bpmn-editor').then((module) => module.BpmnEditorPage),
        data: { title: 'Vẽ / sửa BPMN', app: 'quytrinh' },
      },
      {
        path: 'quy-trinh/:id',
        component: ProcessDetailPage,
        data: { title: 'Chi tiết quy trình', app: 'quytrinh' },
      },
      {
        path: 'quy-trinh/nhap/:draftId/chay-thu',
        component: BpmnTestSessionPage,
        data: { title: 'Chạy thử BPMN', app: 'quytrinh' },
      },
      {
        path: 'quan-ly-luat',
        component: BusinessRuleListPage,
        data: { title: 'Ma trận quyết định', app: 'quytrinh' },
      },
      {
        path: 'quan-ly-luat/:id',
        component: BusinessRuleDetailPage,
        data: { title: 'Chi tiết luật', app: 'quytrinh' },
      },
      {
        path: 'ma-tran-phe-duyet',
        loadComponent: () =>
          import('./pages/approval-matrix/approval-matrix').then((module) => module.ApprovalMatrixPage),
        data: { title: 'Ma trận phê duyệt', app: 'quytrinh' },
      },
      {
        path: 'cau-hinh-hanh-dong',
        loadComponent: () =>
          import('./pages/action-studio/action-studio').then((module) => module.ActionStudioPage),
        data: { title: 'Ma trận Hành động', app: 'quytrinh' },
      },
      {
        path: 'cau-hinh-service-task',
        loadComponent: () =>
          import('./pages/service-task-config/service-task-config').then((module) => module.ServiceTaskConfigPage),
        data: { title: 'Tác vụ hệ thống', app: 'quytrinh' },
      },
      {
        path: 'giam-sat',
        loadComponent: () =>
          import('./pages/process-monitor/process-monitor').then((module) => module.ProcessMonitorPage),
        data: { title: 'Giám sát tiến trình', app: 'quytrinh' },
      },
      {
        path: 'tich-hop',
        loadComponent: () =>
          import('./pages/integration-status/integration-status').then((module) => module.IntegrationStatusPage),
        data: { title: 'Tích hợp', app: 'quytrinh' },
      },
      {
        path: 'nhat-ky',
        loadComponent: () => import('./pages/nhat-ky/nhat-ky').then((module) => module.NhatKyPage),
        data: { title: 'Nhật ký', app: 'quytrinh' },
      },
      {
        path: 'phan-he/PH2/co-cau-to-chuc',
        loadComponent: () => import('./pages/org-management/org-management').then((module) => module.OrgManagementPage),
        data: { title: 'Quản trị đơn vị', app: 'he-thong' },
      },
      {
        path: 'phan-he/PH2/nguoi-dung',
        loadComponent: () =>
          import('./pages/user-management/user-management').then((module) => module.UserManagementPage),
        data: { title: 'Quản trị người dùng', app: 'he-thong' },
      },
      {
        path: 'phan-he/PH2/phan-quyen',
        loadComponent: () =>
          import('./pages/role-permission/role-permission').then((module) => module.RolePermissionPage),
        data: { title: 'Phân quyền', app: 'he-thong' },
      },
      {
        path: 'phan-he/PH3/bieu-mau',
        loadComponent: () => import('./pages/form-library/form-library').then((module) => module.FormLibraryPage),
        data: { title: 'Thư viện biểu mẫu', app: 'he-thong' },
      },
      {
        path: 'phan-he/PH3/bieu-mau/:key/thiet-ke',
        loadComponent: () =>
          import('./pages/form-designer-page/form-designer-page').then((module) => module.FormDesignerPage),
        data: { title: 'Thiết kế biểu mẫu', app: 'he-thong' },
      },
    ],
  },
  { path: '**', redirectTo: '/chon-ung-dung' },
];
