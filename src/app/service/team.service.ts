import { BehaviorSubject, map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';

import { HttpClient } from '@angular/common/http';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(
    private http: HttpClient,
  ) {}

  API_URL = environment.API_URL;

  myTeamObserbale: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get getMyTeamObserbable(){
    return this.myTeamObserbale;
  }

  set setMyTeamObservable(value){
    this.myTeamObserbale = value;
  }

  createTeam(team: any): Observable<any>{
    const url = this.API_URL + `team/`
    return this.http.post<any>(url, team)
    .pipe(
      map((res) => res)
    );
  }

  getTeam(): Observable<any[]>{
    const url = this.API_URL + `team/`
    return this.http.get<any>(url)
    .pipe(
      map((res) => res)
    );
  }

  deleteTeam(team){

  }

  updateTeam(players: Array<any>, team){

  }

  getPLayers(id: number): Observable<any>{
    const url = this.API_URL + `users/${id}`
    return this.http.get<any>(url)
    .pipe(
      map((res) => res)
    );
  }

  
  getUser(): Observable<any[]>{
    const url = this.API_URL + `users`
    return this.http.get<any[]>(url)
    .pipe(
      map((res) => res)
    );
  }

  getTeamByID(idTeam): Observable<any>{
    const url = this.API_URL + `team/${idTeam}`
    return this.http.get<any>(url)
    .pipe(
      map((res) => res)
    );
  }

  sendInvitacionTeam(player): Observable<Notification>{
    const url = this.API_URL + 'usuarios/send-invitacion'
    return this.http.post<Notification>(url, player)
    .pipe(
      map((res) => res)
    );
  }
}
