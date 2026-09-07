import { Component, computed, input, output } from '@angular/core';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

export type MatchReportStatus = 'pending' | 'approved' | 'rejected';

export type MatchReportCardVM = {
  reportId?: number | string | null;
  matchId?: number | string | null;

  tournamentName?: string | null;
  roundLabel?: string | null;
  createdAt?: string | null;

  homeName: string;
  awayName: string;
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;

  homeGoals?: number | null;
  awayGoals?: number | null;

  status?: MatchReportStatus | string | null;
};

@Component({
  selector: 'app-match',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css'],
})
export class MatchComponent {
  readonly title = input<string | undefined>();
  readonly subtitle = input<string | undefined>();
  readonly items = input<MatchReportCardVM[]>([]);
  readonly isAdmin = input(false);
  readonly loading = input(false);

  readonly view = output<MatchReportCardVM>();
  readonly approve = output<MatchReportCardVM>();
  readonly reject = output<MatchReportCardVM>();
  readonly nullMatch = output<MatchReportCardVM>();

  readonly fallbackLogoUrl = 'assets/images/player-default.png';
  readonly hasItems = computed(() => (this.items()?.length ?? 0) > 0);

  trackById = (_: number, item: MatchReportCardVM) =>
    item?.reportId ?? item?.matchId ?? _;

  getStatusLabel(status?: any): string {
    const s = String(status ?? 'pending').toLowerCase();
    if (s === 'approved') return 'Aprobado';
    if (s === 'rejected') return 'Rechazado';
    if (s === 'null_match') return 'No jugado';
    return 'Pendiente';
  }
}
