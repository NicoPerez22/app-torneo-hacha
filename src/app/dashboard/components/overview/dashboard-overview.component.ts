import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from 'src/app/dashboard/service/dashboard.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-dashboard-overview',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css'],
})
export class DashboardOverviewComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly resume = signal<any>(null);

  ngOnInit(): void {
    this.dashboardService.getResume().subscribe((res) => {
      this.resume.set(res?.data);
    });
  }
}
