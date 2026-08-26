import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { vi_VN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';

import { MessageService } from 'primeng/api';

import { devApiKeyInterceptor } from './core/auth/dev-api-key.interceptor';

registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNzI18n(vi_VN),
    // HR Tools chạy PrimeNG + @khcn-core (D23); ba phân hệ còn lại vẫn ng-zorro. Hai provider cùng
    // sống trong một app là CÓ CHỦ Ý — providePrimeNG chỉ nạp preset theme, không đụng ng-zorro.
    // `MessageService` phải nằm ở injector GỐC, không phải ở providers của route `/hr`.
    // `ToastService` của `@khcn-core/ui` là `providedIn: 'root'`, nên `injector.get(MessageService)`
    // bên trong nó tra ở injector gốc — provider cấp route không với tới. Thiếu chỗ này thì mọi
    // `toast.success(...)` ném `NG0201: No provider found for _MessageService` NGAY SAU khi dữ liệu
    // đã đổi: bản ghi đã lưu nhưng popup không đóng, người dùng tưởng thao tác hỏng và bấm lại.
    // Đo được đúng như vậy 2026-08-27 khi chạy luồng §10.5 (khai báo nhiệm vụ → Lưu).
    MessageService,
    provideHttpClient(withInterceptors([devApiKeyInterceptor])),
  ],
};
