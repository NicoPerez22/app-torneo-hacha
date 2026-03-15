import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private readonly http: HttpClient
  ) {}

  API_URL = environment.API_URL;

  getResume(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}dashboard/resume`);
  }
}
