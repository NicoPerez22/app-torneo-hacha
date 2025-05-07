import { AuthService } from './../service/auth.service';
import { Component, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';
import { UserService } from '../service/user.service';
import { Store } from '@ngrx/store';
import { LoadedPlayers, loadPlayers } from '../state/actions/players.actions';
import { NgxSpinnerService } from 'ngx-spinner';
import { TournamentService } from '../tournament/service/tournament.service';

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
    private userService: UserService,
    private tournamentService: TournamentService,
    private spinnerService: NgxSpinnerService,
    private store: Store<any>
  ){ }

  ngOnInit(): void {
    this.tournamentService.getGames()
    .subscribe({
      next: (res) => {
        this.playersList = res.results
        this.store.dispatch(LoadedPlayers(
          { Players: res.results }
        ))

        setTimeout(() => {
          this.spinnerService.hide();
        }, 1000)
      },
      error: () => {
      }
    }
    )    
  }

  searchPlayerKeyUp(value){
    if(value.length > 4){
      // this.resultPlayer = this.playersList.filter(elem => elem.userName == value);
      this.userService.getUserByUserName(value)
      .subscribe(res => this.resultPlayer = res)
    }
  }




}
