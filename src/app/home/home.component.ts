import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { User } from '../Models/User-Model';
// import { Subscription } from 'rxjs';
// import { AuthenticationService } from '../services/authentication.service';
// import { UserService } from '../services/user.service';
// import * as jwt_decode from 'jwt-decode';
// import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // currentUser: User;
  // currentUserSubscription: Subscription;
  // user: User;
  // users: User[];
  // token;
  constructor(
      // private authenticationService: AuthenticationService,
      // private userService: UserService
  ) {
    // this.users = new Array<User>();
    //   this.currentUserSubscription = this.authenticationService.currentUser.subscribe(resp => {
    //       this.token = resp.token
    //     console.log(this.token)
    //     const decoded: any = jwt_decode(this.token); 
    //     console.log(decoded)
    //     this.users.push(decoded.user);
    //     this.user = decoded.user

    //   });
  }

  ngOnInit() {
  }

  // loadAllUsers() {
  //   this.userService.getAll().pipe(first()).subscribe(users => {
  //       this.users = users;
  //   });
  // }
}
