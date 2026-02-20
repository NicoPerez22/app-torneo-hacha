import { Component, EventEmitter, Input, Output } from '@angular/core';

export type MatchReportStatus = 'pending' | 'approved' | 'rejected';

export type MatchReportCardVM = {
  reportId?: number | string | null;
  matchId?: number | string | null;

  tournamentName?: string | null;
  roundLabel?: string | null; // ej: "Fecha 10"
  createdAt?: string | null; // ISO

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
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() items: MatchReportCardVM[] = [];
  @Input() isAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() view = new EventEmitter<MatchReportCardVM>();
  @Output() approve = new EventEmitter<MatchReportCardVM>();
  @Output() reject = new EventEmitter<MatchReportCardVM>();

  readonly fallbackLogoUrl = 'assets/images/player-default.png';

  trackById = (_: number, item: MatchReportCardVM) =>
    item?.reportId ?? item?.matchId ?? _;

  getStatusLabel(status?: any): string {
    const s = String(status ?? 'pending').toLowerCase();
    if (s === 'approved') return 'Aprobado';
    if (s === 'rejected') return 'Rechazado';
    return 'Pendiente';
  }
}
