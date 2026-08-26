import { Route } from '@angular/router';

import { ALL_APP_CODES } from './core/auth/app-registry';
import { routes } from './app.routes';

/**
 * Phân hệ HR Tools dùng shell riêng (`HrShell` ở `path: 'hr'`), nên không còn đúng một khối shell
 * để soi. Bài test đi qua MỌI route có `children` và đối chiếu với `ALL_APP_CODES` thay vì danh
 * sách 3 mã chép tay — thêm phân hệ thứ năm sau này sẽ không phải sửa file này nữa.
 */
function featureRoutes(): Route[] {
  return routes
    .filter((route) => route.children?.length)
    .flatMap((route) => route.children ?? [])
    .filter((child) => !child.redirectTo);
}

describe('application route app metadata', () => {
  it('assigns every shell feature route to one of the registered apps', () => {
    const features = featureRoutes();

    expect(features.length).toBeGreaterThan(0);
    for (const route of features) {
      expect(ALL_APP_CODES as readonly string[]).toContain(route.data?.['app'] as string);
    }
  });

  it('puts every HR Tools screen behind the hrtools entitlement', () => {
    const hr = routes.find((route) => route.path === 'hr');
    const children = (hr?.children ?? []).filter((child) => !child.redirectTo);

    expect(children.length).toBe(6);
    for (const route of children) {
      expect(route.data?.['app']).toBe('hrtools');
    }
  });
});
