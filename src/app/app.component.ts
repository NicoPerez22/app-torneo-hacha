import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { AuthService } from './service/auth.service';
import { LoginService } from './service/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  constructor(public loginService: LoginService) {}

  @ViewChild('hdr', { static: true }) hdr!: ElementRef<HTMLElement>;
  headerH = 0;

  ngAfterViewInit(): void {
    // medir después de pintar
    setTimeout(() => this.updateHeaderHeight());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateHeaderHeight();
  }

  private updateHeaderHeight() {
    if (!this.hdr) return;
    const el = this.hdr.nativeElement;
    // Si el header interno usa fixed-top, medimos la navbar
    const fixed = el.querySelector('.navbar.fixed-top') as HTMLElement | null;
    const target = fixed ?? el;
    this.headerH = target.getBoundingClientRect().height || 0;
  }
}
