import { Observable } from 'rxjs';
import { AuthService } from './../service/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  user: any
  isExistingUser: boolean = false;

  constructor(
    private authService: AuthService
  ){ }

  ngOnInit(): void {
    this.user = this.authService.returnUserLogged();
    if(this.user !== null){
      this.isExistingUser = true;
    }
  }

}
