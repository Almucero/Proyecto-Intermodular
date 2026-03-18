import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';

/**
 * Interceptor que gestiona los reintentos de conexión con el servidor.
 * En caso de errores de conexión (status 0) o errores del servidor (>= 500),
 * reintenta la petición tras una espera de 2 segundos.
 */
export const serverConnectionInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      delay: (error: HttpErrorResponse) => {
        if (error.status === 0 || error.status >= 500) {
          return timer(2000);
        }
        return throwError(() => error);
      },
    }),
  );
};
