import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { TournamentService } from './service/tournament.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { InputComponent } from './filters/input/input.component';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent implements OnInit {
  tournament: Array<any> = [];

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private spinnerService: NgxSpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.spinnerService.show();

    this.tournamentService.getTournament()
    .subscribe({
      next: (res) => {
        this.tournament = res

        setTimeout(() => {
          this.spinnerService.hide();
        }, 1000)
      },
      error: (error) => {
        this.toastrService.error('No se pudo cargar los torneos','Ocurrio un error')
      }
    }
    )
  }

  viewTournament(id){
    this.router.navigate(['/tournament/view/' + id])
  }

  createTournament(){
    this.router.navigate(['tournament/create']);
  }
}
