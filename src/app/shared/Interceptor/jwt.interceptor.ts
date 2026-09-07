import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from 'src/app/service/login.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const token = loginService.token;

  if (token && loginService.isLogged()) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  return next(req);
};
