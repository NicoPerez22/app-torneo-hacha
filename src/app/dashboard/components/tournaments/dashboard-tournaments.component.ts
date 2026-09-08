import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TOURNAMENT_CONSTANTS } from 'src/app/tournament/constants/tournament.constants';
import { Tournament } from 'src/app/tournament/models/tournament.interface';
import { TournamentService } from 'src/app/tournament/service/tournament.service';
import { ToastrService } from 'ngx-toastr';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-dashboard-tournaments',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-tournaments.component.html',
  styleUrls: ['./dashboard-tournaments.component.css'],
})
export class DashboardTournamentsComponent implements OnInit {
  private readonly tournamentService = inject(TournamentService);
  private readonly toastrService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected tournaments: Tournament[] = [];
  protected isLoading = false;

  ngOnInit(): void {
    this.loadTournaments();
  }

  protected getTournamentLogo(tournament: Tournament): string {
    const logo = tournament.logo as unknown;
    const logoUrl = (tournament as Tournament & { logoUrl?: unknown }).logoUrl;

    if (typeof logo === 'string' && logo) return logo;
    if (typeof logoUrl === 'string' && logoUrl) return logoUrl;
    if (tournament.logo?.secureUrl) return tournament.logo.secureUrl;
    if (tournament.logo?.url) return tournament.logo.url;
    return 'assets/images/HYT-IESA.png';
  }

  protected onView(id: number): void {
    this.router.navigate(['/tournament/view', id]);
  }

  protected onViewRounds(id: number): void {
    this.router.navigate(['/dashboard/tournaments', id, 'rounds']);
  }

  protected onEdit(t: Tournament): void {
    // No hay endpoint/flujo de edición todavía en el proyecto.
    this.toastrService.info(
      `Edición pendiente para "${t?.name ?? 'Torneo'}"`,
      'Info',
    );
  }

  protected onDelete(id: number): void {
    this.tournamentService
      .deleteTournament(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastrService.success('Torneo eliminado con éxito', 'Éxito');
          this.loadTournaments();
        },
        error: () => {
          this.toastrService.error(
            'No se pudo eliminar el torneo',
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });
  }

  private loadTournaments(): void {
    this.isLoading = true;
    this.tournamentService
      .getTournament()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data || [];
          this.tournaments = [...data].sort((a, b) =>
            (a?.name ?? '').localeCompare(b?.name ?? ''),
          );
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastrService.error(
            TOURNAMENT_CONSTANTS.TOURNAMENTS_LOAD_ERROR,
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });
  }
}
