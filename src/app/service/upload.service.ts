import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UploadApiResponse {
  id?: number;
  url?: string;
  data?: unknown;
  code?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.API_URL;

  getImages(): Observable<UploadApiResponse> {
    return this._http.get<UploadApiResponse>(`${this._apiUrl}upload`);
  }

  setImage(file: File): Observable<UploadApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this._http.post<UploadApiResponse>(`${this._apiUrl}upload`, formData);
  }
}
