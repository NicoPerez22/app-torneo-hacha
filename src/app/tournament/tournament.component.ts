import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TournamentService } from './service/tournament.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';
import { Tournament } from './models/tournament.interface';
import { TOURNAMENT_CONSTANTS } from './constants/tournament.constants';
import { AuthService } from '../service/auth.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-tournament',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css'],
})
export class TournamentComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);
  private readonly toastrService = inject(ToastrService);
  private readonly modalService = inject(NzModalService);
  protected readonly authService = inject(AuthService);

  readonly tournaments = signal<Tournament[]>([]);
  modalRef?: NzModalRef;

  ngOnInit(): void {
    this.loadTournaments();
  }

  protected readonly isAdmin = computed(
    () => this.authService.userSignal()?.idRol === 1,
  );

  onViewTournament(id: number): void {
    this.router.navigate(['/tournament/view', id]);
  }

  onDelete(id: number): void {
    this.tournamentService.deleteTournament(id).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (resp) => {
        this.loadTournaments();
        this.toastrService.success('Torneo eliminado con exito', 'Exito');
      },
    });
  }

  onCreate(): void {
    this.modalRef = this.modalService.create({
      nzTitle: 'Crear torneo',
      nzContent: CreateTournammentComponent,
      nzWidth: 1200,
      nzFooter: null,
    });

    this.modalRef.afterClose.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.loadTournaments();
    });
  }

  onReviewReports(): void {
    this.router.navigate(['/tournament/comprobar-reportes']);
  }

  private loadTournaments(): void {
    this.tournamentService
      .getTournament()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.tournaments.set(response.data || []);
        },
        error: () => {
          this.toastrService.error(
            TOURNAMENT_CONSTANTS.TOURNAMENTS_LOAD_ERROR,
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
        },
      });
  }
}
