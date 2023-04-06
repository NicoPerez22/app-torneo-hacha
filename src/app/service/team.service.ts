import { BehaviorSubject, map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';

import { Firestore, collection, doc, getDoc, collectionData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(
    private firestore: Firestore, 
    private http: HttpClient,
    private angularFirestore: AngularFirestore
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
    const teamRef = doc(this.firestore, `teams/${team.id}`)
    return deleteDoc(teamRef);    
  }

  updateTeam(players: Array<any>, team): Promise<void>{
    const teamRef = this.angularFirestore.collection('teams')
    return teamRef.doc(team.id).update({players: players})
  }

  getPLayers(id: number): Observable<any>{
    const url = this.API_URL + `users/${id}`
    return this.http.get<any>(url)
    .pipe(
      map((res) => res)
    );
  }

  getTeamByID(idTeam): Observable<any>{
    const url = this.API_URL + `equipos/${idTeam}`
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
