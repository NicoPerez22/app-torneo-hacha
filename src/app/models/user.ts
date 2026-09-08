export interface SessionTeam {
  id?: number;
  name?: string;
  logo?: { secureUrl?: string | null };
}

export interface SessionUser {
  id?: number;
  idRol?: number;
  idTeam?: number;
  name?: string;
  lastName?: string;
  nombre?: string;
  email?: string;
  userName?: string;
  teams?: SessionTeam[];
  logo?: { secureUrl?: string | null };
}

export class User {
  id: number;
  email: string;
  userName: string;
  name: string;
  lastName: string;
  rol: string;
  idRol: number;
  dorsal: number;
  team: string;

  constructor(obj?: Partial<User>) {
    this.id = obj?.id ?? 0;
    this.email = obj?.email ?? '';
    this.userName = obj?.userName ?? '';
    this.name = obj?.name ?? '';
    this.lastName = obj?.lastName ?? '';
    this.rol = obj?.rol ?? '';
    this.idRol = obj?.idRol ?? 0;
    this.dorsal = obj?.dorsal ?? 0;
    this.team = obj?.team ?? '';
  }
}