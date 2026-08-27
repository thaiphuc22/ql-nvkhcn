import { Route } from '@angular/router';

import { ALL_APP_CODES } from './core/auth/app-registry';
import { routes } from './app.routes';
import { HR_ROUTES } from './hr.routes';

/**
 * Phân hệ HR Tools dùng shell riêng và **nạp lười cả cây route** (`loadChildren` → `hr.routes.ts`,
 * xem ghi chú ở đó), nên không còn đúng một khối shell để soi, và cũng không đọc được màn HR từ
 * mảng `routes` tĩnh nữa. Bài test đi qua MỌI route có `children` ở cả hai file, đối chiếu với
 * `ALL_APP_CODES` thay vì danh sách mã chép tay — thêm phân hệ thứ năm sau này sẽ không phải sửa
 * file này nữa.
 */
function featureRoutes(source: readonly Route[]): Route[] {
  return source
    .filter((route) => route.children?.length)
    .flatMap((route) => route.children ?? [])
    .filter((child) => !child.redirectTo);
}

describe('application route app metadata', () => {
  it('assigns every shell feature route to one of the registered apps', () => {
    const features = [...featureRoutes(routes), ...featureRoutes(HR_ROUTES)];

    expect(features.length).toBeGreaterThan(0);
    for (const route of features) {
      expect(ALL_APP_CODES as readonly string[]).toContain(route.data?.['app'] as string);
    }
  });

  it('puts every HR Tools screen behind the hrtools entitlement', () => {
    const children = featureRoutes(HR_ROUTES);

    // Con số là CHỐT CHẶN, không phải dữ kiện: thêm màn mới thì test đỏ, buộc người thêm phải
    // nhìn lại `data.app` của chính route vừa viết. 6 → 9 (3 màn danh mục, đợt 1.5) → 12 (kỳ,
    // bảng công, bảng lương — đợt 2).
    expect(children.length).toBe(12);
    for (const route of children) {
      expect(route.data?.['app']).toBe('hrtools');
    }
  });

  /**
   * `appChildGuard` bắn cho MỌI hậu duệ của route `hr`, mà hậu duệ đầu tiên là route rỗng bọc shell
   * trong `HR_ROUTES` — không phải màn nào cả. Guard đọc `route.data['app']` và fail-closed khi
   * thiếu, nên route rỗng đó thiếu `data.app` là **chặn sạch cả phân hệ**. Đã vấp đúng lỗi này khi
   * tách `hr.routes.ts` ngày 2026-08-26, và triệu chứng của nó (bấm tile xong bị đá về
   * `/chon-ung-dung`) trông y hệt lỗi phân quyền, nên khoá lại bằng test.
   */
  it('marks the HR_ROUTES shell route itself with the hrtools app so the child guard can read it', () => {
    const shell = HR_ROUTES.find((route) => route.path === '');

    expect(shell?.data?.['app']).toBe('hrtools');
  });

  /**
   * Guard phải nằm ở route CHA trong `app.routes.ts`, không phải trong `hr.routes.ts`: `canActivate`
   * / `canActivateChild` của cha chạy **trước khi tải chunk**, còn guard đặt bên trong file nạp lười
   * thì chunk đã tải xong mới chạy — mất tác dụng fail-closed. Khoá lại bằng test vì đây đúng là thứ
   * dễ bị "dọn cho gọn" trong một lần refactor sau này.
   */
  it('keeps the hrtools guards on the parent route so they run before the lazy chunk loads', () => {
    const hr = routes.find((route) => route.path === 'hr');

    expect(hr?.loadChildren).toBeDefined();
    expect(hr?.canActivate?.length).toBeGreaterThan(0);
    expect(hr?.canActivateChild?.length).toBeGreaterThan(0);
    // Không được có `children` tĩnh song song với `loadChildren` — Angular sẽ bỏ qua `loadChildren`.
    expect(hr?.children).toBeUndefined();
  });
});
