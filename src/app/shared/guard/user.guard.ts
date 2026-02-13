import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from 'src/app/service/login.service';

export const userGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const loginService = inject(LoginService);

  if (!loginService.isLogged()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};