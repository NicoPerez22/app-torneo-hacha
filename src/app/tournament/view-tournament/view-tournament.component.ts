import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TournamentService } from '../service/tournament.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-view-tournament',
  templateUrl: './view-tournament.component.html',
  styleUrls: ['./view-tournament.component.css'],
})
export class ViewTournamentComponent implements OnInit {
  tournament;
  p: number = 1;
  id: number = 0;

  rounds: Array<any> = [];
  ranking: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this._getTournament();
  }

  private _getTournament() {
    this.tournamentService
      .getRoundsPagination(this.id, 1, 8)
      .pipe(
        switchMap((resp) => {
          this.rounds = resp.rounds;

          return this.tournamentService.getRanking(this.id)
        }),
        switchMap((resp) => {
          this.ranking = resp.data
          return this.tournamentService.getTournamentByID(this.id);
        }),
      )
      .subscribe({
        next: (resp) => {
          this.tournament = resp;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
