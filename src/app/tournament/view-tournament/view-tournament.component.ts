import { ActivatedRoute } from '@angular/router';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { TournamentService } from '../service/tournament.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { Tournament } from '../models/tournament.interface';
import {
  Match,
  Round,
  Pagination,
  RoundsResponse,
} from '../models/round.interface';
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

/** Celda de un día en la vista semanal del calendario (DOM → SÁB). */
type CalendarWeekCell = {
  date: Date;
  isoKey: string;
  dayNumber: number;
  matches: Match[];
};

@Component({
  standalone: false,
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
  isLoadingKnockoutStages = false;
  private hasLoadedKnockoutStages = false;
  // Fase de grupos: cache por matchday (page) y paginado independiente por grupo
  private groupStageCache = new Map<number, RoundsResponse>();
  private groupStageLoadingPages = new Set<number>();
  groupStageTotalPages = 0;
  groupStagePageByGroup: Record<string, number> = {};
  isLoading = false;
  selectedTabIndex = 0;
  isMobileViewport = false;

  /** Cabeceras de la grilla (semana empieza en domingo, como en la referencia). */
  readonly calendarDayLabels = [
    'DOM',
    'LUN',
    'MAR',
    'MIÉ',
    'JUE',
    'VIE',
    'SÁB',
  ];
  readonly calendarMonthNamesEs = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ];

  calendarWeekCells: CalendarWeekCell[] = [];
  calendarWeekRangeLabel = '';
  calendarSidebarYear = 0;
  calendarSidebarMonth = '';
  calendarSidebarSubtitle = '';
  calendarWeekMatchCount = 0;
  calendarMatchesWithoutDate: Match[] = [];
  selectedCalendarIsoKey: string | null = null;
  private calendarWeekAnchor = new Date();
  private calendarWeekUserNavigated = false;
  private calendarAnchorInitialized = false;

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
    this.updateMobileViewport();
    this.tournamentId = Number(this.route.snapshot.params['id']);
    this._resetCalendarUiState();
    if (this.tournamentId) {
      this.loadTournamentData();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateMobileViewport();
  }

  private updateMobileViewport(): void {
    this.isMobileViewport = window.innerWidth < 768;
  }

  selectTab(index: number): void {
    if (this.selectedTabIndex === index) return;
    this.selectedTabIndex = index;
    this.onTabSelectedIndexChange(index);
  }

  get tournamentTabs(): string[] {
    const tabs: string[] = [];

    if (this.showKnockoutTabAlongsideTable) {
      tabs.push('Tabla de posiciones', 'Cruces');
    } else {
      tabs.push(this.isKnockout ? 'Cruces' : 'Tabla de posiciones');
    }

    tabs.push('Goleadores', 'Tarjetas');
    return tabs;
  }

  get activeTabLabel(): string {
    return this.tournamentTabs[this.selectedTabIndex] ?? this.tournamentTabs[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onTabSelectedIndexChange(index: number): void {
    // Formato 2: mostramos "Tabla" y "Cruces" como tabs separados
    if (this.isGroupStage && index === 1) this._loadKnockoutStages();

    if (index === this.highlightsTabIndex) this._loadHighlights();
    if (index === this.cardsTabIndex) this._loadCards();
    // if (index === this.calendarTabIndex) this._rebuildCalendarWeekCells();
  }

  onPageChange(page: number): void {
    this.goToPage(page);
  }

  getPositionBadgeClass(index: number, total: number): string {
    const pos = index + 1; // 1-indexed

    // prioridad para evitar solapamientos
    if (this._matchesRange(pos, total, this.positionBadgeConfig.top))
      return 'top';
    if (this._matchesLast(pos, total, this.positionBadgeConfig.bottom))
      return 'bottom';
    if (this._matchesRange(pos, total, this.positionBadgeConfig.promo))
      return 'promo';
    if (this._matchesRange(pos, total, this.positionBadgeConfig.mid))
      return 'mid';
    if (this._matchesRange(pos, total, this.positionBadgeConfig.promoUp))
      return 'promoUp';
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

  get showKnockoutTabAlongsideTable(): boolean {
    return this.tournament?.format?.id === 2;
  }

  get highlightsTabIndex(): number {
    return this.showKnockoutTabAlongsideTable ? 2 : 1;
  }

  /**
   * Tab "Tarjetas" (después de "Goleadores").
   */
  get cardsTabIndex(): number {
    return this.showKnockoutTabAlongsideTable ? 3 : 2;
  }

  /** Tab "Calendario" (después de "Goleadores"). */
  // get calendarTabIndex(): number {
  //   return this.showKnockoutTabAlongsideTable ? 3 : 2;
  // }

  getGroupStageCurrentPage(groupNumber: number | null): number {
    const key = String(groupNumber ?? 'null');
    return (
      this.groupStagePageByGroup[key] ??
      this.pagination?.page ??
      this.INITIAL_PAGE
    );
  }

  getGroupStageMatchdayLabel(groupNumber: number | null): string {
    const page = this.getGroupStageCurrentPage(groupNumber);
    const cached = this.groupStageCache.get(page);
    const value =
      cached?.data?.pagination?.unitValue ??
      cached?.data?.pagination?.page ??
      page;
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
    const value =
      fromMatch ??
      this.pagination?.unitValue ??
      this.pagination?.page ??
      this.currentPage;
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
    this.isLoadingKnockoutStages = false;
    this.hasLoadedKnockoutStages = false;

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
              rounds: of({
                kind: 'single',
                response: {
                  data: { groups: [], pagination: null },
                } as RoundsResponse,
              } as RoundsLoadResult),
              ranking: of({ data: { tables: [] } }),
              tournament: of({ data: null }),
            });
          }

          const isGroupStage = tournament?.format?.id === 2;
          const isKnockout = this._isKnockoutFormat(tournament);

          const ranking$ = isKnockout
            ? of({ data: { tables: [] } })
            : isGroupStage
            ? this.tournamentService.getRankingGroups(this.tournamentId)
            : this.tournamentService.getRankingLeague(this.tournamentId);

          const rounds$ = this.tournamentService
            .getRoundsPagination(this.tournamentId, this.INITIAL_PAGE)
            .pipe(
              switchMap((firstPageRes) => {
                const totalPages =
                  firstPageRes?.data?.pagination?.totalPages ?? 1;
                const safeTotalPages =
                  Number.isFinite(totalPages) && totalPages > 0
                    ? totalPages
                    : 1;

                if (!isKnockout || safeTotalPages <= 1) {
                  return of({
                    kind: 'single',
                    response: firstPageRes,
                  } as RoundsLoadResult);
                }

                const others$ = Array.from(
                  { length: safeTotalPages - 1 },
                  (_, idx) => idx + 2,
                ).map((page) =>
                  this.tournamentService
                    .getRoundsPagination(this.tournamentId, page)
                    .pipe(
                      catchError((error) => {
                        this.handleError(
                          'Error al cargar las fechas del torneo',
                          error,
                        );
                        // si falla una página, no rompemos todo el bracket
                        return of(null as unknown as RoundsResponse);
                      }),
                    ),
                );

                return forkJoin([of(firstPageRes), ...others$]).pipe(
                  map((pages) => pages.filter(Boolean) as RoundsResponse[]),
                  map(
                    (pages) =>
                      ({
                        kind: 'pages',
                        pages,
                        pagination: firstPageRes?.data?.pagination,
                      } as RoundsLoadResult),
                  ),
                );
              }),
              catchError((error) => {
                this.handleError(
                  'Error al cargar las fechas del torneo',
                  error,
                );
                return of({
                  kind: 'single',
                  response: {
                    data: { groups: [], pagination: null },
                  } as RoundsResponse,
                } as RoundsLoadResult);
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
          this.hasLoadedKnockoutStages = false;
          this.groupStageCache.clear();
          this.groupStageLoadingPages.clear();
          this.groupStageTotalPages = 0;
          this.groupStagePageByGroup = {};

          if (results.rounds.kind === 'single') {
            this.rounds = results.rounds.response.data?.groups || [];
            this.pagination = results.rounds.response.data?.pagination;
            if (this._isKnockoutFormat(results.tournament.data)) {
              this.knockoutStages = this._buildKnockoutStages([
                results.rounds.response,
              ]);
              this.hasLoadedKnockoutStages =
                (this.knockoutStages?.length ?? 0) > 0;
            }
            if (results.tournament.data?.format?.id === 2) {
              const page =
                results.rounds.response.data?.pagination?.page ??
                this.INITIAL_PAGE;
              const total =
                results.rounds.response.data?.pagination?.totalPages ?? 0;
              this.groupStageTotalPages = Number.isFinite(total) ? total : 0;
              if (this._isGroupStageRoundsResponse(results.rounds.response)) {
                this.groupStageCache.set(page, results.rounds.response);
              }

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
            this.knockoutStages = this._buildKnockoutStages(
              results.rounds.pages || [],
            );
            this.hasLoadedKnockoutStages =
              (this.knockoutStages?.length ?? 0) > 0;
          }

          this.tournament = results.tournament.data;
          this.currentPage = this.pagination?.page ?? this.INITIAL_PAGE;

          this.rankingTables = results.ranking.data?.tables || [];
          this._getPositionBadgeClass(this.tournamentId);
          this._syncCalendarAfterDataLoad();
        },
        error: (error) => {
          this.handleError('Error al cargar los datos del torneo', error);
        },
      });

    this.subscriptions.add(loadSub);
  }

  private _loadKnockoutStages(): void {
    if (!this.tournamentId) return;
    if (!this.isGroupStage) return;
    if (this.hasLoadedKnockoutStages || this.isLoadingKnockoutStages) return;

    this.isLoadingKnockoutStages = true;

    const sub = this.tournamentService
      .getRoundsKo(this.tournamentId)
      .pipe(
        map((resp) => this._koDataToRoundsPages(resp?.data ?? [])),
        catchError((error) => {
          this.handleError('Error al cargar los cruces', error);
          return of([] as RoundsResponse[]);
        }),
        finalize(() => {
          this.isLoadingKnockoutStages = false;
        }),
      )
      .subscribe({
        next: (knockoutPages) => {
          this.knockoutStages = this._buildKnockoutStages(knockoutPages || []);
          this.hasLoadedKnockoutStages = true;
          this._syncCalendarAfterDataLoad();
        },
      });

    this.subscriptions.add(sub);
  }

  private _koDataToRoundsPages(data: any[]): RoundsResponse[] {
    const safe = (data || []).filter(Boolean);
    if (!safe.length) return [];

    // Nuevo formato (bracket): { tieId, round, teamA, teamB, matches: [...] }
    if (safe[0]?.matches && safe[0]?.teamA && safe[0]?.teamB) {
      return this._koBracketTiesToRoundsPages(safe as any[]);
    }

    // Formato legacy: lista plana de partidos (Match[])
    return this._koMatchesToRoundsPages(safe as Match[]);
  }

  private _koBracketTiesToRoundsPages(ties: any[]): RoundsResponse[] {
    const byRound = new Map<number, any[]>();
    for (const t of ties || []) {
      const key =
        typeof t?.round === 'number' && Number.isFinite(t.round) ? t.round : -1;
      const list = byRound.get(key) ?? [];
      list.push(t);
      byRound.set(key, list);
    }

    const roundKeys = Array.from(byRound.keys()).sort((a, b) => a - b);

    return roundKeys.map((roundKey) => {
      const stageTies = byRound.get(roundKey) ?? [];
      const stageMatches = stageTies
        .map((t) => this._tieToGlobalMatch(t))
        .filter(Boolean) as Match[];

      return {
        data: {
          groups: [
            {
              groupNumber: null,
              rounds: stageMatches,
              tournament: null,
            },
          ],
          pagination: null,
        },
      } as RoundsResponse;
    });
  }

  private _tieToGlobalMatch(tie: any): Match | null {
    const teamA = tie?.teamA;
    const teamB = tie?.teamB;
    if (!teamA?.id || !teamB?.id) return null;

    const normalizeGoals = (
      m: any,
    ): { homeGoals: number | null; awayGoals: number | null } => {
      const state = m?.state;
      const hg = m?.homeGoals;
      const ag = m?.awayGoals;
      if (state === 0 && hg === 0 && ag === 0)
        return { homeGoals: null, awayGoals: null };
      return { homeGoals: hg ?? null, awayGoals: ag ?? null };
    };

    const rawMatches = Array.isArray(tie?.matches) ? tie.matches : [];
    const legs: Match[] = rawMatches.map((m: any) => {
      const homeId = m?.homeTeamId;
      const awayId = m?.awayTeamId;
      const homeRef =
        homeId === teamA.id ? teamA : homeId === teamB.id ? teamB : null;
      const awayRef =
        awayId === teamA.id ? teamA : awayId === teamB.id ? teamB : null;
      const goals = normalizeGoals(m);

      return {
        id: m?.id,
        idRound: m?.idRound,
        tournamentId: m?.tournamentId,
        stage: 'KO',
        matchday: m?.matchday ?? null,
        groupNumber: null,
        round: tie?.round ?? m?.matchday ?? null,
        state: m?.state,
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeTeamName: homeRef?.name ?? 'TBD',
        awayTeamName: awayRef?.name ?? 'TBD',
        homeGoals: goals.homeGoals,
        awayGoals: goals.awayGoals,
        homeLogoUrl: homeRef?.logo ?? null,
        awayLogoUrl: awayRef?.logo ?? null,
      } as any;
    });

    const isTwoLegged = tie?.tieId != null;

    // Si es ida/vuelta y falta la vuelta, agregamos placeholder para que SIEMPRE se vea.
    if (isTwoLegged && legs.length < 2) {
      legs.push({
        id: undefined,
        stage: 'KO',
        matchday: null,
        groupNumber: null,
        round: tie?.round ?? null,
        state: 0,
        homeTeamId: teamB.id,
        awayTeamId: teamA.id,
        homeTeamName: teamB.name,
        awayTeamName: teamA.name,
        homeGoals: null,
        awayGoals: null,
        homeLogoUrl: teamB.logo,
        awayLogoUrl: teamA.logo,
        isPlaceholder: true,
      } as any);
    }

    // El "global" se muestra con orientación TeamA vs TeamB
    const baseHomeId = teamA.id;
    const baseAwayId = teamB.id;

    const allScoresPresent =
      legs.length >= 2 &&
      legs.every(
        (l) =>
          !(l as any)?.isPlaceholder &&
          l?.homeGoals != null &&
          l?.awayGoals != null,
      );
    let aggHome: number | null = null;
    let aggAway: number | null = null;

    if (isTwoLegged && allScoresPresent) {
      const totals = new Map<number, number>();
      for (const l of legs) {
        if ((l as any)?.isPlaceholder) continue;
        totals.set(
          l.homeTeamId!,
          (totals.get(l.homeTeamId!) ?? 0) + (l.homeGoals ?? 0),
        );
        totals.set(
          l.awayTeamId!,
          (totals.get(l.awayTeamId!) ?? 0) + (l.awayGoals ?? 0),
        );
      }
      aggHome = totals.get(baseHomeId) ?? 0;
      aggAway = totals.get(baseAwayId) ?? 0;
    }

    if (!isTwoLegged) {
      // partido único: si viene uno, lo usamos tal cual
      return legs[0] ?? null;
    }

    return {
      id: undefined,
      stage: 'KO',
      matchday: null,
      groupNumber: null,
      round: tie?.round ?? null,
      state: legs.some((l) => l?.state) ? legs[0]?.state : 0,
      homeTeamId: teamA.id,
      awayTeamId: teamB.id,
      homeTeamName: teamA.name,
      awayTeamName: teamB.name,
      homeGoals: aggHome,
      awayGoals: aggAway,
      homeLogoUrl: teamA.logo,
      awayLogoUrl: teamB.logo,
      legs,
      isTwoLegged: true,
    } as any;
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

  private _koMatchesToRoundsPages(matches: Match[]): RoundsResponse[] {
    const safeMatches = (matches || []).filter(Boolean) as Match[];
    if (!safeMatches.length) return [];

    // Agrupamos por `round` (viene en el payload KO). Cada "round" se considera una etapa del bracket.
    const byRound = new Map<number, Match[]>();
    for (const m of safeMatches) {
      const key =
        typeof m?.round === 'number' && Number.isFinite(m.round) ? m.round : -1;
      const list = byRound.get(key) ?? [];
      list.push(m);
      byRound.set(key, list);
    }

    const roundKeys = Array.from(byRound.keys()).sort((a, b) => a - b);

    return roundKeys.map((roundKey) => {
      const stageMatches = byRound.get(roundKey) ?? [];
      return {
        data: {
          groups: [
            {
              groupNumber: null,
              rounds: stageMatches,
              tournament: null,
            },
          ],
          pagination: null,
        },
      } as RoundsResponse;
    });
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
        }),
      )
      .subscribe({
        next: (response) => {
          this.rounds = response.data?.groups || [];
          this.pagination = response.data?.pagination;
          this.currentPage = this.pagination?.page ?? page;
          this._syncCalendarAfterDataLoad();
        },
      });

    this.subscriptions.add(roundsSub);
  }

  private handleError(message: string, error: unknown): void {
    this.toastrService.error(message, TOURNAMENT_CONSTANTS.ERROR_TITLE);
    console.error(message, error);
  }

  private _matchesLast(
    pos: number,
    total: number,
    cfg?: { last?: number },
  ): boolean {
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

  private _resolveTo(
    total: number,
    cfg: { to?: number; toEndOffset?: number },
  ): number {
    if (typeof cfg.to === 'number') return cfg.to;
    if (typeof cfg.toEndOffset === 'number')
      return Math.max(1, total - cfg.toEndOffset);
    return Number.POSITIVE_INFINITY;
  }

  private _getPositionBadgeClass(id) {
    if (id == 8) {
      this.positionBadgeConfig = {
        top: { from: 1, to: 1 },
        promoUp: { from: null, to: null },
        mid: { from: 2, to: 8 },
        promo: { from: 9, to: 11 },
        bottom: { last: 1 },
      } as const;

      return;
    }

    if (id == 9) {
      this.positionBadgeConfig = {
        top: { from: 1, to: 1 },
        promoUp: { from: 2, to: 4 },
        mid: { from: 5, to: 8 },
        promo: { from: 8, to: 9 },
        bottom: { last: 1 },
      } as const;

      return;
    }

    if (id == 10) {
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

  private _isKnockoutRoundsResponse(res?: RoundsResponse | null): boolean {
    if (!res) return false;
    const groups = res?.data?.groups || [];
    const matches = this._flattenMatchesFromRoundsResponse(res);
    if (!matches.length) return false;

    // Preferimos `stage` si viene desde backend:
    // - GROUP => fase de grupos
    // - cualquier otro valor => eliminación directa
    const matchesWithStage = matches.filter(
      (m) => m?.stage != null && String(m.stage).trim() !== '',
    );
    if (matchesWithStage.length) {
      return matchesWithStage.some(
        (m) => String(m.stage).toUpperCase() !== 'GROUP',
      );
    }

    const groupsAllNull = groups.length
      ? groups.every((g) => g?.groupNumber == null)
      : true;
    const matchesAllNull = matches.every((m) => m?.groupNumber == null);
    return groupsAllNull && matchesAllNull;
  }

  private _isGroupStageRoundsResponse(res?: RoundsResponse | null): boolean {
    if (!res) return false;
    const groups = res?.data?.groups || [];
    const matches = this._flattenMatchesFromRoundsResponse(res);

    const matchesWithStage = matches.filter(
      (m) => m?.stage != null && String(m.stage).trim() !== '',
    );
    if (matchesWithStage.length) {
      return matchesWithStage.some(
        (m) => String(m.stage).toUpperCase() === 'GROUP',
      );
    }

    if (groups.some((g) => g?.groupNumber != null)) return true;
    return matches.some((m) => m?.groupNumber != null);
  }

  private _ensureGroupStagePageLoaded(page: number): void {
    if (this.groupStageCache.has(page) || this.groupStageLoadingPages.has(page))
      return;
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
          // En formato mixto, las últimas páginas pueden ser eliminación directa.
          // No las cacheamos como "fase de grupos" para no mostrar cruces en el panel de grupos.
          if (this._isKnockoutRoundsResponse(res)) {
            this.groupStageTotalPages = Math.max(0, page - 1);
            // Si algún grupo quedó apuntando a una página inválida, lo clampamos.
            for (const key of Object.keys(this.groupStagePageByGroup)) {
              const current = this.groupStagePageByGroup[key];
              if (
                typeof current === 'number' &&
                current > this.groupStageTotalPages
              ) {
                this.groupStagePageByGroup[key] =
                  this.groupStageTotalPages || this.INITIAL_PAGE;
              }
            }
            return;
          }

          this.groupStageCache.set(page, res);
          const total =
            res?.data?.pagination?.totalPages ?? this.groupStageTotalPages;
          if (typeof total === 'number' && total > 0)
            this.groupStageTotalPages = total;
          this._syncCalendarAfterDataLoad();
        },
      });

    this.subscriptions.add(sub);
  }

  private _flattenMatchesFromRoundsResponse(res: RoundsResponse): Match[] {
    const groups = res?.data?.groups || [];
    const matches = groups.flatMap((g) => g?.rounds || []);
    return matches.filter(Boolean) as Match[];
  }

  private _getStageTitleByMatchCount(
    matchCount: number,
    fallbackIndex: number,
  ): string {
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
    rawStages.sort(
      (a, b) =>
        b.matchCount - a.matchCount || a.originalIndex - b.originalIndex,
    );

    return rawStages.map((s, displayIndex) => ({
      title: this._getStageTitleByMatchCount(s.matchCount, displayIndex + 1),
      matches: s.matches,
    }));
  }

  calendarPrevWeek(): void {
    this.calendarWeekUserNavigated = true;
    this.calendarAnchorInitialized = true;
    this.calendarWeekAnchor = this._addDaysLocal(this.calendarWeekAnchor, -7);
    this._rebuildCalendarWeekCells();
  }

  calendarNextWeek(): void {
    this.calendarWeekUserNavigated = true;
    this.calendarAnchorInitialized = true;
    this.calendarWeekAnchor = this._addDaysLocal(this.calendarWeekAnchor, 7);
    this._rebuildCalendarWeekCells();
  }

  onCalendarSelectDay(isoKey: string): void {
    this.selectedCalendarIsoKey =
      this.selectedCalendarIsoKey === isoKey ? null : isoKey;
  }

  trackByCalendarCell(_: number, cell: CalendarWeekCell): string {
    return cell.isoKey;
  }

  isCalendarToday(cell: CalendarWeekCell): boolean {
    return cell.isoKey === this._isoDayKey(new Date());
  }

  calendarShortVs(m: Match): string {
    const h = (m.homeTeamName || '').trim();
    const a = (m.awayTeamName || '').trim();
    if (h && a) return `${h} vs ${a}`;
    return h || a || 'Partido';
  }

  calendarStageTag(m: Match): string {
    const st = m?.stage != null ? String(m.stage).trim() : '';
    if (!st) return 'LIGA';
    const u = st.toUpperCase();
    return u === 'GROUP' ? 'LIGA' : u;
  }

  get calendarTournamentLogoSrc(): string {
    const fallback = '../../../assets/images/HYT-IESA.png';
    const t = this.tournament as any;
    if (!this.tournament) return fallback;
    if (typeof t?.logo === 'string' && t.logo) return t.logo;
    if (t?.logo?.secureUrl) return t.logo.secureUrl;
    if (t?.logo?.url) return t.logo.url;
    return fallback;
  }

  private _resetCalendarUiState(): void {
    this.calendarWeekUserNavigated = false;
    this.calendarAnchorInitialized = false;
    this.selectedCalendarIsoKey = null;
    this.calendarWeekAnchor = this._startOfWeekSunday(new Date());
    this.calendarWeekCells = [];
    this.calendarWeekRangeLabel = '';
    this.calendarMatchesWithoutDate = [];
    this.calendarSidebarYear = 0;
    this.calendarSidebarMonth = '';
    this.calendarSidebarSubtitle = '';
    this.calendarWeekMatchCount = 0;
  }

  private _syncCalendarAfterDataLoad(): void {
    if (!this.calendarWeekUserNavigated || !this.calendarAnchorInitialized) {
      this._initCalendarWeekAnchorFromMatches();
      this.calendarAnchorInitialized = true;
    }
    this._rebuildCalendarWeekCells();
  }

  private _initCalendarWeekAnchorFromMatches(): void {
    const dated = this._collectMatchesWithDates();
    if (!dated.length) {
      this.calendarWeekAnchor = this._startOfWeekSunday(new Date());
      return;
    }
    dated.sort((a, b) => a.d.getTime() - b.d.getTime());
    this.calendarWeekAnchor = this._startOfWeekSunday(dated[0].d);
  }

  private _rebuildCalendarWeekCells(): void {
    this.calendarWeekAnchor = this._startOfWeekSunday(this.calendarWeekAnchor);
    const start = this.calendarWeekAnchor;

    const byDay = this._getMatchMapByDayKey();
    this.calendarMatchesWithoutDate = this._collectMatchesWithoutDate();
    const cells: CalendarWeekCell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = this._addDaysLocal(start, i);
      const isoKey = this._isoDayKey(date);
      cells.push({
        date,
        isoKey,
        dayNumber: date.getDate(),
        matches: byDay.get(isoKey) ?? [],
      });
    }
    this.calendarWeekCells = cells;
    this.calendarWeekMatchCount = cells.reduce(
      (n, c) => n + c.matches.length,
      0,
    );

    const end = this._addDaysLocal(start, 6);
    this.calendarWeekRangeLabel = this._formatWeekRangeLabel(start, end);

    const mid = this._addDaysLocal(start, 3);
    this.calendarSidebarYear = mid.getFullYear();
    this.calendarSidebarMonth = this.calendarMonthNamesEs[mid.getMonth()] ?? '';
    this.calendarSidebarSubtitle =
      this.tournament?.format?.description?.trim() || 'Fixture';

    if (!this.selectedCalendarIsoKey) {
      const withMatches = cells.find((c) => c.matches.length > 0);
      if (withMatches) this.selectedCalendarIsoKey = withMatches.isoKey;
    } else if (!cells.some((c) => c.isoKey === this.selectedCalendarIsoKey)) {
      this.selectedCalendarIsoKey = null;
      const withMatches = cells.find((c) => c.matches.length > 0);
      if (withMatches) this.selectedCalendarIsoKey = withMatches.isoKey;
    }
  }

  private _getMatchMapByDayKey(): Map<string, Match[]> {
    const map = new Map<string, Match[]>();
    for (const { m, d } of this._collectMatchesWithDates()) {
      const k = this._isoDayKey(d);
      const list = map.get(k) ?? [];
      list.push(m);
      map.set(k, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        String(a.date ?? '').localeCompare(String(b.date ?? '')),
      );
    }
    return map;
  }

  private _collectMatchesWithoutDate(): Match[] {
    const seen = new Set<string>();
    const out: Match[] = [];
    for (const m of this._collectAllMatchesForCalendarExpanded()) {
      if (this._parseMatchLocalDate(m)) continue;
      const key = this._matchDedupeKey(m);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(m);
    }
    return out;
  }

  private _collectMatchesWithDates(): Array<{ m: Match; d: Date }> {
    const out: Array<{ m: Match; d: Date }> = [];
    const seen = new Set<string>();
    for (const m of this._collectAllMatchesForCalendarExpanded()) {
      const d = this._parseMatchLocalDate(m);
      if (!d) continue;
      const key = this._matchDedupeKey(m);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ m, d });
    }
    return out;
  }

  private _matchDedupeKey(m: Match): string {
    if (m.id != null && Number.isFinite(Number(m.id))) return `id:${m.id}`;
    return [
      m.homeTeamId ?? '',
      m.awayTeamId ?? '',
      m.date ?? '',
      m.matchday ?? '',
      m.round ?? '',
    ].join('|');
  }

  private _collectAllMatchesForCalendarExpanded(): Match[] {
    const seen = new Set<string>();
    const out: Match[] = [];

    const push = (m: Match | null | undefined) => {
      if (!m) return;
      const k = this._matchDedupeKey(m);
      if (seen.has(k)) return;
      seen.add(k);
      out.push(m);
    };

    const expand = (m: Match) => {
      const legs = (m.legs ?? []).filter((l) => !(l as any)?.isPlaceholder);
      if (legs.length) {
        for (const leg of legs) push(leg);
      } else {
        push(m);
      }
    };

    for (const g of this.rounds || []) {
      for (const m of g.rounds || []) expand(m);
    }
    for (const st of this.knockoutStages || []) {
      for (const m of st.matches || []) expand(m);
    }
    for (const res of this.groupStageCache.values()) {
      for (const g of res?.data?.groups || []) {
        for (const m of g.rounds || []) expand(m);
      }
    }
    return out;
  }

  private _parseMatchLocalDate(m: Match): Date | null {
    const raw = m?.date as string | number | null | undefined;
    if (raw == null) return null;
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      const t = new Date(raw);
      if (!Number.isNaN(t.getTime()))
        return new Date(t.getFullYear(), t.getMonth(), t.getDate());
      return null;
    }
    if (typeof raw !== 'string') return null;

    const s = raw.trim();
    if (!s) return null;

    const direct = Date.parse(s);
    if (!Number.isNaN(direct)) {
      const t = new Date(direct);
      return new Date(t.getFullYear(), t.getMonth(), t.getDate());
    }

    const parts = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})/.exec(s);
    if (parts) {
      const dd = Number(parts[1]);
      const mm = Number(parts[2]) - 1;
      let yyyy = Number(parts[3]);
      if (yyyy < 100) yyyy += 2000;
      const d = new Date(yyyy, mm, dd);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return null;
  }

  private _startOfWeekSunday(d: Date): Date {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = x.getDay();
    x.setDate(x.getDate() - dow);
    return x;
  }

  private _addDaysLocal(d: Date, days: number): Date {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + days);
    return x;
  }

  private _isoDayKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private _formatWeekRangeLabel(start: Date, end: Date): string {
    const sm = start.getMonth();
    const em = end.getMonth();
    const sy = start.getFullYear();
    const ey = end.getFullYear();
    const ds = start.getDate();
    const de = end.getDate();
    const mStart = this._monthNameTitleCase(sm);
    const mEnd = this._monthNameTitleCase(em);
    if (sm === em && sy === ey) return `${ds} – ${de} ${mEnd} ${ey}`;
    if (sy === ey) return `${ds} ${mStart} – ${de} ${mEnd} ${ey}`;
    return `${ds} ${mStart} ${sy} – ${de} ${mEnd} ${ey}`;
  }

  private _monthNameTitleCase(monthIndex: number): string {
    const raw = this.calendarMonthNamesEs[monthIndex] ?? '';
    return raw ? raw.charAt(0) + raw.slice(1).toLowerCase() : '';
  }
}
