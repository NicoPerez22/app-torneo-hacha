import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { LoginService } from "src/app/service/login.service";
import { TeamService } from "src/app/service/team.service";

type OfferPlayerVM = { displayName: string; valoration?: number };

type TransferOfferVM = {
  id: any;
  status?: string;
  statusEs?: string;
  fromTeamName?: string;
  fromTeamLogoUrl?: string;
  toTeamName?: string;
  toTeamLogoUrl?: string;
  outgoingPlayers: OfferPlayerVM[];
  incomingPlayers: OfferPlayerVM[];
};

@Component({
  selector: "app-transfer-sales",
  templateUrl: "./transfer-sales.component.html",
  styleUrls: ["./transfer-sales.component.css"],
})
export class TransferSalesComponent implements OnInit {
  title: string = "Mis Ofertas";
  subTitle: string = "Aqui puedes vizualizar todas tus ofertas";

  private readonly teamService = inject(TeamService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private toastrService = inject(ToastrService);
  readonly loginService = inject(LoginService);

  readonly MAX_PLAYERS_PER_OFFER = 3;

  transferOffer: Array<TransferOfferVM> = [];

  ngOnInit(): void {
    const { isAdmin } = this.activatedRoute.snapshot.data;

    if (isAdmin) {
      this.title = "Comprobar ofertas";
      this.subTitle = "Comproba todas las ofertas del mercado";

      this._getAllOffers();
      return;
    }

    this._getTransferOffer();
  }

  onActionBird(idBird, action) {
    const status = {
      action: action,
      reviewNote: "",
    };

    this._setStatusBird(idBird, status);
  }

  private _getTransferOffer() {
    this.teamService.getTransferOffer(this.loginService.user.idTeam).subscribe({
      next: (resp) => {
        this.transferOffer = this._normalizeOffers(resp?.data);
      },
    });
  }

  private _getAllOffers() {
    this.teamService.getAllOferrs().subscribe({
      next: (resp) => {
        this.transferOffer = this._normalizeOffers(resp?.data);
      },
    });
  }

  private _setStatusBird(idBird, status) {
    this.teamService
      .setStatusBird(idBird, status, this.loginService.user.id)
      .subscribe({
        next: (resp) => {
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
      outgoingPlayers: outgoingPlayers.slice(0, this.MAX_PLAYERS_PER_OFFER),
      incomingPlayers: incomingPlayers.slice(0, this.MAX_PLAYERS_PER_OFFER),
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
