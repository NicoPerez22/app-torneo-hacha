import { Component, inject, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TradeComponent } from '../shared/components/trade/trade.component';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

interface MarketPlayer {
  id?: number;
  fullName: string;
  position?: string;
  valoration?: number;
  photo?: { secureUrl?: string };
  team?: {
    id?: number;
    name?: string;
    logo?: { secureUrl?: string };
  };
}

interface ProfileUser {
  idRol?: number;
  teams?: Array<{ id?: number }>;
}

@Component({
  selector: 'app-search-players',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './search-players.component.html',
  styleUrls: ['./search-players.component.css'],
})
export class SearchPlayersComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly modal = inject(NzModalService);

  protected readonly loginService = inject(LoginService);
  protected readonly playersPerPage = 12;
  protected readonly playersPaginationId = 'search-players-grid';
  protected playersList: MarketPlayer[] = [];
  protected user?: ProfileUser;
  protected playersPage = 1;

  ngOnInit(): void {
    this.getPlayers();
    this.getProfile(this.loginService.user?.id);
  }

  protected onBird(player: MarketPlayer): void {
    this.modal.create({
      nzContent: TradeComponent,
      nzData: { player },
      nzFooter: null,
      nzWidth: '95vw',
      nzStyle: { maxWidth: '1000px' },
      nzBodyStyle: { padding: '16px' },
      nzCentered: true,
      nzWrapClassName: 'transfer-modal-wrap',
      nzClassName: 'transfer-modal',
    });
  }

  protected onListBird(): void {
    void this.router.navigate(['mercado-transferencias/ofertas']);
  }

  protected onListBirdAdmin(): void {
    void this.router.navigate(['mercado-transferencias/comprobar-ofertas']);
  }

  protected onPlayersPageChange(page: number): void {
    this.playersPage = page;
  }

  private getPlayers(): void {
    this.teamService.getPlayers().subscribe({
      next: (response) => {
        this.playersList = Array.isArray(response.data)
          ? (response.data as MarketPlayer[])
          : [];
        this.playersPage = 1;
      },
    });
  }

  private getProfile(id: number | undefined): void {
    if (!id) {
      return;
    }
    this.userService.getUserByID(id).subscribe({
      next: (resp) => {
        this.user = resp.data?.user;
      },
    });
  }
}
