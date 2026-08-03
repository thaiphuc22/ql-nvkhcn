import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { appGuard } from './app.guard';
import { AuthService } from './auth.service';

describe('appGuard', () => {
  const router = { createUrlTree: vi.fn(() => ({ redirected: true }) as unknown as UrlTree) };
  const auth = {
    entitledApps: vi.fn(() => ['qlnvkhcn']),
    activeApp: vi.fn(() => 'qlnvkhcn'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  function run(app?: string) {
    const route = { data: app ? { app } : {} } as ActivatedRouteSnapshot;
    const state = { url: '/quy-trinh' } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => appGuard(route, state));
  }

  it('allows a route only when entitlement and active app both match', () => {
    expect(run('qlnvkhcn')).toBe(true);
  });

  it('redirects when the active app does not match', () => {
    auth.activeApp.mockReturnValueOnce('quytrinh');
    expect(run('qlnvkhcn')).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/chon-ung-dung'], {
      queryParams: { returnUrl: '/quy-trinh' },
    });
  });

  it('fails closed when route metadata is absent or entitlement is missing', () => {
    expect(run()).not.toBe(true);
    auth.entitledApps.mockReturnValueOnce([]);
    expect(run('qlnvkhcn')).not.toBe(true);
  });
});
