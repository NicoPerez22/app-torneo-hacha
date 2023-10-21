import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  constructor(
    private http: HttpClient,
  ) {}

  API_URL = environment.API_URL;

  getFormatoTorneo(): Observable<any>{
    const url = this.API_URL + `format/`
    return this.http.get<any>(url)
    .pipe(
      map((res) => res)
    );
  }
}
