import { ViewTournamentComponent } from './view-tournament/view-tournament.component';
import { TournamentComponent } from './tournament.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: TournamentComponent
  },

  {
    path: 'view',
    component: ViewTournamentComponent
  },
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class TournamentRoutingModule { }
