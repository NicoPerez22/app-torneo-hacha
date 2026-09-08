export class Team {
  id: number | null;
  name: string | null;
  idLogo: number | null;

  constructor(obj?: Partial<Team>) {
    this.id = obj?.id ?? null;
    this.name = obj?.name ?? null;
    this.idLogo = obj?.idLogo ?? null;
  }
}

export interface TeamLogo {
  secureUrl?: string | null;
}

export interface TeamOwner {
  id: number;
  name: string;
  lastName: string;
}

export interface TeamPlayer {
  id: number;
  name: string;
  lastName: string;
  position: string;
  valoration: number;
  isHabilitado: boolean;
  isTransfer: boolean;
  loading?: boolean;
  photo?: TeamLogo | null;
  team?: TeamView | null;
}

export interface TeamView {
  id: number;
  name: string;
  abreviatura?: string | null;
  currentTeam?: boolean;
  logo?: TeamLogo | null;
  owner?: TeamOwner | null;
  players?: TeamPlayer[];
}

export interface TeamUser {
  id: number;
  idRol?: number;
  name?: string;
  lastName?: string;
}
