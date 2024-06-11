import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TournamentService } from './service/tournament.service';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent implements OnInit {

  tournament: Array<any> = [];

  constructor(
    private router: Router,
    private tournamentService: TournamentService
  ) { }

  ngOnInit(): void {
    this.tournamentService.getTournament()
    .subscribe(res => this.tournament = res)
  }

  viewTournament(id){
    this.router.navigate(['/tournament/view/' + id])
  }

  createTournament(){
    this.router.navigate(['tournament/create']);
  }

}
