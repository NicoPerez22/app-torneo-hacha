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
  styleUrls: ['./search-players.component.css'],
})
export class SearchPlayersComponent implements OnInit {
  playersList: any[] = [];
  columns: Array<any> = [];

  constructor(
    private teamService: TeamService,
    private spinnerService: NgxSpinnerService,
  ) {}

  ngOnInit(): void {
    this._getPlayers();
  }

  private _getPlayers() {
    this.spinnerService.show();
    this.teamService.getPlayers().subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.playersList = response.data;
      },
      error: (error) => {
        this.spinnerService.hide();
        console.error('Error fetching players:', error);
      },
    });
  }

  // private _initColumns() {
  //   this.columns = [
  //     {
  //       name: 'Jugador',
  //       key: 'fullName',
  //       columnWidth: '5%',
  //       // rowAction: (data) => this.detalleNotificacion(data),
  //       // filterFn: (value: string, item: any) => {
  //       //   return item.caratula == value;
  //       // },
  //     },
  //     {
  //       name: 'Valoracion',
  //       key: 'valoration',
  //       style: {
  //         'background-color': 'rgb(34, 173, 46)',
  //         'border-radius': '3px',
  //         color: 'black',
  //         'padding-left': '4px',
  //         'padding-right': '4px',
  //       },
  //       columnWidth: '3%',
  //     },
  //     {
  //       name: 'Posicion',
  //       key: 'position',
  //       columnWidth: '3%',
  //       className: (data) => this._getState(data),
  //     },
  //   ];
  // }
}
