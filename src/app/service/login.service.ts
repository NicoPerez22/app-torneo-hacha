// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private userSubject = new BehaviorSubject<any | null>(this.user);
  user$ = this.userSubject.asObservable();

  constructor(private router: Router) {}

  login(user, token: string) {
    sessionStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);

    this.router.navigate(['/auth/login']);
  }

  isLogged(): boolean {
    return !!sessionStorage.getItem('token');
  }

  get user(){
    const u = JSON.parse(localStorage.getItem('user'));
    return u ? u : null;
  }
}
