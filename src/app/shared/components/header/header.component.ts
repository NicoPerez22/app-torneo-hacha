import { LoginService } from 'src/app/service/login.service';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() user: any;

  isScrolled = false;

  constructor(private router: Router, public loginService: LoginService) {}

  ngOnInit(): void {
    console.log(this.user)
  }

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
    console.log(this.user)
    this.router.navigate(['/equipos/' + this.user?.teams[0]?.id]);
  }
}
