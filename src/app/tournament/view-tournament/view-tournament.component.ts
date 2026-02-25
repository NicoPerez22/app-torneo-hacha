import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TournamentService } from '../service/tournament.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { Tournament } from '../models/tournament.interface';
import { Match, Round, Pagination, RoundsResponse } from '../models/round.interface';
import { ToastrService } from 'ngx-toastr';
import { TOURNAMENT_CONSTANTS } from '../constants/tournament.constants';
import { RankingTable } from '../models/ranking.interface';

type RoundsLoadResult =
  | { kind: 'single'; response: RoundsResponse }
  | { kind: 'pages'; pages: RoundsResponse[]; pagination?: Pagination };

type KnockoutStage = {
  title: string;
  matches: Match[];
};

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
  knockoutStages: KnockoutStage[] = [];

  highlights: any[] = [];
  cards: any[] = [];
  isLoadingHighlights = false;
  isLoadingCards = false;
  private hasLoadedHighlights = false;
  private hasLoadedCards = false;
  // Fase de grupos: cache por matchday (page) y paginado independiente por grupo
  private groupStageCache = new Map<number, RoundsResponse>();
  private groupStageLoadingPages = new Set<number>();
  groupStageTotalPages = 0;
  groupStagePageByGroup: Record<string, number> = {};
  isLoading = false;

  private subscriptions: Subscription = new Subscription();
  private readonly INITIAL_PAGE = 1;
  private readonly MAX_VISIBLE_PAGES = 5;
  private readonly TAB_INDEX_HIGHLIGHTS = 1;
  private readonly TAB_INDEX_CARDS = 2;

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

  onTabSelectedIndexChange(index: number): void {
    if (index === this.TAB_INDEX_HIGHLIGHTS) this._loadHighlights();
    if (index === this.TAB_INDEX_CARDS) this._loadCards();
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

  getGroupStageCurrentPage(groupNumber: number | null): number {
    const key = String(groupNumber ?? 'null');
    return this.groupStagePageByGroup[key] ?? (this.pagination?.page ?? this.INITIAL_PAGE);
  }

  getGroupStageMatchdayLabel(groupNumber: number | null): string {
    const page = this.getGroupStageCurrentPage(groupNumber);
    const cached = this.groupStageCache.get(page);
    const value = cached?.data?.pagination?.unitValue ?? cached?.data?.pagination?.page ?? page;
    return `Fecha ${value ?? page}`;
  }

  getGroupStageMatches(groupNumber: number | null): Match[] {
    const page = this.getGroupStageCurrentPage(groupNumber);
    const cached = this.groupStageCache.get(page);
    if (!cached) return [];
    const groups = cached.data?.groups || [];
    return groups.find((g) => g?.groupNumber === groupNumber)?.rounds || [];
  }

  isGroupStagePageLoading(groupNumber: number | null): boolean {
    const page = this.getGroupStageCurrentPage(groupNumber);
    return this.groupStageLoadingPages.has(page);
  }

  get groupStageVisiblePages(): number[] {
    const total = this.groupStageTotalPages || 0;
    if (total <= 1) return total ? [1] : [];
    // para el selector de páginas individual usamos el mismo criterio
    const max = this.MAX_VISIBLE_PAGES;
    // este getter NO sabe qué grupo; se usa solo para total=1 o fallback
    const pages: number[] = [];
    for (let p = 1; p <= Math.min(total, max); p++) pages.push(p);
    return pages;
  }

  getGroupStageVisiblePagesForGroup(groupNumber: number | null): number[] {
    const total = this.groupStageTotalPages || 0;
    if (total <= 1) return total ? [1] : [];

    const max = this.MAX_VISIBLE_PAGES;
    const current = this.getGroupStageCurrentPage(groupNumber) || 1;

    let start = Math.max(1, current - Math.floor(max / 2));
    let end = Math.min(total, start + max - 1);
    start = Math.max(1, end - max + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  goToGroupStagePage(groupNumber: number | null, page: number): void {
    if (!this.isGroupStage) return;
    const total = this.groupStageTotalPages || 0;
    if (!total) return;
    const next = Math.max(1, Math.min(total, page));

    const key = String(groupNumber ?? 'null');
    if (this.groupStagePageByGroup[key] === next) return;
    this.groupStagePageByGroup[key] = next;

    this._ensureGroupStagePageLoaded(next);
  }

  getGroupMatchdayLabel(group: Round): string {
    const fromMatch = group?.rounds?.find((m) => m?.matchday != null)?.matchday;
    const value = fromMatch ?? this.pagination?.unitValue ?? this.pagination?.page ?? this.currentPage;
    return `Fecha ${value ?? 1}`;
  }

  getMatchesByGroupNumber(groupNumber: number | null): Match[] {
    const groups = this.rounds || [];
    if (groupNumber == null) {
      const only = groups.find((g) => g?.groupNumber == null) || groups[0];
      return only?.rounds || [];
    }
    return groups.find((g) => g?.groupNumber === groupNumber)?.rounds || [];
  }

  get isKnockout(): boolean {
    const format = this.tournament?.format;
    if (!format) return false;
    // Eliminación directa: ID fijo en backend
    return format.id === 1;
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
    this.highlights = [];
    this.cards = [];
    this.hasLoadedHighlights = false;
    this.hasLoadedCards = false;
    this.isLoadingHighlights = false;
    this.isLoadingCards = false;
  
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
              rounds: of({ kind: 'single', response: { data: { groups: [], pagination: null } } as RoundsResponse } as RoundsLoadResult),
              ranking: of({ data: { tables: [] } }),
              tournament: of({ data: null }),
            });
          }
  
          const isGroupStage = tournament?.format?.id === 2;
          const isKnockout = this._isKnockoutFormat(tournament);
  
          const ranking$ = isKnockout
            ? of({ data: { tables: [] } })
            : (isGroupStage
                ? this.tournamentService.getRankingGroups(this.tournamentId)
                : this.tournamentService.getRankingLeague(this.tournamentId));

          const rounds$ = this.tournamentService
            .getRoundsPagination(this.tournamentId, this.INITIAL_PAGE)
            .pipe(
              switchMap((firstPageRes) => {
                const totalPages = firstPageRes?.data?.pagination?.totalPages ?? 1;
                const safeTotalPages = Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;

                if (!isKnockout || safeTotalPages <= 1) {
                  return of({ kind: 'single', response: firstPageRes } as RoundsLoadResult);
                }

                const others$ = Array.from({ length: safeTotalPages - 1 }, (_, idx) => idx + 2).map((page) =>
                  this.tournamentService.getRoundsPagination(this.tournamentId, page).pipe(
                    catchError((error) => {
                      this.handleError('Error al cargar las fechas del torneo', error);
                      // si falla una página, no rompemos todo el bracket
                      return of(null as unknown as RoundsResponse);
                    }),
                  ),
                );

                return forkJoin([of(firstPageRes), ...others$]).pipe(
                  map((pages) => pages.filter(Boolean) as RoundsResponse[]),
                  map((pages) => ({
                    kind: 'pages',
                    pages,
                    pagination: firstPageRes?.data?.pagination,
                  }) as RoundsLoadResult),
                );
              }),
              catchError((error) => {
                this.handleError('Error al cargar las fechas del torneo', error);
                return of({ kind: 'single', response: { data: { groups: [], pagination: null } } as RoundsResponse } as RoundsLoadResult);
              }),
            );
  
          return forkJoin({
            rounds: rounds$,
  
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
          this.knockoutStages = [];
          this.groupStageCache.clear();
          this.groupStageLoadingPages.clear();
          this.groupStageTotalPages = 0;
          this.groupStagePageByGroup = {};

          if (results.rounds.kind === 'single') {
            this.rounds = results.rounds.response.data?.groups || [];
            this.pagination = results.rounds.response.data?.pagination;
            if (this._isKnockoutFormat(results.tournament.data)) {
              this.knockoutStages = this._buildKnockoutStages([results.rounds.response]);
            }
            if (results.tournament.data?.format?.id === 2) {
              const page = results.rounds.response.data?.pagination?.page ?? this.INITIAL_PAGE;
              const total = results.rounds.response.data?.pagination?.totalPages ?? 0;
              this.groupStageTotalPages = Number.isFinite(total) ? total : 0;
              this.groupStageCache.set(page, results.rounds.response);

              // Inicializamos cada grupo en la misma "fecha" actual
              const groupNumbers = (results.rounds.response.data?.groups || [])
                .map((g) => g?.groupNumber)
                .filter((n) => n != null) as number[];
              for (const g of groupNumbers) {
                this.groupStagePageByGroup[String(g)] = page;
              }
            }
          } else {
            this.pagination = results.rounds.pagination;
            // para no romper nada que dependa de `rounds`, dejamos el primer page como referencia
            this.rounds = results.rounds.pages?.[0]?.data?.groups || [];
            this.knockoutStages = this._buildKnockoutStages(results.rounds.pages || []);
          }

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

  private _loadHighlights(): void {
    if (!this.tournamentId) return;
    if (this.hasLoadedHighlights || this.isLoadingHighlights) return;

    this.isLoadingHighlights = true;
    const sub = this.tournamentService
      .getTournamentHighlights(this.tournamentId)
      .pipe(
        catchError((error) => {
          this.handleError('Error al cargar los goleadores', error);
          return of({ data: [] as any[] });
        }),
        finalize(() => {
          this.isLoadingHighlights = false;
        }),
      )
      .subscribe({
        next: (resp) => {
          this.highlights = resp?.data ?? [];
          this.hasLoadedHighlights = true;
        },
      });

    this.subscriptions.add(sub);
  }

  private _loadCards(): void {
    if (!this.tournamentId) return;
    if (this.hasLoadedCards || this.isLoadingCards) return;

    this.isLoadingCards = true;
    const sub = this.tournamentService
      .getTournamentCards(this.tournamentId)
      .pipe(
        catchError((error) => {
          this.handleError('Error al cargar las tarjetas', error);
          return of({ data: [] as any[] });
        }),
        finalize(() => {
          this.isLoadingCards = false;
        }),
      )
      .subscribe({
        next: (resp) => {
          this.cards = resp?.data ?? [];
          this.hasLoadedCards = true;
        },
      });

    this.subscriptions.add(sub);
  }

  private loadRounds(page: number): void {
    // En eliminación directa mostramos el cuadro, no paginamos.
    if (this.isKnockout || this.isGroupStage) return;

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

  private _isKnockoutFormat(tournament?: Tournament | null): boolean {
    const format = tournament?.format;
    if (!format) return false;
    // Eliminación directa: ID fijo en backend
    return format.id === 1;
  }

  private _ensureGroupStagePageLoaded(page: number): void {
    if (this.groupStageCache.has(page) || this.groupStageLoadingPages.has(page)) return;
    this.groupStageLoadingPages.add(page);

    const sub = this.tournamentService
      .getRoundsPagination(this.tournamentId, page)
      .pipe(
        catchError((error) => {
          this.handleError('Error al cargar las fechas', error);
          return of(null as unknown as RoundsResponse);
        }),
        finalize(() => {
          this.groupStageLoadingPages.delete(page);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res) return;
          this.groupStageCache.set(page, res);
          const total = res?.data?.pagination?.totalPages ?? this.groupStageTotalPages;
          if (typeof total === 'number' && total > 0) this.groupStageTotalPages = total;
        },
      });

    this.subscriptions.add(sub);
  }

  private _flattenMatchesFromRoundsResponse(res: RoundsResponse): Match[] {
    const groups = res?.data?.groups || [];
    const matches = groups.flatMap((g) => g?.rounds || []);
    return matches.filter(Boolean) as Match[];
  }

  private _getStageTitleByMatchCount(matchCount: number, fallbackIndex: number): string {
    switch (matchCount) {
      case 1:
        return 'Final';
      case 2:
        return 'Semifinal';
      case 4:
        return 'Cuartos de final';
      case 8:
        return 'Octavos de final';
      case 16:
        return '16avos de final';
      default:
        return `Ronda ${fallbackIndex}`;
    }
  }

  private _buildKnockoutStages(pages: RoundsResponse[]): KnockoutStage[] {
    const rawStages = (pages || [])
      .map((res, idx) => {
        const matches = this._flattenMatchesFromRoundsResponse(res);
        return {
          originalIndex: idx + 1,
          matches,
          matchCount: matches.length,
        };
      })
      .filter((s) => s.matchCount > 0);

    // Orden: mayor cantidad de partidos primero (rondas iniciales a la izquierda)
    rawStages.sort((a, b) => b.matchCount - a.matchCount || a.originalIndex - b.originalIndex);

    return rawStages.map((s, displayIndex) => ({
      title: this._getStageTitleByMatchCount(s.matchCount, displayIndex + 1),
      matches: s.matches,
    }));
  }
}
