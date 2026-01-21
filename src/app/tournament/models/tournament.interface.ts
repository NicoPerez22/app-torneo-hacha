export interface Tournament {
  id: number;
  name: string;
  logo?: ImageUrl;
  format?: Format;
  teams?: Team[];
  enableDraft?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Format {
  id: number;
  description: string;
}

export interface Team {
  id: number;
  name: string;
  logo?: ImageUrl;
  logoUrl?: string;
}

export interface ImageUrl {
  url: string;
  secureUrl?: string;
}

export interface TournamentResponse {
  data: Tournament[];
}

export interface TournamentDetailResponse {
  data: Tournament;
}

export interface FormatResponse {
  data: Format[];
}

export interface CreateTournamentRequest {
  name: string;
  teamsIds: number[];
  logo: string | null;
  formatId: number;
  enableDraft: boolean;
}

export interface CreateTournamentResponse {
  tournamentId: number;
  success: boolean;
  message?: string;
}

export interface TeamCountOption {
  id: number;
  value: number;
}
