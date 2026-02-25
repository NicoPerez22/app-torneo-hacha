import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import { TournamentService } from '../service/tournament.service';
import { MatchReportCardVM } from 'src/app/team/my-team/match/match.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

type ReportDetailVM = {
  id?: number | string;
  status?: string;
  createdAt?: string;
  tournamentName?: string;
  roundLabel?: string;
  homeName?: string;
  awayName?: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  events?: Array<any>;
};

@Component({
  selector: 'app-reports-approval',
  templateUrl: './reports-approval.component.html',
  styleUrls: ['./reports-approval.component.css'],
})
export class ReportsApprovalComponent {
  @ViewChild('previewTpl', { static: true }) previewTpl!: TemplateRef<any>;

  loading = false;
  isAdmin = false;

  reports: MatchReportCardVM[] = [];

  statusFilter: string = 'pending';
  tournamentIdFilter: string = '';

  // pagination (ngx-pagination)
  page = 1;
  readonly perPage = 10;
  readonly paginationId = 'match-reports-approval';
  totalItems = 0;

  // pagination (events dentro del preview)
  eventsPage = 1;
  readonly eventsPerPage = 6;
  readonly eventsPaginationId = 'match-report-events';

  selected?: MatchReportCardVM;
  selectedDetail?: ReportDetailVM;
  previewModal?: NzModalRef;
  previewLoading = false;

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService,
    private readonly modal: NzModalService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isAdmin = user?.idRol === 1;
    this.loadDrafts();
  }

  onPageChange(next: number) {
    this.page = next;
  }

  onApplyFilters() {
    this.page = 1;
    this.loadDrafts();
  }

  onEventsPageChange(next: number) {
    this.eventsPage = next;
  }

  onView(item: MatchReportCardVM) {
    this.selected = item;
    this.selectedDetail = undefined;
    this.previewLoading = true;
    this.eventsPage = 1;

    const draftId = Number(item?.reportId);
    if (!Number.isFinite(draftId)) {
      this.previewLoading = false;
      this.openPreviewModal();
      return;
    }

    this.tournamentService.getMatchReportDraftDetail(draftId).subscribe({
      next: (resp) => {
        const raw = resp?.data ?? resp ?? {};
        this.selectedDetail = this._normalizeDetail(raw, item);
        this.eventsPage = 1;
        this.previewLoading = false;
        this.openPreviewModal();
      },
      error: () => {
        this.previewLoading = false;
        this.selectedDetail = this._normalizeDetail({}, item);
        this.eventsPage = 1;
        this.openPreviewModal();
        this.toastr.warning('No se pudo cargar el detalle del reporte', 'Atención');
      },
    });
  }

  onApprove(item: MatchReportCardVM) {
    if (!this.isAdmin) return;
    const user = this.authService.getUser();
    const adminId = Number(user?.id);
    if (!Number.isFinite(adminId)) return;
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(draftId)) return;

    this.tournamentService
      .reviewMatchReportDraft(draftId, { adminId, action: 'approve' })
      .subscribe({
      next: () => {
        this.toastr.success('Reporte aprobado correctamente', 'Éxito');
        this.loadDrafts();
      },
      error: () => {
        this.toastr.error('No se pudo aprobar el reporte', 'Error');
      },
    });
  }

  onReject(item: MatchReportCardVM) {
    if (!this.isAdmin) return;
    const user = this.authService.getUser();
    const adminId = Number(user?.id);
    if (!Number.isFinite(adminId)) return;
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(draftId)) return;

    this.tournamentService
      .reviewMatchReportDraft(draftId, { adminId, action: 'reject' })
      .subscribe({
      next: () => {
        this.toastr.success('Reporte rechazado correctamente', 'Éxito');
        this.loadDrafts();
      },
      error: () => {
        this.toastr.error('No se pudo rechazar el reporte', 'Error');
      },
    });
  }

  closePreview() {
    this.previewModal?.close();
    this.previewModal = undefined;
    this.selected = undefined;
    this.selectedDetail = undefined;
  }

  private openPreviewModal() {
    const title = this._buildPreviewTitle(this.selected);
    this.previewModal = this.modal.create({
      nzTitle: title,
      nzContent: this.previewTpl,
      nzFooter: null,
      nzWidth: '95vw',
      nzStyle: { maxWidth: '900px' },
      nzBodyStyle: { padding: '16px' },
      nzCentered: true,
      nzWrapClassName: 'match-report-modal-wrap',
      nzClassName: 'match-report-modal',
    });
  }

  private loadDrafts() {
    this.loading = true;
    const tournamentId = this.tournamentIdFilter?.trim()
      ? Number(this.tournamentIdFilter.trim())
      : null;

    this.tournamentService
      .listMatchReportDrafts({
        status: this.statusFilter || null,
        tournamentId: Number.isFinite(tournamentId as any) ? (tournamentId as number) : null,
      })
      .subscribe({
        next: (resp) => {
          const raw = resp?.data ?? resp;
          const list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.reports)
              ? raw.reports
              : Array.isArray(raw?.items)
                ? raw.items
                : [];

          this.reports = list.map((r: any) => this._normalizeCard(r));
          this.totalItems = this.reports.length;
          this.loading = false;
        },
        error: () => {
          this.reports = [];
          this.totalItems = 0;
          this.loading = false;
          this.toastr.error('No se pudieron cargar los reportes pendientes', 'Error');
        },
      });
  }

  private _normalizeCard(r: any): MatchReportCardVM {
    const homeLogo =
      r?.homeLogoUrl ??
      r?.homeTeamLogoUrl ??
      r?.homeLogo?.secureUrl ??
      r?.match?.homeLogo?.secureUrl ??
      r?.match?.homeLogoUrl ??
      r?.match?.homeIdLogo?.secureUrl ??
      null;

    const awayLogo =
      r?.awayLogoUrl ??
      r?.awayTeamLogoUrl ??
      r?.awayLogo?.secureUrl ??
      r?.match?.awayLogo?.secureUrl ??
      r?.match?.awayLogoUrl ??
      r?.match?.awayIdLogo?.secureUrl ??
      null;

    const homeName =
      r?.home ??
      r?.homeName ??
      r?.homeTeamName ??
      r?.homeTeam?.name ??
      r?.match?.home ??
      r?.match?.homeTeamName ??
      r?.match?.homeTeam?.name ??
      '';

    const awayName =
      r?.away ??
      r?.awayName ??
      r?.awayTeamName ??
      r?.awayTeam?.name ??
      r?.match?.away ??
      r?.match?.awayTeamName ??
      r?.match?.awayTeam?.name ??
      '';

    const round =
      r?.roundLabel ??
      (r?.round != null ? `Fecha ${r.round}` : null) ??
      (r?.matchday != null ? `Fecha ${r.matchday}` : null);

    const tournamentName =
      r?.tournamentName ??
      r?.tournament?.name ??
      r?.match?.tournament?.name ??
      null;

    const createdAt = r?.createdAt ?? r?.created_at ?? r?.created ?? null;

    return {
      reportId: r?.id ?? r?.draftId ?? r?.draft_id ?? r?.reportId ?? null,
      matchId: r?.matchId ?? r?.match?.id ?? null,
      tournamentName,
      roundLabel: round,
      createdAt,
      homeName: String(homeName || '').trim(),
      awayName: String(awayName || '').trim(),
      homeLogoUrl: homeLogo,
      awayLogoUrl: awayLogo,
      homeGoals: r?.homeGoals ?? r?.match?.homeGoals ?? null,
      awayGoals: r?.awayGoals ?? r?.match?.awayGoals ?? null,
      status: r?.status ?? r?.state ?? 'pending',
    };
  }

  private _normalizeDetail(raw: any, fallback: MatchReportCardVM): ReportDetailVM {
    const events = Array.isArray(raw?.events)
      ? raw.events
      : Array.isArray(raw?.data?.events)
        ? raw.data.events
        : [];

    return {
      id: raw?.id ?? fallback?.reportId ?? fallback?.matchId,
      status: raw?.status ?? fallback?.status ?? 'pending',
      createdAt: raw?.createdAt ?? fallback?.createdAt,
      tournamentName: raw?.tournamentName ?? fallback?.tournamentName,
      roundLabel: raw?.roundLabel ?? fallback?.roundLabel,
      homeName: raw?.homeName ?? raw?.home ?? fallback?.homeName,
      awayName: raw?.awayName ?? raw?.away ?? fallback?.awayName,
      homeLogoUrl: raw?.homeLogoUrl ?? fallback?.homeLogoUrl,
      awayLogoUrl: raw?.awayLogoUrl ?? fallback?.awayLogoUrl,
      homeGoals: raw?.homeGoals ?? fallback?.homeGoals ?? null,
      awayGoals: raw?.awayGoals ?? fallback?.awayGoals ?? null,
      events,
    };
  }

  private _buildPreviewTitle(item?: MatchReportCardVM): string {
    if (!item) return 'Reporte';
    const parts = [item?.tournamentName, item?.roundLabel].filter(Boolean);
    return parts.length ? `Reporte · ${parts.join(' · ')}` : 'Reporte';
  }

  private loadPending() {
    // backward compat (evitar romper llamados existentes si quedan)
    this.loadDrafts();
  }
}

