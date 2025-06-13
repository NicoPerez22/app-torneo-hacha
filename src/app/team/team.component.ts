import { TeamService } from './../service/team.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TeamCreateComponent } from './team-create/team-create.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
})
export class TeamComponent implements OnInit {
  teams: Array<any> = [];

  constructor(
    private teamService: TeamService,
    private toastrService: ToastrService,
    private modalService: NzModalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
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
