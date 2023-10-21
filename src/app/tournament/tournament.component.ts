import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  viewTournament(){
    this.router.navigate(['/tournament/view'])
  }

  createTournament(){
    this.router.navigate(['tournament/create']);
  }

}
