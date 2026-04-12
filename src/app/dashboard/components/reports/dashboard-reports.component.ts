import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/service/auth.service';
import {
  MatchReportCardVM,
  ReportDetailVM,
} from 'src/app/models/match-report.vm';
import { MatchReportDraftsService } from 'src/app/service/match-report-drafts.service';

@Component({
  selector: 'app-dashboard-reports',
  templateUrl: './dashboard-reports.component.html',
  styleUrls: ['./dashboard-reports.component.css'],
})
export class DashboardReportsComponent implements OnInit {
  @ViewChild('previewTpl', { static: true }) previewTpl!: TemplateRef<any>;

  loading = false;
  previewLoading = false;
  isAdmin = false;

  reports: MatchReportCardVM[] = [];

  statusFilter: string = 'pending';
  tournamentIdFilter: string = '';
  q: string = '';

  // pagination (ngx-pagination)
  page = 1;
  readonly perPage = 9;
  readonly paginationId = 'dashboard-match-reports';
  totalItems = 0;

  // pagination (events dentro del preview)
  eventsPage = 1;
  readonly eventsPerPage = 6;
  readonly eventsPaginationId = 'dashboard-match-report-events';

  selected?: MatchReportCardVM;
  selectedDetail?: ReportDetailVM;
  previewModal?: NzModalRef;

  constructor(
    private readonly matchReportDrafts: MatchReportDraftsService,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService,
    private readonly modal: NzModalService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isAdmin = user?.idRol === 1;
    this.load();
  }

  onPageChange(next: number) {
    this.page = next;
  }

  onApplyFilters() {
    this.page = 1;
    this.load();
  }

  onEventsPageChange(next: number) {
    this.eventsPage = next;
  }

  get filteredReports(): MatchReportCardVM[] {
    const term = String(this.q || '')
      .trim()
      .toLowerCase();
    if (!term) return this.reports;
    return this.reports.filter((r) => {
      const a = `${r?.homeName ?? ''} ${r?.awayName ?? ''}`.toLowerCase();
      const t = `${r?.tournamentName ?? ''} ${
        r?.roundLabel ?? ''
      }`.toLowerCase();
      return a.includes(term) || t.includes(term);
    });
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

    this.matchReportDrafts.detail(draftId, item).subscribe({
      next: (detail) => {
        this.selectedDetail = detail;
        this.previewLoading = false;
        this.openPreviewModal();
      },
      error: () => {
        this.previewLoading = false;
        this.selectedDetail = this.matchReportDrafts.normalizeDetail({}, item);
        this.openPreviewModal();
        this.toastr.warning(
          'No se pudo cargar el detalle del reporte',
          'Atención',
        );
      },
    });
  }

  onApprove(item: MatchReportCardVM) {
    if (!this.isAdmin) return;
    const user = this.authService.getUser();
    const adminId = Number(user?.id);
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(adminId) || !Number.isFinite(draftId)) return;

    this.matchReportDrafts
      .review(draftId, { adminId, action: 'approve' })
      .subscribe({
        next: () => {
          this.toastr.success('Reporte aprobado correctamente', 'Éxito');
          this.load();
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
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(adminId) || !Number.isFinite(draftId)) return;

    this.matchReportDrafts
      .review(draftId, { adminId, action: 'reject' })
      .subscribe({
        next: () => {
          this.toastr.success('Reporte rechazado correctamente', 'Éxito');
          this.load();
        },
        error: () => {
          this.toastr.error('No se pudo rechazar el reporte', 'Error');
        },
      });
  }
  onNullMatch(item: MatchReportCardVM) {
    if (!this.isAdmin) return;
    const user = this.authService.getUser();
    const adminId = Number(user?.id);
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(adminId) || !Number.isFinite(draftId)) return;

    this.matchReportDrafts
      .review(draftId, { adminId, action: 'null_match' })
      .subscribe({
        next: () => {
          this.toastr.success(
            'Reporte marcado como no jugado correctamente',
            'Éxito',
          );
          this.load();
        },
        error: () => {
          this.toastr.error(
            'No se pudo marcar el reporte como no jugado',
            'Error',
          );
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

  private load() {
    this.loading = true;

    let tournamentId: number | null = null;
    if (this.tournamentIdFilter?.trim()) {
      const tid = Number(this.tournamentIdFilter.trim());
      tournamentId = Number.isFinite(tid) ? tid : null;
    }

    this.matchReportDrafts
      .list({
        status: this.statusFilter || null,
        tournamentId,
      })
      .subscribe({
        next: (list) => {
          this.reports = list;
          this.totalItems = this.reports.length;
          this.loading = false;
        },
        error: () => {
          this.reports = [];
          this.totalItems = 0;
          this.loading = false;
          this.toastr.error('No se pudieron cargar los reportes', 'Error');
        },
      });
  }

  private _buildPreviewTitle(item?: MatchReportCardVM): string {
    if (!item) return 'Reporte';
    const parts = [item?.tournamentName, item?.roundLabel].filter(Boolean);
    return parts.length ? `Reporte · ${parts.join(' · ')}` : 'Reporte';
  }
}
