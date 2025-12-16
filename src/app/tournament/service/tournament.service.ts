import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  constructor(private http: HttpClient) {}

  API_URL = environment.API_URL;

  getFormats(): Observable<any> {
    const url = this.API_URL + `tournament/formats`;
    return this.http.get<any>(url).pipe(map((res) => res));
  }

  getTournament(): Observable<any> {
    const url = this.API_URL + `tournament`;
    return this.http.get<any>(url);
  }

  getTournamentByID(id): Observable<any> {
    const url = this.API_URL + `tournament/${id}`;
    return this.http.get<any>(url).pipe(map((res) => res));
  }

  getTeams(): Observable<any> {
    const url = this.API_URL + `team`;
    return this.http.get<any>(url).pipe(map((res) => res));
  }

  createTournament(tournament): Observable<any> {
    const url = this.API_URL + `tournament`;
    return this.http.post<any>(url, tournament).pipe(map((res) => res));
  }

  getRoundsPagination(id, page, limit): Observable<any> {
    const url = this.API_URL + `tournament/${id}/${page}/${limit}`;
    return this.http.get<any>(url);
  }

  getRanking(id): Observable<any> {
    const url = this.API_URL + `tournament/${id}/ranking`;
    return this.http.get<any>(url);
  }
}
