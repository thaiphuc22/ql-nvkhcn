import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { AppCode } from './app-registry';
import { AuthService } from './auth.service';

/**
 * Gate UX phía client cho entitlement demo. Đây không phải ranh giới bảo mật và không
 * thay thế authorization backend khi IAM/SSO thật được triển khai.
 */
export const appGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredApp = route.data['app'] as AppCode | undefined;

  if (
    requiredApp &&
    auth.entitledApps().includes(requiredApp) &&
    auth.activeApp() === requiredApp
  ) {
    return true;
  }

  return router.createUrlTree(['/chon-ung-dung'], { queryParams: { returnUrl: state.url } });
};

export const appChildGuard: CanActivateChildFn = appGuard;
