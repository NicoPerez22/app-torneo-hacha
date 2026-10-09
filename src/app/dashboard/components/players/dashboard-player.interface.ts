export interface PlayerTeam {
  id: number;
  name: string;
}

export interface DashboardPlayer {
  id: number;
  name: string;
  lastName: string;
  position: string;
  valoration: number;
  photo?: string | { url?: string; secureUrl?: string };
  isHabilitado: boolean | number;
  team: PlayerTeam | null;
}

export interface PlayerFormValue {
  name: string;
  lastName: string;
  position: string;
  valoration: number;
  photo: string;
  isHabilitado: boolean;
  teamId: number;
}

export interface PlayersResponse<T> {
  data: T;
  httpCode?: number;
  message?: string;
}