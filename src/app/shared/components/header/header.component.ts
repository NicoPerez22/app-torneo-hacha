import { LoginService } from 'src/app/service/login.service';
import { UserService } from './../../../service/user.service';
import { User } from '../../../models/user';
import { TeamService } from '../../../service/team.service';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() user: any;

  isScrolled = false;

  constructor(private router: Router, public loginService: LoginService) {}

  ngOnInit(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  logout() {
    this.loginService.logout();
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToTeam() {
    this.router.navigate(['/equipos/' + this.user.idTeam]);
  }
}
