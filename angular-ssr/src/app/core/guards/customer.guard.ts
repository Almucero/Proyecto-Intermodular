import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseAuthenticationService } from '../services/impl/base-authentication.service';
import { filter, map, switchMap, take } from 'rxjs';

/**
 * Guard que permite el acceso solo a clientes (usuarios no administradores).
 * Si el usuario es administrador, lo redirige al panel de administración.
 */
export const customerGuard: CanActivateFn = (route, state) => {
  const auth = inject(BaseAuthenticationService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return auth.ready$.pipe(
    filter((ready) => ready),
    take(1),
    switchMap(() => auth.user$),
    take(1),
    map((user) => {
      const isAdmin = !!user?.isAdmin;
      if (isAdmin) {
        router.navigate(['/admin']);
        return false;
      }
      return true;
    }),
  );
};
