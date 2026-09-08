import { AuthService } from 'src/app/service/auth.service';
import { TeamService } from './../../service/team.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PlayersComponent } from './players/players.component';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManagerComponent } from './manager/manager.component';
import { ToastrService } from 'ngx-toastr';
import { ResultsComponent } from './results/results.component';
import { TradeComponent } from 'src/app/shared/components/trade/trade.component';
import { SessionUser } from 'src/app/models/user';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeamPlayer, TeamView } from '../models/team';

interface TeamRound {
  idRound: number;
  tournamentId?: number;
  tournament?: { id: number };
  tournamentName: string;
  label?: string | null;
  round: number;
  state: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  homeGoals?: number | null;
  awayGoals?: number | null;
}

@Component({
  selector: 'app-my-team',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css'],
})
export class MyTeamComponent implements OnInit {
  protected rounds: TeamRound[] = [];
  protected user: SessionUser | null = null;
  protected myTeam: TeamView | null = null;
  protected playersTeamsList: TeamPlayer[] = [];

  // pagination (ngx-pagination) para "Proximas Fechas"
  protected page = 1;
  protected readonly roundsPerPage = 5;

  private readonly teamService = inject(TeamService);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(NzModalService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teamId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this._getTeamById(this.teamId);
    this._getRounds();
  }

  protected onOpenSearchPlayers(): void {
    const modal = this.modalService.create({
      nzTitle: 'Buscar jugador',
      nzContent: PlayersComponent,
      nzWidth: 800,
      nzFooter: null,
    });

    modal.afterClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result === true) {
        this._getTeamById(this.teamId);
      }
    });
  }

  protected onOpenAssignManager(): void {
    const modal = this.modalService.create({
      nzTitle: 'Asignar Manager',
      nzContent: ManagerComponent,
      nzWidth: 800,
      nzFooter: null,
    });

    modal.afterClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result === true) {
        this._getTeamById(this.teamId);
      }
    });
  }

  protected onDelete(id: number): void {
    this.teamService
      .deletePlayer(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected onChangePlayer(player: TeamPlayer): void {
    player.loading = true;

    setTimeout(() => {
      player.loading = false;

      if (player.isTransfer) {
        this._assignTransferPlayer(player.id, false);
        return;
      }

      this._assignTransferPlayer(player.id, true);
    }, 1000);
  }

  protected onReport(value: TeamRound): void {
    const modal = this.modalService.create({
      nzContent: ResultsComponent,
      nzData: {
        match: value
      },
      nzFooter: null,
      nzWidth: '95vw',
      nzStyle: { maxWidth: '1100px' },
      nzBodyStyle: { padding: '16px' },
      nzCentered: true,
      nzWrapClassName: 'match-report-modal-wrap',
      nzClassName: 'match-report-modal',
    });

    modal.afterClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result === true) {
        this._getTeamById(this.teamId);
      }
    });
  }

  protected onBuyPlayer(player: TeamPlayer): void {
    const playerForTrade = {
      ...player,
      // En este screen el jugador viene del equipo "myTeam" (ruta /team/:id),
      // pero no siempre incluye player.team. Lo agregamos para que el modal funcione.
      team: this.myTeam,
    };

    this.modalService.create({
      nzContent: TradeComponent,
      nzData: { player: playerForTrade },
      nzFooter: null,
      nzWidth: '95vw',
      nzStyle: { maxWidth: '1000px' },
      nzBodyStyle: { padding: '16px' },
      nzCentered: true,
      nzWrapClassName: 'transfer-modal-wrap',
      nzClassName: 'transfer-modal',
    });
  }

  protected onPageChange(page: number): void {
    this.page = page;
  }

  private _getTeamById(id: string): void {
    this.teamService.getTeamByID(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.myTeam = res.data;

        if (this.myTeam) {
          this.playersTeamsList = this.myTeam.players ?? [];
        }
      },

      error: () => {
      },
    });
  }

  private _getRounds(): void {
    this.teamService.getRoundMyTeam(this.teamId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.rounds = Array.isArray(res.data) ? (res.data as TeamRound[]) : [];
      },

      error: () => {
        this.toastrService.error('No se pudieron obtener las fechas del equipo', 'Error')
      },
    }); 
  }

  private _assignTransferPlayer(id: number, isTransfer: boolean): void {
    this.teamService.assignTransferPlayer(id, isTransfer).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.toastrService.success('Jugador listado en transferencias', 'Exito')
      },

      error: () => {
        this.toastrService.error('No se pudo listar en transferencias al jugador', 'Error')
      },
    });
  }
}
