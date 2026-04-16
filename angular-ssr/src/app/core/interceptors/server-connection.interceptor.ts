import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, timer, throwError } from 'rxjs';

let connectionCooldownUntil = 0;

/**
 * Interceptor que gestiona los reintentos de conexión con el servidor.
 * En caso de errores de conexión (status 0) o errores del servidor (>= 500),
 * reintenta la petición un número limitado de veces usando backoff progresivo.
 */
export const serverConnectionInterceptor: HttpInterceptorFn = (req, next) => {
  const MAX_RETRIES = 5;
  const BASE_DELAY_MS = 1000;
  const MAX_DELAY_MS = 8000;
  const COOLDOWN_MS = 15000;
  const isIdempotent = req.method === 'GET' || req.method === 'HEAD';
  const now = Date.now();

  if (isIdempotent && now < connectionCooldownUntil) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 0,
          statusText: 'Server temporarily unavailable',
          url: req.urlWithParams,
          error: 'SERVER_CONNECTION_COOLDOWN',
        }),
    );
  }

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 0 || error.status >= 500) {
          const retryDelayMs = Math.min(
            BASE_DELAY_MS * 2 ** (retryCount - 1),
            MAX_DELAY_MS,
          );
          return timer(retryDelayMs);
        }
        return throwError(() => error);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const isTransient = error.status === 0 || error.status >= 500;
      if (isIdempotent && isTransient) {
        connectionCooldownUntil = Date.now() + COOLDOWN_MS;
      }
      return throwError(() => error);
    }),
  );
};
