import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DisabledPlayersService {

  constructor(private http: HttpClient) { }

  API_URL = environment.API_URL;

  getPlayers(): Observable<any> {
    const url = this.API_URL + `player/disabled`;
    return this.http.get<any>(url);
  }
}
