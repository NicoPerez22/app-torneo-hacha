export interface RankingEntry {
  teamName: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  logoUrl?: string;
}

export interface RankingResponse {
  data: RankingEntry[];
}
