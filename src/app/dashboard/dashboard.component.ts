import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
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

@Component({
  selector: 'app-dashboard',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent {
  private readonly router = inject(Router);

  readonly isSidebarOpen = signal(false);

  readonly menuItems: Array<{
    path: DashboardPath;
    label: string;
    iconClass: string;
  }> = [
    { path: 'overview', label: 'Resumen', iconClass: 'fa fa-home' },
    { path: 'teams', label: 'Equipos', iconClass: 'fa fa-shield' },
    { path: 'tournaments', label: 'Torneos', iconClass: 'fa fa-trophy' },
    { path: 'market', label: 'Mercado', iconClass: 'fa fa-users' },
    { path: 'reports', label: 'Reportes', iconClass: 'fa fa-bar-chart' },
    { path: 'settings', label: 'Ajustes', iconClass: 'fa fa-cog' },
  ];

  readonly activePath = signal<DashboardPath>('overview');
  readonly activeLabel = computed(() => {
    const item = this.menuItems.find((it) => it.path === this.activePath());
    return item?.label ?? 'Dashboard';
  });

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.syncFromUrlAndClose());
    this.syncFromUrlAndClose();
  }

  toggleSidebar() {
    this.isSidebarOpen.update((open) => !open);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  private syncFromUrlAndClose() {
    const path = this.router.url.split('?')[0].split('#')[0];
    const segment = (path.split('/')[2] || 'overview') as DashboardPath;
    const isValid = this.menuItems.some((i) => i.path === segment);
    this.activePath.set(isValid ? segment : 'overview');
    this.closeSidebar();
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 992) this.isSidebarOpen.set(false);
  }
}
