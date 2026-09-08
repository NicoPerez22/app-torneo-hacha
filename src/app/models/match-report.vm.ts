export type MatchReportStatus = 'pending' | 'approved' | 'rejected' | 'null_match' | string;

export type MatchReportEvent = {
  minute?: number | string;
  min?: number | string;
  eventType?: string;
  type?: string;
  playerName?: string;
  player?: { name?: string };
  playerId?: number | string;
  teamName?: string;
  team?: { name?: string };
  teamId?: number | string;
};

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
  events?: MatchReportEvent[];
};

