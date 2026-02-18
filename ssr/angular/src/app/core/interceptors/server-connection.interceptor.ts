import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';

export const serverConnectionInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 0 || error.status >= 500) {
          console.warn(
            `Connection attempt failed (${error.status}). Retrying... (Attempt #${retryCount})`,
          );
          return timer(2000);
        }
        return throwError(() => error);
      },
    }),
  );
};
