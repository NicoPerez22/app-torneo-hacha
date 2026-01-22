import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { LoginService } from "src/app/service/login.service";
import { TeamService } from "src/app/service/team.service";

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

  transferOffer: Array<any> = [];

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
        this.transferOffer = resp.data;
      },
    });
  }

  private _getAllOffers() {
    this.teamService.getAllOferrs().subscribe({
      next: (resp) => {
        this.transferOffer = resp.data;
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
}
