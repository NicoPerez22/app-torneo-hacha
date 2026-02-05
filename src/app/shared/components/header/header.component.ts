import { LoginService } from 'src/app/service/login.service';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() user: any;

  isScrolled = false;

  @ViewChild('mainNav') mainNav?: ElementRef<HTMLElement>;
  @ViewChild('navToggler') navToggler?: ElementRef<HTMLElement>;

  constructor(private router: Router, public loginService: LoginService) {}

  ngOnInit(): void {
    console.log(this.user)
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  logout() {
    this.loginService.logout();
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToTeam() {
    console.log(this.user)
    this.router.navigate(['/equipos/' + this.user?.teams[0]?.id]);
  }

  collapseMobileMenu() {
    const collapseEl = this.mainNav?.nativeElement;
    if (!collapseEl) return;

    // Solo colapsar si está abierto (en desktop no debería tener .show)
    if (!collapseEl.classList.contains('show')) return;

    const w = window as any;
    const bs = w?.bootstrap;

    if (bs?.Collapse?.getOrCreateInstance) {
      const instance = bs.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
      instance.hide();
      return;
    }

    // Fallback si no está disponible la API global de Bootstrap
    collapseEl.classList.remove('show');
    (collapseEl as any).style && ((collapseEl as any).style.height = '');
    this.navToggler?.nativeElement?.setAttribute('aria-expanded', 'false');
  }
}
