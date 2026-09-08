import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionUser } from '../models/user';

export interface UserApiResponse<T = unknown> {
  data?: T;
  code?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.API_URL;

  getUserByUserName(userName: string): Observable<UserApiResponse> {
    const params = new HttpParams().set('username', userName);
    return this._http.get<UserApiResponse>(`${this._apiUrl}users`, { params });
  }

  getUserByID(
    id: number | undefined,
  ): Observable<UserApiResponse<{ user?: SessionUser }>> {
    return this._http.get<UserApiResponse<{ user?: SessionUser }>>(
      `${this._apiUrl}user/${id}`,
    );
  }

  getUsers(): Observable<UserApiResponse<SessionUser[]>> {
    return this._http.get<UserApiResponse<SessionUser[]>>(`${this._apiUrl}user`);
  }

  update(id: number, user: unknown): Observable<UserApiResponse> {
    return this._http.post<UserApiResponse>(`${this._apiUrl}user/${id}`, user);
  }
}
