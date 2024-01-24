import { Component } from '@angular/core';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ivg-latam';
  user

  constructor(
    private authService: AuthService
  ) {
    this.user = this.authService.getUser();
  }
}
