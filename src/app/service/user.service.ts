import { Observable, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  API_URL = environment.API_URL;

  getUserByUserName(userName: string): Observable<any> {
    const QueryParams = new HttpParams();
    QueryParams.set('username', userName);

    const url = this.API_URL + `users`;
    return this.http
      .get<any>(url, { params: QueryParams })
      .pipe(map((res) => res));
  }

  getUserByID(id): Observable<any> {
    const url = this.API_URL + `user/${id}`;
    return this.http.get<any>(url);
  }

  getUsers(): Observable<any> {
    const url = this.API_URL + `user`;
    return this.http.get<any>(url);
  }

  update(id, user){
    const url = this.API_URL + `user/${id}`;
    return this.http.post<any>(url, user);
  }
}
