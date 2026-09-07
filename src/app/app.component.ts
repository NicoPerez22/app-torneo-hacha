import {
  afterNextRender,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { AuthService } from './service/auth.service';
import { SHARED_UI_IMPORTS } from './shared/ui';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [...SHARED_UI_IMPORTS, HeaderComponent, NgxSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  protected readonly userSignal = this.authService.userSignal;
  protected readonly headerH = signal(0);

  private readonly hdr = viewChild<ElementRef<HTMLElement>>('hdr');

  constructor() {
    afterNextRender(() => this.updateHeaderHeight());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateHeaderHeight();
  }

  private updateHeaderHeight() {
    const host = this.hdr()?.nativeElement;
    if (!host) return;
    const fixed = host.querySelector('.navbar.fixed-top') as HTMLElement | null;
    const target = fixed ?? host;
    this.headerH.set(target.getBoundingClientRect().height || 0);
  }
}
