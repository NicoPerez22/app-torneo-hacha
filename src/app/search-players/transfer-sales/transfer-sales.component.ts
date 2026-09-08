import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { LoginService } from "src/app/service/login.service";
import { TeamService } from "src/app/service/team.service";
import { SHARED_UI_IMPORTS } from 'src/app/shared/ui';

type OfferPlayerVM = { displayName: string; valoration?: number };

type TransferOfferVM = {
  id: number | string | undefined;
  status?: string;
  statusEs?: string;
  fromTeamName?: string;
  fromTeamLogoUrl?: string;
  toTeamName?: string;
  toTeamLogoUrl?: string;
  outgoingPlayers: OfferPlayerVM[];
  incomingPlayers: OfferPlayerVM[];
};

type OfferAction = "approve" | "reject" | "cancel";

interface OfferStatusUpdate {
  action: OfferAction;
  reviewNote: string;
}

@Component({
  selector: "app-transfer-sales",
  imports: [...SHARED_UI_IMPORTS],
  templateUrl: "./transfer-sales.component.html",
  styleUrls: ["./transfer-sales.component.css"],
})
export class TransferSalesComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly maxPlayersPerOffer = 3;

  protected readonly loginService = inject(LoginService);
  protected readonly offersPerPage = 8;
  protected readonly offersPaginationId = "transfer-sales-offers";
  protected title = "Mis Ofertas";
  protected subTitle = "Aqui puedes vizualizar todas tus ofertas";
  protected isAdmin = false;
  protected transferOffer: TransferOfferVM[] = [];
  protected offersPage = 1;

  ngOnInit(): void {
    const { isAdmin } = this.activatedRoute.snapshot.data;

    if (isAdmin) {
      this.title = "Comprobar ofertas";
      this.subTitle = "Comproba todas las ofertas del mercado";
      this.isAdmin = true;

      this._getAllOffers();
      return;
    }

    this._getTransferOffer();
  }

  protected onActionBird(
    idBird: number | string | undefined,
    action: OfferAction,
  ): void {
    const status = {
      action,
      reviewNote: "",
    };

    this._setStatusBird(idBird, status);
  }

  protected onOffersPageChange(page: number): void {
    this.offersPage = page;
  }

  private _getTransferOffer(): void {
    this.teamService.getTransferOffer(this.loginService.user?.idTeam).subscribe({
      next: (resp) => {
        this.transferOffer = this._normalizeOffers(resp?.data);
        this.offersPage = 1;
      },
    });
  }

  private _getAllOffers(): void {
    this.teamService.getAllOferrs().subscribe({
      next: (resp) => {
        this.transferOffer = this._normalizeOffers(resp?.data);
        this.offersPage = 1;
      },
    });
  }

  private _setStatusBird(
    idBird: number | string | undefined,
    status: OfferStatusUpdate,
  ): void {
    this.teamService
      .setStatusBird(idBird, status, this.loginService.user?.id)
      .subscribe({
        next: () => {
          this._getAllOffers();
          this.toastrService.success("Oferta procesada correctamente", "Exito");
        },

        error: () => {
          this.toastrService.success(
            "Ocurrio un error al procesar la oferta",
            "Error",
          );
        },
      });
  }

  private _normalizeOffers(data: any): TransferOfferVM[] {
    const offers = Array.isArray(data) ? data : [];
    return offers.map((offer) => this._normalizeOffer(offer));
  }

  private _normalizeOffer(offer: any): TransferOfferVM {
    const outgoingRaw = this._extractPlayersArray(offer, [
      "offeredPlayers",
      "offeredPlayersInfo",
      "offeredPlayersData",
      "offeredPlayersList",
      "offeredPlayersDto",
      "offeredPlayersDtos",
    ]);

    const incomingRaw = this._extractPlayersArray(offer, [
      "targetPlayers",
      "targetPlayersInfo",
      "targetPlayersData",
      "targetPlayersList",
      "targetPlayersDto",
      "targetPlayersDtos",
    ]);

    const outgoingFallback = this._buildName(
      offer?.offeredPlayerName,
      offer?.offeredPlayerLastname,
    );
    const incomingFallback = this._buildName(
      offer?.targetPlayerName,
      offer?.targetPlayerLastname,
    );

    const outgoingPlayers = (outgoingRaw.length
      ? outgoingRaw
      : outgoingFallback
        ? [{ displayName: outgoingFallback }]
        : []
    )
      .map((p) => ({
        displayName: this._computePlayerName(p),
        valoration: this._computePlayerValoration(p),
      }))
      .filter((p) => Boolean(p.displayName));

    const incomingPlayers = (incomingRaw.length
      ? incomingRaw
      : incomingFallback
        ? [{ displayName: incomingFallback }]
        : []
    )
      .map((p) => ({
        displayName: this._computePlayerName(p),
        valoration: this._computePlayerValoration(p),
      }))
      .filter((p) => Boolean(p.displayName));

    return {
      id: offer?.id,
      status: offer?.status,
      statusEs: offer?.statusEs,
      fromTeamName: offer?.fromTeamName,
      fromTeamLogoUrl: offer?.fromTeamLogoUrl,
      toTeamName: offer?.toTeamName,
      toTeamLogoUrl: offer?.toTeamLogoUrl,
      outgoingPlayers: outgoingPlayers.slice(0, this.maxPlayersPerOffer),
      incomingPlayers: incomingPlayers.slice(0, this.maxPlayersPerOffer),
    };
  }

  private _extractPlayersArray(offer: any, keys: string[]): any[] {
    for (const key of keys) {
      const value = offer?.[key];
      if (Array.isArray(value)) return value;
    }
    return [];
  }

  private _computePlayerName(player: any): string {
    if (!player) return "";

    // Si ya viene normalizado
    if (typeof player?.displayName === "string" && player.displayName.trim()) {
      return player.displayName.trim();
    }

    const nested = player?.player;

    const displayName =
      // si viene completo
      player?.fullName ||
      nested?.fullName ||
      nested?.displayName ||
      // nombres separados (prioridad alta si hay apellido)
      this._buildName(player?.firstName, player?.lastName) ||
      this._buildName(player?.firstName, player?.lastname) ||
      this._buildName(player?.firstName, player?.last_name) ||
      this._buildName(player?.first_name, player?.last_name) ||
      this._buildName(player?.name, player?.lastName) ||
      this._buildName(player?.name, player?.lastname) ||
      this._buildName(nested?.firstName, nested?.lastName) ||
      this._buildName(nested?.firstName, nested?.lastname) ||
      this._buildName(nested?.name, nested?.lastName) ||
      this._buildName(nested?.name, nested?.lastname) ||
      // si viene en 1 solo campo (dejar al final para evitar casos "J" con apellido)
      player?.playerName ||
      nested?.playerName ||
      player?.name ||
      nested?.name ||
      "";

    return String(displayName).trim();
  }

  private _computePlayerValoration(player: any): number | undefined {
    if (!player) return undefined;

    const nested = player?.player;
    const raw =
      player?.valoration ??
      player?.valoracion ??
      player?.valuation ??
      player?.rating ??
      nested?.valoration ??
      nested?.valoracion ??
      nested?.valuation ??
      nested?.rating;

    if (raw == null || raw === "") return undefined;

    const value = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(value) ? value : undefined;
  }

  private _buildName(name?: any, lastname?: any): string {
    const parts = [name, lastname]
      .map((v) => (v == null ? "" : String(v).trim()))
      .filter(Boolean);
    return parts.join(" ");
  }
}
