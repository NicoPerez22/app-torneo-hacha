import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DisabledPlayerDto {
  id?: number;
  name: string;
  lastName: string;
  unavailableUntil?: string;
  logo?: { secureUrl?: string };
  team?: {
    name?: string;
    logo?: { secureUrl?: string };
  };
}

@Injectable({
  providedIn: 'root',
})
export class DisabledPlayersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.API_URL;

  getInjuryPlayers(): Observable<{ data: DisabledPlayerDto[] }> {
    const url = `${this.apiUrl}player/injury`;
    return this.http.get<{ data: DisabledPlayerDto[] }>(url);
  }
}
