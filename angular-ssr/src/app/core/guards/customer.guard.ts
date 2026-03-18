import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { BaseAuthenticationService } from '../services/impl/base-authentication.service';
import { filter, map, switchMap, take } from 'rxjs';

/**
 * Guard que permite el acceso solo a clientes (usuarios no administradores).
 * Si el usuario es administrador, lo redirige al panel de administración.
 */
export const customerGuard: CanActivateFn = (route, state) => {
  const auth = inject(BaseAuthenticationService);
  const router = inject(Router);

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
