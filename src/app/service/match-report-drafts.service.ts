import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  MatchReportCardVM,
  ReportDetailVM,
} from 'src/app/models/match-report.vm';
import { TournamentService } from 'src/app/tournament/service/tournament.service';

@Injectable({
  providedIn: 'root',
})
export class MatchReportDraftsService {
  constructor(private readonly tournamentService: TournamentService) {}

  list(params?: {
    status?: string | null;
    tournamentId?: number | null;
  }): Observable<MatchReportCardVM[]> {
    return this.tournamentService.listMatchReportDrafts(params).pipe(
      map((resp) => {
        const raw: any = (resp as any)?.data ?? resp;
        const list = this.extractList(raw);
        return list.map((r: any) => this.normalizeCard(r));
      }),
    );
  }

  detail(
    draftId: number,
    fallback?: MatchReportCardVM,
  ): Observable<ReportDetailVM> {
    return this.tournamentService.getMatchReportDraftDetail(draftId).pipe(
      map((resp) => {
        const raw: any = (resp as any)?.data ?? resp ?? {};
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
  ): Observable<any> {
    return this.tournamentService.reviewMatchReportDraft(draftId, dto);
  }

  normalizeCard(r: any): MatchReportCardVM {
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

    let round: string | null = r?.roundLabel ?? null;
    if (!round && r?.round !== undefined && r?.round !== null)
      round = `Fecha ${r.round}`;
    if (!round && r?.matchday !== undefined && r?.matchday !== null)
      round = `Fecha ${r.matchday}`;

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

  normalizeDetail(raw: any, fallback?: MatchReportCardVM): ReportDetailVM {
    let events: any[] = [];
    if (Array.isArray(raw?.events)) events = raw.events;
    else if (Array.isArray(raw?.data?.events)) events = raw.data.events;

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

  private extractList(raw: any): any[] {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.reports)) return raw.reports;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }
}
