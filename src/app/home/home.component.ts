import { Component, inject } from '@angular/core';
import { LoginService } from '../service/login.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-home',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  protected readonly loginService = inject(LoginService);
  protected readonly currentUser = this.loginService.currentUser;
}
