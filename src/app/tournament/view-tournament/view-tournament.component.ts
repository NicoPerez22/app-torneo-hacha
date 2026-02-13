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
  private readonly MAX_VISIBLE_PAGES = 5;

  /**
   * Configurable desde TS:
   * - `from`: posición inicial (1-indexed, inclusive)
   * - `to`: posición final (inclusive). Si no se define, se calcula con `toEndOffset` o queda "sin límite".
   * - `toEndOffset`: posición final relativa al final: end = total - toEndOffset
   * - `last`: cantidad de posiciones desde el final (ej: last=1 => último)
   *
   * Defaults replican tu lógica anterior:
   * - top: 1
   * - mid: 2..(total-2)
   * - promo: 9..(total-2)
   * - bottom: último
   */
  positionBadgeConfig = {
    top: { from: null, to: null },
    mid: { from: null, to: null },
    promoUp: { from: null, to: null },
    promo: { from: null, to: null },
    bottom: { last: null },
  } as const;

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
    this.goToPage(page);
  }

  getPositionBadgeClass(index: number, total: number): string {
    const pos = index + 1; // 1-indexed

    // prioridad para evitar solapamientos
    if (this._matchesRange(pos, total, this.positionBadgeConfig.top)) return 'top';
    if (this._matchesLast(pos, total, this.positionBadgeConfig.bottom)) return 'bottom';
    if (this._matchesRange(pos, total, this.positionBadgeConfig.promo)) return 'promo';
    if (this._matchesRange(pos, total, this.positionBadgeConfig.mid)) return 'mid';
    if (this._matchesRange(pos, total, this.positionBadgeConfig.promoUp)) return 'promoUp';
    return '';
  }

  goToPage(page: number): void {
    const total = this.pagination?.totalPages ?? 0;
    if (!total) return;
    const next = Math.max(1, Math.min(total, page));
    if (next === this.currentPage) return;
    this.currentPage = next;
    this.loadRounds(next);
  }

  get visiblePages(): number[] {
    const total = this.pagination?.totalPages ?? 0;
    if (total <= 1) return total ? [1] : [];

    const max = this.MAX_VISIBLE_PAGES;
    const current = this.currentPage || 1;

    let start = Math.max(1, current - Math.floor(max / 2));
    let end = Math.min(total, start + max - 1);
    start = Math.max(1, end - max + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  get isGroupStage(): boolean {
    return this.tournament?.format?.id === 2;
  }

  getPlayed(rank: any): number {
    // soporta distintas variantes de backend: played/pj/matchesPlayed
    const rawPlayed = rank?.played ?? rank?.pj ?? rank?.matchesPlayed;
    if (rawPlayed != null && rawPlayed !== '') {
      const n = typeof rawPlayed === 'number' ? rawPlayed : Number(rawPlayed);
      if (Number.isFinite(n)) return n;
    }

    const wins = Number(rank?.wins ?? 0) || 0;
    const draws = Number(rank?.draws ?? 0) || 0;
    const losses = Number(rank?.losses ?? 0) || 0;
    return wins + draws + losses;
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
          this.currentPage = this.pagination?.page ?? this.INITIAL_PAGE;
  
          this.rankingTables = results.ranking.data?.tables || [];
          this._getPositionBadgeClass(this.tournamentId);
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
          this.currentPage = this.pagination?.page ?? page;
        },
      });

    this.subscriptions.add(roundsSub);
  }

  private handleError(message: string, error: unknown): void {
    this.toastrService.error(message, TOURNAMENT_CONSTANTS.ERROR_TITLE);
    console.error(message, error);
  }

  private _matchesLast(pos: number, total: number, cfg?: { last?: number }): boolean {
    const last = cfg?.last ?? 0;
    if (!last || total <= 0) return false;
    return pos > total - last;
  }

  private _matchesRange(
    pos: number,
    total: number,
    cfg?: { from?: number; to?: number; toEndOffset?: number },
  ): boolean {
    if (!cfg) return false;
    const from = cfg.from ?? 1;
    const to = this._resolveTo(total, cfg);
    return pos >= from && pos <= to;
  }

  private _resolveTo(total: number, cfg: { to?: number; toEndOffset?: number }): number {
    if (typeof cfg.to === 'number') return cfg.to;
    if (typeof cfg.toEndOffset === 'number') return Math.max(1, total - cfg.toEndOffset);
    return Number.POSITIVE_INFINITY;
  }

  private _getPositionBadgeClass(id) {
    if(id == 1){
      this.positionBadgeConfig = {
        top: { from: 1, to: 1 },
        promoUp: { from: null, to: null },
        mid: { from: 2, to: 8 },
        promo: { from: 9, to: 11 },
        bottom: { last: 1 },
      } as const;

      return;
    }

    if(id == 2){
      this.positionBadgeConfig = {
        top: { from: 1, to: 1 },
        promoUp: { from: 2, to: 4 },
        mid: { from: 5, to: 8 },
        promo: { from: 8, to: 9 },
        bottom: { last: 1 },
      } as const;

      return;
    }

    if(id == 3){
      this.positionBadgeConfig = {
        top: { from: 1, to: 1 },
        promoUp: { from: 2, to: 3 },
        mid: { from: 4, to: 10 },
        promo: { from: 0, to: 0 },
        bottom: { last: 0 },
      } as const;

      return;
    }
  }
}
