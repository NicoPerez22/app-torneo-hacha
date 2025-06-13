import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from 'src/app/service/team.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
})
export class PlayersComponent implements OnInit {
  form: FormGroup;
  teams: Array<any> = [];
  players: Array<any> = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly teamService: TeamService,
    private readonly toasteService: ToastrService,
    private readonly modalRef: NzModalRef,
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._getTeams();
  }

  onChangeTeam() {
    this._getPlayersByIdTeam(this.form.get('teamOrigin').value);
  }

  onSubmit() {
    const id = this.form.get('player').value;
    const idTeam = this.form.get('teamDestination').value;

    this.teamService.transferPalyer(id, idTeam).subscribe({
      next: (resp) => {
        this.toasteService.success(resp.msg);
        this.modalRef.close(true);
      },

      error: () => {},
    });
  }

  private _initForm() {
    this.form = this.fb.group({
      teamOrigin: [null, Validators.required],
      player: [null, Validators.required],
      teamDestination: [null, Validators.required],
    });
  }

  private _getTeams() {
    this.teamService.getTeams().subscribe({
      next: (resp) => {
        this.teams = resp.data;
      },
    });
  }

  private _getPlayersByIdTeam(id) {
    this.teamService.getPlayersByIdTeam(id).subscribe({
      next: (resp) => {
        this.players = resp.data;
      },

      error: () => {},
    });
  }
}
