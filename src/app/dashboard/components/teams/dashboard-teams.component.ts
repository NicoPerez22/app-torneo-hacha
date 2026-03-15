import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/service/team.service';

@Component({
  selector: 'app-dashboard-teams',
  templateUrl: './dashboard-teams.component.html',
  styleUrls: ['./dashboard-teams.component.css'],
})
export class DashboardTeamsComponent implements OnInit {
  loading = false;
  teams: any[] = [];

  constructor(private readonly teamService: TeamService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    
    this.teamService.getTeams().subscribe({
      next: (res) => {
        this.teams = res?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}

