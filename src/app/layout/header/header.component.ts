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
    this.authService.stateUser().subscribe(res => this.user = res)
    this.teamService.getPLayers().subscribe((res) => {
      this.playerList = res;

      this.myUser = this.playerList.find(user => user.email == this.user.email)

    })
    this.teamService.getTeam().subscribe((res) => {
      this.teamsList = res;
      this.myTeam = this.teamsList.find(team => team.uid == this.user.uid)

      if(this.myTeam){
        this.teamExiste = true;
      }
      
    })
  }

  logout(){
    this.authService.logout()
    this.router.navigate(['/home']);
  }

}
