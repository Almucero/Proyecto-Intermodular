import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';

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
