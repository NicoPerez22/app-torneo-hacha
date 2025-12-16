// auth.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  Subject,
  EMPTY,
  timer,
  throwError,
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  retry,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

const LS_USER_KEY = 'user';
const SS_TOKEN_KEY = 'token';
const CLOCK_SKEW_MS = 30 * 1000; // 30s de margen por reloj/latencia

export interface AuthUser {
  id: string | number;
  name?: string;
  email?: string;
  /** Token para autorización en headers (Bearer ...) */
  token: string;
  /** Epoch en milisegundos en que expira el token */
  expiryToken: number;
  /** Campos extra que quieras persistir */
  [k: string]: unknown;
}

export interface RefreshResponse {
  data?: {
    token: string;
    expiryToken: number; // epoch ms
  };
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private router: Router) {}

  login(user): boolean {
    sessionStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify(user));

    return true;
  }

  logout() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');

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
