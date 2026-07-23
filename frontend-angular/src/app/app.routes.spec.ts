import { Route } from '@angular/router';

import { routes } from './app.routes';

describe('application route app metadata', () => {
  it('assigns every shell feature route to one of the three registered apps', () => {
    const shell = routes.find((route) => route.path === '' && route.children);
    const featureRoutes = (shell?.children ?? []).filter((route) => !route.redirectTo);

    expect(featureRoutes.length).toBeGreaterThan(0);
    for (const route of featureRoutes) {
      expect(['qlnvkhcn', 'quytrinh', 'he-thong']).toContain((route as Route).data?.['app']);
    }
  });
});
