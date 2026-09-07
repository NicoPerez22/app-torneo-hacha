import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly userState = signal<any | null>(this.readStoredUser());
  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.isLogged());

  get user() {
    return this.userState();
  }

  login(user, token: string) {
    sessionStorage.setItem(LoginService.TOKEN_KEY, token);

    const safeUser = this.sanitizeUser(user);
    sessionStorage.setItem(LoginService.USER_KEY, JSON.stringify(safeUser));

    this.userState.set(safeUser);
    this.authService.saveUser(safeUser);
  }

  logout() {
    sessionStorage.removeItem(LoginService.TOKEN_KEY);
    sessionStorage.removeItem(LoginService.USER_KEY);
    this.userState.set(null);
    this.authService.clearUser();

    this.router.navigate(['/auth/login']);
  }

  isLogged(): boolean {
    const token = this.token;
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  get token(): string | null {
    return sessionStorage.getItem(LoginService.TOKEN_KEY);
  }

  private readStoredUser() {
    const raw = sessionStorage.getItem(LoginService.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private sanitizeUser(user: any) {
    if (!user || typeof user !== 'object') return user ?? null;
    const copy: any = { ...user };
    delete copy.token;
    delete copy.accessToken;
    delete copy.refreshToken;
    delete copy.password;
    return copy;
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.tryDecodeJwtPayload(token);
    const exp = payload?.exp;
    if (typeof exp !== 'number') return false;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return exp <= nowSeconds;
  }

  private tryDecodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
