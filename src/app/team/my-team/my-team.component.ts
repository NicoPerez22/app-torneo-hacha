import { AuthService } from 'src/app/service/auth.service';
import { TeamService } from './../../service/team.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css']
})
export class MyTeamComponent implements OnInit {

  teamsList: Array<any> = [];
  user: any;
  myTeam: any
  myTeamEnable: boolean = false
  playersTeamsList: Array<any> = [];

  constructor(
    private teamService: TeamService,
    private authService: AuthService
  ){ }

  ngOnInit(): void {
    this.user = this.authService.returnUserLogged();
    this.teamService.getTeamByID(this.user.teamPlayId)
    .subscribe(res => {
      console.log(res)
      this.myTeam = res

      if(this.myTeam){
        this.myTeamEnable = true
        this.playersTeamsList = this.myTeam.players;
      }
    })

  }

}
