import { AuthService } from 'src/app/service/auth.service';
import { TeamService } from './../../service/team.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlayersComponent } from './players/players.component';
import Swal from 'sweetalert2/dist/sweetalert2.js'

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css']
})
export class MyTeamComponent implements OnInit {

  @ViewChild('playersComponent') PlayersComponent;

  teamsList: Array<any> = [];
  user: any;
  myTeam: any
  myTeamEnable: boolean = false
  playersTeamsList: Array<any> = [];

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private modalService: NgbModal
  ){ }

  ngOnInit(): void {
    this.user = this.authService.returnUserLogged();
    this.teamService.getTeamByID(this.user.teamPlayId)
    .subscribe(res => {
      this.myTeam = res

      if(this.myTeam){
        this.myTeamEnable = true
        this.playersTeamsList = this.myTeam.players;
      }
    })

  }

  openModalSearchPlayers(){
    this.modalService.open(PlayersComponent)
  }

  onDelete(id){
    this.teamService.deletePlayer(id)
    .subscribe(res => {
      if(res){
        Swal.fire({
          title: 'Error!',
          text: 'Do you want to continue',
          icon: 'success',
          Animation: true,
          position: 'top-end'
        })
      }
    })
  }

}
