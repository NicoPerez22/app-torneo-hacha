import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';

interface BootstrapCollapse {
  hide(): void;
}

interface BootstrapCollapseApi {
  getOrCreateInstance(
    element: HTMLElement,
    config: { toggle: boolean },
  ): BootstrapCollapse;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class HeaderComponent {
  private readonly _authService = inject(AuthService);
  private readonly _loginService = inject(LoginService);
  private readonly _router = inject(Router);

  protected readonly userSignal = this._authService.userSignal;
  protected readonly isScrolled = signal(false);

  private readonly _mainNav =
    viewChild<ElementRef<HTMLDivElement>>('mainNav');
  private readonly _navToggler =
    viewChild<ElementRef<HTMLButtonElement>>('navToggler');

  protected onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  protected onLogout(): void {
    this._loginService.logout();
  }

  protected onNavigateToProfile(): void {
    void this._router.navigate(['/profile']);
  }

  protected onNavigateToTeam(): void {
    const teamId = this.userSignal()?.teams?.[0]?.id;
    if (teamId === undefined || teamId === null) {
      return;
    }

    void this._router.navigate(['/equipos', teamId]);
  }

  protected onCollapseMobileMenu(): void {
    const collapseElement = this._mainNav()?.nativeElement;
    if (!collapseElement?.classList.contains('show')) {
      return;
    }

    const bootstrap = (
      window as Window & {
        bootstrap?: { Collapse?: BootstrapCollapseApi };
      }
    ).bootstrap;

    if (bootstrap?.Collapse) {
      const instance = bootstrap.Collapse.getOrCreateInstance(collapseElement, {
        toggle: false,
      });
      instance.hide();
      return;
    }

    collapseElement.classList.remove('show');
    collapseElement.style.height = '';
    this._navToggler()?.nativeElement.setAttribute('aria-expanded', 'false');
  }
}
