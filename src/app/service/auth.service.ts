import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, collection, doc, getDoc, collectionData, addDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auhtState$: Observable<any>;

  constructor(
    private afAuth: AngularFireAuth, 
    private firestore: Firestore,
    private angularFirestore: AngularFirestore
  ) {
    this.auhtState$ = this.afAuth.authState
  }

  userObservable: BehaviorSubject<any> = new BehaviorSubject<any>(null)

  postUserInDB(user: any){
    const postUser = new User();
    postUser.email = user.email;
    postUser.userName = user.userName;

    const userRef = collection(this.firestore, 'users');
    return addDoc(userRef, Object.assign({}, postUser));
  }

  updateTeam(players: Array<any>, team): Promise<void>{
    const teamRef = this.angularFirestore.collection('teams')
    return teamRef.doc(team.id).update({players: players})
  }

  getUserById(): Observable<any[]>{
    const userRef = collection(this.firestore, 'users');
    return collectionData(userRef, {idField: 'id'}) as Observable<any[]>
  }

  register(email: string, password: string, userName: string){
    return this.afAuth.createUserWithEmailAndPassword(email, password)
    .then((user) => {
      const us = { email, password, userName }
      this.postUserInDB(us)
      this.afAuth.signInWithEmailAndPassword(email, password)
    })
    .catch(err => console.log(err))
  }

  login(email: string, password: string){
    return this.afAuth.signInWithEmailAndPassword(email, password)
    .then((res) => {
    })
    .catch(err => {
      console.log(err)
    })
  }

  logout(){
    this.afAuth.signOut()
  }

  stateUser(){
    return this.auhtState$;
  }

  get getUserObservable(){
    return this.userObservable.asObservable();
  }

  set setUserObservable(data){
    this.userObservable.next(data)
  }


}
