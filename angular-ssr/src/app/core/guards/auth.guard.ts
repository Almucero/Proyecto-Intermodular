import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseAuthenticationService } from '../services/impl/base-authentication.service';
import { filter, map, switchMap, take } from 'rxjs';

/**
 * Guard que permite el acceso solo a usuarios autenticados.
 * Si el usuario no está autenticado, lo redirige a la página de login
 * guardando la URL de destino original para volver tras el inicio de sesión.
 */
export const authGuard: CanActivateFn = (route, state) => {
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
      const authenticated = !!user;
      if (!authenticated) {
        router.navigate(['/login'], { state: { navigateTo: state.url } });
      }
      return authenticated;
    }),
  );
};
