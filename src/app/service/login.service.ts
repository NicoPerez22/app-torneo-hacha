import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  //private $$user = signal<User | null>(null);

  private $$user = signal<any | null>({
    // id: 1,
    // nombre: 'Test',
    // apellido: 'Testing',
    // email: 'test@mail.com',
    // bearerToken: 'Bearer token',
    // expiryToken: Date.now() + 1000 * 60 * 60 * 24, // 1 day
  });

  private readonly http = inject(HttpClient);
  private readonly renewalInterval: any;
  private readonly timeToRenew = 5 * 60 * 1000;

  readonly isAuthenticated = computed(() => {
    const user = this.$$user();
    return user !== null;
  });

  constructor() {
    const userLocalStorage = localStorage.getItem('user');
    if (userLocalStorage) {
      try {
        const userParsed: any = JSON.parse(userLocalStorage);
        if (Date.now() < userParsed.expiryToken) {
          this.$$user.set(userParsed);
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
        localStorage.removeItem('user');
      }
    }
    // Autorrenuevo cada 5 minutos
    this.renewalInterval = setInterval(() => {
      if (this.isAuthenticated()) {
        this.renewJwt();
      }
    }, this.timeToRenew);
  }

  get user() {
    return this.$$user;
  }

  login(user: any): void {
    this.$$user.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    this.$$user.set(null);
    localStorage.removeItem('user');
    clearInterval(this.renewalInterval);
  }

  private renewJwt(): void {
    this.http
      .post(`${environment.API_URL}auth/refresh`, {
        token: this.$$user()?.bearerToken,
      })
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            const user = this.$$user();
            if (user) {
              const updatedUser: any = {
                ...user,
                bearerToken: response.data.bearerToken,
                expiryToken: response.data.expiryToken,
              };
              this.login(updatedUser);
            }
          }
        },
        error: (error) => {
          console.error('Error renewing JWT', error);
        },
      });
  }
}
