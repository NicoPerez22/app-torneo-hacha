import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TournamentService } from './service/tournament.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';
import { Tournament } from './models/tournament.interface';
import { TOURNAMENT_CONSTANTS } from './constants/tournament.constants';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css'],
})
export class TournamentComponent implements OnInit, OnDestroy {
  tournaments: Tournament[] = [];
  modalRef?: NzModalRef;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private spinnerService: NgxSpinnerService,
    private toastrService: ToastrService,
    private modalService: NzModalService,
  ) {}

  ngOnInit(): void {
    this.loadTournaments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onViewTournament(id: number): void {
    this.router.navigate(['/tournament/view', id]);
  }

  onCreate(): void {
    this.modalRef = this.modalService.create({
      nzTitle: 'Crear torneo',
      nzContent: CreateTournammentComponent,
      nzWidth: 1200,
      nzFooter: null,
    });

    const afterCloseSub = this.modalRef.afterClose.subscribe(() => {
      this.loadTournaments();
    });
    this.subscriptions.add(afterCloseSub);
  }

  private loadTournaments(): void {
    this.spinnerService.show();

    const tournamentSub = this.tournamentService
      .getTournament()
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.spinnerService.hide();
          }, TOURNAMENT_CONSTANTS.SPINNER_DELAY_MS);
        })
      )
      .subscribe({
        next: (response) => {
          this.tournaments = response.data || [];
        },
        error: () => {
          this.toastrService.error(
            TOURNAMENT_CONSTANTS.TOURNAMENTS_LOAD_ERROR,
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });

    this.subscriptions.add(tournamentSub);
  }
}
