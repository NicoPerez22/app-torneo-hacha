import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TOURNAMENT_CONSTANTS } from 'src/app/tournament/constants/tournament.constants';
import { TournamentService } from 'src/app/tournament/service/tournament.service';

@Component({
  selector: 'app-create-season-week-modal',
  templateUrl: './create-season-week-modal.component.html',
  styleUrls: ['./create-season-week-modal.component.css'],
})
export class CreateSeasonWeekModalComponent implements OnInit, OnDestroy {
  @Input() seasonId = 1;
  @Input() suggestedWeekNumber = 1;

  weekNumber = 1;
  startDate = '';
  endDate = '';
  isSaving = false;

  private readonly subs = new Subscription();

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly toastr: ToastrService,
    private readonly modalRef: NzModalRef,
  ) {}

  ngOnInit(): void {
    this.weekNumber = this.suggestedWeekNumber;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onCancel(): void {
    this.modalRef.close(false);
  }

  onSave(): void {
    if (!this.isFormValid()) return;

    this.isSaving = true;

    const sub = this.tournamentService
      .createSeasonWeek({
        seasonId: this.seasonId,
        weekNumber: this.weekNumber,
        startDate: this.startDate,
        endDate: this.endDate,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toastr.success('Semana creada correctamente', 'Éxito');
          this.modalRef.close(true);
        },
        error: () => {
          this.isSaving = false;
          this.toastr.error(
            'No se pudo crear la semana',
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });

    this.subs.add(sub);
  }

  private isFormValid(): boolean {
    if (!Number.isFinite(this.weekNumber) || this.weekNumber < 1) {
      this.toastr.warning('Ingresá un número de semana válido', 'Atención');
      return false;
    }

    if (!this.startDate || !this.endDate) {
      this.toastr.warning('Completá las fechas de inicio y fin', 'Atención');
      return false;
    }

    if (this.endDate < this.startDate) {
      this.toastr.warning(
        'La fecha de fin no puede ser anterior a la de inicio',
        'Atención',
      );
      return false;
    }

    return true;
  }
}
