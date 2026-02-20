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
import { RankingTablesResponse } from '../models/ranking.interface';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private readonly API_URL = environment.API_URL;
  private readonly TOURNAMENT_ENDPOINT = 'tournament';
  private readonly FORMATS_ENDPOINT = `${this.TOURNAMENT_ENDPOINT}/formats`;
  private readonly RANKING_ENDPOINT = `${this.TOURNAMENT_ENDPOINT}/{id}/ranking`;
  private readonly RANKING_GROUPS_ENDPOINT = `${this.TOURNAMENT_ENDPOINT}/{id}/groups`;
  private readonly ROUNDS_PAGINATION_ENDPOINT = `${this.TOURNAMENT_ENDPOINT}/{id}/{page}`;
  private readonly DELETE_TOURNAMENT = `${this.TOURNAMENT_ENDPOINT}/delete/{id}`;
  private readonly REPORT_MATCH = `${this.TOURNAMENT_ENDPOINT}/report`;
  private readonly GET_TEAMS_ID_ROUND = `${this.TOURNAMENT_ENDPOINT}/{roundId}/teams`;
  private readonly ROUND_REPORT_PREVIEW = `${this.TOURNAMENT_ENDPOINT}/preview`;
  private readonly MATCH_REPORT_DRAFTS = `${this.TOURNAMENT_ENDPOINT}/admin/match-report-drafts`;
  private readonly MATCH_REPORT_DRAFT_DETAIL = `${this.TOURNAMENT_ENDPOINT}/admin/match-report-drafts/{draftId}`;
  private readonly MATCH_REPORT_DRAFT_REVIEW = `${this.TOURNAMENT_ENDPOINT}/admin/match-report-drafts/{draftId}/review`;

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

  getRankingLeague(id: number): Observable<RankingTablesResponse> {
    const url = `${this.API_URL}${this.RANKING_ENDPOINT}`.replace('{id}', id.toString());
    return this.http.get<RankingTablesResponse>(url);
  }

  getRankingGroups(id: number): Observable<RankingTablesResponse> {
    const url = `${this.API_URL}${this.RANKING_GROUPS_ENDPOINT}`.replace('{id}', id.toString());
    return this.http.get<RankingTablesResponse>(url);
  }

  deleteTournament(id: number): Observable<RankingTablesResponse> {
    const url = `${this.API_URL}${this.DELETE_TOURNAMENT}`.replace('{id}', id.toString());
    return this.http.delete<RankingTablesResponse>(url);
  }

  setReportMatch(dto): Observable<any> {
    const url = `${this.API_URL}${this.REPORT_MATCH}`;
    return this.http.post<any>(url, dto);
  }

  getTeamsByIdRound(id: number): Observable<any> {
    const url = `${this.API_URL}${this.GET_TEAMS_ID_ROUND}`.replace('{roundId}', id.toString());
    return this.http.get<any>(url);
  }

  getRoundReportPreview(report): Observable<any> {
    const url = `${this.API_URL}${this.ROUND_REPORT_PREVIEW}`;
    return this.http.post<any>(url, report);
  }

  /**
   * Reportes (drafts) generados por partidos (vista admin).
   * API: GET /tournament/admin/match-report-drafts?status=&tournamentId=
   */
  listMatchReportDrafts(params?: { status?: string | null; tournamentId?: number | null }): Observable<any> {
    const url = `${this.API_URL}${this.MATCH_REPORT_DRAFTS}`;
    const httpParams: any = {};
    if (params?.status) httpParams.status = params.status;
    if (params?.tournamentId != null) httpParams.tournamentId = String(params.tournamentId);
    return this.http.get<any>(url, { params: httpParams });
  }

  /**
   * Detalle del draft (para preview).
   * API: GET /tournament/admin/match-report-drafts/:draftId
   */
  getMatchReportDraftDetail(draftId: number): Observable<any> {
    const url = `${this.API_URL}${this.MATCH_REPORT_DRAFT_DETAIL}`.replace('{draftId}', String(draftId));
    return this.http.get<any>(url);
  }

  /**
   * Aprobar/Rechazar draft (vista admin).
   * API: POST /tournament/admin/match-report-drafts/:draftId/review
   */
  reviewMatchReportDraft(
    draftId: number,
    dto: { adminId: number; action: 'approve' | 'reject'; reviewNote?: string },
  ): Observable<any> {
    const url = `${this.API_URL}${this.MATCH_REPORT_DRAFT_REVIEW}`.replace('{draftId}', String(draftId));
    return this.http.post<any>(url, dto);
  }
}
