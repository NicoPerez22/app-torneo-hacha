import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserGuard {
  constructor(private router: Router) {}

  canActivate() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    } else {
      return true;
    }

    // const expectedRoles = route.data['roles'] as string[];
    // if (this.auth.isAuthorized(expectedRoles)) {
    //   return true;
    // }
    // this.router.navigate(['/unauthorized']);
    // return false;
  }
}
