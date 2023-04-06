import { AuthService } from './../service/auth.service';
import { Component, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';

@Component({
  selector: 'app-search-players',
  templateUrl: './search-players.component.html',
  styleUrls: ['./search-players.component.css']
})
export class SearchPlayersComponent implements OnInit {

  playersList: Array<any> = [];
  resultPlayer: Array<any> = [];

  constructor(
    private teamService: TeamService
  ){ }

  ngOnInit(): void {
    // this.teamService.getPLayers().subscribe((res) =>  {
    //   this.playersList = res;
    // })
  }

  searchPlayerKeyUp(value){
    if(value.length > 6){
      this.resultPlayer = this.playersList.filter(elem => elem.userName == value);
    }
  }

}
