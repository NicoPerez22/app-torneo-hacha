import { Component, inject, OnInit, signal } from '@angular/core';
import { TeamService } from 'src/app/service/team.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-dashboard-teams',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-teams.component.html',
  styleUrls: ['./dashboard-teams.component.css'],
})
export class DashboardTeamsComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  readonly loading = signal(false);
  readonly teams = signal<any[]>([]);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);

    this.teamService.getTeams().subscribe({
      next: (res) => {
        this.teams.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
