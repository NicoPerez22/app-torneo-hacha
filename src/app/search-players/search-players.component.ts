import { AuthService } from './../service/auth.service';
import { Component, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-search-players',
  templateUrl: './search-players.component.html',
  styleUrls: ['./search-players.component.css']
})
export class SearchPlayersComponent implements OnInit {

  playersList: Array<any> = [];
  resultPlayer: Array<any> = [];

  jsonInArray: Array<any> = [];

  isJson = {
    id: 0,
    value: ""
  }

  constructor(
    private userService: UserService
  ){ }

  ngOnInit(): void {
  }

  searchPlayerKeyUp(value){
    if(value.length > 4){
      // this.resultPlayer = this.playersList.filter(elem => elem.userName == value);
      this.userService.getUserByUserName(value)
      .subscribe(res => this.resultPlayer = res)
    }
  }




}
