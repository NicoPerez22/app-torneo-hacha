import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from 'src/app/service/team.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';
import { TeamPlayer, TeamView } from '../../models/team';

@Component({
  selector: 'app-players',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
})
export class PlayersComponent implements OnInit {
  protected readonly form: FormGroup<{
    teamOrigin: FormControl<number | null>;
    player: FormControl<number | null>;
    teamDestination: FormControl<number | null>;
  }>;
  protected teams: TeamView[] = [];
  protected players: TeamPlayer[] = [];

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly teamService = inject(TeamService);
  private readonly toastrService = inject(ToastrService);
  private readonly modalRef = inject(NzModalRef);

  constructor() {
    this.form = this.fb.group({
      teamOrigin: this.fb.control<number | null>(null, Validators.required),
      player: this.fb.control<number | null>(null, Validators.required),
      teamDestination: this.fb.control<number | null>(null, Validators.required),
    });
  }

  ngOnInit(): void {
    this._getTeams();
  }

  protected onChangeTeam(): void {
    this._getPlayersByIdTeam(this.form.controls.teamOrigin.value);
  }

  protected onSubmit(): void {
    const id = this.form.controls.player.value;
    const idTeam = this.form.controls.teamDestination.value;

    this.teamService.transferPalyer(id, idTeam).subscribe({
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

  private _getPlayersByIdTeam(id: number | null): void {
    this.teamService.getPlayersByIdTeam(id).subscribe({
      next: (resp) => {
        this.players = resp.data ?? [];
      },

      error: () => {},
    });
  }
}
