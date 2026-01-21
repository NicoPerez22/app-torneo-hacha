export interface Match {
  id?: number;
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
  groupNumber: number;
  rounds: Match[];
}

export interface RoundsResponse {
  data: {
    groups: Round[];
    pagination: Pagination;
  };
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
