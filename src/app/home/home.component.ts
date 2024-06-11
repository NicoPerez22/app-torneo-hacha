import { TeamService } from './../service/team.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
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
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentUser: any;
  user: any;

  constructor(
    private authService: AuthService,
    private teamService: TeamService
  ) {
    this.authService.getUserObservable.subscribe((resp) => {
      this.user = resp;
    });
  }

  ngOnInit() {}



  // Crear 32 equipos

  // Iniciar el sorteo del torneo
  onClickBtn() {
    let teams = Array.from({ length: 32 }, (_, i) => `Equipo ${i + 1}`);

    const teamSave = {
      idFormat: 1,
      teams: teams,
      name: "Hacha Pro League",
      logo: null
    }

    this.teamService.createTorneo(teamSave).subscribe(
      res => console.log(res)
    )

  }
}
