import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auhtState$: Observable<any>;
  USER_KEY = 'user';

  constructor(private http: HttpClient) {}

  userObservable: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  API_URL = environment.API_URL;

  register(userRegister): Observable<any> {
    const url = this.API_URL + `users/register`;
    return this.http.post<any>(url, userRegister).pipe(map((res) => res));
  }

  login(userLogin): Observable<any> {
    const url = this.API_URL + `auth/login`;
    return this.http.post<any>(url, userLogin).pipe(map((res) => res));
  }

  clean(): void {
    window.sessionStorage.clear();
  }

  saveUser(user: any): void {
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    if (user) {
      this.setUserObservable = JSON.parse(user);
    }

    return JSON.parse(user);
  }

  isLoggedIn(): boolean {
    const user = sessionStorage.getItem(this.USER_KEY);
    if (user) {
      return true;
    }
    return false;
  }

  returnUserLogged() {
    var us;
    this.getUserObservable.subscribe((res) => {
      us = res;
    });

    return us;
  }

  get getUserObservable() {
    this.getUser();
    return this.userObservable.asObservable();
  }

  set setUserObservable(data) {
    this.userObservable.next(data);
  }
}
