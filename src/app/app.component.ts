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
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  userActive: any;
  teamActive: any;

  constructor(
    private userSerivce: UserService,
    public loginService: LoginService
  ) {}

  @ViewChild('hdr', { static: true }) hdr!: ElementRef<HTMLElement>;
  headerH = 0;

  ngOnInit(): void {
    this._getProfile(this.loginService.user.id)
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateHeaderHeight());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateHeaderHeight();
  }

  private _getProfile(id) {
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
