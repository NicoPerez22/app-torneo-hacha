import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService);

  if (req.headers.has('X-Skip-Spinner')) {
    return next(
      req.clone({
        headers: req.headers.delete('X-Skip-Spinner'),
      }),
    );
  }

  activeRequests++;
  if (activeRequests === 1) {
    spinner.show();
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests = Math.max(activeRequests - 1, 0);
      if (activeRequests === 0) {
        spinner.hide();
      }
    }),
  );
};
