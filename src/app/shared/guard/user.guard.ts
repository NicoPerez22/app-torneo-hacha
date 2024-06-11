import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserGuard  {

  constructor(
    private cookieService: CookieService,
    private router: Router
  )
  {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const cookie = sessionStorage.getItem('token')
    if(!cookie){
      this.router.navigate(['/auth/login'])
      return false;
    } else{
      return true;
    }
  }
  
}
