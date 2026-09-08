export interface Reports {
    roundId: number | undefined;
    tournamentId: number | undefined;
    homeGoals: number;
    awayGoals: number;
    events: EventsReports[];
}

export interface EventsReports {
    teamId: number;
    playerId: number;
    eventType: MatchEventType;
    minute: number | null;
    nota?: string | null;
}


export interface Player {
    id: number;
    name: string;
    teamId: number;
  }
  
  export interface Team {
    id: number;
    name: string;
  }
  
  export type MatchEventType = 'GOAL' | 'YELLOW' | 'RED' | 'SUB' | 'NOTE' | 'INJURY';
  
  export interface MatchEventPayload {
    type: MatchEventType;
    minute: number;
    teamSide: 'HOME' | 'AWAY';
    playerId: number | null;
    detail?: string | null;
  }
  
  export interface MatchForReport {
    id: number;
    homeTeam: Team;
    awayTeam: Team;
    homePlayers: Player[];
    awayPlayers: Player[];
  }

export interface RoundMatchData {
  idRound: number;
  tournamentId?: number;
  tournament?: { id: number };
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName?: string;
  awayTeamName?: string;
  home?: string;
  away?: string;
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  homeLogo?: { secureUrl?: string | null };
  awayLogo?: { secureUrl?: string | null };
}