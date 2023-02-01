import { AuthService } from './../service/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  user: any

  constructor(
    private authService: AuthService
  ){ }

  ngOnInit(): void {
    this.authService.stateUser().subscribe(res => this.user = res);
  }

}
