import { UserService } from './../../../service/user.service';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from 'src/app/service/team.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';
import { TeamUser, TeamView } from '../../models/team';

@Component({
  selector: 'app-manager',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css'],
})
export class ManagerComponent implements OnInit {
  protected readonly form: FormGroup<{
    manager: FormControl<number | null>;
    teamDestination: FormControl<number | null>;
  }>;
  protected teams: TeamView[] = [];
  protected users: TeamUser[] = [];

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly teamService = inject(TeamService);
  private readonly userService = inject(UserService);
  private readonly toastrService = inject(ToastrService);
  private readonly modalRef = inject(NzModalRef);

  constructor() {
    this.form = this.fb.group({
      manager: this.fb.control<number | null>(null, Validators.required),
      teamDestination: this.fb.control<number | null>(null, Validators.required),
    });
  }

  ngOnInit(): void {
    this._getTeams();
    this._getUsers();
  }

  protected onSubmit(): void {
    const id = this.form.controls.manager.value;
    const idTeam = this.form.controls.teamDestination.value;

    this.teamService.transferManager(idTeam, id).subscribe({
      next: (resp) => {
        this.toastrService.success(resp.msg);
        this.modalRef.close(true);
      },

      error: () => {},
    });
  }

  private _getTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (resp) => {
        this.teams = resp.data ?? [];
      },
    });
  }

  private _getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (resp) => {
        this.users = (resp.data ?? []) as TeamUser[];
      },

      error: () => {},
    });
  }
}
