import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TournamentService } from './service/tournament.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';
import { Tournament } from './models/tournament.interface';
import { TOURNAMENT_CONSTANTS } from './constants/tournament.constants';
import { Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';

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
    private toastrService: ToastrService,
    private modalService: NzModalService,
    public authService: AuthService,
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

  onDelete(id){
    this.tournamentService.deleteTournament(id).subscribe({
      next: (resp) => {
        this.loadTournaments();
        this.toastrService.success('Torneo eliminado con exito', 'Exito')
      }
    })
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
    const tournamentSub = this.tournamentService
      .getTournament()
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
