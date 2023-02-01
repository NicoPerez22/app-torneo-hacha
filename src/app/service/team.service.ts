import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { Firestore, collection, doc, getDoc, collectionData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(
    private firestore: Firestore, 
    private http: HttpClient,
    private angularFirestore: AngularFirestore
  ) {}


  myTeamObserbale: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get getMyTeamObserbable(){
    return this.myTeamObserbale;
  }

  set setMyTeamObservable(value){
    this.myTeamObserbale = value;
  }

  postTeam(value: any): Promise<any>{
    const teamRef = collection(this.firestore, 'teams');
    return addDoc(teamRef, value);
  }

  getTeam(): Observable<any[]>{
    const teamRef = collection(this.firestore, 'teams');
    return collectionData(teamRef, {idField: 'id'}) as Observable<any>
  }

  deleteTeam(team){
    const teamRef = doc(this.firestore, `teams/${team.id}`)
    return deleteDoc(teamRef);    
  }

  updateTeam(players: Array<any>, team): Promise<void>{
    const teamRef = this.angularFirestore.collection('teams')
    return teamRef.doc(team.id).update({players: players})
  }

  getPLayers(): Observable<any[]>{
    const teamRef = collection(this.firestore, 'users');
    return collectionData(teamRef, {idField: 'id'}) as Observable<any>
  }
}
