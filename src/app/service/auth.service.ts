import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly http = inject(HttpClient);

  private privateUserSignal = signal<any | null>(null);
  userSignal = this.privateUserSignal.asReadonly();

  auhtState$: Observable<any>;
  USER_KEY = 'user';
  API_URL = environment.API_URL;

  constructor() {
    this.getUserStorage();
  }

  register(userRegister): Observable<any> {
    const url = this.API_URL + `auth/register`;
    return this.http.post<any>(url, userRegister);
  }

  login(userLogin): Observable<any> {
    const url = this.API_URL + `auth/login`;
    return this.http.post<any>(url, userLogin);
  }

  clean(): void {
    sessionStorage.removeItem(this.USER_KEY);
  }

  saveUser(user: any): void {
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUserStorage() {
    const user = sessionStorage.getItem(this.USER_KEY);
    if (!user) return null;

    const parsed = JSON.parse(user);
    this.privateUserSignal.set(parsed);
  }

  isLoggedIn(): boolean {
    const user = sessionStorage.getItem(this.USER_KEY);
    if (user) {
      return true;
    }
    return false;
  }
}
