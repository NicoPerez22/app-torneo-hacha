export interface RankingRow {
  teamId: number;
  teamName: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  matchesPlayed: number;
  logoUrl?: string;
  logoPublicId?: string;
  logoOriginalName?: string;
}

export interface RankingTable {
  groupNumber: number | null;
  groupName: string;
  rows: RankingRow[];
}

export interface RankingTablesResponse {
  data: {
    tables: RankingTable[];
  };
}