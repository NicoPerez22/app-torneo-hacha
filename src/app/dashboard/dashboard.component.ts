import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

type DashboardPath =
  | 'overview'
  | 'teams'
  | 'tournaments'
  | 'market'
  | 'reports'
  | 'settings';

interface DashboardMenuItem {
  readonly path: DashboardPath;
  readonly label: string;
  readonly iconClass: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSidebarOpen = signal(false);

  protected readonly menuItems: readonly DashboardMenuItem[] = [
    { path: 'overview', label: 'Resumen', iconClass: 'fa fa-home' },
    { path: 'teams', label: 'Equipos', iconClass: 'fa fa-shield' },
    { path: 'tournaments', label: 'Torneos', iconClass: 'fa fa-trophy' },
    { path: 'market', label: 'Mercado', iconClass: 'fa fa-users' },
    { path: 'reports', label: 'Reportes', iconClass: 'fa fa-bar-chart' },
    { path: 'settings', label: 'Ajustes', iconClass: 'fa fa-cog' },
  ];

  private readonly activePath = signal<DashboardPath>('overview');
  protected readonly activeLabel = computed(() => {
    const item = this.menuItems.find((it) => it.path === this.activePath());
    return item?.label ?? 'Dashboard';
  });

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncFromUrlAndClose());
    this.syncFromUrlAndClose();
  }

  protected onToggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  protected onCloseSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  private syncFromUrlAndClose(): void {
    const path = this.router.url.split('?')[0].split('#')[0];
    const segment = (path.split('/')[2] || 'overview') as DashboardPath;
    const isValid = this.menuItems.some((i) => i.path === segment);
    this.activePath.set(isValid ? segment : 'overview');
    this.onCloseSidebar();
  }

  protected onResize(): void {
    if (window.innerWidth >= 992) {
      this.isSidebarOpen.set(false);
    }
  }
}
