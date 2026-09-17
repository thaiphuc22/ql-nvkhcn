import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';

import { AuthService } from './auth.service';

/**
 * Gate UX theo mã quyền màn hình (`route.data.permission`). Không thay authorization backend.
 * Chờ `rolesLoaded` để tránh đá user ra khi identity-service chưa trả effective-permissions.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data['permission'] as string | undefined;
  if (!required) return true;

  const decide = () => (auth.hasPermission(required) ? true : router.createUrlTree(['/chon-ung-dung']));

  if (auth.rolesLoaded() || auth.identityUnavailable()) return decide();
  return toObservable(auth.rolesLoaded).pipe(
    filter((loaded) => loaded),
    take(1),
    map(() => decide()),
  );
};

export const permissionChildGuard: CanActivateChildFn = permissionGuard;
