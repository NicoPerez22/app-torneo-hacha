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

  status?: MatchReportStatus | null;
};

export type ReportDetailVM = {
  id?: number | string;
  status?: string;
  createdAt?: string;
  tournamentName?: string;
  roundLabel?: string;
  homeName?: string;
  awayName?: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  events?: Array<any>;
};

