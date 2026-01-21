import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  TournamentResponse, 
  FormatResponse, 
  TournamentDetailResponse,
  CreateTournamentRequest,
  CreateTournamentResponse 
} from '../models/tournament.interface';
import { RoundsResponse } from '../models/round.interface';
import { RankingResponse } from '../models/ranking.interface';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private readonly API_URL = environment.API_URL;
  private readonly TOURNAMENT_ENDPOINT = 'tournament';
  private readonly FORMATS_ENDPOINT = `${this.TOURNAMENT_ENDPOINT}/formats`;
  private readonly RANKING_ENDPOINT = `${this.TOURNAMENT_ENDPOINT}/{id}/ranking`;
  private readonly ROUNDS_PAGINATION_ENDPOINT = `${this.TOURNAMENT_ENDPOINT}/{id}/{page}`;

  constructor(private http: HttpClient) {}

  getFormats(): Observable<FormatResponse> {
    const url = `${this.API_URL}${this.FORMATS_ENDPOINT}`;
    return this.http.get<FormatResponse>(url);
  }

  getTournament(): Observable<TournamentResponse> {
    const url = `${this.API_URL}${this.TOURNAMENT_ENDPOINT}`;
    return this.http.get<TournamentResponse>(url);
  }

  getTournamentByID(id: number): Observable<TournamentDetailResponse> {
    const url = `${this.API_URL}${this.TOURNAMENT_ENDPOINT}/${id}`;
    return this.http.get<TournamentDetailResponse>(url);
  }

  createTournament(tournament: CreateTournamentRequest): Observable<CreateTournamentResponse> {
    const url = `${this.API_URL}${this.TOURNAMENT_ENDPOINT}`;
    return this.http.post<CreateTournamentResponse>(url, tournament);
  }

  getRoundsPagination(id: number, page: number): Observable<RoundsResponse> {
    const url = `${this.API_URL}${this.ROUNDS_PAGINATION_ENDPOINT}`
      .replace('{id}', id.toString())
      .replace('{page}', page.toString());
    return this.http.get<RoundsResponse>(url);
  }

  getRanking(id: number): Observable<RankingResponse> {
    const url = `${this.API_URL}${this.RANKING_ENDPOINT}`.replace('{id}', id.toString());
    return this.http.get<RankingResponse>(url);
  }
}
