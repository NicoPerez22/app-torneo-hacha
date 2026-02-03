import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reports } from '../../models/report';
import { TournamentService } from 'src/app/tournament/service/tournament.service';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from 'src/app/service/team.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  @Input() match: any;

  form: FormGroup;
  teams: Array<any> = [];
  players: Array<any> = [];
  events: Array<any> = [
    { id: 1, eventType: 'GOAL' },
    { id: 2, eventType: 'AMARILLA' },
    { id: 3, eventType: 'ROJA' },
    { id: 4, eventType: 'LESION' },
    { id: 5, eventType: 'CAMBIO' },
  ];

  uploadedImages;
  isUploadingImage;

  playersHome;

  private readonly fb = inject(FormBuilder);
  private readonly tournamentService = inject(TournamentService);
  private readonly toastrService = inject(ToastrService)
  private readonly teamService = inject(TeamService)

  ngOnInit(): void {
    this._initForm();
    this._getTeams();

  }

  onSubmit() {
    // let report: Reports = new Reports();
    let report = this._setValues();

    this.tournamentService.setReportMatch(report).subscribe({
      next: (resp) => {
        this.toastrService.success("Partido reportado con exito", "Exito")
      }
    })
  }

  onLoadImage(event) {}

  addGoal(control) {
    const current = Number(control?.value ?? 0);
    control?.setValue(current + 1);
  }

  removeGoal(control) {
    const current = Number(control?.value ?? 0);
    control?.setValue(Math.max(0, current - 1));
  }

  getPlayers(id){
    this.teamService.getPlayersByIdTeam(id).subscribe({
      next: (resp) => {
        this.players = resp.data
      },

      error: () => {
        this.toastrService.error(
          "Error al obtener los jugadores del equipo",
          "Error"
        )
      }
    })
  }

  private _initForm() {
    this.form = this.fb.group({
      homeGoals: [0, Validators.required],
      awayGoals: [0, Validators.required],
      events: [null],
      idTeamReports: [''],
      idPlayer: ['']
    });
  }

  private _getTeams() {
    this.tournamentService.getTeamsByIdRound(this.match.idRound).subscribe({
      next: (resp) => {
        this.teams = resp.data
      },

      error: () => {
        this.toastrService.error(
          "Error al obtener los jugadores del equipo",
          "Error"
        )
      }
    })
  }

  private _setValues() {
    let dto = {
      roundId: this.match?.idRound,
      tournamentId: this.match?.tournament?.id,
      homeGoals: this.form.get('homeGoals').value,
      awayGoals: this.form.get('awayGoals').value,
      events: [],
    };

    return dto;
  }

  // {
  //   "roundId": 798,
  //   "tournamentId": 31,
  //   "homeGoals": 1,
  //   "awayGoals": 4,
  //   "events": [
  //     { "teamId": 12, "playerId": 55, "eventType": "GOAL", "minute": 12 },
  //     { "teamId": 12, "playerId": 55, "eventType": "GOAL", "minute": 44 },
  //     { "teamId": 13, "playerId": 77, "eventType": "YELLOW", "minute": 80 },
  //     { "teamId": 13, "playerId": 78, "eventType": "RED", "minute": 90 },
  //     { "teamId": 13, "playerId": 78, "eventType": "INJURY", "minute": 89, "notes": "Tirón muscular" }
  //   ]
  // }
}
