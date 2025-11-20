import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AUTH_SERVICE } from '../services/auth.token';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AUTH_SERVICE);
  const router = inject(Router);
  const authenticated = auth.user() != null;
  if (!authenticated)
    router.navigate(['/login'], { state: { navigateTo: state.url } });
  return authenticated;
};
