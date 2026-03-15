import { Component, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TournamentService } from 'src/app/tournament/service/tournament.service';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from 'src/app/service/team.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

type MatchEventType = 'GOAL' | 'YELLOW' | 'RED' | 'SUB' | 'NOTE' | 'INJURY';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  @Input() match: any;

  form: FormGroup;
  isLoadingPlayers = false;
  isSubmitting = false;

  private readonly fb = inject(FormBuilder);
  private readonly tournamentService = inject(TournamentService);
  private readonly toastrService = inject(ToastrService);
  private readonly teamService = inject(TeamService);
  private readonly modalRef = inject<NzModalRef | null>(NzModalRef, { optional: true });

  ngOnInit(): void {
    this._initForm();
    this._loadPlayers();
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

  addGoal(control: any) {
    const current = Number(control?.value ?? 0);
    control?.setValue(current + 1);
  }

  removeGoal(control: any) {
    const current = Number(control?.value ?? 0);
    control?.setValue(Math.max(0, current - 1));
  }

  get homePlayersArray(): FormArray {
    return this.form.get('homePlayers') as FormArray;
  }

  get awayPlayersArray(): FormArray {
    return this.form.get('awayPlayers') as FormArray;
  }

  get homePlayersControls() {
    return this.homePlayersArray?.controls ?? [];
  }

  get awayPlayersControls() {
    return this.awayPlayersArray?.controls ?? [];
  }

  clampYellow(i: number, side: 'home' | 'away'): void {
    const arr = side === 'home' ? this.homePlayersArray : this.awayPlayersArray;
    const ctrl = arr.at(i)?.get('yellow');
    const raw = Number(ctrl?.value ?? 0);
    const safe = Number.isFinite(raw) ? Math.max(0, Math.min(2, raw)) : 0;
    if (ctrl && ctrl.value !== safe) ctrl.setValue(safe, { emitEvent: false });
  }

  clampNonNegative(i: number, side: 'home' | 'away'): void {
    const arr = side === 'home' ? this.homePlayersArray : this.awayPlayersArray;
    const ctrl = arr.at(i)?.get('goals');
    const raw = Number(ctrl?.value ?? 0);
    const safe = Number.isFinite(raw) ? Math.max(0, raw) : 0;
    if (ctrl && ctrl.value !== safe) ctrl.setValue(safe, { emitEvent: false });
  }

  handleCancel(): void {
    this.modalRef?.destroy();
  }

  private _initForm() {
    this.form = this.fb.group({
      homeGoals: [0, Validators.required],
      awayGoals: [0, Validators.required],
      homePlayers: this.fb.array([]),
      awayPlayers: this.fb.array([]),
    });
  }

  private _loadPlayers(): void {
    const homeTeamId = Number(this.match?.homeTeamId);
    const awayTeamId = Number(this.match?.awayTeamId);

    if (!Number.isFinite(homeTeamId) || !Number.isFinite(awayTeamId)) {
      this.toastrService.error('No se pudo identificar los equipos del partido', 'Error');
      return;
    }

    this.isLoadingPlayers = true;
    forkJoin({
      home: this.teamService.getPlayersByIdTeam(homeTeamId).pipe(catchError(() => of({ data: [] }))),
      away: this.teamService.getPlayersByIdTeam(awayTeamId).pipe(catchError(() => of({ data: [] }))),
    })
      .pipe(finalize(() => (this.isLoadingPlayers = false)))
      .subscribe({
        next: ({ home, away }) => {
          const homePlayers = Array.isArray(home?.data) ? home.data : [];
          const awayPlayers = Array.isArray(away?.data) ? away.data : [];

          this._setPlayers(this.homePlayersArray, homePlayers, homeTeamId);
          this._setPlayers(this.awayPlayersArray, awayPlayers, awayTeamId);
        },
        error: () => {
          this.toastrService.error('Error al obtener los jugadores del partido', 'Error');
        },
      });
  }

  private _setPlayers(target: FormArray, players: any[], teamId: number): void {
    target.clear();

    const sorted = [...(players ?? [])].sort((a, b) => {
      const al = String(a?.lastName ?? '').toLowerCase();
      const bl = String(b?.lastName ?? '').toLowerCase();
      if (al !== bl) return al.localeCompare(bl);
      const an = String(a?.name ?? '').toLowerCase();
      const bn = String(b?.name ?? '').toLowerCase();
      return an.localeCompare(bn);
    });

    for (const p of sorted) {
      target.push(
        this.fb.group({
          teamId: [teamId, Validators.required],
          playerId: [p?.id ?? null, Validators.required],
          name: [p?.name ?? ''],
          lastName: [p?.lastName ?? ''],
          goals: [0, [Validators.min(0)]],
          yellow: [0, [Validators.min(0), Validators.max(2)]],
          red: [false],
          injured: [false],
        }),
      );
    }
  }

  private _setValues() {
    const buildEvents = (rows: any[]): any[] => {
      const events: any[] = [];

      const toCount = (value: any, max?: number): number => {
        const n = Number(value);
        if (!Number.isFinite(n)) return 0;
        const i = Math.floor(n);
        const clampedMax = typeof max === 'number' ? Math.min(max, i) : i;
        return Math.max(0, clampedMax);
      };

      const addRepeated = (teamId: number, playerId: number, eventType: MatchEventType, count: number) => {
        for (let i = 0; i < count; i++) {
          events.push({ teamId, playerId, eventType, minute: null });
        }
      };

      for (const r of rows ?? []) {
        const teamId = Number(r?.teamId);
        const playerId = Number(r?.playerId);
        if (!Number.isFinite(teamId) || !Number.isFinite(playerId)) continue;

        const goals = toCount(r?.goals);
        const yellows = toCount(r?.yellow, 2);
        const red = Boolean(r?.red);
        const injured = Boolean(r?.injured);

        addRepeated(teamId, playerId, 'GOAL', goals);
        addRepeated(teamId, playerId, 'YELLOW', yellows);

        if (red) {
          events.push({ teamId, playerId, eventType: 'RED', minute: null });
        }

        if (injured) {
          // Mantenemos el contrato: mismo shape de objeto (eventType string + teamId/playerId/minute)
          events.push({ teamId, playerId, eventType: 'NOTE', minute: null });
        }
      }

      return events;
    };

    const events = [
      ...buildEvents(this.homePlayersArray?.value ?? []),
      ...buildEvents(this.awayPlayersArray?.value ?? []),
    ];

    const dto = {
      roundId: this.match?.idRound,
      tournamentId: this.match?.tournamentId ?? this.match?.tournament?.id,
      homeGoals: Number(this.form.get('homeGoals')?.value ?? 0),
      awayGoals: Number(this.form.get('awayGoals')?.value ?? 0),
      events,
    };

    return dto;
  }

  // DTO final (shape se mantiene):
  // {
  //   "roundId": 798,
  //   "tournamentId": 31,
  //   "homeGoals": 1,
  //   "awayGoals": 4,
  //   "events": [
  //     { "teamId": 12, "playerId": 55, "eventType": "GOAL", "minute": null },
  //     { "teamId": 13, "playerId": 77, "eventType": "YELLOW", "minute": null },
  //     { "teamId": 13, "playerId": 78, "eventType": "RED", "minute": null },
  //     { "teamId": 13, "playerId": 78, "eventType": "NOTE", "minute": null }
  //   ]
  // }
}
