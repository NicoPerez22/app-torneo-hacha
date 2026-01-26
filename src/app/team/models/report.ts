export class Reports {
    roundId: number;
    tournamentId: number;
    homeGoals: number;
    awayGoals: number;
    events: EventsReports[];
}

export class EventsReports {
    teamId: number;
    playerId: number;
    eventType: string;
    minute: number;
    nota: string;
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
  
  export type MatchEventType = 'GOAL' | 'YELLOW' | 'RED' | 'SUB' | 'NOTE';
  
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