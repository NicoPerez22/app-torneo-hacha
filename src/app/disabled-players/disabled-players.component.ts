import { Component } from '@angular/core';
import { TeamService } from '../service/team.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { TeamCreateComponent } from '../team/team-create/team-create.component';
import { ManagerComponent } from '../team/my-team/manager/manager.component';
import { DisabledPlayersService } from './service/disabled-players.service';

@Component({
  selector: 'app-disabled-players',
  templateUrl: './disabled-players.component.html',
  styleUrls: ['./disabled-players.component.css']
})
export class DisabledPlayersComponent {
  teams: Array<any> = [];
  user: any;

  constructor(
    private disabledPlayersService: DisabledPlayersService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private modalService: NzModalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this._getTeams();
  }

  // onDelete(id) {
  //   this.teamService.deleteTeam(id).subscribe({
  //     next: (resp) => {
  //       this.teams = resp.data;
  //       this.toastrService.success(resp.message);
  //     },

  //     error: (err) => {
  //       this.toastrService.error(err);
  //     },
  //   });
  // }

  // onCreate(): void {
  //   this.modalService.create({
  //     nzTitle: 'Crear equipo',
  //     nzContent: TeamCreateComponent,
  //     nzWidth: 800,
  //     nzFooter: null,
  //   });
  // }

  // openModalAssignManager() {
  //   const modal = this.modalService.create({
  //     nzTitle: 'Asignar Manager',
  //     nzContent: ManagerComponent,
  //     nzWidth: 800,
  //     nzFooter: null,
  //   });

  //   modal.afterClose.subscribe((result) => {
  //     if (result === true) {
  //       this._getTeams();
  //     }
  //   });
  // }

  // onViewTeam(id) {
  //   this.router.navigate(['equipos/' + id]);
  // }

  private _getTeams() {
    this.disabledPlayersService.getPlayers().subscribe({
      next: (resp) => {
        this.teams = resp.data;
      },
    });
  }
}
