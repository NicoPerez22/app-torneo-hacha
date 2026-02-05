import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, finalize } from 'rxjs';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private spinner: NgxSpinnerService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Permite opt-out puntual si alguna request lo requiere.
    if (request.headers.has('X-Skip-Spinner')) {
      const reqWithoutHeader = request.clone({
        headers: request.headers.delete('X-Skip-Spinner'),
      });
      return next.handle(reqWithoutHeader);
    }

    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.spinner.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        this.activeRequests = Math.max(this.activeRequests - 1, 0);
        if (this.activeRequests === 0) {
          this.spinner.hide();
        }
      }),
    );
  }
}

