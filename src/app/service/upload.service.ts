import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private http: HttpClient) {}

  API_URL = environment.API_URL;

  getImages(): Observable<any> {
    const url = this.API_URL + `upload`;
    return this.http.get<any>(url);
  }

  setImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const url = this.API_URL + `upload`;
    return this.http.post<any>(url, formData);
  }
}
