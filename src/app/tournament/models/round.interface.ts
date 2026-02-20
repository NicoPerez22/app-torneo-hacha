export interface Match {
  id?: number;
  idRound?: number;
  tournamentId?: number;
  matchday?: number;
  groupNumber?: number | null;
  round?: number;
  state?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  homeIdLogo?: number;
  awayIdLogo?: number;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number | null;
  awayGoals: number | null;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  status?: string;
  date?: string;
}

export interface Round {
  groupNumber: number | null;
  rounds: Match[];
  tournament: any;
}

export interface RoundsResponse {
  data: {
    groups: Round[];
    pagination: Pagination | null;
  };
}

export interface Pagination {
  page: number;
  pageSize?: number;
  perPage?: number;
  totalItems: number;
  totalPages: number;
  formatId?: number;
  unitType?: string;
  unitValue?: number;
}
