import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent {
  isSidebarOpen = false;

  readonly menuItems: Array<{
    path: 'overview' | 'teams' | 'tournaments' | 'market' | 'reports' | 'settings';
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

  activePath: DashboardComponent['menuItems'][number]['path'] = 'overview';

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.syncFromUrlAndClose());
    this.syncFromUrlAndClose();
  }

  get activeLabel(): string {
    const item = this.menuItems.find((it) => it.path === this.activePath);
    return item?.label ?? 'Dashboard';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  private syncFromUrlAndClose() {
    const path = this.router.url.split('?')[0].split('#')[0];
    const segment = (path.split('/')[2] || 'overview') as any; // /dashboard/<segment>
    const isValid = this.menuItems.some((i) => i.path === segment);
    this.activePath = isValid ? segment : 'overview';

    // UX: en mobile cerramos el drawer cuando navegamos
    this.closeSidebar();
  }

  @HostListener('window:resize')
  onResize() {
    // En desktop lo dejamos siempre "abierto visualmente" vía CSS; en mobile cerramos al agrandar.
    if (window.innerWidth >= 992) this.isSidebarOpen = false;
  }
}
