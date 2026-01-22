import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TournamentService } from '../service/tournament.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { Tournament } from '../models/tournament.interface';
import { Round, Pagination } from '../models/round.interface';
import { ToastrService } from 'ngx-toastr';
import { TOURNAMENT_CONSTANTS } from '../constants/tournament.constants';
import { RankingTable } from '../models/ranking.interface';

@Component({
  selector: 'app-view-tournament',
  templateUrl: './view-tournament.component.html',
  styleUrls: ['./view-tournament.component.css'],
})
export class ViewTournamentComponent implements OnInit, OnDestroy {
  tournament?: Tournament;
  currentPage: number = 1;
  tournamentId: number = 0;
  pagination?: Pagination;

  rounds: Round[] = [];
  rankingTables: RankingTable[] = [];
  isLoading = false;

  private subscriptions: Subscription = new Subscription();
  private readonly INITIAL_PAGE = 1;

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.tournamentId = Number(this.route.snapshot.params['id']);
    if (this.tournamentId) {
      this.loadTournamentData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRounds(page);
  }

  private loadTournamentData(): void {
    this.isLoading = true;
  
    const loadSub = this.tournamentService
      .getTournamentByID(this.tournamentId)
      .pipe(
        catchError((error) => {
          this.handleError('Error al cargar los datos del torneo', error);
          return of({ data: null });
        }),
  
        switchMap((tournamentRes) => {
          const tournament = tournamentRes?.data;
  
          if (!tournament) {
            return forkJoin({
              rounds: of({ data: { groups: [], pagination: null } }),
              ranking: of({ data: { tables: [] } }),
              tournament: of({ data: null }),
            });
          }
  
          const isGroupStage = tournament?.format?.id === 2;
  
          const ranking$ = isGroupStage
            ? this.tournamentService.getRankingGroups(this.tournamentId)
            : this.tournamentService.getRankingLeague(this.tournamentId);
  
          return forkJoin({
            rounds: this.tournamentService
              .getRoundsPagination(this.tournamentId, this.INITIAL_PAGE)
              .pipe(
                catchError((error) => {
                  this.handleError('Error al cargar las fechas del torneo', error);
                  return of({ data: { groups: [], pagination: null } });
                }),
              ),
  
            ranking: ranking$.pipe(
              catchError((error) => {
                this.handleError('Error al cargar el ranking', error);
                return of({ data: { tables: [] } });
              }),
            ),
  
            tournament: of({ data: tournament }),
          });
        }),
  
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (results) => {
          this.rounds = results.rounds.data?.groups || [];
          this.pagination = results.rounds.data?.pagination;
          this.tournament = results.tournament.data;
  
          this.rankingTables = results.ranking.data?.tables || [];
        },
        error: (error) => {
          this.handleError('Error al cargar los datos del torneo', error);
        },
      });
  
    this.subscriptions.add(loadSub);
  }

  private loadRounds(page: number): void {
    const roundsSub = this.tournamentService
      .getRoundsPagination(this.tournamentId, page)
      .pipe(
        catchError((error) => {
          this.handleError('Error al cargar las fechas', error);
          return of({ data: { groups: [], pagination: this.pagination } });
        })
      )
      .subscribe({
        next: (response) => {
          this.rounds = response.data?.groups || [];
          this.pagination = response.data?.pagination;
        },
      });

    this.subscriptions.add(roundsSub);
  }

  private handleError(message: string, error: unknown): void {
    this.toastrService.error(message, TOURNAMENT_CONSTANTS.ERROR_TITLE);
    console.error(message, error);
  }
}
