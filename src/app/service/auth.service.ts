import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly http = inject(HttpClient);

  private readonly privateUserSignal = signal<any | null>(null);
  readonly userSignal = this.privateUserSignal.asReadonly();

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
    this.clearUser();
  }

  saveUser(user: any): void {
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.privateUserSignal.set(user);
  }

  clearUser(): void {
    sessionStorage.removeItem(this.USER_KEY);
    this.privateUserSignal.set(null);
  }

  getUserStorage() {
    const user = sessionStorage.getItem(this.USER_KEY);
    if (!user) return null;

    const parsed = JSON.parse(user);
    this.privateUserSignal.set(parsed);
    return parsed;
  }

  getUser(): any | null {
    const current = this.privateUserSignal();
    if (current) return current;
    return this.getUserStorage();
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.USER_KEY);
  }
}
