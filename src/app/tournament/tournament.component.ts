import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TournamentService } from './service/tournament.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CreateTournammentComponent } from './create-tournamment/create-tournamment.component';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css'],
})
export class TournamentComponent implements OnInit {
  tournament: Array<any> = [];

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private spinnerService: NgxSpinnerService,
    private toastrService: ToastrService,
    private modalService: NzModalService,
  ) {}

  ngOnInit(): void {
    this._getTournaments();
  }

  viewTournament(id) {
    this.router.navigate(['/tournament/view/' + id]);
  }

  createTournament() {
    this.router.navigate(['tournament/create']);
  }

  onCreate(): void {
    this.modalService.create({
      nzTitle: 'Crear torneo',
      nzContent: CreateTournammentComponent,
      nzWidth: 1200,
      nzFooter: null,
    });
  }

  private _getTournaments() {
    this.spinnerService.show();

    this.tournamentService.getTournament().subscribe({
      next: (res) => {
        this.tournament = res.data;

        setTimeout(() => {
          this.spinnerService.hide();
        }, 1000);
      },
      error: () => {
        this.spinnerService.hide();
        this.toastrService.error(
          'No se pudo cargar los torneos',
          'Ocurrio un error',
        );
      },
    });
  }
}
