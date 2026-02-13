import { Component, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TradeComponent } from '../shared/components/trade/trade.component';

@Component({
  selector: 'app-search-players',
  templateUrl: './search-players.component.html',
  styleUrls: ['./search-players.component.css'],
})
export class SearchPlayersComponent implements OnInit {
  playersList: Array<any> = [];
  columns: Array<any> = [];
  players: Array<any> = [];
  user: any;

  // pagination (ngx-pagination) para la grilla de jugadores
  playersPage: number = 1;
  readonly playersPerPage: number = 12;
  readonly playersPaginationId: string = 'search-players-grid';

  constructor(
    private teamService: TeamService,
    private router: Router,
    public loginService: LoginService,
    private userSerivce: UserService,
    private modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this._getPlayers();
    this._getProfile(this.loginService.user.id)
  }

  onBird(player): void {
    this.modal.create({
      nzContent: TradeComponent,
      nzComponentParams: { player },
      nzFooter: null,
      nzWidth: '95vw',
      nzStyle: { maxWidth: '1000px' },
      nzBodyStyle: { padding: '16px' },
      nzCentered: true,
      nzWrapClassName: 'transfer-modal-wrap',
      nzClassName: 'transfer-modal',
    });
  }

  onListBird() {
    this.router.navigate(['mercado-transferencias/ofertas']);
  }

  onListBirdAdmin() {
    this.router.navigate(['mercado-transferencias/comprobar-ofertas']);
  }


  private _getPlayers() {
    this.teamService.getPlayers().subscribe({
      next: (response) => {
        this.playersList = response.data;
        this.playersPage = 1;
      },
      error: (error) => {
      },
    });
  }

  private _getProfile(id) {
    this.userSerivce.getUserByID(id).subscribe({
      next: (resp) => {
        this.user = resp.data.user;
        console.log(this.user)
      },
    });
  }
}
