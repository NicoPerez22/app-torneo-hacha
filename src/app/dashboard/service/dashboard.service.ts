import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DashboardResume {
  readonly totalUsers?: number;
  readonly totalTeams?: number;
  readonly totalTournaments?: number;
}

interface DashboardResumeResponse {
  readonly data?: DashboardResume | null;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.API_URL;

  getResume(): Observable<DashboardResumeResponse> {
    return this.http.get<DashboardResumeResponse>(
      `${this.apiUrl}dashboard/resume`,
    );
  }
}
