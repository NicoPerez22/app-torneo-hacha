import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { LoginService } from 'src/app/service/login.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-header',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  protected readonly userSignal = this.authService.userSignal;
  protected readonly isScrolled = signal(false);

  private readonly mainNav = viewChild<ElementRef<HTMLElement>>('mainNav');
  private readonly navToggler = viewChild<ElementRef<HTMLElement>>('navToggler');

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  logout() {
    this.loginService.logout();
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToTeam() {
    this.router.navigate(['/equipos/' + this.userSignal()?.teams[0]?.id]);
  }

  collapseMobileMenu() {
    const collapseEl = this.mainNav()?.nativeElement;
    if (!collapseEl) return;

    if (!collapseEl.classList.contains('show')) return;

    const w = window as any;
    const bs = w?.bootstrap;

    if (bs?.Collapse?.getOrCreateInstance) {
      const instance = bs.Collapse.getOrCreateInstance(collapseEl, {
        toggle: false,
      });
      instance.hide();
      return;
    }

    collapseEl.classList.remove('show');
    (collapseEl as any).style && ((collapseEl as any).style.height = '');
    this.navToggler()?.nativeElement?.setAttribute('aria-expanded', 'false');
  }
}
