import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TOURNAMENT_CONSTANTS } from 'src/app/tournament/constants/tournament.constants';
import { TournamentRoundSummary } from 'src/app/tournament/models/round.interface';
import { Tournament } from 'src/app/tournament/models/tournament.interface';
import {
  TournamentMatchdayOption,
  WeekStageType,
  TournamentWeekDate,
} from 'src/app/tournament/models/week.interface';
import { TournamentService } from 'src/app/tournament/service/tournament.service';

@Component({
  selector: 'app-add-week-date-modal',
  templateUrl: './add-week-date-modal.component.html',
  styleUrls: ['./add-week-date-modal.component.css'],
})
export class AddWeekDateModalComponent implements OnInit, OnDestroy {
  @Input() seasonWeekId = 0;
  @Input() weekNumber = 1;
  @Input() existingDates: TournamentWeekDate[] = [];

  tournaments: Tournament[] = [];
  matchdayOptions: TournamentMatchdayOption[] = [];
  selectedTournamentId: number | null = null;
  selectedOptionKeys: string[] = [];

  isLoadingTournaments = false;
  isLoadingMatchdays = false;
  isSaving = false;

  private roundsSummary: TournamentRoundSummary[] = [];
  private readonly subs = new Subscription();

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly toastr: ToastrService,
    private readonly modalRef: NzModalRef,
  ) {}

  ngOnInit(): void {
    this.loadTournaments();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onTournamentChange(tournamentId: number | null): void {
    this.selectedTournamentId = tournamentId;
    this.selectedOptionKeys = [];
    this.matchdayOptions = [];

    if (!tournamentId) return;
    this.loadRoundsSummary(tournamentId);
  }

  onCancel(): void {
    this.modalRef.close(false);
  }

  onSave(): void {
    if (!this.seasonWeekId) {
      this.toastr.error('La semana no tiene un identificador válido', 'Error');
      return;
    }

    if (!this.selectedTournamentId) {
      this.toastr.warning('Seleccioná un torneo', 'Atención');
      return;
    }

    if (this.selectedOptionKeys.length === 0) {
      this.toastr.warning('Seleccioná al menos una fecha', 'Atención');
      return;
    }

    const assignments = this.selectedOptionKeys
      .map((key) => this.matchdayOptions.find((option) => option.key === key))
      .filter((option): option is TournamentMatchdayOption => !!option)
      .map((option) => ({
        tournamentId: this.selectedTournamentId as number,
        stageType: option.type as WeekStageType,
        stageNumber: option.value,
      }));

    if (assignments.length === 0) {
      this.toastr.warning(
        'No se pudieron resolver las fechas seleccionadas',
        'Atención',
      );
      return;
    }

    this.isSaving = true;

    const sub = this.tournamentService
      .addWeekMatchdays(this.seasonWeekId, {
        assignments: assignments.map((assignment) => ({
          tournamentId: assignment.tournamentId,
          stageType: assignment.stageType,
          stageNumber: assignment.stageNumber,
        })),
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toastr.success('Fechas agregadas a la semana', 'Éxito');
          this.modalRef.close(true);
        },
        error: () => {
          this.isSaving = false;
          this.toastr.error(
            'No se pudieron agregar las fechas a la semana',
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });

    this.subs.add(sub);
  }

  private loadTournaments(): void {
    this.isLoadingTournaments = true;

    const sub = this.tournamentService.getTournament().subscribe({
      next: (response) => {
        this.tournaments = [...(response.data || [])].sort((a, b) =>
          (a?.name ?? '').localeCompare(b?.name ?? ''),
        );
        this.isLoadingTournaments = false;
      },
      error: () => {
        this.tournaments = [];
        this.isLoadingTournaments = false;
        this.toastr.error(
          TOURNAMENT_CONSTANTS.TOURNAMENTS_LOAD_ERROR,
          TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
        );
      },
    });

    this.subs.add(sub);
  }

  private loadRoundsSummary(tournamentId: number): void {
    this.isLoadingMatchdays = true;

    const sub = this.tournamentService
      .getRoundsSummary(tournamentId)
      .subscribe({
        next: (response) => {
          this.roundsSummary = response.data || [];
          this.buildMatchdayOptions(tournamentId);
          this.isLoadingMatchdays = false;
        },
        error: () => {
          this.roundsSummary = [];
          this.matchdayOptions = [];
          this.isLoadingMatchdays = false;
          this.toastr.error(
            'No se pudieron cargar las fechas del torneo',
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });

    this.subs.add(sub);
  }
  private buildMatchdayOptions(tournamentId: number): void {
    const assigned = new Set(
      (this.existingDates || [])
        .filter((date) => date.tournamentId === tournamentId)
        .map((date) =>
          this.buildAssignmentKey(
            date.assignmentType,
            date.value ?? date.matchday,
          ),
        ),
    );

    this.matchdayOptions = this.roundsSummary
      .map((item) => this.mapSummaryToOption(item, assigned))
      .filter((option): option is TournamentMatchdayOption => !!option)
      .filter(
        (option, index, list) =>
          list.findIndex((item) => item.key === option.key) === index,
      )
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return a.value - b.value;
      });
  }

  private mapSummaryToOption(
    item: TournamentRoundSummary,
    assigned: Set<string>,
  ): TournamentMatchdayOption | null {
    const assignment = this.resolveSummaryAssignment(item);
    if (!assignment) return null;

    const key = this.buildAssignmentKey(assignment.type, assignment.value);

    return {
      key,
      type: assignment.type,
      value: assignment.value,
      label: this.buildAssignmentLabel(assignment.type, assignment.value),
      disabled: assigned.has(key),
    };
  }

  private resolveSummaryAssignment(
    item: TournamentRoundSummary,
  ): { type: WeekStageType; value: number } | null {
    const round = item.round;
    if (round != null && Number.isFinite(Number(round))) {
      return { type: 'KO', value: Number(round) };
    }

    const matchday = item.matchday;
    if (matchday != null && Number.isFinite(Number(matchday))) {
      return { type: 'GROUP', value: Number(matchday) };
    }

    return null;
  }

  private resolveAssignmentType(unitType?: string): WeekStageType {
    const normalized = String(unitType ?? 'GROUP')
      .trim()
      .toUpperCase();
    if (normalized === 'KO') return 'KO';
    return 'GROUP';
  }

  private buildAssignmentKey(type: string | undefined, value: number): string {
    return `${this.resolveAssignmentType(type)}:${value}`;
  }

  private buildAssignmentLabel(type: WeekStageType, value: number): string {
    if (type === 'KO') return `Ronda ${value}`;
    return `Fecha ${value}`;
  }
}
