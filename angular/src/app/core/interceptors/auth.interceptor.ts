import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseAuthenticationService } from '../services/impl/base-authentication.service';

export const authInterceptorFn: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(BaseAuthenticationService);

  // Get token from storage
  const token =
    localStorage.getItem('AUTH_TOKEN') || sessionStorage.getItem('AUTH_TOKEN');

  console.log('🔍 AuthInterceptor - Token found:', token ? 'YES ✅' : 'NO ❌');
  console.log('🌐 Request URL:', req.url);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('✨ Token added to request');
  } else {
    console.log('⚠️ No token available for request');
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('🚫 401 Unauthorized - signing out');
        authService.signOut();
      }
      return throwError(() => error);
    })
  );
};
