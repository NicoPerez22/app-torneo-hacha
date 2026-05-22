import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TOURNAMENT_CONSTANTS } from 'src/app/tournament/constants/tournament.constants';
import { Tournament } from 'src/app/tournament/models/tournament.interface';
import { TournamentService } from 'src/app/tournament/service/tournament.service';

export interface TournamentRoundListItem {
  page: number;
  label: string;
}

@Component({
  selector: 'app-tournament-rounds',
  templateUrl: './tournament-rounds.component.html',
  styleUrls: ['./tournament-rounds.component.css'],
})
export class TournamentRoundsComponent implements OnInit, OnDestroy {
  tournamentId = 0;
  tournament?: Tournament;
  rounds: TournamentRoundListItem[] = [];
  isLoading = false;
  private readonly subs = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tournamentService: TournamentService,
    private readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('tournamentId');
    const id = Number(raw);
    if (!raw || !Number.isFinite(id) || id < 1) {
      this.toastr.error(
        'Torneo no válido',
        TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
      );
      this.router.navigate(['/dashboard/tournaments']);
      return;
    }
    this.tournamentId = id;
    this.load();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  trackByPage(_: number, item: TournamentRoundListItem): number {
    return item.page;
  }

  onBack(): void {
    this.router.navigate(['/dashboard/tournaments']);
  }

  onViewTournament(): void {
    this.router.navigate(['/tournament/view', this.tournamentId]);
  }

  onViewReports(round: TournamentRoundListItem): void {
    this.router.navigate(['/dashboard/reports'], {
      queryParams: {
        tournamentId: String(this.tournamentId),
        fecha: String(round.page),
      },
    });
  }

  onReport(_round: TournamentRoundListItem): void {
    this.router.navigate(['/tournament/view', this.tournamentId], {
      queryParams: { view: 'rounds' },
    });
  }

  onEdit(round: TournamentRoundListItem): void {
    this.toastr.info(
      `Edición de "${round.label}" para este torneo no está disponible aún.`,
      'Próximamente',
    );
  }

  onNullMatch(_round: TournamentRoundListItem): void {
    this.toastr.info(
      'Desde "Reportes" podés marcar un partido como no jugado (partido nulo) sobre un reporte pendiente.',
      'Partido nulo',
    );
    this.router.navigate(['/dashboard/reports'], {
      queryParams: { tournamentId: String(this.tournamentId) },
    });
  }

  private load(): void {
    this.isLoading = true;
    const j$ = forkJoin({
      tournament: this.tournamentService
        .getTournamentByID(this.tournamentId)
        .pipe(catchError(() => of({ data: null as Tournament | null }))),
      firstRounds: this.tournamentService
        .getRoundsPagination(this.tournamentId, 1)
        .pipe(
          catchError(() => {
            this.toastr.error(
              'No se pudieron cargar las rondas del torneo',
              TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
            );
            return of({ data: { groups: [], pagination: null } });
          }),
        ),
    });

    this.subs.add(
      j$.subscribe({
        next: ({ tournament, firstRounds }) => {
          this.tournament = tournament.data ?? undefined;
          const pagination = firstRounds?.data?.pagination;
          const total = pagination?.totalPages;
          const safeTotal =
            typeof total === 'number' && Number.isFinite(total) && total > 0
              ? total
              : 0;

          if (safeTotal) {
            const unit = pagination?.unitValue;
            this.rounds = Array.from({ length: safeTotal }, (_, i) => {
              const page = i + 1;
              const label =
                page === 1 && unit != null && String(unit).trim() !== ''
                  ? `Fecha ${unit}`
                  : `Fecha ${page}`;
              return { page, label };
            });
          } else {
            this.rounds = [];
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      }),
    );
  }
}
