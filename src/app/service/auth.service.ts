import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auhtState$: Observable<any>;
  USER_KEY = 'auth-user';

  constructor(
    private afAuth: AngularFireAuth, 
    private http: HttpClient,
  ) {
  }

  userObservable: BehaviorSubject<any> = new BehaviorSubject<any>(null)
  API_URL = environment.API_URL;


  register(email: string, password: string, userName: string){
  }

  login(userLogin): Observable<any>{
    const url = this.API_URL + `users/login`
    return this.http.post<any>(url, userLogin)
    .pipe(
      map((res) => res)
    );
  } 
  
  clean(): void {
    window.sessionStorage.clear();
  }

  saveUser(user: any): void {
    window.sessionStorage.removeItem(this.USER_KEY);
    window.sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = window.sessionStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  isLoggedIn(): boolean {
    const user = window.sessionStorage.getItem(this.USER_KEY);
    if (user) {
      return true;
    }

    return false;
  }

  logout(){
    this.afAuth.signOut()
  }

  get getUserObservable(){
    return this.userObservable.asObservable();
  }

  set setUserObservable(data){
    this.userObservable.next(data)
  }


}
