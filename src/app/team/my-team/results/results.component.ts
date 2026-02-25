import { Component, inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TournamentService } from 'src/app/tournament/service/tournament.service';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from 'src/app/service/team.service';
import { NzModalRef } from 'ng-zorro-antd/modal';

type MatchEventType = 'GOAL' | 'YELLOW' | 'RED' | 'SUB' | 'NOTE';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  @Input() match: any;

  form: FormGroup;
  teams: Array<any> = [];
  readonly eventTypes: Array<{ value: MatchEventType; label: string }> = [
    { value: 'GOAL', label: 'Gol' },
    { value: 'YELLOW', label: 'Amarilla' },
    { value: 'RED', label: 'Roja' },
    { value: 'NOTE', label: 'Lesión' },
  ];

  playersByTeamId: Record<number, Array<any>> = {};
  loadingPlayersByTeamId: Record<number, boolean> = {};

  uploadedImages;
  isUploadingImage;
  isSubmitting = false;

  playersHome;

  private readonly fb = inject(FormBuilder);
  private readonly tournamentService = inject(TournamentService);
  private readonly toastrService = inject(ToastrService);
  private readonly teamService = inject(TeamService);
  private readonly modalRef = inject<NzModalRef | null>(NzModalRef, { optional: true });

  ngOnInit(): void {
    this._initForm();
    this._getTeams();
    this.addEvent();
  }

  onSubmit() {
    if (this.isSubmitting) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toastrService.warning('Completá los campos requeridos', 'Atención');
      return;
    }

    this.isSubmitting = true;

    const report = this._setValues();

    this.tournamentService.getRoundReportPreview(report).subscribe({
      next: () => {
        this.toastrService.success("Partido reportado con exito", "Exito");
        this.modalRef?.close(true);
        this.isSubmitting = false;
      },
      error: () => {
        this.toastrService.error("No se pudo reportar el partido", "Error");
        this.isSubmitting = false;
      },
    });
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

  get eventsArray(): FormArray {
    return this.form.get('events') as FormArray;
  }

  get eventsControls(): AbstractControl[] {
    return this.eventsArray?.controls ?? [];
  }

  addEvent(): void {
    this.eventsArray.push(this._createEventForm());
  }

  removeEvent(index: number): void {
    if (this.eventsArray.length <= 1) return;
    this.eventsArray.removeAt(index);
  }

  onTeamChange(index: number): void {
    const group = this.eventsArray.at(index) as FormGroup;
    const teamId = Number(group.get('teamId')?.value);

    group.get('playerId')?.patchValue(null);

    if (!teamId || Number.isNaN(teamId)) return;
    if (this.playersByTeamId[teamId]?.length) return;
    if (this.loadingPlayersByTeamId[teamId]) return;

    this.loadingPlayersByTeamId[teamId] = true;

    this.teamService.getPlayersByIdTeam(teamId).subscribe({
      next: (resp) => {
        this.playersByTeamId[teamId] = resp?.data ?? [];
        this.loadingPlayersByTeamId[teamId] = false;
      },
      error: () => {
        this.playersByTeamId[teamId] = [];
        this.loadingPlayersByTeamId[teamId] = false;
        this.toastrService.error(
          'Error al obtener los jugadores del equipo',
          'Error',
        );
      },
    });
  }

  getPlayersForRow(index: number): Array<any> {
    const group = this.eventsArray.at(index) as FormGroup;
    const teamId = Number(group.get('teamId')?.value);
    if (!teamId || Number.isNaN(teamId)) return [];
    return this.playersByTeamId[teamId] ?? [];
  }

  handleCancel(): void {
    this.modalRef?.destroy();
  }

  private _initForm() {
    this.form = this.fb.group({
      homeGoals: [0, Validators.required],
      awayGoals: [0, Validators.required],
      events: this.fb.array([]),
    });
  }

  private _createEventForm(): FormGroup {
    return this.fb.group({
      // minute: [
      //   null,
      //   [Validators.required, Validators.min(0), Validators.max(120)],
      // ],
      eventType: ['', Validators.required],
      teamId: [null, Validators.required],
      playerId: [null],
    });
  }

  private _getTeams() {
    this.tournamentService.getTeamsByIdRound(this.match.idRound).subscribe({
      next: (resp) => {
        this.teams = resp.data.teams;
      },

      error: () => {
        this.toastrService.error(
          'Error al obtener los equipos del partido',
          'Error',
        );
      }
    })
  }

  private _setValues() {
    const events = (this.eventsArray?.value ?? []).map((e: any) => ({
      teamId: e?.teamId != null ? Number(e.teamId) : null,
      playerId: e?.playerId != null && e.playerId !== '' ? Number(e.playerId) : null,
      eventType: e?.eventType as MatchEventType,
      minute: e?.minute != null ? Number(e.minute) : null,
    }));

    const dto = {
      roundId: this.match?.idRound,
      tournamentId: this.match?.tournament?.id,
      homeGoals: Number(this.form.get('homeGoals')?.value ?? 0),
      awayGoals: Number(this.form.get('awayGoals')?.value ?? 0),
      events,
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
