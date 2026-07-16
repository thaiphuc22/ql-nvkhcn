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
      { path: 'nhiem-vu', component: PlaceholderPage, data: { title: 'Danh sách NV KHCN' } },
      { path: 'ho-so', component: HoSoListPage, data: { title: 'Danh sách Hồ sơ KHCN' } },
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
        component: PlaceholderPage,
        data: { title: 'Ma trận phê duyệt' },
      },
      {
        path: 'cau-hinh-hanh-dong',
        component: PlaceholderPage,
        data: { title: 'Ma trận Hành động' },
      },
      {
        path: 'cau-hinh-service-task',
        component: PlaceholderPage,
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
        component: PlaceholderPage,
        data: { title: 'Thư viện biểu mẫu' },
      },
    ],
  },
  { path: '**', redirectTo: '/tong-quan' },
];
