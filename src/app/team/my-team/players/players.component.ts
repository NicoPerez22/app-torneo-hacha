import { ToastrService } from 'ngx-toastr';
import { TeamService } from './../../../service/team.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {

  @Input() myTeam;
  @Input() user;
  playersList: Array<any> = [];
  team;
  players: Array<any> = [];
  resultPlayer: Array<any> = [];

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private toastService: ToastrService
  ){ }

  ngOnInit(): void {

  }

  sendPlayer(content){
    this.modalService.open(content, { size: 'xl' });
  }

  addPlayer(player){
    const invitacion = {
      message: 'Tiene una solicitud disponible',
      estado: true,
      userId: player.id,
      teamId: this.myTeam.id
    }

    this.teamService.sendInvitacionTeam(invitacion)
    .subscribe((res) => {
      console.log(res)
    })
  }

  onAddPlayer(player){
    //SOLO ADMINS

    const playerPost = {
      username: player.username,
      userId: player.id,
      teamId: this.myTeam.id
    }
    
    this.teamService.addPlayer(playerPost)
    .subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  searchPlayerKeyUp(value){
    if(value.length > 3){
      this.teamService.getUser()
      .subscribe(res => {
        this.playersList = res;
        this.resultPlayer = this.playersList.filter(elem => elem.username == value);
      })
    }
  }

  reset(value){
    if(value.length == 0){
      this.resultPlayer = this.playersList;
    }
  }

  confirmPlayers(){
    // this.teamService.updateTeam(this.players, this.myTeam)
    // .then(() => {
    //   this.toastService.success('Jugador guardado con exito', 'Exito')
    // })
  }

}
