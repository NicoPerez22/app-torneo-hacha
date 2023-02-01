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
  players: boolean = true
  results: boolean = false
  stadistics: boolean = false
  match: boolean = false

  constructor(
    private teamService: TeamService,
    private authService: AuthService
  ){ }

  ngOnInit(): void {
    this.authService.stateUser().subscribe(res => this.user = res)
    this.teamService.getTeam().subscribe((res) => {
      this.teamsList = res;
      this.myTeam = this.teamsList.find(team => team.uid == this.user.uid);

      if(this.myTeam){
        this.myTeamEnable = true
        this.teamService.setMyTeamObservable = this.myTeam;
      }
      
    })
  }

  showPlayers(){
    this.players = true;
    this.results = false;
    this.stadistics = false;
    this.match = false;
  }

  showResults(){
    this.players = false;
    this.results = true;
    this.stadistics = false;
    this.match = false;
  }

  showStadistics(){
    this.players = false;
    this.results = false;
    this.stadistics = true;
    this.match = false;
  }

  showMatch(){
    this.players = false;
    this.results = false;
    this.stadistics = false;
    this.match = true;
  }
}
