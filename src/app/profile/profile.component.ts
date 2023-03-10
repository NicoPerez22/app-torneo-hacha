import { TeamService } from './../service/team.service';
import { AuthService } from 'src/app/service/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  myUser: any;

  constructor(
    private authService: AuthService,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.authService.stateUser().subscribe(res => this.myUser = res)
    this.teamService.getPLayers().subscribe((res) => {
      this.myUser = res.find(user => user.email == this.myUser.email)
    })
  }

}
