/**
 * @file: src/app/core/guards/admin.guard.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Guard que protege rutas de administrador, asegurando que el usuario esté autenticado y tenga rol de admin.
 */

import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseAuthenticationService } from '../services/impl/base-authentication.service';
import { filter, map, switchMap, take } from 'rxjs';

/**
 * Guard que permite el acceso solo a usuarios con rol de administrador.
 * Si el usuario no es administrador, lo redirige al dashboard.
 */
export const adminGuard: CanActivateFn = (route, state) => {
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
      if (!isAdmin) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }),
  );
};
