import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';
import { SessionUser } from '../models/user';

export interface AuthApiResponse<T = unknown> {
  data?: T;
  code?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _user = signal<SessionUser | null>(null);
  private readonly _userKey = 'user';
  private readonly _apiUrl = environment.API_URL;

  readonly userSignal = this._user.asReadonly();

  constructor() {
    this.getUserStorage();
  }

  register(userRegister: unknown): Observable<AuthApiResponse> {
    return this._http.post<AuthApiResponse>(
      `${this._apiUrl}auth/register`,
      userRegister,
    );
  }

  login(userLogin: unknown): Observable<AuthApiResponse<SessionUser & { token?: string }>> {
    return this._http.post<AuthApiResponse<SessionUser & { token?: string }>>(
      `${this._apiUrl}auth/login`,
      userLogin,
    );
  }

  clean(): void {
    this.clearUser();
  }

  saveUser(user: SessionUser): void {
    sessionStorage.removeItem(this._userKey);
    sessionStorage.setItem(this._userKey, JSON.stringify(user));
    this._user.set(user);
  }

  clearUser(): void {
    sessionStorage.removeItem(this._userKey);
    this._user.set(null);
  }

  getUserStorage(): SessionUser | null {
    const user = sessionStorage.getItem(this._userKey);
    if (!user) {
      return null;
    }

    try {
      const parsed = JSON.parse(user) as SessionUser;
      this._user.set(parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  getUser(): SessionUser | null {
    return this._user() ?? this.getUserStorage();
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this._userKey);
  }
}
