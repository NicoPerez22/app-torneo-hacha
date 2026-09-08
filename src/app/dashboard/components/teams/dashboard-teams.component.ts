import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeamService } from 'src/app/service/team.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

interface DashboardTeam {
  readonly id?: number | string;
  readonly name?: string;
  readonly logo?: {
    readonly secureUrl?: string;
  };
  readonly owner?: {
    readonly name?: string;
    readonly lastName?: string;
  };
}

interface TeamsResponse {
  readonly data?: DashboardTeam[] | null;
}

@Component({
  selector: 'app-dashboard-teams',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-teams.component.html',
  styleUrls: ['./dashboard-teams.component.css'],
})
export class DashboardTeamsComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly teams = signal<DashboardTeam[]>([]);

  ngOnInit(): void {
    this.onReload();
  }

  protected onReload(): void {
    this.loading.set(true);

    this.teamService
      .getTeams()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: TeamsResponse) => {
          this.teams.set(response.data ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
