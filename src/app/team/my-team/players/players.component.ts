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
  teamsList: Array<any> = [];
  players: Array<any> = [];
  resultPlayer: Array<any> = [];

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private toastService: ToastrService
  ){ }

  ngOnInit(): void {
    this.teamService.getPLayers().subscribe((res) =>  {
      this.playersList = res;
      this.resultPlayer = res
    })
  }

  sendPlayer(content){
    this.modalService.open(content, { size: 'xl' });
  }

  addPlayer(player){
    this.players.push(player)
    console.log(this.players)
  }

  searchPlayerKeyUp(value){
    if(value.length > 3){
      this.resultPlayer = this.playersList.filter(elem => elem.userName == value);
    }
  }

  reset(value){
    if(value.length == 0){
      this.resultPlayer = this.playersList;
    }
  }

  confirmPlayers(){
    this.teamService.updateTeam(this.players, this.myTeam)
    .then(() => {
      this.toastService.success('Jugador guardado con exito', 'Exito')
    })
  }

}
