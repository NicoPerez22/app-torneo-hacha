import { Component, OnInit } from '@angular/core';
import { LoginService } from '../service/login.service';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentUser: any;
  user: any;

  constructor(
    public loginService: LoginService,
  ) {
  }

  ngOnInit() {
  }

}
