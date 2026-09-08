import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionUser } from '../models/user';

interface JwtPayload {
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';

  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);

  readonly currentUser = this._authService.userSignal;
  readonly isAuthenticated = computed(() => this.isLogged());

  get user(): SessionUser | null {
    return this._authService.getUser();
  }

  login(user: SessionUser, token: string): void {
    sessionStorage.setItem(LoginService.TOKEN_KEY, token);

    const safeUser = this._sanitizeUser(user);
    sessionStorage.setItem(LoginService.USER_KEY, JSON.stringify(safeUser));
    this._authService.saveUser(safeUser);
  }

  logout(): void {
    sessionStorage.removeItem(LoginService.TOKEN_KEY);
    sessionStorage.removeItem(LoginService.USER_KEY);
    this._authService.clearUser();
    void this._router.navigate(['/auth/login']);
  }

  isLogged(): boolean {
    const token = this.token;
    if (!token) {
      return false;
    }
    return !this._isTokenExpired(token);
  }

  get token(): string | null {
    return sessionStorage.getItem(LoginService.TOKEN_KEY);
  }

  private _sanitizeUser(user: SessionUser): SessionUser {
    const copy: SessionUser & Record<string, unknown> = { ...user };
    delete copy['token'];
    delete copy['accessToken'];
    delete copy['refreshToken'];
    delete copy['password'];
    return copy;
  }

  private _isTokenExpired(token: string): boolean {
    const payload = this._tryDecodeJwtPayload(token);
    const exp = payload?.exp;
    if (typeof exp !== 'number') {
      return false;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    return exp <= nowSeconds;
  }

  private _tryDecodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}
