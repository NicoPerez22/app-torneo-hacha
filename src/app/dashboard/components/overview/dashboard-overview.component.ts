import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DashboardResume,
  DashboardService,
} from 'src/app/dashboard/service/dashboard.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-dashboard-overview',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css'],
})
export class DashboardOverviewComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly resume = signal<DashboardResume | null>(null);

  ngOnInit(): void {
    this.dashboardService
      .getResume()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.resume.set(response.data ?? null);
      });
  }
}
