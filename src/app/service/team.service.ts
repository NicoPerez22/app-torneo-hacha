import { BehaviorSubject, map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';

import { HttpClient } from '@angular/common/http';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  constructor(private http: HttpClient) {}

  API_URL = environment.API_URL;

  myTeamObserbale: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get getMyTeamObserbable() {
    return this.myTeamObserbale;
  }

  set setMyTeamObservable(value) {
    this.myTeamObserbale = value;
  }

  createTeam(team: any): Observable<any> {
    const url = this.API_URL + `team`;
    return this.http.post<any>(url, team);
  }

  getTeams(): Observable<any> {
    const url = this.API_URL + `team/`;
    return this.http.get<any>(url);
  }

  deleteTeam(id): Observable<any> {
    const url = this.API_URL + `team/${id}`;
    return this.http.delete<any>(url);
  }

  deletePlayer(id) {
    const url = this.API_URL + `team/player/${id}`;
    return this.http.delete<any>(url).pipe(map((res) => res));
  }

  getPLayers(id: number): Observable<any> {
    const url = this.API_URL + `users/${id}`;
    return this.http.get<any>(url).pipe(map((res) => res));
  }

  addPlayer(player) {
    const url = this.API_URL + `team/player`;
    return this.http.post<any[]>(url, player).pipe(map((res) => res));
  }

  getUser(): Observable<any[]> {
    const url = this.API_URL + `users`;
    return this.http.get<any[]>(url).pipe(map((res) => res));
  }

  getTeamByID(idTeam): Observable<any> {
    const url = this.API_URL + `team/${idTeam}`;
    return this.http.get<any>(url).pipe(map((res) => res));
  }

  sendInvitacionTeam(player): Observable<Notification> {
    const url = this.API_URL + 'team/sendInvitacion';
    return this.http.post<Notification>(url, player).pipe(map((res) => res));
  }

  getInvitacionTeam(idUser): Observable<any> {
    const url = this.API_URL + `team/invitacion/${idUser}`;
    return this.http.get<any>(url).pipe(map((res) => res));
  }

  aceptarInvitacion(invtacion): Observable<any> {
    const url = this.API_URL + `team/acceptInvitacion`;
    return this.http.post<any>(url, invtacion).pipe(map((res) => res));
  }

  createTorneo(team) {
    const url = this.API_URL + `tournament`;
    return this.http.post<any>(url, team).pipe(map((res) => res));
  }

  getPlayersByIdTeam(id) {
    const url = this.API_URL + `player/teamId/${id}`;
    return this.http.get<any>(url);
  }

  transferPalyer(id, idTeam) {
    const url = this.API_URL + `player/transfer/${id}/${idTeam}`;
    return this.http.get<any>(url);
  }

  assignTransferPlayer(id, isTransfer) {
    const isTransferParam = { isTransfer: isTransfer };
    const url = this.API_URL + `player/transfer/${id}`;
    return this.http.post<any>(url, isTransferParam);
  }

  getPlayers() {
    const url = this.API_URL + `player/market`;
    return this.http.get<any>(url);
  }

  transferManager(teamId, id) {
    const url = this.API_URL + `team/assingUser/${teamId}/${id}`;
    return this.http.get<any>(url);
  }
}
