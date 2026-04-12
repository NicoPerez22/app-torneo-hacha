import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TOURNAMENT_CONSTANTS } from 'src/app/tournament/constants/tournament.constants';
import { Tournament } from 'src/app/tournament/models/tournament.interface';
import { TournamentService } from 'src/app/tournament/service/tournament.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-tournaments',
  templateUrl: './dashboard-tournaments.component.html',
  styleUrls: ['./dashboard-tournaments.component.css'],
})
export class DashboardTournamentsComponent implements OnInit, OnDestroy {
  tournaments: Tournament[] = [];
  isLoading = false;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly toastrService: ToastrService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTournaments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  trackByTournamentId(_: number, t: Tournament): number {
    return t.id;
  }

  getTournamentLogo(t: Tournament): string {
    const anyT = t as any;
    if (typeof anyT?.logo === 'string' && anyT.logo) return anyT.logo;
    if (typeof anyT?.logoUrl === 'string' && anyT.logoUrl) return anyT.logoUrl;
    if (t?.logo?.secureUrl) return t.logo.secureUrl;
    if (t?.logo?.url) return t.logo.url;
    return 'assets/images/HYT-IESA.png';
  }

  onView(id: number): void {
    this.router.navigate(['/tournament/view', id]);
  }

  onViewRounds(id: number): void {
    // Por ahora la vista de torneo ya incluye rondas/fechas; dejamos query param para futura navegación directa.
    this.router.navigate(['/tournament/view', id], {
      queryParams: { view: 'rounds' },
    });
  }

  onEdit(t: Tournament): void {
    // No hay endpoint/flujo de edición todavía en el proyecto.
    this.toastrService.info(
      `Edición pendiente para "${t?.name ?? 'Torneo'}"`,
      'Info',
    );
  }

  onDelete(id: number): void {
    this.tournamentService.deleteTournament(id).subscribe({
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
    const tournamentSub = this.tournamentService.getTournament().subscribe({
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

    this.subscriptions.add(tournamentSub);
  }
}
