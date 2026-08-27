import { Routes } from '@angular/router';

import { inject, provideEnvironmentInitializer } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { THEMES } from '@khcn-core/theme';

import { KhcnCoreTranslateLoader } from './core/khcn-core-i18n';

/**
 * Route của phân hệ **Quản lý chi phí nhân công (HR Tools)** — tách khỏi `app.routes.ts` để cả cây
 * này nạp lười.
 *
 * Không phải chia file cho gọn: HR Tools là phân hệ **duy nhất** chạy PrimeNG + `@khcn-core` (D23),
 * còn ba phân hệ kia vẫn ng-zorro (D17). Chừng nào `THEMES` còn bị nhắc trong `app.routes.ts` —
 * file luôn nằm trong bundle khởi động — thì ~136 kB preset theme sẽ tính vào initial của cả 4 phân
 * hệ. Đo 2026-08-26: 2,54 MB → 2,68 MB khi khai ở ngoài, trở lại 2,54 MB khi khai ở đây.
 *
 * `authGuard` / `appChildGuard` vẫn nằm ở route cha bên `app.routes.ts` — guard phải chạy TRƯỚC khi
 * tải chunk, đưa vào đây là mất tác dụng fail-closed.
 */
export const HR_ROUTES: Routes = [
  {
    path: '',
    // `data.app` BẮT BUỘC có ở chính route rỗng này, không chỉ ở các màn con.
    // `appChildGuard` gắn trên route cha `hr` bắn cho MỌI hậu duệ, kể cả route rỗng này; guard đọc
    // `route.data['app']` và fail-closed khi thiếu ⇒ bỏ dòng dưới là chặn sạch cả phân hệ, và triệu
    // chứng là "bấm tile HR xong bị đá ngược về /chon-ung-dung" chứ không phải một lỗi dễ đọc.
    // Đã vấp đúng lỗi này khi tách file 2026-08-26; `app.routes.spec.ts` khoá lại bằng test.
    data: { app: 'hrtools' },
    // Shell của HR Tools, dựng trên `CommonLayoutComponent` của `@khcn-core/ui` (D23, giai đoạn 3
    // của `docs/plan/hr-tools-chuyen-sang-khcn-core-2026-08-26.md`). Bản ng-zorro cũ
    // (`layout/hr-shell/`) đã xoá — đừng khôi phục, hai thư viện trong một shell là nguồn xung đột
    // style không đáng có.
    loadComponent: () => import('./layout/hr-layout/hr-layout').then((m) => m.HrLayout),
    // Provider cấp route áp cho toàn bộ cây con ⇒ đủ cho mọi component PrimeNG dưới `/hr`.
    // `darkModeSelector` ghim vào class KHÔNG BAO GIỜ gắn: mặc định PrimeNG là `system`, nghĩa là máy
    // nào bật OS dark mode sẽ thấy HR Tools tối màu trong khi 3 phân hệ ng-zorro vẫn sáng — lệch nhau
    // ngay trong một app. Bản đã build của khách chạy sáng.
    providers: [
      // ⚠ KHÔNG dùng `providePrimeNG(...)` ở đây. Nó gói cấu hình vào `provideAppInitializer`, mà
      // app initializer chỉ chạy khi ứng dụng khởi động — provider của route nạp lười thì **không
      // bao giờ chạy**. Hậu quả im lặng: CSS từng component vẫn được chèn (BaseComponent tự nạp khi
      // dùng), nhưng bộ biến `--p-*` (primitive/semantic) thì không, nên `.p-button` ra nền trong
      // suốt, `p-select` mất khung, `p-card` mất nền — nhìn như "chưa có theme" mà console sạch
      // trơn. Đo 2026-08-27 khi soi màn theo §10.4: mọi biến `--p-*` đều rỗng.
      //
      // `PrimeNG` là service `providedIn: 'root'`, `theme` của nó là signal có effect theo dõi ⇒
      // đặt cấu hình lúc vào phân hệ vẫn nạp theme đúng, và `THEMES` vẫn nằm trong chunk lười.
      provideEnvironmentInitializer(() =>
        inject(PrimeNG).setThemeConfig({
          theme: { preset: THEMES, options: { darkModeSelector: '.vht-dark-chua-dung' } },
        }),
      ),
      // `MessageService` KHÔNG khai ở đây — xem `app.config.ts`. Khai ở cấp route không có tác dụng:
      // `ToastService` là `providedIn: 'root'` nên tra provider ở injector gốc, và lỗi chỉ lộ ra khi
      // có thông báo đầu tiên (giữa luồng nghiệp vụ), không phải lúc vào phân hệ.
      // Bắt buộc: thư viện dùng pipe `| translate` ở 61 chỗ (phân trang, nhập file, upload). Không
      // có từ điển thì chân bảng hiện đúng chữ `PAGINATOR.SHOW`. Xem `core/khcn-core-i18n.ts`.
      provideTranslateService({ lang: 'vi', fallbackLang: 'vi' }),
      provideTranslateLoader(KhcnCoreTranslateLoader),
    ],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'nhiem-vu' },
      {
        path: 'nhiem-vu',
        loadComponent: () =>
          import('./pages/hr-nhiem-vu-list/hr-nhiem-vu-list').then((m) => m.HrNhiemVuListPage),
        data: { title: 'Danh mục nhiệm vụ', app: 'hrtools' },
      },
      {
        path: 'nhiem-vu/:ma',
        loadComponent: () =>
          import('./pages/hr-nhiem-vu-detail/hr-nhiem-vu-detail').then(
            (m) => m.HrNhiemVuDetailPage,
          ),
        data: { title: 'Chi tiết nhiệm vụ', app: 'hrtools' },
      },
      {
        path: 'khai-bao-nhiem-vu',
        loadComponent: () =>
          import('./pages/hr-khai-bao-list/hr-khai-bao-list').then((m) => m.HrKhaiBaoListPage),
        data: { title: 'Khai báo nhiệm vụ', app: 'hrtools' },
      },
      /*
       * Kỳ, bảng công, bảng lương — đợt 2. Ba màn đọc chung `KyService`: kỳ là thứ khoá cả ba,
       * xem `core/services/hr/ky.service.ts`.
       */
      {
        path: 'ky',
        loadComponent: () => import('./pages/hr-ky-list/hr-ky-list').then((m) => m.HrKyListPage),
        data: { title: 'Kỳ chấm công', app: 'hrtools' },
      },
      {
        path: 'bang-cong-thang',
        loadComponent: () =>
          import('./pages/hr-bang-cong/hr-bang-cong').then((m) => m.HrBangCongPage),
        data: { title: 'Bảng công tháng', app: 'hrtools' },
      },
      {
        path: 'bang-luong-thang',
        loadComponent: () =>
          import('./pages/hr-bang-luong/hr-bang-luong').then((m) => m.HrBangLuongPage),
        data: { title: 'Bảng lương tháng', app: 'hrtools' },
      },
      /*
       * Danh mục — đợt 1.5. `don-vi` khai TRƯỚC `:loai` vì route so khớp theo thứ tự: để sau thì
       * `:loai` nuốt luôn chuỗi `don-vi` và cây đơn vị không bao giờ mở được.
       */
      {
        path: 'danh-muc/don-vi',
        loadComponent: () => import('./pages/hr-don-vi/hr-don-vi').then((m) => m.HrDonViPage),
        data: { title: 'Danh mục Đơn vị', app: 'hrtools' },
      },
      {
        path: 'danh-muc/:loai',
        loadComponent: () =>
          import('./pages/hr-danh-muc-list/hr-danh-muc-list').then((m) => m.HrDanhMucListPage),
        data: { title: 'Danh mục', app: 'hrtools' },
      },
      {
        path: 'danh-muc/:loai/:ma',
        loadComponent: () =>
          import('./pages/hr-danh-muc-detail/hr-danh-muc-detail').then((m) => m.HrDanhMucDetailPage),
        data: { title: 'Chi tiết danh mục', app: 'hrtools' },
      },
      {
        path: 'nhan-su',
        loadComponent: () =>
          import('./pages/hr-nhan-su-list/hr-nhan-su-list').then((m) => m.HrNhanSuListPage),
        data: { title: 'Danh sách nhân sự', app: 'hrtools' },
      },
      {
        path: 'nhan-su/moi',
        loadComponent: () =>
          import('./pages/hr-nhan-su-form/hr-nhan-su-form').then((m) => m.HrNhanSuFormPage),
        data: { title: 'Thêm nhân sự vào nhiệm vụ', app: 'hrtools' },
      },
      {
        path: 'nhan-su/:id/sua',
        loadComponent: () =>
          import('./pages/hr-nhan-su-form/hr-nhan-su-form').then((m) => m.HrNhanSuFormPage),
        data: { title: 'Sửa phân công nhân sự', app: 'hrtools' },
      },
    ],
  },
];
