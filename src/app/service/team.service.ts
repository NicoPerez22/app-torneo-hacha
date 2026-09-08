import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';
import { Notification } from '../models/notification';
import { TeamPlayer, TeamView } from '../team/models/team';

export interface TeamApiResponse<T = unknown> {
  data?: T;
  code?: number;
  message?: string;
  msg?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.API_URL;
  private readonly _myTeam = signal<TeamView | null>(null);

  readonly myTeam = this._myTeam.asReadonly();

  setMyTeam(team: TeamView | null): void {
    this._myTeam.set(team);
  }

  createTeam(team: unknown): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(`${this._apiUrl}team`, team);
  }

  updateTeam(team: { id: number | null }): Observable<TeamApiResponse> {
    return this._http.patch<TeamApiResponse>(
      `${this._apiUrl}team/${team.id}`,
      team,
    );
  }

  getTeams(): Observable<TeamApiResponse<TeamView[]>> {
    return this._http.get<TeamApiResponse<TeamView[]>>(`${this._apiUrl}team/`);
  }

  deleteTeam(id: number): Observable<TeamApiResponse<TeamView[]>> {
    return this._http.delete<TeamApiResponse<TeamView[]>>(`${this._apiUrl}team/${id}`);
  }

  deletePlayer(id: number): Observable<TeamApiResponse> {
    return this._http.delete<TeamApiResponse>(
      `${this._apiUrl}team/player/${id}`,
    );
  }

  getPLayers(id: number): Observable<TeamApiResponse> {
    return this._http.get<TeamApiResponse>(`${this._apiUrl}users/${id}`);
  }

  addPlayer(player: unknown): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(`${this._apiUrl}team/player`, player);
  }

  getUser(): Observable<TeamApiResponse> {
    return this._http.get<TeamApiResponse>(`${this._apiUrl}users`);
  }

  getTeamByID(idTeam: number | string): Observable<TeamApiResponse<TeamView>> {
    return this._http.get<TeamApiResponse<TeamView>>(
      `${this._apiUrl}team/${idTeam}`,
    );
  }

  sendInvitacionTeam(player: unknown): Observable<Notification> {
    return this._http.post<Notification>(
      `${this._apiUrl}team/sendInvitacion`,
      player,
    );
  }

  getInvitacionTeam(idUser: number): Observable<TeamApiResponse> {
    return this._http.get<TeamApiResponse>(
      `${this._apiUrl}team/invitacion/${idUser}`,
    );
  }

  aceptarInvitacion(invitacion: unknown): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(
      `${this._apiUrl}team/acceptInvitacion`,
      invitacion,
    );
  }

  createTorneo(team: unknown): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(`${this._apiUrl}tournament`, team);
  }

  getPlayersByIdTeam(id: number | null): Observable<TeamApiResponse<TeamPlayer[]>> {
    return this._http.get<TeamApiResponse<TeamPlayer[]>>(
      `${this._apiUrl}player/teamId/${id}`,
    );
  }

  transferPalyer(
    id: number | null,
    idTeam: number | null,
  ): Observable<TeamApiResponse> {
    return this._http.get<TeamApiResponse>(
      `${this._apiUrl}player/transfer/${id}/${idTeam}`,
    );
  }

  setBirdTransferPlayer(dto: unknown): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(
      `${this._apiUrl}player/transfer/offers`,
      dto,
    );
  }

  assignTransferPlayer(
    id: number,
    isTransfer: boolean,
  ): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(
      `${this._apiUrl}player/transfer/${id}`,
      { isTransfer },
    );
  }

  getPlayers(): Observable<TeamApiResponse> {
    return this._http.get<TeamApiResponse>(`${this._apiUrl}player/market`);
  }

  transferManager(
    teamId: number | null,
    id: number | null,
  ): Observable<TeamApiResponse> {
    return this._http.get<TeamApiResponse>(
      `${this._apiUrl}team/assingUser/${teamId}/${id}`,
    );
  }

  transferOffer(transferOffer: unknown): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(
      `${this._apiUrl}player/transfer/offers`,
      transferOffer,
    );
  }

  getTransferOffer(idTeam: number | undefined): Observable<TeamApiResponse> {
    const params = new HttpParams()
      .set('status', '')
      .set('page', 1)
      .set('limit', 10);
    return this._http.get<TeamApiResponse>(
      `${this._apiUrl}player/transfer/offers/team/${idTeam}`,
      { params },
    );
  }

  getAllOferrs(): Observable<TeamApiResponse> {
    const params = new HttpParams().set('page', 1).set('limit', 10);
    return this._http.get<TeamApiResponse>(`${this._apiUrl}player/pending`, {
      params,
    });
  }

  setStatusBird(
    id: number | string,
    reviewOffer: unknown,
    idAdmin: number | undefined,
  ): Observable<TeamApiResponse> {
    return this._http.post<TeamApiResponse>(
      `${this._apiUrl}player/${id}/${idAdmin}/review`,
      reviewOffer,
    );
  }

  getRoundMyTeam(id: number | string): Observable<TeamApiResponse> {
    return this._http.get<TeamApiResponse>(
      `${this._apiUrl}tournament/team/${id}/rounds`,
    );
  }
}
