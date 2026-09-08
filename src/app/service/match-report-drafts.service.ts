import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  MatchReportCardVM,
  MatchReportEvent,
  ReportDetailVM,
} from 'src/app/models/match-report.vm';
import { TournamentService } from 'src/app/tournament/service/tournament.service';

interface MatchReportDraftRaw {
  id?: number;
  draftId?: number;
  draft_id?: number;
  reportId?: number;
  matchId?: number;
  match?: Record<string, unknown>;
  status?: string;
  state?: string;
  createdAt?: string;
  created_at?: string;
  created?: string;
  tournamentName?: string;
  tournament?: { name?: string };
  roundLabel?: string;
  round?: number;
  matchday?: number;
  home?: string;
  homeName?: string;
  homeTeamName?: string;
  homeTeam?: { name?: string };
  away?: string;
  awayName?: string;
  awayTeamName?: string;
  awayTeam?: { name?: string };
  homeLogoUrl?: string;
  homeTeamLogoUrl?: string;
  homeLogo?: { secureUrl?: string };
  awayLogoUrl?: string;
  awayTeamLogoUrl?: string;
  awayLogo?: { secureUrl?: string };
  homeGoals?: number;
  awayGoals?: number;
  events?: unknown[];
  data?: { events?: unknown[] };
  reports?: unknown[];
  items?: unknown[];
}

@Injectable({
  providedIn: 'root',
})
export class MatchReportDraftsService {
  private readonly _tournamentService = inject(TournamentService);

  list(params?: {
    status?: string | null;
    tournamentId?: number | null;
  }): Observable<MatchReportCardVM[]> {
    return this._tournamentService.listMatchReportDrafts(params).pipe(
      map((resp) => {
        const raw = (resp as { data?: unknown })?.data ?? resp;
        return this._extractList(raw).map((item) => this.normalizeCard(item));
      }),
    );
  }

  detail(
    draftId: number,
    fallback?: MatchReportCardVM,
  ): Observable<ReportDetailVM> {
    return this._tournamentService.getMatchReportDraftDetail(draftId).pipe(
      map((resp) => {
        const raw = ((resp as { data?: MatchReportDraftRaw })?.data ??
          resp ??
          {}) as MatchReportDraftRaw;
        return this.normalizeDetail(raw, fallback);
      }),
    );
  }

  review(
    draftId: number,
    dto: {
      adminId: number;
      action: 'approve' | 'reject' | 'null_match';
      reviewNote?: string;
    },
  ): Observable<unknown> {
    return this._tournamentService.reviewMatchReportDraft(draftId, dto);
  }

  normalizeCard(r: MatchReportDraftRaw): MatchReportCardVM {
    const match = (r.match ?? {}) as MatchReportDraftRaw;
    const homeLogo =
      r.homeLogoUrl ??
      r.homeTeamLogoUrl ??
      r.homeLogo?.secureUrl ??
      match.homeLogo?.secureUrl ??
      match.homeLogoUrl ??
      null;

    const awayLogo =
      r.awayLogoUrl ??
      r.awayTeamLogoUrl ??
      r.awayLogo?.secureUrl ??
      match.awayLogo?.secureUrl ??
      match.awayLogoUrl ??
      null;

    const homeName =
      r.home ??
      r.homeName ??
      r.homeTeamName ??
      r.homeTeam?.name ??
      match.home ??
      match.homeTeamName ??
      match.homeTeam?.name ??
      '';

    const awayName =
      r.away ??
      r.awayName ??
      r.awayTeamName ??
      r.awayTeam?.name ??
      match.away ??
      match.awayTeamName ??
      match.awayTeam?.name ??
      '';

    let round: string | null = r.roundLabel ?? null;
    if (!round && r.round !== undefined && r.round !== null) {
      round = `Fecha ${r.round}`;
    }
    if (!round && r.matchday !== undefined && r.matchday !== null) {
      round = `Fecha ${r.matchday}`;
    }

    const tournamentName =
      r.tournamentName ?? r.tournament?.name ?? match.tournament?.name ?? null;

    const createdAt = r.createdAt ?? r.created_at ?? r.created ?? null;

    return {
      reportId: r.id ?? r.draftId ?? r.draft_id ?? r.reportId ?? null,
      matchId: r.matchId ?? (match.id as number | undefined) ?? null,
      tournamentName,
      roundLabel: round,
      createdAt,
      homeName: String(homeName || '').trim(),
      awayName: String(awayName || '').trim(),
      homeLogoUrl: homeLogo,
      awayLogoUrl: awayLogo,
      homeGoals: r.homeGoals ?? match.homeGoals ?? null,
      awayGoals: r.awayGoals ?? match.awayGoals ?? null,
      status: r.status ?? r.state ?? 'pending',
    };
  }

  normalizeDetail(
    raw: MatchReportDraftRaw,
    fallback?: MatchReportCardVM,
  ): ReportDetailVM {
    let events: unknown[] = [];
    if (Array.isArray(raw.events)) {
      events = raw.events;
    } else if (Array.isArray(raw.data?.events)) {
      events = raw.data.events;
    }

    return {
      id: raw.id ?? fallback?.reportId ?? fallback?.matchId,
      status: raw.status ?? fallback?.status ?? 'pending',
      createdAt: raw.createdAt ?? fallback?.createdAt,
      tournamentName: raw.tournamentName ?? fallback?.tournamentName,
      roundLabel: raw.roundLabel ?? fallback?.roundLabel,
      homeName: raw.homeName ?? raw.home ?? fallback?.homeName,
      awayName: raw.awayName ?? raw.away ?? fallback?.awayName,
      homeLogoUrl: raw.homeLogoUrl ?? fallback?.homeLogoUrl,
      awayLogoUrl: raw.awayLogoUrl ?? fallback?.awayLogoUrl,
      homeGoals: raw.homeGoals ?? fallback?.homeGoals ?? null,
      awayGoals: raw.awayGoals ?? fallback?.awayGoals ?? null,
      events: events as MatchReportEvent[],
    };
  }

  private _extractList(raw: unknown): MatchReportDraftRaw[] {
    if (Array.isArray(raw)) {
      return raw as MatchReportDraftRaw[];
    }
    if (raw && typeof raw === 'object') {
      const record = raw as MatchReportDraftRaw;
      if (Array.isArray(record.reports)) {
        return record.reports as MatchReportDraftRaw[];
      }
      if (Array.isArray(record.items)) {
        return record.items as MatchReportDraftRaw[];
      }
    }
    return [];
  }
}
