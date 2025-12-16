import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from './service/auth.service';
import { LoginService } from './service/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  user;

  constructor(public loginService: LoginService) {}

  @ViewChild('hdr', { static: true }) hdr!: ElementRef<HTMLElement>;
  headerH = 0;

  ngOnInit(): void {
    this.user = this.loginService.user;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateHeaderHeight());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateHeaderHeight();
  }

  private updateHeaderHeight() {
    if (!this.hdr) return;
    const el = this.hdr.nativeElement;
    const fixed = el.querySelector('.navbar.fixed-top') as HTMLElement | null;
    const target = fixed ?? el;
    this.headerH = target.getBoundingClientRect().height || 0;
  }
}
