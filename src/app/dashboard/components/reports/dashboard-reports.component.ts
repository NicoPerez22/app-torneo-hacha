import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import {
  MatchReportCardVM,
  ReportDetailVM,
} from 'src/app/models/match-report.vm';
import { MatchReportDraftsService } from 'src/app/service/match-report-drafts.service';
import { AuthService } from 'src/app/service/auth.service';
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

@Component({
  selector: 'app-dashboard-reports',
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: './dashboard-reports.component.html',
  styleUrls: ['./dashboard-reports.component.css'],
})
export class DashboardReportsComponent implements OnInit {
  private readonly matchReportDrafts = inject(MatchReportDraftsService);
  private readonly toastr = inject(ToastrService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly previewTpl =
    viewChild.required<TemplateRef<unknown>>('previewTpl');

  protected loading = false;
  protected previewLoading = false;
  protected isAdmin = false;

  protected reports: MatchReportCardVM[] = [];

  protected statusFilter = 'pending';
  protected tournamentIdFilter = '';
  protected q = '';

  // pagination (ngx-pagination)
  protected page = 1;
  protected readonly perPage = 9;
  protected readonly paginationId = 'dashboard-match-reports';
  protected totalItems = 0;

  // pagination (events dentro del preview)
  protected eventsPage = 1;
  protected readonly eventsPerPage = 6;
  protected readonly eventsPaginationId = 'dashboard-match-report-events';

  protected selected?: MatchReportCardVM;
  protected selectedDetail?: ReportDetailVM;
  private previewModal?: NzModalRef;

  ngOnInit(): void {
    this.isAdmin = this.authService.getUser()?.idRol === 1;
    const qTid = this.route.snapshot.queryParamMap.get('tournamentId');
    if (qTid && String(qTid).trim()) {
      this.tournamentIdFilter = String(qTid).trim();
    }
    this.load();
  }

  protected onPageChange(next: number): void {
    this.page = next;
  }

  protected onApplyFilters(): void {
    this.page = 1;
    this.load();
  }

  protected onEventsPageChange(next: number): void {
    this.eventsPage = next;
  }

  protected get filteredReports(): MatchReportCardVM[] {
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

  protected onView(item: MatchReportCardVM): void {
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

    this.matchReportDrafts
      .detail(draftId, item)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  protected onApprove(item: MatchReportCardVM): void {
    if (!this.isAdmin) return;
    const user = null;
    const adminId = Number(user?.id);
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(adminId) || !Number.isFinite(draftId)) return;

    this.matchReportDrafts
      .review(draftId, { adminId, action: 'approve' })
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  protected onReject(item: MatchReportCardVM): void {
    if (!this.isAdmin) return;
    const user = null;
    const adminId = Number(user?.id);
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(adminId) || !Number.isFinite(draftId)) return;

    this.matchReportDrafts
      .review(draftId, { adminId, action: 'reject' })
      .pipe(takeUntilDestroyed(this.destroyRef))
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
  protected onNullMatch(item: MatchReportCardVM): void {
    if (!this.isAdmin) return;
    const user = null;
    const adminId = Number(user?.id);
    const draftId = Number(item?.reportId);
    if (!Number.isFinite(adminId) || !Number.isFinite(draftId)) return;

    this.matchReportDrafts
      .review(draftId, { adminId, action: 'null_match' })
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  protected onClosePreview(): void {
    this.previewModal?.close();
    this.previewModal = undefined;
    this.selected = undefined;
    this.selectedDetail = undefined;
  }

  private openPreviewModal(): void {
    const title = this.buildPreviewTitle(this.selected);
    this.previewModal = this.modal.create({
      nzTitle: title,
      nzContent: this.previewTpl(),
      nzFooter: null,
      nzWidth: '95vw',
      nzStyle: { maxWidth: '900px' },
      nzBodyStyle: { padding: '16px' },
      nzCentered: true,
      nzWrapClassName: 'match-report-modal-wrap',
      nzClassName: 'match-report-modal',
    });
  }

  private load(): void {
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
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  private buildPreviewTitle(item?: MatchReportCardVM): string {
    if (!item) return 'Reporte';
    const parts = [item?.tournamentName, item?.roundLabel].filter(Boolean);
    return parts.length ? `Reporte · ${parts.join(' · ')}` : 'Reporte';
  }
}
