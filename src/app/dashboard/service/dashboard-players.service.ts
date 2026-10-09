import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DashboardPlayer, PlayerFormValue, PlayersResponse } from '../components/players/dashboard-player.interface';

@Injectable({ providedIn: 'root' })
export class DashboardPlayersService {
  private readonly url = environment.API_URL + 'player';

  constructor(private readonly http: HttpClient) {}

  getPlayers(): Observable<DashboardPlayer[]> {
    return this.http.get<PlayersResponse<DashboardPlayer[] | null>>(this.url).pipe(
      map(response => {
        this.checkResponse(response);
        return response.data ?? [];
      }),
    );
  }

  createPlayer(value: PlayerFormValue): Observable<unknown> {
    return this.http.post<PlayersResponse<unknown>>(this.url, value).pipe(
      map(response => this.checkResponse(response, true)),
    );
  }

  updatePlayer(id: number, value: PlayerFormValue): Observable<unknown> {
    const { teamId, ...details } = value;
    // The PATCH endpoint updates the entity directly, unlike POST which accepts teamId.
    const payload = { ...details, idTeam: teamId, team: { id: teamId } };
    return this.http.patch<PlayersResponse<unknown>>(this.url + '/' + id, payload).pipe(
      map(response => this.checkResponse(response, true)),
    );
  }

  deletePlayer(id: number): Observable<unknown> {
    return this.http.delete<PlayersResponse<unknown>>(this.url + '/' + id).pipe(
      map(response => this.checkResponse(response, true)),
    );
  }

  private checkResponse(response: PlayersResponse<unknown>, requireData = false): unknown {
    // This API may return HTTP 200 while reporting a failure inside the response.
    if (response.httpCode >= 400 || (requireData && response.data == null)) {
      throw new Error(response.message || 'No se pudo completar la operación.');
    }
    return response.data;
  }
}