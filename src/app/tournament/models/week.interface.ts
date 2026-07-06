export type WeekStageType = 'MATCHDAY' | 'KO' | string;

export interface SeasonWeekAssignment {
  id: number;
  tournamentId: number;
  tournamentName: string;
  stageType: WeekStageType;
  stageNumber: number;
}

export interface SeasonWeek {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  assignments: SeasonWeekAssignment[];
}

export interface SeasonWeeksResponse {
  data: SeasonWeek[] | null;
  httpCode?: number;
  message?: string;
}

/** Compatibilidad con el modal de asignación. */
export interface TournamentWeekDate {
  matchday: number;
  tournamentId: number;
  tournamentName: string;
  assignmentType?: WeekStageType;
  value?: number;
}

export interface WeekMatchdayAssignment {
  tournamentId: number;
  stageType: WeekStageType;
  stageNumber: number;
}

export interface AddWeekMatchdaysRequest {
  assignments: WeekMatchdayAssignment[];
}

export interface AddWeekMatchdaysResponse {
  data?: SeasonWeek | null;
  httpCode?: number;
  message?: string;
}

export interface TournamentMatchdayOption {
  key: string;
  type: WeekStageType;
  value: number;
  label: string;
  disabled: boolean;
}

export interface CreateSeasonWeekDto {
  seasonId: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
}

export interface CreateSeasonWeekResponse {
  data?: SeasonWeek | null;
  httpCode?: number;
  message?: string;
}
