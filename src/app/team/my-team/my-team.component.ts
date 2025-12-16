import { AuthService } from 'src/app/service/auth.service';
import { TeamService } from './../../service/team.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlayersComponent } from './players/players.component';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManagerComponent } from './manager/manager.component';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css'],
})
export class MyTeamComponent implements OnInit {
  @ViewChild('playersComponent') PlayersComponent;
  params: any;

  spinner: boolean = true;

  teamsList: Array<any> = [];
  user: any;
  myTeam: any;
  myTeamEnable: boolean = false;
  playersTeamsList: Array<any> = [];
  p: number = 0;

  constructor(
    private teamService: TeamService,
    private spinnerService: NgxSpinnerService,
    private authService: AuthService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.params;
    this.user = this.authService.getUser();

    this._getTeamById(this.params.id);
  }

  openModalSearchPlayers() {
    const modal = this.modalService.create({
      nzTitle: 'Buscar jugador',
      nzContent: PlayersComponent,
      nzWidth: 800,
      nzFooter: null,
    });

    modal.afterClose.subscribe((result) => {
      if (result === true) {
        this._getTeamById(this.params.id);
      }
    });
  }

  openModalAssignManager() {
    const modal = this.modalService.create({
      nzTitle: 'Asignar Manager',
      nzContent: ManagerComponent,
      nzWidth: 800,
      nzFooter: null,
    });

    modal.afterClose.subscribe((result) => {
      if (result === true) {
        this._getTeamById(this.params.id);
      }
    });
  }

  onDelete(id) {
    this.teamService.deletePlayer(id).subscribe((res) => {
      if (res) {
        Swal.fire({
          title: 'Error!',
          text: 'Do you want to continue',
          icon: 'success',
          Animation: true,
          position: 'top-end',
        });
      }
    });
  }

  onChangePlayer(player) {
    player.loading = true;

    setTimeout(() => {
      player.loading = false;

      if (player.isTransfer) {
        this._assignTransferPlayer(player.id, false);
        return;
      }

      this._assignTransferPlayer(player.id, true);
    }, 1000);
  }

  private _getTeamById(id) {
    this.spinnerService.show();
    this.teamService.getTeamByID(id).subscribe({
      next: (res) => {
        this.myTeam = res.data;
        this.spinnerService.hide();

        if (this.myTeam) {
          this.myTeamEnable = true;
          this.playersTeamsList = this.myTeam.players;
        }
      },

      error: () => {
        this.spinnerService.hide();
      },
    });
  }

  private _assignTransferPlayer(id, isTransfer) {
    this.spinnerService.show();
    this.teamService.assignTransferPlayer(id, isTransfer).subscribe({
      next: (res) => {
        this.spinnerService.hide();
        Swal.fire({
          title: 'Success!',
          text: 'Player transfered successfully',
          icon: 'success',
          Animation: true,
          position: 'top-end',
        });
      },

      error: () => {
        this.spinnerService.hide();
      },
    });
  }
}
