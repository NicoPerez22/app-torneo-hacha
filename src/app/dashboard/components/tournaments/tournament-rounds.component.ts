import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatchReportCardVM } from 'src/app/models/match-report.vm';
import { AuthService } from 'src/app/service/auth.service';
import { MatchReportDraftsService } from 'src/app/service/match-report-drafts.service';
import { ResultsComponent } from 'src/app/team/my-team/results/results.component';
import { TOURNAMENT_CONSTANTS } from 'src/app/tournament/constants/tournament.constants';
import {
  Match,
  Round,
  RoundsResponse,
} from 'src/app/tournament/models/round.interface';
import { Tournament } from 'src/app/tournament/models/tournament.interface';
import { TournamentService } from 'src/app/tournament/service/tournament.service';

export interface TournamentRoundGroup {
  groupNumber: number | null;
  groupLabel: string;
  matches: Match[];
}

export interface TournamentRoundSection {
  page: number;
  label: string;
  matchCount: number;
  groups: TournamentRoundGroup[];
}

@Component({
  selector: 'app-tournament-rounds',
  templateUrl: './tournament-rounds.component.html',
  styleUrls: ['./tournament-rounds.component.css'],
})
export class TournamentRoundsComponent implements OnInit, OnDestroy {
  tournamentId = 0;
  tournament?: Tournament;
  roundSections: TournamentRoundSection[] = [];
  isLoading = false;
  isAdmin = false;
  private readonly pendingDraftByMatchId = new Map<number, number>();
  private readonly subs = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tournamentService: TournamentService,
    private readonly toastr: ToastrService,
    private readonly modalService: NzModalService,
    private readonly authService: AuthService,
    private readonly matchReportDrafts: MatchReportDraftsService,
  ) {}

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('tournamentId');
    const id = Number(raw);
    if (!raw || !Number.isFinite(id) || id < 1) {
      this.toastr.error(
        'Torneo no válido',
        TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
      );
      this.router.navigate(['/dashboard/tournaments']);
      return;
    }
    this.tournamentId = id;
    const user = this.authService.getUser();
    this.isAdmin = user?.idRol === 1;
    this.load();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get showGroupLabels(): boolean {
    return this.tournament?.format?.id === 2;
  }

  trackByPage(_: number, item: TournamentRoundSection): number {
    return item.page;
  }

  trackByGroup(_: number, item: TournamentRoundGroup): string {
    return String(item.groupNumber ?? 'default');
  }

  trackByMatchId(_: number, item: Match): number | string {
    return (
      item?.id ?? item?.idRound ?? `${item?.homeTeamName}-${item?.awayTeamName}`
    );
  }

  onBack(): void {
    this.router.navigate(['/dashboard/tournaments']);
  }

  onViewTournament(): void {
    this.router.navigate(['/tournament/view', this.tournamentId]);
  }

  onViewReports(round: TournamentRoundSection): void {
    this.router.navigate(['/dashboard/reports'], {
      queryParams: {
        tournamentId: String(this.tournamentId),
        fecha: String(round.page),
      },
    });
  }

  onReportMatch(match: Match): void {
    const modal = this.modalService.create({
      nzContent: ResultsComponent,
      nzComponentParams: { match },
      nzFooter: null,
      nzWidth: '95vw',
      nzStyle: { maxWidth: '1100px' },
      nzBodyStyle: { padding: '16px' },
      nzCentered: true,
      nzWrapClassName: 'match-report-modal-wrap',
      nzClassName: 'match-report-modal',
    });

    modal.afterClose.subscribe((result) => {
      if (result === true) {
        this.load();
      }
    });
  }

  onEdit(round: TournamentRoundSection): void {
    this.toastr.info(
      `Edición de "${round.label}" para este torneo no está disponible aún.`,
      'Próximamente',
    );
  }

  onNullMatch(round: TournamentRoundSection): void {
    this.router.navigate(['/dashboard/reports'], {
      queryParams: {
        tournamentId: String(this.tournamentId),
        fecha: String(round.page),
      },
    });
  }

  onNullMatchMatch(match: Match, section: TournamentRoundSection): void {
    if (!this.isAdmin) {
      this.toastr.warning(
        'Solo un administrador puede marcar un partido como no jugado',
        'Atención',
      );
      return;
    }

    this.modalService.confirm({
      nzTitle: 'Marcar como partido nulo',
      nzContent: `¿Confirmás marcar como no jugado el partido ${match.homeTeamName} vs ${match.awayTeamName}?`,
      nzOkText: 'Confirmar',
      nzCancelText: 'Cancelar',
      nzOnOk: () =>
        this.nullMatch({
          idRound: match.idRound,
          tournamentId: match.tournamentId,
        }),
    });
  }

  isMatchPending(match: Match): boolean {
    return Number(match?.state) === 0;
  }

  canNullMatchMatch(match: Match): boolean {
    return this.isAdmin && this.isMatchPending(match);
  }

  private load(): void {
    this.isLoading = true;

    const loadSub = this.tournamentService
      .getTournamentByID(this.tournamentId)
      .pipe(
        catchError(() => of({ data: null as Tournament | null })),
        switchMap((tournamentRes) => {
          this.tournament = tournamentRes.data ?? undefined;
          return forkJoin({
            pages: this.loadAllRoundsPages$(),
            pendingReports: this.matchReportDrafts
              .list({
                status: 'pending',
                tournamentId: this.tournamentId,
              })
              .pipe(catchError(() => of([] as MatchReportCardVM[]))),
          });
        }),
      )
      .subscribe({
        next: ({ pages, pendingReports }) => {
          this.indexPendingDrafts(pendingReports);
          this.roundSections = this.buildRoundSections(pages);
          this.isLoading = false;
        },
        error: () => {
          this.roundSections = [];
          this.isLoading = false;
        },
      });

    this.subs.add(loadSub);
  }

  private loadAllRoundsPages$() {
    return this.tournamentService
      .getRoundsPagination(this.tournamentId, 1)
      .pipe(
        catchError(() => {
          this.toastr.error(
            'No se pudieron cargar las rondas del torneo',
            TOURNAMENT_CONSTANTS.ERROR_OCCURRED,
          );
          return of({
            data: { groups: [], pagination: null },
          } as RoundsResponse);
        }),
        switchMap((firstPage) => {
          const totalPages = firstPage?.data?.pagination?.totalPages ?? 1;
          const safeTotal =
            typeof totalPages === 'number' &&
            Number.isFinite(totalPages) &&
            totalPages > 0
              ? totalPages
              : 1;

          if (safeTotal <= 1) {
            return of([firstPage]);
          }

          const others$ = Array.from(
            { length: safeTotal - 1 },
            (_, idx) => idx + 2,
          ).map((page) =>
            this.tournamentService
              .getRoundsPagination(this.tournamentId, page)
              .pipe(catchError(() => of(null as unknown as RoundsResponse))),
          );

          return forkJoin([of(firstPage), ...others$]).pipe(
            map((pages) => pages.filter(Boolean) as RoundsResponse[]),
          );
        }),
      );
  }

  private buildRoundSections(
    pages: RoundsResponse[],
  ): TournamentRoundSection[] {
    return [...pages]
      .sort(
        (a, b) =>
          (a?.data?.pagination?.page ?? 0) - (b?.data?.pagination?.page ?? 0),
      )
      .map((response, index) => {
        const pagination = response?.data?.pagination;
        const page = pagination?.page ?? index + 1;
        const unitValue = pagination?.unitValue;
        const label =
          unitValue != null && String(unitValue).trim() !== ''
            ? `Fecha ${unitValue}`
            : `Fecha ${page}`;

        const groups = (response?.data?.groups || []).map((group) =>
          this.mapRoundGroup(group),
        );

        const matchCount = groups.reduce(
          (sum, group) => sum + group.matches.length,
          0,
        );

        return { page, label, matchCount, groups };
      })
      .filter((section) => section.groups.length > 0);
  }

  private getPendingDraftId(match: Match): number | null {
    const candidates = [match?.id, match?.idRound]
      .filter((value) => value != null)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    for (const matchId of candidates) {
      const draftId = this.pendingDraftByMatchId.get(matchId);
      if (draftId != null) return draftId;
    }

    return null;
  }

  private indexPendingDrafts(reports: MatchReportCardVM[]): void {
    this.pendingDraftByMatchId.clear();

    for (const report of reports || []) {
      if ((report?.status ?? 'pending') !== 'pending') continue;

      const draftId = Number(report.reportId);
      const matchId = Number(report.matchId);
      if (!Number.isFinite(draftId) || !Number.isFinite(matchId)) continue;

      this.pendingDraftByMatchId.set(matchId, draftId);
    }
  }

  private executeNullMatch(draftId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const adminId = Number(this.authService.getUser()?.id);
      if (!Number.isFinite(adminId)) {
        this.toastr.error('Usuario no válido', 'Error');
        reject();
        return;
      }

      this.matchReportDrafts
        .review(draftId, { adminId, action: 'null_match' })
        .subscribe({
          next: () => {
            this.toastr.success(
              'Partido marcado como no jugado correctamente',
              'Éxito',
            );
            this.load();
            resolve();
          },
          error: () => {
            this.toastr.error(
              'No se pudo marcar el partido como no jugado',
              'Error',
            );
            reject();
          },
        });
    });
  }

  private mapRoundGroup(group: Round): TournamentRoundGroup {
    const groupNumber = group?.groupNumber ?? null;
    const groupLabel =
      groupNumber != null ? `Grupo ${groupNumber}` : 'Partidos';

    return {
      groupNumber,
      groupLabel,
      matches: group?.rounds || [],
    };
  }

  private nullMatch(dto: {
    idRound: number;
    tournamentId: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.tournamentService.nullMatch(dto).subscribe({
        next: () => {
          this.toastr.success(
            'Partido marcado como no jugado correctamente',
            'Éxito',
          );
          this.load();
          resolve();
        },

        error: () => {
          this.toastr.error(
            'No se pudo marcar el partido como no jugado',
            'Error',
          );
          reject();
        },
      });
    });
  }
}
