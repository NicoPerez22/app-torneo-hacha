import { Component } from '@angular/core';
import { AuthService } from './service/auth.service';
import { LoginService } from './service/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public loginService: LoginService) {}
}
