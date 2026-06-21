import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from './service/auth.service';
import { LoginService } from './service/login.service';
import { UserService } from './service/user.service';
import { distinctUntilChanged } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private userSerivce = inject(UserService);
  private loginService = inject(LoginService);

  userActive: any;
  teamActive: any;

  protected userSignal = this.authService.userSignal;

  @ViewChild('hdr', { static: true }) hdr!: ElementRef<HTMLElement>;
  headerH = 0;

  ngAfterViewInit(): void {
    setTimeout(() => this.updateHeaderHeight());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateHeaderHeight();
  }

  private _getProfile(id: any) {
    if (!id) return;
    this.userSerivce.getUserByID(id).subscribe({
      next: (resp) => {
        this.userActive = resp.data.user;
        this.teamActive = resp.data;
      },
    });
  }

  private updateHeaderHeight() {
    if (!this.hdr) return;
    const el = this.hdr.nativeElement;
    const fixed = el.querySelector('.navbar.fixed-top') as HTMLElement | null;
    const target = fixed ?? el;
    this.headerH = target.getBoundingClientRect().height || 0;
  }
}
