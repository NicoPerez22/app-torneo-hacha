import { TeamService } from './../service/team.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TeamCreateComponent } from './team-create/team-create.component';
import { Router } from '@angular/router';
import { ManagerComponent } from './my-team/manager/manager.component';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
})
export class TeamComponent implements OnInit {
  teams: Array<any> = [];
  user: any;

  constructor(
    private teamService: TeamService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private modalService: NzModalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this._getTeams();
  }

  onDelete(id) {
    this.teamService.deleteTeam(id).subscribe({
      next: (resp) => {
        this.teams = resp.data;
        this.toastrService.success(resp.message);
      },

      error: (err) => {
        this.toastrService.error(err);
      },
    });
  }

  onCreate(): void {
    this.modalService.create({
      nzTitle: 'Crear equipo',
      nzContent: TeamCreateComponent,
      nzWidth: 800,
      nzFooter: null,
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
        this._getTeams();
      }
    });
  }

  onViewTeam(id) {
    this.router.navigate(['equipos/' + id]);
  }

  private _getTeams() {
    this.teamService.getTeams().subscribe({
      next: (resp) => {
        this.teams = resp.data;
      },
    });
  }
}
