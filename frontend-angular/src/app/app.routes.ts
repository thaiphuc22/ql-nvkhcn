import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { LoginPage } from './pages/login/login';
import { PlaceholderPage } from './pages/placeholder/placeholder';
import { HoSoListPage } from './pages/ho-so-list/ho-so-list';
import { ProcessCatalogPage } from './pages/process-catalog/process-catalog';
import { ProcessDetailPage } from './pages/process-detail/process-detail';
import { BpmnTestSessionPage } from './pages/bpmn-test-session/bpmn-test-session';
import { BusinessRuleListPage } from './pages/business-rule-list/business-rule-list';
import { BusinessRuleDetailPage } from './pages/business-rule-detail/business-rule-detail';
import { authGuard, loginPageGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'dang-nhap', component: LoginPage, canActivate: [loginPageGuard] },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tong-quan' },
      { path: 'tong-quan', component: PlaceholderPage, data: { title: 'Tổng quan' } },
      { path: 'viec-cua-toi', component: PlaceholderPage, data: { title: 'Việc của tôi' } },
      {
        path: 'nhiem-vu',
        loadComponent: () => import('./pages/nhiem-vu-list/nhiem-vu-list').then((module) => module.NhiemVuListPage),
        data: { title: 'Danh sách NV KHCN' },
      },
      {
        path: 'nhiem-vu/moi',
        loadComponent: () => import('./pages/nhiem-vu-create/nhiem-vu-create').then((module) => module.NhiemVuCreatePage),
        data: { title: 'Tạo Nhiệm vụ KHCN' },
      },
      {
        path: 'nhiem-vu/:ma',
        loadComponent: () => import('./pages/nhiem-vu-detail/nhiem-vu-detail').then((module) => module.NhiemVuDetailPage),
        data: { title: 'Chi tiết Nhiệm vụ KHCN' },
      },
      { path: 'ho-so', component: HoSoListPage, data: { title: 'Danh sách Hồ sơ KHCN' } },
      {
        path: 'ho-so/tao-moi',
        loadComponent: () => import('./pages/ho-so-create/ho-so-create').then((module) => module.HoSoCreatePage),
        data: { title: 'Tạo mới Hồ sơ' },
      },
      {
        path: 'ho-so/:id',
        loadComponent: () => import('./pages/ho-so-detail/ho-so-detail').then((module) => module.HoSoDetailPage),
        data: { title: 'Chi tiết Hồ sơ' },
      },
      { path: 'quy-trinh', component: ProcessCatalogPage, data: { title: 'Quản lý quy trình' } },
      {
        path: 'quy-trinh/ve',
        loadComponent: () => import('./pages/bpmn-editor/bpmn-editor').then((module) => module.BpmnEditorPage),
        data: { title: 'Tạo & vẽ BPMN' },
      },
      {
        path: 'quy-trinh/nhap/:draftId/ve',
        loadComponent: () => import('./pages/bpmn-editor/bpmn-editor').then((module) => module.BpmnEditorPage),
        data: { title: 'Vẽ / sửa BPMN' },
      },
      {
        path: 'quy-trinh/:id',
        component: ProcessDetailPage,
        data: { title: 'Chi tiết quy trình' },
      },
      {
        path: 'quy-trinh/nhap/:draftId/chay-thu',
        component: BpmnTestSessionPage,
        data: { title: 'Chạy thử BPMN' },
      },
      {
        path: 'quan-ly-luat',
        component: BusinessRuleListPage,
        data: { title: 'Ma trận quyết định' },
      },
      {
        path: 'quan-ly-luat/:id',
        component: BusinessRuleDetailPage,
        data: { title: 'Chi tiết luật' },
      },
      {
        path: 'ma-tran-phe-duyet',
        loadComponent: () =>
          import('./pages/approval-matrix/approval-matrix').then((module) => module.ApprovalMatrixPage),
        data: { title: 'Ma trận phê duyệt' },
      },
      {
        path: 'cau-hinh-hanh-dong',
        loadComponent: () =>
          import('./pages/action-studio/action-studio').then((module) => module.ActionStudioPage),
        data: { title: 'Ma trận Hành động' },
      },
      {
        path: 'cau-hinh-service-task',
        loadComponent: () =>
          import('./pages/service-task-config/service-task-config').then((module) => module.ServiceTaskConfigPage),
        data: { title: 'Tác vụ hệ thống' },
      },
      { path: 'giam-sat', component: PlaceholderPage, data: { title: 'Giám sát tiến trình' } },
      { path: 'tich-hop', component: PlaceholderPage, data: { title: 'Tích hợp' } },
      { path: 'nhat-ky', component: PlaceholderPage, data: { title: 'Nhật ký' } },
      {
        path: 'phan-he/PH2/co-cau-to-chuc',
        component: PlaceholderPage,
        data: { title: 'Quản trị đơn vị' },
      },
      {
        path: 'phan-he/PH2/nguoi-dung',
        component: PlaceholderPage,
        data: { title: 'Quản trị người dùng' },
      },
      { path: 'phan-he/PH2/phan-quyen', component: PlaceholderPage, data: { title: 'Phân quyền' } },
      {
        path: 'phan-he/PH3/bieu-mau',
        loadComponent: () => import('./pages/form-library/form-library').then((module) => module.FormLibraryPage),
        data: { title: 'Thư viện biểu mẫu' },
      },
      {
        path: 'phan-he/PH3/bieu-mau/:key/thiet-ke',
        loadComponent: () =>
          import('./pages/form-designer-page/form-designer-page').then((module) => module.FormDesignerPage),
        data: { title: 'Thiết kế biểu mẫu' },
      },
    ],
  },
  { path: '**', redirectTo: '/tong-quan' },
];
