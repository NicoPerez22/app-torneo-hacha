import { TeamService } from './../service/team.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TeamCreateComponent } from './team-create/team-create.component';
import { Router } from '@angular/router';
import { ManagerComponent } from './my-team/manager/manager.component';
import { AuthService } from '../service/auth.service';
import { SessionUser } from '../models/user';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';
import { TeamView } from './models/team';

@Component({
  selector: 'app-team',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
})
export class TeamComponent implements OnInit {
  protected readonly teams = signal<TeamView[]>([]);
  protected user: SessionUser | null = null;

  private readonly teamService = inject(TeamService);
  private readonly toastrService = inject(ToastrService);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this._getTeams();
  }

  protected onDelete(id: number): void {
    this.teamService.deleteTeam(id).subscribe({
      next: (resp) => {
        this.teams.set(resp.data ?? []);
        this.toastrService.success(resp.message);
      },

      error: (err) => {
        this.toastrService.error(err);
      },
    });
  }

  protected onCreate(): void {
    const modal = this.modalService.create({
      nzTitle: 'Crear equipo',
      nzContent: TeamCreateComponent,
      nzWidth: 800,
      nzFooter: null,
    });

    modal.afterClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this._getTeams();
    });
  }

  protected onOpenAssignManager(): void {
    const modal = this.modalService.create({
      nzTitle: 'Asignar Manager',
      nzContent: ManagerComponent,
      nzWidth: 800,
      nzFooter: null,
    });

    modal.afterClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result === true) {
        this._getTeams();
      }
    });
  }

  protected onViewTeam(id: number): void {
    void this.router.navigate(['equipos', id]);
  }

  protected onEdit(team: TeamView): void {
    const modal = this.modalService.create({
      nzTitle: 'Editar equipo',
      nzContent: TeamCreateComponent,
      nzWidth: 800,
      nzFooter: null,
      nzData: {
        teamData: team,
      }
    });

    modal.afterClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this._getTeams();
    });
  }

  private _getTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (resp) => {
        this.teams.set(resp.data ?? []);
      },
    });
  }
}
