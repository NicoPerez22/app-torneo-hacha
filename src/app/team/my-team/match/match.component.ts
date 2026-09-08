import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  protected readonly fallbackLogoUrl = 'assets/images/player-default.png';
  protected readonly hasItems = computed(() => this.items().length > 0);
  protected readonly cards = computed(() =>
    this.items().map((item) => {
      const statusKey = String(item.status ?? 'pending').toLowerCase();
      return {
        ...item,
        statusKey,
        statusLabel: this._statusLabel(statusKey),
      };
    }),
  );

  private _statusLabel(statusKey: string): string {
    if (statusKey === 'approved') return 'Aprobado';
    if (statusKey === 'rejected') return 'Rechazado';
    if (statusKey === 'null_match') return 'No jugado';
    return 'Pendiente';
  }
}
