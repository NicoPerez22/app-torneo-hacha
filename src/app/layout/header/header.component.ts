import { User } from './../../models/user';
import { TeamService } from './../../service/team.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  teamsList: Array<any> = [];
  playerList: Array<User> = [];
  user: any;
  myUser: any;
  myTeam: any;
  teamExiste: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.authService.getUserObservable
    .subscribe((res) => {
      this.myUser = res
    })

    this.user = this.authService.getUser();
  }

  logout(){
    this.authService.clean()
    this.router.navigate(['/home']);
  }

}
