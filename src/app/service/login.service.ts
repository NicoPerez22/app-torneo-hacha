import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  _user: any = null;
  private readonly renewalInterval: any;
  private readonly timeToRenew = 5 * 60 * 1000;

  constructor(private http: HttpClient) {
    const userLocalStorage = localStorage.getItem('user');
    if (userLocalStorage) {
      try {
        const userParsed: any = JSON.parse(userLocalStorage);
        if (9000 < userParsed.expiryToken) {
          this._user = userParsed;
          if (userParsed.token && !sessionStorage.getItem('token')) {
            sessionStorage.setItem('token', userParsed.token);
          }
        } else {
          console.warn('Token expirado, borrando usuario');
        }
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
      }
    }
    // Autorrenuevo cada 5 minutos
    this.renewalInterval = setInterval(() => {
      if (this.isAuthenticated()) {
        this.renewJwt();
      }
    }, this.timeToRenew);
  }

  get user(): any {
    return this._user;
  }

  isAuthenticated(): boolean {
    return this._user !== null;
  }

  login(user: any): void {
    this._user = user;
    localStorage.setItem('user', JSON.stringify(user));

    if (user.token) {
      sessionStorage.setItem('token', user.token);
    }
  }

  logout(): void {
    this._user = null;
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    clearInterval(this.renewalInterval);
  }

  private renewJwt(): void {
    // this.http
    //   .post(`${environment.API_URL}auth/refresh`, {
    //     token: this._user?.bearerToken,
    //   })
    //   .subscribe({
    //     next: (response: any) => {
    //       if (response.data) {
    //         const updatedUser: any = {
    //           ...this._user,
    //           bearerToken: response.data.bearerToken,
    //           expiryToken: response.data.expiryToken,
    //         };
    //         this.login(updatedUser);
    //       }
    //     },
    //     error: (error) => {
    //       console.error('Error renewing JWT', error);
    //     },
    //   });
  }
}
