import { UserService } from './../../../service/user.service';
import { User } from '../../../models/user';
import { TeamService } from '../../../service/team.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() user: any;

  teamsList: Array<any> = [];
  playerList: Array<User> = [];
  myUser: any;
  myTeam: any;
  teamExiste: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if(this.user){
      this.userService.getUserByID(this.user.id)
      .subscribe(res => {
        this.user = res
      })
    }
  }

  logout(){
    this.authService.clean()
    this.router.navigate(['/home']);
  }

}
