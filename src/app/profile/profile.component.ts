import { TeamService } from './../service/team.service';
import { AuthService } from 'src/app/service/auth.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  myUser: any;
  solicitudes: Array<any> = [];

  constructor(
    private authService: AuthService,
    private teamService: TeamService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.myUser = this.authService.returnUserLogged();
    this.teamService.getInvitacionTeam(this.myUser.id)
    .subscribe(res => {
      this.solicitudes = res
    })
  }

  openSolicitudes(content){
    this.modalService.open(content, { size: 'xl' });
  }

  aceptarSolicitud(solicitud){
    const invitacion = {
      message: 'Tiene una solicitud disponible',
      estado: false,
      username: this.myUser.username,
      userId: solicitud.userId,
      isTransferencia: false,
      teamId: solicitud.teamId
    }

    this.teamService.aceptarInvitacion(invitacion)
    .subscribe(res => console.log(res))
  }
}
