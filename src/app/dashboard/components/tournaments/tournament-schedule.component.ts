import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AddWeekDateModalComponent } from './add-week-date-modal.component';
import { CreateSeasonWeekModalComponent } from './create-season-week-modal.component';
import { TOURNAMENT_CONSTANTS } from 'src/app/tournament/constants/tournament.constants';
import {
  SeasonWeek,
  SeasonWeekAssignment,
  SeasonWeeksResponse,
  TournamentWeekDate,
} from 'src/app/tournament/models/week.interface';
import { TournamentService } from 'src/app/tournament/service/tournament.service';

const WEEKS_PER_ROW = 6;
const DEFAULT_SEASON_ID = 1;

@Component({
  selector: 'app-tournament-schedule',
  templateUrl: './tournament-schedule.component.html',
  styleUrls: ['./tournament-schedule.component.css'],
})
export class TournamentScheduleComponent implements OnInit, OnDestroy {
  weeks: SeasonWeek[] = [];
  weekRows: SeasonWeek[][] = [];
  isLoading = false;
  private readonly subs = new Subscription();

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private readonly modalService: NzModalService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  trackByWeekId(_: number, week: SeasonWeek): number {
    return week.id;
  }

  trackByRowIndex(index: number): number {
    return index;
  }

  trackByAssignment(_: number, assignment: SeasonWeekAssignment): number {
    return assignment.id;
  }

  getAssignmentLabel(assignment: SeasonWeekAssignment): string {
    const stageType = String(assignment.stageType ?? 'MATCHDAY')
      .trim()
      .toUpperCase();

    if (stageType === 'KO') {
      return `Ronda ${assignment.stageNumber}`;
    }

    if (stageType === 'MATCHDAY' || stageType === 'GROUP') {
      return `Fecha ${assignment.stageNumber}`;
    }

    return `${assignment.stageType} ${assignment.stageNumber}`;
  }

  getWeekRangeLabel(week: SeasonWeek): string {
    if (!week.startDate && !week.endDate) return '';
    if (week.startDate === week.endDate) {
      return this.formatDate(week.startDate);
    }
    return `${this.formatDate(week.startDate)} – ${this.formatDate(
      week.endDate,
    )}`;
  }

  canAddDates(week: SeasonWeek): boolean {
    return Number.isFinite(week.id) && week.id > 0;
  }

  onBack(): void {
    this.router.navigate(['/dashboard/tournaments']);
  }

  onCreateWeek(): void {
    const modal = this.modalService.create({
      nzTitle: 'Agregar semana',
      nzContent: CreateSeasonWeekModalComponent,
      nzComponentParams: {
        seasonId: DEFAULT_SEASON_ID,
        suggestedWeekNumber: this.getSuggestedWeekNumber(),
      },
      nzFooter: null,
      nzWidth: 480,
      nzCentered: true,
    });

    modal.afterClose.subscribe((saved) => {
      if (saved === true) {
        this.load();
      }
    });
  }

  private getSuggestedWeekNumber(): number {
    if (!this.weeks.length) return 1;
    const maxWeek = this.weeks.reduce(
      (max, week) => Math.max(max, week.weekNumber),
      0,
    );
    return maxWeek + 1;
  }

  onAddDates(week: SeasonWeek): void {
    if (!this.canAddDates(week)) {
      this.toastr.warning(
        'Esta semana aún no está disponible para asignar fechas',
        'Atención',
      );
      return;
    }

    const modal = this.modalService.create({
      nzTitle: `Agregar fechas · Semana ${week.weekNumber}`,
      nzContent: AddWeekDateModalComponent,
      nzComponentParams: {
        seasonWeekId: week.id,
        weekNumber: week.weekNumber,
        existingDates: this.mapAssignmentsToModalDates(week.assignments),
      },
      nzFooter: null,
      nzWidth: 560,
      nzCentered: true,
    });

    modal.afterClose.subscribe((saved) => {
      if (saved === true) {
        this.load();
      }
    });
  }

  onDeleteWeek(week: SeasonWeek): void {
    this.modalService.confirm({
      nzTitle: 'Eliminar semana',
      nzContent: `¿Confirmás eliminar la Semana ${week.weekNumber}? Se quitarán también sus fechas asignadas.`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzCancelText: 'Cancelar',
      nzOnOk: () => this.deleteWeek(week.id),
    });
  }

  onDeleteAssignment(
    assignment: SeasonWeekAssignment,
    week: SeasonWeek,
  ): void {
    this.modalService.confirm({
      nzTitle: 'Eliminar fecha',
      nzContent: `¿Confirmás quitar ${this.getAssignmentLabel(assignment)} de ${assignment.tournamentName} en la Semana ${week.weekNumber}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzCancelText: 'Cancelar',
      nzOnOk: () => this.deleteAssignment(assignment.id),
    });
  }

  private deleteWeek(weekId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tournamentService.deleteSeasonWeek(weekId).subscribe({
        next: () => {
          this.toastr.success('Semana eliminada correctamente', 'Éxito');
          this.load();
          resolve();
        },
        error: () => {
          this.toastr.error(
            'No se pudo eliminar la semana',
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
          reject();
        },
      });
    });
  }

  private deleteAssignment(assignmentId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tournamentService
        .deleteSeasonWeekAssignment(assignmentId)
        .subscribe({
          next: () => {
            this.toastr.success('Fecha eliminada de la semana', 'Éxito');
            this.load();
            resolve();
          },
          error: () => {
            this.toastr.error(
              'No se pudo eliminar la fecha de la semana',
              TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
            );
            reject();
          },
        });
    });
  }

  private load(): void {
    this.isLoading = true;

    const sub = this.tournamentService
      .getSeasonWeeks(DEFAULT_SEASON_ID)
      .subscribe({
        next: (response) => {
          this.weeks = this.normalizeWeeks(response);
          this.weekRows = this.buildWeekRows(this.weeks);
          this.isLoading = false;
        },
        error: () => {
          this.weeks = [];
          this.weekRows = [];
          this.isLoading = false;
          this.toastr.error(
            'No se pudo cargar la programación por semanas',
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });

    this.subs.add(sub);
  }

  private normalizeWeeks(
    response: SeasonWeeksResponse | SeasonWeek[] | null | undefined,
  ): SeasonWeek[] {
    const rawWeeks = this.extractWeeks(response);

    return rawWeeks
      .map((week) => ({
        id: Number(week.id),
        weekNumber: Number(week.weekNumber),
        startDate: String(week.startDate ?? ''),
        endDate: String(week.endDate ?? ''),
        assignments: (week.assignments ?? [])
          .map((assignment) => ({
            id: Number(assignment.id),
            tournamentId: Number(assignment.tournamentId),
            tournamentName: String(assignment.tournamentName ?? '').trim(),
            stageType: String(assignment.stageType ?? 'MATCHDAY').trim(),
            stageNumber: Number(assignment.stageNumber),
          }))
          .filter(
            (assignment) =>
              Number.isFinite(assignment.id) &&
              assignment.id > 0 &&
              Number.isFinite(assignment.tournamentId) &&
              Number.isFinite(assignment.stageNumber) &&
              assignment.tournamentName.length > 0,
          )
          .sort(
            (a, b) =>
              a.stageNumber - b.stageNumber ||
              a.tournamentName.localeCompare(b.tournamentName),
          ),
      }))
      .filter(
        (week) =>
          Number.isFinite(week.id) &&
          week.id > 0 &&
          Number.isFinite(week.weekNumber) &&
          week.weekNumber > 0,
      )
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }

  private extractWeeks(
    response: SeasonWeeksResponse | SeasonWeek[] | null | undefined,
  ): SeasonWeek[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    return response.data ?? [];
  }

  private mapAssignmentsToModalDates(
    assignments: SeasonWeekAssignment[],
  ): TournamentWeekDate[] {
    return (assignments ?? []).map((assignment) => ({
      matchday: assignment.stageNumber,
      value: assignment.stageNumber,
      tournamentId: assignment.tournamentId,
      tournamentName: assignment.tournamentName,
      assignmentType: assignment.stageType,
    }));
  }

  private formatDate(value: string): string {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  private buildWeekRows(weeks: SeasonWeek[]): SeasonWeek[][] {
    const rows: SeasonWeek[][] = [];

    for (let index = 0; index < weeks.length; index += WEEKS_PER_ROW) {
      rows.push(weeks.slice(index, index + WEEKS_PER_ROW));
    }

    return rows;
  }
}
