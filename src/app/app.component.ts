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
import { distinctUntilChanged } from 'rxjs';

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
    public loginService: LoginService,
    public authService: AuthService,
  ) {}

  @ViewChild('hdr', { static: true }) hdr!: ElementRef<HTMLElement>;
  headerH = 0;

  ngOnInit(): void {
    // 1) Al cargar, si ya hay sesión, obtener perfil
    const initialUser = this.loginService.user ?? this.authService?.getUser();
    if (initialUser?.id) this._getProfile(initialUser.id);

    // 2) Al loguear/desloguear, reaccionar sin recargar la app
    this.loginService.user$
      .pipe(distinctUntilChanged((a, b) => a?.id === b?.id))
      .subscribe((user) => {
        if (user?.id) {
          this._getProfile(user.id);
        } else {
          this.userActive = null;
          this.teamActive = null;
        }
      });
  }

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
