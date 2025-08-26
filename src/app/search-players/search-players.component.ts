import { Component, OnInit, TemplateRef } from '@angular/core';
import { TeamService } from '../service/team.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-players',
  templateUrl: './search-players.component.html',
  styleUrls: ['./search-players.component.css'],
})
export class SearchPlayersComponent implements OnInit {
  playersList: Array<any> = [];
  columns: Array<any> = [];
  players: Array<any> = [];

  player;

  isVisible: boolean = false;
  form: FormGroup;

  constructor(
    private teamService: TeamService,
    private spinnerService: NgxSpinnerService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this._getPlayers();
  }

  onBird(player): void {
    this._initForm();
    this._getPlayerMyTeam();

    this.player = player;

    this.isVisible = true;
    this.form.get('playerOut').patchValue(player?.fullName);
    this.form.get('playerOut').disable();
  }

  onSubmit(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  private _getPlayers() {
    this.spinnerService.show();
    this.teamService.getPlayers().subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.playersList = response.data;
      },
      error: (error) => {
        this.spinnerService.hide();
      },
    });
  }

  private _getPlayerMyTeam() {
    // this.teamService.(id).subscribe({
    //   next: (resp: any) => {
    //   }
    // })
  }

  private _initForm() {
    this.form = this.fb.group({
      playerOut: [null],
      playerIn: [null],
    });
  }
}
